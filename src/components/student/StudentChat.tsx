import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, User, ShieldCheck } from 'lucide-react';
import { Siswa, ChatMessage } from '../../types';
import { getChat, sendChat } from '../../services/api';

interface StudentChatProps {
  siswa: Siswa;
}

export const StudentChat: React.FC<StudentChatProps> = ({ siswa }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadChat();
    const interval = setInterval(loadChat, 4000);
    return () => clearInterval(interval);
  }, [siswa]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChat = async () => {
    const list = await getChat(siswa.nis);
    setMessages(list);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setSending(true);
    try {
      const newMsg = await sendChat(siswa.nis, 'ADMIN', inputText.trim());
      setMessages((prev) => [...prev, newMsg]);
      setInputText('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#160E2E] rounded-3xl border border-purple-100 dark:border-purple-950/40 shadow-sm flex flex-col h-[600px] overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 bg-purple-50/80 dark:bg-[#1E1540] border-b border-purple-100 dark:border-purple-950/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">
              Konseling &amp; Bantuan Admin
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-purple-300">
              Konsultasi pemilihan jurusan PTN dan bantuan teknis akun
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Online
        </span>
      </div>

      {/* Messages List Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FBF9FF] dark:bg-[#110B24]/40">
        {messages.length === 0 ? (
          <div className="text-center py-20 text-xs text-gray-400">
            <MessageCircle className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-purple-900" />
            <p className="font-semibold">Belum ada percakapan.</p>
            <p className="text-[11px] mt-1">Kirim pesan pertanyaan pertama Anda kepada Admin/Instruktur di bawah.</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.from === siswa.nis;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-purple-700 text-white rounded-br-xs'
                      : 'bg-white dark:bg-[#1E1540] text-gray-800 dark:text-purple-100 border border-purple-100 dark:border-purple-900/60 rounded-bl-xs'
                  }`}
                >
                  <div className="text-[10px] font-bold opacity-75 mb-0.5">
                    {isMe ? 'Saya' : 'Admin Bimbel'}
                  </div>
                  <div>{m.pesan}</div>
                </div>
                <span className="text-[9px] text-gray-400 mt-1 px-1">{m.timestamp}</span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-white dark:bg-[#160E2E] border-t border-purple-100 dark:border-purple-950/40 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Tulis pesan pertanyaan (tekan Enter untuk mengirim)..."
          className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-purple-900 bg-gray-50 dark:bg-[#1E1540] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
        <button
          type="submit"
          disabled={sending || !inputText.trim()}
          className="p-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white shadow-md disabled:opacity-50 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
