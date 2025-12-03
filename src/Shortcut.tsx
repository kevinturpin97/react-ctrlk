import { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import type { ShortcutContextValue, ShortcutProps, KeyboardShortcut } from './types';

const ShortcutContext = createContext<ShortcutContextValue | null>(null);

/**
 *  Provider component that enables keyboard shortcut functionality.
 * Wrap your application or a portion of it with this  to use the useShortcut hook.
 *
 * @example
 * ```tsx
 * import { Shortcut } from 'ctrl-k';
 *
 * function App() {
 *   return (
 *     <Shortcut>
 *       <YourApp />
 *     </Shortcut>
 *   );
 * }
 * ```
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
 *
 * @returns The Shortcut context value
 * @throws Error if used outside of Shortcut
 */
export function useShortcutContext(): ShortcutContextValue {
  const context = useContext(ShortcutContext);
  if (!context) {
    throw new Error('useShortcutContext must be used within a Shortcut');
  }
  return context;
}

export { ShortcutContext };
