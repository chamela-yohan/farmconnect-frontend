import { useTranslations } from 'next-intl';

export default function ChatPage() {
  const t = useTranslations('nav');
  
  return (
    <div className="container px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground">{t('chat')}</h1>
      <p className="text-muted-foreground mt-2">Your conversations will appear here.</p>
    </div>
  );
}