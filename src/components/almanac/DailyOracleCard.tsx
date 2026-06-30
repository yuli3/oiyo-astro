// Stub: AI Daily Oracle disabled in static build
import React from 'react';
import { Sun } from 'lucide-react';

export function DailyOracleCard() {
  return (
    <div className="rounded-2xl border border-green-100 bg-green-50/30 p-6 text-center max-w-sm mx-auto">
      <Sun className="w-8 h-8 text-green-500 mx-auto mb-2" />
      <p className="text-sm text-green-700 font-semibold">오늘의 통찰</p>
      <p className="text-xs text-green-600 mt-1">AI 해석은 준비 중입니다. 지금은 입력한 정보와 테스트 결과를 바탕으로 기본 좌표를 보여줍니다.</p>
    </div>
  );
}
