'use client'

import { Plus } from 'lucide-react'

interface CreateStrategyButtonProps {
  onClick: () => void
}

export default function CreateStrategyButton({ onClick }: CreateStrategyButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center space-x-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm hover:shadow-md"
    >
      <Plus className="w-5 h-5" />
      <span className="font-medium">Create Strategy</span>
    </button>
  )
}