'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Calendar, User, FileText, Pin, Edit2, Trash2, Copy } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Strategy {
  id: number;
  title: string | null;
  client: string | null;
  description: string | null;
  status: string | null;
  updatedAt: string | null;
  isPinned?: boolean;
}

interface StrategySelectionGatewayProps {
  strategies: Strategy[];
  loading: boolean;
  creating: boolean;
  onSelectStrategy: (id: number) => void;
  onCreateStrategy: (title: string, client: string, description: string) => void;
  onUpdateStrategy?: (id: number, updates: { title?: string; client?: string; description?: string }) => void;
  onDeleteStrategy?: (id: number) => void;
  onDuplicateStrategy?: (id: number) => void;
}

export default function StrategySelectionGateway({
  strategies,
  loading,
  creating,
  onSelectStrategy,
  onCreateStrategy,
  onUpdateStrategy,
  onDeleteStrategy,
  onDuplicateStrategy
}: StrategySelectionGatewayProps) {
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [pinnedStrategies, setPinnedStrategies] = useState<Set<number>>(new Set());
  const [editingStrategy, setEditingStrategy] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    client: '',
    description: ''
  });
  const [newStrategy, setNewStrategy] = useState({
    title: '',
    client: '',
    description: ''
  });

  // Load pinned strategies from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pinnlo-pinned-strategies');
      if (saved) {
        setPinnedStrategies(new Set(JSON.parse(saved)));
      }
    } catch (error) {
      console.error('Error loading pinned strategies:', error);
    }
  }, []);

  // Save pinned strategies to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('pinnlo-pinned-strategies', JSON.stringify(Array.from(pinnedStrategies)));
    } catch (error) {
      console.error('Error saving pinned strategies:', error);
    }
  }, [pinnedStrategies]);

  const handleCreate = () => {
    if (!newStrategy.title.trim()) {
      alert('Please enter a strategy title');
      return;
    }
    onCreateStrategy(newStrategy.title, newStrategy.client, newStrategy.description);
  };

  const handleTogglePin = (strategyId: number) => {
    setPinnedStrategies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(strategyId)) {
        newSet.delete(strategyId);
      } else {
        newSet.add(strategyId);
      }
      return newSet;
    });
  };

  const handleEdit = (strategy: Strategy) => {
    setEditingStrategy(strategy.id);
    setEditForm({
      title: strategy.title || '',
      client: strategy.client || '',
      description: strategy.description || ''
    });
  };

  const handleSaveEdit = () => {
    if (!editForm.title.trim()) {
      alert('Please enter a strategy title');
      return;
    }
    if (onUpdateStrategy && editingStrategy) {
      onUpdateStrategy(editingStrategy, editForm);
      setEditingStrategy(null);
      setEditForm({ title: '', client: '', description: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditingStrategy(null);
    setEditForm({ title: '', client: '', description: '' });
  };

  const handleDelete = (strategyId: number, strategyTitle: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${strategyTitle}"? This action cannot be undone.`);
    if (confirmed && onDeleteStrategy) {
      onDeleteStrategy(strategyId);
      // Remove from pinned if it was pinned
      setPinnedStrategies(prev => {
        const newSet = new Set(prev);
        newSet.delete(strategyId);
        return newSet;
      });
    }
  };

  const handleDuplicate = (strategyId: number) => {
    if (onDuplicateStrategy) {
      onDuplicateStrategy(strategyId);
    }
  };

  const getSortedStrategies = () => {
    return strategies
      .map(strategy => ({
        ...strategy,
        isPinned: pinnedStrategies.has(strategy.id)
      }))
      .sort((a, b) => {
        // Pinned strategies first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        
        // Then sort by updated date (most recent first)
        const aDate = new Date(a.updatedAt || 0).getTime();
        const bDate = new Date(b.updatedAt || 0).getTime();
        return bDate - aDate;
      });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading strategies...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a Strategy</h2>
          <p className="text-gray-600">Choose an existing strategy to manage or create a new one</p>
        </div>

        {/* Strategy List - Card Format */}
        <div className="space-y-3">
          {/* Create New Strategy Card - At Top */}
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 hover:bg-gray-50 transition-all group"
            disabled={creating}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center mr-3 transition-colors flex-shrink-0">
                <Plus className="w-4 h-4 text-gray-600" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Create New Strategy</h3>
                <p className="text-xs text-gray-500">Start building a new strategic plan</p>
              </div>
            </div>
          </button>

          {/* Existing Strategies - Sorted by pin status */}
          {getSortedStrategies().map((strategy) => {
            const isEditing = editingStrategy === strategy.id;
            return (
            <div
              key={strategy.id}
              className={`w-full bg-white border rounded-lg p-4 hover:shadow-md transition-all text-left group relative ${
                strategy.isPinned ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
              }`}
            >
              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-100 z-10">
                {!isEditing && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(strategy);
                      }}
                      className="p-2 rounded-full transition-colors text-gray-700 hover:text-gray-900 hover:bg-gray-200 bg-white border border-gray-300 shadow-md"
                      title="Edit strategy"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(strategy.id);
                      }}
                      className="p-2 rounded-full transition-colors text-gray-700 hover:text-gray-900 hover:bg-gray-200 bg-white border border-gray-300 shadow-md"
                      title="Duplicate strategy"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(strategy.id, strategy.title || 'Untitled Strategy');
                      }}
                      className="p-2 rounded-full transition-colors text-red-700 hover:text-red-900 hover:bg-red-200 bg-white border border-red-300 shadow-md"
                      title="Delete strategy"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTogglePin(strategy.id);
                  }}
                  className={`p-2 rounded-full transition-colors bg-white border shadow-md ${
                    strategy.isPinned 
                      ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-200 border-yellow-300' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200 border-gray-300'
                  }`}
                  title={strategy.isPinned ? 'Unpin strategy' : 'Pin strategy'}
                >
                  <Pin className={`w-4 h-4 ${strategy.isPinned ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Card Content - Edit Mode or Display Mode */}
              {isEditing ? (
                <div className="space-y-3 pr-16">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-2 py-1 text-sm font-semibold border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="Strategy title"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={editForm.client}
                    onChange={(e) => setEditForm({ ...editForm, client: e.target.value })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="Client/Project"
                  />
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="Description"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1 text-xs bg-black text-white rounded hover:bg-gray-800 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1 text-xs text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Card Header */}
                  <div 
                  className="flex items-start justify-between mb-2 pr-20 cursor-pointer"
                  onClick={() => onSelectStrategy(strategy.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        {strategy.isPinned && (
                          <Pin className="w-3 h-3 text-yellow-600 fill-current flex-shrink-0" />
                        )}
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-black truncate">
                          {strategy.title || 'Untitled Strategy'}
                        </h3>
                      </div>
                      {strategy.client && (
                        <div className="flex items-center mt-0.5 text-xs text-gray-500">
                          <User className="w-3 h-3 mr-1" />
                          {strategy.client}
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ml-2 ${
                      strategy.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {strategy.status || 'draft'}
                    </span>
                  </div>
              
                  {/* Description */}
                  {strategy.description && (
                    <div 
                      className="mb-2 cursor-pointer"
                      onClick={() => onSelectStrategy(strategy.id)}
                    >
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                        {strategy.description}
                      </p>
                    </div>
                  )}
                  
                  {/* Priority and Confidence Placeholders */}
                  <div 
                    className="flex items-center space-x-4 mb-2 cursor-pointer"
                    onClick={() => onSelectStrategy(strategy.id)}
                  >
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-xs text-gray-500">Priority:</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-800">
                        High
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-500">Progress:</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>
                  
                  {/* Date Footer */}
                  <div 
                    className="flex items-center text-xs text-gray-500 cursor-pointer"
                    onClick={() => onSelectStrategy(strategy.id)}
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>Modified {formatDate(strategy.updatedAt)}</span>
                  </div>
                </>
              )}
            </div>
          )})}
        </div>
      </div>

      {/* Create Strategy Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Strategy</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Strategy Title *
                </label>
                <input
                  type="text"
                  value={newStrategy.title}
                  onChange={(e) => setNewStrategy({ ...newStrategy, title: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="e.g., Q1 2024 Growth Initiative"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client/Project
                </label>
                <input
                  type="text"
                  value={newStrategy.client}
                  onChange={(e) => setNewStrategy({ ...newStrategy, client: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="e.g., Acme Corp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newStrategy.description}
                  onChange={(e) => setNewStrategy({ ...newStrategy, description: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Brief description of the strategy..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewStrategy({ title: '', client: '', description: '' });
                }}
                className="flex-1 px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 px-4 py-2 text-sm text-white bg-black hover:bg-gray-800 rounded transition-colors disabled:opacity-50"
                disabled={creating || !newStrategy.title.trim()}
              >
                {creating ? 'Creating...' : 'Create Strategy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}