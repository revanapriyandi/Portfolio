"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { personalInfo, certifications } from "@/data/portfolio";
import { MapPin, Mail, Phone, Award } from "lucide-react";

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] } },
});

export function About() {
  return (
    <section id="about" className="border-b border-[#18181b]">
      <div className="section-container grid md:grid-cols-[1fr_1.4fr] gap-16 items-start">
        {/* Column 1 — identity */}
        <div>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp(0)}
            className="mb-8"
          >
            <div className="w-28 h-28 rounded-xl overflow-hidden border border-[#27272a] mb-6">
              <Image
                src={personalInfo.avatar}
                alt={personalInfo.name}
                width={112}
                height={112}
                className="object-cover w-full h-full"
              />
            </div>
            <p className="label-text mb-2">About</p>
            <h2 className="text-2xl font-bold text-[#fafafa] mb-1">{personalInfo.name}</h2>
            <p className="text-sm text-[#3b82f6] font-mono">{personalInfo.role}</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp(0.1)}
            className="space-y-2 text-sm text-[#71717a]"
          >
            {[
              { icon: MapPin, text: personalInfo.location },
              { icon: Mail, text: personalInfo.email },
              { icon: Phone, text: personalInfo.phone },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 shrink-0 text-[#3b82f6]" />
                <span>{text}</span>
              </div>
            ))}
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp(0.2)}
            className="mt-8 pt-8 border-t border-[#18181b] grid grid-cols-3 gap-4"
          >
            {[
              { v: "3+", l: "Years" },
              { v: "20+", l: "Projects" },
              { v: "15+", l: "Technologies" },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-xl font-bold text-[#fafafa]">{s.v}</p>
                <p className="text-xs text-[#52525b] mt-0.5">{s.l}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Column 2 — bio + certs */}
        <div>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp(0)}
          >
            <p className="text-[#a1a1aa] leading-relaxed mb-8">
              {personalInfo.bio}
            </p>
          </motion.div>

          {/* Certifications */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp(0.1)}
          >
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-3.5 h-3.5 text-[#3b82f6]" />
              <p className="label-text">Certifications</p>
            </div>
            <div className="space-y-3">
              {certifications.map((cert) => (
                <div
                  key={cert.name}
                  className="border border-[#27272a] rounded-lg p-4 hover:border-[#3f3f46] transition-colors"
                >
                  <p className="text-sm font-medium text-[#fafafa]">{cert.name}</p>
                  <p className="text-xs text-[#71717a] mt-0.5">{cert.issuer}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
