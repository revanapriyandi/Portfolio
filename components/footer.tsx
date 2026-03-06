"use client";

import { personalInfo } from "@/data/portfolio";
import { Github, Linkedin, Mail, ArrowUp } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#18181b]">
      <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs font-mono text-[#52525b]">
          Designed & built by{" "}
          <span className="text-[#a1a1aa]">M. Revan Apriyandi</span> © {new Date().getFullYear()}
        </p>

        <div className="flex items-center gap-4">
          {[
            { icon: Github, href: personalInfo.github },
            { icon: Linkedin, href: personalInfo.linkedin },
            { icon: Mail, href: `mailto:${personalInfo.email}` },
          ].map(({ icon: Icon, href }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#52525b] hover:text-[#fafafa] transition-colors duration-200"
            >
              <Icon className="w-4 h-4" />
            </a>
          ))}
          <div className="w-px h-4 bg-[#27272a]" />
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-[#52525b] hover:text-[#fafafa] transition-colors duration-200"
            aria-label="Back to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
