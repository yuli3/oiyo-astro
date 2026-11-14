import { useState, useMemo } from 'react';

type HousingType = 'own' | 'rent';

export default function HealthInsuranceLocalProperty({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [housingType, setHousingType] = useState<HousingType>('rent');
  const [amount, setAmount] = useState<number>(300000000); // 3억원

  const calculation = useMemo(() => {
    // 1. 과세표준 (자가 60%, 전월세 보증금 30%)
    const rawTaxBase = housingType === 'own' ? Math.round(amount * 0.6) : Math.round(amount * 0.3);

    // 2. 기본공제 1억원
    const BASIC_DEDUCTION = 100000000;
    const taxableBase = Math.max(0, rawTaxBase - BASIC_DEDUCTION);

    // 3. 재산점수 (60개 구간)
    let points = 0;
    if (taxableBase > 0) {
      if (taxableBase <= 12000000) points = 22;
      else if (taxableBase <= 27000000) points = 64;
      else if (taxableBase <= 50000000) points = 135;
      else if (taxableBase <= 100000000) points = 247;
      else if (taxableBase <= 200000000) points = 390;
      else if (taxableBase <= 300000000) points = 506;
      else if (taxableBase <= 500000000) points = 665;
      else if (taxableBase <= 1000000000) points = 907;
      else points = 1200;
    }

    // 4. 보험료 계산 (점수당 208.4원)
    const POINT_VAL = 208.4;
    const healthTax = Math.round(points * POINT_VAL);
    const careTax = Math.round(healthTax * 0.1295); // 장기요양 12.95%
    const totalMonthly = healthTax + careTax;

    return {
      rawTaxBase,
      taxableBase,
      points,
      healthTax,
      careTax,
      totalMonthly,
    };
  }, [housingType, amount]);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            {isKo ? '지역가입자 부동산·전월세 건강보험료 계산기' : 'Local Health Insurance Property Tax Calculator'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isKo
              ? '2024~2026년 개정 재산 기본공제 1억원 일괄 확대와 자동차 건보료 전면 폐지(0원)를 반영하여 실제 부과되는 재산 건보료를 산출합니다.'
              : 'Calculate local health insurance property taxes reflecting the 100M KRW basic deduction and total vehicle tax abolition.'}
          </p>
        </div>

        {/* Inputs */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4 rounded-lg bg-muted/40 p-4 border border-border">
            <h4 className="text-sm font-semibold text-foreground">
              {isKo ? '1. 주거 형태 및 가액 입력' : '1. Housing Type & Value'}
            </h4>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                {isKo ? '주거 형태' : 'Housing Form'}
              </label>
              <select
                value={housingType}
                onChange={(e) => setHousingType(e.target.value as HousingType)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="rent">{isKo ? '전세 / 월세 거주 (보증금의 30%만 평가)' : 'Jeonse / Rent (30% evaluated)'}</option>
                <option value="own">{isKo ? '자가 주택 소유 (공시가격의 60% 평가)' : 'Homeowner (60% evaluated)'}</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{housingType === 'own' ? (isKo ? '주택 공시가격' : 'Official Property Value') : (isKo ? '임차 보증금' : 'Rental Deposit')}</span>
                <span className="font-semibold text-foreground">{(amount / 10000).toLocaleString()}{isKo ? '만원' : '0k KRW'}</span>
              </div>
              <input
                type="number"
                step="10000000"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
              <div className="flex gap-2 mt-2">
                {[150000000, 300000000, 500000000, 800000000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt)}
                    className="rounded bg-muted px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    {(amt / 100000000).toFixed(amt % 100000000 === 0 ? 0 : 1)}{isKo ? '억' : '00M'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Key Updates Info */}
          <div className="space-y-4 rounded-lg bg-muted/40 p-4 border border-border">
            <h4 className="text-sm font-semibold text-foreground">
              {isKo ? '2. 법정 공제 및 부과 점수' : '2. Statutory Deductions & Score'}
            </h4>

            <div className="rounded-md bg-card p-3 border border-border text-xs space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>{isKo ? '재산 평가 과세표준' : 'Evaluated Property Base'}</span>
                <span className="font-semibold text-foreground">{(calculation.rawTaxBase / 10000).toLocaleString()}{isKo ? '만원' : '0k'}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{isKo ? '2024~2026 기본공제' : 'Basic Deduction'}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  -10,000{isKo ? '만원 (1억원)' : '0k (100M)'}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground border-t border-border pt-1.5">
                <span>{isKo ? '최종 과세대상 재산표준' : 'Net Taxable Property Base'}</span>
                <span className="font-bold text-foreground">{(calculation.taxableBase / 10000).toLocaleString()}{isKo ? '만원' : '0k'}</span>
              </div>
            </div>

            <div className="rounded-md bg-card p-3 border border-border text-xs space-y-1.5">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>{isKo ? '자동차 건강보험료' : 'Automobile Health Tax'}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {isKo ? '0원 (전면 폐지)' : '0 KRW (Abolished)'}
                </span>
              </div>
              <p className="text-muted-foreground">
                {isKo ? '※ 2024년 2월 개정으로 모든 자동차에 대한 건보료 부과가 폐지되었습니다.' : 'Auto health insurance taxes were fully repealed in Feb 2024.'}
              </p>
            </div>
          </div>
        </div>

        {/* Results Banner */}
        <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-5 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border pb-4">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {isKo ? '재산분 월 건강보험료 합계' : 'Monthly Property Health Insurance Total'}
              </span>
              <h4 className="text-2xl font-black text-primary mt-0.5">
                {calculation.totalMonthly === 0
                  ? (isKo ? '0원 (전액 면제!)' : '0 KRW (Fully Shielded!)')
                  : `${calculation.totalMonthly.toLocaleString()}${isKo ? '원 / 월' : ' KRW / mo'}`}
              </h4>
            </div>

            <div className="text-right">
              <span className="text-xs text-muted-foreground">{isKo ? '재산 부과 점수' : 'Assigned Property Points'}</span>
              <div className="text-xl font-bold text-foreground">
                {calculation.points}{isKo ? '점 (점당 208.4원)' : ' pts'}
              </div>
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-card p-4 border border-border">
              <div className="text-xs text-muted-foreground">{isKo ? '순수 건강보험료' : 'Health Insurance Tax'}</div>
              <div className="text-lg font-bold text-foreground mt-1">
                {calculation.healthTax.toLocaleString()}{isKo ? '원' : ' KRW'}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {calculation.totalMonthly === 0 ? (isKo ? '기본공제 1억원 이하로 0원' : 'Exempt under 100M') : (isKo ? '부과점수 비례 산출' : 'Pro-rated by points')}
              </div>
            </div>

            <div className="rounded-lg bg-card p-4 border border-border">
              <div className="text-xs text-muted-foreground">{isKo ? '장기요양보험료' : 'Long-Term Care Tax'}</div>
              <div className="text-lg font-bold text-foreground mt-1">
                {calculation.careTax.toLocaleString()}{isKo ? '원' : ' KRW'}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {isKo ? '건강보험료의 12.95% 부과' : '12.95% of health tax'}
              </div>
            </div>

            <div className="rounded-lg bg-card p-4 border border-border">
              <div className="text-xs text-muted-foreground">{isKo ? '재산공제 혜택' : 'Deduction Benefit'}</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {isKo ? '1억원 일괄 공제' : '100M KRW Shield'}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {isKo ? '전세 3.3억까지 재산 건보료 0원' : '0 KRW up to 330M deposit'}
              </div>
            </div>
          </div>

          {/* Advisory Guide */}
          <div className="rounded-lg bg-card p-4 border border-border text-xs text-muted-foreground space-y-1.5">
            <h5 className="font-semibold text-foreground">
              💡 {isKo ? '지역가입자 건강보험료 절세 핵심 팁' : 'Local Health Insurance Shield Tips'}
            </h5>
            <ul className="list-disc list-inside space-y-1">
              <li>
                {isKo
                  ? '전세 보증금의 30%만 평가: 전세 3억원에 살고 있다면 건강보험공단은 9,000만원만 재산으로 평가하므로, 기본공제 1억원을 차감하면 과세표준이 0원이 되어 재산 건보료가 한 푼도 나오지 않습니다.'
                  : 'Only 30% of deposit is evaluated. Up to ~330M KRW Jeonse yields zero property health taxes.'}
              </li>
              <li>
                {isKo
                  ? '퇴사 시 임의계속가입 제도: 직장 퇴사 후 지역가입자 건보료가 이전 직장에서 내던 본인 부담금보다 비싸다면, 퇴사 후 2개월 이내에 "임의계속가입"을 신청하여 최장 36개월간 종전 직장 보험료로 납부할 수 있습니다.'
                  : 'Voluntary Continuation: If local rates exceed previous payroll rates, file within 2 months to freeze at workplace rates for up to 36 months.'}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
