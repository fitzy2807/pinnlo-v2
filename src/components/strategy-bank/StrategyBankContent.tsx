'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, Plus, Grid3X3, List, Edit2, Trash2, Copy, FolderPlus, X } from 'lucide-react';
import { useCards } from '@/hooks/useCards';
import IntelligenceCardGrid from '@/components/intelligence-cards/IntelligenceCardGrid';

interface StrategyBankContentProps {
  strategy: any;
  activeSection: string;
  activeGroup: string | null;
  viewType: 'section' | 'group';
}

export default function StrategyBankContent({
  strategy,
  activeSection,
  activeGroup,
  viewType,
}: StrategyBankContentProps) {
  // 🔧 FIX: Use working useCards hook instead of mock data
  const { 
    cards: allCards, 
    loading, 
    error, 
    createCard, 
    updateCard, 
    deleteCard, 
    duplicateCard 
  } = useCards(strategy.id);
  
  // 🔧 FIX: Updated filtering logic for both sections and groups
  const activeCards = viewType === 'section' 
    ? allCards.filter(card => card.cardType === activeSection)
    : allCards.filter(card => card.group_ids && card.group_ids.includes(activeGroup || ''));
  
  // Simple groups state for display purposes
  const [groups, setGroups] = useState<any[]>([]);
  
  // Load groups when component mounts
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data, error } = await supabase
          .from('strategy_groups')
          .select('*')
          .eq('strategy_id', strategy.id)
          .order('created_at', { ascending: true });
          
        if (error) {
          console.error('Error loading groups:', error);
          setGroups([]);
        } else {
          setGroups(data || []);
        }
      } catch (error) {
        console.error('Error in loadGroups:', error);
        setGroups([]);
      }
    };
    
    loadGroups();
  }, [strategy.id]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const [quickAddDescription, setQuickAddDescription] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Show success message temporarily
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setShowSortDropdown(false);
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sort options - same as Template Bank
  const sortOptions = [
    { value: 'created', label: 'Created Date' },
    { value: 'updated', label: 'Updated Date' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'priority', label: 'Priority' },
  ];

  // Filter options - same as Template Bank
  const filterOptions = [
    { value: 'all', label: 'All Cards' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' },
    { value: 'recent', label: 'Recent (7 days)' },
  ];

  // Filter and sort cards - exact Template Bank logic
  const filteredCards = activeCards.filter(card => {
    // Filter by search query
    if (searchQuery && !card.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !card.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by priority/type
    if (filterBy !== 'all') {
      if (filterBy === 'recent') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(card.createdDate || card.created_at) >= weekAgo;
      } else if (['high', 'medium', 'low'].includes(filterBy)) {
        return card.priority?.toLowerCase() === filterBy;
      }
    }
    
    return true;
  }).sort((a, b) => {
    // Apply sorting
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority?.toLowerCase() as keyof typeof priorityOrder] || 0) - 
               (priorityOrder[a.priority?.toLowerCase() as keyof typeof priorityOrder] || 0);
      case 'updated':
        return new Date(b.lastModified || b.updated_at).getTime() - new Date(a.lastModified || a.updated_at).getTime();
      case 'created':
      default:
        return new Date(b.createdDate || b.created_at).getTime() - new Date(a.createdDate || a.created_at).getTime();
    }
  });

  // Create card handler
  const handleCreateCard = async () => {
    try {
      // Get groups this card should belong to
      const cardGroups = viewType === 'group' && activeGroup ? [activeGroup] : [];
      
      const newCard = {
        title: 'New Card',
        description: '',
        cardType: activeSection,
        priority: 'Medium',
        confidenceLevel: 'Medium',
        tags: [],
        relationships: [],
        strategicAlignment: '',
        group_ids: cardGroups,
      };
      
      await createCard(newCard);
      console.log('✓ Card created successfully in', activeSection);
      showSuccess('Card created successfully!');
    } catch (error) {
      console.error('❌ Failed to create card:', error);
      alert('Failed to create card. Please try again.');
    }
  };

  // Quick add handlers
  const handleQuickAddSubmit = async () => {
    if (!quickAddTitle.trim()) return;
    
    try {
      const cardGroups = viewType === 'group' && activeGroup ? [activeGroup] : [];
      
      const newCard = {
        title: quickAddTitle.trim(),
        description: quickAddDescription.trim(),
        cardType: activeSection,
        priority: 'Medium',
        confidenceLevel: 'Medium',
        tags: [],
        relationships: [],
        strategicAlignment: '',
        group_ids: cardGroups,
      };
      
      await createCard(newCard);
      console.log('✓ Card created via quick add:', quickAddTitle);
      
      // Reset form
      setQuickAddTitle('');
      setQuickAddDescription('');
      setShowQuickAdd(false);
      showSuccess('Card created successfully!');
    } catch (error) {
      console.error('❌ Failed to create card:', error);
      alert('Failed to create card. Please try again.');
    }
  };

  const handleQuickAddCancel = () => {
    setQuickAddTitle('');
    setQuickAddDescription('');
    setShowQuickAdd(false);
  };

  const handleSelectCard = (cardId: string) => {
    const newSelected = new Set(selectedCards);
    if (newSelected.has(cardId)) {
      newSelected.delete(cardId);
    } else {
      newSelected.add(cardId);
    }
    setSelectedCards(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedCards.size === 0) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete ${selectedCards.size} cards?`);
    if (!confirmed) return;
    
    try {
      await Promise.all(Array.from(selectedCards).map(cardId => deleteCard(cardId)));
      setSelectedCards(new Set());
      console.log(`✓ Deleted ${selectedCards.size} cards`);
      showSuccess(`Successfully deleted ${selectedCards.size} cards!`);
    } catch (error) {
      console.error('❌ Failed to delete cards:', error);
      alert('Failed to delete some cards. Please try again.');
    }
  };

  const handleBulkDuplicate = async () => {
    if (selectedCards.size === 0) return;
    
    try {
      await Promise.all(Array.from(selectedCards).map(cardId => duplicateCard(cardId)));
      setSelectedCards(new Set());
      console.log(`✓ Duplicated ${selectedCards.size} cards`);
      showSuccess(`Successfully duplicated ${selectedCards.size} cards!`);
    } catch (error) {
      console.error('❌ Failed to duplicate cards:', error);
      alert('Failed to duplicate some cards. Please try again.');
    }
  };

  const handleBulkGroupAssign = () => {
    if (selectedCards.size === 0) return;
    setShowGroupModal(true);
  };

  const handleAssignToGroup = async (groupId: string, groupName: string) => {
    try {
      const cardIds = Array.from(selectedCards);
      console.log('🏷️ Assigning cards to group:', groupId, groupName);
      
      await Promise.all(cardIds.map(async (cardId) => {
        const card = filteredCards.find(c => c.id === cardId);
        if (!card) return;
        
        const currentGroupIds = card.group_ids || [];
        const newGroupIds = currentGroupIds.includes(groupId) 
          ? currentGroupIds 
          : [...currentGroupIds, groupId];
          
        await updateCard(cardId, { group_ids: newGroupIds });
      }));
      
      setSelectedCards(new Set());
      setShowGroupModal(false);
      console.log(`✓ Added ${cardIds.length} cards to group: ${groupName}`);
      showSuccess(`Added ${cardIds.length} cards to group "${groupName}"!`);
    } catch (error) {
      console.error('❌ Failed to add cards to group:', error);
      alert('Failed to add cards to group. Please try again.');
    }
  };

  const handleCreateAndAssignGroup = async (groupName: string, groupColor: string) => {
    try {
      // Create new group
      const { supabase } = await import('@/lib/supabase');
      const { data: newGroup, error } = await supabase
        .from('strategy_groups')
        .insert({
          strategy_id: strategy.id,
          name: groupName.trim(),
          color: groupColor
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Update local groups state
      setGroups(prev => [...prev, newGroup]);
      console.log('✓ Created new group:', newGroup.name);
      
      // Assign cards to the new group
      await handleAssignToGroup(newGroup.id, newGroup.name);
    } catch (error) {
      console.error('❌ Failed to create group:', error);
      alert('Failed to create group. Please try again.');
    }
  };

  // Get section/group display name
  const getDisplayName = () => {
    if (viewType === 'section') {
      return activeSection.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    } else {
      const group = groups.find(g => g.id === activeGroup);
      return group?.name || 'Unknown Group';
    }
  };

  const getDisplayDescription = () => {
    if (viewType === 'section') {
      return `Define the strategic foundation and context for your ${activeSection.replace('-', ' ')}`;
    } else {
      const group = groups.find(g => g.id === activeGroup);
      return group?.description || 'Group collection of strategy cards';
    }
  };

  // Handle card updates
  const handleUpdateCard = async (id: string, updates: any) => {
    try {
      await updateCard(id, updates);
      console.log('✓ Card updated successfully:', id);
      showSuccess('Card updated successfully!');
    } catch (error) {
      console.error('❌ Failed to update card:', error);
      alert('Failed to update card. Please try again.');
    }
  };

  // Handle card deletion
  const handleDeleteCard = async (id: string) => {
    try {
      await deleteCard(id);
      console.log('✓ Card deleted successfully:', id);
      showSuccess('Card deleted successfully!');
    } catch (error) {
      console.error('❌ Failed to delete card:', error);
      alert('Failed to delete card. Please try again.');
    }
  };

  return (
    <>
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-400 p-3 mb-4 mx-4 mt-4">
          <div className="text-sm text-green-700">{successMessage}</div>
        </div>
      )}

      {/* Header - Exact Template Bank pattern */}
      <div className="bg-white border-b border-gray-200">
        {/* Title Section */}
        <div className="px-4 pt-2.5 pb-1.5">
          <h1 className="text-lg font-medium text-gray-900">
            {getDisplayName()}
          </h1>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {getDisplayDescription()}
          </p>
        </div>
        
        {/* Controls Bar */}
        <div className="px-4 pb-2">
          <div ref={dropdownRef} className="flex items-center gap-3 text-xs">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 pr-2.5 py-0.5 text-xs border border-gray-300 rounded focus:outline-none"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-0.5 bg-gray-100 rounded p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-0.5 rounded transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-0.5 rounded transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSortDropdown(!showSortDropdown);
                  setShowFilterDropdown(false);
                }}
                className="flex items-center gap-1 px-1.5 py-0.5 text-gray-700 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
              >
                <ArrowUpDown className="w-3 h-3" />
                <span>Sort</span>
              </button>
              
              {showSortDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-sm z-10 min-w-[140px]">
                  {sortOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortDropdown(false);
                      }}
                      className={`block w-full text-left px-2.5 py-1 text-xs hover:bg-gray-50 ${
                        sortBy === option.value ? 'bg-gray-50 font-medium' : ''
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowFilterDropdown(!showFilterDropdown);
                  setShowSortDropdown(false);
                }}
                className="flex items-center gap-1 px-1.5 py-0.5 text-gray-700 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
              >
                <Filter className="w-3 h-3" />
                <span>Filter</span>
              </button>
              
              {showFilterDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-sm z-10 min-w-[140px]">
                  {filterOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilterBy(option.value);
                        setShowFilterDropdown(false);
                      }}
                      className={`block w-full text-left px-2.5 py-1 text-xs hover:bg-gray-50 ${
                        filterBy === option.value ? 'bg-gray-50 font-medium' : ''
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Quick Add Button */}
            <button
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className="flex items-center gap-1 px-1.5 py-0.5 text-gray-700 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Quick Add</span>
            </button>

            {/* Actions */}
            {selectedCards.size > 0 && (
              <>
                <button
                  onClick={handleBulkGroupAssign}
                  className="flex items-center gap-1 px-1.5 py-0.5 text-gray-700 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
                >
                  <FolderPlus className="w-3 h-3" />
                  <span>Add to Group</span>
                </button>
                <button
                  onClick={handleBulkDuplicate}
                  className="flex items-center gap-1 px-1.5 py-0.5 text-gray-700 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  <span>Duplicate</span>
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1 px-1.5 py-0.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </>
            )}

            {/* Selected Count */}
            {selectedCards.size > 0 && (
              <span className="text-[11px] text-gray-500 ml-1">
                {selectedCards.size} selected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Add Form */}
      {showQuickAdd && (
        <div className="bg-gray-50 border-b border-gray-200 transition-all duration-300 ease-in-out overflow-hidden">
          <div className="px-4 py-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700">Quick Add Card to {getDisplayName()}</span>
              </div>
              <button
                onClick={handleQuickAddCancel}
                className="ml-auto text-gray-700 hover:bg-black hover:bg-opacity-10 rounded transition-colors p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Card title"
                value={quickAddTitle}
                onChange={(e) => setQuickAddTitle(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.metaKey) handleQuickAddSubmit();
                  if (e.key === 'Escape') handleQuickAddCancel();
                }}
                className="flex-1 px-2.5 py-0.5 text-xs border border-gray-300 rounded focus:outline-none text-black"
                autoFocus
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={quickAddDescription}
                onChange={(e) => setQuickAddDescription(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.metaKey) handleQuickAddSubmit();
                  if (e.key === 'Escape') handleQuickAddCancel();
                }}
                className="flex-1 px-2.5 py-0.5 text-xs border border-gray-300 rounded focus:outline-none text-black"
              />
              <button
                onClick={handleQuickAddCancel}
                className="px-1.5 py-0.5 text-xs text-gray-700 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleQuickAddSubmit}
                disabled={!quickAddTitle.trim()}
                className="px-1.5 py-0.5 text-xs text-gray-700 hover:bg-black hover:bg-opacity-10 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Card
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Press Esc to close • ⌘ + Enter to save
            </div>
          </div>
        </div>
      )}

      {/* Cards Content - Now using IntelligenceCardGrid */}
      <div className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        ) : (
          <IntelligenceCardGrid
            cards={filteredCards.map(card => ({
              ...card,
              // Ensure all required fields are present
              priority: card.priority || 'Medium',
              confidenceLevel: card.confidenceLevel || 'Medium',
              tags: card.tags || [],
              relationships: card.relationships || [],
              strategicAlignment: card.strategicAlignment || '',
              intelligence_content: card.intelligence_content || '',
              key_findings: card.key_findings || [],
              relevance_score: card.relevance_score,
              credibility_score: card.credibility_score,
              created_at: card.created_at || card.createdDate,
              updated_at: card.updated_at || card.lastModified,
              createdDate: card.created_at || card.createdDate,
              lastModified: card.updated_at || card.lastModified,
              card_data: card.card_data || {}
            }))}
            onCreateCard={handleCreateCard}
            onUpdateCard={handleUpdateCard}
            onDeleteCard={handleDeleteCard}
            searchQuery={searchQuery}
            selectedCardIds={selectedCards}
            onSelectCard={handleSelectCard}
            viewMode={viewMode}
            loading={loading}
          />
        )}
      </div>

      {/* Group Assignment Modal */}
      {showGroupModal && (
        <GroupAssignmentModal
          groups={groups}
          onAssign={handleAssignToGroup}
          onCreate={handleCreateAndAssignGroup}
          onClose={() => setShowGroupModal(false)}
        />
      )}
    </>
  );
}

// Group Assignment Modal Component
function GroupAssignmentModal({ groups, onAssign, onCreate, onClose }: any) {
  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#3B82F6');

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">Add Cards to Group</h3>
        </div>
        
        <div className="p-4">
          {!isCreating ? (
            <>
              <div className="space-y-2 mb-4">
                {groups.map((group: any) => (
                  <button
                    key={group.id}
                    onClick={() => onAssign(group.id, group.name)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 flex items-center gap-2"
                  >
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: group.color }}
                    />
                    <span className="text-sm">{group.name}</span>
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setIsCreating(true)}
                className="w-full text-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
              >
                + Create New Group
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              
              <div className="flex gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewGroupColor(color)}
                    className={`w-8 h-8 rounded ${
                      newGroupColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewGroupName('');
                  }}
                  className="flex-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (newGroupName.trim()) {
                      onCreate(newGroupName, newGroupColor);
                    }
                  }}
                  disabled={!newGroupName.trim()}
                  className="flex-1 px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
                >
                  Create & Assign
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}