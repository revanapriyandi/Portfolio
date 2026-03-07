"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { PortfolioData, ThemeSettings } from '@/lib/portfolio-types';
import HeroSection from '../portfolio/hero';
import ProjectsSection from '../portfolio/projects';
import ExpertiseSection from '../portfolio/expertise';
import ExperienceSection from '../portfolio/experience';
import ContactSection from '../portfolio/contact';

interface PortfolioViewProps {
  data: PortfolioData;
  theme: ThemeSettings;
}

// Helper to convert hex to rgb
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#ffffff');
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
}

export default function Template1({ data, theme }: PortfolioViewProps) {
  const { personal, projects = [], skills = [], experience = [] } = data;
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const bg = theme.bg || "#ffffff";
  const accent = theme.accent || "#000000";
  const accentRgb = hexToRgb(accent);
  
  // Clean, bright/dark agnostic modern theme
  const isDark = bg.toLowerCase() < "#888888"; // crude check to determine if bg is dark
  const textPrimary = isDark ? "#ffffff" : "#111827";
  const textSecondary = isDark ? "#9ca3af" : "#4b5563";
  const cardBg = isDark ? `rgba(255,255,255,0.03)` : `rgba(0,0,0,0.02)`;
  const cardBorder = isDark ? `rgba(255,255,255,0.05)` : `rgba(0,0,0,0.05)`;

  const devName = personal?.name || "Creative Developer";

  return (
    <div
      ref={containerRef}
      className="min-h-screen font-sans antialiased overflow-hidden selection:bg-[var(--accent)] selection:text-white"
      style={{
        backgroundColor: bg,
        color: textPrimary,
        "--accent": accent,
        "--accent-rgb": accentRgb,
      } as React.CSSProperties}
    >
      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[100] mix-blend-difference"
        style={{ scaleX, backgroundColor: accent }} 
      />

      {/* Decorative blurry background elements (Fluid) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ x: ["0%", "5%", "-5%", "0%"], y: ["0%", "-5%", "5%", "0%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[120px] opacity-[0.15]"
          style={{ backgroundColor: accent }}
        />
        <motion.div 
           animate={{ x: ["0%", "-10%", "5%", "0%"], y: ["0%", "10%", "-5%", "0%"] }}
           transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
           className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-[0.1]"
           style={{ backgroundColor: isDark ? "#ffffff" : "#000000" }}
        />
      </div>

      {/* Navbar Minimalist */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-40 px-6 py-6 mix-blend-difference"
        style={{ color: "#ffffff" }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="#home" className="text-2xl font-bold tracking-tighter">
            {devName.split(' ')[0] || "Port"}<span style={{ color: accent }}>.</span>
          </a>
          <div className="hidden md:flex gap-8 text-sm font-medium tracking-wide">
             {["Work", "Expertise", "Experience"].map(nav => (
               <a key={nav} href={`#${nav.toLowerCase()}`} className="hover:opacity-60 transition-opacity">
                 {nav}
               </a>
             ))}
          </div>
        </div>
      </motion.nav>

      <main className="relative z-10 px-6">
        <HeroSection 
            personal={personal} 
            textPrimary={textPrimary} 
            textSecondary={textSecondary} 
            accent={accent} 
            bg={bg} 
        />
        <ProjectsSection 
            projects={projects} 
            textPrimary={textPrimary} 
            textSecondary={textSecondary} 
            accent={accent} 
            cardBg={cardBg} 
            cardBorder={cardBorder} 
        />
        <ExpertiseSection 
            skills={skills} 
            textPrimary={textPrimary} 
            textSecondary={textSecondary} 
            accent={accent} 
            bg={bg} 
            cardBg={cardBg} 
            cardBorder={cardBorder} 
        />
        <ExperienceSection 
            experience={experience} 
            textPrimary={textPrimary} 
            textSecondary={textSecondary} 
            accent={accent} 
            cardBorder={cardBorder} 
        />
        <ContactSection 
            personal={personal} 
            textPrimary={textPrimary} 
            accent={accent} 
            bg={bg} 
        />
      </main>

      <footer className="w-full text-center py-10 opacity-40 text-sm font-medium tracking-widest uppercase relative z-10">
         © {new Date().getFullYear()} {devName}. Crafted with Next.js & Framer Motion.
      </footer>
    </div>
  );
}

