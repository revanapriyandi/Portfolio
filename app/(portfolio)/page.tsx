import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { buildMetadata, getSeoContext } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoContext();
  return buildMetadata({
    siteTitle: seo.siteTitle,
    siteDescription: seo.siteDescription,
    siteUrl: seo.siteUrl,
    defaultOgImage: seo.defaultOgImage,
  });
}

export default async function PortfolioPage() {
  const supabase = await createClient();

  const [
    personalRes,
    projectsRes,
    skillsRes,
    experienceRes,
    educationRes,
    servicesRes,
    testimonialsRes,
    settingsRes,
  ] = await Promise.all([
    supabase.from("portfolio_personal").select("*").single(),
    supabase.from("portfolio_projects").select("*").eq("status", "published").order("sort_order"),
    supabase.from("portfolio_skills").select("*").order("sort_order"),
    supabase.from("portfolio_experience").select("*").order("sort_order"),
    supabase.from("portfolio_education").select("*").order("sort_order"),
    supabase.from("portfolio_services").select("*").order("sort_order"),
    supabase.from("portfolio_testimonials").select("*").order("sort_order"),
    supabase.from("portfolio_system_settings").select("site_title, site_description, theme").limit(1).maybeSingle(),
  ]);

  const personal = personalRes.data;
  const projects = projectsRes.data ?? [];
  const skills = skillsRes.data ?? [];
  const experience = experienceRes.data ?? [];
  const education = educationRes.data ?? [];
  const services = servicesRes.data ?? [];
  const testimonials = testimonialsRes.data ?? [];
  const siteTitle = settingsRes.data?.site_title || "Portfolio";
  const siteDescription = settingsRes.data?.site_description || "Professional portfolio";
  const accent = settingsRes.data?.theme?.accent || "#4f46e5";
  const bg = settingsRes.data?.theme?.bg || "#0b0b12";

  return (
    <div className="min-h-screen text-[#ececf5]" style={{ backgroundColor: bg, ["--accent" as string]: accent } as React.CSSProperties}>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/50 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <a href="#home" className="text-sm font-bold tracking-wide">{siteTitle}</a>
          <nav className="hidden gap-4 text-xs text-[#b7b7c8] md:flex">
            <a href="#about" className="hover:text-white">About</a>
            <a href="#projects" className="hover:text-white">Projects</a>
            <a href="#skills" className="hover:text-white">Skills</a>
            <a href="#experience" className="hover:text-white">Experience</a>
            <a href="#contact" className="hover:text-white">Contact</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-20 px-4 py-14">
        <section id="home" className="grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#9ea0b7]">{personal?.role || "Software Engineer"}</p>
            <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
              {personal?.name || "Your Name"}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#b7b7c8]">
              {personal?.bio_short || siteDescription}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#projects" className="rounded-full px-5 py-2.5 text-xs font-semibold text-white" style={{ backgroundColor: accent }}>View Projects</a>
              {personal?.email && (
                <a href={`mailto:${personal.email}`} className="rounded-full border border-white/20 px-5 py-2.5 text-xs font-semibold hover:border-white/40">
                  Contact Me
                </a>
              )}
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            {personal?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={personal.avatar} alt={personal.name || "Avatar"} className="h-28 w-28 rounded-2xl object-cover" />
            ) : (
              <div className="h-28 w-28 rounded-2xl bg-white/10" />
            )}
            <p className="mt-4 text-sm font-semibold">{personal?.location || "Remote"}</p>
            <p className="mt-1 text-xs text-[#9ea0b7]">{personal?.availability_text || "Available for freelance projects"}</p>
          </div>
        </section>

        <section id="about" className="rounded-3xl border border-white/10 bg-white/5 p-7">
          <h2 className="text-xl font-bold">About</h2>
          <p className="mt-3 text-sm leading-7 text-[#b7b7c8]">{personal?.bio || siteDescription}</p>
        </section>

        <section id="projects" className="space-y-5">
          <h2 className="text-2xl font-bold">Projects</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {projects.slice(0, 8).map((project) => (
              <article key={project.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h3 className="text-base font-semibold">{project.title}</h3>
                <p className="mt-2 text-xs leading-6 text-[#b7b7c8]">{project.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(project.tags ?? []).slice(0, 5).map((tag: string) => (
                    <span key={tag} className="rounded-full border border-white/20 px-2.5 py-1 text-[10px] text-[#c8c8d8]">{tag}</span>
                  ))}
                </div>
                <div className="mt-4 flex gap-3 text-xs">
                  {project.github && <a href={project.github} target="_blank" rel="noreferrer" className="hover:text-white">GitHub</a>}
                  {project.live && <a href={project.live} target="_blank" rel="noreferrer" className="hover:text-white">Live</a>}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="skills" className="space-y-5">
          <h2 className="text-2xl font-bold">Skills</h2>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex flex-wrap gap-2">
              {[...new Set(skills.flatMap((category) => category.items ?? []))].map((item) => (
                <span key={item} className="rounded-md bg-white/10 px-2 py-1 text-[11px] text-[#d8d8e5]">{item}</span>
              ))}
            </div>
          </div>
        </section>

        <section id="experience" className="space-y-5">
          <h2 className="text-2xl font-bold">Experience & Education</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              {experience.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold">{item.role}</p>
                  <p className="text-xs text-[#aeb0c4]">{item.company}</p>
                  <p className="mt-1 text-[11px] text-[#878aa4]">{item.start_date} - {item.current ? "Present" : item.end_date}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {education.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold">{item.institution}</p>
                  <p className="text-xs text-[#aeb0c4]">{item.degree}</p>
                  <p className="mt-1 text-[11px] text-[#878aa4]">{item.start_date} - {item.current ? "Present" : item.end_date}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {services.length > 0 && (
          <section className="space-y-5">
            <h2 className="text-2xl font-bold">Services</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {services.slice(0, 6).map((service) => (
                <div key={service.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-2xl">{service.icon || "*"}</p>
                  <p className="mt-2 text-sm font-semibold">{service.title}</p>
                  <p className="mt-1 text-xs leading-6 text-[#b7b7c8]">{service.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {testimonials.length > 0 && (
          <section className="space-y-5">
            <h2 className="text-2xl font-bold">Testimonials</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {testimonials.slice(0, 6).map((item) => (
                <blockquote key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs leading-6 text-[#c8c8d8]">"{item.content}"</p>
                  <footer className="mt-3 text-[11px] text-[#9ea0b7]">- {item.name}{item.company ? `, ${item.company}` : ""}</footer>
                </blockquote>
              ))}
            </div>
          </section>
        )}

        <section id="contact" className="rounded-3xl border border-white/10 bg-white/5 p-7 text-center">
          <h2 className="text-2xl font-bold">Let&apos;s Work Together</h2>
          <p className="mt-2 text-sm text-[#b7b7c8]">Kirim pesan langsung melalui email atau sosial media.</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs">
            {personal?.email && <a href={`mailto:${personal.email}`} className="rounded-full border border-white/20 px-4 py-2 hover:border-white/40">{personal.email}</a>}
            {personal?.github && <a href={personal.github} target="_blank" rel="noreferrer" className="rounded-full border border-white/20 px-4 py-2 hover:border-white/40">GitHub</a>}
            {personal?.linkedin && <a href={personal.linkedin} target="_blank" rel="noreferrer" className="rounded-full border border-white/20 px-4 py-2 hover:border-white/40">LinkedIn</a>}
          </div>
        </section>
      </main>
    </div>
  );
}
