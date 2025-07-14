/**
 * Automation Agent
 * 
 * Agent for creating and managing automated intelligence card generation rules
 */

'use client'

import React, { useState } from 'react'
import {
  X,
  Zap,
  Plus,
  Clock,
  Target,
  TrendingUp,
  Edit,
  Trash2,
  Play,
  Pause,
  History,
  AlertCircle,
  CheckCircle,
  Settings,
  Sparkles,
  ArrowLeft
} from 'lucide-react'
import { useAutomationRules } from '@/hooks/useAutomationRules'
import { useAutomationExecutions } from '@/hooks/useAutomationExecutions'
import AutomationRuleEditor from '@/components/intelligence/AutomationRuleEditor'
import { toast } from 'react-hot-toast'

interface AutomationAgentProps {
  onClose: () => void
  configuration?: {
    hubContext?: string
    onCardsCreated?: (cards: any[]) => void
  }
}

export default function AutomationAgent({ onClose, configuration }: AutomationAgentProps) {
  const { rules, loading, error, createRule, updateRule, deleteRule, executeRule } = useAutomationRules()
  const { executions, stats } = useAutomationExecutions({ limit: 10 })
  const [showEditor, setShowEditor] = useState(false)
  const [editingRule, setEditingRule] = useState<any>(null)
  const [executingRuleId, setExecutingRuleId] = useState<string | null>(null)
  const [view, setView] = useState<'dashboard' | 'rules' | 'history'>('dashboard')

  const handleCreateRule = () => {
    setEditingRule(null)
    setShowEditor(true)
  }

  const handleEditRule = (rule: any) => {
    setEditingRule(rule)
    setShowEditor(true)
  }

  const handleSaveRule = async (ruleData: any) => {
    const result = editingRule 
      ? await updateRule(editingRule.id, ruleData)
      : await createRule(ruleData)
    
    if (result.success) {
      setShowEditor(false)
      setEditingRule(null)
      toast.success(editingRule ? 'Rule updated successfully' : 'Rule created successfully')
    } else {
      toast.error('Failed to save rule: ' + result.error)
    }
  }

  const handleDeleteRule = async (ruleId: string) => {
    if (confirm('Are you sure you want to delete this automation rule?')) {
      const result = await deleteRule(ruleId)
      if (result.success) {
        toast.success('Rule deleted successfully')
      } else {
        toast.error('Failed to delete rule: ' + result.error)
      }
    }
  }

  const handleExecuteRule = async (ruleId: string) => {
    setExecutingRuleId(ruleId)
    const result = await executeRule(ruleId)
    setExecutingRuleId(null)
    
    if (result.success) {
      toast.success(`Successfully generated ${result.cardsCreated || 0} intelligence cards`)
      if (configuration?.onCardsCreated && result.cardsCreated > 0) {
        // Notify parent component about new cards
        configuration.onCardsCreated([])
      }
    } else {
      toast.error('Failed to execute rule: ' + result.error)
    }
  }

  const handleToggleRule = async (rule: any) => {
    const result = await updateRule(rule.id, { 
      automation_enabled: !rule.automation_enabled 
    })
    if (result.success) {
      toast.success(rule.automation_enabled ? 'Rule paused' : 'Rule activated')
    } else {
      toast.error('Failed to toggle rule: ' + result.error)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
            <span>Loading automation...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-medium text-gray-900">Automation Agent</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* View Tabs */}
        <div className="mt-4 flex space-x-1">
          <button
            onClick={() => setView('dashboard')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              view === 'dashboard'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setView('rules')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              view === 'rules'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Rules
          </button>
          <button
            onClick={() => setView('history')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              view === 'history'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {view === 'dashboard' ? (
          <div className="p-6">
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Automatically generate intelligence cards on schedule using AI-powered rules
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Active Rules</p>
                    <p className="text-2xl font-bold text-blue-900">{rules.filter(r => r.automation_enabled).length}</p>
                  </div>
                  <Zap className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Cards Created</p>
                    <p className="text-2xl font-bold text-green-900">{stats.totalCardsCreated}</p>
                  </div>
                  <Sparkles className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-yellow-600 uppercase tracking-wide">Executions</p>
                    <p className="text-2xl font-bold text-yellow-900">{stats.total}</p>
                  </div>
                  <History className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Tokens Used</p>
                    <p className="text-2xl font-bold text-purple-900">{stats.totalTokensUsed.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleCreateRule}
                  className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Create New Rule</div>
                    <div className="text-xs text-gray-500">Set up automated intelligence generation</div>
                  </div>
                </button>
                
                <button
                  onClick={() => setView('rules')}
                  className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Manage Rules</div>
                    <div className="text-xs text-gray-500">View and edit existing automation rules</div>
                  </div>
                </button>
                
                <button
                  onClick={() => setView('history')}
                  className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <History className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">View History</div>
                    <div className="text-xs text-gray-500">Check recent automation executions</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : view === 'rules' ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Automation Rules</h3>
              <button
                onClick={handleCreateRule}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Rule</span>
              </button>
            </div>

            {rules.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-4">No automation rules yet</p>
                <button
                  onClick={handleCreateRule}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Your First Rule</span>
                </button>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rule Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categories
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Schedule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Next Run
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rules.map((rule) => (
                      <tr key={rule.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                            {rule.description && (
                              <div className="text-xs text-gray-500">{rule.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {rule.intelligence_categories.map((cat: string) => (
                              <span
                                key={cat}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Clock className="w-4 h-4 mr-1 text-gray-400" />
                            {rule.schedule_frequency}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleRule(rule)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              rule.automation_enabled
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {rule.automation_enabled ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <Pause className="w-3 h-3 mr-1" />
                                Paused
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {rule.automation_enabled && rule.next_run_at
                            ? new Date(rule.next_run_at).toLocaleString()
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleExecuteRule(rule.id)}
                              disabled={executingRuleId === rule.id}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                              title="Run now"
                            >
                              {executingRuleId === rule.id ? (
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleEditRule(rule)}
                              className="text-gray-600 hover:text-gray-900"
                              title="Edit rule"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRule(rule.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete rule"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Executions</h3>
            {executions.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <History className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No executions yet</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trigger
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cards Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Started At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {executions.map((execution) => {
                      const rule = rules.find(r => r.id === execution.rule_id)
                      return (
                        <tr key={execution.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {rule?.name || 'Unknown Rule'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {execution.trigger_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              execution.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : execution.status === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : execution.status === 'running'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {execution.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {execution.cards_created}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(execution.started_at).toLocaleString()}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rule Editor Modal */}
      {showEditor && (
        <AutomationRuleEditor
          rule={editingRule}
          onSave={handleSaveRule}
          onCancel={() => {
            setShowEditor(false)
            setEditingRule(null)
          }}
        />
      )}
    </div>
  )
}