/**
 * Teachers Directory List Page.
 */

import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Mail, Phone } from 'lucide-react';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useApiMutation } from '../../hooks/useApiMutation';
import { teachersService } from '../../api/services/teachers.service';
import { queryClient } from '../../lib/queryClient';
import { DataTable, Column } from '../../components/tables/DataTable';
import { TableToolbar } from '../../components/tables/TableToolbar';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';
import { RoleGuard } from '../../auth/RoleGuard';
import { useToast } from '../../components/ui/Toast';
import { Teacher } from '../../types/teacher';
import { formatFullName } from '../../utils/format';

export const TeacherListPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null);

  const {
    data: teachers,
    isLoading,
    isError,
    error,
    refetch,
  } = useApiQuery({
    queryKey: ['teachers'],
    queryFn: () => teachersService.getTeachers(),
  });

  const filteredTeachers = useMemo(() => {
    if (!teachers) return [];
    if (!searchQuery) return teachers;
    const q = searchQuery.toLowerCase();
    return teachers.filter((t) => {
      const name = `${t.firstName} ${t.lastName}`.toLowerCase();
      const num = (t.employeeNumber || '').toLowerCase();
      const dept = (t.department || '').toLowerCase();
      const email = (t.email || '').toLowerCase();
      return name.includes(q) || num.includes(q) || dept.includes(q) || email.includes(q);
    });
  }, [teachers, searchQuery]);

  const deleteMutation = useApiMutation({
    mutationFn: (id: string) => teachersService.deleteTeacher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast('Faculty member record deleted successfully.', 'success');
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast(err.message || 'Failed to delete teacher record', 'error');
    },
  });

  const columns: Column<Teacher>[] = [
    {
      header: 'Employee ID',
      accessor: 'employeeNumber',
      className: 'font-mono text-xs font-semibold text-slate-800',
    },
    {
      header: 'Faculty Member',
      cell: (row) => (
        <div>
          <span className="font-semibold text-slate-900">
            {formatFullName(row.firstName, row.lastName)}
          </span>
          <div className="text-[11px] text-slate-500">{row.email}</div>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: 'department',
      className: 'font-medium text-slate-800',
    },
    {
      header: 'Contact Phone',
      accessor: 'phoneNumber',
      cell: (row) => <span>{row.phoneNumber || '—'}</span>,
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <RoleGuard capability="MANAGE_TEACHERS">
            <Link to={`/teachers/${row.id}/edit`}>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Edit Teacher">
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              onClick={() => setDeleteTarget(row)}
              title="Delete Teacher"
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
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Faculty & Teachers</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Teaching staff directory, academic departments, and credentials
          </p>
        </div>

        <RoleGuard capability="MANAGE_TEACHERS">
          <Link to="/teachers/new">
            <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Faculty Member
            </Button>
          </Link>
        </RoleGuard>
      </div>

      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search faculty by name, department, or employee #..."
      />

      <DataTable
        columns={columns}
        data={filteredTeachers}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        keyExtractor={(row) => row.id}
        emptyTitle="No teachers registered"
        emptyDescription="Add teaching faculty members to begin assigning instructors to subjects."
        emptyActionLabel="Add Teacher"
        onEmptyAction={() => navigate('/teachers/new')}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
        title="Remove Faculty Member"
        message={`Are you sure you want to delete ${formatFullName(
          deleteTarget?.firstName,
          deleteTarget?.lastName
        )} from the faculty directory?`}
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
