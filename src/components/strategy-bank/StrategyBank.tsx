'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useCards } from '@/hooks/useCards';
import { supabase } from '@/lib/supabase';
import { MANDATORY_BLUEPRINTS, DEFAULT_STRATEGY_HUB_BLUEPRINTS } from '@/utils/blueprintConstants';
import { FolderPlus, Sparkles } from 'lucide-react';
import StrategyBankContent from './StrategyBankContent';
import BlueprintManagerTool from './BlueprintManagerTool';
import AgentsSection from './AgentsSection';
import { GeneratedCard } from '@/components/shared/card-creator/types';
import { getAgentsForHub } from '@/lib/agentRegistry';
import { toast } from 'react-hot-toast';
import { BLUEPRINT_REGISTRY } from '@/components/blueprints/registry';

interface StrategyBankProps {
  strategy: any;
  onBack?: () => void;
}

export default function StrategyBank({ strategy, onBack }: StrategyBankProps) {
  const { user } = useAuth();
  
  // 🔧 FIX: Use working useCards hook for real-time card counts
  const { cards: allCards } = useCards(strategy.id);
  
  // 🔧 NEW: Simple groups functionality using shared client
  const [groups, setGroups] = useState<any[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>(MANDATORY_BLUEPRINTS[0]);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [enabledBlueprints, setEnabledBlueprints] = useState<string[]>(DEFAULT_STRATEGY_HUB_BLUEPRINTS as any);
  const [viewType, setViewType] = useState<'section' | 'group'>('section');
  const [showCreateGroupForm, setShowCreateGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [draggedBlueprint, setDraggedBlueprint] = useState<string | null>(null);

  const [newGroupColor, setNewGroupColor] = useState('blue');
  
  // Get agents for strategy hub
  const strategyAgents = getAgentsForHub('strategy');

  // Color options for groups
  const colorOptions = [
    { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
    { value: 'green', label: 'Green', color: 'bg-green-500' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
    { value: 'red', label: 'Red', color: 'bg-red-500' },
    { value: 'yellow', label: 'Yellow', color: 'bg-yellow-500' },
    { value: 'gray', label: 'Gray', color: 'bg-gray-500' },
  ];

  useEffect(() => {
    // Load enabled blueprints from strategy config
    // Try both naming conventions (database might have either)
    const config = strategy.blueprint_config || strategy.blueprintConfiguration;
    if (config?.enabledBlueprints) {
      setEnabledBlueprints(config.enabledBlueprints);
      // Set first enabled blueprint as active section
      if (config.enabledBlueprints.length > 0 && !config.enabledBlueprints.includes(activeSection)) {
        setActiveSection(config.enabledBlueprints[0]);
      }
    }
    // If no config exists, keep the default mandatory blueprints
  }, [strategy]);

  // Load groups for this strategy
  useEffect(() => {
    loadGroups();
  }, [strategy.id]);

  const loadGroups = async () => {
    try {
      setGroupsLoading(true);
      const { data, error } = await supabase
        .from('strategy_groups')
        .select('*')
        .eq('strategy_id', strategy.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading groups:', error);
        setGroups([]);
      } else {
        console.log('✓ Groups loaded successfully:', data?.length || 0);
        setGroups(data || []);
      }
    } catch (error) {
      console.error('Error in loadGroups:', error);
      setGroups([]);
    } finally {
      setGroupsLoading(false);
    }
  };

  
  const handleBlueprintUpdate = async (newBlueprints: string[]) => {
    try {
      console.log('🔄 Blueprint update requested:', newBlueprints);
      
      // Update database
      const { error } = await supabase
        .from('strategies')
        .update({
          blueprint_config: {
            enabledBlueprints: newBlueprints,
            mandatoryBlueprints: MANDATORY_BLUEPRINTS,
            lastUpdated: new Date().toISOString()
          }
        })
        .eq('id', strategy.id);

      if (error) {
        console.error('Error saving blueprints to database:', error);
        alert('Failed to save blueprint changes. Please try again.');
        return;
      }

      // Update local state only after successful database update
      setEnabledBlueprints(newBlueprints);
      
      // If current active section is no longer enabled, switch to first available
      if (!newBlueprints.includes(activeSection) && newBlueprints.length > 0) {
        setActiveSection(newBlueprints[0]);
      }
      
      setActiveTool(null); // Close Blueprint Manager
      console.log('✓ Blueprints saved successfully');
    } catch (error) {
      console.error('Error updating blueprints:', error);
      alert('Failed to save blueprint changes. Please try again.');
    }
  };

  const handleSectionSelect = (sectionId: string) => {
    setActiveSection(sectionId);
    setActiveGroup(null); // Clear group selection when switching sections
    setActiveTool(null); // Close any open tool
    setViewType('section');
  };

  const handleGroupSelect = (groupId: string) => {
    setActiveGroup(groupId);
    setActiveSection(''); // Clear section selection when selecting group
    setActiveTool(null); // Close any open tool
    setViewType('group');
  };

  const handleCreateGroupSubmit = async () => {
    if (!newGroupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('strategy_groups')
        .insert({
          strategy_id: strategy.id,
          name: newGroupName.trim(),
          color: newGroupColor
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating group:', error);
        throw error;
      }

      console.log('✓ Group created successfully:', data);
      
      // Update local state
      setGroups(prev => [...prev, data]);
      
      // Reset form
      setNewGroupName('');
      setNewGroupColor('blue');
      setShowCreateGroupForm(false);
    } catch (error) {
      console.error('❌ Failed to create group:', error);
      alert('Failed to create group. Please try again.');
    }
  };

  const handleToolSelect = (toolId: string) => {
    setActiveTool(activeTool === toolId ? null : toolId);
    setActiveSection('');
    setActiveGroup(null);
  };

  // Drag and drop handlers for reordering blueprints
  const handleDragStart = (e: React.DragEvent, blueprintId: string) => {
    setDraggedBlueprint(blueprintId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetBlueprintId: string) => {
    e.preventDefault();
    
    if (!draggedBlueprint || draggedBlueprint === targetBlueprintId) {
      return;
    }

    const draggedIndex = enabledBlueprints.indexOf(draggedBlueprint);
    const targetIndex = enabledBlueprints.indexOf(targetBlueprintId);

    if (draggedIndex === -1 || targetIndex === -1) {
      return;
    }

    // Create a new array with the reordered blueprints
    const newBlueprints = [...enabledBlueprints];
    newBlueprints.splice(draggedIndex, 1);
    newBlueprints.splice(targetIndex, 0, draggedBlueprint);

    // Update local state
    setEnabledBlueprints(newBlueprints);

    // Save the new order to the database
    try {
      const { error } = await supabase
        .from('strategies')
        .update({
          blueprint_config: {
            enabledBlueprints: newBlueprints,
            mandatoryBlueprints: MANDATORY_BLUEPRINTS,
            lastUpdated: new Date().toISOString()
          }
        })
        .eq('id', strategy.id);

      if (error) {
        console.error('Error saving blueprint order:', error);
        // Revert on error
        setEnabledBlueprints(enabledBlueprints);
      }
    } catch (error) {
      console.error('Error updating blueprint order:', error);
      // Revert on error
      setEnabledBlueprints(enabledBlueprints);
    }

    setDraggedBlueprint(null);
  };

  const handleDragEnd = () => {
    setDraggedBlueprint(null);
  };

  const handleCardsCreated = async (generatedCards: GeneratedCard[], metadata?: { targetSection: string; targetCardType: string }) => {
    try {
      // Get the createCard function from useCards hook
      const { createCard } = await import('@/hooks/useCards');
      
      // Convert GeneratedCard to createCard format
      for (const generatedCard of generatedCards) {
        // Prepare card data
        const cardData = {
          strategy_id: strategy.id,
          title: generatedCard.title,
          description: generatedCard.description || '',
          card_type: generatedCard.card_type,
          priority: generatedCard.priority || 'Medium',
          confidence_level: generatedCard.confidence ? 
            (generatedCard.confidence > 0.8 ? 'High' : generatedCard.confidence > 0.6 ? 'Medium' : 'Low') : 
            'Medium',
          card_data: generatedCard.card_data || {},
          tags: Array.isArray(generatedCard.card_data?.tags) ? generatedCard.card_data.tags : [],
          created_by: user?.id || null
        };
        
        console.log('Inserting card with data:', cardData);
        
        // Create the card
        const { data, error } = await supabase.from('cards').insert(cardData).select();
        
        if (error) {
          console.error('Error inserting card:', error);
          console.error('Card data that failed:', cardData);
          throw error;
        }
        
        console.log('Successfully inserted card:', data);
      }
      
      toast.success(`Created ${generatedCards.length} cards`);
      setActiveTool(null);
      
      // Navigate to the section where cards were created
      if (metadata?.targetSection) {
        // For card types that are blueprints themselves (like customer-journey)
        // the targetSection might be the blueprint ID
        if (BLUEPRINT_REGISTRY[metadata.targetSection]) {
          setActiveSection(metadata.targetSection);
          setActiveGroup(null);
        } else {
          // Find the blueprint that contains this section
          const blueprintEntry = Object.entries(BLUEPRINT_REGISTRY).find(([_, config]) => 
            config.sections?.some(section => section.id === metadata.targetSection)
          );
          
          if (blueprintEntry) {
            const [blueprintId, blueprintConfig] = blueprintEntry;
            setActiveSection(blueprintId);
            // Find and set the active group
            const targetSectionConfig = blueprintConfig.sections?.find(s => s.id === metadata.targetSection);
            if (targetSectionConfig) {
              setActiveGroup(targetSectionConfig.id);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error creating cards:', error);
      toast.error('Failed to create some cards');
    }
  };

  return (
    <div className="h-full flex">
      {/* Left Sidebar - Exact Template Bank pattern */}
      <div className="w-64 bg-white border-r border-gray-200">
        {/* Back Button */}
        {onBack && (
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={onBack}
              className="text-gray-700 hover:bg-black hover:bg-opacity-10 px-1.5 py-0.5 rounded transition-colors text-xs"
            >
              ← Back to Strategies
            </button>
          </div>
        )}

        {/* Tools Section */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-[10px] font-semibold text-black uppercase tracking-wider mb-2">Agent Tools</h3>
          
          <div className="space-y-1">
            <button
              onClick={() => handleToolSelect('blueprint-manager')}
              className={`
                w-full flex items-center justify-between px-3 py-1.5 text-left rounded-md transition-colors
                ${activeTool === 'blueprint-manager'
                  ? 'bg-black bg-opacity-50 text-white'
                  : 'text-black hover:bg-gray-100'
                }
              `}
            >
              <span className="text-xs">Blueprint Manager</span>
            </button>
            
            {/* Dynamic Agents as Tools */}
            {strategyAgents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => handleToolSelect(`agent-${agent.id}`)}
                className={`
                  w-full flex items-center justify-between px-3 py-1.5 text-left rounded-md transition-colors
                  ${activeTool === `agent-${agent.id}`
                    ? 'bg-black bg-opacity-50 text-white'
                    : 'text-black hover:bg-gray-100'
                  }
                `}
              >
                <span className="text-xs">{agent.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Blueprints Section */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-[10px] font-semibold text-black uppercase tracking-wider mb-2">Blueprints</h3>
          
          <div className="space-y-1">
            {enabledBlueprints.map((blueprintId) => {
              const cardCount = allCards.filter(card => card.cardType === blueprintId).length;
              return (
                <div
                  key={blueprintId}
                  draggable
                  onDragStart={(e) => handleDragStart(e, blueprintId)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, blueprintId)}
                  onDragEnd={handleDragEnd}
                  className={`
                    cursor-move select-none
                    ${draggedBlueprint === blueprintId ? 'opacity-50' : ''}
                  `}
                >
                  <button
                    onClick={() => handleSectionSelect(blueprintId)}
                    className={`
                      w-full flex items-center justify-between px-3 py-1.5 text-left rounded-md transition-colors
                      ${activeSection === blueprintId && viewType === 'section' && !activeTool
                        ? 'bg-black bg-opacity-50 text-white'
                        : 'text-black hover:bg-gray-100'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                      </svg>
                      <span className="text-xs capitalize">{blueprintId.replace('-', ' ')}</span>
                    </div>
                    <span className={`text-xs ${
                      activeSection === blueprintId && viewType === 'section' && !activeTool
                        ? 'text-white'
                        : 'text-black'
                    }`}>{cardCount}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Groups Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-semibold text-black uppercase tracking-wider">Groups</h3>
            <button
              onClick={() => setShowCreateGroupForm(!showCreateGroupForm)}
              className="p-1 text-black hover:text-gray-600 transition-colors"
              title="Create Group"
            >
              <FolderPlus className="w-3 h-3" />
            </button>
          </div>

          {/* Create Group Form */}
          {showCreateGroupForm && (
            <div className="mb-3 p-2 border border-gray-200 rounded-md bg-gray-50">
              <input
                type="text"
                placeholder="Group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full px-2 py-0.5 text-xs border border-gray-300 rounded focus:outline-none text-black mb-2"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateGroupSubmit()}
              />
              <div className="flex items-center gap-1 mb-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewGroupColor(color.value)}
                    className={`w-4 h-4 rounded-full ${color.color} ${
                      newGroupColor === color.value ? 'ring-2 ring-gray-400' : ''
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={handleCreateGroupSubmit}
                  className="px-2 py-0.5 text-xs text-gray-700 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowCreateGroupForm(false);
                    setNewGroupName('');
                    setNewGroupColor('blue');
                  }}
                  className="px-2 py-0.5 text-xs text-gray-700 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          <div className="space-y-1">
            {groups.map((group) => {
              // Calculate card count for this group
              const cardCount = allCards.filter(card => 
                card.group_ids && card.group_ids.includes(group.id)
              ).length;
              
              return (
                <button
                  key={group.id}
                  onClick={() => handleGroupSelect(group.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-1.5 text-left rounded-md transition-colors
                    ${activeGroup === group.id && viewType === 'group' && !activeTool
                      ? 'bg-black bg-opacity-50 text-white'
                      : 'text-black hover:bg-gray-100'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${colorOptions.find(c => c.value === group.color)?.color || 'bg-gray-400'}`} />
                    <span className="text-xs">{group.name}</span>
                  </div>
                  <span className={`text-xs ${
                    activeGroup === group.id && viewType === 'group' && !activeTool
                      ? 'text-white'
                      : 'text-black'
                  }`}>{cardCount}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content - Template Bank pattern */}
      <div className="flex-1 flex flex-col">
        {activeTool === 'blueprint-manager' ? (
          <BlueprintManagerTool
            strategyId={strategy.id}
            currentBlueprints={enabledBlueprints}
            onSave={handleBlueprintUpdate}
            onClose={() => setActiveTool(null)}
          />
        ) : activeTool?.startsWith('agent-') ? (
          <AgentsSection
            strategy={strategy}
            selectedAgentId={activeTool.replace('agent-', '')}
            onClose={() => setActiveTool(null)}
            onCardsCreated={handleCardsCreated}
          />
        ) : (
          <StrategyBankContent
            strategy={strategy}
            activeSection={activeSection}
            activeGroup={activeGroup}
            viewType={viewType}
          />
        )}
      </div>
    </div>
  );
}