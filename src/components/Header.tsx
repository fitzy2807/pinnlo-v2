'use client'

import { useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { ChevronDown, Home, BarChart3, Building2, Database, Settings, Sparkles, Brain, Layout, Layers } from 'lucide-react'
import DevelopmentBankModal from '@/components/development-bank-v2/DevelopmentBankModal'
import DevelopmentBankModalV1 from '@/components/development-bank/DevelopmentBankModal'
import StrategyBankModal from '@/components/strategy-bank/StrategyBankModal'
import IntelligenceBank from '@/components/intelligence-bank/IntelligenceBank'
import OrganisationBankModal from '@/components/organisation-bank/OrganisationBankModal'

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [developmentBankOpen, setDevelopmentBankOpen] = useState(false)
  const [developmentBank2Open, setDevelopmentBank2Open] = useState(false)
  const [strategyBankOpen, setStrategyBankOpen] = useState(false)
  const [intelligenceBankOpen, setIntelligenceBankOpen] = useState(false)
  const [organisationBankOpen, setOrganisationBankOpen] = useState(false)
  const { user, signOut } = useAuth()

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  const handleSignOut = async () => {
    await signOut()
    setDropdownOpen(false)
  }

  return (
    <header className="header fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between px-6 h-full">
        {/* Left: Logo and Navigation */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-white">PINNLO</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-4">
            <a 
              href="/" 
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-white hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              <Home size={14} />
              <span className="text-xs font-medium">Dashboard</span>
            </a>
            <button
              onClick={() => setIntelligenceBankOpen(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-white hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              <Brain size={14} />
              <span className="text-xs font-medium">Intelligence Bank</span>
            </button>
            <button
              onClick={() => setStrategyBankOpen(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-white hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              <Layers size={14} />
              <span className="text-xs font-medium">Strategy Bank</span>
            </button>
            <button
              onClick={() => setDevelopmentBankOpen(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-white hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              <Building2 size={14} />
              <span className="text-xs font-medium">Development Bank</span>
            </button>
            <button
              onClick={() => setDevelopmentBank2Open(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-white hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              <Database size={14} />
              <span className="text-xs font-medium">Dev Bank v2</span>
            </button>
            <button
              onClick={() => setOrganisationBankOpen(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-white hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              <Building2 size={14} />
              <span className="text-xs font-medium">Organisation Bank</span>
            </button>
          </nav>
        </div>

        {/* Right: User Menu */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 px-2.5 py-1.5 rounded-md hover:bg-white hover:bg-opacity-10 transition-colors focus-ring"
              >
                <div className="w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  {getInitials(user.email || 'U')}
                </div>
                <span className="hidden md:block text-xs text-white">
                  {user.email}
                </span>
                <ChevronDown 
                  size={14} 
                  className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} 
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1.5 z-50">
                  <div className="px-3 py-2 border-b border-gray-200">
                    <p className="text-xs font-medium text-gray-900">{user.email}</p>
                    <p className="text-xs text-gray-500">ID: {user.id}</p>
                  </div>
                  
                  <div className="py-1">
                    <button className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                      Profile Settings
                    </button>
                    <button className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                      Account Settings
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <a
              href="/auth/login"
              className="btn btn-primary btn-sm"
            >
              Sign In
            </a>
          )}
        </div>
      </div>
      
      {/* Development Bank V1 Modal */}
      <DevelopmentBankModalV1
        isOpen={developmentBankOpen}
        onClose={() => setDevelopmentBankOpen(false)}
      />
      
      {/* Development Bank V2 Modal */}
      <DevelopmentBankModal
        isOpen={developmentBank2Open}
        onClose={() => setDevelopmentBank2Open(false)}
      />
      

      {/* Strategy Bank Modal */}
      <StrategyBankModal
        isOpen={strategyBankOpen}
        onClose={() => setStrategyBankOpen(false)}
      />
      
      {/* Intelligence Bank Modal */}
      <IntelligenceBank
        isOpen={intelligenceBankOpen}
        onClose={() => setIntelligenceBankOpen(false)}
      />
      
      {/* Organisation Bank Modal */}
      <OrganisationBankModal
        isOpen={organisationBankOpen}
        onClose={() => setOrganisationBankOpen(false)}
      />
    </header>
  )
}
