import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { isLocale, localeDir, type Locale } from "@/lib/i18n";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ConsentBanner from "@/components/layout/ConsentBanner";
import { ToastProvider } from "@/components/ui/Toast";
import { siteName, siteUrl } from "@/lib/tools";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Free Online Tools for Everyone`,
    template: `%s | ${siteName}`,
  },
  description:
    "Convert, compress, edit, analyze and transform your files directly in your browser. Free online tools for images, PDFs, documents, text, colors and more — no sign-up, no uploads.",
  keywords: [
    "free online tools",
    "image converter",
    "pdf tools",
    "compress image",
    "compress pdf",
    "ocr",
    "color picker",
    "qr code generator",
  ],
  openGraph: {
    type: "website",
    siteName,
    title: `${siteName} — Free Online Tools for Everyone`,
    description: "Free online tools for images, PDFs, text, colors and more. Process files directly in your browser.",
    url: siteUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: `${siteName} — Free Online Tools for Everyone`,
    description: "Free online tools for images, PDFs, text, colors and more. Process files directly in your browser.",
  },
  robots: { index: true, follow: true },
  category: "technology",
};

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }];
}

const themeBootstrap = `
(function () {
  try {
    var stored = localStorage.getItem("toolbox.theme.v1");
    var dark = stored ? JSON.parse(stored) === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
})();
`;

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale = localeParam as Locale;

  return (
    <html lang={locale} dir={localeDir(locale)} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className={`flex min-h-screen flex-col ${locale === "ar" ? "font-arabic" : "font-sans"}`}>
        <LocaleProvider locale={locale}>
          <ToastProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
            >
              {locale === "ar" ? "تخطَّ إلى المحتوى الرئيسي" : "Skip to main content"}
            </a>
            <Header />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
            <ConsentBanner />
          </ToastProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
