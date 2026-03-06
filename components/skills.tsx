"use client";

import { motion } from "framer-motion";
import { skills } from "@/data/portfolio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Skills() {
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
          <h2 className="text-2xl font-bold text-[#fafafa]">
            Skills & Technologies
          </h2>
        </motion.div>

        <Tabs defaultValue={skills[0].category}>
          <TabsList className="h-auto bg-transparent border border-[#27272a] rounded-lg p-1 mb-10 inline-flex flex-wrap gap-1">
            {skills.map((s) => (
              <TabsTrigger
                key={s.category}
                value={s.category}
                className="text-xs font-mono text-[#71717a] rounded-md px-4 py-2 data-[state=active]:bg-[#18181b] data-[state=active]:text-[#fafafa] data-[state=active]:shadow-none transition-all"
              >
                {s.category}
              </TabsTrigger>
            ))}
          </TabsList>

          {skills.map((cat) => (
            <TabsContent key={cat.category} value={cat.category}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-wrap gap-2"
              >
                {cat.items.map((item, i) => (
                  <motion.span
                    key={item}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: i * 0.04 }}
                    className="tag hover:border-[#3b82f6]/50 hover:text-[#fafafa] cursor-default"
                  >
                    {item}
                  </motion.span>
                ))}
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
