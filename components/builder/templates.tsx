import React from "react";
import { Mail, MapPin, Phone, Github, Linkedin, ExternalLink } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { BuilderConfig } from "@/lib/builder-types";
import type { PortfolioData } from "@/lib/portfolio-types";
import { getSectionNavLinks, fmtDate } from "./utils";
import { RenderBlock, SortableBlockItem } from "./blocks";

/* ── Template: Modern (Web Portfolio Style) ────────────────────── */
export function ModernTemplate({ 
  data, 
  config, 
  isEditable, 
  onConfigChange,
  activeBlockId,
  onBlockSelect
}: { 
  data: PortfolioData; 
  config: BuilderConfig;
  isEditable?: boolean;
  onConfigChange?: (c: BuilderConfig) => void;
  activeBlockId?: string | null;
  onBlockSelect?: (id: string | null) => void;
}) {
  const { personal } = data;
  const { theme, blocks = [] } = config;
  const navLinks = getSectionNavLinks(config);
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && onConfigChange) {
      const oldIndex = blocks.findIndex(b => b.id === active.id);
      const newIndex = blocks.findIndex(b => b.id === over.id);
      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      onConfigChange({ ...config, blocks: newBlocks });
    }
  }

  const renderBlocks = () => {
    return blocks.map((block) => {
      const isSelected = activeBlockId === block.id;
      const content = (
        <div 
          onClick={(e) => {
            if (isEditable && onBlockSelect) {
              e.stopPropagation();
              onBlockSelect(block.id);
            }
          }}
          className={`transition-all ${isEditable && isSelected ? 'ring-2 ring-[#6366f1] ring-offset-2 ring-offset-[#06060a] rounded-lg relative z-10 mx-2' : isEditable ? 'hover:ring-1 hover:ring-white/20 rounded-lg mx-2 cursor-pointer relative z-0' : ''}`}
        >
          <RenderBlock key={block.id} block={block} data={data} theme={theme} navLinks={navLinks} />
        </div>
      );
      if (isEditable) {
        return <SortableBlockItem key={block.id} id={block.id} active={isSelected}>{content}</SortableBlockItem>;
      }
      return content;
    });
  };

  const templateContent = (
    <div
      className="w-full min-h-screen font-sans relative scroll-smooth"
      style={{
        backgroundColor: theme.backgroundColor,
        color: "#e4e4e7",
        fontFamily: theme.fontFamily,
        fontSize: `${theme.fontSize}px`,
      }}
    >
      {/* Dynamic Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b" style={{ borderColor: `${theme.primaryColor}20`, backgroundColor: `${theme.backgroundColor}CC` }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight text-white">
            {personal?.full_name?.split(" ")[0] || "Portfolio"}<span style={{ color: theme.primaryColor }}>.</span>
          </span>
          <div className="hidden md:flex items-center gap-6">
            {navLinks.filter(l => l.id !== 'personal').map((link) => (
              <a key={link.id} href={`#${link.id}`} className="text-sm font-medium hover:text-white transition-colors" style={{ color: theme.accentColor }}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Dynamic Blocks Container */}
      <div className="pt-16">
        {isEditable ? (
           <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
              {renderBlocks()}
           </SortableContext>
        ) : (
           renderBlocks()
        )}
      </div>
    </div>
  );

  if (isEditable) {
    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {templateContent}
      </DndContext>
    );
  }

  return templateContent;
}

