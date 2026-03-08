"use client";
import React, { useRef, useState } from "react";
import { UploadCloud, FileText, Loader2, Sparkles, AlertCircle } from "lucide-react";

interface PdfUploaderProps {
  onExtracted: (data: Record<string, unknown>) => void;
  className?: string;
}

export function PdfUploader({ onExtracted, className = "" }: PdfUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Hanya menerima file PDF.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extract-pdf", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal mengekstrak PDF.");
      }

      onExtracted(json.data);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message || "Terjadi kesalahan saat mengekstrak.");
      } else {
        setError("Terjadi kesalahan saat mengekstrak.");
      }
    } finally {
      setLoading(false);
      // Reset input trigger
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`p-4 rounded-xl border border-dashed border-[#1e1e2e] bg-[#12121c]/50 ${className}`}>
      <div className="flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center relative">
          {loading ? (
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          ) : (
            <>
              <FileText className="w-6 h-6 text-indigo-400" />
              <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
            </>
          )}
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-[#e2e2ef] mb-1">
            {loading ? "Mengekstrak dengan AI..." : "Magic Import dari Resume/PDF"}
          </h3>
          <p className="text-xs text-[#8a8aaa] max-w-xs mx-auto">
            Gunakan AI Gemini untuk menguraikan profil otomatis dari Resume Anda.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-400/10 px-3 py-1.5 rounded-md">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed
                     text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <UploadCloud className="w-4 h-4" />
          {loading ? "Memproses..." : "Pilih File PDF"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
