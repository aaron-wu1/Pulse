import { useRef, useEffect, useCallback } from 'react';

export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T & { cancel: () => void } {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const debounced = useCallback(((...args: Parameters<T>) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      savedCallback.current(...args);
    }, delay);
  }) as T & { cancel: () => void }, [delay]);

  debounced.cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return debounced;
}
