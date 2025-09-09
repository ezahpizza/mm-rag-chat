'use client';

import React from 'react';
import { Button, Input } from '../ui';
import { Spinner } from '../spinner';
import { Mic } from 'lucide-react';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isRecording: boolean;
  onMicClick: () => void;
}

export default function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  isRecording,
  onMicClick,
}: ChatInputProps) {
  return (
    <form
      className="flex gap-2 p-4 border-t border-sidebar-border bg-[#18181b]/95"
      onSubmit={handleSubmit}
    >
      <Input
        type="text"
        value={input}
        onChange={handleInputChange}
        placeholder="Ask about legal documents, regulations, or legal concepts..."
        disabled={isLoading || isRecording}
        className="flex-1 bg-sidebar-primary/60 border-sidebar-border text-gray-100 focus-visible:ring-sidebar-accent rounded-xl px-4 py-2"
      />
      <Button
        type="button"
        onClick={onMicClick}
        className={`px-4 rounded-xl shadow-lg flex items-center justify-center transition-colors ${
          isRecording
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-gray-300 text-sidebar-primary'
        }`}
      >
        <Mic size={18} />
      </Button>
      <Button
        type="submit"
        disabled={isLoading || !input.trim() || isRecording}
        className="px-6 bg-gray-300 text-sidebar-primary font-semibold rounded-xl shadow-lg flex items-center gap-2"
      >
        {isLoading ? <Spinner size={18} /> : null}
        Send
      </Button>
    </form>
  );
}
