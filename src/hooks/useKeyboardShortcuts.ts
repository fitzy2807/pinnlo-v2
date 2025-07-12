import { useEffect, useCallback } from 'react';

interface ShortcutHandlers {
  onSearch?: () => void;
  onAddCard?: () => void;
  onQuickAdd?: () => void;
  onEscape?: () => void;
  onSelectAll?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if user is typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      if (e.key === 'Escape' && handlers.onEscape) {
        handlers.onEscape();
      }
      return;
    }

    // Command/Ctrl + K - Search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      handlers.onSearch?.();
    }

    // Command/Ctrl + N - New Card
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
      e.preventDefault();
      handlers.onAddCard?.();
    }

    // Command/Ctrl + Shift + N - Quick Add
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'N') {
      e.preventDefault();
      handlers.onQuickAdd?.();
    }

    // Command/Ctrl + A - Select All
    if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
      e.preventDefault();
      handlers.onSelectAll?.();
    }

    // Escape
    if (e.key === 'Escape') {
      handlers.onEscape?.();
    }
  }, [handlers]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}