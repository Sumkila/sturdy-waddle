/**
 * Primary Integration Adapter.
 *
 * All API interactions funnel through this adapter. It translates frontend domain
 * types to backend endpoint contracts and normalizes incoming data structures.
 *
 * To connect a completely different backend (e.g. Django, Express, ASP.NET),
 * update this adapter and the endpoints configuration without touching UI components.
 */

import { httpClient, RequestOptions } from './httpClient';
import { endpoints } from './endpoints';
import { buildQueryString } from '../utils/url';
import {
  AuthResponse,
  LoginCredentials,
  RegisterPayload,
} from '../types/auth';
import {
  Student,
  StudentCreatePayload,
  StudentFilters,
  StudentStatus,
  StudentUpdatePayload,
} from '../types/student';
import {
  AttendanceBulkItem,
  AttendanceFilters,
  AttendanceRecord,
  AttendanceSummary,
} from '../types/attendance';
import {
  AcademicResult,
  ResultCreatePayload,
  ResultFilters,
  ResultUpdatePayload,
} from '../types/result';
import {
  Subject,
  SubjectCreatePayload,
  SubjectFilters,
  SubjectUpdatePayload,
} from '../types/subject';
import {
  Teacher,
  TeacherCreatePayload,
  TeacherFilters,
  TeacherUpdatePayload,
} from '../types/teacher';
import {
  Parent,
  ParentCreatePayload,
  ParentFilters,
  ParentUpdatePayload,
} from '../types/parent';
import { PaginatedResponse } from '../types/api';

/**
 * Normalizes array or paginated responses into a consistent array format
 */
function normalizeList<T>(response: unknown): T[] {
  if (Array.isArray(response)) {
    return response as T[];
  }
  if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as { data: unknown }).data)) {
    return (response as { data: T[] }).data;
  }
  if (response && typeof response === 'object' && 'content' in response && Array.isArray((response as { content: unknown }).content)) {
    // Spring Boot Page<T> format
    return (response as { content: T[] }).content;
  }
  return [];
}

