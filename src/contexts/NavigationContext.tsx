'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface NavigationContextType {
  currentHub: string
  currentSection: string
  selectedPage: any | null
  setCurrentHub: (hub: string) => void
  setCurrentSection: (section: string) => void
  setSelectedPage: (page: any | null) => void
  navigateTo: (hub: string, section?: string) => void
  resetNavigation: () => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

interface NavigationProviderProps {
  children: ReactNode
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [currentHub, setCurrentHub] = useState('home')
  const [currentSection, setCurrentSection] = useState('default')
  const [selectedPage, setSelectedPage] = useState<any | null>(null)

  // Persist navigation state
  useEffect(() => {
    sessionStorage.setItem('pinnlo_navigation', JSON.stringify({
      hub: currentHub,
      section: currentSection
    }))
  }, [currentHub, currentSection])

  // Restore navigation state on load
  useEffect(() => {
    const stored = sessionStorage.getItem('pinnlo_navigation')
    if (stored) {
      try {
        const { hub, section } = JSON.parse(stored)
        setCurrentHub(hub || 'home')
        setCurrentSection(section || 'default')
      } catch (e) {
        console.warn('Failed to restore navigation state:', e)
      }
    }
  }, [])

  // Clear selected page when navigation changes
  useEffect(() => {
    setSelectedPage(null)
  }, [currentHub, currentSection])

  const navigateTo = (hub: string, section?: string) => {
    setCurrentHub(hub)
    setCurrentSection(section || 'default')
  }

  const resetNavigation = () => {
    setCurrentHub('home')
    setCurrentSection('default')
    setSelectedPage(null)
  }

  const value = {
    currentHub,
    currentSection,
    selectedPage,
    setCurrentHub,
    setCurrentSection,
    setSelectedPage,
    navigateTo,
    resetNavigation
  }

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}