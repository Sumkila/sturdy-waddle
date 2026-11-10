/**
 * Attendance Summary and Historical Analytics Page.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, ArrowLeft, BarChart2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApiQuery } from '../../hooks/useApiQuery';
import { attendanceService } from '../../api/services/attendance.service';
import { studentsService } from '../../api/services/students.service';
import { StatCard } from '../../components/feedback/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { formatPercentage, formatFullName } from '../../utils/format';
import { formatDate } from '../../utils/date';

export const AttendanceSummaryPage: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>('');

  const { data: students } = useApiQuery({
    queryKey: ['students'],
    queryFn: () => studentsService.getStudents(),
  });

  const availableClasses = React.useMemo(() => {
    if (!students) return [];
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.className) set.add(s.className);
    });
    return Array.from(set).sort();
  }, [students]);

  const { data: summary, isLoading: loadingSummary, refetch } = useApiQuery({
    queryKey: ['attendance-summary', selectedClass],
    queryFn: () => attendanceService.getSummary(selectedClass ? { className: selectedClass } : undefined),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/attendance">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Back to Register
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Attendance Analytics & Summary
            </h1>
            <p className="text-xs text-slate-500">
              Aggregated institutional presence metrics and trends
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-40">
            <Select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">All Classrooms</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Attendance Rate"
          value={loadingSummary ? '—' : formatPercentage(summary?.attendanceRate ?? 0)}
          subtext="Institutional presence benchmark"
          trend={{ value: `${summary?.present ?? 0} present`, isPositive: (summary?.attendanceRate ?? 0) >= 80 }}
          icon={<CalendarCheck className="w-5 h-5" />}
        />
        <StatCard
          label="Total Records"
          value={loadingSummary ? '—' : summary?.total ?? 0}
          subtext="Logged session records"
          icon={<BarChart2 className="w-5 h-5" />}
        />
        <StatCard
          label="Absence Volume"
          value={loadingSummary ? '—' : summary?.absent ?? 0}
          subtext={`${summary?.late ?? 0} late occurrences`}
          trend={{ value: `${summary?.excused ?? 0} excused`, isPositive: false }}
          icon={<AlertCircle className="w-5 h-5" />}
        />
      </div>

      {/* Detailed Breakdown Card */}
      <Card>
        <CardHeader>
          <CardTitle>Status Category Distribution</CardTitle>
          <p className="text-xs text-slate-500">Breakdown of reported attendance statuses</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Present
              </span>
              <div className="text-2xl font-bold text-emerald-950 tabular-nums mt-1">
                {summary?.present ?? 0}
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">
                {summary?.total
                  ? formatPercentage(((summary.present || 0) / summary.total) * 100)
                  : '0%'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/40">
              <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">
                Absent
              </span>
              <div className="text-2xl font-bold text-rose-950 tabular-nums mt-1">
                {summary?.absent ?? 0}
              </div>
              <p className="text-[11px] text-rose-700 mt-1">
                {summary?.total
                  ? formatPercentage(((summary.absent || 0) / summary.total) * 100)
                  : '0%'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/40">
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                Late
              </span>
              <div className="text-2xl font-bold text-amber-950 tabular-nums mt-1">
                {summary?.late ?? 0}
              </div>
              <p className="text-[11px] text-amber-700 mt-1">
                {summary?.total
                  ? formatPercentage(((summary.late || 0) / summary.total) * 100)
                  : '0%'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-sky-100 bg-sky-50/40">
              <span className="text-xs font-semibold text-sky-800 uppercase tracking-wider">
                Excused
              </span>
              <div className="text-2xl font-bold text-sky-950 tabular-nums mt-1">
                {summary?.excused ?? 0}
              </div>
              <p className="text-[11px] text-sky-700 mt-1">
                {summary?.total
                  ? formatPercentage(((summary.excused || 0) / summary.total) * 100)
                  : '0%'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
