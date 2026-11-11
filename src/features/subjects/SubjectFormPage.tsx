/**
 * Subject Create and Edit Form Page.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, BookOpen } from 'lucide-react';
import { subjectSchema, SubjectFormData } from '../../utils/validation';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useApiMutation } from '../../hooks/useApiMutation';
import { subjectsService } from '../../api/services/subjects.service';
import { teachersService } from '../../api/services/teachers.service';
import { queryClient } from '../../lib/queryClient';
import { FormField } from '../../components/forms/FormField';
import { FormErrorSummary } from '../../components/forms/FormErrorSummary';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { useFormErrors } from '../../hooks/useFormErrors';
import { formatFullName } from '../../utils/format';

export const SubjectFormPage: React.FC = () => {
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
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      subjectCode: '',
      subjectName: '',
      grade: '',
      teacherId: '',
      description: '',
    },
  });

  const { rootError, handleApiError, clearErrors } = useFormErrors<SubjectFormData>(setError);

  // Load teachers for teacher association selector
  const { data: teachers } = useApiQuery({
    queryKey: ['teachers'],
    queryFn: () => teachersService.getTeachers(),
  });

  // Load existing subject in edit mode
  const { data: existingSubject, isLoading: loadingExisting } = useApiQuery({
    queryKey: ['subject', id],
    queryFn: () => subjectsService.getSubjectById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingSubject) {
      reset({
        subjectCode: existingSubject.subjectCode || '',
        subjectName: existingSubject.subjectName || '',
        grade: existingSubject.grade || '',
        teacherId: existingSubject.teacherId?.toString() || '',
        description: existingSubject.description || '',
      });
    }
  }, [existingSubject, reset]);

  const createMutation = useApiMutation({
    mutationFn: (data: SubjectFormData) => subjectsService.createSubject({
      ...data,
      teacherId: data.teacherId ? Number(data.teacherId) : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast('Curriculum subject created successfully!', 'success');
      navigate('/subjects');
    },
    onError: (err) => {
      handleApiError(err);
    },
  });

  const updateMutation = useApiMutation({
    mutationFn: (data: SubjectFormData) => subjectsService.updateSubject(id!, {
      ...data,
      teacherId: data.teacherId ? Number(data.teacherId) : undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast('Subject details updated successfully!', 'success');
      navigate('/subjects');
    },
    onError: (err) => {
      handleApiError(err);
    },
  });

  const onSubmit = async (data: SubjectFormData) => {
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
    return <div className="py-8 text-center text-xs text-slate-500">Loading subject details...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/subjects">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to Subjects
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {isEdit ? 'Edit Curriculum Subject' : 'Add New Subject'}
          </h1>
          <p className="text-xs text-slate-500">
            {isEdit ? 'Update course specifications' : 'Define course code and faculty leader'}
          </p>
        </div>
      </div>

      <Card padding="lg">
        <FormErrorSummary rootError={rootError} fieldErrors={errors} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField label="Subject Code" name="subjectCode" required error={errors.subjectCode?.message}>
            <Input
              id="subjectCode"
              placeholder="e.g. MATH-101, PHY-202"
              {...register('subjectCode')}
              error={errors.subjectCode?.message}
            />
          </FormField>

          <FormField label="Subject Name" name="subjectName" required error={errors.subjectName?.message}>
            <Input
              id="subjectName"
              placeholder="e.g. Advanced Mathematics"
              {...register('subjectName')}
              error={errors.subjectName?.message}
            />
          </FormField>

          <FormField label="Grade Level" name="grade" required error={errors.grade?.message}>
            <Input
              id="grade"
              placeholder="e.g. 10 or 11"
              {...register('grade')}
              error={errors.grade?.message}
            />
          </FormField>

          <FormField label="Assigned Faculty Teacher" name="teacherId" error={errors.teacherId?.message}>
            <Select id="teacherId" {...register('teacherId')} error={errors.teacherId?.message}>
              <option value="">Select an instructor...</option>
              {(teachers || []).map((t) => (
                <option key={t.id} value={t.id}>
                  {formatFullName(t.firstName, t.lastName)} ({t.department})
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Course Description" name="description" error={errors.description?.message}>
            <Textarea
              id="description"
              placeholder="Syllabus overview and course prerequisites"
              rows={3}
              {...register('description')}
            />
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to="/subjects">
              <Button variant="outline" type="button" disabled={isSubmitting}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              isLoading={isSubmitting}
              leftIcon={isEdit ? <Save className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
            >
              {isEdit ? 'Save Changes' : 'Create Subject'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
