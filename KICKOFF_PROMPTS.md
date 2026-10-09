# Claude Code kickoff prompts: Idyllic Technologies platform

## Before you start (about five minutes)

1. Create an empty folder, for example `idyllic-platform`, and run `git init` in it.
2. Put these in the folder root: `PROJECT_SPEC.md` and `CLAUDE.md`.
3. Create `reference/` and drop in the design reference images and the Idyllic logo (vector if you have it).
4. Create `fonts/` and drop in the Neue Montreal files, if you have the web licence.
5. Optional: create `reference/phase1-draft/` and drop in the files from the cloud session. Claude Code can use them as a starting point, but it does not need them.
6. Open a terminal in the folder, run `claude`, and confirm the four skills appear (type `/` and look for Taste, emil-kowalski, Impeccable and apple-design-hig).
7. Paste Prompt 1 below.

Start each later phase in a fresh session so context stays small. `CLAUDE.md` and `design/decisions.md` carry the memory between sessions.

---

## Prompt 1: Session kickoff and Phase 1 Foundation

```
Read CLAUDE.md and PROJECT_SPEC.md in full before doing anything else. They are approved and are the source of truth. If they disagree with each other, stop and ask.

First, check that these four skills are available: /Taste, /emil-kowalski, /Impeccable, /apple-design-hig. Tell me which are present. If any is missing, tell me and still do the non-UI work below, but do not start any UI work.

We are doing Phase 1, Foundation, from the roadmap in the spec. Do not start Phase 2. Create a task list first, and make the last task a check of your own work.

Part A: Project scaffold (no UI skills needed)
- Create the Next.js project in this folder with pnpm: Next.js App Router, TypeScript strict (also enable noUncheckedIndexedAccess), Tailwind 4, Drizzle, postgres-js, Zod, @supabase/supabase-js, @supabase/ssr, server-only. Use the folder structure in CLAUDE.md.
- Use the Next.js "proxy.ts" convention if the installed Next version has renamed middleware. Check the docs in node_modules/next/dist/docs.
- If lint fails because of version incompatibilities (for example typescript-eslint not supporting the newest TypeScript, or the newest ESLint breaking eslint-config-next), pin TypeScript and ESLint to the latest versions that work together and record that in design/decisions.md.
- Add .env.example with public variables (site URL, shop URL, Supabase URL and anon key, Turnstile site key, GA ID, WhatsApp number) and server-only variables (service role key, DATABASE_URL, Turnstile secret, Resend key, revalidate secret). Add a Zod-validated server env module. Add .gitignore that excludes .env files.
- Add a placeholder root layout and two placeholder pages only. Do not design anything yet.

Part B: Database and security (no UI skills needed)
- Write the Drizzle schema in src/db/schema.ts for every table in section 5 of the spec: media, brands, product_categories, products, product_images, product_features, product_documents, product_relations, spec_definitions, product_spec_values, product_tags, authors, post_categories, tags, posts, post_tags, faqs, testimonials, clients_partners, site_values, enquiries, booking_intents, redirects, admin_profiles, activity_log.
  - There are no price columns anywhere. This is a hard rule.
  - Use uuid primary keys, timestamptz timestamps, and enums for publish status (draft, published, archived), spec value type, suitable_for (home, office, business, industrial), enquiry type and status, booking source (page, compare, assistant), and admin role (owner, editor).
  - At most one primary image per product, enforced by a partial unique index.
  - faqs, testimonials and clients_partners have a status column that defaults to draft, because content needs Idyllic's approval before publishing. site_values has a todo text column for content that still needs input.
  - booking_intents.product_ids is a uuid array.
- Write SQL files in supabase/sql/, to run after the Drizzle migration:
  1. 001_rls.sql: an is_admin() security definer function based on admin_profiles; enable RLS on every public table; an admin_all policy for authenticated admins; public read policies that only expose published rows (products, posts with published_at in the past, faqs, testimonials, clients_partners) and child rows of published products or posts; public read on reference tables with no draft state (brands, categories, spec definitions, media, authors, post categories, tags, site_values). No public policy at all on enquiries, booking_intents, redirects, activity_log or admin_profiles. Public forms write through server actions using the service role after Zod, rate limit and Turnstile checks.
  2. 002_search.sql: pg_trgm in the extensions schema, a generated weighted tsvector column on products (name A, summary B, description C), GIN indexes, and a search_products(q, max_rows) function that returns published products using full-text search with a trigram fallback.
  3. 003_storage.sql: a public "media" bucket and a private "backups" bucket.
- Note in design/decisions.md that Drizzle connects as the database owner, so RLS does not apply to server queries, and every public query must filter on status = published itself.

Part C: Server plumbing
- src/lib/supabase/server.ts (session client plus service-role admin client, both server-only) and browser.ts (anon key only).
- src/lib/auth.ts with requireAdmin(): requires a signed-in user, a completed TOTP step (aal2), and a row in admin_profiles. Support an owner-only option. Redirect to /admin/login otherwise.
- src/lib/hosts.ts and the proxy: requests on shop.* are rewritten to /shop-host/..., which lives in src/app/(marketplace)/shop-host/ (two route groups cannot both own "/"). /admin returns 404 on the shop host. Refresh Supabase session cookies on admin requests. Leave a TODO for the redirects-table lookup.
- src/lib/whatsapp.ts: builds one wa.me link listing all selected products with their canonical shop URLs, no prices. The number comes from env, and leave a TODO to confirm +2347037973666 with Idyllic.
- src/lib/analytics.ts: a typed track() wrapper with GA4 as the first sink, never throwing, so components never call a vendor SDK.
- Canonical product URLs always point to the shop host.

Part D: Content values and seed
- src/content/catalogue.ts: exactly six categories (Full River Battery, Inverters, UPS, Solar Panel, Distribution Board, Sockets), the brands named in the spec (Eaton, Fullriver, Schneider Electric, Eco Green Energy, Solis), and starting spec templates for batteries, UPS and inverters from section 5. Leave Solar Panel, Distribution Board and Sockets empty. Do not guess specifications.
- src/content/site-values.ts: home stats, work process values (keep the source spelling "Planning & Stratergy" exactly and flag it in decisions.md), contact details, and null placeholders with visible todo text for Terms, refund policy and team members (only Tonia Ozoede, CEO and Founder, is known).
- src/content/faqs.ts: the approved FAQ drafts from Appendix A, with item 2 verbatim. Do not seed the refund FAQ (item 5). Seed all as status draft.
- src/db/seed.ts: idempotent, never overwrites rows staff have edited.

Part E: Backups
- scripts/backup.ts that dumps every public table to JSON and uploads it to the private "backups" bucket.
- .github/workflows/backup.yml running nightly plus manual dispatch, also keeping a 30 day workflow artifact.

Part F: UI foundation (only if all four skills are present)
- Analyse the images in reference/ using the skills and write design/patterns.md. Do not copy any reference directly.
- Derive the design tokens from the logo and references. #A2D2FF is a starting point only. Do not use the lime accent from the references. Check contrast.
- Set up Neue Montreal with next/font/local from /fonts (convert to woff2 if only OTF or TTF is there, and tell me if the files or licence are missing) and Manrope with next/font/google.
- Build the admin shell: login with email, password and TOTP, a guarded layout using requireAdmin(), and an empty dashboard. State the folder and file path of every component you create.
- If the skills, fonts or logo are missing, say exactly which are missing and stop before this part.

Finish
- Run pnpm typecheck and pnpm lint, and report what you ran and the results. Fix errors before reporting.
- Record every decision you made that the spec did not cover in design/decisions.md.
- End with a short list of what is done, what is blocked, and what you need from me. Do not recap the steps.

Rules that always apply: no prices anywhere, no LLM, no hardcoded product, blog, FAQ or testimonial data in components, do not rewrite approved copy, do not add categories, and avoid em dashes and en dashes in any copy you write.
```

