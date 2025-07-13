'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Plus, Link2, Search } from 'lucide-react'

interface Relationship {
  id: string
  title: string
  type: 'supports' | 'relates-to' | 'conflicts-with' | 'supported-by'
}

interface RelationshipEditorProps {
  relationships: Relationship[]
  onChange: (relationships: Relationship[]) => void
  availableCards?: Array<{ id: string; title: string; cardType: string }>
  currentCardId: string
}

const RELATIONSHIP_TYPES = [
  { value: 'supports', label: 'Supports', description: 'This card supports the other card' },
  { value: 'supported-by', label: 'Supported by', description: 'This card is supported by the other card' },
  { value: 'relates-to', label: 'Relates to', description: 'This card relates to the other card' },
  { value: 'conflicts-with', label: 'Conflicts with', description: 'This card conflicts with the other card' }
] as const

// Mock available cards for testing - in real app this would come from props
const MOCK_AVAILABLE_CARDS = [
  { id: '1', title: 'Market Analysis Framework', cardType: 'strategic-context' },
  { id: '2', title: 'Competitive Intelligence', cardType: 'strategic-context' },
  { id: '3', title: 'Customer Insights Research', cardType: 'personas' },
  { id: '4', title: 'Technology Landscape', cardType: 'strategic-context' },
  { id: '5', title: 'Regulatory Environment', cardType: 'strategic-context' },
  { id: '6', title: 'Internal Capabilities Audit', cardType: 'strategic-context' },
  { id: '7', title: 'Primary User Persona - Tech Professionals', cardType: 'personas' },
  { id: '8', title: 'Revenue Growth Objectives', cardType: 'okrs' },
  { id: '9', title: 'Core Value Proposition', cardType: 'value-propositions' }
]

export default function RelationshipEditor({ 
  relationships, 
  onChange, 
  availableCards = MOCK_AVAILABLE_CARDS,
  currentCardId 
}: RelationshipEditorProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCardId, setSelectedCardId] = useState('')
  const [selectedRelationType, setSelectedRelationType] = useState<Relationship['type']>('relates-to')
  const [filteredCards, setFilteredCards] = useState(availableCards)

  // Filter out current card and already related cards
  useEffect(() => {
    const relatedCardIds = relationships.map(rel => rel.id)
    const filtered = availableCards.filter(card => 
      card.id !== currentCardId && 
      !relatedCardIds.includes(card.id) &&
      (searchQuery === '' || 
       card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       card.cardType.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    setFilteredCards(filtered)
  }, [availableCards, currentCardId, relationships, searchQuery])

  const addRelationship = () => {
    if (!selectedCardId) return

    const selectedCard = availableCards.find(card => card.id === selectedCardId)
    if (!selectedCard) return

    const newRelationship: Relationship = {
      id: selectedCardId,
      title: selectedCard.title,
      type: selectedRelationType
    }

    onChange([...relationships, newRelationship])
    
    // Reset form
    setSelectedCardId('')
    setSearchQuery('')
    setSelectedRelationType('relates-to')
    setShowAddForm(false)
  }

  const removeRelationship = (indexToRemove: number) => {
    onChange(relationships.filter((_, index) => index !== indexToRemove))
  }

  const getRelationshipColor = (type: Relationship['type']) => {
    switch (type) {
      case 'supports': return 'bg-green-100 text-green-800 border-green-200'
      case 'supported-by': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'relates-to': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'conflicts-with': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRelationshipIcon = (type: Relationship['type']) => {
    switch (type) {
      case 'supports': return '→'
      case 'supported-by': return '←'
      case 'relates-to': return '↔'
      case 'conflicts-with': return '⚡'
      default: return '→'
    }
  }

  return (
    <div className="space-y-3">
      <label className="form-label flex items-center space-x-1">
        <Link2 size={12} className="text-gray-500" />
        <span>Relationships</span>
      </label>

      {/* Existing Relationships */}
      <div className="space-y-2">
        {relationships.map((relationship, index) => (
          <div
            key={`${relationship.id}-${index}`}
            className={`flex items-center justify-between p-3 rounded-lg border ${getRelationshipColor(relationship.type)}`}
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <span className="text-lg" title={relationship.type}>
                {getRelationshipIcon(relationship.type)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium uppercase tracking-wide">
                    {relationship.type?.replace('-', ' ') || 'relates to'}
                  </span>
                </div>
                <p className="text-sm font-medium truncate">
                  {relationship.title}
                </p>
              </div>
            </div>
            <button
              onClick={() => removeRelationship(index)}
              className="p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
              title="Remove relationship"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Add New Relationship */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors text-gray-600"
        >
          <Plus size={16} />
          <span className="text-sm font-medium">Add Relationship</span>
        </button>
      ) : (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
          {/* Relationship Type Selection */}
          <div>
            <label className="form-label">Relationship Type</label>
            <select
              value={selectedRelationType}
              onChange={(e) => setSelectedRelationType(e.target.value as Relationship['type'])}
              className="input input-sm text-black"
            >
              {RELATIONSHIP_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
          </div>

          {/* Card Search */}
          <div>
            <label className="form-label">Search Cards</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for cards to link..."
                className="input input-sm pl-9 text-black"
              />
            </div>
          </div>

          {/* Card Selection */}
          {filteredCards.length > 0 ? (
            <div>
              <label className="form-label">Select Card</label>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md bg-white">
                {filteredCards.map((card) => (
                  <label
                    key={card.id}
                    className="flex items-center space-x-3 p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <input
                      type="radio"
                      name="selectedCard"
                      value={card.id}
                      checked={selectedCardId === card.id}
                      onChange={(e) => setSelectedCardId(e.target.value)}
                      className="text-gray-900 focus:ring-gray-900"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {card.title}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {card.cardType.replace('-', ' ')}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">No cards found</p>
              <p className="text-xs">Try a different search term</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              onClick={() => {
                setShowAddForm(false)
                setSearchQuery('')
                setSelectedCardId('')
              }}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              onClick={addRelationship}
              disabled={!selectedCardId}
              className="btn btn-primary btn-sm"
            >
              Add Relationship
            </button>
          </div>
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        Link this card to other cards to show dependencies and connections
      </p>
    </div>
  )
}
