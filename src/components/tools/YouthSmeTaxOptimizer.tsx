import { useState, useMemo } from 'react';

export default function YouthSmeTaxOptimizer({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [employmentAge, setEmploymentAge] = useState<number>(28); // 취업 당시 만 나이
  const [militaryMonths, setMilitaryMonths] = useState<number>(18); // 군 복무 개월 수 (0~72개월)
  const [annualSalary, setAnnualSalary] = useState<number>(38000000); // 연간 총급여 (3,800만원)
  const [isSme, setIsSme] = useState<boolean>(true); // 중소기업 해당 여부
  const [unappliedYears, setUnappliedYears] = useState<number>(2); // 과거 미신청 재직 기간 (0~5년)

  const calculation = useMemo(() => {
    // 군 복무 연수 차감 (최대 6년 = 72개월)
    const militaryYears = Math.min(6, Math.floor(militaryMonths / 12));
    const adjustedAge = employmentAge - militaryYears;

    const isAgeEligible = adjustedAge >= 15 && adjustedAge <= 34;
    const isEligible = isAgeEligible && isSme;

    // 표준 근로소득세 산출세액 추정
    let earnedIncomeDeduction = 0;
    if (annualSalary <= 5000000) {
      earnedIncomeDeduction = annualSalary * 0.7;
    } else if (annualSalary <= 15000000) {
      earnedIncomeDeduction = 3500000 + (annualSalary - 5000000) * 0.4;
    } else if (annualSalary <= 45000000) {
      earnedIncomeDeduction = 7500000 + (annualSalary - 15000000) * 0.15;
    } else if (annualSalary <= 100000000) {
      earnedIncomeDeduction = 12000000 + (annualSalary - 45000000) * 0.05;
    } else {
      earnedIncomeDeduction = 14750000 + (annualSalary - 100000000) * 0.02;
    }

    const earnedIncome = Math.max(0, annualSalary - earnedIncomeDeduction);
    const taxableIncome = Math.max(0, earnedIncome - 1500000 - annualSalary * 0.05);

    let tax = 0;
    if (taxableIncome <= 14000000) {
      tax = taxableIncome * 0.06;
    } else if (taxableIncome <= 50000000) {
      tax = 840000 + (taxableIncome - 14000000) * 0.14;
    } else if (taxableIncome <= 88000000) {
      tax = 5880000 + (taxableIncome - 50000000) * 0.24;
    } else {
      tax = 14900000 + (taxableIncome - 88000000) * 0.35;
    }

    let taxCredit = 0;
    if (tax <= 1300000) {
      taxCredit = tax * 0.55;
    } else {
      taxCredit = 715000 + (tax - 1300000) * 0.3;
    }
    const maxCredit = annualSalary <= 33000000 ? 740000 : annualSalary <= 70000000 ? 660000 : 500000;
    taxCredit = Math.min(taxCredit, maxCredit);

    const estimatedTax = Math.max(0, Math.round(tax - taxCredit));

    // 90% 감면, 연 최대 200만원 한도
    let annualReduction = 0;
    if (isEligible) {
      annualReduction = Math.min(2000000, Math.round(estimatedTax * 0.9));
    }

    const fiveYearTotalBenefit = annualReduction * 5;
    const retrospectiveRefund = annualReduction * unappliedYears;

    return {
      militaryYears,
      adjustedAge,
      isAgeEligible,
      isEligible,
      estimatedTax,
      annualReduction,
      fiveYearTotalBenefit,
      retrospectiveRefund,
    };
  }, [employmentAge, militaryMonths, annualSalary, isSme, unappliedYears]);

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            {isKo ? '연령 및 중소기업 재직 조건' : 'Eligibility & Employment'}
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '취업 당시 만 나이' : 'Age at Employment'}</span>
              <span className="font-semibold text-foreground">만 {employmentAge}세</span>
            </div>
            <input
              type="range"
              min={15}
              max={45}
              step={1}
              value={employmentAge}
              onChange={(e) => setEmploymentAge(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>만 15세</span>
              <span className="text-primary font-medium">{isKo ? '청년 기준: 만 15~34세' : 'Youth criteria: 15-34'}</span>
              <span>만 45세</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '군 복무 개월 수 (최대 6년 차감)' : 'Military Service Months'}</span>
              <span className="font-semibold text-foreground">{militaryMonths}개월 ({calculation.militaryYears}년 차감)</span>
            </div>
            <input
              type="range"
              min={0}
              max={72}
              step={1}
              value={militaryMonths}
              onChange={(e) => setMilitaryMonths(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>면제/미필 (0개월)</span>
              <span>육군 (18개월)</span>
              <span>최대 인정 (72개월)</span>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={isSme}
                onChange={(e) => setIsSme(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span>{isKo ? '소속 회사가 중소기업(또는 중견기업)에 해당함' : 'Employer is qualified SME'}</span>
            </label>
            <p className="mt-1 text-xs text-muted-foreground pl-6">
              {isKo
                ? '※ 병원·의원, 금융업, 법률·세무·회계 등 전문직 및 유흥업종은 감면 대상에서 제외됩니다.'
                : 'Medical, legal, accounting, and financial institutions are excluded.'}
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            {isKo ? '급여 및 과거 미신청 기간' : 'Salary & Past Unclaimed Years'}
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '연간 총급여' : 'Annual Salary'}</span>
              <span className="font-semibold text-foreground">{(annualSalary / 10000).toLocaleString()}{isKo ? '만원' : ' KRW'}</span>
            </div>
            <input
              type="range"
              min={20000000}
              max={80000000}
              step={1000000}
              value={annualSalary}
              onChange={(e) => setAnnualSalary(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>2,000만원</span>
              <span>5,000만원</span>
              <span>8,000만원</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '과거 미신청 재직 기간 (경정청구 환급)' : 'Unclaimed Past Years'}</span>
              <span className="font-semibold text-foreground">{unappliedYears}{isKo ? '년' : ' Years'}</span>
            </div>
            <input
              type="range"
              min={0}
              max={5}
              step={1}
              value={unappliedYears}
              onChange={(e) => setUnappliedYears(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0년 (올해 첫 신청)</span>
              <span>최대 5년 소급 가능</span>
            </div>
          </div>

          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">📌 {isKo ? '경정청구(5년 이내) 팁' : 'Retrospective Claim'}</p>
            <p>
              {isKo
                ? '과거 중소기업에 다녔으나 회사에 감면신청서를 제출하지 않아 세금을 다 냈다면, 국세청 홈택스에서 최근 5년치 소득세를 전액 환급(최대 1,000만원)받을 수 있습니다.'
                : 'If you worked at an SME without submitting the deduction form, you can retroactively claim up to 10M KRW from Hometax.'}
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
                  calculation.isEligible
                    ? 'bg-primary/20 text-primary'
                    : 'bg-destructive/20 text-destructive'
                }`}
              >
                {calculation.isEligible
                  ? (isKo ? '✅ 감면 대상 적격 (90% 감면)' : '✅ Qualified for 90% Tax Credit')
                  : (isKo ? '❌ 감면 요건 미충족' : '❌ Not Qualified')}
              </span>
              <span className="text-xs text-muted-foreground">
                {isKo
                  ? `(군 복무 차감 후 만 ${calculation.adjustedAge}세)`
                  : `(Adjusted age: ${calculation.adjustedAge})`}
              </span>
            </div>
            <h3 className="mt-2 text-2xl font-bold text-foreground">
              {isKo ? '연간 소득세 감면 예상액' : 'Annual Income Tax Reduction'}
            </h3>
          </div>
          <div className="text-left md:text-right">
            <div className="text-3xl font-extrabold text-primary">
              +{calculation.annualReduction.toLocaleString()}{isKo ? '원' : ' KRW'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {isKo ? '법정 감면 한도: 연 최대 200만원' : 'Statutory Cap: 2,000,000 KRW/yr'}
            </div>
          </div>
        </div>

        {/* 3 Metrics */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? '기본 근로소득세 추정' : 'Standard Earned Income Tax'}</div>
            <div className="text-lg font-semibold text-foreground mt-1">
              {calculation.estimatedTax.toLocaleString()}{isKo ? '원' : ' KRW'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {isKo ? '감면 전 기본 세액' : 'Before deduction'}
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? '5년간 총 절세 혜택' : '5-Year Total Benefit'}</div>
            <div className="text-lg font-semibold text-primary mt-1">
              {calculation.fiveYearTotalBenefit.toLocaleString()}{isKo ? '원' : ' KRW'}
            </div>
            <div className="text-xs text-primary font-medium mt-0.5">
              {isKo ? '최대 1,000만원 한도' : 'Up to 10M KRW'}
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? '경정청구 소급 환급액' : 'Retroactive Refund'}</div>
            <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              +{calculation.retrospectiveRefund.toLocaleString()}{isKo ? '원' : ' KRW'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {unappliedYears}{isKo ? '년치 미신청분 소급' : ' yrs retrospective'}
            </div>
          </div>
        </div>

        {/* Action Steps */}
        <div className="rounded-lg border border-border bg-card p-4 text-xs space-y-2 text-muted-foreground">
          <h4 className="font-semibold text-foreground">{isKo ? '신청 방법 및 필수 제출 서류' : 'How to Apply & Required Documents'}</h4>
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              <strong className="text-foreground">{isKo ? '재직 중인 경우' : 'Current Employees'}:</strong> {isKo ? '국세청 양식인 [중소기업 취업자 소득세 감면신청서]와 주민등록등본, 병적증명서(군 복무자)를 작성하여 회사 인사/총무팀에 제출합니다.' : 'Submit Application for Tax Reduction for SME Employees with military certificates to HR.'}
            </li>
            <li>
              <strong className="text-foreground">{isKo ? '이직한 경우' : 'Job Changers'}:</strong> {isKo ? '종전 직장에서 발급받은 감면 명세서(원천징수부)를 새 직장에 제출하면 5년의 잔여 기간 동안 연속하여 감면받을 수 있습니다.' : 'Transfer reduction records from previous employer to carry over 5-year timeline.'}
            </li>
            <li>
              <strong className="text-foreground">{isKo ? '퇴사자 / 미신청자 (경정청구)' : 'Past Unclaimed Claims'}:</strong> {isKo ? '국세청 홈택스 접속 → 세금신고 → 종합소득세 신고 → 근로소득자 신고 → 경정청구에서 해당 연도를 선택하고 클릭하여 계좌로 직접 환급받습니다.' : 'Log in to Hometax → Tax Return → Earned Income → Claim for Reassessment.'}
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
