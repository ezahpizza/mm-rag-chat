'use client';

import React, { useRef, useState } from 'react';
import { Card, Button, Input, Label } from '../../components/ui';
import { Spinner } from '../../components/spinner';
import { motion, AnimatePresence } from 'framer-motion';
import { BackToHomeButton } from '../../components/back-to-home';

import { formatBotResponse, handleUpload, handleSend } from './controllers/chatPageControllers';
interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  citations?: { text: string; citation: string }[];
}


export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [indexStatus, setIndexStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null!);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#18181b] to-[#23272f] px-2 dark">
      <BackToHomeButton />
      <motion.div
        className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mt-10 transition-all"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.4, 0.0, 0.2, 1] }}
        style={{ willChange: 'opacity, transform', overflow: 'visible' }}
      >
        <h2 className="text-3xl font-bold mb-4 text-center text-gray-100 tracking-tight">
          Chat
        </h2>
        <Card className="mb-4 p-4 bg-[#23272f]/90 shadow-2xl border border-sidebar-border rounded-2xl">
          <form onSubmit={e => handleUpload(e, fileInputRef, setUploading, setIndexStatus)} className="flex flex-col gap-2 md:flex-row md:items-end md:gap-4">
            <div className="flex-1">
              <Label htmlFor="file-upload" className="text-gray-200">Upload PDFs or Images</Label>
              <Input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/png,image/jpeg"
                multiple
                className="mt-1 bg-background border-sidebar-border text-gray-100"
              />
            </div>
            <Button 
              type="submit" 
              disabled={uploading} 
              className="mt-2 md:mt-0 min-w-[140px] bg-gray-300 hover:bg-sidebar-primary text-sidebar-primary font-semibold shadow-lg flex items-center justify-center gap-2"
            >
              {uploading ? <Spinner size={20} /> : null}
              {uploading ? 'Indexing...' : 'Upload & Index'}
            </Button>
          </form>
          {indexStatus && (
            <div className={`mt-3 text-sm ${indexStatus.includes('success') ? 'text-green-400' : 'text-red-400'} text-gray-200`}>
              {indexStatus}
            </div>
          )}
        </Card>
        <div className="relative h-[480px] bg-[#18181b]/95 rounded-2xl shadow-2xl border border-sidebar-border flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-thin scrollbar-thumb-sidebar-accent/30 scrollbar-track-transparent text-gray-100">
            {messages.length === 0 && (
              <motion.div className="text-gray-400 text-center mt-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                No messages yet. Start by uploading documents and asking a question.
              </motion.div>
            )}
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <div
                    className={`max-w-[85%] min-w-0 px-4 py-3 rounded-2xl shadow-md overflow-hidden
                      ${msg.role === 'user'
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground rounded-br-md'
                        : 'bg-sidebar-primary/80 text-gray-100 rounded-bl-md'}
                    `}
                  >
                    <div className="text-xs font-semibold mb-2 opacity-70 text-gray-300">
                      {msg.role === 'user' ? 'You' : 'Bot'}
                    </div>
                    <div className="min-w-0 break-words overflow-hidden">
                      {msg.role === 'bot'
                        ? formatBotResponse(msg.text, msg.citations)
                        : <div className="whitespace-pre-wrap text-sm leading-relaxed break-words text-gray-100">{msg.text}</div>
                      }
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-sidebar-primary/80 px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-3">
                  <Spinner size={20} className="text-sidebar-accent" />
                  <div className="text-xs font-semibold mb-2 opacity-70 text-gray-300">Bot</div>
                  <div className="text-gray-400 text-sm">Thinking...</div>
                </div>
              </motion.div>
            )}
          </div>
          <form
            className="flex gap-2 p-4 border-t border-sidebar-border bg-[#18181b]/95"
            onSubmit={e => { e.preventDefault(); handleSend(input, setMessages, setLoading, setInput, messages); }}
          >
            <Input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input, setMessages, setLoading, setInput, messages);
                }
              }}
              placeholder="Ask a question..."
              disabled={loading}
              className="flex-1 bg-sidebar-primary/60 border-sidebar-border text-gray-100 focus-visible:ring-sidebar-accent rounded-xl px-4 py-2"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 bg-gray-300  text-sidebar-primary font-semibold rounded-xl shadow-lg flex items-center gap-2"
            >
              {loading ? <Spinner size={18} /> : null}
              Send
            </Button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}