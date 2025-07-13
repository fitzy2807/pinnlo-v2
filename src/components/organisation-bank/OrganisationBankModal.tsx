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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      
      {/* Modal */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <OrganisationBank onClose={onClose} />
          </div>
        </div>
      </div>
    </div>
  )
}
