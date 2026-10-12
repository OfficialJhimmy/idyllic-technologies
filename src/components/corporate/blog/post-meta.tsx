import { CalendarBlank, Clock, Folder } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { formatDate } from "@/components/corporate/format";

type Props = { publishedAt: string; authorName: string | null; categoryName: string | null; categorySlug: string | null; minutes: number };

const pill = "inline-flex min-h-12 items-center gap-3 rounded-full border border-line bg-surface py-1.5 pr-5 pl-1.5";
const badge = "flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary";

/** Who wrote it, when, how long it takes and where it is filed, each with an icon, as a row of pills. */
export function PostMeta({ publishedAt, authorName, categoryName, categorySlug, minutes }: Props) {
  return (
    <ul className="flex flex-wrap gap-3" aria-label="About this post">
      <li className={pill}>
        <span className={badge}>
          <CalendarBlank size={20} weight="duotone" aria-hidden />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-xs text-ink-muted">Published</span>
          <time dateTime={publishedAt} className="font-medium">
            {formatDate(publishedAt)}
          </time>
        </span>
      </li>
      {authorName ? (
        <li className={pill}>
          <span className={`${badge} bg-action font-heading text-lg font-medium text-on-action`} aria-hidden>
            {authorName.trim().charAt(0).toUpperCase()}
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-xs text-ink-muted">Written by</span>
            <span className="font-medium">{authorName}</span>
          </span>
        </li>
      ) : null}
      <li className={pill}>
        <span className={badge}>
          <Clock size={20} weight="duotone" aria-hidden />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-xs text-ink-muted">Reading time</span>
          <span className="font-medium tabular-nums">{minutes} min read</span>
        </span>
      </li>
      {categoryName && categorySlug ? (
        <li>
          <Link href={`/blog?category=${categorySlug}`} className={`${pill} transition-[background-color,transform] duration-150 hover:bg-sunken active:scale-[0.98]`}>
            <span className={badge}>
              <Folder size={20} weight="duotone" aria-hidden />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-xs text-ink-muted">Filed under</span>
              <span className="font-medium">{categoryName}</span>
            </span>
          </Link>
        </li>
      ) : null}
    </ul>
  );
}
