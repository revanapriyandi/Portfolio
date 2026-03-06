"use client";
import { motion } from "framer-motion";
import { Briefcase, GraduationCap } from "lucide-react";

interface Exp { id?: string; role: string; company: string; type: string; period: string; current: boolean; description: string; skills: string[]; }
interface Edu { id?: string; degree: string; institution: string; period: string; current: boolean; }
const fi = (delay = 0) => ({
  initial: { opacity: 0, y: 16 }, whileInView: { opacity: 1, y: 0 },
  viewport: { once: true as const, margin: "-40px" }, transition: { duration: 0.45, delay, ease: "easeOut" as const },
});

export function Experience({ experience, education }: { experience: Exp[]; education: Edu[] }) {
  return (
    <section id="experience" className="border-b border-[#18181b]">
      <div className="section-container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }} className="mb-12">
          <p className="label-text mb-3">Journey</p>
          <h2 className="text-2xl font-bold text-[#fafafa]">Experience & Education</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <div className="flex items-center gap-2 mb-8"><Briefcase className="w-4 h-4 text-[#3b82f6]" /><h3 className="text-sm font-semibold text-[#a1a1aa] uppercase tracking-wider">Work</h3></div>
            <div className="relative pl-6 space-y-8">
              <div className="absolute left-[7px] top-0 bottom-0 w-px bg-[#27272a]" />
              {experience.map((exp, i) => (
                <motion.div key={exp.id ?? exp.company} {...fi(i * 0.08)} className="relative">
                  <div className={`absolute -left-[25px] top-1.5 timeline-dot ${!exp.current ? "timeline-dot-muted" : ""}`} />
                  <div>
                    <div className="flex items-start justify-between mb-0.5">
                      <h4 className="text-sm font-semibold text-[#fafafa]">{exp.role}</h4>
                      {exp.current && <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#3b82f6]/40 text-[#3b82f6] shrink-0 ml-2">now</span>}
                    </div>
                    <p className="text-xs text-[#3b82f6] mb-1">{exp.company}</p>
                    <p className="text-xs text-[#52525b] font-mono mb-3">{exp.period} · {exp.type}</p>
                    <p className="text-xs text-[#71717a] leading-relaxed mb-3">{exp.description}</p>
                    <div className="flex flex-wrap gap-1.5">{exp.skills?.map((s) => <span key={s} className="tag">{s}</span>)}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-8"><GraduationCap className="w-4 h-4 text-[#3b82f6]" /><h3 className="text-sm font-semibold text-[#a1a1aa] uppercase tracking-wider">Education</h3></div>
            <div className="relative pl-6 space-y-8">
              <div className="absolute left-[7px] top-0 bottom-0 w-px bg-[#27272a]" />
              {education.map((edu, i) => (
                <motion.div key={edu.id ?? edu.institution} {...fi(i * 0.1)} className="relative">
                  <div className={`absolute -left-[25px] top-1.5 timeline-dot ${!edu.current ? "timeline-dot-muted" : ""}`} />
                  <div>
                    <h4 className="text-sm font-semibold text-[#fafafa] mb-0.5">{edu.degree}</h4>
                    <p className="text-xs text-[#3b82f6] mb-1">{edu.institution}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-[#52525b] font-mono">{edu.period}</p>
                      {edu.current && <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#3b82f6]/40 text-[#3b82f6]">ongoing</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
