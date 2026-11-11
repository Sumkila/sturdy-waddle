/**
 * Authentication Login Page.
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GraduationCap, LogIn, KeyRound } from 'lucide-react';
import { loginSchema, LoginFormData } from '../../utils/validation';
import { useAuth } from '../../auth/useAuth';
import { FormField } from '../../components/forms/FormField';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FormErrorSummary } from '../../components/forms/FormErrorSummary';
import { useFormErrors } from '../../hooks/useFormErrors';
import { appConfig } from '../../config/appConfig';
import { UserRole } from '../../types/auth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const { rootError, handleApiError, clearErrors } = useFormErrors<LoginFormData>(setError);

  const onSubmit = async (data: LoginFormData) => {
    clearErrors();
    setIsSubmitting(true);
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const setDemoCredentials = (role: UserRole) => {
    const creds: Record<UserRole, { user: string; pass: string }> = {
      ADMIN: { user: 'admin', pass: 'admin123' },
      PRINCIPAL: { user: 'principal', pass: 'principal123' },
      TEACHER: { user: 'teacher', pass: 'teacher123' },
      PARENT: { user: 'parent', pass: 'parent123' },
      STUDENT: { user: 'student', pass: 'student123' },
    };
    const c = creds[role];
    setValue('username', c.user);
    setValue('password', c.pass);
  };

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col justify-center py-12 sm:px-6 lg:px-8 antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-slate-900 text-sky-400 mb-4 shadow-sm">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Sign in to {appConfig.appName}
        </h1>
        <p className="mt-1 text-xs text-slate-600">
          Enter your credentials to access your academic portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card padding="lg" className="shadow-lg">
          <FormErrorSummary
            title={rootError ? 'Sign-in failed' : undefined}
            rootError={rootError}
            fieldErrors={errors}
          />

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
                placeholder="e.g. jsmith or admin"
                {...register('username')}
                error={errors.username?.message}
              />
            </FormField>

            <FormField
              label="Password"
              name="password"
              required
              error={errors.password?.message}
            >
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register('password')}
                error={errors.password?.message}
              />
            </FormField>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Connecting to:</span>
              <code className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-mono">
                {appConfig.apiUrl}
              </code>
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
              leftIcon={<LogIn className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Pre-fills */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
              <KeyRound className="w-3.5 h-3.5 text-sky-600" />
              <span>Quick Demo Pre-fills:</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              {(['ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setDemoCredentials(r)}
                  className="px-2 py-1.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors cursor-pointer text-center truncate"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-sky-700 hover:text-sky-800 underline">
              Create an account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
