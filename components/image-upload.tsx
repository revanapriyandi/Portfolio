"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { UploadCloud, Loader2, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  className?: string;
}

export function ImageUpload({ value, onChange, bucket = "portfolio", folder = "uploads", className = "" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError("");
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

      setUploading(true);

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      onChange(publicUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah gambar");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {error && <p className="text-[10px] text-red-400 font-medium">{error}</p>}
      
      {value ? (
        <div className="relative group rounded-lg overflow-hidden border border-[#2a2a3a] bg-[#09090b] inline-block h-32 w-auto max-w-[200px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Uploaded" className="h-full w-auto object-cover group-hover:opacity-50 transition-opacity" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onChange("")}
              className="bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#2a2a3a] border-dashed rounded-lg cursor-pointer bg-[#09090b] hover:bg-[#12121c] hover:border-indigo-500/50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mb-2" />
            ) : (
              <UploadCloud className="w-6 h-6 text-[#6a6a8a] mb-2" />
            )}
            <p className="text-xs text-[#a1a1aa] font-medium">
              {uploading ? "Mengunggah..." : "Klik untuk upload"}
            </p>
            {!uploading && <p className="text-[10px] text-[#6a6a8a] mt-1">SVG, PNG, JPG (Maks. 5MB)</p>}
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={handleUpload} 
            disabled={uploading}
            ref={fileInputRef}
          />
        </label>
      )}
      
      {/* Allows manual URL entry just in case */}
      <div className="flex items-center gap-2 mt-2">
        <ImageIcon className="w-3.5 h-3.5 text-[#6a6a8a]" />
        <input 
          type="text" 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          placeholder="Atau masukkan URL gambar..."
          className="flex-1 bg-transparent border-none text-[10px] text-[#8a8aaa] focus:outline-none focus:text-[#e2e2ef]"
        />
      </div>
    </div>
  );
}
