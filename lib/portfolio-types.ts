export interface PersonalInfo {
  id?: string;
  name?: string;
  full_name?: string;
  role?: string;
  title?: string;
  bio?: string;
  bio_short?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  avatar?: string;
  avatar_url?: string;
  github?: string;
  github_url?: string;
  linkedin?: string;
  linkedin_url?: string;
  twitter?: string;
  twitter_url?: string;
  fastwork_username?: string;
  open_to_work?: boolean;
  availability_text?: string;
  years_of_exp?: number;
  projects_completed?: number;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  type?: string;
  start_date: string;
  end_date: string | null;
  current: boolean;
  description: string;
  tech_stack?: string[];
  logo_url?: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field_of_study?: string;
  start_date: string;
  end_date: string | null;
  current: boolean;
  description: string;
  logo_url?: string;
  gpa?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  tech_stack?: string[];
  live?: string;
  live_url?: string;
  github?: string;
  github_url?: string;
  image_url?: string;
  featured?: boolean;
}

export interface SkillCategory {
  id?: string;
  category: string;
  items: string[];
  item_icons?: Record<string, string>;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  company?: string;
  content: string;
}

export interface PortfolioData {
  personal?: PersonalInfo;
  experience?: ExperienceItem[];
  education?: EducationItem[];
  projects?: ProjectItem[];
  skills?: SkillCategory[];
  services?: ServiceItem[];
  testimonials?: TestimonialItem[];
}

export interface ThemeSettings {
  accent: string;
  bg: string;
  siteTitle?: string;
  siteDescription?: string;
}
