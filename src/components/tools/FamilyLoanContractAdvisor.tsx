import { useState, useMemo } from 'react';

export default function FamilyLoanContractAdvisor({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [principal, setPrincipal] = useState<number>(200000000); // 2억원
  const [interestRate, setInterestRate] = useState<number>(0); // 0% (무이자)
  const [loanYears, setLoanYears] = useState<number>(3); // 3년
  const [monthlyIncome, setMonthlyIncome] = useState<number>(4000000); // 월 400만원
  const [copied, setCopied] = useState<boolean>(false);

  const STATUTORY_RATE = 0.046; // 4.6%
  const GIFT_TAX_THRESHOLD = 10000000; // 연 1천만원 미만

  const calculation = useMemo(() => {
    // 1. 최대 무이자 차용 한도
    const maxInterestFreePrincipal = Math.floor(GIFT_TAX_THRESHOLD / STATUTORY_RATE); // 217,391,304원

    // 2. 연간 법정 적정 이자 (4.6%)
    const annualStatutoryInterest = Math.round(principal * STATUTORY_RATE);

    // 3. 실제 약정 연 이자 및 월 이자
    const annualActualInterest = Math.round(principal * (interestRate / 100));
    const monthlyActualInterest = Math.round(annualActualInterest / 12);

    // 4. 이자 차액
    const interestDifference = Math.max(0, annualStatutoryInterest - annualActualInterest);

    // 5. 증여세 과세 대상 여부
    const isSubjectToGiftTax = interestDifference >= GIFT_TAX_THRESHOLD;
    const taxableGiftAmountPerYear = isSubjectToGiftTax ? interestDifference : 0;
    const totalTaxableGiftAmount = taxableGiftAmountPerYear * loanYears;

    // 6. 비과세를 위한 최소 필요 이자율
    let minRequiredAnnualInterest = 0;
    let minRequiredRate = 0;
    if (principal > maxInterestFreePrincipal) {
      minRequiredAnnualInterest = annualStatutoryInterest - GIFT_TAX_THRESHOLD + 1000; // 1천만원 미만 충족
      minRequiredRate = parseFloat(((minRequiredAnnualInterest / principal) * 100).toFixed(2));
    }
    const minRequiredMonthlyInterest = Math.round(minRequiredAnnualInterest / 12);

    // 7. 상환 능력 평가 (연소득 대비 원금 배수)
    const annualIncome = monthlyIncome * 12;
    const debtRatio = (principal / (annualIncome || 1)).toFixed(1);
    const isRepaymentFeasible = parseFloat(debtRatio) <= 10;

    return {
      maxInterestFreePrincipal,
      annualStatutoryInterest,
      annualActualInterest,
      monthlyActualInterest,
      interestDifference,
      isSubjectToGiftTax,
      taxableGiftAmountPerYear,
      totalTaxableGiftAmount,
      minRequiredAnnualInterest,
      minRequiredRate,
      minRequiredMonthlyInterest,
      debtRatio: parseFloat(debtRatio),
      isRepaymentFeasible,
    };
  }, [principal, interestRate, loanYears, monthlyIncome]);

  const contractSampleText = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return `[금전소비대차계약서 (차용증)]

1. 차용 원금: 금 ${(principal).toLocaleString()}원정
2. 이자율: 연 ${interestRate}% (매월 지급액: ${(calculation.monthlyActualInterest).toLocaleString()}원)
3. 차용 기간: ${today}부터 ${loanYears}년간
4. 원금 상환 방법: 만기일 전액 일시상환 (또는 분할 상환)
5. 이자 지급일: 매월 말일 차입자 명의 계좌에서 대여자 명의 계좌로 자동이체

대여자(부/모): (인)
차입자(자녀): (인)
작성일: ${today}
※ 필수 조치: 작성 즉시 가까운 등기소에서 확정일자(수수료 600원) 날인 또는 공증 필수`;
  }, [principal, interestRate, loanYears, calculation.monthlyActualInterest]);

  const handleCopy = () => {
    navigator.clipboard.writeText(contractSampleText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            {isKo ? '부모-자녀 차용증 적정 이자율(4.6%) & 증여세 비과세 계산기' : 'Family Loan Contract & 4.6% Gift Tax Shield Advisor'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isKo
              ? '상속세및증여세법 제41조의4 법정 당좌대출이자율(4.6%)과 연 1,000만원 미만 비과세 한도, 국세청 필수 4대 요건을 진단합니다.'
              : 'Audit 4.6% statutory interest rate, under-10M KRW annual gift tax shield, and National Tax Service verification rules.'}
          </p>
        </div>

        {/* Input Form */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column: Loan Terms */}
          <div className="space-y-4 rounded-lg bg-muted/40 p-4 border border-border">
            <h4 className="text-sm font-semibold text-foreground">
              {isKo ? '1. 차용 계약 조건' : '1. Loan Contract Terms'}
            </h4>

            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{isKo ? '차용 원금' : 'Loan Principal'}</span>
                <span className="font-semibold text-foreground">{(principal / 10000).toLocaleString()}{isKo ? '만원' : '0k KRW'}</span>
              </div>
              <input
                type="number"
                step="5000000"
                value={principal}
                onChange={(e) => setPrincipal(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
              <div className="flex gap-2 mt-2">
                {[100000000, 200000000, 217000000, 300000000, 500000000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setPrincipal(amt)}
                    className="rounded bg-muted px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    {(amt / 100000000).toFixed(amt === 217000000 ? 2 : 0)}{isKo ? '억' : '00M'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{isKo ? '약정 연 이자율' : 'Agreed Annual Interest Rate'}</span>
                <span className="font-semibold text-primary">{interestRate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                <span>0% ({isKo ? '무이자' : 'Free'})</span>
                <span>2%</span>
                <span>4.6% ({isKo ? '법정 적정' : 'Statutory'})</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{isKo ? '차용 기간' : 'Loan Duration'}</span>
                <span className="font-semibold text-foreground">{loanYears}{isKo ? '년' : ' Years'}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={loanYears}
                onChange={(e) => setLoanYears(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>

          {/* Right Column: Repayment Capacity */}
          <div className="space-y-4 rounded-lg bg-muted/40 p-4 border border-border">
            <h4 className="text-sm font-semibold text-foreground">
              {isKo ? '2. 자녀(차입자) 상환 능력' : '2. Borrower Repayment Capacity'}
            </h4>

            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{isKo ? '자녀 세후 월 소득' : 'Monthly Net Income'}</span>
                <span className="font-semibold text-foreground">{(monthlyIncome / 10000).toLocaleString()}{isKo ? '만원' : '0k KRW'}</span>
              </div>
              <input
                type="number"
                step="500000"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>

            {/* Quick Metrics */}
            <div className="rounded-md bg-card p-3 border border-border text-xs space-y-2 mt-4">
              <div className="flex justify-between text-muted-foreground">
                <span>{isKo ? '최대 합법 무이자 대출 원금' : 'Max Tax-Free 0% Loan'}</span>
                <span className="font-semibold text-foreground">
                  {(calculation.maxInterestFreePrincipal / 100000000).toFixed(2)}{isKo ? '억원 (2.17억)' : '00M KRW'}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{isKo ? '연 법정 적정 이자 (4.6%)' : 'Statutory Interest (4.6%)'}</span>
                <span className="font-medium text-foreground">
                  {(calculation.annualStatutoryInterest).toLocaleString()}{isKo ? '원/년' : ' KRW/yr'}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{isKo ? '실제 지급 이자' : 'Actual Paid Interest'}</span>
                <span className="font-medium text-foreground">
                  {(calculation.annualActualInterest).toLocaleString()}{isKo ? '원/년 (월 ' : ' KRW/yr ('}
                  {(calculation.monthlyActualInterest).toLocaleString()}{isKo ? '원)' : ')'}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground border-t border-border pt-1.5">
                <span>{isKo ? '연 이자 차액 (비과세 한도 1천만원)' : 'Interest Difference'}</span>
                <span className={`font-bold ${calculation.interestDifference >= 10000000 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {(calculation.interestDifference).toLocaleString()}{isKo ? '원' : ' KRW'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Banner */}
        <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-5 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border pb-4">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {isKo ? '국세청 증여세 판정 결과' : 'Gift Tax Assessment'}
              </span>
              <h4 className="text-xl font-bold text-foreground mt-0.5">
                {calculation.isSubjectToGiftTax
                  ? (isKo ? '🚨 증여세 과세 대상! (이자 차액 연 1,000만원 이상)' : '🚨 Subject to Gift Tax!')
                  : (isKo ? '✅ 증여세 0원 전액 비과세 적법 차용' : '✅ 100% Tax-Free Legal Family Loan')}
              </h4>
            </div>

            <div className="text-right">
              <span className="text-xs text-muted-foreground">{isKo ? '증여세 과세 대상 차액' : 'Taxable Gift Gap'}</span>
              <div className={`text-2xl font-black ${calculation.isSubjectToGiftTax ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {calculation.isSubjectToGiftTax
                  ? `${calculation.taxableGiftAmountPerYear.toLocaleString()}${isKo ? '원/년' : ' KRW/yr'}`
                  : (isKo ? '0원 (비과세)' : '0 KRW (Shielded)')}
              </div>
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-card p-4 border border-border">
              <div className="text-xs text-muted-foreground">{isKo ? '증여세 면제 최소 이자율' : 'Min Required Interest Rate'}</div>
              <div className="text-lg font-bold text-primary mt-1">
                {calculation.minRequiredRate > 0 ? `연 ${calculation.minRequiredRate}%` : (isKo ? '0% (무이자 가능)' : '0% (Interest-Free)')}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {calculation.minRequiredRate > 0
                  ? (isKo ? `월 최소 ${(calculation.minRequiredMonthlyInterest).toLocaleString()}원 계좌이체 필요` : `Min ${(calculation.minRequiredMonthlyInterest).toLocaleString()} KRW/mo transfer`)
                  : (isKo ? '2.17억원 이하로 무이자 차용증 작성 가능' : 'Up to 217M KRW interest-free')}
              </div>
            </div>

            <div className="rounded-lg bg-card p-4 border border-border">
              <div className="text-xs text-muted-foreground">{isKo ? '상환 능력 (연소득 대비 원금)' : 'Debt-to-Income Ratio'}</div>
              <div className={`text-lg font-bold mt-1 ${calculation.isRepaymentFeasible ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                {calculation.debtRatio}{isKo ? '배' : 'x'} ({calculation.isRepaymentFeasible ? (isKo ? '적정' : 'Normal') : (isKo ? '과다 주의' : 'High Risk')})
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {isKo ? '국세청 조사 시 소득 대비 과도한 차용은 증여 추정' : 'Disproportionate debt is presumed gift'}
              </div>
            </div>

            <div className="rounded-lg bg-card p-4 border border-border">
              <div className="text-xs text-muted-foreground">{isKo ? '매월 실제 송금할 이자' : 'Actual Monthly Transfer'}</div>
              <div className="text-lg font-bold text-foreground mt-1">
                {calculation.monthlyActualInterest.toLocaleString()}{isKo ? '원' : ' KRW'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {isKo ? '반드시 자녀 명의 통장에서 부모 통장으로 이체' : 'Must transfer via verified bank trail'}
              </div>
            </div>
          </div>

          {/* Checklist of 4 Golden Rules */}
          <div className="rounded-lg bg-card p-4 border border-border space-y-3 text-xs text-muted-foreground">
            <h5 className="font-semibold text-foreground">
              📋 {isKo ? '국세청 차용증 진정성 인정 필수 4대 수칙 (미이행 시 증여세 추징)' : 'National Tax Service 4-Step Verification Checklist'}
            </h5>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span>
                  <strong>{isKo ? '작성 시점의 객관적 증빙:' : 'Objective Timestamp:'}</strong>{' '}
                  {isKo ? '가까운 등기소에서 확정일자(수수료 600원) 날인 또는 공증 필수 (사후 작성 소급 인정 불가).' : 'Register with notary or court/registry office date stamp.'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span>
                  <strong>{isKo ? '자녀 상환 능력 입증:' : 'Borrower Income:'}</strong>{' '}
                  {isKo ? '소득금액증명원, 근로소득 원천징수영수증으로 원리금 상환 가능성 입증.' : 'Borrower must possess legitimate income stream.'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span>
                  <strong>{isKo ? '실제 금융 계좌이체 내역:' : 'Bank Trail:'}</strong>{' '}
                  {isKo ? '원금 입금 및 매월 약정한 날짜에 이자를 계좌이체로 기록 보존 (현금 거래 금지).' : 'Every interest and principal must be electronic bank transfers.'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary font-bold">4.</span>
                <span>
                  <strong>{isKo ? '만기 시 실제 원금 상환:' : 'Principal Payback:'}</strong>{' '}
                  {isKo ? '계약 만기 시 원금을 실제로 상환하거나 정당한 사유로 기한 연장 차용증 재작성.' : 'Principal must actually be reimbursed upon maturity.'}
                </span>
              </div>
            </div>
          </div>

          {/* Copyable Contract Sample */}
          <div className="rounded-lg bg-muted/60 p-4 border border-border space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-foreground">
                📄 {isKo ? '차용증 표준 서식 문구 미리보기' : 'Standard Loan Contract Template'}
              </span>
              <button
                onClick={handleCopy}
                className="rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {copied ? (isKo ? '복사 완료!' : 'Copied!') : (isKo ? '문구 복사' : 'Copy Template')}
              </button>
            </div>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono bg-background p-3 rounded border border-border max-h-48 overflow-y-auto">
              {contractSampleText}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
