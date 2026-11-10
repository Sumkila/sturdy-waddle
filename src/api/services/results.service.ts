/**
 * Academic results domain feature service.
 */

import { apiAdapter } from '../apiAdapter';
import {
  AcademicResult,
  ResultCreatePayload,
  ResultFilters,
  ResultUpdatePayload,
} from '../../types/result';

export const resultsService = {
  async getResults(filters?: ResultFilters): Promise<AcademicResult[]> {
    return apiAdapter.getResults(filters);
  },

  async getResultById(id: string): Promise<AcademicResult> {
    return apiAdapter.getResultById(id);
  },

  async createResult(payload: ResultCreatePayload): Promise<AcademicResult> {
    return apiAdapter.createResult(payload);
  },

  async updateResult(id: string, payload: ResultUpdatePayload): Promise<AcademicResult> {
    return apiAdapter.updateResult(id, payload);
  },

  async deleteResult(id: string): Promise<void> {
    return apiAdapter.deleteResult(id);
  },
};
