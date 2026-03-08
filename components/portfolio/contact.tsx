import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Mail, Github, Linkedin, ExternalLink, Terminal, Command } from 'lucide-react';
import { PersonalInfo } from '@/lib/portfolio-types';

const fadeInUp: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function ContactSection({ personal, textPrimary, textSecondary, accent, templateTexts }: {
    personal?: PersonalInfo;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    bg?: string; // Ignored
    templateTexts?: Record<string, string>;
}) {
  const githubLink = personal?.github_url || personal?.github;
  const githubHref = githubLink?.startsWith('http') ? githubLink : (githubLink ? `https://github.com/${githubLink}` : undefined);
  
  const linkedinLink = personal?.linkedin_url || personal?.linkedin;
  const linkedinHref = linkedinLink?.startsWith('http') ? linkedinLink : (linkedinLink ? `https://linkedin.com/in/${linkedinLink}` : undefined);
  const fastworkHref = personal?.fastwork_username ? `https://fastwork.id/user/${personal.fastwork_username}` : undefined;
  
  const texts = templateTexts ?? {};
  const t = (key: string, fallback: string) => texts[key] || fallback;

  return (
    <section id="contact" className="py-24 max-w-5xl mx-auto px-4 sm:px-8 relative flex justify-center items-center min-h-[50vh]">
        
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="w-full">
            
            <motion.div 
               variants={fadeInUp} 
               className="w-full rounded-xl overflow-hidden border shadow-2xl backdrop-blur-md"
               style={{ borderColor: '#30363d', backgroundColor: '#161b22' }}
            >
                {/* Command Input Area */}
                <div className="flex items-center px-6 py-5 border-b gap-4" style={{ borderColor: '#30363d', backgroundColor: '#0d1117' }}>
                    <Command className="w-5 h-5 opacity-50" style={{ color: textSecondary }} />
                    <span className="text-xl md:text-2xl font-sans tracking-tight bg-transparent w-full outline-none" style={{ color: textPrimary }}>
                        {t("t1_contact_title", "Connect with me...")}
                    </span>
                    <span className="animate-pulse w-3 h-6 bg-[#58a6ff]"></span>
                </div>

                 {/* Command Options Area */}
                <div className="p-4 flex flex-col gap-2">
                    <p className="px-3 py-2 text-xs font-mono uppercase tracking-widest font-bold mb-2 mt-2" style={{ color: textSecondary }}>
                        Available Actions
                    </p>

                    <a 
                        href={personal?.email ? `mailto:${personal.email}` : "#"}
                        className="group flex items-center justify-between px-4 py-3 rounded-lg transition-colors hover:bg-[#21262d] cursor-pointer"
                        style={{ color: textPrimary }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-[#0d1117] border" style={{ borderColor: '#30363d' }}>
                                <Mail className="w-4 h-4" style={{ color: '#58a6ff' }} />
                            </div>
                            <span className="font-medium text-sm md:text-base">Send Email Protocol</span>
                        </div>
                        <span className="text-xs font-mono opacity-0 group-hover:opacity-60 transition-opacity">Enter ↵</span>
                    </a>

                    {githubHref && (
                    <a 
                        href={githubHref} target="_blank" rel="noreferrer"
                        className="group flex items-center justify-between px-4 py-3 rounded-lg transition-colors hover:bg-[#21262d] cursor-pointer"
                        style={{ color: textPrimary }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-[#0d1117] border" style={{ borderColor: '#30363d' }}>
                                <Github className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-sm md:text-base">Inspect Source Code</span>
                        </div>
                        <span className="text-xs font-mono opacity-0 group-hover:opacity-60 transition-opacity">⌘ + G</span>
                    </a>
                    )}

                    {linkedinHref && (
                    <a 
                        href={linkedinHref} target="_blank" rel="noreferrer"
                        className="group flex items-center justify-between px-4 py-3 rounded-lg transition-colors hover:bg-[#21262d] cursor-pointer"
                        style={{ color: textPrimary }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-[#0d1117] border" style={{ borderColor: '#30363d' }}>
                                <Linkedin className="w-4 h-4" style={{ color: '#0a66c2' }} />
                            </div>
                            <span className="font-medium text-sm md:text-base">Establish Professional Connection</span>
                        </div>
                        <span className="text-xs font-mono opacity-0 group-hover:opacity-60 transition-opacity">⌘ + L</span>
                    </a>
                    )}

                    {fastworkHref && (
                    <a 
                        href={fastworkHref} target="_blank" rel="noreferrer"
                        className="group flex items-center justify-between px-4 py-3 rounded-lg transition-colors hover:bg-[#21262d] cursor-pointer"
                        style={{ color: textPrimary }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-[#0d1117] border" style={{ borderColor: '#30363d' }}>
                                <Terminal className="w-4 h-4" style={{ color: '#00d381' }} />
                            </div>
                            <span className="font-medium text-sm md:text-base">Hire via Fastwork</span>
                        </div>
                        <span className="text-xs font-mono opacity-0 group-hover:opacity-60 transition-opacity">⌘ + F</span>
                    </a>
                    )}

                </div>
                
                {/* Status Bar */}
                <div className="border-t px-6 py-3 flex items-center justify-between text-xs font-mono" style={{ borderColor: '#30363d', backgroundColor: '#0d1117', color: textSecondary }}>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#238636' }}></span> System Online</span>
                    </div>
                    <div>
                        Ready
                    </div>
                </div>
            </motion.div>
        </motion.div>
    </section>
  );
}
