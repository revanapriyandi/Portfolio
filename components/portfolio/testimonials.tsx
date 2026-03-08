import React from 'react';
import { motion, Variants } from 'framer-motion';
import { TestimonialItem } from '@/lib/portfolio-types';
import { MessageSquareQuote, GitMerge } from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4, duration: 0.8 } }
};

export default function TestimonialsSection({ testimonials, textPrimary, textSecondary, cardBorder, templateTexts }: {
    testimonials: TestimonialItem[];
    textPrimary: string;
    textSecondary: string;
    accent: string;
    cardBorder: string;
    templateTexts?: Record<string, string>;
}) {
  const texts = templateTexts ?? {};
  const t = (key: string, fallback: string) => texts[key] || fallback;
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="py-24 max-w-6xl mx-auto px-4 sm:px-8 font-sans">
      <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="mb-16">
        <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3 font-mono bg-clip-text text-transparent bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${textPrimary}, #79c0ff)` }}>
          <MessageSquareQuote className="w-8 h-8 opacity-70" style={{ color: textPrimary }} />
          {t("t1_testimonials_title", "Code Reviews")}
        </h2>
        <p className="text-sm opacity-60 font-mono" style={{ color: textSecondary }}>&gt; verified commits from collaborators</p>
      </motion.div>
      
      <div className="relative w-full overflow-hidden mt-8 py-4">
        {/* Fade Edges for Marquee effect */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r z-10 from-[#0d1117] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l z-10 from-[#0d1117] to-transparent pointer-events-none" />
        
        <motion.div 
          animate={{ x: [0, -1920] }} 
          transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
          className="flex gap-6 w-max"
        >
          {/* Duplicate map for seamless loop */}
          {[...testimonials, ...testimonials, ...testimonials].map((item, idx) => (
          <motion.div 
            key={idx}
            variants={fadeInUp}
            whileHover={{ scale: 1.02, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', borderColor: 'rgba(139, 148, 158, 0.6)' }}
            className="group p-6 rounded-lg transition-all duration-300 relative flex flex-col backdrop-blur-md w-[400px] shrink-0"
            style={{ backgroundColor: 'rgba(22, 27, 34, 0.6)', border: `1px solid rgba(48, 54, 61, 0.7)` }}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 font-mono text-[80px] leading-none select-none pointer-events-none transition-opacity duration-300 group-hover:opacity-20" style={{ color: '#58a6ff' }}>&quot;</div>
            <p className="text-sm leading-relaxed mb-8 flex-1 italic relative z-10" style={{ color: textSecondary }}>
              &quot;{item.content}&quot;
            </p>

            <div className="flex items-center gap-4 mt-auto">
              <div className="h-10 w-10 flex items-center justify-center rounded bg-[#0d1117] font-mono font-bold" style={{ color: textPrimary, border: `1px solid ${cardBorder}` }}>
                {item.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                 <h4 className="text-sm font-bold tracking-tight" style={{ color: textPrimary }}>{item.name}</h4>
                 {item.company && (
                   <div className="flex items-center gap-1 font-mono text-[10px] mt-0.5">
                     <GitMerge className="w-3 h-3" style={{ color: '#58a6ff' }} />
                     <span style={{ color: '#58a6ff' }}>{item.company}</span>
                   </div>
                 )}
              </div>
            </div>
          </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
