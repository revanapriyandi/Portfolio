import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { ProjectItem } from '@/lib/portfolio-types';
import { Github, ExternalLink, Command, FileCode2 } from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.3, duration: 0.8 } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

export default function ProjectsSection({ projects, textPrimary, textSecondary, accent, templateTexts }: {
    projects: ProjectItem[];
    textPrimary: string;
    textSecondary: string;
    accent: string;
    cardBg: string; // Ignored for Clean Technical
    cardBorder: string; // Ignored for Clean Technical
    templateTexts?: Record<string, string>;
}) {
  const [showAll, setShowAll] = useState(false);
  const texts = templateTexts ?? {};
  const t = (key: string, fallback: string) => texts[key] || fallback;
  const initialVisible = 4;
  const displayProjects = showAll ? (projects || []) : (projects || []).slice(0, initialVisible);
  if (!projects || projects.length === 0) return null;
  const truncate = (value?: string, max = 150) => {
    if (!value) return "";
    return value.length > max ? `${value.slice(0, max).trim()}...` : value;
  };

  const getTechColor = (tech: string) => {
    const t = tech.toLowerCase();
    if (t.includes('react') || t.includes('blue')) return '#61dafb';
    if (t.includes('js') || t.includes('javascript')) return '#f7df1e';
    if (t.includes('ts') || t.includes('typescript')) return '#3178c6';
    if (t.includes('node') || t.includes('green')) return '#339933';
    if (t.includes('css') || t.includes('tailwind')) return '#38b2ac';
    if (t.includes('db') || t.includes('sql') || t.includes('data')) return '#ff9800';
    return textSecondary;
  };

  return (
    <section id="work" className="py-24 max-w-[90rem] mx-auto relative w-full px-4 sm:px-8">
      <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b" style={{ borderColor: '#30363d' }}>
        <div>
           <h2 className="text-4xl font-extrabold tracking-tight mb-2 flex items-center gap-3" style={{ color: textPrimary }}>
             <Command className="w-8 h-8 opacity-50" />
             {t("t1_projects_title", "Repositories")}
           </h2>
           <p className="font-mono text-sm" style={{ color: textSecondary }}>&gt; Select * from public.projects where status = &apos;completed&apos;;</p>
        </div>
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid lg:grid-cols-2 gap-6">
        {displayProjects.map((project, idx) => {
          return (
          <motion.div 
            key={project.id} 
            variants={fadeInUp}
            whileHover={{ y: -5, transition: { type: "spring", stiffness: 300, damping: 20 } }}
            className="group flex flex-col rounded-lg overflow-hidden border transition-all duration-300 hover:border-[#8b949e] relative"
            style={{ borderColor: '#30363d', backgroundColor: '#161b22' }}
          >
              {/* Fake IDE Tab Header */}
              <div className="flex border-b text-xs font-mono items-center" style={{ borderColor: '#30363d', backgroundColor: '#0d1117' }}>
                <div className="px-4 py-2 border-r flex items-center gap-2" style={{ borderColor: '#30363d', backgroundColor: '#161b22', color: textPrimary }}>
                  <FileCode2 className="w-3 h-3 group-hover:text-[#58a6ff] transition-colors" />
                  {project.title.toLowerCase().replace(/\s+/g, '-')}.md
                </div>
                <div className="px-4 opacity-50 flex items-center gap-2" style={{ color: textSecondary }}>
                  readme.md
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 md:p-8 flex flex-col flex-grow">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h3 className="text-2xl font-bold tracking-tight hover:underline cursor-pointer" style={{ color: '#58a6ff' }}>
                    {project.title}
                  </h3>
                  <div className="flex gap-2">
                     {(project.github_url || project.github) && (
                      <a href={project.github_url || project.github} target="_blank" rel="noreferrer" className="p-2 rounded-md border bg-[#21262d] hover:bg-[#30363d] transition-colors" style={{ borderColor: '#30363d', color: textPrimary }}>
                         <Github className="w-4 h-4" />
                      </a>
                    )}
                    {(project.live_url || project.live) && (
                      <a href={project.live_url || project.live} target="_blank" rel="noreferrer" className="p-2 rounded-md border bg-[#21262d] hover:bg-[#30363d] transition-colors" style={{ borderColor: '#30363d', color: textPrimary }}>
                         <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <p className="text-[15px] leading-relaxed mb-8" style={{ color: textSecondary }}>
                  {truncate(project.description, 200)}
                </p>

                <div className="mt-auto pt-6 border-t font-mono text-xs flex gap-x-4 gap-y-2 flex-wrap" style={{ borderColor: '#30363d' }}>
                  {(project.tech_stack || []).map(tech => (
                    <span key={tech} className="flex items-center gap-1.5" style={{ color: textSecondary }}>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getTechColor(tech) }}></span>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
          </motion.div>
          );
        })}
      </motion.div>

      {projects.length > initialVisible && (
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mt-12">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAll((prev) => !prev)}
            className="w-full py-3 rounded-md border font-mono text-sm font-semibold transition-colors hover:bg-white/5"
            style={{ borderColor: '#30363d', color: textPrimary, backgroundColor: '#21262d' }}
          >
            {showAll ? t("t1_projects_show_less", "$ clear") : t("t1_projects_show_more", "$ fetch --all --tags")}
          </motion.button>
        </motion.div>
      )}
    </section>
  );
}
