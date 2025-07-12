'use client';

import { useState } from 'react';
import { X, Edit2, Trash2, Check } from 'lucide-react';

interface GroupManagerProps {
  groups: any[];
  onCreateGroup: (name: string, color: string) => Promise<void>;
  onUpdateGroup: (groupId: string, updates: { name?: string; color?: string }) => Promise<void>;
  onDeleteGroup: (groupId: string) => Promise<void>;
  onClose: () => void;
}

const COLOR_OPTIONS = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
  { value: 'gray', label: 'Gray', class: 'bg-gray-500' },
];

export default function GroupManager({
  groups,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onClose
}: GroupManagerProps) {
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('blue');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!newGroupName.trim()) return;

    setIsCreating(true);
    try {
      await onCreateGroup(newGroupName, newGroupColor);
      setNewGroupName('');
      setNewGroupColor('blue');
    } catch (error) {
      alert('Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (groupId: string) => {
    if (!editingName.trim()) return;

    try {
      await onUpdateGroup(groupId, { name: editingName });
      setEditingId(null);
      setEditingName('');
    } catch (error) {
      alert('Failed to update group');
    }
  };

  const handleDelete = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group? Cards will be removed from this group.')) {
      return;
    }

    try {
      await onDeleteGroup(groupId);
    } catch (error) {
      alert('Failed to delete group');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Manage Groups</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create New Group */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Create New Group</h4>
          <div className="space-y-3">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Group name"
              className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
              onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
            />
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Color:</span>
              <div className="flex gap-1">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewGroupColor(color.value)}
                    className={`w-6 h-6 rounded-full ${color.class} ${
                      newGroupColor === color.value ? 'ring-2 ring-offset-2 ring-black' : ''
                    }`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={!newGroupName.trim() || isCreating}
              className="w-full px-3 py-1.5 bg-black text-white text-sm rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {isCreating ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </div>

        {/* Existing Groups */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Existing Groups</h4>
          {groups.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No groups created yet</p>
          ) : (
            groups.map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-3 h-3 rounded-full bg-${group.color}-500`} />
                  {editingId === group.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleUpdate(group.id)}
                      onBlur={() => handleUpdate(group.id)}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm font-medium">{group.name}</span>
                  )}
                  {group.card_count > 0 && (
                    <span className="text-xs text-gray-500">({group.card_count} cards)</span>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  {editingId === group.id ? (
                    <button
                      onClick={() => handleUpdate(group.id)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(group.id);
                        setEditingName(group.name);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(group.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}