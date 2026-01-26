import { 
  ComparisonTable, 
  FilterControls, 
  SummaryPanel, 
} from '@/components/compare';
import { ResultsSectionProps } from '@/components/compare/types';

export const ResultsSection = ({
  comparisonResult,
  filteredComparisons,
  riskFilter,
  categoryFilter,
  onRiskFilterChange,
  onCategoryFilterChange
}: ResultsSectionProps) => (
  <div className="space-y-4 sm:space-y-6">
    <SummaryPanel
      summary={comparisonResult.summary}
      metadata={comparisonResult.metadata}
    />

    <FilterControls
      riskFilter={riskFilter}
      categoryFilter={categoryFilter}
      onRiskFilterChange={onRiskFilterChange}
      onCategoryFilterChange={onCategoryFilterChange}
      totalComparisons={comparisonResult.comparisons.length}
      filteredCount={filteredComparisons.length}
    />

    <ComparisonTable
      comparisons={filteredComparisons}
    />

    {filteredComparisons.length === 0 && comparisonResult.comparisons.length > 0 && (
      <div className="text-center py-6 sm:py-8">
        <p className="text-gray-500 text-sm sm:text-base px-4">
          No comparisons match the current filters. Try adjusting your filter criteria.
        </p>
      </div>
    )}
  </div>
);