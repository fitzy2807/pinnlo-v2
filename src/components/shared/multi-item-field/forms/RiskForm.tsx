'use client'

import React, { useCallback } from 'react'
import { PRDRisk, CreatePRDRisk } from '@/types/prd-multi-item'

interface RiskFormProps {
  item: PRDRisk | CreatePRDRisk
  onChange: (item: PRDRisk | CreatePRDRisk) => void
  aiContext?: string
}

export default function RiskForm({ item, onChange, aiContext }: RiskFormProps) {
  const handleFieldChange = useCallback((field: keyof PRDRisk, value: any) => {
    onChange({
      ...item,
      [field]: value
    })
  }, [item, onChange])

  // Calculate risk score for display
  const getRiskScore = () => {
    const impactScore = item.impact_level === 'high' ? 3 : item.impact_level === 'medium' ? 2 : 1
    const probScore = item.probability === 'high' ? 3 : item.probability === 'medium' ? 2 : 1
    return impactScore * probScore
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 6) return 'text-red-600 bg-red-50'
    if (score >= 4) return 'text-orange-600 bg-orange-50'
    return 'text-green-600 bg-green-50'
  }

  const getRiskScoreLabel = (score: number) => {
    if (score >= 6) return 'High Risk'
    if (score >= 4) return 'Medium Risk'
    return 'Low Risk'
  }

  const riskScore = getRiskScore()

  return (
    <div className="space-y-4">
      {/* Risk Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Risk Title *
        </label>
        <input
          type="text"
          value={item.risk_title || ''}
          onChange={(e) => handleFieldChange('risk_title', e.target.value)}
          placeholder="Brief, clear title for the risk"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Risk Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Risk Description *
        </label>
        <textarea
          value={item.risk_description || ''}
          onChange={(e) => handleFieldChange('risk_description', e.target.value)}
          placeholder="Detailed description of the risk and its potential consequences..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Impact Level and Probability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Impact Level
          </label>
          <select
            value={item.impact_level || 'medium'}
            onChange={(e) => handleFieldChange('impact_level', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Probability
          </label>
          <select
            value={item.probability || 'medium'}
            onChange={(e) => handleFieldChange('probability', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* Risk Score Display */}
      <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Risk Score:</span>
          <span className={`px-2 py-1 text-xs rounded-full ${getRiskScoreColor(riskScore)}`}>
            {riskScore}/9 - {getRiskScoreLabel(riskScore)}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Score = Impact ({item.impact_level}) × Probability ({item.probability})
        </p>
      </div>

      {/* Mitigation Strategy */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mitigation Strategy *
        </label>
        <textarea
          value={item.mitigation_strategy || ''}
          onChange={(e) => handleFieldChange('mitigation_strategy', e.target.value)}
          placeholder="Detailed plan for how to mitigate or address this risk..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Mitigation Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mitigation Status
        </label>
        <select
          value={item.mitigation_status || 'planned'}
          onChange={(e) => handleFieldChange('mitigation_status', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="planned">Planned</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Owner and Due Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Owner (optional)
          </label>
          <input
            type="text"
            value={item.owner || ''}
            onChange={(e) => handleFieldChange('owner', e.target.value)}
            placeholder="Person responsible for mitigation"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date (optional)
          </label>
          <input
            type="date"
            value={item.due_date || ''}
            onChange={(e) => handleFieldChange('due_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  )
}