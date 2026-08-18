import type { Metadata } from "next";
import { Sparkles, ShieldCheck, Zap, Gift, ArrowRight, Search, Lock } from "lucide-react";
import SearchBox from "@/components/layout/SearchBox";
import ToolCard from "@/components/ui/ToolCard";
import { FAQSection } from "@/components/ui/seo-client";
import { JsonLd } from "@/components/ui/seo";
import AdSlot from "@/components/ui/AdSlot";
import { categories, popularTools, siteName, siteUrl } from "@/lib/tools";
import { getIcon } from "@/components/icons";
import { isLocale, localeDir, localizedPath, translate, type Locale } from "@/lib/i18n";
import { localizeCategory, localizeTool } from "@/lib/ar-content";
import { notFound } from "next/navigation";

const HERO_FAQS_EN = [
  {
    q: "Are the tools really free?",
    a: "Yes — every tool on ToolBox AI is completely free with no registration, no watermarks and no hidden limits. We keep the platform free through clearly separated, non-intrusive advertising.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. All basic tools work immediately, right in your browser. There is nothing to sign up for and nothing to install.",
  },
  {
    q: "Are my files uploaded to a server?",
    a: "Almost never. Image, PDF, text, color, developer and utility tools process everything locally in your browser, so your files never leave your device. A few AI tools use a secure API, and those are clearly labelled.",
  },
];

