"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Save, X, Loader2, Search, Github, RefreshCw, Code2 } from "lucide-react";
import { ICON_LIST, ICON_MAP } from "@/lib/skill-icons";

type SkillRow = {
  id: string;
  category: string;
  items: string[];
  item_icons: Record<string, string>;
  sort_order: number;
};

function IconPicker({ currentKey, onSelect, onClose }: { currentKey?: string; onSelect: (key: string | null) => void; onClose: () => void; }) {
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const filtered = ICON_LIST.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())).slice(0, 30);

  useEffect(() => {
    function onMouseDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute z-50 bottom-full left-0 mb-1 w-64 bg-[#111113] border border-[#27272a] rounded-xl shadow-2xl">
      <div className="p-2 border-b border-[#27272a] flex items-center gap-2">
        <Search className="w-3.5 h-3.5 text-[#52525b] shrink-0" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari icon..."
          className="flex-1 bg-transparent text-xs text-[#fafafa] outline-none placeholder-[#52525b]"
        />
      </div>
      <div className="max-h-44 overflow-y-auto p-2 grid grid-cols-5 gap-1">
        {filtered.map(({ name, Icon }) => (
          <button
            key={name}
            onClick={() => {
              onSelect(name);
              onClose();
            }}
            className={`flex flex-col items-center justify-center gap-0.5 p-1.5 rounded-md hover:bg-[#27272a] transition-colors ${currentKey === name ? "bg-[#3b82f6]/20 ring-1 ring-[#3b82f6]/50" : ""}`}
          >
            <Icon className="w-4 h-4 text-[#a1a1aa]" />
            <span className="text-[8px] text-[#52525b] leading-none truncate w-full text-center">{name.split(".")[0]}</span>
          </button>
        ))}
      </div>
      <div className="p-2 border-t border-[#27272a]">
        <button
          onClick={() => {
            onSelect(null);
            onClose();
          }}
          className="w-full text-center text-[10px] text-[#52525b] hover:text-red-400 transition-colors"
        >
          Hapus icon
        </button>
      </div>
    </div>
  );
}

function SkillBadge({ item, iconKey, onRemove, onIconChange }: { item: string; iconKey?: string; onRemove: () => void; onIconChange: (key: string | null) => void; }) {
  const [open, setOpen] = useState(false);
  const Icon = iconKey ? ICON_MAP[iconKey] : null;

  return (
    <div className="relative inline-flex">
      <span className="inline-flex items-center gap-1.5 bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] text-[#a1a1aa] text-xs px-2.5 py-1.5 rounded-lg transition-colors">
        <button onClick={() => setOpen((v) => !v)} className="hover:text-[#3b82f6] transition-colors shrink-0">
          {Icon ? (
            <Icon className="w-3.5 h-3.5 text-[#3b82f6]" />
          ) : (
            <span className="w-3.5 h-3.5 rounded border border-dashed border-[#3f3f46] flex items-center justify-center text-[8px] text-[#3f3f46]">+</span>
          )}
        </button>
        <span className="text-[#d4d4d8]">{item}</span>
        <button onClick={onRemove} className="text-[#52525b] hover:text-red-400 ml-0.5 transition-colors">
          <X className="w-3 h-3" />
        </button>
      </span>
      {open && <IconPicker currentKey={iconKey} onSelect={onIconChange} onClose={() => setOpen(false)} />}
    </div>
  );
}

export default function SkillsEditor() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncingGh, setSyncingGh] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [itemIcons, setItemIcons] = useState<Record<string, string>>({});
  const [primaryRowId, setPrimaryRowId] = useState<string | null>(null);
  const [extraRowIds, setExtraRowIds] = useState<string[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" }>({ msg: "", type: "success" });

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 2500);
  }

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("portfolio_skills").select("*").order("sort_order");
    const rows = (data ?? []) as SkillRow[];

    if (rows.length === 0) {
      setPrimaryRowId(null);
      setExtraRowIds([]);
      setSkills([]);
      setItemIcons({});
      setLoading(false);
      return;
    }

    const first = rows[0];
    const mergedSet = new Set<string>();
    const mergedIcons: Record<string, string> = {};

    for (const row of rows) {
      for (const item of row.items ?? []) {
        mergedSet.add(item);
        const iconKey = row.item_icons?.[item];
        if (iconKey && !mergedIcons[item]) mergedIcons[item] = iconKey;
      }
    }

    setPrimaryRowId(first.id);
    setExtraRowIds(rows.slice(1).map((row) => row.id));
    setSkills(Array.from(mergedSet));
    setItemIcons(mergedIcons);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addSkill() {
    const value = newSkill.trim();
    if (!value) return;
    if (skills.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setNewSkill("");
      return;
    }
    setSkills((prev) => [...prev, value]);
    setNewSkill("");
  }

  function removeSkill(item: string) {
    setSkills((prev) => prev.filter((value) => value !== item));
    setItemIcons((prev) => {
      const next = { ...prev };
      delete next[item];
      return next;
    });
  }

  function setIcon(item: string, key: string | null) {
    setItemIcons((prev) => {
      const next = { ...prev };
      if (key === null) delete next[item];
      else next[item] = key;
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      category: "Skills",
      items: skills,
      item_icons: itemIcons,
      sort_order: 0,
      updated_at: new Date().toISOString(),
    };

    if (primaryRowId) {
      const { error } = await supabase.from("portfolio_skills").update(payload).eq("id", primaryRowId);
      if (error) {
        showToast("Gagal menyimpan skill.", "error");
        setSaving(false);
        return;
      }
    } else {
      const { data: inserted, error } = await supabase.from("portfolio_skills").insert(payload).select("id").single();
      if (error || !inserted) {
        showToast("Gagal membuat data skill.", "error");
        setSaving(false);
        return;
      }
      setPrimaryRowId(inserted.id);
    }

    if (extraRowIds.length > 0) {
      await supabase.from("portfolio_skills").delete().in("id", extraRowIds);
      setExtraRowIds([]);
    }

    showToast("Skill berhasil disimpan.");
    setSaving(false);
  }

  async function syncGithub() {
    setSyncingGh(true);
    try {
      const res = await fetch("/api/github");
      if (!res.ok) throw new Error("GitHub API error");
      const data = await res.json();
      const langs: string[] = (data.languages ?? []).map((lang: { name: string }) => lang.name).filter(Boolean);

      if (langs.length === 0) {
        showToast("Tidak ada data bahasa dari GitHub.", "error");
        return;
      }

      const existing = new Set(skills.map((item) => item.toLowerCase()));
      const nextSkills = [...skills];
      const nextIcons = { ...itemIcons };
      let added = 0;

      for (const lang of langs) {
        if (existing.has(lang.toLowerCase())) continue;
        nextSkills.push(lang);
        existing.add(lang.toLowerCase());
        const icon = ICON_LIST.find((item) => item.name.toLowerCase() === lang.toLowerCase())?.name;
        if (icon) nextIcons[lang] = icon;
        added++;
      }

      setSkills(nextSkills);
      setItemIcons(nextIcons);
      showToast(added > 0 ? `${added} skill dari GitHub ditambahkan.` : "Semua skill GitHub sudah ada.");
    } catch {
      showToast("Gagal sync GitHub.", "error");
    } finally {
      setSyncingGh(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-[#52525b]" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold text-[#fafafa] flex items-center gap-2">
            <Code2 className="w-5 h-5 text-[#3b82f6]" /> Skills
          </h1>
          <p className="text-sm text-[#71717a] mt-1">Semua skill dikelola sebagai satu daftar tanpa kategori.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={syncGithub}
            disabled={syncingGh}
            className="inline-flex items-center gap-2 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[#e4e4e7] text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {syncingGh ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />} Sync GitHub
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan
          </button>
        </div>
      </div>

      {toast.msg && (
        <div className={`mb-5 px-4 py-2.5 rounded-lg text-sm font-medium border ${toast.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"}`}>
          {toast.msg}
        </div>
      )}

      <div className="border border-[#27272a] rounded-2xl bg-[#0d0d14] p-5">
        <div className="flex gap-2 pb-4 border-b border-[#1e1e2e] mb-4">
          <input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSkill()}
            placeholder="Tambah skill..."
            className="flex-1 bg-[#111113] border border-[#27272a] focus:border-[#3b82f6] rounded-lg px-3 py-2 text-sm text-[#fafafa] focus:outline-none placeholder-[#3f3f46]"
          />
          <button onClick={addSkill} className="inline-flex items-center gap-1.5 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[#e4e4e7] text-sm px-3.5 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Tambah
          </button>
        </div>

        <div className="flex flex-wrap gap-2 min-h-[32px]">
          {skills.length > 0 ? (
            skills.map((item) => (
              <SkillBadge
                key={item}
                item={item}
                iconKey={itemIcons[item]}
                onRemove={() => removeSkill(item)}
                onIconChange={(key) => setIcon(item, key)}
              />
            ))
          ) : (
            <p className="text-xs text-[#52525b] italic">Belum ada skill. Tambahkan manual atau sync dari GitHub.</p>
          )}
        </div>
      </div>
    </div>
  );
}
