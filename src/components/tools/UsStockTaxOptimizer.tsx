import { useState, useMemo } from 'react';

export default function UsStockTaxOptimizer({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [realizedGains, setRealizedGains] = useState<number>(15000000); // 올해 실현 확정 수익 (기본 1,500만원)
  const [unrealizedLoss, setUnrealizedLoss] = useState<number>(8000000); // 보유 중인 마이너스 평가손실 (기본 800만원)
  const [usdRate, setUsdRate] = useState<number>(1380); // 환율 (1,380원/달러)
  const [plannedHarvest, setPlannedHarvest] = useState<number>(8000000); // 실제 매도 손실상계할 금액

  const BASIC_DEDUCTION = 2500000; // 250만원 연간 기본공제
  const TAX_RATE = 0.22; // 양도세 20% + 지방소득세 2%

  const calculation = useMemo(() => {
    // 1. 손실상계 전 세금 계산
    const taxableBefore = Math.max(0, realizedGains - BASIC_DEDUCTION);
    const taxBefore = Math.round(taxableBefore * TAX_RATE);

    // 2. 최대 필요 손실상계 금액 (세금을 0원으로 만들거나 최소화하기 위한 목표)
    const neededLossHarvest = Math.max(0, realizedGains - BASIC_DEDUCTION);
    const availableLoss = Math.min(unrealizedLoss, plannedHarvest);

    // 3. 손실상계 후 세금 계산
    const netGainsAfter = Math.max(0, realizedGains - availableLoss);
    const taxableAfter = Math.max(0, netGainsAfter - BASIC_DEDUCTION);
    const taxAfter = Math.round(taxableAfter * TAX_RATE);

    // 4. 절세된 세금
    const taxSaved = taxBefore - taxAfter;
    const isZeroTax = taxAfter === 0;

    // USD 환산
    const gainsInUsd = Math.round(realizedGains / usdRate);
    const taxBeforeUsd = Math.round(taxBefore / usdRate);
    const taxSavedUsd = Math.round(taxSaved / usdRate);

    return {
      taxableBefore,
      taxBefore,
      neededLossHarvest,
      availableLoss,
      netGainsAfter,
      taxableAfter,
      taxAfter,
      taxSaved,
      isZeroTax,
      gainsInUsd,
      taxBeforeUsd,
      taxSavedUsd,
    };
  }, [realizedGains, unrealizedLoss, plannedHarvest, usdRate]);

  const formatKrw = (val: number) => {
    return new Intl.NumberFormat(isKo ? 'ko-KR' : 'en-US').format(Math.round(val)) + (isKo ? '원' : ' KRW');
  };

  const formatUsd = (val: number) => {
    return '$' + new Intl.NumberFormat('en-US').format(Math.round(val));
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-foreground">
      {/* 헤더 & 요약 배너 */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-foreground mb-2">
              <span>📈 2026 해외주식 양도소득세</span>
              <span>•</span>
              <span>250만원 공제 & 손실상계 절세</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              {isKo ? '미국주식 양도소득세 & 손실상계 절세 계산기' : 'US Stock Capital Gains Tax & Loss Harvesting Simulator'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isKo
                ? '올해 확정 수익에서 마이너스 종목을 매도해 양도세 22%를 합법적으로 0원 또는 최대치로 절세하는 시뮬레이터입니다.'
                : 'Simulate US equity capital gains tax (22% over 2.5M KRW deduction) and calculate exact tax-loss harvesting amounts.'}
            </p>
          </div>
          <div className="text-right p-4 rounded-lg bg-muted/50 border border-border">
            <span className="text-xs text-muted-foreground block">{isKo ? '손실상계 전 예상 양도세 (22%)' : 'Tax Before Harvesting (22%)'}</span>
            <span className="text-lg font-bold text-destructive">{formatKrw(calculation.taxBefore)}</span>
            <span className="text-xs text-muted-foreground block mt-0.5">({formatUsd(calculation.taxBeforeUsd)})</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 입력 섹션 */}
        <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-base border-b border-border pb-3">
            {isKo ? '1. 투자 손익 & 환율 입력' : '1. Gains, Losses & Exchange Rate'}
          </h3>

          {/* 올해 실현 수익 */}
          <div>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <label htmlFor="realizedGains" className="font-medium text-foreground">
                {isKo ? '올해 확정 실현 수익 (매도 완료분)' : 'Realized Capital Gains This Year'}
              </label>
              <span className="text-primary font-bold">{formatKrw(realizedGains)}</span>
            </div>
            <input
              id="realizedGains"
              type="range"
              min="0"
              max="100000000"
              step="500000"
              value={realizedGains}
              onChange={(e) => setRealizedGains(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0원</span>
              <span>250만원 (기본공제)</span>
              <span>1억원</span>
            </div>
          </div>

          {/* 마이너스 평가손실액 */}
          <div>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <label htmlFor="unrealizedLoss" className="font-medium text-foreground">
                {isKo ? '보유 중인 종목의 평가손실 (마이너스 계좌)' : 'Unrealized Losses in Portfolio'}
              </label>
              <span className="text-destructive font-bold">{formatKrw(unrealizedLoss)}</span>
            </div>
            <input
              id="unrealizedLoss"
              type="range"
              min="0"
              max="50000000"
              step="500000"
              value={unrealizedLoss}
              onChange={(e) => {
                const val = Number(e.target.value);
                setUnrealizedLoss(val);
                if (plannedHarvest > val) setPlannedHarvest(val);
              }}
              className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {isKo
                ? '💡 현재 물려있거나 손실 중인 종목을 12월 말 전에 매도하면 수익과 상계됩니다.'
                : 'Losses realized before year-end offset your taxable realized gains.'}
            </p>
          </div>

          {/* 실행할 손실상계 매도 금액 */}
          <div>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <label htmlFor="plannedHarvest" className="font-medium text-foreground">
                {isKo ? '올해 매도 실행할 손실액' : 'Planned Loss-Harvesting Sell Amount'}
              </label>
              <span className="text-primary font-bold">{formatKrw(plannedHarvest)}</span>
            </div>
            <input
              id="plannedHarvest"
              type="range"
              min="0"
              max={unrealizedLoss}
              step="500000"
              value={plannedHarvest}
              onChange={(e) => setPlannedHarvest(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs mt-1.5">
              <button
                type="button"
                onClick={() => setPlannedHarvest(Math.min(unrealizedLoss, calculation.neededLossHarvest))}
                className="text-xs text-primary underline hover:text-primary/80 font-medium"
              >
                {isKo ? '🎯 세금 0원 최적치 자동 맞춤' : 'Auto-match to Target'}
              </button>
              <button
                type="button"
                onClick={() => setPlannedHarvest(unrealizedLoss)}
                className="text-xs text-muted-foreground underline hover:text-foreground"
              >
                {isKo ? '전액 매도' : 'Sell All Losses'}
              </button>
            </div>
          </div>

          {/* 환율 */}
          <div>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <label htmlFor="usdRate" className="font-medium text-foreground">
                {isKo ? '기준 환율 (USD/KRW)' : 'USD/KRW Exchange Rate'}
              </label>
              <span className="text-foreground font-semibold">{usdRate}원</span>
            </div>
            <input
              id="usdRate"
              type="number"
              min="1000"
              max="1600"
              value={usdRate}
              onChange={(e) => setUsdRate(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        {/* 결과 섹션 */}
        <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-base border-b border-border pb-3">
              {isKo ? '2. 절세 효과 & 최종 납부 세액' : '2. Tax Savings & Final Payable Tax'}
            </h3>

            {/* 절세 성과 카드 */}
            <div className="mt-4 p-4 rounded-xl border border-primary/30 bg-primary/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {isKo ? '손실상계로 아낀 세금 (절세액)' : 'Total Tax Saved via Harvesting'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-background text-primary border border-primary/30">
                  {isKo ? '세금 22% 즉시 절감' : '22% Tax Discount'}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-primary">
                  +{formatKrw(calculation.taxSaved)}
                </span>
                <span className="text-xs text-muted-foreground ml-2">({formatUsd(calculation.taxSavedUsd)})</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {calculation.isZeroTax
                  ? (isKo ? '🎉 손실상계 완료 시 5월 납부 양도세가 0원이 됩니다!' : '🎉 Zero capital gains tax payable in May!')
                  : (isKo
                      ? `양도세가 ${formatKrw(calculation.taxBefore)}에서 ${formatKrw(calculation.taxAfter)}로 대폭 줄어듭니다.`
                      : `Tax reduced from ${formatKrw(calculation.taxBefore)} to ${formatKrw(calculation.taxAfter)}.`)}
              </p>
            </div>

            {/* 세부 수치 명세 */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">{isKo ? '올해 실현 수익금액' : 'Realized Gross Gains'}</span>
                <span className="font-medium text-foreground">{formatKrw(realizedGains)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">{isKo ? '손실상계 매도 손실' : 'Harvested Loss Offset'}</span>
                <span className="font-medium text-destructive">-{formatKrw(calculation.availableLoss)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">{isKo ? '연간 기본공제' : 'Annual Basic Deduction'}</span>
                <span className="font-medium text-foreground">-250만원</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border font-semibold">
                <span className="text-foreground">{isKo ? '최종 과세표준' : 'Final Taxable Base'}</span>
                <span className="text-primary">{formatKrw(calculation.taxableAfter)}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-border font-bold text-sm">
                <span className="text-foreground">{isKo ? '5월 최종 납부 양도소득세' : 'Final Tax Payable (May)'}</span>
                <span className={calculation.taxAfter === 0 ? 'text-primary' : 'text-destructive'}>
                  {formatKrw(calculation.taxAfter)}
                </span>
              </div>
            </div>
          </div>

          {/* 핵심 절세 꿀팁 */}
          <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground space-y-1.5">
            <div className="font-semibold text-foreground flex items-center gap-1">
              <span>💡 한국 세법 해외주식 손실상계 핵심 팁</span>
            </div>
            <p>
              • <strong>워시세일(Wash-Sale) 규정 없음</strong>: 한국은 미국과 달리 매도 후 같은 종목을 즉시 재매수해도 손실이 정상 인정됩니다 (수수료/환전 비용만 고려).
            </p>
            <p>
              • <strong>결제일 T+2 주의</strong>: 12월 31일 폐장 기준, 결제일이 당해 연도 내에 완료되어야 하므로 보통 <strong>12월 26~27일 이전</strong>에 매도해야 합니다.
            </p>
            <p>
              • <strong>배우자 증여 활용</strong>: 10년간 6억원까지 배우자 비과세 증여 후 매도하면 취득가액이 증여 시점 주가로 리셋되어 양도세를 합법적으로 전액 아낄 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
