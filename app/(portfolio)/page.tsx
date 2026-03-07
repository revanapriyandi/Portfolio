import { createClient } from "@/lib/supabase/server";
import { PuckRenderer } from "@/components/puck-renderer";
import type { Data } from "@measured/puck";
import type { UserConfig, CustomRootProps } from "@/puck.config";

export const revalidate = 60;

export default async function PortfolioPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("portfolio_pages")
    .select("data")
    .eq("slug", "home")
    .eq("status", "published")
    .single();

  const puckData: Data<UserConfig, CustomRootProps> = data?.data ?? {
    content: [],
    root: { props: { bgColor: "#000000", accentColor: "#6366f1", customCss: "" } },
  };

  return (
    <div className="min-h-screen bg-[#000] font-sans antialiased text-[#fafafa]">
      <PuckRenderer data={puckData} />
    </div>
  );
}
