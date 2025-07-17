'use client';

import { useState, useMemo } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { BLUEPRINT_REGISTRY, getBlueprintConfig } from '@/components/blueprints/registry';

interface BlueprintManagerToolProps {
  strategyId: number;
  currentBlueprints: string[];
  onSave: (blueprints: string[]) => void;
  onClose: () => void;
}

// Strategy Hub specific blueprint configuration
// This defines which blueprints should be available in the Strategy Hub
const STRATEGY_HUB_BLUEPRINTS = [
  // Core Strategy
  'strategicContext',
  'vision',
  'valuePropositions',
  'strategic-bet',
  
  // Research & Analysis
  'personas',
  'customer-journey',
  'swot-analysis',
  'competitive-analysis',
  'market-insight',
  'experiment',
  
  // Planning & Execution
  'okrs',
  'problem-statement', // This was missing from the hardcoded list!
  'workstreams',
  'epics',
  'features',
  'prd',
  'trd',
  'business-model',
  'gtmPlays',
  'risk-assessment',
  'roadmap',
  
  // User Experience
  
  // Measurement
  'kpis',
  'financial-projections',
  'cost-driver',
  'revenue-driver'
];

// Required blueprints that cannot be deselected
const REQUIRED_BLUEPRINTS = ['strategicContext'];

// Suggested blueprints to highlight
const SUGGESTED_BLUEPRINTS = ['features', 'personas'];

// Category mapping for filtering
const CATEGORY_MAPPING: Record<string, string> = {
  'Core Strategy': 'strategy',
  'Research & Analysis': 'research',
  'Planning & Execution': 'planning',
  'User Experience': 'research',
  'Measurement': 'measurement'
};

// Helper function to get blueprint display data from registry
function getBlueprintDisplayData(blueprintId: string) {
  const config = getBlueprintConfig(blueprintId);
  if (!config) return null;
  
  // Map blueprint categories to display categories
  let displayCategory = 'planning'; // default
  if (config.category) {
    displayCategory = CATEGORY_MAPPING[config.category] || 'planning';
  }
  
  return {
    name: config.name,
    description: config.description,
    category: displayCategory,
    tags: [],
    isRequired: REQUIRED_BLUEPRINTS.includes(blueprintId)
  };
}

