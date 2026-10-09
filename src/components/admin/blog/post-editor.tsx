"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { savePostAction } from "@/app/admin/(panel)/blog/actions";
import { ImageField } from "@/components/admin/catalogue/image-field";
import { Section } from "@/components/admin/form-section";
import { RichTextField } from "@/components/admin/blog/rich-text-field";
import { TagInput } from "@/components/admin/blog/tag-input";
import { StatusPanel } from "@/components/admin/product-editor/status-panel";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Field } from "@/components/ui/field";
import { SelectField } from "@/components/ui/select-field";
import { FormBanner } from "@/components/ui/states";
import { TextareaField } from "@/components/ui/textarea-field";
import { track } from "@/lib/analytics";
import { postDraftToPayload } from "@/lib/blog/draft";
import type { AuthorOption, CategoryOption, PostDraft } from "@/lib/blog/types";
import type { PublishStatus, StatusAction } from "@/lib/catalogue/publish";
import { slugify } from "@/lib/catalogue/slug";

type Props = {
  initial: PostDraft;
  status: PublishStatus;
  publishedAt: string | null;
  updatedAt: string | null;
  authors: AuthorOption[];
  categories: CategoryOption[];
  tagSuggestions: string[];
  siteUrl: string;
};

const sections = [
  ["content", "Content"],
  ["details", "Details"],
  ["seo", "Search and sharing"],
] as const;

const snapshot = (d: PostDraft) => JSON.stringify(d);

