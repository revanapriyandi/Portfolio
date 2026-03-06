import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/pages — list all pages
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portfolio_pages")
    .select("slug, title, description, status, show_in_nav, nav_order, created_at, updated_at")
    .order("nav_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/pages — create new page
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { slug, title, description, status, show_in_nav, nav_order } = body;

    if (!slug || !title) {
      return NextResponse.json({ error: "slug and title are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("portfolio_pages")
      .insert({
        slug,
        title,
        description: description ?? "",
        status: status ?? "draft",
        show_in_nav: show_in_nav ?? true,
        nav_order: nav_order ?? 99,
        data: { content: [], root: { props: { bgColor: "#000000", accentColor: "#6366f1", customCss: "" } } },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