export default function BlueprintManagerTool({
  strategyId,
  currentBlueprints,
  onSave,
  onClose,
}: BlueprintManagerToolProps) {
  const [selectedBlueprints, setSelectedBlueprints] = useState<string[]>(currentBlueprints);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Get available blueprints from registry-based configuration
  const availableBlueprints = STRATEGY_HUB_BLUEPRINTS.filter(blueprintId => {
    // Only include blueprints that exist in the registry
    const config = getBlueprintConfig(blueprintId);
    return config !== undefined;
  });
  const totalAvailable = availableBlueprints.length;

  // Filter blueprints based on search and category
  const filteredBlueprints = useMemo(() => {
    return availableBlueprints.filter(blueprintId => {
      const blueprintData = getBlueprintDisplayData(blueprintId);
      if (!blueprintData) return false;
      
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        if (!blueprintData.name.toLowerCase().includes(searchLower) && 
            !blueprintData.description.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      
      // Category filter
      if (categoryFilter !== 'All') {
        if (blueprintData.category !== categoryFilter.toLowerCase()) {
          return false;
        }
      }
      
      return true;
    });
  }, [searchQuery, categoryFilter, availableBlueprints]);

  const handleToggleBlueprint = (blueprintId: string) => {
    const blueprintData = getBlueprintDisplayData(blueprintId);
    
    // Don't allow deselecting required blueprints
    if (blueprintData?.isRequired && selectedBlueprints.includes(blueprintId)) {
      return;
    }
    
    setSelectedBlueprints(prev => 
      prev.includes(blueprintId)
        ? prev.filter(id => id !== blueprintId)
        : [...prev, blueprintId]
    );
  };

  const handleSelectAll = () => {
    setSelectedBlueprints(filteredBlueprints);
  };

  const handleResetToRequired = () => {
    const requiredBlueprints = availableBlueprints.filter(id => REQUIRED_BLUEPRINTS.includes(id));
    setSelectedBlueprints(requiredBlueprints);
  };

  const handleAddSuggested = (blueprintId: string) => {
    if (!selectedBlueprints.includes(blueprintId)) {
      setSelectedBlueprints(prev => [...prev, blueprintId]);
    }
  };

  const handleSave = () => {
    if (selectedBlueprints.length === 0) {
      alert('You must select at least one blueprint.');
      return;
    }
    onSave(selectedBlueprints);
  };

  const hasChanges = JSON.stringify(selectedBlueprints.sort()) !== JSON.stringify(currentBlueprints.sort());

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header - 60% smaller */}
      <div className="border-b border-gray-200 px-3 py-2 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-gray-900">Select Strategy Blueprints</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {totalAvailable} blueprints available
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectAll}
            className="px-2 py-1 text-xs bg-black text-white rounded hover:bg-gray-800 transition-colors"
          >
            Select All
          </button>
          <span className="text-xs text-gray-600">{selectedBlueprints.length} selected</span>
          <button
            onClick={onClose}
            className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Suggested Blueprints - 60% smaller */}
      <div className="px-3 py-2 bg-blue-50 border-b border-gray-200">
        <div className="flex items-center gap-1 mb-1.5">
          <span className="text-xs font-medium text-gray-700">Suggested Blueprints:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_BLUEPRINTS.map(blueprintId => {
            const blueprintData = getBlueprintDisplayData(blueprintId);
            const isSelected = selectedBlueprints.includes(blueprintId);
            
            if (!blueprintData) return null;
            
            return (
              <button
                key={blueprintId}
                onClick={() => handleAddSuggested(blueprintId)}
                disabled={isSelected}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded border transition-colors ${
                  isSelected 
                    ? 'bg-green-100 text-green-700 border-green-300 cursor-default'
                    : 'bg-black text-white border-black hover:bg-gray-800'
                }`}
              >
                <Plus className="w-2.5 h-2.5" />
                {blueprintData.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Filter - 60% smaller */}
      <div className="px-3 py-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search blueprints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-6 pr-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
          >
            <option value="All">All</option>
            <option value="Strategy">Strategy</option>
            <option value="Research">Research</option>
            <option value="Planning">Planning</option>
            <option value="Measurement">Measurement</option>
          </select>
        </div>
      </div>

      {/* Blueprint Grid - Card Creator Style */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-wrap gap-2">
          {filteredBlueprints.map(blueprintId => {
            const blueprintData = getBlueprintDisplayData(blueprintId);
            if (!blueprintData) return null;
            
            const isSelected = selectedBlueprints.includes(blueprintId);
            const isRequired = blueprintData.isRequired;
            const isSuggested = SUGGESTED_BLUEPRINTS.includes(blueprintId);
            
            // Get blueprint config for icon
            const config = getBlueprintConfig(blueprintId);
            const icon = config?.icon || '📄';
            
            return (
              <label
                key={blueprintId}
                className={`relative w-[calc(20%-8px)] min-w-[140px] max-w-[180px] h-[80px] rounded-lg cursor-pointer transition-all 
                  flex flex-col items-center justify-center gap-1 shadow-md hover:shadow-lg
                  ${isSelected 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-black hover:bg-gray-900 text-white'
                  } ${isRequired ? 'cursor-default' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggleBlueprint(blueprintId)}
                  disabled={isRequired}
                  className="sr-only"
                />
                
                {/* Tags - positioned absolutely */}
                <div className="absolute top-1 right-1 flex gap-0.5">
                  {isRequired && (
                    <span className="px-1 py-0.5 text-[10px] font-medium text-white bg-red-500 rounded">
                      Required
                    </span>
                  )}
                  {isSuggested && (
                    <span className="px-1 py-0.5 text-[10px] font-medium text-blue-600 bg-blue-100 rounded">
                      Suggested
                    </span>
                  )}
                </div>

                {/* Icon */}
                <span className="text-2xl">
                  {icon}
                </span>
                
                {/* Blueprint Name */}
                <span className="text-xs font-medium text-center px-2">
                  {blueprintData.name}
                </span>
              </label>
            );
          })}
        </div>

        {filteredBlueprints.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-1">
              <Search className="w-5 h-5 mx-auto" />
            </div>
            <p className="text-xs text-gray-500">No blueprints found matching your search.</p>
          </div>
        )}
      </div>

      {/* Footer - 60% smaller */}
      <div className="border-t border-gray-200 px-3 py-2 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSelectAll}
            className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
          >
            Select All ({filteredBlueprints.length})
          </button>
          <button
            onClick={handleResetToRequired}
            className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
          >
            Reset to Required
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || selectedBlueprints.length === 0}
            className="px-3 py-1.5 text-xs bg-black text-white rounded hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save {selectedBlueprints.length} Blueprint{selectedBlueprints.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}