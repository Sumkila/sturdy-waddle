/**
 * Student List Page.
 *
 * Implements search, filters (grade, class, gender, status), pagination,
 * status modification, and soft-delete / deactivate confirmation.
 */

import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, UserX, Eye, Edit2, ShieldAlert } from 'lucide-react';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useApiMutation } from '../../hooks/useApiMutation';
import { studentsService } from '../../api/services/students.service';
import { queryClient } from '../../lib/queryClient';
import { DataTable, Column } from '../../components/tables/DataTable';
import { TableToolbar } from '../../components/tables/TableToolbar';
import { FilterBar } from '../../components/tables/FilterBar';
import { Pagination } from '../../components/tables/Pagination';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';
import { RoleGuard } from '../../auth/RoleGuard';
import { useToast } from '../../components/ui/Toast';
import { useDebounce } from '../../hooks/useDebounce';
import { Student, StudentStatus } from '../../types/student';
import { formatFullName, formatStudentStatus } from '../../utils/format';

export const StudentListPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Deactivate dialog state
  const [deactivateStudentTarget, setDeactivateStudentTarget] = useState<Student | null>(null);

  // Query student list
  const {
    data: rawStudents,
    isLoading,
    isError,
    error,
    refetch,
  } = useApiQuery({
    queryKey: ['students'],
    queryFn: () => studentsService.getStudents(),
  });

  // Client-side filtering as fallback/enhancement when backend returns array
  const filteredStudents = useMemo(() => {
    if (!rawStudents) return [];
    return rawStudents.filter((s) => {
      // Name filter: matches either firstName or lastName or studentNumber
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        const fullName = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
        const num = (s.studentNumber || '').toLowerCase();
        const email = (s.email || '').toLowerCase();
        if (!fullName.includes(query) && !num.includes(query) && !email.includes(query)) {
          return false;
        }
      }

      if (selectedGrade && s.grade !== selectedGrade) {
        return false;
      }

      if (selectedClass && s.className !== selectedClass) {
        return false;
      }

      if (selectedGender && s.gender?.toUpperCase() !== selectedGender.toUpperCase()) {
        return false;
      }

      if (selectedStatus && s.status?.toUpperCase() !== selectedStatus.toUpperCase()) {
        return false;
      }

      return true;
    });
  }, [rawStudents, debouncedSearch, selectedGrade, selectedClass, selectedGender, selectedStatus]);

  // Pagination slice
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // Extract unique grades and classes for dropdown options
  const { grades, classes } = useMemo(() => {
    const gSet = new Set<string>();
    const cSet = new Set<string>();
    (rawStudents || []).forEach((s) => {
      if (s.grade) gSet.add(s.grade);
      if (s.className) cSet.add(s.className);
    });
    return {
      grades: Array.from(gSet).sort(),
      classes: Array.from(cSet).sort(),
    };
  }, [rawStudents]);

  // Deactivate mutation
  const deactivateMutation = useApiMutation({
    mutationFn: (id: string) => studentsService.deactivateStudent(id),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast(`Student ${formatFullName(updated.firstName, updated.lastName)} marked inactive.`, 'success');
      setDeactivateStudentTarget(null);
    },
    onError: (err) => {
      toast(err.message || 'Failed to deactivate student', 'error');
    },
  });

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGrade('');
    setSelectedClass('');
    setSelectedGender('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    searchQuery || selectedGrade || selectedClass || selectedGender || selectedStatus
  );

  const columns: Column<Student>[] = [
    {
      header: 'Student Number',
      accessor: 'studentNumber',
      className: 'font-mono text-xs font-semibold text-slate-800',
    },
    {
      header: 'Full Name',
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
      header: 'Grade / Class',
      cell: (row) => (
        <span className="text-slate-700">
          Grade {row.grade} · {row.className}
        </span>
      ),
    },
    {
      header: 'Gender',
      accessor: 'gender',
      cell: (row) => <span className="capitalize">{row.gender?.toLowerCase() || '—'}</span>,
    },
    {
      header: 'Status',
      cell: (row) => {
        const isAct = row.status?.toUpperCase() === 'ACTIVE';
        return (
          <Badge variant={isAct ? 'success' : 'neutral'}>
            {formatStudentStatus(row.status)}
          </Badge>
        );
      },
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Link to={`/students/${row.id}`} title="View Student Profile">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <Eye className="w-3.5 h-3.5" />
            </Button>
          </Link>

          <RoleGuard capability="EDIT_STUDENT">
            <Link to={`/students/${row.id}/edit`} title="Edit Student">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </RoleGuard>

          <RoleGuard capability="DEACTIVATE_STUDENT">
            {row.status?.toUpperCase() === 'ACTIVE' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                onClick={() => setDeactivateStudentTarget(row)}
                title="Deactivate Student"
              >
                <UserX className="w-3.5 h-3.5" />
              </Button>
            )}
          </RoleGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Students Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student records, enrollment status, and academic profiles
          </p>
        </div>

        <RoleGuard capability="CREATE_STUDENT">
          <Link to="/students/new">
            <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Enroll Student
            </Button>
          </Link>
        </RoleGuard>
      </div>

      {/* Toolbar & Filter Bar */}
      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by name, student #, or email..."
      />

      <FilterBar onReset={handleResetFilters} hasActiveFilters={hasActiveFilters}>
        <div className="w-32">
          <Select
            value={selectedGrade}
            onChange={(e) => {
              setSelectedGrade(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Grades</option>
            {grades.map((g) => (
              <option key={g} value={g}>
                Grade {g}
              </option>
            ))}
          </Select>
        </div>

        <div className="w-32">
          <Select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>

        <div className="w-28">
          <Select
            value={selectedGender}
            onChange={(e) => {
              setSelectedGender(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Genders</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </Select>
        </div>

        <div className="w-32">
          <Select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="GRADUATED">Graduated</option>
          </Select>
        </div>
      </FilterBar>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={paginatedStudents}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        keyExtractor={(row) => row.id}
        onRowClick={(row) => navigate(`/students/${row.id}`)}
        emptyTitle="No students found"
        emptyDescription="Try adjusting your search criteria or enroll a new student."
        emptyActionLabel="Enroll Student"
        onEmptyAction={() => navigate('/students/new')}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredStudents.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />

      {/* Deactivate confirmation dialog */}
      <ConfirmDialog
        isOpen={Boolean(deactivateStudentTarget)}
        onClose={() => setDeactivateStudentTarget(null)}
        onConfirm={() => {
          if (deactivateStudentTarget) {
            deactivateMutation.mutate(deactivateStudentTarget.id);
          }
        }}
        title="Deactivate Student Record"
        message={`Are you sure you want to mark ${formatFullName(
          deactivateStudentTarget?.firstName,
          deactivateStudentTarget?.lastName
        )} as INACTIVE? The student will no longer appear on daily active registers.`}
        confirmLabel="Deactivate"
        isLoading={deactivateMutation.isPending}
      />
    </div>
  );
};
