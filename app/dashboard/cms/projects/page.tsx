"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Save, Loader2, Star } from "lucide-react";

interface Project { id: string; title: string; description: string; tags: string[]; github: string; live: string; featured: boolean; sort_order: number; }

export default function ProjectsEditor() {
  const supabase = createClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    supabase.from("portfolio_projects").select("*").order("sort_order")
      .then(({ data }) => { setProjects(data ?? []); setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  async function handleSave(project: Project) {
    setSaving(project.id);
    const { id, ...rest } = project;
    const { error } = id.startsWith("new-")
      ? await supabase.from("portfolio_projects").insert({ ...rest })
      : await supabase.from("portfolio_projects").update(rest).eq("id", id);
    if (!error && id.startsWith("new-")) {
      const { data } = await supabase.from("portfolio_projects").select("*").order("sort_order");
      setProjects(data ?? []);
    }
    showToast(error ? "Gagal menyimpan." : "Tersimpan!");
    setSaving(null);
  }

  async function handleDelete(id: string) {
    if (id.startsWith("new-")) { setProjects(p => p.filter(x => x.id !== id)); return; }
    await supabase.from("portfolio_projects").delete().eq("id", id);
    setProjects(p => p.filter(x => x.id !== id));
    showToast("Proyek dihapus.");
  }

  function addNew() {
    setProjects(p => [...p, { id: `new-${Date.now()}`, title: "", description: "", tags: [], github: "", live: "", featured: false, sort_order: p.length }]);
  }

  function update(id: string, field: keyof Project, value: Project[typeof field]) {
    setProjects(p => p.map(x => x.id === id ? { ...x, [field]: value } : x));
  }

  if (loading) return <div className="p-8 text-sm text-[#52525b]">Memuat...</div>;

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-lg font-bold text-[#fafafa]">Projects</h2><p className="text-xs text-[#52525b] mt-1">Kelola proyek yang ditampilkan di portfolio.</p></div>
        <button onClick={addNew} className="inline-flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs font-medium px-4 py-2 rounded-md transition-colors">
          <Plus className="w-3.5 h-3.5" /> Tambah Proyek
        </button>
      </div>

      {toast && <p className="text-xs text-emerald-400 mb-4">{toast}</p>}

      <div className="space-y-4">
        {projects.map((p) => (
          <div key={p.id} className="border border-[#27272a] rounded-xl p-4 bg-[#111113] space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-medium text-[#52525b] mb-1 block">Nama Proyek</label>
                <input value={p.title} onChange={e => update(p.id, "title", e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-md px-3 py-2 text-xs text-[#fafafa] focus:border-[#3b82f6] focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-medium text-[#52525b] mb-1 block">Tags (pisah koma)</label>
                <input value={p.tags?.join(", ")} onChange={e => update(p.id, "tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-md px-3 py-2 text-xs text-[#fafafa] focus:border-[#3b82f6] focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-medium text-[#52525b] mb-1 block">Deskripsi</label>
              <textarea rows={2} value={p.description} onChange={e => update(p.id, "description", e.target.value)}
                className="w-full bg-[#09090b] border border-[#27272a] rounded-md px-3 py-2 text-xs text-[#fafafa] focus:border-[#3b82f6] focus:outline-none resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-medium text-[#52525b] mb-1 block">GitHub URL</label>
                <input value={p.github ?? ""} onChange={e => update(p.id, "github", e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-md px-3 py-2 text-xs text-[#fafafa] focus:border-[#3b82f6] focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-medium text-[#52525b] mb-1 block">Live URL</label>
                <input value={p.live ?? ""} onChange={e => update(p.id, "live", e.target.value)}
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-md px-3 py-2 text-xs text-[#fafafa] focus:border-[#3b82f6] focus:outline-none" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={p.featured} onChange={e => update(p.id, "featured", e.target.checked)} className="rounded" />
                <Star className="w-3 h-3 text-[#3b82f6]" />
                <span className="text-xs text-[#71717a]">Featured</span>
              </label>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDelete(p.id)} className="inline-flex items-center gap-1.5 text-xs text-[#52525b] hover:text-red-400 transition-colors px-3 py-1.5 rounded-md hover:bg-red-400/5">
                  <Trash2 className="w-3.5 h-3.5" /> Hapus
                </button>
                <button onClick={() => handleSave(p)} disabled={saving === p.id}
                  className="inline-flex items-center gap-1.5 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-md transition-colors">
                  {saving === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Simpan
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
