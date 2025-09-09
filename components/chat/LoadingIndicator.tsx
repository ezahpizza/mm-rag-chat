'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Spinner } from '../spinner';
import { type Message } from 'ai/react';

interface LoadingIndicatorProps {
  isLoading: boolean;
  messages: Message[];
}

export default function LoadingIndicator({ isLoading, messages }: LoadingIndicatorProps) {
  if (!isLoading) return null;

  return (
    <motion.div
      className="flex justify-start"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="bg-sidebar-primary/80 px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-3">
        <Spinner size={20} className="text-sidebar-accent" />
        <div className="text-gray-400 text-sm">
          {/* Show different loading messages based on context */}
          {messages.length > 0 &&
          messages[messages.length - 1]?.role === 'user' &&
          messages[messages.length - 1]?.content?.toLowerCase().includes('prateek')
            ? 'Searching documents...'
            : 'Thinking...'}
        </div>
      </div>
    </motion.div>
  );
}
