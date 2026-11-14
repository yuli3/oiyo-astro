import { useState, useMemo } from 'react';

export default function YouthLeapSavingsSimulator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(700000); // 월 납입액 (기본 70만원)
  const [annualSalary, setAnnualSalary] = useState<number>(36000000); // 연소득 (기본 3,600만원)
  const [bankRate, setBankRate] = useState<number>(6.0); // 은행 기본+우대금리 (연 6.0%)
  const [age, setAge] = useState<number>(27); // 만 나이 (기본 27세)
  const [militaryYears, setMilitaryYears] = useState<number>(0); // 군 복무 기간 (년)

  const calculation = useMemo(() => {
    // 1. 나이 요건 확인 (만 19세~34세 이하, 군 복무 기간 최대 6년 가산 가능)
    const effectiveAge = age - militaryYears;
    const isAgeEligible = effectiveAge >= 19 && effectiveAge <= 34;

    // 2. 소득 요건 확인 (총급여 7,500만원 이하)
    const isIncomeEligible = annualSalary <= 75000000;
    const isEligible = isAgeEligible && isIncomeEligible;

    // 3. 정부기여금 매칭 계산 (2024~2026 확대 개정안 반영: 월 최대 33,000원 기여금 지원)
    let monthlyGovMatching = 0;
    let matchingTierLabel = '';

    if (annualSalary <= 24000000) {
      monthlyGovMatching = 33000;
      matchingTierLabel = isKo ? '2,400만원 이하 (최대 월 3.3만원 매칭)' : '≤24M KRW (Max 33k KRW/mo)';
    } else if (annualSalary <= 36000000) {
      monthlyGovMatching = 31000;
      matchingTierLabel = isKo ? '2,400만~3,600만원 (월 3.1만원 매칭)' : '24M–36M KRW (31k KRW/mo)';
    } else if (annualSalary <= 48000000) {
      monthlyGovMatching = 29000;
      matchingTierLabel = isKo ? '3,600만~4,800만원 (월 2.9만원 매칭)' : '36M–48M KRW (29k KRW/mo)';
    } else if (annualSalary <= 60000000) {
      monthlyGovMatching = 25000;
      matchingTierLabel = isKo ? '4,800만~6,000만원 (월 2.5만원 매칭)' : '48M–60M KRW (25k KRW/mo)';
    } else if (annualSalary <= 75000000) {
      monthlyGovMatching = 0;
      matchingTierLabel = isKo ? '6,000만~7,500만원 (기여금 없음, 15.4% 비과세 혜택만 적용)' : '60M–75M KRW (Tax-Exempt Only)';
    } else {
      monthlyGovMatching = 0;
      matchingTierLabel = isKo ? '7,500만원 초과 (가입 불가)' : 'Exceeds 75M KRW (Ineligible)';
    }

    // 4. 5년(60개월) 만기 수령액 정밀 복리 계산
    const months = 60;
    const principal = monthlyDeposit * months; // 총 원금 (70만 * 60 = 4,200만원)

    // 은행 적금 이자 계산 (단리 공식: 월납입액 * n(n+1)/2 * r/12)
    const monthlyRate = bankRate / 100 / 12;
    const bankInterest = monthlyDeposit * ((months * (months + 1)) / 2) * monthlyRate;

    // 비과세로 아낀 이자소득세 (15.4%)
    const taxSaved = bankInterest * 0.154;

    // 5년간 누적 정부기여금 + 기여금에 붙는 이자
    const totalGovMatching = monthlyGovMatching * months;
    const govInterest = monthlyGovMatching * ((months * (months + 1)) / 2) * monthlyRate;
    const govTotal = totalGovMatching + govInterest;

    // 최종 총 만기 수령액
    const totalMaturityPayout = Math.round(principal + bankInterest + govTotal);

    // 일반 과세 적금 기준 환산 금리 (일반 적금에서 15.4% 세금 떼고 이 금액을 맞추려면 필요한 표면 금리)
    const netProfit = totalMaturityPayout - principal;
    const equivalentBeforeTaxProfit = netProfit / (1 - 0.154);
    const equivalentBankRate = (equivalentBeforeTaxProfit / (monthlyDeposit * ((months * (months + 1)) / 2) / 12)) * 100;

    return {
      isEligible,
      isAgeEligible,
      isIncomeEligible,
      effectiveAge,
      matchingTierLabel,
      monthlyGovMatching,
      principal,
      bankInterest: Math.round(bankInterest),
      taxSaved: Math.round(taxSaved),
      totalGovMatching: Math.round(totalGovMatching),
      govTotal: Math.round(govTotal),
      totalMaturityPayout,
      equivalentBankRate: equivalentBankRate.toFixed(2),
    };
  }, [monthlyDeposit, annualSalary, bankRate, age, militaryYears, isKo]);

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
              <span>🚀 2026 청년도약계좌 & 주택드림 연계</span>
              <span>•</span>
              <span>정부기여금 월 최대 3.3만원 · 15.4% 비과세</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              {isKo ? '청년도약계좌 만기 수령액 & 정부기여금 시뮬레이터' : 'Youth Leap Savings & Dream Account Simulator'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isKo
                ? '5년 동안 월 최대 70만원 저축 시 정부기여금과 비과세 혜택으로 5,000만원 목돈을 모으는 실제 만기 수령액을 계산합니다.'
                : 'Calculate your 5-year lump-sum maturity payout including government matching and 15.4% tax exemption in Korea.'}
            </p>
          </div>
          <div className="text-right p-4 rounded-lg bg-muted/50 border border-border">
            <span className="text-xs text-muted-foreground block">{isKo ? '5년 만기 예상 수령액' : '5-Yr Maturity Lump Sum'}</span>
            <span className="text-2xl font-black text-primary">{formatManwon(calculation.totalMaturityPayout)}</span>
            <span className="text-xs text-muted-foreground block mt-0.5">
              {isKo ? `(일반적금 환산 연 ${calculation.equivalentBankRate}%)` : `(Equivalent to ${calculation.equivalentBankRate}% APR)`}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 입력 섹션 */}
        <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-base border-b border-border pb-3">
            {isKo ? '1. 가입자 정보 및 납입액 설정' : '1. Subscriber Details & Contribution'}
          </h3>

          {/* 월 납입 희망 금액 */}
          <div>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <label htmlFor="monthlyDeposit" className="font-medium text-foreground">
                {isKo ? '월 저축 납입액' : 'Monthly Deposit'}
              </label>
              <span className="text-primary font-bold">{formatKrw(monthlyDeposit)}</span>
            </div>
            <input
              id="monthlyDeposit"
              type="range"
              min="100000"
              max="700000"
              step="50000"
              value={monthlyDeposit}
              onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>10만원</span>
              <span>40만원</span>
              <span>70만원 (최대한도)</span>
            </div>
          </div>

          {/* 연소득 (총급여) */}
          <div>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <label htmlFor="annualSalary" className="font-medium text-foreground">
                {isKo ? '연소득 (세전 총급여)' : 'Annual Gross Salary'}
              </label>
              <span className="text-primary font-bold">{formatKrw(annualSalary)}</span>
            </div>
            <input
              id="annualSalary"
              type="range"
              min="15000000"
              max="90000000"
              step="1000000"
              value={annualSalary}
              onChange={(e) => setAnnualSalary(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1,500만원</span>
              <span>3,600만원</span>
              <span>7,500만원 (가입한도)</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {calculation.matchingTierLabel}
            </p>
          </div>

          {/* 나이 및 군 복무 기간 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ageInput" className="block text-sm font-medium mb-1.5 text-foreground">
                {isKo ? '만 나이' : 'Current Age'}
              </label>
              <input
                id="ageInput"
                type="number"
                min="18"
                max="45"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="militaryInput" className="block text-sm font-medium mb-1.5 text-foreground">
                {isKo ? '군 복무 기간 (년)' : 'Military Service (Years)'}
              </label>
              <select
                id="militaryInput"
                value={militaryYears}
                onChange={(e) => setMilitaryYears(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value={0}>{isKo ? '해당 없음 (0년)' : 'None (0 yrs)'}</option>
                <option value={1}>{isKo ? '1년 미만' : '1 yr'}</option>
                <option value={2}>{isKo ? '2년 (육군/해병/공군)' : '2 yrs'}</option>
                <option value={3}>{isKo ? '3년 이상' : '3 yrs'}</option>
              </select>
            </div>
          </div>

          {/* 은행 적용 금리 */}
          <div>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <label htmlFor="bankRateInput" className="font-medium text-foreground">
                {isKo ? '은행 적용 금리 (기본 4.5% + 우대금리)' : 'Bank Interest Rate (%)'}
              </label>
              <span className="text-foreground font-semibold">{bankRate}%</span>
            </div>
            <input
              id="bankRateInput"
              type="number"
              step="0.1"
              min="4.0"
              max="7.0"
              value={bankRate}
              onChange={(e) => setBankRate(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        {/* 결과 섹션 */}
        <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-base border-b border-border pb-3">
              {isKo ? '2. 만기 수령액 상세 명세 (5년)' : '2. 5-Year Maturity Breakdown'}
            </h3>

            {/* 메인 성과 박스 */}
            <div className="mt-4 p-4 rounded-xl border border-primary/30 bg-primary/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {isKo ? '최종 만기 지급 총액' : 'Total Maturity Payout'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-background text-primary border border-primary/30">
                  {isKo ? `이자+기여금 +${formatManwon(calculation.totalMaturityPayout - calculation.principal)}` : 'Profit'}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-primary">
                  {formatKrw(calculation.totalMaturityPayout)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isKo
                  ? `일반 은행 과세 적금 기준으로 연 ${calculation.equivalentBankRate}% 금리 상품에 가입한 것과 동일한 실질 수익입니다.`
                  : `Equivalent to a ${calculation.equivalentBankRate}% taxable bank savings deposit.`}
              </p>
            </div>

            {/* 세부 구성표 */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">{isKo ? '5년간 본인 총 납입 원금' : 'Principal Deposited'}</span>
                <span className="font-medium text-foreground">{formatKrw(calculation.principal)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">{isKo ? '은행 이자 (연 6.0% 비과세)' : 'Bank Interest'}</span>
                <span className="font-medium text-primary">+{formatKrw(calculation.bankInterest)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">{isKo ? '정부기여금 + 기여금 이자' : 'Government Matching + Interest'}</span>
                <span className="font-medium text-primary">+{formatKrw(calculation.govTotal)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">{isKo ? '비과세 혜택으로 아낀 세금 (15.4%)' : 'Tax Saved (15.4%)'}</span>
                <span className="font-medium text-primary">+{formatKrw(calculation.taxSaved)}</span>
              </div>
            </div>
          </div>

          {/* 청년주택드림 연계 가이드 */}
          <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground space-y-1">
            <div className="font-semibold text-foreground flex items-center gap-1">
              <span>🏠 청년주택드림 청약통장 연계 혜택</span>
            </div>
            <p>
              • 청년도약계좌 만기 수령금(약 5,000만원)을 <strong>청년주택드림 청약통장</strong>에 일시 납입할 수 있습니다.
            </p>
            <p>
              • 아파트 청약 당첨 시 분양가의 최대 80%까지 <strong>최저 연 2.2% 고정/변동 초저금리 주담대</strong> 혜택이 주어집니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
