'use client';

import { Plus, Sparkles, FileText } from 'lucide-react';

interface EmptyStateProps {
  activeSection: string;
  onAddCard: () => void;
  onQuickAdd: () => void;
  onAIGenerate: () => void;
}

export default function EmptyState({
  activeSection,
  onAddCard,
  onQuickAdd,
  onAIGenerate
}: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No cards in this section yet
        </h3>
        
        <p className="text-sm text-gray-500 mb-6">
          Get started by creating your first card. You can add cards manually, 
          use templates, or generate them with AI.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onAddCard}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Card
          </button>
          
          <button
            onClick={onQuickAdd}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 text-sm rounded transition-colors"
          >
            Quick Add
          </button>
          
          <button
            onClick={onAIGenerate}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 text-sm rounded transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            AI Generate
          </button>
        </div>
      </div>
    </div>
  );
}