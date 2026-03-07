"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  Star,
  ExternalLink,
  Github,
  FolderKanban,
  Download,
  X,
} from "lucide-react";
import { ImageUpload } from "@/components/image-upload";

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  image_url: string;
  github: string;
  live: string;
  featured: boolean;
  status: "published" | "draft";
  sort_order: number;
}

interface GithubRepo {
  name: string;
  description?: string | null;
  language?: string | null;
  url: string;
  private?: boolean;
}

const EMPTY: Omit<Project, "id"> = {
  title: "",
  description: "",
  tags: [],
  category: "web",
  image_url: "",
  github: "",
  live: "",
  featured: false,
  status: "draft",
  sort_order: 0,
};

const CATEGORIES = [
  "web",
  "mobile",
  "api",
  "tool",
  "design",
  "game",
  "ml",
  "other",
];

export default function ProjectsEditor() {
  const supabase = createClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState({ msg: "", ok: true });
  const [importOpen, setImportOpen] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [importingRepo, setImportingRepo] = useState<string | null>(null);
  const [repoQuery, setRepoQuery] = useState("");

  useEffect(() => {
    supabase
      .from("portfolio_projects")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        setProjects(data ?? []);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: "", ok: true }), 2500);
  };

  async function handleSave(project: Project) {
    if (!project.title) return;
    setSaving(project.id);
    const { id, ...rest } = project;
    let error;
    if (id.startsWith("new-")) {
      ({ error } = await supabase
        .from("portfolio_projects")
        .insert({
          ...rest,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));
      if (!error) {
        const { data } = await supabase
          .from("portfolio_projects")
          .select("*")
          .order("sort_order");
        setProjects(data ?? []);
      }
    } else {
      ({ error } = await supabase
        .from("portfolio_projects")
        .update({ ...rest, updated_at: new Date().toISOString() })
        .eq("id", id));
    }
    showToast(error ? "Gagal menyimpan." : "✓ Tersimpan!", !error);
    setSaving(null);
  }

  async function handleDelete(id: string) {
    if (id.startsWith("new-")) {
      setProjects((p) => p.filter((x) => x.id !== id));
      return;
    }
    await supabase.from("portfolio_projects").delete().eq("id", id);
    setProjects((p) => p.filter((x) => x.id !== id));
    showToast("Proyek dihapus.");
  }

  function addNew() {
    setProjects((p) => [
      ...p,
      { id: `new-${Date.now()}`, ...EMPTY, sort_order: p.length },
    ]);
  }

  function update<K extends keyof Project>(
    id: string,
    field: K,
    value: Project[K],
  ) {
    setProjects((p) =>
      p.map((x) => (x.id === id ? { ...x, [field]: value } : x)),
    );
  }

  async function loadGithubRepos() {
    setLoadingRepos(true);
    try {
      const res = await fetch("/api/github");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "GitHub API error");

      const mapped: GithubRepo[] = (data.repos ?? []).map((repo: {
        name: string; description?: string | null; language?: string | null; url: string; private?: boolean;
      }) => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        url: repo.url,
        private: repo.private,
      }));
      setRepos(mapped);
    } catch {
      setRepos([]);
      showToast("Gagal memuat repo GitHub. Cek token/username di Settings.", false);
    } finally {
      setLoadingRepos(false);
    }
  }

  async function openImportModal() {
    setImportOpen(true);
    setRepoQuery("");
    if (repos.length === 0) await loadGithubRepos();
  }

  function importFromGithub(repo: GithubRepo) {
    setImportingRepo(repo.url);
    const exists = projects.some((project) => project.github?.toLowerCase() === repo.url.toLowerCase());
    if (exists) {
      showToast("Repo ini sudah ada di daftar project.", false);
      setImportingRepo(null);
      return;
    }

    const category = repo.language?.toLowerCase().includes("swift")
      ? "mobile"
      : repo.language?.toLowerCase().includes("kotlin")
        ? "mobile"
        : repo.language?.toLowerCase().includes("python")
          ? "ml"
          : "web";

    setProjects((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        ...EMPTY,
        title: repo.name,
        description: repo.description || "Project imported from GitHub.",
        github: repo.url,
        tags: repo.language ? [repo.language] : [],
        category,
        sort_order: prev.length,
      },
    ]);
    setImportingRepo(null);
    setImportOpen(false);
    showToast("Repo berhasil ditambahkan. Tinggal review lalu Simpan.");
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
      </div>
    );

  return (
    <div className="p-6 w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#e2e2ef] flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-indigo-400" />
            Projects
          </h1>
          <p className="text-xs text-[#4a4a6a] mt-1">
            {projects.length} proyek
          </p>
        </div>
        <div className="flex items-center gap-2">
          {toast.msg && (
            <span
              className={`text-xs ${toast.ok ? "text-emerald-400" : "text-red-400"}`}
            >
              {toast.msg}
            </span>
          )}
          <button
            onClick={openImportModal}
            className="flex items-center gap-2 bg-[#12121c] border border-[#1e1e2e] hover:border-[#2a2a3a] text-[#c2c2df] text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Import GitHub
          </button>
          <button
            onClick={addNew}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {projects.map((p) => (
          <div
            key={p.id}
            className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-5 space-y-4 hover:border-[#2a2a3a] transition-colors"
          >
            {/* Row 1 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-[#c2c2df]">
                  Nama Proyek
                </label>
                <input
                  value={p.title}
                  onChange={(e) => update(p.id, "title", e.target.value)}
                  placeholder="My Awesome Project"
                  className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] placeholder-[#3a3a5a] focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#c2c2df]">
                  Kategori
                </label>
                <select
                  value={p.category ?? "web"}
                  onChange={(e) => update(p.id, "category", e.target.value)}
                  className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] focus:outline-none focus:border-indigo-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#c2c2df]">
                  Status
                </label>
                <select
                  value={p.status ?? "draft"}
                  onChange={(e) =>
                    update(
                      p.id,
                      "status",
                      e.target.value as "published" | "draft",
                    )
                  }
                  className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] focus:outline-none focus:border-indigo-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            {/* Row 2: Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#c2c2df]">
                Deskripsi
              </label>
              <textarea
                rows={2}
                value={p.description}
                onChange={(e) => update(p.id, "description", e.target.value)}
                placeholder="Deskripsi singkat proyek..."
                className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] placeholder-[#3a3a5a] focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Row 3: URLs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#c2c2df] flex items-center gap-1">
                  <Github className="w-3 h-3" /> GitHub URL
                </label>
                <input
                  value={p.github ?? ""}
                  onChange={(e) => update(p.id, "github", e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] placeholder-[#3a3a5a] focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#c2c2df] flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Live URL
                </label>
                <input
                  value={p.live ?? ""}
                  onChange={(e) => update(p.id, "live", e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] placeholder-[#3a3a5a] focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-1.5 md:col-span-3">
                <label className="text-xs font-medium text-[#c2c2df]">Image / OG Preview</label>
                <ImageUpload 
                  value={p.image_url ?? ""} 
                  onChange={url => update(p.id, "image_url", url)} 
                  folder="projects"
                />
              </div>
            </div>

            {/* Row 4: Tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#c2c2df]">
                Tags (pisah koma)
              </label>
              <input
                value={p.tags?.join(", ")}
                onChange={(e) =>
                  update(
                    p.id,
                    "tags",
                    e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  )
                }
                placeholder="React, TypeScript, Supabase"
                className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] placeholder-[#3a3a5a] focus:outline-none focus:border-indigo-500"
              />
              <div className="flex flex-wrap gap-1 mt-1">
                {p.tags?.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] px-2 py-0.5 bg-indigo-600/10 border border-indigo-600/20 text-indigo-400 rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Row 5: Actions */}
            <div className="flex items-center justify-between pt-1 border-t border-[#1e1e2e]">
              <label className="flex items-center gap-2 cursor-pointer">
                <button
                  onClick={() => update(p.id, "featured", !p.featured)}
                  className={`w-8 h-4 rounded-full transition-colors relative ${p.featured ? "bg-indigo-600" : "bg-[#2a2a3a]"}`}
                >
                  <span
                    className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${p.featured ? "translate-x-4" : "translate-x-0.5"}`}
                  />
                </button>
                <Star
                  className={`w-3 h-3 ${p.featured ? "text-yellow-400" : "text-[#4a4a6a]"}`}
                />
                <span className="text-xs text-[#6a6a8a]">Featured</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(p.id)}
                  className="flex items-center gap-1.5 text-xs text-[#4a4a6a] hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-400/5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus
                </button>
                <button
                  onClick={() => handleSave(p)}
                  disabled={saving === p.id || !p.title}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors"
                >
                  {saving === p.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  Simpan
                </button>
              </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="text-center py-16 text-[#3a3a5a]">
            <FolderKanban className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Belum ada proyek.</p>
          </div>
        )}
      </div>

      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setImportOpen(false)} />
          <div className="relative w-full max-w-2xl rounded-2xl border border-[#1e1e2e] bg-[#0d0d14] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#e2e2ef]">Import Project dari GitHub</h2>
                <p className="mt-1 text-[11px] text-[#6a6a8a]">Pilih repo untuk ditambahkan sebagai draft project.</p>
              </div>
              <button onClick={() => setImportOpen(false)} className="rounded-lg p-1.5 text-[#6a6a8a] hover:bg-[#1e1e2e] hover:text-[#c2c2df]">
                <X className="h-4 w-4" />
              </button>
            </div>

            {loadingRepos ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
              </div>
            ) : repos.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#27272a] p-6 text-center text-xs text-[#6a6a8a]">
                Repo tidak ditemukan. Pastikan GitHub username/token sudah diisi di Settings.
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  value={repoQuery}
                  onChange={(e) => setRepoQuery(e.target.value)}
                  placeholder="Cari nama repo..."
                  className="w-full rounded-lg border border-[#1e1e2e] bg-[#111116] px-3 py-2 text-xs text-[#e2e2ef] placeholder-[#5a5a72] focus:border-indigo-500 focus:outline-none"
                />
                <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                  {repos
                    .filter((repo) => repo.name.toLowerCase().includes(repoQuery.toLowerCase()))
                    .map((repo) => (
                  <div key={repo.url} className="flex items-center justify-between rounded-xl border border-[#1e1e2e] bg-[#12121c] p-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-[#e2e2ef]">{repo.name}</p>
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${repo.private ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"}`}>
                          {repo.private ? "Private" : "Public"}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-[#6a6a8a]">{repo.description || "No description"}</p>
                    </div>
                    <button
                      onClick={() => importFromGithub(repo)}
                      disabled={importingRepo === repo.url}
                      className="ml-3 rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                    >
                      {importingRepo === repo.url ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Import"}
                    </button>
                  </div>
                ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
