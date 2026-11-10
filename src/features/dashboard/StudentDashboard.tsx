/**
 * Student Personal Dashboard.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, GraduationCap, User, BookOpen } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { useApiQuery } from '../../hooks/useApiQuery';
import { studentsService } from '../../api/services/students.service';
import { attendanceService } from '../../api/services/attendance.service';
import { resultsService } from '../../api/services/results.service';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { StatCard } from '../../components/feedback/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatFullName, formatPercentage, formatAttendanceStatus } from '../../utils/format';
import { formatDate } from '../../utils/date';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  // Load students and match current user record
  const { data: allStudents } = useApiQuery({
    queryKey: ['students'],
    queryFn: () => studentsService.getStudents(),
  });

  const student = React.useMemo(() => {
    if (!allStudents || allStudents.length === 0) return null;
    if (user?.username) {
      const match = allStudents.find(
        (s) =>
          s.email?.toLowerCase() === user.username.toLowerCase() ||
          s.studentNumber?.toLowerCase() === user.username.toLowerCase()
      );
      if (match) return match;
    }
    return allStudents[0];
  }, [allStudents, user]);

  const { data: attendance } = useApiQuery({
    queryKey: ['student-attendance', student?.id],
    queryFn: () => (student ? attendanceService.getStudentAttendance(student.id) : Promise.resolve([])),
    enabled: Boolean(student?.id),
  });

  const { data: results } = useApiQuery({
    queryKey: ['student-results', student?.id],
    queryFn: () => (student ? resultsService.getResults({ studentId: student.id }) : Promise.resolve([])),
    enabled: Boolean(student?.id),
  });

  const totalSessions = attendance?.length || 0;
  const presentSessions = attendance?.filter((a) => a.status === 'PRESENT').length || 0;
  const attendanceRate = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-sky-400">
            Student Portal
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-1">
            Welcome back, {student ? student.firstName : user?.username}!
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Grade: {student?.grade || '—'} · Class: {student?.className || '—'} · Student #: {student?.studentNumber || '—'}
          </p>
        </div>

        {student && (
          <Link to={`/students/${student.id}`}>
            <Button variant="secondary" size="sm" leftIcon={<User className="w-3.5 h-3.5" />}>
              My Profile
            </Button>
          </Link>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Attendance Rate"
          value={formatPercentage(attendanceRate)}
          subtext={`${presentSessions} of ${totalSessions} sessions attended`}
          icon={<CalendarCheck className="w-5 h-5" />}
        />
        <StatCard
          label="Subjects Graded"
          value={results?.length ?? 0}
          subtext="Evaluated terms"
          icon={<GraduationCap className="w-5 h-5" />}
        />
        <StatCard
          label="Enrollment Status"
          value={student?.status || 'ACTIVE'}
          subtext="Academic standing"
          icon={<BookOpen className="w-5 h-5" />}
        />
      </div>

      {/* Personal Attendance and Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Attendance Record</CardTitle>
            <Link to="/attendance" className="text-xs font-semibold text-sky-700 hover:text-sky-800">
              View All
            </Link>
          </CardHeader>
          <CardContent>
            {!attendance || attendance.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No attendance logged yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {attendance.slice(0, 5).map((att, i) => (
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Subject Grades</CardTitle>
            <Link to="/results" className="text-xs font-semibold text-sky-700 hover:text-sky-800">
              Full Report Card
            </Link>
          </CardHeader>
          <CardContent>
            {!results || results.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No grades submitted yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {results.map((r) => (
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
                          {r.score >= 50 ? 'Passed' : 'Needs Review'}
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
    </div>
  );
};
