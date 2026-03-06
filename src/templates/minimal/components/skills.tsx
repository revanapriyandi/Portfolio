"use client";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ICON_MAP } from "@/lib/skill-icons";

interface SkillCategory {
  id?: string;
  category: string;
  items: string[];
  item_icons?: Record<string, string>; // { "React": "React", "Node.js": "Node.js" }
}

function SkillBadge({ item, iconKey }: { item: string; iconKey?: string }) {
  // Use explicitly stored icon key, or auto-match from ICON_MAP
  const resolvedKey = iconKey ?? item;
  const Icon = ICON_MAP[resolvedKey];

  return (
    <span className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#27272a] bg-[#111113] hover:border-[#3b82f6]/40 hover:bg-[#18181b] text-xs text-[#a1a1aa] hover:text-[#fafafa] cursor-default transition-all duration-150 font-mono">
      {Icon && (
        <Icon
          className="w-3.5 h-3.5 text-[#52525b] group-hover:text-[#3b82f6] transition-colors duration-150 shrink-0"
          aria-hidden
        />
      )}
      {item}
    </span>
  );
}

export function Skills({ skills }: { skills: SkillCategory[] }) {
  if (!skills.length) return null;

  return (
    <section id="skills" className="border-b border-[#18181b]">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <p className="label-text mb-3">Tech Stack</p>
          <h2 className="text-2xl font-bold text-[#fafafa]">Skills & Technologies</h2>
        </motion.div>

        <Tabs defaultValue={skills[0].category}>
          <TabsList className="h-auto bg-transparent border border-[#27272a] rounded-lg p-1 mb-10 inline-flex flex-wrap gap-1">
            {skills.map((s) => (
              <TabsTrigger
                key={s.id ?? s.category}
                value={s.category}
                className="text-xs font-mono text-[#71717a] rounded-md px-4 py-2 data-[state=active]:bg-[#18181b] data-[state=active]:text-[#fafafa] data-[state=active]:shadow-none transition-all"
              >
                {s.category}
              </TabsTrigger>
            ))}
          </TabsList>

          {skills.map((cat) => (
            <TabsContent key={cat.id ?? cat.category} value={cat.category}>
              <div className="flex flex-wrap gap-2">
                {cat.items?.map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                  >
                    <SkillBadge item={item} iconKey={cat.item_icons?.[item]} />
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
