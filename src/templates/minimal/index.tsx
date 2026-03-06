import { Navbar } from "./components/navbar";
import { Hero } from "./components/hero";
import { About } from "./components/about";
import { Skills } from "./components/skills";
import { Projects } from "./components/projects";
import { Experience } from "./components/experience";
import { Contact } from "./components/contact";
import { Footer } from "./components/footer";
import type { PortfolioData, ThemeConfig } from "@/src/types/portfolio";

interface MinimalTemplateProps {
  data: PortfolioData;
  settings: {
    section_order: string[];
    visible_sections: string[];
    theme: ThemeConfig;
  };
}

export default function MinimalTemplate({ data, settings }: MinimalTemplateProps) {
  const { theme, section_order, visible_sections } = settings;

  // Render a specific section by its id
  const renderSection = (id: string) => {
    switch (id) {
      case "hero": return <Hero key="hero" personal={data.personal} />;
      case "about": return <About key="about" personal={data.personal} certifications={data.certifications} />;
      case "skills": return <Skills key="skills" skills={data.skills} />;
      case "projects": return <Projects key="projects" projects={data.projects} />;
      case "experience": return <Experience key="experience" experience={data.experience} education={data.education} />;
      case "contact": return <Contact key="contact" personal={data.personal} />;
      default: return null;
    }
  };

  return (
    <div
      // Set CSS variables for theming inside this template wrapper
      style={{
        "--theme-accent": `var(--accent-${theme.accent})`,
        "--theme-radius": `var(--radius-${theme.roundness})`,
        "--font-primary": theme.fontMono ? "var(--font-fira), monospace" : "var(--font-inter), sans-serif",
      } as React.CSSProperties}
      className={`min-h-screen bg-[#09090b] text-[#fafafa] font-primary ${theme.fontMono ? "font-mono" : ""}`}
    >
      <Navbar />

      <main className="pt-20">
        {section_order
          .filter((id) => visible_sections.includes(id))
          .map((id) => renderSection(id))}
      </main>

      <Footer personal={data.personal} />
    </div>
  );
}
