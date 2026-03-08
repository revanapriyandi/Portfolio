import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import PDFParser from "pdf2json";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check auth
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch settings from DB
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

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert File into a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Extract raw text from PDF using pdf2json (faster natively)
    const rawText = await new Promise<string>((resolve, reject) => {
      // @ts-expect-error Disable strict checking since we don't need 'this' context here
      const pdfParser = new PDFParser(null, 1);
      
      pdfParser.on("pdfParser_dataError", (errMsg: Error | { parserError: Error }) => {
        if (errMsg && 'parserError' in errMsg) {
           reject(errMsg.parserError);
        } else {
           reject(errMsg);
        }
      });
      pdfParser.on("pdfParser_dataReady", () => resolve(pdfParser.getRawTextContent()));
      
      pdfParser.parseBuffer(buffer);
    });

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json({ error: "Could not extract text from the PDF" }, { status: 400 });
    }

    // 2. Pass text to Gemini for structured extraction
    const prompt = `
      You are an expert HR sourcer and data parser.
      Extract ALL structured information from the provided resume text and format it STRICTLY as a JSON object.
      Do NOT include any markdown formatting like \`\`\`json or \`\`\`. Give only the raw JSON.
      For any field that you cannot find, use null or an empty array.
      Dates should be in "YYYY-MM-DD" format where possible, or "YYYY-MM" if day is unknown.

      The JSON structure MUST look exactly like this:
      {
        "personal": {
          "name": "string",
          "email": "string",
          "phone": "string",
          "location": "string",
          "website": "string",
          "linkedin": "string (full URL)",
          "github": "string (username only)",
          "twitter": "string",
          "instagram": "string",
          "role": "string (e.g., Software Engineer)",
          "bio_short": "string (1-2 sentences summary)",
          "bio": "string (longer professional biography)",
          "years_of_exp": "number (estimated years of experience)",
          "projects_completed": "number (estimated number of projects)"
        },
        "experience": [
          {
            "company": "string",
            "role": "string",
            "type": "string (Full-time | Part-time | Freelance | Contract | Internship)",
            "location": "string",
            "start_date": "YYYY-MM-DD",
            "end_date": "YYYY-MM-DD or null if current",
            "current": true or false,
            "description": "string (detailed responsibilities and achievements)",
            "tech_stack": ["string", "string"]
          }
        ],
        "education": [
          {
            "institution": "string",
            "degree": "string (e.g., Bachelor of Science)",
            "field_of_study": "string (e.g., Computer Science)",
            "start_date": "YYYY-MM-DD",
            "end_date": "YYYY-MM-DD or null if current",
            "current": true or false,
            "gpa": "string or null",
            "description": "string (activities, achievements)"
          }
        ],
        "skills": [
          {
            "category": "string",
            "items": ["string"],
            "item_icons": { "SkillName": "devicon-slug" }
          }
        ],
        "projects": [
          {
            "title": "string",
            "description": "string",
            "tags": ["string"],
            "github": "string or null",
            "live": "string or null",
            "featured": false
          }
        ],
        "certifications": [
          {
            "name": "string",
            "issuer": "string",
            "issued_date": "YYYY-MM-DD or null",
            "expire_date": "YYYY-MM-DD or null",
            "credential_url": "string or null"
          }
        ]
      }

      IMPORTANT RULES FOR skills:
      1. Split skills into these categories: "Programming Languages", "Frameworks & Libraries", "Databases", "Tools & Platforms", "DevOps & Cloud", "Mobile Development", "Languages"
      2. "Programming Languages" = JavaScript, TypeScript, Python, Go, PHP, Java, Dart, Kotlin, C++, etc.
      3. "Frameworks & Libraries" = React, Next.js, Vue, Laravel, Flutter, Express, Spring Boot, etc.
      4. "Databases" = MySQL, PostgreSQL, MongoDB, Redis, Supabase, Firebase, etc.
      5. "Tools & Platforms" = Git, Docker, Figma, Postman, VSCode, Jira, etc.
      6. "Languages" = Human spoken languages. ALWAYS add this category for Indonesian candidates:
         { "category": "Languages", "items": ["Bahasa Indonesia (Native)", "English (Professional)"], "item_icons": {} }
      7. For item_icons use DevIcon slugs (lowercase, no spaces, no dots):
         JavaScript→javascript, TypeScript→typescript, React→react, Next.js→nextdotjs,
         Vue→vuedotjs, Node.js→nodejs, Python→python, Go→go, PHP→php,
         Laravel→laravel, Docker→docker, MySQL→mysql, PostgreSQL→postgresql,
         MongoDB→mongodb, Git→git, Figma→figma, Flutter→flutter, Dart→dart,
         AWS→amazonwebservices, Firebase→firebase, Redis→redis, Kotlin→kotlin,
         Tailwind CSS→tailwindcss, Prisma→prisma, GraphQL→graphql, Supabase→supabase
      8. Only include item_icons for skills you know the icon for. Skip unknown ones (do NOT set null).

      Here is the resume text:
      ---
      ${rawText}
      ---
    `;


    const response = await ai.models.generateContent({
      model: aiModelName,
      contents: prompt,
      config: {
        temperature: 0.1, // Keep it deterministic
      }
    });

    let jsonString = response.text || "{}";
    
    // Clean potential markdown backticks if Gemini still returns them
    jsonString = jsonString.replace(/^```json/g, '').replace(/^```/g, '').replace(/```$/g, '').trim();
    
    // Parse to ensure it's valid JSON before sending
    const parsedData = JSON.parse(jsonString);

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: unknown) {
    console.error("Error processing PDF:", error);
    return NextResponse.json(
      { error: "Failed to extract information", details: error instanceof Error ? error.message : "Failure" },
      { status: 500 }
    );
  }
}
