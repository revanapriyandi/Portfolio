"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";

interface Exp { id: string; role: string; company: string; type: string; period: string; current: boolean; description: string; skills: string[]; sort_order: number; }

export default function ExperienceEditor() {
  const supabase = createClient();
  const [items, setItems] = useState<Exp[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    supabase.from("portfolio_experience").select("*").order("sort_order")
      .then(({ data }) => { setItems(data ?? []); setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  async function handleSave(item: Exp) {
    setSaving(item.id);
    const { id, ...rest } = item;
    const { error } = id.startsWith("new-")
      ? await supabase.from("portfolio_experience").insert(rest)
      : await supabase.from("portfolio_experience").update(rest).eq("id", id);
    if (!error && id.startsWith("new-")) {
      const { data } = await supabase.from("portfolio_experience").select("*").order("sort_order");
      setItems(data ?? []);
    }
    showToast(error ? "Gagal." : "Tersimpan!");
    setSaving(null);
  }

  async function handleDelete(id: string) {
    if (id.startsWith("new-")) { setItems(i => i.filter(x => x.id !== id)); return; }
    await supabase.from("portfolio_experience").delete().eq("id", id);
    setItems(i => i.filter(x => x.id !== id));
  }

  function update(id: string, field: keyof Exp, value: Exp[typeof field]) {
    setItems(i => i.map(x => x.id === id ? { ...x, [field]: value } : x));
  }

  function addNew() {
    setItems(i => [...i, { id: `new-${Date.now()}`, role: "", company: "", type: "Full-time", period: "", current: false, description: "", skills: [], sort_order: i.length }]);
  }

  if (loading) return <div className="p-8 text-sm text-[#52525b]">Memuat...</div>;

  const inp = "w-full bg-[#09090b] border border-[#27272a] rounded-md px-3 py-2 text-xs text-[#fafafa] focus:border-[#3b82f6] focus:outline-none";

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-lg font-bold text-[#fafafa]">Experience</h2><p className="text-xs text-[#52525b] mt-1">Riwayat pekerjaan.</p></div>
        <button onClick={addNew} className="inline-flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs font-medium px-4 py-2 rounded-md transition-colors">
          <Plus className="w-3.5 h-3.5" /> Tambah
        </button>
      </div>
      {toast && <p className="text-xs text-emerald-400 mb-4">{toast}</p>}

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="border border-[#27272a] rounded-xl p-4 bg-[#111113] space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[["role", "Jabatan"], ["company", "Perusahaan"], ["type", "Tipe (Full-time/Internship)"], ["period", "Periode"]].map(([k, l]) => (
                <div key={k}><label className="text-[10px] text-[#52525b] mb-1 block">{l}</label>
                  <input value={(item[k as keyof Exp] as string) ?? ""} onChange={e => update(item.id, k as keyof Exp, e.target.value)} className={inp} /></div>
              ))}
            </div>
            <div><label className="text-[10px] text-[#52525b] mb-1 block">Deskripsi</label>
              <textarea rows={2} value={item.description} onChange={e => update(item.id, "description", e.target.value)} className={`${inp} resize-none`} /></div>
            <div><label className="text-[10px] text-[#52525b] mb-1 block">Skills (pisah koma)</label>
              <input value={item.skills?.join(", ")} onChange={e => update(item.id, "skills", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} className={inp} /></div>
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#71717a]">
                <input type="checkbox" checked={item.current} onChange={e => update(item.id, "current", e.target.checked)} /> Posisi saat ini
              </label>
              <div className="flex gap-2">
                <button onClick={() => handleDelete(item.id)} className="inline-flex items-center gap-1.5 text-xs text-[#52525b] hover:text-red-400 px-3 py-1.5 rounded-md hover:bg-red-400/5 transition-colors"><Trash2 className="w-3.5 h-3.5" /> Hapus</button>
                <button onClick={() => handleSave(item)} disabled={saving === item.id} className="inline-flex items-center gap-1.5 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-md transition-colors">
                  {saving === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Simpan
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
