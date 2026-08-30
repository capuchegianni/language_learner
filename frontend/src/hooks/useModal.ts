import { useState, useCallback } from 'react';

export interface UseModalReturn<T = unknown> {
  isOpen: boolean;
  data: T | null;
  open: (payload?: T) => void;
  close: () => void;
  toggle: () => void;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

/**
 * Custom hook for managing modal visibility state with optional typed payload.
 */
export function useModal<T = unknown>(initialOpen = false): UseModalReturn<T> {
  const [isOpen, setIsOpen] = useState<boolean>(initialOpen);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((payload?: T) => {
    if (payload !== undefined) {
      setData(payload);
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
    setData,
  };
}
