/**
 * Parent / Guardian Dashboard.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, CalendarCheck, GraduationCap, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { useApiQuery } from '../../hooks/useApiQuery';
import { studentsService } from '../../api/services/students.service';
import { attendanceService } from '../../api/services/attendance.service';
import { resultsService } from '../../api/services/results.service';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { StatCard } from '../../components/feedback/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { formatFullName, formatPercentage, formatAttendanceStatus } from '../../utils/format';
import { formatDate } from '../../utils/date';

export const ParentDashboard: React.FC = () => {
  const { user } = useAuth();

  // Load students linked to this parent (matched by parentUsername or all children)
  const { data: allStudents, isLoading: loadingStudents } = useApiQuery({
    queryKey: ['students'],
    queryFn: () => studentsService.getStudents(),
  });

  const children = React.useMemo(() => {
    if (!allStudents || allStudents.length === 0) return [];
    if (user?.username) {
      const matched = allStudents.filter(
        (s) => s.parentUsername?.toLowerCase() === user.username.toLowerCase()
      );
      if (matched.length > 0) return matched;
    }
    // Fallback: show first student or all students for demonstration
    return allStudents.slice(0, 2);
  }, [allStudents, user]);

  const [selectedChildId, setSelectedChildId] = useState<string>('');

  // Auto-select first child once loaded
  const activeChild = children.find((c) => c.id === selectedChildId) || children[0];

  // Query child's attendance
  const { data: childAttendance, isLoading: loadingAttendance } = useApiQuery({
    queryKey: ['student-attendance', activeChild?.id],
    queryFn: () => (activeChild ? attendanceService.getStudentAttendance(activeChild.id) : Promise.resolve([])),
    enabled: Boolean(activeChild?.id),
  });

  // Query child's results
  const { data: childResults, isLoading: loadingResults } = useApiQuery({
    queryKey: ['student-results', activeChild?.id],
    queryFn: () => (activeChild ? resultsService.getResults({ studentId: activeChild.id }) : Promise.resolve([])),
    enabled: Boolean(activeChild?.id),
  });

  // Calculate attendance rate for active child
  const totalDays = childAttendance?.length ?? 0;
  const presentDays = childAttendance?.filter((a) => a.status === 'PRESENT').length ?? 0;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header and Child Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Parent & Guardian Portal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor attendance, academic performance, and announcements
          </p>
        </div>

        {children.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Viewing Child:</span>
            <div className="w-48">
              <Select
                value={activeChild?.id || ''}
                onChange={(e) => setSelectedChildId(e.target.value)}
              >
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {formatFullName(c.firstName, c.lastName)} ({c.className})
                  </option>
                ))}
              </Select>
            </div>
          </div>
        )}
      </div>

      {activeChild ? (
        <>
          {/* Active Child Overview Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-base">
                {activeChild.firstName?.[0]}
                {activeChild.lastName?.[0]}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {formatFullName(activeChild.firstName, activeChild.lastName)}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Student ID: {activeChild.studentNumber}</span>
                  <span aria-hidden="true">·</span>
                  <span>Grade: {activeChild.grade}</span>
                  <span aria-hidden="true">·</span>
                  <span>Class: {activeChild.className}</span>
                </div>
              </div>
            </div>

            <Link to={`/students/${activeChild.id}`}>
              <Badge variant="outline">Full Profile</Badge>
            </Link>
          </div>

          {/* KPI Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Attendance Rate"
              value={formatPercentage(attendanceRate)}
              subtext={`${presentDays} of ${totalDays} sessions attended`}
              icon={<CalendarCheck className="w-5 h-5" />}
            />
            <StatCard
              label="Completed Courses"
              value={childResults?.length ?? 0}
              subtext="Assessed subjects"
              icon={<GraduationCap className="w-5 h-5" />}
            />
            <StatCard
              label="Student Status"
              value={activeChild.status || 'ACTIVE'}
              subtext="Enrollment status"
              icon={<CheckCircle2 className="w-5 h-5" />}
            />
          </div>

          {/* Attendance History and Recent Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Register */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Recent Attendance</CardTitle>
                <Link to="/attendance" className="text-xs font-semibold text-sky-700 hover:text-sky-800">
                  View Full History
                </Link>
              </CardHeader>
              <CardContent>
                {loadingAttendance ? (
                  <p className="text-xs text-slate-500 py-4">Loading attendance...</p>
                ) : !childAttendance || childAttendance.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No attendance logged yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {childAttendance.slice(0, 5).map((att, i) => (
                      <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-medium text-slate-900">{formatDate(att.date)}</div>
                          {att.remarks && <div className="text-[11px] text-slate-500">{att.remarks}</div>}
                        </div>
                        <Badge
                          variant={
                            att.status === 'PRESENT'
                              ? 'success'
                              : att.status === 'LATE'
                              ? 'warning'
                              : att.status === 'EXCUSED'
                              ? 'info'
                              : 'danger'
                          }
                        >
                          {formatAttendanceStatus(att.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Overview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Academic Results</CardTitle>
                <Link to="/results" className="text-xs font-semibold text-sky-700 hover:text-sky-800">
                  Report Card
                </Link>
              </CardHeader>
              <CardContent>
                {loadingResults ? (
                  <p className="text-xs text-slate-500 py-4">Loading scores...</p>
                ) : !childResults || childResults.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No grades recorded yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {childResults.map((r) => (
                      <div key={r.id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-medium text-slate-900">{r.subject}</div>
                          <div className="text-[11px] text-slate-500">{r.term || 'Current Term'}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-slate-900 tabular-nums">
                            {r.score} / {r.maxScore || 100}
                          </span>
                          <div className="mt-0.5">
                            <Badge variant={r.score >= 50 ? 'success' : 'danger'} size="sm">
                              {r.score >= 50 ? 'Pass' : 'Needs Review'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card className="text-center py-12">
          <p className="text-xs text-slate-500">
            {loadingStudents
              ? 'Loading student profile...'
              : 'No student record found linked to your parent username. Please contact the school administration.'}
          </p>
        </Card>
      )}
    </div>
  );
};
