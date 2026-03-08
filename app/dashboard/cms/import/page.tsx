"use client";
import { useState } from "react";
import {
  Database, Save, User, Briefcase, Loader2, CheckCircle,
  ChevronDown, ChevronUp, GraduationCap, Code2, FolderOpen, Award, FileText, AlertCircle, Sparkles
} from "lucide-react";
import { PdfUploader } from "@/components/pdf-uploader";
import { ImageUpload } from "@/components/image-upload";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────
type Personal = {
  name?: string; role?: string; bio?: string; bio_short?: string;
  email?: string; phone?: string; location?: string; website?: string;
  github?: string; linkedin?: string; twitter?: string; instagram?: string;
  years_of_exp?: number; projects_completed?: number; avatar?: string;
};

type Experience = {
  company?: string; role?: string; type?: string; location?: string;
  start_date?: string; end_date?: string; current?: boolean;
  description?: string; tech_stack?: string[];
  _saved?: boolean;
};

type Education = {
  institution?: string; degree?: string; field_of_study?: string;
  start_date?: string; end_date?: string; current?: boolean;
  gpa?: string; description?: string;
  _saved?: boolean;
};

type Skill = { category?: string; items?: string[]; item_icons?: Record<string, string>; _saved?: boolean };

type Project = {
  title?: string; description?: string; tags?: string[];
  github?: string; live?: string; featured?: boolean; _saved?: boolean;
};

type Certification = {
  name?: string; issuer?: string; issued_date?: string;
  expire_date?: string; credential_url?: string; _saved?: boolean;
};

type ExtractedData = {
  personal?: Personal;
  experience?: Experience[];
  education?: Education[];
  skills?: Skill[];
  projects?: Project[];
  certifications?: Certification[];
};

