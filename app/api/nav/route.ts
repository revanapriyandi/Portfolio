import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Public API — no auth needed, returns only published pages for navbar
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portfolio_pages")
    .select("slug, title, nav_order, show_in_nav")
    .eq("status", "published")
    .eq("show_in_nav", true)
    .order("nav_order");

  if (error) return NextResponse.json([], { status: 500 });
  return NextResponse.json(data ?? []);
}
