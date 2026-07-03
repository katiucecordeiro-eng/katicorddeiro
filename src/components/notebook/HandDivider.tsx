export function HandDivider({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 8"
      preserveAspectRatio="none"
      className={`h-2 w-full text-gold ${className}`}
      aria-hidden="true"
    >
      <path
        d="M0 4 Q 10 0, 20 4 T 40 4 T 60 4 T 80 4 T 100 4 T 120 4 T 140 4 T 160 4 T 180 4 T 200 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
