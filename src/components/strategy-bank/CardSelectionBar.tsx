'use client';

import { Check, X, Users, Trash2 } from 'lucide-react';

interface CardSelectionBarProps {
  selectedCount: number;
  groups: any[];
  onAddToGroup: (groupId: string) => void;
  onRemoveSelected: () => void;
  onClearSelection: () => void;
}

export default function CardSelectionBar({
  selectedCount,
  groups,
  onAddToGroup,
  onRemoveSelected,
  onClearSelection
}: CardSelectionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-4 z-40">
      <span className="text-sm font-medium">
        {selectedCount} {selectedCount === 1 ? 'card' : 'cards'} selected
      </span>
      
      <div className="h-4 w-px bg-gray-600" />
      
      {/* Add to Group */}
      <div className="relative group">
        <button className="flex items-center gap-2 px-3 py-1 text-sm hover:bg-gray-800 rounded transition-colors">
          <Users className="w-4 h-4" />
          Add to Group
        </button>
        
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
          <div className="p-2">
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => onAddToGroup(group.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                <div className={`w-3 h-3 rounded-full bg-${group.color}-500`} />
                <span>{group.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Delete Selected */}
      <button
        onClick={onRemoveSelected}
        className="flex items-center gap-2 px-3 py-1 text-sm hover:bg-red-600 rounded transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
      
      {/* Clear Selection */}
      <button
        onClick={onClearSelection}
        className="p-1 hover:bg-gray-800 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}