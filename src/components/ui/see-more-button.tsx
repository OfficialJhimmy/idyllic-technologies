import { Spinner } from "@/components/ui/spinner";

type Props = {
  onClick: () => void;
  pending?: boolean;
  shown: number;
  total: number;
  /** What the items are called, for example "questions". */
  noun: string;
  label?: string;
};

/**
 * "See more" for short feeds that keep adding to the same list. It says how far along you are, announces
 * each batch to screen readers, and is a real button, so the keyboard works. Renders nothing when everything is shown.
 */
export function SeeMoreButton({ onClick, pending = false, shown, total, noun, label = "See more" }: Props) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p role="status" className="text-sm text-ink-muted tabular-nums">
        Showing {shown} of {total} {noun}
      </p>
      {shown < total ? (
        <button
          type="button"
          onClick={onClick}
          disabled={pending}
          aria-busy={pending || undefined}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line-strong bg-surface px-7 font-medium transition-[background-color,transform] duration-150 ease-[var(--ease-out-strong)] hover:bg-sunken active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60"
        >
          {pending ? <Spinner /> : null}
          {pending ? "Loading" : label}
        </button>
      ) : null}
    </div>
  );
}
