/**
 * Subjects List Page.
 */

import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useApiMutation } from '../../hooks/useApiMutation';
import { subjectsService } from '../../api/services/subjects.service';
import { queryClient } from '../../lib/queryClient';
import { DataTable, Column } from '../../components/tables/DataTable';
import { TableToolbar } from '../../components/tables/TableToolbar';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';
import { RoleGuard } from '../../auth/RoleGuard';
import { useToast } from '../../components/ui/Toast';
import { Subject } from '../../types/subject';

export const SubjectListPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);

  const {
    data: subjects,
    isLoading,
    isError,
    error,
    refetch,
  } = useApiQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsService.getSubjects(),
  });

  const filteredSubjects = useMemo(() => {
    if (!subjects) return [];
    if (!searchQuery) return subjects;
    const q = searchQuery.toLowerCase();
    return subjects.filter(
      (s) =>
        s.subjectName.toLowerCase().includes(q) ||
        s.subjectCode.toLowerCase().includes(q) ||
        s.grade.toLowerCase().includes(q)
    );
  }, [subjects, searchQuery]);

  const deleteMutation = useApiMutation({
    mutationFn: (id: string) => subjectsService.deleteSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast('Subject removed successfully.', 'success');
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast(err.message || 'Failed to delete subject', 'error');
    },
  });

  const columns: Column<Subject>[] = [
    {
      header: 'Code',
      accessor: 'subjectCode',
      className: 'font-mono text-xs font-semibold text-slate-800',
    },
    {
      header: 'Subject Name',
      accessor: 'subjectName',
      className: 'font-semibold text-slate-900',
    },
    {
      header: 'Grade',
      accessor: 'grade',
      cell: (row) => <span>Grade {row.grade}</span>,
    },
    {
      header: 'Assigned Teacher',
      accessor: 'teacher',
      cell: (row) => <span>{row.teacher || 'Unassigned'}</span>,
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <RoleGuard capability="MANAGE_SUBJECTS">
            <Link to={`/subjects/${row.id}/edit`}>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Edit Subject">
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              onClick={() => setDeleteTarget(row)}
              title="Delete Subject"
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Curriculum & Subjects</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer curriculum courses, subject codes, and faculty assignments
          </p>
        </div>

        <RoleGuard capability="MANAGE_SUBJECTS">
          <Link to="/subjects/new">
            <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Create Subject
            </Button>
          </Link>
        </RoleGuard>
      </div>

      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search subjects by name, code, or grade..."
      />

      <DataTable
        columns={columns}
        data={filteredSubjects}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        keyExtractor={(row) => row.id}
        emptyTitle="No curriculum subjects found"
        emptyDescription="Create your first subject to begin organizing academic gradebooks."
        emptyActionLabel="Add Subject"
        onEmptyAction={() => navigate('/subjects/new')}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
        title="Delete Curriculum Subject"
        message={`Are you sure you want to delete ${deleteTarget?.subjectName} (${deleteTarget?.subjectCode})?`}
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
