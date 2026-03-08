import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { SkillCategory } from '@/lib/portfolio-types';
import { Code2 } from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const staggerLines: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } }
};

export default function ExpertiseSection({ skills, textPrimary, textSecondary, accent, templateTexts }: {
    skills: SkillCategory[];
    textPrimary: string;
    textSecondary: string;
    accent: string;
    cardBg: string; // Ignored for Clean Tech
    cardBorder: string; // Ignored for Clean Tech
    bg: string; // Ignored for Clean Tech
    templateTexts?: Record<string, string>;
}) {
  const [showAll, setShowAll] = useState(false);
  const texts = templateTexts ?? {};
  const t = (key: string, fallback: string) => texts[key] || fallback;
  const initialVisible = 6;
  const displaySkills = showAll ? (skills || []) : (skills || []).slice(0, initialVisible);
  if (!skills || skills.length === 0) return null;

  return (
    <section id="expertise" className="py-24 max-w-6xl mx-auto px-4 sm:px-8">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3" style={{ color: textPrimary }}>
              <Code2 className="w-6 h-6" style={{ color: accent }} />
              {t("t1_expertise_title", "package.json")}
            </h2>
          </div>
        </motion.div>
      
      <motion.div 
        initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp}
        className="rounded-lg overflow-hidden border w-full text-sm md:text-base"
        style={{ borderColor: '#30363d', backgroundColor: '#0d1117' }}
      >
        <div className="flex border-b text-xs font-mono items-center" style={{ borderColor: '#30363d', backgroundColor: '#161b22' }}>
          <div className="px-4 py-2 flex items-center gap-2 border-r" style={{ borderColor: '#30363d', color: textPrimary }}>
            <span style={{ color: '#e34c26' }}>{'{ }'}</span> package.json
          </div>
        </div>
        
        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="p-4 md:p-6 font-mono leading-relaxed overflow-x-auto" style={{ color: textPrimary }}>
          <motion.div variants={staggerLines}><span style={{ color: '#ff7b72' }}>{'{'}</span></motion.div>
          <motion.div variants={staggerLines} className="pl-4">
            <span style={{ color: '#79c0ff' }}>&quot;name&quot;</span>: <span style={{ color: '#a5d6ff' }}>&quot;developer-skills&quot;</span>,
          </motion.div>
          <motion.div variants={staggerLines} className="pl-4">
            <span style={{ color: '#79c0ff' }}>&quot;version&quot;</span>: <span style={{ color: '#a5d6ff' }}>&quot;1.0.0&quot;</span>,
          </motion.div>
          <motion.div variants={staggerLines} className="pl-4">
            <span style={{ color: '#79c0ff' }}>&quot;dependencies&quot;</span>: <span style={{ color: '#e3b341' }}>{'{'}</span>
          </motion.div>
          
          {displaySkills.map((cat, idx) => (
            <motion.div variants={staggerLines} key={idx} className="pl-8 mb-2 hover:bg-white/5 transition-colors p-1 rounded-sm cursor-default">
              <span style={{ color: '#79c0ff' }}>&quot;{cat.category.toLowerCase().replace(/\s+/g, '-')}&quot;</span>: <span style={{ color: '#d2a8ff' }}>&quot;[{cat.items.join(', ')}]&quot;</span>{idx < displaySkills.length - 1 ? ',' : ''}
            </motion.div>
          ))}

          <motion.div variants={staggerLines} className="pl-4"><span style={{ color: '#e3b341' }}>{'}'}</span>,</motion.div>

          {skills.length > initialVisible && (
            <>
              <motion.div variants={staggerLines} className="pl-4 mt-2">
                 <span style={{ color: '#79c0ff' }}>&quot;devDependencies&quot;</span>: <span style={{ color: '#e3b341' }}>{'{'}</span>
              </motion.div>
              <motion.div variants={staggerLines} className="pl-8 text-xs italic mt-1" style={{ color: textSecondary }}>
                 /* Click to view more packages */
              </motion.div>
              <motion.div variants={staggerLines} className="pl-4"><span style={{ color: '#e3b341' }}>{'}'}</span></motion.div>
            </>
          )}

          <motion.div variants={staggerLines}><span style={{ color: '#ff7b72' }}>{'}'}</span></motion.div>
        </motion.div>
      </motion.div>

      {skills.length > initialVisible && (
        <div className="mt-8">
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="font-mono text-sm tracking-tight transition-colors hover:underline"
            style={{ color: '#58a6ff' }}
          >
            {showAll ? t("t1_expertise_show_less", "$ npm uninstall --save-dev") : t("t1_expertise_show_more", "$ npm install --save-dev")}
          </button>
        </div>
      )}
    </section>
  );
}
