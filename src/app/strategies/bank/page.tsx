'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStrategies } from '@/hooks/useStrategies';
import StrategySelectionGateway from '@/components/strategy-bank/StrategySelectionGateway';

export default function StrategyBankPage() {
  const router = useRouter();
  const { strategies, loading, createStrategy, updateStrategy, deleteStrategy, duplicateStrategy } = useStrategies();
  const [creating, setCreating] = useState(false);

  const handleSelectStrategy = (strategyId: number) => {
    router.push(`/strategies/bank/${strategyId}`);
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
        router.push(`/strategies/bank/${newStrategy.id}`);
      }
    } catch (error) {
      console.error('Error creating strategy:', error);
      alert('Failed to create strategy. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <StrategySelectionGateway
      strategies={strategies}
      loading={loading}
      creating={creating}
      onSelectStrategy={handleSelectStrategy}
      onCreateStrategy={handleCreateStrategy}
      onUpdateStrategy={updateStrategy}
      onDeleteStrategy={deleteStrategy}
      onDuplicateStrategy={duplicateStrategy}
    />
  );
}