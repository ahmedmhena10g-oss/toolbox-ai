import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs, CategoryLinks } from "@/components/ui/seo-client";
import { JsonLd, breadcrumbJsonLd } from "@/components/ui/seo";
import ToolCard from "@/components/ui/ToolCard";
import AdSlot from "@/components/ui/AdSlot";
import { categoryBySlug, toolsByCategory, siteUrl } from "@/lib/tools";
import { getIcon } from "@/components/icons";
import { isLocale, localizedPath, translate, type Locale } from "@/lib/i18n";
import { localizeCategory, localizeTool } from "@/lib/ar-content";

export function generateStaticParams() {
  return (["en", "ar"] as const).flatMap((locale) =>
    Object.keys(categoryBySlug).map((slug) => ({ locale, category: slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, category: slug } = await params;
  if (!isLocale(localeParam)) return { title: "Not found" };
  const locale = localeParam as Locale;
  const config = categoryBySlug[slug];
  if (!config) return { title: locale === "ar" ? "غير موجودة" : "Not found" };
  const localized = localizeCategory(config.id, locale);
  const isAr = locale === "ar";
  return {
    title: isAr ? `${localized.name} — أدوات مجانية على الإنترنت` : config.seoTitle,
    description: isAr ? localized.description : config.seoDescription,
    alternates: {
      canonical: `${siteUrl}${localizedPath(locale, `/${config.slug}`)}`,
      languages: {
        en: `${siteUrl}/${config.slug}`,
        ar: `${siteUrl}/ar/${config.slug}`,
      },
    },
    openGraph: {
      title: isAr ? `${localized.name} — أدوات مجانية` : config.seoTitle,
      description: isAr ? localized.description : config.seoDescription,
      url: `${siteUrl}${localizedPath(locale, `/${config.slug}`)}`,
      locale: isAr ? "ar_AR" : "en_US",
      alternateLocale: isAr ? "en_US" : "ar_AR",
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale: localeParam, category: slug } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const config = categoryBySlug[slug];
  if (!config) notFound();

  const localized = localizeCategory(config.id, locale);
  const categoryTools = toolsByCategory(config.id).map((tool) => localizeTool(tool, locale));
  const Icon = getIcon(config.icon);
  const l = (path: string) => localizedPath(locale, path);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: translate(locale, "breadcrumb.home"), url: "/" },
          { name: localized.name },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: translate(locale, "breadcrumb.home"), url: "/" },
          { name: localized.name },
        ]}
      />

      <header className="mb-8">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm">
          <Icon className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {localized.name}
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
          {localized.description}
        </p>
      </header>

      <AdSlot position="top" />

      <section className="mt-8" aria-labelledby="tools-heading">
        <h2 id="tools-heading" className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          {localized.name} ({categoryTools.length})
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categoryTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {locale === "ar" ? "استكشف تصنيفات أخرى" : "Explore other categories"}
        </h2>
        <div className="mt-4">
          <CategoryLinks />
        </div>
      </section>
    </div>
  );
}
