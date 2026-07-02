"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Sprout, Loader2, User } from 'lucide-react';
import { api } from '@/lib/api';

export default function CompleteProfilePage() {
  const { user, login } = useAuthStore();
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    role: 'BUYER' as 'BUYER' | 'FARMER',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token || !user) {
      router.push(`/${locale}/login`);
    } else if (user.profileComplete) {
      router.push(`/${locale}/dashboard/${user.role.toLowerCase()}`);
    }
  }, [user, router, locale]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setApiError('');
    
    try {
      const response = await api.put('/users/profile', formData);
      const updatedUser = response.data.data;
      
      // ✅ Get BOTH tokens from localStorage
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (accessToken && refreshToken) {
        // ✅ Pass all three to the store so refresh tokens work!
        login({ ...updatedUser, profileComplete: true }, accessToken, refreshToken);
      }
      
      router.push(`/${locale}/dashboard/${formData.role.toLowerCase()}`);
    } catch (error: any) {
      console.error("Complete profile error:", error);
      setApiError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-md space-y-8">
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

        <div className="bg-card p-6 md:p-8 rounded-xl border border-border shadow-sm space-y-6">
          <form onSubmit={onSubmit} className="space-y-4">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('profile.complete.roleLabel')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'BUYER'})}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                    formData.role === 'BUYER' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-border hover:border-muted-foreground/50 text-muted-foreground'
                  }`}
                >
                  <ShoppingBag className="w-6 h-6 mb-2" />
                  <span className="font-medium text-sm">{t('auth.register.buyer')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'FARMER'})}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                    formData.role === 'FARMER' 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-border hover:border-muted-foreground/50 text-muted-foreground'
                  }`}
                >
                  <Sprout className="w-6 h-6 mb-2" />
                  <span className="font-medium text-sm">{t('auth.register.farmer')}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('common.fullName')}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full h-11 px-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('common.mobileNumber')}
              </label>
              <input
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
                className="w-full h-11 px-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="07X XXX XXXX"
                required
              />
            </div>

            {apiError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive text-center">
                {apiError}
              </div>
            )}

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