"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";

interface Edu { id: string; degree: string; institution: string; period: string; current: boolean; sort_order: number; }
interface Cert { id: string; name: string; issuer: string; sort_order: number; }

export default function EducationEditor() {
  const supabase = createClient();
  const [edus, setEdus] = useState<Edu[]>([]);
  const [certs, setCerts] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    Promise.all([
      supabase.from("portfolio_education").select("*").order("sort_order"),
      supabase.from("portfolio_certifications").select("*").order("sort_order"),
    ]).then(([{ data: e }, { data: c }]) => { setEdus(e ?? []); setCerts(c ?? []); setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const inp = "w-full bg-[#09090b] border border-[#27272a] rounded-md px-3 py-2 text-xs text-[#fafafa] focus:border-[#3b82f6] focus:outline-none";

  async function saveEdu(item: Edu) {
    setSaving(item.id);
    const { id, ...rest } = item;
    const { error } = id.startsWith("new-") ? await supabase.from("portfolio_education").insert(rest) : await supabase.from("portfolio_education").update(rest).eq("id", id);
    if (!error && id.startsWith("new-")) { const { data } = await supabase.from("portfolio_education").select("*").order("sort_order"); setEdus(data ?? []); }
    showToast(error ? "Gagal." : "Tersimpan!"); setSaving(null);
  }
  async function deleteEdu(id: string) {
    if (id.startsWith("new-")) { setEdus(e => e.filter(x => x.id !== id)); return; }
    await supabase.from("portfolio_education").delete().eq("id", id);
    setEdus(e => e.filter(x => x.id !== id));
  }
  async function saveCert(item: Cert) {
    setSaving(`c-${item.id}`);
    const { id, ...rest } = item;
    const { error } = id.startsWith("new-") ? await supabase.from("portfolio_certifications").insert(rest) : await supabase.from("portfolio_certifications").update(rest).eq("id", id);
    if (!error && id.startsWith("new-")) { const { data } = await supabase.from("portfolio_certifications").select("*").order("sort_order"); setCerts(data ?? []); }
    showToast(error ? "Gagal." : "Tersimpan!"); setSaving(null);
  }
  async function deleteCert(id: string) {
    if (id.startsWith("new-")) { setCerts(c => c.filter(x => x.id !== id)); return; }
    await supabase.from("portfolio_certifications").delete().eq("id", id);
    setCerts(c => c.filter(x => x.id !== id));
  }

  if (loading) return <div className="p-8 text-sm text-[#52525b]">Memuat...</div>;

  return (
    <div className="p-8 max-w-3xl space-y-10">
      {toast && <p className="text-xs text-emerald-400">{toast}</p>}

      {/* Education */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div><h2 className="text-lg font-bold text-[#fafafa]">Education</h2><p className="text-xs text-[#52525b]">Riwayat pendidikan.</p></div>
          <button onClick={() => setEdus(e => [...e, { id: `new-${Date.now()}`, degree: "", institution: "", period: "", current: false, sort_order: e.length }])}
            className="inline-flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs px-4 py-2 rounded-md"><Plus className="w-3.5 h-3.5" /> Tambah</button>
        </div>
        <div className="space-y-3">
          {edus.map(item => (
            <div key={item.id} className="border border-[#27272a] rounded-xl p-4 bg-[#111113] space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[["degree", "Gelar/Jurusan"], ["institution", "Institusi"], ["period", "Periode"]].map(([k, l]) => (
                  <div key={k}><label className="text-[10px] text-[#52525b] mb-1 block">{l}</label>
                    <input value={(item[k as keyof Edu] as string) ?? ""} onChange={e => setEdus(i => i.map(x => x.id === item.id ? { ...x, [k]: e.target.value } : x))} className={inp} /></div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-[#71717a] cursor-pointer">
                  <input type="checkbox" checked={item.current} onChange={e => setEdus(i => i.map(x => x.id === item.id ? { ...x, current: e.target.checked } : x))} /> Masih berlangsung
                </label>
                <div className="flex gap-2">
                  <button onClick={() => deleteEdu(item.id)} className="inline-flex items-center gap-1.5 text-xs text-[#52525b] hover:text-red-400 px-3 py-1.5 rounded-md hover:bg-red-400/5 transition-colors"><Trash2 className="w-3.5 h-3.5" /> Hapus</button>
                  <button onClick={() => saveEdu(item)} disabled={saving === item.id} className="inline-flex items-center gap-1.5 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-md">
                    {saving === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Simpan
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div><h2 className="text-base font-bold text-[#fafafa]">Certifications</h2><p className="text-xs text-[#52525b]">Sertifikasi dan penghargaan.</p></div>
          <button onClick={() => setCerts(c => [...c, { id: `new-${Date.now()}`, name: "", issuer: "", sort_order: c.length }])}
            className="inline-flex items-center gap-2 border border-[#27272a] text-[#71717a] hover:text-[#fafafa] text-xs px-4 py-2 rounded-md transition-colors"><Plus className="w-3.5 h-3.5" /> Tambah</button>
        </div>
        <div className="space-y-3">
          {certs.map(item => (
            <div key={item.id} className="border border-[#27272a] rounded-xl p-4 bg-[#111113] flex gap-3 items-end">
              <div className="flex-1 grid grid-cols-2 gap-3">
                {[["name", "Nama Sertifikasi"], ["issuer", "Penerbit"]].map(([k, l]) => (
                  <div key={k}><label className="text-[10px] text-[#52525b] mb-1 block">{l}</label>
                    <input value={(item[k as keyof Cert] as string) ?? ""} onChange={e => setCerts(c => c.map(x => x.id === item.id ? { ...x, [k]: e.target.value } : x))} className={inp} /></div>
                ))}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => deleteCert(item.id)} className="text-[#52525b] hover:text-red-400 p-2 rounded-md hover:bg-red-400/5 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => saveCert(item)} disabled={saving === `c-${item.id}`} className="inline-flex items-center gap-1.5 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-white text-xs px-3 py-2 rounded-md">
                  {saving === `c-${item.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Simpan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
