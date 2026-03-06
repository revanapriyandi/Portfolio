export const personalInfo = {
  name: "M. Revan Apriyandi",
  role: "Software Engineer",
  roles: ["Full Stack Developer", "Backend Developer", "Software Engineer", "Web Developer"],
  bio: "Software Engineer dengan 3+ tahun pengalaman membangun berbagai jenis website, dari business site hingga interactive web application. Expert dalam PHP, JavaScript, dan berbagai framework modern seperti Laravel, React, dan Next.js. Mampu bekerja secara tim maupun individu dengan komitmen terhadap deadline.",
  bioShort: "Building impactful digital experiences with modern web technologies.",
  location: "DKI Jakarta, Indonesia",
  email: "revanapriyandi88@gmail.com",
  phone: "+62 812-6186-5875",
  github: "https://github.com/revanapriyandi",
  linkedin: "https://linkedin.com/in/revan-apriyandi",
  stackoverflow: "https://stackoverflow.com/users/21032071/m-revan-apriyandi",
  fastwork: "https://fastwork.id/user/revan_",
  instagram: "https://instagram.com/revan_apriyandi",
  avatar: "https://avatars.githubusercontent.com/u/237313343?v=4",
  yearsOfExp: 3,
  projectsCompleted: 20,
  techStack: 15,
};

export const skills = [
  {
    category: "Frontend",
    items: ["React", "Next.js", "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind CSS", "Bootstrap", "Material UI"],
  },
  {
    category: "Backend",
    items: ["Laravel", "CodeIgniter", "PHP", "Express.js", "Node.js", "REST API"],
  },
  {
    category: "Database",
    items: ["MySQL", "MongoDB", "Firebase", "Redis"],
  },
  {
    category: "Tools & Cloud",
    items: ["Docker", "AWS", "Git", "GitHub", "Figma", "Postman", "Selenium"],
  },
];

export const projects = [
  {
    title: "AutoClipper",
    description: "AI-powered desktop app to auto-cut, caption, and publish viral short videos to YouTube, TikTok & Facebook. Built with Electron, Next.js & FFmpeg.",
    tags: ["Electron", "Next.js", "TypeScript", "FFmpeg", "AI"],
    github: "https://github.com/revanapriyandi/AutoClipper",
    live: "https://github.com/revanapriyandi/AutoClipper",
    featured: true,
  },
  {
    title: "Laundry Management App",
    description: "Sistem manajemen laundry dengan Laravel 5.8 & Vue.js yang memungkinkan manajemen order, pelanggan, dan pembayaran secara otomatis untuk pemilik bisnis laundry.",
    tags: ["Laravel", "Vue.js", "MySQL", "JavaScript"],
    github: "https://github.com/revanapriyandi",
    featured: true,
  },
  {
    title: "Learning Management System (Vocasia)",
    description: "API untuk platform LMS yang terintegrasi dengan layanan pihak ketiga seperti payment (Midtrans) dan autentikasi. Manajemen database yang efisien untuk akses data cepat.",
    tags: ["CodeIgniter", "MySQL", "Redis", "Midtrans", "API"],
    github: "https://github.com/revanapriyandi",
    featured: true,
  },
  {
    title: "Typing Speed App",
    description: "Web application typing speed test yang dibangun dengan TypeScript dan Next.js, deployed di Vercel.",
    tags: ["TypeScript", "Next.js", "React"],
    github: "https://github.com/revanapriyandi/typing",
    live: "https://type-rust.vercel.app",
    featured: false,
  },
  {
    title: "Inventory Management System",
    description: "Sistem manajemen inventaris menggunakan Laravel 5.8 untuk membantu UKM mengelola stok, supplier, dan laporan penjualan secara efektif.",
    tags: ["Laravel", "MySQL", "HTML", "CSS", "JavaScript"],
    github: "https://github.com/revanapriyandi",
    featured: false,
  },
  {
    title: "Expert System — Plant Disease",
    description: "Sistem pakar berbasis AI untuk mendiagnosis penyakit pada tanaman anggur menggunakan knowledge base dan inference engine.",
    tags: ["Laravel", "PHP", "MySQL", "AI"],
    github: "https://github.com/revanapriyandi",
    featured: false,
  },
];

export const experience = [
  {
    role: "Fullstack Developer",
    company: "Freelance",
    type: "Remote",
    period: "Feb 2022 — Present",
    current: true,
    description: "Mengembangkan berbagai proyek web untuk klien dari berbagai industri. Membangun aplikasi full-stack menggunakan Laravel, React, dan Next.js.",
    skills: ["Laravel", "React", "Next.js", "MySQL", "Docker"],
  },
  {
    role: "Backend Developer",
    company: "Vocasia",
    type: "Internship",
    period: "Feb 2024 — Jul 2024",
    current: false,
    description: "Mengembangkan API untuk platform Learning Management System (LMS) dengan integrasi payment gateway Midtrans dan Redis untuk caching.",
    skills: ["CodeIgniter", "MySQL", "Redis", "Midtrans", "Postman"],
  },
  {
    role: "Intern Programmer",
    company: "RWD Indonesia",
    type: "Internship",
    period: "Mar 2019 — Aug 2019",
    current: false,
    description: "Program magang sebagai programmer, mendapatkan pengalaman awal dalam pengembangan software dan kerja tim profesional.",
    skills: ["PHP", "MySQL", "HTML", "CSS"],
  },
];

export const education = [
  {
    degree: "Bachelor Degree — Sistem Informasi",
    institution: "Universitas Borobudur",
    period: "2021 — Present",
    current: true,
  },
  {
    degree: "Rekayasa Perangkat Lunak",
    institution: "SMKN 2 Kec. Guguak",
    period: "2017 — 2020",
    current: false,
  },
];

export const certifications = [
  {
    name: "Cybersecurity Foundation Professional Certificate (CSFPC)",
    issuer: "CertiProf (Accredited by ANSI)",
  },
  {
    name: "Computer Security (MBKM)",
    issuer: "MBKM Program",
  },
];
