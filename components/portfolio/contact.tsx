import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Mail, Github, Linkedin, ArrowUpRight } from 'lucide-react';
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

export default function ContactSection({ personal, textPrimary, accent, bg }: {
    personal?: PersonalInfo;
    textPrimary: string;
    accent: string;
    bg: string;
}) {
  const githubLink = personal?.github_url || personal?.github;
  const githubHref = githubLink?.startsWith('http') ? githubLink : (githubLink ? `https://github.com/${githubLink}` : undefined);
  
  const linkedinLink = personal?.linkedin_url || personal?.linkedin;
  const linkedinHref = linkedinLink?.startsWith('http') ? linkedinLink : (linkedinLink ? `https://linkedin.com/in/${linkedinLink}` : undefined);

  return (
    <section id="contact" className="py-40 max-w-7xl mx-auto text-center">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer} className="flex flex-col items-center">
        <motion.h2 variants={fadeInUp} className="text-6xl md:text-[8rem] font-bold tracking-tighter leading-none mb-12">
            Let&apos;s talk <br/> <span style={{ color: accent, fontStyle: 'italic', paddingRight: '10px' }}>future.</span>
        </motion.h2>
        
        <motion.a 
            variants={fadeInUp}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            href={personal?.email ? `mailto:${personal.email}` : "#"}
            className="px-12 py-6 rounded-full text-xl font-bold flex items-center gap-3 shadow-2xl"
            style={{ backgroundColor: textPrimary, color: bg }}
        >
            <Mail className="w-6 h-6" /> Get In Touch
        </motion.a>

        <motion.div variants={fadeInUp} className="flex gap-8 mt-24">
            {githubHref && (
            <a href={githubHref} target="_blank" rel="noreferrer" className="hover:opacity-60 transition-opacity hover:-translate-y-2 transform duration-300">
                <Github className="w-8 h-8" />
            </a>
            )}
            {linkedinHref && (
            <a href={linkedinHref} target="_blank" rel="noreferrer" className="hover:opacity-60 transition-opacity hover:-translate-y-2 transform duration-300">
                <Linkedin className="w-8 h-8" />
            </a>
            )}
            {personal?.fastwork_username && (
            <a href={`https://fastwork.id/user/${personal.fastwork_username}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-bold hover:opacity-60 transition-opacity hover:-translate-y-2 transform duration-300">
                FASTWORK <ArrowUpRight className="w-6 h-6" />
            </a>
            )}
        </motion.div>
        </motion.div>
    </section>
  );
}
