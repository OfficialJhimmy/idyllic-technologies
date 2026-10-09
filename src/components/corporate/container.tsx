/** Page width and side padding used by every public section. */
export function Container({ children, className = "", as: Tag = "div" }: { children: React.ReactNode; className?: string; as?: "div" | "section" | "header" | "footer" | "article" | "aside" }) {
  return <Tag className={`mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-12 ${className}`}>{children}</Tag>;
}
