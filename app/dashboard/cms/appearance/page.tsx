"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, Loader2, GripVertical, Check, Palette } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Section Config
const SECTION_LABELS: Record<string, string> = {
  hero: "Hero Section",
  about: "About Me",
  skills: "Skills & Tech Stack",
  projects: "Featured Projects",
  experience: "Work Experience",
  contact: "Contact & Socials",
  education: "Education & Certs",
};

// Templates available — preview adalah mini mockup SVG
const TEMPLATES = [
  {
    id: "template1",
    name: "Modern Hacker",
    desc: "Glassmorphism modern, dark background dengan efek glow.",
    preview: (
      <svg viewBox="0 0 200 120" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="120" fill="#0b0c15"/>
        <rect x="20" y="20" width="80" height="8" rx="2" fill="#4f46e5" opacity="0.8"/>
        <rect x="20" y="34" width="120" height="5" rx="2" fill="#6a6a8a" opacity="0.6"/>
        <rect x="20" y="42" width="90" height="5" rx="2" fill="#6a6a8a" opacity="0.4"/>
        <rect x="20" y="60" width="50" height="12" rx="6" fill="#4f46e5"/>
        <rect x="76" y="60" width="50" height="12" rx="6" fill="none" stroke="#4f46e5" strokeWidth="1"/>
        <circle cx="160" cy="40" r="22" fill="#1a1a2e" stroke="#4f46e5" strokeWidth="0.5" opacity="0.8"/>
        <circle cx="160" cy="40" r="10" fill="#4f46e5" opacity="0.4"/>
        <rect x="20" y="90" width="160" height="1" fill="#1e1e2e"/>
        <rect x="60" y="98" width="80" height="4" rx="2" fill="#3a3a5a"/>
      </svg>
    ),
  },
  {
    id: "template2",
    name: "Elegant Minimalist",
    desc: "Desain putih bersih, tipografi serif, banyak white-space.",
    preview: (
      <svg viewBox="0 0 200 120" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="120" fill="#fafafa"/>
        <rect x="0" y="0" width="200" height="14" fill="#ffffff" opacity="0.9"/>
        <rect x="12" y="4" width="30" height="5" rx="1" fill="#111827"/>
        <rect x="120" y="4" width="20" height="5" rx="1" fill="#9ca3af"/>
        <rect x="148" y="4" width="20" height="5" rx="1" fill="#9ca3af"/>
        <rect x="20" y="26" width="40" height="4" rx="1" fill="#d1d5db"/>
        <rect x="20" y="34" width="140" height="12" rx="2" fill="#111827"/>
        <rect x="20" y="50" width="100" height="5" rx="1" fill="#9ca3af"/>
        <rect x="20" y="58" width="80" height="5" rx="1" fill="#9ca3af"/>
        <rect x="20" y="74" width="36" height="10" rx="0" fill="#111827"/>
        <rect x="62" y="74" width="36" height="10" rx="0" fill="none" stroke="#d1d5db" strokeWidth="1"/>
        <rect x="0" y="110" width="200" height="10" fill="#f3f4f6"/>
      </svg>
    ),
  },
  {
    id: "bento",
    name: "Bento Grid",
    desc: "Modern card-based layout ala bento box. (Segera hadir)",
    preview: (
      <svg viewBox="0 0 200 120" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="120" fill="#0a0a10"/>
        <rect x="10" y="10" width="85" height="55" rx="4" fill="#12121e" stroke="#2a2a3a" strokeWidth="0.5"/>
        <rect x="105" y="10" width="85" height="25" rx="4" fill="#12121e" stroke="#2a2a3a" strokeWidth="0.5"/>
        <rect x="105" y="40" width="40" height="25" rx="4" fill="#4f46e5" opacity="0.6"/>
        <rect x="150" y="40" width="40" height="25" rx="4" fill="#12121e" stroke="#2a2a3a" strokeWidth="0.5"/>
        <rect x="10" y="70" width="40" height="40" rx="4" fill="#12121e" stroke="#2a2a3a" strokeWidth="0.5"/>
        <rect x="55" y="70" width="85" height="40" rx="4" fill="#12121e" stroke="#2a2a3a" strokeWidth="0.5"/>
        <rect x="145" y="70" width="45" height="40" rx="4" fill="#12121e" stroke="#2a2a3a" strokeWidth="0.5"/>
      </svg>
    ),
  },
];

