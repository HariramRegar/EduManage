export const calculateGrade = (marks: number, totalMarks: number): string => {
  const percentage = (marks / totalMarks) * 100;
  
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  if (percentage >= 30) return 'D';
  return 'F';
};

export const calculateGPA = (grades: string[]): number => {
  const gradePoints: { [key: string]: number } = {
    'A+': 4.0,
    'A': 3.7,
    'B+': 3.3,
    'B': 3.0,
    'C+': 2.7,
    'C': 2.3,
    'D': 2.0,
    'F': 0.0,
  };
  
  const totalPoints = grades.reduce((sum, grade) => sum + (gradePoints[grade] || 0), 0);
  return grades.length > 0 ? totalPoints / grades.length : 0;
};

export const getGradeColor = (grade: string): string => {
  const gradeColors: { [key: string]: string } = {
    'A+': '#10b981', // green
    'A': '#10b981',  // green
    'B+': '#3b82f6', // blue
    'B': '#3b82f6',  // blue
    'C+': '#f59e0b', // yellow
    'C': '#f59e0b',  // yellow
    'D': '#f97316',  // orange
    'F': '#ef4444',  // red
  };
  
  return gradeColors[grade] || '#64748b';
};

export const getGradeDescription = (grade: string): string => {
  const gradeDescriptions: { [key: string]: string } = {
    'A+': 'Excellent',
    'A': 'Very Good',
    'B+': 'Good',
    'B': 'Satisfactory',
    'C+': 'Average',
    'C': 'Below Average',
    'D': 'Poor',
    'F': 'Fail',
  };
  
  return gradeDescriptions[grade] || 'Unknown';
};
