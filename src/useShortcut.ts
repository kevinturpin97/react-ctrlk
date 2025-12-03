import { useCallback, useEffect, useId } from 'react';
import { useShortcutContext } from './Shortcut';
import type { ModifierKey, UseShortcutOptions } from './types';

// Extend Navigator interface to include userAgentData (modern browsers)
interface NavigatorUAData {
  platform?: string;
}

declare global {
  interface Navigator {
    userAgentData?: NavigatorUAData;
  }
}

/**
 * Detects if the current platform is macOS
 */
function isMacOS(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  // Use userAgentData if available (modern browsers), otherwise fall back to userAgent
  if (navigator.userAgentData?.platform) {
    return navigator.userAgentData.platform.toUpperCase().indexOf('MAC') >= 0;
  }
  return navigator.userAgent.toUpperCase().indexOf('MAC') >= 0;
}

/**
 * Resolves 'cmdOrCtrl' modifier to the appropriate modifier for the current platform
 */
function resolveModifiers(modifiers: (ModifierKey | 'cmdOrCtrl')[]): ModifierKey[] {
  const isMac = isMacOS();
  return modifiers.map((mod) => {
    if (mod === 'cmdOrCtrl') {
      return isMac ? 'meta' : 'ctrl';
    }
    return mod;
  });
}

/**
 * Hook for registering keyboard shortcuts in your React application.
 * Must be used within a ShortcutProvider.
 *
 * @example
 * ```tsx
 * import { useShortcut } from 'ctrl-k';
 *
 * function SearchModal() {
 *   const [isOpen, setIsOpen] = useState(false);
 *
 *   // Open search modal with Cmd+K (macOS) or Ctrl+K (Windows/Linux)
 *   useShortcut({
 *     key: 'k',
 *     modifiers: ['cmdOrCtrl'],
 *     handler: () => setIsOpen(true),
 *   });
 *
 *   // Close modal with Escape
 *   useShortcut({
 *     key: 'Escape',
 *     handler: () => setIsOpen(false),
 *     enabled: isOpen,
 *   });
 *
 *   return isOpen ? <div>Search Modal</div> : null;
 * }
 * ```
 */
export function useShortcut(options: UseShortcutOptions): void {
  const { key, modifiers = [], handler, preventDefault = true, stopPropagation = false, enabled = true } = options;

  const context = useShortcutContext();
  const id = useId();

  // Memoize the handler to avoid unnecessary re-registrations
  const stableHandler = useCallback(
    (event: KeyboardEvent) => {
      handler(event);
    },
    [handler]
  );

  useEffect(() => {
    const resolvedModifiers = resolveModifiers(modifiers);

    context.registerShortcut(id, {
      key,
      modifiers: resolvedModifiers,
      handler: stableHandler,
      preventDefault,
      stopPropagation,
      enabled,
    });

    return () => {
      context.unregisterShortcut(id);
    };
  }, [context, id, key, modifiers, stableHandler, preventDefault, stopPropagation, enabled]);
}
