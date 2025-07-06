'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Plus, Tag } from 'lucide-react'

interface TagEditorProps {
  tags: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
}

// Popular tag suggestions for autocomplete
const POPULAR_TAGS = [
  'Market Research', 'Competitive Analysis', 'Strategic Planning', 'Customer Research',
  'User Experience', 'Product Strategy', 'Business Model', 'Revenue Strategy',
  'Technology', 'Innovation', 'Risk Management', 'Financial Analysis',
  'Operations', 'Marketing', 'Sales', 'Partnership', 'Growth Strategy',
  'Digital Transformation', 'AI/ML', 'Data Analysis', 'Automation',
  'Regulatory', 'Compliance', 'Security', 'Performance', 'Metrics',
  'Team Development', 'Process Improvement', 'Quality Assurance'
]

export default function TagEditor({ tags, onChange, suggestions = POPULAR_TAGS }: TagEditorProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = suggestions.filter(
        suggestion => 
          suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
          !tags.includes(suggestion)
      )
      setFilteredSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setFilteredSuggestions([])
      setShowSuggestions(false)
    }
    setSelectedSuggestionIndex(-1)
  }, [inputValue, tags, suggestions])

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag])
    }
    setInputValue('')
    setShowSuggestions(false)
  }

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, index) => index !== indexToRemove))
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedSuggestionIndex >= 0 && filteredSuggestions[selectedSuggestionIndex]) {
        addTag(filteredSuggestions[selectedSuggestionIndex])
      } else if (inputValue.trim()) {
        addTag(inputValue)
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedSuggestionIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSelectedSuggestionIndex(-1)
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag if input is empty and backspace is pressed
      removeTag(tags.length - 1)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion)
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      <label className="form-label flex items-center space-x-1">
        <Tag size={12} className="text-gray-500" />
        <span>Tags</span>
      </label>
      
      {/* Tag Display Area */}
      <div className="min-h-[80px] p-3 border border-gray-300 rounded-md bg-white focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent transition-all">
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium"
            >
              <span>{tag}</span>
              <button
                onClick={() => removeTag(index)}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                title="Remove tag"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        
        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          onFocus={() => inputValue && setShowSuggestions(filteredSuggestions.length > 0)}
          placeholder={tags.length === 0 ? "Type to add tags..." : "Add another tag..."}
          className="w-full text-xs bg-transparent border-none outline-none placeholder-gray-400"
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filteredSuggestions.length > 0 ? (
            <>
              <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100">
                Suggested Tags
              </div>
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 transition-colors ${
                    index === selectedSuggestionIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Plus size={10} className="text-gray-400" />
                    <span>{suggestion}</span>
                  </div>
                </button>
              ))}
            </>
          ) : (
            <div className="px-3 py-2 text-xs text-gray-500">
              No matching tags found
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500 mt-1">
        Press Enter to add tags • Use arrow keys to navigate suggestions
      </p>
    </div>
  )
}
