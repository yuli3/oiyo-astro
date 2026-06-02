// Stub: AI Daily Oracle disabled in static build
import React from 'react';
import { Sun } from 'lucide-react';

export function DailyOracleCard() {
  return (
    <div className="rounded-2xl border border-green-100 bg-green-50/30 p-6 text-center max-w-sm mx-auto">
      <Sun className="w-8 h-8 text-green-400 mx-auto mb-2" />
      <p className="text-sm text-green-600 font-medium">Daily Oracle</p>
      <p className="text-xs text-green-400 mt-1">Available in the full version</p>
    </div>
  );
}
