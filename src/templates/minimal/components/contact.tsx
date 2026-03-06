"use client";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, Phone, MapPin, ExternalLink } from "lucide-react";

interface PersonalInfo { email?: string; phone?: string; location?: string; github?: string; linkedin?: string; }

export function Contact({ personal }: { personal: PersonalInfo }) {
  return (
    <section id="contact" className="border-b border-[#18181b]">
      <div className="section-container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }} className="mb-12">
          <p className="label-text mb-3">Contact</p>
          <h2 className="text-2xl font-bold text-[#fafafa]">Get In Touch</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <p className="text-[#a1a1aa] leading-relaxed mb-8">
              Saya sedang mencari peluang baru dan siap bergabung dengan tim yang hebat. Apakah kamu memiliki posisi yang tepat, proyek menarik, atau sekadar ingin ngobrol — inbox saya selalu terbuka.
            </p>
            {personal.email && (
              <a href={`mailto:${personal.email}`}
                className="inline-flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-medium px-6 py-3 rounded-md transition-colors duration-200 mb-8">
                <Mail className="w-4 h-4" /> Kirim Email
              </a>
            )}
            <div className="space-y-3 text-sm">
              {[
                { icon: MapPin, label: "Location", value: personal.location, href: null },
                { icon: Mail, label: "Email", value: personal.email, href: personal.email ? `mailto:${personal.email}` : null },
                { icon: Phone, label: "Phone", value: personal.phone, href: personal.phone ? `tel:${personal.phone}` : null },
              ].filter(x => x.value).map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon className="w-3.5 h-3.5 text-[#3b82f6] shrink-0" />
                  <span className="text-[#52525b] font-mono w-16 text-xs">{label}</span>
                  {href ? <a href={href} className="text-[#a1a1aa] hover:text-[#fafafa] transition-colors text-xs">{value}</a>
                    : <span className="text-[#a1a1aa] text-xs">{value}</span>}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
            <p className="text-xs text-[#52525b] font-semibold uppercase tracking-widest mb-6">Find me on</p>
            <div className="space-y-3">
              {[
                { icon: Github, label: "GitHub", sub: personal.github?.replace("https://github.com/", "@") ?? "@revanapriyandi", href: personal.github },
                { icon: Linkedin, label: "LinkedIn", sub: "revan-apriyandi", href: personal.linkedin },
              ].filter(x => x.href).map(({ icon: Icon, label, sub, href }) => (
                <a key={label} href={href!} target="_blank" rel="noopener noreferrer"
                  className="group flex items-center justify-between border border-[#27272a] rounded-lg p-4 hover:border-[#3b82f6]/40 hover:bg-[#111113] transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-[#52525b] group-hover:text-[#fafafa] transition-colors" />
                    <div><p className="text-sm font-medium text-[#fafafa]">{label}</p><p className="text-xs text-[#52525b] font-mono">{sub}</p></div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#3f3f46] group-hover:text-[#3b82f6] transition-colors" />
                </a>
              ))}
              <div className="mt-6 border border-[#27272a] rounded-lg p-4 bg-[#111113]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs font-semibold text-[#fafafa]">Available for opportunities</p>
                </div>
                <p className="text-xs text-[#71717a] leading-relaxed">Open to full-time, freelance, dan kolaborasi. Respon dalam 24 jam.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
