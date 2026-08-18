import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProsePage, { proseMetadata } from "@/components/ProsePage";
import { ArTermsPage } from "@/lib/ar-pages";
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
    locale === "ar" ? "شروط الاستخدام" : "Terms of Service",
    locale === "ar"
      ? "الشروط التي تحكم استخدامك لأدوات ToolBox AI المجانية على الإنترنت."
      : "The terms that govern your use of ToolBox AI's free online tools.",
    localizedPath(locale, "/terms")
  );
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  if (locale === "ar") return <ArTermsPage />;

  return (
    <ProsePage title="Terms of Service" updated="January 15, 2026" breadcrumb={{ name: "Terms of Service" }}>
      <p>
        By using <strong>ToolBox AI</strong> (“the service”), you agree to these terms. If you do not agree, please
        don&apos;t use the service.
      </p>

      <h2>1. The service</h2>
      <p>
        ToolBox AI provides free online tools for processing images, PDFs, documents, text, colors and other data.
        Most tools run entirely in your browser; some AI features use third-party APIs and are clearly labelled.
      </p>

      <h2>2. Acceptable use</h2>
      <ul>
        <li>You may use the tools for personal and commercial purposes.</li>
        <li>You may not use the service for unlawful activity or to process content you don&apos;t have the right to process.</li>
        <li>You may not attempt to disrupt the service, scrape it at scale, or reverse-engineer it.</li>
        <li>Password protection tools may only be used on files you own or have permission to protect. Unlock tools only work with the correct password.</li>
      </ul>

      <h2>3. No warranty</h2>
      <p>
        The service is provided “as is” without warranties of any kind. We work hard to keep tools accurate, but we
        don&apos;t guarantee that output is error-free or suitable for a particular purpose. Always verify important
        results — especially OCR text, conversions and processed files — before relying on them.
      </p>

      <h2>4. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, ToolBox AI is not liable for any indirect or consequential damages
        arising from use of the service, including data loss. Files processed locally are your responsibility to back up.
      </p>

      <h2>5. Intellectual property</h2>
      <p>
        You retain all rights to the files you process. The service, its design and its content belong to ToolBox AI
        and may not be copied or redistributed without permission.
      </p>

      <h2>6. Changes</h2>
      <p>
        We may update these terms from time to time. Continued use of the service after changes means you accept the
        updated terms.
      </p>

      <h2>7. Contact</h2>
      <p>
        Questions about these terms? See our <a href="/contact">Contact</a> page.
      </p>
    </ProsePage>
  );
}
