import { useState, useMemo } from 'react';

type DepartureReason = 'involuntary' | 'contract_end' | 'health_reasons' | 'commute_issue' | 'voluntary_other';

export default function UnemploymentBenefitCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [monthlyWage, setMonthlyWage] = useState<number>(3200000); // 퇴직 전 3개월 월평균 급여 (기본 320만원)
  const [insuredDays, setInsuredDays] = useState<number>(360); // 고용보험 피보험단위기간 (일, 기본 360일)
  const [age, setAge] = useState<number>(32); // 만 나이 (기본 32세)
  const [tenureYears, setTenureYears] = useState<number>(3); // 총 고용보험 가입 기간 (년)
  const [reason, setReason] = useState<DepartureReason>('involuntary');
  const [dailyHours, setDailyHours] = useState<number>(8); // 1일 소정근로시간 (기본 8시간)

  const calculation = useMemo(() => {
    // 1. 피보험단위기간 180일 충족 여부
    const isDaysEligible = insuredDays >= 180;

    // 2. 퇴사 사유 판정
    let isReasonEligible = true;
    let reasonNote = '';

    if (reason === 'involuntary') {
      reasonNote = isKo ? '권고사직·정리해고·회사 귀책 사유 (정상 수급 가능)' : 'Layoff / Involuntary termination (Eligible)';
    } else if (reason === 'contract_end') {
      reasonNote = isKo ? '계약직 근로계약 만료 (정상 수급 가능)' : 'Contract expiration (Eligible)';
    } else if (reason === 'health_reasons') {
      reasonNote = isKo ? '질병·부상으로 인한 자발적 퇴사 (의사 소견서 및 기업 휴직 거부 확인 필요)' : 'Medical condition with employer refusal of leave';
    } else if (reason === 'commute_issue') {
      reasonNote = isKo ? '사업장 이전 또는 이사로 통근시간 왕복 3시간 이상 (예외 인정 사유)' : 'Commute exceeds 3 hours due to relocation';
    } else {
      isReasonEligible = false;
      reasonNote = isKo ? '개인 사정 등 단순 자발적 퇴사는 원칙적으로 실업급여 수급이 불가능합니다.' : 'Voluntary resignation is generally ineligible.';
    }

    const isOverallEligible = isDaysEligible && isReasonEligible;

    // 3. 구직급여일액 계산 (평균임금의 60%)
    // 1일 평균임금 = (월급여 * 3개월) / 약 91일
    const dailyAverageWage = (monthlyWage * 3) / 91.25;
    const rawDailyBenefit = dailyAverageWage * 0.6;

    // 2026년 법정 상한액 및 하한액 (8시간 기준)
    const MAX_DAILY_BENEFIT = 66000; // 1일 상한 66,000원
    const MIN_DAILY_BENEFIT = Math.round(10030 * 0.8 * dailyHours); // 2026 최저임금 기준 하한액 (약 64,192원)

    let finalDailyBenefit = Math.max(MIN_DAILY_BENEFIT, Math.min(MAX_DAILY_BENEFIT, Math.round(rawDailyBenefit)));

    // 4. 소정급여일수 (수급 기간: 120일 ~ 270일)
    const isOver50OrDisabled = age >= 50;
    let benefitDays = 120;

    if (!isOver50OrDisabled) {
      // 50세 미만
      if (tenureYears < 1) benefitDays = 120;
      else if (tenureYears < 3) benefitDays = 150;
      else if (tenureYears < 5) benefitDays = 180;
      else if (tenureYears < 10) benefitDays = 210;
      else benefitDays = 240;
    } else {
      // 50세 이상 또는 장애인
      if (tenureYears < 1) benefitDays = 120;
      else if (tenureYears < 3) benefitDays = 180;
      else if (tenureYears < 5) benefitDays = 210;
      else if (tenureYears < 10) benefitDays = 240;
      else benefitDays = 270;
    }

    // 총 수령액 및 월 환산 수령액 (30일 기준)
    const totalBenefit = finalDailyBenefit * benefitDays;
    const monthlyBenefit = finalDailyBenefit * 30;
    const benefitMonths = Number((benefitDays / 30).toFixed(1));

    return {
      isOverallEligible,
      isDaysEligible,
      isReasonEligible,
      reasonNote,
      dailyAverageWage: Math.round(dailyAverageWage),
      finalDailyBenefit,
      benefitDays,
      benefitMonths,
      totalBenefit,
      monthlyBenefit,
    };
  }, [monthlyWage, insuredDays, age, tenureYears, reason, dailyHours, isKo]);

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
              <span>🛡️ 2026 고용보험 실업급여 기준</span>
              <span>•</span>
              <span>180일 자격 판별 · 1일 상·하한액 정밀 반영</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              {isKo ? '실업급여 수급자격 판정 & 모의계산기' : 'Unemployment Benefit Eligibility & Payout Calculator'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isKo
                ? '고용보험 피보험단위기간과 퇴사 사유로 수급 자격을 판별하고, 1일 상한·하한액 기준 총 수령액을 계산합니다.'
                : 'Diagnose your Korean employment insurance unemployment benefit eligibility and calculate total payout amount.'}
            </p>
          </div>
          <div className="text-right p-4 rounded-lg bg-muted/50 border border-border">
            <span className="text-xs text-muted-foreground block">{isKo ? '예상 총 수령 실업급여' : 'Total Unemployment Benefit'}</span>
            <span className="text-2xl font-black text-primary">{formatManwon(calculation.totalBenefit)}</span>
            <span className="text-xs text-muted-foreground block mt-0.5">
              ({calculation.benefitDays}일간 월 약 {formatManwon(calculation.monthlyBenefit)})
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 입력 섹션 */}
        <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-base border-b border-border pb-3">
            {isKo ? '1. 퇴사 정보 및 급여 입력' : '1. Employment & Departure Details'}
          </h3>

          {/* 퇴사 직전 3개월 월평균 급여 */}
          <div>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <label htmlFor="monthlyWage" className="font-medium text-foreground">
                {isKo ? '퇴직 전 3개월 월평균 세전 급여' : 'Average Monthly Wage (Last 3 Mo)'}
              </label>
              <span className="text-primary font-bold">{formatKrw(monthlyWage)}</span>
            </div>
            <input
              id="monthlyWage"
              type="range"
              min="1500000"
              max="10000000"
              step="100000"
              value={monthlyWage}
              onChange={(e) => setMonthlyWage(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
            />
          </div>

          {/* 퇴사 사유 선택 */}
          <div>
            <label htmlFor="reasonSelect" className="block text-sm font-medium mb-1.5 text-foreground">
              {isKo ? '퇴사 사유' : 'Reason for Leaving'}
            </label>
            <select
              id="reasonSelect"
              value={reason}
              onChange={(e) => setReason(e.target.value as DepartureReason)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="involuntary">{isKo ? '권고사직 · 경영상 해고 · 폐업 (정상 수급)' : 'Layoff / Involuntary termination'}</option>
              <option value="contract_end">{isKo ? '계약직 계약 기간 만료 (정상 수급)' : 'Fixed-term contract end'}</option>
              <option value="health_reasons">{isKo ? '질병 · 부상으로 계속 근무 불가 (예외 인정)' : 'Illness / Medical inability to work'}</option>
              <option value="commute_issue">{isKo ? '사업장 이전으로 통근 왕복 3시간 이상 (예외 인정)' : 'Commute exceeds 3 hours'}</option>
              <option value="voluntary_other">{isKo ? '개인 사정 · 이직 · 전업 등 단순 자발적 퇴사' : 'Voluntary resignation'}</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              {calculation.reasonNote}
            </p>
          </div>

          {/* 고용보험 피보험단위기간 (일) */}
          <div>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <label htmlFor="insuredDays" className="font-medium text-foreground">
                {isKo ? '고용보험 피보험단위기간 (보수지급 기초일수)' : 'Insured Days (Min 180 Days)'}
              </label>
              <span className="text-foreground font-bold">{insuredDays}일</span>
            </div>
            <input
              id="insuredDays"
              type="range"
              min="90"
              max="720"
              step="10"
              value={insuredDays}
              onChange={(e) => setInsuredDays(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>90일</span>
              <span>180일 (법정 필수 충족선)</span>
              <span>720일</span>
            </div>
          </div>

          {/* 나이 및 근속연수 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ageInput" className="block text-sm font-medium mb-1.5 text-foreground">
                {isKo ? '퇴사 당시 만 나이' : 'Age at Departure'}
              </label>
              <input
                id="ageInput"
                type="number"
                min="18"
                max="75"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <span className="text-xs text-muted-foreground mt-0.5 block">50세 이상 우대</span>
            </div>
            <div>
              <label htmlFor="tenureSelect" className="block text-sm font-medium mb-1.5 text-foreground">
                {isKo ? '총 고용보험 가입기간' : 'Total Insurance Tenure'}
              </label>
              <select
                id="tenureSelect"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value={0.5}>1년 미만 (120일)</option>
                <option value={2}>1년 이상 ~ 3년 미만</option>
                <option value={4}>3년 이상 ~ 5년 미만</option>
                <option value={7}>5년 이상 ~ 10년 미만</option>
                <option value={11}>10년 이상 (최대 기간)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 결과 섹션 */}
        <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-base border-b border-border pb-3">
              {isKo ? '2. 수급 자격 판정 및 예상 급여액' : '2. Eligibility & Benefit Calculation'}
            </h3>

            {/* 자격 카드 */}
            <div className={`mt-4 p-4 rounded-xl border ${
              calculation.isOverallEligible
                ? 'border-primary/30 bg-primary/10'
                : 'border-destructive/30 bg-destructive/10'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {isKo ? '실업급여 수급 자격 판정' : 'Eligibility Status'}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold bg-background border ${
                  calculation.isOverallEligible
                    ? 'text-primary border-primary/30'
                    : 'text-destructive border-destructive/30'
                }`}>
                  {calculation.isOverallEligible ? (isKo ? '수급 자격 충족' : 'Eligible') : (isKo ? '수급 불가 사유 발생' : 'Ineligible')}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-foreground">
                  {calculation.isOverallEligible
                    ? formatKrw(calculation.totalBenefit)
                    : (isKo ? '수급 불가' : 'Not Eligible')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {calculation.isOverallEligible
                  ? (isKo ? `1일 ${formatKrw(calculation.finalDailyBenefit)} × ${calculation.benefitDays}일간 지급` : `Paid for ${calculation.benefitDays} days`)
                  : calculation.reasonNote}
              </p>
            </div>

            {/* 세부 명세표 */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">{isKo ? '1일 평균임금 (세전)' : 'Daily Average Wage'}</span>
                <span className="font-medium text-foreground">{formatKrw(calculation.dailyAverageWage)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">{isKo ? '1일 구직급여액 (상한 66,000원 / 하한 64,192원)' : 'Daily Benefit Rate'}</span>
                <span className="font-bold text-primary">{formatKrw(calculation.finalDailyBenefit)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">{isKo ? '총 소정급여일수' : 'Total Benefit Duration'}</span>
                <span className="font-bold text-foreground">{calculation.benefitDays}일 (약 {calculation.benefitMonths}개월)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">{isKo ? '월 환산 수령액 (30일 기준)' : 'Monthly Equivalent'}</span>
                <span className="font-medium text-foreground">{formatKrw(calculation.monthlyBenefit)}</span>
              </div>
            </div>
          </div>

          {/* 신청 절차 가이드 */}
          <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground space-y-1">
            <div className="font-semibold text-foreground flex items-center gap-1">
              <span>💡 실업급여 신청 필수 체크리스트</span>
            </div>
            <p>
              • 퇴사 후 회사에 <strong>고용보험 상실신고서</strong>와 <strong>이직확인서</strong> 처리를 요청하세요.
            </p>
            <p>
              • 고용24(work24.go.kr)에서 구직신청 후 고용센터를 방문하거나 온라인 수급자격 인정 신청을 진행하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
