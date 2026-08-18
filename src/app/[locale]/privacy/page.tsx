import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProsePage, { proseMetadata } from "@/components/ProsePage";
import { ArPrivacyPage } from "@/lib/ar-pages";
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
    locale === "ar" ? "سياسة الخصوصية" : "Privacy Policy",
    locale === "ar"
      ? "كيف يتعامل ToolBox AI مع بياناتك — ما يُعالَج محلياً، وما قد يُرفع، ومدة تخزين الملفات."
      : "How ToolBox AI handles your data — what is processed locally, what may be uploaded, and how long files are stored.",
    localizedPath(locale, "/privacy")
  );
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  if (locale === "ar") return <ArPrivacyPage />;

  return (
    <ProsePage title="Privacy Policy" updated="January 15, 2026" breadcrumb={{ name: "Privacy Policy" }}>
      <p>
        At <strong>ToolBox AI</strong>, privacy is a core design principle, not an afterthought. Most of our tools
        process files entirely in your browser. This policy explains, in plain language, what happens to your data.
      </p>

      <h2>Which files are processed locally</h2>
      <p>
        The following tools process everything on your device and never upload files to any server: image conversion,
        compression, resizing, cropping and rotation; PDF creation, merging, splitting, rotating and metadata
        inspection; OCR (text extraction); text, color, developer and utility tools; QR code generation; and the
        on-device AI tools (summarizer, rewriter, background removal, image description, AI OCR and manga colorizer).
      </p>

      <h2>Which files may be uploaded to servers</h2>
      <ul>
        <li>
          <strong>AI Translator</strong> sends the text you provide to a third-party translation API
          (MyMemory) to produce the translation. No other data is sent.
        </li>
        <li>
          Tools marked <strong>“Uses a secure API”</strong> on their page may send data to a server. Today only the
          translator falls into this category.
        </li>
      </ul>

      <h2>How long are files stored?</h2>
      <p>
        Files processed locally are never stored by us — they exist only in your browser&apos;s memory while the tool
        runs and disappear when the page is closed or refreshed. For the translator, text is transmitted to the
        translation service for processing; it is not stored by us.
      </p>

      <h2>Are files automatically deleted?</h2>
      <p>
        Yes. Because files never leave your device for local tools, there is nothing to delete. Any data sent to the
        translation API is handled under that service&apos;s terms and is not retained by ToolBox AI.
      </p>

      <h2>Do we sell your data?</h2>
      <p>
        No. We never sell, rent or trade personal data. We do not build profiles of individual users.
      </p>

      <h2>Analytics and advertising</h2>
      <p>
        We may use privacy-friendly, aggregated analytics and clearly labelled advertising to keep the platform free.
        Advertising and analytics cookies are only loaded after you give consent via the consent banner, and you can
        change your preferences at any time.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? See our <a href="/contact">Contact</a> page.
      </p>
    </ProsePage>
  );
}
