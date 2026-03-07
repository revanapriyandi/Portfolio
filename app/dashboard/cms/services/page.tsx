"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Edit3, Save, RefreshCw, Briefcase, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  price_from: string;
  price_to: string;
  currency: string;
  features: string[];
  is_featured: boolean;
  sort_order: number;
}

const EMPTY: Omit<Service, "id"> = {
  title: "", description: "", icon: "💻", price_from: "", price_to: "", currency: "IDR",
  features: [], is_featured: false, sort_order: 0,
};

const ICONS = ["💻", "🎨", "📱", "🚀", "🔧", "⚡", "🛡️", "📊", "🤖", "🌐", "🔌", "📝"];

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Omit<Service, "id"> | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [featureInput, setFeatureInput] = useState("");
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("portfolio_services").select("*").order("sort_order");
    setServices(data ?? []);
    setLoading(false);
  }, [supabase]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm({ ...EMPTY }); setEditId(null); setFeatureInput(""); };
  const openEdit = (s: Service) => { const { id, ...rest } = s; setEditId(id); setForm({ ...rest }); setFeatureInput(""); };
  const closeForm = () => { setForm(null); setEditId(null); };

  const addFeature = () => {
    if (!featureInput.trim() || !form) return;
    setForm(f => f ? { ...f, features: [...f.features, featureInput.trim()] } : f);
    setFeatureInput("");
  };

  const removeFeature = (i: number) => setForm(f => f ? { ...f, features: f.features.filter((_, idx) => idx !== i) } : f);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    if (editId) {
      await supabase.from("portfolio_services").update({ ...form, updated_at: new Date().toISOString() }).eq("id", editId);
    } else {
      await supabase.from("portfolio_services").insert({ ...form, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    }
    setSaving(false); closeForm(); load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("portfolio_services").delete().eq("id", id);
    load();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
    </div>
  );

  return (
    <div className="p-6 w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#e2e2ef] flex items-center gap-2"><Briefcase className="w-5 h-5 text-indigo-400" />Layanan (Services)</h1>
          <p className="text-xs text-[#4a4a6a] mt-1">{services.length} layanan tersedia</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-3.5 h-3.5" /> Tambah Layanan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map(s => (
          <div key={s.id} className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-5 hover:border-[#2a2a3a] transition-colors">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-[#e2e2ef] text-sm">{s.title}</h3>
                  {s.is_featured && <span className="text-[9px] px-1.5 py-0.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-full">Featured</span>}
                </div>
                <p className="text-xs text-[#6a6a8a] line-clamp-2 mb-2">{s.description}</p>
                {(s.price_from || s.price_to) && (
                  <p className="text-xs text-indigo-400 font-mono mb-2">
                    {s.currency} {s.price_from}{s.price_to ? ` — ${s.price_to}` : "+"}
                  </p>
                )}
                {s.features?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {s.features.slice(0, 3).map((f, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 bg-[#12121c] border border-[#1e1e2e] rounded text-[#6a6a8a]">{f}</span>
                    ))}
                    {s.features.length > 3 && <span className="text-[10px] text-[#4a4a6a]">+{s.features.length - 3}</span>}
                  </div>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-[#4a4a6a] hover:text-indigo-400 hover:bg-indigo-600/10 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg text-[#4a4a6a] hover:text-red-400 hover:bg-red-500/5 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        ))}
        {services.length === 0 && (
          <div className="col-span-2 text-center py-16 text-[#3a3a5a]">
            <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Belum ada layanan. Klik &quot;Tambah Layanan&quot; untuk mulai.</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal open={!!form} onClose={closeForm}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-[#e2e2ef]">{editId ? "Edit Layanan" : "Tambah Layanan"}</h2>
          <button onClick={closeForm} className="text-[#4a4a6a] hover:text-[#c2c2df]"><X className="w-4 h-4" /></button>
        </div>
        {form && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#c2c2df]">Icon</label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map(ic => (
                  <button key={ic} onClick={() => setForm(f => f ? { ...f, icon: ic } : f)}
                    className={`text-xl w-9 h-9 rounded-lg flex items-center justify-center border transition-all ${form.icon === ic ? "border-indigo-500 bg-indigo-600/20" : "border-[#1e1e2e] bg-[#12121c] hover:border-[#2a2a3a]"}`}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            {[{ key: "title", label: "Judul", placeholder: "Web Development" },
              { key: "description", label: "Deskripsi", placeholder: "Deskripsi layanan..." }].map(f => (
              <div key={f.key} className="space-y-1.5">
                <label className="text-xs font-medium text-[#c2c2df]">{f.label}</label>
                {f.key === "description" ? (
                  <textarea value={(form as Record<string, unknown>)[f.key] as string} onChange={e => setForm(prev => prev ? { ...prev, [f.key]: e.target.value } : prev)}
                    placeholder={f.placeholder} rows={2}
                    className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] placeholder-[#3a3a5a] focus:outline-none focus:border-indigo-500 resize-none" />
                ) : (
                  <input value={(form as Record<string, unknown>)[f.key] as string} onChange={e => setForm(prev => prev ? { ...prev, [f.key]: e.target.value } : prev)}
                    placeholder={f.placeholder}
                    className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] placeholder-[#3a3a5a] focus:outline-none focus:border-indigo-500" />
                )}
              </div>
            ))}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#c2c2df]">Harga Dari</label>
                <input value={form.price_from} onChange={e => setForm(f => f ? { ...f, price_from: e.target.value } : f)} placeholder="500.000"
                  className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] placeholder-[#3a3a5a] focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#c2c2df]">Harga Sampai</label>
                <input value={form.price_to} onChange={e => setForm(f => f ? { ...f, price_to: e.target.value } : f)} placeholder="2.000.000"
                  className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] placeholder-[#3a3a5a] focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#c2c2df]">Mata Uang</label>
                <select value={form.currency} onChange={e => setForm(f => f ? { ...f, currency: e.target.value } : f)}
                  className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] focus:outline-none focus:border-indigo-500">
                  {["IDR", "USD", "EUR", "SGD"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#c2c2df]">Fitur / Keunggulan</label>
              <div className="flex gap-2">
                <input value={featureInput} onChange={e => setFeatureInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addFeature()} placeholder="Tambah fitur, tekan Enter"
                  className="flex-1 bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] placeholder-[#3a3a5a] focus:outline-none focus:border-indigo-500" />
                <button onClick={addFeature} className="px-3 bg-indigo-600 text-white rounded-lg text-xs hover:bg-indigo-500 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.features.map((f, i) => (
                  <span key={i} className="flex items-center gap-1 text-[11px] px-2 py-1 bg-[#12121c] border border-[#1e1e2e] rounded-lg text-[#c2c2df]">
                    {f} <button onClick={() => removeFeature(i)} className="text-[#4a4a6a] hover:text-red-400"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div><p className="text-xs font-medium text-[#c2c2df]">Featured</p><p className="text-[10px] text-[#4a4a6a]">Tampilkan sebagai unggulan</p></div>
              <button onClick={() => setForm(f => f ? { ...f, is_featured: !f.is_featured } : f)}
                className={`w-10 h-5 rounded-full transition-colors relative ${form.is_featured ? "bg-indigo-600" : "bg-[#2a2a3a]"}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.is_featured ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={closeForm} className="flex-1 bg-[#12121c] border border-[#1e1e2e] text-[#6a6a8a] hover:text-[#c2c2df] text-xs font-medium px-4 py-2 rounded-lg transition-colors">Batal</button>
              <button onClick={handleSave} disabled={saving || !form.title}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Simpan
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
