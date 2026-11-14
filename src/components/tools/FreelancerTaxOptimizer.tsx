import { useState, useMemo } from 'react';

interface Industry {
  id: string;
  name: string;
  code: string;
  simpleRate: number; // 단순경비율 (%)
  standardRate: number; // 기준경비율 (%)
}

const INDUSTRIES: Industry[] = [
  { id: 'it_dev', name: 'IT 개발자·웹디자이너 (940909)', code: '940909', simpleRate: 64.1, standardRate: 19.3 },
  { id: 'creator', name: '유튜버·크리에이터·인플루언서 (940306)', code: '940306', simpleRate: 64.1, standardRate: 17.3 },
  { id: 'writer', name: '작가·번역가·교정 (940100)', code: '940100', simpleRate: 58.7, standardRate: 17.1 },
  { id: 'rider', name: '배달 라이더·플랫폼 긱워커 (940918)', code: '940918', simpleRate: 79.4, standardRate: 27.2 },
  { id: 'tutor', name: '학습지·프리랜서 강사 (940908)', code: '940908', simpleRate: 75.0, standardRate: 23.3 },
  { id: 'other', name: '기타 자영업 프리랜서 (940909)', code: '940909', simpleRate: 64.1, standardRate: 19.3 },
];

export default function FreelancerTaxOptimizer({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [annualRevenue, setAnnualRevenue] = useState<number>(36000000); // 연간 3.3% 수입 (기본 3,600만원)
  const [industryId, setIndustryId] = useState<string>('it_dev');
  const [actualExpenses, setActualExpenses] = useState<number>(12000000); // 실제 지출 영수증 경비 (1,200만원)
  const [hasSalary, setHasSalary] = useState<boolean>(false); // 직장 병행 (투잡/N잡)
  const [salaryIncome, setSalaryIncome] = useState<number>(45000000); // 기존 직장 연봉
  const [isFirstYearOrSmall, setIsFirstYearOrSmall] = useState<boolean>(true); // 직전년도 수입 2,400만 미만 또는 신규

  const selectedIndustry = INDUSTRIES.find(i => i.id === industryId) || INDUSTRIES[0];

  const calculation = useMemo(() => {
    // 1. 기납부 세액 (원천징수 3.3%: 소득세 3% + 지방소득세 0.3%)
    const withheldTax = Math.round(annualRevenue * 0.033);
    const withheldIncomeTax = Math.round(annualRevenue * 0.03);
    const withheldLocalTax = withheldTax - withheldIncomeTax;

    // 2. 경비율 방식 계산 (단순경비율)
    const simpleExpenseAmount = Math.round(annualRevenue * (selectedIndustry.simpleRate / 100));
    const simpleIncomeAmount = Math.max(0, annualRevenue - simpleExpenseAmount);

    // 3. 간편장부 방식 계산 (실제 영수증 필요경비)
    const bookExpenseAmount = Math.min(annualRevenue, actualExpenses);
    const bookIncomeAmount = Math.max(0, annualRevenue - bookExpenseAmount);

    // 종합소득세 세율 계산 헬퍼 (2026 개정 기본세율)
    const computeTax = (taxableBase: number) => {
      if (taxableBase <= 0) return { tax: 0, rate: 0 };
      if (taxableBase <= 14000000) return { tax: taxableBase * 0.06, rate: 6 };
      if (taxableBase <= 50000000) return { tax: taxableBase * 0.15 - 1260000, rate: 15 };
      if (taxableBase <= 88000000) return { tax: taxableBase * 0.24 - 5760000, rate: 24 };
      if (taxableBase <= 150000000) return { tax: taxableBase * 0.35 - 15440000, rate: 35 };
      if (taxableBase <= 300000000) return { tax: taxableBase * 0.38 - 19940000, rate: 38 };
      if (taxableBase <= 500000000) return { tax: taxableBase * 0.40 - 25940000, rate: 40 };
      if (taxableBase <= 1000000000) return { tax: taxableBase * 0.42 - 35940000, rate: 42 };
      return { tax: taxableBase * 0.45 - 65940000, rate: 45 };
    };

    // 기본 소득공제 (본인 인적공제 150만원 + 표준세액공제 7만원)
    const basicDeduction = 1500000;
    const standardTaxCredit = 70000;

    // 투잡 근로소득 과표 가산분 (단순화: 근로소득공제 후 과표 2,000만원 가정)
    const extraSalaryBase = hasSalary ? Math.max(0, salaryIncome * 0.5 - basicDeduction) : 0;

    // A. 단순경비율 종합소득세 계산
    const baseSimple = Math.max(0, simpleIncomeAmount - basicDeduction + extraSalaryBase);
    const rawTaxSimple = computeTax(baseSimple);
    const determinedTaxSimple = Math.max(0, rawTaxSimple.tax - standardTaxCredit);
    const totalTaxSimple = Math.round(determinedTaxSimple * 1.1); // 지방소득세 10%
    const refundSimple = withheldTax - totalTaxSimple;

    // B. 간편장부(실제경비) 종합소득세 계산
    const baseBook = Math.max(0, bookIncomeAmount - basicDeduction + extraSalaryBase);
    const rawTaxBook = computeTax(baseBook);
    const determinedTaxBook = Math.max(0, rawTaxBook.tax - standardTaxCredit);
    const totalTaxBook = Math.round(determinedTaxBook * 1.1);
    const refundBook = withheldTax - totalTaxBook;

    const isSimpleBetter = refundSimple >= refundBook;
    const bestMethod = isSimpleBetter ? '단순경비율' : '간편장부(실제경비)';
    const maxRefund = Math.max(refundSimple, refundBook);
    const taxDiff = Math.abs(refundSimple - refundBook);

    return {
      withheldTax,
      withheldIncomeTax,
      withheldLocalTax,
      simpleExpenseAmount,
      simpleIncomeAmount,
      totalTaxSimple,
      refundSimple,
      bookExpenseAmount,
      bookIncomeAmount,
      totalTaxBook,
      refundBook,
      isSimpleBetter,
      bestMethod,
      maxRefund,
      taxDiff,
    };
  }, [annualRevenue, selectedIndustry, actualExpenses, hasSalary, salaryIncome]);

  const formatKrw = (val: number) => {
    return new Intl.NumberFormat(isKo ? 'ko-KR' : 'en-US').format(Math.round(val)) + (isKo ? '원' : ' KRW');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-foreground">
      {/* 헤더 & 요약 배너 */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-foreground mb-2">
              <span>💼 2026 종합소득세 정밀 반영</span>
              <span>•</span>
              <span>3.3% 프리랜서 & N잡러 전용</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              {isKo ? '프리랜서 3.3% 종소세 환급 & 경비율 계산기' : 'Freelancer 3.3% Tax Refund & Expense Ratio Optimizer'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isKo
                ? '원천징수 3.3% 떼인 세금 돌려받기: 단순경비율 vs 실제 간편장부 중 어떤 방식이 환급액이 더 큰지 1초 만에 비교합니다.'
                : 'Compare simple expense ratio vs actual expense bookkeeping to maximize your May 3.3% withholding tax refund in Korea.'}
            </p>
          </div>
          <div className="text-right p-4 rounded-lg bg-muted/50 border border-border">
            <span className="text-xs text-muted-foreground block">{isKo ? '원천징수 기납부세액 (3.3%)' : 'Withheld Tax (3.3%)'}</span>
            <span className="text-lg font-bold text-foreground">{formatKrw(calculation.withheldTax)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 입력 섹션 */}
        <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-base border-b border-border pb-3">
            {isKo ? '1. 수입 및 업종 정보' : '1. Income & Industry Details'}
          </h3>

          {/* 연간 3.3% 수입금액 */}
          <div>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <label htmlFor="annualRevenue" className="font-medium text-foreground">
                {isKo ? '연간 3.3% 사업수입 (총매출)' : 'Annual 3.3% Gross Revenue'}
              </label>
              <span className="text-primary font-bold">{formatKrw(annualRevenue)}</span>
            </div>
            <input
              id="annualRevenue"
              type="range"
              min="5000000"
              max="150000000"
              step="1000000"
              value={annualRevenue}
              onChange={(e) => setAnnualRevenue(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>500만원</span>
              <span>5,000만원</span>
              <span>1억 5,000만원</span>
            </div>
          </div>

          {/* 업종 선택 */}
          <div>
            <label htmlFor="industrySelect" className="block text-sm font-medium mb-1.5 text-foreground">
              {isKo ? '프리랜서 업종 분류' : 'Industry Classification'}
            </label>
            <select
              id="industrySelect"
              value={industryId}
              onChange={(e) => setIndustryId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind.id} value={ind.id}>
                  {ind.name} (단순경비율 {ind.simpleRate}%)
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              {isKo
                ? `선택 업종 기준: 단순경비율 ${selectedIndustry.simpleRate}%, 기준경비율 ${selectedIndustry.standardRate}%`
                : `Expense rates: Simple ${selectedIndustry.simpleRate}%, Standard ${selectedIndustry.standardRate}%`}
            </p>
          </div>

          {/* 실제 영수증 경비 지출액 */}
          <div>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <label htmlFor="actualExpenses" className="font-medium text-foreground">
                {isKo ? '1년간 실제 지출한 필요경비 (카드·영수증)' : 'Actual Annual Expenses Incurred'}
              </label>
              <span className="text-primary font-bold">{formatKrw(actualExpenses)}</span>
            </div>
            <input
              id="actualExpenses"
              type="range"
              min="0"
              max={annualRevenue}
              step="500000"
              value={actualExpenses}
              onChange={(e) => setActualExpenses(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {isKo
                ? '💡 업무용 노트북·모니터 구입비, 통신비, 카페 미팅 식대, 도서구입비 등'
                : 'Business hardware, software subscriptions, mobile fees, meeting expenses.'}
            </p>
          </div>

          {/* 직장 병행 여부 */}
          <div className="pt-2 border-t border-border">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={hasSalary}
                onChange={(e) => setHasSalary(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <span>{isKo ? '직장인 투잡 (근로소득 + 3.3% 병행)' : 'Dual Earner (Employed + Freelance Side-gig)'}</span>
            </label>

            {hasSalary && (
              <div className="mt-3 pl-6 space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{isKo ? '직장 연봉' : 'Annual Employment Salary'}</span>
                  <span className="font-semibold text-foreground">{formatKrw(salaryIncome)}</span>
                </div>
                <input
                  type="range"
                  min="20000000"
                  max="120000000"
                  step="2000000"
                  value={salaryIncome}
                  onChange={(e) => setSalaryIncome(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* 결과 섹션 */}
        <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-base border-b border-border pb-3">
              {isKo ? '2. 절세 비교 & 예상 환급액 판정' : '2. Refund Analysis & Recommendation'}
            </h3>

            {/* 승리 방식 추천 카드 */}
            <div className={`mt-4 p-4 rounded-xl border ${
              calculation.maxRefund >= 0
                ? 'bg-primary/10 border-primary/30'
                : 'bg-muted border-border'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {isKo ? '최대 환급 유리 방식' : 'Recommended Optimal Method'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-background text-foreground border border-border">
                  {calculation.bestMethod}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-foreground">
                  {calculation.maxRefund >= 0
                    ? `+${formatKrw(calculation.maxRefund)} 환급`
                    : `${formatKrw(Math.abs(calculation.maxRefund))} 추가 납부`}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {calculation.isSimpleBetter
                  ? (isKo
                      ? `단순경비율(${selectedIndustry.simpleRate}%) 적용 시 간편장부 대비 약 ${formatKrw(calculation.taxDiff)} 더 절세됩니다.`
                      : `Simple expense ratio yields ${formatKrw(calculation.taxDiff)} more tax savings.`)
                  : (isKo
                      ? `실제 지출 증빙이 많아 간편장부 신고 시 단순경비율 대비 약 ${formatKrw(calculation.taxDiff)} 더 환급받습니다.`
                      : `Actual bookkeeping yields ${formatKrw(calculation.taxDiff)} more refund due to higher documented expenses.`)}
              </p>
            </div>

            {/* 두 방식 상세 비교 표 */}
            <div className="mt-5 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* 단순경비율 박스 */}
                <div className={`p-3 rounded-lg border ${calculation.isSimpleBetter ? 'border-primary/50 bg-primary/5' : 'border-border bg-muted/30'}`}>
                  <div className="font-semibold text-foreground mb-1">{isKo ? 'A. 단순경비율' : 'A. Simple Ratio'}</div>
                  <div className="text-muted-foreground">인정경비: {formatKrw(calculation.simpleExpenseAmount)}</div>
                  <div className="text-muted-foreground">결정세액: {formatKrw(calculation.totalTaxSimple)}</div>
                  <div className="font-bold text-foreground mt-2 pt-1 border-t border-border">
                    {calculation.refundSimple >= 0
                      ? `환급: ${formatKrw(calculation.refundSimple)}`
                      : `납부: ${formatKrw(Math.abs(calculation.refundSimple))}`}
                  </div>
                </div>

                {/* 간편장부 박스 */}
                <div className={`p-3 rounded-lg border ${!calculation.isSimpleBetter ? 'border-primary/50 bg-primary/5' : 'border-border bg-muted/30'}`}>
                  <div className="font-semibold text-foreground mb-1">{isKo ? 'B. 간편장부(영수증)' : 'B. Actual Bookkeeping'}</div>
                  <div className="text-muted-foreground">증빙경비: {formatKrw(calculation.bookExpenseAmount)}</div>
                  <div className="text-muted-foreground">결정세액: {formatKrw(calculation.totalTaxBook)}</div>
                  <div className="font-bold text-foreground mt-2 pt-1 border-t border-border">
                    {calculation.refundBook >= 0
                      ? `환급: ${formatKrw(calculation.refundBook)}`
                      : `납부: ${formatKrw(Math.abs(calculation.refundBook))}`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 홈택스 팁 */}
          <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground space-y-1">
            <div className="font-semibold text-foreground flex items-center gap-1">
              <span>💡 5월 종합소득세 신고 핵심 팁</span>
            </div>
            <p>
              • 3.3% 소득자는 5월 1일~31일 홈택스에서 <strong>환급금 계좌</strong>를 등록하고 신고해야 환급액이 6월 말~7월 초에 입금됩니다.
            </p>
            <p>
              • 연 수입 2,400만원 이상이거나 계속사업자라면 단순경비율이 불가능할 수 있으므로 반드시 지출 영수증을 모아두세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