---

## Prompt 2: Phase 2, Catalogue CMS

Run after Phase 1 is committed and Supabase is connected.

```
Read CLAUDE.md, PROJECT_SPEC.md and design/decisions.md. Confirm the four skills are available and tell me if any is missing. Phase 1 is done. Do Phase 2 only, the Catalogue CMS, from the roadmap and section 6 of the spec.

Build in the admin: Categories (edit only, no create or delete, there are exactly six), Brands, spec templates per category (add, edit, order, mark comparable and filterable), the Products list and the product editor, and the media pipeline.

Product editor: choosing a category loads that category's spec template. Fields are name, brand, summary, description, features, typed specs with units, images, datasheets, related products, status (draft, publish, unpublish, archive), SEO fields, suitable_for tags, and source URL. Publishing calls on-demand revalidation. Every server action calls requireAdmin() and validates input with Zod.

Media pipeline: validated uploads, convert to WebP on upload, require alt text, store width, height and bytes, and never store large originals. Upload to the public "media" bucket using the service role on the server only.

Use the four skills for every UI decision. State the folder and file path of each component. Every list needs loading, empty and error states. Use track() for analytics. Run typecheck and lint, add tests for the spec value and publish logic, and report what you ran. No prices anywhere.

When finished, tell me what Idyllic staff need to do to start entering Eaton products.
```

