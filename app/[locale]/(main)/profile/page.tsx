"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useLocale, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';
import { SuccessModal } from '@/components/ui/SuccessModal';

const LocationPicker = dynamic(() => import('@/components/map/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-96 w-full bg-muted animate-pulse rounded-lg flex items-center justify-center text-muted-foreground">
      Loading Map...
    </div>
  )
});

export default function ProfilePage() {
  const { user, login } = useAuthStore();
  const locale = useLocale();
  const t = useTranslations('profile');

  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    address: '',
    city: '',
    latitude: 6.9271,
    longitude: 79.8612,
    profilePictureUrl: '',
  });

  const [previewImage, setPreviewImage] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingUser, setIsFetchingUser] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch fresh user data
  useEffect(() => {
    const fetchFreshUserData = async () => {
      try {
        const response = await api.get('/users/me');
        const freshUser = response.data.data;
        
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        if (accessToken && refreshToken) {
          login(freshUser, accessToken, refreshToken);
        }
        
        setFormData({
          name: freshUser.name || '',
          mobileNumber: freshUser.mobileNumber || '',
          address: freshUser.address || '',
          city: freshUser.city || '',
          latitude: freshUser.lat ?? 6.9271,
          longitude: freshUser.lon ?? 79.8612,
          profilePictureUrl: freshUser.profilePictureUrl || '',
        });
      } catch (error) {
        console.error("Failed to fetch fresh user data:", error);
        
        if (user) {
          setFormData({
            name: user.name || '',
            mobileNumber: user.mobileNumber || '',
            address: user.address || '',
            city: user.city || '',
            latitude: user.lat ?? 6.9271,
            longitude: user.lon ?? 79.8612,
            profilePictureUrl: user.profilePictureUrl || '',
          });
        }
      } finally {
        setIsFetchingUser(false);
      }
    };

    fetchFreshUserData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    //  Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    //  Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    //  Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    setSelectedFile(file);
  };

  const uploadProfilePicture = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formDataPayload = new FormData();
    formDataPayload.append('file', selectedFile);

    try {
      const response = await api.post('/users/profile-picture', formDataPayload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Clear preview after successful upload
      setPreviewImage('');
      setSelectedFile(null);
      
      return response.data.data; // Return the presigned URL
    } catch (error) {
      console.error('Upload failed', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      //  Upload new profile picture if selected
      let newProfilePictureUrl = formData.profilePictureUrl;
      if (selectedFile) {
        newProfilePictureUrl = await uploadProfilePicture();
      }

      const updateData = {
        name: formData.name,
        mobileNumber: formData.mobileNumber,
        address: formData.address,
        city: formData.city,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      const response = await api.put('/users/profile', updateData);
      const updatedUser = response.data.data;
      
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      if (accessToken && refreshToken) {
        login(updatedUser, accessToken, refreshToken);
      }
      
      //  Show success modal
      setSuccessMessage('Your profile has been updated successfully!');
      setShowSuccessModal(true);
      
    } catch (error: any) {
      console.error("Backend Error:", error.response?.data);
      alert(`Failed to update profile: ${error.response?.data?.message || 'Please try again'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    // Refresh page after closing modal
    window.location.reload();
  };

  if (isFetchingUser) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Please log in to view your profile.</p>
      </div>
    );
  }

  //  Use preview image if available, otherwise use stored profile picture
  const displayImage = previewImage || formData.profilePictureUrl;

  return (
    <>
      <div className="container px-4 py-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Picture */}
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-primary/20">
              {displayImage ? (
                <img 
                  src={displayImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-primary bg-primary/10">
                  {formData.name.charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Uploading Overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">{t('uploadPicture')}</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload}
                disabled={isUploading}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {selectedFile ? `Selected: ${selectedFile.name}` : 'PNG, JPG up to 5MB'}
              </p>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">{t('name')}</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                className="w-full p-3 border rounded-lg bg-background" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('mobile')}</label>
              <input 
                type="tel" 
                value={formData.mobileNumber} 
                onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})} 
                className="w-full p-3 border rounded-lg bg-background" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('city')}</label>
              <input 
                type="text" 
                value={formData.city} 
                onChange={(e) => setFormData({...formData, city: e.target.value})} 
                className="w-full p-3 border rounded-lg bg-background" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('address')}</label>
              <input 
                type="text" 
                value={formData.address} 
                onChange={(e) => setFormData({...formData, address: e.target.value})} 
                className="w-full p-3 border rounded-lg bg-background" 
              />
            </div>
          </div>

          {/* Location Map (Farmers Only) */}
          {user.role === 'FARMER' && (
            <div>
              <label className="block text-sm font-medium mb-2">{t('farmLocation')}</label>
              <div className="h-96 rounded-lg overflow-hidden border z-0 relative">
                <LocationPicker 
                  lat={formData.latitude} 
                  lon={formData.longitude} 
                  onLocationChange={(lat, lon) => setFormData({...formData, latitude: lat, longitude: lon})}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">{t('mapHint')}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading || isUploading}
            className="w-full md:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isLoading ? t('saving') : t('save')}
          </button>
        </form>
      </div>

      {/* Success Modal */}
      <SuccessModal 
        isOpen={showSuccessModal}
        message={successMessage}
        onClose={handleModalClose}
      />
    </>
  );
}