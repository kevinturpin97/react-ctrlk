import React, { useState } from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { CtrlKProvider, useCtrlK, useCtrlKContext } from './index';

afterEach(() => {
  cleanup();
});

describe('CtrlKProvider', () => {
  it('renders children correctly', () => {
    render(
      <CtrlKProvider>
        <div data-testid="child">Hello</div>
      </CtrlKProvider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('provides context to children', () => {
    function ContextConsumer() {
      const context = useCtrlKContext();
      return <div data-testid="consumer">{context ? 'has-context' : 'no-context'}</div>;
    }

    render(
      <CtrlKProvider>
        <ContextConsumer />
      </CtrlKProvider>
    );

    expect(screen.getByTestId('consumer')).toHaveTextContent('has-context');
  });
});

describe('useCtrlKContext', () => {
  it('throws error when used outside of CtrlKProvider', () => {
    function TestComponent() {
      useCtrlKContext();
      return null;
    }

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      'useCtrlKContext must be used within a CtrlKProvider'
    );

    consoleSpy.mockRestore();
  });
});

describe('useCtrlK', () => {
  it('calls handler when matching key is pressed', () => {
    const handler = vi.fn();

    function TestComponent() {
      useCtrlK({
        key: 'k',
        handler,
      });
      return <div data-testid="test">Test</div>;
    }

    render(
      <CtrlKProvider>
        <TestComponent />
      </CtrlKProvider>
    );

    fireEvent.keyDown(document, { key: 'k' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not call handler when different key is pressed', () => {
    const handler = vi.fn();

    function TestComponent() {
      useCtrlK({
        key: 'k',
        handler,
      });
      return <div data-testid="test">Test</div>;
    }

    render(
      <CtrlKProvider>
        <TestComponent />
      </CtrlKProvider>
    );

    fireEvent.keyDown(document, { key: 'j' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('calls handler when key with ctrl modifier is pressed', () => {
    const handler = vi.fn();

    function TestComponent() {
      useCtrlK({
        key: 'k',
        modifiers: ['ctrl'],
        handler,
      });
      return <div data-testid="test">Test</div>;
    }

    render(
      <CtrlKProvider>
        <TestComponent />
      </CtrlKProvider>
    );

    // Should not trigger without ctrl
    fireEvent.keyDown(document, { key: 'k' });
    expect(handler).not.toHaveBeenCalled();

    // Should trigger with ctrl
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('calls handler when key with meta modifier is pressed', () => {
    const handler = vi.fn();

    function TestComponent() {
      useCtrlK({
        key: 'k',
        modifiers: ['meta'],
        handler,
      });
      return <div data-testid="test">Test</div>;
    }

    render(
      <CtrlKProvider>
        <TestComponent />
      </CtrlKProvider>
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
      useCtrlK({
        key: 'k',
        handler,
        enabled: false,
      });
      return <div data-testid="test">Test</div>;
    }

    render(
      <CtrlKProvider>
        <TestComponent />
      </CtrlKProvider>
    );

    fireEvent.keyDown(document, { key: 'k' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('prevents default behavior by default', () => {
    const handler = vi.fn();

    function TestComponent() {
      useCtrlK({
        key: 'k',
        handler,
      });
      return <div data-testid="test">Test</div>;
    }

    render(
      <CtrlKProvider>
        <TestComponent />
      </CtrlKProvider>
    );

    const event = new KeyboardEvent('keydown', { key: 'k', bubbles: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    document.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('does not prevent default when preventDefault is false', () => {
    const handler = vi.fn();

    function TestComponent() {
      useCtrlK({
        key: 'k',
        handler,
        preventDefault: false,
      });
      return <div data-testid="test">Test</div>;
    }

    render(
      <CtrlKProvider>
        <TestComponent />
      </CtrlKProvider>
    );

    const event = new KeyboardEvent('keydown', { key: 'k', bubbles: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    document.dispatchEvent(event);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('stops propagation when stopPropagation is true', () => {
    const handler = vi.fn();

    function TestComponent() {
      useCtrlK({
        key: 'k',
        handler,
        stopPropagation: true,
      });
      return <div data-testid="test">Test</div>;
    }

    render(
      <CtrlKProvider>
        <TestComponent />
      </CtrlKProvider>
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
      useCtrlK({
        key: 'k',
        handler: handler1,
      });
      useCtrlK({
        key: 'p',
        handler: handler2,
      });
      return <div data-testid="test">Test</div>;
    }

    render(
      <CtrlKProvider>
        <TestComponent />
      </CtrlKProvider>
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
        <CtrlKProvider>
          {show && <ShortcutComponent handler={handler} />}
        </CtrlKProvider>
      );
    }

    function ShortcutComponent({ handler }: { handler: () => void }) {
      useCtrlK({
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
      useCtrlK({
        key: 'K',
        handler,
      });
      return <div data-testid="test">Test</div>;
    }

    render(
      <CtrlKProvider>
        <TestComponent />
      </CtrlKProvider>
    );

    fireEvent.keyDown(document, { key: 'k' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('handles Escape key for closing modals', () => {
    const handler = vi.fn();

    function TestComponent() {
      useCtrlK({
        key: 'Escape',
        handler,
      });
      return <div data-testid="test">Test</div>;
    }

    render(
      <CtrlKProvider>
        <TestComponent />
      </CtrlKProvider>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('can toggle shortcut enabled state dynamically', () => {
    const handler = vi.fn();

    function TestComponent() {
      const [enabled, setEnabled] = useState(true);
      useCtrlK({
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
      <CtrlKProvider>
        <TestComponent />
      </CtrlKProvider>
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
