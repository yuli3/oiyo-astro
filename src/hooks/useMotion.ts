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

/**
 * The store behind `useReducedMotion`, exported so the subscription can be
 * tested without a DOM renderer — this repo tests components through
 * `renderToStaticMarkup`, which never exercises a subscription.
 *
 * Worth testing directly: the eight private copies this hook replaced differed
 * exactly here, and one of them never subscribed at all.
 */
export const reducedMotionStore = { subscribe, getSnapshot, getServerSnapshot };

export const useReducedMotion = () => {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

/**
 * Non-hook read of the same preference, for event handlers and imperative code
 * (smooth scrolling, canvas setup) that cannot call a hook.
 *
 * Returns false during SSR, matching `useReducedMotion`'s server snapshot.
 */
export const prefersReducedMotion = () =>
  typeof window !== "undefined" && getSnapshot();

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

/**
 * Per-frame callback that honours the motion contract: when the user asks for
 * reduced motion the loop does not run at all.
 *
 * This is the JS half of the contract in src/styles/global.css — CSS cannot
 * reach requestAnimationFrame. Pass `essential: true` only for a loop whose
 * output carries information rather than decoration (the same bar as the
 * `data-motion="essential"` attribute).
 */
export const useAnimationFrame = (
  callback: (time: number) => void,
  { essential = false }: { essential?: boolean } = {},
) => {
  const reducedMotion = useReducedMotion();
  const paused = reducedMotion && !essential;
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
    if (paused) return;
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
  }, [paused]);
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