function SortableItem({ id, label, visible, onToggle }: { id: string; label: string; visible: boolean; onToggle: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 1 : 0 };

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center justify-between border ${isDragging ? "border-indigo-500 bg-[#1e1e2e]" : "border-[#2a2a3a] bg-[#12121c]"} rounded-lg p-3 mb-2 shadow-sm`}>
      <div className="flex items-center gap-3">
        <button {...attributes} {...listeners} className="text-[#4a4a6a] hover:text-[#c2c2df] cursor-grab active:cursor-grabbing"><GripVertical className="w-4 h-4" /></button>
        <span className={`text-sm font-medium ${visible ? "text-[#e2e2ef]" : "text-[#4a4a6a] line-through"}`}>{label}</span>
      </div>
      <button onClick={onToggle} className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${visible ? "bg-indigo-600/10 border-indigo-600/30 text-indigo-400" : "bg-[#1e1e2e] border-[#2a2a3a] text-[#6a6a8a]"}`}>
        {visible ? "Terlihat" : "Sembunyi"}
      </button>
    </div>
  );
}

export default function AppearanceEditor() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [settingsId, setSettingsId] = useState<string | null>(null);

  // State
  const [template, setTemplate] = useState("minimal");
  const [order, setOrder] = useState<string[]>([]);
  const [visible, setVisible] = useState<string[]>([]);
  const [theme, setTheme] = useState({ accent: "blue", heroStyle: "centered", roundness: "md", fontMono: false });

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase.from("portfolio_system_settings").select("*").limit(1).single();
        if (error) console.error("Error fetching appearance settings:", error);
        if (data) {
          setSettingsId(data.id);
          setTemplate(data.active_template ?? "template1");
          setOrder(data.section_order ?? []);
          setVisible(data.visible_sections ?? []);
          if (data.theme) setTheme(data.theme);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  async function handleSave() {
    if (!settingsId) return;
    setSaving(true);
    const { error } = await supabase.from("portfolio_system_settings").update({
      active_template: template,
      section_order: order,
      visible_sections: visible,
      theme,
    }).eq("id", settingsId);
    showToast(error ? "Gagal menyimpan" : "Perubahan diterapkan!");
    setSaving(false);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over!.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  function toggleVisible(id: string) {
    setVisible(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  if (loading) return <div className="p-8 text-sm text-[#4a4a6a]">Memuat...</div>;

  return (
    <div className="p-8 w-full space-y-10">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold text-[#e2e2ef]">Appearance</h1><p className="text-xs text-[#6a6a8a] mt-1">Ubah tampilan, warna, dan urutan seksi portofoliomu.</p></div>
        <div className="flex items-center gap-4">
          {toast && <span className="text-xs font-medium text-emerald-400">{toast}</span>}
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-all">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Simpan
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Templates */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#e2e2ef]"><Palette className="w-4 h-4 text-indigo-400" /> Active Template</div>
          <div className="grid sm:grid-cols-3 gap-3">
            {TEMPLATES.map(t => (
              <div key={t.id} onClick={() => setTemplate(t.id)} className={`relative cursor-pointer border rounded-xl overflow-hidden transition-all ${template === t.id ? "border-indigo-500 ring-1 ring-indigo-500/50" : "border-[#1e1e2e] bg-[#0d0d14] hover:border-[#2a2a3a]"}`}>
                {/* Preview Mockup */}
                <div className="w-full h-24 overflow-hidden bg-[#08080f]">
                  {t.preview}
                </div>
                {/* Info */}
                <div className="p-3 relative">
                  {template === t.id && <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white" /></div>}
                  <p className="font-semibold text-[#e2e2ef] text-xs mb-0.5">{t.name}</p>
                  <p className="text-[10px] text-[#6a6a8a] leading-relaxed pr-4 line-clamp-2">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Ordering */}
        <div className="space-y-4">
          <div className="text-sm font-bold text-[#e2e2ef]">Sections Ordering</div>
          <p className="text-xs text-[#6a6a8a] mb-2">Drag untuk mengubah urutan. Klik status untuk sembunyikan section dari halaman publik.</p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={order} strategy={verticalListSortingStrategy}>
              {order.map(id => (
                <SortableItem key={id} id={id} label={SECTION_LABELS[id] ?? id} visible={visible.includes(id)} onToggle={() => toggleVisible(id)} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
