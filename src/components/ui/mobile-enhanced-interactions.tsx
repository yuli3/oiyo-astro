"use client";

import { ChevronDown, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface MobileEnhancedInteractionsProps {
  children: React.ReactNode;
  className?: string;
  enablePullToRefresh?: boolean;
  onRefresh?: () => Promise<void>;
}

// Loading state component with mobile optimizations
interface MobileLoadingStateProps {
  locale?: string;
  message?: string;
  progress?: number;
  showProgress?: boolean;
}

export function MobileEnhancedInteractions({
  children,
  className = "",
  enablePullToRefresh = true,
  onRefresh,
}: MobileEnhancedInteractionsProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const PULL_THRESHOLD = 80;
  const MAX_PULL_DISTANCE = 120;

  // Haptic feedback function
  const triggerHaptic = useCallback(
    (type: "heavy" | "light" | "medium" = "light") => {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        switch (type) {
          case "heavy":
            navigator.vibrate([30, 10, 30]);
            break;
          case "light":
            navigator.vibrate(10);
            break;
          case "medium":
            navigator.vibrate(20);
            break;
        }
      }
    },
    [],
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enablePullToRefresh || !containerRef.current) return;

      const scrollTop = containerRef.current.scrollTop;
      if (scrollTop > 0) return; // Only allow pull when at top

      startY.current = e.touches[0].clientY;
      currentY.current = startY.current;
    },
    [enablePullToRefresh],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enablePullToRefresh || !containerRef.current || startY.current === 0)
        return;

      const scrollTop = containerRef.current.scrollTop;
      if (scrollTop > 0) return;

      currentY.current = e.touches[0].clientY;
      const diff = currentY.current - startY.current;

      if (diff > 0) {
        e.preventDefault(); // Prevent default scroll behavior

        const newPullDistance = Math.min(diff * 0.5, MAX_PULL_DISTANCE);
        setPullDistance(newPullDistance);

        if (!isPulling && newPullDistance > 20) {
          setIsPulling(true);
          triggerHaptic("light");
        }

        if (newPullDistance > PULL_THRESHOLD && !isRefreshing) {
          triggerHaptic("medium");
        }
      }
    },
    [enablePullToRefresh, isPulling, isRefreshing, triggerHaptic],
  );

  const handleTouchEnd = useCallback(async () => {
    if (!enablePullToRefresh || !isPulling) return;

    if (pullDistance > PULL_THRESHOLD && onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      triggerHaptic("heavy");

      try {
        await onRefresh();
      } catch (error) {
        console.error("Refresh failed:", error);
      } finally {
        setIsRefreshing(false);
      }
    }

    setIsPulling(false);
    setPullDistance(0);
    startY.current = 0;
    currentY.current = 0;
  }, [
    enablePullToRefresh,
    isPulling,
    pullDistance,
    onRefresh,
    isRefreshing,
    triggerHaptic,
  ]);

  // Reset states when refreshing completes
  useEffect(() => {
    if (!isRefreshing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting pull-to-refresh UI state when external isRefreshing flag clears
      setPullDistance(0);
      setIsPulling(false);
    }
  }, [isRefreshing]);

  const pullProgress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const isReadyToRefresh = pullDistance > PULL_THRESHOLD;

  return (
    <div
      className={`relative overflow-auto ${className}`}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
      ref={containerRef}
      style={{
        transform: isPulling
          ? `translateY(${Math.min(pullDistance, MAX_PULL_DISTANCE)}px)`
          : undefined,
        transition: isPulling ? "none" : "transform 0.3s ease-out",
      }}
    >
      {/* Pull to Refresh Indicator */}
      {enablePullToRefresh && (isPulling || isRefreshing) && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center bg-gradient-to-b from-orange-50 to-transparent z-10"
          style={{
            height: `${Math.max(pullDistance, isRefreshing ? 60 : 0)}px`,
            transform: `translateY(-${Math.max(pullDistance, isRefreshing ? 60 : 0)}px)`,
          }}
        >
          <div className="flex items-center gap-2 text-green-600">
            {isRefreshing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span className="text-sm font-medium">새로고침 중...</span>
              </>
            ) : (
              <>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isReadyToRefresh
                      ? "rotate-180 text-orange-700"
                      : "text-orange-500"
                  }`}
                  style={{
                    transform: `rotate(${pullProgress * 180}deg)`,
                  }}
                />
                <span className="text-sm font-medium">
                  {isReadyToRefresh
                    ? "놓아서 새로고침"
                    : "아래로 당겨서 새로고침"}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div
        style={{
          paddingTop: isRefreshing ? "60px" : undefined,
          transition: "padding-top 0.3s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function MobileLoadingState({
  locale = "ko",
  message,
  progress = 0,
  showProgress = false,
}: MobileLoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6">
      <PoeticLoader />

      {/* Progress bar */}
      {showProgress && (
        <div className="w-full max-w-xs mt-6">
          <div className="w-full bg-green-50 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-400 to-green-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-center text-green-600 mt-2 font-medium">
            {Math.round(progress)}%
          </p>
        </div>
      )}
    </div>
  );
}

import { PoeticLoader } from "@/components/ui/poetic-loader";

// Hook for enhanced mobile interactions
export function useMobileInteractions() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Auto-hide header on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past threshold
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Device vibration feedback
  const vibrate = useCallback((pattern: number | number[]) => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  // Double tap detection
  const createDoubleTapHandler = useCallback(
    (callback: () => void, delay = 300) => {
      let lastTap = 0;

      return () => {
        const now = Date.now();
        if (now - lastTap < delay) {
          callback();
          lastTap = 0;
        } else {
          lastTap = now;
        }
      };
    },
    [],
  );

  return {
    createDoubleTapHandler,
    isVisible,
    vibrate,
  };
}
