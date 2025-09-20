import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Regular data storage
export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from storage:', error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in storage:', error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from storage:', error);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};

// Secure storage for sensitive data
export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error getting item from secure storage:', error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error setting item in secure storage:', error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing item from secure storage:', error);
    }
  },
};

// Data management helpers
export const dataStorage = {
  // Students
  async getStudents(): Promise<any[]> {
    const data = await storage.getItem('students');
    return data ? JSON.parse(data) : [];
  },

  async saveStudents(students: any[]): Promise<void> {
    await storage.setItem('students', JSON.stringify(students));
  },

  // Teachers
  async getTeachers(): Promise<any[]> {
    const data = await storage.getItem('teachers');
    return data ? JSON.parse(data) : [];
  },

  async saveTeachers(teachers: any[]): Promise<void> {
    await storage.setItem('teachers', JSON.stringify(teachers));
  },

  // Grades
  async getGrades(): Promise<any[]> {
    const data = await storage.getItem('grades');
    return data ? JSON.parse(data) : [];
  },

  async saveGrades(grades: any[]): Promise<void> {
    await storage.setItem('grades', JSON.stringify(grades));
  },

  // Attendance
  async getAttendance(): Promise<any[]> {
    const data = await storage.getItem('attendance');
    return data ? JSON.parse(data) : [];
  },

  async saveAttendance(attendance: any[]): Promise<void> {
    await storage.setItem('attendance', JSON.stringify(attendance));
  },

  // Fees
  async getFees(): Promise<any[]> {
    const data = await storage.getItem('fees');
    return data ? JSON.parse(data) : [];
  },

  async saveFees(fees: any[]): Promise<void> {
    await storage.setItem('fees', JSON.stringify(fees));
  },

  // User session
  async getUser(): Promise<any | null> {
    const data = await storage.getItem('user');
    return data ? JSON.parse(data) : null;
  },

  async saveUser(user: any): Promise<void> {
    await storage.setItem('user', JSON.stringify(user));
  },

  async clearUser(): Promise<void> {
    await storage.removeItem('user');
  },
};
