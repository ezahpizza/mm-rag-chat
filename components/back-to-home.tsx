import Link from 'next/link';
import { Button } from './ui';
import { ArrowLeft } from 'lucide-react';

export function BackToHomeButton() {
  return (
    <Link href="/">
      <Button className="fixed top-6 left-6 z-50 bg-gray-100 text-primary-foreground shadow-lg px-4 py-2 flex items-center gap-2">
        <ArrowLeft size={18} />
        Home
      </Button>
    </Link>
  );
}
