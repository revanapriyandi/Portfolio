"use client";

import { useEffect, useState, useCallback } from "react";
import { Save, Settings2, Github, BarChart3, Globe, Palette, RefreshCw, ExternalLink, Bot, CheckCircle, ChevronsUpDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface SystemSettings {
  id?: string;
  site_title?: string;
  site_description?: string;
  site_url?: string;
  og_image?: string;
  active_template?: string;
  github_username?: string;
  github_token?: string;
  ga_measurement_id?: string;
  ga4_property_id?: string;
  ga_credentials_json?: string;
  theme?: {
    accent: string;
    bg: string;
    fontMono: boolean;
    roundness: string;
    templateTexts?: Record<string, string>;
  };
  gemini_api_key?: string;
  gemini_model?: string;
}

type Tab = "general" | "github" | "analytics" | "appearance" | "ai";
type TemplateId = "template1" | "template2";
type TemplateTextField = {
  key: string;
  label: string;
  placeholder: string;
};

function InputField({ label, name, value, onChange, type = "text", placeholder, hint }: {
  label: string; name: string; value: string; onChange: (n: string, v: string) => void;
  type?: string; placeholder?: string; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-[#c2c2df]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(name, e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0d0d14] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] placeholder-[#3a3a5a] focus:outline-none focus:border-indigo-500 transition-colors"
      />
      {hint && <p className="text-[10px] text-[#4a4a6a]">{hint}</p>}
    </div>
  );
}

function TextareaField({ label, name, value, onChange, placeholder, rows = 4, hint }: {
  label: string; name: string; value: string; onChange: (n: string, v: string) => void;
  placeholder?: string; rows?: number; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-[#c2c2df]">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(name, e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-[#0d0d14] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] placeholder-[#3a3a5a] focus:outline-none focus:border-indigo-500 transition-colors font-mono resize-none"
      />
      {hint && <p className="text-[10px] text-[#4a4a6a]">{hint}</p>}
    </div>
  );
}

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "General", icon: Globe },
  { id: "github", label: "GitHub", icon: Github },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "ai", label: "AI Config", icon: Bot },
];

