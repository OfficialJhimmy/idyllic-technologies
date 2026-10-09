type Props = { id: string; title: string; description?: string; children: React.ReactNode };

/** One part of the product form. A hairline above separates it from the last, no card needed. */
export function Section({ id, title, description, children }: Props) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="flex scroll-mt-24 flex-col gap-5 border-t border-line pt-8 first:border-t-0 first:pt-0">
      <div className="flex flex-col gap-1">
        <h2 id={`${id}-heading`} className="text-xl font-medium">
          {title}
        </h2>
        {description ? <p className="max-w-[65ch] text-ink-muted">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
