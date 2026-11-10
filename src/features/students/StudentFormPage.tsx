/**
 * Student Create and Edit Form Page.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, UserPlus, Check } from 'lucide-react';
import { studentSchema, StudentFormData } from '../../utils/validation';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useApiMutation } from '../../hooks/useApiMutation';
import { studentsService } from '../../api/services/students.service';
import { queryClient } from '../../lib/queryClient';
import { FormField } from '../../components/forms/FormField';
import { FormSection } from '../../components/forms/FormSection';
import { FormErrorSummary } from '../../components/forms/FormErrorSummary';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { useFormErrors } from '../../hooks/useFormErrors';
import { StudentGender, StudentStatus } from '../../types/student';

export const StudentFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      studentNumber: '',
      grade: '',
      className: '',
      gender: 'MALE',
      phoneNumber: '',
      address: '',
      parentUsername: '',
      status: 'ACTIVE',
    },
  });

  const { rootError, handleApiError, clearErrors } = useFormErrors<StudentFormData>(setError);

  // If in Edit mode, fetch student details
  const { data: existingStudent, isLoading: loadingExisting } = useApiQuery({
    queryKey: ['student', id],
    queryFn: () => studentsService.getStudentById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingStudent) {
      reset({
        firstName: existingStudent.firstName || '',
        lastName: existingStudent.lastName || '',
        email: existingStudent.email || '',
        studentNumber: existingStudent.studentNumber || '',
        grade: existingStudent.grade || '',
        className: existingStudent.className || '',
        gender: (existingStudent.gender as StudentGender) || 'MALE',
        phoneNumber: existingStudent.phoneNumber || '',
        address: existingStudent.address || '',
        parentUsername: existingStudent.parentUsername || '',
        status: (existingStudent.status as StudentStatus) || 'ACTIVE',
      });
    }
  }, [existingStudent, reset]);

  // Mutations
  const createMutation = useApiMutation({
    mutationFn: (data: StudentFormData) => studentsService.createStudent(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast('Student record enrolled successfully!', 'success');
      navigate(`/students/${created.id || ''}`);
    },
    onError: (err) => {
      handleApiError(err);
    },
  });

  const updateMutation = useApiMutation({
    mutationFn: (data: StudentFormData) => studentsService.updateStudent(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', id] });
      toast('Student profile updated successfully!', 'success');
      navigate(`/students/${id}`);
    },
    onError: (err) => {
      handleApiError(err);
    },
  });

  const onSubmit = async (data: StudentFormData) => {
    clearErrors();
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEdit && loadingExisting) {
    return (
      <div className="max-w-3xl mx-auto py-8 text-center text-xs text-slate-500">
        Loading student information...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={isEdit ? `/students/${id}` : '/students'}>
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {isEdit ? 'Edit Student Profile' : 'Enroll New Student'}
            </h1>
            <p className="text-xs text-slate-500">
              {isEdit ? 'Update student demographic and academic records' : 'Register student details into the system'}
            </p>
          </div>
        </div>
      </div>

      <Card padding="lg">
        <FormErrorSummary rootError={rootError} fieldErrors={errors} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* Section 1: Identity */}
          <FormSection
            title="Personal & Identity Information"
            description="Official student demographic data"
          >
            <FormField label="First Name" name="firstName" required error={errors.firstName?.message}>
              <Input
                id="firstName"
                placeholder="e.g. Alex"
                {...register('firstName')}
                error={errors.firstName?.message}
              />
            </FormField>

            <FormField label="Last Name" name="lastName" required error={errors.lastName?.message}>
              <Input
                id="lastName"
                placeholder="e.g. Morgan"
                {...register('lastName')}
                error={errors.lastName?.message}
              />
            </FormField>

            <FormField label="Student Number" name="studentNumber" required error={errors.studentNumber?.message}>
              <Input
                id="studentNumber"
                placeholder="e.g. STU-2026-001"
                {...register('studentNumber')}
                error={errors.studentNumber?.message}
              />
            </FormField>

            <FormField label="Gender" name="gender" required error={errors.gender?.message}>
              <Select id="gender" {...register('gender')} error={errors.gender?.message}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </Select>
            </FormField>
          </FormSection>

          {/* Section 2: Academic Placement */}
          <FormSection
            title="Academic Placement"
            description="Grade level and classroom assignment"
          >
            <FormField label="Grade Level" name="grade" required error={errors.grade?.message}>
              <Input
                id="grade"
                placeholder="e.g. 10 or 10th"
                {...register('grade')}
                error={errors.grade?.message}
              />
            </FormField>

            <FormField label="Class Name" name="className" required error={errors.className?.message}>
              <Input
                id="className"
                placeholder="e.g. Room 101 or 10-A"
                {...register('className')}
                error={errors.className?.message}
              />
            </FormField>

            <FormField label="Enrollment Status" name="status" error={errors.status?.message}>
              <Select id="status" {...register('status')} error={errors.status?.message}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="TRANSFERRED">Transferred</option>
                <option value="GRADUATED">Graduated</option>
              </Select>
            </FormField>

            <FormField label="Parent Username" name="parentUsername" error={errors.parentUsername?.message} description="Links child to guardian portal account">
              <Input
                id="parentUsername"
                placeholder="e.g. parent_morgan"
                {...register('parentUsername')}
                error={errors.parentUsername?.message}
              />
            </FormField>
          </FormSection>

          {/* Section 3: Contact */}
          <FormSection
            title="Contact Information"
            description="Communication channels and residential address"
          >
            <FormField label="Email Address" name="email" required error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                placeholder="student@school.edu"
                {...register('email')}
                error={errors.email?.message}
              />
            </FormField>

            <FormField label="Phone Number" name="phoneNumber" error={errors.phoneNumber?.message}>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="e.g. +1 555-0199"
                {...register('phoneNumber')}
                error={errors.phoneNumber?.message}
              />
            </FormField>

            <div className="sm:col-span-2">
              <FormField label="Residential Address" name="address" error={errors.address?.message}>
                <Textarea
                  id="address"
                  placeholder="Street, City, Postal Code"
                  rows={2}
                  {...register('address')}
                  error={errors.address?.message}
                />
              </FormField>
            </div>
          </FormSection>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to={isEdit ? `/students/${id}` : '/students'}>
              <Button variant="outline" type="button" disabled={isSubmitting}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              isLoading={isSubmitting}
              leftIcon={isEdit ? <Save className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            >
              {isEdit ? 'Save Changes' : 'Enroll Student'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
