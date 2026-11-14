import { useState, useMemo } from 'react';

type RegionType = 'capital' | 'non_capital'; // 수도권 vs 비수도권
type RateType = 'variable' | 'mixed' | 'periodic'; // 변동 vs 혼합(5년고정) vs 주기형(5년주기)

export default function StressDsrMortgageCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [annualIncome, setAnnualIncome] = useState<number>(70000000); // 연소득 (기본 7,000만원)
  const [region, setRegion] = useState<RegionType>('capital'); // 기본 수도권
  const [baseRate, setBaseRate] = useState<number>(4.0); // 기본 약정 대출금리 (%)
  const [maturityYears, setMaturityYears] = useState<number>(30); // 대출 만기 (기본 30년)
  const [existingAnnualRepayment, setExistingAnnualRepayment] = useState<number>(0); // 기존 대출 연간 원리금상환액

  const calculation = useMemo(() => {
    // DSR 40% 한도 기준 연간 최대 허용 원리금
    const maxAnnualDsrRepayment = Math.max(0, annualIncome * 0.40 - existingAnnualRepayment);

    // 스트레스 기본 가산금리 (2단계 기준: 수도권 1.20%p, 비수도권 0.75%p)
    const baseStressAddon = region === 'capital' ? 1.20 : 0.75;

    // 대출 유형별 스트레스 금리 반영률 및 심사금리 계산
    // 1. 스트레스 미적용 (원래 기준금리)
    const calcMaxLoan = (ratePercent: number) => {
      const r = ratePercent / 100 / 12; // 월 금리
      const n = maturityYears * 12; // 총 개월수
      const monthlyMax = maxAnnualDsrRepayment / 12;
      // 원리금균등분할상환 공식: P = M * ((1+r)^n - 1) / (r * (1+r)^n)
      if (r === 0) return monthlyMax * n;
      const loan = monthlyMax * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
      return Math.max(0, Math.round(loan));
    };

    // A. 스트레스 미적용 순수 대출 한도
    const rawLimit = calcMaxLoan(baseRate);

    // B. 변동금리 (스트레스 금리 100% 반영)
    const variableStressRate = baseRate + baseStressAddon * 1.0;
    const variableLimit = calcMaxLoan(variableStressRate);

    // C. 혼합형 (고정 5년 후 변동, 스트레스 금리 60% 반영)
    const mixedStressRate = baseRate + baseStressAddon * 0.60;
    const mixedLimit = calcMaxLoan(mixedStressRate);

    // D. 주기형 (5년 주기 변동, 스트레스 금리 30% 반영)
    const periodicStressRate = baseRate + baseStressAddon * 0.30;
    const periodicLimit = calcMaxLoan(periodicStressRate);

    // 변동금리 대비 주기형의 한도 우위 (방어된 한도)
    const periodicAdvantage = periodicLimit - variableLimit;
    const rawCurtailment = rawLimit - variableLimit;

    // 실제 매월 내는 원리금 (심사금리가 아닌 실제 기본금리 기준 월 상환액)
    const calcActualMonthlyPay = (principal: number) => {
      const r = baseRate / 100 / 12;
      const n = maturityYears * 12;
      if (r === 0) return Math.round(principal / n);
      return Math.round(principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    };

    return {
      maxAnnualDsrRepayment,
      rawLimit,
      variableStressRate,
      variableLimit,
      mixedStressRate,
      mixedLimit,
      periodicStressRate,
      periodicLimit,
      periodicAdvantage,
      rawCurtailment,
      monthlyPayVariable: calcActualMonthlyPay(variableLimit),
      monthlyPayPeriodic: calcActualMonthlyPay(periodicLimit),
    };
  }, [annualIncome, existingAnnualRepayment, region, baseRate, maturityYears]);

  const formatKrw = (val: number) => {
    return new Intl.NumberFormat(isKo ? 'ko-KR' : 'en-US').format(Math.round(val)) + (isKo ? '원' : ' KRW');
  };

  const formatManwon = (val: number) => {
    const eok = Math.floor(val / 100000000);
    const man = Math.round((val % 100000000) / 10000);
    if (eok > 0) return `${eok}억 ${man > 0 ? man + '만원' : ''}`;
    return `${man}만원`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-foreground">
      {/* 배너 헤더 */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-foreground mb-2">
              <span>🏦 스트레스 DSR 2단계·3단계 정밀 계산</span>
              <span>•</span>
              <span>수도권 1.2%p · 주기형 vs 변동금리 비교</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              {isKo ? '스트레스 DSR 주택담보대출 한도 계산기' : 'Stress DSR Mortgage Limit & Rate Simulator'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isKo
                ? 'DSR 40% 규제 하에서 내 연봉으로 빌릴 수 있는 주담대 최대 한도와 금리 유형별(변동 vs 주기형) 한도 차이를 즉시 계산합니다.'
                : 'Calculate maximum mortgage loan capacity under Korean Stress DSR (40% ceiling) across variable, mixed, and periodic rate structures.'}
            </p>
          </div>
          <div className="text-right p-4 rounded-lg bg-muted/50 border border-border">
            <span className="text-xs text-muted-foreground block">{isKo ? '주기형 선택 시 최대 한도' : 'Max Limit (Periodic)'}</span>
            <span className="text-lg font-bold text-primary">{formatManwon(calculation.periodicLimit)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 입력 섹션 */}
        <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-base border-b border-border pb-3">
            {isKo ? '1. 소득 및 대출 조건 입력' : '1. Income & Loan Parameters'}
          </h3>

          {/* 연소득 */}
          <div>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <label htmlFor="annualIncome" className="font-medium text-foreground">
                {isKo ? '연소득 (세전 연봉)' : 'Annual Gross Income'}
              </label>
              <span className="text-primary font-bold">{formatKrw(annualIncome)}</span>
            </div>
            <input
              id="annualIncome"
              type="range"
              min="20000000"
              max="200000000"
              step="5000000"
              value={annualIncome}
              onChange={(e) => setAnnualIncome(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>2,000만원</span>
              <span>1억원</span>
              <span>2억원</span>
            </div>
          </div>

          {/* 지역 선택 */}
          <div>
            <label htmlFor="regionSelect" className="block text-sm font-medium mb-1.5 text-foreground">
              {isKo ? '주택 소재지 (스트레스 금리 차등)' : 'Property Region'}
            </label>
            <select
              id="regionSelect"
              value={region}
              onChange={(e) => setRegion(e.target.value as RegionType)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="capital">{isKo ? '수도권 (서울·경기·인천, 가산금리 1.20%p)' : 'Capital Area (Seoul/Incheon/Gyeonggi +1.20%p)'}</option>
              <option value="non_capital">{isKo ? '비수도권 (지방 광역시 및 시·군, 가산금리 0.75%p)' : 'Non-Capital (+0.75%p)'}</option>
            </select>
          </div>

          {/* 대출 금리 및 만기 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="baseRate" className="block text-sm font-medium mb-1.5 text-foreground">
                {isKo ? '약정 기본금리 (%)' : 'Base Rate (%)'}
              </label>
              <input
                id="baseRate"
                type="number"
                step="0.1"
                min="2.0"
                max="8.0"
                value={baseRate}
                onChange={(e) => setBaseRate(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="maturitySelect" className="block text-sm font-medium mb-1.5 text-foreground">
                {isKo ? '대출 만기' : 'Maturity'}
              </label>
              <select
                id="maturitySelect"
                value={maturityYears}
                onChange={(e) => setMaturityYears(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value={20}>20년 (240개월)</option>
                <option value={30}>30년 (360개월)</option>
                <option value={40}>40년 (480개월)</option>
              </select>
            </div>
          </div>

          {/* 기존 대출 원리금 상환액 */}
          <div>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <label htmlFor="existingRepayment" className="font-medium text-foreground">
                {isKo ? '기존 신용대출 등 연간 원리금상환액' : 'Existing Annual Loan Repayments'}
              </label>
              <span className="text-foreground font-semibold">{formatKrw(existingAnnualRepayment)}</span>
            </div>
            <input
              id="existingRepayment"
              type="range"
              min="0"
              max="30000000"
              step="1000000"
              value={existingAnnualRepayment}
              onChange={(e) => setExistingAnnualRepayment(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {isKo ? '기존 마이너스통장·신용대출 상환액이 있을수록 주담대 한도가 줄어듭니다.' : 'Existing consumer debts reduce your net DSR loan headroom.'}
            </p>
          </div>
        </div>

        {/* 결과 섹션 */}
        <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-base border-b border-border pb-3">
              {isKo ? '2. 금리 유형별 대출 한도 비교' : '2. Loan Capacity by Rate Structure'}
            </h3>

            {/* 주기형 추천 카드 */}
            <div className="mt-4 p-4 rounded-xl border border-primary/30 bg-primary/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {isKo ? '최대 한도 유리: 5년 주기형' : 'Optimal Capacity: 5-Yr Periodic'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-background text-primary border border-primary/30">
                  {isKo ? `+${formatManwon(calculation.periodicAdvantage)} 더 나옴` : `+${formatManwon(calculation.periodicAdvantage)} extra`}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-primary">
                  {formatManwon(calculation.periodicLimit)}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  (월 {formatKrw(calculation.monthlyPayPeriodic)})
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isKo
                  ? `변동금리 대비 스트레스 금리가 30%만 가산되어 약 ${formatManwon(calculation.periodicAdvantage)} 한도를 더 지켜낼 수 있습니다.`
                  : `Periodic rate incurs only 30% stress addon, defending loan capacity.`}
              </p>
            </div>

            {/* 3가지 금리 유형별 비교 카드 */}
            <div className="mt-4 space-y-2 text-xs">
              {/* 주기형 */}
              <div className="p-3 rounded-lg border border-primary/40 bg-primary/5 flex justify-between items-center">
                <div>
                  <span className="font-bold text-foreground">주기형 (5년 주기 변동)</span>
                  <span className="text-muted-foreground block">심사금리 {calculation.periodicStressRate.toFixed(2)}% (가산 30%)</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-primary text-sm block">{formatManwon(calculation.periodicLimit)}</span>
                  <span className="text-muted-foreground">{formatKrw(calculation.periodicLimit)}</span>
                </div>
              </div>

              {/* 혼합형 */}
              <div className="p-3 rounded-lg border border-border bg-muted/30 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-foreground">혼합형 (5년 고정 후 변동)</span>
                  <span className="text-muted-foreground block">심사금리 {calculation.mixedStressRate.toFixed(2)}% (가산 60%)</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-foreground text-sm block">{formatManwon(calculation.mixedLimit)}</span>
                  <span className="text-muted-foreground">{formatKrw(calculation.mixedLimit)}</span>
                </div>
              </div>

              {/* 변동금리 */}
              <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/5 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-destructive">변동금리 (한도 축소 최다)</span>
                  <span className="text-muted-foreground block">심사금리 {calculation.variableStressRate.toFixed(2)}% (가산 100%)</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-destructive text-sm block">{formatManwon(calculation.variableLimit)}</span>
                  <span className="text-muted-foreground">{formatKrw(calculation.variableLimit)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 대출 가이드 팁 */}
          <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground space-y-1">
            <div className="font-semibold text-foreground flex items-center gap-1">
              <span>💡 스트레스 DSR 한도 극대화 팁</span>
            </div>
            <p>
              • <strong>주기형(5년 고정 후 재산정)</strong>을 선택하면 가산금리가 대폭 낮아져 변동금리보다 한도가 수천만 원 더 확보됩니다.
            </p>
            <p>
              • <strong>마이너스 통장 정리</strong>: 사용하지 않는 마이너스 통장 한도도 DSR에 원리금으로 잡히므로 주담대 실행 전 해지하면 한도가 늘어납니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
