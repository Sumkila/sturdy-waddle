/**
 * Academic Result Create and Edit Page.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, GraduationCap } from 'lucide-react';
import { resultSchema, ResultFormData } from '../../utils/validation';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useApiMutation } from '../../hooks/useApiMutation';
import { resultsService } from '../../api/services/results.service';
import { studentsService } from '../../api/services/students.service';
import { subjectsService } from '../../api/services/subjects.service';
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

export const ResultFormPage: React.FC = () => {
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
  } = useForm<ResultFormData>({
    resolver: zodResolver(resultSchema),
    defaultValues: {
      studentId: '',
      subject: '',
      score: 80,
      maxScore: 100,
      term: 'Term 1',
      academicYear: '2026',
      remarks: '',
    },
  });

  const { rootError, handleApiError, clearErrors } = useFormErrors<ResultFormData>(setError);

  // Load students for dropdown selection
  const { data: students } = useApiQuery({
    queryKey: ['students'],
    queryFn: () => studentsService.getStudents(),
  });

  // Load subjects for dropdown selection
  const { data: subjects } = useApiQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsService.getSubjects(),
  });

  // Load existing result in edit mode
  const { data: existingResult, isLoading: loadingExisting } = useApiQuery({
    queryKey: ['result', id],
    queryFn: () => resultsService.getResultById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingResult) {
      reset({
        studentId: existingResult.studentId || '',
        subject: existingResult.subject || '',
        score: existingResult.score ?? 0,
        maxScore: existingResult.maxScore ?? 100,
        term: existingResult.term || 'Term 1',
        academicYear: existingResult.academicYear || '2026',
        remarks: existingResult.remarks || '',
      });
    }
  }, [existingResult, reset]);

  // Mutations
  const createMutation = useApiMutation({
    mutationFn: (data: ResultFormData) => resultsService.createResult(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      toast('Academic score recorded successfully!', 'success');
      navigate('/results');
    },
    onError: (err) => {
      handleApiError(err);
    },
  });

  const updateMutation = useApiMutation({
    mutationFn: (data: ResultFormData) => resultsService.updateResult(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      toast('Result record updated successfully.', 'success');
      navigate('/results');
    },
    onError: (err) => {
      handleApiError(err);
    },
  });

  const onSubmit = async (data: ResultFormData) => {
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
    return <div className="py-8 text-center text-xs text-slate-500">Loading result data...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/results">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to Results
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {isEdit ? 'Edit Academic Result' : 'Record Academic Result'}
          </h1>
          <p className="text-xs text-slate-500">
            {isEdit ? 'Modify recorded student grade' : 'Submit subject evaluation and score'}
          </p>
        </div>
      </div>

      <Card padding="lg">
        <FormErrorSummary rootError={rootError} fieldErrors={errors} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField label="Student" name="studentId" required error={errors.studentId?.message}>
            <Select id="studentId" {...register('studentId')} error={errors.studentId?.message}>
              <option value="">Select a student...</option>
              {(students || []).map((s) => (
                <option key={s.id} value={s.id}>
                  {formatFullName(s.firstName, s.lastName)} (ID: {s.studentNumber} · {s.className})
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Subject" name="subject" required error={errors.subject?.message}>
            {subjects && subjects.length > 0 ? (
              <Select id="subject" {...register('subject')} error={errors.subject?.message}>
                <option value="">Select subject...</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.subjectName}>
                    {sub.subjectName} ({sub.subjectCode})
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                id="subject"
                placeholder="e.g. Mathematics, Physics, English"
                {...register('subject')}
                error={errors.subject?.message}
              />
            )}
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Score" name="score" required error={errors.score?.message}>
              <Input
                id="score"
                type="number"
                min="0"
                max="100"
                step="0.5"
                {...register('score', { valueAsNumber: true })}
                error={errors.score?.message}
              />
            </FormField>

            <FormField label="Max Score" name="maxScore" required error={errors.maxScore?.message}>
              <Input
                id="maxScore"
                type="number"
                min="1"
                {...register('maxScore', { valueAsNumber: true })}
                error={errors.maxScore?.message}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Term / Session" name="term" error={errors.term?.message}>
              <Input id="term" placeholder="e.g. Midterm, Term 1, Final" {...register('term')} />
            </FormField>

            <FormField label="Academic Year" name="academicYear" error={errors.academicYear?.message}>
              <Input id="academicYear" placeholder="e.g. 2026" {...register('academicYear')} />
            </FormField>
          </div>

          <FormField label="Evaluator Remarks" name="remarks" error={errors.remarks?.message}>
            <Textarea
              id="remarks"
              placeholder="Optional teacher notes or improvement guidance"
              rows={3}
              {...register('remarks')}
            />
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to="/results">
              <Button variant="outline" type="button" disabled={isSubmitting}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              isLoading={isSubmitting}
              leftIcon={isEdit ? <Save className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
            >
              {isEdit ? 'Update Grade' : 'Record Grade'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
