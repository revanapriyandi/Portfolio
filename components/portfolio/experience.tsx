import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { ExperienceItem } from '@/lib/portfolio-types';
import { GitCommit, GitMerge } from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, x: -30 },
  show: { opacity: 1, x: 0, transition: { type: "spring", bounce: 0.4, duration: 0.8 } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function ExperienceSection({ experience, textPrimary, textSecondary, accent, templateTexts }: {
    experience: ExperienceItem[];
    textPrimary: string;
    textSecondary: string;
    accent: string;
    cardBorder: string; // Ignored for Clean Tech
    templateTexts?: Record<string, string>;
}) {
  const [showAll, setShowAll] = useState(false);
  const texts = templateTexts ?? {};
  const t = (key: string, fallback: string) => texts[key] || fallback;
  const initialVisible = 4;
  const displayExperience = showAll ? (experience || []) : (experience || []).slice(0, initialVisible);
  if (!experience || experience.length === 0) return null;

  return (
    <section id="experience" className="py-24 max-w-6xl mx-auto px-4 sm:px-8 font-mono">
      <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="mb-16">
        <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${textPrimary}, #79c0ff)` }}>
          <GitMerge className="w-8 h-8 opacity-70" style={{ color: textPrimary }} />
          {t("t1_experience_title", "Commit History")}
        </h2>
        <p className="text-sm opacity-60" style={{ color: textSecondary }}>&gt; git log --oneline --graph --decorate</p>
      </motion.div>
      
      <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="relative border-l-2 ml-4 space-y-12" style={{ borderColor: '#30363d' }}>
        {displayExperience.map((item, idx) => (
          <motion.div 
            key={idx}
            variants={fadeInUp}
            className="group relative pl-10"
          >
            {/* Git Node */}
            <motion.div 
               whileHover={{ scale: 1.5, rotate: 90, boxShadow: `0 0 15px ${accent}` }}
               transition={{ type: "spring", stiffness: 300, damping: 10 }}
               className="absolute left-[-11px] top-1 bg-[#0d1117] p-1 cursor-crosshair rounded-full transition-shadow duration-300"
            >
                <GitCommit className="w-4 h-4" style={{ color: accent }} />
            </motion.div>

            <div className="flex flex-col mb-2">
               <div className="flex items-center gap-3 flex-wrap mb-1">
                 <span style={{ color: '#e3b341' }}>commit {(`a1b2c${idx}${item.role.length}`).substring(0, 7).padEnd(7, '0')}</span>
                 <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider" style={{ backgroundColor: '#21262d', color: textSecondary, borderColor: '#30363d', borderWidth: '1px' }}>
                    {item.start_date.split('-')[0] || item.start_date.split(' ')[0]} — {item.current ? "HEAD -> main" : (item.end_date?.split('-')[0] || item.end_date?.split(' ')[0] || '')}
                 </span>
               </div>
               
               <h3 className="text-xl font-sans font-bold tracking-tight mt-1" style={{ color: textPrimary }}>{item.role}</h3>
               <p className="text-sm font-sans font-medium mb-3" style={{ color: '#58a6ff' }}>@ {item.company}</p>
            </div>
            
            <p className="text-sm font-sans leading-relaxed max-w-2xl opacity-80" style={{ color: textSecondary }}>
              {item.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
      
      {experience.length > initialVisible && (
        <div className="mt-16 border-t pt-8" style={{ borderColor: '#30363d' }}>
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="font-mono text-sm tracking-tight transition-colors hover:underline"
            style={{ color: '#58a6ff' }}
          >
            {showAll ? t("t1_experience_show_less", "$ git reset --hard HEAD~4") : t("t1_experience_show_more", "$ git log --all")}
          </button>
        </div>
      )}
    </section>
  );
}
