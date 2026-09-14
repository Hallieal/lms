import type { Announcement, Assignment, Course, CourseModule } from './types';

export const courses: Course[] = [
  { id: 'econometrics', code: 'MAE 202', title: 'Econometrics II', professor: 'Elena Tuzhilina', color: '#2f6f9f', progress: 62, students: 74 },
  { id: 'micro', code: 'MAE 204', title: 'Microeconomics II', professor: 'NES Faculty', color: '#9a5c44', progress: 48, students: 71 },
  { id: 'algorithms', code: 'DATA 210', title: 'Algorithms', professor: 'Course Staff', color: '#467b63', progress: 74, students: 52 },
  { id: 'trade', code: 'MAE 216', title: 'International Trade', professor: 'NES Faculty', color: '#745d9d', progress: 35, students: 63 },
];

export const assignments: Assignment[] = [
  { id: '1', title: 'Problem Set 3: Instrumental Variables', course: 'Econometrics II', courseId: 'econometrics', due: 'Sep 18 · 23:59', points: 20, status: 'open', submitted: 59, graded: 18, total: 74 },
  { id: '2', title: 'Problem Set 2: General Equilibrium', course: 'Microeconomics II', courseId: 'micro', due: 'Sep 20 · 23:59', points: 15, status: 'open', submitted: 41, graded: 8, total: 71 },
  { id: '3', title: 'Sorting and Two Pointers', course: 'Algorithms', courseId: 'algorithms', due: 'Sep 22 · 19:00', points: 10, status: 'submitted', submitted: 47, graded: 26, total: 52 },
  { id: '4', title: 'Trade Model Replication', course: 'International Trade', courseId: 'trade', due: 'Sep 27 · 23:59', points: 25, status: 'open', submitted: 21, graded: 0, total: 63 },
  { id: '5', title: 'Problem Set 2: Panel Data', course: 'Econometrics II', courseId: 'econometrics', due: 'Sep 11 · 23:59', points: 20, status: 'graded', submitted: 73, graded: 73, total: 74 },
];

export const modules: Record<string, CourseModule[]> = {
  econometrics: [
    { id: '01', title: 'Review and asymptotics', subtitle: 'Week 1', resources: [{ title: 'Lecture notes', kind: 'PDF' }, { title: 'Recitation problems', kind: 'PDF' }, { title: 'review.csv', kind: 'DATA' }] },
    { id: '02', title: 'Instrumental variables', subtitle: 'Weeks 2–3', resources: [{ title: 'IV estimation', kind: 'SLIDES' }, { title: 'Weak instruments notes', kind: 'PDF' }, { title: 'Problem Set 3', kind: 'ASSIGNMENT' }] },
    { id: '03', title: 'Panel data', subtitle: 'Week 4', resources: [{ title: 'Fixed and random effects', kind: 'SLIDES' }, { title: 'Replication notebook', kind: 'CODE' }] },
  ],
  micro: [
    { id: '01', title: 'General equilibrium', subtitle: 'Weeks 1–2', resources: [{ title: 'Lecture notes', kind: 'PDF' }, { title: 'Exercises', kind: 'PDF' }] },
    { id: '02', title: 'Welfare and efficiency', subtitle: 'Week 3', resources: [{ title: 'Lecture slides', kind: 'SLIDES' }, { title: 'Problem Set 2', kind: 'ASSIGNMENT' }] },
  ],
  algorithms: [
    { id: '01', title: 'Sorting', subtitle: 'Week 1', resources: [{ title: 'Sorting handbook', kind: 'WEB' }, { title: 'Seminar slides', kind: 'PDF' }, { title: 'Practice set', kind: 'ASSIGNMENT' }] },
    { id: '02', title: 'Two pointers', subtitle: 'Week 2', resources: [{ title: 'Technique notes', kind: 'WEB' }, { title: 'Problems', kind: 'ASSIGNMENT' }] },
  ],
  trade: [
    { id: '01', title: 'Ricardian trade', subtitle: 'Week 1', resources: [{ title: 'Lecture 1', kind: 'SLIDES' }, { title: 'Reading', kind: 'PDF' }] },
    { id: '02', title: 'Gravity models', subtitle: 'Weeks 2–3', resources: [{ title: 'Lecture notes', kind: 'PDF' }, { title: 'Replication task', kind: 'ASSIGNMENT' }] },
  ],
};

export const announcements: Announcement[] = [
  { course: 'Econometrics II', title: 'Office hours moved to Friday', text: 'This week only, office hours will be held Friday at 15:00 in room 403.', time: '2 hours ago' },
  { course: 'Algorithms', title: 'Seminar materials are available', text: 'Slides and Python solutions from the sorting seminar have been uploaded.', time: 'Yesterday' },
  { course: 'International Trade', title: 'Reading for next week', text: 'Please read the selected sections before Tuesday’s lecture.', time: 'Sep 12' },
];

export const gradeRows = [
  ['Econometrics II', 'Problem Set 1', '19/20', '95%'],
  ['Econometrics II', 'Problem Set 2', '18.5/20', '92.5%'],
  ['Microeconomics II', 'Problem Set 1', '14/15', '93.3%'],
  ['Algorithms', 'Sorting quiz', '10/10', '100%'],
  ['International Trade', 'Problem Set 1', '—', 'Pending'],
] as const;
