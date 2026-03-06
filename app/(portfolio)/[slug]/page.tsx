import { createClient } from "@/lib/supabase/server";
import { PuckRenderer } from "@/components/puck-renderer";
import { notFound } from "next/navigation";
import type { Data } from "@measured/puck";
import type { UserConfig, CustomRootProps } from "@/puck.config";
import { buildMetadata, getSeoContext } from "@/lib/seo";
import type { Metadata } from "next";

// Use ISR instead of static generation to avoid build-time DB calls
export const revalidate = 60;
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const seo = await getSeoContext();
  const page = seo.pages.find((item) => item.slug === slug);

  if (!page) {
    return buildMetadata({
      siteTitle: seo.siteTitle,
      siteDescription: seo.siteDescription,
      siteUrl: seo.siteUrl,
      defaultOgImage: seo.defaultOgImage,
    });
  }

  return buildMetadata({
    siteTitle: seo.siteTitle,
    siteDescription: seo.siteDescription,
    siteUrl: seo.siteUrl,
    defaultOgImage: seo.defaultOgImage,
    page,
  });
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("portfolio_pages")
    .select("data, status, title")
    .eq("slug", slug)
    .single();

  if (!data || data.status !== "published") {
    notFound();
  }

  const puckData: Data<UserConfig, CustomRootProps> = data.data ?? {
    content: [],
    root: { props: { bgColor: "#000000", accentColor: "#6366f1", customCss: "" } },
  };

  return (
    <div className="min-h-screen bg-[#000] font-sans antialiased text-[#fafafa]">
      <PuckRenderer data={puckData} />
    </div>
  );
}
