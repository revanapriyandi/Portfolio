import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { EducationItem } from '@/lib/portfolio-types';
import { BookOpen, GraduationCap } from 'lucide-react';

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

export default function EducationSection({ education, textPrimary, textSecondary, accent, templateTexts }: {
    education: EducationItem[];
    textPrimary: string;
    textSecondary: string;
    accent: string;
    cardBorder: string;
    templateTexts?: Record<string, string>;
}) {
  const [showAll, setShowAll] = useState(false);
  const texts = templateTexts ?? {};
  const t = (key: string, fallback: string) => texts[key] || fallback;
  const initialVisible = 3;
  const displayEducation = showAll ? (education || []) : (education || []).slice(0, initialVisible);
  if (!education || education.length === 0) return null;

  return (
    <section id="education" className="py-24 max-w-6xl mx-auto flex flex-col items-end px-4 sm:px-8 font-mono">
      <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="mb-16 text-right w-full">
        <h2 className="text-3xl font-bold tracking-tight mb-2 flex flex-row-reverse items-center justify-start gap-3 w-full" style={{ color: textPrimary }}>
          <BookOpen className="w-8 h-8 opacity-70" />
          {t("t1_education_title", "Learning Path")}
        </h2>
        <p className="text-sm opacity-60" style={{ color: textSecondary }}>&gt; curl https://api.education/v1/degrees</p>
      </motion.div>
      
      <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="relative border-r-2 mr-4 space-y-12 pr-10 w-full" style={{ borderColor: '#30363d' }}>
        {displayEducation.map((item, idx) => (
          <motion.div 
            key={idx}
            variants={fadeInUp}
            className="group relative text-right flex flex-col items-end"
          >
            {/* Git Node */}
            <motion.div 
               whileHover={{ scale: 1.5, rotate: 90 }}
               transition={{ type: "spring", stiffness: 300, damping: 10 }}
               className="absolute right-[-53px] top-1 bg-[#0d1117] p-1 cursor-crosshair"
            >
                <GraduationCap className="w-5 h-5" style={{ color: accent }} />
            </motion.div>

            <div className="flex flex-col items-end mb-2">
               <div className="flex items-center flex-row-reverse gap-3 flex-wrap mb-1">
                 <span style={{ color: '#e3b341' }}>{item.degree}</span>
                 <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider" style={{ backgroundColor: '#21262d', color: textSecondary, borderColor: '#30363d', borderWidth: '1px' }}>
                    {item.start_date.split('-')[0] || item.start_date.split(' ')[0]} — {item.current ? "Present" : (item.end_date?.split('-')[0] || item.end_date?.split(' ')[0] || '')}
                 </span>
               </div>
               
               <h3 className="text-xl font-sans font-bold tracking-tight mt-1" style={{ color: textPrimary }}>{item.institution}</h3>
               {item.field_of_study && <p className="text-sm font-sans font-medium mb-3" style={{ color: '#58a6ff' }}>{item.field_of_study}</p>}
               {item.gpa && <p className="text-xs font-sans mb-1" style={{ color: textSecondary }}>GPA: <span style={{ color: textPrimary }}>{item.gpa}</span></p>}
            </div>
            
            <p className="text-sm font-sans leading-relaxed max-w-2xl opacity-80" style={{ color: textSecondary }}>
              {item.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
      
      {education.length > initialVisible && (
        <div className="mt-16 border-t pt-8 w-full text-right" style={{ borderColor: '#30363d' }}>
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="font-mono text-sm tracking-tight transition-colors hover:underline"
            style={{ color: '#58a6ff' }}
          >
            {showAll ? t("t1_education_show_less", "$ clear") : t("t1_education_show_more", "$ history")}
          </button>
        </div>
      )}
    </section>
  );
}
