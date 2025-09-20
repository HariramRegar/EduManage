import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import DashboardScreen from '../screens/DashboardScreen';
import StudentListScreen from '../screens/students/StudentListScreen';
import StudentFormScreen from '../screens/students/StudentFormScreen';
import TeacherListScreen from '../screens/teachers/TeacherListScreen';
import TeacherFormScreen from '../screens/teachers/TeacherFormScreen';
import GradesListScreen from '../screens/grades/GradesListScreen';
import GradeFormScreen from '../screens/grades/GradeFormScreen';
import AttendanceScreen from '../screens/attendance/AttendanceScreen';
import FeesListScreen from '../screens/fees/FeesListScreen';
import FeeFormScreen from '../screens/fees/FeeFormScreen';
import AdmissionFormScreen from '../screens/admission/AdmissionFormScreen';

const Stack = createNativeStackNavigator();

const AppNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Loading screen will be handled by App.tsx
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2563eb',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerBackTitleVisible: false,
        }}
      >
        {!user ? (
          // Auth Stack
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Signup"
              component={SignupScreen}
              options={{
                title: 'Create Account',
                headerShown: true,
              }}
            />
          </>
        ) : (
          // Main App Stack
          <>
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{
                title: 'Dashboard',
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="StudentList"
              component={StudentListScreen}
              options={{
                title: 'Students',
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="StudentForm"
              component={StudentFormScreen}
              options={{
                title: 'Student Form',
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="TeacherList"
              component={TeacherListScreen}
              options={{
                title: 'Teachers',
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="TeacherForm"
              component={TeacherFormScreen}
              options={{
                title: 'Teacher Form',
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="GradesList"
              component={GradesListScreen}
              options={{
                title: 'Grades & Results',
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="GradeForm"
              component={GradeFormScreen}
              options={{
                title: 'Add Grade',
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="Attendance"
              component={AttendanceScreen}
              options={{
                title: 'Attendance',
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="FeesList"
              component={FeesListScreen}
              options={{
                title: 'Fees & Receipts',
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="FeeForm"
              component={FeeFormScreen}
              options={{
                title: 'Fee Payment',
                headerShown: true,
              }}
            />
            <Stack.Screen
              name="AdmissionForm"
              component={AdmissionFormScreen}
              options={{
                title: 'Student Admission',
                headerShown: true,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
