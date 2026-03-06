import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portfolio_system_settings")
    .select("*")
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? {});
}

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Get existing row id
    const { data: existing } = await supabase
      .from("portfolio_system_settings")
      .select("id")
      .limit(1)
      .single();

    let error;
    if (existing?.id) {
      ({ error } = await supabase
        .from("portfolio_system_settings")
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq("id", existing.id));
    } else {
      ({ error } = await supabase
        .from("portfolio_system_settings")
        .insert({ ...body, updated_at: new Date().toISOString() }));
    }

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
