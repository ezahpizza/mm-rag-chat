import { Card, CardContent, CardHeader, CardTitle } from '@/components/card';
import { Button } from '@/components/ui';
import { Badge } from '@/components/badge';
import { Download, Trash2 } from 'lucide-react';

interface ComparisonReport {
  reportId: string;
  docNames: string[];
  summary: string;
  createdAt: string;
  metadata: Record<string, unknown>;
}

interface ComparisonReportsSectionProps {
  comparisonReports: ComparisonReport[];
  onDownload: (report: ComparisonReport) => void;
  onDelete: (reportId: string) => void;
}

export function ComparisonReportsSection({
  comparisonReports,
  onDownload,
  onDelete
}: ComparisonReportsSectionProps) {
  return (
    <Card className="bg-gradient-to-r from-desire to-razza border-0 shadow-xl h-80 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-pearl flex items-center gap-2">
          <Badge variant="secondary" className="bg-ocean text-pearl">
            {comparisonReports.length}
          </Badge>
          Comparison Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full overflow-y-auto flex flex-col justify-center">
        {comparisonReports.length === 0 ? (
          <p className="text-pearl text-center py-8">No comparison reports saved yet.</p>
        ) : (
          <div className="space-y-3">
            {comparisonReports.slice(0, 3).map((report) => (
              <Card key={report.reportId} className="bg-pearl/40 border-0 shadow-sm py-2">
                <CardContent className="p-3 flex flex-col items-start justify-center">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-obsidian text-sm truncate">
                        {report.docNames.join(' vs ')}
                      </h4>
                      <p className="text-xs text-cerulean">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        onClick={() => onDownload(report)}
                        className="bg-persian hover:bg-razza text-pearl px-2 py-1 text-xs h-6"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button
                        className="border-razza text-razza hover:bg-red-600 hover:text-pearl px-2 py-1 text-xs h-6"
                        onClick={() => onDelete(report.reportId)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-obsidian text-xs leading-relaxed">
                    {report.summary.length > 100
                      ? `${report.summary.substring(0, 100)}...`
                      : report.summary
                    }
                  </p>
                </CardContent>
              </Card>
            ))}
            {comparisonReports.length > 3 && (
              <p className="text-pearl text-xs text-center mt-2">
                And {comparisonReports.length - 3} more...
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}