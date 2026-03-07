"use client";

import { useEffect, useState, useCallback } from "react";
import { Save, Settings2, Github, BarChart3, Globe, Palette, RefreshCw } from "lucide-react";

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
  theme?: { accent: string; bg: string; fontMono: boolean; roundness: string };
}

type Tab = "general" | "github" | "analytics" | "appearance";

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
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<Tab>("general");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/settings");
    if (res.ok) setSettings(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChange = (name: string, value: string) => {
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleThemeChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, theme: { ...(prev.theme ?? { accent: "#6366f1", bg: "#000000", fontMono: false, roundness: "md" }), [key]: value } }));
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
  };

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
          </>
        )}
      </div>
    </div>
  );
}
