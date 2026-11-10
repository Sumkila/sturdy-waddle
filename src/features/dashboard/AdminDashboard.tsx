/**
 * Admin and Principal Executive Dashboard.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  GraduationCap,
  UserCheck,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useApiQuery } from '../../hooks/useApiQuery';
import { studentsService } from '../../api/services/students.service';
import { attendanceService } from '../../api/services/attendance.service';
import { resultsService } from '../../api/services/results.service';
import { teachersService } from '../../api/services/teachers.service';
import { StatCard } from '../../components/feedback/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatPercentage, formatFullName } from '../../utils/format';
import { formatDate } from '../../utils/date';
import { Skeleton } from '../../components/ui/Skeleton';

export const AdminDashboard: React.FC = () => {
  const { data: students, isLoading: loadingStudents } = useApiQuery({
    queryKey: ['students'],
    queryFn: () => studentsService.getStudents(),
  });

  const { data: attendanceSummary, isLoading: loadingAttendance } = useApiQuery({
    queryKey: ['attendance-summary'],
    queryFn: () => attendanceService.getSummary(),
  });

  const { data: results, isLoading: loadingResults } = useApiQuery({
    queryKey: ['results'],
    queryFn: () => resultsService.getResults(),
  });

  const { data: teachers, isLoading: loadingTeachers } = useApiQuery({
    queryKey: ['teachers'],
    queryFn: () => teachersService.getTeachers(),
  });

  // Derive metrics strictly from API data
  const totalStudents = students?.length ?? 0;
  const activeStudents = students?.filter((s) => s.status === 'ACTIVE').length ?? 0;
  const totalTeachers = teachers?.length ?? 0;
  const attendanceRate = attendanceSummary?.attendanceRate ?? 0;

  // Class distribution
  const classCounts = React.useMemo(() => {
    if (!students) return {};
    return students.reduce<Record<string, number>>((acc, s) => {
      const cls = s.className || 'Unassigned';
      acc[cls] = (acc[cls] || 0) + 1;
      return acc;
    }, {});
  }, [students]);

  const recentResults = (results || []).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Administrative Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time enrollment, attendance statistics, and academic performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/attendance">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<CalendarCheck className="w-3.5 h-3.5" />}
            >
              Daily Register
            </Button>
          </Link>
          <Link to="/students/new">
            <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Student
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Enrollment"
          value={loadingStudents ? '—' : totalStudents}
          subtext={`${activeStudents} active students`}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          label="Attendance Rate"
          value={loadingAttendance ? '—' : formatPercentage(attendanceRate)}
          subtext={`${attendanceSummary?.present ?? 0} present today`}
          trend={{ value: `${attendanceSummary?.present ?? 0}/${attendanceSummary?.total ?? 0}`, isPositive: attendanceRate >= 80 }}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          label="Teaching Faculty"
          value={loadingTeachers ? '—' : totalTeachers}
          subtext="Certified staff members"
          icon={<UserCheck className="w-5 h-5" />}
        />
        <StatCard
          label="Academic Results"
          value={loadingResults ? '—' : results?.length ?? 0}
          subtext="Recorded grade entries"
          icon={<GraduationCap className="w-5 h-5" />}
        />
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Class Distribution & Attendance Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Class Distribution</CardTitle>
                <p className="text-xs text-slate-500">Enrolled students per assigned classroom</p>
              </div>
              <Link to="/students" className="text-xs font-semibold text-sky-700 hover:text-sky-800 flex items-center gap-1">
                Directory <ArrowRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {loadingStudents ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : Object.keys(classCounts).length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No student records registered.</p>
              ) : (
                <div className="space-y-3 pt-2">
                  {Object.entries(classCounts).map(([cls, count]) => {
                    const pct = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
                    return (
                      <div key={cls} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-800">{cls}</span>
                          <span className="text-slate-500 tabular-nums">
                            {count} students ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-slate-800 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendance Summary Panel */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Daily Attendance Breakdown</CardTitle>
              <p className="text-xs text-slate-500">Aggregated student presence metrics</p>
            </CardHeader>
            <CardContent>
              {loadingAttendance ? (
                <div className="grid grid-cols-4 gap-3 py-2">
                  <Skeleton className="h-16 rounded-lg" />
                  <Skeleton className="h-16 rounded-lg" />
                  <Skeleton className="h-16 rounded-lg" />
                  <Skeleton className="h-16 rounded-lg" />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="p-3 rounded-lg border border-emerald-100 bg-emerald-50/50">
                    <span className="text-[11px] font-semibold text-emerald-800 uppercase">Present</span>
                    <div className="text-xl font-bold text-emerald-900 tabular-nums mt-0.5">
                      {attendanceSummary?.present ?? 0}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-rose-100 bg-rose-50/50">
                    <span className="text-[11px] font-semibold text-rose-800 uppercase">Absent</span>
                    <div className="text-xl font-bold text-rose-900 tabular-nums mt-0.5">
                      {attendanceSummary?.absent ?? 0}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-amber-100 bg-amber-50/50">
                    <span className="text-[11px] font-semibold text-amber-800 uppercase">Late</span>
                    <div className="text-xl font-bold text-amber-900 tabular-nums mt-0.5">
                      {attendanceSummary?.late ?? 0}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-sky-100 bg-sky-50/50">
                    <span className="text-[11px] font-semibold text-sky-800 uppercase">Excused</span>
                    <div className="text-xl font-bold text-sky-900 tabular-nums mt-0.5">
                      {attendanceSummary?.excused ?? 0}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Recent Academic Submissions */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Recent Results</CardTitle>
              <Link to="/results" className="text-xs font-semibold text-sky-700 hover:text-sky-800">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {loadingResults ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : recentResults.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No academic results submitted yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentResults.map((r) => (
                    <div key={r.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-medium text-slate-900">{r.subject}</div>
                        <div className="text-[11px] text-slate-500">Student ID: {r.studentId}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-slate-900 tabular-nums">
                          {r.score} / {r.maxScore || 100}
                        </div>
                        <Badge
                          variant={r.score >= 50 ? 'success' : 'danger'}
                          size="sm"
                        >
                          {r.score >= 50 ? 'Pass' : 'Fail'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Shortcuts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>System Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-1 text-xs">
              <Link
                to="/students/new"
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors"
              >
                <span>Enroll New Student</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/results/new"
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors"
              >
                <span>Record Subject Grade</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/subjects"
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors"
              >
                <span>Manage Curriculum</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
