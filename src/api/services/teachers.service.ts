/**
 * Teachers domain feature service.
 */

import { apiAdapter } from '../apiAdapter';
import {
  Teacher,
  TeacherCreatePayload,
  TeacherFilters,
  TeacherUpdatePayload,
} from '../../types/teacher';

export const teachersService = {
  async getTeachers(filters?: TeacherFilters): Promise<Teacher[]> {
    return apiAdapter.getTeachers(filters);
  },

  async getTeacherById(id: string): Promise<Teacher> {
    return apiAdapter.getTeacherById(id);
  },

  async createTeacher(payload: TeacherCreatePayload): Promise<Teacher> {
    return apiAdapter.createTeacher(payload);
  },

  async updateTeacher(id: string, payload: TeacherUpdatePayload): Promise<Teacher> {
    return apiAdapter.updateTeacher(id, payload);
  },

  async deleteTeacher(id: string): Promise<void> {
    return apiAdapter.deleteTeacher(id);
  },
};
