"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User, Leaf, Loader2, ShoppingBag, Sprout, Phone } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';

// Zod Schema
const registerSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    mobileNumber: z.string().min(9, "Mobile number is required"), // Sri Lankan numbers are 9-10 digits
    role: z.enum(["BUYER", "FARMER"], {
      error: "Please select a role",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'BUYER',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setApiError('');
    try {
      await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        mobileNumber: data.mobileNumber, // Send to backend
        role: data.role,
      });
      
      router.push(`/${locale}/login`);
    } catch (error: any) {
      setApiError(error.response?.data?.message || 'Registration failed. Please try again.');
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
          <h1 className="text-3xl font-bold text-foreground">{t('auth.register.title')}</h1>
          <p className="text-muted-foreground">{t('auth.register.subtitle')}</p>
        </div>

        {/* Form Card */}
        <div className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-sm space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t('auth.register.roleLabel')}</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue('role', 'BUYER')}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                    selectedRole === 'BUYER' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-border hover:border-muted-foreground/50 text-muted-foreground'
                  }`}
                >
                  <ShoppingBag className="w-6 h-6 mb-2" />
                  <span className="font-medium text-sm">{t('auth.register.buyer')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setValue('role', 'FARMER')}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                    selectedRole === 'FARMER' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-border hover:border-muted-foreground/50 text-muted-foreground'
                  }`}
                >
                  <Sprout className="w-6 h-6 mb-2" />
                  <span className="font-medium text-sm">{t('auth.register.farmer')}</span>
                </button>
              </div>
              {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
            </div>

            {/* Full Name Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t('common.fullName')}</label>
              <Input 
                type="text" 
                placeholder="John Doe" 
                icon={<User className="w-5 h-5" />}
                error={errors.name?.message}
                {...register('name')} 
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

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

            {/* Mobile Number Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t('common.mobileNumber')}</label>
              <Input 
                type="tel" 
                placeholder="07X XXX XXXX" 
                icon={<Phone className="w-5 h-5" />}
                error={errors.mobileNumber?.message}
                {...register('mobileNumber')} 
              />
              {errors.mobileNumber && <p className="text-sm text-destructive">{errors.mobileNumber.message}</p>}
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

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t('auth.register.confirmPassword')}</label>
              <div className="relative">
                <Input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  icon={<Lock className="w-5 h-5" />}
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')} 
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
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
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('auth.register.submit')}
            </button>
          </form>

          {/* Footer Link */}
          <p className="text-center text-sm text-muted-foreground">
            {t('auth.register.hasAccount')}{' '}
            <a href={`/${locale}/login`} className="font-medium text-primary hover:underline">
              {t('auth.register.loginLink')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}