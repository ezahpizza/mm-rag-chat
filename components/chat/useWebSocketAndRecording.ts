'use client';

import { useEffect, useRef, useState } from 'react';

export function useWebSocketAndRecording() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const PROXY_URL = process.env.PROXY_URL;

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
      } else if (data.type === 'error') {
        console.error('WebSocket Error:', data.message);
      }
    };

    return () => {
      socket.close();
    };
  }, [PROXY_URL]);

  // Handle speech input
  const handleSpeechInput = (transcript: string, append: (message: { role: 'user'; content: string }) => void) => {
    if (transcript.trim()) {
      append({ role: 'user', content: transcript });
    }
  };

  // Microphone click handler
  const handleMicClick = async (append: (message: { role: 'user'; content: string }) => void) => {
    if (isRecording) {
      // Stop recording and send transcript
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      if (currentTranscript.trim()) {
        handleSpeechInput(currentTranscript, append);
      }
      setCurrentTranscript('');
    } else {
      // Start recording
      try {
        // Send start signal to backend
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ action: "start_transcription" }));
        } else {
          console.error("WebSocket is not open. Cannot start transcription.");
          return;
        }

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

  return {
    ws,
    currentTranscript,
    isRecording,
    handleMicClick,
  };
}
