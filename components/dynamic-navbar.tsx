"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

interface NavPage {
  slug: string;
  title: string;
  nav_order: number;
}

export function DynamicNavbar() {
  const pathname = usePathname();
  const [pages, setPages] = useState<NavPage[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch("/api/nav").then(r => r.json()).then(d => setPages(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const getHref = (slug: string) => slug === "home" ? "/" : `/${slug}`;

  const isActive = (slug: string) => {
    const href = getHref(slug);
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-white/5 shadow-2xl"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <span className="text-white text-sm font-black">P</span>
          </div>
          <span className="text-sm font-bold text-white hidden sm:block">portfolio<span className="text-indigo-400">.</span></span>
        </Link>

        {/* Desktop Nav */}
        {pages.length > 0 && (
          <div className="hidden md:flex items-center gap-1">
            {pages.map(page => (
              <Link
                key={page.slug}
                href={getHref(page.slug)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive(page.slug)
                    ? "bg-indigo-600/15 text-indigo-400 border border-indigo-600/20"
                    : "text-[#a1a1aa] hover:text-white hover:bg-white/5"
                }`}
              >
                {page.title}
              </Link>
            ))}
          </div>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard/cms"
            className="hidden sm:flex items-center gap-1.5 text-xs text-[#6a6a8a] hover:text-indigo-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-600/10 border border-transparent hover:border-indigo-600/20">
            Dashboard
          </Link>
          {/* Mobile burger */}
          {pages.length > 0 && (
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-[#a1a1aa] hover:text-white transition-colors">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/5 px-4 pb-4 space-y-1">
          {pages.map(page => (
            <Link key={page.slug} href={getHref(page.slug)}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive(page.slug)
                  ? "bg-indigo-600/15 text-indigo-400"
                  : "text-[#a1a1aa] hover:text-white hover:bg-white/5"
              }`}>
              {page.title}
            </Link>
          ))}
          <Link href="/dashboard/cms" onClick={() => setMobileOpen(false)}
            className="block px-4 py-2.5 rounded-lg text-xs text-indigo-400 hover:bg-indigo-600/10 transition-all">
            Dashboard →
          </Link>
        </div>
      )}
    </nav>
  );
}
