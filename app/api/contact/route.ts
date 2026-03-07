import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from("portfolio_messages").insert({
      name,
      email,
      subject,
      message,
    });

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Your message has been sent successfully." });
  } catch (error: unknown) {
    console.error("Contact API Error:", error);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}
