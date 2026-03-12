import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;
  const coreEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/prompts`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("prompts")
      .select("slug, updated_at")
      .eq("status", "published")
      .eq("visibility", "public")
      .order("updated_at", { ascending: false });

    if (!data?.length) {
      return coreEntries;
    }

    const promptEntries: MetadataRoute.Sitemap = data.map((prompt) => ({
      url: `${baseUrl}/prompts/${prompt.slug}`,
      lastModified: new Date(prompt.updated_at),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...coreEntries, ...promptEntries];
  } catch {
    return coreEntries;
  }
}
