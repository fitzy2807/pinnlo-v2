'use client';

import { useState } from 'react';
import { Settings, Bot, FileText, BarChart, Plus, ArrowLeft } from 'lucide-react';
import { useCards } from '@/hooks/useCards';
import { blueprintRegistry } from '@/components/blueprints/registry';
import { useStrategyGroups } from '@/hooks/useStrategyGroups';
import GroupManager from './GroupManager';

interface StrategyBankSidebarProps {
  strategyId: number;
  enabledBlueprints: string[];
  activeTool: string | null;
  activeSection: string;
  activeGroup: string | null;
  onToolSelect: (toolId: string) => void;
  onSectionSelect: (sectionId: string) => void;
  onGroupSelect: (groupId: string) => void;
  onBack?: () => void;
}

const TOOLS = [
  { id: 'blueprint-manager', name: 'Blueprint Manager', icon: Settings, description: 'Configure strategy sections' },
  { id: 'ai-generator', name: 'AI Generator', icon: Bot, description: 'Generate content with AI' },
  { id: 'templates', name: 'Templates', icon: FileText, description: 'Use strategy templates' },
  { id: 'analytics', name: 'Analytics', icon: BarChart, description: 'View strategy metrics' },
];

export default function StrategyBankSidebar({
  strategyId,
  enabledBlueprints,
  activeTool,
  activeSection,
  activeGroup,
  onToolSelect,
  onSectionSelect,
  onGroupSelect,
  onBack,
}: StrategyBankSidebarProps) {
  // 🔧 FIX: Use working useCards hook for real card counts
  const { cards: allCards } = useCards(strategyId);
  
  const [showGroupManager, setShowGroupManager] = useState(false);
  
  const {
    groups,
    loading: groupsLoading,
    createGroup,
    updateGroup,
    deleteGroup
  } = useStrategyGroups(strategyId);

  // 🔧 FIX: Calculate real card counts from actual data
  const getCardCount = (blueprintId: string) => {
    return allCards.filter(card => card.cardType === blueprintId).length;
  };
  
  // 🔧 DEBUG: Log card counts
  console.log('🔍 StrategyBankSidebar Debug:');
  console.log('- All Cards Count:', allCards.length);
  console.log('- Enabled Blueprints:', enabledBlueprints);
  enabledBlueprints.forEach(bp => {
    console.log(`- ${bp}: ${getCardCount(bp)} cards`);
  });

  const getSectionName = (blueprintId: string) => {
    return blueprintRegistry[blueprintId]?.name || blueprintId;
  };

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
      gray: 'bg-gray-500',
    };
    return colorMap[color] || 'bg-gray-500';
  };

  return (
    <>
      <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
        {/* Back Button - only show when onBack is provided */}
        {onBack && (
          <div className="p-3 border-b border-gray-200">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-1.5 text-black hover:bg-gray-100 rounded-md transition-colors w-full text-left"
            >
              <ArrowLeft className="w-3 h-3" />
              <span className="text-xs">Back to Strategies</span>
            </button>
          </div>
        )}
        
        {/* Tools Section */}
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-[10px] font-semibold text-black uppercase tracking-wider mb-2">
            TOOLS
          </h3>
          <div className="space-y-1">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => onToolSelect(tool.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-left rounded-md transition-colors ${
                    activeTool === tool.id
                      ? 'bg-black bg-opacity-50 text-white'
                      : 'text-black hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3 h-3" />
                    <span className="text-xs">{tool.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sections (Dynamic Blueprints) */}
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-[10px] font-semibold text-black uppercase tracking-wider mb-2">
            SECTIONS
          </h3>
          <div className="space-y-1">
            {enabledBlueprints.map((blueprintId) => {
              const count = getCardCount(blueprintId); // 🔧 FIX: Use real card count
              return (
                <button
                  key={blueprintId}
                  onClick={() => onSectionSelect(blueprintId)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-left rounded-md transition-colors ${
                    activeSection === blueprintId && !activeGroup
                      ? 'bg-black bg-opacity-50 text-white'
                      : 'text-black hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xs">{getSectionName(blueprintId)}</span>
                  {count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeSection === blueprintId && !activeGroup
                        ? 'bg-gray-700 text-gray-200'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Groups */}
        <div className="p-3 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-semibold text-black uppercase tracking-wider">
              GROUPS
            </h3>
            <button
              onClick={() => setShowGroupManager(true)}
              className="text-gray-700 hover:bg-black hover:bg-opacity-10 p-1 rounded transition-colors"
              title="Manage Groups"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-1">
            {groupsLoading ? (
              <div className="text-xs text-gray-500 text-center py-2">Loading...</div>
            ) : groups.length === 0 ? (
              <div className="text-xs text-gray-500 text-center py-2">
                No groups yet
              </div>
            ) : (
              groups.map((group: any) => (
                <button
                  key={group.id}
                  onClick={() => onGroupSelect(group.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-left rounded-md transition-colors ${
                    activeGroup === group.id
                      ? 'bg-black bg-opacity-50 text-white'
                      : 'text-black hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getColorClass(group.color)}`} />
                    <span className="text-xs">{group.name}</span>
                  </div>
                  {group.card_count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeGroup === group.id
                        ? 'bg-gray-700 text-gray-200'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {group.card_count}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Group Manager Modal */}
      {showGroupManager && (
        <GroupManager
          groups={groups}
          onCreateGroup={createGroup}
          onUpdateGroup={updateGroup}
          onDeleteGroup={deleteGroup}
          onClose={() => setShowGroupManager(false)}
        />
      )}
    </>
  );
}