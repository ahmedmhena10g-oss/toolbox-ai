import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProsePage, { proseMetadata } from "@/components/ProsePage";
import { ArCookiePolicyPage } from "@/lib/ar-pages";
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
    locale === "ar" ? "سياسة الكوكيز" : "Cookie Policy",
    locale === "ar"
      ? "كيف يستخدم ToolBox AI الكوكيز وكيف تتحكم في تفضيلاتك."
      : "How ToolBox AI uses cookies and how you control your preferences.",
    localizedPath(locale, "/cookie-policy")
  );
}

export default async function CookiePolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  if (locale === "ar") return <ArCookiePolicyPage />;

  return (
    <ProsePage title="Cookie Policy" updated="January 15, 2026" breadcrumb={{ name: "Cookie Policy" }}>
      <p>
        This policy explains what cookies are, which ones ToolBox AI uses, and how you can control them. You can
        change your choices at any time using the consent banner or the preferences dialog.
      </p>

      <h2>What are cookies?</h2>
      <p>
        Cookies are small text files stored on your device by a website. They help the site remember your preferences
        and, for optional services, understand how the site is used.
      </p>

      <h2>Essential cookies and storage</h2>
      <p>
        These are required for the site to function. We use browser storage (localStorage) for your theme choice,
        consent preferences and anonymous tool-usage counters. These never leave your device and contain no personal
        identifiers.
      </p>

      <h2>Optional cookies</h2>
      <ul>
        <li>
          <strong>Analytics</strong> — anonymous, aggregated statistics about which tools are used. Loaded only with
          your consent.
        </li>
        <li>
          <strong>Advertising</strong> — personalized ads from our advertising partners. Advertising scripts and
          cookies load only after you consent, and only when an ad network is configured.
        </li>
      </ul>

      <h2>How to manage preferences</h2>
      <p>
        Use the consent banner to accept all, accept only essential cookies, or open the preferences dialog to choose
        category by category. Your choice is remembered on this device.
      </p>

      <h2>No tracking without consent</h2>
      <p>
        Non-essential advertising and analytics scripts are never loaded before you give consent. The core tools work
        fully without any optional cookies.
      </p>
    </ProsePage>
  );
}
