/**
 * Authentication Register Page.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GraduationCap, UserPlus } from 'lucide-react';
import { registerSchema, RegisterFormData } from '../../utils/validation';
import { useAuth } from '../../auth/useAuth';
import { FormField } from '../../components/forms/FormField';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FormErrorSummary } from '../../components/forms/FormErrorSummary';
import { useFormErrors } from '../../hooks/useFormErrors';
import { appConfig } from '../../config/appConfig';
import { useToast } from '../../components/ui/Toast';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      role: 'STUDENT',
    },
  });

  const { rootError, handleApiError, clearErrors } = useFormErrors<RegisterFormData>(setError);

  const onSubmit = async (data: RegisterFormData) => {
    clearErrors();
    setIsSubmitting(true);
    try {
      await authRegister(data);
      toast('Account registered successfully!', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col justify-center py-12 sm:px-6 lg:px-8 antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-slate-900 text-sky-400 mb-4 shadow-sm">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create an Account
        </h1>
        <p className="mt-1 text-xs text-slate-600">
          Register with {appConfig.appName}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card padding="lg" className="shadow-lg">
          <FormErrorSummary rootError={rootError} fieldErrors={errors} />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField
              label="Username"
              name="username"
              required
              error={errors.username?.message}
            >
              <Input
                id="username"
                autoComplete="username"
                placeholder="e.g. jdoe"
                {...register('username')}
                error={errors.username?.message}
              />
            </FormField>

            <FormField
              label="Email Address"
              name="email"
              required
              error={errors.email?.message}
            >
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@school.edu"
                {...register('email')}
                error={errors.email?.message}
              />
            </FormField>

            <FormField
              label="Password"
              name="password"
              required
              error={errors.password?.message}
              description="Minimum 6 characters"
            >
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                {...register('password')}
                error={errors.password?.message}
              />
            </FormField>

            <FormField
              label="System Role"
              name="role"
              required
              error={errors.role?.message}
            >
              <Select id="role" {...register('role')} error={errors.role?.message}>
                <option value="STUDENT">Student</option>
                <option value="PARENT">Parent / Guardian</option>
                <option value="TEACHER">Teacher</option>
                <option value="PRINCIPAL">Principal</option>
                <option value="ADMIN">Administrator</option>
              </Select>
            </FormField>

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isSubmitting}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Register Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-sky-700 hover:text-sky-800 underline">
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
