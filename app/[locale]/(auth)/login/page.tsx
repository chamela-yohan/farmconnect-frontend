"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Leaf, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { login } = useAuthStore();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setApiError('');
    try {
      const response = await api.post('/auth/login', data);
      const { accessToken, user } = response.data.data;
      
      login(user, accessToken);
      
      if (user.role === 'FARMER') {
        router.push('/en/dashboard/farmer');
      } else {
        router.push('/en/dashboard/buyer');
      }
    } catch (error: any) {
      setApiError(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <Leaf className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">{t('auth.login.title')}</h1>
          <p className="text-muted-foreground">{t('auth.login.subtitle')}</p>
        </div>

        {/* Form Card */}
        <div className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-sm space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t('common.email')}</label>
              <Input 
                type="email" 
                placeholder="you@example.com" 
                icon={<Mail className="w-5 h-5" />}
                error={errors.email?.message}
                {...register('email')} 
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t('common.password')}</label>
              <div className="relative">
                <Input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  icon={<Lock className="w-5 h-5" />}
                  error={errors.password?.message}
                  {...register('password')} 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>

            {/* API Error Message */}
            {apiError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive text-center">
                {apiError}
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('auth.login.submit')}
            </button>
          </form>

          {/* Footer Link */}
          <p className="text-center text-sm text-muted-foreground">
            {t('auth.login.noAccount')}{' '}
            <a href={`/${locale}/register`} className="font-medium text-primary hover:underline">
              {t('auth.login.registerLink')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}