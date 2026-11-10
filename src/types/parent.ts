/**
 * Parent / Guardian domain type definitions and DTOs.
 */

export interface Parent {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  address?: string;
  relationship?: string;
  studentIds?: string[];
  studentNames?: string[];
  createdAt?: string;
}

export interface ParentCreatePayload {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  address?: string;
  relationship?: string;
}

export interface ParentUpdatePayload extends Partial<ParentCreatePayload> {}

export interface ParentFilters {
  search?: string;
  email?: string;
  phone?: string;
}
