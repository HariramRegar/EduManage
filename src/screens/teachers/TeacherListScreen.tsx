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
import { Teacher } from '../../types';
import { theme } from '../../constants/theme';

const TeacherListScreen: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setIsLoading(true);
      const teachersData = await dataStorage.getTeachers();
      setTeachers(teachersData);
    } catch (error) {
      console.error('Error loading teachers:', error);
      Alert.alert('Error', 'Failed to load teachers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTeachers();
    setRefreshing(false);
  };

  const handleDeleteTeacher = (teacherId: string) => {
    Alert.alert(
      'Delete Teacher',
      'Are you sure you want to delete this teacher?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedTeachers = teachers.filter(t => t.id !== teacherId);
              await dataStorage.saveTeachers(updatedTeachers);
              setTeachers(updatedTeachers);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete teacher');
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
      default:
        return theme.colors.textLight;
    }
  };

  const renderTeacher = ({ item }: { item: Teacher }) => (
    <Card style={styles.teacherCard}>
      <View style={styles.teacherHeader}>
        <View style={styles.teacherInfo}>
          <Text style={styles.teacherName}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.teacherId}>ID: {item.teacherId}</Text>
          <Text style={styles.teacherSubject}>
            {item.subject} • {item.experience} years experience
          </Text>
        </View>
        <View style={styles.teacherActions}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.teacherDetails}>
        <Text style={styles.detailText}>Email: {item.email}</Text>
        <Text style={styles.detailText}>Phone: {item.phone}</Text>
        <Text style={styles.detailText}>Qualification: {item.qualification}</Text>
        <Text style={styles.detailText}>Salary: ${item.salary.toLocaleString()}</Text>
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
          onPress={() => handleDeleteTeacher(item.id)}
          variant="danger"
          size="small"
          style={styles.actionButton}
        />
      </View>
    </Card>
  );

  if (isLoading) {
    return <LoadingSpinner text="Loading teachers..." overlay />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Teachers ({teachers.length})</Text>
        <Button
          title="Add Teacher"
          onPress={() => {/* Navigation handled by navigator */}}
          style={styles.addButton}
        />
      </View>

      {teachers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No teachers found</Text>
          <Text style={styles.emptySubtext}>Add your first teacher to get started</Text>
        </View>
      ) : (
        <FlatList
          data={teachers}
          renderItem={renderTeacher}
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
  teacherCard: {
    marginBottom: theme.spacing.md,
  },
  teacherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  teacherId: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  teacherSubject: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  teacherActions: {
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
  teacherDetails: {
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

export default TeacherListScreen;
