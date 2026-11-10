/**
 * Academic results domain type definitions and DTOs.
 */

export interface AcademicResult {
  id: string;
  studentId: string;
  studentName?: string;
  studentNumber?: string;
  subject: string;
  subjectCode?: string;
  score: number;
  maxScore?: number;
  grade?: string;
  term?: string;
  academicYear?: string;
  remarks?: string;
  recordedBy?: string;
  createdAt?: string;
}

export interface ResultCreatePayload {
  studentId: string;
  subject: string;
  score: number;
  maxScore?: number;
  term?: string;
  academicYear?: string;
  remarks?: string;
}

export interface ResultUpdatePayload extends Partial<ResultCreatePayload> {}

export interface ResultFilters {
  studentId?: string;
  subject?: string;
  term?: string;
  academicYear?: string;
  grade?: string;
}
