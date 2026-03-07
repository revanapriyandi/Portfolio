"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Mail, Trash2, Loader2, Search, CheckCircle2, Circle } from "lucide-react";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function InboxPage() {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    loadMessages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadMessages() {
    setLoading(true);
    const { data } = await supabase.from("portfolio_messages").select("*").order("created_at", { ascending: false });
    if (data) setMessages(data);
    setLoading(false);
  }

  async function markAsRead(id: string) {
    await supabase.from("portfolio_messages").update({ is_read: true }).eq("id", id);
    setMessages(msgs => msgs.map(m => m.id === id ? { ...m, is_read: true } : m));
    if (selectedMessage?.id === id) setSelectedMessage(prev => prev ? { ...prev, is_read: true } : null);
  }

  async function deleteMessage(id: string) {
    if (!confirm("Hapus pesan ini?")) return;
    await supabase.from("portfolio_messages").delete().eq("id", id);
    setMessages(msgs => msgs.filter(m => m.id !== id));
    if (selectedMessage?.id === id) setSelectedMessage(null);
  }

  const filtered = messages.filter(m => 
    m.name.toLowerCase().includes(query.toLowerCase()) || 
    m.subject?.toLowerCase().includes(query.toLowerCase()) ||
    m.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-6 h-[calc(100vh-64px)] w-full flex flex-col hidden-scrollbar">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-lg font-bold text-[#e2e2ef] flex items-center gap-2"><Mail className="w-5 h-5 text-indigo-400" />Contact Inbox</h1>
          <p className="text-xs text-[#4a4a6a] mt-1">Kelola pesan masuk dari pengunjung situs.</p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden border border-[#1e1e2e] bg-[#0d0d14] rounded-xl">
        {/* Left Side: Message List */}
        <div className="w-full md:w-1/3 flex flex-col border-r border-[#1e1e2e] shrink-0">
          <div className="p-4 border-b border-[#1e1e2e]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6a6a8a]" />
              <input 
                type="text" 
                placeholder="Cari pesan..." 
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full bg-[#12121c] border border-[#1e1e2e] rounded-lg pl-9 pr-3 py-2 text-xs text-[#e2e2ef] focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto hidden-scrollbar">
            {loading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center p-8 text-xs text-[#6a6a8a]">Tidak ada pesan.</div>
            ) : (
              filtered.map(msg => (
                <button 
                  key={msg.id} 
                  onClick={() => { setSelectedMessage(msg); if (!msg.is_read) markAsRead(msg.id); }}
                  className={`w-full text-left p-4 border-b border-[#1e1e2e] transition-colors flex items-start gap-3 ${selectedMessage?.id === msg.id ? "bg-[#1a1a2e]" : "hover:bg-[#12121c]"}`}
                >
                  <div className="shrink-0 pt-0.5">
                    {msg.is_read ? <CheckCircle2 className="w-4 h-4 text-[#3a3a5a]" /> : <Circle className="w-4 h-4 text-indigo-500 fill-indigo-500/20" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-baseline mb-1">
                      <p className={`text-sm truncate font-medium ${msg.is_read ? "text-[#a1a1aa]" : "text-[#e2e2ef]"}`}>{msg.name}</p>
                      <p className="text-[10px] text-[#6a6a8a] whitespace-nowrap ml-2">
                        {new Date(msg.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <p className={`text-xs truncate ${msg.is_read ? "text-[#6a6a8a]" : "text-[#c2c2df]"}`}>{msg.subject || "(Tanpa subjek)"}</p>
                    <p className="text-[10px] text-[#4a4a6a] truncate mt-1">{msg.message}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Message Detail */}
        <div className="hidden md:flex flex-1 flex-col bg-[#09090b]">
          {selectedMessage ? (
            <>
              <div className="p-6 border-b border-[#1e1e2e] flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-lg font-bold text-[#e2e2ef] mb-1">{selectedMessage.subject || "(Tanpa subjek)"}</h2>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-[#c2c2df]">{selectedMessage.name}</span>
                    <span className="text-[#4a4a6a]">{"<"}{selectedMessage.email}{">"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#6a6a8a]">
                    {new Date(selectedMessage.created_at).toLocaleString("id-ID", { dateStyle: 'long', timeStyle: 'short' })}
                  </span>
                  <button onClick={() => deleteMessage(selectedMessage.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors" title="Hapus pesan">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-6 flex-1 overflow-y-auto hidden-scrollbar">
                <div className="whitespace-pre-wrap text-sm text-[#a1a1aa] leading-relaxed">
                  {selectedMessage.message}
                </div>
              </div>
              <div className="p-4 border-t border-[#1e1e2e] bg-[#0d0d14] shrink-0">
                <a href={`mailto:${selectedMessage.email}?subject=RE: ${selectedMessage.subject}`} className="inline-flex items-center gap-2 bg-[#1e1e2e] hover:bg-[#2a2a3a] text-[#e2e2ef] px-4 py-2 rounded-lg text-xs font-medium transition-colors">
                  <Mail className="w-3.5 h-3.5" /> Balas via Email
                </a>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#3a3a5a]">
              <Mail className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-sm font-medium">Pilih pesan untuk dibaca</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
