"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, Loader2, GripVertical, Check, Palette } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
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

// Templates available
const TEMPLATES = [
  { id: "minimal", name: "Minimal", desc: "Clean, text-focused design dengan layout centered." },
  { id: "bento", name: "Bento Grid", desc: "Modern card-based layout ala bento box." },
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
    supabase.from("portfolio_settings").select("*").limit(1).single()
      .then(({ data }) => {
        if (data) {
          setSettingsId(data.id);
          setTemplate(data.active_template);
          setOrder(data.section_order ?? []);
          setVisible(data.visible_sections ?? []);
          if (data.theme) setTheme(data.theme);
        }
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  async function handleSave() {
    if (!settingsId) return;
    setSaving(true);
    const { error } = await supabase.from("portfolio_settings").update({
      active_template: template,
      section_order: order,
      visible_sections: visible,
      theme,
    }).eq("id", settingsId);
    showToast(error ? "Gagal menyimpan" : "Perubahan diterapkan!");
    setSaving(false);
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
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
          <div className="grid sm:grid-cols-2 gap-3">
            {TEMPLATES.map(t => (
              <div key={t.id} onClick={() => setTemplate(t.id)} className={`relative cursor-pointer border rounded-xl p-4 transition-all ${template === t.id ? "border-indigo-500 bg-indigo-600/5 ring-1 ring-indigo-500/50" : "border-[#1e1e2e] bg-[#0d0d14] hover:bg-[#14141f] hover:border-[#2a2a3a]"}`}>
                {template === t.id && <div className="absolute top-3 right-3 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                <p className="font-semibold text-[#e2e2ef] mb-1">{t.name}</p>
                <p className="text-[10px] text-[#6a6a8a] leading-relaxed pr-6">{t.desc}</p>
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
