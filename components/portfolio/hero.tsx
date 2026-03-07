import React from 'react';
import { motion, Variants } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { PersonalInfo } from '@/lib/portfolio-types';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function HeroSection({ personal, textPrimary, textSecondary, accent, bg }: {
    personal?: PersonalInfo;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    bg: string;
}) {
  const devName = personal?.name || "Creative Developer";
  const devRole = personal?.role || "Digital Designer & Engineer";
  const devBio = personal?.bio || personal?.bio_short || "I craft digital experiences with a focus on motion, aesthetics, and usability.";

  const githubLink = personal?.github_url || personal?.github;
  const githubHref = githubLink?.startsWith('http') ? githubLink : (githubLink ? `https://github.com/${githubLink}` : undefined);
  
  const fastworkHref = personal?.fastwork_username ? `https://fastwork.id/user/${personal.fastwork_username}` : undefined;

  return (
        <section id="home" className="min-h-screen max-w-7xl mx-auto flex flex-col justify-center pt-20">
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="max-w-5xl">
            <motion.p variants={fadeInUp} className="text-lg md:text-xl font-medium mb-6 uppercase tracking-widest" style={{ color: accent }}>
              {devRole}
            </motion.p>
            <motion.h1 variants={fadeInUp} className="text-6xl md:text-7xl lg:text-[7rem] font-bold tracking-tighter leading-[0.9] mb-8">
              Hello, I&apos;m <br />
              {devName.split(' ').map((word, i) => (
                 <span key={i} className="inline-block mr-4 pr-1" style={{ 
                    WebkitTextStroke: i % 2 !== 0 ? `1px ${textPrimary}` : 'none', 
                    color: i % 2 !== 0 ? 'transparent' : textPrimary,
                    fontStyle: i % 2 !== 0 ? 'italic' : 'normal'
                 }}>
                   {word}
                 </span>
              ))}
            </motion.h1>
            
            <div className="grid md:grid-cols-2 gap-12 mt-16 lg:mt-24 items-end">
               <motion.p variants={fadeInUp} className="text-lg md:text-2xl leading-relaxed" style={{ color: textSecondary }}>
                 {devBio}
               </motion.p>
               <motion.div variants={fadeInUp} className="flex gap-4 md:justify-end flex-wrap">
                 <motion.a 
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    href="#contact" 
                    className="px-8 py-4 rounded-full font-bold flex items-center gap-2 text-sm uppercase tracking-wider shadow-xl"
                    style={{ backgroundColor: textPrimary, color: bg }}
                 >
                   Let&apos;s Talk <ArrowUpRight className="w-5 h-5" />
                 </motion.a>
                 {fastworkHref && (
                    <motion.a 
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        href={fastworkHref} target="_blank" rel="noreferrer"
                        className="px-8 py-4 rounded-full font-bold flex items-center gap-2 text-sm uppercase tracking-wider shadow-xl border-2"
                        style={{ borderColor: textPrimary, color: textPrimary, backgroundColor: 'transparent' }}
                    >
                    Fastwork <ArrowUpRight className="w-5 h-5" />
                    </motion.a>
                 )}
                 {githubHref && (
                    <motion.a 
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        href={githubHref} target="_blank" rel="noreferrer"
                        className="px-8 py-4 rounded-full font-bold flex items-center gap-2 text-sm uppercase tracking-wider shadow-xl border-2"
                        style={{ borderColor: textPrimary, color: textPrimary, backgroundColor: 'transparent' }}
                    >
                    GitHub <ArrowUpRight className="w-5 h-5" />
                    </motion.a>
                 )}
               </motion.div>
            </div>
          </motion.div>
        </section>
  );
}
