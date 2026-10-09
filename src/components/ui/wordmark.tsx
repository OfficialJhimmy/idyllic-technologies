import Image from "next/image";

/**
 * Logo mark plus the name set in the heading font. Used instead of the full logo file because the
 * full logo has black lettering that disappears on dark surfaces. TODO: ask Idyllic for a dark variant.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Image src="/brand/idyllic-mark.png" alt="" width={258} height={257} className="h-8 w-8" priority />
      <span className="font-heading text-lg font-medium tracking-tight text-ink">Idyllic Technologies</span>
    </span>
  );
}
