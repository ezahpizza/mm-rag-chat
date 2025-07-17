'use client';

import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, Button, Input, Label } from '../../components/ui';
import { Spinner } from '../../components/spinner';
import { motion, AnimatePresence } from 'framer-motion';
import { BackToHomeButton } from '../../components/back-to-home';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileInputRef.current?.files?.length) return;
    setUploading(true);
    setIndexStatus(null);
    const formData = new FormData();
    Array.from(fileInputRef.current.files).forEach((file) => {
      formData.append('files', file);
    });
    try {
      const res = await fetch('/api/index-documents', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setIndexStatus('Documents indexed successfully!');
      } else {
        setIndexStatus(data.message || 'Indexing failed.');
      }
    } catch (err) {
      setIndexStatus('Indexing failed.');
    } finally {
      setUploading(false);
    }
  };

  // Clean and parse bot response
  function cleanBotResponse(text: string): string {
    if (!text) return '';
    
    // If it's already a clean string, return it
    if (typeof text === 'string' && !text.includes('{') && !text.includes('"answer"')) {
      return text.trim();
    }
    

    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed.answer === 'string') {
        return parsed.answer;
      }
    } catch {
    }
    

    let cleanText = text;
    
    const jsonMatch = cleanText.match(/^\s*{\s*"answer":\s*"(.*?)",?\s*"citations":\s*\[[\s\S]*?\]\s*}\s*$/);
    if (jsonMatch) {
      cleanText = jsonMatch[1];
    } else {
      // Fallback: extract content between "answer": and "citations"
      const answerMatch = cleanText.match(/"answer":\s*"(.*?)"(?:,\s*"citations":|$)/);
      if (answerMatch) {
        cleanText = answerMatch[1];
      }
    }
    
    // Clean up escape sequences
    cleanText = cleanText
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\\\/g, '\\')
      .trim();
    
    return cleanText;
  }


function cleanCitationText(text: string): string {
  return text ? text.trim() : '';
}

function cleanCitationSource(citation: string): string {
  if (!citation) return '';
  
  if (citation.startsWith('http')) {
    return citation;
  }
  

  const match = citation.match(/^(.+?\.(pdf|png|jpe?g))\s+p\.(\d+)/i);
  if (match) {
    return `${match[1]} p.${match[3]}`;
  }
  
  return citation;
}


  function formatBotResponse(answer: string, citations: { text: string; citation: string }[] = []) {
    const cleanAnswer = cleanBotResponse(answer);
    
    const validCitations = citations.filter(citation => {
      const cleanText = cleanCitationText(citation.text);
      return cleanText.length > 0;
    });
    
    return (
      <div className="space-y-3 overflow-hidden">
        <div className="prose prose-sm max-w-none text-sm overflow-hidden">
          <ReactMarkdown 
            components={{
              p: ({ children }) => <p className="mb-2 leading-relaxed break-words">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
              code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs break-all">{children}</code>,
              pre: ({ children }) => <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">{children}</pre>,
            }}
          >
            {cleanAnswer}
          </ReactMarkdown>
        </div>
        
        {validCitations && validCitations.length > 0 && (
          <div className="text-xs border-t border-gray-200 pt-2 mt-3 overflow-hidden">
            <div className="font-semibold text-gray-600 mb-2">Sources:</div>
            <div className="space-y-2">
              {validCitations.map((citation, index) => {
                const cleanText = cleanCitationText(citation.text);
                const cleanSource = cleanCitationSource(citation.citation);
                
                return (
                  <div key={index} className="flex flex-col gap-1 overflow-hidden">
                    <div className="flex items-start gap-2 overflow-hidden">
                      <span className="text-blue-600 font-medium flex-shrink-0">[{index + 1}]</span>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        {cleanSource && cleanSource.startsWith('http') ? (
                          <a 
                            href={cleanSource} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-500 hover:text-blue-700 underline text-xs break-all block"
                          >
                            {cleanSource}
                          </a>
                        ) : (
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono break-all block">
                            {cleanSource}
                          </span>
                        )}
                      </div>
                    </div>
                    {cleanText && (
                      <p className="text-gray-700 text-xs ml-6 leading-relaxed break-words overflow-hidden">
                        {cleanText}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { role: 'user', text: input }]);
    setLoading(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query_text: input }),
      });
      const data = await res.json();
      
      let answerText = '';
      let citationsArray = [];
      
      if (typeof data.answer === 'string') {

        try {
          const parsed = JSON.parse(data.answer);
          if (parsed && typeof parsed.answer === 'string') {
            answerText = parsed.answer;
            citationsArray = parsed.citations || [];
          } else {
            answerText = data.answer;
            citationsArray = data.citations || [];
          }
        } catch {
          // If parsing fails, use as is
          answerText = data.answer;
          citationsArray = data.citations || [];
        }
      } else {
        answerText = data.answer || 'No response received';
        citationsArray = data.citations || [];
      }
      
      setMessages((msgs) => [
        ...msgs,
        { 
          role: 'bot', 
          text: answerText, 
          citations: citationsArray 
        },
      ]);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { role: 'bot', text: 'Sorry, there was an error processing your request.' },
      ]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

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
          <form onSubmit={handleUpload} className="flex flex-col gap-2 md:flex-row md:items-end md:gap-4">
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
            onSubmit={e => { e.preventDefault(); handleSend(); }}
          >
            <Input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
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