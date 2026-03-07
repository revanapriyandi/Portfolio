import React from 'react';
import { motion, Variants } from 'framer-motion';
import { SkillCategory } from '@/lib/portfolio-types';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
};

export default function ExpertiseSection({ skills, textPrimary, textSecondary, accent, cardBg, cardBorder, bg }: {
    skills: SkillCategory[];
    textPrimary: string;
    textSecondary: string;
    accent: string;
    cardBg: string;
    cardBorder: string;
    bg: string;
}) {
  if (!skills || skills.length === 0) return null;

  return (
    <section id="expertise" className="py-32 max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="mb-20">
        <h2 className="text-5xl md:text-7xl font-bold tracking-tighter">My Capabilities.</h2>
      </motion.div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {skills.map((cat, idx) => (
            <motion.div 
              key={idx}
              initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp}
              className="p-10 rounded-[2rem] border backdrop-blur-md transition-shadow hover:shadow-2xl"
              style={{ backgroundColor: cardBg, borderColor: cardBorder }}
            >
              <h3 className="text-2xl font-bold tracking-tight mb-8" style={{ color: textPrimary }}>{cat.category}</h3>
              <div className="flex flex-wrap gap-3">
                {cat.items.map((item, i) => (
                  <motion.span 
                    key={i}
                    whileHover={{ scale: 1.05, backgroundColor: accent, color: bg, borderColor: accent }}
                    className="px-5 py-2.5 rounded-full border text-sm font-semibold transition-all cursor-default"
                    style={{ borderColor: cardBorder, color: textSecondary }}
                  >
                    {item}
                  </motion.span>
                ))}
              </div>
            </motion.div>
        ))}
      </div>
    </section>
  );
}
