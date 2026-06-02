"use client";

import { AnimatePresence, m } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";

interface SwipeGestureProps {
  children: ReactNode;
  className?: string;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  threshold?: number;
}

interface TouchOptimizedButtonProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  haptic?: boolean;
  onClick?: () => void;
  size?: "lg" | "md" | "sm";
  variant?: "default" | "ghost" | "outline";
}

interface TouchOptimizedCardProps {
  children: ReactNode;
  className?: string;
  haptic?: boolean;
  onClick?: () => void;
  pressable?: boolean;
}

export function SwipeGesture({
  children,
  className = "",
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  threshold = 50,
}: SwipeGestureProps) {
  const [touchStart, setTouchStart] = useState<null | { x: number; y: number }>(
    null,
  );
  const [touchEnd, setTouchEnd] = useState<null | { x: number; y: number }>(
    null,
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > threshold;
    const isRightSwipe = distanceX < -threshold;
    const isUpSwipe = distanceY > threshold;
    const isDownSwipe = distanceY < -threshold;

    // Determine which swipe was stronger (horizontal vs vertical)
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      if (isLeftSwipe && onSwipeLeft) {
        onSwipeLeft();
      }
      if (isRightSwipe && onSwipeRight) {
        onSwipeRight();
      }
    } else {
      if (isUpSwipe && onSwipeUp) {
        onSwipeUp();
      }
      if (isDownSwipe && onSwipeDown) {
        onSwipeDown();
      }
    }
  };

  return (
    <div
      className={className}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
      style={{
        touchAction: "pan-y", // Allow vertical scrolling but capture horizontal swipes
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {children}
    </div>
  );
}

export function TouchOptimizedButton({
  children,
  className = "",
  disabled = false,
  haptic = true,
  onClick,
  size = "md",
  variant = "default",
}: TouchOptimizedButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const baseClasses =
    "relative overflow-hidden rounded-lg font-medium transition-all duration-200 select-none";

  const sizeClasses = {
    lg: "px-6 py-4 text-lg min-h-[56px] min-w-[56px]",
    md: "px-4 py-3 text-base min-h-[48px] min-w-[48px]",
    sm: "px-3 py-2 text-sm min-h-[40px] min-w-[40px]",
  };

  const variantClasses = {
    default: "bg-orange-500 text-white hover:bg-green-600 active:bg-orange-700",
    ghost: "text-orange-500 hover:bg-orange-50 active:bg-orange-100",
    outline:
      "border-2 border-orange-500 text-orange-500 hover:bg-orange-50 active:bg-orange-100",
  };

  const disabledClasses = "opacity-50 cursor-not-allowed pointer-events-none";

  const triggerHapticFeedback = () => {
    if (!haptic) return;

    // Vibration API for Android devices
    if ("vibrate" in navigator && navigator.vibrate) {
      navigator.vibrate(10); // Short vibration (10ms)
    }

    // Web Haptics API (experimental, mainly iOS Safari) - disabled for now due to limited support
    // if ('virtualKeyboard' in navigator && navigator.virtualKeyboard) {
    //   (navigator.virtualKeyboard as any).vibrate?.(10);
    // }
  };

  const handleTouchStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;

    setIsPressed(true);
    triggerHapticFeedback();

    // Create ripple effect
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const touch = "touches" in e ? e.touches[0] : e;
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      const newRipple = {
        id: Date.now(),
        x,
        y,
      };

      setRipples((prev) => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);
    }
  };

  const handleTouchEnd = () => {
    if (disabled) return;
    setIsPressed(false);
  };

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
  };

  // Enhanced touch area for better accessibility
  const touchAreaStyle: React.CSSProperties = {
    minHeight: size === "sm" ? "44px" : size === "md" ? "48px" : "56px",
    minWidth: size === "sm" ? "44px" : size === "md" ? "48px" : "56px",
    touchAction: "manipulation",
    userSelect: "none",
    WebkitTouchCallout: "none",
    WebkitUserSelect: "none",
  };

  return (
    <m.button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? disabledClasses : ""} ${className}`}
      disabled={disabled}
      onClick={handleClick}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onTouchEnd={handleTouchEnd}
      onTouchStart={handleTouchStart}
      ref={buttonRef}
      style={touchAreaStyle}
      transition={{ duration: 0.1 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      {/* Ripple Effect */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <m.div
            animate={{ height: 100, opacity: 0, width: 100 }}
            className="absolute rounded-full bg-white/30 pointer-events-none"
            exit={{ opacity: 0 }}
            initial={{ height: 0, opacity: 0.8, width: 0 }}
            key={ripple.id}
            style={{
              left: ripple.x,
              top: ripple.y,
              transform: "translate(-50%, -50%)",
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* Button Content */}
      <m.div
        animate={{ scale: isPressed ? 0.95 : 1 }}
        className="relative z-10 flex items-center justify-center gap-2"
        transition={{ duration: 0.1 }}
      >
        {children}
      </m.div>
    </m.button>
  );
}

export function TouchOptimizedCard({
  children,
  className = "",
  haptic = false,
  onClick,
  pressable = false,
}: TouchOptimizedCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const triggerHapticFeedback = () => {
    if (!haptic) return;

    if ("vibrate" in navigator && navigator.vibrate) {
      navigator.vibrate(5); // Very light vibration for card interactions
    }
  };

  const handleTouchStart = () => {
    if (!pressable) return;
    setIsPressed(true);
    if (haptic) triggerHapticFeedback();
  };

  const handleTouchEnd = () => {
    if (!pressable) return;
    setIsPressed(false);
  };

  const handleClick = () => {
    if (!onClick) return;
    onClick();
  };

  return (
    <m.div
      className={`${className} ${pressable ? "cursor-pointer select-none" : ""}`}
      onClick={pressable ? handleClick : undefined}
      onMouseDown={pressable ? handleTouchStart : undefined}
      onMouseUp={pressable ? handleTouchEnd : undefined}
      onTouchCancel={pressable ? handleTouchEnd : undefined}
      onTouchEnd={pressable ? handleTouchEnd : undefined}
      onTouchStart={pressable ? handleTouchStart : undefined}
      ref={cardRef}
      style={{
        touchAction: "manipulation",
        userSelect: "none",
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
      }}
      transition={{ duration: 0.1 }}
      whileTap={pressable ? { scale: 0.98 } : {}}
    >
      <m.div
        animate={{ scale: isPressed ? 0.98 : 1 }}
        transition={{ duration: 0.1 }}
      >
        {children}
      </m.div>
    </m.div>
  );
}

// Hook for responsive touch targets
export function useResponsiveTouchTarget() {
  const [touchTargetSize, setTouchTargetSize] = useState(44); // Default iOS minimum
  const isTouchDevice = useTouchDevice();

  useEffect(() => {
    if (!isTouchDevice) {
      setTimeout(() => setTouchTargetSize(32), 0); // Smaller for mouse users
      return;
    }

    // Adjust based on device
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("android")) {
      setTimeout(() => setTouchTargetSize(48), 0); // Material Design minimum
    } else if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
      setTimeout(() => setTouchTargetSize(44), 0); // iOS Human Interface Guidelines
    } else {
      setTimeout(() => setTouchTargetSize(44), 0); // Default to iOS size
    }
  }, [isTouchDevice]);

  return touchTargetSize;
}

// Hook for detecting touch device
export function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-expect-error - Legacy IE property
        navigator.msMaxTouchPoints > 0
      );
    };

    const timer = setTimeout(() => setIsTouchDevice(checkTouchDevice()), 0);
    return () => clearTimeout(timer);
  }, []);

  return isTouchDevice;
}
