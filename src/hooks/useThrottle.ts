"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useDebounce Hook - For search inputs and form validation
 */
export function useDebounce<TArgs extends unknown[], TReturn>(
  callback: (...args: TArgs) => TReturn,
  delay: number,
): [(...args: TArgs) => void, boolean] {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isDebouncing, setIsDebouncing] = useState(false);

  const debouncedCallback = useCallback(
    (...args: TArgs) => {
      setIsDebouncing(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsDebouncing(false);
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [debouncedCallback, isDebouncing];
}

/**
 * useDebouncedValue Hook - For debouncing state values
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useThrottle Hook - Enhanced version with throttling state
 * Prevents excessive function calls while providing visual feedback
 */
export function useThrottle<TArgs extends unknown[], TReturn>(
  callback: (...args: TArgs) => TReturn,
  delay: number,
): [(...args: TArgs) => TReturn | undefined, boolean] {
  const lastExecuted = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isThrottling, setIsThrottling] = useState(false);

  const throttledCallback = useCallback(
    (...args: TArgs) => {
      const now = Date.now();

      if (now - lastExecuted.current >= delay) {
        lastExecuted.current = now;
        setIsThrottling(false);
        return callback(...args);
      } else {
        setIsThrottling(true);

        // Clear previous timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Set new timeout
        timeoutRef.current = setTimeout(
          () => {
            setIsThrottling(false);
            lastExecuted.current = Date.now();
            callback(...args);
          },
          delay - (now - lastExecuted.current),
        );
      }

      return undefined;
    },
    [callback, delay],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [throttledCallback, isThrottling];
}
