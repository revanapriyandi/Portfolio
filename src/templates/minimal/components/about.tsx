"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { Mail, Phone, MapPin, Award } from "lucide-react";

interface PersonalInfo {
  name: string; role?: string; bio?: string;
  location?: string; email?: string; phone?: string; avatar?: string;
  years_of_exp?: number; yearsOfExp?: number;
  projects_completed?: number; projectsCompleted?: number;
}
interface Cert { name: string; issuer: string; }

export function About({ personal, certifications }: { personal: PersonalInfo; certifications: Cert[] }) {
  const years = personal.years_of_exp ?? personal.yearsOfExp ?? 3;
  const projects = personal.projects_completed ?? personal.projectsCompleted ?? 20;

  return (
    <section id="about" className="border-b border-[#18181b]">
      <div className="section-container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }} className="mb-12">
          <p className="label-text mb-3">About</p>
          <h2 className="text-2xl font-bold text-[#fafafa]">Who I Am</h2>
        </motion.div>

        <div className="grid md:grid-cols-[280px_1fr] gap-12">
          {/* Left — identity */}
          <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <div className="relative w-24 h-24 rounded-xl overflow-hidden ring-1 ring-[#27272a] mb-6">
              {personal.avatar && <Image src={personal.avatar} alt={personal.name} fill className="object-cover" />}
            </div>
            <h3 className="text-lg font-semibold text-[#fafafa] mb-0.5">{personal.name}</h3>
            <p className="text-sm text-[#3b82f6] font-mono mb-5">{personal.role}</p>
            <div className="space-y-2.5 text-xs">
              {personal.location && <div className="flex items-center gap-2.5 text-[#71717a]"><MapPin className="w-3.5 h-3.5 text-[#3b82f6] shrink-0" />{personal.location}</div>}
              {personal.email && <div className="flex items-center gap-2.5 text-[#71717a]"><Mail className="w-3.5 h-3.5 text-[#3b82f6] shrink-0" />{personal.email}</div>}
              {personal.phone && <div className="flex items-center gap-2.5 text-[#71717a]"><Phone className="w-3.5 h-3.5 text-[#3b82f6] shrink-0" />{personal.phone}</div>}
            </div>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-8">
              {[{ v: `${years}+`, l: "Years" }, { v: `${projects}+`, l: "Projects" }, { v: "15+", l: "Tech" }].map(s => (
                <div key={s.l} className="text-center border border-[#27272a] rounded-lg py-3 bg-[#111113]">
                  <p className="text-lg font-bold text-[#fafafa]">{s.v}</p>
                  <p className="text-[10px] text-[#52525b] font-mono">{s.l}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — bio + certs */}
          <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
            <p className="text-[#a1a1aa] leading-relaxed text-sm mb-8">{personal.bio}</p>
            {certifications.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-4 h-4 text-[#3b82f6]" />
                  <p className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">Certifications</p>
                </div>
                <div className="space-y-2">
                  {certifications.map((c) => (
                    <div key={c.name} className="border border-[#27272a] rounded-lg px-4 py-3 bg-[#111113]">
                      <p className="text-xs font-medium text-[#fafafa]">{c.name}</p>
                      <p className="text-xs text-[#52525b] mt-0.5">{c.issuer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
