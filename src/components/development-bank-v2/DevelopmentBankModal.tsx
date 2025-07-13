'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStrategies } from '@/hooks/useStrategies';
import DevelopmentBankSelectionGateway from './DevelopmentBankSelectionGateway';
import DevelopmentBank from './DevelopmentBank';

interface DevelopmentBankModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function DevelopmentBankModal({ isOpen, onClose }: DevelopmentBankModalProps) {
  const router = useRouter();
  const { strategies, loading, createStrategy, updateStrategy, deleteStrategy, duplicateStrategy } = useStrategies();
  const [creating, setCreating] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState(null);

  // Reset selection when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedStrategy(null);
      console.log('🔄 Development Bank Modal opened - reset to selection screen');
    }
  }, [isOpen]);

  // Debug: Log when modal opens and what strategies are available
  console.log('🏗️ DevelopmentBankModal Debug:');
  console.log('- Modal isOpen:', isOpen);
  console.log('- Strategies loaded:', strategies.length);
  console.log('- Selected strategy:', selectedStrategy?.title || 'None');
  console.log('- Loading:', loading);

  const handleSelectStrategy = (strategyId: number) => {
    const strategy = strategies.find(s => s.id === strategyId);
    if (strategy) {
      setSelectedStrategy(strategy);
      console.log('✅ Strategy selected for Development Bank:', strategy.title);
    }
  };

  const handleCreateStrategy = async (title: string, client: string, description: string) => {
    setCreating(true);
    try {
      const newStrategy = await createStrategy({
        title,
        client,
        description,
        status: 'draft'
      });
      
      if (newStrategy) {
        setSelectedStrategy(newStrategy);
      }
    } catch (error) {
      console.error('Error creating strategy:', error);
      alert('Failed to create strategy. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleBackToSelection = () => {
    setSelectedStrategy(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      
      {/* Modal */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Extra Header Bar */}
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-black">
                {selectedStrategy ? `Development Bank v2 - ${selectedStrategy.title}` : 'Development Bank v2 PINNLO'}
              </h1>
              <button
                onClick={onClose}
                className="p-1 text-black hover:bg-gray-100 rounded transition-colors"
                title="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {selectedStrategy ? (
              <DevelopmentBank 
                strategy={selectedStrategy} 
                onBack={handleBackToSelection}
                onClose={onClose}
              />
            ) : (
              <DevelopmentBankSelectionGateway
                strategies={strategies}
                loading={loading}
                creating={creating}
                onSelectStrategy={handleSelectStrategy}
                onCreateStrategy={handleCreateStrategy}
                onUpdateStrategy={updateStrategy}
                onDeleteStrategy={deleteStrategy}
                onDuplicateStrategy={duplicateStrategy}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}