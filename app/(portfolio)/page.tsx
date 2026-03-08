import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { buildMetadata, getSeoContext } from "@/lib/seo";
import Template1 from "@/components/templates/template-1";
import Template2 from "@/components/templates/template-2";

export const revalidate = 60;
export const dynamic = "force-dynamic";

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
    supabase
      .from("portfolio_system_settings")
      .select("site_title, site_description, active_template, theme, section_order")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
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
  const cmsTheme = settingsRes.data?.theme || {};
  const accent = cmsTheme.accent || "#4f46e5";
  const bg = cmsTheme.bg || "#0b0b12";
  const selectedTemplate = settingsRes.data?.active_template;
  const activeTemplate = selectedTemplate === "template2" ? "template2" : "template1";

  // Props standar yang dikirim ke semua template
  const portfolioData = {
    personal: personal || undefined,
    projects,
    skills,
    experience,
    education,
    services,
    testimonials
  };

  const themeConfig = {
    accent,
    bg,
    siteTitle,
    siteDescription,
    templateTexts:
      cmsTheme.templateTexts && typeof cmsTheme.templateTexts === "object"
        ? cmsTheme.templateTexts
        : {},
  };

  return (
    <>
      {activeTemplate === "template1" && <Template1 data={portfolioData} theme={themeConfig} />}
      {activeTemplate === "template2" && <Template2 data={portfolioData} theme={themeConfig} />}
    </>
  );
}
