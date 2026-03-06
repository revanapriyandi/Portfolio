"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, ArrowRight } from "lucide-react";
import Image from "next/image";

interface PersonalInfo {
  name: string;
  role?: string;
  roles?: string[];
  bio?: string;
  bio_short?: string;
  bioShort?: string;
  location?: string;
  email?: string;
  phone?: string;
  github?: string;
  linkedin?: string;
  avatar?: string;
  years_of_exp?: number;
  yearsOfExp?: number;
  projects_completed?: number;
  projectsCompleted?: number;
}

export function Hero({ personal }: { personal: PersonalInfo }) {
  const roles = useMemo<string[]>(() => personal.roles ?? [], [personal.roles]);
  const [roleIndex, setRoleIndex] = useState(0);
  const [chars, setChars] = useState("");
  const [deleting, setDeleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!roles.length) return;
    const current = roles[roleIndex];
    if (!deleting && chars.length < current.length) {
      timeoutRef.current = setTimeout(() => setChars(current.slice(0, chars.length + 1)), 70);
    } else if (!deleting && chars.length === current.length) {
      timeoutRef.current = setTimeout(() => setDeleting(true), 2200);
    } else if (deleting && chars.length > 0) {
      timeoutRef.current = setTimeout(() => setChars(current.slice(0, chars.length - 1)), 35);
    } else {
      timeoutRef.current = setTimeout(() => {
        setDeleting(false);
        setRoleIndex((i) => (i + 1) % roles.length);
      }, 0);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [chars, deleting, roleIndex, roles]);

  const years = personal.years_of_exp ?? personal.yearsOfExp ?? 3;
  const projects = personal.projects_completed ?? personal.projectsCompleted ?? 20;

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-60" />
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 30%, #09090b 100%)" }}
      />

      <div className="relative z-10 w-full max-w-[1100px] mx-auto px-6 md:px-12 py-32 flex flex-col items-center text-center">
        {/* Avatar */}
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }} className="mb-8">
          <div className="relative w-20 h-20 rounded-full overflow-hidden ring-1 ring-[#27272a] ring-offset-2 ring-offset-[#09090b]">
            {personal.avatar && (
              <Image src={personal.avatar} alt={personal.name} fill className="object-cover" priority />
            )}
          </div>
        </motion.div>

        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full border border-[#27272a] bg-[#111113]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono text-[#71717a] tracking-widest uppercase">Available for opportunities</span>
        </motion.div>

        {/* Name */}
        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
          className="text-5xl sm:text-6xl lg:text-[76px] font-bold tracking-tight leading-[1.05] mb-4">
          <span className="text-[#fafafa]">{personal.name?.split(" ").slice(0, 2).join(" ")} </span>
          <span className="text-[#3b82f6]">{personal.name?.split(" ").slice(2).join(" ")}</span>
        </motion.h1>

        {/* Typing */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="flex items-center justify-center gap-1.5 font-mono text-base text-[#52525b] mb-8">
          <span className="text-[#3b82f6] select-none font-mono">{">"}</span>
          <span className="text-[#a1a1aa]">{chars}</span>
          <span className="inline-block w-[2px] h-4 bg-[#3b82f6] animate-pulse shrink-0" />
        </motion.div>

        {/* Bio */}
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.6, ease: "easeOut" }}
          className="text-[#71717a] text-base leading-relaxed max-w-lg mb-10">
          {personal.bio_short ?? personal.bioShort}
        </motion.p>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.72, ease: "easeOut" }}
          className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <a href="#projects"
            onClick={(e) => { e.preventDefault(); document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" }); }}
            className="group inline-flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-medium px-6 py-2.5 rounded-md transition-colors duration-200">
            Lihat Proyek <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <a href={`mailto:${personal.email}`}
            className="inline-flex items-center gap-2 border border-[#27272a] hover:border-[#3f3f46] text-[#71717a] hover:text-[#fafafa] text-sm font-medium px-6 py-2.5 rounded-md transition-all duration-200">
            <Mail className="w-3.5 h-3.5" /> Kontak
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.85 }}
          className="flex items-center justify-center gap-8 sm:gap-16 mb-10">
          {[
            { value: `${years}+`, label: "Years Exp." },
            { value: `${projects}+`, label: "Projects" },
            { value: "15+", label: "Technologies" },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-8 sm:gap-16">
              {i > 0 && <div className="w-px h-6 bg-[#27272a]" />}
              <div className="text-center">
                <p className="text-2xl font-bold text-[#fafafa]">{s.value}</p>
                <p className="text-xs text-[#52525b] font-mono mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Socials */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.95 }}
          className="flex items-center gap-5">
          {[
            { icon: Github, href: personal.github, label: "GitHub" },
            { icon: Linkedin, href: personal.linkedin, label: "LinkedIn" },
          ].map(({ icon: Icon, href, label }) => href ? (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              className="text-[#3f3f46] hover:text-[#fafafa] transition-colors duration-200" aria-label={label}>
              <Icon className="w-[18px] h-[18px]" />
            </a>
          ) : null)}
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20"
        style={{ background: "linear-gradient(to bottom, transparent, #09090b)" }} />
    </section>
  );
}
