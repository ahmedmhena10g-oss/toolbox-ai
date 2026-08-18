import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Gift, Zap, Lock, ShieldCheck } from "lucide-react";
import ProsePage, { proseMetadata } from "@/components/ProsePage";
import { ArAboutPage } from "@/lib/ar-pages";
import { isLocale, localizedPath, type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) return {};
  const locale = localeParam as Locale;
  return proseMetadata(
    locale === "ar" ? "عن ToolBox AI" : "About ToolBox AI",
    locale === "ar"
      ? "ToolBox AI مجموعة من الأدوات المجانية على الإنترنت التي تراعي الخصوصية وتعالج الملفات مباشرة في متصفحك."
      : "ToolBox AI is a collection of free, privacy-focused online tools that process files directly in your browser.",
    localizedPath(locale, "/about")
  );
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  if (locale === "ar") return <ArAboutPage />;

  return (
    <ProsePage
      title="About ToolBox AI"
      breadcrumb={{ name: "About" }}
    >
      <p>
        <strong>ToolBox AI</strong> started with a simple frustration: converting a file or checking a color usually
        meant uploading your work to some random website, waiting in a queue, and downloading it again with a
        watermark. That&apos;s not how tools should work.
      </p>
      <p>
        So we built the toolbox we wanted: fast, free, and private. Every core tool runs directly in your browser —
        your images, PDFs and text never leave your device. No accounts, no queues, no watermarks, no tricks.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          { icon: <Gift className="h-5 w-5" />, title: "Free forever", text: "No paywalls, no trials, no credit cards. Advertising keeps the lights on — clearly separated and non-intrusive." },
          { icon: <Zap className="h-5 w-5" />, title: "Fast by design", text: "Processing happens on your device, so results are instant and server load stays low." },
          { icon: <Lock className="h-5 w-5" />, title: "Privacy first", text: "Local processing by default. The few features that use an API are labelled and explained." },
          { icon: <ShieldCheck className="h-5 w-5" />, title: "Built to last", text: "One shared architecture, clean SEO, and a tool system designed so new tools are easy to add." },
        ].map((value) => (
          <div key={value.title} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800/60">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              {value.icon}
            </span>
            <h2 className="mt-3 text-base font-bold text-slate-900 dark:text-white">{value.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{value.text}</p>
          </div>
        ))}
      </div>

      <h2>What we don&apos;t do</h2>
      <ul>
        <li>We don&apos;t sell your data — we don&apos;t even collect it.</li>
        <li>We don&apos;t use fake download buttons or trick you into clicking ads.</li>
        <li>We don&apos;t watermark or limit your files.</li>
      </ul>

      <p>
        Have an idea for a tool? We&apos;d love to hear it — <Link href="/contact">get in touch</Link>.
      </p>
    </ProsePage>
  );
}
