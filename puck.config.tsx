import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ProjectData, SkillCategory, PersonalInfo, ExperienceData, EducationData } from "@/src/types/portfolio";
import type { Config } from "@measured/puck";
import { ExternalLink, GraduationCap, Github, Linkedin, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Star, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

/* ─── Root Props ────────────────────────────────────── */
export type CustomRootProps = {
  bgColor: string;
  accentColor: string;
  customCss?: string;
};

/* ─── Component Types ───────────────────────────────── */
export type UserConfig = {
  Hero: { title: string; subtitle: string; description: string; align: "left" | "center"; bgStyle: "solid" | "glow" | "gradient"; showStats: boolean };
  Heading: { text: string; align: "left" | "center" | "right"; size: "sm" | "md" | "lg" | "xl"; color: "default" | "accent" | "muted" };
  Text: { content: string; align: "left" | "center" | "right"; size: "sm" | "md" | "lg" };
  CustomHTML: { code: string };
  ProjectsGrid: { limit: number; showFeaturedOnly: boolean; columns: "2" | "3" | "4"; showLinks: boolean };
  SkillsDisplay: { layout: "grid" | "list" | "cloud" };
  ExperienceTimeline: { title: string };
  EducationList: { title: string };
  FastWorkCTA: { displayTitle: string; username: string };
  Spacer: { height: number };
  Divider: { style: "solid" | "dashed" | "gradient" | "none" };
  CallToAction: { title: string; subtitle: string; buttonText: string; buttonUrl: string; variant: "default" | "outlined" | "gradient" };
  SocialLinks: { title: string; layout: "horizontal" | "vertical" | "grid" };
  StatsCounter: { title: string; stats: { label: string; value: string; icon: string }[] };
  TwoColumn: { leftContent: string; rightContent: string; gap: "sm" | "md" | "lg"; ratio: "1/1" | "1/2" | "2/1" };
  VideoEmbed: { url: string; caption: string; aspectRatio: "16/9" | "4/3" | "1/1" };
  Testimonials: { title: string; limit: number; layout: "grid" | "carousel" };
  Services: { title: string; columns: "2" | "3" };
  ContactSection: { title: string; showEmail: boolean; showPhone: boolean; showLocation: boolean; showSocial: boolean };
  ContactForm: { title: string; subtitle: string; buttonText: string; successMessage: string };
};

/* ─── Helpers ───────────────────────────────────────── */
function usePersonal() {
  const [data, setData] = useState<PersonalInfo | null>(null);
  useEffect(() => {
    createClient().from("portfolio_personal").select("*").single().then(({ data: d }) => setData(d));
  }, []);
  return data;
}

const SOCIAL_ICONS: Record<string, React.ElementType> = {
  github: Github, linkedin: Linkedin, twitter: Twitter,
  instagram: Instagram, youtube: Youtube, email: Mail,
};

function SectionWrapper({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`w-full bg-[var(--app-bg)] ${className}`}>{children}</div>;
}

/* ─── Puck Config ───────────────────────────────────── */
export const config: Config<UserConfig, CustomRootProps> = {
  root: {
    fields: {
      bgColor: { 
        type: "custom", 
        render: ({ value, onChange }) => (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500">Background Color</label>
            <div className="flex gap-2">
              <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
              <input type="text" value={value} onChange={e => onChange(e.target.value)} className="flex-1 bg-gray-50 border border-gray-200 rounded px-2 text-sm" />
            </div>
          </div>
        )
      },
      accentColor: { 
        type: "custom", 
        render: ({ value, onChange }) => (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500">Accent Color</label>
            <div className="flex gap-2">
              <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
              <input type="text" value={value} onChange={e => onChange(e.target.value)} className="flex-1 bg-gray-50 border border-gray-200 rounded px-2 text-sm" />
            </div>
          </div>
        )
      },
      customCss: { type: "textarea", label: "Custom CSS" },
    },
    defaultProps: { bgColor: "#000000", accentColor: "#6366f1", customCss: "" },
    render: ({ bgColor, accentColor, customCss, children }) => (
      <div className="font-sans antialiased text-[#fafafa] min-h-screen"
        style={{ backgroundColor: bgColor, "--app-bg": bgColor, "--app-accent": accentColor } as React.CSSProperties}>
        {customCss && <style dangerouslySetInnerHTML={{ __html: customCss }} />}
        {children}
      </div>
    ),
  },

  categories: {
    layout:     { components: ["Spacer", "Divider", "TwoColumn"] },
    typography: { components: ["Heading", "Text"] },
    media:      { components: ["VideoEmbed", "CustomHTML"] },
    portfolio:  { components: ["Hero", "ProjectsGrid", "SkillsDisplay", "ExperienceTimeline", "EducationList"] },
    engagement: { components: ["CallToAction", "SocialLinks", "StatsCounter", "Testimonials", "Services", "ContactSection", "ContactForm", "FastWorkCTA"] },
  },

  components: {
    /* ─── HERO ─────────────────────────────────────── */
    Hero: {
      fields: {
        title:       { type: "text",     label: "Override Nama" },
        subtitle:    { type: "text",     label: "Override Role" },
        description: { type: "textarea", label: "Override Bio" },
        align:    { type: "radio", options: [{ label: "Kiri", value: "left" }, { label: "Tengah", value: "center" }] },
        bgStyle:  { type: "radio", options: [{ label: "Solid", value: "solid" }, { label: "Glow", value: "glow" }, { label: "Gradient", value: "gradient" }] },
        showStats: { type: "radio", options: [{ label: "Ya", value: true }, { label: "Tidak", value: false }] },
      },
      defaultProps: { title: "", subtitle: "", description: "", align: "center", bgStyle: "glow", showStats: true },
      render: ({ title, subtitle, description, align, bgStyle, showStats }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const personal = usePersonal();
        const displayTitle = title || personal?.name || "Your Name";
        const displaySub   = subtitle || personal?.role || "Your Role";
        const displayDesc  = description || personal?.bio_short || "Your short bio...";
        return (
          <SectionWrapper>
            <div className={`relative px-6 py-24 ${align === "center" ? "text-center" : "text-left"} overflow-hidden`}>
              {bgStyle === "glow" && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] blur-[120px] rounded-full pointer-events-none opacity-15" style={{ backgroundColor: "var(--app-accent)" }} />}
              {bgStyle === "gradient" && <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(ellipse at 50% 0%, var(--app-accent), transparent 70%)` }} />}
              <div className="relative z-10 max-w-4xl mx-auto">
                {personal?.avatar && (
                  <div className={`mb-8 ${align === "center" ? "flex justify-center" : ""}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={personal.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover ring-4 ring-[var(--app-accent)]/20" />
                  </div>
                )}
                {personal?.open_to_work && (
                  <div className={`mb-4 ${align === "center" ? "flex justify-center" : ""}`}>
                    <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border" style={{ borderColor: "var(--app-accent)", color: "var(--app-accent)", background: "color-mix(in srgb, var(--app-accent) 10%, transparent)" }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      {personal.availability_text ?? "Available for hire"}
                    </span>
                  </div>
                )}
                <p className="font-bold mb-4 tracking-wider uppercase text-sm" style={{ color: "var(--app-accent)" }}>{displaySub}</p>
                <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-none">{displayTitle}</h1>
                <p className="text-[#a1a1aa] text-lg md:text-xl max-w-2xl leading-relaxed mx-auto mb-8">{displayDesc}</p>
                {showStats && personal && (
                  <div className={`flex gap-8 mt-8 ${align === "center" ? "justify-center" : ""}`}>
                    {personal.years_of_exp ? <div className="text-center"><p className="text-2xl font-black text-white">{personal.years_of_exp}+</p><p className="text-xs text-[#6a6a8a] mt-1">Years Exp</p></div> : null}
                    {personal.projects_completed ? <div className="text-center"><p className="text-2xl font-black text-white">{personal.projects_completed}+</p><p className="text-xs text-[#6a6a8a] mt-1">Projects</p></div> : null}
                  </div>
                )}
              </div>
            </div>
          </SectionWrapper>
        );
      },
    },

    /* ─── HEADING ───────────────────────────────────── */
    Heading: {
      fields: {
        text:  { type: "text",  label: "Teks" },
        align: { type: "radio", options: [{ label: "L", value: "left" }, { label: "C", value: "center" }, { label: "R", value: "right" }] },
        size:  { type: "radio", options: [{ label: "S", value: "sm" }, { label: "M", value: "md" }, { label: "L", value: "lg" }, { label: "XL", value: "xl" }] },
        color: { type: "radio", options: [{ label: "Default", value: "default" }, { label: "Accent", value: "accent" }, { label: "Muted", value: "muted" }] },
      },
      defaultProps: { text: "Section Title", align: "left", size: "md", color: "default" },
      render: ({ text, align, size, color }) => {
        const sizes = { sm: "text-2xl", md: "text-4xl", lg: "text-5xl", xl: "text-7xl" };
        const colors = { default: "text-white", accent: "var(--app-accent)", muted: "#a1a1aa" };
        return (
          <SectionWrapper>
            <div className="py-8 px-6 max-w-6xl mx-auto" style={{ textAlign: align }}>
              <h2 className={`${sizes[size]} font-black tracking-tight`} style={{ color: colors[color] === "text-white" ? "white" : colors[color] }}>{text}</h2>
            </div>
          </SectionWrapper>
        );
      },
    },

    /* ─── TEXT ──────────────────────────────────────── */
    Text: {
      fields: {
        content: { type: "textarea", label: "Konten" },
        align:   { type: "radio", options: [{ label: "L", value: "left" }, { label: "C", value: "center" }, { label: "R", value: "right" }] },
        size:    { type: "radio", options: [{ label: "Kecil", value: "sm" }, { label: "Normal", value: "md" }, { label: "Besar", value: "lg" }] },
      },
      defaultProps: { content: "Teks Anda di sini...", align: "left", size: "md" },
      render: ({ content, align, size }) => {
        const sizes = { sm: "text-sm", md: "text-base", lg: "text-lg" };
        return (
          <SectionWrapper>
            <div className="py-4 px-6 max-w-4xl mx-auto" style={{ textAlign: align }}>
              <p className={`${sizes[size]} text-[#a1a1aa] leading-relaxed whitespace-pre-wrap`}>{content}</p>
            </div>
          </SectionWrapper>
        );
      },
    },

    /* ─── CUSTOM HTML ───────────────────────────────── */
    CustomHTML: {
      fields: { code: { type: "textarea", label: "HTML Code" } },
      defaultProps: { code: '<div style="padding: 2rem; text-align: center; border: 2px dashed #333;">\n  <h3>Custom HTML</h3>\n</div>' },
      render: ({ code }) => <div className="w-full bg-[var(--app-bg)]" dangerouslySetInnerHTML={{ __html: code }} />,
    },

    /* ─── SPACER ────────────────────────────────────── */
    Spacer: {
      fields: { height: { type: "number", label: "Tinggi (px)" } },
      defaultProps: { height: 64 },
      render: ({ height }) => <div style={{ height, background: "var(--app-bg)" }} className="w-full" aria-hidden />,
    },

    /* ─── DIVIDER ───────────────────────────────────── */
    Divider: {
      fields: { style: { type: "radio", options: [{ label: "Solid", value: "solid" }, { label: "Dashed", value: "dashed" }, { label: "Gradient", value: "gradient" }, { label: "None", value: "none" }] } },
      defaultProps: { style: "gradient" },
      render: ({ style }) => (
        <SectionWrapper>
          <div className="px-6 py-4 max-w-6xl mx-auto">
            {style === "none" ? null : style === "gradient"
              ? <div className="h-px w-full" style={{ background: `linear-gradient(to right, transparent, var(--app-accent), transparent)` }} />
              : <hr className="border-0 border-t h-px border-[#1e1e2e]" style={{ borderStyle: style === "dashed" ? "dashed" : "solid" }} />
            }
          </div>
        </SectionWrapper>
      ),
    },

    /* ─── CALL TO ACTION ────────────────────────────── */
    CallToAction: {
      fields: {
        title:      { type: "text",  label: "Judul" },
        subtitle:   { type: "text",  label: "Sub Judul" },
        buttonText: { type: "text",  label: "Teks Button" },
        buttonUrl:  { type: "text",  label: "URL Button" },
        variant:    { type: "radio", options: [{ label: "Default", value: "default" }, { label: "Outlined", value: "outlined" }, { label: "Gradient", value: "gradient" }] },
      },
      defaultProps: { title: "Ready to collab?", subtitle: "Hubungi saya untuk proyek Anda.", buttonText: "Hubungi Saya", buttonUrl: "#contact", variant: "default" },
      render: ({ title, subtitle, buttonText, buttonUrl, variant }) => (
        <SectionWrapper>
          <div className="py-20 px-6 max-w-3xl mx-auto text-center">
            <div className={`p-10 rounded-2xl relative overflow-hidden border ${variant === "outlined" ? "border-[var(--app-accent)] bg-transparent" : "border-[#1e1e2e] bg-[#0d0d14]"}`}>
              {variant === "gradient" && <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(ellipse at 50% 100%, var(--app-accent), transparent 70%)` }} />}
              <h2 className="text-3xl font-black text-white mb-3 relative z-10">{title}</h2>
              <p className="text-[#a1a1aa] mb-8 relative z-10">{subtitle}</p>
              <a href={buttonUrl} className="inline-flex items-center gap-2 font-semibold px-8 py-3.5 rounded-xl text-white transition-all hover:scale-105 relative z-10"
                style={{ background: variant === "outlined" ? "transparent" : "var(--app-accent)", border: variant === "outlined" ? `2px solid var(--app-accent)` : "none", color: "white" }}>
                {buttonText} <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </SectionWrapper>
      ),
    },

    /* ─── SOCIAL LINKS ──────────────────────────────── */
    SocialLinks: {
      fields: {
        title:  { type: "text",  label: "Judul" },
        layout: { type: "radio", options: [{ label: "Horizontal", value: "horizontal" }, { label: "Vertical", value: "vertical" }, { label: "Grid", value: "grid" }] },
      },
      defaultProps: { title: "Find Me Online", layout: "horizontal" },
      render: ({ title, layout }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const personal = usePersonal();
        const socials = [
          { key: "github",    label: "GitHub",    url: personal?.github ? `https://github.com/${personal.github}` : null },
          { key: "linkedin",  label: "LinkedIn",  url: personal?.linkedin },
          { key: "twitter",   label: "Twitter",   url: personal?.twitter },
          { key: "instagram", label: "Instagram", url: personal?.instagram },
          { key: "youtube",   label: "YouTube",   url: personal?.youtube },
          { key: "email",     label: "Email",     url: personal?.email ? `mailto:${personal.email}` : null },
        ].filter(s => s.url);
        return (
          <SectionWrapper>
            <div className="py-12 px-6 max-w-4xl mx-auto">
              {title && <h2 className="text-2xl font-bold text-white mb-8 text-center">{title}</h2>}
              <div className={`${layout === "horizontal" ? "flex flex-wrap justify-center gap-4" : layout === "grid" ? "grid grid-cols-2 md:grid-cols-3 gap-3" : "flex flex-col gap-3 max-w-xs mx-auto"}`}>
                {socials.map(({ key, label, url }) => {
                  const Icon = SOCIAL_ICONS[key] ?? ExternalLink;
                  return (
                    <a key={key} href={url!} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-5 py-3 bg-[#0d0d14] border border-[#1e1e2e] rounded-xl text-[#c2c2df] hover:border-[var(--app-accent)] hover:text-white transition-all group">
                      <Icon className="w-4 h-4 group-hover:text-[var(--app-accent)] transition-colors" style={{ color: "var(--app-accent)" }} />
                      <span className="text-sm font-medium">{label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </SectionWrapper>
        );
      },
    },

    /* ─── STATS COUNTER ─────────────────────────────── */
    StatsCounter: {
      fields: {
        title: { type: "text", label: "Judul" },
        stats: {
          type: "array",
          label: "Stats",
          getItemSummary: (item: { label: string }) => item.label,
          arrayFields: {
            label: { type: "text", label: "Label" },
            value: { type: "text", label: "Nilai" },
            icon:  { type: "text", label: "Emoji Icon" },
          },
        },
      },
      defaultProps: {
        title: "By the Numbers",
        stats: [
          { label: "Projects", value: "50+", icon: "🚀" },
          { label: "Clients", value: "30+", icon: "🤝" },
          { label: "Years Exp", value: "5+", icon: "⚡" },
        ],
      },
      render: ({ title, stats }) => (
        <SectionWrapper>
          <div className="py-16 px-6 max-w-5xl mx-auto">
            {title && <h2 className="text-3xl font-black text-white mb-12 text-center">{title}</h2>}
            <div className={`grid grid-cols-1 md:grid-cols-${Math.min(stats.length, 4)} gap-6`}>
              {stats.map((s, i) => (
                <div key={i} className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-8 text-center hover:border-[var(--app-accent)]/50 transition-all group">
                  <div className="text-4xl mb-4">{s.icon}</div>
                  <p className="text-4xl font-black text-white mb-2 group-hover:text-[var(--app-accent)] transition-colors">{s.value}</p>
                  <p className="text-sm text-[#6a6a8a]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionWrapper>
      ),
    },

    /* ─── TWO COLUMN ────────────────────────────────── */
    TwoColumn: {
      fields: {
        leftContent:  { type: "textarea", label: "Konten Kiri (HTML)" },
        rightContent: { type: "textarea", label: "Konten Kanan (HTML)" },
        gap:   { type: "radio", options: [{ label: "Kecil", value: "sm" }, { label: "Sedang", value: "md" }, { label: "Besar", value: "lg" }] },
        ratio: { type: "radio", options: [{ label: "1:1", value: "1/1" }, { label: "1:2", value: "1/2" }, { label: "2:1", value: "2/1" }] },
      },
      defaultProps: { leftContent: "<p>Kolom kiri</p>", rightContent: "<p>Kolom kanan</p>", gap: "md", ratio: "1/1" },
      render: ({ leftContent, rightContent, gap, ratio }) => {
        const gaps = { sm: "gap-4", md: "gap-8", lg: "gap-16" };
        const ratios = { "1/1": "grid-cols-2", "1/2": "grid-cols-1 md:grid-cols-[1fr_2fr]", "2/1": "grid-cols-1 md:grid-cols-[2fr_1fr]" };
        return (
          <SectionWrapper>
            <div className={`py-12 px-6 max-w-6xl mx-auto grid ${ratios[ratio]} ${gaps[gap]}`}>
              <div className="text-[#a1a1aa]" dangerouslySetInnerHTML={{ __html: leftContent }} />
              <div className="text-[#a1a1aa]" dangerouslySetInnerHTML={{ __html: rightContent }} />
            </div>
          </SectionWrapper>
        );
      },
    },

    /* ─── VIDEO EMBED ───────────────────────────────── */
    VideoEmbed: {
      fields: {
        url:         { type: "text", label: "URL YouTube/Vimeo" },
        caption:     { type: "text", label: "Caption" },
        aspectRatio: { type: "radio", options: [{ label: "16:9", value: "16/9" }, { label: "4:3", value: "4/3" }, { label: "1:1", value: "1/1" }] },
      },
      defaultProps: { url: "", caption: "", aspectRatio: "16/9" },
      render: ({ url, caption, aspectRatio }) => {
        const getEmbedUrl = (raw: string) => {
          const ytMatch = raw.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&\s]+)/);
          if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
          const vimeoMatch = raw.match(/vimeo\.com\/(\d+)/);
          if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
          return raw;
        };
        const ratios = { "16/9": "56.25%", "4/3": "75%", "1/1": "100%" };
        return (
          <SectionWrapper>
            <div className="py-10 px-6 max-w-4xl mx-auto">
              {url ? (
                <div className="rounded-2xl overflow-hidden border border-[#1e1e2e]" style={{ position: "relative", paddingTop: ratios[aspectRatio] }}>
                  <iframe src={getEmbedUrl(url)} className="absolute inset-0 w-full h-full" allow="autoplay; fullscreen" allowFullScreen />
                </div>
              ) : (
                <div className="aspect-video bg-[#0d0d14] border border-dashed border-[#2a2a3a] rounded-2xl flex items-center justify-center">
                  <p className="text-[#4a4a6a] text-sm">Masukkan URL video</p>
                </div>
              )}
              {caption && <p className="text-center text-xs text-[#6a6a8a] mt-3">{caption}</p>}
            </div>
          </SectionWrapper>
        );
      },
    },

    /* ─── TESTIMONIALS ──────────────────────────────── */
    Testimonials: {
      fields: {
        title:  { type: "text",   label: "Judul" },
        limit:  { type: "number", label: "Jumlah", min: 1, max: 12 },
        layout: { type: "radio",  options: [{ label: "Grid", value: "grid" }, { label: "Carousel", value: "carousel" }] },
      },
      defaultProps: { title: "What They Say", limit: 3, layout: "grid" },
      render: ({ title, limit }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [testimonials, setTestimonials] = useState<{ id: string; name: string; role: string; company: string; content: string; rating: number; avatar: string }[]>([]);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          createClient().from("portfolio_testimonials").select("*").eq("is_featured", true).limit(limit).then(({ data }) => setTestimonials(data ?? []));
        }, [limit]);
        return (
          <SectionWrapper>
            <div className="py-16 px-6 max-w-6xl mx-auto">
              {title && <h2 className="text-3xl font-black text-white mb-12 text-center">{title}</h2>}
              {testimonials.length === 0 ? (
                <p className="text-center text-[#4a4a6a] text-sm border border-dashed border-[#1e1e2e] rounded-xl p-8">Belum ada testimonial. Tambahkan lewat dashboard.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {testimonials.map(t => (
                    <div key={t.id} className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-6 hover:border-[var(--app-accent)]/30 transition-all">
                      <div className="flex gap-1 mb-4">
                        {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= t.rating ? "fill-yellow-400 text-yellow-400" : "text-[#2a2a3a]"}`} />)}
                      </div>
                      <p className="text-[#a1a1aa] text-sm leading-relaxed mb-6">&quot;{t.content}&quot;</p>
                      <div className="flex items-center gap-3">
                        {t.avatar
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover" />
                          : <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "var(--app-accent)" }}>{t.name[0]}</div>
                        }
                        <div>
                          <p className="text-sm font-semibold text-white">{t.name}</p>
                          <p className="text-xs text-[#6a6a8a]">{t.role}{t.company && ` @ ${t.company}`}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionWrapper>
        );
      },
    },

    /* ─── SERVICES ──────────────────────────────────── */
    Services: {
      fields: {
        title:   { type: "text",  label: "Judul" },
        columns: { type: "radio", options: [{ label: "2 Kolom", value: "2" }, { label: "3 Kolom", value: "3" }] },
      },
      defaultProps: { title: "What I Offer", columns: "3" },
      render: ({ title, columns }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [services, setServices] = useState<{ id: string; title: string; description: string; icon: string; features: string[]; price_from: string; price_to: string; currency: string }[]>([]);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          createClient().from("portfolio_services").select("*").order("sort_order").then(({ data }) => setServices(data ?? []));
        }, []);
        return (
          <SectionWrapper>
            <div className="py-16 px-6 max-w-6xl mx-auto">
              {title && <h2 className="text-3xl font-black text-white mb-12 text-center">{title}</h2>}
              {services.length === 0 ? (
                <p className="text-center text-[#4a4a6a] text-sm border border-dashed border-[#1e1e2e] rounded-xl p-8">Tambahkan layanan lewat dashboard → Services.</p>
              ) : (
                <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-6`}>
                  {services.map(s => (
                    <div key={s.id} className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-6 hover:border-[var(--app-accent)]/30 transition-all group">
                      <span className="text-3xl mb-4 block">{s.icon}</span>
                      <h3 className="font-bold text-white mb-2 group-hover:text-[var(--app-accent)] transition-colors">{s.title}</h3>
                      <p className="text-sm text-[#6a6a8a] leading-relaxed mb-4">{s.description}</p>
                      {(s.price_from || s.price_to) && (
                        <p className="text-xs font-mono mb-3" style={{ color: "var(--app-accent)" }}>{s.currency} {s.price_from}{s.price_to && ` – ${s.price_to}`}</p>
                      )}
                      {s.features?.length > 0 && (
                        <ul className="space-y-1">
                          {s.features.map((f, i) => <li key={i} className="text-xs text-[#a1a1aa] flex items-center gap-2"><span style={{ color: "var(--app-accent)" }}>✓</span>{f}</li>)}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionWrapper>
        );
      },
    },

    /* ─── CONTACT SECTION ───────────────────────────── */
    ContactSection: {
      fields: {
        title:        { type: "text",  label: "Judul" },
        showEmail:    { type: "radio", options: [{ label: "Ya", value: true }, { label: "Tidak", value: false }] },
        showPhone:    { type: "radio", options: [{ label: "Ya", value: true }, { label: "Tidak", value: false }] },
        showLocation: { type: "radio", options: [{ label: "Ya", value: true }, { label: "Tidak", value: false }] },
        showSocial:   { type: "radio", options: [{ label: "Ya", value: true }, { label: "Tidak", value: false }] },
      },
      defaultProps: { title: "Get In Touch", showEmail: true, showPhone: true, showLocation: true, showSocial: true },
      render: ({ title, showEmail, showPhone, showLocation, showSocial }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const personal = usePersonal();
        const items = [
          showEmail    && personal?.email    && { icon: Mail,    label: "Email",    value: personal.email,    href: `mailto:${personal.email}` },
          showPhone    && personal?.phone    && { icon: Phone,   label: "Phone",    value: personal.phone,    href: `tel:${personal.phone}` },
          showLocation && personal?.location && { icon: MapPin,  label: "Location", value: personal.location, href: null },
        ].filter(Boolean) as { icon: React.ElementType; label: string; value: string; href: string | null }[];
        return (
          <SectionWrapper>
            <div className="py-16 px-6 max-w-4xl mx-auto text-center">
              {title && <h2 className="text-3xl font-black text-white mb-12">{title}</h2>}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {items.map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-5 hover:border-[var(--app-accent)]/30 transition-all">
                    <Icon className="w-5 h-5 mx-auto mb-3" style={{ color: "var(--app-accent)" }} />
                    <p className="text-xs text-[#6a6a8a] mb-1">{label}</p>
                    {href ? <a href={href} className="text-sm font-medium text-[#c2c2df] hover:text-white transition-colors">{value}</a>
                      : <p className="text-sm font-medium text-[#c2c2df]">{value}</p>}
                  </div>
                ))}
              </div>
              {showSocial && personal && (
                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    { key: "github",    url: personal.github    ? `https://github.com/${personal.github}` : null },
                    { key: "linkedin",  url: personal.linkedin },
                    { key: "twitter",   url: personal.twitter },
                    { key: "instagram", url: personal.instagram },
                  ].filter(s => s.url).map(({ key, url }) => {
                    const Icon = SOCIAL_ICONS[key] ?? ExternalLink;
                    return <a key={key} href={url!} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-xl bg-[#0d0d14] border border-[#1e1e2e] flex items-center justify-center text-[#6a6a8a] hover:text-white hover:border-[var(--app-accent)] transition-all">
                      <Icon className="w-4 h-4" />
                    </a>;
                  })}
                </div>
              )}
            </div>
          </SectionWrapper>
        );
      },
    },

    /* ─── CONTACT FORM ──────────────────────────────── */
    ContactForm: {
      fields: {
        title: { type: "text", label: "Judul" },
        subtitle: { type: "text", label: "Sub Judul" },
        buttonText: { type: "text", label: "Teks Tombol" },
        successMessage: { type: "text", label: "Pesan Sukses" },
      },
      defaultProps: {
        title: "Send a Message",
        subtitle: "I'll try to get back to you as soon as possible.",
        buttonText: "Send Message",
        successMessage: "Your message has been sent successfully!",
      },
      render: ({ title, subtitle, buttonText, successMessage }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setStatus("loading");
          try {
            const res = await fetch("/api/contact", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error("Failed");
            setStatus("success");
            setForm({ name: "", email: "", subject: "", message: "" });
            setTimeout(() => setStatus("idle"), 5000);
          } catch (err) {
            console.error(err);
            setStatus("error");
          }
        };

        const InputStyle = "w-full bg-[#12121c] border border-[#1e1e2e] focus:border-[var(--app-accent)] rounded-lg px-4 py-3 text-sm text-[#e2e2ef] placeholder-[#4a4a6a] outline-none transition-all";

        return (
          <SectionWrapper>
            <div className="py-16 px-6 max-w-2xl mx-auto">
              {title && <h2 className="text-3xl font-black text-white mb-2 text-center">{title}</h2>}
              {subtitle && <p className="text-[#6a6a8a] text-center mb-10 text-sm">{subtitle}</p>}
              
              <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-6 md:p-8 relative overflow-hidden">
                {status === "success" ? (
                  <div className="text-center py-10 animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                    <p className="text-[#a1a1aa] text-sm">{successMessage}</p>
                    <button onClick={() => setStatus("idle")} className="mt-8 text-sm text-[var(--app-accent)] hover:underline font-medium">Send another message</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="sr-only">Name</label>
                        <input required type="text" placeholder="Your Name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className={InputStyle} disabled={status === "loading"} />
                      </div>
                      <div>
                        <label className="sr-only">Email</label>
                        <input required type="email" placeholder="Email Address" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} className={InputStyle} disabled={status === "loading"} />
                      </div>
                    </div>
                    <div>
                      <label className="sr-only">Subject</label>
                      <input type="text" placeholder="Subject (Optional)" value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} className={InputStyle} disabled={status === "loading"} />
                    </div>
                    <div>
                      <label className="sr-only">Message</label>
                      <textarea required rows={5} placeholder="Your Message" value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} className={`${InputStyle} resize-none`} disabled={status === "loading"} />
                    </div>
                    
                    {status === "error" && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                        Failed to send message. Please try again.
                      </div>
                    )}
                    
                    <button type="submit" disabled={status === "loading"}
                      className="w-full py-3.5 rounded-lg border-2 text-white font-bold transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
                      style={{ background: "var(--app-accent)", borderColor: "var(--app-accent)", opacity: status === "loading" ? 0.7 : 1 }}>
                      {status === "loading" ? <Loader2 className="w-5 h-5 animate-spin" /> : buttonText}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </SectionWrapper>
        );
      },
    },

    /* ─── PROJECTS GRID ─────────────────────────────── */
    ProjectsGrid: {
      fields: {
        limit:           { type: "number", label: "Jumlah", min: 1, max: 20 },
        showFeaturedOnly: { type: "radio", options: [{ label: "Featured Saja", value: true }, { label: "Semua", value: false }] },
        columns:          { type: "radio", options: [{ label: "2", value: "2" }, { label: "3", value: "3" }, { label: "4", value: "4" }] },
        showLinks:        { type: "radio", options: [{ label: "Ya", value: true }, { label: "Tidak", value: false }] },
      },
      defaultProps: { limit: 6, showFeaturedOnly: false, columns: "3", showLinks: true },
      render: ({ limit, showFeaturedOnly, columns, showLinks }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [projects, setProjects] = useState<ProjectData[]>([]);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          const fetchP = async () => {
            let query = createClient().from("portfolio_projects").select("*").eq("status", "published").order("sort_order").limit(limit);
            if (showFeaturedOnly) query = query.eq("featured", true);
            const { data } = await query;
            if (data) setProjects(data);
          };
          fetchP();
        }, [limit, showFeaturedOnly]);
        return (
          <SectionWrapper>
            <div className="py-12 px-6 max-w-6xl mx-auto">
              {projects.length === 0 ? (
                <p className="text-[#4a4a6a] p-6 border border-dashed border-[#1e1e2e] rounded-xl text-center text-sm">Memuat projects dari database...</p>
              ) : (
                <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-6`}>
                  {projects.map((p) => (
                    <div key={p.id} className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl overflow-hidden hover:border-[var(--app-accent)]/30 hover:-translate-y-1 transition-all group">
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image_url} alt={p.title} className="w-full aspect-video object-cover" />
                      ) : (
                        <div className="aspect-video bg-gradient-to-br from-[#0d0d14] to-[#1a1a2e] flex items-center justify-center border-b border-[#1e1e2e]">
                          <span className="text-4xl opacity-20">🚀</span>
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="font-bold text-white mb-2 group-hover:text-[var(--app-accent)] transition-colors">{p.title}</h3>
                        <p className="text-[#6a6a8a] text-sm line-clamp-2 mb-3">{p.description}</p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {p.tags?.slice(0, 4).map((t) => <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-[#1a1a2e] border border-[#2a2a3a] text-[#888]">{t}</span>)}
                        </div>
                        {showLinks && (p.github || p.live) && (
                          <div className="flex gap-2 pt-3 border-t border-[#1e1e2e]">
                            {p.github && <a href={p.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#6a6a8a] hover:text-white transition-colors"><Github className="w-3.5 h-3.5" /> Source</a>}
                            {p.live && <a href={p.live} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs hover:text-white transition-colors ml-auto" style={{ color: "var(--app-accent)" }}><ExternalLink className="w-3.5 h-3.5" /> Live</a>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionWrapper>
        );
      },
    },

    /* ─── SKILLS DISPLAY ────────────────────────────── */
    SkillsDisplay: {
      fields: {
        layout: { type: "radio", options: [{ label: "Grid", value: "grid" }, { label: "List", value: "list" }, { label: "Cloud", value: "cloud" }] },
      },
      defaultProps: { layout: "grid" },
      render: ({ layout }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [skills, setSkills] = useState<SkillCategory[]>([]);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          createClient().from("portfolio_skills").select("*").order("sort_order").then(({ data }) => setSkills(data ?? []));
        }, []);
        return (
          <SectionWrapper>
            <div className="py-12 px-6 max-w-6xl mx-auto">
              {skills.length === 0 ? (
                <p className="text-[#4a4a6a] p-6 border border-dashed border-[#1e1e2e] rounded-xl text-center text-sm">Memuat skills dari database...</p>
              ) : layout === "cloud" ? (
                <div className="flex flex-wrap gap-2 justify-center">
                  {skills.flatMap(c => c.items ?? []).map((item, i) => (
                    <span key={i} className="px-4 py-2 bg-[#0d0d14] border border-[#1e1e2e] rounded-full text-sm text-[#c2c2df] hover:border-[var(--app-accent)] hover:text-white transition-all cursor-default">{item}</span>
                  ))}
                </div>
              ) : (
                <div className={layout === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col space-y-4"}>
                  {skills.map((cat) => (
                    <div key={cat.id} className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-6 hover:border-[var(--app-accent)]/20 transition-all">
                      <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">{cat.category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {(cat.items ?? []).map((item: string) => (
                          <span key={item} className="px-3 py-1.5 bg-[#1a1a2e] border border-[#2a2a3a] rounded-lg text-xs font-medium text-[#c2c2df]">{item}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionWrapper>
        );
      },
    },

    /* ─── EXPERIENCE TIMELINE ───────────────────────── */
    ExperienceTimeline: {
      fields: { title: { type: "text", label: "Judul" } },
      defaultProps: { title: "Work Experience" },
      render: ({ title }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [exp, setExp] = useState<ExperienceData[]>([]);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          createClient().from("portfolio_experience").select("*").order("start_date", { ascending: false }).then(({ data }) => setExp(data ?? []));
        }, []);
        return (
          <SectionWrapper>
            <div className="py-12 px-6 max-w-3xl mx-auto">
              {title && <h2 className="text-3xl font-black text-white mb-12">{title}</h2>}
              {exp.length === 0 ? (
                <p className="text-[#4a4a6a] p-6 border border-dashed border-[#1e1e2e] rounded-xl text-center text-sm">Belum ada data experience.</p>
              ) : (
                <div className="relative space-y-8">
                  <div className="absolute left-5 top-0 bottom-0 w-px" style={{ background: "linear-gradient(to bottom, var(--app-accent), transparent)" }} />
                  {exp.map((item) => (
                    <div key={item.id} className="flex gap-6 pl-14 relative">
                      <div className="absolute left-3 top-1 w-4 h-4 rounded-full border-2 bg-[var(--app-bg)]" style={{ borderColor: "var(--app-accent)" }} />
                      <div className="flex-1 bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-5 hover:border-[var(--app-accent)]/30 transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1">
                          <h3 className="font-bold text-white">{item.role}</h3>
                          <span className="text-xs font-mono text-[#6a6a8a]">{item.start_date} – {item.current ? "Present" : item.end_date}</span>
                        </div>
                        <p className="text-sm font-semibold mb-3" style={{ color: "var(--app-accent)" }}>{item.company}</p>
                        {item.description && <p className="text-[#a1a1aa] text-sm leading-relaxed">{item.description}</p>}
                        {(item.tech_stack ?? []).length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {(item.tech_stack ?? []).map((t: string) => <span key={t} className="text-[10px] px-2 py-0.5 bg-[#1a1a2e] border border-[#2a2a3a] rounded text-[#888]">{t}</span>)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionWrapper>
        );
      },
    },

    /* ─── EDUCATION LIST ────────────────────────────── */
    EducationList: {
      fields: { title: { type: "text", label: "Judul" } },
      defaultProps: { title: "Education" },
      render: ({ title }) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [edu, setEdu] = useState<EducationData[]>([]);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          createClient().from("portfolio_education").select("*").order("start_date", { ascending: false }).then(({ data }) => setEdu(data ?? []));
        }, []);
        return (
          <SectionWrapper>
            <div className="py-12 px-6 max-w-4xl mx-auto">
              {title && <h2 className="text-3xl font-black text-white mb-8">{title}</h2>}
              {edu.length === 0 ? (
                <p className="text-[#4a4a6a] p-6 border border-dashed border-[#1e1e2e] rounded-xl text-center text-sm">Belum ada data pendidikan.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {edu.map((item) => (
                    <div key={item.id} className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-6 flex gap-4 hover:border-[var(--app-accent)]/30 transition-all">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border" style={{ background: "color-mix(in srgb, var(--app-accent) 10%, transparent)", borderColor: "color-mix(in srgb, var(--app-accent) 30%, transparent)", color: "var(--app-accent)" }}>
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white leading-tight">{item.institution}</h3>
                        <p className="text-sm mb-1" style={{ color: "var(--app-accent)" }}>{item.degree}</p>
                        <span className="text-xs font-mono text-[#6a6a8a] bg-[#1a1a2e] px-2 py-0.5 rounded">{item.start_date} – {item.current ? "Present" : item.end_date}</span>
                        {item.description && <p className="text-[#a1a1aa] text-xs mt-2">{item.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionWrapper>
        );
      },
    },

    /* ─── FASTWORK CTA ──────────────────────────────── */
    FastWorkCTA: {
      fields: {
        displayTitle: { type: "text", label: "Judul" },
        username:     { type: "text", label: "Username FastWork" },
      },
      defaultProps: { displayTitle: "Hire me on FastWork", username: "revan_" },
      render: ({ displayTitle, username }) => (
        <SectionWrapper>
          <div className="py-16 px-6 max-w-2xl mx-auto text-center">
            <div className="bg-[#0d0d14] border border-[#1e1e2e] p-10 rounded-2xl relative overflow-hidden group hover:border-[var(--app-accent)]/30 transition-all">
              <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity" style={{ background: "radial-gradient(ellipse at 50% 100%, var(--app-accent), transparent 70%)" }} />
              <h3 className="text-2xl font-black text-white mb-3 relative z-10">{displayTitle}</h3>
              <p className="text-[#a1a1aa] mb-8 relative z-10">Available for freelance web development and API integration projects.</p>
              <a href={`https://fastwork.id/user/${username}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white font-semibold px-8 py-3.5 rounded-xl transition-all hover:scale-105 hover:shadow-xl relative z-10"
                style={{ background: "var(--app-accent)", boxShadow: "0 8px 24px color-mix(in srgb, var(--app-accent) 30%, transparent)" }}>
                View FastWork Profile <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </SectionWrapper>
      ),
    },
  },
};
