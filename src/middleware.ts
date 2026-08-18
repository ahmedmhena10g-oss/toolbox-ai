import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, locales } from "@/lib/i18n";

const LOCALE_COOKIE = "toolbox-locale";

/**
 * Routing strategy:
 *  - Arabic lives at /ar/... (its own URLs, good for SEO + hreflang)
 *  - English keeps its clean root URLs (/tools/...), rewritten internally to /en
 *  - "/" redirects to the visitor's preferred locale (cookie or Accept-Language)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (pathnameHasLocale) {
    // Remember the locale choice for the next visit to "/".
    const urlLocale = pathname.split("/")[1];
    if (isLocale(urlLocale) && request.cookies.get(LOCALE_COOKIE)?.value !== urlLocale) {
      const response = NextResponse.next();
      response.cookies.set(LOCALE_COOKIE, urlLocale, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
      return response;
    }
    return NextResponse.next();
  }

  // Root: negotiate the locale.
  if (pathname === "/") {
    const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
    if (cookie && isLocale(cookie) && cookie !== defaultLocale) {
      return NextResponse.redirect(new URL(`/${cookie}`, request.url));
    }
    const acceptLanguage = request.headers.get("accept-language") ?? "";
    if (acceptLanguage.toLowerCase().startsWith("ar")) {
      return NextResponse.redirect(new URL("/ar", request.url));
    }
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }

  // Everything else (including files and APIs) stays untouched.
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.rewrite(request.nextUrl);
}

export const config = {
  matcher: [
    // Skip static assets, image files and Next internals.
    "/((?!_next|api|.*\\..*).*)",
  ],
};
