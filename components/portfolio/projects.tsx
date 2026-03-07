import React from 'react';
import { motion, Variants } from 'framer-motion';
import { ProjectItem } from '@/lib/portfolio-types';
import { ArrowUpRight, Github } from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
};

export default function ProjectsSection({ projects, textPrimary, textSecondary, accent, cardBg, cardBorder }: {
    projects: ProjectItem[];
    textPrimary: string;
    textSecondary: string;
    accent: string;
    cardBg: string;
    cardBorder: string;
}) {
  if (!projects || projects.length === 0) return null;

  return (
    <section id="work" className="py-32 max-w-7xl mx-auto">
      <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="mb-24">
        <h2 className="text-5xl md:text-7xl font-bold tracking-tighter">Selected Work.</h2>
      </motion.div>

      <div className="flex flex-col gap-32">
        {projects.map((project, idx) => (
          <motion.div 
            key={project.id} 
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            className="group relative"
          >
            <div className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 items-center`}>
              
              <div className="w-full md:w-3/5 overflow-hidden rounded-3xl relative">
                  <motion.div 
                    whileHover={{ scale: 1.03 }} 
                    transition={{ duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] }} 
                    className="aspect-[4/3] w-full"
                    style={{ backgroundColor: cardBg }}
                  >
                    {project.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-bold opacity-30">
                        {project.title} Preview
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                  </motion.div>
              </div>
              
              <div className={`w-full md:w-2/5 flex flex-col justify-center ${idx % 2 !== 0 ? 'md:items-end md:text-right' : ''}`}>
                <div className={`flex gap-3 mb-6 flex-wrap ${idx % 2 !== 0 ? 'justify-end' : ''}`}>
                  {(project.tech_stack || []).map(tech => (
                    <span key={tech} className="px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-full border backdrop-blur-sm" style={{ borderColor: cardBorder, color: textPrimary, backgroundColor: cardBg }}>
                      {tech}
                    </span>
                  ))}
                </div>
                <h3 className="text-4xl md:text-5xl font-bold tracking-tight mb-6" style={{ color: textPrimary }}>
                  {project.title}
                </h3>
                <p className="text-lg leading-relaxed mb-8" style={{ color: textSecondary }}>
                  {project.description}
                </p>
                
                <div className="flex gap-6">
                  {(project.live_url || project.live) && (
                    <a href={project.live_url || project.live} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-semibold hover:opacity-70 transition-opacity" style={{ color: accent }}>
                      Live Site <ArrowUpRight className="w-5 h-5" />
                    </a>
                  )}
                  {(project.github_url || project.github) && (
                    <a href={project.github_url || project.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-semibold hover:opacity-70 transition-opacity">
                      View Source <Github className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
