import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";

/** A plain GET form, so search works without JavaScript and results can be shared. */
export function ShopSearch({ defaultValue = "", className = "", id = "shop-search" }: { defaultValue?: string; className?: string; id?: string }) {
  return (
    <form action="/search" role="search" className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <MagnifyingGlass size={20} aria-hidden className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-muted" />
      <input id={id} name="q" type="search" defaultValue={defaultValue} placeholder="Search products" autoComplete="off" maxLength={100} className="h-12 w-full rounded-full border border-line-strong bg-surface pr-4 pl-12 text-base text-ink placeholder:text-ink-muted" />
    </form>
  );
}
