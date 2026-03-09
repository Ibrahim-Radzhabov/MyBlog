# Release Checklist (Prompt Atlas MVP)

## A. Pre-Release Gate
1. Ensure local branch is clean and all intended changes are committed.
2. Confirm `.env.local` contains valid values for:
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_EMAIL`
   - `REVALIDATE_SECRET`
3. Run quality gate:
```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
```
4. Optional full E2E gate (requires credentials):
```bash
E2E_ADMIN_EMAIL=... E2E_ADMIN_PASSWORD=... corepack pnpm e2e
```

## B. Supabase Release Steps
1. In Supabase SQL Editor apply migrations in order:
   - `supabase/migrations/001_init.sql`
   - `supabase/migrations/002_admin_events.sql`
2. Apply seed file:
   - `supabase/seed.sql`
3. Verify Auth settings:
   - Email/password sign-in enabled.
   - Public sign-up disabled.
4. Verify admin account:
```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
```
5. Confirm storage bucket `prompt-covers` exists and is public.

## C. Vercel Deploy Steps
1. Add all production env vars in Vercel Project Settings.
2. Set `NEXT_PUBLIC_SITE_URL` to production domain.
3. Deploy latest tagged commit.
4. Confirm build logs contain no TypeScript/ESLint failures.

## D. Post-Deploy Smoke Test
1. Public pages:
   - `/`
   - `/prompts`
   - `/prompts/[slug]`
2. Auth/admin:
   - `/login` loads with restriction message.
   - non-admin account is denied `/admin`.
   - admin account reaches `/admin`.
3. Admin CRUD:
   - create prompt draft
   - publish prompt
   - edit prompt
   - delete prompt via confirm modal
4. Taxonomy CRUD:
   - create/edit/delete category
   - create/edit/delete tag
5. Upload flow:
   - upload prompt cover through admin form
6. Audit trail:
   - verify actions appear in `/admin` -> "Audit trail"
7. SEO/discovery:
   - `/robots.txt`
   - `/sitemap.xml`

## E. Rollback Plan
1. Redeploy previous known-good Vercel deployment.
2. If needed, disable admin mutations by temporarily restricting `ADMIN_EMAIL`.
3. Investigate logs in Vercel + Supabase before re-attempting deployment.
