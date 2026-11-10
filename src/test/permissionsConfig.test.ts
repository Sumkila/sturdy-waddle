import { describe, it, expect } from 'vitest';
import { hasPermission } from '../config/permissionsConfig';

describe('permissionsConfig.hasPermission', () => {
  it('grants admin all required administrative privileges', () => {
    expect(hasPermission('ADMIN', 'CREATE_STUDENT')).toBe(true);
    expect(hasPermission('ADMIN', 'EDIT_STUDENT')).toBe(true);
    expect(hasPermission('ADMIN', 'DEACTIVATE_STUDENT')).toBe(true);
    expect(hasPermission('ADMIN', 'DELETE_RESULT')).toBe(true);
    expect(hasPermission('ADMIN', 'MANAGE_SUBJECTS')).toBe(true);
    expect(hasPermission('ADMIN', 'MANAGE_TEACHERS')).toBe(true);
  });

  it('allows teacher to mark attendance and create results, but not delete results or manage subjects', () => {
    expect(hasPermission('TEACHER', 'MARK_ATTENDANCE')).toBe(true);
    expect(hasPermission('TEACHER', 'VIEW_ATTENDANCE')).toBe(true);
    expect(hasPermission('TEACHER', 'CREATE_RESULT')).toBe(true);
    expect(hasPermission('TEACHER', 'DELETE_RESULT')).toBe(false);
    expect(hasPermission('TEACHER', 'CREATE_STUDENT')).toBe(false);
    expect(hasPermission('TEACHER', 'MANAGE_SUBJECTS')).toBe(false);
  });

  it('restricts parents and students to their own records', () => {
    expect(hasPermission('PARENT', 'VIEW_OWN_CHILDREN')).toBe(true);
    expect(hasPermission('PARENT', 'VIEW_ALL_STUDENTS')).toBe(false);
    expect(hasPermission('PARENT', 'CREATE_STUDENT')).toBe(false);

    expect(hasPermission('STUDENT', 'VIEW_OWN_RECORD')).toBe(true);
    expect(hasPermission('STUDENT', 'VIEW_ALL_STUDENTS')).toBe(false);
    expect(hasPermission('STUDENT', 'MARK_ATTENDANCE')).toBe(false);
  });

  it('returns false when role is undefined or null', () => {
    expect(hasPermission(undefined, 'VIEW_DASHBOARD')).toBe(false);
    expect(hasPermission(null, 'VIEW_DASHBOARD')).toBe(false);
  });
});
