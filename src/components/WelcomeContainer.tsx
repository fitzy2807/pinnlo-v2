'use client'

import { useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { Search, Plus } from 'lucide-react'
import CreateStrategyModal from './CreateStrategyModal'

interface WelcomeContainerProps {
  strategiesHook: ReturnType<typeof import('@/hooks/useStrategies').useStrategies>
}

export default function WelcomeContainer({ strategiesHook }: WelcomeContainerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
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
    <>
      <div className="bg-white rounded-xl border border-secondary-200 p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left: Greeting and Description */}
          <div className="flex-1">
            <h1 className="text-h1 mb-3">
              {getGreeting()}, {user ? getDisplayName(user.email || '') : 'there'}!
            </h1>
            <p className="text-body max-w-2xl">
              Quickly access your strategies, or create a new strategy to begin working on
            </p>
          </div>

          {/* Right: Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 lg:min-w-96">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
              <input
                type="text"
                placeholder="Search strategies..."
                className="input pl-10"
              />
            </div>

            {/* Create Strategy Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary btn-md flex items-center space-x-2 whitespace-nowrap"
            >
              <Plus size={20} />
              <span>Create New Strategy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Create Strategy Modal */}
      {showCreateModal && (
        <CreateStrategyModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </>
  )
}