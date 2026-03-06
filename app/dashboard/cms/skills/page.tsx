"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Save, X, Loader2, Search } from "lucide-react";
import { ICON_LIST, ICON_MAP } from "@/lib/skill-icons";

interface SkillCat {
  id: string;
  category: string;
  items: string[];
  item_icons: Record<string, string>;
  sort_order: number;
}

/** Small icon picker popover */
function IconPicker({
  currentKey,
  onSelect,
  onClose,
}: {
  currentKey?: string;
  onSelect: (key: string | null) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const filtered = ICON_LIST.filter((i) =>
    i.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 30);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute z-50 top-full left-0 mt-1 w-64 bg-[#111113] border border-[#27272a] rounded-xl shadow-xl"
    >
      <div className="p-2 border-b border-[#27272a] flex items-center gap-2">
        <Search className="w-3.5 h-3.5 text-[#52525b]" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari icon..."
          className="flex-1 bg-transparent text-xs text-[#fafafa] outline-none placeholder-[#52525b]"
        />
      </div>
      <div className="max-h-48 overflow-y-auto p-2 grid grid-cols-5 gap-1">
        {filtered.map(({ name, Icon }) => (
          <button
            key={name}
            onClick={() => { onSelect(name); onClose(); }}
            title={name}
            className={`flex flex-col items-center justify-center gap-0.5 p-1.5 rounded-md hover:bg-[#27272a] transition-colors ${
              currentKey === name ? "bg-[#3b82f6]/20 ring-1 ring-[#3b82f6]/50" : ""
            }`}
          >
            <Icon className="w-4 h-4 text-[#a1a1aa]" />
            <span className="text-[8px] text-[#52525b] leading-none truncate w-full text-center">{name.split(".")[0]}</span>
          </button>
        ))}
      </div>
      <div className="p-2 border-t border-[#27272a]">
        <button onClick={() => { onSelect(null); onClose(); }}
          className="w-full text-center text-[10px] text-[#52525b] hover:text-red-400 transition-colors">
          Hapus icon
        </button>
      </div>
    </div>
  );
}

/** Skill item row with icon picker */
function SkillItem({
  item,
  iconKey,
  onRemove,
  onIconChange,
}: {
  item: string;
  iconKey?: string;
  onRemove: () => void;
  onIconChange: (key: string | null) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const Icon = iconKey ? ICON_MAP[iconKey] : null;

  return (
    <div className="relative inline-flex">
      <span className="inline-flex items-center gap-1 bg-[#18181b] border border-[#27272a] text-[#a1a1aa] text-xs px-2.5 py-1 rounded-md">
        {/* Icon button */}
        <button
          onClick={() => setPickerOpen((v) => !v)}
          title="Pilih icon"
          className="hover:text-[#3b82f6] transition-colors"
        >
          {Icon ? (
            <Icon className="w-3.5 h-3.5 text-[#3b82f6]" />
          ) : (
            <span className="w-3.5 h-3.5 rounded border border-dashed border-[#3f3f46] flex items-center justify-center text-[8px] text-[#3f3f46]">+</span>
          )}
        </button>
        {item}
        <button onClick={onRemove} className="text-[#52525b] hover:text-red-400 ml-0.5">
          <X className="w-3 h-3" />
        </button>
      </span>
      {pickerOpen && (
        <IconPicker
          currentKey={iconKey}
          onSelect={onIconChange}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}

export default function SkillsEditor() {
  const supabase = createClient();
  const [cats, setCats] = useState<SkillCat[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Record<string, string>>({});
  const [toast, setToast] = useState("");

  useEffect(() => {
    supabase.from("portfolio_skills").select("*").order("sort_order")
      .then(({ data }) => {
        setCats((data ?? []).map((c) => ({ ...c, item_icons: c.item_icons ?? {} })));
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  async function handleSave(cat: SkillCat) {
    setSaving(cat.id);
    const { error } = await supabase
      .from("portfolio_skills")
      .update({ items: cat.items, item_icons: cat.item_icons })
      .eq("id", cat.id);
    showToast(error ? "Gagal." : "Tersimpan!");
    setSaving(null);
  }

  function addItem(catId: string) {
    const val = (newItem[catId] ?? "").trim();
    if (!val) return;
    setCats((c) =>
      c.map((x) => x.id === catId ? { ...x, items: [...(x.items ?? []), val] } : x)
    );
    setNewItem((n) => ({ ...n, [catId]: "" }));
  }

  function removeItem(catId: string, item: string) {
    setCats((c) =>
      c.map((x) => {
        if (x.id !== catId) return x;
        const icons = { ...x.item_icons };
        delete icons[item];
        return { ...x, items: x.items.filter((i) => i !== item), item_icons: icons };
      })
    );
  }

  function setItemIcon(catId: string, item: string, key: string | null) {
    setCats((c) =>
      c.map((x) => {
        if (x.id !== catId) return x;
        const icons = { ...x.item_icons };
        if (key === null) delete icons[item];
        else icons[item] = key;
        return { ...x, item_icons: icons };
      })
    );
  }

  if (loading) return <div className="p-8 text-sm text-[#52525b]">Memuat...</div>;

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#fafafa]">Skills</h2>
        <p className="text-xs text-[#52525b] mt-1">
          Klik ikon <span className="text-[#3b82f6]">+</span> di setiap skill untuk memilih logo teknologi.
        </p>
      </div>
      {toast && <p className="text-xs text-emerald-400 mb-4">{toast}</p>}

      <div className="space-y-6">
        {cats.map((cat) => (
          <div key={cat.id} className="border border-[#27272a] rounded-xl p-4 bg-[#111113]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#fafafa]">{cat.category}</h3>
              <button
                onClick={() => handleSave(cat)}
                disabled={saving === cat.id}
                className="inline-flex items-center gap-1.5 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-md transition-colors"
              >
                {saving === cat.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Simpan
              </button>
            </div>

            {/* Skill badges */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {cat.items?.map((item) => (
                <SkillItem
                  key={item}
                  item={item}
                  iconKey={cat.item_icons?.[item]}
                  onRemove={() => removeItem(cat.id, item)}
                  onIconChange={(key) => setItemIcon(cat.id, item, key)}
                />
              ))}
            </div>

            {/* Add skill */}
            <div className="flex gap-2 mt-2">
              <input
                value={newItem[cat.id] ?? ""}
                onChange={(e) => setNewItem((n) => ({ ...n, [cat.id]: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && addItem(cat.id)}
                placeholder="Tambah skill..."
                className="flex-1 bg-[#09090b] border border-[#27272a] rounded-md px-3 py-1.5 text-xs text-[#fafafa] focus:border-[#3b82f6] focus:outline-none"
              />
              <button
                onClick={() => addItem(cat.id)}
                className="inline-flex items-center gap-1 border border-[#27272a] text-[#71717a] hover:text-[#fafafa] text-xs px-3 py-1.5 rounded-md transition-colors"
              >
                <Plus className="w-3 h-3" /> Tambah
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
