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
import { Teacher } from '../../types';
import { theme } from '../../constants/theme';
import {
  validateEmail,
  validatePhone,
  validateRequired,
  validateTeacherId,
  validateNumeric,
  validateDecimal,
} from '../../utils/validation';

const TeacherFormScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    teacherId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    qualification: '',
    subject: '',
    experience: '',
    salary: '',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'active' as 'active' | 'inactive',
    photo: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const teacherId = route.params?.id;
    if (teacherId) {
      setIsEditMode(true);
      setEditingTeacherId(teacherId);
      loadTeacherData(teacherId);
    } else {
      generateTeacherId();
    }
  }, [route.params]);

  const loadTeacherData = async (id: string) => {
    try {
      setIsLoading(true);
      const teachers = await dataStorage.getTeachers();
      const teacher = teachers.find(t => t.id === id);
      
      if (teacher) {
        setFormData({
          teacherId: teacher.teacherId,
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          email: teacher.email,
          phone: teacher.phone,
          dateOfBirth: teacher.dateOfBirth,
          address: teacher.address,
          qualification: teacher.qualification,
          subject: teacher.subject,
          experience: teacher.experience.toString(),
          salary: teacher.salary.toString(),
          joiningDate: teacher.joiningDate,
          status: teacher.status,
          photo: teacher.photo || '',
        });
      } else {
        Alert.alert('Error', 'Teacher not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading teacher:', error);
      Alert.alert('Error', 'Failed to load teacher data');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const generateTeacherId = () => {
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    setFormData(prev => ({
      ...prev,
      teacherId: `T-${randomNum}`,
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

    if (!validateRequired(formData.teacherId)) {
      newErrors.teacherId = 'Teacher ID is required';
    } else if (!validateTeacherId(formData.teacherId)) {
      newErrors.teacherId = 'Invalid teacher ID format (T-XXXX)';
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
    }

    if (!validateRequired(formData.address)) {
      newErrors.address = 'Address is required';
    }

    if (!validateRequired(formData.qualification)) {
      newErrors.qualification = 'Qualification is required';
    }

    if (!validateRequired(formData.subject)) {
      newErrors.subject = 'Subject is required';
    }

    if (!validateRequired(formData.experience)) {
      newErrors.experience = 'Experience is required';
    } else if (!validateNumeric(formData.experience)) {
      newErrors.experience = 'Experience must be a number';
    }

    if (!validateRequired(formData.salary)) {
      newErrors.salary = 'Salary is required';
    } else if (!validateDecimal(formData.salary)) {
      newErrors.salary = 'Salary must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      const existingTeachers = await dataStorage.getTeachers();
      let updatedTeachers: Teacher[];

      if (isEditMode && editingTeacherId) {
        // Update existing teacher
        updatedTeachers = existingTeachers.map(teacher => 
          teacher.id === editingTeacherId 
            ? {
                ...teacher,
                ...formData,
                experience: parseInt(formData.experience),
                salary: parseFloat(formData.salary),
                updatedAt: new Date().toISOString(),
              }
            : teacher
        );
      } else {
        // Create new teacher
        const newTeacher: Teacher = {
          id: Date.now().toString(),
          ...formData,
          experience: parseInt(formData.experience),
          salary: parseFloat(formData.salary),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        updatedTeachers = [...existingTeachers, newTeacher];
      }
      
      await dataStorage.saveTeachers(updatedTeachers);
      
      const successMessage = isEditMode ? 'Teacher updated successfully!' : 'Teacher added successfully!';
      Alert.alert('Success', successMessage, [
        { text: 'OK', onPress: () => navigation.navigate('TeacherList') }
      ]);
    } catch (error) {
      console.error('Error saving teacher:', error);
      Alert.alert('Error', 'Failed to save teacher');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text={isEditMode ? "Loading teacher..." : "Saving teacher..."} overlay />;
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
            {isEditMode ? 'Edit Teacher Information' : 'Teacher Information'}
          </Text>
          
          <PhotoPicker
            label="Teacher Photo"
            value={formData.photo}
            onChange={(uri) => updateFormData('photo', uri)}
            placeholder="Add teacher photo"
          />
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Input
                label="Teacher ID"
                value={formData.teacherId}
                onChangeText={(value) => updateFormData('teacherId', value)}
                placeholder="T-XXXX"
                error={errors.teacherId}
                required
              />
            </View>
            <View style={styles.halfWidth}>
              <Input
                label="Joining Date"
                value={formData.joiningDate}
                onChangeText={(value) => updateFormData('joiningDate', value)}
                placeholder="YYYY-MM-DD"
                error={errors.joiningDate}
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
                placeholder="teacher@email.com"
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
            <Text style={styles.sectionTitleText}>Professional Information</Text>
          </View>

          <Input
            label="Qualification"
            value={formData.qualification}
            onChangeText={(value) => updateFormData('qualification', value)}
            placeholder="e.g., B.Ed, M.A. Mathematics"
            error={errors.qualification}
            required
          />

          <Input
            label="Subject"
            value={formData.subject}
            onChangeText={(value) => updateFormData('subject', value)}
            placeholder="e.g., Mathematics, Science"
            error={errors.subject}
            required
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Input
                label="Experience (years)"
                value={formData.experience}
                onChangeText={(value) => updateFormData('experience', value)}
                placeholder="0"
                keyboardType="numeric"
                error={errors.experience}
                required
              />
            </View>
            <View style={styles.halfWidth}>
              <Input
                label="Salary"
                value={formData.salary}
                onChangeText={(value) => updateFormData('salary', value)}
                placeholder="0.00"
                keyboardType="numeric"
                error={errors.salary}
                required
              />
            </View>
          </View>

          <Button
            title={isEditMode ? 'Update Teacher' : 'Save Teacher'}
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

export default TeacherFormScreen;
