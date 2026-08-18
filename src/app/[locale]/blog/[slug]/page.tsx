import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Clock, Lightbulb, Wand2 } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/seo-client";
import { JsonLd, breadcrumbJsonLd } from "@/components/ui/seo";
import AdSlot from "@/components/ui/AdSlot";
import { blogBySlug, type BlogBlock } from "@/lib/blog";
import { toolBySlug, siteUrl, siteName } from "@/lib/tools";
import { isLocale, localizedPath, translate, type Locale } from "@/lib/i18n";
import { localizeTool } from "@/lib/ar-content";

export function generateStaticParams() {
  return (["en", "ar"] as const).flatMap((locale) =>
    Object.keys(blogBySlug).map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  if (!isLocale(localeParam)) return { title: "Not found" };
  const locale = localeParam as Locale;
  const post = blogBySlug[slug];
  if (!post) return { title: locale === "ar" ? "المقال غير موجود" : "Article not found" };
  const pagePath = localizedPath(locale, `/blog/${post.slug}`);
  return {
    title: post.seoTitle,
    description: post.seoDescription,
    alternates: {
      canonical: `${siteUrl}${pagePath}`,
      languages: {
        en: `${siteUrl}/blog/${post.slug}`,
        ar: `${siteUrl}/ar/blog/${post.slug}`,
      },
    },
    openGraph: {
      type: "article",
      title: post.seoTitle,
      description: post.seoDescription,
      url: `${siteUrl}${pagePath}`,
      publishedTime: post.date,
      locale: locale === "ar" ? "ar_AR" : "en_US",
      alternateLocale: locale === "ar" ? "en_US" : "ar_AR",
    },
    twitter: { card: "summary", title: post.seoTitle, description: post.seoDescription },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const isAr = locale === "ar";
  const t = (key: string) => translate(locale, key);
  const l = (path: string) => localizedPath(locale, path);
  const post = blogBySlug[slug];
  if (!post) notFound();

  const relatedTools = post.content
    .filter((block): block is Extract<BlogBlock, { type: "tool" }> => block.type === "tool")
    .map((block) => toolBySlug[block.slug])
    .filter((tool): tool is NonNullable<typeof tool> => Boolean(tool));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.date,
          author: { "@type": "Organization", name: siteName },
          publisher: { "@type": "Organization", name: siteName },
          mainEntityOfPage: `${siteUrl}${l(`/blog/${post.slug}`)}`,
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t("breadcrumb.home"), url: "/" },
          { name: t("nav.blog"), url: "/blog" },
          { name: post.title },
        ])}
      />

      <Breadcrumbs
        items={[
          { name: t("breadcrumb.home"), url: "/" },
          { name: t("nav.blog"), url: "/blog" },
          { name: post.title },
        ]}
      />

      <article>
        <header>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" aria-hidden /> {post.date}</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden /> {post.readTime}</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            {post.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-300">{post.excerpt}</p>
          {isAr && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              {t("blog.englishNote")}
            </p>
          )}
        </header>

        <AdSlot position="top" />

        <div className="mt-8 space-y-5 text-base leading-relaxed text-slate-700 dark:text-slate-300">
          {post.content.map((block, index) => {
            switch (block.type) {
              case "p":
                return <p key={index}>{block.text}</p>;
              case "h2":
                return (
                  <h2 key={index} className="pt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {block.text}
                  </h2>
                );
              case "h3":
                return (
                  <h3 key={index} className="pt-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {block.text}
                  </h3>
                );
              case "ul":
                return (
                  <ul key={index} className="list-disc space-y-2 pr-6 marker:text-brand-500 rtl:list-disc">
                    {block.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                );
              case "ol":
                return (
                  <ol key={index} className="list-decimal space-y-2 pr-6 marker:font-semibold marker:text-brand-500 rtl:list-decimal">
                    {block.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ol>
                );
              case "tip":
                return (
                  <div key={index} className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                    <Lightbulb className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                    <p>{block.text}</p>
                  </div>
                );
              case "tool": {
                const tool = toolBySlug[block.slug];
                if (!tool) return null;
                const localized = localizeTool(tool, locale);
                return (
                  <div key={index} className="flex items-start gap-4 rounded-2xl border border-brand-200 bg-brand-50/60 p-5 dark:border-brand-500/30 dark:bg-brand-500/10">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
                      <Wand2 className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-600 dark:text-slate-300">{block.intro}</p>
                      <a
                        href={l(`/tools/${tool.slug}`)}
                        className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:underline dark:text-brand-300"
                      >
                        {isAr ? "افتح" : "Open"} {localized.name} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
                      </a>
                    </div>
                  </div>
                );
              }
              default:
                return null;
            }
          })}
        </div>
      </article>

      <AdSlot position="bottom" />

      {relatedTools.length > 0 && (
        <section className="mt-12" aria-labelledby="article-tools-heading">
          <h2 id="article-tools-heading" className="text-xl font-bold text-slate-900 dark:text-white">
            {t("blog.mentioned")}
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {relatedTools.map((tool) => {
              const localized = localizeTool(tool, locale);
              return (
                <a
                  key={tool.id}
                  href={l(`/tools/${tool.slug}`)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-brand-600 dark:hover:text-brand-300"
                >
                  {localized.name}
                </a>
              );
            })}
          </div>
        </section>
      )}

      <div className="mt-12 border-t border-slate-200 pt-8 dark:border-slate-700">
        <a
          href={l("/blog")}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
        >
          <ArrowRight className="h-4 w-4 rotate-180 rtl:rotate-0" aria-hidden /> {t("blog.back")}
        </a>
      </div>
    </div>
  );
}
