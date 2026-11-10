/**
 * Teacher domain type definitions and DTOs.
 */

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  employeeNumber: string;
  department: string;
  phoneNumber?: string;
  email: string;
  specialization?: string;
  status?: string;
  createdAt?: string;
}

export interface TeacherCreatePayload {
  firstName: string;
  lastName: string;
  employeeNumber: string;
  department: string;
  phoneNumber?: string;
  email: string;
  specialization?: string;
}

export interface TeacherUpdatePayload extends Partial<TeacherCreatePayload> {}

export interface TeacherFilters {
  department?: string;
  search?: string;
}
