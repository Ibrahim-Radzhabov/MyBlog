import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/prompts", "/prompts/*"],
        disallow: ["/admin", "/admin/*", "/api/*"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
