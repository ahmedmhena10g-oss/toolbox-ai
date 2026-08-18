import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProsePage, { proseMetadata } from "@/components/ProsePage";
import { FAQSection } from "@/components/ui/seo-client";
import { JsonLd, faqJsonLd } from "@/components/ui/seo";
import { ArFaqPage, AR_FAQS } from "@/lib/ar-pages";
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
    locale === "ar" ? "الأسئلة الشائعة" : "Frequently Asked Questions",
    locale === "ar"
      ? "إجابات عن الأسئلة الشائعة حول ToolBox AI: الخصوصية ومعالجة الملفات والصيغ والمزيد."
      : "Answers to common questions about ToolBox AI: privacy, file processing, formats and more.",
    localizedPath(locale, "/faq")
  );
}

const FAQS_EN = [
  {
    q: "Are the tools really free?",
    a: "Yes. Every tool is free with no registration, no watermarks and no daily limits. The platform is funded by clearly labelled, optional advertising.",
  },
  {
    q: "Do my files get uploaded anywhere?",
    a: "Almost never. Image, PDF, text, color, developer and utility tools process files entirely in your browser. The only exceptions are the few AI tools marked “Uses a secure API” — currently the translator.",
  },
  {
    q: "How do I know processing is local?",
    a: "Every tool page shows a badge: “Processed in your browser” or “Uses a secure API”. Local tools keep running even if you disconnect from the internet after the page loads.",
  },
  {
    q: "Which formats are supported?",
    a: "Images: JPG, PNG, WebP, AVIF, GIF and BMP. Documents: PDF. Text: any text you can paste. Each tool page lists its supported formats in the upload area.",
  },
  {
    q: "Can I use the tools on my phone?",
    a: "Yes — the whole site is responsive and the upload area supports touch. Drag and drop works on desktop; on mobile just tap to choose files.",
  },
  {
    q: "Why do some tools have an “Experimental” badge?",
    a: "Experimental tools (AI coloring, on-device summarizer, background removal) work, but their results vary more than the core tools. We label them honestly instead of overpromising.",
  },
  {
    q: "How can I add or suggest a tool?",
    a: "We add new tools regularly. Contact us through the Contact page with your idea — user suggestions drive the roadmap.",
  },
];

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  if (locale === "ar") {
    return (
      <>
        <JsonLd data={faqJsonLd(AR_FAQS)} />
        <ArFaqPage />
      </>
    );
  }

  return (
    <ProsePage title="Frequently Asked Questions" breadcrumb={{ name: "FAQ" }}>
      <JsonLd data={faqJsonLd(FAQS_EN)} />
      <p>Answers to the questions we hear most often. Can&apos;t find yours? Check the Contact page.</p>
      <FAQSection faqs={FAQS_EN} />
    </ProsePage>
  );
}
