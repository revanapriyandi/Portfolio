import React from 'react';
import { motion, Variants } from 'framer-motion';
import { ServiceItem } from '@/lib/portfolio-types';
import { Terminal, Cpu, Database, Cloud, Code, Shield, Wifi } from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4, duration: 0.8 } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const ICONS: Record<string, React.ReactNode> = {
  code: <Code className="w-5 h-5" />,
  cpu: <Cpu className="w-5 h-5" />,
  database: <Database className="w-5 h-5" />,
  cloud: <Cloud className="w-5 h-5" />,
  terminal: <Terminal className="w-5 h-5" />,
  shield: <Shield className="w-5 h-5" />,
  wifi: <Wifi className="w-5 h-5" />,
};

export default function ServicesSection({ services, textPrimary, textSecondary, accent, cardBg, cardBorder, templateTexts }: {
    services: ServiceItem[];
    textPrimary: string;
    textSecondary: string;
    accent: string;
    cardBg: string;
    cardBorder: string;
    templateTexts?: Record<string, string>;
}) {
  const texts = templateTexts ?? {};
  const t = (key: string, fallback: string) => texts[key] || fallback;
  if (!services || services.length === 0) return null;

  return (
    <section id="services" className="py-24 max-w-6xl mx-auto px-4 sm:px-8 font-sans">
      <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="mb-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight mb-2 flex justify-center items-center gap-3 font-mono" style={{ color: textPrimary }}>
          <Terminal className="w-8 h-8 opacity-70" />
          {t("t1_services_title", "Microservices_")}
        </h2>
        <p className="text-sm opacity-60 font-mono" style={{ color: textSecondary }}>&gt; active background processes & capabilities</p>
      </motion.div>
      
      <motion.div 
        variants={staggerContainer} 
        initial="hidden" 
        whileInView="show" 
        viewport={{ once: true, margin: "-50px" }} 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {services.map((item, idx) => (
          <motion.div 
            key={idx}
            variants={fadeInUp}
            whileHover={{ y: -5 }}
            className="group p-6 rounded-lg transition-all duration-300 relative overflow-hidden"
            style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <div className="absolute top-0 left-0 w-full h-[2px] transition-all duration-500 origin-left scale-x-0 group-hover:scale-x-100" style={{ backgroundColor: accent }} />
            
            <div className="mb-4 inline-flex p-3 rounded-lg" style={{ backgroundColor: '#0d1117', border: `1px solid ${cardBorder}` }}>
               <span style={{ color: accent }}>
                   {item.icon && ICONS[item.icon.toLowerCase()] ? ICONS[item.icon.toLowerCase()] : <Code className="w-5 h-5" />}
               </span>
            </div>
               
            <h3 className="text-lg font-bold tracking-tight mb-3" style={{ color: textPrimary }}>{item.title}</h3>
            
            <p className="text-sm leading-relaxed opacity-80 mb-6" style={{ color: textSecondary }}>
              {item.description}
            </p>

            <div className="flex font-mono text-[10px] gap-3">
              <span style={{ color: '#8b949e' }}>status: <span className="text-emerald-400">active</span></span>
              <span style={{ color: '#8b949e' }}>port: <span style={{ color: accent }}>{(8080 + idx)}</span></span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
