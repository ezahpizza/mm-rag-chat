'use client';

import { SummaryPanelProps } from "./types";

export function SummaryPanel({ summary, metadata }: SummaryPanelProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalRiskItems = metadata.alignment_stats.high_risk + 
                        metadata.alignment_stats.medium_risk + 
                        metadata.alignment_stats.low_risk;

  const riskDistribution = [
    { level: 'High', count: metadata.alignment_stats.high_risk, color: 'bg-red-600', textColor: 'text-red-600' },
    { level: 'Medium', count: metadata.alignment_stats.medium_risk, color: 'bg-yellow-600', textColor: 'text-yellow-600' },
    { level: 'Low', count: metadata.alignment_stats.low_risk, color: 'bg-green-600', textColor: 'text-green-300' },
  ];

  return (
    <div className="mt-6 sm:mt-8 bg-pearl rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-electric to-persian px-4 sm:px-6 py-3 sm:py-4">
        <h2 className="text-lg sm:text-xl font-bold text-pearl">
          Comparison Summary
        </h2>
        <p className="text-blue-100 text-xs sm:text-sm mt-1">
          Executive overview of document differences and risk assessment
        </p>
      </div>

      <div className="p-4 sm:p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6 text-obsidian text-xs sm:text-sm">
          {/* Documents Info */}
          <div className="bg-skye rounded-lg p-3 sm:p-4">
            <h3 className="text-sm font-semibold text-cerulean mb-2 sm:mb-3">Documents Analyzed</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>First Document:</span>
                <span className="font-medium truncate ml-2 max-w-[120px] sm:max-w-none" title={metadata.docA.id}>
                  {metadata.docA.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Second Document:</span>
                <span className="truncate ml-2 max-w-[120px] sm:max-w-none" title={metadata.docB.id}>
                  {metadata.docB.id}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span>Comparisons:</span>
                <span className="font-medium">
                  {metadata.alignment_stats.total_alignments}
                </span>
              </div>
            </div>
          </div>

          {/* Risk Distribution */}
          <div className="bg-electric rounded-lg p-3 sm:p-4">
            <h3 className="text-sm font-semibold text-pearl mb-2 sm:mb-3">Risk Distribution</h3>
            <div className="space-y-2 sm:space-y-3">
              {riskDistribution.map((risk) => (
                <div key={risk.level} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${risk.color} mr-2`}></div>
                    <span className="text-xs sm:text-sm text-obsidian font-medium">{risk.level} Risk</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-xs sm:text-sm font-medium ${risk.textColor}`}>
                      {risk.count}
                    </span>
                    {totalRiskItems > 0 && (
                      <span className="text-xs text-pearl ml-1">
                        ({Math.round((risk.count / totalRiskItems) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-persian rounded-lg p-3 sm:p-4">
            <h3 className="text-sm font-semibold text-skye mb-2 sm:mb-3">Analysis Stats</h3>
            <div className="space-y-2 text-pearl text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span>Doc A Clauses:</span>
                <span className="font-medium text-skye">
                  {metadata.docA.total_clauses}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span> Doc B Clauses:</span>
                <span className="font-medium text-skye">
                  {metadata.docB.total_clauses}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span>Generated:</span>
                <span className="text-xs ">
                  {formatDate(metadata.generated_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI-Generated Summary */}
        <div className="bg-skye/50 border border-obsidian rounded-lg p-6">
          <div className="flex items-start">
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-semibold text-persian mb-3">
                Analysis Summary
              </h3>
              <div className="prose prose-sm max-w-none">
                <div className="text-cerulean leading-relaxed whitespace-pre-line">
                  {summary}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Actions */}
        {metadata.alignment_stats.high_risk > 0 && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <span className="text-red-600 text-lg mr-2">⚠️</span>
              <h4 className="text-sm font-semibold text-red-900">
                Priority Actions Required
              </h4>
            </div>
            <p className="text-sm text-red-800">
              {metadata.alignment_stats.high_risk} high-risk difference{metadata.alignment_stats.high_risk !== 1 ? 's' : ''} detected. 
              Review these items carefully and consider legal consultation for significant contractual variations.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}