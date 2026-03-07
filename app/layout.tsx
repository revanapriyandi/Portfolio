import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { getSeoContext } from "@/lib/seo";

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
    const { siteTitle, siteDescription, siteUrl, defaultOgImage } = await getSeoContext();

    return {
      title: {
        default: siteTitle,
        template: `%s | ${siteTitle}`,
      },
      description: siteDescription,
      metadataBase: new URL(siteUrl),
      openGraph: {
        title: siteTitle,
        description: siteDescription,
        url: siteUrl,
        type: "website",
        images: defaultOgImage ? [{ url: defaultOgImage }] : undefined,
      },
      twitter: {
        card: defaultOgImage ? "summary_large_image" : "summary",
        title: siteTitle,
        description: siteDescription,
        images: defaultOgImage ? [defaultOgImage] : undefined,
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