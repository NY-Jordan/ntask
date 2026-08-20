import { useEffect } from 'react';

/**
 * A borderless always-on-top window has no OS-level "click outside to
 * dismiss" — the webview simply loses focus. Listening for that blur event
 * is what makes the open panel behave like a normal popover.
 */
export function useCloseOnBlur(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;

    function handleBlur() {
      onClose();
    }

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [isOpen, onClose]);
}
