/**
 * Modifier keys that can be used in keyboard shortcuts
 */
export type ModifierKey = 'ctrl' | 'meta' | 'alt' | 'shift';

/**
 * Configuration for a keyboard shortcut
 */
export interface KeyboardShortcut {
  /**
   * The key to listen for (e.g., 'k', 'p', 'Enter', 'Escape')
   */
  key: string;
  /**
   * Modifier keys that must be pressed along with the main key
   * @default []
   */
  modifiers?: ModifierKey[];
  /**
   * Callback function to execute when the shortcut is triggered
   */
  handler: (event: KeyboardEvent) => void;
  /**
   * Whether to prevent the default browser behavior
   * @default true
   */
  preventDefault?: boolean;
  /**
   * Whether to stop event propagation
   * @default false
   */
  stopPropagation?: boolean;
  /**
   * Whether the shortcut is currently enabled
   * @default true
   */
  enabled?: boolean;
}

/**
 * Context value provided by ShortcutProvider
 */
export interface ShortcutContextValue {
  /**
   * Register a keyboard shortcut
   */
  registerShortcut: (id: string, shortcut: KeyboardShortcut) => void;
  /**
   * Unregister a keyboard shortcut by its ID
   */
  unregisterShortcut: (id: string) => void;
  /**
   * Enable or disable a registered shortcut
   */
  setShortcutEnabled: (id: string, enabled: boolean) => void;
}

/**
 * Props for the ShortcutProvider component
 */
export interface ShortcutProviderProps {
  /**
   * Children to render within the provider
   */
  children: React.ReactNode;
}

/**
 * Options for the useShortcut hook
 */
export interface UseShortcutOptions {
  /**
   * The key to listen for (e.g., 'k', 'p', 'Enter', 'Escape')
   */
  key: string;
  /**
   * Modifier keys that must be pressed along with the main key
   * On macOS, 'cmdOrCtrl' will use 'meta', on other platforms it will use 'ctrl'
   * @default []
   */
  modifiers?: (ModifierKey | 'cmdOrCtrl')[];
  /**
   * Callback function to execute when the shortcut is triggered
   */
  handler: (event: KeyboardEvent) => void;
  /**
   * Whether to prevent the default browser behavior
   * @default true
   */
  preventDefault?: boolean;
  /**
   * Whether to stop event propagation
   * @default false
   */
  stopPropagation?: boolean;
  /**
   * Whether the shortcut is currently enabled
   * @default true
   */
  enabled?: boolean;
}
