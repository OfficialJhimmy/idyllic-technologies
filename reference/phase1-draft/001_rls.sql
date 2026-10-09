-- Run after the Drizzle migration. Enables row-level security on every table.
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
create policy public_read_products on public.products for select to anon, authenticated
  using (status = 'published');
create policy public_read_posts on public.posts for select to anon, authenticated
  using (status = 'published' and published_at <= now());
create policy public_read_faqs on public.faqs for select to anon, authenticated
  using (status = 'published');
create policy public_read_testimonials on public.testimonials for select to anon, authenticated
  using (status = 'published');
create policy public_read_clients on public.clients_partners for select to anon, authenticated
  using (status = 'published');

-- Public read: reference data with no draft state.
create policy public_read_brands on public.brands for select to anon, authenticated using (true);
create policy public_read_categories on public.product_categories for select to anon, authenticated using (true);
create policy public_read_spec_defs on public.spec_definitions for select to anon, authenticated using (true);
create policy public_read_media on public.media for select to anon, authenticated using (true);
create policy public_read_authors on public.authors for select to anon, authenticated using (true);
create policy public_read_post_categories on public.post_categories for select to anon, authenticated using (true);
create policy public_read_tags on public.tags for select to anon, authenticated using (true);
create policy public_read_site_values on public.site_values for select to anon, authenticated using (true);

-- Public read: child rows of published products or posts.
create policy public_read_product_images on public.product_images for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'published'));
create policy public_read_product_features on public.product_features for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'published'));
create policy public_read_product_documents on public.product_documents for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'published'));
create policy public_read_product_relations on public.product_relations for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'published'));
create policy public_read_product_spec_values on public.product_spec_values for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'published'));
create policy public_read_product_tags on public.product_tags for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.status = 'published'));
create policy public_read_post_tags on public.post_tags for select to anon, authenticated
  using (exists (select 1 from public.posts p where p.id = post_id and p.status = 'published'));

-- No public policy on: enquiries, booking_intents, redirects, activity_log,
-- admin_profiles. Public forms write through server actions using the
-- service role after Zod, rate limit and Turnstile checks.
