/** Small spinning ring. Decorative: the text next to it says what is loading. Linear, because it is constant motion. */
export function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={`h-5 w-5 shrink-0 animate-spin ${className}`} style={{ animationDuration: "700ms" }} fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
