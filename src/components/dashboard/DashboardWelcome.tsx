'use client'

import { useAuth } from '@/providers/AuthProvider'
import { Bell, Search, Calendar } from 'lucide-react'

export default function DashboardWelcome() {
  const { user } = useAuth()

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
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {user?.email ? getDisplayName(user.email) : 'User'}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Last updated: Vision Statement - 2 hours ago
          </p>
          <p className="text-gray-600">
            Next milestone: MVP Launch Review - 3 days
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="relative p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search strategies, cards, or intelligence..."
              className="pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-80"
            />
          </div>
          
          <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Calendar className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  )
}
