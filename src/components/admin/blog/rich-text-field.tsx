"use client";

import {
  ArrowUUpLeft,
  ArrowUUpRight,
  ImageSquare,
  LinkSimple,
  ListBullets,
  ListNumbers,
  Minus,
  Quotes,
  TextB,
  TextItalic,
  TextUnderline,
} from "@phosphor-icons/react";
import Image from "@tiptap/extension-image";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import { LinkDialog } from "@/components/admin/blog/link-dialog";
import { MediaPicker } from "@/components/admin/media/media-picker";
import { mediaUrl } from "@/lib/media/url";

type Props = {
  id: string;
  label: string;
  /** The HTML to start from. Later changes are reported through onChange, not read back from here. */
  initialHtml: string;
  onChange: (html: string) => void;
  error?: string;
};

const button =
  "flex h-11 min-w-11 shrink-0 items-center justify-center rounded-full px-3 text-[0.9375rem] font-medium transition-[background-color,color,transform] duration-150 active:scale-[0.95] disabled:opacity-40";

/**
 * Rich text body. Headings start at level 2 because the post title is the page's level 1. Only
 * formatting that survives the server's cleaning is offered, so what is written is what is published.
 */
export function RichTextField({ id, label, initialHtml, onChange, error }: Props) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const errorId = error ? `${id}-error` : undefined;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        strike: false,
        link: { openOnClick: false, defaultProtocol: "https" },
      }),
      Image,
    ],
    content: initialHtml,
    immediatelyRender: false,
    editorProps: {
      // Images must come from the media library, as the server enforces. Pasted ones from elsewhere are dropped here
      // so they do not appear and then vanish on save.
      transformPastedHTML: (html) => html.replace(/<img\b[^>]*>/gi, (tag) => (tag.includes(`src="${mediaUrl("")}`) ? tag : "")),
      attributes: {
        id,
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": label,
        ...(error ? { "aria-invalid": "true" } : {}),
        ...(errorId ? { "aria-describedby": errorId } : {}),
        class: "prose-admin min-h-96 max-w-none px-5 py-4 outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor?.isActive("bold") ?? false,
      italic: editor?.isActive("italic") ?? false,
      underline: editor?.isActive("underline") ?? false,
      h2: editor?.isActive("heading", { level: 2 }) ?? false,
      h3: editor?.isActive("heading", { level: 3 }) ?? false,
      bullet: editor?.isActive("bulletList") ?? false,
      ordered: editor?.isActive("orderedList") ?? false,
      quote: editor?.isActive("blockquote") ?? false,
      link: editor?.isActive("link") ?? false,
      href: (editor?.getAttributes("link").href as string | undefined) ?? "",
      canUndo: editor?.can().undo() ?? false,
      canRedo: editor?.can().redo() ?? false,
      words: editor ? editor.getText().split(/\s+/).filter(Boolean).length : 0,
    }),
  });

  if (!editor || !state) {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{label}</span>
        <div aria-busy className="min-h-96 animate-pulse rounded-input bg-sunken" />
      </div>
    );
  }

  const tool = (active: boolean) => `${button} ${active ? "bg-primary text-on-primary" : "text-ink hover:bg-sunken"}`;
  const chain = () => editor.chain().focus();

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <div className={`rounded-input border bg-surface transition-colors duration-150 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-action ${error ? "border-error" : "border-line-strong"}`}>
        {/* Pressing a toolbar button must not pull focus out of the text, or the cursor and selection are lost. */}
        <div role="toolbar" aria-label="Formatting" aria-controls={id} onMouseDown={(e) => e.preventDefault()} className="sticky top-0 z-10 flex flex-wrap gap-1 rounded-t-input border-b border-line bg-surface p-1.5">
          <button type="button" aria-label="Undo" title="Undo" disabled={!state.canUndo} onClick={() => chain().undo().run()} className={tool(false)}>
            <ArrowUUpLeft size={20} aria-hidden />
          </button>
          <button type="button" aria-label="Redo" title="Redo" disabled={!state.canRedo} onClick={() => chain().redo().run()} className={tool(false)}>
            <ArrowUUpRight size={20} aria-hidden />
          </button>
          <Divider />
          <button type="button" aria-pressed={state.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()} className={tool(state.h2)}>
            Heading
          </button>
          <button type="button" aria-pressed={state.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()} className={tool(state.h3)}>
            Subheading
          </button>
          <Divider />
          <button type="button" aria-label="Bold" title="Bold" aria-pressed={state.bold} onClick={() => chain().toggleBold().run()} className={tool(state.bold)}>
            <TextB size={20} aria-hidden />
          </button>
          <button type="button" aria-label="Italic" title="Italic" aria-pressed={state.italic} onClick={() => chain().toggleItalic().run()} className={tool(state.italic)}>
            <TextItalic size={20} aria-hidden />
          </button>
          <button type="button" aria-label="Underline" title="Underline" aria-pressed={state.underline} onClick={() => chain().toggleUnderline().run()} className={tool(state.underline)}>
            <TextUnderline size={20} aria-hidden />
          </button>
          <Divider />
          <button type="button" aria-label="Bulleted list" title="Bulleted list" aria-pressed={state.bullet} onClick={() => chain().toggleBulletList().run()} className={tool(state.bullet)}>
            <ListBullets size={20} aria-hidden />
          </button>
          <button type="button" aria-label="Numbered list" title="Numbered list" aria-pressed={state.ordered} onClick={() => chain().toggleOrderedList().run()} className={tool(state.ordered)}>
            <ListNumbers size={20} aria-hidden />
          </button>
          <button type="button" aria-label="Quote" title="Quote" aria-pressed={state.quote} onClick={() => chain().toggleBlockquote().run()} className={tool(state.quote)}>
            <Quotes size={20} aria-hidden />
          </button>
          <Divider />
          <button type="button" aria-label="Link" title="Link" aria-pressed={state.link} onClick={() => setLinkOpen(true)} className={tool(state.link)}>
            <LinkSimple size={20} aria-hidden />
          </button>
          <button type="button" aria-label="Insert image" title="Insert image" onClick={() => setImageOpen(true)} className={tool(false)}>
            <ImageSquare size={20} aria-hidden />
          </button>
          <button type="button" aria-label="Insert divider" title="Insert divider" onClick={() => chain().setHorizontalRule().run()} className={tool(false)}>
            <Minus size={20} aria-hidden />
          </button>
        </div>
        <EditorContent editor={editor} />
      </div>
      <p className="text-sm text-ink-muted tabular-nums" role="status">
        {state.words.toLocaleString()} word{state.words === 1 ? "" : "s"}
      </p>
      {error ? (
        <p id={errorId} className="text-sm text-error">
          {error}
        </p>
      ) : null}

      <LinkDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        initialUrl={state.href}
        onApply={(url) => {
          chain().extendMarkRange("link").setLink({ href: url }).run();
          setLinkOpen(false);
        }}
        onRemove={() => {
          chain().extendMarkRange("link").unsetLink().run();
          setLinkOpen(false);
        }}
      />
      <MediaPicker
        open={imageOpen}
        onOpenChange={setImageOpen}
        title="Insert an image"
        onPick={([media]) => {
          if (media) chain().setImage({ src: mediaUrl(media.storagePath), alt: media.alt, width: media.width, height: media.height }).run();
        }}
      />
    </div>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 my-2 hidden w-px shrink-0 bg-line sm:block" />;
}
