import React from "react";
import { motion } from "framer-motion";
import type { PortfolioData, ThemeConfig } from "@/src/types/portfolio";
import { Github, Linkedin, Mail, MapPin } from "lucide-react";
import Image from "next/image";

interface BentoTemplateProps {
  data: PortfolioData;
  settings: {
    section_order: string[]; // Might ignore order if bento is fixed, but let's use it for visibility
    visible_sections: string[];
    theme: ThemeConfig;
  };
}

export default function BentoTemplate({ data, settings }: BentoTemplateProps) {
  const { theme, visible_sections } = settings;
  const p = data.personal;

  return (
    <div
      style={{
        "--theme-accent": `var(--accent-${theme.accent})`,
        "--theme-radius": `var(--radius-${theme.roundness})`,
        "--font-primary": theme.fontMono ? "var(--font-fira), monospace" : "var(--font-inter), sans-serif",
      } as React.CSSProperties}
      className={`min-h-screen bg-[#000000] text-[#fafafa] font-primary ${theme.fontMono ? "font-mono" : ""} p-4 md:p-8 lg:p-12 flex items-center justify-center`}
    >
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4 auto-rows-[180px]">
        
        {/* Profile Card (Hero) */}
        {visible_sections.includes("hero") && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="md:col-span-2 md:row-span-2 rounded-[var(--theme-radius)] bg-[#111] border border-[#222] p-8 flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[var(--theme-accent)]/10 transition-colors duration-700" />
            <div>
              {p.avatar && <div className="w-16 h-16 rounded-full overflow-hidden mb-6 ring-2 ring-[var(--theme-accent)]">
                <Image src={p.avatar} alt={p.name} width={64} height={64} className="object-cover w-full h-full" />
              </div>}
              <h1 className="text-3xl font-bold tracking-tight">{p.name}</h1>
              <p className="text-[var(--theme-accent)] font-medium mt-2">{p.role}</p>
            </div>
            <p className="text-[#a1a1aa] leading-relaxed max-w-md">{p.bio_short}</p>
          </motion.div>
        )}

        {/* Contact/Social Links */}
        {visible_sections.includes("contact") && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="md:col-span-1 md:row-span-1 rounded-[var(--theme-radius)] bg-[#111] border border-[#222] p-6 flex flex-col justify-center">
            <p className="text-xs text-[#71717a] uppercase tracking-wider font-semibold mb-4">Connect</p>
            <div className="flex gap-4">
              {p.github && <a href={p.github} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center hover:bg-white hover:text-black transition-colors"><Github className="w-4 h-4" /></a>}
              {p.linkedin && <a href={p.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center hover:bg-[#0a66c2] transition-colors"><Linkedin className="w-4 h-4" /></a>}
              {p.email && <a href={`mailto:${p.email}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center hover:bg-[var(--theme-accent)] transition-colors"><Mail className="w-4 h-4" /></a>}
            </div>
          </motion.div>
        )}

        {/* Location Map Placeholder */}
        {p.location && visible_sections.includes("about") && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="md:col-span-1 md:row-span-1 rounded-[var(--theme-radius)] bg-[#111] border border-[#222] p-6 flex flex-col items-center justify-center text-center overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--theme-accent)_0%,transparent_70%)] opacity-[0.03]" />
            <MapPin className="w-8 h-8 text-[#52525b] mb-3" />
            <p className="text-sm font-medium text-[#fafafa]">{p.location}</p>
            <p className="text-xs text-[#71717a]">Current Location</p>
          </motion.div>
        )}

        {/* Stats */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="md:col-span-2 md:row-span-1 rounded-[var(--theme-radius)] bg-[var(--theme-accent)] text-white p-6 flex items-center justify-around">
          <div className="text-center">
            <p className="text-4xl font-black">{p.years_of_exp ?? 3}+</p>
            <p className="text-sm font-medium opacity-80 mt-1">Years Experience</p>
          </div>
          <div className="w-px h-12 bg-white/20" />
          <div className="text-center">
            <p className="text-4xl font-black">{p.projects_completed ?? 20}+</p>
            <p className="text-sm font-medium opacity-80 mt-1">Projects Done</p>
          </div>
        </motion.div>

        {/* Marquee Skills */}
        {visible_sections.includes("skills") && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }} className="md:col-span-2 md:row-span-1 rounded-[var(--theme-radius)] bg-[#111] border border-[#222] p-6 flex flex-col justify-center overflow-hidden">
            <p className="text-xs text-[#71717a] uppercase tracking-wider font-semibold mb-4">Tech Stack</p>
            <div className="flex flex-wrap gap-2">
              {data.skills?.[0]?.items?.slice(0, 10).map(skill => (
                <span key={skill} className="px-3 py-1 rounded-md bg-[#1a1a1a] text-[#a1a1aa] text-xs font-medium border border-[#2a2a2a]">{skill}</span>
              ))}
              <span className="px-3 py-1 rounded-md bg-[#1a1a1a] text-[var(--theme-accent)] text-xs font-medium border border-[#2a2a2a] border-dashed">+ more</span>
            </div>
          </motion.div>
        )}

        {/* Featured Project */}
        {visible_sections.includes("projects") && data.projects.filter(p => p.featured)[0] && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="md:col-span-2 md:row-span-2 rounded-[var(--theme-radius)] bg-[#111] border border-[#222] p-8 flex flex-col justify-between group">
            <div className="flex justify-between items-start">
              <p className="text-xs text-[#71717a] uppercase tracking-wider font-semibold">Featured Work</p>
              <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center group-hover:bg-[var(--theme-accent)] transition-colors">
                <span className="block transform rotate-45 -translate-y-px">→</span>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-3">{data.projects.filter(p => p.featured)[0].title}</h3>
              <p className="text-[#a1a1aa] text-sm leading-relaxed mb-6">{data.projects.filter(p => p.featured)[0].description}</p>
              <div className="flex flex-wrap gap-2">
                {data.projects.filter(p => p.featured)[0].tags?.slice(0,3).map(t => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-full border border-[#333] text-[#71717a]">{t}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Experience List */}
        {visible_sections.includes("experience") && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }} className="md:col-span-2 md:row-span-2 rounded-[var(--theme-radius)] bg-[#111] border border-[#222] p-8 overflow-y-auto custom-scrollbar">
            <p className="text-xs text-[#71717a] uppercase tracking-wider font-semibold mb-6">Experience</p>
            <div className="space-y-6">
              {data.experience?.map((exp) => (
                <div key={exp.id ?? exp.company} className="relative pl-4 border-l border-[#222]">
                  <div className="absolute w-2 h-2 bg-[#333] rounded-full -left-[5px] top-1.5" />
                  <h4 className="text-sm font-semibold text-[#fafafa]">{exp.role}</h4>
                  <p className="text-xs text-[var(--theme-accent)] mt-1">{exp.company}</p>
                  <p className="text-xs text-[#52525b] mt-1">{exp.period}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
