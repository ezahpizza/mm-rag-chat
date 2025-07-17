import { Dispatch, SetStateAction, RefObject } from 'react';
import { cleanBotResponse, cleanCitationText, cleanCitationSource, Citation } from './chatPageHelpers';

export interface Message {
  role: 'user' | 'bot';
  text: string;
  citations?: Citation[];
}
import React from 'react';
import ReactMarkdown from 'react-markdown';

export async function handleUpload(
  e: React.FormEvent,
  fileInputRef: RefObject<HTMLInputElement>,
  setUploading: Dispatch<SetStateAction<boolean>>,
  setIndexStatus: Dispatch<SetStateAction<string | null>>
) {
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
  } catch {
    setIndexStatus('Indexing failed.');
  } finally {
    setUploading(false);
  }
}

export async function handleSend(
  input: string,
  setMessages: Dispatch<SetStateAction<Message[]>>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setInput: Dispatch<SetStateAction<string>>,
  messages: Message[]
) {
  if (!input.trim()) return;
  setMessages((msgs: Message[]) => [...msgs, { role: 'user', text: input }]);
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
        answerText = data.answer;
        citationsArray = data.citations || [];
      }
    } else {
      answerText = data.answer || 'No response received';
      citationsArray = data.citations || [];
    }
    setMessages((msgs: Message[]) => [
      ...msgs,
      {
        role: 'bot',
        text: answerText,
        citations: citationsArray,
      },
    ]);
  } catch {
    setMessages((msgs: Message[]) => [
      ...msgs,
      { role: 'bot', text: 'Sorry, there was an error processing your request.' },
    ]);
  } finally {
    setLoading(false);
    setInput('');
  }
}


export function formatBotResponse(answer: string, citations: Citation[] = []) {
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
                        <span className="text-gray-100 px-2 py-1 rounded text-xs font-mono break-all block">
                          {cleanSource}
                        </span>
                      )}
                    </div>
                  </div>
                  {cleanText && (
                    <p className="text-gray-100 text-xs ml-6 leading-relaxed break-words overflow-hidden">
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
