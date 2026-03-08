"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, Loader2, User, Globe, Link2, Briefcase } from "lucide-react";
import Image from "next/image";
import { ImageUpload } from "@/components/image-upload";

type PersonalData = Record<string, string | number | boolean | string[]>;

type Tab = "basic" | "social" | "professional" | "availability";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "basic", label: "Info Dasar", icon: User },
  { id: "social", label: "Sosial Media", icon: Link2 },
  { id: "professional", label: "Profesional", icon: Briefcase },
  { id: "availability", label: "Ketersediaan", icon: Globe },
];

function Field({ label, name, value, onChange, type = "text", placeholder }: {
  label: string; name: string; value: string; onChange: (k: string, v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-[#c2c2df]">{label}</label>
      {type === "textarea" ? (
        <textarea value={value} rows={3} onChange={e => onChange(name, e.target.value)} placeholder={placeholder}
          className="w-full bg-[#0d0d14] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] placeholder-[#3a3a5a] focus:outline-none focus:border-indigo-500 transition-colors resize-none" />
      ) : (
        <input type={type} value={value} onChange={e => onChange(name, e.target.value)} placeholder={placeholder}
          className="w-full bg-[#0d0d14] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] placeholder-[#3a3a5a] focus:outline-none focus:border-indigo-500 transition-colors" />
      )}
    </div>
  );
}

export default function PersonalEditor() {
  const supabase = createClient();
  const [data, setData] = useState<PersonalData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ msg: "", ok: true });
  const [tab, setTab] = useState<Tab>("basic");

  const load = async () => {
    const { data: d } = await supabase.from("portfolio_personal").select("*").limit(1).single();
    if (d) setData(d);
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const set = (k: string, v: string | number | boolean) => setData(d => ({ ...d, [k]: v }));

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast({ msg: "", ok: true }), 2500); };

  async function handleSave() {
    setSaving(true);
    const { id, created_at, updated_at, ...payload } = data as Record<string, unknown>;
    let error;
    if (id) {
      ({ error } = await supabase.from("portfolio_personal").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", id as string));
    } else {
      ({ error } = await supabase.from("portfolio_personal").insert({ ...payload }));
    }
    showToast(error ? "Gagal menyimpan: " + error.message : "✓ Tersimpan!", !error);
    if (!error) load();
    setSaving(false);
    void created_at; void updated_at;
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-5 h-5 text-indigo-400 animate-spin" /></div>;

  const val = (k: string) => (data[k] as string) ?? "";
  const num = (k: string) => (data[k] as number) ?? 0;
  const bool = (k: string) => (data[k] as boolean) ?? false;

  return (
    <div className="p-6 w-full space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#e2e2ef] flex items-center gap-2"><User className="w-5 h-5 text-indigo-400" />Info Pribadi</h1>
          <p className="text-xs text-[#4a4a6a] mt-1">Informasi yang tampil di seluruh portfolio</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {toast.msg || "Simpan"}
        </button>
      </div>

      {/* Avatar */}
      <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-indigo-600/30 shrink-0 bg-[#1a1a2e] flex items-center justify-center">
            {val("avatar")
              ? <Image src={val("avatar")} alt="avatar" width={80} height={80} className="object-cover w-full h-full" />
              : <User className="w-8 h-8 text-[#3a3a5a]" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#e2e2ef] mb-1">{val("name") || "Nama belum diisi"}</p>
            <p className="text-xs text-[#4a4a6a]">{val("role") || "Role belum diisi"}</p>
          </div>
        </div>
        <div className="w-full">
          <ImageUpload value={val("avatar")} onChange={url => set("avatar", url)} folder="avatars" />
        </div>
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

      <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-6 space-y-5">
        {tab === "basic" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nama Lengkap" name="name" value={val("name")} onChange={set} placeholder="John Doe" />
              <Field label="Role / Jabatan" name="role" value={val("role")} onChange={set} placeholder="Full Stack Developer" />
              <Field label="Lokasi" name="location" value={val("location")} onChange={set} placeholder="Jakarta, Indonesia" />
              <Field label="Email" name="email" value={val("email")} onChange={set} placeholder="john@example.com" type="email" />
              <Field label="Nomor Telepon" name="phone" value={val("phone")} onChange={set} placeholder="+62 812 ..." />
              <Field label="Website" name="website" value={val("website")} onChange={set} placeholder="https://yourdomain.com" />
            </div>
            <Field label="Bio Singkat (untuk Hero)" name="bio_short" value={val("bio_short")} onChange={set} placeholder="1-2 kalimat ringkas tentang diri Anda" />
            <Field label="Bio Lengkap" name="bio" value={val("bio")} onChange={set} placeholder="Deskripsi lengkap tentang diri Anda..." type="textarea" />
          </>
        )}
        {tab === "social" && (
          <>
            <Field label="GitHub Username" name="github" value={val("github")} onChange={set} placeholder="revanapriyandi" />
            <Field label="LinkedIn URL" name="linkedin" value={val("linkedin")} onChange={set} placeholder="https://linkedin.com/in/..." />
            <Field label="Twitter / X URL" name="twitter" value={val("twitter")} onChange={set} placeholder="https://twitter.com/..." />
            <Field label="Instagram URL" name="instagram" value={val("instagram")} onChange={set} placeholder="https://instagram.com/..." />
            <Field label="YouTube URL" name="youtube" value={val("youtube")} onChange={set} placeholder="https://youtube.com/@..." />
          </>
        )}
        {tab === "professional" && (
          <>
            <Field label="FastWork Username" name="fastwork_username" value={val("fastwork_username")} onChange={set} placeholder="revan_" />
            <Field label="URL Resume / CV" name="resume_url" value={val("resume_url")} onChange={set} placeholder="https://drive.google.com/..." />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#c2c2df]">Tahun Pengalaman</label>
                <input type="number" value={num("years_of_exp")} onChange={e => set("years_of_exp", parseInt(e.target.value) || 0)}
                  className="w-full bg-[#0d0d14] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#c2c2df]">Jumlah Proyek</label>
                <input type="number" value={num("projects_completed")} onChange={e => set("projects_completed", parseInt(e.target.value) || 0)}
                  className="w-full bg-[#0d0d14] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] focus:outline-none focus:border-indigo-500" />
              </div>
            </div>
          </>
        )}
        {tab === "availability" && (
          <>
            <div className="flex items-center justify-between py-2 bg-[#12121c] px-4 rounded-xl border border-[#1e1e2e]">
              <div>
                <p className="text-sm font-semibold text-[#e2e2ef]">Open to Work</p>
                <p className="text-xs text-[#4a4a6a]">Tampilkan badge &quot;Available&quot; di portfolio</p>
              </div>
              <button onClick={() => set("open_to_work", !bool("open_to_work"))}
                className={`w-10 h-5 rounded-full transition-colors relative ${bool("open_to_work") ? "bg-indigo-600" : "bg-[#2a2a3a]"}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${bool("open_to_work") ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
            <Field label="Teks Ketersediaan" name="availability_text" value={val("availability_text")} onChange={set} placeholder="Available for freelance projects" />
          </>
        )}
      </div>
    </div>
  );
}
