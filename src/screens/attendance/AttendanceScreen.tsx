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
import { Attendance, Student } from '../../types';
import { theme } from '../../constants/theme';

const AttendanceScreen: React.FC = () => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [attendanceData, studentsData] = await Promise.all([
        dataStorage.getAttendance(),
        dataStorage.getStudents(),
      ]);
      
      // Filter attendance by selected date
      const filteredAttendance = attendanceData.filter(a => a.date === selectedDate);
      setAttendance(filteredAttendance);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading attendance:', error);
      Alert.alert('Error', 'Failed to load attendance');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleMarkAttendance = async (studentId: string, status: 'present' | 'absent' | 'late' | 'excused') => {
    try {
      const existingAttendance = await dataStorage.getAttendance();
      const todayAttendance = existingAttendance.filter(a => a.date === selectedDate);
      const existingRecord = todayAttendance.find(a => a.studentId === studentId);
      
      let updatedAttendance;
      if (existingRecord) {
        // Update existing record
        updatedAttendance = existingAttendance.map(a => 
          a.id === existingRecord.id 
            ? { ...a, status, updatedAt: new Date().toISOString() }
            : a
        );
      } else {
        // Create new record
        const newRecord: Attendance = {
          id: Date.now().toString(),
          studentId,
          date: selectedDate,
          status,
          markedBy: 'current_user', // In real app, use actual user ID
          createdAt: new Date().toISOString(),
        };
        updatedAttendance = [...existingAttendance, newRecord];
      }
      
      await dataStorage.saveAttendance(updatedAttendance);
      await loadData(); // Reload to show updated data
    } catch (error) {
      console.error('Error marking attendance:', error);
      Alert.alert('Error', 'Failed to mark attendance');
    }
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return theme.colors.success;
      case 'absent':
        return theme.colors.error;
      case 'late':
        return theme.colors.warning;
      case 'excused':
        return theme.colors.secondary;
      default:
        return theme.colors.textLight;
    }
  };

  const getStatusCount = (status: string) => {
    return attendance.filter(a => a.status === status).length;
  };

  const renderStudent = ({ item }: { item: Student }) => {
    const attendanceRecord = attendance.find(a => a.studentId === item.id);
    const currentStatus = attendanceRecord?.status || 'absent';

    return (
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
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentStatus) }]}>
            <Text style={styles.statusText}>{currentStatus.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.attendanceButtons}>
          <Button
            title="Present"
            onPress={() => handleMarkAttendance(item.id, 'present')}
            variant={currentStatus === 'present' ? 'primary' : 'outline'}
            size="small"
            style={styles.attendanceButton}
          />
          <Button
            title="Absent"
            onPress={() => handleMarkAttendance(item.id, 'absent')}
            variant={currentStatus === 'absent' ? 'primary' : 'outline'}
            size="small"
            style={styles.attendanceButton}
          />
          <Button
            title="Late"
            onPress={() => handleMarkAttendance(item.id, 'late')}
            variant={currentStatus === 'late' ? 'primary' : 'outline'}
            size="small"
            style={styles.attendanceButton}
          />
          <Button
            title="Excused"
            onPress={() => handleMarkAttendance(item.id, 'excused')}
            variant={currentStatus === 'excused' ? 'primary' : 'outline'}
            size="small"
            style={styles.attendanceButton}
          />
        </View>
      </Card>
    );
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading attendance..." overlay />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance</Text>
        <Text style={styles.dateText}>{selectedDate}</Text>
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.success }]}>
                {getStatusCount('present')}
              </Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.error }]}>
                {getStatusCount('absent')}
              </Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.warning }]}>
                {getStatusCount('late')}
              </Text>
              <Text style={styles.statLabel}>Late</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.secondary }]}>
                {getStatusCount('excused')}
              </Text>
              <Text style={styles.statLabel}>Excused</Text>
            </View>
          </View>
        </Card>
      </View>

      {students.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No students found</Text>
          <Text style={styles.emptySubtext}>Add students to mark attendance</Text>
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
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  dateText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  statsContainer: {
    padding: theme.spacing.lg,
  },
  statsCard: {
    padding: theme.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
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
  attendanceButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  attendanceButton: {
    width: '23%',
    marginBottom: theme.spacing.sm,
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

export default AttendanceScreen;
