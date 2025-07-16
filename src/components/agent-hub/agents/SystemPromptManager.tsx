import React, { useState, useEffect } from 'react';
import { Edit, Save, X, AlertCircle, Check, Settings, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BLUEPRINT_REGISTRY, BLUEPRINT_CATEGORIES } from '@/components/blueprints/registry';

interface SystemPrompt {
  id: string;
  blueprint_type: string;
  prompt_name: string;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  model_preference: string;
  is_active: boolean;
  updated_at: string;
  context_config?: any;
  card_creator_preview_prompt?: string;
  card_creator_generation_prompt?: string;
  card_creator_config?: any;
}

interface ContextBlueprint {
  blueprint: string;
  maxCards: number;
  inclusionStrategy: 'if_exists' | 'required' | 'optional';
  summarizationRequired: boolean;
  weight: number;
  description: string;
}

interface ContextConfig {
  contextBlueprints: ContextBlueprint[];
}

const INCLUSION_STRATEGIES = [
  { value: 'if_exists', label: 'If Exists', description: 'Include if cards exist' },
  { value: 'required', label: 'Required', description: 'Must have cards' },
  { value: 'optional', label: 'Optional', description: 'Nice to have' }
] as const;

export const SystemPromptManager: React.FC = () => {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<string>('');
  const [saving, setSaving] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingContextId, setEditingContextId] = useState<string | null>(null);
  const [editingContextConfig, setEditingContextConfig] = useState<ContextConfig | null>(null);
  const [editingCardCreatorId, setEditingCardCreatorId] = useState<string | null>(null);
  const [editingPreviewPrompt, setEditingPreviewPrompt] = useState<string>('');
  const [editingGenerationPrompt, setEditingGenerationPrompt] = useState<string>('');
  const [editingCardCreatorConfig, setEditingCardCreatorConfig] = useState<any>(null);

  // Using the imported supabase instance directly

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('ai_system_prompts')
        .select('*, context_config, card_creator_preview_prompt, card_creator_generation_prompt, card_creator_config')
        .eq('is_active', true)
        .order('blueprint_type');

      if (error) throw error;
      
      console.log('📋 Fetched prompts:', data?.length || 0);
      console.log('Sample prompt with Card Creator fields:', data?.[0]);
      setPrompts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prompts');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (prompt: SystemPrompt) => {
    setEditingId(prompt.id);
    setEditingPrompt(prompt.system_prompt);
    setSaveSuccess(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingPrompt('');
    setSaveSuccess(null);
  };

  const startEditingContext = (prompt: SystemPrompt) => {
    setEditingContextId(prompt.id);
    const defaultConfig: ContextConfig = {
      contextBlueprints: []
    };
    setEditingContextConfig(prompt.context_config || defaultConfig);
    setSaveSuccess(null);
  };

  const cancelEditingContext = () => {
    setEditingContextId(null);
    setEditingContextConfig(null);
    setSaveSuccess(null);
  };

  const startEditingCardCreator = (prompt: SystemPrompt) => {
    console.log('🎨 startEditingCardCreator called for prompt:', prompt.id);
    console.log('Existing preview prompt:', prompt.card_creator_preview_prompt);
    console.log('Existing generation prompt:', prompt.card_creator_generation_prompt);
    console.log('Existing config:', prompt.card_creator_config);
    
    setEditingCardCreatorId(prompt.id);
    setEditingPreviewPrompt(prompt.card_creator_preview_prompt || '');
    setEditingGenerationPrompt(prompt.card_creator_generation_prompt || '');
    setEditingCardCreatorConfig(prompt.card_creator_config || {
      temperature: 0.7,
      max_tokens: 4000,
      chunk_size: 5
    });
    setSaveSuccess(null);
  };

  const cancelEditingCardCreator = () => {
    setEditingCardCreatorId(null);
    setEditingPreviewPrompt('');
    setEditingGenerationPrompt('');
    setEditingCardCreatorConfig(null);
    setSaveSuccess(null);
  };

  const addContextBlueprint = () => {
    if (!editingContextConfig) return;
    
    const newBlueprint: ContextBlueprint = {
      blueprint: '',
      maxCards: 0, // 0 means no limit - read all cards
      inclusionStrategy: 'if_exists',
      summarizationRequired: true,
      weight: 1.0,
      description: ''
    };
    
    setEditingContextConfig({
      ...editingContextConfig,
      contextBlueprints: [...editingContextConfig.contextBlueprints, newBlueprint]
    });
  };

  const removeContextBlueprint = (index: number) => {
    if (!editingContextConfig) return;
    
    setEditingContextConfig({
      ...editingContextConfig,
      contextBlueprints: editingContextConfig.contextBlueprints.filter((_, i) => i !== index)
    });
  };

  const updateContextBlueprint = (index: number, updates: Partial<ContextBlueprint>) => {
    if (!editingContextConfig) return;
    
    const updatedBlueprints = editingContextConfig.contextBlueprints.map((bp, i) => 
      i === index ? { ...bp, ...updates } : bp
    );
    
    setEditingContextConfig({
      ...editingContextConfig,
      contextBlueprints: updatedBlueprints
    });
  };

  const savePrompt = async (promptId: string) => {
    try {
      setSaving(promptId);
      setError(null);
      
      console.log('Saving prompt:', promptId);
      console.log('New content:', editingPrompt);
      
      // Use API endpoint with service role for admin operations
      const response = await fetch(`/api/system-prompts/${promptId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_prompt: editingPrompt
        })
      });

      const result = await response.json();
      console.log('API response:', { status: response.status, result });

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save prompt');
      }
      
      // Update local state
      setPrompts(prev => prev.map(p => 
        p.id === promptId 
          ? { ...p, system_prompt: editingPrompt, updated_at: new Date().toISOString() }
          : p
      ));
      
      setSaveSuccess(promptId);
      setEditingId(null);
      setEditingPrompt('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(null), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save prompt');
    } finally {
      setSaving(null);
    }
  };

  const saveContextConfig = async (promptId: string) => {
    if (!editingContextConfig) return;
    
    try {
      setSaving(promptId);
      setError(null);
      
      // Validate context configuration
      const validBlueprints = editingContextConfig.contextBlueprints.filter(bp => bp.blueprint);
      
      if (validBlueprints.length > 3) {
        setError('Maximum 3 blueprints allowed for context configuration');
        return;
      }
      
      const configToSave = {
        ...editingContextConfig,
        contextBlueprints: validBlueprints
      };
      
      const response = await fetch(`/api/system-prompts/${promptId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context_config: configToSave
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save context configuration');
      }
      
      // Update local state
      setPrompts(prev => prev.map(p => 
        p.id === promptId 
          ? { ...p, context_config: configToSave, updated_at: new Date().toISOString() }
          : p
      ));
      
      setSaveSuccess(promptId);
      setEditingContextId(null);
      setEditingContextConfig(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(null), 3000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save context configuration');
    } finally {
      setSaving(null);
    }
  };

  const saveCardCreatorPrompts = async (promptId: string) => {
    console.log('🎯 saveCardCreatorPrompts called with promptId:', promptId);
    console.log('Preview prompt:', editingPreviewPrompt);
    console.log('Generation prompt:', editingGenerationPrompt);
    console.log('Config:', editingCardCreatorConfig);
    
    if (!editingCardCreatorConfig) {
      console.error('❌ No editing config found, returning');
      return;
    }
    
    try {
      setSaving(promptId);
      setError(null);
      
      const requestBody = {
        card_creator_preview_prompt: editingPreviewPrompt || null,
        card_creator_generation_prompt: editingGenerationPrompt || null,
        card_creator_config: editingCardCreatorConfig
      };
      
      console.log('📤 Sending request to API:', requestBody);
      
      const response = await fetch(`/api/system-prompts/${promptId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      console.log('📥 API Response:', { status: response.status, result });
      
      if (!response.ok) {
        console.error('❌ API Error:', result.error);
        throw new Error(result.error || 'Failed to save Card Creator prompts');
      }
      
      console.log('✅ Save successful, updating local state');
      
      // Update local state
      setPrompts(prev => prev.map(p => 
        p.id === promptId 
          ? { 
              ...p, 
              card_creator_preview_prompt: editingPreviewPrompt || null,
              card_creator_generation_prompt: editingGenerationPrompt || null,
              card_creator_config: editingCardCreatorConfig,
              updated_at: new Date().toISOString() 
            }
          : p
      ));
      
      setSaveSuccess(promptId);
      setEditingCardCreatorId(null);
      setEditingPreviewPrompt('');
      setEditingGenerationPrompt('');
      setEditingCardCreatorConfig(null);
      
      console.log('✅ UI state updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(null), 3000);
      
    } catch (err) {
      console.error('❌ Catch block error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save Card Creator prompts');
    } finally {
      setSaving(null);
    }
  };

  const filteredPrompts = prompts.filter(prompt =>
    prompt.blueprint_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.prompt_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <style jsx>{`
        /* Local component override for text color */
        :global(.card-creator-edit-mode) :global(input),
        :global(.card-creator-edit-mode) :global(textarea),
        :global(.card-creator-edit-mode) :global(select) {
          color: black !important;
          -webkit-text-fill-color: black !important;
        }
      `}</style>
      <style jsx global>{`
        /* Force black text in all editing modes */
        .system-prompt-edit textarea,
        .system-prompt-edit input,
        .system-prompt-edit select,
        .context-config-edit textarea,
        .context-config-edit input,
        .context-config-edit select {
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
        }
        
        /* Card Creator specific styles with MAXIMUM FORCE */
        .card-creator-edit-mode * {
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
        }
        
        /* Reset ALL text-related styles in Card Creator */
        .card-creator-edit-mode,
        .card-creator-edit-mode * {
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
          opacity: 1 !important;
        }
        
        .card-creator-edit-mode textarea,
        .card-creator-edit-mode input,
        .card-creator-edit-mode select {
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
          background-color: #ffffff !important;
          caret-color: #000000 !important;
        }
        
        .card-creator-edit-mode textarea:focus,
        .card-creator-edit-mode input:focus,
        .card-creator-edit-mode select:focus,
        .card-creator-edit-mode textarea:hover,
        .card-creator-edit-mode input:hover,
        .card-creator-edit-mode select:hover {
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
          background-color: #ffffff !important;
        }
        
        /* Override ANY inherited styles */
        #__next .card-creator-edit-mode textarea,
        #__next .card-creator-edit-mode input,
        #__next .card-creator-edit-mode select,
        body .card-creator-edit-mode textarea,
        body .card-creator-edit-mode input,
        body .card-creator-edit-mode select {
          color: #000000 !important;
          -webkit-text-fill-color: #000000 !important;
        }
        
        /* Ensure placeholder text is gray */
        .system-prompt-edit textarea::placeholder,
        .system-prompt-edit input::placeholder,
        .context-config-edit textarea::placeholder,
        .context-config-edit input::placeholder,
        .card-creator-edit-mode textarea::placeholder,
        .card-creator-edit-mode input::placeholder {
          color: #9ca3af !important;
          -webkit-text-fill-color: #9ca3af !important;
        }
      `}</style>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">System Prompt Manager</h1>
        <button
          onClick={fetchPrompts}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by blueprint type or prompt name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
        />
      </div>

      {/* Prompts List */}
      <div className="space-y-4">
        {filteredPrompts.map((prompt) => (
          <div key={prompt.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {prompt.blueprint_type}
                  </h3>
                  <p className="text-sm text-gray-600">{prompt.prompt_name}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Model: {prompt.model_preference}</span>
                    <span>Temperature: {prompt.temperature}</span>
                    <span>Max Tokens: {prompt.max_tokens}</span>
                    <span>Updated: {new Date(prompt.updated_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {prompt.context_config && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        Context Configured
                      </span>
                    )}
                    {prompt.card_creator_preview_prompt && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                        Preview Prompt
                      </span>
                    )}
                    {prompt.card_creator_generation_prompt && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Generation Prompt
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {saveSuccess === prompt.id && (
                    <div className="flex items-center gap-1 text-green-600">
                      <Check className="w-4 h-4" />
                      <span className="text-sm">Saved!</span>
                    </div>
                  )}
                  {editingId === prompt.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => savePrompt(prompt.id)}
                        disabled={saving === prompt.id}
                        className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {saving === prompt.id ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  ) : editingContextId === prompt.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveContextConfig(prompt.id)}
                        disabled={saving === prompt.id}
                        className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {saving === prompt.id ? 'Saving...' : 'Save Context'}
                      </button>
                      <button
                        onClick={cancelEditingContext}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  ) : editingCardCreatorId === prompt.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          console.log('💾 Save Card Creator button clicked for prompt:', prompt.id);
                          saveCardCreatorPrompts(prompt.id);
                        }}
                        disabled={saving === prompt.id}
                        className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {saving === prompt.id ? 'Saving...' : 'Save Card Creator'}
                      </button>
                      <button
                        onClick={cancelEditingCardCreator}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(prompt)}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Prompt
                      </button>
                      <button
                        onClick={() => startEditingContext(prompt)}
                        className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <Settings className="w-4 h-4" />
                        Context Config
                      </button>
                      <button
                        onClick={() => startEditingCardCreator(prompt)}
                        className="flex items-center gap-1 px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <Plus className="w-4 h-4" />
                        Card Creator
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4">
              {editingId === prompt.id ? (
                <div className="system-prompt-edit">
                  <textarea
                    value={editingPrompt}
                    onChange={(e) => setEditingPrompt(e.target.value)}
                    className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm text-black bg-white placeholder-gray-400 [&:focus]:text-black [&:hover]:text-black"
                    style={{ color: '#000000 !important', backgroundColor: '#ffffff !important', WebkitTextFillColor: '#000000' }}
                    placeholder="Edit system prompt..."
                  />
                </div>
              ) : editingContextId === prompt.id ? (
                <div className="space-y-4 context-config-edit">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">Context Configuration</h4>
                    <div className="text-sm text-gray-500">
                      {editingContextConfig?.contextBlueprints.length || 0} / 3 blueprints
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                    <p><strong>Rules:</strong> Select up to 3 blueprints to use as context. The system will read ALL cards from selected blueprints and use AI summarization to extract key themes.</p>
                  </div>
                  
                  <div className="space-y-3">
                    {editingContextConfig?.contextBlueprints.map((blueprint, index) => (
                      <div key={index} className="border border-gray-200 rounded-md p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900">Blueprint {index + 1}</h5>
                          <button
                            onClick={() => removeContextBlueprint(index)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Blueprint Type
                            </label>
                            <select
                              value={blueprint.blueprint}
                              onChange={(e) => updateContextBlueprint(index, { 
                                blueprint: e.target.value,
                                description: BLUEPRINT_REGISTRY[e.target.value]?.description || ''
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black"
                            >
                              <option value="">Select blueprint...</option>
                              {Object.entries(BLUEPRINT_CATEGORIES).map(([category, blueprints]) => (
                                <optgroup key={category} label={category}>
                                  {blueprints.map(blueprintId => {
                                    const config = BLUEPRINT_REGISTRY[blueprintId];
                                    return (
                                      <option key={blueprintId} value={blueprintId}>
                                        {config?.name || blueprintId}
                                      </option>
                                    );
                                  })}
                                </optgroup>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Inclusion Strategy
                            </label>
                            <select
                              value={blueprint.inclusionStrategy}
                              onChange={(e) => updateContextBlueprint(index, { 
                                inclusionStrategy: e.target.value as 'if_exists' | 'required' | 'optional'
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black"
                            >
                              {INCLUSION_STRATEGIES.map(strategy => (
                                <option key={strategy.value} value={strategy.value}>
                                  {strategy.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={blueprint.description}
                            onChange={(e) => updateContextBlueprint(index, { description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black"
                            placeholder="Describe how this blueprint provides context..."
                          />
                        </div>
                        
                        <div className="mt-3 flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`summarization-${index}`}
                              checked={blueprint.summarizationRequired}
                              onChange={(e) => updateContextBlueprint(index, { summarizationRequired: e.target.checked })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor={`summarization-${index}`} className="text-sm text-gray-700">
                              AI Summarization
                            </label>
                          </div>
                          
                          <div className="text-sm text-gray-500">
                            Cards: All (no limit)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {(!editingContextConfig?.contextBlueprints.length || editingContextConfig.contextBlueprints.length < 3) && (
                    <button
                      onClick={addContextBlueprint}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <Plus className="w-4 h-4" />
                      Add Blueprint
                    </button>
                  )}
                </div>
              ) : editingCardCreatorId === prompt.id ? (
                <div className="space-y-6" style={{ isolation: 'isolate', position: 'relative', zIndex: 1 }}>
                  <div className="card-creator-edit-mode" data-force-black-text="true" style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px' }}>
                    <h4 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>Card Creator Configuration</h4>
                    <div className="text-sm bg-orange-50 p-3 rounded-md mb-4" style={{ color: '#4b5563' }}>
                      <p><strong>Card Creator:</strong> Configure specialized prompts for the Card Creator tool. Preview prompts analyze strategic context, while generation prompts create actual cards.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 card-creator-edit-mode" style={{ color: 'black', backgroundColor: 'white', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ color: 'black' }}>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                        Preview Prompt
                      </label>
                      <textarea
                        value={editingPreviewPrompt}
                        onChange={(e) => setEditingPreviewPrompt(e.target.value)}
                        style={{ 
                          width: '100%',
                          height: '128px',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontFamily: 'monospace',
                          fontSize: '14px',
                          color: 'black',
                          backgroundColor: 'white',
                          WebkitTextFillColor: 'black',
                          caretColor: 'black',
                          outline: 'none'
                        }}
                        placeholder="Enter preview prompt for analyzing strategic context..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This prompt is used for Step 3 of Card Creator to analyze strategic impact
                      </p>
                    </div>
                    
                    <div style={{ color: 'black' }}>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                        Generation Prompt
                      </label>
                      <textarea
                        value={editingGenerationPrompt}
                        onChange={(e) => setEditingGenerationPrompt(e.target.value)}
                        style={{ 
                          width: '100%',
                          height: '128px',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontFamily: 'monospace',
                          fontSize: '14px',
                          color: 'black',
                          backgroundColor: 'white',
                          WebkitTextFillColor: 'black',
                          caretColor: 'black',
                          outline: 'none'
                        }}
                        placeholder="Enter generation prompt for creating actual cards..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This prompt is used for Step 4 of Card Creator to generate actual cards
                      </p>
                    </div>
                    
                    <div style={{ color: 'black' }}>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                        Configuration
                      </label>
                      <div className="grid grid-cols-3 gap-4" style={{ color: 'black' }}>
                        <div>
                          <label className="block text-xs mb-1" style={{ color: '#6b7280' }}>Temperature</label>
                          <input
                            type="number"
                            min="0"
                            max="1"
                            step="0.1"
                            value={editingCardCreatorConfig?.temperature || 0.7}
                            onChange={(e) => setEditingCardCreatorConfig(prev => ({
                              ...prev,
                              temperature: parseFloat(e.target.value)
                            }))}
                            style={{ 
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '14px',
                              color: 'black',
                              backgroundColor: 'white',
                              WebkitTextFillColor: 'black',
                              caretColor: 'black',
                              outline: 'none'
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1" style={{ color: '#6b7280' }}>Max Tokens</label>
                          <input
                            type="number"
                            min="1000"
                            max="8000"
                            step="500"
                            value={editingCardCreatorConfig?.max_tokens || 4000}
                            onChange={(e) => setEditingCardCreatorConfig(prev => ({
                              ...prev,
                              max_tokens: parseInt(e.target.value)
                            }))}
                            style={{ 
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '14px',
                              color: 'black',
                              backgroundColor: 'white',
                              WebkitTextFillColor: 'black',
                              caretColor: 'black',
                              outline: 'none'
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1" style={{ color: '#6b7280' }}>Chunk Size</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={editingCardCreatorConfig?.chunk_size || 5}
                            onChange={(e) => setEditingCardCreatorConfig(prev => ({
                              ...prev,
                              chunk_size: parseInt(e.target.value)
                            }))}
                            style={{ 
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '14px',
                              color: 'black',
                              backgroundColor: 'white',
                              WebkitTextFillColor: 'black',
                              caretColor: 'black',
                              outline: 'none'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">System Prompt</h4>
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-md max-h-64 overflow-y-auto">
                      {prompt.system_prompt}
                    </pre>
                  </div>
                  
                  {prompt.context_config && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Context Configuration</h4>
                      <div className="bg-gray-50 p-4 rounded-md">
                        {prompt.context_config.contextBlueprints?.length > 0 ? (
                          <div className="space-y-2">
                            {prompt.context_config.contextBlueprints.map((bp: ContextBlueprint, index: number) => (
                              <div key={index} className="text-sm">
                                <span className="font-medium">{BLUEPRINT_REGISTRY[bp.blueprint]?.name || bp.blueprint}</span>
                                <span className="text-gray-500 ml-2">({bp.inclusionStrategy})</span>
                                {bp.description && (
                                  <div className="text-xs text-gray-600 mt-1">{bp.description}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">No context configuration</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {(prompt.card_creator_preview_prompt || prompt.card_creator_generation_prompt) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Card Creator Configuration</h4>
                      <div className="bg-gray-50 p-4 rounded-md space-y-3">
                        {prompt.card_creator_preview_prompt && (
                          <div>
                            <h5 className="text-xs font-medium text-gray-600 mb-1">Preview Prompt</h5>
                            <pre className="whitespace-pre-wrap text-xs text-gray-600 bg-white p-2 rounded border max-h-20 overflow-y-auto">
                              {prompt.card_creator_preview_prompt}
                            </pre>
                          </div>
                        )}
                        {prompt.card_creator_generation_prompt && (
                          <div>
                            <h5 className="text-xs font-medium text-gray-600 mb-1">Generation Prompt</h5>
                            <pre className="whitespace-pre-wrap text-xs text-gray-600 bg-white p-2 rounded border max-h-20 overflow-y-auto">
                              {prompt.card_creator_generation_prompt}
                            </pre>
                          </div>
                        )}
                        {prompt.card_creator_config && (
                          <div>
                            <h5 className="text-xs font-medium text-gray-600 mb-1">Configuration</h5>
                            <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                              <div>Temperature: {prompt.card_creator_config.temperature || 0.7}</div>
                              <div>Max Tokens: {prompt.card_creator_config.max_tokens || 4000}</div>
                              <div>Chunk Size: {prompt.card_creator_config.chunk_size || 5}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredPrompts.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No prompts found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default SystemPromptManager;