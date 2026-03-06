import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { personalInfo, skills, projects, experience, education, certifications } from "@/data/portfolio";

// One-time seed endpoint — disable after running
// Protected by service role only
export async function POST() {
  try {
    const supabase = await createClient();

    // Check if already seeded
    const { data: existing } = await supabase.from("portfolio_personal").select("id").single();
    if (existing) {
      return NextResponse.json({ message: "Already seeded" }, { status: 200 });
    }

    // Seed personal info
    await supabase.from("portfolio_personal").insert([{
      name: personalInfo.name,
      role: personalInfo.role,
      roles: personalInfo.roles,
      bio: personalInfo.bio,
      bio_short: personalInfo.bioShort,
      location: personalInfo.location,
      email: personalInfo.email,
      phone: personalInfo.phone,
      github: personalInfo.github,
      linkedin: personalInfo.linkedin,
      avatar: personalInfo.avatar,
      years_of_exp: personalInfo.yearsOfExp,
      projects_completed: personalInfo.projectsCompleted,
    }]);

    // Seed skills
    const skillsData = skills.map((s, i) => ({ category: s.category, items: s.items, sort_order: i }));
    await supabase.from("portfolio_skills").insert(skillsData);

    // Seed projects
    const projectsData = projects.map((p, i) => ({
      title: p.title, description: p.description, tags: p.tags,
      github: p.github ?? null, live: p.live ?? null,
      featured: p.featured, sort_order: i,
    }));
    await supabase.from("portfolio_projects").insert(projectsData);

    // Seed experience
    const expData = experience.map((e, i) => ({
      role: e.role, company: e.company, type: e.type, period: e.period,
      current: e.current, description: e.description, skills: e.skills, sort_order: i,
    }));
    await supabase.from("portfolio_experience").insert(expData);

    // Seed education
    const eduData = education.map((e, i) => ({
      degree: e.degree, institution: e.institution, period: e.period,
      current: e.current, sort_order: i,
    }));
    await supabase.from("portfolio_education").insert(eduData);

    // Seed certifications
    const certData = certifications.map((c, i) => ({
      name: c.name, issuer: c.issuer, sort_order: i,
    }));
    await supabase.from("portfolio_certifications").insert(certData);

    return NextResponse.json({ success: true, message: "Seeded successfully" });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
