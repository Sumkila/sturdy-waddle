/**
 * Subject domain type definitions and DTOs.
 */

export interface Subject {
  id: string;
  subjectCode: string;
  subjectName: string;
  grade: string;
  teacher?: string;
  teacherId?: number;
  description?: string;
  credits?: number;
  createdAt?: string;
}

export interface SubjectCreatePayload {
  subjectCode: string;
  subjectName: string;
  grade: string;
  teacherId?: number;
  description?: string;
}

export interface SubjectUpdatePayload extends Partial<SubjectCreatePayload> {}

export interface SubjectFilters {
  grade?: string;
  teacher?: string;
  search?: string;
}
