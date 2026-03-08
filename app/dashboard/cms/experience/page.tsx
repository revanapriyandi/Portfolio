"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Save, Loader2, Briefcase, Building2, Globe, FileCode2 } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";
import { Switch } from "@/components/ui/switch";

interface Exp { 
  id: string; 
  role: string; 
  company: string; 
  type?: string; 
  location?: string;
  website?: string;
  logo_url?: string;
  start_date: string; 
  end_date: string | null;
  current: boolean; 
  description: string; 
  tech_stack?: string[]; 
  sort_order: number; 
}

const EMPTY_EXP: Omit<Exp, "id" | "sort_order"> = {
  role: "", company: "", type: "Full-time", location: "", website: "", logo_url: "",
  start_date: "", end_date: "", current: false, description: "", tech_stack: []
};

export default function ExperienceEditor() {
  const supabase = createClient();
  const [items, setItems] = useState<Exp[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState({ msg: "", ok: true });

  useEffect(() => {
    supabase.from("portfolio_experience").select("*").order("sort_order")
      .then(({ data }) => { setItems(data ?? []); setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast({ msg: "", ok: true }), 2500); };

  async function handleSave(item: Exp) {
    if (!item.company || !item.role) return;
    setSaving(item.id);
    const { id, ...rest } = item;
    let error;
    if (id.startsWith("new-")) {
      ({ error } = await supabase.from("portfolio_experience").insert(rest));
      if (!error) {
        const { data } = await supabase.from("portfolio_experience").select("*").order("sort_order");
        setItems(data ?? []);
      }
    } else {
      ({ error } = await supabase.from("portfolio_experience").update(rest).eq("id", id));
    }
    showToast(error ? "Gagal menyimpan." : "✓ Tersimpan!", !error);
    setSaving(null);
  }

  async function handleDelete(id: string) {
    if (id.startsWith("new-")) { setItems(i => i.filter(x => x.id !== id)); return; }
    await supabase.from("portfolio_experience").delete().eq("id", id);
    setItems(i => i.filter(x => x.id !== id));
    showToast("Berhasil dihapus.");
  }

  function update<K extends keyof Exp>(id: string, field: K, value: Exp[K]) {
    setItems(i => i.map(x => x.id === id ? { ...x, [field]: value } : x));
  }

  function addNew() {
    setItems(i => [...i, { id: `new-${Date.now()}`, ...EMPTY_EXP, sort_order: i.length }]);
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-5 h-5 text-indigo-400 animate-spin" /></div>;

  return (
    <div className="p-6 w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#e2e2ef] flex items-center gap-2"><Briefcase className="w-5 h-5 text-indigo-400" />Experience</h1>
          <p className="text-xs text-[#4a4a6a] mt-1">{items.length} pengalaman kerja otomatis diurutkan</p>
        </div>
        <div className="flex items-center gap-3">
          {toast.msg && <span className={`text-xs ${toast.ok ? "text-emerald-400" : "text-red-400"}`}>{toast.msg}</span>}
          <button onClick={addNew} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-3.5 h-3.5" /> Tambah
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-5 space-y-4 hover:border-[#2a2a3a] transition-colors relative overflow-hidden">
            {/* Status indicator */}
            {item.current && <div className="absolute top-0 right-0 border-b-2 border-l-2 border-[#1e1e2e] bg-indigo-600 px-3 py-1 rounded-bl-xl text-[10px] font-bold text-white uppercase tracking-wider">Current</div>}
            
            {/* Row 1: Role, Company, Type, Location */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1.5 lg:col-span-2">
                <label className="text-xs font-medium text-[#c2c2df] flex items-center gap-1"><Briefcase className="w-3 h-3 text-[#6a6a8a]" /> Role / Jabatan</label>
                <input value={item.role ?? ""} onChange={e => update(item.id, "role", e.target.value)} placeholder="Software Engineer"
                  className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="space-y-1.5 lg:col-span-2">
                <label className="text-xs font-medium text-[#c2c2df] flex items-center gap-1"><Building2 className="w-3 h-3 text-[#6a6a8a]" /> Perusahaan</label>
                <input value={item.company ?? ""} onChange={e => update(item.id, "company", e.target.value)} placeholder="Tech Innovations Ltd."
                  className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="space-y-1.5 lg:col-span-1">
                <label className="text-xs font-medium text-[#c2c2df]">Tipe</label>
                <input value={item.type ?? "Full-time"} onChange={e => update(item.id, "type", e.target.value)} placeholder="Full-time"
                  className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="space-y-1.5 lg:col-span-1">
                <label className="text-xs font-medium text-[#c2c2df]">Lokasi</label>
                <input value={item.location ?? ""} onChange={e => update(item.id, "location", e.target.value)} placeholder="Jakarta, Indonesia (Hybrid)"
                  className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="space-y-1.5 lg:col-span-1">
                <label className="text-xs font-medium text-[#c2c2df]">Tanggal Mulai</label>
                <input value={item.start_date ?? ""} onChange={e => update(item.id, "start_date", e.target.value)} placeholder="Sep 2021"
                  className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="space-y-1.5 lg:col-span-1">
                <label className="text-xs font-medium text-[#c2c2df]">Tanggal Selesai</label>
                <input value={item.end_date ?? ""} onChange={e => update(item.id, "end_date", e.target.value)} disabled={item.current} placeholder={item.current ? "Present" : "Des 2024"}
                  className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-indigo-500" />
              </div>
            </div>

            {/* Row 2: Website & Logo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#c2c2df] flex items-center gap-1"><Globe className="w-3 h-3 text-[#6a6a8a]" /> Website Perusahaan</label>
                <input value={item.website ?? ""} onChange={e => update(item.id, "website", e.target.value)} placeholder="https://..."
                  className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#c2c2df]">Logo URL</label>
                <ImageUpload 
                  value={item.logo_url ?? ""} 
                  onChange={url => update(item.id, "logo_url", url)} 
                  folder="logos" 
                />
              </div>
            </div>

            {/* Row 3: Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#c2c2df]">Deskripsi / Pencapaian</label>
              <textarea rows={3} value={item.description ?? ""} onChange={e => update(item.id, "description", e.target.value)} placeholder="- Merancang arsitektur microservices..."
                className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] resize-none focus:outline-none focus:border-indigo-500" />
            </div>

            {/* Row 4: Tech Stack */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#c2c2df] flex items-center gap-1"><FileCode2 className="w-3 h-3 text-[#6a6a8a]" /> Tech Stack (Pisahkan dengan koma)</label>
              <input value={item.tech_stack?.join(", ") ?? ""} 
                onChange={e => update(item.id, "tech_stack", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} 
                placeholder="React, Next.js, Node.js, Go"
                className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] focus:outline-none focus:border-indigo-500" />
              {item.tech_stack && item.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {item.tech_stack.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 bg-indigo-600/10 border border-indigo-600/20 text-indigo-400 rounded-md">{t}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[#1e1e2e]">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#a1a1aa] hover:text-[#e2e2ef] transition-colors">
                <Switch
                  checked={item.current}
                  onCheckedChange={val => update(item.id, "current", val)}
                />
                Saya masih bekerja di sini
              </label>
              <div className="flex gap-2">
                <button onClick={() => handleDelete(item.id)} className="flex items-center gap-1.5 text-xs text-[#6a6a8a] py-1.5 px-3 rounded-lg hover:text-red-400 hover:bg-red-400/10 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Hapus
                </button>
                <button onClick={() => handleSave(item)} disabled={saving === item.id || !item.company || !item.role} 
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors">
                  {saving === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Simpan
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-16 text-[#3a3a5a]">
            <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Belum ada pengalaman kerja ditambahkan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
