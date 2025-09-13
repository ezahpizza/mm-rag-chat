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
    { level: 'High', count: metadata.alignment_stats.high_risk, color: 'bg-red-500', textColor: 'text-red-700' },
    { level: 'Medium', count: metadata.alignment_stats.medium_risk, color: 'bg-yellow-500', textColor: 'text-yellow-700' },
    { level: 'Low', count: metadata.alignment_stats.low_risk, color: 'bg-green-500', textColor: 'text-green-700' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-electric to-persian px-6 py-4">
        <h2 className="text-xl font-bold text-white">
          Comparison Summary
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          Executive overview of document differences and risk assessment
        </p>
      </div>

      <div className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Documents Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Documents Analyzed</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">First Document:</span>
                <span className="text-sm font-medium text-gray-900 truncate ml-2" title={metadata.docA.id}>
                  {metadata.docA.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Second Document:</span>
                <span className="text-sm font-medium text-gray-900 truncate ml-2" title={metadata.docB.id}>
                  {metadata.docB.id}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">Comparisons:</span>
                <span className="text-sm font-medium text-gray-900">
                  {metadata.alignment_stats.total_alignments}
                </span>
              </div>
            </div>
          </div>

          {/* Risk Distribution */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Risk Distribution</h3>
            <div className="space-y-3">
              {riskDistribution.map((risk) => (
                <div key={risk.level} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${risk.color} mr-2`}></div>
                    <span className="text-sm text-gray-600">{risk.level} Risk</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-sm font-medium ${risk.textColor}`}>
                      {risk.count}
                    </span>
                    {totalRiskItems > 0 && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({Math.round((risk.count / totalRiskItems) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Analysis Stats</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Doc A Clauses:</span>
                <span className="text-sm font-medium text-gray-900">
                  {metadata.docA.total_clauses}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Doc B Clauses:</span>
                <span className="text-sm font-medium text-gray-900">
                  {metadata.docB.total_clauses}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">Generated:</span>
                <span className="text-xs text-gray-500">
                  {formatDate(metadata.generated_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI-Generated Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                AI Analysis Summary
              </h3>
              <div className="prose prose-sm max-w-none">
                <div className="text-blue-800 leading-relaxed whitespace-pre-line">
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

        {/* Export Options (Future Enhancement) */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-600">
              Need to share these results? Export options coming soon.
            </div>
            <div className="flex gap-2">
              <button
                disabled
                className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-md cursor-not-allowed"
              >
                Export PDF (Soon)
              </button>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}