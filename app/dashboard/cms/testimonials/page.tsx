"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Edit3, Save, RefreshCw, Star, X, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  content: string;
  rating: number;
  platform: string;
  is_featured: boolean;
  sort_order: number;
}

const EMPTY: Omit<Testimonial, "id"> = {
  name: "", role: "", company: "", avatar: "", content: "",
  rating: 5, platform: "Direct", is_featured: false, sort_order: 0,
};

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

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} onClick={() => onChange(s)}
          className={`transition-colors ${s <= value ? "text-yellow-400" : "text-[#3a3a5a] hover:text-yellow-400/50"}`}>
          <Star className="w-5 h-5 fill-current" />
        </button>
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Omit<Testimonial, "id"> | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("portfolio_testimonials").select("*").order("sort_order");
    setItems(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm({ ...EMPTY }); setEditId(null); };
  const openEdit = (t: Testimonial) => { const { id, ...rest } = t; setEditId(id); setForm({ ...rest }); };
  const closeForm = () => { setForm(null); setEditId(null); };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    if (editId) {
      await supabase.from("portfolio_testimonials").update(form).eq("id", editId);
    } else {
      await supabase.from("portfolio_testimonials").insert({ ...form, created_at: new Date().toISOString() });
    }
    setSaving(false); closeForm(); load();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("portfolio_testimonials").delete().eq("id", id);
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
          <h1 className="text-lg font-bold text-[#e2e2ef] flex items-center gap-2"><MessageSquare className="w-5 h-5 text-indigo-400" />Testimonial</h1>
          <p className="text-xs text-[#4a4a6a] mt-1">{items.length} testimonial</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-3.5 h-3.5" /> Tambah
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(t => (
          <div key={t.id} className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-5 hover:border-[#2a2a3a] transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {t.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center text-indigo-400 font-bold text-sm">
                    {t.name[0]}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-[#e2e2ef]">{t.name}</p>
                  <p className="text-[11px] text-[#6a6a8a]">{t.role}{t.company && ` @ ${t.company}`}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-[#4a4a6a] hover:text-indigo-400 hover:bg-indigo-600/10 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg text-[#4a4a6a] hover:text-red-400 hover:bg-red-500/5 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="flex items-center gap-1 mb-2">
              {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= t.rating ? "text-yellow-400 fill-yellow-400" : "text-[#2a2a3a]"}`} />)}
              <span className="text-[10px] text-[#4a4a6a] ml-1">{t.platform}</span>
            </div>
            <p className="text-xs text-[#6a6a8a] leading-relaxed line-clamp-3">&quot;{t.content}&quot;</p>
            {t.is_featured && <span className="inline-block mt-2 text-[9px] px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-full">Featured</span>}
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-2 text-center py-16 text-[#3a3a5a]">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Belum ada testimonial.</p>
          </div>
        )}
      </div>

      <Modal open={!!form} onClose={closeForm}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-[#e2e2ef]">{editId ? "Edit Testimonial" : "Tambah Testimonial"}</h2>
          <button onClick={closeForm} className="text-[#4a4a6a] hover:text-[#c2c2df]"><X className="w-4 h-4" /></button>
        </div>
        {form && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[{ key: "name", label: "Nama", placeholder: "John Doe" }, { key: "role", label: "Jabatan", placeholder: "CEO" },
                { key: "company", label: "Perusahaan", placeholder: "Acme Inc" }, { key: "platform", label: "Platform", placeholder: "LinkedIn" }]
                .map(f => (
                <div key={f.key} className="space-y-1.5">
                  <label className="text-xs font-medium text-[#c2c2df]">{f.label}</label>
                  <input value={(form as Record<string, unknown>)[f.key] as string} onChange={e => setForm(p => p ? { ...p, [f.key]: e.target.value } : p)}
                    placeholder={f.placeholder}
                    className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] placeholder-[#3a3a5a] focus:outline-none focus:border-indigo-500" />
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#c2c2df]">URL Avatar (opsional)</label>
              <input value={form.avatar} onChange={e => setForm(p => p ? { ...p, avatar: e.target.value } : p)} placeholder="https://..."
                className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] placeholder-[#3a3a5a] focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#c2c2df]">Isi Testimonial</label>
              <textarea value={form.content} onChange={e => setForm(p => p ? { ...p, content: e.target.value } : p)}
                placeholder="Tulis testimonial di sini..." rows={3}
                className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] placeholder-[#3a3a5a] focus:outline-none focus:border-indigo-500 resize-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#c2c2df]">Rating</label>
              <StarRating value={form.rating} onChange={v => setForm(p => p ? { ...p, rating: v } : p)} />
            </div>
            <div className="flex items-center justify-between py-2">
              <div><p className="text-xs font-medium text-[#c2c2df]">Featured</p></div>
              <button onClick={() => setForm(f => f ? { ...f, is_featured: !f.is_featured } : f)}
                className={`w-10 h-5 rounded-full transition-colors relative ${form.is_featured ? "bg-indigo-600" : "bg-[#2a2a3a]"}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.is_featured ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={closeForm} className="flex-1 bg-[#12121c] border border-[#1e1e2e] text-[#6a6a8a] text-xs font-medium px-4 py-2 rounded-lg transition-colors">Batal</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.content}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Simpan
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