const TEMPLATE_TEXT_FIELDS: Record<TemplateId, TemplateTextField[]> = {
  template1: [
    { key: "t1_nav_work", label: "Nav: Work", placeholder: "Work" },
    { key: "t1_nav_expertise", label: "Nav: Expertise", placeholder: "Expertise" },
    { key: "t1_nav_experience", label: "Nav: Experience", placeholder: "Experience" },
    { key: "t1_hero_greeting", label: "Hero Greeting", placeholder: "Hello, I'm" },
    { key: "t1_hero_talk_cta", label: "Hero CTA Talk", placeholder: "Let's Talk" },
    { key: "t1_hero_fastwork_cta", label: "Hero CTA Fastwork", placeholder: "Fastwork" },
    { key: "t1_hero_github_cta", label: "Hero CTA Github", placeholder: "GitHub" },
    { key: "t1_projects_title", label: "Projects Title", placeholder: "Selected Work." },
    { key: "t1_projects_live_cta", label: "Projects CTA Live", placeholder: "Live Site" },
    { key: "t1_projects_source_cta", label: "Projects CTA Source", placeholder: "View Source" },
    { key: "t1_projects_show_more", label: "Projects Show More", placeholder: "Show More" },
    { key: "t1_projects_show_less", label: "Projects Show Less", placeholder: "Show Less" },
    { key: "t1_expertise_title", label: "Expertise Title", placeholder: "My Capabilities." },
    { key: "t1_expertise_show_more", label: "Expertise Show More", placeholder: "Show More" },
    { key: "t1_expertise_show_less", label: "Expertise Show Less", placeholder: "Show Less" },
    { key: "t1_experience_title", label: "Experience Title", placeholder: "Experience." },
    { key: "t1_experience_present", label: "Experience Present Label", placeholder: "Present" },
    { key: "t1_experience_show_more", label: "Experience Show More", placeholder: "Show More" },
    { key: "t1_experience_show_less", label: "Experience Show Less", placeholder: "Show Less" },
    { key: "t1_contact_title_line1", label: "Contact Title Line 1", placeholder: "Let's talk" },
    { key: "t1_contact_title_line2", label: "Contact Title Line 2", placeholder: "future." },
    { key: "t1_contact_cta", label: "Contact CTA", placeholder: "Get In Touch" },
    { key: "t1_contact_fastwork_cta", label: "Contact Fastwork Label", placeholder: "FASTWORK" },
    { key: "t1_footer_suffix", label: "Footer Text", placeholder: "Crafted with Next.js & Framer Motion." },
  ],
  template2: [
    { key: "t2_nav_about", label: "Nav: About", placeholder: "About" },
    { key: "t2_nav_works", label: "Nav: Works", placeholder: "Works" },
    { key: "t2_nav_experience", label: "Nav: Experience", placeholder: "Experience" },
    { key: "t2_nav_contact", label: "Nav: Contact", placeholder: "Contact" },
    { key: "t2_hero_fallback_role", label: "Hero Fallback Role", placeholder: "Digital Creator" },
    { key: "t2_hero_fallback_title", label: "Hero Fallback Title", placeholder: "Crafting digital experiences with elegance." },
    { key: "t2_hero_fallback_desc", label: "Hero Fallback Description", placeholder: "Focused on minimalist design and robust engineering." },
    { key: "t2_hire_cta", label: "Hero Hire CTA", placeholder: "Hire Me" },
    { key: "t2_contact_nav_cta", label: "Hero Contact CTA", placeholder: "Get in Touch" },
    { key: "t2_skills_title", label: "Skills Title", placeholder: "Core Expertise" },
    { key: "t2_skills_show_more", label: "Skills Show More", placeholder: "Show More" },
    { key: "t2_skills_show_less", label: "Skills Show Less", placeholder: "Show Less" },
    { key: "t2_projects_title", label: "Projects Title", placeholder: "Selected Works" },
    { key: "t2_project_image_placeholder", label: "Project Image Placeholder", placeholder: "Project Image" },
    { key: "t2_project_view_cta", label: "Project CTA", placeholder: "View Project" },
    { key: "t2_projects_show_more", label: "Projects Show More", placeholder: "Show More" },
    { key: "t2_projects_show_less", label: "Projects Show Less", placeholder: "Show Less" },
    { key: "t2_experience_title", label: "Experience Title", placeholder: "Experience." },
    { key: "t2_experience_present", label: "Experience Present Label", placeholder: "Present" },
    { key: "t2_experience_show_more", label: "Experience Show More", placeholder: "Show More" },
    { key: "t2_experience_show_less", label: "Experience Show Less", placeholder: "Show Less" },
    { key: "t2_contact_title", label: "Contact Title", placeholder: "Let's talk." },
    { key: "t2_contact_desc", label: "Contact Description", placeholder: "I'm currently available for freelance projects and full-time opportunities." },
    { key: "t2_contact_email_label", label: "Contact Email Label", placeholder: "Email" },
    { key: "t2_contact_github_label", label: "Contact Github Label", placeholder: "Github" },
    { key: "t2_footer_suffix", label: "Footer Text", placeholder: "Minimal aesthetics." },
  ],
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({});
  const [templateTexts, setTemplateTexts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<Tab>("general");
  const [testingAi, setTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [modelComboOpen, setModelComboOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/settings");
    if (res.ok) {
      const data: SystemSettings = await res.json();
      setSettings(data);
      setTemplateTexts(data.theme?.templateTexts ?? {});
    }
    setLoading(false);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  const handleChange = (name: string, value: string) => {
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleThemeChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, theme: { ...(prev.theme ?? { accent: "#6366f1", bg: "#000000", fontMono: false, roundness: "md" }), [key]: value } }));
  };

  const handleTemplateChange = (template: TemplateId) => {
    setSettings((prev) => ({ ...prev, active_template: template }));
  };

  const handleTemplateTextChange = (key: string, value: string) => {
    setTemplateTexts((prev) => ({ ...prev, [key]: value }));
  };

  const handleTestGemini = async () => {
    setTestingAi(true);
    setAiTestResult(null);
    try {
      const res = await fetch("/api/test-gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: settings.gemini_api_key,
          model: settings.gemini_model || "gemini-2.5-flash"
        }),
      });
      const data = await res.json();
      setAiTestResult({ 
        success: res.ok && data.success, 
        message: data.message || (data.details ? `${data.error}: ${data.details}` : data.error) || "Unknown Error" 
      });
      if (res.ok && data.success && data.models) {
        setAvailableModels(data.models);
      }
    } catch (error: unknown) {
      setAiTestResult({ success: false, message: error instanceof Error ? error.message : "Network error" });
    } finally {
      setTestingAi(false);
    }
  };

  const handleSave = async () => {
    const cleanedTemplateTexts = Object.entries(templateTexts).reduce<Record<string, string>>((acc, [key, value]) => {
      const trimmed = value.trim();
      if (trimmed.length > 0) acc[key] = trimmed;
      return acc;
    }, {});

    const payload: SystemSettings = {
      ...settings,
      theme: {
        ...(settings.theme ?? { accent: "#6366f1", bg: "#000000", fontMono: false, roundness: "md" }),
        templateTexts: cleanedTemplateTexts,
      },
    };

    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
  };

  const activeTemplateId: TemplateId =
    settings.active_template === "template2" ? "template2" : "template1";

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
    </div>
  );

  return (
    <div className="p-6 w-full space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#e2e2ef] flex items-center gap-2"><Settings2 className="w-5 h-5 text-indigo-400" />System Settings</h1>
          <p className="text-xs text-[#4a4a6a] mt-1">Semua konfigurasi tersimpan di database, tidak perlu ubah .env</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {saved ? "Tersimpan!" : "Simpan"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-1 justify-center ${tab === id ? "bg-indigo-600 text-white" : "text-[#6a6a8a] hover:text-[#c2c2df]"}`}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-6 space-y-5">
        {tab === "general" && (
          <>
            <h2 className="text-sm font-semibold text-[#e2e2ef] mb-4">Informasi Situs</h2>
            <InputField label="Judul Situs" name="site_title" value={settings.site_title ?? ""} onChange={handleChange} placeholder="My Portfolio" />
            <InputField label="Deskripsi Situs" name="site_description" value={settings.site_description ?? ""} onChange={handleChange} placeholder="Personal portfolio & blog" />
            <InputField label="URL Situs" name="site_url" value={settings.site_url ?? ""} onChange={handleChange} placeholder="https://yourdomain.com" />
            <InputField label="OG Image URL" name="og_image" value={settings.og_image ?? ""} onChange={handleChange} placeholder="https://yourdomain.com/og.png" hint="Gambar yang muncul saat link dibagikan di sosial media" />
          </>
        )}

        {tab === "github" && (
          <>
            <h2 className="text-sm font-semibold text-[#e2e2ef] mb-4">Integrasi GitHub</h2>
            <InputField label="GitHub Username" name="github_username" value={settings.github_username ?? ""} onChange={handleChange} placeholder="revanapriyandi" />
            <InputField label="GitHub Token" name="github_token" value={settings.github_token ?? ""} onChange={handleChange} type="password"
              placeholder="ghp_xxxxxxxxxxxx" hint="Personal Access Token untuk meningkatkan rate limit API dari 60 → 5000 req/jam" />
            <div className="bg-[#12121c] border border-[#1e1e2e] rounded-lg p-4 text-xs text-[#6a6a8a]">
              Buat token di: <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">github.com/settings/tokens</a>
              <br />Scope yang dibutuhkan: <span className="text-[#c2c2df]">public_repo</span>
            </div>
          </>
        )}

        {tab === "analytics" && (
          <>
            <h2 className="text-sm font-semibold text-[#e2e2ef] mb-4">Google Analytics 4</h2>
            <InputField label="GA Measurement ID" name="ga_measurement_id" value={settings.ga_measurement_id ?? ""} onChange={handleChange} placeholder="G-XXXXXXXXXX" hint="Untuk tracking publik (frontend)" />
            <InputField label="GA4 Property ID" name="ga4_property_id" value={settings.ga4_property_id ?? ""} onChange={handleChange} placeholder="123456789" hint="Numeric ID untuk Data API (dashboard analytics)" />
            <TextareaField label="Service Account JSON" name="ga_credentials_json" value={settings.ga_credentials_json ?? ""} onChange={handleChange}
              placeholder='{"type":"service_account","project_id":"..."}' rows={6}
              hint="JSON credentials dari Google Cloud Service Account dengan akses GA4 Reporting API" />
          </>
        )}

        {tab === "appearance" && (
          <>
            <h2 className="text-sm font-semibold text-[#e2e2ef] mb-4">Tampilan Default</h2>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#c2c2df]">Template Portfolio</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: "template1", label: "Template 1", desc: "Modern dark layout" },
                  { id: "template2", label: "Template 2", desc: "Minimal editorial layout" },
                ].map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateChange(template.id as TemplateId)}
                    className={`text-left rounded-lg border px-3 py-2 transition-colors ${
                      (settings.active_template ?? "template1") === template.id
                        ? "border-indigo-500 bg-indigo-600/10"
                        : "border-[#1e1e2e] bg-[#12121c] hover:border-[#2a2a3a]"
                    }`}
                  >
                    <p className="text-xs font-semibold text-[#e2e2ef]">{template.label}</p>
                    <p className="text-[10px] text-[#6a6a8a] mt-1">{template.desc}</p>
                    <div className="mt-3 rounded-md border border-[#2a2a3a] overflow-hidden">
                      {template.id === "template1" ? (
                        <div className="bg-[#09090b] p-2">
                          <div className="h-1.5 w-16 rounded bg-indigo-500/80 mb-1.5" />
                          <div className="h-1.5 w-24 rounded bg-white/80 mb-2" />
                          <div className="grid grid-cols-3 gap-1.5">
                            <div className="h-6 rounded bg-white/10" />
                            <div className="h-6 rounded bg-white/10" />
                            <div className="h-6 rounded bg-white/10" />
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#f8f8f8] p-2">
                          <div className="h-1.5 w-16 rounded bg-black/70 mb-1.5" />
                          <div className="h-1.5 w-24 rounded bg-black/30 mb-2" />
                          <div className="space-y-1.5">
                            <div className="h-5 rounded bg-black/10" />
                            <div className="h-5 rounded bg-black/10" />
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#4a4a6a]">Template aktif: <span className="text-[#c2c2df]">{settings.active_template ?? "template1"}</span></p>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] text-indigo-400 hover:text-indigo-300"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Buka Preview Live
              </a>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#c2c2df]">Warna Aksen</label>
              <div className="flex items-center gap-3">
                <input type="color" value={settings.theme?.accent ?? "#6366f1"}
                  onChange={e => handleThemeChange("accent", e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-[#1e1e2e]" />
                <input type="text" value={settings.theme?.accent ?? "#6366f1"}
                  onChange={e => handleThemeChange("accent", e.target.value)}
                  className="bg-[#0d0d14] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] focus:outline-none focus:border-indigo-500 font-mono w-36" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#c2c2df]">Warna Background</label>
              <div className="flex items-center gap-3">
                <input type="color" value={settings.theme?.bg ?? "#000000"}
                  onChange={e => handleThemeChange("bg", e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-[#1e1e2e]" />
                <input type="text" value={settings.theme?.bg ?? "#000000"}
                  onChange={e => handleThemeChange("bg", e.target.value)}
                  className="bg-[#0d0d14] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] focus:outline-none focus:border-indigo-500 font-mono w-36" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#c2c2df]">Border Radius</label>
              <div className="flex gap-2">
                {["none", "sm", "md", "lg", "full"].map(r => (
                  <button key={r} onClick={() => handleThemeChange("roundness", r)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${settings.theme?.roundness === r ? "bg-indigo-600 border-indigo-500 text-white" : "bg-[#12121c] border-[#1e1e2e] text-[#6a6a8a] hover:text-[#c2c2df]"}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-xs font-medium text-[#c2c2df]">Font Monospace</p>
                <p className="text-[10px] text-[#4a4a6a]">Gunakan monospace font untuk heading</p>
              </div>
              <button onClick={() => handleThemeChange("fontMono", !settings.theme?.fontMono)}
                className={`w-10 h-5 rounded-full transition-colors relative ${settings.theme?.fontMono ? "bg-indigo-600" : "bg-[#2a2a3a]"}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${settings.theme?.fontMono ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
            <div className="space-y-3 pt-2">
              <div>
                <p className="text-xs font-medium text-[#c2c2df]">Konten Teks Template</p>
                <p className="text-[10px] text-[#4a4a6a] mt-1">
                  Edit teks untuk {activeTemplateId === "template1" ? "Template 1" : "Template 2"}.
                  Perubahan langsung disimpan saat klik tombol Simpan.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {TEMPLATE_TEXT_FIELDS[activeTemplateId].map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <label className="text-xs font-medium text-[#c2c2df]">
                      {field.label}
                      <span className="ml-1.5 text-[10px] text-[#5a5a7a] font-mono">{field.key}</span>
                    </label>
                    <input
                      type="text"
                      value={templateTexts[field.key] ?? ""}
                      onChange={(e) => handleTemplateTextChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full bg-[#0d0d14] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] placeholder-[#3a3a5a] focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        {tab === "ai" && (
          <>
            <h2 className="text-sm font-semibold text-[#e2e2ef] mb-4">Integrasi AI (Gemini)</h2>
            <InputField label="Gemini API Key" name="gemini_api_key" value={settings.gemini_api_key ?? ""} onChange={handleChange} type="password" placeholder="AIzadaSysxxxx..." hint="Gunakan API Key dari Google AI Studio." />
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#c2c2df]">Gemini Model</label>
              <Popover open={modelComboOpen} onOpenChange={setModelComboOpen}>
                <PopoverTrigger asChild>
                  <button
                    aria-expanded={modelComboOpen}
                    aria-haspopup="listbox"
                    disabled={testingAi || availableModels.length === 0}
                    className="flex items-center justify-between w-full bg-[#0d0d14] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] hover:border-indigo-500/60 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className={settings.gemini_model ? "text-[#e2e2ef]" : "text-[#4a4a6a]"}>
                      {settings.gemini_model || (availableModels.length === 0 ? "Klik Test Koneksi dulu..." : "Pilih model...")}
                    </span>
                    <ChevronsUpDown className="w-3.5 h-3.5 text-[#4a4a6a] shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-[#0d0d14] border border-[#1e1e2e] rounded-lg shadow-xl" align="start">
                  <Command className="bg-transparent">
                    <div className="flex items-center border-b border-[#1e1e2e] px-3">
                      <Search className="w-3.5 h-3.5 text-[#4a4a6a] mr-2 shrink-0" />
                      <CommandInput placeholder="Cari model..." className="h-9 bg-transparent border-none text-sm text-[#e2e2ef] placeholder:text-[#4a4a6a] focus:outline-none ring-0" />
                    </div>
                    <CommandList className="max-h-56">
                      <CommandEmpty className="py-3 text-center text-xs text-[#4a4a6a]">Model tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {availableModels.map((m) => (
                          <CommandItem
                            key={m}
                            value={m}
                            onSelect={() => {
                              handleChange("gemini_model", m);
                              setModelComboOpen(false);
                            }}
                            className="text-xs text-[#c2c2df] cursor-pointer hover:bg-[#1e1e2e] aria-selected:bg-[#1e1e2e] data-[selected=true]:bg-[#1e1e2e]"
                          >
                            <CheckCircle className={`mr-2 w-3 h-3 ${settings.gemini_model === m ? "text-indigo-400" : "opacity-0"}`} />
                            {m}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-[10px] text-[#4a4a6a]">Klik <b>Test Koneksi AI</b> untuk mengambil daftar model secara dinamis dari Google.</p>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <button
                onClick={handleTestGemini}
                disabled={testingAi || !settings.gemini_api_key}
                className="flex items-center gap-2 bg-[#1e1e2e] hover:bg-[#2a2a3a] disabled:opacity-50 text-[#e2e2ef] text-xs font-medium px-4 py-2 rounded-lg transition-colors border border-[#2a2a3a]"
              >
                {testingAi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5 text-indigo-400" />}
                {testingAi ? "Testing..." : "Test Koneksi AI"}
              </button>
              
              {aiTestResult && (
                <div className={`flex items-center gap-1.5 text-xs font-medium ${aiTestResult.success ? "text-emerald-400" : "text-red-400"}`}>
                  {aiTestResult.success ? <CheckCircle className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                  {aiTestResult.message}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
