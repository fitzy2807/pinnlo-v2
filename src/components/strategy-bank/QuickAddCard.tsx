'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

interface QuickAddCardProps {
  blueprintType: string;
  onAdd: (title: string, description: string) => void;
}

export default function QuickAddCard({ blueprintType, onAdd }: QuickAddCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    
    onAdd(title, description);
    setTitle('');
    setDescription('');
    setShowForm(false);
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setShowForm(false);
  };

  return (
    <div className={`bg-gray-50 border-b border-gray-200 transition-all duration-300 ease-in-out overflow-hidden ${
      showForm ? 'max-h-32' : 'max-h-0'
    }`}>
      <div className="p-4">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Card title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
            autoFocus
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
          />
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="px-3 py-1.5 bg-black text-white text-sm rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            Add
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 text-gray-700 bg-gray-100 hover:bg-gray-200 text-sm rounded transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}