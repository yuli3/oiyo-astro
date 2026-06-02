"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

const subscribe = (callback: () => void) => {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
};

const getSnapshot = () => {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const getServerSnapshot = () => {
  return false;
};

export const useReducedMotion = () => {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

export const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return mousePosition;
};

export const useIntersectionObserver = (
  ref: React.RefObject<HTMLElement | null>,
  options: IntersectionObserverInit = {},
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const target = ref.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        ...options,
      },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [ref, options, hasIntersected]);

  return { hasIntersected, isIntersecting };
};

export const useAnimationFrame = (callback: (time: number) => void) => {
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);
  const animateRef = useRef<(time: number) => void>(undefined);

  const animate = useCallback(
    (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callback(deltaTime);
      }
      previousTimeRef.current = time;
      if (typeof window !== "undefined") {
        requestRef.current = window.requestAnimationFrame((t) =>
          animateRef.current?.(t),
        );
      }
    },
    [callback],
  );

  useEffect(() => {
    animateRef.current = animate;
  }, [animate]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      requestRef.current = window.requestAnimationFrame((t) =>
        animateRef.current?.(t),
      );
    }
    return () => {
      if (requestRef.current && typeof window !== "undefined") {
        window.cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);
};

export const useDebounce = <T>(value: T, delay: number): T => {
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
};