---

## Prompt 3: Phase 3, Blog CMS and enquiries inbox

```
Read CLAUDE.md, PROJECT_SPEC.md and design/decisions.md. Confirm the four skills are available. Do Phase 3 only: the Blog CMS (title, slug, body, excerpt, featured image, category, tags, author, publication date, SEO and social fields, and draft, publish, unpublish, archive with revalidation on publish) and the enquiries inbox (list, filter by type and status, view detail, change status). Reuse the media pipeline from Phase 2. Do not rewrite or invent blog content. Finish with typecheck, lint and a short report of what is done and what is blocked.
```

---

## Prompt 4: Phase 4, Corporate site

```
Read CLAUDE.md, PROJECT_SPEC.md and design/decisions.md. Confirm the four skills are available and use design/patterns.md and the tokens. Do Phase 4 only: the corporate site with the page structures in section 11 (Home, About Us, Industries, Products, Product details, Blog, Blog details, FAQs, Contact), the navigation with the Visit Marketplace button, and the contact form with validation, loading, success and error states, Turnstile, a rate limit, storage in enquiries and an email through Resend.

All copy comes from the approved content PDF through the database or site_values. Do not build a Projects page. Do not publish the Terms page or the refund FAQ, and show a visible TODO in the CMS instead. Add SEO (metadata, Open Graph, canonical URLs, sitemap, robots, Organization and FAQPage structured data) and make it responsive and keyboard accessible. Work mobile first. State the folder and file path of every component. Report typecheck and lint results.
```

---

## Prompt 5: Phase 5, Marketplace

```
Read CLAUDE.md, PROJECT_SPEC.md and design/decisions.md. Confirm the four skills are available. Do Phase 5 only: the marketplace under the shop host with Home, category pages, brand pages, product pages, search using search_products, filters from filterable spec definitions, a compare view for up to three products using only comparable fields (accessible table, dedicated mobile layout), and the booking list stored in the browser.

Book on WhatsApp must write a booking_intents row through a validated, rate-limited server action and then open the wa.me link from src/lib/whatsapp.ts. One message lists every selected product. There is no cart, checkout, wishlist or price anywhere, and no price in structured data. Product pages use the same component as the corporate site, and the canonical tag points to the shop URL. Keep product URLs as /product/[slug]. Every list needs loading, empty and error states. Report typecheck and lint results.
```

---

## Prompt 6: Phase 6, Energy Assistant

```
Read CLAUDE.md, PROJECT_SPEC.md (section 8) and design/decisions.md. Confirm the four skills are available. Do Phase 6 only: the deterministic Energy Assistant in src/assistant behind an AssistantEngine.next(state, input) => Turn interface, where a turn is a question, recommendation, comparison or handoff. No LLM, embeddings or paid AI service.

Recommendations must only use products that are published in the database and only use spec fields that exist for every product being compared. The suitable_for tags are curated by staff and must never be inferred. The drawer is full height bottom sheet on mobile, keyboard accessible with focus trapping, and announces new messages in a live region. Handoff creates a booking_intents or enquiries row. Write unit tests for the rules and flows. Report typecheck, lint and test results.
```

---

## Prompt 7: Phase 7, QA and launch

```
Read CLAUDE.md, PROJECT_SPEC.md and design/decisions.md. Do Phase 7 only: responsive and accessibility audit, SEO and structured data check, the redirects table loaded from the old URL list, a security review (every admin route and action, upload validation, rate limits, no secrets in client code), performance pass, and a launch checklist covering DNS cutover and the WooCommerce orders and customers export. Report findings by severity and fix what you can. List anything that needs Idyllic's input.
```

---

## Things Idyllic still owes you

- Terms and Conditions and refund policy text
- WhatsApp number confirmation for +2347037973666
- Logo in vector form and brand assets
- Real photography
- Neue Montreal files with a web licence
- Old URL list for redirects
- WooCommerce orders and customers export before the old shop is switched off
- Permission to show client logos
