import { describe, it, expect } from 'vitest';
import { studentSchema, resultSchema, loginSchema } from '../utils/validation';

describe('Validation Schemas', () => {
  it('validates a correct student creation payload', () => {
    const validData = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      studentNumber: 'STU-1001',
      grade: '10',
      className: '10-A',
      gender: 'FEMALE' as const,
      status: 'ACTIVE' as const,
    };

    const parseResult = studentSchema.safeParse(validData);
    expect(parseResult.success).toBe(true);
  });

  it('rejects student creation payload missing required fields', () => {
    const invalidData = {
      firstName: '',
      email: 'not-an-email',
    };

    const parseResult = studentSchema.safeParse(invalidData);
    expect(parseResult.success).toBe(false);
    if (!parseResult.success) {
      const fieldKeys = parseResult.error.issues.map((i) => i.path[0]);
      expect(fieldKeys).toContain('firstName');
      expect(fieldKeys).toContain('lastName');
      expect(fieldKeys).toContain('email');
      expect(fieldKeys).toContain('studentNumber');
    }
  });

  it('validates academic result score boundaries', () => {
    const validResult = {
      studentId: 'stu-1',
      subject: 'Mathematics',
      score: 85,
      maxScore: 100,
    };

    expect(resultSchema.safeParse(validResult).success).toBe(true);

    const negativeResult = {
      studentId: 'stu-1',
      subject: 'Mathematics',
      score: -5,
    };
    expect(resultSchema.safeParse(negativeResult).success).toBe(false);

    const overMaxResult = {
      studentId: 'stu-1',
      subject: 'Mathematics',
      score: 105,
    };
    expect(resultSchema.safeParse(overMaxResult).success).toBe(false);
  });

  it('validates login input', () => {
    expect(loginSchema.safeParse({ username: 'admin', password: 'password' }).success).toBe(true);
    expect(loginSchema.safeParse({ username: '', password: '' }).success).toBe(false);
  });
});
