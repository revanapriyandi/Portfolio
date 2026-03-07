import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira",
  display: "swap",
  weight: ["400", "500"],
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const supabase = await createClient();
    const { data: settings } = await supabase
      .from("portfolio_system_settings")
      .select("site_title, site_description, site_url, og_image")
      .limit(1)
      .single();

    const title = settings?.site_title || "M. Revan Apriyandi — Software Engineer";
    const description = settings?.site_description || "Portfolio of M. Revan Apriyandi, a Software Engineer building modern web apps.";
    const url = settings?.site_url || "https://revanapriyandi.vercel.app";
    const ogImage = settings?.og_image || undefined;

    return {
      title,
      description,
      metadataBase: new URL(url),
      openGraph: {
        title,
        description,
        type: "website",
        url,
        ...(ogImage ? { images: [ogImage] } : {}),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        ...(ogImage ? { images: [ogImage] } : {}),
      },
    };
  } catch {
    return {
      title: "M. Revan Apriyandi — Software Engineer",
      description: "Portfolio of M. Revan Apriyandi.",
    };
  }
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let theme = { accent: "#6366f1", bg: "#000000", fontMono: false, roundness: "md" };
  
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("portfolio_system_settings").select("theme").limit(1).single();
    if (data?.theme) theme = { ...theme, ...data.theme };
  } catch {
    // defaults
  }

  const radiusMap: Record<string, string> = { none: "0px", sm: "0.25rem", md: "0.5rem", lg: "1rem", full: "9999px" };

  return (
    <html lang="en" className="dark scroll-smooth">
      <body 
        className={`${inter.variable} ${firaCode.variable} ${theme.fontMono ? 'font-mono' : 'font-sans'} antialiased`}
        style={{
          "--accent-color": theme.accent,
          "--bg-color": theme.bg,
          "--radius": radiusMap[theme.roundness] || "0.5rem",
          backgroundColor: "var(--bg-color)",
        } as React.CSSProperties}
      >
        {children}
      </body>
    </html>
  );
}
