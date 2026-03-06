"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function CMSLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Email atau password salah.");
      setLoading(false);
    } else {
      router.push("/dashboard/cms");
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-center mb-4">
            <Lock className="w-5 h-5 text-[#3b82f6]" />
          </div>
          <h1 className="text-lg font-bold text-[#fafafa]">Portfolio CMS</h1>
          <p className="text-xs text-[#52525b] font-mono mt-1">Admin access only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full bg-[#111113] border border-[#27272a] rounded-md px-3 py-2.5 text-sm text-[#fafafa] placeholder-[#3f3f46] focus:border-[#3b82f6] focus:outline-none transition-colors"
              placeholder="admin@example.com" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#a1a1aa] mb-1.5">Password</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full bg-[#111113] border border-[#27272a] rounded-md px-3 py-2.5 pr-10 text-sm text-[#fafafa] placeholder-[#3f3f46] focus:border-[#3b82f6] focus:outline-none transition-colors"
                placeholder="••••••••" />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52525b] hover:text-[#a1a1aa]">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-md px-3 py-2">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-md transition-colors">
            {loading ? "Masuk..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
