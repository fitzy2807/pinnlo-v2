import { useState, useCallback, useRef } from 'react';

export interface GeneratorState {
  isGenerating: boolean;
  progress: string;
  error: string | null;
  fields: Record<string, any> | null;
}

export function useEditModeGenerator() {
  const [state, setState] = useState<GeneratorState>({
    isGenerating: false,
    progress: '',
    error: null,
    fields: null
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const generate = useCallback(async (params: {
    cardId: string;
    blueprintType: string;
    cardTitle: string;
    strategyId?: string;
    existingFields?: Record<string, any>;
  }) => {
    // Reset state
    setState({
      isGenerating: true,
      progress: 'Initializing...',
      error: null,
      fields: null
    });
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch('/api/ai/edit-mode/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: abortControllerRef.current.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response body');
      }
      
      let buffer = '';
      
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
                setState(prev => ({
                  ...prev,
                  progress: data.message || 'Processing...'
                }));
              } else if (data.type === 'complete') {
                setState({
                  isGenerating: false,
                  progress: 'Complete!',
                  error: null,
                  fields: data.fields
                });
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
        setState({
          isGenerating: false,
          progress: '',
          error: error.message || 'Generation failed',
          fields: null
        });
      }
    }
  }, []);
  
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