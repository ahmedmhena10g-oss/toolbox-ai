import type { Metadata } from "next";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/seo-client";
import { JsonLd, breadcrumbJsonLd } from "@/components/ui/seo";
import { blogPosts } from "@/lib/blog";
import { siteUrl } from "@/lib/tools";
import { isLocale, localizedPath, translate, type Locale } from "@/lib/i18n";
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
    title: isAr ? "المدونة — دليل ومقالات" : "Blog — Guides & Tutorials",
    description: isAr
      ? "أدلة عملية حول ضغط الصور والعمل مع PDF والتعرف الضوئي وWebP والمزيد. تعلّم كيفية الاستفادة القصوى من الأدوات المجانية."
      : "Practical guides on compressing images, working with PDFs, OCR, WebP and more. Learn how to get the most from free online tools.",
    alternates: {
      canonical: `${siteUrl}${localizedPath(locale, "/blog")}`,
      languages: { en: `${siteUrl}/blog`, ar: `${siteUrl}/ar/blog` },
    },
  };
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const isAr = locale === "ar";
  const t = (key: string) => translate(locale, key);
  const l = (path: string) => localizedPath(locale, path);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t("breadcrumb.home"), url: "/" },
          { name: t("nav.blog") },
        ])}
      />
      <Breadcrumbs items={[{ name: t("breadcrumb.home"), url: "/" }, { name: t("nav.blog") }]} />
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {t("blog.heading")}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">{t("blog.sub")}</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        {blogPosts.map((post) => (
          <article
            key={post.slug}
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover dark:border-slate-700 dark:bg-slate-800/60"
          >
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                {post.category}
              </span>
              <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" aria-hidden /> {post.date}</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden /> {post.readTime}</span>
            </div>
            <h2 className="mt-3 text-lg font-bold leading-snug text-slate-900 dark:text-white">
              <a href={l(`/blog/${post.slug}`)} className="transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-400">
                {post.title}
              </a>
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{post.excerpt}</p>
            {isAr && (
              <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{t("blog.englishNote")}</p>
            )}
            <a
              href={l(`/blog/${post.slug}`)}
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              {t("blog.readArticle")} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
            </a>
          </article>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-slate-400">{t("blog.articlesNote")}</p>
    </div>
  );
}
