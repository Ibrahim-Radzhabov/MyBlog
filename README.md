# Prompt Atlas MVP

## 1. What this project is
Prompt Atlas is a production-safe MVP prompt catalog built with Next.js App Router and Supabase. It has:
- Public storefront (`/`, `/prompts`, `/prompts/[slug]`) for everyone.
- Private admin area (`/admin`) for exactly one intended admin account.
- Admin CRUD flows for prompts with draft/publish states.
- Admin CRUD flows for categories and tags.
- Confirm modals for destructive admin actions.
- Audit trail (`admin_events`) for admin mutations and storage uploads.

## 2. Tech stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui-style component primitives
- Supabase (Postgres, Auth, Storage, RLS)
- Vercel-ready deployment

## 3. Local setup
1. Install dependencies:
```bash
corepack pnpm install
```
2. Copy env file:
```bash
cp .env.example .env.local
```
3. Fill `.env.local` with your Supabase project values.
4. Apply SQL migration and seed in Supabase SQL Editor (sections below).
5. Run app:
```bash
corepack pnpm dev
```

## 4. Environment variables
See `.env.example`:
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `ADMIN_EMAIL`
- `REVALIDATE_SECRET`

## 5. Supabase setup
1. Create a Supabase project.
2. In SQL Editor, run:
- `supabase/migrations/001_init.sql`
- `supabase/migrations/002_admin_events.sql`
- `supabase/seed.sql`
3. In Storage, confirm bucket `prompt-covers` exists and is public.
4. In Authentication:
- Enable Email + Password sign-in.
- Disable public sign-up.

## 6. How to create the admin user
1. In Supabase Auth, create a user with the exact email you set in `ADMIN_EMAIL`.
2. Promote this user in SQL (replace email):
```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
```
3. Verify only this account can pass both checks:
- `user.email === ADMIN_EMAIL`
- `profiles.role = 'admin'`

## 7. How to disable public sign-up
Supabase Dashboard:
- `Authentication` -> `Providers` -> `Email`
- Turn off user self-registration / sign-up (keep sign-in enabled).

## 8. How to run SQL migration and seed
Use Supabase SQL Editor:
1. Open and run `supabase/migrations/001_init.sql`
2. Open and run `supabase/migrations/002_admin_events.sql`
3. Open and run `supabase/seed.sql`

## 9. How to run locally
```bash
corepack pnpm install
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
corepack pnpm dev
```

Optional e2e:
```bash
corepack pnpm e2e
```

Optional admin-login e2e requires:
- `E2E_ADMIN_EMAIL`
- `E2E_ADMIN_PASSWORD`

## 10. How to deploy to Vercel
1. Push repo to Git provider.
2. Import project in Vercel.
3. Set build command: `pnpm build` (default works).
4. Set install command: `pnpm install` (default works).
5. Add all environment variables from `.env.example`.
6. Deploy.

## 11. Production environment variables
Set these in Vercel Project Settings -> Environment Variables:
- `NEXT_PUBLIC_SITE_URL` = your production URL
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAIL`
- `REVALIDATE_SECRET`

## 12. Future improvements
- Add audit logs for admin actions.
- Add optimistic UI and richer toast feedback for all forms.
- Add image deletion cleanup on prompt deletion.
- Add richer analytics dashboards and trend charts.
- Add finer-grained role model beyond single-admin mode.

## Important file tree
```text
app/
  (public)/
    page.tsx
    prompts/page.tsx
    prompts/[slug]/page.tsx
  (auth)/
    login/page.tsx
  (admin)/
    admin/layout.tsx
    admin/page.tsx
    admin/prompts/page.tsx
    admin/prompts/new/page.tsx
    admin/prompts/[id]/edit/page.tsx
    admin/categories/page.tsx
    admin/tags/page.tsx
  api/revalidate/route.ts
  api/upload/route.ts
  sitemap.ts
  robots.ts
actions/
  auth.ts
  prompts.ts
  taxonomy.ts
components/
  shared/confirm-action-modal.tsx
lib/
  auth/require-admin.ts
  auth/session.ts
  supabase/client.ts
  supabase/server.ts
  supabase/admin.ts
  supabase/middleware.ts
  db/audit.ts
  db/prompts.ts
  db/categories.ts
  db/tags.ts
  db/stats.ts
  validations/prompt.ts
proxy.ts
playwright.config.ts
tests/e2e/
  admin-crud.spec.ts
  public-auth.spec.ts
  admin-login.spec.ts
supabase/
  migrations/001_init.sql
  migrations/002_admin_events.sql
  seed.sql
```

## Final deployment checklist
- [ ] Supabase migration applied (`001_init.sql`)
- [ ] Supabase migration applied (`002_admin_events.sql`)
- [ ] Seed applied (`seed.sql`)
- [ ] Public sign-up disabled in Supabase Auth
- [ ] Admin user exists and `profiles.role = 'admin'`
- [ ] `ADMIN_EMAIL` matches the admin auth email exactly
- [ ] Vercel env vars configured
- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` passes
- [ ] Public catalog shows only published prompts
- [ ] Non-admin users are denied `/admin`

For a complete release runbook, use:
- `docs/RELEASE_CHECKLIST.md`
