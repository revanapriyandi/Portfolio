"use client";

import "@measured/puck/puck.css";
import { Puck } from "@measured/puck";
import { config, type UserConfig, type CustomRootProps } from "@/puck.config";
import { useEffect, useState } from "react";
import { Loader2, ChevronDown, Plus, FileText } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Data } from "@measured/puck";

interface PageMeta {
  slug: string;
  title: string;
  status: string;
}

export default function BuilderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentSlug, setCurrentSlug] = useState(searchParams.get("slug") ?? "home");
  const [initialData, setInitialData] = useState<Data<UserConfig, CustomRootProps> | null>(null);
  const [pages, setPages] = useState<PageMeta[]>([]);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [showPagePicker, setShowPagePicker] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(""), 3000);
  };

  // Load pages list
  useEffect(() => {
    fetch("/api/pages").then(r => r.json()).then(data => setPages(Array.isArray(data) ? data : []));
  }, []);

  // Load page data when slug changes
  // eslint-disable-next-line react-compiler/react-compiler
  useEffect(() => {
    setInitialData(null);
    fetch(`/api/builder?slug=${currentSlug}`)
      .then(r => r.json())
      .then(d => setInitialData(d))
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .catch(_e => setInitialData({ content: [], root: { props: { bgColor: "#000000", accentColor: "#6366f1", customCss: "" } } }));
  }, [currentSlug]);

  const switchPage = (slug: string) => {
    setCurrentSlug(slug);
    setShowPagePicker(false);
    router.replace(`/dashboard/cms/builder?slug=${slug}`);
  };

  const save = async (data: Data) => {
    try {
      const res = await fetch(`/api/builder?slug=${currentSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) showToast("✓ Halaman tersimpan ke database!");
      else showToast("Gagal menyimpan halaman", "error");
    } catch {
      showToast("Gagal menyimpan halaman", "error");
    }
  };

  const currentPage = pages.find(p => p.slug === currentSlug);

  return (
    <div className="h-[calc(100vh-56px)] w-full relative">
      {/* Page selector bar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowPagePicker(!showPagePicker)}
            className="flex items-center gap-2 bg-[#0d0d14] border border-[#1e1e2e] hover:border-indigo-500/50 rounded-lg px-3 py-1.5 text-xs text-[#c2c2df] transition-all shadow-lg">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-medium">{currentPage?.title ?? currentSlug}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${currentPage?.status === "published" ? "bg-emerald-600/20 text-emerald-400" : "bg-[#2a2a3a] text-[#4a4a6a]"}`}>
              {currentPage?.status ?? "draft"}
            </span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showPagePicker ? "rotate-180" : ""}`} />
          </button>

          {showPagePicker && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-[#0d0d14] border border-[#1e1e2e] rounded-xl shadow-2xl overflow-hidden">
              <div className="px-3 py-2 border-b border-[#1e1e2e]">
                <p className="text-[10px] text-[#4a4a6a] font-medium uppercase tracking-wider">Pilih Halaman</p>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {pages.map(p => (
                  <button key={p.slug} onClick={() => switchPage(p.slug)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-xs hover:bg-[#14141f] transition-colors ${p.slug === currentSlug ? "text-indigo-400 bg-indigo-600/10" : "text-[#c2c2df]"}`}>
                    <FileText className="w-3 h-3 shrink-0" />
                    <span className="flex-1 truncate">{p.title}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 ${p.status === "published" ? "bg-emerald-600/20 text-emerald-400" : "bg-[#2a2a3a] text-[#4a4a6a]"}`}>{p.status}</span>
                  </button>
                ))}
              </div>
              <div className="p-2 border-t border-[#1e1e2e]">
                <a href="/dashboard/cms/pages"
                  className="flex items-center gap-2 px-3 py-2 text-xs text-[#6a6a8a] hover:text-indigo-400 hover:bg-indigo-600/10 rounded-lg transition-colors">
                  <Plus className="w-3 h-3" /> Buat Halaman Baru
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {!initialData ? (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      ) : (
        <Puck config={config} data={initialData} onPublish={save} />
      )}

      {/* Toast */}
      {toast && (
        <div className={`absolute top-4 right-36 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-xl ${toastType === "success" ? "bg-indigo-600 text-white shadow-indigo-900/20" : "bg-red-600 text-white shadow-red-900/20"}`}>
          {toast}
        </div>
      )}
    </div>
  );
}
