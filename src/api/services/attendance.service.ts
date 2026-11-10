/**
 * Attendance domain feature service.
 *
 * Handles attendance registers, bulk saving, summaries, and student history.
 */

import { apiAdapter } from '../apiAdapter';
import {
  AttendanceBulkItem,
  AttendanceFilters,
  AttendanceRecord,
  AttendanceSummary,
} from '../../types/attendance';

export const attendanceService = {
  async markAttendance(studentId: string, payload: Partial<AttendanceBulkItem>): Promise<AttendanceRecord> {
    return apiAdapter.markAttendance(studentId, payload);
  },

  async getStudentAttendance(studentId: string, filters?: AttendanceFilters): Promise<AttendanceRecord[]> {
    return apiAdapter.getStudentAttendance(studentId, filters);
  },

  async getAttendanceList(filters?: AttendanceFilters): Promise<AttendanceRecord[]> {
    return apiAdapter.getAttendanceList(filters);
  },

  async getSummary(filters?: AttendanceFilters): Promise<AttendanceSummary> {
    return apiAdapter.getAttendanceSummary(filters);
  },

  async saveBulk(records: AttendanceBulkItem[]): Promise<{ count: number; success: boolean }> {
    return apiAdapter.saveAttendanceBulk(records);
  },
};
