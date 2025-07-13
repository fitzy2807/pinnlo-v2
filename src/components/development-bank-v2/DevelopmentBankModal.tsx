'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStrategies } from '@/hooks/useStrategies';
import DevelopmentBankSelectionGateway from './DevelopmentBankSelectionGateway';
import DevelopmentBank from './DevelopmentBank';

interface DevelopmentBankModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DevelopmentBankModal({ isOpen, onClose }: DevelopmentBankModalProps) {
  const router = useRouter();
  const { strategies, loading } = useStrategies();
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
    }
  };

  const handleBackToSelection = () => {
    setSelectedStrategy(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full h-full max-w-7xl max-h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col mx-4 my-4">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            {selectedStrategy ? `Development Bank - ${selectedStrategy.title}` : 'Development Bank'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {selectedStrategy ? (
            <DevelopmentBank 
              strategy={selectedStrategy} 
              onBack={handleBackToSelection}
            />
          ) : (
            <DevelopmentBankSelectionGateway
              strategies={strategies}
              loading={loading}
              onSelectStrategy={handleSelectStrategy}
            />
          )}
        </div>
      </div>
    </div>
  );
}
