'use client';

import { useState, useMemo } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { blueprintRegistry } from '@/components/blueprints/registry';

interface BlueprintManagerToolProps {
  strategyId: number;
  currentBlueprints: string[];
  onSave: (blueprints: string[]) => void;
  onClose: () => void;
}

// Blueprint data with exact same structure as the image
const BLUEPRINT_DATA = {
  'strategic-context': {
    name: 'Strategic Context',
    description: 'Define the strategic context and foundation for your strategy',
    category: 'strategy',
    tags: ['Required'],
    isRequired: true
  },
  'vision': {
    name: 'Vision Statement', 
    description: 'Define your long-term vision and aspirational goals',
    category: 'strategy'
  },
  'value-proposition': {
    name: 'Value Proposition',
    description: 'Define the unique value you provide to customers', 
    category: 'strategy'
  },
  'personas': {
    name: 'Personas',
    description: 'Define detailed user personas and customer segments',
    category: 'research',
    tags: ['Suggested']
  },
  'customer-journey': {
    name: 'Customer Journey',
    description: 'Map the customer experience from awareness to advocacy',
    category: 'research'
  },
  'swot-analysis': {
    name: 'SWOT Analysis', 
    description: 'Analyze strengths, weaknesses, opportunities, and threats',
    category: 'research'
  },
  'competitive-analysis': {
    name: 'Competitive Analysis',
    description: 'Analyze competitors and competitive landscape',
    category: 'research'
  },
  'okrs': {
    name: 'OKRs',
    description: 'Define objectives and key results for goal tracking',
    category: 'planning'
  },
  'business-model': {
    name: 'Business Model',
    description: 'Define how your business creates, delivers, and captures value',
    category: 'planning'
  },
  'go-to-market': {
    name: 'Go-to-Market Strategy',
    description: 'Plan how to bring your product or service to market',
    category: 'planning'
  },
  'risk-assessment': {
    name: 'Risk Assessment',
    description: 'Identify and analyze potential risks and mitigation strategies',
    category: 'planning'
  },
  'roadmap': {
    name: 'Roadmap',
    description: 'Plan timeline and milestones for strategy execution',
    category: 'planning'
  },
  'kpis': {
    name: 'KPIs & Metrics',
    description: 'Define key performance indicators and success metrics',
    category: 'measurement'
  },
  'financial-projections': {
    name: 'Financial Projections',
    description: 'Create financial forecasts and projections',
    category: 'measurement'
  },
  'workstream': {
    name: 'Workstream',
    description: 'Organize work into manageable streams with clear ownership',
    category: 'planning'
  },
  'epic': {
    name: 'Epic', 
    description: 'Large initiatives broken down into manageable features',
    category: 'planning'
  },
  'feature': {
    name: 'Feature',
    description: 'Product features with detailed specifications and user stories',
    category: 'planning',
    tags: ['Suggested']
  },
  'user-journey': {
    name: 'User Journey',
    description: 'Map user experiences and touchpoints across their lifecycle',
    category: 'research',
    tags: ['Suggested']
  }
};

const SUGGESTED_BLUEPRINTS = ['user-journey', 'feature', 'personas'];

export default function BlueprintManagerTool({
  strategyId,
  currentBlueprints,
  onSave,
  onClose,
}: BlueprintManagerToolProps) {
  const [selectedBlueprints, setSelectedBlueprints] = useState<string[]>(currentBlueprints);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Get available blueprints (those defined in BLUEPRINT_DATA)
  const availableBlueprints = Object.keys(BLUEPRINT_DATA);
  const totalAvailable = availableBlueprints.length;

  // Filter blueprints based on search and category
  const filteredBlueprints = useMemo(() => {
    return availableBlueprints.filter(blueprintId => {
      const blueprint = BLUEPRINT_DATA[blueprintId];
      
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        if (!blueprint.name.toLowerCase().includes(searchLower) && 
            !blueprint.description.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      
      // Category filter
      if (categoryFilter !== 'All') {
        if (blueprint.category !== categoryFilter.toLowerCase()) {
          return false;
        }
      }
      
      return true;
    });
  }, [searchQuery, categoryFilter]);

  const handleToggleBlueprint = (blueprintId: string) => {
    const blueprint = BLUEPRINT_DATA[blueprintId];
    
    // Don't allow deselecting required blueprints
    if (blueprint.isRequired && selectedBlueprints.includes(blueprintId)) {
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
    const requiredBlueprints = availableBlueprints.filter(id => BLUEPRINT_DATA[id].isRequired);
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
            const blueprint = BLUEPRINT_DATA[blueprintId];
            const isSelected = selectedBlueprints.includes(blueprintId);
            
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
                {blueprint.name}
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

      {/* Blueprint Grid - 60% smaller */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {filteredBlueprints.map(blueprintId => {
            const blueprint = BLUEPRINT_DATA[blueprintId];
            const isSelected = selectedBlueprints.includes(blueprintId);
            const isRequired = blueprint.isRequired;
            const isSuggested = blueprint.tags?.includes('Suggested');
            
            return (
              <div
                key={blueprintId}
                onClick={() => handleToggleBlueprint(blueprintId)}
                className={`relative p-2 border rounded cursor-pointer transition-all h-20 ${
                  isSelected
                    ? 'border-black bg-gray-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                } ${isRequired ? 'cursor-default' : ''}`}
              >
                {/* Tags - smaller */}
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

                {/* Checkbox - smaller */}
                <div className="absolute top-1 left-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    disabled={isRequired}
                    className="w-3 h-3 rounded border-gray-300 text-black focus:ring-black"
                  />
                </div>

                {/* Content - no icon, reduced height */}
                <div className="mt-4 space-y-1">
                  <h3 className="text-[11px] font-medium text-gray-900 leading-tight overflow-hidden">
                    {blueprint.name}
                  </h3>
                  <p className="text-[10px] text-gray-500 leading-tight overflow-hidden">
                    {blueprint.description}
                  </p>
                </div>

                {/* Selection indicator - smaller */}
                {isSelected && (
                  <div className="absolute bottom-1 right-1">
                    <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                  </div>
                )}
              </div>
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