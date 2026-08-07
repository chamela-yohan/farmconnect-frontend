export function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 400 300"
      className="absolute inset-0 w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="70" cy="60" r="90" fill="hsl(var(--primary))" fillOpacity="0.08" />
      <circle cx="340" cy="230" r="110" fill="hsl(var(--secondary))" fillOpacity="0.12" />
      <path d="M0 260 Q200 210 400 260 L400 300 L0 300 Z" fill="hsl(var(--primary))" fillOpacity="0.15" />
      <g transform="translate(200 190)">
        <path d="M0 60 C-4 30 -2 10 0 -10" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" fill="none" />
        <g transform="rotate(-40)">
          <path d="M0 0 C-14 -4 -18 -18 -14 -32 C2 -30 8 -14 0 0 Z" fill="hsl(var(--primary))" />
        </g>
        <g transform="rotate(-10) scale(1.1)">
          <path d="M0 0 C-14 -4 -18 -18 -14 -32 C2 -30 8 -14 0 0 Z" fill="hsl(var(--primary))" fillOpacity="0.85" />
        </g>
        <g transform="rotate(22) scale(0.9)">
          <path d="M0 0 C-14 -4 -18 -18 -14 -32 C2 -30 8 -14 0 0 Z" fill="hsl(var(--primary))" fillOpacity="0.7" />
        </g>
        <g transform="rotate(52) scale(1.05)">
          <path d="M0 0 C-14 -4 -18 -18 -14 -32 C2 -30 8 -14 0 0 Z" fill="hsl(var(--secondary))" />
        </g>
        <circle cx="-8" cy="-46" r="6" fill="hsl(var(--secondary))" />
        <circle cx="18" cy="-40" r="5" fill="hsl(var(--secondary))" fillOpacity="0.8" />
        <circle cx="4" cy="-56" r="4" fill="hsl(var(--primary))" />
      </g>
    </svg>
  );
}