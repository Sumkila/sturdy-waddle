/**
 * Parents domain feature service.
 */

import { apiAdapter } from '../apiAdapter';
import {
  Parent,
  ParentCreatePayload,
  ParentFilters,
  ParentUpdatePayload,
} from '../../types/parent';

export const parentsService = {
  async getParents(filters?: ParentFilters): Promise<Parent[]> {
    return apiAdapter.getParents(filters);
  },

  async getParentById(id: string): Promise<Parent> {
    return apiAdapter.getParentById(id);
  },

  async findByEmail(email: string): Promise<Parent> {
    return apiAdapter.findParentByEmail(email);
  },

  async findByPhone(phone: string): Promise<Parent> {
    return apiAdapter.findParentByPhone(phone);
  },

  async createParent(payload: ParentCreatePayload): Promise<Parent> {
    return apiAdapter.createParent(payload);
  },

  async updateParent(id: string, payload: ParentUpdatePayload): Promise<Parent> {
    return apiAdapter.updateParent(id, payload);
  },

  async deleteParent(id: string): Promise<void> {
    return apiAdapter.deleteParent(id);
  },
};
