export const siteConfig = {
  name: "Prompt Atlas",
  description: "A curated prompt catalog with clean public browsing and secure admin publishing.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  adminEmail: process.env.ADMIN_EMAIL ?? "admin@example.com",
} as const;

export const promptStatus = {
  draft: "draft",
  published: "published",
} as const;

export const defaultPageSize = 12;
export const adminPageSize = 20;