/* ── Template: Minimal ────────────────────────────────────────── */
export function MinimalTemplate({ 
  data, config, isEditable, onConfigChange, activeBlockId, onBlockSelect 
}: { 
  data: PortfolioData; config: BuilderConfig;
  isEditable?: boolean;
  onConfigChange?: (c: BuilderConfig) => void;
  activeBlockId?: string | null;
  onBlockSelect?: (id: string | null) => void;
}) {
  const { personal, experience, education, projects, skills } = data;
  const { theme, blocks = [] } = config;
  const visible = (id: string) => blocks.some(b => b.type === `system-${id}`);

  return (
    <div className="w-full min-h-screen font-sans px-8 py-10" style={{ backgroundColor: theme.backgroundColor, color: "#e4e4e7", fontFamily: theme.fontFamily }}>
      {visible("personal") && personal && (
        <div className="border-b pb-6 mb-8" style={{ borderColor: `${theme.primaryColor}30` }}>
          <h1 className="text-2xl font-bold text-white">{personal.full_name}</h1>
          {personal.title && <p className="text-sm mt-1" style={{ color: theme.primaryColor }}>{personal.title}</p>}
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-zinc-500">
            {personal.email && <span>{personal.email}</span>}
            {personal.location && <span>{personal.location}</span>}
            {personal.website && <span>{personal.website}</span>}
            {personal.github_url && <a href={personal.github_url} target="_blank" rel="noopener noreferrer" className="hover:text-white">GitHub</a>}
            {personal.linkedin_url && <a href={personal.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-white">LinkedIn</a>}
          </div>
          {personal.bio && <p className="text-sm text-zinc-400 mt-3 leading-relaxed max-w-2xl">{personal.bio}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {visible("experience") && experience && experience.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: theme.primaryColor }}>Experience</h2>
              <div className="space-y-5">
                {experience.map(exp => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-white text-sm">{exp.role}</p>
                        <p className="text-xs text-zinc-400">{exp.company}</p>
                      </div>
                      <p className="text-xs text-zinc-600 shrink-0 ml-2">{fmtDate(exp.start_date)} – {exp.current ? "Now" : fmtDate(exp.end_date)}</p>
                    </div>
                    {exp.description && <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {visible("projects") && projects && projects.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: theme.primaryColor }}>Projects</h2>
              <div className="space-y-4">
                {projects.map(proj => (
                  <div key={proj.id}>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white text-sm">{proj.title}</p>
                      {proj.live_url && <a href={proj.live_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3 h-3 text-zinc-500 hover:text-white" /></a>}
                      {proj.github_url && <a href={proj.github_url} target="_blank" rel="noopener noreferrer"><Github className="w-3 h-3 text-zinc-500 hover:text-white" /></a>}
                    </div>
                    {proj.description && <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{proj.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {visible("education") && education && education.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: theme.primaryColor }}>Education</h2>
              <div className="space-y-4">
                {education.map(edu => (
                  <div key={edu.id}>
                    <p className="font-medium text-white text-sm">{edu.institution}</p>
                    <p className="text-xs text-zinc-400">{edu.degree}</p>
                    <p className="text-xs text-zinc-600">{fmtDate(edu.start_date)} – {edu.current ? "Now" : fmtDate(edu.end_date)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {visible("skills") && skills && skills.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: theme.primaryColor }}>Skills</h2>
              <div className="space-y-3">
                {skills.map(cat => (
                  <div key={cat.id}>
                    <p className="text-xs text-zinc-500 mb-1.5">{cat.category}</p>
                    <div className="flex flex-wrap gap-1">
                      {cat.items.map(sk => (
                        <span key={sk} className="text-[10px] px-2 py-0.5 rounded border" style={{ borderColor: `${theme.primaryColor}30`, color: "#a1a1aa" }}>{sk}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Template: Classic ───────────────────────────────────────── */
export function ClassicTemplate({ 
  data, config, isEditable, onConfigChange, activeBlockId, onBlockSelect 
}: { 
  data: PortfolioData; config: BuilderConfig;
  isEditable?: boolean;
  onConfigChange?: (c: BuilderConfig) => void;
  activeBlockId?: string | null;
  onBlockSelect?: (id: string | null) => void;
}) {
  const { personal, experience, education, projects, skills } = data;
  const { theme, blocks = [] } = config;
  const visible = (id: string) => blocks.some(b => b.type === `system-${id}`);

  return (
    <div className="w-full min-h-screen font-sans" style={{ backgroundColor: theme.backgroundColor, color: "#e4e4e7" }}>
      {/* Sidebar layout */}
      <div className="flex min-h-screen">
        {/* Left sidebar */}
        <div className="w-72 shrink-0 min-h-screen px-6 py-10 space-y-8 fixed left-0 top-0 overflow-y-auto" style={{ backgroundColor: `${theme.primaryColor}15`, borderRight: `1px solid ${theme.primaryColor}20` }}>
          {visible("personal") && personal && (
            <div className="text-center">
              {personal.avatar_url && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={personal.avatar_url} alt={personal.full_name} className="w-20 h-20 rounded-full object-cover mx-auto mb-4 ring-2" style={{ "--tw-ring-color": theme.primaryColor } as React.CSSProperties} />
              )}
              <h1 className="font-bold text-white text-xl leading-tight">{personal.full_name}</h1>
              {personal.title && <p className="text-sm mt-1 font-medium" style={{ color: theme.primaryColor }}>{personal.title}</p>}
            </div>
          )}
          
          <nav className="flex flex-col gap-2">
             {getSectionNavLinks(config).map((link: { id: string; label: string }) => (
                 <a key={link.id} href={`#${link.id}`} className="text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/5 transition-colors" style={{ color: theme.accentColor }}>
                     {link.label}
                 </a>
             ))}
          </nav>

          {visible("contact") && personal && (
            <div>
              <div className="w-12 h-0.5 mb-6" style={{ backgroundColor: theme.primaryColor }} />
              <div className="space-y-3 text-sm text-zinc-400">
                {personal.email && <div className="flex items-center gap-3"><Mail className="w-4 h-4 shrink-0" style={{ color: theme.primaryColor }} />{personal.email}</div>}
                {personal.phone && <div className="flex items-center gap-3"><Phone className="w-4 h-4 shrink-0" style={{ color: theme.primaryColor }} />{personal.phone}</div>}
                {personal.location && <div className="flex items-center gap-3"><MapPin className="w-4 h-4 shrink-0" style={{ color: theme.primaryColor }} />{personal.location}</div>}
              </div>
              
              <div className="flex gap-4 mt-8">
                 {personal.github_url && <a href={personal.github_url} className="hover:text-white transition-colors"><Github className="w-4 h-4" /></a>}
                 {personal.linkedin_url && <a href={personal.linkedin_url} className="hover:text-white transition-colors"><Linkedin className="w-4 h-4" /></a>}
              </div>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 ml-72 px-12 py-16 space-y-24 scroll-smooth">
          {visible("personal") && personal && personal.bio && (
             <section id="personal" className="max-w-3xl">
                <h2 className="text-4xl font-light mb-6">About Me</h2>
                <p className="text-xl text-zinc-400 leading-relaxed font-light">{personal.bio}</p>
             </section>
          )}
        
          {visible("experience") && experience && experience.length > 0 && (
            <section id="experience" className="max-w-4xl">
              <h2 className="text-3xl font-light mb-8">Work Experience</h2>
              <div className="space-y-10">
                {experience.map(exp => (
                  <div key={exp.id} className="pl-6 border-l" style={{ borderColor: `${theme.primaryColor}50` }}>
                    <p className="font-semibold text-white text-xl">{exp.role}</p>
                    <p className="text-base mt-1" style={{ color: theme.accentColor }}>{exp.company}</p>
                    <p className="text-sm text-zinc-500 font-mono mt-1">{fmtDate(exp.start_date)} – {exp.current ? "Present" : fmtDate(exp.end_date)}</p>
                    {exp.description && <p className="text-base text-zinc-400 mt-4 leading-relaxed">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {visible("projects") && projects && projects.length > 0 && (
            <section id="projects" className="max-w-4xl">
              <h2 className="text-3xl font-light mb-8">Projects</h2>
              <div className="grid grid-cols-1 gap-8">
                {projects.map(proj => (
                  <div key={proj.id} className="p-8 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-4 mb-2">
                      <p className="font-bold text-white text-xl">{proj.title}</p>
                      {proj.live_url && <a href={proj.live_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-5 h-5 text-zinc-500 hover:text-white" /></a>}
                      {proj.github_url && <a href={proj.github_url} target="_blank" rel="noopener noreferrer"><Github className="w-5 h-5 text-zinc-500 hover:text-white" /></a>}
                    </div>
                    {proj.tech_stack && proj.tech_stack.length > 0 && (
                        <p className="text-sm font-mono mb-6" style={{ color: theme.accentColor }}>{proj.tech_stack.join(" · ")}</p>
                    )}
                    <p className="text-base text-zinc-400 leading-relaxed max-w-2xl">{proj.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {visible("education") && education && education.length > 0 && (
            <section id="education" className="max-w-4xl">
              <h2 className="text-3xl font-light mb-8">Education</h2>
              <div className="space-y-8">
                {education.map(edu => (
                  <div key={edu.id} className="pl-6 border-l" style={{ borderColor: `${theme.primaryColor}50` }}>
                    <p className="font-semibold text-white text-xl">{edu.institution}</p>
                    <p className="text-base mt-1" style={{ color: theme.accentColor }}>{edu.degree}{edu.field_of_study ? ` — ${edu.field_of_study}` : ""}</p>
                    <p className="text-sm text-zinc-500 font-mono mt-1">{fmtDate(edu.start_date)} – {edu.current ? "Present" : fmtDate(edu.end_date)}</p>
                    {edu.description && <p className="text-base text-zinc-400 mt-3">{edu.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {visible("skills") && skills && skills.length > 0 && (
            <section id="skills" className="max-w-4xl">
              <h2 className="text-3xl font-light mb-8">Skills</h2>
              <div className="space-y-8">
                {skills.map(cat => (
                  <div key={cat.id}>
                    <p className="text-sm uppercase tracking-widest text-zinc-600 font-bold mb-4">{cat.category}</p>
                    <div className="flex flex-wrap gap-2">
                      {cat.items.map(sk => (
                          <span key={sk} className="text-sm px-4 py-2 rounded-lg bg-white/5 text-zinc-300 font-medium">
                              {sk}
                          </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          
        </div>
      </div>
    </div>
  );
}
