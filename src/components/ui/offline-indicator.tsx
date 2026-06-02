"use client";

import { AnimatePresence, m } from "framer-motion";
import { WifiOff } from "lucide-react";
import React, { useEffect, useState } from "react";

export const OfflineIndicator = ({ locale }: { locale?: string }) => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <m.div
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-red-500/90 backdrop-blur text-white rounded-full shadow-lg flex items-center gap-3"
          exit={{ opacity: 0, y: 100 }}
          initial={{ opacity: 0, y: 100 }}
        >
          <WifiOff className="w-5 h-5" />
          <span className="font-medium text-sm">
            You are offline. Reconnecting...
          </span>
        </m.div>
      )}
    </AnimatePresence>
  );
};

export const OfflineStatusBadge = ({ locale }: { locale?: string }) => {
  // A smaller badge version if needed elsewhere
  return null;
};
