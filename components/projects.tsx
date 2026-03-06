"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projects } from "@/data/portfolio";
import { Github, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

export function Projects() {
  const [showAll, setShowAll] = useState(false);
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  const displayed = showAll ? projects : featured;

  return (
    <section id="projects" className="border-b border-[#18181b]">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <p className="label-text mb-3">Portfolio</p>
          <h2 className="text-2xl font-bold text-[#fafafa]">Selected Projects</h2>
        </motion.div>

        {/* Project grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {displayed.map((project, i) => (
              <motion.div
                key={project.title}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className="group border border-[#27272a] rounded-xl p-5 flex flex-col gap-4 hover:border-[#3b82f6]/40 hover:-translate-y-1 transition-all duration-200 bg-[#111113]"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  {/* folder icon */}
                  <svg className="w-7 h-7 text-[#3b82f6]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v8.25A2.25 2.25 0 004.5 16.5h15a2.25 2.25 0 002.25-2.25V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                  <div className="flex items-center gap-2">
                    {project.github && (
                      <a href={project.github} target="_blank" rel="noopener noreferrer"
                        className="text-[#52525b] hover:text-[#fafafa] transition-colors" aria-label="GitHub">
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {project.live && (
                      <a href={project.live} target="_blank" rel="noopener noreferrer"
                        className="text-[#52525b] hover:text-[#3b82f6] transition-colors" aria-label="Live">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[#fafafa] mb-2 group-hover:text-[#3b82f6] transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs text-[#71717a] leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Toggle */}
        {rest.length > 0 && (
          <div className="mt-8 flex justify-start">
            <button
              onClick={() => setShowAll((v) => !v)}
              className="inline-flex items-center gap-2 text-sm font-mono text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
            >
              {showAll
                ? <><ChevronUp className="w-4 h-4" /> Show fewer projects</>
                : <><ChevronDown className="w-4 h-4" /> Show {rest.length} more projects</>}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
