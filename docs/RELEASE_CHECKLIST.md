# Релизный чеклист (Prompt Atlas MVP)

## A. Gate перед релизом
1. Проверьте, что локальная ветка чистая и все нужные изменения закоммичены.
2. Убедитесь, что в `.env.local` заданы корректные значения:
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_EMAIL`
   - `REVALIDATE_SECRET`
3. Прогоните quality gate:
```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
```
4. Полный E2E gate (если заданы креды):
```bash
E2E_ADMIN_EMAIL=... E2E_ADMIN_PASSWORD=... corepack pnpm e2e
```

## B. Шаги релиза Supabase
1. В Supabase SQL Editor примените миграции по порядку:
   - `supabase/migrations/001_init.sql`
   - `supabase/migrations/002_admin_events.sql`
   - `supabase/migrations/003_search_events.sql`
2. Примените seed:
   - `supabase/seed.sql`
3. Проверьте Auth-настройки:
   - Email/Password sign-in включен.
   - Public sign-up выключен.
4. Проверьте администратора:
```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
```
5. Убедитесь, что bucket `prompt-covers` существует и он public.

## C. Шаги деплоя в Vercel
1. Добавьте production env в `Project Settings -> Environment Variables`.
2. Установите `NEXT_PUBLIC_SITE_URL` в production-домен.
3. Деплойте последний tagged commit.
4. Проверьте, что в build logs нет TypeScript/ESLint ошибок.

## D. Smoke после деплоя
1. Публичные страницы:
   - `/`
   - `/prompts`
   - `/prompts/[slug]`
2. Auth/admin:
   - `/login` открывается и показывает ограничение доступа.
   - не-админ не проходит в `/admin`.
   - админ попадает в `/admin`.
3. Admin CRUD:
   - создать draft промпт;
   - опубликовать промпт;
   - отредактировать промпт;
   - удалить промпт через confirm modal.
4. Taxonomy CRUD:
   - создать/изменить/удалить категорию;
   - создать/изменить/удалить тег.
5. Upload flow:
   - загрузить cover для промпта в админке.
6. Audit trail:
   - проверить, что события отражаются в разделе "Журнал действий" на `/admin`.
7. SEO/discovery:
   - `/robots.txt`
   - `/sitemap.xml`
8. Search analytics:
   - выполнить несколько поисков в `/prompts`;
   - убедиться, что в `/admin` заполняются блоки:
     - "Топ поисковых запросов (30 дней)"
     - "Запросы без результатов (30 дней)".

## E. План отката
1. Сделайте redeploy предыдущего стабильного деплоя в Vercel.
2. При необходимости временно ограничьте админ-мутации через `ADMIN_EMAIL`.
3. Перед повторным релизом проверьте логи в Vercel и Supabase.
