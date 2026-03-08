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
  CheckSquare,
  Square,
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
  full_name?: string;
  description?: string | null;
  language?: string | null;
  url: string;
  private?: boolean;
  owner?: string;
  _token?: string;
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
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [importingBulk, setImportingBulk] = useState(false);

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

  async function handleBulkSave() {
    setSaving("bulk-save");
    
    // Filter projects that need saving (we'll simply save all for now to ensure consistency, 
    // or we could filter by modified state if we had one. Saving all is safer for bulk action)
    let successCount = 0;
    
    for (const project of projects) {
      if (!project.title) continue;
      
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
      } else {
        ({ error } = await supabase
          .from("portfolio_projects")
          .update({ ...rest, updated_at: new Date().toISOString() })
          .eq("id", id));
      }
      
      if (!error) successCount++;
    }
    
    // Refresh data to get proper IDs for new items
    const { data } = await supabase
      .from("portfolio_projects")
      .select("*")
      .order("sort_order");
      
    if (data) setProjects(data);
    
    showToast(`Berhasil menyimpan ${successCount} proyek.`);
    setSaving(null);
  }

  async function handleBulkStatus(newStatus: "published" | "draft") {
    // Update local state first for immediate UI feedback
    const updatedProjects = projects.map(p => ({ ...p, status: newStatus as "published" | "draft" }));
    setProjects(updatedProjects);
    
    setSaving("bulk-status");
    
    // Only update existing projects in DB. New ones will be saved with the new status when Saved.
    const existingProjects = updatedProjects.filter(p => !p.id.startsWith("new-"));
    let successCount = 0;
    
    for (const project of existingProjects) {
      const { error } = await supabase
        .from("portfolio_projects")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", project.id);
        
      if (!error) successCount++;
    }
    
    showToast(`Berhasil mengubah status ${successCount} proyek menjadi ${newStatus}.`);
    setSaving(null);
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped: GithubRepo[] = (data.repos ?? []).map((repo: any) => ({
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        language: repo.language,
        url: repo.url,
        private: repo.private,
        owner: repo.owner,
        _token: repo._token,
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
    setSelectedRepos([]);
    if (repos.length === 0) await loadGithubRepos();
  }

  async function importSelectedRepos() {
    if (selectedRepos.length === 0) return;
    setImportingBulk(true);
    let successCount = 0;
    
    // Create a new array to accumulate imported projects
    const newItems: Project[] = [];

    for (const repoUrl of selectedRepos) {
      const repo = repos.find(r => r.url === repoUrl);
      if (!repo) continue;

      // Check current projects and already added items in this batch
      const exists = projects.some((p) => p.github?.toLowerCase() === repo.url.toLowerCase()) || 
                     newItems.some((p) => p.github?.toLowerCase() === repo.url.toLowerCase());
                     
      if (exists) continue;

      setImportingRepo(repo.url);

      let title = repo.name;
      let description = repo.description || "Project imported from GitHub.";
      let tags = repo.language ? [repo.language] : [];
      let category = repo.language?.toLowerCase().includes("swift")
        ? "mobile"
        : repo.language?.toLowerCase().includes("kotlin")
          ? "mobile"
          : repo.language?.toLowerCase().includes("python")
            ? "ml"
            : "web";

      // Request AI generated content
      if (repo.owner) {
        try {
          const res = await fetch("/api/generate-project", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              owner: repo.owner,
              repo: repo.name,
              token: repo._token,
              defaultDescription: repo.description,
            }),
          });
          const json = await res.json();
          if (json.success && json.data) {
            if (json.data.title) title = json.data.title;
            if (json.data.description) description = json.data.description;
            if (json.data.tags && Array.isArray(json.data.tags)) tags = json.data.tags;
            if (json.data.category) category = json.data.category;
          }
        } catch (err) {
          console.error("AI Generation error for", repo.name, err);
        }
      }

      newItems.push({
        id: `new-${Date.now()}-${successCount}`,
        ...EMPTY,
        title,
        description,
        github: repo.url,
        tags,
        category,
        sort_order: projects.length + newItems.length,
      });
      successCount++;
    }

    setProjects((prev) => [...prev, ...newItems]);
    if (successCount > 0) {
      showToast(`Berhasil mengimpor ${successCount} repositori.`);
    } else {
      showToast("Tidak ada repositori baru yang diimpor.", false);
    }
    setImportingRepo(null);
    setImportingBulk(false);
    setImportOpen(false);
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
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {toast.msg && (
            <span
              className={`text-xs mr-2 ${toast.ok ? "text-emerald-400" : "text-red-400"}`}
            >
              {toast.msg}
            </span>
          )}
          
          {projects.length > 0 && (
            <div className="flex bg-[#12121c] border border-[#1e1e2e] rounded-lg overflow-hidden mr-2">
              <button
                onClick={() => handleBulkStatus("published")}
                disabled={saving !== null}
                className="px-3 py-2 text-[11px] font-semibold text-[#c2c2df] hover:bg-[#1e1e2e] hover:text-white transition-colors border-r border-[#1e1e2e] disabled:opacity-50"
              >
                Publish All
              </button>
              <button
                onClick={() => handleBulkStatus("draft")}
                disabled={saving !== null}
                className="px-3 py-2 text-[11px] font-semibold text-[#c2c2df] hover:bg-[#1e1e2e] hover:text-white transition-colors border-r border-[#1e1e2e] disabled:opacity-50"
              >
                Draft All
              </button>
              <button
                onClick={handleBulkSave}
                disabled={saving !== null}
                className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 transition-colors disabled:opacity-50"
              >
                {saving === "bulk-save" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save All
              </button>
            </div>
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
                  className="w-full rounded-lg border border-[#1e1e2e] bg-[#111116] px-3 py-2 text-xs text-[#e2e2ef] placeholder-[#5a5a72] focus:border-indigo-500 focus:outline-none mb-3"
                />

                {repos.filter((repo) => repo.name.toLowerCase().includes(repoQuery.toLowerCase())).length > 0 && (
                  <div className="flex items-center justify-between px-1 mb-2">
                    <button 
                      onClick={() => {
                        const filteredUrls = repos
                          .filter((repo) => repo.name.toLowerCase().includes(repoQuery.toLowerCase()))
                          .map(r => r.url);
                        const allSelected = filteredUrls.length > 0 && filteredUrls.every(r => selectedRepos.includes(r));
                        
                        if (!allSelected) {
                          setSelectedRepos(Array.from(new Set([...selectedRepos, ...filteredUrls])));
                        } else {
                          setSelectedRepos(selectedRepos.filter(url => !filteredUrls.includes(url)));
                        }
                      }}
                      className="flex items-center gap-2 cursor-pointer text-xs text-[#c2c2df] hover:text-white transition-colors"
                    >
                      {repos.filter((repo) => repo.name.toLowerCase().includes(repoQuery.toLowerCase())).length > 0 &&
                       repos.filter((repo) => repo.name.toLowerCase().includes(repoQuery.toLowerCase()))
                         .every(r => selectedRepos.includes(r.url)) ? (
                        <CheckSquare className="w-4 h-4 text-indigo-500" />
                      ) : (
                        <Square className="w-4 h-4 text-[#4a4a6a]" />
                      )}
                      <span>Pilih Semua yang Ditampilkan</span>
                    </button>
                    <span className="text-[11px] font-medium bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                      {selectedRepos.length} dipilih
                    </span>
                  </div>
                )}

                <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                  {repos
                    .filter((repo) => repo.name.toLowerCase().includes(repoQuery.toLowerCase()))
                    .map((repo) => (
                  <div 
                    key={repo.url} 
                    onClick={() => {
                      if (selectedRepos.includes(repo.url)) {
                        setSelectedRepos(selectedRepos.filter(id => id !== repo.url));
                      } else {
                        setSelectedRepos([...selectedRepos, repo.url]);
                      }
                    }}
                    className={`group flex items-center justify-between rounded-xl border p-3 transition-all cursor-pointer hover:border-indigo-500/30 ${selectedRepos.includes(repo.url) ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-[#1e1e2e] bg-[#12121c]'}`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="pt-0.5 shrink-0 transition-colors">
                        {selectedRepos.includes(repo.url) ? (
                          <CheckSquare className="w-4 h-4 text-indigo-500" />
                        ) : (
                          <Square className="w-4 h-4 text-[#4a4a6a] group-hover:text-[#6a6a8a]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="truncate text-sm font-semibold text-[#e2e2ef] group-hover:text-indigo-100 transition-colors">{repo.full_name || repo.name}</p>
                          <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${repo.private ? "bg-amber-500/15 text-amber-300 border border-amber-500/30" : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"}`}>
                            {repo.private ? "Private" : "Public"}
                          </span>
                        </div>
                        <p className="truncate text-[11px] text-[#6a6a8a]">{repo.description || "No description"}</p>
                      </div>
                    </div>
                    {importingRepo === repo.url && <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />}
                  </div>
                ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={importSelectedRepos}
                    disabled={importingBulk || selectedRepos.length === 0}
                    className="w-full flex justify-center items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors border border-indigo-500"
                  >
                    {importingBulk ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    {importingBulk ? `Mengimpor ${selectedRepos.length} Repo...` : `Import ${selectedRepos.length > 0 ? selectedRepos.length : ''} Repositori`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
