// Stub: premium gate disabled — always renders children in static build
import React from 'react';

interface AccessGuardProps {
  children: React.ReactNode;
  className?: string;
  featureKey?: string;
  requiredTier?: string;
}

export function AccessGuard({ children }: AccessGuardProps) {
  return <>{children}</>;
}