export function PostEditor({ initial, status: initialStatus, publishedAt: initialPublishedAt, updatedAt, authors, categories, tagSuggestions, siteUrl }: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState(initial);
  const [baseline, setBaseline] = useState(() => snapshot(initial));
  const [status, setStatus] = useState(initialStatus);
  const [publishedAt, setPublishedAt] = useState(initialPublishedAt);
  const [savedAt, setSavedAt] = useState(updatedAt);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [issues, setIssues] = useState<string[]>([]);
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const failedOnce = useRef(false);

  const dirty = snapshot(draft) !== baseline;
  const isNew = draft.id === null;
  const update = useCallback((patch: Partial<PostDraft>) => setDraft((d) => ({ ...d, ...patch })), []);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  useEffect(() => {
    if (!failedOnce.current) return;
    failedOnce.current = false;
    document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [errors]);

  const save = useCallback(
    (action?: StatusAction) => {
      setErrors({});
      setIssues([]);
      setMessage(null);
      startTransition(async () => {
        const result = await savePostAction(postDraftToPayload(draft), action);
        track("admin_post_save", { status: result.ok ? result.status : status, ok: result.ok });

        if (!result.ok) {
          failedOnce.current = Boolean(result.fieldErrors);
          setErrors(result.fieldErrors ?? {});
          setIssues(result.issues ?? []);
          const count = Object.keys(result.fieldErrors ?? {}).length;
          setMessage({ tone: "error", text: result.error ?? (count ? `${count} field${count === 1 ? "" : "s"} need attention` : "Could not save") });
          return;
        }

        setStatus(result.status);
        setIssues(result.issues);
        setBaseline(snapshot(draft));
        setSavedAt(new Date().toISOString());
        if (result.status === "published" && !publishedAt) setPublishedAt(new Date().toISOString());
        setMessage(result.issues.length ? null : { tone: "success", text: action === "publish" ? "Published" : "Saved" });

        if (isNew) router.replace(`/admin/blog/${result.id}`);
        else {
          setDraft((d) => ({ ...d, id: result.id }));
          router.refresh();
        }
      });
    },
    [draft, status, publishedAt, isNew, router],
  );

  const errorCount = Object.keys(errors).length;
  const panel = (
    <StatusPanel noun="post" status={status} isNew={isNew} dirty={dirty} pending={pending} publishedAt={publishedAt} savedAt={savedAt} issues={issues} message={message} onSave={save} />
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "s") {
          e.preventDefault();
          save();
        }
      }}
      className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14"
      noValidate
    >
      <div className="flex min-w-0 flex-col gap-10 pb-28 lg:pb-0">
        {errorCount > 0 ? <FormBanner tone="error">{errorCount} field{errorCount === 1 ? "" : "s"} need attention. They are marked below.</FormBanner> : null}

        <Section id="content" title="Content">
          <Field
            id="post-title"
            label="Title"
            value={draft.title}
            error={errors.title}
            maxLength={200}
            required
            onChange={(e) => {
              const title = e.target.value;
              update({ title, ...(draft.slugEdited ? {} : { slug: slugify(title) }) });
            }}
          />
          <Field
            id="post-slug"
            label="URL slug"
            hint={`Post address: ${siteUrl}/blog/${draft.slug || "slug"}`}
            value={draft.slug}
            error={errors.slug}
            required
            onChange={(e) => update({ slug: e.target.value, slugEdited: true })}
          />
          <TextareaField id="post-excerpt" label="Excerpt" hint="Shown on blog cards and in search results. Required to publish." value={draft.excerpt} error={errors.excerpt} maxLength={500} rows={3} onChange={(e) => update({ excerpt: e.target.value })} />
          <RichTextField id="post-body" label="Body" initialHtml={initial.body} error={errors.body} onChange={(body) => update({ body })} />
        </Section>

        <Section id="details" title="Details">
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              id="post-author"
              label="Author"
              emptyLabel="Choose an author"
              options={authors.map((a) => ({ value: a.id, label: a.name }))}
              value={draft.authorId ?? ""}
              error={errors.authorId}
              hint={authors.length === 0 ? undefined : "Required to publish."}
              onChange={(e) => update({ authorId: e.target.value || null })}
            />
            <SelectField
              id="post-category"
              label="Category"
              emptyLabel="No category"
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              value={draft.categoryId ?? ""}
              error={errors.categoryId}
              onChange={(e) => update({ categoryId: e.target.value || null })}
            />
          </div>
          {authors.length === 0 ? (
            <p className="text-sm text-ink-muted">
              There are no authors yet.{" "}
              <Link href="/admin/blog/authors/new" className="text-action underline underline-offset-4">Add one</Link> before publishing.
            </p>
          ) : null}
          <TagInput id="post-tags" label="Tags" value={draft.tags} suggestions={tagSuggestions} error={errors.tags} onChange={(tags) => update({ tags })} />
          <DateTimePicker
            id="post-date"
            label="Publication date"
            hint="Leave empty to use the time you publish. Choose an earlier date to back-date a post. Future dates are not available yet."
            value={draft.publishedAtLocal}
            error={errors.publishedAt}
            onChange={(publishedAtLocal) => update({ publishedAtLocal })}
          />
          <ImageField label="Featured image" value={draft.featuredImage} onChange={(featuredImage) => update({ featuredImage })} hint="Shown at the top of the post and on blog cards." />
        </Section>

        <Section id="seo" title="Search and sharing" description="Leave these blank to use the title and excerpt.">
          <Field id="post-seo-title" label="Search title" hint="About 60 characters or fewer reads best in search results." meta={`${draft.seoTitle.length}/120`} value={draft.seoTitle} error={errors.seoTitle} maxLength={120} onChange={(e) => update({ seoTitle: e.target.value })} />
          <TextareaField id="post-seo-description" label="Search description" hint="About 160 characters or fewer." value={draft.seoDescription} error={errors.seoDescription} maxLength={300} rows={3} onChange={(e) => update({ seoDescription: e.target.value })} />
          <ImageField label="Sharing image" value={draft.ogImage} onChange={(ogImage) => update({ ogImage })} hint="Shown when the post is shared. Leave blank to use the featured image." />
        </Section>
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-8 flex flex-col gap-8">
          {panel}
          <nav aria-label="Sections">
            <ul className="flex flex-col">
              {sections.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className="flex h-11 items-center text-ink-muted hover:text-ink">{label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-30 max-h-[60dvh] overflow-y-auto border-t border-line bg-surface px-4 py-3 lg:hidden">{panel}</div>
    </form>
  );
}
