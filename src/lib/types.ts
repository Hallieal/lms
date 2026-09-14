export type Role = 'student' | 'ta' | 'instructor';

export type Course = {
  id: string;
  code: string;
  title: string;
  professor: string;
  color: string;
  progress: number;
  students: number;
};

export type AssignmentStatus = 'open' | 'submitted' | 'graded' | 'late';

export type Assignment = {
  id: number;
  title: string;
  course: string;
  courseId: string;
  due: string;
  points: number;
  status: AssignmentStatus;
  submitted: number;
  graded: number;
  total: number;
};

export type CourseModule = {
  id: string;
  title: string;
  subtitle: string;
  resources: Array<{
    title: string;
    kind: 'PDF' | 'SLIDES' | 'DATA' | 'CODE' | 'WEB' | 'ASSIGNMENT';
  }>;
};
