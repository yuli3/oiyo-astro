"use client";

import { m } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

import { useAnalytics } from "@/hooks/use-analytics";
import { SmartLinkProps } from "@/lib/ontology/types";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/registry/routes";

/**
 * SmartLink: A context-aware navigation component that provides visual cues
 * for highly relevant ontology paths.
 */
export const SmartLink: React.FC<SmartLinkProps & { className?: string }> = ({
  className,
  contextHints = [],
  displayText,
  premium = false,
  showRelevanceBadge = true,
  targetRoute,
}) => {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const { trackButtonClick } = useAnalytics();

  // Handle targetRoute as a function from ROUTES or a string
  const isRegistryRoute =
    typeof targetRoute === "object" && "path" in targetRoute;
  const href = isRegistryRoute
    ? (targetRoute as any).path(locale)
    : typeof targetRoute === "function"
      ? (targetRoute as any)(locale)
      : targetRoute;

  const metadata = isRegistryRoute ? (targetRoute as any).metadata : null;

  const handleClick = () => {
    trackButtonClick(`smart_link_${displayText || "unlabeled"}`, {
      href,
      owner: metadata?.owner,
      premium,
      role: metadata?.role,
      tier: metadata?.tier,
    });
  };

  // Logic for "Relevance" (Mocked for now until RelevanceEngine is fully integrated)
  const isHighlyRelevant = contextHints.length > 0;

  return (
    <Link className="group block w-full" href={href} onClick={handleClick}>
      <m.div
        className={cn(
          "flex items-center justify-between p-4 rounded-2xl transition-all duration-300",
          "bg-green-50 hover:bg-green-100 border border-green-200/50 hover:border-green-300 shadow-sm",
          premium && "border-amber-200 bg-amber-50/50 hover:bg-amber-100/50",
          className,
        )}
        whileHover={{ scale: 1.02, x: 4 }}
      >
        <div className="flex items-center gap-3">
          {showRelevanceBadge && isHighlyRelevant && (
            <m.div
              animate={{ opacity: 1, scale: 1 }}
              className="p-1.5 rounded-full bg-green-100 text-green-600"
              initial={{ opacity: 0, scale: 0.8 }}
            >
              <Sparkles className="w-3 h-3" />
            </m.div>
          )}
          <span
            className={cn(
              "text-sm font-semibold text-inherit",
              premium && "text-inherit",
            )}
          >
            {displayText}
          </span>
        </div>

        <ArrowRight
          className={cn(
            "w-4 h-4 text-inherit transition-colors",
            premium && "text-inherit",
          )}
        />
      </m.div>
    </Link>
  );
};
