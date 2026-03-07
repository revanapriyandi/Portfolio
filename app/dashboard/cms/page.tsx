"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  FolderKanban, Briefcase, Code2, 
  Settings, LayoutTemplate, PlusCircle, ArrowUpRight,
  Github, Activity, Users, Star, Eye
} from "lucide-react";

interface Stats {
  projects: number;
  experience: number;
  education: number;
  skills: number;
  services: number;
  testimonials: number;
  pages: number;
}

interface GithubData {
  user?: { name: string; followers: number; publicRepos: number; profileUrl: string };
  stats?: { totalStars: number; totalForks: number; totalRepos: number };
}

interface AnalyticsData {
  configured: boolean;
  totals?: { pageviews: number; sessions: number; users: number };
}

export default function DashboardOverview() {
  const supabase = createClient();
  const [stats, setStats] = useState<Stats>({
    projects: 0, experience: 0, education: 0, 
    skills: 0, services: 0, testimonials: 0, pages: 0
  });
  const [github, setGithub] = useState<GithubData>({});
  const [analytics, setAnalytics] = useState<AnalyticsData>({ configured: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const [
        { count: projCount }, { count: expCount }, { count: eduCount }, 
        { data: skillsData }, { count: srvCount }, { count: testCount }, { count: pageCount },
        ghData, anData
      ] = await Promise.all([
        supabase.from("portfolio_projects").select("*", { count: 'exact', head: true }),
        supabase.from("portfolio_experience").select("*", { count: 'exact', head: true }),
        supabase.from("portfolio_education").select("*", { count: 'exact', head: true }),
        supabase.from("portfolio_skills").select("items"),
        supabase.from("portfolio_services").select("*", { count: 'exact', head: true }),
        supabase.from("portfolio_testimonials").select("*", { count: 'exact', head: true }),
        supabase.from("portfolio_pages").select("*", { count: 'exact', head: true }),
        fetch("/api/github").then(r => r.json()).catch(() => ({})),
        fetch("/api/analytics").then(r => r.json()).catch(() => ({ configured: false }))
      ]);

      const totalSkills = (skillsData ?? []).reduce((acc, cat) => acc + (cat.items?.length || 0), 0);

      setStats({
        projects: projCount || 0,
        experience: expCount || 0,
        education: eduCount || 0,
        skills: totalSkills,
        services: srvCount || 0,
        testimonials: testCount || 0,
        pages: pageCount || 0
      });
      setGithub(ghData);
      setAnalytics(anData);
      setLoading(false);
    }
    loadStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const StatCard = ({ title, value, icon: Icon, href, color = "indigo" }: {
    title: string; value: number; icon: React.ElementType; href: string; color?: string;
  }) => (
    <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-5 hover:border-[#2a2a3a] transition-colors group relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#c2c2df]">{title}</p>
          <h3 className="text-3xl font-bold text-[#e2e2ef] mt-2 group-hover:text-white transition-colors">
            {loading ? <span className="animate-pulse bg-[#1e1e2e] h-8 w-12 rounded inline-block" /> : value}
          </h3>
        </div>
        <div className={`w-10 h-10 rounded-lg bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center`}>
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs">
        <Link href={href} className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1">
          Kelola <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="p-6 w-full space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#e2e2ef]">Dashboard Overview</h1>
        <p className="text-sm text-[#8a8aaa] mt-1">Ringkasan portfolio dan analitik situs Anda.</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Projects" value={stats.projects} icon={FolderKanban} href="/dashboard/cms/projects" color="indigo" />
        <StatCard title="Tech Skills" value={stats.skills} icon={Code2} href="/dashboard/cms/skills" color="blue" />
        <StatCard title="Experience" value={stats.experience} icon={Briefcase} href="/dashboard/cms/experience" color="emerald" />
        <StatCard title="Pages Built" value={stats.pages} icon={LayoutTemplate} href="/dashboard/cms/pages" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-5">
          <h3 className="text-sm font-bold text-[#e2e2ef] mb-4 flex items-center gap-2"><PlusCircle className="w-4 h-4 text-indigo-400" /> Quick Actions</h3>
          <div className="space-y-2">
            <Link href="/dashboard/cms/pages" className="flex items-center gap-3 p-3 rounded-lg border border-[#1e1e2e] hover:bg-[#1a1a24] hover:border-[#2a2a3a] transition-all group">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/20 transition-colors"><LayoutTemplate className="w-4 h-4 text-indigo-400" /></div>
              <div><p className="text-xs font-semibold text-[#e2e2ef]">Buat Halaman</p><p className="text-[10px] text-[#8a8aaa]">Buka Puck Visual Builder</p></div>
            </Link>
            <Link href="/dashboard/cms/projects" className="flex items-center gap-3 p-3 rounded-lg border border-[#1e1e2e] hover:bg-[#1a1a24] hover:border-[#2a2a3a] transition-all group">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors"><FolderKanban className="w-4 h-4 text-blue-400" /></div>
              <div><p className="text-xs font-semibold text-[#e2e2ef]">Tambah Project</p><p className="text-[10px] text-[#8a8aaa]">Upload karya terbaru</p></div>
            </Link>
            <Link href="/dashboard/cms/settings" className="flex items-center gap-3 p-3 rounded-lg border border-[#1e1e2e] hover:bg-[#1a1a24] hover:border-[#2a2a3a] transition-all group">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors"><Settings className="w-4 h-4 text-emerald-400" /></div>
              <div><p className="text-xs font-semibold text-[#e2e2ef]">System Settings</p><p className="text-[10px] text-[#8a8aaa]">Atur SEO & API Keys</p></div>
            </Link>
          </div>
        </div>

        {/* GitHub & Analytics */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* GitHub Card */}
          <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-5 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-5"><Github className="w-32 h-32" /></div>
            <div className="relative z-10">
              <h3 className="text-sm font-bold text-[#e2e2ef] mb-4 flex items-center gap-2"><Github className="w-4 h-4" /> GitHub Stats</h3>
              {!github.user ? (
                <div className="text-sm text-[#8a8aaa] bg-[#1a1a24] p-4 rounded-lg border border-[#1e1e2e] border-dashed">
                  Token GitHub belum dikonfigurasi. Atur di <Link href="/dashboard/cms/settings" className="text-indigo-400 underline decoration-indigo-400/30 underline-offset-2">System Settings</Link>.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-[#8a8aaa] font-medium uppercase tracking-wider mb-1">Total Stars</p>
                    <p className="text-2xl font-bold text-[#e2e2ef] flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" /> {github.stats?.totalStars || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8a8aaa] font-medium uppercase tracking-wider mb-1">Followers</p>
                    <p className="text-2xl font-bold text-[#e2e2ef] flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" /> {github.user.followers || 0}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Analytics Card */}
          <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-5 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-5"><Activity className="w-32 h-32 text-emerald-500" /></div>
            <div className="relative z-10">
              <h3 className="text-sm font-bold text-[#e2e2ef] mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400" /> Google Analytics</h3>
              {!analytics.configured ? (
                <div className="text-sm text-[#8a8aaa] bg-[#1a1a24] p-4 rounded-lg border border-[#1e1e2e] border-dashed">
                  Google Analytics 4 belum dikonfigurasi. Atur property ID & JSON Key di <Link href="/dashboard/cms/settings" className="text-indigo-400 underline decoration-indigo-400/30 underline-offset-2">System Settings</Link>.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-[#8a8aaa] font-medium uppercase tracking-wider mb-1">Pageviews</p>
                    <p className="text-2xl font-bold text-[#e2e2ef] flex items-center gap-2">
                      <Eye className="w-4 h-4 text-emerald-400" /> {analytics.totals?.pageviews || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8a8aaa] font-medium uppercase tracking-wider mb-1">Users</p>
                    <p className="text-2xl font-bold text-[#e2e2ef] flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-400" /> {analytics.totals?.users || 0}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
