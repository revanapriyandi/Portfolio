import type { IconType } from "react-icons";
import {
  SiReact, SiNextdotjs, SiTypescript, SiJavascript, SiHtml5, SiCss,
  SiTailwindcss, SiBootstrap, SiMui, SiVuedotjs, SiSvelte, SiAngular,
  SiLaravel, SiCodeigniter, SiPhp, SiExpress, SiNodedotjs, SiDjango,
  SiFlask, SiRuby, SiSpring, SiFastapi, SiGo,
  SiMysql, SiMongodb, SiFirebase, SiRedis, SiPostgresql, SiSqlite, SiSupabase,
  SiDocker, SiGit, SiGithub, SiFigma, SiPostman,
  SiSelenium, SiLinux, SiNginx, SiVercel, SiGitlab, SiJira, SiKubernetes,
  SiRust, SiPython, SiCplusplus, SiSwift, SiKotlin, SiFlutter, SiDart,
} from "react-icons/si";

export const ICON_MAP: Record<string, IconType> = {
  // Frontend
  "React": SiReact,
  "Next.js": SiNextdotjs,
  "TypeScript": SiTypescript,
  "JavaScript": SiJavascript,
  "HTML5": SiHtml5,
  "CSS3": SiCss,
  "Tailwind CSS": SiTailwindcss,
  "Bootstrap": SiBootstrap,
  "Material UI": SiMui,
  "Vue.js": SiVuedotjs,
  "Svelte": SiSvelte,
  "Angular": SiAngular,
  // Backend
  "Laravel": SiLaravel,
  "CodeIgniter": SiCodeigniter,
  "PHP": SiPhp,
  "Express.js": SiExpress,
  "Node.js": SiNodedotjs,
  "Django": SiDjango,
  "Flask": SiFlask,
  "Ruby": SiRuby,
  "Spring": SiSpring,
  "FastAPI": SiFastapi,
  "Go": SiGo,
  "Python": SiPython,
  "C++": SiCplusplus,
  "Rust": SiRust,
  // Database
  "MySQL": SiMysql,
  "MongoDB": SiMongodb,
  "Firebase": SiFirebase,
  "Redis": SiRedis,
  "PostgreSQL": SiPostgresql,
  "SQLite": SiSqlite,
  "Supabase": SiSupabase,
  // Mobile
  "Swift": SiSwift,
  "Kotlin": SiKotlin,
  "Flutter": SiFlutter,
  "Dart": SiDart,
  // Tools & Cloud
  "Docker": SiDocker,
  "Git": SiGit,
  "GitHub": SiGithub,
  "GitLab": SiGitlab,
  "Figma": SiFigma,
  "Postman": SiPostman,
  "Selenium": SiSelenium,
  "Linux": SiLinux,
  "Nginx": SiNginx,
  "Vercel": SiVercel,
  "Jira": SiJira,
  "Kubernetes": SiKubernetes,
};

/** All available icons as a list for the picker */
export const ICON_LIST = Object.entries(ICON_MAP).map(([name, Icon]) => ({ name, Icon }));
