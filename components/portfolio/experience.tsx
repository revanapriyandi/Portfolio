import React from 'react';
import { motion, Variants } from 'framer-motion';
import { ExperienceItem } from '@/lib/portfolio-types';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
};

export default function ExperienceSection({ experience, textPrimary, textSecondary, accent, cardBorder }: {
    experience: ExperienceItem[];
    textPrimary: string;
    textSecondary: string;
    accent: string;
    cardBorder: string;
}) {
  if (!experience || experience.length === 0) return null;

  return (
    <section id="experience" className="py-32 max-w-5xl mx-auto">
      <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="mb-20">
        <h2 className="text-5xl md:text-7xl font-bold tracking-tighter">Experience.</h2>
      </motion.div>
      
      <div className="space-y-16">
        {experience.map((item, idx) => (
          <motion.div 
            key={idx}
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp}
            className="group flex flex-col md:flex-row gap-6 md:gap-16 relative"
          >
            <div className="md:w-1/4 flex-shrink-0 pt-2">
              <p className="font-mono text-sm opacity-60 mb-2 uppercase tracking-widest">
                {item.start_date.split('-')[0] || item.start_date.split(' ')[0]} — {item.current ? "Present" : (item.end_date?.split('-')[0] || item.end_date?.split(' ')[0] || '')}
              </p>
              <p className="text-2xl font-bold" style={{ color: accent }}>{item.company}</p>
            </div>
            <div className="md:w-3/4 pb-16 border-b" style={{ borderColor: cardBorder }}>
              <h3 className="text-3xl font-bold tracking-tight mb-4" style={{ color: textPrimary }}>{item.role}</h3>
              <p className="text-lg leading-relaxed mix-blend-plus-lighter" style={{ color: textSecondary }}>
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
