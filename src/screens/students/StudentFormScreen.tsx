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
import { useNavigation, useRoute } from '@react-navigation/native';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import PhotoPicker from '../../components/common/PhotoPicker';
import { dataStorage } from '../../utils/storage';
import { Student } from '../../types';
import { theme } from '../../constants/theme';
import {
  validateEmail,
  validatePhone,
  validateRequired,
  validateStudentId,
  validateAge,
} from '../../utils/validation';

const StudentFormScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    grade: '',
    section: '',
    admissionDate: new Date().toISOString().split('T')[0],
    status: 'active' as 'active' | 'inactive' | 'graduated',
    photo: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const studentId = route.params?.id;
    if (studentId) {
      setIsEditMode(true);
      setEditingStudentId(studentId);
      loadStudentData(studentId);
    } else {
      generateStudentId();
    }
  }, [route.params]);

  const loadStudentData = async (id: string) => {
    try {
      setIsLoading(true);
      const students = await dataStorage.getStudents();
      const student = students.find(s => s.id === id);
      
      if (student) {
        setFormData({
          studentId: student.studentId,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          phone: student.phone,
          dateOfBirth: student.dateOfBirth,
          address: student.address,
          parentName: student.parentName,
          parentPhone: student.parentPhone,
          parentEmail: student.parentEmail,
          grade: student.grade,
          section: student.section,
          admissionDate: student.admissionDate,
          status: student.status,
          photo: student.photo || '',
        });
      } else {
        Alert.alert('Error', 'Student not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading student:', error);
      Alert.alert('Error', 'Failed to load student data');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const generateStudentId = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    setFormData(prev => ({
      ...prev,
      studentId: `${year}-${randomNum}`,
    }));
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
      newErrors.studentId = 'Student ID is required';
    } else if (!validateStudentId(formData.studentId)) {
      newErrors.studentId = 'Invalid student ID format (YYYY-XXXX)';
    }

    if (!validateRequired(formData.firstName)) {
      newErrors.firstName = 'First name is required';
    }

    if (!validateRequired(formData.lastName)) {
      newErrors.lastName = 'Last name is required';
    }

    if (!validateRequired(formData.email)) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!validateRequired(formData.phone)) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!validateRequired(formData.dateOfBirth)) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else if (!validateAge(formData.dateOfBirth, 5, 25)) {
      newErrors.dateOfBirth = 'Student must be between 5 and 25 years old';
    }

    if (!validateRequired(formData.address)) {
      newErrors.address = 'Address is required';
    }

    if (!validateRequired(formData.parentName)) {
      newErrors.parentName = 'Parent name is required';
    }

    if (!validateRequired(formData.parentPhone)) {
      newErrors.parentPhone = 'Parent phone is required';
    } else if (!validatePhone(formData.parentPhone)) {
      newErrors.parentPhone = 'Please enter a valid phone number';
    }

    if (!validateRequired(formData.parentEmail)) {
      newErrors.parentEmail = 'Parent email is required';
    } else if (!validateEmail(formData.parentEmail)) {
      newErrors.parentEmail = 'Please enter a valid email';
    }

    if (!validateRequired(formData.grade)) {
      newErrors.grade = 'Grade is required';
    }

    if (!validateRequired(formData.section)) {
      newErrors.section = 'Section is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      const existingStudents = await dataStorage.getStudents();
      let updatedStudents: Student[];

      if (isEditMode && editingStudentId) {
        // Update existing student
        updatedStudents = existingStudents.map(student => 
          student.id === editingStudentId 
            ? {
                ...student,
                ...formData,
                updatedAt: new Date().toISOString(),
              }
            : student
        );
      } else {
        // Create new student
        const newStudent: Student = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        updatedStudents = [...existingStudents, newStudent];
      }
      
      await dataStorage.saveStudents(updatedStudents);
      
      const successMessage = isEditMode ? 'Student updated successfully!' : 'Student added successfully!';
      Alert.alert('Success', successMessage, [
        { text: 'OK', onPress: () => navigation.navigate('StudentList') }
      ]);
    } catch (error) {
      console.error('Error saving student:', error);
      Alert.alert('Error', 'Failed to save student');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text={isEditMode ? "Loading student..." : "Saving student..."} overlay />;
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
          <Text style={styles.formTitle}>
            {isEditMode ? 'Edit Student Information' : 'Student Information'}
          </Text>
          
          <PhotoPicker
            label="Passport Photo"
            value={formData.photo}
            onChange={(uri) => updateFormData('photo', uri)}
            placeholder="Add passport size photo"
          />
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Input
                label="Student ID"
                value={formData.studentId}
                onChangeText={(value) => updateFormData('studentId', value)}
                placeholder="YYYY-XXXX"
                error={errors.studentId}
                required
              />
            </View>
            <View style={styles.halfWidth}>
              <Input
                label="Admission Date"
                value={formData.admissionDate}
                onChangeText={(value) => updateFormData('admissionDate', value)}
                placeholder="YYYY-MM-DD"
                error={errors.admissionDate}
                required
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Input
                label="First Name"
                value={formData.firstName}
                onChangeText={(value) => updateFormData('firstName', value)}
                placeholder="Enter first name"
                error={errors.firstName}
                required
              />
            </View>
            <View style={styles.halfWidth}>
              <Input
                label="Last Name"
                value={formData.lastName}
                onChangeText={(value) => updateFormData('lastName', value)}
                placeholder="Enter last name"
                error={errors.lastName}
                required
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Input
                label="Email"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                placeholder="student@email.com"
                keyboardType="email-address"
                error={errors.email}
                required
              />
            </View>
            <View style={styles.halfWidth}>
              <Input
                label="Phone"
                value={formData.phone}
                onChangeText={(value) => updateFormData('phone', value)}
                placeholder="+1234567890"
                keyboardType="phone-pad"
                error={errors.phone}
                required
              />
            </View>
          </View>

          <Input
            label="Date of Birth"
            value={formData.dateOfBirth}
            onChangeText={(value) => updateFormData('dateOfBirth', value)}
            placeholder="YYYY-MM-DD"
            error={errors.dateOfBirth}
            required
          />

          <Input
            label="Address"
            value={formData.address}
            onChangeText={(value) => updateFormData('address', value)}
            placeholder="Enter full address"
            multiline
            numberOfLines={3}
            error={errors.address}
            required
          />

          <View style={styles.sectionTitle}>
            <Text style={styles.sectionTitleText}>Parent Information</Text>
          </View>

          <Input
            label="Parent Name"
            value={formData.parentName}
            onChangeText={(value) => updateFormData('parentName', value)}
            placeholder="Enter parent name"
            error={errors.parentName}
            required
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Input
                label="Parent Phone"
                value={formData.parentPhone}
                onChangeText={(value) => updateFormData('parentPhone', value)}
                placeholder="+1234567890"
                keyboardType="phone-pad"
                error={errors.parentPhone}
                required
              />
            </View>
            <View style={styles.halfWidth}>
              <Input
                label="Parent Email"
                value={formData.parentEmail}
                onChangeText={(value) => updateFormData('parentEmail', value)}
                placeholder="parent@email.com"
                keyboardType="email-address"
                error={errors.parentEmail}
                required
              />
            </View>
          </View>

          <View style={styles.sectionTitle}>
            <Text style={styles.sectionTitleText}>Academic Information</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Input
                label="Grade"
                value={formData.grade}
                onChangeText={(value) => updateFormData('grade', value)}
                placeholder="e.g., 10"
                error={errors.grade}
                required
              />
            </View>
            <View style={styles.halfWidth}>
              <Input
                label="Section"
                value={formData.section}
                onChangeText={(value) => updateFormData('section', value)}
                placeholder="e.g., A"
                error={errors.section}
                required
              />
            </View>
          </View>

          <Button
            title={isEditMode ? 'Update Student' : 'Save Student'}
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  sectionTitle: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitleText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  submitButton: {
    marginTop: theme.spacing.xl,
  },
});

export default StudentFormScreen;
