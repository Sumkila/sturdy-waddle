import { describe, it, expect } from 'vitest';
import { endpoints } from '../api/endpoints';

describe('endpoints registry', () => {
  it('correctly maps attendance under /students/attendance', () => {
    expect(endpoints.students.attendanceSummary).toBe('/students/attendance/summary');
    expect(endpoints.students.attendanceList).toBe('/students/attendance');
    expect(endpoints.students.attendanceBulk).toBe('/students/attendance/bulk');
    expect(endpoints.students.attendance('stu-123')).toBe('/students/stu-123/attendance');
  });

  it('correctly encodes special characters in path parameters', () => {
    expect(endpoints.parents.byEmail('user+tag@domain.com')).toBe(
      `/parents/email/${encodeURIComponent('user+tag@domain.com')}`
    );
    expect(endpoints.parents.byPhone('+1 (555) 019-2834')).toBe(
      `/parents/phone/${encodeURIComponent('+1 (555) 019-2834')}`
    );
    expect(endpoints.students.byClass('Grade 10/A')).toBe(
      `/students/class/${encodeURIComponent('Grade 10/A')}`
    );
  });
});
