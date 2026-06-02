"use client";

import { Info } from "lucide-react";
import React from "react";

import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InputGroupProps {
  children: React.ReactNode;
  className?: string;
  error?: string;
  helpText?: string;
  label: string;
}

export function InputGroup({
  children,
  className = "",
  error,
  helpText,
  label,
}: InputGroupProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Label className="text-sm font-semibold text-green-800">{label}</Label>
        {helpText && (
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-green-600/60 cursor-help hover:text-green-700 transition-colors" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                {helpText}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div>
        {children}
        {error && (
          <p className="text-xs text-rose-500 mt-1.5 font-medium">{error}</p>
        )}
      </div>
    </div>
  );
}
