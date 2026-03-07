"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Save, Loader2, GraduationCap, Award } from "lucide-react";

interface Edu { 
  id: string; 
  institution: string; 
  degree: string; 
  field_of_study?: string;
  logo_url?: string;
  gpa?: string;
  activities?: string;
  start_date: string; 
  end_date: string | null;
  current: boolean; 
  description: string;
  sort_order: number; 
}

const EMPTY_EDU: Omit<Edu, "id" | "sort_order"> = {
  institution: "", degree: "", field_of_study: "", logo_url: "", gpa: "", activities: "",
  start_date: "", end_date: "", current: false, description: ""
};

interface Cert { id: string; name: string; issuer: string; sort_order: number; }

export default function EducationEditor() {
  const supabase = createClient();
  const [edus, setEdus] = useState<Edu[]>([]);
  const [certs, setCerts] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState({ msg: "", ok: true });

  useEffect(() => {
    Promise.all([
      supabase.from("portfolio_education").select("*").order("sort_order"),
      supabase.from("portfolio_certifications").select("*").order("sort_order"),
    ]).then(([{ data: e }, { data: c }]) => { setEdus(e ?? []); setCerts(c ?? []); setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast({ msg: "", ok: true }), 2500); };

  async function saveEdu(item: Edu) {
    if (!item.institution) return;
    setSaving(item.id);
    const { id, ...rest } = item;
    const { error } = id.startsWith("new-") ? await supabase.from("portfolio_education").insert(rest) : await supabase.from("portfolio_education").update(rest).eq("id", id);
    if (!error && id.startsWith("new-")) { const { data } = await supabase.from("portfolio_education").select("*").order("sort_order"); setEdus(data ?? []); }
    showToast(error ? "Gagal." : "✓ Tersimpan!", !error); setSaving(null);
  }

  async function deleteEdu(id: string) {
    if (id.startsWith("new-")) { setEdus(e => e.filter(x => x.id !== id)); return; }
    await supabase.from("portfolio_education").delete().eq("id", id);
    setEdus(e => e.filter(x => x.id !== id));
  }

  async function saveCert(item: Cert) {
    if (!item.name) return;
    setSaving(`c-${item.id}`);
    const { id, ...rest } = item;
    const { error } = id.startsWith("new-") ? await supabase.from("portfolio_certifications").insert(rest) : await supabase.from("portfolio_certifications").update(rest).eq("id", id);
    if (!error && id.startsWith("new-")) { const { data } = await supabase.from("portfolio_certifications").select("*").order("sort_order"); setCerts(data ?? []); }
    showToast(error ? "Gagal." : "✓ Tersimpan!", !error); setSaving(null);
  }

  async function deleteCert(id: string) {
    if (id.startsWith("new-")) { setCerts(c => c.filter(x => x.id !== id)); return; }
    await supabase.from("portfolio_certifications").delete().eq("id", id);
    setCerts(c => c.filter(x => x.id !== id));
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-5 h-5 text-indigo-400 animate-spin" /></div>;

  const Input = ({ label, value, onChange, placeholder = "", disabled = false }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string, disabled?: boolean }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-[#c2c2df]">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] placeholder-[#3a3a5a] focus:outline-none focus:border-indigo-500 disabled:opacity-50" />
    </div>
  );

  return (
    <div className="p-6 max-w-4xl space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#e2e2ef] flex items-center gap-2"><GraduationCap className="w-5 h-5 text-indigo-400" />Education</h1>
          <p className="text-xs text-[#4a4a6a] mt-1">Kelola pendidikan dan sertifikasi</p>
        </div>
        {toast.msg && <span className={`text-xs font-medium px-3 py-1 rounded bg-[#1e1e2e] ${toast.ok ? "text-emerald-400" : "text-red-400"}`}>{toast.msg}</span>}
      </div>

      {/* Education */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#1e1e2e] pb-2">
          <h2 className="text-sm font-bold text-[#e2e2ef] flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-[#6a6a8a]" /> Academic History</h2>
          <button onClick={() => setEdus(e => [...e, { id: `new-${Date.now()}`, ...EMPTY_EDU, sort_order: e.length }])}
            className="flex items-center gap-1.5 bg-[#1e1e2e] hover:bg-[#2a2a3a] text-[#e2e2ef] text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
            <Plus className="w-3 h-3" /> Tambah
          </button>
        </div>

        {edus.map(item => (
          <div key={item.id} className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-5 space-y-4 hover:border-[#2a2a3a] transition-colors relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="lg:col-span-2">
                <Input label="Institusi / Universitas" value={item.institution ?? ""} onChange={v => setEdus(i => i.map(x => x.id === item.id ? { ...x, institution: v } : x))} placeholder="Universitas Indonesia" />
              </div>
              <Input label="Logo URL" value={item.logo_url ?? ""} onChange={v => setEdus(i => i.map(x => x.id === item.id ? { ...x, logo_url: v } : x))} placeholder="https://..." />
              
              <Input label="Tingkat / Gelar" value={item.degree ?? ""} onChange={v => setEdus(i => i.map(x => x.id === item.id ? { ...x, degree: v } : x))} placeholder="Sarjana (S1)" />
              <Input label="Program Studi / Jurusan" value={item.field_of_study ?? ""} onChange={v => setEdus(i => i.map(x => x.id === item.id ? { ...x, field_of_study: v } : x))} placeholder="Ilmu Komputer" />
              <Input label="IPK / Nilai" value={item.gpa ?? ""} onChange={v => setEdus(i => i.map(x => x.id === item.id ? { ...x, gpa: v } : x))} placeholder="3.85 / 4.00" />
              
              <Input label="Mulai" value={item.start_date ?? ""} onChange={v => setEdus(i => i.map(x => x.id === item.id ? { ...x, start_date: v } : x))} placeholder="Sep 2018" />
              <Input label="Selesai" value={item.end_date ?? ""} onChange={v => setEdus(i => i.map(x => x.id === item.id ? { ...x, end_date: v } : x))} disabled={item.current} placeholder={item.current ? "Present" : "Aug 2022"} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#c2c2df]">Deskripsi / Tesis / Proyek Akhir</label>
              <textarea rows={2} value={item.description ?? ""} onChange={e => setEdus(i => i.map(x => x.id === item.id ? { ...x, description: e.target.value } : x))} placeholder="Fokus pada rekayasa perangkat lunak..."
                className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] focus:outline-none focus:border-indigo-500 resize-none" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#c2c2df]">Aktivitas & Organisasi</label>
              <textarea rows={2} value={item.activities ?? ""} onChange={e => setEdus(i => i.map(x => x.id === item.id ? { ...x, activities: e.target.value } : x))} placeholder="BEM Fasilkom, Asisten Dosen Basis Data..."
                className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] focus:outline-none focus:border-indigo-500 resize-none" />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[#1e1e2e]">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#a1a1aa] hover:text-[#e2e2ef]">
                <button onClick={() => setEdus(i => i.map(x => x.id === item.id ? { ...x, current: !x.current } : x))}
                  className={`w-8 h-4 rounded-full transition-colors relative ${item.current ? "bg-indigo-600" : "bg-[#2a2a3a]"}`}>
                  <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${item.current ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
                Masih Berlangsung
              </label>
              <div className="flex gap-2">
                <button onClick={() => deleteEdu(item.id)} className="flex items-center gap-1.5 text-xs text-[#6a6a8a] py-1.5 px-3 rounded-lg hover:text-red-400 hover:bg-red-400/10 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Hapus
                </button>
                <button onClick={() => saveEdu(item)} disabled={saving === item.id || !item.institution} 
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors">
                  {saving === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Simpan
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Certifications */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#1e1e2e] pb-2 mt-8">
          <h2 className="text-sm font-bold text-[#e2e2ef] flex items-center gap-1.5"><Award className="w-4 h-4 text-[#6a6a8a]" /> Certifications & Awards</h2>
          <button onClick={() => setCerts(c => [...c, { id: `new-${Date.now()}`, name: "", issuer: "", sort_order: c.length }])}
            className="flex items-center gap-1.5 bg-[#1e1e2e] hover:bg-[#2a2a3a] text-[#e2e2ef] text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
            <Plus className="w-3 h-3" /> Tambah
          </button>
        </div>
        <div className="space-y-3">
          {certs.map(item => (
            <div key={item.id} className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-4 flex gap-3 items-end hover:border-[#2a2a3a]">
              <div className="flex-1 grid grid-cols-2 gap-3">
                <Input label="Nama Sertifikasi" value={item.name} onChange={v => setCerts(c => c.map(x => x.id === item.id ? { ...x, name: v } : x))} placeholder="AWS Certified Developer..." />
                <Input label="Penerbit" value={item.issuer} onChange={v => setCerts(c => c.map(x => x.id === item.id ? { ...x, issuer: v } : x))} placeholder="Amazon Web Services" />
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => deleteCert(item.id)} className="text-[#6a6a8a] py-2 px-2 hover:bg-red-400/10 hover:text-red-400 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                <button onClick={() => saveCert(item)} disabled={saving === `c-${item.id}`} className="bg-[#1e1e2e] hover:bg-indigo-600 hover:text-white px-3 py-2 rounded-lg text-[#a1a1aa] transition-colors disabled:opacity-50">
                  {saving === `c-${item.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
