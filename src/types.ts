/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Major {
  id: string;
  code: string;
  name: string;
  faculty: string;
  duration: number; // in years
  description: string;
  highschoolCombi: string[]; // e.g., A00, A01, D01
  cutOffScore2025: number;
  highlightPoints: string[];
}

export interface Alumnus {
  id: string;
  name: string;
  classCode: string;
  graduationYear: number;
  currentRole: string;
  company: string;
  quote: string;
  achievement: string;
  avatarUrl: string;
}

export interface NewsEvent {
  id: string;
  title: string;
  date: string;
  category: "news" | "event" | "notice";
  categoryLabel: string;
  summary: string;
  content: string;
  imageUrl: string;
  views: number;
}

export interface SubjectGrade {
  code: string;
  name: string;
  credits: number;
  componentScore: number; // 30% or 40%
  examScore: number; // 60% or 70%
  finalScore: number; // 10-scale
  letterGrade: string; // A+, A, B, etc.
}

export interface SemesterGrades {
  semesterName: string;
  semesterGPA: number;
  semesterCredits: number;
  subjects: SubjectGrade[];
}

export interface StudentProfile {
  id: string; // MSSV
  fullName: string;
  birthDate: string;
  gender: string;
  major: string;
  faculty: string;
  classCode: string;
  cohort: string; // e.g., K22
  cumulativeGPA: number; // 4.0 scale
  cumulativeGPA10: number; // 10.0 scale
  totalCreditsEarned: number;
  semesters: SemesterGrades[];
}
