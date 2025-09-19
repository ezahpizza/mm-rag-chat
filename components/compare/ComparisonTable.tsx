'use client';

import React, { useState } from 'react';

import { ComparisonTableProps, getRiskIcon, getRiskLevelColor } from './types';

export function ComparisonTable({ comparisons }: ComparisonTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRowExpansion = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  if (comparisons.length === 0) {
    return (
      <div className="bg-cerulean rounded-lg shadow-md p-6 sm:p-8 text-center">
        <p className="text-cerulean text-sm sm:text-base">No comparisons to display.</p>
      </div>
    );
  }

  return (
    <div className="bg-pearl rounded-lg shadow-md overflow-hidden">
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-electric to-persian">
        <h3 className="text-base sm:text-lg font-semibold text-pearl">
          Document Comparison Results
        </h3>
        <p className="text-xs sm:text-sm text-skye mt-1">
          Comparing documents • {comparisons.length} clause comparisons
        </p>
      </div>

      {/* Mobile Card Layout */}
      <div className="block md:hidden">
        <div className="divide-y divide-gray-200">
          {comparisons.map((comparison, index) => (
            <div key={index} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {comparison.clause || 'General Clause'}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {comparison.category}
                  </p>
                </div>
                <div className="flex items-center ml-2">
                  {getRiskIcon(comparison.risk_level)}
                  <span className={`ml-1 px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor(comparison.risk_level)}`}>
                    {comparison.risk_level}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-700">Difference Summary:</p>
                  <p className="text-xs text-gray-600">{comparison.difference_summary}</p>
                </div>
                
                <button
                  onClick={() => toggleRowExpansion(index)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  {expandedRows.has(index) ? 'Show Less' : 'Show Details'}
                </button>
                
                {expandedRows.has(index) && (
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                    <div>
                      <p className="text-xs font-medium text-gray-700">Document A:</p>
                      <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        {comparison.docA_text}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">Document B:</p>
                      <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        {comparison.docB_text}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">Impact Analysis:</p>
                      <p className="text-xs text-gray-600">{comparison.impact}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-ocean">
            <tr>
              <th className="px-4 lg:px-6 py-3 text-left text-sm font-semibold text-cerulean uppercase tracking-wider">
                Clause
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-sm font-semibold text-cerulean uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-sm font-semibold text-cerulean uppercase tracking-wider">
                Difference Summary
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-cerulean uppercase tracking-wider">
                Risk Level
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-cerulean uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-pearl divide-y divide-gray-200">
            {comparisons.map((comparison, index) => (
              <React.Fragment key={`comparison-${index}`}>
                <tr className="hover:bg-skye transition-colors duration-300">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {comparison.clause}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {comparison.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-md">
                      {comparison.difference_summary}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskLevelColor(
                        comparison.risk_level
                      )}`}
                    >
                      <span className="mr-1">{getRiskIcon(comparison.risk_level)}</span>
                      {comparison.risk_level.charAt(0).toUpperCase() + comparison.risk_level.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleRowExpansion(index)}
                      className="text-electric hover:text-persian flex items-center text-sm font-medium"
                    >
                      {expandedRows.has(index) ? (
                        <>
                          <span className="mr-1">↑</span>
                          Collapse
                        </>
                      ) : (
                        <>
                          <span className="mr-1">↓</span>
                          Expand
                        </>
                      )}
                    </button>
                  </td>
                </tr>
                
                {/* Expanded row content */}
                {expandedRows.has(index) && (
                  <tr className="bg-electric">
                    <td colSpan={5} className="px-6 py-6">
                      <div className="space-y-6">
                        {/* Impact Analysis */}
                        <div>
                          <h4 className="text-sm font-semibold text-pearl mb-2">
                            Impact Analysis
                          </h4>
                          <p className="text-sm text-cerulean bg-skye p-3 rounded border">
                            {comparison.impact}
                          </p>
                        </div>

                        {/* Document Texts Comparison */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                              <span className="w-3 h-3 bg-persian rounded-full mr-2"></span>
                              Document A
                            </h4>
                            <div className="bg-skye p-4 rounded border text-sm text-cerulean max-h-48 overflow-y-auto">
                              {comparison.docA_text}
                              {comparison.docA_text.length >= 500 && (
                                <span className="text-cerulean italic">... (truncated)</span>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                              <span className="w-3 h-3 bg-razza rounded-full mr-2"></span>
                              Document B
                            </h4>
                            <div className="bg-persian p-4 rounded border border-skye text-sm text-pearl max-h-48 overflow-y-auto">
                              {comparison.docB_text}
                              {comparison.docB_text.length >= 500 && (
                                <span className="text-cerulean italic">... (truncated)</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}