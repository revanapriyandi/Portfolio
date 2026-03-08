import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenAI } from "@google/genai";

const FASTWORK_BASE = "https://fastwork.id";
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
  "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
};

interface ServiceDetail {
  title: string; slug: string; url: string;
  description: string; packages: string[]; price: string;
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, { headers: HEADERS, cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function scrapeDetail(url: string): Promise<ServiceDetail> {
  const slug = url.split("/").pop() || "";
  try {
    const html = await fetchHtml(url);
    const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)
      || html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\s*\|\s*Fastwork\.id/i, "").trim() : slug;

    const descMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i)
      || html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    const description = descMatch ? descMatch[1].trim() : "";

    const priceMatch = html.match(/Rp[\s.]*([\d.]+)/);
    const price = priceMatch ? "Rp" + priceMatch[1] : "";

    const pkgMatches = [...html.matchAll(/<h3[^>]*>([^<]+)<\/h3>/g)];
    const packages = pkgMatches
      .map(m => m[1].trim())
      .filter(p => p.length > 2 && p.length < 100 && !p.toLowerCase().includes("fastwork") && !p.toLowerCase().includes("harga"));

    return { title, slug, url, description, packages, price };
  } catch {
    return { title: slug, slug, url, description: "", packages: [], price: "" };
  }
}

async function getSlugsPuppeteer(username: string, log: (msg: string) => void): Promise<string[]> {
  log("🚀 Membuka browser headless...");
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(HEADERS["User-Agent"]);

    log(`🌐 Membuka profil https://fastwork.id/user/${username}...`);
    await page.goto(`${FASTWORK_BASE}/user/${username}`, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    log("⏳ Menunggu service cards muncul...");
    await page.waitForSelector(`a[href*="/user/${username}/"]`, { timeout: 10000 }).catch(() => {});

    // Scroll to bottom to trigger lazy loading
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(r => setTimeout(r, 1500));

    log("🔍 Mengekstrak semua link layanan...");
    const links = await page.evaluate((u: string) => {
      const anchors = Array.from(document.querySelectorAll(`a[href*="/user/${u}/"]`));
      const hrefs = anchors
        .map(a => (a as HTMLAnchorElement).href)
        .filter(h => h && !h.includes("#") && !h.includes("reviews") && h !== `https://fastwork.id/user/${u}`);
      return [...new Set(hrefs)];
    }, username);

    const slugs = links.map(l => l.split("/").pop() || "").filter(Boolean);
    log(`✅ Ditemukan ${slugs.length} layanan`);
    return slugs;
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
      const done = (services: unknown[]) => send({ type: "done", services });
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

        // Step 1: Get slugs via Puppeteer
        let slugs: string[] = [];
        try {
          slugs = await getSlugsPuppeteer(username, log);
        } catch (e) {
          log(`⚠️ Puppeteer error: ${e instanceof Error ? e.message : "unknown"}`);
        }

        if (slugs.length === 0) {
          error(`Tidak ada layanan ditemukan di profil https://fastwork.id/user/${username}.`);
          closeStream();
          return;
        }

        // Step 2: Scrape each detail page
        log(`📄 Membaca detail ${slugs.length} layanan...`);
        const serviceUrls = slugs.map(s => `${FASTWORK_BASE}/user/${username}/${s}`);

        const rawServices: ServiceDetail[] = [];
        for (let i = 0; i < Math.min(serviceUrls.length, 12); i++) {
          log(`   [${i + 1}/${slugs.length}] ${slugs[i]}`);
          const detail = await scrapeDetail(serviceUrls[i]);
          rawServices.push(detail);
        }

        const validServices = rawServices.filter(s => s.title && s.title !== s.slug);
        log(`✅ ${validServices.length} layanan berhasil dibaca`);

        if (validServices.length === 0) {
          error("Gagal membaca detail layanan dari Fastwork.");
          closeStream();
          return;
        }

        // Step 3: AI structuring
        if (settings?.gemini_api_key) {
          log("🤖 Memformat data dengan Gemini AI...");
          const ai = new GoogleGenAI({ apiKey: settings.gemini_api_key });
          const model = settings.gemini_model || "gemini-2.0-flash";

          const prompt = `
Convert these raw Fastwork service listings into portfolio service records.
Return ONLY a JSON array, no markdown.

Raw services:
${JSON.stringify(validServices, null, 2)}

Output each service as:
{
  "title": "judul pendek (maks 50 karakter, bahasa Indonesia)",
  "description": "1-2 kalimat profesional dalam Bahasa Indonesia",
  "icon": "satu emoji terbaik",
  "price_from": "angka saja e.g. 400000",
  "price_to": "",
  "currency": "IDR",
  "features": ["3-5 fitur konkret"],
  "is_featured": false,
  "sort_order": 0,
  "service_url": "URL asli"
}
Icon guide: 💻 web, 📱 mobile, 🎨 UI/design, 🤖 AI/ML, 🚀 deploy, 🔧 fix/debug, ⚡ optimasi
`.trim();

          const response = await ai.models.generateContent({ model, contents: prompt, config: { temperature: 0.1 } });
          const json = response.text?.replace(/^```json/, "").replace(/^```/, "").replace(/```$/, "").trim() || "[]";
          const structured = JSON.parse(json) as Record<string, unknown>[];
          log(`✨ AI selesai memformat ${structured.length} layanan`);
          done(structured);
        } else {
          log("⚠️ Gemini tidak dikonfigurasi, menggunakan data mentah");
          const fallback = validServices.map((s, i) => ({
            title: s.title, description: s.description.slice(0, 150),
            icon: "💻", price_from: s.price.replace(/[^\d]/g, ""), price_to: "",
            currency: "IDR", features: s.packages.slice(0, 4), is_featured: false,
            sort_order: i, service_url: s.url,
          }));
          done(fallback);
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
