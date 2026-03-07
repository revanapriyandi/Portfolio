import React from "react";
import { MapPin, Mail, Phone, Globe, Github, Linkedin, Twitter, ExternalLink, ChevronDown, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CanvasBlock } from "@/lib/builder-types";
import type { PortfolioData } from "@/lib/portfolio-types";
import { fmtDate, applyBlockStyles, getBlockClasses, getContainerWidth } from "./utils";

export function ModernSectionHeader({ title, subtitle, color }: { title: string, subtitle: string, color: string }) {
  return (
    <div className="mb-12 md:text-center flex flex-col items-start md:items-center">
      <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">{title}</h2>
      <div className="flex items-center gap-4 w-full md:justify-center">
        <div className="hidden md:block w-12 h-1 rounded-full opacity-50" style={{ backgroundColor: color }} />
        <p className="text-lg font-medium tracking-wide uppercase" style={{ color }}>{subtitle}</p>
        <div className="hidden md:block w-12 h-1 rounded-full opacity-50" style={{ backgroundColor: color }} />
      </div>
    </div>
  );
}

function getDataText(block: CanvasBlock, key: string, fallback = "") {
  const value = block.data?.[key];
  return typeof value === "string" ? value : fallback;
}

export function SystemPersonalBlock({ data, theme, navLinks, block }: { data: PortfolioData; theme: any; navLinks: any; block: CanvasBlock }) {
  const { personal } = data;
  if (!personal) return null;
  const displayName = personal.full_name ?? personal.name ?? "Your Name";
  const displayRole = personal.title ?? personal.role ?? "";
  const displayBio = getDataText(block, "description", personal.bio ?? "");
  const badgeText = getDataText(block, "badgeText", "Available for new opportunities");
  const headlinePrefix = getDataText(block, "title", "Hi, I'm");
  const primaryCtaText = getDataText(block, "primaryCtaText", "View Work");
  const primaryCtaHref = getDataText(block, "primaryCtaHref", "#projects");
  const secondaryCtaText = getDataText(block, "secondaryCtaText", "Contact Me");
  const secondaryCtaHref = getDataText(block, "secondaryCtaHref", "#contact");
  const githubUrl = personal.github_url ?? personal.github;
  const linkedinUrl = personal.linkedin_url ?? personal.linkedin;
  const twitterUrl = personal.twitter_url ?? personal.twitter;

  return (
    <section id="personal" className={`${getBlockClasses(block, "min-h-[90vh] pt-16")} flex items-center justify-center overflow-hidden`} style={applyBlockStyles(block)}>
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20 blur-[100px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${theme.primaryColor} 0%, transparent 70%)` }}
      />
      <div className={`relative ${getContainerWidth(block)} mx-auto px-6 text-center z-10`}>
        {personal.open_to_work && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-8 border" style={{ backgroundColor: `${theme.primaryColor}15`, borderColor: `${theme.primaryColor}30`, color: theme.accentColor }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.primaryColor }} />
            {badgeText}
          </div>
        )}
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6">
          {headlinePrefix} <span style={{ color: theme.primaryColor }}>{displayName}</span>
        </h1>
        {displayRole && (
          <h2 className="text-xl md:text-2xl text-zinc-400 font-medium mb-8 max-w-2xl mx-auto">{displayRole}</h2>
        )}
        {displayBio && (
          <p className="text-base md:text-lg text-zinc-500 mb-10 max-w-2xl mx-auto leading-relaxed">{displayBio}</p>
        )}
        <div className="flex flex-col sm:flex-row shadow-sm gap-4 justify-center items-center">
            <a href={primaryCtaHref} className="px-8 py-3 rounded-full font-semibold text-white transition-transform hover:scale-105" style={{ backgroundColor: theme.primaryColor }}>{primaryCtaText}</a>
            <a href={secondaryCtaHref} className="px-8 py-3 rounded-full font-semibold transition-transform hover:scale-105 border" style={{ borderColor: `${theme.primaryColor}50`, color: theme.accentColor, backgroundColor: `${theme.primaryColor}10` }}>{secondaryCtaText}</a>
        </div>
        <div className="flex gap-4 justify-center mt-12 bg-black/20 backdrop-blur-sm rounded-full py-3 px-6 w-fit mx-auto border border-white/5">
            {githubUrl && <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" style={{ color: theme.accentColor }}><Github className="w-5 h-5" /></a>}
            {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" style={{ color: theme.accentColor }}><Linkedin className="w-5 h-5" /></a>}
            {twitterUrl && <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" style={{ color: theme.accentColor }}><Twitter className="w-5 h-5" /></a>}
        </div>
        <a href={`#${navLinks.filter((l: any) => l.id !== 'personal')[0]?.id || 'contact'}`} className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce mt-20 text-zinc-500 hover:text-white transition-colors">
            <ChevronDown className="w-6 h-6" />
        </a>
      </div>
    </section>
  );
}