const HERO_FAQS_AR = [
  {
    q: "هل الأدوات مجانية فعلاً؟",
    a: "نعم — كل أداة على ToolBox AI مجانية تماماً دون تسجيل أو علامات مائية أو حدود خفية. نحافظ على مجانية المنصة عبر إعلانات منفصلة بوضوح وغير مزعجة.",
  },
  {
    q: "هل أحتاج إلى إنشاء حساب؟",
    a: "لا. جميع الأدوات الأساسية تعمل فوراً داخل متصفحك. لا يوجد ما تسجل فيه ولا ما تثبته.",
  },
  {
    q: "هل تُرفع ملفاتي إلى خادم؟",
    a: "تقريباً أبداً. تعالج أدوات الصور وPDF والنصوص والألوان وأدوات المطورين والمساعدة كل شيء محلياً في متصفحك، لذا لا تغادر ملفاتك جهازك. بعض أدوات الذكاء الاصطناعي تستخدم واجهة برمجية آمنة وهي مُعلَّمة بوضوح.",
  },
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) return {};
  const locale = localeParam as Locale;
  const isAr = locale === "ar";
  const home = localizedPath(locale, "/");
  return {
    title: isAr ? "أدوات مجانية على الإنترنت للجميع — ToolBox AI" : `${siteName} — Free Online Tools for Everyone`,
    description: isAr
      ? "حوّل، اضغط، عدّل، حلّل وحوّل ملفاتك مباشرة في متصفحك. أدوات مجانية للصور وPDF والنصوص والألوان والمزيد — بدون تسجيل وبدون رفع ملفات."
      : "Convert, compress, edit, analyze and transform your files directly in your browser. Free online tools for images, PDFs, text, colors and more — no sign-up, no uploads.",
    alternates: {
      canonical: `${siteUrl}${home === "/" ? "" : home}`,
      languages: { en: siteUrl, ar: `${siteUrl}/ar` },
    },
    openGraph: {
      type: "website",
      siteName,
      title: isAr ? "أدوات مجانية على الإنترنت للجميع" : "Free Online Tools for Everyone",
      description: isAr
        ? "أدوات مجانية للصور وملفات PDF والنصوص والألوان والمزيد. عالج ملفاتك مباشرة في متصفحك."
        : "Free online tools for images, PDFs, text, colors and more. Process files directly in your browser.",
      url: `${siteUrl}${home === "/" ? "" : home}`,
      locale: isAr ? "ar_AR" : "en_US",
      alternateLocale: isAr ? "en_US" : "ar_AR",
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const isAr = locale === "ar";
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  const l = (path: string) => localizedPath(locale, path);
  const heroFaqs = isAr ? HERO_FAQS_AR : HERO_FAQS_EN;
  const heroPrompts = isAr ? ["ضغط", "تحويل", "PDF", "رمز QR"] : ["compress", "convert", "pdf", "qr code"];
  const popular = popularTools.map((tool) => localizeTool(tool, locale));
  const benefitItems = [
    { icon: <Gift className="h-5 w-5" />, title: t("home.benefit.free.title"), text: t("home.benefit.free.text") },
    { icon: <Zap className="h-5 w-5" />, title: t("home.benefit.fast.title"), text: t("home.benefit.fast.text") },
    { icon: <Lock className="h-5 w-5" />, title: t("home.benefit.privacy.title"), text: t("home.benefit.privacy.text") },
    { icon: <ShieldCheck className="h-5 w-5" />, title: t("home.benefit.noreg.title"), text: t("home.benefit.noreg.text") },
  ];

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteName,
          url: `${siteUrl}${l("/") === "/" ? "" : l("/")}`,
          description: isAr
            ? "أدوات مجانية على الإنترنت للصور وملفات PDF والنصوص والألوان والمزيد."
            : "Free online tools for images, PDFs, text, colors and more.",
          potentialAction: {
            "@type": "SearchAction",
            target: `${siteUrl}${l("/tools")}?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-50 via-white to-slate-50 dark:from-brand-950/40 dark:via-slate-900 dark:to-slate-900" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-brand-700 backdrop-blur dark:border-brand-500/30 dark:bg-slate-800/70 dark:text-brand-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {t("home.heroBadge")}
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
            {isAr ? (
              t("home.heroTitle")
            ) : (
              <>
                Free Online Tools for{" "}
                <span className="bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">Everyone</span>
              </>
            )}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            {t("home.heroSubtitle")}
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <SearchBox size="lg" placeholder={t("search.homePlaceholder")} />
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1"><Search className="h-3 w-3" aria-hidden /> {t("home.try")}</span>
              {heroPrompts.map((prompt) => (
                <a
                  key={prompt}
                  href={`${l("/tools")}?q=${encodeURIComponent(prompt)}`}
                  className="rounded-full bg-white px-3 py-1 font-medium text-brand-600 shadow-sm transition-colors hover:bg-brand-50 dark:bg-slate-800 dark:text-brand-300 dark:hover:bg-slate-700"
                >
                  {prompt}
                </a>
              ))}
            </div>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {popular.slice(0, 8).map((tool) => (
              <a
                key={tool.id}
                href={l(`/tools/${tool.slug}`)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-brand-600 dark:hover:text-brand-300"
              >
                {tool.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6" aria-labelledby="categories-heading">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 id="categories-heading" className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              {t("home.categoriesHeading")}
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t("home.categoriesSub")}</p>
          </div>
          <a href={l("/tools")} className="hidden items-center gap-1 text-sm font-semibold text-brand-600 hover:underline sm:flex dark:text-brand-400">
            {t("home.allTools")} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
          </a>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = getIcon(category.icon);
            const localized = localizeCategory(category.id, locale);
            return (
              <a
                key={category.id}
                href={l(`/${category.slug}`)}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-brand-700"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-500/10 dark:text-brand-300 dark:group-hover:bg-brand-600 dark:group-hover:text-white">
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{localized.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{localized.tagline}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400">
                  {t("common.viewTools")} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" aria-hidden />
                </span>
              </a>
            );
          })}
        </div>
      </section>

      <AdSlot position="content" />

      {/* Popular tools */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6" aria-labelledby="popular-heading">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 id="popular-heading" className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              {t("home.popularHeading")}
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t("home.popularSub")}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* Why use our tools */}
      <section className="border-y border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-800/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            {t("home.whyHeading")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-500 dark:text-slate-400">
            {t("home.whySub")}
          </p>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefitItems.map((benefit) => (
              <div key={benefit.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-700 dark:bg-slate-800/60">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  {benefit.icon}
                </span>
                <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{benefit.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{benefit.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <FAQSection faqs={heroFaqs} />
        <div className="mt-8 text-center">
          <a href={l("/faq")} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
            {t("home.viewFullFaq")} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
          </a>
        </div>
      </section>
    </div>
  );
}
