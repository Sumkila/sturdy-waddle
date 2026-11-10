/**
 * Subjects domain feature service.
 */

import { apiAdapter } from '../apiAdapter';
import {
  Subject,
  SubjectCreatePayload,
  SubjectFilters,
  SubjectUpdatePayload,
} from '../../types/subject';

export const subjectsService = {
  async getSubjects(filters?: SubjectFilters): Promise<Subject[]> {
    return apiAdapter.getSubjects(filters);
  },

  async getSubjectById(id: string): Promise<Subject> {
    return apiAdapter.getSubjectById(id);
  },

  async createSubject(payload: SubjectCreatePayload): Promise<Subject> {
    return apiAdapter.createSubject(payload);
  },

  async updateSubject(id: string, payload: SubjectUpdatePayload): Promise<Subject> {
    return apiAdapter.updateSubject(id, payload);
  },

  async deleteSubject(id: string): Promise<void> {
    return apiAdapter.deleteSubject(id);
  },
};