export function SystemExperienceBlock({ data, theme, block }: { data: PortfolioData; theme: any; block: CanvasBlock }) {
  const { experience } = data;
  if (!experience || experience.length === 0) return null;
  const title = getDataText(block, "title", "Experience");
  const subtitle = getDataText(block, "subtitle", "My professional journey");
  return (
    <section id="experience" className={`${getBlockClasses(block)} border-t`} style={{ ...applyBlockStyles(block), borderColor: `${theme.primaryColor}10`, backgroundColor: block.style?.backgroundColor || `${theme.primaryColor}03` }}>
      <div className={`${getContainerWidth(block)} mx-auto px-6`}>
        <ModernSectionHeader title={title} subtitle={subtitle} color={theme.primaryColor} />
        <div className="space-y-12">
          {experience.map((exp, idx) => (
            <div key={exp.id} className="relative pl-8 md:pl-0">
              <div className="hidden md:block absolute left-[50%] top-0 bottom-0 w-px bg-gradient-to-b" style={{ backgroundImage: `linear-gradient(to bottom, ${theme.primaryColor}50, transparent)` }} />
              <div className={`md:flex items-center justify-between w-full ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className="hidden md:block w-5/12" />
                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 top-1 w-4 h-4 rounded-full border-4" style={{ backgroundColor: theme.backgroundColor, borderColor: theme.primaryColor }} />
                <div className="w-full md:w-5/12 bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-4 mb-3">
                     {exp.logo_url && <img src={exp.logo_url} alt={exp.company} className="w-12 h-12 rounded-xl object-cover bg-white/10" />}
                     <div>
                       <h3 className="text-lg font-bold text-white">{exp.role}</h3>
                       <p className="text-sm font-medium" style={{ color: theme.accentColor }}>{exp.company}</p>
                     </div>
                  </div>
                  <p className="text-sm text-zinc-500 mb-4">{fmtDate(exp.start_date)} — {exp.current ? "Present" : fmtDate(exp.end_date)}</p>
                  {exp.description && <p className="text-sm text-zinc-400 leading-relaxed mb-4">{exp.description}</p>}
                  {exp.tech_stack && exp.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {exp.tech_stack.map(t => (
                        <span key={t} className="px-2.5 py-1 rounded-md text-xs font-mono" style={{ backgroundColor: `${theme.primaryColor}20`, color: theme.accentColor }}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SystemProjectsBlock({ data, theme, block }: { data: PortfolioData; theme: any; block: CanvasBlock }) {
  const { projects } = data;
  if (!projects || projects.length === 0) return null;
  const title = getDataText(block, "title", "Featured Projects");
  const subtitle = getDataText(block, "subtitle", "Some things I've built");
  return (
    <section id="projects" className={`${getBlockClasses(block)} border-t`} style={{ ...applyBlockStyles(block), borderColor: `${theme.primaryColor}10` }}>
      <div className={`${getContainerWidth(block, "max-w-6xl")} mx-auto px-6`}>
         <ModernSectionHeader title={title} subtitle={subtitle} color={theme.primaryColor} />
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(proj => (
              <div key={proj.id} className="group relative flex flex-col justify-between rounded-2xl border bg-white/5 overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl" style={{ borderColor: `${theme.primaryColor}20` }}>
                {proj.image_url ? (
                  <div className="h-48 overflow-hidden">
                    <img src={proj.image_url} alt={proj.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center bg-white/5">
                    <Globe className="w-12 h-12 opacity-20" />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-[var(--primary)] transition-colors" style={{ '--primary': theme.primaryColor } as React.CSSProperties}>{proj.title}</h3>
                    <div className="flex gap-3">
                      {proj.github_url && <a href={proj.github_url} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>}
                      {proj.live_url && <a href={proj.live_url} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors"><ExternalLink className="w-5 h-5" /></a>}
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-6 flex-1">{proj.description}</p>
                  {proj.tech_stack && proj.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {proj.tech_stack.map(t => (
                        <span key={t} className="text-xs font-mono" style={{ color: theme.accentColor }}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
         </div>
      </div>
    </section>
  );
}

export function SystemSkillsBlock({ data, theme, block }: { data: PortfolioData; theme: any; block: CanvasBlock }) {
  const { skills } = data;
  if (!skills || skills.length === 0) return null;
  const title = getDataText(block, "title", "Skills & Tools");
  const subtitle = getDataText(block, "subtitle", "My technical toolkit");
  const selectedCategories = (block.data?.categories as string[] | undefined)?.map((item) => item.toLowerCase()) ?? [];
  const filteredSkills = selectedCategories.length > 0
    ? skills.filter((item) => selectedCategories.includes(item.category.toLowerCase()))
    : skills;
  return (
    <section id="skills" className={`${getBlockClasses(block)} border-t`} style={{ ...applyBlockStyles(block), borderColor: `${theme.primaryColor}10`, backgroundColor: block.style?.backgroundColor || `${theme.primaryColor}03` }}>
      <div className={`${getContainerWidth(block)} mx-auto px-6`}>
        <ModernSectionHeader title={title} subtitle={subtitle} color={theme.primaryColor} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredSkills.map(cat => (
            <div key={cat.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
                 {cat.category}
              </h4>
              <div className="flex flex-wrap gap-2">
                {cat.items.map(skill => (
                  <span key={skill} className="px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors hover:bg-white/10" style={{ borderColor: `${theme.primaryColor}30`, color: theme.accentColor, backgroundColor: `${theme.primaryColor}10` }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SystemEducationBlock({ data, theme, block }: { data: PortfolioData; theme: any; block: CanvasBlock }) {
  const { education } = data;
  if (!education || education.length === 0) return null;
  const title = getDataText(block, "title", "Education");
  const subtitle = getDataText(block, "subtitle", "Where I learned my craft");
  return (
    <section id="education" className={`${getBlockClasses(block)} border-t`} style={{ ...applyBlockStyles(block), borderColor: `${theme.primaryColor}10` }}>
      <div className={`${getContainerWidth(block)} mx-auto px-6`}>
        <ModernSectionHeader title={title} subtitle={subtitle} color={theme.primaryColor} />
        <div className="space-y-6">
          {education.map(edu => (
            <div key={edu.id} className="flex flex-col md:flex-row gap-6 bg-white/5 border border-white/10 rounded-2xl p-6">
              {edu.logo_url && <img src={edu.logo_url} alt={edu.institution} className="w-16 h-16 rounded-xl object-cover bg-white/10 shrink-0" />}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">{edu.institution}</h3>
                  <span className="text-sm font-medium px-3 py-1 rounded-full bg-white/10 text-zinc-300 w-fit mt-2 md:mt-0">
                    {fmtDate(edu.start_date)} — {edu.current ? "Present" : fmtDate(edu.end_date)}
                  </span>
                </div>
                <p className="text-lg mb-4" style={{ color: theme.accentColor }}>{edu.degree}{edu.field_of_study ? ` in ${edu.field_of_study}` : ""}</p>
                {edu.gpa && <p className="text-sm font-mono text-zinc-400 mb-4 border border-zinc-700 w-fit px-2 py-1 rounded">GPA: {edu.gpa}</p>}
                {edu.description && <p className="text-base text-zinc-400 leading-relaxed">{edu.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SystemContactBlock({ data, theme, block }: { data: PortfolioData; theme: any; block: CanvasBlock }) {
  const { personal } = data;
  if (!personal) return null;
  const title = getDataText(block, "title", "Let's Work Together");
  const description = getDataText(
    block,
    "description",
    "I'm currently looking for new opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!",
  );
  const buttonText = getDataText(block, "buttonText", "Say Hello");
  return (
    <footer id="contact" className={`${getBlockClasses(block, "py-24")} border-t relative overflow-hidden`} style={{ ...applyBlockStyles(block), borderColor: `${theme.primaryColor}20`, backgroundColor: block.style?.backgroundColor || `${theme.primaryColor}05` }}>
       <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] opacity-10 blur-[120px] pointer-events-none"
        style={{ background: `radial-gradient(circle, ${theme.primaryColor} 0%, transparent 60%)` }}
       />
       <div className={`${getContainerWidth(block)} mx-auto px-6 relative z-10 text-center`}>
         <h2 className="text-4xl font-extrabold text-white mb-6">{title}</h2>
         <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">{description}</p>
         {personal.email && (
           <a href={`mailto:${personal.email}`} className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-transform hover:scale-105" style={{ backgroundColor: theme.primaryColor, color: "#fff" }}>
             <Mail className="w-5 h-5" /> {buttonText}
           </a>
         )}
         <div className="flex flex-wrap justify-center gap-6 mt-16 pt-8 border-t border-white/10 text-sm text-zinc-500">
            {personal.phone && <span className="flex items-center gap-2"><Phone className="w-4 h-4" />{personal.phone}</span>}
            {personal.location && <span className="flex items-center gap-2"><MapPin className="w-4 h-4" />{personal.location}</span>}
            {personal.website && <span className="flex items-center gap-2"><Globe className="w-4 h-4" />{personal.website}</span>}
         </div>
       </div>
    </footer>
  );
}

/* ── Custom Elements ────────────────────────────────────────── */
export function TextBlock({ block, theme }: { block: CanvasBlock; theme: any }) {
  return (
    <div className={getBlockClasses(block, "py-8")} style={applyBlockStyles(block)}>
      <div className={`${getContainerWidth(block)} mx-auto px-6 text-zinc-300 leading-relaxed whitespace-pre-wrap`}>
        {(block.data?.content as string) || "Text block content goes here."}
      </div>
    </div>
  );
}
export function SpacerBlock({ block }: { block: CanvasBlock }) {
  return <div style={{ height: block.style?.padding || "64px" }} />;
}
export function DividerBlock({ block, theme }: { block: CanvasBlock; theme: any }) {
  return (
    <div className={getBlockClasses(block, "py-8")} style={applyBlockStyles(block)}>
      <div className={`${getContainerWidth(block)} mx-auto px-6`}>
        <hr style={{ borderColor: `${theme.primaryColor}20` }} />
      </div>
    </div>
  );
}
export function CustomHeroBlock({ block, theme }: { block: CanvasBlock; theme: any }) {
  const buttonUrl = getDataText(block, "buttonUrl", "#contact");
  return (
    <div className={getBlockClasses(block, "py-32")} style={applyBlockStyles(block)}>
      <div className={`${getContainerWidth(block)} mx-auto px-6 text-center`}>
        <h1 className="text-5xl font-bold text-white mb-4">{(block.data?.title as string) || "Custom Hero Title"}</h1>
        <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">{(block.data?.subtitle as string) || "Add your dynamic subtitle here."}</p>
        <a href={buttonUrl} className="inline-block px-6 py-3 rounded-full font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: theme.primaryColor }}>
          {(block.data?.buttonText as string) || "Call to Action"}
        </a>
      </div>
    </div>
  );
}

export function CustomCodeBlock({ block }: { block: CanvasBlock }) {
  const html = getDataText(block, "html", "<div class='text-zinc-300'>Custom content</div>");
  return (
    <div className={getBlockClasses(block, "py-8")} style={applyBlockStyles(block)}>
      <div className={`${getContainerWidth(block, "max-w-6xl")} mx-auto px-6`}>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}

const BLOCK_RENDERERS: Record<string, React.FC<any>> = {
  "system-personal": SystemPersonalBlock,
  "system-experience": SystemExperienceBlock,
  "system-projects": SystemProjectsBlock,
  "system-skills": SystemSkillsBlock,
  "system-education": SystemEducationBlock,
  "system-contact": SystemContactBlock,
  "text": TextBlock,
  "spacer": SpacerBlock,
  "divider": DividerBlock,
  "custom-hero": CustomHeroBlock,
  "custom-code": CustomCodeBlock,
};

/* ── Render wrapper to optionally pass wrapper elements ───────────────── */
export function RenderBlock({ block, data, theme, navLinks, blockWrapper: Wrapper }: { block: CanvasBlock, data: PortfolioData, theme: any, navLinks: any, blockWrapper?: React.FC<{block: CanvasBlock, children: React.ReactNode}> }) {
  const Component = BLOCK_RENDERERS[block.type];
  if (!Component) return null;
  const content = <Component data={data} theme={theme} navLinks={navLinks} block={block} />;
  return Wrapper ? <Wrapper block={block}>{content}</Wrapper> : content;
}

/* ── Block Wrapper for Drag & Drop ──────────────────────────── */
export function SortableBlockItem({ id, children, active }: { id: string, children: React.ReactNode, active?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: active ? 50 : "auto",
  };
  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag handle */}
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute top-2 left-2 z-50 bg-black/50 p-2 rounded opacity-0 group-hover:opacity-100 cursor-grab text-white"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      {children}
    </div>
  );
}
