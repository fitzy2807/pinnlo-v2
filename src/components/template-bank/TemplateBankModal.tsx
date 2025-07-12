'use client'

import React from 'react'
import { X } from 'lucide-react'
import TemplateBank from './TemplateBank'

interface TemplateBankModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TemplateBankModal({ isOpen, onClose }: TemplateBankModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      
      {/* Modal */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-7xl max-h-[90vh] overflow-hidden">
          {/* Content */}
          <div className="w-full h-full">
            <TemplateBank onClose={onClose} />
          </div>
        </div>
      </div>
    </div>
  )
}
