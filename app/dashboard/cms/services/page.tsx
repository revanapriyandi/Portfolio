"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, Trash2, Edit3, Save, RefreshCw, Briefcase, X, Globe, Loader2, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Switch } from "@/components/ui/switch";

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
  service_url?: string;
}

type ImportedService = Omit<Service, "id"> & { service_url?: string; _selected?: boolean };

const EMPTY: Omit<Service, "id"> = {
  title: "", description: "", icon: "💻", price_from: "", price_to: "", currency: "IDR",
  features: [], is_featured: false, sort_order: 0, service_url: ""
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

  // Fastwork import state
  const [showImport, setShowImport] = useState(false);
  const [fwUsername, setFwUsername] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [imported, setImported] = useState<ImportedService[]>([]);
  const [savingImport, setSavingImport] = useState(false);
  const [importDone, setImportDone] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("portfolio_services").select("*").order("sort_order");
    setServices(data ?? []);
    setLoading(false);
  }, [supabase]);

  // Load persisted Fastwork username from portfolio_personal
  useEffect(() => {
    load();
    supabase.from("portfolio_personal").select("fastwork_username").limit(1).maybeSingle()
      .then(({ data }) => {
        if (data?.fastwork_username) setFwUsername(data.fastwork_username as string);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const scrape = async () => {
    if (!fwUsername) return;
    setScraping(true);
    setScrapeError(null);
    setImported([]);
    setImportDone(false);
    setLogs([]);

    try {
      const res = await fetch("/api/scrape-fastwork", {
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
            const event = JSON.parse(line.slice(6)) as { type: string; message?: string; services?: ImportedService[] };
            if (event.type === "log" && event.message) {
              setLogs(prev => [...prev, event.message!]);
              setTimeout(() => logsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
            } else if (event.type === "done" && event.services) {
              setImported(event.services.map((s, i) => ({ ...s, sort_order: i, _selected: true })));
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
    if (!selected.length) return;
    setSavingImport(true);
    setScrapeError(null);
    try {
      const { data: existing } = await supabase.from("portfolio_services").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
      const startOrder = existing?.sort_order !== undefined ? existing.sort_order + 1 : 0;

      const toInsert = selected.map((s, i) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _selected, ...rest } = s;
        return {
          title: rest.title || "",
          description: rest.description || "",
          icon: rest.icon || "💻",
          price_from: rest.price_from ? String(rest.price_from) : "",
          price_to: rest.price_to ? String(rest.price_to) : "",
          features: Array.isArray(rest.features) ? rest.features : [],
          is_featured: !!rest.is_featured,
          service_url: rest.service_url || "",
          sort_order: startOrder + i,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

      const { error } = await supabase.from("portfolio_services").insert(toInsert);
      if (error) throw error;
      
      setImportDone(true);
      load();
      setTimeout(() => { setShowImport(false); setImported([]); setImportDone(false); }, 1500);
    } catch (e: any) { // eslint-disable-line
      console.error("Supabase insert error:", e);
      setScrapeError(e?.message || JSON.stringify(e) || "Gagal menyimpan ke database");
    } finally {
      setSavingImport(false);
    }
  };

  const toggleSelect = (i: number) => setImported(prev => prev.map((s, idx) => idx === i ? { ...s, _selected: !s._selected } : s));

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
        <div className="flex items-center gap-2">
          <button onClick={() => setShowImport(v => !v)}
            className="flex items-center gap-1.5 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
            <Globe className="w-3.5 h-3.5" /> Import Fastwork
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
                <Sparkles className="w-4 h-4 text-violet-400" /> Import dari Fastwork
              </h2>
              <p className="text-xs text-[#6a6a8a] mt-0.5">Scrape semua layanan dari profil Fastwork Anda secara otomatis</p>
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
              {scraping ? "Sedang scraping..." : "Mulai Scrape Fastwork"}
            </button>
          </div>

          {/* Live log terminal */}
          {(scraping || logs.length > 0) && (
            <div className="bg-[#060610] border border-[#1a1a2e] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-[#1a1a2e] bg-[#09090f]">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                <span className="text-[10px] text-[#4a4a6a] ml-1 font-mono">fastwork-scraper</span>
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
                <p className="text-xs font-semibold text-[#c2c2df]">{imported.length} layanan ditemukan — pilih yang ingin disimpan:</p>
                <button onClick={() => setImported(prev => {
                  const allSelected = prev.every(s => s._selected);
                  return prev.map(s => ({ ...s, _selected: !allSelected }));
                })} className="text-[10px] text-[#6a6a8a] hover:text-indigo-400 transition-colors">
                  Pilih Semua / Hapus Semua
                </button>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {imported.map((s, i) => (
                  <div key={i}
                    onClick={() => toggleSelect(i)}
                    className={`cursor-pointer flex items-start gap-3 p-3 rounded-xl border transition-all ${s._selected ? "border-violet-500/40 bg-violet-600/5" : "border-[#1e1e2e] bg-[#09090b] opacity-50"}`}>
                    <span className="text-xl shrink-0">{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <input 
                        value={s.title} 
                        onChange={e => setImported(prev => prev.map((item, idx) => idx === i ? { ...item, title: e.target.value } : item))}
                        className="w-full bg-[#12121c] border border-[#1e1e2e] rounded px-2 py-1 text-xs font-semibold text-[#e2e2ef] focus:outline-none focus:border-violet-500 mb-2"
                        placeholder="Judul Layanan"
                        onClick={e => e.stopPropagation()}
                      />
                      <textarea 
                        value={s.description}
                        onChange={e => setImported(prev => prev.map((item, idx) => idx === i ? { ...item, description: e.target.value } : item))}
                        className="w-full bg-[#12121c] border border-[#1e1e2e] rounded px-2 py-1 text-[11px] text-[#a0a0c0] focus:outline-none focus:border-violet-500 resize-none"
                        rows={2}
                        placeholder="Deskripsi layanan"
                        onClick={e => e.stopPropagation()}
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-[#6a6a8a]">Rp</span>
                        <input 
                          type="number"
                          value={s.price_from || ""}
                          onChange={e => setImported(prev => prev.map((item, idx) => idx === i ? { ...item, price_from: e.target.value } : item))}
                          className="w-24 bg-[#12121c] border border-[#1e1e2e] rounded px-2 py-1 text-[11px] text-indigo-400 font-mono focus:outline-none focus:border-indigo-500"
                          placeholder="400000"
                          onClick={e => e.stopPropagation()}
                        />
                        {s.service_url && (
                          <a href={s.service_url} target="_blank" rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="text-[10px] text-violet-400 hover:underline">Lihat Layanan →</a>
                        )}
                      </div>
                      {s.features?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {s.features.slice(0, 3).map((f, fi) => (
                            <span key={fi} className="text-[9px] px-1.5 py-0.5 bg-[#12121c] border border-[#1e1e2e] rounded text-[#6a6a8a]">{f}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className={`w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center ${s._selected ? "bg-violet-600 border-violet-500" : "border-[#2a2a3a]"}`}>
                      {s._selected && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={saveImported} disabled={savingImport || importDone || !imported.some(s => s._selected)}
                className={`w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl transition-all ${importDone ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600/30" : "bg-violet-600 hover:bg-violet-500 text-white"} disabled:opacity-60`}>
                {savingImport ? <Loader2 className="w-4 h-4 animate-spin" /> : importDone ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {importDone ? "Tersimpan!" : savingImport ? "Menyimpan..." : `Simpan ${imported.filter(s => s._selected).length} Layanan ke Database`}
              </button>
            </div>
          )}
        </div>
      )}

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
            <p className="text-sm">Belum ada layanan. Klik &quot;Tambah Layanan&quot; atau &quot;Import Fastwork&quot;.</p>
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
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#c2c2df]">Link Layanan (Opsional)</label>
              <input value={(form as Record<string, unknown>).service_url as string || ""} onChange={e => setForm(prev => prev ? { ...prev, service_url: e.target.value } : prev)}
                placeholder="https://..."
                className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] placeholder-[#3a3a5a] focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#c2c2df]">Harga Dari</label>
                <input value={form.price_from} onChange={e => setForm(f => f ? { ...f, price_from: e.target.value } : f)} placeholder="500000"
                  className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] placeholder-[#3a3a5a] focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#c2c2df]">Harga Sampai</label>
                <input value={form.price_to} onChange={e => setForm(f => f ? { ...f, price_to: e.target.value } : f)} placeholder="2000000"
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
              <Switch checked={form.is_featured} onCheckedChange={val => setForm(f => f ? { ...f, is_featured: val } : f)} />
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
