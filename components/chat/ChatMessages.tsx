'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Message } from 'ai/react';
import ReactMarkdown from 'react-markdown';

interface ChatMessagesProps {
  messages: Message[];
  isRecording: boolean;
  currentTranscript: string;
}

export default function ChatMessages({
  messages,
  isRecording,
  currentTranscript,
}: ChatMessagesProps) {
  // Format bot response with markdown
  const formatBotResponse = (content: string) => {
    return (
      <div className="prose prose-invert max-w-none">
        <ReactMarkdown
          components={{
            // Custom components for better styling
            p: ({ children }) => <p className="mb-2 text-gray-100">{children}</p>,
            strong: ({ children }) => <strong className="text-gray-50">{children}</strong>,
            em: ({ children }) => <em className="text-gray-200">{children}</em>,
            code: ({ children }) => <code className="bg-gray-800 px-1 py-0.5 rounded text-gray-200">{children}</code>,
            pre: ({ children }) => <pre className="bg-gray-800 p-3 rounded-lg overflow-x-auto">{children}</pre>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-2 text-gray-100">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 text-gray-100">{children}</ol>,
            li: ({ children }) => <li className="mb-1 text-gray-100">{children}</li>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-thin scrollbar-thumb-sidebar-accent/30 scrollbar-track-transparent text-gray-100">
      {messages.length === 0 && !isRecording && (
        <motion.div
          className="text-gray-400 text-center mt-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Upload legal documents above, then ask questions about them or request legal research.
        </motion.div>
      )}

      <AnimatePresence initial={false}>
        {messages
          .filter((message: Message) => {
            // Filter out empty assistant messages and messages with only tool calls
            if (message.role === 'assistant') {
              const hasContent = message.content && message.content.trim().length > 0;
              const hasToolCalls = message.toolInvocations && message.toolInvocations.length > 0;

              // Only show assistant messages that have actual content
              // Tool calls without content should be filtered out
              return hasContent;
            }
            return true; // Always show user messages
          })
          .map((message: Message) => (
            <motion.div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <div
                className={`max-w-[85%] min-w-0 px-4 py-3 rounded-2xl shadow-md overflow-hidden
                  ${message.role === 'user'
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground rounded-br-md'
                    : 'bg-sidebar-primary/80 text-gray-100 rounded-bl-md'}
                `}
              >
                <div className="text-xs font-semibold mb-2 opacity-70 text-gray-300">
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </div>
                <div className="min-w-0 break-words overflow-hidden">
                  {message.role === 'assistant' ? (
                    <div>
                      {/* Show tool usage indicator if there are tool invocations */}
                      {message.toolInvocations && message.toolInvocations.length > 0 && (
                        <div className="text-xs text-gray-400 mb-2 italic">
                          🔍 Searching documents...
                        </div>
                      )}
                      {/* Show the response content */}
                      {message.content && message.content.length > 0 && formatBotResponse(message.content)}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed break-words text-gray-100">
                      {message.content || ''}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
      </AnimatePresence>

      {/* Recording Indicator */}
      {isRecording && (
        <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="text-gray-400 text-sm italic px-4 py-3">
            Listening: {currentTranscript}
          </div>
        </motion.div>
      )}
    </div>
  );
}
