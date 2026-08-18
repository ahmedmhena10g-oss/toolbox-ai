import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "./ui/seo-client";
import { JsonLd, breadcrumbJsonLd } from "./ui/seo";

export function proseMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: { index: true, follow: true },
  };
}

export default function ProsePage({
  title,
  description,
  updated,
  breadcrumb,
  homeLabel = "Home",
  updatedLabel = "Last updated",
  children,
}: {
  title: string;
  description?: string;
  updated?: string;
  breadcrumb: { name: string; url?: string };
  homeLabel?: string;
  updatedLabel?: string;
  children: ReactNode;
}) {
  const crumbs = [
    { name: homeLabel, url: "/" },
    { name: breadcrumb.name, url: breadcrumb.url },
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">{title}</h1>
        {description && <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">{description}</p>}
        {updated && <p className="mt-2 text-xs text-slate-400">{updatedLabel}: {updated}</p>}
      </header>
      <div className="prose-content">{children}</div>
    </div>
  );
}
