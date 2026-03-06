"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Edit3, ExternalLink, Eye, EyeOff, RefreshCw, Globe, FileText, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

interface Page {
  slug: string;
  title: string;
  description?: string;
  status: "published" | "draft";
  show_in_nav: boolean;
  nav_order: number;
  created_at: string;
  updated_at: string;
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0d0d14] border border-[#1e1e2e] rounded-2xl p-6 w-full max-w-md shadow-2xl">
        {children}
      </div>
    </div>
  );
}

export default function PagesManagerPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPage, setNewPage] = useState({ title: "", slug: "", description: "", status: "draft" });
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/pages");
    if (res.ok) setPages(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!newPage.title || !newPage.slug) return;
    setCreating(true);
    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newPage, nav_order: pages.length }),
    });
    setCreating(false);
    if (res.ok) {
      setShowCreate(false);
      setNewPage({ title: "", slug: "", description: "", status: "draft" });
      load();
    }
  };

  const toggleStatus = async (slug: string, current: "published" | "draft") => {
    await fetch(`/api/pages/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: current === "published" ? "draft" : "published" }),
    });
    load();
  };

  const toggleNav = async (slug: string, current: boolean) => {
    await fetch(`/api/pages/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ show_in_nav: !current }),
    });
    load();
  };

  const handleDelete = async () => {
    if (!deleteSlug) return;
    await fetch(`/api/pages/${deleteSlug}`, { method: "DELETE" });
    setDeleteSlug(null);
    load();
  };

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
    </div>
  );

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#e2e2ef] flex items-center gap-2"><Globe className="w-5 h-5 text-indigo-400" />Manajemen Halaman</h1>
          <p className="text-xs text-[#4a4a6a] mt-1">{pages.length} halaman tersedia</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-3.5 h-3.5" /> Buat Halaman
        </button>
      </div>

      {/* Pages Grid */}
      <div className="grid gap-3">
        {pages.map((page) => (
          <div key={page.slug} className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-4 flex items-center gap-4 hover:border-[#2a2a3a] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-semibold text-[#e2e2ef]">{page.title}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${page.status === "published" ? "bg-emerald-600/10 border-emerald-600/30 text-emerald-400" : "bg-[#1e1e2e] border-[#2a2a3a] text-[#4a4a6a]"}`}>
                  {page.status === "published" ? <CheckCircle className="inline w-2.5 h-2.5 mr-1" /> : <Clock className="inline w-2.5 h-2.5 mr-1" />}
                  {page.status}
                </span>
              </div>
              <p className="text-[11px] text-[#4a4a6a] font-mono">/{page.slug}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => toggleNav(page.slug, page.show_in_nav)} title={page.show_in_nav ? "Sembunyikan dari navbar" : "Tampilkan di navbar"}
                className={`p-2 rounded-lg transition-colors text-xs ${page.show_in_nav ? "text-indigo-400 hover:bg-indigo-600/10" : "text-[#3a3a5a] hover:text-[#6a6a8a] hover:bg-[#14141f]"}`}>
                {page.show_in_nav ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => toggleStatus(page.slug, page.status)} title="Toggle status"
                className="p-2 rounded-lg text-[#3a3a5a] hover:text-[#6a6a8a] hover:bg-[#14141f] transition-colors">
                {page.status === "published" ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5" />}
              </button>
              <Link href={`/dashboard/cms/builder?slug=${page.slug}`}
                className="p-2 rounded-lg text-[#3a3a5a] hover:text-indigo-400 hover:bg-indigo-600/10 transition-colors" title="Edit di Builder">
                <Edit3 className="w-3.5 h-3.5" />
              </Link>
              {page.status === "published" && (
                <a href={`/${page.slug === "home" ? "" : page.slug}`} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg text-[#3a3a5a] hover:text-[#c2c2df] hover:bg-[#14141f] transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {page.slug !== "home" && (
                <button onClick={() => setDeleteSlug(page.slug)}
                  className="p-2 rounded-lg text-[#3a3a5a] hover:text-red-400 hover:bg-red-500/5 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)}>
        <h2 className="text-sm font-bold text-[#e2e2ef] mb-5">Buat Halaman Baru</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#c2c2df]">Judul Halaman</label>
            <input value={newPage.title} onChange={e => setNewPage(p => ({ ...p, title: e.target.value, slug: autoSlug(e.target.value) }))}
              placeholder="Tentang Saya"
              className="mt-1.5 w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] placeholder-[#3a3a5a] focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#c2c2df]">Slug URL</label>
            <div className="flex items-center mt-1.5">
              <span className="bg-[#0d0d14] border border-r-0 border-[#1e1e2e] px-3 py-2 text-xs text-[#4a4a6a] rounded-l-lg">/</span>
              <input value={newPage.slug} onChange={e => setNewPage(p => ({ ...p, slug: e.target.value }))}
                placeholder="tentang-saya"
                className="flex-1 bg-[#12121c] border border-[#1e1e2e] rounded-r-lg px-3 py-2 text-sm text-[#e2e2ef] placeholder-[#3a3a5a] focus:outline-none focus:border-indigo-500 font-mono" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[#c2c2df]">Status Awal</label>
            <select value={newPage.status} onChange={e => setNewPage(p => ({ ...p, status: e.target.value }))}
              className="mt-1.5 w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e2e2ef] focus:outline-none focus:border-indigo-500">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={() => setShowCreate(false)} className="flex-1 bg-[#12121c] border border-[#1e1e2e] text-[#6a6a8a] hover:text-[#c2c2df] text-xs font-medium px-4 py-2 rounded-lg transition-colors">
            Batal
          </button>
          <button onClick={handleCreate} disabled={creating || !newPage.title || !newPage.slug}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
            {creating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Buat Halaman
          </button>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteSlug} onClose={() => setDeleteSlug(null)}>
        <h2 className="text-sm font-bold text-[#e2e2ef] mb-2">Hapus Halaman?</h2>
        <p className="text-xs text-[#6a6a8a] mb-6">Halaman <span className="text-[#c2c2df] font-mono">/{deleteSlug}</span> akan dihapus permanen beserta semua kontennya.</p>
        <div className="flex gap-2">
          <button onClick={() => setDeleteSlug(null)} className="flex-1 bg-[#12121c] border border-[#1e1e2e] text-[#6a6a8a] hover:text-[#c2c2df] text-xs font-medium px-4 py-2 rounded-lg transition-colors">Batal</button>
          <button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
            <Trash2 className="w-3.5 h-3.5" /> Hapus
          </button>
        </div>
      </Modal>
    </div>
  );
}
