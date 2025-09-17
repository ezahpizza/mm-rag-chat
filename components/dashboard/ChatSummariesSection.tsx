import { Card, CardContent, CardHeader, CardTitle } from '@/components/card';
import { Button } from '@/components/ui';
import { Badge } from '@/components/badge';
import { Download, Trash2 } from 'lucide-react';

interface ChatSummary {
  chatId: string;
  summary: string;
  createdAt: string;
}

interface ChatSummariesSectionProps {
  chatSummaries: ChatSummary[];
  onDownload: (summary: ChatSummary) => void;
  onDelete: (chatId: string) => void;
}

export function ChatSummariesSection({
  chatSummaries,
  onDownload,
  onDelete
}: ChatSummariesSectionProps) {
  return (
    <Card className="bg-gradient-to-r from-electric to-persian border-0 shadow-xl h-80 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-pearl flex items-center gap-2">
          <Badge variant="secondary" className="bg-razza text-pearl">
            {chatSummaries.length}
          </Badge>
          Chat Summaries
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full overflow-y-auto flex flex-col justify-center">
        {chatSummaries.length === 0 ? (
          <p className="text-pearl text-center py-8">No chat summaries saved yet.</p>
        ) : (
          <div className="space-y-3">
            {chatSummaries.slice(0, 3).map((summary) => (
              <Card key={summary.chatId} className="bg-obsidian/60 border-0 shadow-sm py-2">
                <CardContent className="p-3 flex flex-col items-start justify-center">
                  <div className="flex justify-center items-start">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-pearl text-sm truncate">Chat ID: {summary.chatId}</h4>
                      <p className="text-xs text-skye">
                        {new Date(summary.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        onClick={() => onDownload(summary)}
                        className="bg-razza hover:bg-persian text-pearl px-2 py-1 text-xs h-6"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button
                        className="border-razza text-razza hover:bg-red-600 hover:text-pearl px-2 py-1 text-xs h-6"
                        onClick={() => onDelete(summary.chatId)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-pearl text-xs leading-relaxed">
                    {summary.summary.length > 100
                      ? `${summary.summary.substring(0, 100)}...`
                      : summary.summary
                    }
                  </p>
                </CardContent>
              </Card>
            ))}
            {chatSummaries.length > 3 && (
              <p className="text-pearl text-xs text-center mt-2">
                And {chatSummaries.length - 3} more...
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}