import { useRef, useEffect, useCallback } from 'react';

export function useThrottle<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef<number>(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const throttled = useCallback(((...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      callback(...args);
    } else if (!timeout.current) {
      const remaining = delay - (now - lastCall.current);
      timeout.current = setTimeout(() => {
        lastCall.current = Date.now();
        timeout.current = null;
        callback(...args);
      }, remaining);
    }
  }) as T, [callback, delay]);

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  return throttled;
}