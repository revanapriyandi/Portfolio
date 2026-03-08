/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PortfolioData, ThemeSettings } from "@/lib/portfolio-types";
import { ExternalLink, Github, Mail } from "lucide-react";

interface Template2Props {
  data: PortfolioData;
  theme: ThemeSettings;
}

export default function Template2({ data, theme }: Template2Props) {
  const { personal, projects = [], skills = [], experience = [], education = [], services = [], testimonials = [] } = data;
  const texts = theme.templateTexts ?? {};
  const t = (key: string, fallback: string) => texts[key] || fallback;
  const initialProjects = 4;
  const initialExperience = 4;
  const initialSkills = 8;
  const initialEducation = 3;
  const initialTestimonials = 4;
  
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllExperience, setShowAllExperience] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [showAllEducation, setShowAllEducation] = useState(false);
  const [showAllTestimonials, setShowAllTestimonials] = useState(false);
  
  const displayProjects = showAllProjects ? projects : projects.slice(0, initialProjects);
  const hiddenProjects = Math.max(0, projects.length - initialProjects);
  const displayExperience = showAllExperience ? experience : experience.slice(0, initialExperience);
  const hiddenExperience = Math.max(0, experience.length - initialExperience);
  const displaySkills = showAllSkills ? skills : skills.slice(0, initialSkills);
  const hiddenSkills = Math.max(0, skills.length - initialSkills);
  const displayEducation = showAllEducation ? education : education.slice(0, initialEducation);
  const hiddenEducation = Math.max(0, education.length - initialEducation);
  const displayTestimonials = showAllTestimonials ? testimonials : testimonials.slice(0, initialTestimonials);
  const hiddenTestimonials = Math.max(0, testimonials.length - initialTestimonials);
  
  const truncate = (value?: string, max = 190) => {
    if (!value) return "";
    return value.length > max ? `${value.slice(0, max).trim()}...` : value;
  };

  // For this elegant minimal template, we override some theme colors to enforce the light, clean aesthetic.
  // The user's custom accent color will still be used for subtle highlights.
  const accent = theme.accent || "#000000";
  const bg = "#fafafa";
  const textPrimary = "#111827";

  const devName = personal?.name || "Creative Professional";

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div
      className="min-h-screen font-sans font-light antialiased selection:bg-black selection:text-white"
      style={{ backgroundColor: bg, color: textPrimary }}
    >
      {/* Nvabar */}
      <nav className="w-full px-6 py-8 md:px-12 flex justify-between items-center fixed top-0 z-50 bg-[#fafafa]/80 backdrop-blur-md border-b border-gray-100">
        <a href="#top" className="text-xl font-serif font-semibold tracking-wide text-black">
          {devName.split(" ")[0]}<span style={{ color: accent }}>.</span>
        </a>
        <div className="hidden md:flex gap-8 text-sm uppercase tracking-widest text-gray-500">
          <a href="#about" className="hover:text-black transition-colors">{t("t2_nav_about", "About")}</a>
          <a href="#services" className="hover:text-black transition-colors">{t("t2_nav_services", "Services")}</a>
          <a href="#projects" className="hover:text-black transition-colors">{t("t2_nav_works", "Works")}</a>
          <a href="#experience" className="hover:text-black transition-colors">{t("t2_nav_experience", "Experience")}</a>
          <a href="#contact" className="hover:text-black transition-colors">{t("t2_nav_contact", "Contact")}</a>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 md:px-12 max-w-5xl mx-auto">
        
        {/* HERO SECTION */}
        <motion.section 
          id="top"
          initial="hidden" animate="visible" variants={staggerContainer}
          className="min-h-[70vh] flex flex-col justify-center items-start"
        >
          <motion.p variants={fadeUp} className="text-sm md:text-base tracking-widest uppercase mb-4 text-gray-400">
            {personal?.role || t("t2_hero_fallback_role", "Digital Creator")}
          </motion.p>
          <motion.h1 
            variants={fadeUp} 
            className="text-5xl md:text-7xl lg:text-8xl font-serif leading-[1.1] text-black mb-8 max-w-4xl"
          >
            {personal?.bio ? personal.bio.split('.')[0] + "." : t("t2_hero_fallback_title", "Crafting digital experiences with elegance.")}
          </motion.h1>
          <motion.div variants={fadeUp} className="max-w-xl text-lg md:text-xl text-gray-500 font-light leading-relaxed mb-12">
            <p>{personal?.bio?.split('.').slice(1).join('.').trim() || t("t2_hero_fallback_desc", "Focused on minimalist design and robust engineering.")}</p>
          </motion.div>
          <motion.div variants={fadeUp} className="flex gap-6 items-center">
            {personal?.fastwork_username && (
                <a href={`https://fastwork.id/user/${personal.fastwork_username}`} target="_blank" rel="noreferrer"
                 className="px-8 py-4 bg-black text-white text-sm uppercase tracking-widest hover:bg-gray-800 transition-colors">
                {t("t2_hire_cta", "Hire Me")}
              </a>
            )}
            <a href="#contact" className="px-8 py-4 border border-gray-300 text-black text-sm uppercase tracking-widest hover:border-black transition-colors">
              {t("t2_contact_nav_cta", "Get in Touch")}
            </a>
          </motion.div>
        </motion.section>

        {/* LOGOS / SKILLS (Text-based) */}
        {skills.length > 0 && (
          <motion.section 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }}
            className="py-20 border-t border-gray-200"
          >
            <h3 className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-10 text-center">{t("t2_skills_title", "Core Expertise")}</h3>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-xl md:text-2xl font-serif text-gray-300">
              {displaySkills.map((skill) => (
                <span key={skill.id || skill.category} className="hover:text-black transition-colors duration-500 cursor-default">
                  {skill.category}
                </span>
              ))}
              {!showAllSkills && hiddenSkills > 0 && (
                <span className="text-base md:text-xl text-gray-400">+{hiddenSkills}</span>
              )}
            </div>
            {skills.length > initialSkills && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowAllSkills((prev) => !prev)}
                  className="px-5 py-2 border border-gray-300 text-xs uppercase tracking-widest hover:border-black transition-colors"
                >
                  {showAllSkills ? t("t2_skills_show_less", "Show Less") : t("t2_skills_show_more", "Show More")}
                </button>
              </div>
            )}
          </motion.section>
        )}

        {/* PROJECTS SECTION */}
        <motion.section id="projects" className="py-24 border-t border-gray-200" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}>
          <motion.div variants={fadeUp} className="flex justify-between items-end mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-black">{t("t2_projects_title", "Selected Works")}</h2>
            <span className="text-sm text-gray-400 hidden md:block">({projects.length})</span>
          </motion.div>
          
          <div className="flex flex-col gap-24">
            {displayProjects.map((project, idx) => (
              <motion.div key={project.id} variants={fadeUp} className="group relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className={`lg:col-span-7 ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden relative">
                    {project.image_url ? (
                       <img src={project.image_url} alt={project.title} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-105" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-gray-300 font-serif text-2xl">{t("t2_project_image_placeholder", "Project Image")}</div>
                    )}
                  </div>
                </div>
                <div className={`lg:col-span-5 flex flex-col justify-center ${idx % 2 === 1 ? 'lg:order-1 lg:pr-12' : 'lg:pl-12'}`}>
                  <span className="text-xs tracking-widest uppercase text-gray-400 mb-4">{project.tech_stack?.slice(0,3).join(" • ")}</span>
                  <h3 className="text-3xl font-serif text-black mb-6">{project.title}</h3>
                  <p className="text-gray-500 font-light leading-relaxed mb-8">{truncate(project.description)}</p>
                  {project.live_url && (
                    <a href={project.live_url} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-medium uppercase tracking-widest text-black hover:text-gray-500 transition-colors w-max group/link">
                      {t("t2_project_view_cta", "View Project")}
                      <ExternalLink className="w-4 h-4 ml-2 transform group-hover/link:translate-x-1 transition-transform" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          {projects.length > initialProjects && (
            <div className="mt-14 flex flex-col items-center gap-3">
              {!showAllProjects && (
                <p className="text-center text-sm text-gray-400">+{hiddenProjects} proyek lainnya tersedia</p>
              )}
              <button
                onClick={() => setShowAllProjects((prev) => !prev)}
                className="px-5 py-2 border border-gray-300 text-xs uppercase tracking-widest hover:border-black transition-colors"
              >
                {showAllProjects ? t("t2_projects_show_less", "Show Less") : t("t2_projects_show_more", "Show More")}
              </button>
            </div>
          )}
        </motion.section>

        {/* EXPERIENCE SECTION */}
        {experience.length > 0 && (
          <motion.section id="experience" className="py-24 border-t border-gray-200" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif text-black mb-16">{t("t2_experience_title", "Experience.")}</motion.h2>
            <div className="max-w-3xl">
              {displayExperience.map((exp) => (
                <motion.div key={exp.id} variants={fadeUp} className="mb-12 group">
                  <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-2">
                    <h4 className="text-2xl font-serif text-black">{exp.role}</h4>
                    <span className="text-sm tracking-widest text-gray-400 mt-2 md:mt-0 font-mono">
                      {new Date(exp.start_date || "").getFullYear()} — {exp.current ? t("t2_experience_present", "Present") : exp.end_date ? new Date(exp.end_date).getFullYear() : ""}
                    </span>
                  </div>
                  <h5 className="text-lg text-gray-800 mb-4">{exp.company}</h5>
                  <p className="text-gray-500 font-light leading-relaxed">{truncate(exp.description, 220)}</p>
                </motion.div>
              ))}
            </div>
            {experience.length > initialExperience && (
              <div className="mt-8 flex flex-col items-start gap-3">
                {!showAllExperience && (
                  <p className="text-sm text-gray-400">+{hiddenExperience} pengalaman lainnya tersedia</p>
                )}
                <button
                  onClick={() => setShowAllExperience((prev) => !prev)}
                  className="px-5 py-2 border border-gray-300 text-xs uppercase tracking-widest hover:border-black transition-colors"
                >
                  {showAllExperience ? t("t2_experience_show_less", "Show Less") : t("t2_experience_show_more", "Show More")}
                </button>
              </div>
            )}
          </motion.section>
        )}

        {/* EDUCATION SECTION */}
        {education.length > 0 && (
          <motion.section id="education" className="py-24 border-t border-gray-200" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif text-black mb-16">{t("t2_education_title", "Education.")}</motion.h2>
            <div className="max-w-3xl ml-auto">
              {displayEducation.map((edu) => (
                <motion.div key={edu.id} variants={fadeUp} className="mb-12 group">
                  <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-2">
                    <h4 className="text-2xl font-serif text-black">{edu.institution}</h4>
                    <span className="text-sm tracking-widest text-gray-400 mt-2 md:mt-0 font-mono">
                      {new Date(edu.start_date || "").getFullYear()} — {edu.current ? t("t2_education_present", "Present") : edu.end_date ? new Date(edu.end_date).getFullYear() : ""}
                    </span>
                  </div>
                  <h5 className="text-lg mb-1" style={{ color: accent }}>{edu.degree}</h5>
                  {edu.field_of_study && <p className="text-sm font-medium text-gray-800 mb-3">{edu.field_of_study}</p>}
                  <p className="text-gray-500 font-light leading-relaxed">{truncate(edu.description, 220)}</p>
                </motion.div>
              ))}
            </div>
            {education.length > initialEducation && (
              <div className="mt-8 flex flex-col items-end gap-3">
                {!showAllEducation && (
                  <p className="text-sm text-gray-400">+{hiddenEducation} educational records</p>
                )}
                <button
                  onClick={() => setShowAllEducation((prev) => !prev)}
                  className="px-5 py-2 border border-gray-300 text-xs uppercase tracking-widest hover:border-black transition-colors"
                >
                  {showAllEducation ? t("t2_education_show_less", "Show Less") : t("t2_education_show_more", "Show More")}
                </button>
              </div>
            )}
          </motion.section>
        )}

        {/* SERVICES SECTION */}
        {services.length > 0 && (
          <motion.section id="services" className="py-24 border-t border-gray-200" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif text-black mb-16">{t("t2_services_title", "Specialties.")}</motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
              {services.map((service) => (
                <motion.div key={service.id} variants={fadeUp} className="group">
                  <h4 className="text-2xl font-serif text-black mb-4 border-b border-gray-200 pb-4 group-hover:border-black transition-colors">{service.title}</h4>
                  <p className="text-gray-500 font-light leading-relaxed">{service.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
        
        {/* TESTIMONIALS SECTION */}
        {testimonials.length > 0 && (
          <motion.section id="testimonials" className="py-24 border-t border-gray-200" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
               <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-serif text-black">{t("t2_testimonials_title", "Words from others.")}</motion.h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {displayTestimonials.map((testimonial) => (
                <motion.div key={testimonial.id} variants={fadeUp} className="bg-white p-10 border border-gray-100 shadow-sm relative">
                  <span className="absolute top-6 right-8 text-6xl font-serif text-gray-100 leading-none">&quot;</span>
                  <p className="text-gray-600 font-light leading-relaxed mb-8 relative z-10 text-lg italic">
                    {testimonial.content}
                  </p>
                  <div>
                    <h5 className="font-medium text-black">{testimonial.name}</h5>
                    {testimonial.company && <p className="text-sm text-gray-400 mt-1">{testimonial.company}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
            {testimonials.length > initialTestimonials && (
              <div className="mt-12 flex flex-col items-center gap-3">
                {!showAllTestimonials && (
                   <p className="text-sm text-gray-400">+{hiddenTestimonials} more testimonials</p>
                )}
                <button
                  onClick={() => setShowAllTestimonials((prev) => !prev)}
                  className="px-5 py-2 border border-gray-300 text-xs uppercase tracking-widest hover:border-black transition-colors"
                >
                  {showAllTestimonials ? t("t2_testimonials_show_less", "Show Less") : t("t2_testimonials_show_more", "Show More")}
                </button>
              </div>
            )}
          </motion.section>
        )}

        {/* CONTACT SECTION */}
        <motion.section id="contact" className="py-32 border-t border-gray-200 text-center" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
          <motion.h2 variants={fadeUp} className="text-5xl md:text-7xl font-serif text-black mb-8">{t("t2_contact_title", "Let's talk.")}</motion.h2>
          <motion.p variants={fadeUp} className="text-xl text-gray-500 font-light mb-12 max-w-xl mx-auto">
            {t("t2_contact_desc", "I'm currently available for freelance projects and full-time opportunities.")}
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-8 text-sm uppercase tracking-widest font-medium">
             {personal?.email && (
                <a href={`mailto:${personal.email}`} className="text-black hover:text-gray-400 transition-colors flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {t("t2_contact_email_label", "Email")}
                </a>
             )}
             {personal?.github_url && (
                <a href={personal.github_url} target="_blank" rel="noreferrer" className="text-black hover:text-gray-400 transition-colors flex items-center gap-2">
                  <Github className="w-4 h-4" /> {t("t2_contact_github_label", "Github")}
                </a>
             )}
          </motion.div>
        </motion.section>

      </main>
      
      <footer className="w-full py-8 text-center border-t border-gray-100 bg-white">
        <p className="text-xs uppercase tracking-widest text-gray-400">
          © {new Date().getFullYear()} {devName}. {t("t2_footer_suffix", "Minimal aesthetics.")}
        </p>
      </footer>
    </div>
  );
}
