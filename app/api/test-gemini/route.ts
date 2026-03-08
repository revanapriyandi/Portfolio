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

    const { apiKey, model } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: "API Key is required to test" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // 1. Fetch available models for this specific API key
    const availableModels: string[] = [];
    try {
      const listResponse = await ai.models.list();
      const all: string[] = [];
      for await (const m of listResponse) {
        if (m.name && m.name.includes("gemini")) {
          const cleanName = m.name.replace("models/", "").replace("publishers/google/models/", "");
          // Skip embedding-only and deprecated models
          if (!cleanName.includes("embedding") && !cleanName.includes("aqa")) {
            all.push(cleanName);
          }
        }
      }

      // Sort: higher version numbers first, stable before preview/exp
      all.sort((a, b) => {
        // Extract major.minor version number for comparison
        const getVersion = (s: string) => {
          const m = s.match(/(\d+)[.-](\d+)/);
          return m ? parseFloat(`${m[1]}.${m[2]}`) : 0;
        };
        const vA = getVersion(a), vB = getVersion(b);
        if (vB !== vA) return vB - vA; // newer first
        // stable (no -preview/-exp) before experimental
        const isStable = (s: string) => !s.includes("preview") && !s.includes("exp") && !s.includes("latest");
        return isStable(a) === isStable(b) ? a.localeCompare(b) : isStable(a) ? -1 : 1;
      });
      availableModels.push(...all);
    } catch (modelErr) {
      console.warn("Could not list models:", modelErr);
    }
    
    // 2. Test the API with a tiny prompt on the requested (or default) model
    const testModel = model || "gemini-2.5-flash";
    const response = await ai.models.generateContent({
      model: testModel,
      contents: "Say 'OK' if you can read this.",
      config: {
        maxOutputTokens: 10,
        temperature: 0.1,
      }
    });

    const hasText = Boolean(response.text) || (response.candidates && response.candidates.length > 0);

    if (hasText) {
      return NextResponse.json({ 
        success: true, 
        message: "API connection successful!",
        models: availableModels.length > 0 ? Array.from(new Set(availableModels)) : [testModel]
      });
    } else {
      throw new Error("Empty response received");
    }
  } catch (error: unknown) {
    console.error("Test Gemini Error:", error);
    return NextResponse.json(
      { error: "Failed to connect to Gemini API", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
