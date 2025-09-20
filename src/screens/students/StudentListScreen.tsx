import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { dataStorage } from '../../utils/storage';
import { Student } from '../../types';
import { theme } from '../../constants/theme';

const StudentListScreen: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const studentsData = await dataStorage.getStudents();
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading students:', error);
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStudents();
    setRefreshing(false);
  };

  const handleDeleteStudent = (studentId: string) => {
    Alert.alert(
      'Delete Student',
      'Are you sure you want to delete this student?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedStudents = students.filter(s => s.id !== studentId);
              await dataStorage.saveStudents(updatedStudents);
              setStudents(updatedStudents);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete student');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return theme.colors.success;
      case 'inactive':
        return theme.colors.warning;
      case 'graduated':
        return theme.colors.secondary;
      default:
        return theme.colors.textLight;
    }
  };

  const renderStudent = ({ item }: { item: Student }) => (
    <Card style={styles.studentCard}>
      <View style={styles.studentHeader}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.studentId}>ID: {item.studentId}</Text>
          <Text style={styles.studentGrade}>
            Grade {item.grade} - Section {item.section}
          </Text>
        </View>
        <View style={styles.studentActions}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.studentDetails}>
        <Text style={styles.detailText}>Email: {item.email}</Text>
        <Text style={styles.detailText}>Phone: {item.phone}</Text>
        <Text style={styles.detailText}>Parent: {item.parentName}</Text>
      </View>

      <View style={styles.actionButtons}>
        <Button
          title="Edit"
          onPress={() => {/* Navigation handled by navigator */}}
          variant="outline"
          size="small"
          style={styles.actionButton}
        />
        <Button
          title="Delete"
          onPress={() => handleDeleteStudent(item.id)}
          variant="danger"
          size="small"
          style={styles.actionButton}
        />
      </View>
    </Card>
  );

  if (isLoading) {
    return <LoadingSpinner text="Loading students..." overlay />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Students ({students.length})</Text>
        <Button
          title="Add Student"
          onPress={() => {/* Navigation handled by navigator */}}
          style={styles.addButton}
        />
      </View>

      {students.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No students found</Text>
          <Text style={styles.emptySubtext}>Add your first student to get started</Text>
        </View>
      ) : (
        <FlatList
          data={students}
          renderItem={renderStudent}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  addButton: {
    minWidth: 120,
  },
  listContainer: {
    padding: theme.spacing.lg,
  },
  studentCard: {
    marginBottom: theme.spacing.md,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  studentId: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  studentGrade: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  studentActions: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.white,
  },
  studentDetails: {
    marginBottom: theme.spacing.md,
  },
  detailText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: theme.spacing.sm,
    minWidth: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default StudentListScreen;
