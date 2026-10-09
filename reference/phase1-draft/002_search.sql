-- Full-text search and trigram fuzzy matching for products.
create extension if not exists pg_trgm with schema extensions;

alter table public.products
  add column if not exists search tsvector
  generated always as (
    setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'C')
  ) stored;

create index if not exists products_search_idx on public.products using gin (search);
create index if not exists products_name_trgm_idx on public.products
  using gin (name extensions.gin_trgm_ops);

-- Search published products. Full-text first, trigram as a typo-tolerant fallback.
create or replace function public.search_products(q text, max_rows int default 24)
returns setof public.products
language sql stable as $$
  select p.* from public.products p
  where p.status = 'published'
    and (
      p.search @@ websearch_to_tsquery('simple', q)
      or extensions.similarity(p.name, q) > 0.25
    )
  order by
    ts_rank(p.search, websearch_to_tsquery('simple', q)) desc,
    extensions.similarity(p.name, q) desc
  limit max_rows;
$$;
