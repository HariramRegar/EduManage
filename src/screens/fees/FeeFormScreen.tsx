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
import { Fee, Student } from '../../types';
import { theme } from '../../constants/theme';
import { validateRequired, validateDecimal } from '../../utils/validation';

const FeeFormScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [formData, setFormData] = useState({
    studentId: '',
    feeType: 'tuition' as 'tuition' | 'transport' | 'library' | 'sports' | 'other',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash' as 'cash' | 'card' | 'bank_transfer',
    remarks: '',
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

    if (!validateRequired(formData.amount)) {
      newErrors.amount = 'Amount is required';
    } else if (!validateDecimal(formData.amount)) {
      newErrors.amount = 'Amount must be a valid number';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!validateRequired(formData.dueDate)) {
      newErrors.dueDate = 'Due date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      const newFee: Fee = {
        id: Date.now().toString(),
        ...formData,
        amount: parseFloat(formData.amount),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const existingFees = await dataStorage.getFees();
      const updatedFees = [...existingFees, newFee];
      
      await dataStorage.saveFees(updatedFees);
      
      Alert.alert('Success', 'Fee record added successfully!', [
        { text: 'OK', onPress: () => {/* Navigation handled by navigator */} }
      ]);
    } catch (error) {
      console.error('Error saving fee:', error);
      Alert.alert('Error', 'Failed to save fee record');
    } finally {
      setIsLoading(false);
    }
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Select Student';
  };

  if (isLoading) {
    return <LoadingSpinner text="Saving fee record..." overlay />;
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
          <Text style={styles.formTitle}>Collect Fee</Text>
          
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

          <View style={styles.feeTypeContainer}>
            <Text style={styles.label}>Fee Type *</Text>
            <View style={styles.feeTypeButtons}>
              {['tuition', 'transport', 'library', 'sports', 'other'].map((type) => (
                <Button
                  key={type}
                  title={type.charAt(0).toUpperCase() + type.slice(1)}
                  onPress={() => updateFormData('feeType', type)}
                  variant={formData.feeType === type ? 'primary' : 'outline'}
                  size="small"
                  style={styles.feeTypeButton}
                />
              ))}
            </View>
          </View>

          <Input
            label="Amount"
            value={formData.amount}
            onChangeText={(value) => updateFormData('amount', value)}
            placeholder="0.00"
            keyboardType="numeric"
            error={errors.amount}
            required
          />

          <Input
            label="Due Date"
            value={formData.dueDate}
            onChangeText={(value) => updateFormData('dueDate', value)}
            placeholder="YYYY-MM-DD"
            error={errors.dueDate}
            required
          />

          <View style={styles.paymentMethodContainer}>
            <Text style={styles.label}>Payment Method</Text>
            <View style={styles.paymentMethodButtons}>
              {['cash', 'card', 'bank_transfer'].map((method) => (
                <Button
                  key={method}
                  title={method.charAt(0).toUpperCase() + method.slice(1).replace('_', ' ')}
                  onPress={() => updateFormData('paymentMethod', method)}
                  variant={formData.paymentMethod === method ? 'primary' : 'outline'}
                  size="small"
                  style={styles.paymentMethodButton}
                />
              ))}
            </View>
          </View>

          <Input
            label="Remarks (Optional)"
            value={formData.remarks}
            onChangeText={(value) => updateFormData('remarks', value)}
            placeholder="Additional notes..."
            multiline
            numberOfLines={3}
          />

          <Button
            title="Save Fee Record"
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
  feeTypeContainer: {
    marginBottom: theme.spacing.md,
  },
  feeTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  feeTypeButton: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  paymentMethodContainer: {
    marginBottom: theme.spacing.md,
  },
  paymentMethodButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  paymentMethodButton: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
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

export default FeeFormScreen;
