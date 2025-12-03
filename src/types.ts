import React from 'react';

/**
 * Modifier keys that can be used in keyboard shortcuts
 */
export type ModifierKey = 'ctrl' | 'meta' | 'alt' | 'shift';

/**
 * Optional configuration options for a shortcut
 */
export interface ShortcutOptions {
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
  /**
   * Optional ref to scope the shortcut to a specific element.
   * The shortcut will only trigger if the event target is contained within this element.
   */
  ref?: React.RefObject<HTMLElement | null>;
}

/**
 * Configuration for a keyboard shortcut stored in the context
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
   * Additional options for the shortcut behavior
   */
  options?: ShortcutOptions;
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
export interface ShortcutProps {
  /**
   * Children to render within the provider
   */
  children: React.ReactNode;
}

/**
 * Options passed to the useShortcut hook
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
   * Additional options for the shortcut behavior
   */
  options?: ShortcutOptions;
}