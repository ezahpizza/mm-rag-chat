import { Card, CardContent } from '@/components/card';

export function PlaceholderSection() {
  return (
    <Card className="bg-gradient-to-r from-ocean to-skye border-0 shadow-xl h-[64%] flex items-center justify-center">
      <CardContent className="text-center">
        <div className="text-obsidian text-lg font-semibold mb-2">Coming Soon</div>
        <p className="text-cerulean text-sm">Additional features will be added here</p>
      </CardContent>
    </Card>
  );
}