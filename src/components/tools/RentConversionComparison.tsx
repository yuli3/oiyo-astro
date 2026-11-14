import { useState, useMemo } from 'react';

export default function RentConversionComparison({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [jeonseDeposit, setJeonseDeposit] = useState<number>(300000000); // 전세 보증금 (3억원)
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(50000000); // 월세 보증금 (5,000만원)
  const [proposedRent, setProposedRent] = useState<number>(1000000); // 임대인 요구 월세 (100만원)
  const [bankBaseRate, setBankBaseRate] = useState<number>(3.0); // 기준금리 (3.0%)
  const [loanInterestRate, setLoanInterestRate] = useState<number>(3.8); // 전세대출 금리 (3.8%)
  const [annualSalary, setAnnualSalary] = useState<number>(45000000); // 총급여 (월세 세액공제용)

  const calculation = useMemo(() => {
    // 1. 법정 상한선 (기준금리 + 2.0%)
    const legalCapRate = Math.min(10.0, bankBaseRate + 2.0); // 5.0%
    const depositDiff = Math.max(0, jeonseDeposit - monthlyDeposit);

    // 법정 적정 월세 상한액
    const legalMaxMonthlyRent = Math.round((depositDiff * (legalCapRate / 100)) / 12);

    // 실제 적용된 전월세 전환율
    let actualRate = 0;
    if (depositDiff > 0) {
      actualRate = (proposedRent * 12 / depositDiff) * 100;
    }

    const isViolating = actualRate > legalCapRate;
    const overchargedAmount = isViolating ? proposedRent - legalMaxMonthlyRent : 0;

    // 2. 3-Way 실질 주거비용 (월 단위)
    // 전세안: 80% 대출 (loanInterestRate), 20% 자기자본 (예금금리 3.0% 기회비용)
    const jeonseLoanAmount = jeonseDeposit * 0.8;
    const jeonseEquityAmount = jeonseDeposit * 0.2;
    const monthlyLoanInterest = (jeonseLoanAmount * (loanInterestRate / 100)) / 12;
    const monthlyEquityCost = (jeonseEquityAmount * 0.03) / 12;
    const totalJeonseCost = Math.round(monthlyLoanInterest + monthlyEquityCost);

    // 월세안: 실제 월세 + 보증금 기회비용(3%) - 월세 세액공제
    const monthlyDepositCost = (monthlyDeposit * 0.03) / 12;

    let taxCreditPercent = 0;
    if (annualSalary <= 55000000) {
      taxCreditPercent = 17;
    } else if (annualSalary <= 70000000) {
      taxCreditPercent = 15;
    }

    const annualRentTotal = proposedRent * 12;
    const eligibleRentCap = Math.min(annualRentTotal, 10000000);
    const annualRefund = Math.round(eligibleRentCap * (taxCreditPercent / 100));
    const monthlyRefund = Math.round(annualRefund / 12);

    const totalRentCost = Math.round(proposedRent + monthlyDepositCost - monthlyRefund);

    const monthlyDifference = totalJeonseCost - totalRentCost;
    const isJeonseCheaper = monthlyDifference < 0;

    return {
      legalCapRate,
      depositDiff,
      legalMaxMonthlyRent,
      actualRate: parseFloat(actualRate.toFixed(2)),
      isViolating,
      overchargedAmount,
      totalJeonseCost,
      totalRentCost,
      monthlyRefund,
      taxCreditPercent,
      monthlyDifference: Math.abs(monthlyDifference),
      isJeonseCheaper,
    };
  }, [jeonseDeposit, monthlyDeposit, proposedRent, bankBaseRate, loanInterestRate, annualSalary]);

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            {isKo ? '전세 및 월세 계약 조건' : 'Jeonse vs Rent Terms'}
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '기존 전세 보증금' : 'Jeonse Deposit'}</span>
              <span className="font-semibold text-foreground">{(jeonseDeposit / 10000).toLocaleString()}{isKo ? '만원' : ' KRW'}</span>
            </div>
            <input
              type="range"
              min={50000000}
              max={1000000000}
              step={10000000}
              value={jeonseDeposit}
              onChange={(e) => setJeonseDeposit(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5,000만원</span>
              <span>5억원</span>
              <span>10억원</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '전환할 월세 보증금' : 'Target Rent Deposit'}</span>
              <span className="font-semibold text-foreground">{(monthlyDeposit / 10000).toLocaleString()}{isKo ? '만원' : ' KRW'}</span>
            </div>
            <input
              type="range"
              min={5000000}
              max={500000000}
              step={5000000}
              value={monthlyDeposit}
              onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>500만원</span>
              <span>{isKo ? '보증금 차액: ' : 'Difference: '}{(calculation.depositDiff / 10000).toLocaleString()}{isKo ? '만원' : ' KRW'}</span>
              <span>5억원</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '임대인 요구 월세' : 'Proposed Monthly Rent'}</span>
              <span className="font-semibold text-foreground">{(proposedRent / 10000).toLocaleString()}{isKo ? '만원' : ' KRW'}</span>
            </div>
            <input
              type="range"
              min={200000}
              max={4000000}
              step={50000}
              value={proposedRent}
              onChange={(e) => setProposedRent(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>20만원</span>
              <span>150만원</span>
              <span>400만원</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            {isKo ? '금리 및 세액공제 조건' : 'Interest Rate & Tax Credit'}
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '전세대출 금리' : 'Jeonse Loan Rate'}</span>
              <span className="font-semibold text-foreground">{loanInterestRate}%</span>
            </div>
            <input
              type="range"
              min={2.0}
              max={7.0}
              step={0.1}
              value={loanInterestRate}
              onChange={(e) => setLoanInterestRate(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>2.0% (버팀목)</span>
              <span>3.8% (시중은행)</span>
              <span>7.0%</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '총급여 (월세 세액공제용)' : 'Annual Salary'}</span>
              <span className="font-semibold text-foreground">{(annualSalary / 10000).toLocaleString()}{isKo ? '만원' : ' KRW'}</span>
            </div>
            <input
              type="range"
              min={20000000}
              max={90000000}
              step={1000000}
              value={annualSalary}
              onChange={(e) => setAnnualSalary(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>2,000만원</span>
              <span className="text-primary font-medium">
                {calculation.taxCreditPercent > 0
                  ? (isKo ? `월세 ${calculation.taxCreditPercent}% 세액공제 대상` : `${calculation.taxCreditPercent}% Tax Credit`)
                  : (isKo ? '세액공제 대상 아님(7천만 초과)' : 'Above 70M')}
              </span>
              <span>9,000만원</span>
            </div>
          </div>

          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">⚖️ {isKo ? '2026 주택임대차보호법 제7조의2' : 'Art 7-2 Housing Lease Act'}</p>
            <p>
              {isKo
                ? `법정 전월세 전환율은 [기준금리(${bankBaseRate}%) + 2.0% = ${calculation.legalCapRate}%]로 상한이 제한됩니다. 이를 초과하는 월세 요구는 법적으로 효력이 없습니다.`
                : `Legal conversion ceiling capped at Base Rate (${bankBaseRate}%) + 2.0% = ${calculation.legalCapRate}%. Excess rent demand is statutorily invalid.`}
            </p>
          </div>
        </div>
      </div>

      {/* Result Card */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 md:p-8 space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                  calculation.isViolating
                    ? 'bg-destructive/20 text-destructive'
                    : 'bg-primary/20 text-primary'
                }`}
              >
                {calculation.isViolating
                  ? (isKo ? '🚨 법정 전환율 상한 초과 위반!' : '🚨 Over Legal Cap Rate')
                  : (isKo ? '✅ 법정 전환율 상한 준수' : '✅ Within Legal Cap')}
              </span>
              <span className="text-xs text-muted-foreground">
                {isKo
                  ? `(현재 전환율: ${calculation.actualRate}% / 법정 상한: ${calculation.legalCapRate}%)`
                  : `(Actual: ${calculation.actualRate}% / Cap: ${calculation.legalCapRate}%)`}
              </span>
            </div>
            <h3 className="mt-2 text-2xl font-bold text-foreground">
              {calculation.isJeonseCheaper
                ? (isKo ? '👉 전세 유지가 매월 더 유리합니다' : '👉 Jeonse is more economical')
                : (isKo ? '👉 월세 전환이 매월 더 유리합니다' : '👉 Monthly rent is more economical')}
            </h3>
          </div>
          <div className="text-left md:text-right">
            <div className="text-3xl font-extrabold text-primary">
              {isKo ? '월 ' : 'Save '}{calculation.monthlyDifference.toLocaleString()}{isKo ? '원 절약' : ' KRW/mo'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {isKo ? '연간 환산 절감액: ' : 'Annualized: '}
              {(calculation.monthlyDifference * 12).toLocaleString()}{isKo ? '원' : ' KRW'}
            </div>
          </div>
        </div>

        {/* 3 Metrics Comparison */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? '전세 선택 시 실질 월비용' : 'Jeonse Monthly Cost'}</div>
            <div className="text-lg font-semibold text-foreground mt-1">
              {calculation.totalJeonseCost.toLocaleString()}{isKo ? '원' : ' KRW'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {isKo ? `대출이자(${loanInterestRate}%) + 기회비용` : 'Loan interest + opportunity cost'}
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? '월세 선택 시 실질 월비용' : 'Rent Monthly Cost'}</div>
            <div className="text-lg font-semibold text-foreground mt-1">
              {calculation.totalRentCost.toLocaleString()}{isKo ? '원' : ' KRW'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {isKo ? `월세 - 세액공제(월 ${calculation.monthlyRefund.toLocaleString()}원)` : 'Rent minus tax credit'}
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? '법정 상한 적정 월세' : 'Legal Ceiling Rent'}</div>
            <div className={`text-lg font-semibold mt-1 ${calculation.isViolating ? 'text-destructive' : 'text-primary'}`}>
              {calculation.legalMaxMonthlyRent.toLocaleString()}{isKo ? '원' : ' KRW'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {calculation.isViolating
                ? (isKo ? `매월 ${calculation.overchargedAmount.toLocaleString()}원 초과 요구됨` : `Overcharged by ${calculation.overchargedAmount}`)
                : (isKo ? '법적 상한선 이내' : 'Within legal limit')}
            </div>
          </div>
        </div>

        {/* Legal Action Steps */}
        <div className="rounded-lg border border-border bg-card p-4 text-xs space-y-2 text-muted-foreground">
          <h4 className="font-semibold text-foreground">{isKo ? '임차인 필수 권리 대응 가이드' : 'Tenant Action Guidelines'}</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong className="text-foreground">{isKo ? '법정 전환율 초과 시 대처' : 'When Ceiling is Exceeded'}:</strong> {isKo ? `임대인이 법정 전환율(${calculation.legalCapRate}%)을 초과하여 월세를 요구할 경우, 임차인은 법정 상한 월세(${calculation.legalMaxMonthlyRent.toLocaleString()}원)까지만 지급할 법적 권리가 있으며, 초과분은 지급을 거절하거나 반환 청구할 수 있습니다.` : 'You are legally required to pay only up to the statutory ceiling.'}
            </li>
            <li>
              <strong className="text-foreground">{isKo ? '월세 세액공제 혜택' : 'Monthly Rent Tax Credit'}:</strong> {isKo ? '무주택 세대주로서 총급여 5,500만원 이하 근로자는 연간 월세액(최대 1,000만원 한도)의 17%, 7,000만원 이하는 15%를 연말정산에서 직접 세금으로 돌려받습니다.' : 'Eligible tenants can receive up to 17% of rent payments as an income tax credit.'}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
