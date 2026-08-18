import type { Metadata } from "next";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/ui/seo-client";
import { JsonLd, breadcrumbJsonLd } from "@/components/ui/seo";
import ToolDirectory from "@/components/ToolDirectory";
import ToolCard from "@/components/ui/ToolCard";
import { siteUrl, popularTools } from "@/lib/tools";
import { isLocale, localizedPath, translate, type Locale } from "@/lib/i18n";
import { localizeTool } from "@/lib/ar-content";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) return {};
  const locale = localeParam as Locale;
  const isAr = locale === "ar";
  return {
    title: isAr ? "كل الأدوات المجانية — أدوات مجانية على الإنترنت" : "All Free Online Tools",
    description: isAr
      ? "تصفح كل الأدوات المجانية: محولات الصور، أدوات PDF، التعرف الضوئي، أدوات النصوص والألوان وأدوات المطورين والمساعدة. بدون تسجيل."
      : "Browse all free online tools: image converters, PDF tools, OCR, text utilities, color tools, developer tools, AI tools and calculators. No sign-up required.",
    alternates: {
      canonical: `${siteUrl}${localizedPath(locale, "/tools")}`,
      languages: { en: `${siteUrl}/tools`, ar: `${siteUrl}/ar/tools` },
    },
    openGraph: {
      title: isAr ? "كل الأدوات المجانية | ToolBox AI" : "All Free Online Tools | ToolBox AI",
      description: isAr ? "تصفح أكثر من 50 أداة مجانية للصور وPDF والنصوص والألوان والمزيد." : "Browse 50+ free online tools for images, PDFs, text, colors and more.",
      url: `${siteUrl}${localizedPath(locale, "/tools")}`,
      locale: isAr ? "ar_AR" : "en_US",
      alternateLocale: isAr ? "en_US" : "ar_AR",
    },
  };
}

export default async function ToolsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const l = (path: string) => localizedPath(locale, path);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: translate(locale, "breadcrumb.home"), url: "/" },
          { name: translate(locale, "breadcrumb.tools") },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: translate(locale, "breadcrumb.home"), url: "/" },
          { name: translate(locale, "breadcrumb.tools") },
        ]}
      />
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {translate(locale, "tools.heading")}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
          {translate(locale, "tools.sub")}
        </p>
      </header>
      <Suspense fallback={<DirectoryFallback locale={locale} />}>
        <ToolDirectory />
      </Suspense>
    </div>
  );
}

function DirectoryFallback({ locale }: { locale: Locale }) {
  const popular = popularTools.slice(0, 8).map((tool) => localizeTool(tool, locale));
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {popular.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
