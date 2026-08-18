"use client";

import Link from "next/link";
import { forwardRef, type ComponentProps } from "react";
import { useLocale } from "./LocaleProvider";

/**
 * Drop-in replacement for next/link. Arabic users get /ar-prefixed URLs so
 * every language has its own crawlable, shareable addresses.
 */
const LocalizedLink = forwardRef<HTMLAnchorElement, ComponentProps<typeof Link>>(
  function LocalizedLink({ href, ...rest }, ref) {
    const { locale } = useLocale();
    const localizedHref = useLocalizedHref(href, locale);
    return <Link ref={ref} href={localizedHref} {...rest} />;
  }
);

export function useLocalizedHref(href: string | object, locale: "en" | "ar"): string | object {
  if (typeof href !== "string") return href;
  if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) {
    return href;
  }
  if (locale === "ar" && href !== "/") return `/ar${href.startsWith("/") ? href : `/${href}`}`;
  if (locale === "ar" && href === "/") return "/ar";
  return href;
}

export default LocalizedLink;
