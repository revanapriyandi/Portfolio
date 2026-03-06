"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href: string) => {
    setIsOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-[#27272a] bg-[#09090b]/95 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1100px] mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="text-sm font-mono font-medium text-[#fafafa] tracking-tight hover:text-[#3b82f6] transition-colors duration-200"
        >
          revan<span className="text-[#3b82f6]">.</span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link, i) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="text-sm text-[#71717a] hover:text-[#fafafa] transition-colors duration-200 relative group"
              style={{ transitionDelay: `${i * 30}ms` }}
            >
              <span className="font-mono text-[#3b82f6] mr-1 text-xs">{String(i + 1).padStart(2, "0")}.</span>
              {link.label}
            </button>
          ))}
          <a
            href="mailto:revanapriyandi88@gmail.com"
            className="text-sm px-4 py-1.5 rounded-md border border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/10 transition-all duration-200 font-mono"
          >
            Hire Me
          </a>
        </nav>

        {/* Mobile */}
        <button
          className="md:hidden text-[#71717a] hover:text-[#fafafa] transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-[#27272a] bg-[#09090b]"
          >
            <div className="max-w-[1100px] mx-auto px-6 py-4 flex flex-col gap-3">
              {navLinks.map((link, i) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="text-left text-sm text-[#71717a] hover:text-[#fafafa] py-2 transition-colors"
                >
                  <span className="font-mono text-[#3b82f6] mr-2 text-xs">{String(i + 1).padStart(2, "0")}.</span>
                  {link.label}
                </button>
              ))}
              <a
                href="mailto:revanapriyandi88@gmail.com"
                className="text-sm px-4 py-2 rounded-md border border-[#3b82f6] text-[#3b82f6] text-center hover:bg-[#3b82f6]/10 transition-all"
              >
                Hire Me
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
