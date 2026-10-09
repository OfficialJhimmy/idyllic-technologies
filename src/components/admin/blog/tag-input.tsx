"use client";

import { Plus, X } from "@phosphor-icons/react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { controlClass } from "@/components/ui/field";
import { normaliseTagName } from "@/lib/blog/publish";

type Props = { id: string; label: string; value: string[]; onChange: (tags: string[]) => void; suggestions: string[]; error?: string };

const MAX_TAGS = 15;

/** Type a tag and press Enter, a comma, or Add. Existing tags are suggested, new ones are created on save. */
export function TagInput({ id, label, value, onChange, suggestions, error }: Props) {
  const [text, setText] = useState("");
  const listId = useId();
  const errorId = error ? `${id}-error` : undefined;

  function add(raw: string) {
    const name = normaliseTagName(raw);
    setText("");
    if (!name) return;
    if (value.some((t) => t.toLowerCase() === name.toLowerCase())) return;
    if (value.length >= MAX_TAGS) return;
    onChange([...value, name]);
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <li key={tag} className="flex items-center gap-1 rounded-full bg-sunken py-1 pr-1 pl-4">
              <span>{tag}</span>
              <button type="button" aria-label={`Remove tag ${tag}`} onClick={() => onChange(value.filter((t) => t !== tag))} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-line">
                <X size={16} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="flex gap-2">
        <input
          id={id}
          list={listId}
          value={text}
          disabled={value.length >= MAX_TAGS}
          maxLength={40}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          onChange={(e) => (e.target.value.endsWith(",") ? add(e.target.value.slice(0, -1)) : setText(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(text);
            }
          }}
          className={controlClass(Boolean(error), "h-12 min-w-0 flex-1")}
        />
        <datalist id={listId}>
          {suggestions.filter((s) => !value.includes(s)).map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <Button variant="secondary" size="lg" onClick={() => add(text)} disabled={!text.trim()}>
          <Plus size={18} aria-hidden /> Add
        </Button>
      </div>
      <p className="text-sm text-ink-muted">Up to {MAX_TAGS} tags. Press Enter or type a comma to add one.</p>
      {error ? (
        <p id={errorId} className="text-sm text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
