# react-ctrlk

A plug-and-play React hook for keyboard shortcuts like Cmd+K. Perfect for adding search modals, command palettes, and other keyboard-driven features to your React application.

## Features

- 🎯 **Simple API** - Easy to use hook with minimal configuration
- ⌨️ **Cross-platform** - Supports `cmdOrCtrl` modifier that works on both macOS and Windows/Linux
- 🔧 **Customizable** - Define any keyboard shortcut with any combination of modifier keys
- 🧹 **Auto cleanup** - Shortcuts are automatically unregistered when components unmount
- 📦 **TypeScript** - Full TypeScript support with type definitions included
- 🪶 **Lightweight** - No external dependencies (except React as a peer dependency)

## Installation

```bash
npm install react-ctrlk
# or
yarn add react-ctrlk
# or
pnpm add react-ctrlk
```

## Quick Start

```tsx
import { CtrlKProvider, useCtrlK } from 'react-ctrlk';
import { useState } from 'react';

function App() {
  return (
    <CtrlKProvider>
      <SearchModal />
    </CtrlKProvider>
  );
}

function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);

  // Open search modal with Cmd+K (macOS) or Ctrl+K (Windows/Linux)
  useCtrlK({
    key: 'k',
    modifiers: ['cmdOrCtrl'],
    handler: () => setIsOpen(true),
  });

  // Close modal with Escape
  useCtrlK({
    key: 'Escape',
    handler: () => setIsOpen(false),
    enabled: isOpen, // Only listen when modal is open
  });

  if (!isOpen) return null;

  return (
    <div className="modal">
      <input placeholder="Search..." autoFocus />
    </div>
  );
}
```

## API

### `<CtrlKProvider>`

Wrap your application or a portion of it with this provider to enable keyboard shortcuts.

```tsx
import { CtrlKProvider } from 'react-ctrlk';

function App() {
  return (
    <CtrlKProvider>
      <YourApp />
    </CtrlKProvider>
  );
}
```

### `useCtrlK(options)`

Hook for registering keyboard shortcuts.

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `key` | `string` | (required) | The key to listen for (e.g., `'k'`, `'Escape'`, `'Enter'`) |
| `modifiers` | `Array<'ctrl' \| 'meta' \| 'alt' \| 'shift' \| 'cmdOrCtrl'>` | `[]` | Modifier keys that must be pressed |
| `handler` | `(event: KeyboardEvent) => void` | (required) | Callback when shortcut is triggered |
| `preventDefault` | `boolean` | `true` | Whether to prevent default browser behavior |
| `stopPropagation` | `boolean` | `false` | Whether to stop event propagation |
| `enabled` | `boolean` | `true` | Whether the shortcut is currently enabled |

#### Modifier Keys

- `'ctrl'` - Control key
- `'meta'` - Meta/Command key (⌘ on macOS, ⊞ on Windows)
- `'alt'` - Alt/Option key
- `'shift'` - Shift key
- `'cmdOrCtrl'` - Meta on macOS, Ctrl on Windows/Linux (recommended for cross-platform shortcuts)

### `useCtrlKContext()`

Hook to access the underlying context for advanced use cases.

```tsx
import { useCtrlKContext } from 'react-ctrlk';

function MyComponent() {
  const { registerShortcut, unregisterShortcut, setShortcutEnabled } = useCtrlKContext();
  
  // Use these functions for programmatic control
}
```

## Examples

### Command Palette

```tsx
function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useCtrlK({
    key: 'k',
    modifiers: ['cmdOrCtrl'],
    handler: () => setIsOpen(true),
  });

  useCtrlK({
    key: 'Escape',
    handler: () => setIsOpen(false),
    enabled: isOpen,
  });

  // ... render command palette
}
```

### Multiple Shortcuts

```tsx
function Editor() {
  useCtrlK({
    key: 's',
    modifiers: ['cmdOrCtrl'],
    handler: () => saveDocument(),
  });

  useCtrlK({
    key: 'z',
    modifiers: ['cmdOrCtrl'],
    handler: () => undo(),
  });

  useCtrlK({
    key: 'z',
    modifiers: ['cmdOrCtrl', 'shift'],
    handler: () => redo(),
  });
}
```

### Conditional Shortcuts

```tsx
function EditableContent({ isEditing }) {
  useCtrlK({
    key: 'Enter',
    modifiers: ['cmdOrCtrl'],
    handler: () => submitContent(),
    enabled: isEditing, // Only active when editing
  });
}
```

## TypeScript

The package includes TypeScript definitions. All types are exported:

```tsx
import type { 
  UseCtrlKOptions, 
  KeyboardShortcut, 
  ModifierKey,
  CtrlKContextValue,
  CtrlKProviderProps
} from 'react-ctrlk';
```

## Compatibility

- React, Next.js, Gatsby, and other React-based frameworks
- Modern browsers (Brave, Chrome, Firefox, Safari, Edge)

## License

MIT