export const apiAdapter = {
  // --- AUTHENTICATION ---

  async login(credentials: LoginCredentials, options?: RequestOptions): Promise<AuthResponse> {
    return httpClient.post<AuthResponse>(endpoints.auth.login, credentials, options);
  },

  async register(payload: RegisterPayload, options?: RequestOptions): Promise<AuthResponse> {
    return httpClient.post<AuthResponse>(endpoints.auth.register, payload, options);
  },

  // --- STUDENTS ---

  async getStudents(filters?: StudentFilters, options?: RequestOptions): Promise<Student[]> {
    const query = buildQueryString(filters as Record<string, string | number | boolean | undefined>);
    const response = await httpClient.get<unknown>(`${endpoints.students.list}${query}`, options);
    return normalizeList<Student>(response);
  },

  async searchStudents(filters?: StudentFilters, options?: RequestOptions): Promise<Student[]> {
    const query = buildQueryString(filters as Record<string, string | number | boolean | undefined>);
    const response = await httpClient.get<unknown>(`${endpoints.students.search}${query}`, options);
    return normalizeList<Student>(response);
  },

  async getStudentById(id: string, options?: RequestOptions): Promise<Student> {
    return httpClient.get<Student>(endpoints.students.byId(id), options);
  },

  async getStudentProfile(id: string, options?: RequestOptions): Promise<Student> {
    return httpClient.get<Student>(endpoints.students.profile(id), options);
  },

  async createStudent(payload: StudentCreatePayload, options?: RequestOptions): Promise<Student> {
    return httpClient.post<Student>(endpoints.students.create, payload, options);
  },

  async updateStudent(id: string, payload: StudentUpdatePayload, options?: RequestOptions): Promise<Student> {
    return httpClient.put<Student>(endpoints.students.update(id), payload, options);
  },

  async updateStudentStatus(id: string, status: StudentStatus, options?: RequestOptions): Promise<Student> {
    return httpClient.patch<Student>(endpoints.students.updateStatus(id), { status }, options);
  },

  async deactivateStudent(id: string, options?: RequestOptions): Promise<Student> {
    return httpClient.patch<Student>(endpoints.students.updateStatus(id), { status: 'INACTIVE' }, options);
  },

  async getStudentsByClass(className: string, options?: RequestOptions): Promise<Student[]> {
    const response = await httpClient.get<unknown>(endpoints.students.byClass(className), options);
    return normalizeList<Student>(response);
  },

  async getStudentsByGrade(grade: string, options?: RequestOptions): Promise<Student[]> {
    const response = await httpClient.get<unknown>(endpoints.students.byGrade(grade), options);
    return normalizeList<Student>(response);
  },

  // --- ATTENDANCE ---
  // Notice: all attendance endpoints in the reference backend are rooted at /students/attendance/*

  async markAttendance(studentId: string, payload: Partial<AttendanceBulkItem>, options?: RequestOptions): Promise<AttendanceRecord> {
    return httpClient.post<AttendanceRecord>(endpoints.students.attendance(studentId), payload, options);
  },

  async getStudentAttendance(studentId: string, filters?: AttendanceFilters, options?: RequestOptions): Promise<AttendanceRecord[]> {
    const query = buildQueryString(filters as Record<string, string | number | boolean | undefined>);
    const response = await httpClient.get<unknown>(`${endpoints.students.attendance(studentId)}${query}`, options);
    return normalizeList<AttendanceRecord>(response);
  },

  async getAttendanceList(filters?: AttendanceFilters, options?: RequestOptions): Promise<AttendanceRecord[]> {
    const query = buildQueryString(filters as Record<string, string | number | boolean | undefined>);
    const response = await httpClient.get<unknown>(`${endpoints.students.attendanceList}${query}`, options);
    return normalizeList<AttendanceRecord>(response);
  },

  async getAttendanceSummary(filters?: AttendanceFilters, options?: RequestOptions): Promise<AttendanceSummary> {
    const query = buildQueryString(filters as Record<string, string | number | boolean | undefined>);
    const res = await httpClient.get<AttendanceSummary>(`${endpoints.students.attendanceSummary}${query}`, options);
    return {
      present: res.present ?? 0,
      absent: res.absent ?? 0,
      late: res.late ?? 0,
      excused: res.excused ?? 0,
      total: res.total ?? (res.present + res.absent + res.late + res.excused),
      attendanceRate: res.attendanceRate ?? (res.total ? Math.round((res.present / res.total) * 100) : 0),
    };
  },

  async saveAttendanceBulk(records: AttendanceBulkItem[], options?: RequestOptions): Promise<{ count: number; success: boolean }> {
    return httpClient.post<{ count: number; success: boolean }>(endpoints.students.attendanceBulk, records, options);
  },

  // --- RESULTS ---

  async getResults(filters?: ResultFilters, options?: RequestOptions): Promise<AcademicResult[]> {
    const query = buildQueryString(filters as Record<string, string | number | boolean | undefined>);
    const response = await httpClient.get<unknown>(`${endpoints.results.list}${query}`, options);
    return normalizeList<AcademicResult>(response);
  },

  async getResultById(id: string, options?: RequestOptions): Promise<AcademicResult> {
    return httpClient.get<AcademicResult>(endpoints.results.byId(id), options);
  },

  async createResult(payload: ResultCreatePayload, options?: RequestOptions): Promise<AcademicResult> {
    return httpClient.post<AcademicResult>(endpoints.results.create, payload, options);
  },

  async updateResult(id: string, payload: ResultUpdatePayload, options?: RequestOptions): Promise<AcademicResult> {
    return httpClient.put<AcademicResult>(endpoints.results.update(id), payload, options);
  },

  async deleteResult(id: string, options?: RequestOptions): Promise<void> {
    return httpClient.delete<void>(endpoints.results.delete(id), options);
  },

  // --- SUBJECTS ---

  async getSubjects(filters?: SubjectFilters, options?: RequestOptions): Promise<Subject[]> {
    const query = buildQueryString(filters as Record<string, string | number | boolean | undefined>);
    const response = await httpClient.get<unknown>(`${endpoints.subjects.list}${query}`, options);
    return normalizeList<Subject>(response);
  },

  async getSubjectById(id: string, options?: RequestOptions): Promise<Subject> {
    return httpClient.get<Subject>(endpoints.subjects.byId(id), options);
  },

  async createSubject(payload: SubjectCreatePayload, options?: RequestOptions): Promise<Subject> {
    return httpClient.post<Subject>(endpoints.subjects.create, payload, options);
  },

  async updateSubject(id: string, payload: SubjectUpdatePayload, options?: RequestOptions): Promise<Subject> {
    return httpClient.put<Subject>(endpoints.subjects.update(id), payload, options);
  },

  async deleteSubject(id: string, options?: RequestOptions): Promise<void> {
    return httpClient.delete<void>(endpoints.subjects.delete(id), options);
  },

  // --- TEACHERS ---

  async getTeachers(filters?: TeacherFilters, options?: RequestOptions): Promise<Teacher[]> {
    const query = buildQueryString(filters as Record<string, string | number | boolean | undefined>);
    const response = await httpClient.get<unknown>(`${endpoints.teachers.list}${query}`, options);
    return normalizeList<Teacher>(response);
  },

  async getTeacherById(id: string, options?: RequestOptions): Promise<Teacher> {
    return httpClient.get<Teacher>(endpoints.teachers.byId(id), options);
  },

  async createTeacher(payload: TeacherCreatePayload, options?: RequestOptions): Promise<Teacher> {
    return httpClient.post<Teacher>(endpoints.teachers.create, payload, options);
  },

  async updateTeacher(id: string, payload: TeacherUpdatePayload, options?: RequestOptions): Promise<Teacher> {
    return httpClient.put<Teacher>(endpoints.teachers.update(id), payload, options);
  },

  async deleteTeacher(id: string, options?: RequestOptions): Promise<void> {
    return httpClient.delete<void>(endpoints.teachers.delete(id), options);
  },

  // --- PARENTS ---

  async getParents(filters?: ParentFilters, options?: RequestOptions): Promise<Parent[]> {
    const query = buildQueryString(filters as Record<string, string | number | boolean | undefined>);
    const response = await httpClient.get<unknown>(`${endpoints.parents.list}${query}`, options);
    return normalizeList<Parent>(response);
  },

  async getParentById(id: string, options?: RequestOptions): Promise<Parent> {
    return httpClient.get<Parent>(endpoints.parents.byId(id), options);
  },

  async findParentByEmail(email: string, options?: RequestOptions): Promise<Parent> {
    return httpClient.get<Parent>(endpoints.parents.byEmail(email), options);
  },

  async findParentByPhone(phone: string, options?: RequestOptions): Promise<Parent> {
    return httpClient.get<Parent>(endpoints.parents.byPhone(phone), options);
  },

  async createParent(payload: ParentCreatePayload, options?: RequestOptions): Promise<Parent> {
    return httpClient.post<Parent>(endpoints.parents.create, payload, options);
  },

  async updateParent(id: string, payload: ParentUpdatePayload, options?: RequestOptions): Promise<Parent> {
    return httpClient.put<Parent>(endpoints.parents.update(id), payload, options);
  },

  async deleteParent(id: string, options?: RequestOptions): Promise<void> {
    return httpClient.delete<void>(endpoints.parents.delete(id), options);
  },
};
