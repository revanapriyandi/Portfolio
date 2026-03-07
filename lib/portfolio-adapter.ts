import type { PortfolioData, PersonalInfo, ProjectItem } from "@/lib/portfolio-types";
import type {
  PersonalInfo as DbPersonalInfo,
  ExperienceData as DbExperienceData,
  EducationData as DbEducationData,
  ProjectData as DbProjectData,
  SkillCategory as DbSkillCategory,
} from "@/src/types/portfolio";

export function adaptPersonal(personal?: DbPersonalInfo | null): PersonalInfo | undefined {
  if (!personal) return undefined;
  return {
    id: personal.id,
    name: personal.name,
    full_name: personal.name,
    role: personal.role,
    title: personal.role,
    bio: personal.bio,
    bio_short: personal.bio_short,
    email: personal.email,
    phone: personal.phone,
    location: personal.location,
    website: personal.website,
    avatar: personal.avatar,
    avatar_url: personal.avatar,
    github: personal.github,
    github_url: personal.github,
    linkedin: personal.linkedin,
    linkedin_url: personal.linkedin,
    twitter: personal.twitter,
    twitter_url: personal.twitter,
    open_to_work: personal.open_to_work,
    availability_text: personal.availability_text,
    years_of_exp: personal.years_of_exp,
    projects_completed: personal.projects_completed,
  };
}

export function adaptProjects(projects?: DbProjectData[] | null): ProjectItem[] {
  return (projects ?? []).map((project) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    tech_stack: project.tags ?? [],
    live: project.live,
    live_url: project.live,
    github: project.github,
    github_url: project.github,
    image_url: project.image_url,
    featured: project.featured,
  }));
}

export function adaptPortfolioData({
  personal,
  experience,
  education,
  projects,
  skills,
}: {
  personal?: DbPersonalInfo | null;
  experience?: DbExperienceData[] | null;
  education?: DbEducationData[] | null;
  projects?: DbProjectData[] | null;
  skills?: DbSkillCategory[] | null;
}): PortfolioData {
  return {
    personal: adaptPersonal(personal),
    experience: experience ?? [],
    education: education ?? [],
    projects: adaptProjects(projects),
    skills: skills ?? [],
  };
}
