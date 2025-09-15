'use client';

import React, { useEffect, useState } from 'react';
import { useChat, type Message } from 'ai/react';
import { motion } from 'framer-motion';
import {
  ChatMessages,
  ChatInput,
  LoadingIndicator,
  ErrorDisplay,
  useWebSocketAndRecording, PixelBlast
} from '@/components/chat';
import { NavSection } from '@/components/chat/NavSection';

export default function ChatPage() {
  const [uploading, setUploading] = useState(false);
  const [indexStatus, setIndexStatus] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState('Plain English');

  // Use AI SDK's useChat hook
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    append,
    setMessages,
  } = useChat({
    api: '/api/chat',
    body: { mode: selectedMode },
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

  // Clear chat function
  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <NavSection messages={messages} onClearChat={handleClearChat}>
      <div className="bg-persian h-screen overflow-hidden p-4">
        {/* Main Content */}
        <main className="w-full bg-obsidian mx-auto rounded-2xl relative h-full flex flex-col items-center">

          <div className="absolute inset-0 z-0">
            <PixelBlast
              variant="circle"
              pixelSize={6}
              color="#8b67ff"
              patternScale={3}
              patternDensity={1.6}
              pixelSizeJitter={0.5}
              enableRipples
              rippleSpeed={0.4}
              rippleThickness={0.12}
              rippleIntensityScale={1.5}
              liquid
              liquidStrength={0.12}
              liquidRadius={1.2}
              liquidWobbleSpeed={5}
              speed={0.6}
              edgeFade={0.25}
              transparent
            />
          </div>
          {/* Scrollable Content Area */}
          <div className="flex-1 max-w-7xl overflow-y-auto scrollbar-hide p-4 pb-24 relative z-10">
            {/* Welcome Message */}
            {isNoMessages && (
              <div className="h-full flex items-center justify-center text-razza">
                <h1 className="font-bold text-5xl pl-20">
                  Welcome back <span className="animate-pulse">🦜</span>
                </h1>
              </div>
            )}

            {/* Chat Messages */}
            {messages.length > 0 && (
              <div className="py-6">
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
          </div>

          {/* Chat Input - Fixed Overlay */}
          <motion.div
            className="absolute bottom-4 left-16 right-4 z-50"
            initial={{ y: isNoMessages ? '-25vh' : 0 }}
            animate={{
              y: isNoMessages ? '-25vh' : 0
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <div className="max-w-3xl mx-auto">
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
                selectedMode={selectedMode}
                setSelectedMode={setSelectedMode}
              />
            </div>
          </motion.div>
        </main>
      </div>
    </NavSection>
  );
}