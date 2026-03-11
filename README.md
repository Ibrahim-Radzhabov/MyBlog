# Prompt Atlas MVP

## 1. Что это за проект
Prompt Atlas - production-ready MVP каталога промптов на Next.js App Router и Supabase.

В проекте уже реализовано:
- публичная витрина (`/`, `/prompts`, `/prompts/[slug]`) для всех пользователей;
- приватная админка (`/admin`) для одного администратора;
- CRUD для промптов с состояниями `draft/published`;
- CRUD для категорий и тегов;
- подтверждение опасных действий (delete) через модальные окна;
- журнал действий администратора (`admin_events`);
- аналитика поиска каталога (`search_events`) с блоками на дашборде.

## 2. Технологии
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase (Postgres, Auth, Storage, RLS)
- Vercel (деплой)

## 3. Локальный запуск
1. Установите зависимости:
```bash
corepack pnpm install
```
2. Скопируйте переменные окружения:
```bash
cp .env.example .env.local
```
3. Заполните `.env.local` значениями вашего Supabase проекта.
4. Примените миграции и seed в Supabase (см. разделы ниже).
5. Запустите приложение:
```bash
corepack pnpm dev
```

## 4. Переменные окружения
Список находится в `.env.example`:
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (только сервер, никогда не в клиент)
- `ADMIN_EMAIL`
- `REVALIDATE_SECRET`

Для e2e без skip:
- `E2E_ADMIN_EMAIL`
- `E2E_ADMIN_PASSWORD`

## 5. Настройка Supabase
1. Создайте проект в Supabase.
2. В `SQL Editor` выполните по порядку:
- `supabase/migrations/001_init.sql`
- `supabase/migrations/002_admin_events.sql`
- `supabase/migrations/003_search_events.sql`
- `supabase/seed.sql`
3. В `Storage` проверьте bucket `prompt-covers` (public).
4. В `Authentication`:
- включите Email + Password sign-in;
- отключите public sign-up.

## 6. Как назначить администратора
1. В Supabase Auth создайте пользователя с email, который указан в `ADMIN_EMAIL`.
2. Назначьте ему роль:
```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
```
3. Доступ в админку проходит только при двух условиях:
- `user.email === ADMIN_EMAIL`
- `profiles.role = 'admin'`

## 7. Как отключить публичную регистрацию
В Supabase Dashboard:
- `Authentication` -> `Providers` -> `Email`
- отключите self-signup (регистрацию), но оставьте sign-in включенным.

## 8. Как применить миграции и seed
Через Supabase SQL Editor:
1. Выполните `supabase/migrations/001_init.sql`
2. Выполните `supabase/migrations/002_admin_events.sql`
3. Выполните `supabase/migrations/003_search_events.sql`
4. Выполните `supabase/seed.sql`

## 9. Команды проверки качества
```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
```

Полный e2e:
```bash
corepack pnpm e2e
```

E2E по production URL:
```bash
set -a; source .env.local; set +a
PLAYWRIGHT_BASE_URL=https://my-blog-drab-eight.vercel.app corepack pnpm e2e
```

## 10. Деплой в Vercel
1. Запушьте репозиторий в Git provider.
2. Импортируйте проект в Vercel.
3. Добавьте все env-переменные из `.env.example`.
4. Для `NEXT_PUBLIC_SITE_URL` укажите production-домен.
5. Запустите deploy.

## 11. Production env в Vercel
В `Project Settings -> Environment Variables` задайте:
- `NEXT_PUBLIC_SITE_URL` = ваш production URL
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAIL`
- `REVALIDATE_SECRET`

## 12. Важная структура проекта
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
tests/e2e/
  admin-crud.spec.ts
  admin-login.spec.ts
  public-auth.spec.ts
supabase/
  migrations/001_init.sql
  migrations/002_admin_events.sql
  migrations/003_search_events.sql
  seed.sql
```

## 13. Финальный deployment checklist
- [ ] Применены миграции `001_init.sql`, `002_admin_events.sql`, `003_search_events.sql`
- [ ] Применен `supabase/seed.sql`
- [ ] В Supabase Auth отключен public sign-up
- [ ] Админ-пользователь создан и имеет `profiles.role = 'admin'`
- [ ] `ADMIN_EMAIL` точно совпадает с email админа
- [ ] Env-переменные в Vercel заполнены
- [ ] `pnpm lint` проходит
- [ ] `pnpm typecheck` проходит
- [ ] `pnpm build` проходит
- [ ] Public-каталог показывает только published промпты
- [ ] Не-админ не попадает в `/admin`
- [ ] `/robots.txt` и `/sitemap.xml` отдают `200`
- [ ] Блоки аналитики поиска на `/admin` отображают данные

Полный релизный сценарий:
- `docs/RELEASE_CHECKLIST.md`

## 14. Идеи для дальнейшего развития
- Удаление файлов cover из Storage при удалении промпта.
- Более детальная продуктовая аналитика (тренды, воронка поиска).
- Более гибкая ролевая модель (не только single-admin).
