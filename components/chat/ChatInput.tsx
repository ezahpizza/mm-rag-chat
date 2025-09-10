'use client';

import React, { useRef, useState } from 'react';
import { Button } from '../ui';
import { Spinner } from '../spinner';
import { Mic, Paperclip, Send, XCircle } from 'lucide-react';
import { handleUpload } from '../../app/chat/controllers/chatPageControllers';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isRecording: boolean;
  onMicClick: () => void;
  uploading: boolean;
  setUploading: React.Dispatch<React.SetStateAction<boolean>>;
  indexStatus: string | null;
  setIndexStatus: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  isRecording,
  onMicClick,
  uploading,
  setUploading,
  setIndexStatus,
}: ChatInputProps) {
  const [files, setFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e as unknown as React.ChangeEvent<HTMLInputElement>);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };
  return (
    <div className="bg-lilac rounded-xl py-2 px-2 m-3 relative min-h-36">
      <fieldset className="grid p-2 sm:grid-flow-col sm:grid-cols-[minmax(0,_1fr)_auto] sm:gap-2 w-full rounded-3xl backdrop-blur-xl disabled:bg-white/50">
        <form
          onSubmit={handleSubmit}
        >
          <textarea
            ref={textareaRef}
            className="p-1.5 resize-none focus:outline-none w-full h-auto placeholder:text-eriBlack/70"
            value={input}
            placeholder="How can I help you today?"
            onChange={handleTextareaChange}
            name="message"
            autoComplete="off"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault(); // Prevent new line
                handleSubmit(e);
              }
            }}
          />
        </form>
      </fieldset>
      <div className="bg-white disabled:bg-white/50">
        <div className="flex flex-wrap gap-4">
          {files.map((file, index) => (
            <div
              key={index}
              className="mt-4 w-40 relative cursor-pointer rounded-md flex shadow text-xs bg-white"
            >
              <button className="absolute inset-0 cursor-pointer hover:bg-black/5 w-40"></button>
              <div className="flex-shrink-0 w-12 h-12 bg-lavenda rounded-tl-md rounded-bl-md grid place-items-center text-white font-medium uppercase truncate">
                {file.name.split(".")[1]?.toUpperCase() || 'FILE'}
              </div>
              <div className="py-2 px-3 min-w-0">
                <p className="truncate" title={file.name}>
                  {file.name}
                </p>
                <div className="text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </div>
                <div
                  className="absolute top-0 right-0 bg-white shadow rounded-full cursor-pointer hover:bg-stone-100 translate-x-2 -translate-y-2 z-10"
                  onClick={() => removeFile(index)}
                >
                  <XCircle size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end items-end absolute right-0 bottom-0 p-4">
        <UploadButton
          disabled={isLoading || isRecording || uploading}
          uploading={uploading}
          setUploading={setUploading}
          setIndexStatus={setIndexStatus}
          setFiles={setFiles}
        />
        <Button
          type="button"
          onClick={onMicClick}
          className='flex items-center bg-lavenda hover:bg-desire py-1 px-2 rounded-full cursor-pointer shadow transition-all ease-in-out active:scale-[0.98] text-ellipsis whitespace-nowrap overflow-x-hidden text-sm text-center mx-1 w-9 h-9'
        >
          <div className="grid place-items-center w-5 h-5">
            <Mic size={18} />
          </div>
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isLoading || !input.trim() || isRecording}
          className='flex items-center bg-lavenda hover:bg-desire py-1 px-2 rounded-full cursor-pointer shadow transition-all ease-in-out active:scale-[0.98] text-ellipsis whitespace-nowrap overflow-x-hidden text-sm text-center mx-1 w-9 h-9'
        >
          <div className="grid place-items-center w-5 h-5">
            <Send size={18} />
          </div>
        </Button>
      </div>
    </div>
  );
}

function UploadButton({
  disabled,
  uploading,
  setUploading,
  setIndexStatus,
  setFiles,
}: {
  disabled: boolean;
  uploading: boolean;
  setUploading: React.Dispatch<React.SetStateAction<boolean>>;
  setIndexStatus: React.Dispatch<React.SetStateAction<string | null>>;
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null!);

  const onClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
    // reuse existing controller which expects a FormEvent and file input ref
    const fakeEvent = { preventDefault: () => {} } as unknown as React.FormEvent;
    try {
      await handleUpload(fakeEvent, fileInputRef, setUploading, setIndexStatus);
    } finally {
      // clear selection so same file can be picked again later
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Button
      type="button"
      onClick={onClick}
      className='flex items-center bg-lavenda hover:bg-desire py-1 px-2 rounded-full cursor-pointer shadow transition-all ease-in-out active:scale-[0.98] text-ellipsis whitespace-nowrap overflow-x-hidden text-sm text-center mx-1 w-9 h-9'
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,image/png,image/jpeg"
        multiple
        onChange={onChange}
        className="opacity-0 absolute inset-0 rounded-xl -z-10 overflow-hidden"
      />
      <div className="grid place-items-center w-5 h-5">
        {uploading ? <Spinner size={18} /> : <Paperclip size={18} />}
      </div>
    </Button>
  );
}
