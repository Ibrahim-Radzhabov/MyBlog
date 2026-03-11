function normalizeSiteUrl(value: string | undefined) {
  const fallback = "http://localhost:3000";
  const raw = (value ?? fallback).trim();

  try {
    const parsed = new URL(raw);
    return parsed.origin;
  } catch {
    return fallback;
  }
}

export const siteConfig = {
  name: "Prompt Atlas",
  description: "A curated prompt catalog with clean public browsing and secure admin publishing.",
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  adminEmail: (process.env.ADMIN_EMAIL ?? "admin@example.com").trim(),
} as const;

export const promptStatus = {
  draft: "draft",
  published: "published",
} as const;

export const defaultPageSize = 12;
export const adminPageSize = 20;
