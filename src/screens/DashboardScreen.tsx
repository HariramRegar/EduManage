import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { dataStorage } from '../utils/storage';
import { theme } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalFees: number;
  pendingFees: number;
  attendanceToday: number;
  totalAttendance: number;
}

const DashboardScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalFees: 0,
    pendingFees: 0,
    attendanceToday: 0,
    totalAttendance: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [students, teachers, fees, attendance] = await Promise.all([
        dataStorage.getStudents(),
        dataStorage.getTeachers(),
        dataStorage.getFees(),
        dataStorage.getAttendance(),
      ]);

      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = attendance.filter(a => a.date === today);
      
      const pendingFees = fees.filter(f => f.status === 'pending').length;
      const totalFeesAmount = fees.reduce((sum, fee) => sum + fee.amount, 0);

      setStats({
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalFees: totalFeesAmount,
        pendingFees,
        attendanceToday: todayAttendance.length,
        totalAttendance: attendance.length,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  const StatCard: React.FC<{ title: string; value: string | number; color: string }> = ({
    title,
    value,
    color,
  }) => (
    <Card style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </Card>
  );

  const QuickAction: React.FC<{ title: string; onPress: () => void }> = ({
    title,
    onPress,
  }) => (
    <TouchableOpacity
      style={styles.quickAction}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return <LoadingSpinner text="Loading dashboard..." overlay />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name}</Text>
        </View>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          size="small"
        />
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            color={theme.colors.secondary}
          />
          <StatCard
            title="Total Teachers"
            value={stats.totalTeachers}
            color={theme.colors.secondary}
          />
          <StatCard
            title="Pending Fees"
            value={stats.pendingFees}
            color={theme.colors.secondary}
          />
          <StatCard
            title="Today's Attendance"
            value={stats.attendanceToday}
            color={theme.colors.secondary}
          />
        </View>
      </View>

      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction title="View Students" onPress={() => navigation.navigate('StudentList')} />
          <QuickAction title="View Teachers" onPress={() => navigation.navigate('TeacherList')} />
          <QuickAction title="Add Student" onPress={() => navigation.navigate('StudentForm')} />
          <QuickAction title="Add Teacher" onPress={() => navigation.navigate('TeacherForm')} />
          <QuickAction title="Mark Attendance" onPress={() => navigation.navigate('Attendance')} />
          <QuickAction title="Add Grade" onPress={() => navigation.navigate('GradeForm')} />
          <QuickAction title="Collect Fee" onPress={() => navigation.navigate('FeeForm')} />
          <QuickAction title="Admission Form" onPress={() => navigation.navigate('AdmissionForm')} />
        </View>
      </View>

      <View style={styles.recentActivityContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Card style={styles.activityCard}>
          <Text style={styles.activityText}>
            • {stats.totalStudents} students enrolled
          </Text>
          <Text style={styles.activityText}>
            • {stats.totalTeachers} teachers registered
          </Text>
          <Text style={styles.activityText}>
            • ${stats.totalFees.toFixed(2)} total fees collected
          </Text>
          <Text style={styles.activityText}>
            • {stats.attendanceToday} students present today
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  welcomeText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
  },
  userName: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statsContainer: {
    marginBottom: theme.spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    padding: theme.spacing.lg,
  },
  statValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  statTitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  quickActionsContainer: {
    marginBottom: theme.spacing.xl,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quickActionText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  recentActivityContainer: {
    marginBottom: theme.spacing.xl,
  },
  activityCard: {
    padding: theme.spacing.lg,
  },
  activityText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
});

export default DashboardScreen;
