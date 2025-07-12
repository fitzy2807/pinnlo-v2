'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, Plus, Grid3X3, List, Edit2, Trash2, Copy, FolderPlus, X } from 'lucide-react';
import { useCards } from '@/hooks/useCards';
import MasterCard from '@/components/cards/MasterCard';

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

  // 🔧 DEBUG: Log to validate data flow
  console.log('🔍 StrategyBankContent Debug:');
  console.log('- Strategy ID:', strategy.id);
  console.log('- Active Section:', activeSection);
  console.log('- All Cards Count:', allCards.length);
  console.log('- Active Cards Count:', activeCards.length);
  console.log('- Filtered Cards Count:', filteredCards.length);
  console.log('- Loading:', loading);
  console.log('- Error:', error);

  const handleSelectAll = () => {
    if (selectedCards.size === filteredCards.length) {
      setSelectedCards(new Set());
    } else {
      setSelectedCards(new Set(filteredCards.map(card => card.id)));
    }
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

  const handleSortChange = (sortValue: string) => {
    setSortBy(sortValue);
    setShowSortDropdown(false);
    console.log('Cards sorted by:', sortOptions.find(opt => opt.value === sortValue)?.label);
  };

  const handleFilterChange = (filterValue: string) => {
    setFilterBy(filterValue);
    setShowFilterDropdown(false);
    console.log('Cards filtered by:', filterOptions.find(opt => opt.value === filterValue)?.label);
  };

  const handleCreateCard = async () => {
    try {
      await createCard({
        title: 'New Card',
        description: 'Click to edit this card',
        cardType: activeSection,
        priority: 'Medium',
        confidenceLevel: 'Medium'
      });
      console.log('✓ Card created successfully for section:', activeSection);
      showSuccess('Card created successfully!');
    } catch (error) {
      console.error('❌ Failed to create card:', error);
      alert('Failed to create card. Please try again.');
    }
  };

  const handleQuickAddSubmit = async () => {
    if (!quickAddTitle.trim()) {
      alert('Please enter a card title');
      return;
    }
    
    try {
      await createCard({
        title: quickAddTitle.trim(),
        description: quickAddDescription.trim() || 'Quick add card',
        cardType: activeSection,
        priority: 'Medium',
        confidenceLevel: 'Medium'
      });
      
      console.log('✓ Quick Add card created successfully');
      showSuccess('Quick Add card created successfully!');
      
      // Reset form
      setQuickAddTitle('');
      setQuickAddDescription('');
      setShowQuickAdd(false);
    } catch (error) {
      console.error('❌ Failed to create quick add card:', error);
      alert('Failed to create card. Please try again.');
    }
  };

  const handleQuickAddCancel = () => {
    setQuickAddTitle('');
    setQuickAddDescription('');
    setShowQuickAdd(false);
  };

  const handleBulkDelete = async () => {
    if (selectedCards.size === 0) return;
    
    const confirmed = window.confirm(`Delete ${selectedCards.size} selected cards?`);
    if (!confirmed) return;

    try {
      await Promise.all(Array.from(selectedCards).map(id => deleteCard(id)));
      setSelectedCards(new Set());
      console.log(`✓ Deleted ${selectedCards.size} cards successfully`);
      showSuccess(`Deleted ${selectedCards.size} cards successfully!`);
    } catch (error) {
      console.error('❌ Failed to delete cards:', error);
      alert('Failed to delete some cards. Please try again.');
    }
  };

  const handleBulkDuplicate = async () => {
    if (selectedCards.size === 0) return;

    try {
      await Promise.all(Array.from(selectedCards).map(id => duplicateCard(id)));
      setSelectedCards(new Set());
      console.log(`✓ Duplicated ${selectedCards.size} cards successfully`);
      showSuccess(`Duplicated ${selectedCards.size} cards successfully!`);
    } catch (error) {
      console.error('❌ Failed to duplicate cards:', error);
      alert('Failed to duplicate some cards. Please try again.');
    }
  };

  const handleBulkEdit = () => {
    if (selectedCards.size === 0) return;
    console.log('Bulk edit:', Array.from(selectedCards));
  };

  const handleBulkGroup = () => {
    if (selectedCards.size === 0) return;
    setShowGroupModal(true);
  };

  const handleAssignToGroup = async (groupId: string, groupName: string) => {
    try {
      const cardIds = Array.from(selectedCards);
      
      // Update each card's group_ids array
      await Promise.all(cardIds.map(async (cardId) => {
        const card = allCards.find(c => c.id === cardId);
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

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSortDropdown(!showSortDropdown);
                  setShowFilterDropdown(false);
                }}
                className="flex items-center gap-1 text-gray-700 hover:bg-black hover:bg-opacity-10 px-1.5 py-0.5 rounded transition-colors"
              >
                <ArrowUpDown className="w-3 h-3" />
                {sortBy === 'created' ? 'Sort' : sortOptions.find(opt => opt.value === sortBy)?.label || 'Sort'}
              </button>
              
              {showSortDropdown && (
                <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-gray-900 ${
                        sortBy === option.value ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowFilterDropdown(!showFilterDropdown);
                  setShowSortDropdown(false);
                }}
                className="flex items-center gap-1 text-gray-700 hover:bg-black hover:bg-opacity-10 px-1.5 py-0.5 rounded transition-colors"
              >
                <Filter className="w-3 h-3" />
                {filterBy === 'all' ? 'Filter' : filterOptions.find(opt => opt.value === filterBy)?.label || 'Filter'}
              </button>
              
              {showFilterDropdown && (
                <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange(option.value)}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-gray-900 ${
                        filterBy === option.value ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Add Controls */}
            {viewType === 'section' && (
              <>
                <button 
                  onClick={handleCreateCard}
                  className="text-gray-700 hover:bg-black hover:bg-opacity-10 px-1.5 py-0.5 rounded transition-colors"
                >
                  Add
                </button>

                <button 
                  onClick={() => setShowQuickAdd(!showQuickAdd)}
                  className="text-gray-700 hover:bg-black hover:bg-opacity-10 px-1.5 py-0.5 rounded transition-colors"
                >
                  Quick Add
                </button>

                <button 
                  onClick={() => console.log('AI Generate coming soon!')}
                  className="text-gray-700 hover:bg-black hover:bg-opacity-10 px-1.5 py-0.5 rounded transition-colors"
                >
                  AI Generate
                </button>
              </>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Select All */}
            <label className="flex items-center gap-1 text-gray-700 cursor-pointer hover:bg-black hover:bg-opacity-10 px-1.5 py-0.5 rounded transition-colors">
              <input
                type="checkbox"
                checked={selectedCards.size === filteredCards.length && filteredCards.length > 0}
                onChange={handleSelectAll}
                className="w-3 h-3 rounded border-gray-300 text-black focus:ring-black"
              />
              <span>Select All</span>
            </label>

            {/* Icon Actions */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={handleBulkEdit}
                className={`p-1 rounded transition-colors ${
                  selectedCards.size > 0 
                    ? 'text-gray-700 hover:bg-black hover:bg-opacity-10' 
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                disabled={selectedCards.size === 0}
                title="Edit"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={handleBulkDelete}
                className={`p-1 rounded transition-colors ${
                  selectedCards.size > 0 
                    ? 'text-gray-700 hover:bg-black hover:bg-opacity-10' 
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                disabled={selectedCards.size === 0}
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              <button
                onClick={handleBulkDuplicate}
                className={`p-1 rounded transition-colors ${
                  selectedCards.size > 0 
                    ? 'text-gray-700 hover:bg-black hover:bg-opacity-10' 
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                disabled={selectedCards.size === 0}
                title="Duplicate"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={handleBulkGroup}
                className={`p-1 rounded transition-colors ${
                  selectedCards.size > 0 
                    ? 'text-gray-700 hover:bg-black hover:bg-opacity-10' 
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                disabled={selectedCards.size === 0}
                title="Group"
              >
                <FolderPlus className="w-3 h-3" />
              </button>
            </div>

            {/* View Toggle */}
            <div className="flex items-center ml-2 bg-gray-100 rounded p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Grid view"
              >
                <Grid3X3 className="w-3 h-3" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="List view"
              >
                <List className="w-3 h-3" />
              </button>
            </div>

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

      {/* Cards Content */}
      <div className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            {viewType === 'section' ? (
              <button
                onClick={handleCreateCard}
                className="max-w-md p-8 border-2 border-dashed border-gray-300 rounded-lg text-center space-y-3 transition-colors hover:border-gray-400 hover:bg-gray-50 cursor-pointer"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Plus className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Add New Card</div>
                  <div className="text-xs text-gray-500">
                    Create a new {activeSection.replace('-', ' ')} card
                  </div>
                </div>
              </button>
            ) : (
              <div className="max-w-md p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <FolderPlus className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">No Cards in Group</div>
                  <div className="text-xs text-gray-500">
                    Add cards to this group from blueprint sections
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={`grid gap-4 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredCards.map((card) => (
              <div key={card.id} className="relative">
                <MasterCard
                  cardData={{
                    id: card.id,
                    title: card.title,
                    description: card.description || '',
                    cardType: card.cardType,
                    priority: card.priority || 'Medium',
                    confidenceLevel: card.confidenceLevel || 'Medium',
                    priorityRationale: card.priorityRationale || '',
                    confidenceRationale: card.confidenceRationale || '',
                    tags: card.tags || [],
                    relationships: card.relationships || [],
                    strategicAlignment: card.strategicAlignment || '',
                    createdDate: card.createdDate || card.created_at,
                    lastModified: card.lastModified || card.updated_at,
                    creator: 'User',
                    owner: 'User',
                    ...card
                  }}
                  isSelected={selectedCards.has(card.id)}
                  onSelect={() => handleSelectCard(card.id)}
                  onUpdate={async (updates) => {
                    try {
                      await updateCard(card.id, updates);
                      console.log('✓ Card updated successfully:', card.id);
                      showSuccess('Card updated successfully!');
                    } catch (error) {
                      console.error('❌ Failed to update card:', error);
                      alert('Failed to update card. Please try again.');
                    }
                  }}
                  onDelete={async () => {
                    const confirmed = window.confirm('Are you sure you want to delete this card?');
                    if (!confirmed) return;
                    
                    try {
                      await deleteCard(card.id);
                      console.log('✓ Card deleted successfully:', card.id);
                      showSuccess('Card deleted successfully!');
                    } catch (error) {
                      console.error('❌ Failed to delete card:', error);
                      alert('Failed to delete card. Please try again.');
                    }
                  }}
                  onDuplicate={async () => {
                    try {
                      await duplicateCard(card.id);
                      console.log('✓ Card duplicated successfully:', card.id);
                      showSuccess('Card duplicated successfully!');
                    } catch (error) {
                      console.error('❌ Failed to duplicate card:', error);
                      alert('Failed to duplicate card. Please try again.');
                    }
                  }}
                  onAIEnhance={() => console.log('AI enhance card:', card.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Group Selection Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <GroupSelectionModal
            selectedCount={selectedCards.size}
            existingGroups={groups}
            onAssignToGroup={handleAssignToGroup}
            onCreateAndAssign={handleCreateAndAssignGroup}
            onCancel={() => setShowGroupModal(false)}
          />
        </div>
      )}
    </>    
    );
}

// Group Selection Modal Component
interface GroupSelectionModalProps {
  selectedCount: number;
  existingGroups: any[];
  onAssignToGroup: (groupId: string, groupName: string) => void;
  onCreateAndAssign: (groupName: string, groupColor: string) => void;
  onCancel: () => void;
}

function GroupSelectionModal({
  selectedCount,
  existingGroups,
  onAssignToGroup,
  onCreateAndAssign,
  onCancel
}: GroupSelectionModalProps) {
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('blue');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const colorOptions = [
    { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
    { value: 'green', label: 'Green', color: 'bg-green-500' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
    { value: 'red', label: 'Red', color: 'bg-red-500' },
    { value: 'yellow', label: 'Yellow', color: 'bg-yellow-500' },
    { value: 'gray', label: 'Gray', color: 'bg-gray-500' },
  ];

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      alert('Please enter a group name');
      return;
    }
    onCreateAndAssign(newGroupName.trim(), newGroupColor);
  };

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-96 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900">
          Add {selectedCount} cards to group
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Select an existing group or create a new one
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Existing Groups */}
        {existingGroups.length > 0 && (
          <div className="p-3">
            <h3 className="text-xs font-medium text-gray-700 mb-2">Existing Groups</h3>
            <div className="space-y-1">
              {existingGroups.map((group) => {
                const colorOption = colorOptions.find(c => c.value === group.color);
                return (
                  <button
                    key={group.id}
                    onClick={() => onAssignToGroup(group.id, group.name)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-md border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    <div className={`w-3 h-3 rounded-full ${colorOption?.color || 'bg-gray-400'}`} />
                    <span className="text-xs text-gray-900">{group.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Create New Group */}
        <div className="p-3 border-t border-gray-200">
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-gray-700 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Create New Group
            </button>
          ) : (
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-gray-700">Create New Group</h3>
              
              <input
                type="text"
                placeholder="Group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleCreateGroup()}
              />
              
              <div>
                <p className="text-xs text-gray-600 mb-1">Color</p>
                <div className="flex gap-1">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setNewGroupColor(color.value)}
                      className={`w-5 h-5 rounded-full ${color.color} ${
                        newGroupColor === color.value ? 'ring-2 ring-gray-400' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleCreateGroup}
                  className="flex-1 px-3 py-1.5 text-xs bg-black text-white rounded hover:bg-gray-800 transition-colors"
                >
                  Create & Add Cards
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewGroupName('');
                    setNewGroupColor('blue');
                  }}
                  className="px-3 py-1.5 text-xs text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 flex justify-end">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-xs text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}