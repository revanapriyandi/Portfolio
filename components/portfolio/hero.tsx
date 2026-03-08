import React from 'react';
import { motion, Variants } from 'framer-motion';
import { ArrowRight, Github, Terminal } from 'lucide-react';
import { PersonalInfo } from '@/lib/portfolio-types';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const staggerLines: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4 } }
};

export default function HeroSection({ personal, textPrimary, textSecondary }: {
    personal?: PersonalInfo;
    textPrimary: string;
    textSecondary: string;
    templateTexts?: Record<string, string>;
}) {
  const devName = personal?.name || "Developer";
  const devRole = personal?.role || "Full Stack Engineer";
  const devBio = personal?.bio || personal?.bio_short || "I engineer robust, scalable applications and seamless digital experiences.";

  const githubLink = personal?.github_url || personal?.github;
  const githubHref = githubLink?.startsWith('http') ? githubLink : (githubLink ? `https://github.com/${githubLink}` : undefined);
  
  const fastworkHref = personal?.fastwork_username ? `https://fastwork.id/user/${personal.fastwork_username}` : undefined;

  return (
        <section id="home" className="max-w-7xl mx-auto flex flex-col justify-center pt-16 pb-12 px-6 sm:px-12 relative z-10 w-full">
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Typography */}
            <div className="flex flex-col items-start text-left order-2 lg:order-1">
              <motion.div variants={fadeInUp} className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-mono font-medium" style={{ color: textSecondary, borderColor: '#30363d', backgroundColor: '#161b22' }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#3fb950' }}></span>
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#3fb950' }}></span>
                </span>
                Status: Available for hire
              </motion.div>

              <motion.h1 variants={staggerContainer} initial="hidden" animate="show" className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 flex flex-col" style={{ color: textPrimary }}>
                {devRole.split(' ').map((word, i) => (
                  <motion.span variants={staggerLines} key={i} className="block">{word}</motion.span>
                ))}
              </motion.h1>
              
              <motion.p variants={fadeInUp} className="text-lg md:text-xl md:leading-relaxed max-w-xl mb-10 font-medium" style={{ color: textSecondary }}>
                Hi, I&apos;m <span style={{ color: textPrimary }}>{devName}</span>. {devBio}
              </motion.p>
              
              <motion.div variants={fadeInUp} className="flex gap-4 flex-wrap">
                <motion.a 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                  href="#contact" 
                  className="px-6 py-3 rounded-md font-semibold flex items-center gap-2 text-sm transition-all group"
                  style={{ backgroundColor: textPrimary, color: "#0d1117" }}
                >
                  Initialize Project <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.a>
                
                {githubHref && (
                  <motion.a 
                      whileHover={{ scale: 1.02 }} 
                      whileTap={{ scale: 0.98 }}
                      href={githubHref} target="_blank" rel="noreferrer"
                      className="px-6 py-3 rounded-md font-semibold flex items-center gap-2 text-sm border transition-colors hover:bg-white/5"
                      style={{ color: textPrimary, borderColor: '#30363d', backgroundColor: '#21262d' }}
                  >
                  <Github className="w-4 h-4 opacity-70" /> Source Code
                  </motion.a>
                )}
                
                {fastworkHref && (
                  <motion.a 
                      whileHover={{ scale: 1.02 }} 
                      whileTap={{ scale: 0.98 }}
                      href={fastworkHref} target="_blank" rel="noreferrer"
                      className="px-6 py-3 rounded-md font-semibold flex items-center gap-2 text-sm border transition-colors hover:bg-white/5"
                      style={{ color: textPrimary, borderColor: '#30363d', backgroundColor: 'transparent' }}
                  >
                  <Terminal className="w-4 h-4 opacity-70" /> Fastwork
                  </motion.a>
                )}
              </motion.div>
            </div>

            {/* Right Column: Code Window */}
            <motion.div variants={fadeInUp} className="order-1 lg:order-2 w-full max-w-[500px] lg:max-w-none mx-auto lg:ml-auto">
              <div className="rounded-xl overflow-hidden border shadow-2xl" style={{ borderColor: '#30363d', backgroundColor: '#0d1117' }}>
                {/* Window Header */}
                <div className="flex items-center px-4 py-3 border-b" style={{ borderColor: '#30363d', backgroundColor: '#161b22' }}>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                  </div>
                  <div className="mx-auto text-xs font-mono" style={{ color: textSecondary }}>developer.config.ts</div>
                </div>
                {/* Code Body */}
                <motion.div variants={staggerContainer} initial="hidden" animate="show" className="p-6 font-mono text-sm md:text-base overflow-x-auto leading-relaxed" style={{ color: textPrimary }}>
                  <motion.div variants={staggerLines} className="flex">
                    <span className="w-8 select-none opacity-40 text-right pr-4">1</span>
                    <span><span style={{ color: '#ff7b72' }}>import</span> {`{`} Developer {`}`} <span style={{ color: '#ff7b72' }}>from</span> <span style={{ color: '#a5d6ff' }}>&apos;@/lib/core&apos;</span>;</span>
                  </motion.div>
                  <motion.div variants={staggerLines} className="flex">
                    <span className="w-8 select-none opacity-40 text-right pr-4">2</span>
                    <span></span>
                  </motion.div>
                  <motion.div variants={staggerLines} className="flex">
                    <span className="w-8 select-none opacity-40 text-right pr-4">3</span>
                    <span><span style={{ color: '#ff7b72' }}>const</span> profile: Developer = {'{'}</span>
                  </motion.div>
                  <motion.div variants={staggerLines} className="flex">
                    <span className="w-8 select-none opacity-40 text-right pr-4">4</span>
                    <span className="pl-4">name: <span style={{ color: '#a5d6ff' }}>&quot;{devName}&quot;</span>,</span>
                  </motion.div>
                  <motion.div variants={staggerLines} className="flex">
                    <span className="w-8 select-none opacity-40 text-right pr-4">5</span>
                    <span className="pl-4">role: <span style={{ color: '#a5d6ff' }}>&quot;{devRole}&quot;</span>,</span>
                  </motion.div>
                  <motion.div variants={staggerLines} className="flex">
                    <span className="w-8 select-none opacity-40 text-right pr-4">6</span>
                    <span className="pl-4">status: <span style={{ color: '#79c0ff' }}>true</span>,</span>
                  </motion.div>
                  <motion.div variants={staggerLines} className="flex">
                    <span className="w-8 select-none opacity-40 text-right pr-4">7</span>
                    <span className="pl-4">skills: [</span>
                  </motion.div>
                  <motion.div variants={staggerLines} className="flex">
                    <span className="w-8 select-none opacity-40 text-right pr-4">8</span>
                    <span className="pl-8"><span style={{ color: '#a5d6ff' }}>&quot;Frontend&quot;</span>, <span style={{ color: '#a5d6ff' }}>&quot;Backend&quot;</span>, <span style={{ color: '#a5d6ff' }}>&quot;Database&quot;</span></span>
                  </motion.div>
                  <motion.div variants={staggerLines} className="flex">
                    <span className="w-8 select-none opacity-40 text-right pr-4">9</span>
                    <span className="pl-4">],</span>
                  </motion.div>
                  <motion.div variants={staggerLines} className="flex">
                    <span className="w-8 select-none opacity-40 text-right pr-4">10</span>
                    <span className="pl-4">execute: <span style={{ color: '#ff7b72' }}>() =&gt;</span> {'{'}</span>
                  </motion.div>
                  <motion.div variants={staggerLines} className="flex">
                    <span className="w-8 select-none opacity-40 text-right pr-4">11</span>
                    <span className="pl-8">console.<span style={{ color: '#d2a8ff' }}>log</span>(<span style={{ color: '#a5d6ff' }}>&quot;Building the future...&quot;</span>);</span>
                  </motion.div>
                  <motion.div variants={staggerLines} className="flex">
                    <span className="w-8 select-none opacity-40 text-right pr-4">12</span>
                    <span className="pl-4">{'}'}</span>
                  </motion.div>
                  <motion.div variants={staggerLines} className="flex">
                    <span className="w-8 select-none opacity-40 text-right pr-4">13</span>
                    <span>{'}'};</span>
                  </motion.div>
                  <motion.div variants={staggerLines} className="flex">
                    <span className="w-8 select-none opacity-40 text-right pr-4">14</span>
                    <span></span>
                  </motion.div>
                  <motion.div variants={staggerLines} className="flex">
                    <span className="w-8 select-none opacity-40 text-right pr-4">15</span>
                    <span><span style={{ color: '#ff7b72' }}>export default</span> profile;</span>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>

          </motion.div>
        </section>
  );
}
