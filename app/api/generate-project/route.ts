import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { owner, repo, token, defaultDescription } = await req.json();

    if (!owner || !repo) {
      return NextResponse.json({ success: false, error: "Missing owner or repo" }, { status: 400 });
    }

    // Read settings for Gemini API key and model
    const supabase = await createClient();
    const { data: settings } = await supabase
      .from("portfolio_system_settings")
      .select("gemini_api_key, gemini_model")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const apiKey = settings?.gemini_api_key || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "Missing Gemini API Key. Please configure it in Settings." }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const model = settings?.gemini_model || "gemini-2.5-flash";

    // Fetch README from GitHub
    const headers: HeadersInit = {
      "Accept": "application/vnd.github.v3+json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };

    const readmeUrl = `https://api.github.com/repos/${owner}/${repo}/readme`;
    const readmeRes = await fetch(readmeUrl, { headers });
    let readmeText = "";

    if (readmeRes.ok) {
      const readmeData = await readmeRes.json();
      if (readmeData.content && readmeData.encoding === "base64") {
        readmeText = Buffer.from(readmeData.content, "base64").toString("utf-8");
      }
    }

    // truncate readme to avoid token limits (keep first 3000 chars)
    readmeText = readmeText.substring(0, 3000);

    const prompt = `You are an expert IT portfolio copywriter.
I am importing a GitHub project to my portfolio.
Project Name: ${repo}
Original Description: ${defaultDescription || "None"}
README Content:
${readmeText || "No README available."}

Generate the following details based on the README and project name:
1. title: A clean, human-readable title for the project (make it look professional, e.g. "Portfolio CMS" instead of "portfolio-cms").
2. description: A 1-3 sentence professional description of what the project is and its value.
3. tags: An array of up to 4 relevant technical tags (e.g., ["React", "TypeScript"]).
4. category: One of the following EXACT values: "web", "mobile", "api", "tool", "design", "game", "ml", "other". Choose the most fitting.

Respond ONLY with a valid JSON object matching this structure:
{
  "title": string,
  "description": string,
  "tags": string[],
  "category": string
}
`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from Gemini");

    const resultData = JSON.parse(resultText);

    return NextResponse.json({ success: true, data: resultData });
  } catch (error) {
    console.error("AI Generation error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
