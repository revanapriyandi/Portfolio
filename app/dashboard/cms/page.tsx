"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  FolderKanban, Wrench, Briefcase, GraduationCap,
  Star, GitFork, Users, Eye, Globe, ExternalLink,
  TrendingUp, Activity, Github, RefreshCw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* ─── Types ─────────────────────────────────────────── */
interface Stats { projects: number; skills: number; experience: number; education: number; }
interface Project { id: string; title: string; tags: string[]; featured: boolean; github?: string; live?: string; }
interface SkillCat { category: string; items: string[]; }
interface GithubData {
  user?: { name: string; followers: number; publicRepos: number; profileUrl: string };
  stats?: { totalStars: number; totalForks: number; totalRepos: number };
  languages?: { name: string; count: number }[];
  topRepos?: { name: string; stars: number; forks: number; language: string; url: string }[];
}
interface AnalyticsData {
  configured: boolean;
  data?: { date: string; pageviews: number; sessions: number; users: number }[];
  totals?: { pageviews: number; sessions: number; users: number };
}

/* ─── Colors ─────────────────────────────────────────── */
const CHART_COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#84cc16"];

/* ─── Helpers ────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub }: {
  icon: React.ElementType; label: string; value: number | string; sub?: string;
}) {
  return (
    <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-indigo-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold text-[#e2e2ef] leading-none">{value}</p>
        <p className="text-[10px] text-[#4a4a6a] mt-0.5">{label}</p>
        {sub && <p className="text-[9px] text-indigo-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-[#e2e2ef]">{title}</h3>
      {sub && <p className="text-xs text-[#4a4a6a] mt-0.5">{sub}</p>}
    </div>
  );
}

/* ─── Custom Tooltip ─────────────────────────────────── */
function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-lg px-3 py-2 shadow-xl text-xs">
      {label && <p className="text-[#6a6a8a] mb-1">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-semibold">{p.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────── */
export default function DashboardPage() {
  const supabase = createClient();
  const [stats, setStats] = useState<Stats>({ projects: 0, skills: 0, experience: 0, education: 0 });
  const [projects, setProjects] = useState<Project[]>([]);
  const [skillCats, setSkillCats] = useState<SkillCat[]>([]);
  const [github, setGithub] = useState<GithubData>({});
  const [analytics, setAnalytics] = useState<AnalyticsData>({ configured: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: proj }, { data: skills }, { data: exp }, { data: edu }, gh, an] = await Promise.all([
        supabase.from("portfolio_projects").select("id,title,tags,featured,github,live").order("sort_order"),
        supabase.from("portfolio_skills").select("category,items"),
        supabase.from("portfolio_experience").select("id"),
        supabase.from("portfolio_education").select("id"),
        fetch("/api/github").then((r) => r.json()),
        fetch("/api/analytics").then((r) => r.json()),
      ]);
      setProjects(proj ?? []);
      setSkillCats(skills ?? []);
      setStats({
        projects: proj?.length ?? 0,
        skills: (skills ?? []).reduce((a: number, c: SkillCat) => a + (c.items?.length ?? 0), 0),
        experience: exp?.length ?? 0,
        education: edu?.length ?? 0,
      });
      setGithub(gh);
      setAnalytics(an);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Derived chart data */
  const skillsByCategory = skillCats.map((c) => ({ name: c.category.replace(" & Cloud", ""), count: c.items?.length ?? 0 }));
  const projectPie = [
    { name: "Featured", value: projects.filter((p) => p.featured).length },
    { name: "Regular", value: projects.filter((p) => !p.featured).length },
  ];
  const analyticsChartData = (analytics.data ?? []).map((d) => ({
    ...d,
    date: d.date.replace(/(\d{4})(\d{2})(\d{2})/, "$2/$3"),
  })).slice(-14);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-64">
        <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-lg font-bold text-[#e2e2ef]">Dashboard Overview</h1>
        <p className="text-xs text-[#4a4a6a] mt-0.5">Ringkasan data portfolio dan statistik real-time.</p>
      </div>

      {/* ── Stats row ────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={FolderKanban} label="Total Projects" value={stats.projects} sub={`${projects.filter(p => p.featured).length} featured`} />
        <StatCard icon={Wrench} label="Total Skills" value={stats.skills} sub={`${skillCats.length} categories`} />
        <StatCard icon={Briefcase} label="Work Experience" value={stats.experience} sub="entries" />
        <StatCard icon={GraduationCap} label="Education" value={stats.education} sub="records" />
      </div>

      {/* ── GitHub + Analytics stats ─────────────────── */}
      {github.stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={Star} label="GitHub Stars" value={github.stats.totalStars} />
          <StatCard icon={GitFork} label="Total Forks" value={github.stats.totalForks} />
          <StatCard icon={FolderKanban} label="Public Repos" value={github.stats.totalRepos} />
          <StatCard icon={Users} label="Followers" value={github.user?.followers ?? 0} />
        </div>
      )}
      {analytics.configured && analytics.totals && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={Eye} label="Page Views (28d)" value={analytics.totals.pageviews.toLocaleString()} />
          <StatCard icon={Activity} label="Sessions (28d)" value={analytics.totals.sessions.toLocaleString()} />
          <StatCard icon={Users} label="Active Users (28d)" value={analytics.totals.users.toLocaleString()} />
        </div>
      )}

      {/* ── Row: Analytics chart + Skills chart ──────── */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Analytics line chart */}
        <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-4">
          <SectionTitle
            title={analytics.configured ? "Page Views — Last 14 Days" : "Google Analytics"}
            sub={!analytics.configured ? "Isi GA4_PROPERTY_ID di .env.local untuk mengaktifkan" : undefined}
          />
          {analytics.configured && analyticsChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={analyticsChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#4a4a6a" }} />
                <YAxis tick={{ fontSize: 10, fill: "#4a4a6a" }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="pageviews" stroke="#6366f1" strokeWidth={2} dot={false} name="Pageviews" />
                <Line type="monotone" dataKey="sessions" stroke="#06b6d4" strokeWidth={2} dot={false} name="Sessions" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex flex-col items-center justify-center gap-2 border border-dashed border-[#1e1e2e] rounded-lg">
              <TrendingUp className="w-8 h-8 text-[#2a2a3a]" />
              <p className="text-xs text-[#4a4a6a] text-center max-w-[200px]">
                Tambahkan <code className="text-indigo-400">GA4_PROPERTY_ID</code> dan <code className="text-indigo-400">GOOGLE_APPLICATION_CREDENTIALS_JSON</code> ke <code className="text-indigo-400">.env.local</code>
              </p>
            </div>
          )}
        </div>

        {/* Skills bar chart */}
        <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-4">
          <SectionTitle title="Skills by Category" />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={skillsByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#4a4a6a" }} />
              <YAxis tick={{ fontSize: 10, fill: "#4a4a6a" }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Skills" radius={[4, 4, 0, 0]}>
                {skillsByCategory.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row: GitHub languages + Projects pie ─────── */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* GitHub language pie */}
        <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Github className="w-4 h-4 text-indigo-400" />
            <SectionTitle title="GitHub — Languages" />
          </div>
          {github.languages?.length ? (
            <div className="flex gap-4 items-center">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={github.languages} cx="50%" cy="50%" innerRadius={38} outerRadius={62}
                    dataKey="count" stroke="none">
                    {github.languages.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                {github.languages.map((l, i) => (
                  <div key={l.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-xs text-[#a2a2bf] truncate">{l.name}</span>
                    <span className="text-xs text-[#4a4a6a] ml-auto">{l.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[140px] flex items-center justify-center">
              <p className="text-xs text-[#4a4a6a]">Loading GitHub data...</p>
            </div>
          )}
        </div>

        {/* Projects pie */}
        <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-4">
          <SectionTitle title="Projects Breakdown" />
          <div className="flex gap-4 items-center">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={projectPie} cx="50%" cy="50%" innerRadius={38} outerRadius={62}
                  dataKey="value" stroke="none">
                  <Cell fill="#6366f1" />
                  <Cell fill="#1e1e2e" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-2xl font-bold text-[#e2e2ef]">{projects.filter(p => p.featured).length}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <p className="text-xs text-[#4a4a6a]">Featured</p>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#e2e2ef]">{projects.filter(p => !p.featured).length}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-[#2a2a3a]" />
                  <p className="text-xs text-[#4a4a6a]">Regular</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Projects DataTable ────────────────────────── */}
      <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1e1e2e]">
          <SectionTitle title="Projects Table" sub={`${projects.length} total`} />
          <a href="/dashboard/cms/projects"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
            Manage <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e1e2e]">
                {["Project", "Tags", "Featured", "Links"].map((h) => (
                  <th key={h} className="text-left text-[10px] font-semibold text-[#4a4a6a] uppercase tracking-wider px-5 py-2.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map((p, i) => (
                <tr key={p.id} className={`border-b border-[#1e1e2e] hover:bg-[#12121c] transition-colors ${i === projects.length - 1 ? "border-0" : ""}`}>
                  <td className="px-5 py-3">
                    <p className="text-xs font-medium text-[#c2c2df]">{p.title}</p>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.tags?.slice(0, 3).map((t) => (
                        <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-[#1e1e2e] text-[#6a6a8a] border border-[#2a2a3a]">{t}</span>
                      ))}
                      {(p.tags?.length ?? 0) > 3 && (
                        <span className="text-[9px] text-[#4a4a6a]">+{p.tags.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${p.featured ? "bg-indigo-600/10 border-indigo-600/30 text-indigo-400" : "bg-[#1e1e2e] border-[#2a2a3a] text-[#4a4a6a]"}`}>
                      {p.featured ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      {p.github && (
                        <a href={p.github} target="_blank" rel="noopener noreferrer"
                          className="text-[#4a4a6a] hover:text-[#c2c2df] transition-colors">
                          <Github className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {p.live && (
                        <a href={p.live} target="_blank" rel="noopener noreferrer"
                          className="text-[#4a4a6a] hover:text-indigo-400 transition-colors">
                          <Globe className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── GitHub Top Repos + FastWork ───────────────── */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* GitHub top repos */}
        <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#1e1e2e]">
            <Github className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-[#e2e2ef]">Top GitHub Repos</h3>
          </div>
          <div className="divide-y divide-[#1e1e2e]">
            {(github.topRepos ?? []).slice(0, 5).map((repo) => (
              <a key={repo.name} href={repo.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between px-5 py-3 hover:bg-[#12121c] transition-colors group">
                <div>
                  <p className="text-xs font-medium text-[#c2c2df] group-hover:text-indigo-400 transition-colors">{repo.name}</p>
                  {repo.language && <p className="text-[9px] text-[#4a4a6a] mt-0.5">{repo.language}</p>}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-[#4a4a6a]">
                  <span className="flex items-center gap-1"><Star className="w-3 h-3" />{repo.stars}</span>
                  <span className="flex items-center gap-1"><GitFork className="w-3 h-3" />{repo.forks}</span>
                </div>
              </a>
            ))}
            {(!github.topRepos || github.topRepos.length === 0) && (
              <div className="px-5 py-6 text-xs text-[#4a4a6a] text-center">Loading repositories...</div>
            )}
          </div>
        </div>

        {/* FastWork widget */}
        <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#1e1e2e]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#e2e2ef]">FastWork Profile</h3>
              <a href="https://fastwork.id/user/revan_" target="_blank" rel="noopener noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                Visit <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#e2e2ef]">@revan_</p>
                <p className="text-xs text-[#4a4a6a]">FastWork Freelancer</p>
              </div>
            </div>
            <p className="text-xs text-[#6a6a8a] leading-relaxed">
              Tersedia sebagai freelancer di FastWork untuk proyek web development, API integration, dan solusi digital.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Platform", value: "FastWork.id" },
                { label: "Status", value: "Available" },
                { label: "Category", value: "Web Dev" },
                { label: "Specialty", value: "Laravel / React" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#12121c] rounded-lg px-3 py-2 border border-[#1e1e2e]">
                  <p className="text-[9px] text-[#4a4a6a]">{label}</p>
                  <p className="text-xs font-medium text-[#c2c2df] mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            <a href="https://fastwork.id/user/revan_" target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-600/20 text-indigo-400 text-xs font-medium px-4 py-2.5 rounded-lg transition-all">
              <ExternalLink className="w-3.5 h-3.5" /> Buka FastWork Profile
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
