/** A section's heading with an optional line under it. Stacked, never split into two columns. */
export function SectionHeading({ title, body, as: Tag = "h2", className = "" }: { title: string; body?: string; as?: "h1" | "h2" | "h3"; className?: string }) {
  return (
    <div className={`flex max-w-3xl flex-col gap-4 ${className}`}>
      <Tag className="text-4xl font-medium sm:text-5xl lg:text-6xl">{title}</Tag>
      {body ? <p className="max-w-[60ch] text-lg leading-relaxed text-ink-muted">{body}</p> : null}
    </div>
  );
}
