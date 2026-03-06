export interface PersonalInfo {
  id?: string;
  name: string;
  role?: string;
  roles?: string[];
  bio?: string;
  bio_short?: string;
  location?: string;
  email?: string;
  phone?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  avatar?: string;
  resume_url?: string;
  fastwork_username?: string;
  open_to_work?: boolean;
  availability_text?: string;
  years_of_exp?: number;
  projects_completed?: number;
}

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category?: string;
  image_url?: string;
  demo_video?: string;
  github?: string;
  live?: string;
  featured?: boolean;
  status?: 'published' | 'draft';
  sort_order?: number;
}

export interface ExperienceData {
  id: string;
  company: string;
  role: string;
  type?: string;
  location?: string;
  website?: string;
  logo_url?: string;
  start_date: string;
  end_date: string | null;
  current: boolean;
  description: string;
  tech_stack?: string[];
}

export interface EducationData {
  id: string;
  institution: string;
  degree: string;
  field_of_study?: string;
  logo_url?: string;
  start_date: string;
  end_date: string | null;
  current: boolean;
  gpa?: string;
  activities?: string;
  description: string;
}

export interface SkillCategory {
  id?: string;
  category: string;
  items: string[];
  item_icons?: Record<string, string>;
}

export interface ExpData {
  id?: string;
  role: string;
  company: string;
  type: string;
  period: string;
  current: boolean;
  description: string;
  skills: string[];
}

export interface EduData {
  id?: string;
  degree: string;
  institution: string;
  period: string;
  current: boolean;
}

export interface CertData {
  id?: string;
  name: string;
  issuer: string;
}

export interface PortfolioData {
  personal: PersonalInfo;
  projects: ProjectData[];
  skills: SkillCategory[];
  experience: ExpData[];
  education: EduData[];
  certifications: CertData[];
}

export interface ThemeConfig {
  accent: string;      // e.g. "blue", "indigo", "emerald"
  heroStyle: string;   // e.g. "centered", "split" 
  roundness: string;   // e.g. "none", "sm", "md", "lg", "full"
  fontMono: boolean;   // e.g. use monospace font for headings
}

export interface PortfolioSettings {
  active_template: string; // e.g. "minimal", "bento"
  section_order: string[]; // e.g. ["hero", "about", "skills", ...]
  visible_sections: string[];
  theme: ThemeConfig;
}
