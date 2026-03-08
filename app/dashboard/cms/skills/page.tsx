"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Save, X, Loader2, Search, Github, RefreshCw, Code2, Trash2, GripVertical } from "lucide-react";
import { ICON_LIST, ICON_MAP } from "@/lib/skill-icons";

type SkillRow = {
  id: string;
  category: string;
  items: string[];
  item_icons: Record<string, string>;
  sort_order: number;
};

// ─── Icon Picker ─────────────────────────────────────────
function IconPicker({ currentKey, onSelect, onClose }: { currentKey?: string; onSelect: (key: string | null) => void; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const filtered = ICON_LIST.filter(i => i.name.toLowerCase().includes(query.toLowerCase())).slice(0, 30);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute z-50 bottom-full left-0 mb-1 w-64 bg-[#111113] border border-[#27272a] rounded-xl shadow-2xl">
      <div className="p-2 border-b border-[#27272a] flex items-center gap-2">
        <Search className="w-3.5 h-3.5 text-[#52525b] shrink-0" />
        <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari icon..."
          className="flex-1 bg-transparent text-xs text-[#fafafa] outline-none placeholder-[#52525b]" />
      </div>
      <div className="max-h-44 overflow-y-auto p-2 grid grid-cols-5 gap-1">
        {filtered.map(({ name, Icon }) => (
          <button key={name} onClick={() => { onSelect(name); onClose(); }}
            className={`flex flex-col items-center justify-center gap-0.5 p-1.5 rounded-md hover:bg-[#27272a] transition-colors ${currentKey === name ? "bg-[#3b82f6]/20 ring-1 ring-[#3b82f6]/50" : ""}`}>
            <Icon className="w-4 h-4 text-[#a1a1aa]" />
            <span className="text-[8px] text-[#52525b] leading-none truncate w-full text-center">{name.split(".")[0]}</span>
          </button>
        ))}
      </div>
      <div className="p-2 border-t border-[#27272a]">
        <button onClick={() => { onSelect(null); onClose(); }} className="w-full text-center text-[10px] text-[#52525b] hover:text-red-400 transition-colors">Hapus icon</button>
      </div>
    </div>
  );
}

// ─── Skill Badge ──────────────────────────────────────────
function SkillBadge({ item, iconKey, onRemove, onIconChange }: { item: string; iconKey?: string; onRemove: () => void; onIconChange: (key: string | null) => void }) {
  const [open, setOpen] = useState(false);
  const Icon = iconKey ? ICON_MAP[iconKey] : null;
  return (
    <div className="relative inline-flex">
      <span className="inline-flex items-center gap-1.5 bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] text-[#a1a1aa] text-xs px-2.5 py-1.5 rounded-lg transition-colors">
        <button onClick={() => setOpen(v => !v)} className="hover:text-[#3b82f6] transition-colors shrink-0">
          {Icon ? <Icon className="w-3.5 h-3.5 text-[#3b82f6]" /> : <span className="w-3.5 h-3.5 rounded border border-dashed border-[#3f3f46] flex items-center justify-center text-[8px] text-[#3f3f46]">+</span>}
        </button>
        <span className="text-[#d4d4d8]">{item}</span>
        <button onClick={onRemove} className="text-[#52525b] hover:text-red-400 ml-0.5 transition-colors"><X className="w-3 h-3" /></button>
      </span>
      {open && <IconPicker currentKey={iconKey} onSelect={onIconChange} onClose={() => setOpen(false)} />}
    </div>
  );
}

// ─── Category Card ────────────────────────────────────────
function CategoryCard({ row, onUpdated, onDeleted }: { row: SkillRow; onUpdated: (r: SkillRow) => void; onDeleted: (id: string) => void }) {
  const supabase = createClient();
  const [category, setCategory] = useState(row.category);
  const [items, setItems] = useState(row.items ?? []);
  const [icons, setIcons] = useState<Record<string, string>>(row.item_icons ?? {});
  const [newItem, setNewItem] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const addItem = () => {
    const v = newItem.trim();
    if (!v || items.some(i => i.toLowerCase() === v.toLowerCase())) { setNewItem(""); return; }
    setItems(prev => [...prev, v]);
    setNewItem("");
  };

  const removeItem = (item: string) => {
    setItems(prev => prev.filter(i => i !== item));
    setIcons(prev => { const n = { ...prev }; delete n[item]; return n; });
  };

  const setIcon = (item: string, key: string | null) => {
    setIcons(prev => { const n = { ...prev }; if (key === null) delete n[item]; else n[item] = key; return n; });
  };

  const save = async () => {
    setSaving(true);
    const payload = { category, items, item_icons: icons, updated_at: new Date().toISOString() };
    const { error } = await supabase.from("portfolio_skills").update(payload).eq("id", row.id);
    if (!error) onUpdated({ ...row, category, items, item_icons: icons });
    setSaving(false);
  };

  const deleteRow = async () => {
    if (!confirm(`Hapus kategori "${category}"?`)) return;
    setDeleting(true);
    await supabase.from("portfolio_skills").delete().eq("id", row.id);
    onDeleted(row.id);
  };

  return (
    <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <GripVertical className="w-4 h-4 text-[#3f3f46] shrink-0 cursor-grab" />
        <input value={category} onChange={e => setCategory(e.target.value)}
          className="flex-1 bg-[#111113] border border-[#27272a] focus:border-[#3b82f6] rounded-lg px-3 py-1.5 text-sm font-semibold text-[#fafafa] focus:outline-none" placeholder="Nama kategori..." />
        <button onClick={save} disabled={saving}
          className="flex items-center gap-1.5 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Simpan
        </button>
        <button onClick={deleteRow} disabled={deleting}
          className="flex items-center gap-1.5 bg-red-600/10 hover:bg-red-600/20 border border-red-600/20 text-red-400 text-xs px-2.5 py-1.5 rounded-lg transition-colors">
          {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Add item input */}
      <div className="flex gap-2">
        <input value={newItem} onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addItem()} placeholder="Tambah skill..."
          className="flex-1 bg-[#111113] border border-[#27272a] focus:border-[#3b82f6] rounded-lg px-3 py-2 text-sm text-[#fafafa] focus:outline-none placeholder-[#3f3f46]" />
        <button onClick={addItem} className="flex items-center gap-1.5 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[#e4e4e7] text-sm px-3 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 min-h-[32px]">
        {items.length > 0 ? items.map(item => (
          <SkillBadge key={item} item={item} iconKey={icons[item]}
            onRemove={() => removeItem(item)} onIconChange={key => setIcon(item, key)} />
        )) : (
          <p className="text-xs text-[#52525b] italic">Belum ada item. Tambahkan di atas.</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function SkillsEditor() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<SkillRow[]>([]);
  const [syncingGh, setSyncingGh] = useState(false);
  const [addingCat, setAddingCat] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" }>({ msg: "", type: "success" });

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 2500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("portfolio_skills").select("*").order("sort_order");
    setRows((data ?? []) as SkillRow[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const addCategory = async () => {
    const cat = newCat.trim();
    if (!cat) return;
    setAddingCat(true);
    const { data, error } = await supabase.from("portfolio_skills").insert({
      category: cat, items: [], item_icons: {}, sort_order: rows.length, updated_at: new Date().toISOString()
    }).select().single();
    if (!error && data) setRows(prev => [...prev, data as SkillRow]);
    setNewCat("");
    setAddingCat(false);
  };

  const syncGithub = async () => {
    setSyncingGh(true);
    try {
      const res = await fetch("/api/github");
      if (!res.ok) throw new Error();
      const data = await res.json();
      const langs: string[] = (data.languages ?? []).map((l: { name: string }) => l.name).filter(Boolean);

      // Find or create "Languages" category
      const langRow = rows.find(r => r.category.toLowerCase() === "languages" || r.category.toLowerCase() === "bahasa pemrograman");
      const existing = new Set(langRow?.items.map(i => i.toLowerCase()) ?? []);
      const newItems = langs.filter(l => !existing.has(l.toLowerCase()));
      const newIcons: Record<string, string> = { ...(langRow?.item_icons ?? {}) };
      for (const lang of newItems) {
        const icon = ICON_LIST.find(i => i.name.toLowerCase() === lang.toLowerCase())?.name;
        if (icon) newIcons[lang] = icon;
      }

      if (langRow) {
        const updated = { ...langRow, items: [...(langRow.items ?? []), ...newItems], item_icons: newIcons };
        await supabase.from("portfolio_skills").update({ items: updated.items, item_icons: newIcons, updated_at: new Date().toISOString() }).eq("id", langRow.id);
        setRows(prev => prev.map(r => r.id === langRow!.id ? updated : r));
      } else {
        const { data: inserted } = await supabase.from("portfolio_skills").insert({
          category: "Languages", items: langs, item_icons: newIcons, sort_order: rows.length, updated_at: new Date().toISOString()
        }).select().single();
        if (inserted) setRows(prev => [...prev, inserted as SkillRow]);
      }

      showToast(newItems.length > 0 ? `${newItems.length} bahasa dari GitHub ditambahkan.` : "Semua bahasa sudah ada.");
    } catch {
      showToast("Gagal sync GitHub.", "error");
    } finally {
      setSyncingGh(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-[#52525b]" /></div>;

  return (
    <div className="p-6 lg:p-8 w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#fafafa] flex items-center gap-2"><Code2 className="w-5 h-5 text-[#3b82f6]" /> Skills</h1>
          <p className="text-sm text-[#71717a] mt-1">Kelola skill per-kategori. Setiap kategori disimpan sebagai baris terpisah di database.</p>
        </div>
        <button onClick={syncGithub} disabled={syncingGh}
          className="inline-flex items-center gap-2 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[#e4e4e7] text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
          {syncingGh ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />} Sync GitHub
        </button>
      </div>

      {/* Toast */}
      {toast.msg && (
        <div className={`px-4 py-2.5 rounded-lg text-sm font-medium border ${toast.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"}`}>
          {toast.msg}
        </div>
      )}

      {/* Category Cards */}
      {rows.map(row => (
        <CategoryCard key={row.id} row={row}
          onUpdated={updated => setRows(prev => prev.map(r => r.id === updated.id ? updated : r))}
          onDeleted={id => setRows(prev => prev.filter(r => r.id !== id))} />
      ))}

      {/* Add New Category */}
      <div className="bg-[#0d0d14] border border-dashed border-[#27272a] rounded-2xl p-4 flex gap-2 items-center">
        <input value={newCat} onChange={e => setNewCat(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addCategory()}
          placeholder="+ Tambah kategori baru (contoh: DevOps, Mobile, Tools...)"
          className="flex-1 bg-transparent text-sm text-[#fafafa] outline-none placeholder-[#3f3f46]" />
        <button onClick={addCategory} disabled={addingCat || !newCat.trim()}
          className="flex items-center gap-1.5 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-40 text-white text-xs px-4 py-2 rounded-lg transition-colors">
          {addingCat ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Tambah Kategori
        </button>
      </div>
    </div>
  );
}
