import { useState, useMemo } from 'react';

export default function YellowUmbrellaCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [businessIncome, setBusinessIncome] = useState<number>(45000000); // 사업소득금액 (4,500만원)
  const [monthlyContribution, setMonthlyContribution] = useState<number>(250000); // 월 납입금 (25만원)
  const [membershipYears, setMembershipYears] = useState<number>(10); // 가입 기간 (10년)
  const [includeGrant, setIncludeGrant] = useState<boolean>(true); // 지자체 희망장려금 포함 여부

  const calculation = useMemo(() => {
    // 1. 소득공제 한도 산정 (사업소득금액 기준)
    let maxDeductionLimit = 2000000;
    if (businessIncome <= 40000000) {
      maxDeductionLimit = 5000000;
    } else if (businessIncome <= 100000000) {
      maxDeductionLimit = 3000000;
    } else {
      maxDeductionLimit = 2000000;
    }

    const annualContribution = monthlyContribution * 12;
    const eligibleDeduction = Math.min(annualContribution, maxDeductionLimit);

    // 2. 한계세율 판정 (지방세 10% 포함)
    let marginalRate = 0.066;
    let marginalPercent = 6.6;
    if (businessIncome <= 14000000) {
      marginalRate = 0.066;
      marginalPercent = 6.6;
    } else if (businessIncome <= 50000000) {
      marginalRate = 0.165;
      marginalPercent = 16.5;
    } else if (businessIncome <= 88000000) {
      marginalRate = 0.264;
      marginalPercent = 26.4;
    } else if (businessIncome <= 150000000) {
      marginalRate = 0.385;
      marginalPercent = 38.5;
    } else if (businessIncome <= 300000000) {
      marginalRate = 0.418;
      marginalPercent = 41.8;
    } else {
      marginalRate = 0.462;
      marginalPercent = 46.2;
    }

    const annualTaxSavings = Math.round(eligibleDeduction * marginalRate);
    const totalTaxSavings = annualTaxSavings * membershipYears;

    // 3. 복리 이자 산출 (연이율 3.2% 기준)
    const r = 0.032;
    let accumulatedBalance = 0;
    for (let y = 1; y <= membershipYears; y++) {
      accumulatedBalance = (accumulatedBalance + annualContribution) * (1 + r);
    }

    const grantAmount = includeGrant ? 120000 : 0;
    accumulatedBalance += grantAmount;

    const totalPrincipal = annualContribution * membershipYears;
    const totalInterest = Math.round(accumulatedBalance - totalPrincipal);
    const totalNetBenefit = totalTaxSavings + totalInterest;

    return {
      maxDeductionLimit,
      annualContribution,
      eligibleDeduction,
      marginalPercent,
      annualTaxSavings,
      totalTaxSavings,
      totalPrincipal,
      totalInterest,
      accumulatedBalance: Math.round(accumulatedBalance),
      totalNetBenefit,
      grantAmount,
    };
  }, [businessIncome, monthlyContribution, membershipYears, includeGrant]);

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            {isKo ? '사업소득 및 납입액 설정' : 'Income & Contribution'}
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '연간 사업소득금액' : 'Business Income'}</span>
              <span className="font-semibold text-foreground">{(businessIncome / 10000).toLocaleString()}{isKo ? '만원' : ' KRW'}</span>
            </div>
            <input
              type="range"
              min={10000000}
              max={150000000}
              step={1000000}
              value={businessIncome}
              onChange={(e) => setBusinessIncome(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1,000만원</span>
              <span className="text-primary font-medium">
                {isKo ? `소득공제 한도: ${(calculation.maxDeductionLimit / 10000).toLocaleString()}만원` : `Cap: ${calculation.maxDeductionLimit / 10000}M`}
              </span>
              <span>1억 5천만원</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '월 납입금액' : 'Monthly Deposit'}</span>
              <span className="font-semibold text-foreground">{(monthlyContribution / 10000).toLocaleString()}{isKo ? '만원' : ' KRW'}</span>
            </div>
            <input
              type="range"
              min={50000}
              max={1000000}
              step={50000}
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5만원 (최소)</span>
              <span>25만원 (연 300만)</span>
              <span>100만원 (최대)</span>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={includeGrant}
                onChange={(e) => setIncludeGrant(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span>{isKo ? '지자체 희망장려금(최대 12~24만원) 지원 반영' : 'Include Local Government Grant'}</span>
            </label>
            <p className="mt-1 text-xs text-muted-foreground pl-6">
              {isKo
                ? '서울, 경기, 부산 등 대부분의 지자체에서 신규 가입 소상공인에게 월 1~2만원을 1년간 지원합니다.'
                : 'Most regional governments provide 10-20k KRW/mo grant for the 1st year.'}
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            {isKo ? '적립 및 복리 운용 기간' : 'Compounding Horizon'}
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '가입 예상 기간' : 'Holding Period'}</span>
              <span className="font-semibold text-foreground">{membershipYears}{isKo ? '년' : ' Years'}</span>
            </div>
            <input
              type="range"
              min={3}
              max={30}
              step={1}
              value={membershipYears}
              onChange={(e) => setMembershipYears(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>3년</span>
              <span>10년</span>
              <span>30년 (은퇴/폐업)</span>
            </div>
          </div>

          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">🛡️ {isKo ? '법적 수급권 100% 보호' : 'Asset Protection'}</p>
            <p>
              {isKo
                ? '중소기업협동조합법 제115조에 따라 노란우산공제금은 압류, 양도, 담보 제공이 법으로 전면 금지되어 사업 위기 시에도 안전한 퇴직금이 보장됩니다.'
                : 'Under Art 115 of the SME Cooperatives Act, funds are 100% protected against creditor seizure or pledge.'}
            </p>
          </div>
        </div>
      </div>

      {/* Result Card */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 md:p-8 space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
          <div>
            <span className="inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
              {calculation.marginalPercent}% {isKo ? '한계세율 구간 적용' : 'Marginal Tax Rate'}
            </span>
            <h3 className="mt-2 text-2xl font-bold text-foreground">
              {isKo ? '매년 종합소득세 절세 환급액' : 'Annual Income Tax Savings'}
            </h3>
          </div>
          <div className="text-left md:text-right">
            <div className="text-3xl font-extrabold text-primary">
              +{calculation.annualTaxSavings.toLocaleString()}{isKo ? '원' : ' KRW'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {isKo ? '연 소득공제 인정액: ' : 'Eligible Deduction: '}
              {calculation.eligibleDeduction.toLocaleString()}{isKo ? '원' : ' KRW'}
            </div>
          </div>
        </div>

        {/* 3 Metrics */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? '총 원금 납입액' : 'Total Principal'}</div>
            <div className="text-lg font-semibold text-foreground mt-1">
              {calculation.totalPrincipal.toLocaleString()}{isKo ? '원' : ' KRW'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {membershipYears}{isKo ? '년간 누적' : ' yrs total'}
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? '만기/폐업 수령 총액' : 'Total Payout at Exit'}</div>
            <div className="text-lg font-semibold text-primary mt-1">
              {calculation.accumulatedBalance.toLocaleString()}{isKo ? '원' : ' KRW'}
            </div>
            <div className="text-xs text-primary font-medium mt-0.5">
              +{calculation.totalInterest.toLocaleString()}{isKo ? '원 복리이자 포함' : ' KRW Interest'}
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? '총 경제적 순이익' : 'Total Net Profit'}</div>
            <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              +{calculation.totalNetBenefit.toLocaleString()}{isKo ? '원' : ' KRW'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {isKo ? '누적 절세액 + 복리이자 합산' : 'Tax Savings + Compounding'}
            </div>
          </div>
        </div>

        {/* Benefits breakdown */}
        <div className="rounded-lg border border-border bg-card p-4 text-xs space-y-2 text-muted-foreground">
          <h4 className="font-semibold text-foreground">{isKo ? '노란우산공제 4대 핵심 혜택' : 'Key Advantages of Yellow Umbrella'}</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong className="text-foreground">{isKo ? '최대 500만원 소득공제' : 'Max 5M Deduction'}:</strong> {isKo ? '소득 구간에 따라 연간 최대 500만원까지 소득공제되어 과세표준을 낮추고 종합소득세를 직접 절감합니다.' : 'Deducts up to 5M KRW from taxable income annually.'}
            </li>
            <li>
              <strong className="text-foreground">{isKo ? '연 복리 이율 부리' : 'Annual Compounding'}:</strong> {isKo ? '납입금 전액에 대해 시중 은행 정기예금보다 높은 연 복리 이자가 폐업 시까지 복리로 쌓입니다.' : 'Higher-than-bank interest rates applied on a compounding basis until closure.'}
            </li>
            <li>
              <strong className="text-foreground">{isKo ? '법적 압류 절대 금지' : 'Legal Asset Shield'}:</strong> {isKo ? '국가 법률에 의해 공제금 수급권은 어떠한 채권자도 압류하거나 담보로 잡을 수 없습니다.' : 'Statutorily shielded from all creditor claims and bankruptcy proceedings.'}
            </li>
            <li>
              <strong className="text-foreground">{isKo ? '무이자/저리 대출 지원' : 'Low-Interest Loans'}:</strong> {isKo ? '납입 부금 내에서 무담보·저금리로 긴급 운영자금 대출을 지원받을 수 있습니다.' : 'Emergency operating loans available against deposited funds without additional collateral.'}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
