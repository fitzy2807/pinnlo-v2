'use client'

import React from 'react'
import { X } from 'lucide-react'
import OrganisationBank from './OrganisationBank'

interface OrganisationBankModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function OrganisationBankModal({ isOpen, onClose }: OrganisationBankModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full h-full max-w-7xl max-h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col mx-4 my-4">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Organisation Hub</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <OrganisationBank onClose={onClose} />
        </div>
      </div>
    </div>
  )
}
