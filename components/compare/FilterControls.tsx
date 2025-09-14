'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select';

import { FilterControlsProps, categoryOptions, riskOptions } from './types';

export function FilterControls({
  riskFilter,
  categoryFilter,
  onRiskFilterChange,
  onCategoryFilterChange,
  totalComparisons,
  filteredCount,
}: FilterControlsProps) {
  const resetFilters = () => {
    onRiskFilterChange('all');
    onCategoryFilterChange('all');
  };

  const hasActiveFilters = riskFilter !== 'all' || categoryFilter !== 'all';

  return (
    <div className="bg-skye rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Risk Level Filter */}
          <div className="flex flex-col">
            <label htmlFor="risk-filter" className="text-sm font-medium text-cerulean mb-1">
              Risk Level
            </label>
            <Select value={riskFilter} onValueChange={onRiskFilterChange}>
              <SelectTrigger className="w-[200px] border-gray-300 bg-pearl text-obsidian">
                <SelectValue placeholder="Select risk level..." />
              </SelectTrigger>
              <SelectContent className="bg-pearl border-gray-300 shadow-lg">
                {riskOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="text-gray-900 hover:bg-gray-100"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col">
            <label htmlFor="category-filter" className="text-sm font-medium text-cerulean mb-1">
              Category
            </label>
            <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
              <SelectTrigger className="w-[200px] border-gray-300 bg-pearl text-obsidian">
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent className="bg-pearl border-gray-300 shadow-lg">
                {categoryOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="text-gray-900 hover:bg-gray-100"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="flex flex-col justify-end">
              <button
                onClick={resetFilters}
                className="text-sm text-electric hover:text-persian underline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Results Counter */}
        <div className="flex flex-col sm:items-end">
          <div className="text-sm text-gray-600">
            Showing {filteredCount} of {totalComparisons} comparisons
          </div>
          {hasActiveFilters && filteredCount < totalComparisons && (
            <div className="text-xs text-gray-500 mt-1">
              {totalComparisons - filteredCount} filtered out
            </div>
          )}
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-cerulean mr-2">Quick filters:</span>
          
          <button
            onClick={() => onRiskFilterChange('high')}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              riskFilter === 'high'
                ? 'bg-red-100 text-red-800 border-red-200'
                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-red-50'
            }`}
          >
            🚩 High Risk
          </button>
          
          <button
            onClick={() => onCategoryFilterChange('Financial')}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              categoryFilter === 'Financial'
                ? 'bg-blue-100 text-blue-800 border-blue-200'
                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-blue-50'
            }`}
          >
            💰 Financial
          </button>
          
          <button
            onClick={() => onCategoryFilterChange('Liability')}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              categoryFilter === 'Liability'
                ? 'bg-orange-100 text-orange-800 border-orange-200'
                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-orange-50'
            }`}
          >
            ⚖️ Liability
          </button>
          
          <button
            onClick={() => onCategoryFilterChange('Termination')}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              categoryFilter === 'Termination'
                ? 'bg-purple-100 text-purple-800 border-purple-200'
                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-purple-50'
            }`}
          >
            🔚 Termination
          </button>
        </div>
      </div>
    </div>
  );
}