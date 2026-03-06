"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, Layers, RefreshCw, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Template {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  preview_image: string | null;
  is_active: boolean;
  is_builtin: boolean;
}

const TEMPLATE_ICONS: Record<string, string> = {
  "puck": "🧩",
  "minimal": "⬛",
  "bento": "🟦",
};

const TEMPLATE_COLORS: Record<string, string> = {
  "puck": "from-indigo-600/20 to-purple-600/20 border-indigo-500/30",
  "minimal": "from-zinc-700/20 to-zinc-600/20 border-zinc-500/30",
  "bento": "from-blue-600/20 to-cyan-600/20 border-blue-500/30",
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("portfolio_templates").select("*").order("is_active", { ascending: false });
    setTemplates(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const activate = async (templateId: string) => {
    setActivating(templateId);
    // Deactivate all
    await supabase.from("portfolio_templates").update({ is_active: false }).neq("id", "placeholder");
    // Activate chosen
    await supabase.from("portfolio_templates").update({ is_active: true }).eq("id", templateId);
    // Update system settings
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active_template: templateId }),
    });
    setActivating(null);
    load();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
    </div>
  );

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div>
        <h1 className="text-lg font-bold text-[#e2e2ef] flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" /> Template & Tema
        </h1>
        <p className="text-xs text-[#4a4a6a] mt-1">Pilih template untuk tampilan portfolio Anda. Ganti kapan saja tanpa kehilangan data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((tpl) => (
          <div key={tpl.id}
            className={`relative border rounded-2xl overflow-hidden transition-all duration-200 bg-gradient-to-br ${TEMPLATE_COLORS[tpl.id] ?? "from-[#1a1a2e]/20 to-[#16213e]/20 border-[#2a2a3a]"} ${tpl.is_active ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#0a0a0f]" : "hover:scale-[1.02]"}`}>
            {tpl.is_active && (
              <div className="absolute top-3 right-3">
                <span className="flex items-center gap-1 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  <CheckCircle className="w-3 h-3" /> Aktif
                </span>
              </div>
            )}

            {/* Preview */}
            <div className="h-40 bg-[#0d0d14] flex items-center justify-center border-b border-[#1e1e2e]">
              {tpl.preview_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tpl.preview_image} alt={tpl.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl opacity-60">{TEMPLATE_ICONS[tpl.id] ?? "🎨"}</span>
              )}
            </div>

            {/* Info */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-[#e2e2ef] text-sm">{tpl.name}</h3>
                <span className="text-[10px] text-[#4a4a6a] bg-[#12121c] px-2 py-0.5 rounded-full border border-[#1e1e2e]">v{tpl.version}</span>
              </div>
              <p className="text-[11px] text-[#6a6a8a] leading-relaxed mb-1">{tpl.description}</p>
              <p className="text-[10px] text-[#3a3a5a] mb-4">by {tpl.author}</p>

              {tpl.is_active ? (
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium">
                  <Zap className="w-3.5 h-3.5" /> Template Sedang Aktif
                </div>
              ) : (
                <button
                  onClick={() => activate(tpl.id)}
                  disabled={activating === tpl.id}
                  className="w-full flex items-center justify-center gap-2 bg-[#12121c] hover:bg-indigo-600 border border-[#2a2a3a] hover:border-indigo-500 text-[#c2c2df] hover:text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-200">
                  {activating === tpl.id
                    ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Mengaktifkan...</>
                    : "Aktifkan Template"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Info box */}
      <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-4 text-xs text-[#6a6a8a] flex gap-3 items-start">
        <span className="text-lg">💡</span>
        <div>
          <p className="font-semibold text-[#c2c2df] mb-1">Cara kerja template</p>
          <p>Template <strong className="text-[#c2c2df]">Puck Builder</strong> memberi kebebasan penuh — drag &amp; drop komponen. Template lain menggunakan data dari CMS secara otomatis. Mengganti template tidak menghapus konten apapun.</p>
        </div>
      </div>
    </div>
  );
}
