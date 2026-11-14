import { useState, useMemo } from 'react';

export default function PensionSavingsTaxOptimizer({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [annualSalary, setAnnualSalary] = useState<number>(50000000); // 연봉 5,000만원
  const [pensionSavings, setPensionSavings] = useState<number>(6000000); // 연금저축 납입액 (최대 600만)
  const [irpContribution, setIrpContribution] = useState<number>(3000000); // IRP 납입액 (합산 최대 900만)
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(6); // 연평균 수익률 (6%)
  const [investmentYears, setInvestmentYears] = useState<number>(20); // 투자 기간 20년

  const calculation = useMemo(() => {
    // 1. 공제율 판정: 총급여 5500만원 기준 (16.5% vs 13.2%)
    const isHighSalary = annualSalary > 55000000;
    const taxCreditRate = isHighSalary ? 0.132 : 0.165;
    const taxCreditRatePercent = isHighSalary ? 13.2 : 16.5;

    // 2. 공제 인정 한도
    const eligiblePension = Math.min(pensionSavings, 6000000);
    const remainingIrpCap = Math.max(0, 9000000 - eligiblePension);
    const eligibleIrp = Math.min(irpContribution, remainingIrpCap);
    const totalEligible = eligiblePension + eligibleIrp;

    // 연말정산 환급액
    const annualRefund = Math.round(totalEligible * taxCreditRate);

    // 3. 복리 및 과세이연 시뮬레이션
    const annualTotal = pensionSavings + irpContribution;
    const r = expectedReturnRate / 100;

    // 과세이연 계좌 (세전 복리 재투자)
    let pensionBalance = 0;
    for (let y = 1; y <= investmentYears; y++) {
      pensionBalance = (pensionBalance + annualTotal) * (1 + r);
    }

    // 일반 과세 계좌 (배당소득세 15.4% 차감 후 재투자)
    const afterTaxR = r * (1 - 0.154);
    let regularBalance = 0;
    for (let y = 1; y <= investmentYears; y++) {
      regularBalance = (regularBalance + annualTotal) * (1 + afterTaxR);
    }

    const taxDeferralBenefit = Math.round(pensionBalance - regularBalance);
    const totalPrincipal = annualTotal * investmentYears;

    return {
      isHighSalary,
      taxCreditRatePercent,
      eligiblePension,
      eligibleIrp,
      totalEligible,
      annualRefund,
      totalPrincipal,
      pensionBalance: Math.round(pensionBalance),
      regularBalance: Math.round(regularBalance),
      taxDeferralBenefit,
    };
  }, [annualSalary, pensionSavings, irpContribution, expectedReturnRate, investmentYears]);

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            {isKo ? '소득 및 납입액 설정' : 'Income & Contribution'}
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '연간 총급여' : 'Annual Salary'}</span>
              <span className="font-semibold text-foreground">{(annualSalary / 10000).toLocaleString()}{isKo ? '만원' : ' KRW'}</span>
            </div>
            <input
              type="range"
              min={20000000}
              max={150000000}
              step={1000000}
              value={annualSalary}
              onChange={(e) => setAnnualSalary(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>2,000만원</span>
              <span className="text-primary font-medium">
                {annualSalary <= 55000000
                  ? (isKo ? '16.5% 우대 환급 구간' : '16.5% Max Tax Credit')
                  : (isKo ? '13.2% 환급 구간' : '13.2% Tax Credit')}
              </span>
              <span>1억 5천만원</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '연금저축펀드 연 납입액' : 'Pension Savings Contribution'}</span>
              <span className="font-semibold text-foreground">{(pensionSavings / 10000).toLocaleString()}{isKo ? '만원' : ' KRW'}</span>
            </div>
            <input
              type="range"
              min={0}
              max={6000000}
              step={500000}
              value={pensionSavings}
              onChange={(e) => setPensionSavings(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0원</span>
              <span>{isKo ? '최대 600만원' : 'Max 6M'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? 'IRP(개인형퇴직연금) 연 납입액' : 'IRP Contribution'}</span>
              <span className="font-semibold text-foreground">{(irpContribution / 10000).toLocaleString()}{isKo ? '만원' : ' KRW'}</span>
            </div>
            <input
              type="range"
              min={0}
              max={9000000}
              step={500000}
              value={irpContribution}
              onChange={(e) => setIrpContribution(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0원</span>
              <span>{isKo ? '합산 최대 900만원' : 'Combined Max 9M'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            {isKo ? '운용 복리 시뮬레이션 설정' : 'Investment & Compounding'}
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '연평균 예상 수익률' : 'Expected Annual Return'}</span>
              <span className="font-semibold text-foreground">{expectedReturnRate}%</span>
            </div>
            <input
              type="range"
              min={1}
              max={15}
              step={0.5}
              value={expectedReturnRate}
              onChange={(e) => setExpectedReturnRate(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1% (안전형)</span>
              <span>6% (지수 ETF)</span>
              <span>15% (고수익)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '투자 운용 기간' : 'Investment Horizon'}</span>
              <span className="font-semibold text-foreground">{investmentYears}{isKo ? '년' : ' Years'}</span>
            </div>
            <input
              type="range"
              min={5}
              max={40}
              step={1}
              value={investmentYears}
              onChange={(e) => setInvestmentYears(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5년</span>
              <span>20년</span>
              <span>40년</span>
            </div>
          </div>

          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">💡 {isKo ? '절세 배분 황금비율' : 'Allocation Tip'}</p>
            <p>
              {isKo
                ? '위험자산(미국 S&P500, 나스닥 ETF 등)을 100% 담을 수 있는 연금저축에 600만원을 먼저 채우고, 나머지 300만원을 IRP(안전자산 30% 의무)에 채우는 것이 최적입니다.'
                : 'Prioritize 6M KRW into Pension Savings for 100% equity ETF flexibility, then 3M KRW into IRP for full 9M tax credit.'}
            </p>
          </div>
        </div>
      </div>

      {/* Result Card */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 md:p-8 space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
          <div>
            <span className="inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
              {calculation.taxCreditRatePercent}% {isKo ? '세액공제율 적용' : 'Tax Credit Rate'}
            </span>
            <h3 className="mt-2 text-2xl font-bold text-foreground">
              {isKo ? '연말정산 예상 세금 환급액' : 'Estimated Annual Tax Refund'}
            </h3>
          </div>
          <div className="text-left md:text-right">
            <div className="text-3xl font-extrabold text-primary">
              +{calculation.annualRefund.toLocaleString()}{isKo ? '원' : ' KRW'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {isKo ? '공제 대상 인정액: ' : 'Eligible Base: '}
              {calculation.totalEligible.toLocaleString()}{isKo ? '원 (최대 900만원)' : ' KRW'}
            </div>
          </div>
        </div>

        {/* 3 Metrics comparison */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? '총 원금 불입액' : 'Total Principal'}</div>
            <div className="text-lg font-semibold text-foreground mt-1">
              {calculation.totalPrincipal.toLocaleString()}{isKo ? '원' : ' KRW'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {investmentYears}{isKo ? '년간 누적' : ' yrs total'}
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? '연금계좌 만기 자산' : 'Pension Account Value'}</div>
            <div className="text-lg font-semibold text-primary mt-1">
              {calculation.pensionBalance.toLocaleString()}{isKo ? '원' : ' KRW'}
            </div>
            <div className="text-xs text-primary font-medium mt-0.5">
              {isKo ? '과세이연 100% 재투자' : 'Tax Deferred Compounding'}
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? '과세이연 추가 순수익' : 'Net Tax Deferral Alpha'}</div>
            <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              +{calculation.taxDeferralBenefit.toLocaleString()}{isKo ? '원' : ' KRW'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {isKo ? '일반 계좌(15.4% 배당과세) 대비' : 'vs 15.4% Taxable Account'}
            </div>
          </div>
        </div>

        {/* Strategic Guidance */}
        <div className="rounded-lg border border-border bg-card p-4 text-xs space-y-2 text-muted-foreground">
          <h4 className="font-semibold text-foreground">{isKo ? '연금저축 vs IRP 차이점 핵심 요약' : 'Pension Savings vs IRP Key Differences'}</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong className="text-foreground">{isKo ? '연금저축펀드' : 'Pension Savings'}:</strong> {isKo ? '누구나 가입 가능, 주식형 ETF 100% 편입 가능, 중도인출 자유(세액공제 미신청 원금은 비과세 인출 가능), 담보대출 가능.' : 'Open to everyone, 100% equity ETF allowed, partial penalty-free withdrawals for non-credited principal.'}
            </li>
            <li>
              <strong className="text-foreground">{isKo ? 'IRP (개인형퇴직연금)' : 'IRP'}:</strong> {isKo ? '소득이 있는 근로자/자영업자 가입, 안전자산 30% 의무(예금·채권 등), 중도인출 법정 사유(무주택자 주택구입 등) 외 전액 해지만 가능.' : 'Must have earned income, 30% safe assets required, withdrawal restricted to statutory events.'}
            </li>
            <li>
              <strong className="text-foreground">{isKo ? '연금 수령 시 절세' : 'Low Pension Tax'}:</strong> {isKo ? '만 55세 이후 연금 개시 시 15.4% 배당세 대신 3.3%~5.5%의 초저율 연금소득세만 부과됩니다.' : 'Retirement distributions after age 55 incur only 3.3%~5.5% pension tax.'}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
