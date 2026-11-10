/**
 * Daily Attendance Register Page.
 *
 * Provides:
 * - Classroom and Date pickers
 * - Status toggle buttons for each student (Present, Absent, Late, Excused)
 * - Optional remarks input
 * - "Mark All Present" batch shortcut
 * - Bulk attendance submission
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  Save,
  BarChart2,
  CheckCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useApiMutation } from '../../hooks/useApiMutation';
import { studentsService } from '../../api/services/students.service';
import { attendanceService } from '../../api/services/attendance.service';
import { queryClient } from '../../lib/queryClient';
import { useAuth } from '../../auth/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { toIsoDateString, formatDate } from '../../utils/date';
import { formatFullName } from '../../utils/format';
import { AttendanceBulkItem, AttendanceStatus } from '../../types/attendance';

export const AttendanceRegisterPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const initialClass = searchParams.get('className') || '';
  const initialDate = searchParams.get('date') || toIsoDateString(new Date());

  const [selectedClass, setSelectedClass] = useState<string>(initialClass);
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);

  // Local draft records: studentId -> { status, remarks }
  const [attendanceDraft, setAttendanceDraft] = useState<
    Record<string, { status: AttendanceStatus; remarks: string }>
  >({});

  // Query all students to extract classes and populate register
  const { data: allStudents, isLoading: loadingStudents } = useApiQuery({
    queryKey: ['students'],
    queryFn: () => studentsService.getStudents(),
  });

  const availableClasses = useMemo(() => {
    if (!allStudents) return [];
    const set = new Set<string>();
    allStudents.forEach((s) => {
      if (s.className) set.add(s.className);
    });
    return Array.from(set).sort();
  }, [allStudents]);

  // Set default class if not specified
  useEffect(() => {
    if (!selectedClass && availableClasses.length > 0) {
      setSelectedClass(availableClasses[0]);
    }
  }, [selectedClass, availableClasses]);

  // Students in selected class
  const classStudents = useMemo(() => {
    if (!allStudents || !selectedClass) return [];
    return allStudents.filter(
      (s) => s.className === selectedClass && s.status?.toUpperCase() !== 'INACTIVE'
    );
  }, [allStudents, selectedClass]);

  // Query existing attendance records for this class & date
  const { data: existingAttendance } = useApiQuery({
    queryKey: ['class-attendance', selectedClass, selectedDate],
    queryFn: () => attendanceService.getAttendanceList({ className: selectedClass, date: selectedDate }),
    enabled: Boolean(selectedClass && selectedDate),
  });

  // Populate draft state when students or existing records change
  useEffect(() => {
    if (classStudents.length === 0) return;

    const initialMap: Record<string, { status: AttendanceStatus; remarks: string }> = {};

    classStudents.forEach((student) => {
      const match = (existingAttendance || []).find((a) => a.studentId === student.id);
      if (match) {
        initialMap[student.id] = {
          status: match.status,
          remarks: match.remarks || '',
        };
      } else {
        // Default to PRESENT
        initialMap[student.id] = {
          status: 'PRESENT',
          remarks: '',
        };
      }
    });

    setAttendanceDraft(initialMap);
  }, [classStudents, existingAttendance]);

  // Save bulk mutation
  const saveBulkMutation = useApiMutation({
    mutationFn: (payload: AttendanceBulkItem[]) => attendanceService.saveBulk(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-summary'] });
      queryClient.invalidateQueries({ queryKey: ['student-attendance'] });
      toast(`Attendance for ${selectedClass} saved successfully!`, 'success');
    },
    onError: (err) => {
      toast(err.message || 'Failed to save attendance records', 'error');
    },
  });

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceDraft((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceDraft((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const markAll = (status: AttendanceStatus) => {
    setAttendanceDraft((prev) => {
      const updated = { ...prev };
      classStudents.forEach((s) => {
        updated[s.id] = {
          ...updated[s.id],
          status,
        };
      });
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const records: AttendanceBulkItem[] = classStudents.map((s) => {
      const draft = attendanceDraft[s.id] || { status: 'PRESENT', remarks: '' };
      return {
        studentId: s.id,
        date: selectedDate,
        status: draft.status,
        remarks: draft.remarks || undefined,
        recordedBy: user?.username || 'Staff',
      };
    });

    saveBulkMutation.mutate(records);
  };

  // Metrics preview for today's register
  const metrics = useMemo(() => {
    let p = 0,
      a = 0,
      l = 0,
      ex = 0;
    Object.values(attendanceDraft).forEach((item) => {
      if (item.status === 'PRESENT') p++;
      else if (item.status === 'ABSENT') a++;
      else if (item.status === 'LATE') l++;
      else if (item.status === 'EXCUSED') ex++;
    });
    return { p, a, l, ex, total: classStudents.length };
  }, [attendanceDraft, classStudents]);

  return (
    <div className="space-y-6">
      {/* Title & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Daily Attendance Register
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record student presence, tardiness, and verified excused absences
          </p>
        </div>

        <Link to="/attendance/summary">
          <Button variant="outline" size="sm" leftIcon={<BarChart2 className="w-3.5 h-3.5" />}>
            Attendance Statistics
          </Button>
        </Link>
      </div>

      {/* Classroom and Date Filter Controls */}
      <Card padding="sm" className="bg-slate-50/80">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label htmlFor="selectClass" className="block text-xs font-medium text-slate-700 mb-1">
              Classroom Group
            </label>
            <Select
              id="selectClass"
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSearchParams({ className: e.target.value, date: selectedDate });
              }}
            >
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor="selectDate" className="block text-xs font-medium text-slate-700 mb-1">
              Register Date
            </label>
            <Input
              id="selectDate"
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSearchParams({ className: selectedClass, date: e.target.value });
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => markAll('PRESENT')}
              leftIcon={<CheckCheck className="w-3.5 h-3.5 text-emerald-600" />}
              className="text-xs w-full"
            >
              Mark All Present
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Summary Pill Bar */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
        <span className="font-semibold text-slate-800">Register Summary:</span>
        <span className="tabular-nums">Total: {metrics.total}</span>
        <span aria-hidden="true">·</span>
        <span className="text-emerald-700 font-medium tabular-nums">Present: {metrics.p}</span>
        <span aria-hidden="true">·</span>
        <span className="text-rose-700 font-medium tabular-nums">Absent: {metrics.a}</span>
        <span aria-hidden="true">·</span>
        <span className="text-amber-700 font-medium tabular-nums">Late: {metrics.l}</span>
        <span aria-hidden="true">·</span>
        <span className="text-sky-700 font-medium tabular-nums">Excused: {metrics.ex}</span>
      </div>

      {/* Roster Table */}
      {loadingStudents ? (
        <div className="py-12 text-center text-xs text-slate-500">Loading student roster...</div>
      ) : classStudents.length === 0 ? (
        <Card className="py-12 text-center">
          <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-900">No active students in {selectedClass}</h3>
          <p className="text-xs text-slate-500 mt-1">Please select another class or enroll students.</p>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-4 py-3">Student Name</th>
                  <th scope="col" className="px-4 py-3">Student #</th>
                  <th scope="col" className="px-4 py-3 text-center">Status</th>
                  <th scope="col" className="px-4 py-3">Remarks / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.map((student) => {
                  const current = attendanceDraft[student.id] || {
                    status: 'PRESENT',
                    remarks: '',
                  };

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">
                          {formatFullName(student.firstName, student.lastName)}
                        </div>
                        <div className="text-[11px] text-slate-500">{student.email}</div>
                      </td>

                      <td className="px-4 py-3 font-mono text-slate-700">
                        {student.studentNumber}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => handleStatusChange(student.id, 'PRESENT')}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                              current.status === 'PRESENT'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                            }`}
                          >
                            Present
                          </motion.button>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => handleStatusChange(student.id, 'LATE')}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                              current.status === 'LATE'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                            }`}
                          >
                            Late
                          </motion.button>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => handleStatusChange(student.id, 'ABSENT')}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                              current.status === 'ABSENT'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                            }`}
                          >
                            Absent
                          </motion.button>
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.94 }}
                            onClick={() => handleStatusChange(student.id, 'EXCUSED')}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                              current.status === 'EXCUSED'
                                ? 'bg-sky-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                            }`}
                          >
                            Excused
                          </motion.button>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <Input
                          placeholder="Optional notes (e.g. Doctor note, bus delay)"
                          value={current.remarks}
                          onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                          className="h-8 text-xs"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Submit action */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500">
              Saving register for <span className="font-semibold text-slate-800">{selectedClass}</span> on{' '}
              <span className="font-semibold text-slate-800">{formatDate(selectedDate)}</span>
            </div>
            <Button
              type="submit"
              isLoading={saveBulkMutation.isPending}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Attendance Register
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
