'use client'

import StrategiesGrid from './StrategiesGrid'

interface MainContentContainerProps {
  strategiesHook: ReturnType<typeof import('@/hooks/useStrategies').useStrategies>
}

export default function MainContentContainer({ strategiesHook }: MainContentContainerProps) {
  return (
    <div className="bg-white rounded-xl border border-secondary-200 p-8">
      <div className="mb-6">
        <h2 className="text-h2 mb-2">Your Strategies</h2>
        <p className="text-body">
          Manage and organize your strategic initiatives
        </p>
      </div>
      
      <StrategiesGrid strategiesHook={strategiesHook} />
    </div>
  )
}