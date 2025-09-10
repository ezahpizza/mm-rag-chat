'use client';

import React, { useEffect, useState } from 'react';
import { useChat, type Message } from 'ai/react';
import { motion } from 'framer-motion';
import {
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

  const isNoMessages = messages.length === 0 && !isRecording;

  return (
    <div className="bg-eriBlack min-h-screen">
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4">
        <div className="min-h-screen flex flex-col">

          {/* Welcome Message */}
          {isNoMessages && (
            <div className="flex-1 flex items-center justify-center text-razza">
              <h1 className="text-center tracking-tighter text-5xl">
                Welcome back <span className="animate-pulse">🦜</span>
              </h1>
            </div>
          )}

          {/* Chat Messages */}
          {messages.length > 0 && (
            <div className="flex-1 overflow-y-auto px-4 py-6 pb-32">
              <ChatMessages
                messages={messages}
                isRecording={isRecording}
                currentTranscript={currentTranscript}
              />
            </div>
          )}

          {/* Loading Indicator */}
          <LoadingIndicator isLoading={isLoading} messages={messages} />

          {/* Error Display */}
          <ErrorDisplay error={error || null} />

          {/* Chat Input */}
          <motion.div
            className="fixed left-0 right-0 bg-eriBlack py-4"
            initial={{ top: 'auto', bottom: '30%', transform: 'translateY(50%)' }}
            animate={
              isNoMessages
                ? { top: 'auto', bottom: '30%', transform: 'translateY(50%)' }
                : { top: 'auto', bottom: 0, transform: 'translateY(0)' }
            }
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-3xl mx-auto px-4">
              <ChatInput
                input={input}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
                isRecording={isRecording}
                onMicClick={() => handleMicClick(append)}
                uploading={uploading}
                setUploading={setUploading}
                indexStatus={indexStatus}
                setIndexStatus={setIndexStatus}
              />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}