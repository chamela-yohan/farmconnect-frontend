"use client";

import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export function GoogleLoginButton() {
  const t = useTranslations('auth');
  const router = useRouter();
  const locale = useLocale();
  const { login } = useAuthStore();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      const response = await api.post('/auth/google', {
        idToken: credentialResponse.credential
      });
      
      const { accessToken, user } = response.data.data;
      login(user, accessToken);
      
      // Check if profile is complete
      if (!user.profileComplete) {
        router.push(`/${locale}/complete-profile`);
      } else {
        if (user.role === 'FARMER') {
          router.push(`/${locale}/dashboard/farmer`);
        } else {
          router.push(`/${locale}/dashboard/buyer`);
        }
      }
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  const handleError = () => {
    console.error('Google login failed');
  };

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}  // Disable OneTap to avoid FedCM issues
        auto_select={false}  // Disable auto-select
        text="signin_with"
        shape="rectangular"
        width="100%"
      />
    </div>
  );
}