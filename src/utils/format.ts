/**
 * Text, number, and status display formatters.
 */

export function formatFullName(firstName?: string, lastName?: string): string {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : '—';
}

export function formatPercentage(value: number, decimals = 1): string {
  if (isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

export function formatAttendanceStatus(status: string): string {
  switch (status?.toUpperCase()) {
    case 'PRESENT':
      return 'Present';
    case 'ABSENT':
      return 'Absent';
    case 'LATE':
      return 'Late';
    case 'EXCUSED':
      return 'Excused';
    default:
      return status || '—';
  }
}

export function formatStudentStatus(status: string): string {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
      return 'Active';
    case 'INACTIVE':
      return 'Inactive';
    case 'SUSPENDED':
      return 'Suspended';
    case 'TRANSFERRED':
      return 'Transferred';
    case 'GRADUATED':
      return 'Graduated';
    default:
      return status || '—';
  }
}
