/**
 * Student domain feature service.
 *
 * Provides student data access and mutation methods for UI consumption.
 */

import { apiAdapter } from '../apiAdapter';
import {
  Student,
  StudentCreatePayload,
  StudentFilters,
  StudentStatus,
  StudentUpdatePayload,
} from '../../types/student';

export const studentsService = {
  async getStudents(filters?: StudentFilters): Promise<Student[]> {
    return apiAdapter.getStudents(filters);
  },

  async searchStudents(filters?: StudentFilters): Promise<Student[]> {
    return apiAdapter.searchStudents(filters);
  },

  async getStudentById(id: string): Promise<Student> {
    return apiAdapter.getStudentById(id);
  },

  async getStudentProfile(id: string): Promise<Student> {
    return apiAdapter.getStudentProfile(id);
  },

  async createStudent(payload: StudentCreatePayload): Promise<Student> {
    return apiAdapter.createStudent(payload);
  },

  async updateStudent(id: string, payload: StudentUpdatePayload): Promise<Student> {
    return apiAdapter.updateStudent(id, payload);
  },

  async updateStatus(id: string, status: StudentStatus): Promise<Student> {
    return apiAdapter.updateStudentStatus(id, status);
  },

  async deactivateStudent(id: string): Promise<Student> {
    return apiAdapter.deactivateStudent(id);
  },

  async getByClass(className: string): Promise<Student[]> {
    return apiAdapter.getStudentsByClass(className);
  },

  async getByGrade(grade: string): Promise<Student[]> {
    return apiAdapter.getStudentsByGrade(grade);
  },
};
