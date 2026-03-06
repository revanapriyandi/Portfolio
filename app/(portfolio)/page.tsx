import { createClient } from "@/lib/supabase/server";
import { PuckRenderer } from "@/components/puck-renderer";

export const revalidate = 60; // Revalidate ISR every 60s

export default async function PortfolioPage() {
  const supabase = await createClient();

  // Fetch the layout data saved from Puck Visual Builder
  const { data } = await supabase
    .from("portfolio_pages")
    .select("data")
    .eq("id", "home")
    .single();

  const puckData = data?.data || { content: [], root: { props: { title: "Home" } } };

  return (
    <div className="min-h-screen bg-[#000] font-sans antialiased text-[#fafafa]">
      <PuckRenderer data={puckData} />
    </div>
  );
}
