/**
 * Parents and Guardians Directory List Page.
 *
 * Implements lookup by email or phone number, edit, and deletion.
 */

import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Mail, Phone, Search } from 'lucide-react';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useApiMutation } from '../../hooks/useApiMutation';
import { parentsService } from '../../api/services/parents.service';
import { queryClient } from '../../lib/queryClient';
import { DataTable, Column } from '../../components/tables/DataTable';
import { TableToolbar } from '../../components/tables/TableToolbar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog';
import { RoleGuard } from '../../auth/RoleGuard';
import { useToast } from '../../components/ui/Toast';
import { Parent } from '../../types/parent';
import { formatFullName } from '../../utils/format';

export const ParentListPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Parent | null>(null);

  // Dedicated email and phone search inputs
  const [emailLookup, setEmailLookup] = useState('');
  const [phoneLookup, setPhoneLookup] = useState('');
  const [lookupResult, setLookupResult] = useState<Parent | null>(null);
  const [isSearchingLookup, setIsSearchingLookup] = useState(false);

  const {
    data: parents,
    isLoading,
    isError,
    error,
    refetch,
  } = useApiQuery({
    queryKey: ['parents'],
    queryFn: () => parentsService.getParents(),
  });

  const filteredParents = useMemo(() => {
    if (lookupResult) return [lookupResult];
    if (!parents) return [];
    if (!searchQuery) return parents;
    const q = searchQuery.toLowerCase();
    return parents.filter((p) => {
      const name = `${p.firstName} ${p.lastName}`.toLowerCase();
      const email = (p.email || '').toLowerCase();
      const phone = (p.phoneNumber || '').toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [parents, searchQuery, lookupResult]);

  const deleteMutation = useApiMutation({
    mutationFn: (id: string) => parentsService.deleteParent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      toast('Guardian record deleted successfully.', 'success');
      setDeleteTarget(null);
    },
    onError: (err) => {
      toast(err.message || 'Failed to delete guardian record', 'error');
    },
  });

  // Direct backend endpoint lookup tests (verifies /parents/email/{email} and /parents/phone/{phone})
  const handleEmailLookup = async () => {
    if (!emailLookup.trim()) return;
    setIsSearchingLookup(true);
    try {
      const res = await parentsService.findByEmail(emailLookup.trim());
      setLookupResult(res);
      toast(`Found parent matching ${emailLookup}`, 'success');
    } catch (err) {
      toast(`No parent found for email ${emailLookup}`, 'error');
    } finally {
      setIsSearchingLookup(false);
    }
  };

  const handlePhoneLookup = async () => {
    if (!phoneLookup.trim()) return;
    setIsSearchingLookup(true);
    try {
      const res = await parentsService.findByPhone(phoneLookup.trim());
      setLookupResult(res);
      toast(`Found parent matching ${phoneLookup}`, 'success');
    } catch (err) {
      toast(`No parent found for phone ${phoneLookup}`, 'error');
    } finally {
      setIsSearchingLookup(false);
    }
  };

  const clearLookup = () => {
    setEmailLookup('');
    setPhoneLookup('');
    setLookupResult(null);
  };

  const columns: Column<Parent>[] = [
    {
      header: 'Guardian Name',
      cell: (row) => (
        <div>
          <span className="font-semibold text-slate-900">
            {formatFullName(row.firstName, row.lastName)}
          </span>
          {row.relationship && (
            <div className="text-[11px] text-slate-500">Relationship: {row.relationship}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Email Address',
      accessor: 'email',
      cell: (row) => (
        <span className="text-slate-800 font-mono text-xs">{row.email}</span>
      ),
    },
    {
      header: 'Phone Number',
      accessor: 'phoneNumber',
      cell: (row) => (
        <span className="text-slate-800 font-mono text-xs">{row.phoneNumber}</span>
      ),
    },
    {
      header: 'Address',
      accessor: 'address',
      cell: (row) => <span className="text-slate-600 truncate max-w-xs block">{row.address || '—'}</span>,
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <RoleGuard capability="MANAGE_PARENTS">
            <Link to={`/parents/${row.id}/edit`}>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Edit Parent">
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              onClick={() => setDeleteTarget(row)}
              title="Delete Parent"
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
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Parents & Guardians</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Emergency contacts, family portal accounts, and contact directory
          </p>
        </div>

        <RoleGuard capability="MANAGE_PARENTS">
          <Link to="/parents/new">
            <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Guardian
            </Button>
          </Link>
        </RoleGuard>
      </div>

      {/* Specific Email / Phone Endpoint Lookup Bar */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
        <span className="font-semibold text-slate-700">Direct Endpoint Lookups:</span>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 w-64">
            <Input
              placeholder="Find by exact email..."
              value={emailLookup}
              onChange={(e) => setEmailLookup(e.target.value)}
              className="h-8 text-xs"
            />
            <Button size="sm" variant="outline" onClick={handleEmailLookup} isLoading={isSearchingLookup}>
              Lookup
            </Button>
          </div>

          <div className="flex items-center gap-1.5 w-64">
            <Input
              placeholder="Find by exact phone (e.g. +1...)"
              value={phoneLookup}
              onChange={(e) => setPhoneLookup(e.target.value)}
              className="h-8 text-xs"
            />
            <Button size="sm" variant="outline" onClick={handlePhoneLookup} isLoading={isSearchingLookup}>
              Lookup
            </Button>
          </div>

          {lookupResult && (
            <Button size="sm" variant="ghost" onClick={clearLookup} className="text-rose-600 text-xs">
              Clear Lookup Filter
            </Button>
          )}
        </div>
      </div>

      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search guardians by name, phone, or email..."
      />

      <DataTable
        columns={columns}
        data={filteredParents}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        keyExtractor={(row) => row.id}
        emptyTitle="No guardians found"
        emptyDescription="Add parent or guardian records to link emergency contacts to students."
        emptyActionLabel="Add Guardian"
        onEmptyAction={() => navigate('/parents/new')}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
        title="Delete Guardian Record"
        message={`Are you sure you want to delete ${formatFullName(
          deleteTarget?.firstName,
          deleteTarget?.lastName
        )}?`}
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
