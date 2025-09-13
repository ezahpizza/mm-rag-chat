'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Message } from 'ai/react';
import ReactMarkdown from 'react-markdown';
import { User, Bot } from 'lucide-react';
import { Sen  } from 'next/font/google';

const sen = Sen ({ weight: '400', subsets: ['latin'] });

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
      <div className="prose max-w-none">
        <ReactMarkdown
          components={{
            // Custom components for better styling
            p: ({ children }) => <p className="mb-2 text-stone-900">{children}</p>,
            strong: ({ children }) => <strong className="text-stone-900">{children}</strong>,
            em: ({ children }) => <em className="text-stone-700">{children}</em>,
            code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-stone-900">{children}</code>,
            pre: ({ children }) => <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto">{children}</pre>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-2 text-stone-900">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 text-stone-900">{children}</ol>,
            li: ({ children }) => <li className="mb-1 text-stone-900">{children}</li>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="space-y-4 ">
      <AnimatePresence initial={false}>
        {messages
          .filter((message: Message) => {
            // Filter out empty assistant messages and messages with only tool calls
            if (message.role === 'assistant') {
              const hasContent = message.content && message.content.trim().length > 0;

              // Only show assistant messages that have actual content
              // Tool calls without content should be filtered out
              return hasContent;
            }
            return true; // Always show user messages
          })
          .map((message: Message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              {message.role === 'user' ? (
                <>
                  {/* User message display */}
                  <div className="flex justify-end">
                    <div className="flex items-end col-start-3 pb-1 mx-2 opacity-100 transform-none">
                      <div className={`${sen.className} rounded-xl px-3 py-2 break-words text-white transition-all bg-razza place-self-end`}>
                        <div className="contents">
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-end col-start-3 pb-1 mx-2 opacity-100 transform-none">
                      {/* User avatar */}
                      <div className="font-bold rounded-full flex items-center justify-center h-8 w-8 text-[14px] bg-cerulean text-white">
                        <User size={18} />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Assistant message display */}
                  <div className="flex justify-start">
                    <div className="flex items-start col-start-1 pb-1 mx-2 opacity-100 transform-none">
                      {/* Bot avatar */}
                      <div className="font-bold rounded-full flex items-center justify-center h-8 w-8 text-[14px] bg-razza text-white">
                        <Bot size={18} />
                      </div>
                    </div>
                    <div className="flex items-end col-start-2 pb-1 mx-2 opacity-100 transform-none">
                      {/* Assistant message content */}
                      <div className="rounded-xl px-3 py-2 break-words text-stone-900 transition-all bg-pearl place-self-start">
                        <div className="contents">
                          {/* Show tool usage indicator if there are tool invocations */}
                          {message.toolInvocations && message.toolInvocations.length > 0 && (
                            <div className="text-md text-gray-400 mb-2 italic">
                              🔍 Searching documents...
                            </div>
                          )}
                          {/* Show the response content */}
                          {message.content && message.content.length > 0 && formatBotResponse(message.content)}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
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
