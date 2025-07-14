'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CatalystDemoSimple() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Pinnlo
              </Link>
            </div>
            <h1 className="text-lg font-semibold">Catalyst UI Kit Demo (Simple)</h1>
            <div className="w-24" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Catalyst Components Available</h2>
          <p className="text-gray-600 mb-6">
            The Catalyst UI Kit is successfully installed. Due to a temporary compatibility issue, 
            please view the components directly in the catalyst-ui-kit folder or visit the official documentation.
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Available Components:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Alert - Notification messages</li>
                <li>Avatar - User profile images</li>
                <li>Badge - Status indicators</li>
                <li>Button - Interactive buttons</li>
                <li>Checkbox - Form checkboxes</li>
                <li>Combobox - Autocomplete inputs</li>
                <li>Dialog - Modal dialogs</li>
                <li>Dropdown - Menu dropdowns</li>
                <li>Input - Form inputs</li>
                <li>Select - Dropdown selects</li>
                <li>Table - Data tables</li>
                <li>And many more...</li>
              </ul>
            </div>
            
            <div className="pt-4">
              <a 
                href="https://catalyst.tailwindui.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                View Official Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}