import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portfolio_system_settings")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
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
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let error;
    let activeId: string | undefined;
    if (existing?.id) {
      activeId = existing.id;
      ({ error } = await supabase
        .from("portfolio_system_settings")
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq("id", existing.id));
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from("portfolio_system_settings")
        .insert({ ...body, updated_at: new Date().toISOString() })
        .select("id")
        .single();
      error = insertError;
      activeId = inserted?.id;
    }

    if (error) throw error;

    // Keep a single active settings row to avoid ambiguous reads.
    if (activeId) {
      await supabase.from("portfolio_system_settings").delete().neq("id", activeId);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
