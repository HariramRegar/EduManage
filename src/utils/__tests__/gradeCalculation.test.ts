import {
  calculateGrade,
  calculateGPA,
  getGradeColor,
  getGradeDescription,
} from '../gradeCalculation';

describe('Grade Calculation Utils', () => {
  describe('calculateGrade', () => {
    it('should return A+ for 95% and above', () => {
      expect(calculateGrade(95, 100)).toBe('A+');
      expect(calculateGrade(190, 200)).toBe('A+');
    });

    it('should return A for 80-89%', () => {
      expect(calculateGrade(80, 100)).toBe('A');
      expect(calculateGrade(85, 100)).toBe('A');
      expect(calculateGrade(89, 100)).toBe('A');
    });

    it('should return B+ for 70-79%', () => {
      expect(calculateGrade(70, 100)).toBe('B+');
      expect(calculateGrade(75, 100)).toBe('B+');
      expect(calculateGrade(79, 100)).toBe('B+');
    });

    it('should return B for 60-69%', () => {
      expect(calculateGrade(60, 100)).toBe('B');
      expect(calculateGrade(65, 100)).toBe('B');
      expect(calculateGrade(69, 100)).toBe('B');
    });

    it('should return C+ for 50-59%', () => {
      expect(calculateGrade(50, 100)).toBe('C+');
      expect(calculateGrade(55, 100)).toBe('C+');
      expect(calculateGrade(59, 100)).toBe('C+');
    });

    it('should return C for 40-49%', () => {
      expect(calculateGrade(40, 100)).toBe('C');
      expect(calculateGrade(45, 100)).toBe('C');
      expect(calculateGrade(49, 100)).toBe('C');
    });

    it('should return D for 30-39%', () => {
      expect(calculateGrade(30, 100)).toBe('D');
      expect(calculateGrade(35, 100)).toBe('D');
      expect(calculateGrade(39, 100)).toBe('D');
    });

    it('should return F for below 30%', () => {
      expect(calculateGrade(29, 100)).toBe('F');
      expect(calculateGrade(0, 100)).toBe('F');
      expect(calculateGrade(10, 100)).toBe('F');
    });

    it('should handle decimal marks correctly', () => {
      expect(calculateGrade(89.5, 100)).toBe('A');
      expect(calculateGrade(90.5, 100)).toBe('A+');
    });
  });

  describe('calculateGPA', () => {
    it('should calculate correct GPA for all A+ grades', () => {
      expect(calculateGPA(['A+', 'A+', 'A+'])).toBe(4.0);
    });

    it('should calculate correct GPA for mixed grades', () => {
      expect(calculateGPA(['A+', 'A', 'B+', 'B'])).toBe(3.5);
    });

    it('should calculate correct GPA for failing grades', () => {
      expect(calculateGPA(['F', 'F', 'F'])).toBe(0.0);
    });

    it('should handle empty array', () => {
      expect(calculateGPA([])).toBe(0);
    });

    it('should handle single grade', () => {
      expect(calculateGPA(['A'])).toBe(3.7);
    });
  });

  describe('getGradeColor', () => {
    it('should return correct colors for each grade', () => {
      expect(getGradeColor('A+')).toBe('#10b981');
      expect(getGradeColor('A')).toBe('#10b981');
      expect(getGradeColor('B+')).toBe('#3b82f6');
      expect(getGradeColor('B')).toBe('#3b82f6');
      expect(getGradeColor('C+')).toBe('#f59e0b');
      expect(getGradeColor('C')).toBe('#f59e0b');
      expect(getGradeColor('D')).toBe('#f97316');
      expect(getGradeColor('F')).toBe('#ef4444');
    });

    it('should return default color for unknown grade', () => {
      expect(getGradeColor('X')).toBe('#64748b');
    });
  });

  describe('getGradeDescription', () => {
    it('should return correct descriptions for each grade', () => {
      expect(getGradeDescription('A+')).toBe('Excellent');
      expect(getGradeDescription('A')).toBe('Very Good');
      expect(getGradeDescription('B+')).toBe('Good');
      expect(getGradeDescription('B')).toBe('Satisfactory');
      expect(getGradeDescription('C+')).toBe('Average');
      expect(getGradeDescription('C')).toBe('Below Average');
      expect(getGradeDescription('D')).toBe('Poor');
      expect(getGradeDescription('F')).toBe('Fail');
    });

    it('should return default description for unknown grade', () => {
      expect(getGradeDescription('X')).toBe('Unknown');
    });
  });
});
