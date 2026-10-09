type Props = { title: string; description?: string; actions?: React.ReactNode; back?: React.ReactNode };

export function PageHeader({ title, description, actions, back }: Props) {
  return (
    <header className="flex flex-col gap-4">
      {back}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="text-3xl font-medium sm:text-4xl">{title}</h1>
          {description ? <p className="max-w-[65ch] text-ink-muted">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
