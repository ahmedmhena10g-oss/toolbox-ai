export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

export const localeDir = (locale: Locale): "ltr" | "rtl" => (locale === "ar" ? "rtl" : "ltr");

/** Prefix an internal path with the locale (server-safe, no hooks). */
export function localizedPath(locale: Locale, path: string): string {
  if (locale === "en") return path;
  if (path === "/") return "/ar";
  return `/ar${path.startsWith("/") ? path : `/${path}`}`;
}

/** Translate a UI string key for the given locale, optionally interpolating {vars}. */
export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>
): string {
  const table = ui[locale] ?? ui.en;
  let text: string = table[key as keyof typeof table] ?? ui.en[key as keyof typeof ui.en] ?? key;
  if (vars) {
    for (const [name, replacement] of Object.entries(vars)) {
      text = text.replace(`{${name}}`, String(replacement));
    }
  }
  return text;
}

export const ui = {
  en: {
    // Site / header
    "site.tagline": "Free Online Tools",
    "nav.allTools": "All Tools",
    "nav.categories": "Categories",
    "nav.browseBy": "Browse by category",
    "nav.blog": "Blog",
    "search.placeholder": "Search tools…",
    "search.homePlaceholder": "What do you want to do?",
    "search.aria": "Search tools",
    "search.noResults": "No tools found for “{q}”. Try “compress”, “convert” or “pdf”.",
    "menu.open": "Open menu",
    "menu.close": "Close menu",
    "switch.dark": "Switch to dark mode",
    "switch.light": "Switch to light mode",

    // Home
    "home.heroBadge": "50+ free tools · processed in your browser · no sign-up",
    "home.heroTitle": "Free Online Tools for Everyone",
    "home.heroSubtitle":
      "Convert, compress, edit, analyze and transform your files directly in your browser. Fast, private and 100% free.",
    "home.try": "Try:",
    "home.categoriesHeading": "Explore tools by category",
    "home.categoriesSub": "From images and PDFs to colors, text and AI — find the tool you need.",
    "home.allTools": "All tools",
    "home.popularHeading": "Popular Tools",
    "home.popularSub": "The tools people use most — free, fast and private.",
    "home.whyHeading": "Why Use Our Tools?",
    "home.whySub": "We built the tool platform we always wanted to use ourselves.",
    "home.benefit.free.title": "100% Free",
    "home.benefit.free.text": "Every tool is free forever. No trials, no credit cards, no hidden limits.",
    "home.benefit.fast.title": "Fast",
    "home.benefit.fast.text": "Files are processed instantly on your device — no waiting for uploads or queues.",
    "home.benefit.privacy.title": "Privacy-first",
    "home.benefit.privacy.text": "Most tools run entirely in your browser. Your files never touch a server.",
    "home.benefit.noreg.title": "No registration",
    "home.benefit.noreg.text": "Open a tool and start working. No account, no email, no tracking.",
    "home.viewFullFaq": "View the full FAQ",

    // Common
    "common.copy": "Copy",
    "common.copied": "Copied",
    "common.download": "Download",
    "common.downloadAll": "Download all ({n})",
    "common.reset": "Reset",
    "common.clear": "Clear",
    "common.clearResults": "Clear results",
    "common.changeFile": "Change file",
    "common.remove": "Remove",
    "common.chooseFile": "Choose file",
    "common.back": "Back",
    "common.reload": "Reload",
    "common.loading": "Processing…",
    "common.viewTools": "View tools",
    "common.openTool": "Open tool",

    // Uploader
    "upload.aria": "Upload files",
    "upload.dragDrop": "Drag & drop your files here",
    "upload.orBrowse": "or <b>browse from your device</b>",
    "upload.supported": "Supported: {formats}.",
    "upload.maxFiles": "Up to {n} files, ",
    "upload.maxSize": "Max {n} MB.",
    "upload.hintDefault": "Drag & drop {multiple} here, or click to browse. {formats}{count}{size}",
    "upload.oneFile": "a file",
    "upload.manyFiles": "your files",

    // Tool page
    "tool.badge.free": "100% free · no sign-up",
    "tool.badge.local": "Processed in your browser",
    "tool.badge.api": "Uses a secure API",
    "tool.badge.experimental": "Experimental",
    "tool.howTo": "How to use {name}",
    "tool.faq": "Frequently Asked Questions",
    "tool.related": "Related Tools",
    "tool.sidebar.popular": "Popular this week",
    "tool.disabled.title": "This tool is temporarily unavailable",
    "tool.disabled.text": "The administrator has disabled this tool. Please check back later or try a related tool instead.",
    "tool.comingSoon": "This tool is coming soon. Please check back later.",
    "tool.results": "Results ({n})",
    "tool.resultsEmpty": "Your converted files will appear here.",

    // Breadcrumbs
    "breadcrumb.home": "Home",
    "breadcrumb.tools": "Tools",

    // Footer
    "footer.blurb":
      "Free online tools for images, PDFs, documents, text, colors and more. Everything runs in your browser — fast, private and free.",
    "footer.processedLocally": "Files are processed locally",
    "footer.tools": "Tools",
    "footer.categories": "Categories",
    "footer.company": "Company",
    "footer.resources": "Resources",
    "footer.about": "About",
    "footer.contact": "Contact",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.cookie": "Cookie Policy",
    "footer.blog": "Blog",
    "footer.faq": "FAQ",
    "footer.sitemap": "Sitemap",
    "footer.allTools": "All Tools",
    "footer.rights": "All rights reserved.",
    "footer.privacyNote": "Built with privacy in mind — no accounts, no tracking, no file uploads.",

    // Ads
    "ad.label": "Advertisement",

    // Consent
    "consent.title": "We value your privacy",
    "consent.text":
      "We use essential cookies to make the site work, and optional cookies for analytics and advertising. Most tools process files entirely in your browser. You can change your preferences at any time.",
    "consent.acceptAll": "Accept all",
    "consent.essentialOnly": "Essential only",
    "consent.manage": "Manage preferences",
    "consent.dismiss": "Dismiss cookie banner",
    "consent.preferences": "Privacy preferences",
    "consent.preferencesSub": "Choose which categories you allow. You can change this at any time.",
    "consent.essential": "Essential",
    "consent.essentialDesc": "Required for the site to function. Always on.",
    "consent.analytics": "Analytics",
    "consent.analyticsDesc": "Anonymous statistics about how tools are used.",
    "consent.advertising": "Advertising",
    "consent.advertisingDesc": "Personalized ads from our advertising partners.",
    "consent.alwaysOn": "Always on",
    "consent.cancel": "Cancel",
    "consent.save": "Save preferences",

    // Blog
    "blog.heading": "Guides & Tutorials",
    "blog.sub": "Practical, no-fluff guides on images, PDFs, OCR and web performance — each with the right free tool to get the job done.",
    "blog.readArticle": "Read article",
    "blog.back": "Back to all articles",
    "blog.mentioned": "Tools mentioned in this article",
    "blog.englishNote": "The full article is currently available in English.",
    "blog.articlesNote": "Blog pages link naturally to the free tools they describe, so you can apply what you learn right away.",

    // All tools page
    "tools.heading": "All Free Online Tools",
    "tools.sub": "Every tool on ToolBox AI — free, private and fast. Search or filter to find exactly what you need.",
    "tools.filter": "Filter tools… try “compress”, “convert” or “pdf”",
    "tools.noMatch": "No tools match “{q}”. Try a different search term.",
    "tools.category.all": "All tools",

    // 404
    "404.title": "Page not found",
    "404.text": "We couldn’t find that page. It may have moved — or you may have mistyped the address.",
    "404.backHome": "Back to home",
    "404.browseTools": "Browse all tools",
    "404.popular": "Popular tools",
  },
  ar: {
    "site.tagline": "أدوات مجانية على الإنترنت",
    "nav.allTools": "كل الأدوات",
    "nav.categories": "التصنيفات",
    "nav.browseBy": "تصفّح حسب التصنيف",
    "nav.blog": "المدونة",
    "search.placeholder": "ابحث في الأدوات…",
    "search.homePlaceholder": "ماذا تريد أن تفعل؟",
    "search.aria": "ابحث في الأدوات",
    "search.noResults": "لا توجد أدوات مطابقة لـ «{q}». جرّب «ضغط» أو «تحويل» أو «PDF».",
    "menu.open": "افتح القائمة",
    "menu.close": "أغلق القائمة",
    "switch.dark": "التبديل إلى الوضع الداكن",
    "switch.light": "التبديل إلى الوضع الفاتح",

    "home.heroBadge": "أكثر من 50 أداة مجانية · تُعالَج في متصفحك · بدون تسجيل",
    "home.heroTitle": "أدوات مجانية على الإنترنت للجميع",
    "home.heroSubtitle":
      "حوّل، اضغط، عدّل، حلّل وحوّل ملفاتك مباشرة في متصفحك. سريع، خاص ومجاني 100%.",
    "home.try": "جرّب:",
    "home.categoriesHeading": "استكشف الأدوات حسب التصنيف",
    "home.categoriesSub": "من الصور وملفات PDF إلى الألوان والنصوص والذكاء الاصطناعي — اعثر على الأداة التي تحتاجها.",
    "home.allTools": "كل الأدوات",
    "home.popularHeading": "الأدوات الشائعة",
    "home.popularSub": "الأدوات الأكثر استخداماً — مجانية وسريعة وخاصة.",
    "home.whyHeading": "لماذا أدواتنا؟",
    "home.whySub": "بنينا منصة الأدوات التي كنا نتمنى استخدامها بأنفسنا.",
    "home.benefit.free.title": "مجاني 100%",
    "home.benefit.free.text": "كل أداة مجانية إلى الأبد. لا نسخ تجريبية ولا بطاقات ائتمان ولا حدود خفية.",
    "home.benefit.fast.title": "سريع",
    "home.benefit.fast.text": "تُعالَج الملفات فوراً على جهازك — لا انتظار للرفع أو الطوابير.",
    "home.benefit.privacy.title": "الخصوصية أولاً",
    "home.benefit.privacy.text": "معظم الأدوات تعمل بالكامل داخل متصفحك. ملفاتك لا تلمس أي خادم.",
    "home.benefit.noreg.title": "بدون تسجيل",
    "home.benefit.noreg.text": "افتح الأداة وابدأ العمل مباشرة. لا حساب ولا بريد إلكتروني ولا تتبع.",
    "home.viewFullFaq": "عرض الأسئلة الشائعة كاملة",

    "common.copy": "نسخ",
    "common.copied": "تم النسخ",
    "common.download": "تحميل",
    "common.downloadAll": "تحميل الكل ({n})",
    "common.reset": "إعادة تعيين",
    "common.clear": "مسح",
    "common.clearResults": "مسح النتائج",
    "common.changeFile": "تغيير الملف",
    "common.remove": "إزالة",
    "common.chooseFile": "اختر ملفاً",
    "common.back": "رجوع",
    "common.reload": "إعادة التحميل",
    "common.loading": "جارٍ المعالجة…",
    "common.viewTools": "عرض الأدوات",
    "common.openTool": "فتح الأداة",

    "upload.aria": "رفع الملفات",
    "upload.dragDrop": "اسحب ملفاتك وأفلتها هنا",
    "upload.orBrowse": "أو <b>تصفّح من جهازك</b>",
    "upload.supported": "الصيغ المدعومة: {formats}.",
    "upload.maxFiles": "حتى {n} ملفات، ",
    "upload.maxSize": "الحد الأقصى {n} م.ب.",
    "upload.hintDefault": "اسحب {multiple} وأفلتها هنا، أو انقر للتصفح. {formats}{count}{size}",
    "upload.oneFile": "ملفاً",
    "upload.manyFiles": "ملفاتك",

    "tool.badge.free": "مجاني 100% · بدون تسجيل",
    "tool.badge.local": "تُعالَج في متصفحك",
    "tool.badge.api": "يستخدم واجهة برمجية آمنة",
    "tool.badge.experimental": "تجريبي",
    "tool.howTo": "كيف تستخدم {name}",
    "tool.faq": "الأسئلة الشائعة",
    "tool.related": "أدوات ذات صلة",
    "tool.sidebar.popular": "الأكثر استخداماً هذا الأسبوع",
    "tool.disabled.title": "هذه الأداة غير متاحة مؤقتاً",
    "tool.disabled.text": "قام المدير بتعطيل هذه الأداة. عد لاحقاً أو جرّب أداة ذات صلة بدلاً منها.",
    "tool.comingSoon": "هذه الأداة قادمة قريباً. عد لاحقاً من فضلك.",
    "tool.results": "النتائج ({n})",
    "tool.resultsEmpty": "ستظهر ملفاتك المحوّلة هنا.",

    "breadcrumb.home": "الرئيسية",
    "breadcrumb.tools": "الأدوات",

    "footer.blurb":
      "أدوات مجانية على الإنترنت للصور وملفات PDF والمستندات والنصوص والألوان والمزيد. كل شيء يعمل داخل متصفحك — سريع وخاص ومجاني.",
    "footer.processedLocally": "تُعالَج الملفات محلياً",
    "footer.tools": "الأدوات",
    "footer.categories": "التصنيفات",
    "footer.company": "الشركة",
    "footer.resources": "مصادر",
    "footer.about": "من نحن",
    "footer.contact": "تواصل معنا",
    "footer.privacy": "سياسة الخصوصية",
    "footer.terms": "شروط الاستخدام",
    "footer.cookie": "سياسة الكوكيز",
    "footer.blog": "المدونة",
    "footer.faq": "الأسئلة الشائعة",
    "footer.sitemap": "خريطة الموقع",
    "footer.allTools": "كل الأدوات",
    "footer.rights": "جميع الحقوق محفوظة.",
    "footer.privacyNote": "صُنع مع مراعاة الخصوصية — لا حسابات ولا تتبع ولا رفع للملفات.",

    "ad.label": "إعلان",

    "consent.title": "نقدّر خصوصيتك",
    "consent.text":
      "نستخدم كوكيز أساسية لتشغيل الموقع، وكوكيز اختيارية للتحليلات والإعلانات. معظم الأدوات تعالج الملفات بالكامل داخل متصفحك. يمكنك تغيير تفضيلاتك في أي وقت.",
    "consent.acceptAll": "قبول الكل",
    "consent.essentialOnly": "الأساسية فقط",
    "consent.manage": "إدارة التفضيلات",
    "consent.dismiss": "إغلاق شريط الكوكيز",
    "consent.preferences": "تفضيلات الخصوصية",
    "consent.preferencesSub": "اختر الفئات التي تسمح بها. يمكنك تغيير ذلك في أي وقت.",
    "consent.essential": "أساسية",
    "consent.essentialDesc": "مطلوبة لتشغيل الموقع. تعمل دائماً.",
    "consent.analytics": "التحليلات",
    "consent.analyticsDesc": "إحصائيات مجهولة حول استخدام الأدوات.",
    "consent.advertising": "الإعلانات",
    "consent.advertisingDesc": "إعلانات مخصصة من شركائنا في الإعلان.",
    "consent.alwaysOn": "تعمل دائماً",
    "consent.cancel": "إلغاء",
    "consent.save": "حفظ التفضيلات",

    "blog.heading": "دليل ومقالات",
    "blog.sub": "أدلة عملية موجزة عن الصور وملفات PDF والتعرف الضوئي وأداء الويب — مع الأداة المجانية المناسبة لكل مهمة.",
    "blog.readArticle": "اقرأ المقال",
    "blog.back": "العودة إلى كل المقالات",
    "blog.mentioned": "أدوات مذكورة في هذا المقال",
    "blog.englishNote": "المقال الكامل متاح حالياً باللغة الإنجليزية.",
    "blog.articlesNote": "ترتبط صفحات المدونة طبيعياً بالأدوات المجانية التي تصفها، لتتمكن من تطبيق ما تتعلمه فوراً.",

    "tools.heading": "كل الأدوات المجانية",
    "tools.sub": "كل أداة على ToolBox AI — مجانية وخاصة وسريعة. ابحث أو صفِّ للعثور على ما تحتاجه بالضبط.",
    "tools.filter": "صفِّ الأدوات… جرّب «ضغط» أو «تحويل» أو «PDF»",
    "tools.noMatch": "لا توجد أدوات تطابق «{q}». جرّب كلمة بحث مختلفة.",
    "tools.category.all": "كل الأدوات",

    "404.title": "الصفحة غير موجودة",
    "404.text": "لم نتمكن من العثور على تلك الصفحة. ربما تغيّر عنوانها — أو ربما أخطأت في كتابة الرابط.",
    "404.backHome": "العودة إلى الرئيسية",
    "404.browseTools": "تصفّح كل الأدوات",
    "404.popular": "الأدوات الشائعة",
  },
} as const;

export type UiKey = keyof typeof ui.en;
