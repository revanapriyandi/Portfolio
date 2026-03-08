"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, Trash2, Edit3, Save, RefreshCw, Star, X, MessageSquare, Globe, AlertCircle, Loader2, Sparkles, CheckCircle } from "lucide-react";
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

  // Fastwork import state
  const [showImport, setShowImport] = useState(false);
  const [fwUsername, setFwUsername] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [imported, setImported] = useState<(Testimonial & { _selected?: boolean })[]>([]);
  const [savingImport, setSavingImport] = useState(false);
  const [importDone, setImportDone] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: profile } = await supabase.from("portfolio_personal").select("fastwork_username").single();
    if (profile?.fastwork_username) setFwUsername(profile.fastwork_username);

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

  // ── Fastwork Scrape ───────────────────────────────────
  const scrape = async () => {
    if (!fwUsername) return;
    setScraping(true);
    setScrapeError(null);
    setImported([]);
    setImportDone(false);
    setLogs([]);

    try {
      const res = await fetch("/api/scrape-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: fwUsername }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "log" && event.message) {
              setLogs(prev => [...prev, event.message!]);
              setTimeout(() => logsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
            } else if (event.type === "done" && event.testimonials) {
              setImported(event.testimonials.map((t: Testimonial, i: number) => ({ ...t, sort_order: i, _selected: true })));
            } else if (event.type === "error" && event.message) {
              setScrapeError(event.message);
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (e) {
      setScrapeError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setScraping(false);
    }
  };

  const saveImported = async () => {
    const selected = imported.filter(s => s._selected);
    if (selected.length === 0) return;
    setSavingImport(true);
    setScrapeError(null);
    try {
      // Get highest sort order to append correctly
      const { data: existing } = await supabase.from("portfolio_testimonials").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
      const startOrder = existing?.sort_order !== undefined ? existing.sort_order + 1 : 0;

      const toInsert = selected.map((item, i) => {
        const { _selected, id, ...rest } = item as any; // eslint-disable-line
        return {
          ...rest,
          sort_order: startOrder + i,
          created_at: new Date().toISOString()
        };
      });

      const { error } = await supabase.from("portfolio_testimonials").insert(toInsert);
      if (error) throw error;
      setImportDone(true);
      setImported([]);
      setTimeout(() => setShowImport(false), 2000);
      load();
    } catch (e) {
      setScrapeError(e instanceof Error ? e.message : "Gagal menyimpan ke database");
    } finally {
      setSavingImport(false);
    }
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
        <div className="flex items-center gap-2">
          <button onClick={() => setShowImport(!showImport)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${showImport ? "bg-[#1e1e2e] text-white" : "bg-violet-600 hover:bg-violet-500 text-white"}`}>
            {showImport ? <X className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />} {showImport ? "Tutup" : "Import Fastwork"}
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-3.5 h-3.5" /> Tambah
          </button>
        </div>
      </div>

      {/* ── Fastwork Import Panel ── */}
      {showImport && (
        <div className="bg-[#0d0d14] border border-violet-500/20 rounded-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#e2e2ef] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" /> Import Ulasan dari Fastwork
              </h2>
              <p className="text-xs text-[#6a6a8a] mt-0.5">Scrape testimonial klien dari profil Fastwork Anda secara otomatis (Eksperimental AI)</p>
            </div>
          </div>

          <div className="space-y-4">
            {!fwUsername ? (
              <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs px-3 py-2.5 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <p>Username Fastwork belum diatur. Tambahkan di <Link href="/dashboard/cms/personal" className="underline">Info Pribadi → FastWork Username</Link>.</p>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2.5">
                <Globe className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span className="text-xs text-[#8a8aaa]">fastwork.id/user/</span>
                <span className="text-xs font-semibold text-[#e2e2ef]">{fwUsername}</span>
              </div>
            )}

            <button onClick={scrape} disabled={scraping || !fwUsername}
              className="w-full flex items-center justify-center gap-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
              {scraping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
              {scraping ? "Sedang scraping ulasan..." : "Mulai Scrape Ulasan Fastwork"}
            </button>
          </div>

          {/* Live log terminal */}
          {(scraping || logs.length > 0) && (
            <div className="bg-[#060610] border border-[#1a1a2e] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-[#1a1a2e] bg-[#09090f]">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                <span className="text-[10px] text-[#4a4a6a] ml-1 font-mono">fastwork-reviews-scraper</span>
                {scraping && <Loader2 className="w-3 h-3 text-violet-400 animate-spin ml-auto" />}
              </div>
              <div className="p-3 max-h-40 overflow-y-auto font-mono text-[11px] space-y-0.5">
                {logs.map((line, i) => (
                  <p key={i} className="text-[#a0a0c0] leading-relaxed">{line}</p>
                ))}
                {scraping && (
                  <p className="text-violet-400 animate-pulse">▌</p>
                )}
                <div ref={logsEndRef} />
              </div>
            </div>
          )}

          {scrapeError && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2.5 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <p>{scrapeError}</p>
            </div>
          )}

          {imported.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[#c2c2df]">{imported.length} ulasan ditemukan — pilih yang ingin disimpan:</p>
                <button onClick={() => setImported(prev => {
                  const allSelected = prev.every(s => s._selected);
                  return prev.map(s => ({ ...s, _selected: !allSelected }));
                })} className="text-xs text-violet-400 hover:text-violet-300">
                  {imported.every(s => s._selected) ? "Deselect All" : "Select All"}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {imported.map(t => (
                  <div key={t.id || t.name} 
                    onClick={() => setImported(prev => prev.map(p => p.name === t.name ? { ...p, _selected: !p._selected } : p))}
                    className={`relative p-3 rounded-xl border transition-all cursor-pointer ${
                    t._selected 
                      ? "bg-violet-500/10 border-violet-500/40" 
                      : "bg-[#12121c] border-[#1e1e2e] opacity-60 hover:opacity-100"
                  }`}>
                    {t._selected && (
                      <div className="absolute top-3 right-3 text-violet-400"><CheckCircle className="w-4 h-4" /></div>
                    )}
                    <div className="pr-6">
                      <input 
                        value={t.name}
                        onChange={e => setImported(prev => prev.map(p => p.id === t.id || p.name === t.name ? { ...p, name: e.target.value } : p))}
                        className="w-full bg-[#12121c] border border-[#1e1e2e] rounded px-2 py-1 text-sm font-semibold text-[#e2e2ef] focus:outline-none focus:border-violet-500 mb-2"
                        placeholder="Nama Klien"
                        onClick={e => e.stopPropagation()}
                      />
                      <div className="flex items-center gap-1 mb-2">
                        {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= t.rating ? "text-yellow-400 fill-yellow-400" : "text-[#2a2a3a]"}`} />)}
                        <span className="text-[10px] text-[#6a6a8a] ml-1">({t.rating}/5)</span>
                      </div>
                      <textarea
                        value={t.content}
                        onChange={e => setImported(prev => prev.map(p => p.id === t.id || p.name === t.name ? { ...p, content: e.target.value } : p))}
                        className="w-full bg-[#12121c] border border-[#1e1e2e] rounded px-2 py-1 text-xs text-[#a0a0c0] focus:outline-none focus:border-violet-500 resize-none"
                        rows={3}
                        placeholder="Isi Ulasan"
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button onClick={saveImported} disabled={savingImport || !imported.some(s => s._selected)}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors">
                  {savingImport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Simpan {imported.filter(s => s._selected).length} Ulasan ke Database
                </button>
              </div>
            </div>
          )}

          {importDone && (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-3 py-2.5 rounded-lg">
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              <p>Berhasil menyimpan ulasan ke database!</p>
            </div>
          )}
        </div>
      )}

      {/* ── Existing Reviews List ── */}


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
