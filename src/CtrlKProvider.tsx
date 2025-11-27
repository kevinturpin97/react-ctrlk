import { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import type { CtrlKContextValue, CtrlKProviderProps, KeyboardShortcut } from './types';

const CtrlKContext = createContext<CtrlKContextValue | null>(null);

/**
 * Provider component that enables keyboard shortcut functionality.
 * Wrap your application or a portion of it with this provider to use the useCtrlK hook.
 *
 * @example
 * ```tsx
 * import { CtrlKProvider } from 'ctrl-k';
 *
 * function App() {
 *   return (
 *     <CtrlKProvider>
 *       <YourApp />
 *     </CtrlKProvider>
 *   );
 * }
 * ```
 */
export function CtrlKProvider({ children }: CtrlKProviderProps): React.ReactElement {
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
      shortcutsRef.current.set(id, { ...shortcut, enabled });
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcutsRef.current.forEach((shortcut) => {

        if (shortcut.enabled === false) {
          return;
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

        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }

        if (shortcut.stopPropagation) {
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

  const contextValue: CtrlKContextValue = {
    registerShortcut,
    unregisterShortcut,
    setShortcutEnabled,
  };

  return (
    <CtrlKContext.Provider value={contextValue}>
      {children}
    </CtrlKContext.Provider>
  );
}

/**
 * Hook to access the CtrlK context.
 * Must be used within a CtrlKProvider.
 *
 * @returns The CtrlK context value
 * @throws Error if used outside of CtrlKProvider
 */
export function useCtrlKContext(): CtrlKContextValue {
  const context = useContext(CtrlKContext);
  if (!context) {
    throw new Error('useCtrlKContext must be used within a CtrlKProvider');
  }
  return context;
}

export { CtrlKContext };
