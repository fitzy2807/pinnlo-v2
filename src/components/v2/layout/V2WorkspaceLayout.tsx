'use client'

import { useState } from 'react'
import LeftNavigation from './LeftNavigation'
import MiddleWorkspace from './MiddleWorkspace'
import RightToolsPanel from './RightToolsPanel'

interface V2WorkspaceLayoutProps {
  strategy: any
}

export default function V2WorkspaceLayout({ strategy }: V2WorkspaceLayoutProps) {
  const [selectedHub, setSelectedHub] = useState('strategy')
  const [selectedSection, setSelectedSection] = useState('strategicContext')
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [showToolOverlay, setShowToolOverlay] = useState(false)
  const [selectedTool, setSelectedTool] = useState<string | null>(null)

  const handleHubChange = (hubId: string) => {
    setSelectedHub(hubId)
    // Reset section when hub changes
    const defaultSections = {
      'intelligence': 'market',
      'strategy': 'strategicContext',
      'development': 'features',
      'organization': 'team',
      'document': 'templates',
      'agent': 'cardCreator'
    }
    setSelectedSection(defaultSections[hubId as keyof typeof defaultSections] || 'strategicContext')
    setSelectedCard(null)
  }

  const handleSectionChange = (sectionId: string) => {
    setSelectedSection(sectionId)
    setSelectedCard(null)
  }

  const handleCardSelect = (cardId: string) => {
    setSelectedCard(cardId)
  }

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId)
    setShowToolOverlay(true)
  }

  const handleCloseToolOverlay = () => {
    setShowToolOverlay(false)
    setSelectedTool(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Navigation - 20% */}
      <div className="w-1/5 bg-white border-r border-gray-200 flex flex-col">
        <LeftNavigation
          selectedHub={selectedHub}
          selectedSection={selectedSection}
          onHubChange={handleHubChange}
          onSectionChange={handleSectionChange}
          strategy={strategy}
        />
      </div>

      {/* Middle Workspace - 60% */}
      <div className="flex-1 flex flex-col">
        <MiddleWorkspace
          selectedHub={selectedHub}
          selectedSection={selectedSection}
          selectedCard={selectedCard}
          onCardSelect={handleCardSelect}
          strategy={strategy}
        />
      </div>

      {/* Right Tools Panel - 20% */}
      <div className="w-1/5 bg-white border-l border-gray-200">
        <RightToolsPanel
          selectedHub={selectedHub}
          selectedSection={selectedSection}
          onToolSelect={handleToolSelect}
          strategy={strategy}
        />
      </div>

      {/* Tool Overlay - 30% width sliding from right */}
      {showToolOverlay && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-50"
          onClick={handleCloseToolOverlay}
        >
          <div 
            className="absolute right-0 top-0 h-full w-[30%] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedTool ? selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1) : 'Tool'}
                </h2>
                <button
                  onClick={handleCloseToolOverlay}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="text-gray-600">
                <p>Tool functionality will be implemented here.</p>
                <p className="mt-2 text-sm">Selected tool: {selectedTool}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}