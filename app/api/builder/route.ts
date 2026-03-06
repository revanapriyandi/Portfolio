import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/builder?slug=home
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") ?? "home";

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portfolio_pages")
    .select("data")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ content: [], root: { props: { bgColor: "#000000", accentColor: "#6366f1", customCss: "" } } });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    data?.data ?? { content: [], root: { props: { bgColor: "#000000", accentColor: "#6366f1", customCss: "" } } }
  );
}

// POST /api/builder?slug=home
export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") ?? "home";

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();

    const { error } = await supabase.from("portfolio_pages").upsert({
      slug,
      title: body._pageTitle ?? slug.charAt(0).toUpperCase() + slug.slice(1),
      data: body,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
