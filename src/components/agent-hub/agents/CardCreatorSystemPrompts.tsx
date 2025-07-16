'use client'

import React, { useState, useEffect } from 'react'
import { FileText, Code, Edit2, Save, X, Plus, Trash2, Search, Filter } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

interface SystemPrompt {
  id: string
  prompt_type: 'blueprint' | 'intelligence' | 'development'
  section_id: string
  display_name: string
  description?: string
  preview_prompt: string
  generation_prompt: string
  config: {
    max_tokens?: number
    chunk_size?: number
    temperature?: number
  }
  created_at: string
  updated_at: string
}

export default function CardCreatorSystemPrompts() {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<'all' | 'blueprint' | 'intelligence' | 'development'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingPrompt, setEditingPrompt] = useState<SystemPrompt | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newPrompt, setNewPrompt] = useState({
    prompt_type: 'blueprint' as const,
    section_id: '',
    display_name: '',
    description: '',
    preview_prompt: '',
    generation_prompt: '',
    config: {
      max_tokens: 4000,
      chunk_size: 5,
      temperature: 0.7
    }
  })

  useEffect(() => {
    loadPrompts()
  }, [])

  const loadPrompts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('card_creator_system_prompts')
        .select('*')
        .order('prompt_type')
        .order('display_name')

      if (error) throw error
      setPrompts(data || [])
    } catch (error) {
      console.error('Error loading prompts:', error)
      toast.error('Failed to load system prompts')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (prompt: SystemPrompt) => {
    try {
      const { error } = await supabase
        .from('card_creator_system_prompts')
        .update({
          preview_prompt: prompt.preview_prompt,
          generation_prompt: prompt.generation_prompt,
          description: prompt.description,
          config: prompt.config,
          updated_at: new Date().toISOString()
        })
        .eq('id', prompt.id)

      if (error) throw error
      
      toast.success('Prompt saved successfully')
      setEditingPrompt(null)
      loadPrompts()
    } catch (error) {
      console.error('Error saving prompt:', error)
      toast.error('Failed to save prompt')
    }
  }

  const handleCreate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('card_creator_system_prompts')
        .insert({
          ...newPrompt,
          created_by: user.id
        })

      if (error) throw error
      
      toast.success('Prompt created successfully')
      setShowCreateForm(false)
      setNewPrompt({
        prompt_type: 'blueprint',
        section_id: '',
        display_name: '',
        description: '',
        preview_prompt: '',
        generation_prompt: '',
        config: {
          max_tokens: 4000,
          chunk_size: 5,
          temperature: 0.7
        }
      })
      loadPrompts()
    } catch (error) {
      console.error('Error creating prompt:', error)
      toast.error('Failed to create prompt')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return

    try {
      const { error } = await supabase
        .from('card_creator_system_prompts')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      toast.success('Prompt deleted successfully')
      loadPrompts()
    } catch (error) {
      console.error('Error deleting prompt:', error)
      toast.error('Failed to delete prompt')
    }
  }

  const filteredPrompts = prompts.filter(prompt => {
    if (selectedType !== 'all' && prompt.prompt_type !== selectedType) return false
    if (searchQuery && !prompt.display_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !prompt.section_id.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'blueprint': return 'bg-blue-100 text-blue-800'
      case 'intelligence': return 'bg-green-100 text-green-800'
      case 'development': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-gray-500">Loading system prompts...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Card Creator System Prompts</h2>
        <p className="text-sm text-gray-600">
          Manage system prompts for preview and generation of cards across different sections
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="blueprint">Blueprint</option>
            <option value="intelligence">Intelligence</option>
            <option value="development">Development</option>
          </select>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Prompt
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Create New Prompt</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
              <select
                value={newPrompt.prompt_type}
                onChange={(e) => setNewPrompt({ ...newPrompt, prompt_type: e.target.value as any })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="blueprint">Blueprint</option>
                <option value="intelligence">Intelligence</option>
                <option value="development">Development</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Section ID</label>
              <input
                type="text"
                value={newPrompt.section_id}
                onChange={(e) => setNewPrompt({ ...newPrompt, section_id: e.target.value })}
                placeholder="e.g., value-proposition"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Display Name</label>
              <input
                type="text"
                value={newPrompt.display_name}
                onChange={(e) => setNewPrompt({ ...newPrompt, display_name: e.target.value })}
                placeholder="e.g., Value Proposition Cards"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={newPrompt.description}
                onChange={(e) => setNewPrompt({ ...newPrompt, description: e.target.value })}
                placeholder="Optional description"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Preview Prompt</label>
            <textarea
              value={newPrompt.preview_prompt}
              onChange={(e) => setNewPrompt({ ...newPrompt, preview_prompt: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Generation Prompt</label>
            <textarea
              value={newPrompt.generation_prompt}
              onChange={(e) => setNewPrompt({ ...newPrompt, generation_prompt: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Prompts List */}
      <div className="space-y-4">
        {filteredPrompts.map((prompt) => (
          <div key={prompt.id} className="bg-white border border-gray-200 rounded-lg">
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{prompt.display_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(prompt.prompt_type)}`}>
                      {prompt.prompt_type}
                    </span>
                    <span className="text-xs text-gray-500">{prompt.section_id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingPrompt(editingPrompt?.id === prompt.id ? null : prompt)}
                    className="p-1 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(prompt.id)}
                    className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {prompt.description && (
                <p className="text-xs text-gray-600 mb-3">{prompt.description}</p>
              )}

              {editingPrompt?.id === prompt.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Preview Prompt</label>
                    <textarea
                      value={editingPrompt.preview_prompt}
                      onChange={(e) => setEditingPrompt({ ...editingPrompt, preview_prompt: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Generation Prompt</label>
                    <textarea
                      value={editingPrompt.generation_prompt}
                      onChange={(e) => setEditingPrompt({ ...editingPrompt, generation_prompt: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Max Tokens</label>
                      <input
                        type="number"
                        value={editingPrompt.config.max_tokens || 4000}
                        onChange={(e) => setEditingPrompt({
                          ...editingPrompt,
                          config: { ...editingPrompt.config, max_tokens: parseInt(e.target.value) }
                        })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Chunk Size</label>
                      <input
                        type="number"
                        value={editingPrompt.config.chunk_size || 5}
                        onChange={(e) => setEditingPrompt({
                          ...editingPrompt,
                          config: { ...editingPrompt.config, chunk_size: parseInt(e.target.value) }
                        })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Temperature</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingPrompt.config.temperature || 0.7}
                        onChange={(e) => setEditingPrompt({
                          ...editingPrompt,
                          config: { ...editingPrompt.config, temperature: parseFloat(e.target.value) }
                        })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingPrompt(null)}
                      className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSave(editingPrompt)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-3 h-3" />
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 mb-1">Preview Prompt</h4>
                    <div className="p-2 bg-gray-50 rounded text-xs text-gray-600 line-clamp-3">
                      {prompt.preview_prompt}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 mb-1">Generation Prompt</h4>
                    <div className="p-2 bg-gray-50 rounded text-xs text-gray-600 line-clamp-3">
                      {prompt.generation_prompt}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span>Max Tokens: {prompt.config.max_tokens || 4000}</span>
                  <span>Chunk Size: {prompt.config.chunk_size || 5}</span>
                  <span>Temperature: {prompt.config.temperature || 0.7}</span>
                </div>
                <span>Updated: {new Date(prompt.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPrompts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">No prompts found</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700"
          >
            Create your first prompt
          </button>
        </div>
      )}
    </div>
  )
}