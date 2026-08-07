export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="9" fill="hsl(var(--primary))" />
      <path d="M16 19 C10 19 6 15 6 9 C12 9 16 13 16 19 Z" fill="white" />
      <path d="M16 19 C22 19 26 15 26 9 C20 9 16 13 16 19 Z" fill="white" fillOpacity="0.85" />
      <path d="M16 19 C15 22 15 24.5 16 27" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}