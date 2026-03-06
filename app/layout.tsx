import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "M. Revan Apriyandi — Software Engineer",
  description:
    "Portfolio of M. Revan Apriyandi, a Software Engineer with 3+ years of experience building modern web applications using Laravel, React, Next.js, and more.",
  keywords: [
    "Software Engineer",
    "Full Stack Developer",
    "Laravel",
    "React",
    "Next.js",
    "Portfolio",
    "Jakarta",
  ],
  authors: [{ name: "M. Revan Apriyandi", url: "https://revanapriyandi.vercel.app" }],
  openGraph: {
    title: "M. Revan Apriyandi — Software Engineer",
    description: "Software Engineer based in Jakarta, Indonesia.",
    type: "website",
  },
};

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
