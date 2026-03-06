import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";
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
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.variable} ${firaCode.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
