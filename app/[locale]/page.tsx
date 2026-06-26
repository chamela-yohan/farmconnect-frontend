import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';

export default function HomePage() {
  // Fetch translations for the 'home' namespace
  const t = useTranslations('home');
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 gap-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-5xl font-bold text-primary">
          {t('title')}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>
      
      <LanguageSwitcher />
    </main>
  );
}