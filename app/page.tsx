import Link from 'next/link';
import { Button } from '../components/ui';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#18181b] to-[#23272f] dark overflow-x-hidden">
      <h1 className="text-4xl font-bold mb-4 text-gray-100">Multimodal RAG Chatbot </h1>
      <p className="text-lg text-gray-300 mb-8">Upload PDFs or images and chat with your documents, with web search and inline citations.</p>
      <Link href="/chat">
        <Button className="text-lg px-8 py-3 bg-gray-100 text-sidebar-primary font-semibold shadow-lg">Go to Chatbot</Button>
      </Link>
    </main>
  );
}

