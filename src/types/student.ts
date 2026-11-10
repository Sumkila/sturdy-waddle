/**
 * Student domain type definitions and DTOs.
 */

export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TRANSFERRED' | 'GRADUATED';
export type StudentGender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Student {
  id: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  grade: string;
  className: string;
  gender: StudentGender | string;
  phoneNumber?: string;
  address?: string;
  parentUsername?: string;
  status: StudentStatus | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentCreatePayload {
  firstName: string;
  lastName: string;
  email: string;
  studentNumber: string;
  grade: string;
  className: string;
  gender: StudentGender | string;
  phoneNumber?: string;
  address?: string;
  parentUsername?: string;
  status?: StudentStatus | string;
}

export interface StudentUpdatePayload extends Partial<StudentCreatePayload> {}

export interface StudentFilters {
  name?: string;
  grade?: string;
  className?: string;
  gender?: string;
  studentNumber?: string;
  status?: string;
  page?: number;
  limit?: number;
}
