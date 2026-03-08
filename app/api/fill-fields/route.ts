import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch Gemini settings
    const { data: settings } = await supabase
      .from("portfolio_system_settings")
      .select("gemini_api_key, gemini_model")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!settings?.gemini_api_key) {
      return NextResponse.json(
        { error: "Gemini API Key is not configured. Please add it in CMS Settings > AI Config." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: settings.gemini_api_key });
    const aiModelName = settings.gemini_model || "gemini-2.5-flash";

    const { extractedData, emptyFields } = await req.json() as {
      extractedData: Record<string, unknown>;
      emptyFields: string[]; // list of field names that are empty, e.g. ["bio_short", "bio"]
    };

    if (!emptyFields || emptyFields.length === 0) {
      return NextResponse.json({ success: true, filled: {} });
    }

    const prompt = `
You are a professional portfolio writer and content creator.
Below is a person's partially extracted resume/CV data in JSON.
Your job is to intelligently fill in ONLY the missing/empty fields listed below,
using the EXISTING data as context to make them accurate and professional.

EXISTING DATA (context):
${JSON.stringify(extractedData, null, 2)}

EMPTY FIELDS TO FILL: ${JSON.stringify(emptyFields)}

For each listed field, provide a well-written, professional, first-person value.
Rules:
- "bio_short": 1-2 sentences, professional summary
- "bio": 3-5 sentences, more detailed professional biography
- "role": infer from experience titles
- "location": infer from experience locations if possible, otherwise omit
- "years_of_exp": calculate from start of first experience to now
- "projects_completed": estimate from projects list count
- For social fields (github, linkedin, twitter): only fill if the URL/username is clearly found in the data, otherwise return null
- Return ONLY a flat JSON object with the field names as keys and the filled values as values
- Do NOT include any markdown formatting or code blocks — raw JSON only
- If a field cannot be reasonably inferred, set it to null

Example response format:
{"bio_short": "Experienced developer...", "location": null}
`;

    const response = await ai.models.generateContent({
      model: aiModelName,
      contents: prompt,
      config: { temperature: 0.4 }
    });

    let raw = response.text || "{}";
    raw = raw.replace(/^```json/g, "").replace(/^```/g, "").replace(/```$/g, "").trim();

    const filled = JSON.parse(raw);
    return NextResponse.json({ success: true, filled });

  } catch (error: unknown) {
    console.error("fill-fields error:", error);
    return NextResponse.json(
      { error: "AI fill failed", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
