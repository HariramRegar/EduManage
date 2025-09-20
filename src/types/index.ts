export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
  createdAt: string;
}

export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  grade: string;
  section: string;
  admissionDate: string;
  status: 'active' | 'inactive' | 'graduated';
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  id: string;
  teacherId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  qualification: string;
  subject: string;
  experience: number;
  salary: number;
  joiningDate: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Grade {
  id: string;
  studentId: string;
  subject: string;
  examType: 'midterm' | 'final' | 'quiz' | 'assignment';
  marks: number;
  totalMarks: number;
  grade: string;
  semester: string;
  academicYear: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
  markedBy: string;
  createdAt: string;
}

export interface Fee {
  id: string;
  studentId: string;
  feeType: 'tuition' | 'transport' | 'library' | 'sports' | 'other';
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue';
  paymentMethod?: 'cash' | 'card' | 'bank_transfer';
  receiptNumber?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NavigationProps {
  navigation: any;
  route: any;
}

export interface FormField {
  label: string;
  value: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
}
