'use client'

import Header from '@/components/Header'
import { ReactNode } from 'react'

interface WorkspaceLayoutProps {
  children: ReactNode
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-16 h-screen flex flex-col">
        {children}
      </div>
    </div>
  )
}
