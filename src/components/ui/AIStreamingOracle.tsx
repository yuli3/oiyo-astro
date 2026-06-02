"use client";

import { m } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface AIStreamingOracleProps {
  className?: string;
  onComplete?: () => void;
  speed?: number; // ms per char
  startDelay?: number;
  text: string;
  title?: string;
}

export function AIStreamingOracle({
  className,
  onComplete,
  speed = 40,
  startDelay = 0,
  text,
  title,
}: AIStreamingOracleProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const index = useRef(0);
  const timeoutId = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    // Reset if text changes
    // Reset if text changes
    setTimeout(() => {
      setDisplayedText("");
      setIsComplete(false);
      index.current = 0;
    }, 0);

    // Clear previous timeout
    if (timeoutId.current) clearTimeout(timeoutId.current);

    const startStreaming = () => {
      const step = () => {
        if (index.current < text.length) {
          const char = text.charAt(index.current);
          setDisplayedText((prev) => prev + char);
          index.current++;

          // Respiratory Rhythm Logic
          let delay = speed;

          // Pause at punctuation to simulate breathing/thinking
          if (char === ".")
            delay = speed * 15; // Long pause
          else if (char === ",")
            delay = speed * 8; // Medium pause
          else if (char === "!" || char === "?")
            delay = speed * 12; // Emphatic pause
          else if (char === "\n") delay = speed * 10; // Newline pause

          // Random slight jitter for "human/organic" feel
          delay += (Math.random() - 0.5) * (speed * 0.5);

          timeoutId.current = setTimeout(step, delay);
        } else {
          setIsComplete(true);
          if (onComplete) onComplete();
        }
      };

      step();
    };

    if (startDelay > 0) {
      timeoutId.current = setTimeout(startStreaming, startDelay);
    } else {
      startStreaming();
    }

    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current);
    };
  }, [text, speed, startDelay, onComplete]);

  return (
    <div
      aria-label={text}
      className={cn("inline whitespace-pre-wrap", className)}
    >
      {title && <h3 className="text-xl font-black mb-4 font-serif">{title}</h3>}
      {displayedText}
      {!isComplete && (
        <span className="inline-block w-[2px] h-[1em] bg-green-500 ml-0.5 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)] align-middle" />
      )}
      {/* 
         Accessibility: The full text is in aria-label, but we might want aria-live for screen readers.
         However, character-by-character live regions can be annoying. 
         Ideally, we update the live region only when chunks or sentences complete, or just let the user read the final text.
         For this "Oracle" effect, visual users see streaming. Screen readers should just get the content.
         The aria-label approach above helps, or hiding the stream and showing a sr-only full text.
      */}
      <span className="sr-only">{text}</span>
    </div>
  );
}
