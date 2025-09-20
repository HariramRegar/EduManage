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
import { Fee, Student } from '../../types';
import { theme } from '../../constants/theme';

const FeesListScreen: React.FC = () => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [feesData, studentsData] = await Promise.all([
        dataStorage.getFees(),
        dataStorage.getStudents(),
      ]);
      setFees(feesData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading fees:', error);
      Alert.alert('Error', 'Failed to load fees');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDeleteFee = (feeId: string) => {
    Alert.alert(
      'Delete Fee',
      'Are you sure you want to delete this fee record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedFees = fees.filter(f => f.id !== feeId);
              await dataStorage.saveFees(updatedFees);
              setFees(updatedFees);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete fee record');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return theme.colors.success;
      case 'pending':
        return theme.colors.warning;
      case 'overdue':
        return theme.colors.error;
      default:
        return theme.colors.textLight;
    }
  };

  const getFeeTypeColor = (feeType: string) => {
    switch (feeType) {
      case 'tuition':
        return theme.colors.primary;
      case 'transport':
        return theme.colors.accent;
      case 'library':
        return theme.colors.secondary;
      case 'sports':
        return theme.colors.success;
      case 'other':
        return theme.colors.warning;
      default:
        return theme.colors.textLight;
    }
  };

  const renderFee = ({ item }: { item: Fee }) => (
    <Card style={styles.feeCard}>
      <View style={styles.feeHeader}>
        <View style={styles.feeInfo}>
          <Text style={styles.studentName}>{getStudentName(item.studentId)}</Text>
          <Text style={styles.feeType}>{item.feeType.toUpperCase()}</Text>
          <Text style={styles.feeAmount}>${item.amount.toFixed(2)}</Text>
        </View>
        <View style={styles.feeActions}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.feeDetails}>
        <Text style={styles.detailText}>Due Date: {item.dueDate}</Text>
        {item.paidDate && (
          <Text style={styles.detailText}>Paid Date: {item.paidDate}</Text>
        )}
        {item.paymentMethod && (
          <Text style={styles.detailText}>Payment Method: {item.paymentMethod}</Text>
        )}
        {item.receiptNumber && (
          <Text style={styles.detailText}>Receipt #: {item.receiptNumber}</Text>
        )}
        {item.remarks && (
          <Text style={styles.detailText}>Remarks: {item.remarks}</Text>
        )}
      </View>

      <View style={styles.actionButtons}>
        {item.status === 'pending' && (
          <Button
            title="Mark Paid"
            onPress={() => {/* Navigation handled by navigator */}}
            variant="primary"
            size="small"
            style={styles.actionButton}
          />
        )}
        <Button
          title="View Receipt"
          onPress={() => {/* Navigation handled by navigator */}}
          variant="outline"
          size="small"
          style={styles.actionButton}
        />
        <Button
          title="Delete"
          onPress={() => handleDeleteFee(item.id)}
          variant="danger"
          size="small"
          style={styles.actionButton}
        />
      </View>
    </Card>
  );

  const getTotalFees = () => {
    return fees.reduce((sum, fee) => sum + fee.amount, 0);
  };

  const getPaidFees = () => {
    return fees.filter(f => f.status === 'paid').reduce((sum, fee) => sum + fee.amount, 0);
  };

  const getPendingFees = () => {
    return fees.filter(f => f.status === 'pending').reduce((sum, fee) => sum + fee.amount, 0);
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading fees..." overlay />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fees & Receipts ({fees.length})</Text>
        <Button
          title="Collect Fee"
          onPress={() => {/* Navigation handled by navigator */}}
          style={styles.addButton}
        />
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
                ${getTotalFees().toFixed(2)}
              </Text>
              <Text style={styles.statLabel}>Total Fees</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.success }]}>
                ${getPaidFees().toFixed(2)}
              </Text>
              <Text style={styles.statLabel}>Paid</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.warning }]}>
                ${getPendingFees().toFixed(2)}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        </Card>
      </View>

      {fees.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No fees found</Text>
          <Text style={styles.emptySubtext}>Add your first fee record to get started</Text>
        </View>
      ) : (
        <FlatList
          data={fees}
          renderItem={renderFee}
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
    fontSize: theme.fontSize.lg,
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
  feeCard: {
    marginBottom: theme.spacing.md,
  },
  feeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  feeInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  feeType: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
    marginBottom: theme.spacing.xs,
  },
  feeAmount: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  feeActions: {
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
  feeDetails: {
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
    flexWrap: 'wrap',
  },
  actionButton: {
    marginLeft: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
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

export default FeesListScreen;
