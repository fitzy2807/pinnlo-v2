'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useAuth } from '@/providers/AuthProvider'
import { ChevronDown, ChevronRight, Mic, X } from 'lucide-react'

export default function LegacyHomePage() {
  const { user } = useAuth()
  const [executiveSummaryOpen, setExecutiveSummaryOpen] = useState(false)
  const [intelligenceHubOpen, setIntelligenceHubOpen] = useState(false)
  const [strategyHubOpen, setStrategyHubOpen] = useState(false)
  const [organisationHubOpen, setOrganisationHubOpen] = useState(false)
  const [developmentHubOpen, setDevelopmentHubOpen] = useState(false)
  const [documentHubOpen, setDocumentHubOpen] = useState(false)
  const [agentHubOpen, setAgentHubOpen] = useState(false)
  const [voiceModalOpen, setVoiceModalOpen] = useState(false)

  // Load ElevenLabs widget script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    document.body.appendChild(script);
    
    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getDisplayName = (email: string) => {
    const name = email.split('@')[0]
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Legacy System Banner */}
      <div className="bg-orange-100 border-b border-orange-200 px-4 py-2 text-center">
        <p className="text-sm text-orange-800">
          <strong>Legacy System:</strong> You are viewing the old interface. 
          <a href="/" className="ml-2 text-orange-600 hover:text-orange-700 underline">
            Switch to new V2 interface
          </a>
        </p>
      </div>
      
      <Header />
      <main className="pt-16 p-4">
        <div className="w-[90%] h-[90vh] mx-auto bg-white rounded-xl shadow-lg p-8 flex">
          {/* Main Content Area */}
          <div className="flex-1 pr-6">
            {/* Welcome Message */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-normal text-gray-900 tracking-tight" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                {getGreeting()}, {user?.email ? getDisplayName(user.email) : 'User'}! 👋
              </h1>
            </div>

            {/* Voice Intelligence Capture Section */}
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl shadow-sm border border-teal-200 p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-teal-500 rounded-lg">
                    <Mic className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-teal-800 mb-1" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                      Voice Intelligence Capture
                    </h3>
                    <p className="text-sm text-teal-700" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                      Speak your insights and AI will create intelligence cards instantly
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setVoiceModalOpen(true)}
                  className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                  style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}
                >
                  Start Voice Capture
                </button>
              </div>
            </div>
            
            {/* Hub Overview Row */}
            <div className="grid grid-cols-6 gap-3 mb-8">
              {/* Intelligence Hub */}
              <div className="bg-blue-50 rounded-lg shadow-sm p-3 border border-blue-100">
                <h3 className="text-xs font-bold text-blue-800 mb-1" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Intelligence Hub
                </h3>
                <p className="text-[10px] text-blue-600 mb-2" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  23 cards
                </p>
                <div className="text-[10px] text-blue-700" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Quality: 8/10
                </div>
              </div>

              {/* Strategy Hub */}
              <div className="bg-purple-50 rounded-lg shadow-sm p-3 border border-purple-100">
                <h3 className="text-xs font-bold text-purple-800 mb-1" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Strategy Hub
                </h3>
                <p className="text-[10px] text-purple-600 mb-2" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  15 cards
                </p>
                <div className="text-[10px] text-purple-700" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Quality: 6/10
                </div>
              </div>

              {/* Organisation Hub */}
              <div className="bg-green-50 rounded-lg shadow-sm p-3 border border-green-100">
                <h3 className="text-xs font-bold text-green-800 mb-1" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Organisation Hub
                </h3>
                <p className="text-[10px] text-green-600 mb-2" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  11 cards
                </p>
                <div className="text-[10px] text-green-700" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Quality: 7/10
                </div>
              </div>

              {/* Development Hub */}
              <div className="bg-orange-50 rounded-lg shadow-sm p-3 border border-orange-100">
                <h3 className="text-xs font-bold text-orange-800 mb-1" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Development Hub
                </h3>
                <p className="text-[10px] text-orange-600 mb-2" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  34 cards
                </p>
                <div className="text-[10px] text-orange-700" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Quality: 4/10
                </div>
              </div>

              {/* Document Hub */}
              <div className="bg-gray-50 rounded-lg shadow-sm p-3 border border-gray-100">
                <h3 className="text-xs font-bold text-gray-800 mb-1" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Document Hub
                </h3>
                <p className="text-[10px] text-gray-600 mb-2" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  18 cards
                </p>
                <div className="text-[10px] text-gray-700" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Quality: 9/10
                </div>
              </div>

              {/* Agent Hub */}
              <div className="bg-red-50 rounded-lg shadow-sm p-3 border border-red-100">
                <h3 className="text-xs font-bold text-red-800 mb-1" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Agent Hub
                </h3>
                <p className="text-[10px] text-red-600 mb-2" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  7 cards
                </p>
                <div className="text-[10px] text-red-700" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Quality: 5/10
                </div>
              </div>
            </div>

            {/* Rest of the legacy content would go here - truncated for brevity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
              <p className="text-gray-600">Legacy interface content...</p>
              <p className="text-sm text-gray-500 mt-2">
                Switch to the new V2 interface for the full experience with enhanced navigation and features.
              </p>
            </div>
          </div>

          {/* PINNLO Actions Modal */}
          <div className="w-1/4 bg-gray-50 rounded-xl shadow-md p-4 overflow-y-auto">
            <h2 className="text-base font-medium text-gray-900 mb-4 text-center" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
              PINNLO Actions (Legacy)
            </h2>
            <div className="text-center text-gray-500 text-sm">
              <p>Legacy actions panel</p>
            </div>
          </div>
        </div>
      </main>

      {/* Voice Intelligence Modal */}
      {voiceModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <Mic className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Voice Intelligence Assistant (Legacy)</h2>
                    <p className="text-teal-100 text-sm">Powered by ElevenLabs AI</p>
                  </div>
                </div>
                <button
                  onClick={() => setVoiceModalOpen(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Widget Container */}
            <div className="p-6 bg-gray-50 min-h-[400px] flex flex-col">
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p>Legacy voice interface</p>
                  <p className="text-sm mt-2">Switch to V2 for full voice capabilities</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}