import { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import type { ShortcutContextValue, ShortcutProps, KeyboardShortcut } from './types';

const ShortcutContext = createContext<ShortcutContextValue | null>(null);

/**
 * Provider component that enables keyboard shortcut functionality.
 */
export function Shortcut({ children }: ShortcutProps): React.ReactElement {
  const shortcutsRef = useRef<Map<string, KeyboardShortcut>>(new Map());

  const registerShortcut = useCallback((id: string, shortcut: KeyboardShortcut) => {
    shortcutsRef.current.set(id, shortcut);
  }, []);

  const unregisterShortcut = useCallback((id: string) => {
    shortcutsRef.current.delete(id);
  }, []);

  const setShortcutEnabled = useCallback((id: string, enabled: boolean) => {
    const shortcut = shortcutsRef.current.get(id);
    if (shortcut) {
      // Update the enabled state inside the options object, preserving other options
      shortcutsRef.current.set(id, { 
        ...shortcut, 
        options: { ...shortcut.options, enabled } 
      });
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcutsRef.current.forEach((shortcut) => {
        const options = shortcut.options || {};

        // Check if enabled (default true)
        if (options.enabled === false) {
          return;
        }

        // Check for ref scope
        // If a ref is provided, the event target must be contained within that element
        if (options.ref && options.ref.current) {
           if (event.target instanceof Node && !options.ref.current.contains(event.target)) {
             return;
           }
        }

        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
 
        if (!keyMatches) {
          return;
        }

        const modifiers = shortcut.modifiers || [];
        const ctrlRequired = modifiers.includes('ctrl');
        const metaRequired = modifiers.includes('meta');
        const altRequired = modifiers.includes('alt');
        const shiftRequired = modifiers.includes('shift');

        const modifiersMatch =
          event.ctrlKey === ctrlRequired &&
          event.metaKey === metaRequired &&
          event.altKey === altRequired &&
          event.shiftKey === shiftRequired;

        if (!modifiersMatch) {
          return;
        }

        // Check preventDefault (default true)
        if (options.preventDefault !== false) {
          event.preventDefault();
        }

        // Check stopPropagation (default false)
        if (options.stopPropagation) {
          event.stopPropagation();
        }

        shortcut.handler(event);
      });
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const contextValue: ShortcutContextValue = {
    registerShortcut,
    unregisterShortcut,
    setShortcutEnabled,
  };

  return (
    <ShortcutContext.Provider value={contextValue}>
      {children}
    </ShortcutContext.Provider>
  );
}

/**
 * Hook to access the Shortcut context.
 * Must be used within a Shortcut.
 */
export function useShortcutContext(): ShortcutContextValue {
  const context = useContext(ShortcutContext);
  if (!context) {
    throw new Error('useShortcutContext must be used within a Shortcut');
  }
  return context;
}

export { ShortcutContext };