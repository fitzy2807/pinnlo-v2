import { useState, useCallback, useRef } from 'react';
import { StrategyContextManager } from '@/utils/strategyContext';
import { useAIProcessingSession } from '@/contexts/AIProcessingContext';

export interface GeneratorState {
  isGenerating: boolean;
  progress: string;
  error: string | null;
  fields: Record<string, any> | null;
}

export function useEditModeGeneratorWithModal() {
  const [state, setState] = useState<GeneratorState>({
    isGenerating: false,
    progress: '',
    error: null,
    fields: null
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const { startSession } = useAIProcessingSession();
  
  const generate = useCallback(async (params: {
    cardId: string;
    blueprintType: string;
    cardTitle: string;
    strategyId?: string;
    existingFields?: Record<string, any>;
  }) => {
    // Start AI processing session
    const session = startSession(`Generating ${params.blueprintType}: ${params.cardTitle}`, 100);
    
    // Get strategy context from Stage 0 Agent
    const contextStrategyId = StrategyContextManager.getStrategyId();
    
    // If no strategy context is set, try to detect it from the card or set a default
    if (!contextStrategyId) {
      if (params.existingFields?.strategy_id) {
        console.log('🎯 Setting strategy context from card data:', params.existingFields.strategy_id);
        StrategyContextManager.setStrategyContext(
          params.existingFields.strategy_id,
          `Strategy ${params.existingFields.strategy_id}`,
          'detection'
        );
      } else {
        // For now, default to Pinnlo strategy (ID 6) if no strategy context is set
        console.log('🎯 No strategy context found, defaulting to Pinnlo strategy (ID 6)');
        StrategyContextManager.setStrategyContext(
          '6',
          'Pinnlo Strategy',
          'detection'
        );
      }
    }
    
    // Get the updated strategy context after potential setting above
    const updatedContextStrategyId = StrategyContextManager.getStrategyId();
    const finalStrategyId = params.strategyId || updatedContextStrategyId || params.existingFields?.strategy_id;
    
    console.log('🎯 AI Generation Context:', {
      provided: params.strategyId,
      fromContext: contextStrategyId,
      updatedContext: updatedContextStrategyId,
      fromCard: params.existingFields?.strategy_id,
      final: finalStrategyId,
      debugInfo: StrategyContextManager.getDebugInfo()
    });
    
    // Reset state
    setState({
      isGenerating: true,
      progress: 'Initializing...',
      error: null,
      fields: null
    });
    
    // Update modal
    session.setProgress(5, 'Preparing generation request...');
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    try {
      const requestParams = {
        ...params,
        strategyId: finalStrategyId
      };
      
      session.setProgress(10, 'Sending request to AI...');
      
      const response = await fetch('/api/ai/edit-mode/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestParams),
        signal: abortControllerRef.current.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      session.setProgress(20, 'Processing AI response...');
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response body');
      }
      
      let buffer = '';
      let progressValue = 20;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'progress') {
                // Update progress (20% to 90% during processing)
                progressValue = Math.min(90, progressValue + 5);
                
                const message = data.message || 'Processing...';
                setState(prev => ({
                  ...prev,
                  progress: message
                }));
                
                // Update modal progress
                session.setProgress(progressValue, message);
                
              } else if (data.type === 'complete') {
                setState({
                  isGenerating: false,
                  progress: 'Complete!',
                  error: null,
                  fields: data.fields
                });
                
                // Complete the session
                session.complete(`Generated ${params.blueprintType} successfully!`);
                
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        const errorMessage = error.message || 'Generation failed';
        setState({
          isGenerating: false,
          progress: '',
          error: errorMessage,
          fields: null
        });
        
        // Update modal with error
        session.error(errorMessage);
      }
    }
  }, [startSession]);
  
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState(prev => ({
        ...prev,
        isGenerating: false,
        progress: 'Cancelled'
      }));
    }
  }, []);
  
  return {
    ...state,
    generate,
    cancel
  };
}