/**
 * Teacher Create and Edit Form Page.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, UserCheck } from 'lucide-react';
import { teacherSchema, TeacherFormData } from '../../utils/validation';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useApiMutation } from '../../hooks/useApiMutation';
import { teachersService } from '../../api/services/teachers.service';
import { queryClient } from '../../lib/queryClient';
import { FormField } from '../../components/forms/FormField';
import { FormErrorSummary } from '../../components/forms/FormErrorSummary';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { useFormErrors } from '../../hooks/useFormErrors';

export const TeacherFormPage: React.FC = () => {
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
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      employeeNumber: '',
      department: '',
      phoneNumber: '',
      email: '',
      specialization: '',
    },
  });

  const { rootError, handleApiError, clearErrors } = useFormErrors<TeacherFormData>(setError);

  const { data: existingTeacher, isLoading: loadingExisting } = useApiQuery({
    queryKey: ['teacher', id],
    queryFn: () => teachersService.getTeacherById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingTeacher) {
      reset({
        firstName: existingTeacher.firstName || '',
        lastName: existingTeacher.lastName || '',
        employeeNumber: existingTeacher.employeeNumber || '',
        department: existingTeacher.department || '',
        phoneNumber: existingTeacher.phoneNumber || '',
        email: existingTeacher.email || '',
        specialization: existingTeacher.specialization || '',
      });
    }
  }, [existingTeacher, reset]);

  const createMutation = useApiMutation({
    mutationFn: (data: TeacherFormData) => teachersService.createTeacher(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast('Faculty member registered successfully!', 'success');
      navigate('/teachers');
    },
    onError: (err) => {
      handleApiError(err);
    },
  });

  const updateMutation = useApiMutation({
    mutationFn: (data: TeacherFormData) => teachersService.updateTeacher(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast('Faculty record updated successfully!', 'success');
      navigate('/teachers');
    },
    onError: (err) => {
      handleApiError(err);
    },
  });

  const onSubmit = async (data: TeacherFormData) => {
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
    return <div className="py-8 text-center text-xs text-slate-500">Loading faculty details...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/teachers">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to Faculty
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {isEdit ? 'Edit Faculty Record' : 'Register New Faculty Member'}
          </h1>
          <p className="text-xs text-slate-500">
            {isEdit ? 'Update teacher contact and departmental details' : 'Add instructor to school roster'}
          </p>
        </div>
      </div>

      <Card padding="lg">
        <FormErrorSummary rootError={rootError} fieldErrors={errors} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" name="firstName" required error={errors.firstName?.message}>
              <Input
                id="firstName"
                placeholder="e.g. Sarah"
                {...register('firstName')}
                error={errors.firstName?.message}
              />
            </FormField>

            <FormField label="Last Name" name="lastName" required error={errors.lastName?.message}>
              <Input
                id="lastName"
                placeholder="e.g. Connor"
                {...register('lastName')}
                error={errors.lastName?.message}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Employee Number" name="employeeNumber" required error={errors.employeeNumber?.message}>
              <Input
                id="employeeNumber"
                placeholder="e.g. EMP-1042"
                {...register('employeeNumber')}
                error={errors.employeeNumber?.message}
              />
            </FormField>

            <FormField label="Academic Department" name="department" required error={errors.department?.message}>
              <Input
                id="department"
                placeholder="e.g. Mathematics, Science"
                {...register('department')}
                error={errors.department?.message}
              />
            </FormField>
          </div>

          <FormField label="Email Address" name="email" required error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              placeholder="teacher@school.edu"
              {...register('email')}
              error={errors.email?.message}
            />
          </FormField>

          <FormField label="Phone Number" name="phoneNumber" error={errors.phoneNumber?.message}>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="e.g. +1 555-0144"
              {...register('phoneNumber')}
              error={errors.phoneNumber?.message}
            />
          </FormField>

          <FormField label="Specialization / Focus" name="specialization" error={errors.specialization?.message}>
            <Input
              id="specialization"
              placeholder="e.g. Calculus, Organic Chemistry"
              {...register('specialization')}
            />
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to="/teachers">
              <Button variant="outline" type="button" disabled={isSubmitting}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              isLoading={isSubmitting}
              leftIcon={isEdit ? <Save className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
            >
              {isEdit ? 'Save Changes' : 'Register Faculty'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
