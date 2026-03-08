import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

interface SystemSettingsRow {
  site_title: string | null;
  site_description: string | null;
  site_url: string | null;
  og_image: string | null;
}

interface PageSettingsRow {
  slug: string;
  title: string;
  description: string | null;
  og_image: string | null;
  status: "published" | "draft";
  updated_at: string | null;
}

const FALLBACK_SITE_URL = "http://localhost:3000";
const FALLBACK_SITE_TITLE = "My Portfolio";
const FALLBACK_SITE_DESCRIPTION = "Personal portfolio website";

function normalizeUrl(url?: string | null) {
  if (!url) return FALLBACK_SITE_URL;
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function createPageUrl(siteUrl: string, slug: string) {
  return slug === "home" ? siteUrl : `${siteUrl}/${slug}`;
}

export async function getSeoContext() {
  const supabase = await createClient();

  const [{ data: settings }, { data: pages }, { data: personal }] =
    await Promise.all([
      supabase
        .from("portfolio_system_settings")
        .select("site_title, site_description, site_url, og_image")
        .limit(1)
        .maybeSingle<SystemSettingsRow>(),
      supabase
        .from("portfolio_pages")
        .select("slug, title, description, og_image, status, updated_at")
        .eq("status", "published")
        .order("nav_order", { ascending: true })
        .returns<PageSettingsRow[]>(),
      supabase
        .from("personal_info")
        .select("name, title, bio, avatar_url")
        .limit(1)
        .maybeSingle(),
    ]);

  // Build smart dynamic fallbacks from personal_info
  const ownerName = personal?.name || null;
  const ownerRole = (personal?.title as string | null) || "Software Engineer";
  const ownerBio = (personal?.bio as string | null) || null;
  const ownerAvatar = (personal?.avatar_url as string | null) || null;

  const dynamicSiteTitle = ownerName
    ? `${ownerName} — ${ownerRole}`
    : FALLBACK_SITE_TITLE;

  const dynamicSiteDescription = ownerBio
    ? ownerBio.slice(0, 160).trimEnd()
    : ownerName
      ? `Portfolio of ${ownerName}, ${ownerRole}.`
      : FALLBACK_SITE_DESCRIPTION;

  const siteTitle = settings?.site_title || dynamicSiteTitle;
  const siteDescription = settings?.site_description || dynamicSiteDescription;
  const siteUrl = normalizeUrl(settings?.site_url);
  const defaultOgImage = settings?.og_image || ownerAvatar || null;

  return {
    siteTitle,
    siteDescription,
    siteUrl,
    defaultOgImage,
    pages: pages ?? [],
    ownerName,
    ownerRole,
  };
}

export function buildMetadata({
  siteTitle,
  siteDescription,
  siteUrl,
  defaultOgImage,
  page,
}: {
  siteTitle: string;
  siteDescription: string;
  siteUrl: string;
  defaultOgImage: string | null;
  page?: Pick<PageSettingsRow, "slug" | "title" | "description" | "og_image">;
}): Metadata {
  const pageTitle = page?.title || siteTitle;
  const pageDescription = page?.description || siteDescription;
  const pageUrl = createPageUrl(siteUrl, page?.slug || "home");
  const ogImage = page?.og_image || defaultOgImage || undefined;

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: pageUrl,
      siteName: siteTitle,
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: pageTitle,
      description: pageDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}