// ─── Field Components ────────────────────────────────────
function FInput({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-medium text-[#8a8aaa] uppercase tracking-wide">{label}</label>
      {type === "textarea" ? (
        <textarea value={value} rows={3} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-[#0d0d14] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] placeholder-[#3a3a5a] focus:outline-none focus:border-indigo-500 transition-colors resize-none" />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-[#0d0d14] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] placeholder-[#3a3a5a] focus:outline-none focus:border-indigo-500 transition-colors" />
      )}
    </div>
  );
}

function Section({ title, icon: Icon, count, children, defaultOpen = true }: {
  title: string; icon: React.ElementType; count?: number;
  children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#12121c] transition-colors">
        <span className="flex items-center gap-2 text-sm font-semibold text-[#e2e2ef]">
          <Icon className="w-4 h-4 text-indigo-400" />{title}
          {count !== undefined && <span className="text-[10px] bg-indigo-600/30 text-indigo-300 px-1.5 py-0.5 rounded-full">{count}</span>}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-[#4a4a6a]" /> : <ChevronDown className="w-4 h-4 text-[#4a4a6a]" />}
      </button>
      {open && <div className="px-5 pb-5 space-y-4">{children}</div>}
    </div>
  );
}

function SaveBtn({ saved, saving, onClick }: { saved?: boolean; saving?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={saving || saved}
      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${saved ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600/30" : "bg-indigo-600 hover:bg-indigo-500 text-white"} disabled:opacity-60`}>
      {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : saved ? <CheckCircle className="w-3 h-3" /> : <Save className="w-3 h-3" />}
      {saved ? "Tersimpan" : saving ? "..." : "Simpan"}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function ResumeImportPage() {
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const [personal, setPersonal] = useState<Personal>({});
  const [experience, setExperience] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [savingAll, setSavingAll] = useState(false);
  const [allSaved, setAllSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fillingAi, setFillingAi] = useState(false);
  const [fillAiError, setFillAiError] = useState<string | null>(null);
  const [fillingCard, setFillingCard] = useState<string | null>(null);
  const supabase = createClient();

  // Normalize partial dates: "2021" → "2021-01-01", "2021-01" → "2021-01-01", null → null
  const toDate = (d?: string | null): string | null => {
    if (!d) return null;
    const s = d.trim();
    if (/^\d{4}$/.test(s)) return `${s}-01-01`;        // YYYY
    if (/^\d{4}-\d{2}$/.test(s)) return `${s}-01`;     // YYYY-MM
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10); // YYYY-MM-DD (trim any time)
    return null; // unparseable → null is safer than throwing
  };

  const handleExtracted = (data: Record<string, unknown>) => {
    const d = data as ExtractedData;
    setExtracted(d);
    setPersonal(d.personal ?? {});
    setExperience((d.experience ?? []).map(e => ({ ...e, _saved: false })));
    setEducation((d.education ?? []).map(e => ({ ...e, _saved: false })));
    setSkills((d.skills ?? []).map(s => ({ ...s, _saved: false })));
    setProjects((d.projects ?? []).map(p => ({ ...p, _saved: false })));
    setCertifications((d.certifications ?? []).map(c => ({ ...c, _saved: false })));
    setAllSaved(false);
    setSaveError(null);
    setFillAiError(null);
  };

  // ── Fill Empty Fields with AI ────────────────────────
  const fillWithAI = async () => {
    setFillingAi(true);
    setFillAiError(null);
    // Collect fields that are empty/null in personal
    const personalFieldKeys: (keyof Personal)[] = [
      "name", "role", "bio_short", "bio", "email", "phone",
      "location", "website", "github", "linkedin", "years_of_exp", "projects_completed"
    ];
    const emptyFields = personalFieldKeys.filter(k => !personal[k] || String(personal[k]).trim() === "");

    if (emptyFields.length === 0) {
      setFillingAi(false);
      return;
    }

    try {
      const res = await fetch("/api/fill-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          extractedData: { personal, experience, education, skills, projects, certifications },
          emptyFields,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "AI fill failed");
      // Merge filled values into personal state
      setPersonal(prev => ({ ...prev, ...json.filled }));
    } catch (e) {
      setFillAiError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setFillingAi(false);
    }
  };

  // ── Fill Single Card with AI ────────────────────────────
  const fillCardWithAI = async (
    cardKey: string,
    currentData: Record<string, unknown>,
    onFilled: (filled: Record<string, unknown>) => void
  ) => {
    setFillingCard(cardKey);
    setFillAiError(null);
    const emptyFields = Object.entries(currentData)
      .filter(([, v]) => !v || String(v).trim() === "")
      .map(([k]) => k)
      .filter(k => !k.startsWith("_"));
    if (emptyFields.length === 0) { setFillingCard(null); return; }
    try {
      const res = await fetch("/api/fill-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          extractedData: { personal, experience, education, skills, projects, certifications, currentItem: currentData },
          emptyFields,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "AI fill failed");
      onFilled(json.filled);
    } catch (e) {
      setFillAiError(e instanceof Error ? e.message : "Unknown");
    } finally {
      setFillingCard(null);
    }
  };

  // ── Save Personal ─────────────────────────────────────
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savedPersonal, setSavedPersonal] = useState(false);
  const savePersonal = async () => {
    setSavingPersonal(true);
    const { data: existing } = await supabase.from("portfolio_personal").select("id").limit(1).maybeSingle();
    const payload = {
      name: personal.name || null,
      role: personal.role || null,
      bio: personal.bio || null,
      bio_short: personal.bio_short || null,
      email: personal.email || null,
      phone: personal.phone || null,
      location: personal.location || null,
      website: personal.website || null,
      github: personal.github || null,
      linkedin: personal.linkedin || null,
      twitter: personal.twitter || null,
      instagram: personal.instagram || null,
      avatar: personal.avatar || null,
      years_of_exp: Number(personal.years_of_exp) || 0,
      projects_completed: Number(personal.projects_completed) || 0,
      updated_at: new Date().toISOString(),
    };
    let error;
    if (existing?.id) {
      ({ error } = await supabase.from("portfolio_personal").update(payload).eq("id", existing.id));
    } else {
      ({ error } = await supabase.from("portfolio_personal").insert(payload));
    }
    if (error) setSaveError(`Personal: ${error.message}`);
    else setSavedPersonal(true);
    setSavingPersonal(false);
  };

  // ── Save Experience ───────────────────────────────────
  const saveExp = async (idx: number) => {
    const exp = experience[idx];
    const { error } = await supabase.from("portfolio_experience").insert({
      role: exp.role || null,
      company: exp.company || null,
      type: exp.type || "Full-time",
      location: exp.location || null,
      start_date: toDate(exp.start_date),
      end_date: toDate(exp.end_date),
      current: exp.current ?? false,
      description: exp.description || null,
      tech_stack: exp.tech_stack ?? [],
      sort_order: idx,
    });
    if (error) setSaveError(`Experience[${idx}]: ${error.message}`);
    else setExperience(prev => prev.map((e, i) => i === idx ? { ...e, _saved: true } : e));
  };

  // ── Save Education ────────────────────────────────────
  const saveEdu = async (idx: number) => {
    const edu = education[idx];
    const { error } = await supabase.from("portfolio_education").insert({
      institution: edu.institution || null,
      degree: edu.degree || null,
      field_of_study: edu.field_of_study || null,
      start_date: toDate(edu.start_date),
      end_date: toDate(edu.end_date),
      current: edu.current ?? false,
      gpa: edu.gpa || null,
      description: edu.description || null,
      sort_order: idx,
    });
    if (error) setSaveError(`Education[${idx}]: ${error.message}`);
    else setEducation(prev => prev.map((e, i) => i === idx ? { ...e, _saved: true } : e));
  };

  // ── Save Skills ───────────────────────────────────────
  const saveSkill = async (idx: number) => {
    const sk = skills[idx];
    const { error } = await supabase.from("portfolio_skills").insert({
      category: sk.category || "General",
      items: sk.items ?? [],
      item_icons: sk.item_icons ?? {},
      sort_order: idx,
    });
    if (error) setSaveError(`Skills[${idx}]: ${error.message}`);
    else setSkills(prev => prev.map((s, i) => i === idx ? { ...s, _saved: true } : s));
  };

  // ── Save Project ──────────────────────────────────────
  const saveProject = async (idx: number) => {
    const proj = projects[idx];
    const { error } = await supabase.from("portfolio_projects").insert({
      title: proj.title || "Untitled Project",
      description: proj.description || null,
      tags: proj.tags ?? [],
      github: proj.github || null,
      live: proj.live || null,
      featured: proj.featured ?? false,
      sort_order: idx,
    });
    if (error) setSaveError(`Project[${idx}]: ${error.message}`);
    else setProjects(prev => prev.map((p, i) => i === idx ? { ...p, _saved: true } : p));
  };

  // ── Save Certification ────────────────────────────────
  const saveCert = async (idx: number) => {
    const cert = certifications[idx];
    const { error } = await supabase.from("portfolio_certifications").insert({
      name: cert.name || null,
      issuer: cert.issuer || null,
      issued_date: toDate(cert.issued_date),
      expire_date: toDate(cert.expire_date),
      credential_url: cert.credential_url || null,
    });
    if (error) setSaveError(`Cert[${idx}]: ${error.message}`);
    else setCertifications(prev => prev.map((c, i) => i === idx ? { ...c, _saved: true } : c));
  };

  // ── Save All (CLEAR + INSERT) ─────────────────────────
  const saveAll = async () => {
    const confirmed = confirm(
      "⚠️ Ini akan MENGHAPUS semua data yang ada di tabel Experience, Education, Skills, Projects, dan Certifications, lalu menggantinya dengan data dari PDF ini.\n\nLanjutkan?"
    );
    if (!confirmed) return;

    setSavingAll(true);
    setSaveError(null);

    // 1. Save personal (upsert — single row)
    await savePersonal();

    // 2. Clear list tables first
    if (experience.length > 0) await supabase.from("portfolio_experience").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (education.length > 0) await supabase.from("portfolio_education").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (skills.length > 0) await supabase.from("portfolio_skills").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (projects.length > 0) await supabase.from("portfolio_projects").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (certifications.length > 0) await supabase.from("portfolio_certifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 3. Insert fresh data sequentially per list
    await Promise.all([
      ...experience.map((_, i) => saveExp(i)),
      ...education.map((_, i) => saveEdu(i)),
      ...skills.map((_, i) => saveSkill(i)),
      ...projects.map((_, i) => saveProject(i)),
      ...certifications.map((_, i) => saveCert(i)),
    ]);

    setSavingAll(false);
    setAllSaved(true);
  };


  return (
    <div className="p-6 w-full space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#e2e2ef] flex items-center gap-2">
          <Database className="w-6 h-6 text-indigo-400" />
          Import dari PDF / Resume
        </h1>
        <p className="text-sm text-[#8a8aaa] mt-1">
          Upload CV — AI akan mengekstrak semua data dan menampilkan preview per-bagian yang bisa Anda simpan ke database terkait.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-6">
        <PdfUploader onExtracted={handleExtracted} />
      </div>

      {/* Preview */}
      {extracted && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Toolbar */}
          <div className="flex items-center justify-between sticky top-0 z-10 bg-[#09090b] border border-[#1e1e2e] rounded-xl px-4 py-3">
            <h2 className="text-sm font-bold text-[#e2e2ef] flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Preview Hasil Ekstraksi
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={fillWithAI} disabled={fillingAi}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 transition-colors disabled:opacity-50">
                {fillingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {fillingAi ? "Mengisi..." : "Isi Kosong dengan AI"}
              </button>
              <button onClick={saveAll} disabled={savingAll || allSaved}
                className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${allSaved ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600/30" : "bg-indigo-600 hover:bg-indigo-500 text-white"} disabled:opacity-60`}>
                {savingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : allSaved ? <CheckCircle className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                {allSaved ? "Semua Tersimpan!" : savingAll ? "Menyimpan semua..." : "Simpan Semua"}
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {saveError && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">Gagal menyimpan:</p>
                <p className="font-mono">{saveError}</p>
              </div>
            </div>
          )}
          {fillAiError && (
            <div className="flex items-start gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs px-4 py-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">AI fill gagal:</p>
                <p className="font-mono">{fillAiError}</p>
              </div>
            </div>
          )}

          {/* ── Personal ─── */}
          <Section title="Info Pribadi" icon={User} defaultOpen>
            <div className="flex justify-end"><SaveBtn saved={savedPersonal} saving={savingPersonal} onClick={savePersonal} /></div>
            {/* Avatar */}
            <div className="flex items-center gap-5 p-4 bg-[#09090b] rounded-xl border border-[#1e1e2e]">
              <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-indigo-600/30 shrink-0 bg-[#1a1a2e] flex items-center justify-center">
                {personal.avatar
                  ? <Image src={personal.avatar} alt="avatar" width={80} height={80} className="object-cover w-full h-full" />
                  : <User className="w-8 h-8 text-[#3a3a5a]" />}
              </div>
              <div className="flex-1">
                <p className="text-xs text-[#8a8aaa] mb-2">Foto Profil</p>
                <ImageUpload value={personal.avatar ?? ""} onChange={url => setPersonal(p => ({ ...p, avatar: url }))} folder="avatars" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FInput label="Nama" value={personal.name ?? ""} onChange={v => setPersonal(p => ({ ...p, name: v }))} placeholder="John Doe" />
              <FInput label="Role" value={personal.role ?? ""} onChange={v => setPersonal(p => ({ ...p, role: v }))} placeholder="Full Stack Developer" />
              <FInput label="Email" value={personal.email ?? ""} onChange={v => setPersonal(p => ({ ...p, email: v }))} type="email" placeholder="john@example.com" />
              <FInput label="Telepon" value={personal.phone ?? ""} onChange={v => setPersonal(p => ({ ...p, phone: v }))} placeholder="+62 ..." />
              <FInput label="Lokasi" value={personal.location ?? ""} onChange={v => setPersonal(p => ({ ...p, location: v }))} placeholder="Jakarta, Indonesia" />
              <FInput label="Website" value={personal.website ?? ""} onChange={v => setPersonal(p => ({ ...p, website: v }))} placeholder="https://..." />
              <FInput label="GitHub" value={personal.github ?? ""} onChange={v => setPersonal(p => ({ ...p, github: v }))} placeholder="username" />
              <FInput label="LinkedIn" value={personal.linkedin ?? ""} onChange={v => setPersonal(p => ({ ...p, linkedin: v }))} placeholder="https://linkedin.com/in/..." />
            </div>
            <FInput label="Bio Singkat" value={personal.bio_short ?? ""} onChange={v => setPersonal(p => ({ ...p, bio_short: v }))} placeholder="1-2 kalimat..." />
            <FInput label="Bio Lengkap" value={personal.bio ?? ""} onChange={v => setPersonal(p => ({ ...p, bio: v }))} placeholder="Deskripsi lengkap..." type="textarea" />
            <div className="grid grid-cols-2 gap-3">
              <FInput label="Tahun Pengalaman" value={String(personal.years_of_exp ?? "")} onChange={v => setPersonal(p => ({ ...p, years_of_exp: parseInt(v) || 0 }))} type="number" />
              <FInput label="Jumlah Proyek" value={String(personal.projects_completed ?? "")} onChange={v => setPersonal(p => ({ ...p, projects_completed: parseInt(v) || 0 }))} type="number" />
            </div>
          </Section>

          {/* ── Experience ─── */}
          {experience.length > 0 && (
            <Section title="Pengalaman Kerja" icon={Briefcase} count={experience.length} defaultOpen>
              {experience.map((exp, i) => (
                <div key={i} className={`border rounded-xl p-4 space-y-3 ${exp._saved ? "border-emerald-600/30 bg-emerald-600/5" : "border-[#1e1e2e] bg-[#09090b]"}`}>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-indigo-300 truncate">{exp.company} — {exp.role}</p>
                    <button
                      onClick={() => fillCardWithAI(`exp-${i}`, { company: exp.company, role: exp.role, type: exp.type, location: exp.location, description: exp.description, tech_stack: (exp.tech_stack ?? []).join(", ") },
                        (filled) => setExperience(prev => prev.map((e, idx) => idx === i ? { ...e, ...filled, tech_stack: typeof filled.tech_stack === "string" ? filled.tech_stack.split(",").map((s: string) => s.trim()) : e.tech_stack } : e)))}
                      disabled={fillingCard === `exp-${i}`}
                      className="ml-auto flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/20 text-violet-300 transition-colors disabled:opacity-50 shrink-0">
                      {fillingCard === `exp-${i}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AI
                    </button>
                    <SaveBtn saved={exp._saved} onClick={() => saveExp(i)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FInput label="Perusahaan" value={exp.company ?? ""} onChange={v => setExperience(prev => prev.map((e, idx) => idx === i ? { ...e, company: v } : e))} />
                    <FInput label="Jabatan" value={exp.role ?? ""} onChange={v => setExperience(prev => prev.map((e, idx) => idx === i ? { ...e, role: v } : e))} />
                    <FInput label="Tipe" value={exp.type ?? ""} onChange={v => setExperience(prev => prev.map((e, idx) => idx === i ? { ...e, type: v } : e))} />
                    <FInput label="Lokasi" value={exp.location ?? ""} onChange={v => setExperience(prev => prev.map((e, idx) => idx === i ? { ...e, location: v } : e))} />
                    <FInput label="Tanggal Mulai (YYYY-MM-DD)" value={exp.start_date ?? ""} onChange={v => setExperience(prev => prev.map((e, idx) => idx === i ? { ...e, start_date: v } : e))} />
                    <FInput label="Tanggal Selesai (YYYY-MM-DD)" value={exp.end_date ?? ""} onChange={v => setExperience(prev => prev.map((e, idx) => idx === i ? { ...e, end_date: v } : e))} />
                  </div>
                  <FInput label="Deskripsi" value={exp.description ?? ""} onChange={v => setExperience(prev => prev.map((e, idx) => idx === i ? { ...e, description: v } : e))} type="textarea" />
                  <FInput label="Tech Stack (pisah koma)" value={(exp.tech_stack ?? []).join(", ")} onChange={v => setExperience(prev => prev.map((e, idx) => idx === i ? { ...e, tech_stack: v.split(",").map(s => s.trim()).filter(Boolean) } : e))} placeholder="React, Node.js, ..." />
                </div>
              ))}
            </Section>
          )}

          {/* ── Education ─── */}
          {education.length > 0 && (
            <Section title="Pendidikan" icon={GraduationCap} count={education.length} defaultOpen={false}>
              {education.map((edu, i) => (
                <div key={i} className={`border rounded-xl p-4 space-y-3 ${edu._saved ? "border-emerald-600/30 bg-emerald-600/5" : "border-[#1e1e2e] bg-[#09090b]"}`}>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-indigo-300 truncate">{edu.institution} — {edu.degree}</p>
                    <button
                      onClick={() => fillCardWithAI(`edu-${i}`, { institution: edu.institution, degree: edu.degree, field_of_study: edu.field_of_study, gpa: edu.gpa, description: edu.description },
                        (filled) => setEducation(prev => prev.map((e, idx) => idx === i ? { ...e, ...filled } : e)))}
                      disabled={fillingCard === `edu-${i}`}
                      className="ml-auto flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/20 text-violet-300 transition-colors disabled:opacity-50 shrink-0">
                      {fillingCard === `edu-${i}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AI
                    </button>
                    <SaveBtn saved={edu._saved} onClick={() => saveEdu(i)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FInput label="Institusi" value={edu.institution ?? ""} onChange={v => setEducation(prev => prev.map((e, idx) => idx === i ? { ...e, institution: v } : e))} />
                    <FInput label="Gelar" value={edu.degree ?? ""} onChange={v => setEducation(prev => prev.map((e, idx) => idx === i ? { ...e, degree: v } : e))} />
                    <FInput label="Jurusan" value={edu.field_of_study ?? ""} onChange={v => setEducation(prev => prev.map((e, idx) => idx === i ? { ...e, field_of_study: v } : e))} />
                    <FInput label="IPK" value={edu.gpa ?? ""} onChange={v => setEducation(prev => prev.map((e, idx) => idx === i ? { ...e, gpa: v } : e))} />
                    <FInput label="Tanggal Mulai (YYYY-MM-DD)" value={edu.start_date ?? ""} onChange={v => setEducation(prev => prev.map((e, idx) => idx === i ? { ...e, start_date: v } : e))} />
                    <FInput label="Tanggal Selesai (YYYY-MM-DD)" value={edu.end_date ?? ""} onChange={v => setEducation(prev => prev.map((e, idx) => idx === i ? { ...e, end_date: v } : e))} />
                  </div>
                  <FInput label="Deskripsi / Aktivitas" value={edu.description ?? ""} onChange={v => setEducation(prev => prev.map((e, idx) => idx === i ? { ...e, description: v } : e))} type="textarea" />
                </div>
              ))}
            </Section>
          )}

          {/* ── Skills ─── */}
          {skills.length > 0 && (
            <Section title="Keahlian" icon={Code2} count={skills.length} defaultOpen={false}>
              {skills.map((sk, i) => (
                <div key={i} className={`border rounded-xl p-4 space-y-3 ${sk._saved ? "border-emerald-600/30 bg-emerald-600/5" : "border-[#1e1e2e] bg-[#09090b]"}`}>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-indigo-300 truncate">{sk.category}</p>
                    <button
                      onClick={() => fillCardWithAI(`sk-${i}`, { category: sk.category, items: (sk.items ?? []).join(", ") },
                        (filled) => setSkills(prev => prev.map((s, idx) => idx === i ? { ...s, ...filled, items: typeof filled.items === "string" ? filled.items.split(",").map((x: string) => x.trim()).filter(Boolean) : s.items } : s)))}
                      disabled={fillingCard === `sk-${i}`}
                      className="ml-auto flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/20 text-violet-300 transition-colors disabled:opacity-50 shrink-0">
                      {fillingCard === `sk-${i}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AI
                    </button>
                    <SaveBtn saved={sk._saved} onClick={() => saveSkill(i)} />
                  </div>
                  <FInput label="Kategori" value={sk.category ?? ""} onChange={v => setSkills(prev => prev.map((s, idx) => idx === i ? { ...s, category: v } : s))} />
                  <FInput label="Item (pisah koma)" value={(sk.items ?? []).join(", ")} onChange={v => setSkills(prev => prev.map((s, idx) => idx === i ? { ...s, items: v.split(",").map(x => x.trim()).filter(Boolean) } : s))} placeholder="React, Vue, ..." />
                  {sk.items && sk.items.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-[#4a4a6a]">
                        Preview · {Object.keys(sk.item_icons ?? {}).length} ikon terdeteksi
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {sk.items.map((item, j) => {
                          const iconSlug = sk.item_icons?.[item];
                          return (
                            <span key={j} className="flex items-center gap-1 text-[11px] bg-[#12121c] border border-[#1e1e2e] text-[#c2c2df] px-2 py-1 rounded-lg">
                              {iconSlug ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${iconSlug}/${iconSlug}-original.svg`}
                                  alt={item}
                                  width={14} height={14}
                                  className="w-3.5 h-3.5 object-contain"
                                  onError={e => { (e.target as HTMLImageElement).src = `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${iconSlug}/${iconSlug}-plain.svg`; }}
                                />
                              ) : (
                                <span className="w-3.5 h-3.5 rounded-sm bg-indigo-600/40 text-indigo-300 text-[8px] flex items-center justify-center font-bold shrink-0">
                                  {item[0]?.toUpperCase()}
                                </span>
                              )}
                              {item}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

              ))}
            </Section>
          )}

          {/* ── Projects ─── */}
          {projects.length > 0 && (
            <Section title="Proyek" icon={FolderOpen} count={projects.length} defaultOpen={false}>
              {projects.map((proj, i) => (
                <div key={i} className={`border rounded-xl p-4 space-y-3 ${proj._saved ? "border-emerald-600/30 bg-emerald-600/5" : "border-[#1e1e2e] bg-[#09090b]"}`}>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-indigo-300 truncate">{proj.title}</p>
                    <button
                      onClick={() => fillCardWithAI(`proj-${i}`, { title: proj.title, description: proj.description, github: proj.github, live: proj.live, tags: (proj.tags ?? []).join(", ") },
                        (filled) => setProjects(prev => prev.map((p, idx) => idx === i ? { ...p, ...filled, tags: typeof filled.tags === "string" ? filled.tags.split(",").map((x: string) => x.trim()).filter(Boolean) : p.tags } : p)))}
                      disabled={fillingCard === `proj-${i}`}
                      className="ml-auto flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/20 text-violet-300 transition-colors disabled:opacity-50 shrink-0">
                      {fillingCard === `proj-${i}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AI
                    </button>
                    <SaveBtn saved={proj._saved} onClick={() => saveProject(i)} />
                  </div>
                  <FInput label="Judul" value={proj.title ?? ""} onChange={v => setProjects(prev => prev.map((p, idx) => idx === i ? { ...p, title: v } : p))} />
                  <FInput label="Deskripsi" value={proj.description ?? ""} onChange={v => setProjects(prev => prev.map((p, idx) => idx === i ? { ...p, description: v } : p))} type="textarea" />
                  <div className="grid grid-cols-2 gap-3">
                    <FInput label="GitHub URL" value={proj.github ?? ""} onChange={v => setProjects(prev => prev.map((p, idx) => idx === i ? { ...p, github: v } : p))} />
                    <FInput label="Live Demo URL" value={proj.live ?? ""} onChange={v => setProjects(prev => prev.map((p, idx) => idx === i ? { ...p, live: v } : p))} />
                  </div>
                  <FInput label="Tags (pisah koma)" value={(proj.tags ?? []).join(", ")} onChange={v => setProjects(prev => prev.map((p, idx) => idx === i ? { ...p, tags: v.split(",").map(x => x.trim()).filter(Boolean) } : p))} placeholder="React, API, ..." />
                </div>
              ))}
            </Section>
          )}

          {/* ── Certifications ─── */}
          {certifications.length > 0 && (
            <Section title="Sertifikasi" icon={Award} count={certifications.length} defaultOpen={false}>
              {certifications.map((cert, i) => (
                <div key={i} className={`border rounded-xl p-4 space-y-3 ${cert._saved ? "border-emerald-600/30 bg-emerald-600/5" : "border-[#1e1e2e] bg-[#09090b]"}`}>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-indigo-300 truncate">{cert.name}</p>
                    <button
                      onClick={() => fillCardWithAI(`cert-${i}`, { name: cert.name, issuer: cert.issuer, issued_date: cert.issued_date, expire_date: cert.expire_date, credential_url: cert.credential_url },
                        (filled) => setCertifications(prev => prev.map((c, idx) => idx === i ? { ...c, ...filled } : c)))}
                      disabled={fillingCard === `cert-${i}`}
                      className="ml-auto flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/20 text-violet-300 transition-colors disabled:opacity-50 shrink-0">
                      {fillingCard === `cert-${i}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AI
                    </button>
                    <SaveBtn saved={cert._saved} onClick={() => saveCert(i)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FInput label="Nama Sertifikat" value={cert.name ?? ""} onChange={v => setCertifications(prev => prev.map((c, idx) => idx === i ? { ...c, name: v } : c))} />
                    <FInput label="Penerbit" value={cert.issuer ?? ""} onChange={v => setCertifications(prev => prev.map((c, idx) => idx === i ? { ...c, issuer: v } : c))} />
                    <FInput label="Tanggal Terbit (YYYY-MM-DD)" value={cert.issued_date ?? ""} onChange={v => setCertifications(prev => prev.map((c, idx) => idx === i ? { ...c, issued_date: v } : c))} />
                    <FInput label="Kadaluarsa (YYYY-MM-DD)" value={cert.expire_date ?? ""} onChange={v => setCertifications(prev => prev.map((c, idx) => idx === i ? { ...c, expire_date: v } : c))} />
                    <FInput label="URL Kredensial" value={cert.credential_url ?? ""} onChange={v => setCertifications(prev => prev.map((c, idx) => idx === i ? { ...c, credential_url: v } : c))} />
                  </div>
                </div>
              ))}
            </Section>
          )}

          {/* Bottom Save All */}
          <div className="flex justify-end pt-2 pb-6">
            <button onClick={saveAll} disabled={savingAll || allSaved}
              className={`flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors ${allSaved ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600/30" : "bg-indigo-600 hover:bg-indigo-500 text-white"} disabled:opacity-60`}>
              {savingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : allSaved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {allSaved ? "Semua Data Tersimpan!" : savingAll ? "Menyimpan semua..." : "Simpan Semua ke Database"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
