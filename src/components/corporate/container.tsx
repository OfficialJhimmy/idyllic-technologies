type Props = React.HTMLAttributes<HTMLElement> & { as?: "div" | "section" | "header" | "footer" | "article" | "aside" };

/** Page width and side padding used by every public section. Other attributes, such as aria-labelledby, pass through. */
export function Container({ children, className = "", as: Tag = "div", ...rest }: Props) {
  return (
    <Tag className={`mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-12 ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
