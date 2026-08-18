import type { MetadataRoute } from "next";
import { tools, categories, siteUrl } from "@/lib/tools";
import { blogPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages = [
    { path: "", priority: 1, changefreq: "weekly" as const },
    { path: "tools", priority: 0.9, changefreq: "weekly" as const },
    { path: "blog", priority: 0.8, changefreq: "weekly" as const },
    { path: "about", priority: 0.4, changefreq: "monthly" as const },
    { path: "contact", priority: 0.4, changefreq: "monthly" as const },
    { path: "privacy", priority: 0.3, changefreq: "yearly" as const },
    { path: "terms", priority: 0.3, changefreq: "yearly" as const },
    { path: "cookie-policy", priority: 0.3, changefreq: "yearly" as const },
    { path: "faq", priority: 0.5, changefreq: "monthly" as const },
  ];

  const alternates = (enPath: string) => ({
    languages: {
      en: `${siteUrl}/en/${enPath}`.replace(/\/+$/, ""),
      ar: `${siteUrl}/ar/${enPath}`.replace(/\/+$/, ""),
    },
  });

  const urls: MetadataRoute.Sitemap = [];

  for (const page of staticPages) {
    const enUrl = page.path
      ? `${siteUrl}/en/${page.path}`
      : `${siteUrl}/en`;
    const arUrl = page.path
      ? `${siteUrl}/ar/${page.path}`
      : `${siteUrl}/ar`;
    urls.push({
      url: enUrl,
      lastModified: now,
      changeFrequency: page.changefreq,
      priority: page.priority,
      alternates: {
        languages: { en: enUrl, ar: arUrl },
      },
    });
    // Arabic version as a separate entry for full coverage
    urls.push({
      url: arUrl,
      lastModified: now,
      changeFrequency: page.changefreq,
      priority: page.priority,
      alternates: {
        languages: { en: enUrl, ar: arUrl },
      },
    });
  }

  for (const category of categories) {
    const enUrl = `${siteUrl}/en/${category.slug}`;
    const arUrl = `${siteUrl}/ar/${category.slug}`;
    urls.push({
      url: enUrl,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
      alternates: { languages: { en: enUrl, ar: arUrl } },
    });
    urls.push({
      url: arUrl,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
      alternates: { languages: { en: enUrl, ar: arUrl } },
    });
  }

  for (const tool of tools) {
    const enUrl = `${siteUrl}/en/tools/${tool.slug}`;
    const arUrl = `${siteUrl}/ar/tools/${tool.slug}`;
    urls.push({
      url: enUrl,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      alternates: { languages: { en: enUrl, ar: arUrl } },
    });
    urls.push({
      url: arUrl,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      alternates: { languages: { en: enUrl, ar: arUrl } },
    });
  }

  for (const post of blogPosts) {
    const enUrl = `${siteUrl}/en/blog/${post.slug}`;
    const arUrl = `${siteUrl}/ar/blog/${post.slug}`;
    urls.push({
      url: enUrl,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: { languages: { en: enUrl, ar: arUrl } },
    });
    urls.push({
      url: arUrl,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: { languages: { en: enUrl, ar: arUrl } },
    });
  }

  return urls;
}
