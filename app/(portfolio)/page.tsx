import { createClient } from "@/lib/supabase/server";
import { PuckRenderer } from "@/components/puck-renderer";
import { buildMetadata, getSeoContext } from "@/lib/seo";
import type { Metadata } from "next";

export const revalidate = 60; // Revalidate ISR every 60s

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoContext();
  const homePage = seo.pages.find((page) => page.slug === "home");

  return buildMetadata({
    siteTitle: seo.siteTitle,
    siteDescription: seo.siteDescription,
    siteUrl: seo.siteUrl,
    defaultOgImage: seo.defaultOgImage,
    page: homePage,
  });
}

export default async function PortfolioPage() {
  const supabase = await createClient();

  // Fetch the layout data saved from Puck Visual Builder
  const { data } = await supabase
    .from("portfolio_pages")
    .select("data")
    .eq("slug", "home")
    .single();

  const puckData = data?.data || { content: [], root: { props: { title: "Home" } } };

  return (
    <div className="min-h-screen bg-[#000] font-sans antialiased text-[#fafafa]">
      <PuckRenderer data={puckData} />
    </div>
  );
}
