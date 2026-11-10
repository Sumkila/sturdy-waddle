/**
 * Student Profile Page with Details, Attendance, and Results tabs.
 */

import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Edit2,
  UserX,
  Mail,
  Phone,
  MapPin,
  CalendarCheck,
  GraduationCap,
  FileText,
  UserCheck,
} from 'lucide-react';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useApiMutation } from '../../hooks/useApiMutation';
import { studentsService } from '../../api/services/students.service';
import { attendanceService } from '../../api/services/attendance.service';
import { resultsService } from '../../api/services/results.service';
import { queryClient } from '../../lib/queryClient';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';
import { RoleGuard } from '../../auth/RoleGuard';
import { useToast } from '../../components/ui/Toast';
import { formatFullName, formatStudentStatus, formatAttendanceStatus } from '../../utils/format';
import { formatDate } from '../../utils/date';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';

export const StudentProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'results'>('overview');
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);

  // Fetch student profile
  const {
    data: student,
    isLoading: loadingStudent,
    isError: errorStudent,
    error: studentError,
    refetch: refetchStudent,
  } = useApiQuery({
    queryKey: ['student', id],
    queryFn: () => studentsService.getStudentById(id!),
    enabled: Boolean(id),
  });

  // Fetch student attendance
  const { data: attendance, isLoading: loadingAttendance } = useApiQuery({
    queryKey: ['student-attendance', id],
    queryFn: () => attendanceService.getStudentAttendance(id!),
    enabled: Boolean(id && activeTab === 'attendance'),
  });

  // Fetch student results
  const { data: results, isLoading: loadingResults } = useApiQuery({
    queryKey: ['student-results', id],
    queryFn: () => resultsService.getResults({ studentId: id! }),
    enabled: Boolean(id && activeTab === 'results'),
  });

  // Deactivate mutation
  const deactivateMutation = useApiMutation({
    mutationFn: () => studentsService.deactivateStudent(id!),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['student', id] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast(`Student ${formatFullName(updated.firstName, updated.lastName)} deactivated.`, 'success');
      setIsDeactivateOpen(false);
    },
    onError: (err) => {
      toast(err.message || 'Failed to deactivate student', 'error');
    },
  });

  if (loadingStudent) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (errorStudent || !student) {
    return (
      <div className="space-y-4">
        <Link to="/students">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to Directory
          </Button>
        </Link>
        <ErrorState
          error={studentError}
          title="Student Not Found"
          message="The requested student profile could not be loaded."
          onRetry={refetchStudent}
        />
      </div>
    );
  }

  const isInactive = student.status?.toUpperCase() === 'INACTIVE';

  return (
    <div className="space-y-6">
      {/* Back button and quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link to="/students">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to Directory
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <RoleGuard capability="EDIT_STUDENT">
            <Link to={`/students/${id}/edit`}>
              <Button variant="outline" size="sm" leftIcon={<Edit2 className="w-3.5 h-3.5" />}>
                Edit Profile
              </Button>
            </Link>
          </RoleGuard>

          <RoleGuard capability="DEACTIVATE_STUDENT">
            {!isInactive && (
              <Button
                variant="danger"
                size="sm"
                leftIcon={<UserX className="w-3.5 h-3.5" />}
                onClick={() => setIsDeactivateOpen(true)}
              >
                Deactivate
              </Button>
            )}
          </RoleGuard>
        </div>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-sky-400 flex items-center justify-center font-bold text-xl uppercase shadow-xs">
            {student.firstName?.[0]}
            {student.lastName?.[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                {formatFullName(student.firstName, student.lastName)}
              </h1>
              <Badge variant={!isInactive ? 'success' : 'neutral'}>
                {formatStudentStatus(student.status)}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="font-mono">ID: {student.studentNumber}</span>
              <span aria-hidden="true">·</span>
              <span>Grade {student.grade}</span>
              <span aria-hidden="true">·</span>
              <span>Class {student.className}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{student.gender?.toLowerCase()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        {[
          { id: 'overview', label: 'General Information' },
          { id: 'attendance', label: 'Attendance History' },
          { id: 'results', label: 'Academic Results' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'overview' | 'attendance' | 'results')}
            className={`relative px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === tab.id ? 'text-sky-700' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeStudentProfileTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact & Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center gap-2.5 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-500 w-24">Email:</span>
                <span className="font-medium text-slate-900">{student.email || '—'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-500 w-24">Phone:</span>
                <span className="font-medium text-slate-900">{student.phoneNumber || '—'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-500 w-24">Address:</span>
                <span className="font-medium text-slate-900">{student.address || '—'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-500 w-24">Parent User:</span>
                <span className="font-medium text-slate-900">{student.parentUsername || 'None assigned'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Academic Enrollment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center gap-2.5 text-slate-700">
                <span className="text-slate-500 w-28">Student ID:</span>
                <span className="font-mono font-medium text-slate-900">{student.studentNumber}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <span className="text-slate-500 w-28">Assigned Grade:</span>
                <span className="font-medium text-slate-900">Grade {student.grade}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <span className="text-slate-500 w-28">Class Room:</span>
                <span className="font-medium text-slate-900">{student.className}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <span className="text-slate-500 w-28">Current Status:</span>
                <span className="font-medium text-slate-900">{formatStudentStatus(student.status)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'attendance' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Attendance Log</CardTitle>
              <p className="text-xs text-slate-500">Historical register events for this student</p>
            </div>
            <RoleGuard capability="MARK_ATTENDANCE">
              <Link to={`/attendance?className=${encodeURIComponent(student.className)}`}>
                <Button size="sm" variant="outline" leftIcon={<CalendarCheck className="w-3.5 h-3.5" />}>
                  Mark Today's Attendance
                </Button>
              </Link>
            </RoleGuard>
          </CardHeader>
          <CardContent>
            {loadingAttendance ? (
              <p className="text-xs text-slate-500 py-4">Loading attendance records...</p>
            ) : !attendance || attendance.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">No attendance entries recorded for this student.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {attendance.map((record, index) => (
                  <div key={record.id || index} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-900">{formatDate(record.date)}</span>
                      {record.remarks && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{record.remarks}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {record.recordedBy && (
                        <span className="text-[11px] text-slate-400">By: {record.recordedBy}</span>
                      )}
                      <Badge
                        variant={
                          record.status === 'PRESENT'
                            ? 'success'
                            : record.status === 'LATE'
                            ? 'warning'
                            : record.status === 'EXCUSED'
                            ? 'info'
                            : 'danger'
                        }
                      >
                        {formatAttendanceStatus(record.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'results' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Academic Results</CardTitle>
              <p className="text-xs text-slate-500">Official course grade entries and performance</p>
            </div>
            <RoleGuard capability="CREATE_RESULT">
              <Link to="/results/new">
                <Button size="sm" leftIcon={<GraduationCap className="w-3.5 h-3.5" />}>
                  Record Grade
                </Button>
              </Link>
            </RoleGuard>
          </CardHeader>
          <CardContent>
            {loadingResults ? (
              <p className="text-xs text-slate-500 py-4">Loading grade reports...</p>
            ) : !results || results.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">No grades submitted for this student yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {results.map((r) => (
                  <div key={r.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">{r.subject}</div>
                      <div className="text-[11px] text-slate-500">
                        {r.term || 'Current Term'} {r.academicYear && `· ${r.academicYear}`}
                      </div>
                      {r.remarks && <p className="text-[11px] text-slate-600 mt-0.5">{r.remarks}</p>}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900 tabular-nums">
                        {r.score} / {r.maxScore || 100}
                      </div>
                      <Badge variant={r.score >= 50 ? 'success' : 'danger'} size="sm">
                        {r.score >= 50 ? 'Passed' : 'Failed'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
        </motion.div>
      </AnimatePresence>

      {/* Deactivate confirmation dialog */}
      <ConfirmDialog
        isOpen={isDeactivateOpen}
        onClose={() => setIsDeactivateOpen(false)}
        onConfirm={() => deactivateMutation.mutate()}
        title="Deactivate Student Record"
        message={`Are you sure you want to mark ${formatFullName(
          student.firstName,
          student.lastName
        )} as INACTIVE?`}
        confirmLabel="Deactivate"
        isLoading={deactivateMutation.isPending}
      />
    </div>
  );
};
