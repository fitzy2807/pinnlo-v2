/**
 * Intelligence Bank Component
 * 
 * Main interface for viewing and managing intelligence cards.
 * Uses the compact PINNLO design system for consistency.
 */

'use client'

import { useState, useEffect } from 'react'
import { 
  X, 
  Search, 
  Filter, 
  Settings, 
  TrendingUp,
  Eye,
  BarChart3,
  Cpu,
  Crown,
  Target,
  AlertTriangle,
  Lightbulb,
  Bookmark,
  Archive,
  TestTube,
  Plus,
  ChevronDown,
  Grid3X3,
  List,
  Trash2,
  ExternalLink
} from 'lucide-react'
import IntelligenceProfile from './IntelligenceProfile'
import IntelligenceCardList from '../intelligence-cards/IntelligenceCardList'
import IntelligenceCardEditor from '../intelligence-cards/IntelligenceCardEditor'
import { 
  IntelligenceCard as IntelligenceCardType,
  IntelligenceCardCategory,
  IntelligenceCardStatus,
  CreateIntelligenceCardData
} from '@/types/intelligence-cards'
import { useIntelligenceCardCounts, useCreateIntelligenceCard } from '@/hooks/useIntelligenceCards'

interface IntelligenceBankProps {
  isOpen: boolean
  onClose: () => void
}

// Intelligence categories with compact styling
const INTELLIGENCE_CATEGORIES = [
  {
    id: 'profile',
    name: 'Intelligence Profile',
    icon: Settings,
    description: 'Configure your strategic context for relevant intelligence',
    count: 1,
    color: 'text-gray-600'
  },
  {
    id: 'market',
    name: 'Market',
    icon: TrendingUp,
    description: 'Growth projections',
    count: 0,
    color: 'text-green-600'
  },
  {
    id: 'competitor',
    name: 'Competitor',
    icon: Eye,
    description: 'New product launches',
    count: 0,
    color: 'text-blue-600'
  },
  {
    id: 'trends',
    name: 'Trends',
    icon: BarChart3,
    description: 'UX/UI shifts',
    count: 0,
    color: 'text-purple-600'
  },
  {
    id: 'technology',
    name: 'Technology',
    icon: Cpu,
    description: 'Tech stack evolution',
    count: 0,
    color: 'text-indigo-600'
  },
  {
    id: 'stakeholder',
    name: 'Stakeholder',
    icon: Crown,
    description: 'Internal goals',
    count: 0,
    color: 'text-yellow-600'
  },
  {
    id: 'consumer',
    name: 'Consumer',
    icon: Target,
    description: 'Feedback',
    count: 0,
    color: 'text-red-600'
  },
  {
    id: 'risk',
    name: 'Risk',
    icon: AlertTriangle,
    description: 'Legal',
    count: 0,
    color: 'text-orange-600'
  },
  {
    id: 'opportunities',
    name: 'Opportunities',
    icon: Lightbulb,
    description: 'White space',
    count: 0,
    color: 'text-yellow-500'
  },
  {
    id: 'saved',
    name: 'Saved Cards',
    icon: Bookmark,
    description: 'Your saved intelligence cards',
    count: 0,
    color: 'text-pink-600'
  },
  {
    id: 'archive',
    name: 'Archive',
    icon: Archive,
    description: 'Archived intelligence cards',
    count: 0,
    color: 'text-gray-500'
  }
]

