"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Phone, ShoppingBag, Sprout, Loader2, User } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

const profileSchema = z.object({
  mobileNumber: z.string().min(9, "Mobile number is required"),
  role: z.enum(["BUYER", "FARMER"], {
    error: "Please select a role",
  }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function CompleteProfilePage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { user, login } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      role: user?.role || 'BUYER',
    },
  });

  const selectedRole = watch('role');

  // Redirect if profile is already complete
  useEffect(() => {
    if (user?.profileComplete) {
      router.push(`/${locale}/dashboard/${user.role.toLowerCase()}`);
    }
  }, [user, router, locale]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    setApiError('');
    try {
      const response = await api.put('/users/profile', data);
      const updatedUser = response.data.data;
      
      // Update auth store with new user data
      const token = localStorage.getItem('accessToken');
      if (token) {
        login({ ...user!, ...updatedUser }, token);
      }
      
      // Redirect to dashboard
      router.push(`/${locale}/dashboard/${data.role.toLowerCase()}`);
    } catch (error: any) {
      setApiError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <User className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {t('profile.complete.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('profile.complete.subtitle')}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-sm space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('profile.complete.roleLabel')}
              </label>
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

            {/* Mobile Number Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('common.mobileNumber')}
              </label>
              <Input 
                type="tel" 
                placeholder="07X XXX XXXX" 
                icon={<Phone className="w-5 h-5" />}
                error={errors.mobileNumber?.message}
                {...register('mobileNumber')} 
              />
              {errors.mobileNumber && (
                <p className="text-sm text-destructive">{errors.mobileNumber.message}</p>
              )}
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
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('profile.complete.submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}