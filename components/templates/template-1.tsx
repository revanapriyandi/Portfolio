"use client";

import React, { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { PortfolioData, ThemeSettings } from "@/lib/portfolio-types";
import HeroSection from "../portfolio/hero";
import ProjectsSection from "../portfolio/projects";
import ExpertiseSection from "../portfolio/expertise";
import ExperienceSection from "../portfolio/experience";
import EducationSection from "../portfolio/education";
import ServicesSection from "../portfolio/services";
import TestimonialsSection from "../portfolio/testimonials";
import ContactSection from "../portfolio/contact";

interface PortfolioViewProps {
  data: PortfolioData;
  theme: ThemeSettings;
}

// Helper to convert hex to rgb
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
    hex || "#ffffff",
  );
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "255, 255, 255";
}

export default function Template1({ data, theme }: PortfolioViewProps) {
  const { personal, projects = [], skills = [], experience = [], education = [], services = [], testimonials = [] } = data;

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const bg = theme.bg || "#ffffff";
  const accent = theme.accent || "#000000";
  const accentRgb = hexToRgb(accent);

  // Clean Technical / Developer Theme
  const textPrimary = "#c9d1d9"; // GitHub Dark text
  const textSecondary = "#8b949e"; // GitHub Dark muted
  const cardBg = `#161b22`; // GitHub Dark component bg
  const cardBorder = `#30363d`; // Solid stroke 1px

  const devName = personal?.name || "dev";
  const texts = theme.templateTexts ?? {};
  const t = (key: string, fallback: string) => texts[key] || fallback;

  return (
    <div
      ref={containerRef}
      className="min-h-screen font-sans antialiased overflow-hidden selection:bg-[var(--accent)] selection:text-[#0d1117] relative bg-[#0d1117]"
      style={
        {
          color: textPrimary,
          "--accent": accent,
          "--accent-rgb": accentRgb,
        } as React.CSSProperties
      }
    >
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] origin-left z-[100]"
        style={{ scaleX, backgroundColor: accent }}
      />

      {/* Subtle Engineering Grid Background */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(${cardBorder} 1px, transparent 1px), linear-gradient(90deg, ${cardBorder} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: 'center center'
        }}
      />

      {/* Crisp Technical Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md bg-[#0d1117]/80 flex justify-center"
        style={{ borderColor: cardBorder }}
      >
        <div className="w-full max-w-7xl mx-auto px-6 h-14 flex items-center justify-between font-mono text-sm">
          {/* Breadcrumb style logo */}
          <a href="#home" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span style={{ color: textSecondary }}>~/</span>
            <span style={{ color: textPrimary, fontWeight: 600 }}>{devName.split(" ")[0].toLowerCase()}</span>
            <span style={{ color: textSecondary }}>/</span>
            <span style={{ color: accent }}>index.tsx</span>
          </a>

          {/* Indexed Menu */}
          <div className="hidden sm:flex gap-6 items-center">
            {[
              { id: "work", index: 1, label: t("t1_nav_work", "Work") },
              { id: "expertise", index: 2, label: t("t1_nav_expertise", "Skills") },
              { id: "experience", index: 3, label: t("t1_nav_experience", "Experience") },
              { id: "education", index: 4, label: t("t1_nav_education", "Education") },
              { id: "services", index: 5, label: t("t1_nav_services", "Services") },
              { id: "testimonials", index: 6, label: t("t1_nav_testimonials", "Testimonials") },
            ].map((nav) => (
              <a
                key={nav.id}
                href={`#${nav.id}`}
                className="group flex items-center gap-1.5 transition-colors"
                style={{ color: textSecondary }}
              >
                <span className="opacity-50 group-hover:opacity-100 transition-opacity">[{nav.index}]</span>
                <span className="group-hover:text-[var(--accent)] transition-colors" style={{ '--accent': accent } as React.CSSProperties}>
                  {nav.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content Areas */}
      <main className="relative z-10 px-6 sm:px-12 flex flex-col gap-24 pb-32 pt-16">
        <HeroSection
          personal={personal}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          templateTexts={texts}
        />
        <ProjectsSection
          projects={projects}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          accent={accent}
          cardBg={cardBg}
          cardBorder={cardBorder}
          templateTexts={texts}
        />
        <ExpertiseSection
          skills={skills}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          accent={accent}
          bg={bg}
          cardBg={cardBg}
          cardBorder={cardBorder}
          templateTexts={texts}
        />
        <ExperienceSection
          experience={experience}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          accent={accent}
          cardBorder={cardBorder}
          templateTexts={texts}
        />
        <EducationSection
          education={education}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          accent={accent}
          cardBorder={cardBorder}
          templateTexts={texts}
        />
        <ServicesSection
          services={services}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          accent={accent}
          cardBg={cardBg}
          cardBorder={cardBorder}
          templateTexts={texts}
        />
        <TestimonialsSection
          testimonials={testimonials}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          accent={accent}
          cardBg={cardBg}
          cardBorder={cardBorder}
          templateTexts={texts}
        />
        <ContactSection
          personal={personal}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          accent={accent}
          bg={bg}
          templateTexts={texts}
        />
      </main>

      {/* Technical Footer */}
      <footer
        className="w-full py-8 border-t bg-[#0d1117] relative z-10"
        style={{ borderColor: cardBorder }}
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 font-mono text-xs">
          <p style={{ color: textSecondary }}>
            <span style={{ color: accent }}>const</span> year = {new Date().getFullYear()};
            <br />
            <span style={{ color: accent }}>const</span> owner = <span style={{ color: '#a5d6ff' }}>&quot;{devName}&quot;</span>;
          </p>
          <div className="flex items-center gap-3 bg-[#161b22] px-3 py-1.5 rounded-md border" style={{ borderColor: cardBorder, color: textSecondary }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }}></div>
            {t("t1_footer_suffix", "System Normal")}
          </div>
        </div>
      </footer>
    </div>
  );
}
