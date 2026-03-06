"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard, User, FolderKanban, Wrench, Briefcase,
  GraduationCap, LogOut, ExternalLink, ChevronRight, Github, Palette,
  Globe, Settings, Layers, MessageSquare, Star, Menu, X
} from "lucide-react";

const mainNav = [
  { href: "/dashboard/cms", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/cms/pages", label: "Halaman", icon: Globe },
  { href: "/dashboard/cms/builder", label: "Page Builder", icon: Palette },
  { href: "/dashboard/cms/templates", label: "Templates", icon: Layers },
];

const contentNav = [
  { href: "/dashboard/cms/personal", label: "Info Pribadi", icon: User },
  { href: "/dashboard/cms/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/cms/skills", label: "Skills", icon: Wrench },
  { href: "/dashboard/cms/experience", label: "Experience", icon: Briefcase },
  { href: "/dashboard/cms/education", label: "Education", icon: GraduationCap },
  { href: "/dashboard/cms/services", label: "Services", icon: Star },
  { href: "/dashboard/cms/testimonials", label: "Testimonials", icon: MessageSquare },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname.startsWith(href);
}

function NavItem({ href, label, icon: Icon, exact, pathname }: {
  href: string; label: string; icon: React.ElementType; exact?: boolean; pathname: string;
}) {
  const active = isActive(pathname, href, exact);
  return (
    <Link href={href}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
        active
          ? "bg-indigo-600/15 text-indigo-400 border border-indigo-600/20"
          : "text-[#6a6a8a] hover:text-[#c2c2df] hover:bg-[#14141f]"
      }`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {label}
      {active && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
    </Link>
  );
}

export default function CMSLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [personal, setPersonal] = useState<{ name: string; avatar?: string } | null>(null);

  useEffect(() => {
    supabase.from("portfolio_personal").select("name, avatar").limit(1).single()
      .then(({ data }) => setPersonal(data));
  }, [supabase]);

  if (pathname === "/dashboard/cms/login") return <>{children}</>;

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/dashboard/cms/login");
  }

  const Sidebar = () => (
    <aside className="w-56 shrink-0 bg-[#0d0d14] border-r border-[#1e1e2e] flex flex-col h-full">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-4 border-b border-[#1e1e2e] shrink-0">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <span className="text-white text-[11px] font-bold">P</span>
        </div>
        <div>
          <p className="text-xs font-bold text-[#e2e2ef] leading-none">portfolio<span className="text-indigo-400">.</span>cms</p>
          <p className="text-[9px] text-[#4a4a6a] mt-0.5">Admin Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4">
        {/* Main */}
        <div>
          <p className="text-[9px] font-semibold text-[#3a3a5a] uppercase tracking-widest px-2 mb-2">Menu Utama</p>
          <div className="space-y-0.5">
            {mainNav.map(item => (
              <NavItem key={item.href} {...item} pathname={pathname} />
            ))}
          </div>
        </div>
        {/* Content */}
        <div>
          <p className="text-[9px] font-semibold text-[#3a3a5a] uppercase tracking-widest px-2 mb-2">Konten</p>
          <div className="space-y-0.5">
            {contentNav.map(item => (
              <NavItem key={item.href} {...item} pathname={pathname} />
            ))}
          </div>
        </div>
      </div>

      {/* User profile + bottom actions */}
      <div className="p-2.5 border-t border-[#1e1e2e] space-y-1">
        {/* User info */}
        {personal && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            {personal.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={personal.avatar} alt={personal.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                <span className="text-[9px] font-bold text-white">{personal.name?.[0] ?? "A"}</span>
              </div>
            )}
            <p className="text-[11px] font-semibold text-[#c2c2df] truncate">{personal.name}</p>
          </div>
        )}
        <Link href="/dashboard/cms/settings"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${isActive(pathname, "/dashboard/cms/settings") ? "bg-indigo-600/15 text-indigo-400 border border-indigo-600/20" : "text-[#6a6a8a] hover:text-[#c2c2df] hover:bg-[#14141f]"}`}>
          <Settings className="w-3.5 h-3.5" /> Pengaturan
        </Link>
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#6a6a8a] hover:text-[#c2c2df] hover:bg-[#14141f] transition-all">
          <ExternalLink className="w-3.5 h-3.5" /> Lihat Portfolio
        </a>
        <a href="https://github.com/revanapriyandi" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#6a6a8a] hover:text-[#c2c2df] hover:bg-[#14141f] transition-all">
          <Github className="w-3.5 h-3.5" /> GitHub
        </a>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#6a6a8a] hover:text-red-400 hover:bg-red-500/5 transition-all">
          <LogOut className="w-3.5 h-3.5" /> Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex text-sm">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex flex-col h-full">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 shrink-0 bg-[#0d0d14] border-b border-[#1e1e2e] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[#6a6a8a] hover:text-[#c2c2df] transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-[#4a4a6a]">
              <span>dashboard</span>
              {pathname !== "/dashboard/cms" && (
                <>
                  <span>/</span>
                  <span className="text-[#c2c2df] capitalize font-medium">
                    {pathname.split("/").at(-1)?.replace(/-/g, " ")}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-[10px] text-[#6a6a8a] hover:text-indigo-400 transition-colors px-2 py-1 rounded-lg hover:bg-indigo-600/10">
              <ExternalLink className="w-3 h-3" /> Preview
            </a>
            {personal?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={personal.avatar} alt={personal.name} className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-600/30" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">{personal?.name?.[0] ?? "A"}</span>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-[#0a0a0f]">
          {sidebarOpen && <button className="lg:hidden fixed top-4 right-4 z-[60] bg-[#0d0d14] border border-[#1e1e2e] p-2 rounded-lg" onClick={() => setSidebarOpen(false)}><X className="w-4 h-4 text-[#c2c2df]" /></button>}
          {children}
        </main>
      </div>
    </div>
  );
}
