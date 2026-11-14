import { useState, useMemo } from 'react';

export default function CardDeductionOptimizer({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [annualSalary, setAnnualSalary] = useState<number>(50000000); // 총급여 연봉 (기본 5,000만원)
  const [creditCardSpend, setCreditCardSpend] = useState<number>(18000000); // 연간 신용카드 사용액 (1,800만원)
  const [debitCardSpend, setDebitCardSpend] = useState<number>(8000000); // 연간 체크카드/현금영수증 사용액 (800만원)
  const [marketTransitSpend, setMarketTransitSpend] = useState<number>(2000000); // 대중교통·전통시장 사용액 (200만원)

  const calculation = useMemo(() => {
    // 1. 공제 문턱: 총급여의 25% (최저사용금액)
    const threshold25 = annualSalary * 0.25;
    const totalSpend = creditCardSpend + debitCardSpend + marketTransitSpend;
    const excessSpend = Math.max(0, totalSpend - threshold25);

    // 2. 소득공제 기본 한도
    let baseLimit = 3000000;
    let extraLimit = 3000000;
    if (annualSalary > 120000000) {
      baseLimit = 2000000;
      extraLimit = 2000000;
    } else if (annualSalary > 70000000) {
      baseLimit = 2500000;
      extraLimit = 2000000;
    }

    // 3. 차감 순서: 법정 공제 순서는 신용카드 -> 현금/체크카드 -> 전통시장/대중교통 순으로 최저사용금액(25%)을 먼저 소진함
    let remainingThreshold = threshold25;

    // A. 신용카드 소진
    const creditUsedForThreshold = Math.min(creditCardSpend, remainingThreshold);
    remainingThreshold -= creditUsedForThreshold;
    const creditEligible = Math.max(0, creditCardSpend - creditUsedForThreshold);

    // B. 체크카드 소진
    const debitUsedForThreshold = Math.min(debitCardSpend, remainingThreshold);
    remainingThreshold -= debitUsedForThreshold;
    const debitEligible = Math.max(0, debitCardSpend - debitUsedForThreshold);

    // C. 대중교통/전통시장 소진
    const marketUsedForThreshold = Math.min(marketTransitSpend, remainingThreshold);
    remainingThreshold -= marketUsedForThreshold;
    const marketEligible = Math.max(0, marketTransitSpend - marketUsedForThreshold);

    // 4. 공제액 계산
    const creditDeduction = Math.round(creditEligible * 0.15); // 신용카드 15%
    const debitDeduction = Math.round(debitEligible * 0.30); // 체크카드 30%
    const marketDeduction = Math.round(marketEligible * 0.40); // 대중교통/전통시장 40%

    // 기본 한도 내 공제 (신용카드 + 체크카드)
    const rawStandardDeduction = creditDeduction + debitDeduction;
    const appliedStandardDeduction = Math.min(baseLimit, rawStandardDeduction);

    // 추가 한도 (전통시장/대중교통)
    const appliedExtraDeduction = Math.min(extraLimit, marketDeduction);
    const totalDeduction = appliedStandardDeduction + appliedExtraDeduction;

    // 5. 한계세율 적용 실제 연말정산 환급액 (총급여 구간별 실효 한계세율)
    let marginalRate = 0.15; // 기본 15%
    if (annualSalary <= 30000000) marginalRate = 0.06;
    else if (annualSalary <= 70000000) marginalRate = 0.15;
    else if (annualSalary <= 120000000) marginalRate = 0.24;
    else marginalRate = 0.35;

    const actualTaxRefund = Math.round(totalDeduction * marginalRate * 1.1); // 지방소득세 10% 포함

    // 황금비율 추천치: 25%까지는 신용카드 사용, 25% 초과분은 체크카드 사용
    const targetCheckAmountForMaxLimit = Math.round(baseLimit / 0.30);

    return {
      threshold25,
      totalSpend,
      excessSpend,
      baseLimit,
      creditDeduction,
      debitDeduction,
      marketDeduction,
      totalDeduction,
      marginalRatePercent: (marginalRate * 100).toFixed(0),
      actualTaxRefund,
      targetCheckAmountForMaxLimit,
    };
  }, [annualSalary, creditCardSpend, debitCardSpend, marketTransitSpend]);

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
              <span>💳 연말정산 절세 황금비율</span>
              <span>•</span>
              <span>25% 문턱 신용카드 + 초과분 체크카드 30%</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              {isKo ? '신용카드 vs 체크카드 소득공제 계산기' : 'Credit vs Debit Card Tax Deduction Optimizer'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isKo
                ? '총급여 25% 문턱까지는 혜택 좋은 신용카드를 쓰고, 초과분은 공제율 2배인 체크카드를 써서 연말정산 환급금을 극대화합니다.'
                : 'Optimize credit (15%) vs debit card (30%) spending beyond the 25% income threshold to maximize year-end tax refunds.'}
            </p>
          </div>
          <div className="text-right p-4 rounded-lg bg-muted/50 border border-border">
            <span className="text-xs text-muted-foreground block">{isKo ? '예상 연말정산 환급액' : 'Estimated Tax Refund'}</span>
            <span className="text-2xl font-black text-primary">+{formatKrw(calculation.actualTaxRefund)}</span>
            <span className="text-xs text-muted-foreground block mt-0.5">
              (소득공제 {formatManwon(calculation.totalDeduction)})
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 입력 섹션 */}
        <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-base border-b border-border pb-3">
            {isKo ? '1. 연봉 및 연간 카드 지출액' : '1. Annual Salary & Card Spending'}
          </h3>

          {/* 총급여 연봉 */}
          <div>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <label htmlFor="annualSalary" className="font-medium text-foreground">
                {isKo ? '연봉 (세전 총급여)' : 'Annual Gross Salary'}
              </label>
              <span className="text-primary font-bold">{formatManwon(annualSalary)}</span>
            </div>
            <input
              id="annualSalary"
              type="range"
              min="20000000"
              max="150000000"
              step="2000000"
              value={annualSalary}
              onChange={(e) => setAnnualSalary(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>2,000만원</span>
              <span>공제 문턱(25%): {formatManwon(calculation.threshold25)}</span>
              <span>1억 5,000만원</span>
            </div>
          </div>

          {/* 신용카드 사용액 */}
          <div>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <label htmlFor="creditCardSpend" className="font-medium text-foreground">
                {isKo ? '연간 신용카드 사용액' : 'Credit Card Spend (15% rate)'}
              </label>
              <span className="text-foreground font-bold">{formatManwon(creditCardSpend)}</span>
            </div>
            <input
              id="creditCardSpend"
              type="range"
              min="0"
              max="50000000"
              step="500000"
              value={creditCardSpend}
              onChange={(e) => setCreditCardSpend(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
            />
          </div>

          {/* 체크카드 및 현금영수증 사용액 */}
          <div>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <label htmlFor="debitCardSpend" className="font-medium text-foreground">
                {isKo ? '연간 체크카드·현금영수증 사용액' : 'Debit Card & Cash Receipts (30% rate)'}
              </label>
              <span className="text-primary font-bold">{formatManwon(debitCardSpend)}</span>
            </div>
            <input
              id="debitCardSpend"
              type="range"
              min="0"
              max="40000000"
              step="500000"
              value={debitCardSpend}
              onChange={(e) => setDebitCardSpend(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {isKo ? '체크카드와 현금영수증은 신용카드의 2배(30%)로 공제됩니다.' : 'Debit & cash receipts deduct at double the rate (30%).'}
            </p>
          </div>

          {/* 대중교통 및 전통시장 */}
          <div>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <label htmlFor="marketTransitSpend" className="font-medium text-foreground">
                {isKo ? '대중교통·전통시장 사용액' : 'Transit & Traditional Market (40% rate)'}
              </label>
              <span className="text-foreground font-semibold">{formatManwon(marketTransitSpend)}</span>
            </div>
            <input
              id="marketTransitSpend"
              type="range"
              min="0"
              max="15000000"
              step="500000"
              value={marketTransitSpend}
              onChange={(e) => setMarketTransitSpend(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* 결과 섹션 */}
        <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-base border-b border-border pb-3">
              {isKo ? '2. 소득공제 및 세금 환급액 분석' : '2. Deduction & Refund Breakdown'}
            </h3>

            {/* 환급 성과 카드 */}
            <div className="mt-4 p-4 rounded-xl border border-primary/30 bg-primary/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {isKo ? '카드 소득공제로 돌려받는 세금' : 'Net Tax Refund From Cards'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-background text-primary border border-primary/30">
                  {isKo ? `한계세율 ${calculation.marginalRatePercent}%` : `${calculation.marginalRatePercent}% Tax Rate`}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-primary">
                  +{formatKrw(calculation.actualTaxRefund)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isKo
                  ? `총 ${formatManwon(calculation.totalDeduction)}의 소득공제를 인정받아 통장으로 환급됩니다.`
                  : `${formatManwon(calculation.totalDeduction)} deduction approved.`}
              </p>
            </div>

            {/* 세부 명세표 */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">{isKo ? '총급여 25% 문턱 (공제 대상 아님)' : '25% Threshold (No Deduction)'}</span>
                <span className="font-medium text-foreground">{formatManwon(calculation.threshold25)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">{isKo ? '25% 초과 인정 사용액' : 'Excess Deductible Spending'}</span>
                <span className="font-medium text-foreground">{formatManwon(calculation.excessSpend)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">{isKo ? '신용카드 공제액 (15%)' : 'Credit Card Deduction (15%)'}</span>
                <span className="font-medium text-foreground">+{formatKrw(calculation.creditDeduction)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">{isKo ? '체크카드 공제액 (30%)' : 'Debit Card Deduction (30%)'}</span>
                <span className="font-medium text-primary">+{formatKrw(calculation.debitDeduction)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">{isKo ? '대중교통/전통시장 공제액 (40%)' : 'Transit/Market Deduction (40%)'}</span>
                <span className="font-medium text-foreground">+{formatKrw(calculation.marketDeduction)}</span>
              </div>
            </div>
          </div>

          {/* 황금비율 실전 팁 */}
          <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground space-y-1">
            <div className="font-semibold text-foreground flex items-center gap-1">
              <span>💡 카드 소득공제 황금비율 공식</span>
            </div>
            <p>
              • <strong>1단계 (1월~8월)</strong>: 총급여 25%({formatManwon(calculation.threshold25)})까지는 항공 마일리지나 할인 혜택이 좋은 <strong>신용카드</strong>를 집중 사용하세요.
            </p>
            <p>
              • <strong>2단계 (9월~12월)</strong>: 25%를 채운 시점부터는 공제율이 2배 높은 <strong>체크카드(30%)</strong>로 갈아타서 한도({formatManwon(calculation.baseLimit)})를 빠르게 채우는 것이 최적입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
