import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail, MessageSquare, Bug, Lightbulb } from "lucide-react";
import ProsePage, { proseMetadata } from "@/components/ProsePage";
import { ArContactPage } from "@/lib/ar-pages";
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
    locale === "ar" ? "تواصل معنا" : "Contact Us",
    locale === "ar"
      ? "تواصل مع فريق ToolBox AI — أبلغ عن خطأ أو اقترح أداة أو اطرح سؤالاً."
      : "Get in touch with the ToolBox AI team — report a bug, suggest a tool or ask a question.",
    localizedPath(locale, "/contact")
  );
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  if (locale === "ar") return <ArContactPage />;

  return (
    <ProsePage title="Contact Us" breadcrumb={{ name: "Contact" }}>
      <p>
        We read every message. Whether you found a bug, want a new tool, or just have a question — we&apos;d love to
        hear from you.
      </p>

      <div className="mt-6 space-y-3">
        {[
          { icon: <Bug className="h-4 w-4" />, title: "Report a problem", text: "Something not working? Tell us which tool and what happened." },
          { icon: <Lightbulb className="h-4 w-4" />, title: "Suggest a tool", text: "We add new tools regularly and ideas from users drive the roadmap." },
          { icon: <MessageSquare className="h-4 w-4" />, title: "General questions", text: "Anything else — partnerships, feedback, or just to say hi." },
        ].map((item) => (
          <div key={item.title} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
              {item.icon}
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{item.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-6 text-center dark:border-brand-500/30 dark:bg-brand-500/10">
        <a
          href="mailto:hello@toolbox-ai.com?subject=ToolBox%20AI%20—%20Message"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          <Mail className="h-4 w-4" aria-hidden />
          hello@toolbox-ai.com
        </a>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          We typically reply within a couple of business days.
        </p>
      </div>
    </ProsePage>
  );
}
