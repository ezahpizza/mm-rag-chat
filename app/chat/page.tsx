'use client';

import React, { useEffect, useState } from 'react';
import { useChat, type Message } from 'ai/react';
import { motion } from 'framer-motion';
import {
  FileUploadSection,
  ChatMessages,
  ChatInput,
  LoadingIndicator,
  ErrorDisplay,
  useWebSocketAndRecording,
} from '../../components/chat';

export default function ChatPage() {
  const [uploading, setUploading] = useState(false);
  const [indexStatus, setIndexStatus] = useState<string | null>(null);

  // Use AI SDK's useChat hook
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    append,
  } = useChat({
    api: '/api/chat',
    fetch: async (url, options) => {
      console.log('Fetch called with:', url, options);
      const response = await fetch(url, options);
      console.log('Fetch response:', response.status, response.headers.get('content-type'));
      return response;
    },
    onError: (error: Error) => {
      console.error('Chat error:', error);
    },
    onResponse: (response: Response) => {
      console.log('Response received:', response.status, response.statusText);
      console.log('Response headers:', response.headers.get('content-type'));
    },
    onFinish: (message: Message) => {
      console.log('Message finished:', message);
    },
  });

  // Debug effect to monitor messages changes
  useEffect(() => {
    console.log('Messages updated:', messages);
  }, [messages]);

  // Use the custom hook for WebSocket and recording
  const { currentTranscript, isRecording, handleMicClick } = useWebSocketAndRecording();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#18181b] to-[#23272f] px-2 dark">
      <motion.div
        className="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mt-10 transition-all"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.4, 0.0, 0.2, 1] }}
        style={{ willChange: 'opacity, transform', overflow: 'visible' }}
      >
        <h2 className="text-3xl font-bold mb-4 text-center text-gray-100 tracking-tight">
          Legal Document Assistant
        </h2>

        <p className="text-center text-gray-400 mb-6 text-sm">
          Upload legal documents and ask questions. I can analyze your documents and search for relevant legal information.
        </p>

        {/* File Upload Section */}
        <FileUploadSection
          uploading={uploading}
          setUploading={setUploading}
          indexStatus={indexStatus}
          setIndexStatus={setIndexStatus}
        />

        {/* Chat Interface */}
        <div className="relative h-[480px] bg-[#18181b]/95 rounded-2xl shadow-2xl border border-sidebar-border flex flex-col overflow-hidden">
          {/* Chat Messages */}
          <ChatMessages
            messages={messages}
            isRecording={isRecording}
            currentTranscript={currentTranscript}
          />

          {/* Loading Indicator */}
          <LoadingIndicator isLoading={isLoading} messages={messages} />

          {/* Error Display */}
          <ErrorDisplay error={error || null} />

          {/* Chat Input */}
          <ChatInput
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            isRecording={isRecording}
            onMicClick={() => handleMicClick(append)}
          />
        </div>
      </motion.div>
    </main>
  );
}