export default function IntelligenceBank({ isOpen, onClose }: IntelligenceBankProps) {
  const [selectedCategory, setSelectedCategory] = useState('market') // Start with market instead of profile
  const [searchQuery, setSearchQuery] = useState('')
  const [showProfileConfig, setShowProfileConfig] = useState(true)

  // Load card counts
  const { categoryCounts, statusCounts, refresh: refreshCounts } = useIntelligenceCardCounts()
  const { create: createCard, creating } = useCreateIntelligenceCard()

  // Update category counts
  const categoriesWithCounts = INTELLIGENCE_CATEGORIES.map(cat => {
    let count = cat.count
    if (cat.id === 'saved') {
      count = statusCounts.saved || 0
    } else if (cat.id === 'archive') {
      count = statusCounts.archived || 0
    } else if (cat.id !== 'profile' && categoryCounts[cat.id]) {
      count = categoryCounts[cat.id] || 0
    }
    return { ...cat, count }
  })

  const selectedCategoryData = categoriesWithCounts.find(cat => cat.id === selectedCategory)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Intelligence Bank Modal */}
      <div className="relative w-full max-w-7xl mx-auto my-8 bg-white rounded-lg shadow-xl overflow-hidden flex">
        {/* Left Sidebar - Compact Intelligence Categories */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-medium">Intelligence Bank</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <p className="text-xs text-gray-600">Strategic intelligence for informed decisions</p>
          </div>

          {/* Intelligence Categories - Compact */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Intelligence Categories
              </h3>
              
              <div className="space-y-1">
                {categoriesWithCounts.map((category) => {
                  const Icon = category.icon
                  const isSelected = selectedCategory === category.id
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left transition-colors text-xs ${
                        isSelected 
                          ? 'bg-blue-50 text-blue-700 font-medium' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="mr-1.5">+</span>
                        <span>{category.name}</span>
                      </div>
                      <span className={`text-xs px-1 py-0.5 rounded ${
                        isSelected 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {category.count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Main Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {selectedCategoryData && (
                  <>
                    <selectedCategoryData.icon className="w-5 h-5 text-gray-600" />
                    <div>
                      <h1 className="text-base font-medium">{selectedCategoryData.name} Intelligence</h1>
                      <p className="text-xs text-gray-600">{selectedCategoryData.description}</p>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {selectedCategory !== 'profile' && (
                  <button 
                    onClick={() => {
                      // Find the IntelligenceCardsContent and trigger its modal
                      const event = new CustomEvent('openCreateModal', { detail: { category: selectedCategory } });
                      window.dispatchEvent(event);
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Card</span>
                  </button>
                )}
                
                <button className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors">
                  <TestTube className="w-3 h-3" />
                  <span>Test MCP</span>
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search intelligence cards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <button className="flex items-center space-x-1 px-2 py-1.5 text-xs font-medium rounded border border-gray-300 hover:bg-gray-50">
                <Filter className="w-3 h-3" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            {selectedCategory === 'profile' ? (
              <IntelligenceProfileContent 
                showProfileConfig={showProfileConfig}
                setShowProfileConfig={setShowProfileConfig}
              />
            ) : (
              <IntelligenceCardsContent 
                category={selectedCategory}
                searchQuery={searchQuery}
                categoryData={selectedCategoryData}
                setSelectedCategory={setSelectedCategory}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Intelligence Profile Configuration Content
 */
interface IntelligenceProfileContentProps {
  showProfileConfig: boolean
  setShowProfileConfig: (show: boolean) => void
}

function IntelligenceProfileContent({ showProfileConfig, setShowProfileConfig }: IntelligenceProfileContentProps) {
  if (showProfileConfig) {
    return <IntelligenceProfile />
  }
  
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-md">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Settings className="w-6 h-6 text-gray-400" />
        </div>
        
        <h3 className="text-base font-medium mb-2">Intelligence Profile</h3>
        <p className="text-xs text-gray-600 mb-4">
          Configure your strategic context for relevant intelligence gathering.
        </p>
        
        <button 
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
          onClick={() => setShowProfileConfig(true)}
        >
          Configure Profile
        </button>
      </div>
    </div>
  )
}

/**
 * Intelligence Cards Content (for non-profile categories)
 */
interface IntelligenceCardsContentProps {
  category: string
  searchQuery: string
  categoryData?: typeof INTELLIGENCE_CATEGORIES[0]
  setSelectedCategory: (category: string) => void
}

function IntelligenceCardsContent({ 
  category, 
  searchQuery, 
  categoryData, 
  setSelectedCategory 
}: IntelligenceCardsContentProps) {
  const [showEditor, setShowEditor] = useState(false)
  const [cardListKey, setCardListKey] = useState(0) // Force refresh key
  const { create: createCard } = useCreateIntelligenceCard()
  const { refresh: refreshCounts } = useIntelligenceCardCounts()

  // Define the proper filtering logic
  const getFiltersForCategory = (categoryId: string) => {
    if (categoryId === 'saved') {
      return { status: IntelligenceCardStatus.SAVED }
    } else if (categoryId === 'archive') {
      return { status: IntelligenceCardStatus.ARCHIVED }
    } else {
      return { 
        category: categoryId as IntelligenceCardCategory,
        status: IntelligenceCardStatus.ACTIVE // Only show active cards in category sections
      }
    }
  }

  // Listen for the custom event from the Add Card button
  useEffect(() => {
    const handleOpenModal = (event: CustomEvent) => {
      if (event.detail.category === category) {
        setShowEditor(true)
      }
    }

    window.addEventListener('openCreateModal', handleOpenModal as EventListener)
    return () => window.removeEventListener('openCreateModal', handleOpenModal as EventListener)
  }, [category])

  const handleCreateCard = () => {
    setShowEditor(true)
  }

  const handleSaveCard = async (data: CreateIntelligenceCardData) => {
    console.log('Attempting to save card:', data)
    const result = await createCard(data)
    if (result.success) {
      setShowEditor(false)
      refreshCounts()
      // Force the card list to refresh by changing the key
      setCardListKey(prev => prev + 1)
      alert('Intelligence card created successfully!')
    } else {
      alert('Failed to save card: ' + result.error)
    }
  }

  const filters = getFiltersForCategory(category)
  
  // Debug logging
  console.log('IntelligenceCardsContent filters for category', category, ':', filters)

  return (
    <div className="p-4">
      {/* Intelligence Card List */}
      <IntelligenceCardList
        key={`${category}-${cardListKey}`} // Force re-render when category or key changes
        category={filters.category}
        status={filters.status}
        onEditCard={() => {}} // TODO: implement edit
        showFilters={false}
        showViewToggle={false}
        sortBy="date"
        sortOrder="desc"
        viewMode="grid"
        searchQuery={searchQuery}
        dateRange={{}}
        credibilityRange={[1, 10]}
        relevanceRange={[1, 10]}
        sourceTypes={[]}
        statusFilters={[]}
        tagFilters={[]}
        selectedCardIds={new Set()}
        setSelectedCardIds={() => {}}
        isSelectionMode={false}
        setIsSelectionMode={() => {}}
      />

      {/* Fallback: Show empty state if no cards */}
      <div className="mt-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <button 
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
            onClick={handleCreateCard}
          >
            Create Another Intelligence Card
          </button>
        </div>
      </div>

      {/* Intelligence Card Editor Modal */}
      {showEditor && (
        <IntelligenceCardEditor
          category={category as IntelligenceCardCategory}
          onSave={handleSaveCard}
          onCancel={() => setShowEditor(false)}
          isEditing={false}
        />
      )}
    </div>
  )
}