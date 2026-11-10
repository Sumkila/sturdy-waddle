/**
 * Academic Results List Page.
 *
 * Implements:
 * - Table view of student grades and subjects
 * - Filtering by subject and student
 * - Role-restricted actions (Edit: Admin/Principal, Delete: Admin only)
 * - Result detail modal
 * - Delete confirmation
 */

import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit2, Trash2, GraduationCap, AlertCircle } from 'lucide-react';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useApiMutation } from '../../hooks/useApiMutation';
import { resultsService } from '../../api/services/results.service';
import { studentsService } from '../../api/services/students.service';
import { queryClient } from '../../lib/queryClient';
import { DataTable, Column } from '../../components/tables/DataTable';
import { TableToolbar } from '../../components/tables/TableToolbar';
import { FilterBar } from '../../components/tables/FilterBar';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Dialog } from '../../components/ui/Dialog';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';
import { RoleGuard } from '../../auth/RoleGuard';
import { useToast } from '../../components/ui/Toast';
import { useDebounce } from '../../hooks/useDebounce';
import { AcademicResult } from '../../types/result';
import { formatFullName } from '../../utils/format';

export const ResultListPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [activeResultDetail, setActiveResultDetail] = useState<AcademicResult | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AcademicResult | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Query results
  const {
    data: rawResults,
    isLoading,
    isError,
    error,
    refetch,
  } = useApiQuery({
    queryKey: ['results'],
    queryFn: () => resultsService.getResults(),
  });

  // Query students to correlate student names with studentIds
  const { data: students } = useApiQuery({
    queryKey: ['students'],
    queryFn: () => studentsService.getStudents(),
  });

  const studentMap = useMemo(() => {
    const map = new Map<string, string>();
    (students || []).forEach((s) => {
      map.set(s.id, formatFullName(s.firstName, s.lastName));
    });
    return map;
  }, [students]);

  // Extract unique subjects
  const availableSubjects = useMemo(() => {
    if (!rawResults) return [];
    const set = new Set<string>();
    rawResults.forEach((r) => {
      if (r.subject) set.add(r.subject);
    });
    return Array.from(set).sort();
  }, [rawResults]);

  // Client-side filtering
  const filteredResults = useMemo(() => {
    if (!rawResults) return [];
    return rawResults.filter((r) => {
      if (selectedSubject && r.subject !== selectedSubject) {
        return false;
      }

      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        const studentName = (studentMap.get(r.studentId) || '').toLowerCase();
        const sub = (r.subject || '').toLowerCase();
        const id = (r.studentId || '').toLowerCase();
        if (!studentName.includes(query) && !sub.includes(query) && !id.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [rawResults, selectedSubject, debouncedSearch, studentMap]);

  // Delete mutation
  const deleteMutation = useApiMutation({
    mutationFn: (id: string) => resultsService.deleteResult(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      toast('Academic result deleted successfully.', 'success');
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast(err.message || 'Failed to delete result record.', 'error');
    },
  });

  const columns: Column<AcademicResult>[] = [
    {
      header: 'Student',
      cell: (row) => (
        <div>
          <div className="font-semibold text-slate-900">
            {studentMap.get(row.studentId) || `Student ${row.studentId}`}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">ID: {row.studentId}</div>
        </div>
      ),
    },
    {
      header: 'Subject',
      accessor: 'subject',
      className: 'font-medium text-slate-900',
    },
    {
      header: 'Score',
      cell: (row) => (
        <span className="font-semibold text-slate-900 tabular-nums">
          {row.score} / {row.maxScore || 100}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => {
        const passed = row.score >= 50;
        return (
          <Badge variant={passed ? 'success' : 'danger'}>
            {passed ? 'Passed' : 'Needs Review'}
          </Badge>
        );
      },
    },
    {
      header: 'Term / Year',
      cell: (row) => (
        <span className="text-slate-600">
          {row.term || 'Current Term'} {row.academicYear && `· ${row.academicYear}`}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setActiveResultDetail(row)}
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>

          <RoleGuard capability="EDIT_RESULT">
            <Link to={`/results/${row.id}/edit`}>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Edit Result">
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </RoleGuard>

          <RoleGuard capability="DELETE_RESULT">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              onClick={() => setDeleteTarget(row)}
              title="Delete Result"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </RoleGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Academic Results</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Subject performance reports, evaluations, and student grade records
          </p>
        </div>

        <RoleGuard capability="CREATE_RESULT">
          <Link to="/results/new">
            <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Record Grade
            </Button>
          </Link>
        </RoleGuard>
      </div>

      {/* Toolbar & Filters */}
      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by student name, ID, or subject..."
      />

      <FilterBar
        onReset={() => {
          setSearchQuery('');
          setSelectedSubject('');
        }}
        hasActiveFilters={Boolean(searchQuery || selectedSubject)}
      >
        <div className="w-40">
          <Select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">All Subjects</option>
            {availableSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </Select>
        </div>
      </FilterBar>

      {/* Results Table */}
      <DataTable
        columns={columns}
        data={filteredResults}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        keyExtractor={(row) => row.id}
        emptyTitle="No academic results found"
        emptyDescription="No grade records matched your query."
        emptyActionLabel="Record First Grade"
        onEmptyAction={() => navigate('/results/new')}
      />

      {/* Detail Modal */}
      <Dialog
        isOpen={Boolean(activeResultDetail)}
        onClose={() => setActiveResultDetail(null)}
        title="Result Record Details"
      >
        {activeResultDetail && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="font-semibold text-slate-900">
                  {studentMap.get(activeResultDetail.studentId) || activeResultDetail.studentId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subject:</span>
                <span className="font-semibold text-slate-900">{activeResultDetail.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Score Awarded:</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {activeResultDetail.score} / {activeResultDetail.maxScore || 100}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Evaluation:</span>
                <Badge variant={activeResultDetail.score >= 50 ? 'success' : 'danger'}>
                  {activeResultDetail.score >= 50 ? 'Passed' : 'Needs Review'}
                </Badge>
              </div>
            </div>

            {activeResultDetail.remarks && (
              <div>
                <span className="font-semibold text-slate-800">Evaluator Remarks:</span>
                <p className="mt-1 text-slate-600 bg-white p-2.5 rounded border border-slate-200">
                  {activeResultDetail.remarks}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => setActiveResultDetail(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
        title="Delete Academic Result"
        message={`Are you sure you want to permanently delete the ${deleteTarget?.subject} grade record for student ${deleteTarget?.studentId}? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
