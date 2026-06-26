"use client";
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (newLocale: string) => {
    // Replace the current locale segment in the URL
    const segments = pathname.split('/');
    segments[1] = newLocale; 
    router.push(segments.join('/'));
  };

  return (
    <div className="flex gap-2 p-2 bg-card border border-border rounded-lg shadow-sm w-fit mx-auto">
      <button
        onClick={() => handleChange('en')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          locale === 'en' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'
        }`}
      >
        English
      </button>
      <button
        onClick={() => handleChange('si')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          locale === 'si' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'
        }`}
      >
        සිංහල
      </button>
      <button
        onClick={() => handleChange('ta')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          locale === 'ta' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'
        }`}
      >
        தமிழ்
      </button>
    </div>
  );
}