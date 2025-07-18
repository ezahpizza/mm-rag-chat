'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, Button, Input, Label } from '../../components/ui';
import { Spinner } from '../../components/spinner';
import { motion, AnimatePresence } from 'framer-motion';
import { BackToHomeButton } from '../../components/back-to-home';
import { formatBotResponse, handleUpload } from './controllers/chatPageControllers';
import { Mic } from 'lucide-react';

// Define the ChatMessage interface
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
  const PROXY_URL = process.env.PROXY_URL;
  
  // WebSocket and recording state
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // WebSocket connection handling
  useEffect(() => {
    const socketUrl = PROXY_URL || 'ws://localhost:8000/ws';
    const socket = new WebSocket(socketUrl);
    setWs(socket);

    socket.onopen = () => console.log('Connected to FastAPI WebSocket proxy.');
    socket.onclose = () => console.log('Disconnected from FastAPI WebSocket proxy.');

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'stt_transcript' && data.text.trim()) {
        setCurrentTranscript(data.text); // Update the live transcript
      } else if (data.type === 'llm_response') {
        setMessages((prev) => [...prev, { role: 'bot', text: data.answer, citations: data.citations }]);
      } else if (data.type === 'error') {
        console.error('WebSocket Error:', data.message);
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  // Central function to send a message to the RAG bot
  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', text: textToSend }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query_text: textToSend }),
      });

      if (!res.ok) throw new Error(`API error: ${res.statusText}`);

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'bot', text: data.answer, citations: data.citations }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [...prev, { role: 'bot', text: 'Sorry, there was an error.' }]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form submission for typed messages
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  // Corrected Microphone click handler
 // From page.tsx

  // Corrected Microphone click handler
  const handleMicClick = async () => {
    if (isRecording) {
      // If recording, stop it (no changes needed here)
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      // **Send the final accumulated transcript to the bot**
      if (currentTranscript.trim()) {
        handleSend(currentTranscript);
      }
      setCurrentTranscript(''); // Clear the live transcript
    } else {
      // If not recording, start it
      try {
        // --- ADD THIS BLOCK ---
        // First, send the start signal to the backend to initialize Deepgram
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ action: "start_transcription" }));
        } else {
          console.error("WebSocket is not open. Cannot start transcription.");
          // Optionally, you could try to reconnect or show an error to the user here.
          return;
        }
        // --- END OF ADDED BLOCK ---

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && ws?.readyState === WebSocket.OPEN) {
            ws.send(event.data);
          }
        };
        
        mediaRecorder.onstart = () => setIsRecording(true);
        mediaRecorder.onstop = () => {
          setIsRecording(false);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start(250); // Send audio chunks every 250ms
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
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
        {/* Card and other UI elements remain the same... */}
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
            {messages.length === 0 && !isRecording && (
              <motion.div className="text-gray-400 text-center mt-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                No messages yet. Start by asking a question or using the microphone.
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
                      {msg.role === 'bot' && msg.text
                        ? formatBotResponse(msg.text, msg.citations)
                        : <div className="whitespace-pre-wrap text-sm leading-relaxed break-words text-gray-100">{msg.text}</div>
                      }
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isRecording && (
              <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-gray-400 text-sm italic px-4 py-3">
                  Listening: {currentTranscript}
                </div>
              </motion.div>
            )}
            {loading && (
              <motion.div className="flex justify-start" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="bg-sidebar-primary/80 px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-3">
                  <Spinner size={20} className="text-sidebar-accent" />
                  <div className="text-gray-400 text-sm">Thinking...</div>
                </div>
              </motion.div>
            )}
          </div>
          <form
            className="flex gap-2 p-4 border-t border-sidebar-border bg-[#18181b]/95"
            onSubmit={handleFormSubmit}
          >
            <Input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { handleFormSubmit(e); } }}
              placeholder="Ask a question..."
              disabled={loading || isRecording}
              className="flex-1 bg-sidebar-primary/60 border-sidebar-border text-gray-100 focus-visible:ring-sidebar-accent rounded-xl px-4 py-2"
            />
            <Button
              type="button"
              onClick={handleMicClick}
              className={`px-4 rounded-xl shadow-lg flex items-center justify-center transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-300 text-sidebar-primary'}`}
            >
              <Mic size={18} />
            </Button>
            <Button
              type="submit"
              disabled={loading || !input.trim() || isRecording}
              className="px-6 bg-gray-300 text-sidebar-primary font-semibold rounded-xl shadow-lg flex items-center gap-2"
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