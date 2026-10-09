-- Run after the Drizzle migration. Safe to re-run. Enables row-level security on every table.
-- Server code uses the service role (bypasses RLS) or a direct DATABASE_URL
-- connection. The anon and authenticated roles only ever get what is below.

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_profiles where user_id = auth.uid());
$$;

do $$
declare t text;
begin
  for t in
    select tablename from pg_tables where schemaname = 'public'
      and tablename not like 'drizzle%' and tablename not like '\_\_drizzle%'
  loop
    execute format('alter table public.%I enable row level security', t);
    -- Admins can do everything on every table.
    execute format('drop policy if exists admin_all on public.%I', t);
    execute format(
      'create policy admin_all on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      t);
  end loop;
end $$;

-- Public read: published rows only.
drop policy if exists public_read_products on public.products;
create policy public_read_products on public.products for select to anon, authenticated
  using (status = 'published');
drop policy if exists public_read_posts on public.posts;
create policy public_read_posts on public.posts for select to anon, authenticated
  using (status = 'published' and published_at <= now());
drop policy if exists public_read_faqs on public.faqs;
create policy public_read_faqs on public.faqs for select to anon, authenticated
  using (status = 'published');
drop policy if exists public_read_testimonials on public.testimonials;
create policy public_read_testimonials on public.testimonials for select to anon, authenticated
  using (status = 'published');
drop policy if exists public_read_clients on public.clients_partners;
create policy public_read_clients on public.clients_partners for select to anon, authenticated
  using (status = 'published');

-- Public read: reference data with no draft state.
drop policy if exists public_read_brands on public.brands;
create policy public_read_brands on public.brands for select to anon, authenticated using (true);
drop policy if exists public_read_categories on public.product_categories;
create policy public_read_categories on public.product_categories for select to anon, authenticated using (true);
drop policy if exists public_read_spec_defs on public.spec_definitions;
create policy public_read_spec_defs on public.spec_definitions for select to anon, authenticated using (true);
drop policy if exists public_read_media on public.media;
create policy public_read_media on public.media for select to anon, authenticated using (true);
drop policy if exists public_read_authors on public.authors;
create policy public_read_authors on public.authors for select to anon, authenticated using (true);
drop policy if exists public_read_post_categories on public.post_categories;
create policy public_read_post_categories on public.post_categories for select to anon, authenticated using (true);
drop policy if exists public_read_tags on public.tags;
create policy public_read_tags on public.tags for select to anon, authenticated using (true);
drop policy if exists public_read_site_values on public.site_values;
create policy public_read_site_values on public.site_values for select to anon, authenticated using (true);

-- Public read: child rows of published products or posts.
drop policy if exists public_read_product_images on public.product_images;
create policy public_read_product_images on public.product_images for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'published'));
drop policy if exists public_read_product_features on public.product_features;
create policy public_read_product_features on public.product_features for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'published'));
drop policy if exists public_read_product_documents on public.product_documents;
create policy public_read_product_documents on public.product_documents for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'published'));
drop policy if exists public_read_product_relations on public.product_relations;
create policy public_read_product_relations on public.product_relations for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'published'));
drop policy if exists public_read_product_spec_values on public.product_spec_values;
create policy public_read_product_spec_values on public.product_spec_values for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'published'));
drop policy if exists public_read_product_tags on public.product_tags;
create policy public_read_product_tags on public.product_tags for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'published'));
drop policy if exists public_read_post_tags on public.post_tags;
create policy public_read_post_tags on public.post_tags for select to anon, authenticated
  using (exists (select 1 from public.posts p where p.id = post_id and p.status = 'published'));

-- No public policy on: enquiries, booking_intents, redirects, activity_log,
-- admin_profiles. Public forms write through server actions using the
-- service role after Zod, rate limit and Turnstile checks.

-- Table privileges. Newer Supabase projects do not grant anything on new tables to the API roles,
-- so the policies above have no effect until these grants exist. RLS still decides which rows.
grant usage on schema public to anon, authenticated;

-- Signed-in users: full access, narrowed to admins by the admin_all policy.
grant select, insert, update, delete on all tables in schema public to authenticated;

-- Anonymous visitors: read only, and only on tables that have a public read policy above.
-- enquiries, booking_intents, redirects, activity_log and admin_profiles are deliberately left out.
grant select on
  public.products, public.posts, public.faqs, public.testimonials, public.clients_partners,
  public.brands, public.product_categories, public.spec_definitions, public.media, public.authors,
  public.post_categories, public.tags, public.site_values,
  public.product_images, public.product_features, public.product_documents, public.product_relations,
  public.product_spec_values, public.product_tags, public.post_tags
to anon;

-- Supabase's default privileges also hand out TRUNCATE, REFERENCES and TRIGGER, and RLS does not
-- apply to TRUNCATE. Neither API role needs any of them.
revoke truncate, references, trigger on all tables in schema public from anon, authenticated;
