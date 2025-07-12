'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useStrategies } from '@/hooks/useStrategies';
import StrategyBank from '@/components/strategy-bank/StrategyBank';

export default function StrategyBankIdPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { strategies } = useStrategies();
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(true);

  const strategyId = parseInt(params.id as string);

  useEffect(() => {
    if (!strategyId || isNaN(strategyId)) {
      router.push('/strategies/bank');
      return;
    }
    
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    // Find the strategy from the strategies loaded by useStrategies
    if (strategies.length > 0) {
      const foundStrategy = strategies.find(s => s.id === strategyId);
      if (foundStrategy) {
        setStrategy(foundStrategy);
      } else {
        console.error('Strategy not found or access denied');
        router.push('/strategies/bank');
        return;
      }
      setLoading(false);
    }
  }, [strategyId, user, strategies]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading strategy...</div>
      </div>
    );
  }

  if (!strategy) {
    return null;
  }

  return <StrategyBank strategy={strategy} />;
}