import React, { useState } from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { ShortcutProvider, useShortcut, useShortcutContext } from './index';

afterEach(() => {
  cleanup();
});

describe('ShortcutProvider', () => {
  it('renders children correctly', () => {
    render(
      <ShortcutProvider>
        <div data-testid="child">Hello</div>
      </ShortcutProvider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('provides context to children', () => {
    function ContextConsumer() {
      const context = useShortcutContext();
      return <div data-testid="consumer">{context ? 'has-context' : 'no-context'}</div>;
    }

    render(
      <ShortcutProvider>
        <ContextConsumer />
      </ShortcutProvider>
    );

    expect(screen.getByTestId('consumer')).toHaveTextContent('has-context');
  });
});

describe('useShortcutContext', () => {
  it('throws error when used outside of ShortcutProvider', () => {
    function TestComponent() {
      useShortcutContext();
      return null;
    }

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      'useShortcutContext must be used within a ShortcutProvider'
    );

    consoleSpy.mockRestore();
  });
});

describe('useShortcut', () => {
  it('calls handler when matching key is pressed', () => {
    const handler = vi.fn();

    function TestComponent() {
      useShortcut({
        key: 'k',
        handler,
      });
      return <div data-testid="test">Test</div>;
    }

    render(
      <ShortcutProvider>
        <TestComponent />
      </ShortcutProvider>
    );

    fireEvent.keyDown(document, { key: 'k' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not call handler when different key is pressed', () => {
    const handler = vi.fn();

    function TestComponent() {
      useShortcut({
        key: 'k',
        handler,
      });
      return <div data-testid="test">Test</div>;
    }

    render(
      <ShortcutProvider>
        <TestComponent />
      </ShortcutProvider>
    );

    fireEvent.keyDown(document, { key: 'j' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('calls handler when key with ctrl modifier is pressed', () => {
    const handler = vi.fn();

    function TestComponent() {
      useShortcut({
        key: 'k',
        modifiers: ['ctrl'],
        handler,
      });
      return <div data-testid="test">Test</div>;
    }

    render(
      <ShortcutProvider>
        <TestComponent />
      </ShortcutProvider>
    );

    // Should not trigger without ctrl
    fireEvent.keyDown(document, { key: 'k' });
    expect(handler).not.toHaveBeenCalled();

    // Should trigger with ctrl
    fireEvent.keyDown(document, { key: 'k', Shortcutey: true });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('calls handler when key with meta modifier is pressed', () => {
    const handler = vi.fn();

    function TestComponent() {
      useShortcut({
        key: 'k',
        modifiers: ['meta'],
        handler,
      });
      return <div data-testid="test">Test</div>;
    }

    render(
      <ShortcutProvider>
        <TestComponent />
      </ShortcutProvider>
    );

    // Should not trigger without meta
    fireEvent.keyDown(document, { key: 'k' });
    expect(handler).not.toHaveBeenCalled();

    // Should trigger with meta
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not call handler when shortcut is disabled', () => {
    const handler = vi.fn();

    function TestComponent() {
      useShortcut({
        key: 'k',
        handler,
        enabled: false,
      });
      return <div data-testid="test">Test</div>;
    }

    render(
      <ShortcutProvider>
        <TestComponent />
      </ShortcutProvider>
    );

    fireEvent.keyDown(document, { key: 'k' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('prevents default behavior by default', () => {
    const handler = vi.fn();

    function TestComponent() {
      useShortcut({
        key: 'k',
        handler,
      });
      return <div data-testid="test">Test</div>;
    }

    render(
      <ShortcutProvider>
        <TestComponent />
      </ShortcutProvider>
    );

    const event = new KeyboardEvent('keydown', { key: 'k', bubbles: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    document.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('does not prevent default when preventDefault is false', () => {
    const handler = vi.fn();

    function TestComponent() {
      useShortcut({
        key: 'k',
        handler,
        preventDefault: false,
      });
      return <div data-testid="test">Test</div>;
    }

    render(
      <ShortcutProvider>
        <TestComponent />
      </ShortcutProvider>
    );

    const event = new KeyboardEvent('keydown', { key: 'k', bubbles: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    document.dispatchEvent(event);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('stops propagation when stopPropagation is true', () => {
    const handler = vi.fn();

    function TestComponent() {
      useShortcut({
        key: 'k',
        handler,
        stopPropagation: true,
      });
      return <div data-testid="test">Test</div>;
    }

    render(
      <ShortcutProvider>
        <TestComponent />
      </ShortcutProvider>
    );

    const event = new KeyboardEvent('keydown', { key: 'k', bubbles: true });
    const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

    document.dispatchEvent(event);

    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it('handles multiple shortcuts simultaneously', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    function TestComponent() {
      useShortcut({
        key: 'k',
        handler: handler1,
      });
      useShortcut({
        key: 'p',
        handler: handler2,
      });
      return <div data-testid="test">Test</div>;
    }

    render(
      <ShortcutProvider>
        <TestComponent />
      </ShortcutProvider>
    );

    fireEvent.keyDown(document, { key: 'k' });
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).not.toHaveBeenCalled();

    fireEvent.keyDown(document, { key: 'p' });
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('cleans up shortcuts when component unmounts', () => {
    const handler = vi.fn();

    function TestComponent({ show }: { show: boolean }) {
      return (
        <ShortcutProvider>
          {show && <ShortcutComponent handler={handler} />}
        </ShortcutProvider>
      );
    }

    function ShortcutComponent({ handler }: { handler: () => void }) {
      useShortcut({
        key: 'k',
        handler,
      });
      return <div data-testid="test">Test</div>;
    }

    const { rerender } = render(<TestComponent show={true} />);

    fireEvent.keyDown(document, { key: 'k' });
    expect(handler).toHaveBeenCalledTimes(1);

    // Unmount the component with the shortcut
    rerender(<TestComponent show={false} />);

    fireEvent.keyDown(document, { key: 'k' });
    // Should still be 1 because the shortcut was unregistered
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('handles key matching case-insensitively', () => {
    const handler = vi.fn();

    function TestComponent() {
      useShortcut({
        key: 'K',
        handler,
      });
      return <div data-testid="test">Test</div>;
    }

    render(
      <ShortcutProvider>
        <TestComponent />
      </ShortcutProvider>
    );

    fireEvent.keyDown(document, { key: 'k' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('handles Escape key for closing modals', () => {
    const handler = vi.fn();

    function TestComponent() {
      useShortcut({
        key: 'Escape',
        handler,
      });
      return <div data-testid="test">Test</div>;
    }

    render(
      <ShortcutProvider>
        <TestComponent />
      </ShortcutProvider>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('can toggle shortcut enabled state dynamically', () => {
    const handler = vi.fn();

    function TestComponent() {
      const [enabled, setEnabled] = useState(true);
      useShortcut({
        key: 'k',
        handler,
        enabled,
      });
      return (
        <button data-testid="toggle" onClick={() => setEnabled(!enabled)}>
          Toggle
        </button>
      );
    }

    render(
      <ShortcutProvider>
        <TestComponent />
      </ShortcutProvider>
    );

    // Should trigger when enabled
    fireEvent.keyDown(document, { key: 'k' });
    expect(handler).toHaveBeenCalledTimes(1);

    // Disable the shortcut
    fireEvent.click(screen.getByTestId('toggle'));

    // Should not trigger when disabled
    fireEvent.keyDown(document, { key: 'k' });
    expect(handler).toHaveBeenCalledTimes(1);

    // Re-enable the shortcut
    fireEvent.click(screen.getByTestId('toggle'));

    // Should trigger again when re-enabled
    fireEvent.keyDown(document, { key: 'k' });
    expect(handler).toHaveBeenCalledTimes(2);
  });
});
