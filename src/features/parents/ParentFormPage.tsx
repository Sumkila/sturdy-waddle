/**
 * Parent Create and Edit Form Page.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, HeartHandshake } from 'lucide-react';
import { parentSchema, ParentFormData } from '../../utils/validation';
import { useApiQuery } from '../../hooks/useApiQuery';
import { useApiMutation } from '../../hooks/useApiMutation';
import { parentsService } from '../../api/services/parents.service';
import { queryClient } from '../../lib/queryClient';
import { FormField } from '../../components/forms/FormField';
import { FormErrorSummary } from '../../components/forms/FormErrorSummary';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { useFormErrors } from '../../hooks/useFormErrors';

export const ParentFormPage: React.FC = () => {
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
  } = useForm<ParentFormData>({
    resolver: zodResolver(parentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      address: '',
      relationship: 'Mother',
    },
  });

  const { rootError, handleApiError, clearErrors } = useFormErrors<ParentFormData>(setError);

  const { data: existingParent, isLoading: loadingExisting } = useApiQuery({
    queryKey: ['parent', id],
    queryFn: () => parentsService.getParentById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingParent) {
      reset({
        firstName: existingParent.firstName || '',
        lastName: existingParent.lastName || '',
        phoneNumber: existingParent.phoneNumber || '',
        email: existingParent.email || '',
        address: existingParent.address || '',
        relationship: existingParent.relationship || 'Guardian',
      });
    }
  }, [existingParent, reset]);

  const createMutation = useApiMutation({
    mutationFn: (data: ParentFormData) => parentsService.createParent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      toast('Guardian record registered successfully!', 'success');
      navigate('/parents');
    },
    onError: (err) => {
      handleApiError(err);
    },
  });

  const updateMutation = useApiMutation({
    mutationFn: (data: ParentFormData) => parentsService.updateParent(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      toast('Guardian profile updated successfully!', 'success');
      navigate('/parents');
    },
    onError: (err) => {
      handleApiError(err);
    },
  });

  const onSubmit = async (data: ParentFormData) => {
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
    return <div className="py-8 text-center text-xs text-slate-500">Loading guardian record...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/parents">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to Guardians
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {isEdit ? 'Edit Guardian Record' : 'Register New Parent / Guardian'}
          </h1>
          <p className="text-xs text-slate-500">
            {isEdit ? 'Update contact info and student linkages' : 'Create parent contact profile'}
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
                placeholder="e.g. Maria"
                {...register('firstName')}
                error={errors.firstName?.message}
              />
            </FormField>

            <FormField label="Last Name" name="lastName" required error={errors.lastName?.message}>
              <Input
                id="lastName"
                placeholder="e.g. Santos"
                {...register('lastName')}
                error={errors.lastName?.message}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone Number" name="phoneNumber" required error={errors.phoneNumber?.message} description="Can include international prefix like +1...">
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="e.g. +1 555-0182"
                {...register('phoneNumber')}
                error={errors.phoneNumber?.message}
              />
            </FormField>

            <FormField label="Relationship" name="relationship" error={errors.relationship?.message}>
              <Input
                id="relationship"
                placeholder="e.g. Mother, Father, Guardian"
                {...register('relationship')}
              />
            </FormField>
          </div>

          <FormField label="Email Address" name="email" required error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              placeholder="parent@example.com"
              {...register('email')}
              error={errors.email?.message}
            />
          </FormField>

          <FormField label="Residential Address" name="address" error={errors.address?.message}>
            <Textarea
              id="address"
              placeholder="Home street, city, state, zip"
              rows={2}
              {...register('address')}
            />
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to="/parents">
              <Button variant="outline" type="button" disabled={isSubmitting}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              isLoading={isSubmitting}
              leftIcon={isEdit ? <Save className="w-4 h-4" /> : <HeartHandshake className="w-4 h-4" />}
            >
              {isEdit ? 'Save Changes' : 'Register Guardian'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
