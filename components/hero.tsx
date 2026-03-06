"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, ArrowRight } from "lucide-react";
import { personalInfo } from "@/data/portfolio";

const ROLES = personalInfo.roles;

const easeSnappy = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

export function Hero() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [chars, setChars] = useState("");
  const [deleting, setDeleting] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const current = ROLES[roleIndex];
    if (!deleting && chars.length < current.length) {
      timeoutRef.current = setTimeout(() => setChars(current.slice(0, chars.length + 1)), 70);
    } else if (!deleting && chars.length === current.length) {
      timeoutRef.current = setTimeout(() => setDeleting(true), 2200);
    } else if (deleting && chars.length > 0) {
      timeoutRef.current = setTimeout(() => setChars(current.slice(0, chars.length - 1)), 35);
    } else {
      // Defer to avoid synchronous setState inside effect
      timeoutRef.current = setTimeout(() => {
        setDeleting(false);
        setRoleIndex((i) => (i + 1) % ROLES.length);
      }, 0);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [chars, deleting, roleIndex]);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center dot-grid overflow-hidden"
    >
      {/* Radial vignette — softens the dot grid toward edges */}
      <div className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, #09090b 100%)"
        }}
      />

      {/* Subtle single horizontal line above content */}
      <div className="pointer-events-none absolute top-1/2 left-0 right-0 -translate-y-32 h-px opacity-20"
        style={{ background: "linear-gradient(90deg, transparent, #3b82f6 30%, #3b82f6 70%, transparent)" }}
      />

      <div className="relative w-full max-w-[1100px] mx-auto px-6 md:px-12 py-32 flex flex-col md:flex-row md:items-center md:justify-between gap-16">

        {/* LEFT — main content */}
        <div className="flex-1 max-w-2xl">
          {/* Availability badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono text-[#52525b] tracking-widest uppercase">
              Available for opportunities
            </span>
          </motion.div>

          {/* Name — big & bold */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: easeSnappy }}
            className="text-5xl sm:text-6xl lg:text-[80px] font-bold tracking-tight leading-[1] mb-5"
          >
            <span className="text-[#fafafa]">M. Revan</span>
            <br />
            <span className="text-[#3b82f6]">Apriyandi</span>
          </motion.h1>

          {/* Typing subtitle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex items-center gap-2 font-mono text-base text-[#52525b] mb-6"
          >
            <span className="text-[#3b82f6]">&gt;</span>
            <span className="text-[#a1a1aa]">{chars}</span>
            <span className="w-[2px] h-4 bg-[#3b82f6] animate-pulse shrink-0" />
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.55, ease: easeSnappy }}
            style={{ transformOrigin: "left" }}
            className="w-12 h-px bg-[#3b82f6] mb-6"
          />

          {/* Bio */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.65, ease: easeSnappy }}
            className="text-[#71717a] text-base leading-relaxed max-w-lg mb-10"
          >
            Software Engineer dengan 3+ tahun pengalaman membangun aplikasi web skalabel.
            Ahli dalam{" "}
            <span className="text-[#a1a1aa]">Laravel, React, Next.js</span> dan ekosistem modern.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.78, ease: easeSnappy }}
            className="flex flex-wrap items-center gap-3 mb-10"
          >
            <a
              href="#projects"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group inline-flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-medium px-6 py-2.5 rounded-md transition-colors duration-200"
            >
              Lihat Proyek
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a
              href="mailto:revanapriyandi88@gmail.com"
              className="inline-flex items-center gap-2 border border-[#27272a] hover:border-[#3f3f46] text-[#71717a] hover:text-[#fafafa] text-sm font-medium px-6 py-2.5 rounded-md transition-all duration-200"
            >
              <Mail className="w-3.5 h-3.5" />
              Kontak
            </a>
          </motion.div>

          {/* Social links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="flex items-center gap-4"
          >
            {[
              { icon: Github, href: personalInfo.github, label: "GitHub" },
              { icon: Linkedin, href: personalInfo.linkedin, label: "LinkedIn" },
            ].map(({ icon: Icon, href, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="text-[#3f3f46] hover:text-[#fafafa] transition-colors duration-200" aria-label={label}>
                <Icon className="w-[18px] h-[18px]" />
              </a>
            ))}
          </motion.div>
        </div>

        {/* RIGHT — stats panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.7, ease: easeSnappy }}
          className="hidden md:flex flex-col gap-6 border-l border-[#1c1c1e] pl-12"
        >
          {[
            { value: "3+", label: "Years of", sub: "Experience" },
            { value: "20+", label: "Completed", sub: "Projects" },
            { value: "15+", label: "Technologies", sub: "Mastered" },
          ].map((s) => (
            <div key={s.label} className="group cursor-default">
              <p className="text-4xl font-bold text-[#fafafa] leading-none group-hover:text-[#3b82f6] transition-colors duration-200">
                {s.value}
              </p>
              <p className="text-xs text-[#52525b] mt-1.5 font-mono">{s.label}<br />{s.sub}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24"
        style={{ background: "linear-gradient(to bottom, transparent, #09090b)" }}
      />
    </section>
  );
}
