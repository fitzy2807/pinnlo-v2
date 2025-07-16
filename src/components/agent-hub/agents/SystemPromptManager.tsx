import React, { useState, useEffect } from 'react';
import { Edit, Save, X, AlertCircle, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
}

export const SystemPromptManager: React.FC = () => {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<string>('');
  const [saving, setSaving] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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
        .select('*')
        .eq('is_active', true)
        .order('blueprint_type');

      if (error) throw error;
      
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
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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
                  ) : (
                    <button
                      onClick={() => startEditing(prompt)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4">
              {editingId === prompt.id ? (
                <textarea
                  value={editingPrompt}
                  onChange={(e) => setEditingPrompt(e.target.value)}
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm text-gray-900 bg-white"
                  placeholder="Edit system prompt..."
                />
              ) : (
                <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-md max-h-64 overflow-y-auto">
                  {prompt.system_prompt}
                </pre>
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