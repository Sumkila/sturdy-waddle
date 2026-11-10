/**
 * Attendance domain type definitions and DTOs.
 */

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface AttendanceRecord {
  id?: string;
  studentId: string;
  studentName?: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
  recordedBy?: string;
  className?: string;
  grade?: string;
  createdAt?: string;
}

export interface AttendanceBulkItem {
  studentId: string;
  date: string;
  status: AttendanceStatus;
  remarks?: string;
  recordedBy?: string;
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  attendanceRate: number; // percentage (0-100)
}

export interface AttendanceFilters {
  studentId?: string;
  className?: string;
  grade?: string;
  startDate?: string;
  endDate?: string;
  date?: string;
  status?: AttendanceStatus;
}
