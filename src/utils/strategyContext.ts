/**
 * Strategy Context Manager - Stage 0 Agent
 * Captures and maintains strategy context throughout the session
 */

import React from 'react';

const STRATEGY_CONTEXT_KEY = 'pinnlo_strategy_context';

export interface StrategyContext {
  strategyId: string;
  strategyTitle: string;
  timestamp: number;
  source: 'gateway' | 'detection' | 'manual';
}

export class StrategyContextManager {
  /**
   * Set strategy context from gateway selection
   */
  static setStrategyContext(strategyId: string, strategyTitle: string, source: 'gateway' | 'detection' | 'manual' = 'gateway') {
    const context: StrategyContext = {
      strategyId,
      strategyTitle,
      timestamp: Date.now(),
      source
    };
    
    // Store in both session and local storage for persistence
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STRATEGY_CONTEXT_KEY, JSON.stringify(context));
      localStorage.setItem(STRATEGY_CONTEXT_KEY, JSON.stringify(context));
    }
    
    console.log('🎯 Strategy context set:', context);
    return context;
  }

  /**
   * Get current strategy context
   */
  static getStrategyContext(): StrategyContext | null {
    if (typeof window === 'undefined') return null;
    
    // Try session storage first, then local storage
    const sessionData = sessionStorage.getItem(STRATEGY_CONTEXT_KEY);
    const localData = localStorage.getItem(STRATEGY_CONTEXT_KEY);
    
    let context: StrategyContext | null = null;
    
    if (sessionData) {
      try {
        context = JSON.parse(sessionData);
      } catch (error) {
        console.error('Error parsing session strategy context:', error);
      }
    }
    
    if (!context && localData) {
      try {
        context = JSON.parse(localData);
      } catch (error) {
        console.error('Error parsing local strategy context:', error);
      }
    }
    
    // Check if context is expired (older than 24 hours)
    if (context && Date.now() - context.timestamp > 24 * 60 * 60 * 1000) {
      console.log('🕐 Strategy context expired, clearing...');
      StrategyContextManager.clearStrategyContext();
      return null;
    }
    
    return context;
  }

  /**
   * Get strategy ID for AI generation
   */
  static getStrategyId(): string | null {
    const context = StrategyContextManager.getStrategyContext();
    return context?.strategyId || null;
  }

  /**
   * Clear strategy context
   */
  static clearStrategyContext() {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STRATEGY_CONTEXT_KEY);
      localStorage.removeItem(STRATEGY_CONTEXT_KEY);
    }
    console.log('🧹 Strategy context cleared');
  }

  /**
   * Update strategy context with new information
   */
  static updateStrategyContext(updates: Partial<StrategyContext>) {
    const current = StrategyContextManager.getStrategyContext();
    if (current) {
      const updated = { ...current, ...updates, timestamp: Date.now() };
      StrategyContextManager.setStrategyContext(updated.strategyId, updated.strategyTitle, updated.source);
    }
  }

  /**
   * Debug: Get context information
   */
  static getDebugInfo() {
    const context = StrategyContextManager.getStrategyContext();
    return {
      hasContext: !!context,
      context,
      age: context ? Date.now() - context.timestamp : null,
      ageMinutes: context ? Math.floor((Date.now() - context.timestamp) / (1000 * 60)) : null
    };
  }
}

/**
 * React hook for using strategy context
 */
export function useStrategyContext() {
  const [context, setContext] = React.useState<StrategyContext | null>(null);
  
  React.useEffect(() => {
    const updateContext = () => {
      setContext(StrategyContextManager.getStrategyContext());
    };
    
    updateContext();
    
    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STRATEGY_CONTEXT_KEY) {
        updateContext();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  return {
    context,
    strategyId: context?.strategyId || null,
    setStrategyContext: StrategyContextManager.setStrategyContext,
    clearStrategyContext: StrategyContextManager.clearStrategyContext,
    debugInfo: StrategyContextManager.getDebugInfo()
  };
}