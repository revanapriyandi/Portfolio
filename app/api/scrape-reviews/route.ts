import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenAI } from "@google/genai";

const FASTWORK_BASE = "https://fastwork.id";
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
};

interface ScrapedReview {
  name: string;
  rating: number;
  content: string;
  date: string;
}

async function scrapeReviewsPuppeteer(username: string, log: (msg: string) => void): Promise<ScrapedReview[]> {
  log("🚀 Membuka browser headless...");
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(HEADERS["User-Agent"]);

    // Go directly to the user's review tab if the URL structure supports it, or just the profile
    log(`🌐 Membuka profil https://fastwork.id/user/${username}...`);
    await page.goto(`${FASTWORK_BASE}/user/${username}`, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    log("⏳ Mencari ulasan...");
    
    // Fastwork reviews are usually loaded on the profile or via a specific tab.
    // Let's scroll down to trigger lazy loading of reviews.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await new Promise(r => setTimeout(r, 2000));
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(r => setTimeout(r, 2000));

    // Wait for review elements (fastwork uses various class names, we'll try to find common patterns like stars or text)
    // Because class names are minified/hashed in Next.js, we look for structural hints or text like "Ulasan"
    
    log("🔄 Mencoba memuat lebih banyak ulasan...");
    // Try to click "Load more" or similar buttons a few times to get ~20 reviews
    for (let i = 0; i < 5; i++) {
        const clicked = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('button, a, div'));
            const loadMoreBtn = elements.find(el => {
                const text = el.textContent?.toLowerCase().trim() || '';
                return text === 'lihat semua' || text === 'selengkapnya' || text === 'load more';
            });
            
            if (loadMoreBtn) {
                (loadMoreBtn as HTMLElement).click();
                return true;
            }
            return false;
        });
        
        if (!clicked) break; // No more buttons found
        await new Promise(r => setTimeout(r, 2000)); // wait for network
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    }
    
    // Evaluate in browser context to find review boxes
    log("🔍 Mengekstrak ulasan yang terlihat...");
    const reviews = await page.evaluate(() => {
      const results: ScrapedReview[] = [];
      // Find elements that look like a review container. Usually they contain stars, a username, and a comment
      // Fastwork reviews card often have a rating star SVG and text
      
      // A common pattern for reviews on Fastwork: 
      // There's a div containing the reviewer's name (often bold), a star rating, and the text.
      
      // Instead of relying on brittle selectors, let's grab all text that looks like a review.
      
      // Since this is very fragile, we will attempt to find the container
      // Alternatively, let's look for "Ulasan Pekerjaan" or similar text
      const headings = Array.from(document.querySelectorAll('h2, h3, div')).filter(el => el.textContent?.toLowerCase().includes('ulasan') || el.textContent?.toLowerCase().includes('review'));
      
      if (headings.length > 0) {
        // Let's just grab the whole page text and let Gemini parse it if we can't get structured data easily
        // But for now, let's try to find text blocks.
      }
      
      // A more robust way to scrape Fastwork reviews: look for <p> tags that are followed by dates or have names above them.
      // Since we can't guarantee selectors, we will just grab the innerText of the main container and let Gemini extract it.
      
      return results;
    });

    // If structured extraction fails, grab the whole text of the page to parse with Gemini
    const pageText = await page.evaluate(() => {
      // remove scripts, styles, etc
      const clone = document.body.cloneNode(true) as HTMLElement;
      const scripts = clone.querySelectorAll('script, style, noscript, svg, img');
      scripts.forEach(s => s.remove());
      // we take more text now since we loaded more reviews
      return clone.innerText.replace(/\n\s*\n/g, '\n').substring(0, 45000); 
    });

    if (reviews.length === 0 && pageText.length > 0) {
        // We will return a special raw object to be parsed by Gemini
        return [{ name: "RAW_TEXT", rating: 5, content: pageText, date: "" }];
    }

    return reviews;
  } finally {
    await browser.close();
    log("🔒 Browser ditutup");
  }
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false;
      const send = (data: unknown) => {
        if (!isClosed) controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      const log = (msg: string) => send({ type: "log", message: msg });
      const done = (testimonials: unknown[]) => send({ type: "done", testimonials });
      const error = (msg: string) => send({ type: "error", message: msg });
      const closeStream = () => {
        if (!isClosed) {
          isClosed = true;
          controller.close();
        }
      };

      try {
        const supabase = await createClient();
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) { error("Unauthorized"); closeStream(); return; }

        const body = await req.json() as { username?: string };
        const username = body.username?.trim();
        if (!username) { error("Username Fastwork diperlukan"); closeStream(); return; }

        const { data: settings } = await supabase
          .from("portfolio_system_settings")
          .select("gemini_api_key, gemini_model")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        // Step 1: Scrape
        let rawReviews: ScrapedReview[] = [];
        try {
          rawReviews = await scrapeReviewsPuppeteer(username, log);
        } catch (e) {
          log(`⚠️ Puppeteer error: ${e instanceof Error ? e.message : "unknown"}`);
        }

        if (rawReviews.length === 0) {
          error(`Tidak ada ulasan ditemukan di profil https://fastwork.id/user/${username}.`);
          closeStream();
          return;
        }

        // Step 2: Extract with Gemini
        if (settings?.gemini_api_key) {
          log("🤖 Memformat ulasan dengan Gemini AI...");
          const ai = new GoogleGenAI({ apiKey: settings.gemini_api_key });
          const model = "gemini-2.0-flash"; // Force fastest model for this task

          let prompt = "";
          
          if (rawReviews.length === 1 && rawReviews[0].name === "RAW_TEXT") {
              const textContent = rawReviews[0].content;
              prompt = `
Extract up to 20 user reviews/testimonials from this raw text scraped from a Fastwork profile page.
The text contains a lot of noise. Look for names, star ratings (out of 5), and review text.
If you find a review, extract the reviewer's name, the review content, and rating.
If no reviews are found, return an empty array [].

Raw text:
${textContent.slice(0, 45000)}

Output each testimonial in this JSON format ONLY (no markdown):
[
  {
    "name": "Nama Klien (atau 'Klien Fastwork')",
    "role": "Klien",
    "company": "Fastwork",
    "avatar": "",
    "content": "Komentar/ulasan klien",
    "rating": 5,
    "platform": "Fastwork",
    "is_featured": false,
    "sort_order": 0
  }
]
`.trim();
          }

          const response = await ai.models.generateContent({ model, contents: prompt, config: { temperature: 0.1 } });
          const json = response.text?.replace(/^```json/, "").replace(/^```/, "").replace(/```$/, "").trim() || "[]";
          const structured = JSON.parse(json) as Record<string, unknown>[];
          
          if (structured.length === 0) {
             error("Tidak ada ulasan yang berhasil diekstrak oleh AI. Mungkin profil belum memiliki ulasan.");
             closeStream();
             return;
          }

          log(`✨ AI selesai mengekstrak ${structured.length} testimonial`);
          done(structured);
        } else {
            error("Fitur ini membutuhkan API Key Gemini (konfigurasi di Pengaturan) karena data butuh diekstrak kustom AI.");
        }
      } catch (e) {
        error("Gagal: " + (e instanceof Error ? e.message : "Unknown error"));
      } finally {
        closeStream();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
