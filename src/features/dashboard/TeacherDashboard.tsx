/**
 * Teacher Role Dashboard.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, GraduationCap, Users, Plus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useApiQuery } from '../../hooks/useApiQuery';
import { studentsService } from '../../api/services/students.service';
import { resultsService } from '../../api/services/results.service';
import { subjectsService } from '../../api/services/subjects.service';
import { StatCard } from '../../components/feedback/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { toIsoDateString } from '../../utils/date';

export const TeacherDashboard: React.FC = () => {
  const todayIso = toIsoDateString(new Date());

  const { data: students, isLoading: loadingStudents } = useApiQuery({
    queryKey: ['students'],
    queryFn: () => studentsService.getStudents(),
  });

  const { data: subjects, isLoading: loadingSubjects } = useApiQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsService.getSubjects(),
  });

  const { data: results, isLoading: loadingResults } = useApiQuery({
    queryKey: ['results'],
    queryFn: () => resultsService.getResults(),
  });

  // Extract unique classes
  const classes = React.useMemo(() => {
    if (!students) return [];
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.className) set.add(s.className);
    });
    return Array.from(set).sort();
  }, [students]);

  const teacherResults = (results || []).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Teacher Faculty Portal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Today's classes, attendance registers, and academic submissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/attendance">
            <Button size="sm" leftIcon={<CalendarCheck className="w-3.5 h-3.5" />}>
              Mark Today's Attendance
            </Button>
          </Link>
          <Link to="/results/new">
            <Button variant="outline" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Record Grade
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Assigned Classes"
          value={classes.length}
          subtext="Active classroom groups"
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          label="Active Subjects"
          value={loadingSubjects ? '—' : subjects?.length ?? 0}
          subtext="Curriculum subjects"
          icon={<GraduationCap className="w-5 h-5" />}
        />
        <StatCard
          label="Grade Records"
          value={loadingResults ? '—' : results?.length ?? 0}
          subtext="Evaluated student scores"
          icon={<CheckCircle2 className="w-5 h-5" />}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classes & Attendance Shortcuts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Classes Register</CardTitle>
              <p className="text-xs text-slate-500">Quick attendance marking for {todayIso}</p>
            </div>
          </CardHeader>
          <CardContent>
            {classes.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No classes registered yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {classes.map((className) => {
                  const studentCount = students?.filter((s) => s.className === className).length || 0;
                  return (
                    <div key={className} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{className}</div>
                        <div className="text-xs text-slate-500 tabular-nums">
                          {studentCount} Enrolled Students
                        </div>
                      </div>
                      <Link to={`/attendance?className=${encodeURIComponent(className)}&date=${todayIso}`}>
                        <Button variant="outline" size="sm" leftIcon={<CalendarCheck className="w-3.5 h-3.5" />}>
                          Take Attendance
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Recent Grade Entries</CardTitle>
              <p className="text-xs text-slate-500">Latest scores posted to the gradebook</p>
            </div>
            <Link to="/results" className="text-xs font-semibold text-sky-700 hover:text-sky-800">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {teacherResults.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No grades recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {teacherResults.map((r) => (
                  <div key={r.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-medium text-slate-900">{r.subject}</div>
                      <div className="text-slate-500">Student ID: {r.studentId}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {r.score} / {r.maxScore || 100}
                      </span>
                      <div className="mt-0.5">
                        <Badge variant={r.score >= 50 ? 'success' : 'danger'} size="sm">
                          {r.score >= 50 ? 'Passed' : 'Failed'}
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
