import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { dataStorage } from '../../utils/storage';
import { Grade, Student } from '../../types';
import { theme } from '../../constants/theme';
import { validateRequired, validateNumeric, validateDecimal } from '../../utils/validation';
import { calculateGrade } from '../../utils/gradeCalculation';

const GradeFormScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [formData, setFormData] = useState({
    studentId: '',
    subject: '',
    examType: 'quiz' as 'midterm' | 'final' | 'quiz' | 'assignment',
    marks: '',
    totalMarks: '',
    semester: '',
    academicYear: new Date().getFullYear().toString(),
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const studentsData = await dataStorage.getStudents();
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading students:', error);
      Alert.alert('Error', 'Failed to load students');
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!validateRequired(formData.studentId)) {
      newErrors.studentId = 'Student is required';
    }

    if (!validateRequired(formData.subject)) {
      newErrors.subject = 'Subject is required';
    }

    if (!validateRequired(formData.marks)) {
      newErrors.marks = 'Marks are required';
    } else if (!validateDecimal(formData.marks)) {
      newErrors.marks = 'Marks must be a valid number';
    } else if (parseFloat(formData.marks) < 0) {
      newErrors.marks = 'Marks cannot be negative';
    }

    if (!validateRequired(formData.totalMarks)) {
      newErrors.totalMarks = 'Total marks are required';
    } else if (!validateDecimal(formData.totalMarks)) {
      newErrors.totalMarks = 'Total marks must be a valid number';
    } else if (parseFloat(formData.totalMarks) <= 0) {
      newErrors.totalMarks = 'Total marks must be greater than 0';
    }

    if (formData.marks && formData.totalMarks) {
      const marks = parseFloat(formData.marks);
      const totalMarks = parseFloat(formData.totalMarks);
      if (marks > totalMarks) {
        newErrors.marks = 'Marks cannot exceed total marks';
      }
    }

    if (!validateRequired(formData.semester)) {
      newErrors.semester = 'Semester is required';
    }

    if (!validateRequired(formData.academicYear)) {
      newErrors.academicYear = 'Academic year is required';
    } else if (!validateNumeric(formData.academicYear)) {
      newErrors.academicYear = 'Academic year must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      const marks = parseFloat(formData.marks);
      const totalMarks = parseFloat(formData.totalMarks);
      const grade = calculateGrade(marks, totalMarks);
      
      const newGrade: Grade = {
        id: Date.now().toString(),
        ...formData,
        marks,
        totalMarks,
        grade,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const existingGrades = await dataStorage.getGrades();
      const updatedGrades = [...existingGrades, newGrade];
      
      await dataStorage.saveGrades(updatedGrades);
      
      Alert.alert('Success', 'Grade added successfully!', [
        { text: 'OK', onPress: () => {/* Navigation handled by navigator */} }
      ]);
    } catch (error) {
      console.error('Error saving grade:', error);
      Alert.alert('Error', 'Failed to save grade');
    } finally {
      setIsLoading(false);
    }
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Select Student';
  };

  if (isLoading) {
    return <LoadingSpinner text="Saving grade..." overlay />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.formCard}>
          <Text style={styles.formTitle}>Add Grade</Text>
          
          <View style={styles.studentSelector}>
            <Text style={styles.label}>Student *</Text>
            <View style={styles.studentList}>
              {students.map((student) => (
                <Button
                  key={student.id}
                  title={`${student.firstName} ${student.lastName} (${student.studentId})`}
                  onPress={() => updateFormData('studentId', student.id)}
                  variant={formData.studentId === student.id ? 'primary' : 'outline'}
                  size="small"
                  style={styles.studentButton}
                />
              ))}
            </View>
            {errors.studentId && (
              <Text style={styles.errorText}>{errors.studentId}</Text>
            )}
          </View>

          <Input
            label="Subject"
            value={formData.subject}
            onChangeText={(value) => updateFormData('subject', value)}
            placeholder="e.g., Mathematics, Science"
            error={errors.subject}
            required
          />

          <View style={styles.examTypeContainer}>
            <Text style={styles.label}>Exam Type *</Text>
            <View style={styles.examTypeButtons}>
              {['quiz', 'assignment', 'midterm', 'final'].map((type) => (
                <Button
                  key={type}
                  title={type.charAt(0).toUpperCase() + type.slice(1)}
                  onPress={() => updateFormData('examType', type)}
                  variant={formData.examType === type ? 'primary' : 'outline'}
                  size="small"
                  style={styles.examTypeButton}
                />
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Input
                label="Marks Obtained"
                value={formData.marks}
                onChangeText={(value) => updateFormData('marks', value)}
                placeholder="0"
                keyboardType="numeric"
                error={errors.marks}
                required
              />
            </View>
            <View style={styles.halfWidth}>
              <Input
                label="Total Marks"
                value={formData.totalMarks}
                onChangeText={(value) => updateFormData('totalMarks', value)}
                placeholder="100"
                keyboardType="numeric"
                error={errors.totalMarks}
                required
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Input
                label="Semester"
                value={formData.semester}
                onChangeText={(value) => updateFormData('semester', value)}
                placeholder="e.g., 1, 2"
                error={errors.semester}
                required
              />
            </View>
            <View style={styles.halfWidth}>
              <Input
                label="Academic Year"
                value={formData.academicYear}
                onChangeText={(value) => updateFormData('academicYear', value)}
                placeholder="2024"
                keyboardType="numeric"
                error={errors.academicYear}
                required
              />
            </View>
          </View>

          {formData.marks && formData.totalMarks && !errors.marks && !errors.totalMarks && (
            <View style={styles.gradePreview}>
              <Text style={styles.gradePreviewTitle}>Grade Preview:</Text>
              <Text style={styles.gradePreviewText}>
                {calculateGrade(parseFloat(formData.marks), parseFloat(formData.totalMarks))}
              </Text>
            </View>
          )}

          <Button
            title="Save Grade"
            onPress={handleSubmit}
            style={styles.submitButton}
            loading={isLoading}
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    padding: theme.spacing.lg,
  },
  formCard: {
    padding: theme.spacing.lg,
  },
  formTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  studentSelector: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  studentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.sm,
  },
  studentButton: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  examTypeContainer: {
    marginBottom: theme.spacing.md,
  },
  examTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  examTypeButton: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  gradePreview: {
    backgroundColor: theme.colors.surfaceVariant,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  gradePreviewTitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  gradePreviewText: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  errorText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});

export default GradeFormScreen;
