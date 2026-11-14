import { useState, useMemo } from 'react';

function calculateIncomeTax(taxableIncome: number): number {
  let tax = 0;
  if (taxableIncome <= 14000000) {
    tax = taxableIncome * 0.06;
  } else if (taxableIncome <= 50000000) {
    tax = taxableIncome * 0.15 - 1260000;
  } else if (taxableIncome <= 88000000) {
    tax = taxableIncome * 0.24 - 5760000;
  } else if (taxableIncome <= 150000000) {
    tax = taxableIncome * 0.35 - 15440000;
  } else if (taxableIncome <= 300000000) {
    tax = taxableIncome * 0.38 - 19940000;
  } else if (taxableIncome <= 500000000) {
    tax = taxableIncome * 0.40 - 25940000;
  } else {
    tax = taxableIncome * 0.42 - 35940000;
  }
  return Math.round(Math.max(0, tax) * 1.1);
}

function calculateCorporateTax(taxableIncome: number): number {
  let tax = 0;
  if (taxableIncome <= 200000000) {
    tax = taxableIncome * 0.09;
  } else {
    tax = 200000000 * 0.09 + (taxableIncome - 200000000) * 0.19;
  }
  return Math.round(Math.max(0, tax) * 1.1);
}

export default function BusinessIncorporationPivot({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [netIncome, setNetIncome] = useState<number>(100000000); // 1억원
  const [ceoSalary, setCeoSalary] = useState<number>(40000000); // 4,000만원

  const calculation = useMemo(() => {
    // 1. 개인사업자
    const personalTax = calculateIncomeTax(netIncome);
    const personalHealth = Math.round(netIncome * 0.0709);
    const totalPersonal = personalTax + personalHealth;

    // 2. 법인
    const corporateBase = Math.max(0, netIncome - ceoSalary);
    const corporateTax = calculateCorporateTax(corporateBase);
    const ceoTax = calculateIncomeTax(Math.max(0, ceoSalary - 10000000));
    const ceoPayroll = Math.round(ceoSalary * 0.09);
    const totalCorporate = corporateTax + ceoTax + ceoPayroll;

    // 3. 절세액
    const savings = totalPersonal - totalCorporate;
    const isRecommended = savings > 3000000;

    return {
      personalTax,
      personalHealth,
      totalPersonal,
      corporateBase,
      corporateTax,
      ceoTax,
      ceoPayroll,
      totalCorporate,
      savings,
      isRecommended,
    };
  }, [netIncome, ceoSalary]);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            {isKo ? '개인사업자 vs 법인 전환 종합소득세·법인세 분기점 계산기' : 'Sole Proprietor vs Corporation Tax Pivot Simulator'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isKo
              ? '종합소득세 누진세율(6~45%)과 법인세율(9~19%), 대표자 급여 인건비 처리에 따른 연간 절세액과 손익분기점을 비교합니다.'
              : 'Compare progressive income tax (6~45%) vs corporate tax (9~19%) and calculate annual savings from incorporating.'}
          </p>
        </div>

        {/* Inputs */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column: Net Income */}
          <div className="space-y-4 rounded-lg bg-muted/40 p-4 border border-border">
            <h4 className="text-sm font-semibold text-foreground">
              {isKo ? '1. 연간 사업 순이익' : '1. Annual Net Business Profit'}
            </h4>

            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{isKo ? '연간 순이익 (매출 - 필요경비)' : 'Net Profit (Revenue - Expenses)'}</span>
                <span className="font-semibold text-foreground">{(netIncome / 10000).toLocaleString()}{isKo ? '만원' : '0k KRW'}</span>
              </div>
              <input
                type="number"
                step="5000000"
                value={netIncome}
                onChange={(e) => setNetIncome(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
              <div className="flex gap-2 mt-2">
                {[50000000, 80000000, 120000000, 200000000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setNetIncome(amt)}
                    className="rounded bg-muted px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    {(amt / 10000000).toFixed(0)}{isKo ? '천만' : '0M'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: CEO Salary */}
          <div className="space-y-4 rounded-lg bg-muted/40 p-4 border border-border">
            <h4 className="text-sm font-semibold text-foreground">
              {isKo ? '2. 법인 전환 시 설정할 대표자 연봉' : '2. Planned CEO Annual Salary'}
            </h4>

            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{isKo ? '대표자 인건비 (법인 필요경비 처리)' : 'CEO Salary (Expense deductible)'}</span>
                <span className="font-semibold text-primary">{(ceoSalary / 10000).toLocaleString()}{isKo ? '만원' : '0k KRW'}</span>
              </div>
              <input
                type="number"
                step="5000000"
                value={ceoSalary}
                onChange={(e) => setCeoSalary(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
              <div className="flex gap-2 mt-2">
                {[30000000, 48000000, 60000000, 80000000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setCeoSalary(amt)}
                    className="rounded bg-muted px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    {(amt / 10000000).toFixed(0)}{isKo ? '천만' : '0M'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Banner */}
        <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-5 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border pb-4">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {isKo ? '법인 전환 시 연간 절세액' : 'Annual Tax Savings via Incorporation'}
              </span>
              <h4 className={`text-2xl font-black mt-0.5 ${calculation.savings > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                {calculation.savings > 0
                  ? `+${calculation.savings.toLocaleString()}${isKo ? '원 / 년 절세' : ' KRW / yr Saved'}`
                  : (isKo ? '개인 유지 유리' : 'Sole Proprietor Favored')}
              </h4>
            </div>

            <div className="text-right">
              <span className="text-xs text-muted-foreground">{isKo ? '전환 권장 진단' : 'Recommendation'}</span>
              <div className={`text-xl font-bold ${calculation.isRecommended ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary'}`}>
                {calculation.isRecommended
                  ? (isKo ? '✅ 법인 전환 적극 추천' : 'Highly Recommended')
                  : (isKo ? 'ℹ️ 개인사업자 유지 검토' : 'Maintain Sole Proprietor')}
              </div>
            </div>
          </div>

          {/* 2-Way Comparison Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Sole Proprietor */}
            <div className="rounded-lg bg-card p-4 border border-border space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase">
                {isKo ? '개인사업자 유지 시 총 부담' : 'Sole Proprietorship Total'}
              </div>
              <div className="text-2xl font-bold text-foreground">
                {(calculation.totalPersonal).toLocaleString()}{isKo ? '원' : ' KRW'}
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 pt-1">
                <li>• {isKo ? `종합소득세(누진 6~42%): ${calculation.personalTax.toLocaleString()}원` : `Income Tax: ${calculation.personalTax.toLocaleString()} KRW`}</li>
                <li>• {isKo ? `지역 건강보험료(순이익 7.09%): ${calculation.personalHealth.toLocaleString()}원` : `Local Health: ${calculation.personalHealth.toLocaleString()} KRW`}</li>
                <li>• {isKo ? '소득 증가 시 최고세율 49.5%(지방세 포함) 도달' : 'Reaches up to 49.5% top tax bracket'}</li>
              </ul>
            </div>

            {/* Corporation */}
            <div className="rounded-lg bg-primary/5 p-4 border border-primary/20 space-y-2">
              <div className="text-xs font-semibold text-primary uppercase">
                {isKo ? '법인 전환 시 총 부담' : 'Corporation Total'}
              </div>
              <div className="text-2xl font-bold text-primary">
                {(calculation.totalCorporate).toLocaleString()}{isKo ? '원' : ' KRW'}
              </div>
              <ul className="text-xs text-foreground space-y-1 pt-1">
                <li>• {isKo ? `법인세(9.9% 저율): ${calculation.corporateTax.toLocaleString()}원 (과표 ${calculation.corporateBase.toLocaleString()}원)` : `Corporate Tax: ${calculation.corporateTax.toLocaleString()} KRW`}</li>
                <li>• {isKo ? `대표자 근로소득세: ${calculation.ceoTax.toLocaleString()}원` : `CEO Payroll Tax: ${calculation.ceoTax.toLocaleString()} KRW`}</li>
                <li>• {isKo ? `대표자 4대보험(직장): ${calculation.ceoPayroll.toLocaleString()}원` : `Workplace Payroll Insurance`}</li>
              </ul>
            </div>
          </div>

          {/* Incorporation Advisory */}
          <div className="rounded-lg bg-card p-4 border border-border text-xs text-muted-foreground space-y-1.5">
            <h5 className="font-semibold text-foreground">
              ⚖️ {isKo ? '법인 전환 실무 고려사항' : 'Practical Incorporation Check'}
            </h5>
            <ul className="list-disc list-inside space-y-1">
              <li>
                {isKo
                  ? '법인 유지비용 감안: 법인은 세무기장료(월 15~20만원) 및 결산조정료, 설립 등기비용(약 50~100만원)이 발생하므로 연간 절세액이 최소 300만원 이상일 때 전환하는 것이 현명합니다.'
                  : 'Maintenance Costs: Legal accounting fees (~2M/yr) and incorporation setup should be weighed against savings.'}
              </li>
              <li>
                {isKo
                  ? '자금 출금 통제: 법인의 자금은 대표자 개인 돈이 아니므로 급여나 배당 없이 임의 인출 시 가지급금(인정이자 4.6% 과세)이 발생합니다.'
                  : 'Separate Entity: Corporate capital cannot be arbitrarily withdrawn without payroll or dividend resolutions.'}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
