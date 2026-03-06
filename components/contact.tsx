"use client";

import { motion } from "framer-motion";
import { personalInfo } from "@/data/portfolio";
import { Github, Linkedin, Mail, Phone, MapPin, ExternalLink } from "lucide-react";

export function Contact() {
  return (
    <section id="contact" className="border-b border-[#18181b]">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <p className="label-text mb-3">Contact</p>
          <h2 className="text-2xl font-bold text-[#fafafa]">Get In Touch</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16">
          {/* Left — message */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[#a1a1aa] leading-relaxed mb-8">
              Saya sedang mencari peluang baru dan siap untuk bergabung dengan tim yang hebat. Apakah kamu memiliki posisi yang tepat, proyek menarik, atau sekadar ingin ngobrol — inbox saya selalu terbuka.
            </p>

            {/* Primary CTA */}
            <a
              href={`mailto:${personalInfo.email}`}
              className="inline-flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-medium px-6 py-3 rounded-md transition-colors duration-200 mb-8"
            >
              <Mail className="w-4 h-4" />
              Kirim Email
            </a>

            {/* Contact details */}
            <div className="space-y-3 text-sm">
              {[
                { icon: MapPin, label: "Location", value: personalInfo.location, href: null },
                { icon: Mail, label: "Email", value: personalInfo.email, href: `mailto:${personalInfo.email}` },
                { icon: Phone, label: "Phone", value: personalInfo.phone, href: `tel:${personalInfo.phone}` },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon className="w-3.5 h-3.5 text-[#3b82f6] shrink-0" />
                  <span className="text-[#52525b] font-mono w-16 text-xs">{label}</span>
                  {href ? (
                    <a href={href} className="text-[#a1a1aa] hover:text-[#fafafa] transition-colors">{value}</a>
                  ) : (
                    <span className="text-[#a1a1aa]">{value}</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — social links */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <p className="text-xs text-[#52525b] font-semibold uppercase tracking-widest mb-6">Find me on</p>
            <div className="space-y-3">
              {[
                { icon: Github, label: "GitHub", sub: "@revanapriyandi", href: personalInfo.github },
                { icon: Linkedin, label: "LinkedIn", sub: "revan-apriyandi", href: personalInfo.linkedin },
              ].map(({ icon: Icon, label, sub, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between border border-[#27272a] rounded-lg p-4 hover:border-[#3b82f6]/40 hover:bg-[#111113] transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-[#52525b] group-hover:text-[#fafafa] transition-colors" />
                    <div>
                      <p className="text-sm font-medium text-[#fafafa]">{label}</p>
                      <p className="text-xs text-[#52525b] font-mono">{sub}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#3f3f46] group-hover:text-[#3b82f6] transition-colors" />
                </a>
              ))}

              {/* Availability note */}
              <div className="mt-6 border border-[#27272a] rounded-lg p-4 bg-[#111113]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs font-semibold text-[#fafafa]">Available for opportunities</p>
                </div>
                <p className="text-xs text-[#71717a] leading-relaxed">
                  Open to full-time positions, freelance projects, and collaborations. Response within 24 hours.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
