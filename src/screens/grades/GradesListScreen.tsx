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
import { Grade, Student } from '../../types';
import { theme } from '../../constants/theme';
import { getGradeColor, getGradeDescription } from '../../utils/gradeCalculation';

const GradesListScreen: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [gradesData, studentsData] = await Promise.all([
        dataStorage.getGrades(),
        dataStorage.getStudents(),
      ]);
      setGrades(gradesData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading grades:', error);
      Alert.alert('Error', 'Failed to load grades');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDeleteGrade = (gradeId: string) => {
    Alert.alert(
      'Delete Grade',
      'Are you sure you want to delete this grade?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedGrades = grades.filter(g => g.id !== gradeId);
              await dataStorage.saveGrades(updatedGrades);
              setGrades(updatedGrades);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete grade');
            }
          },
        },
      ]
    );
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };

  const getExamTypeColor = (examType: string) => {
    switch (examType) {
      case 'midterm':
        return theme.colors.primary;
      case 'final':
        return theme.colors.error;
      case 'quiz':
        return theme.colors.accent;
      case 'assignment':
        return theme.colors.success;
      default:
        return theme.colors.secondary;
    }
  };

  const renderGrade = ({ item }: { item: Grade }) => {
    const percentage = (item.marks / item.totalMarks) * 100;
    const gradeColor = getGradeColor(item.grade);
    
    return (
      <Card style={styles.gradeCard}>
        <View style={styles.gradeHeader}>
          <View style={styles.gradeInfo}>
            <Text style={styles.studentName}>{getStudentName(item.studentId)}</Text>
            <Text style={styles.subjectText}>{item.subject}</Text>
            <Text style={styles.examTypeText}>{item.examType.toUpperCase()}</Text>
          </View>
          <View style={styles.gradeScore}>
            <Text style={styles.marksText}>
              {item.marks}/{item.totalMarks}
            </Text>
            <Text style={styles.percentageText}>
              {percentage.toFixed(1)}%
            </Text>
          </View>
        </View>
        
        <View style={styles.gradeDetails}>
          <View style={[styles.gradeBadge, { backgroundColor: gradeColor }]}>
            <Text style={styles.gradeText}>{item.grade}</Text>
          </View>
          <Text style={styles.gradeDescription}>
            {getGradeDescription(item.grade)}
          </Text>
        </View>

        <View style={styles.gradeMeta}>
          <Text style={styles.metaText}>Semester: {item.semester}</Text>
          <Text style={styles.metaText}>Academic Year: {item.academicYear}</Text>
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
            onPress={() => handleDeleteGrade(item.id)}
            variant="danger"
            size="small"
            style={styles.actionButton}
          />
        </View>
      </Card>
    );
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading grades..." overlay />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Grades & Results ({grades.length})</Text>
        <Button
          title="Add Grade"
          onPress={() => {/* Navigation handled by navigator */}}
          style={styles.addButton}
        />
      </View>

      {grades.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No grades found</Text>
          <Text style={styles.emptySubtext}>Add your first grade to get started</Text>
        </View>
      ) : (
        <FlatList
          data={grades}
          renderItem={renderGrade}
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
  gradeCard: {
    marginBottom: theme.spacing.md,
  },
  gradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  gradeInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subjectText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  examTypeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  gradeScore: {
    alignItems: 'flex-end',
  },
  marksText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  percentageText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  gradeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  gradeBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.md,
  },
  gradeText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
  gradeDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  gradeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  metaText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
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

export default GradesListScreen;
