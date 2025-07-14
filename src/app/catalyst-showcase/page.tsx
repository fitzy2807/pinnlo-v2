'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, ChevronDown, X, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react'

export default function CatalystShowcase() {
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedValue, setSelectedValue] = useState('option1')
  const [switchOn, setSwitchOn] = useState(false)
  const [checkboxChecked, setCheckboxChecked] = useState(false)

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
            <h1 className="text-lg font-semibold">Catalyst UI Kit Showcase</h1>
            <div className="w-24" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12">
          
          {/* Typography Section */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Typography</h2>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold">Heading 1</h1>
              <h2 className="text-3xl font-semibold">Heading 2</h2>
              <h3 className="text-2xl font-medium">Heading 3</h3>
              <p className="text-base text-gray-700">
                This is body text with a <a href="#" className="text-blue-600 hover:underline">link</a> and 
                some <strong className="font-semibold">strong text</strong> and <code className="px-1 py-0.5 bg-gray-100 rounded text-sm">inline code</code>.
              </p>
              <p className="text-sm text-gray-600">Small text for captions and secondary information.</p>
            </div>
          </section>

          {/* Buttons Section */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Buttons</h2>
            <div className="flex flex-wrap gap-4">
              {/* Primary Button */}
              <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm">
                Primary Button
              </button>
              
              {/* Blue Button */}
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                Blue Button
              </button>
              
              {/* Secondary Button */}
              <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
                Secondary Button
              </button>
              
              {/* Ghost Button */}
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm">
                Ghost Button
              </button>
              
              {/* Disabled Button */}
              <button className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-medium text-sm" disabled>
                Disabled
              </button>
            </div>
          </section>

          {/* Badges Section */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Badges</h2>
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                Default
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                Blue
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Green
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                Yellow
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                Red
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                Purple
              </span>
            </div>
          </section>

          {/* Alerts Section */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Alerts</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <strong className="font-medium">Information:</strong> This is an informational alert message.
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800">
                  <strong className="font-medium">Success:</strong> Your action was completed successfully.
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <strong className="font-medium">Warning:</strong> Please review this important information.
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <strong className="font-medium">Error:</strong> Something went wrong. Please try again.
                </div>
              </div>
            </div>
          </section>

          {/* Form Controls Section */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Form Controls</h2>
            
            <div className="space-y-6 max-w-xl">
              {/* Input Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text Input
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Enter text..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Input
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invalid Input
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  defaultValue="Invalid value"
                />
                <p className="mt-1 text-xs text-red-600">This field has an error</p>
              </div>

              {/* Textarea */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Textarea
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  rows={3}
                  placeholder="Enter description..."
                />
              </div>

              {/* Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                  <option value="">Choose an option</option>
                  <option value="1">Option 1</option>
                  <option value="2">Option 2</option>
                  <option value="3">Option 3</option>
                </select>
              </div>

              {/* Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="checkbox"
                  checked={checkboxChecked}
                  onChange={(e) => setCheckboxChecked(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="checkbox" className="ml-2 text-sm text-gray-700">
                  I agree to the terms and conditions
                </label>
              </div>

              {/* Radio Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Radio Group
                </label>
                <div className="space-y-2">
                  {['option1', 'option2', 'option3'].map((value) => (
                    <div key={value} className="flex items-center">
                      <input
                        type="radio"
                        id={value}
                        name="radio-group"
                        value={value}
                        checked={selectedValue === value}
                        onChange={(e) => setSelectedValue(e.target.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor={value} className="ml-2 text-sm text-gray-700">
                        Option {value.slice(-1)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Switch */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Enable notifications
                </label>
                <button
                  onClick={() => setSwitchOn(!switchOn)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    switchOn ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      switchOn ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Dropdown Section */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Dropdown Menu</h2>
            <div className="relative inline-block">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Options
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showDropdown && (
                <div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="py-1">
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">View</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit</a>
                    <hr className="my-1 border-gray-200" />
                    <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Delete</a>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Table Section */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Table</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">John Doe</td>
                    <td className="px-6 py-4 text-sm text-gray-500">john@example.com</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Developer</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Active
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Jane Smith</td>
                    <td className="px-6 py-4 text-sm text-gray-500">jane@example.com</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Designer</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Active
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Bob Johnson</td>
                    <td className="px-6 py-4 text-sm text-gray-500">bob@example.com</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Manager</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        Inactive
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Avatar Section */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-6">Avatars</h2>
            <div className="flex items-center gap-4">
              {/* Avatar with image */}
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
                JD
              </div>
              
              {/* Avatar with initials */}
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-sm font-medium text-white">
                JS
              </div>
              
              {/* Avatar group */}
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600 ring-2 ring-white">
                  JD
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-sm font-medium text-white ring-2 ring-white">
                  JS
                </div>
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-sm font-medium text-white ring-2 ring-white">
                  BJ
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600 ring-2 ring-white">
                  +3
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}