import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ToolShell from "@/components/ToolShell";
import { JsonLd, breadcrumbJsonLd, faqJsonLd, toolJsonLd } from "@/components/ui/seo";
import {
  toolBySlug,
  categoryById,
  tools,
  siteName,
  siteUrl,
  popularTools,
  toolsByCategory,
} from "@/lib/tools";
import { isLocale, localizedPath, translate, type Locale } from "@/lib/i18n";
import { localizeCategory, localizeTool } from "@/lib/ar-content";

export function generateStaticParams() {
  return (["en", "ar"] as const).flatMap((locale) => tools.map((tool) => ({ locale, slug: tool.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  if (!isLocale(localeParam)) return { title: "Not found" };
  const locale = localeParam as Locale;
  const tool = toolBySlug[slug];
  if (!tool) return { title: locale === "ar" ? "الأداة غير موجودة" : "Tool not found" };
  const localized = localizeTool(tool, locale);
  const pagePath = localizedPath(locale, `/tools/${tool.slug}`);
  return {
    title: localized.seoTitle,
    description: localized.seoDescription,
    keywords: tool.keywords,
    alternates: {
      canonical: `${siteUrl}${pagePath}`,
      languages: {
        en: `${siteUrl}/tools/${tool.slug}`,
        ar: `${siteUrl}/ar/tools/${tool.slug}`,
      },
    },
    openGraph: {
      type: "website",
      title: localized.seoTitle,
      description: localized.seoDescription,
      url: `${siteUrl}${pagePath}`,
      siteName,
      locale: locale === "ar" ? "ar_AR" : "en_US",
      alternateLocale: locale === "ar" ? "en_US" : "ar_AR",
    },
    twitter: {
      card: "summary",
      title: localized.seoTitle,
      description: localized.seoDescription,
    },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: localeParam, slug } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const tool = toolBySlug[slug];
  if (!tool) notFound();

  const localized = localizeTool(tool, locale);
  const category = categoryById[tool.category];
  const localizedCategory = localizeCategory(category.id, locale);
  const categoryTools = toolsByCategory(tool.category);
  const topTools = (categoryTools.length >= 4 ? categoryTools : popularTools).slice(0, 4);
  const l = (path: string) => localizedPath(locale, path);

  const crumbs = [
    { name: translate(locale, "breadcrumb.home"), url: "/" },
    { name: translate(locale, "breadcrumb.tools"), url: "/tools" },
    { name: localizedCategory.name, url: `/${category.slug}` },
    { name: localized.name },
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs.map((c) => ({ name: c.name, url: c.url ? l(c.url) : undefined })))} />
      <JsonLd data={toolJsonLd(localized, `${siteUrl}${l(`/tools/${tool.slug}`)}`)} />
      <JsonLd data={faqJsonLd(localized.faqs)} />
      <ToolShell tool={localized} category={category} topTools={topTools} />
    </>
  );
}
