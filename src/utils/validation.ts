/**
 * Centralized Zod validation schemas for forms.
 */

import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT'] as const, {
    message: 'Please select a valid role',
  }),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const studentSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Please enter a valid email address'),
  studentNumber: z.string().min(1, 'Student number is required'),
  grade: z.string().min(1, 'Grade is required'),
  className: z.string().min(1, 'Class name is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    message: 'Please select a gender',
  }),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  parentUsername: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'TRANSFERRED', 'GRADUATED']),
});

export type StudentFormData = z.infer<typeof studentSchema>;

export const resultSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  subject: z.string().min(1, 'Subject is required'),
  score: z.number().min(0, 'Score cannot be negative').max(100, 'Score cannot exceed 100'),
  maxScore: z.number().min(1, 'Max score must be at least 1'),
  term: z.string().optional(),
  academicYear: z.string().optional(),
  remarks: z.string().optional(),
});

export type ResultFormData = z.infer<typeof resultSchema>;

export const subjectSchema = z.object({
  subjectCode: z.string().min(1, 'Subject code is required'),
  subjectName: z.string().min(1, 'Subject name is required'),
  grade: z.string().min(1, 'Grade is required'),
  teacher: z.string().optional(),
  description: z.string().optional(),
});

export type SubjectFormData = z.infer<typeof subjectSchema>;

export const teacherSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  employeeNumber: z.string().min(1, 'Employee number is required'),
  department: z.string().min(1, 'Department is required'),
  phoneNumber: z.string().optional(),
  email: z.string().email('Please enter a valid email address'),
  specialization: z.string().optional(),
});

export type TeacherFormData = z.infer<typeof teacherSchema>;

export const parentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Please enter a valid email address'),
  address: z.string().optional(),
  relationship: z.string().optional(),
});

export type ParentFormData = z.infer<typeof parentSchema>;
