import { useState, useMemo } from 'react';

export default function WeeklyHolidayPayCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [hourlyWage, setHourlyWage] = useState<number>(10030); // 2026 최저시급 10,030원
  const [hoursPerDay, setHoursPerDay] = useState<number>(5); // 1일 근무시간 (5시간)
  const [daysPerWeek, setDaysPerWeek] = useState<number>(4); // 주 근무일수 (4일 = 주 20시간)
  const [workingMonths, setWorkingMonths] = useState<number>(6); // 근무 예정 기간 (6개월)

  const calculation = useMemo(() => {
    const weeklyHours = hoursPerDay * daysPerWeek;
    const isEligible = weeklyHours >= 15;

    let weeklyHolidayHours = 0;
    let weeklyHolidayPay = 0;

    if (isEligible) {
      if (weeklyHours >= 40) {
        weeklyHolidayHours = 8;
      } else {
        weeklyHolidayHours = weeklyHours / 5;
      }
      weeklyHolidayPay = Math.round(weeklyHolidayHours * hourlyWage);
    }

    const weeklyBasePay = Math.round(weeklyHours * hourlyWage);
    const totalWeeklyPay = weeklyBasePay + weeklyHolidayPay;
    const effectiveHourlyWage = weeklyHours > 0 ? Math.round(totalWeeklyPay / weeklyHours) : hourlyWage;

    const averageWeeksPerMonth = 4.3452;
    const monthlyHours = Math.round(weeklyHours * averageWeeksPerMonth);
    const monthlyBasePay = Math.round(weeklyBasePay * averageWeeksPerMonth);
    const monthlyHolidayPay = Math.round(weeklyHolidayPay * averageWeeksPerMonth);
    const totalMonthlyPay = monthlyBasePay + monthlyHolidayPay;

    // 4대보험 판정
    const isOver60Hours = monthlyHours >= 60 || weeklyHours >= 15;

    return {
      weeklyHours,
      isEligible,
      weeklyHolidayHours: parseFloat(weeklyHolidayHours.toFixed(1)),
      weeklyBasePay,
      weeklyHolidayPay,
      totalWeeklyPay,
      effectiveHourlyWage,
      monthlyHours,
      monthlyBasePay,
      monthlyHolidayPay,
      totalMonthlyPay,
      isOver60Hours,
    };
  }, [hourlyWage, hoursPerDay, daysPerWeek, workingMonths]);

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            {isKo ? '근무 조건 설정' : 'Work Schedule & Wage'}
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '약정 시급' : 'Hourly Wage'}</span>
              <span className="font-semibold text-foreground">{hourlyWage.toLocaleString()}{isKo ? '원' : ' KRW'}</span>
            </div>
            <input
              type="range"
              min={10030}
              max={30000}
              step={100}
              value={hourlyWage}
              onChange={(e) => setHourlyWage(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="text-primary font-medium">{isKo ? '2026년 최저시급 (10,030원)' : '2026 Min (10,030)'}</span>
              <span>20,000원</span>
              <span>30,000원</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '하루 근무 시간' : 'Hours Per Day'}</span>
              <span className="font-semibold text-foreground">{hoursPerDay}{isKo ? '시간' : ' hrs'}</span>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              step={0.5}
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1시간</span>
              <span>4시간 (반일)</span>
              <span>8시간 (전일제)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '1주일 근무 일수' : 'Days Per Week'}</span>
              <span className="font-semibold text-foreground">{daysPerWeek}{isKo ? '일' : ' days'} (주 {calculation.weeklyHours}시간)</span>
            </div>
            <input
              type="range"
              min={1}
              max={6}
              step={1}
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>주 1일</span>
              <span>주 3일</span>
              <span>주 5일 (기본)</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            {isKo ? '근무 기간 및 법적 요건' : 'Duration & Legal Context'}
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '근무 예정 기간' : 'Working Duration'}</span>
              <span className="font-semibold text-foreground">{workingMonths}{isKo ? '개월' : ' months'}</span>
            </div>
            <input
              type="range"
              min={1}
              max={24}
              step={1}
              value={workingMonths}
              onChange={(e) => setWorkingMonths(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1개월</span>
              <span>3개월 (고용보험 기준)</span>
              <span>12개월 (퇴직금 기준)</span>
            </div>
          </div>

          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">📌 {isKo ? '지각·조퇴 시 주휴수당 팩트' : 'Tardiness & Holiday Pay'}</p>
            <p>
              {isKo
                ? '고용노동부 행정해석(근기 68207-2776)에 따라 지각이나 조퇴가 있더라도 출근하여 근무했다면 결근이 아니므로 주휴수당은 전액 100% 지급되어야 합니다.'
                : 'Under official MoEL precedent, tardiness or early leaves do not count as absences; holiday pay must be paid in full.'}
            </p>
          </div>

          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">⚖️ {isKo ? '근로기준법 제55조 주휴수당' : 'Art 55 Labor Standards Act'}</p>
            <p>
              {isKo
                ? '주 15시간 이상 근무 시 1주일에 1회 이상의 유급휴일이 의무적으로 주어지며, 미지급 시 3년 이하의 징역 또는 3천만원 이하의 벌금에 처해집니다.'
                : '15+ weekly hours obligates 1 paid holiday per week; non-payment carries statutory criminal penalties.'}
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
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {calculation.isEligible
                  ? (isKo ? '✅ 주휴수당 지급 대상 (주 15시간 이상)' : '✅ Qualified for Holiday Pay')
                  : (isKo ? '❌ 주휴수당 미지급 (주 15시간 미만)' : '❌ Under 15 hrs (Exempt)')}
              </span>
              <span className="text-xs text-muted-foreground">
                {isKo ? `(주당 총 ${calculation.weeklyHours}시간 근무)` : `(${calculation.weeklyHours} hrs/week)`}
              </span>
            </div>
            <h3 className="mt-2 text-2xl font-bold text-foreground">
              {isKo ? '주휴수당 포함 실질 환산 시급' : 'Effective Real Hourly Wage'}
            </h3>
          </div>
          <div className="text-left md:text-right">
            <div className="text-3xl font-extrabold text-primary">
              {calculation.effectiveHourlyWage.toLocaleString()}{isKo ? '원/시간' : ' KRW/hr'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {isKo ? '기본 약정시급 대비: ' : 'vs Base Wage: '}
              <span className="text-primary font-semibold">
                +{calculation.isEligible ? '20%' : '0%'}
              </span>
            </div>
          </div>
        </div>

        {/* 3 Metrics */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? '1주당 주휴수당 금액' : 'Weekly Holiday Pay'}</div>
            <div className="text-lg font-semibold text-primary mt-1">
              +{calculation.weeklyHolidayPay.toLocaleString()}{isKo ? '원' : ' KRW'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {calculation.isEligible ? (isKo ? `주당 +${calculation.weeklyHolidayHours}시간 유급 가산` : `+${calculation.weeklyHolidayHours} paid hrs`) : (isKo ? '해당 없음' : 'N/A')}
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? '예상 월 총급여' : 'Total Monthly Pay'}</div>
            <div className="text-lg font-semibold text-foreground mt-1">
              {calculation.totalMonthlyPay.toLocaleString()}{isKo ? '원' : ' KRW'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {isKo ? `월 기본급 ${calculation.monthlyBasePay.toLocaleString()}원 포함` : `Base: ${calculation.monthlyBasePay.toLocaleString()}`}
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? '월 주휴수당 환산액' : 'Monthly Holiday Total'}</div>
            <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              +{calculation.monthlyHolidayPay.toLocaleString()}{isKo ? '원' : ' KRW'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {isKo ? '약 4.345주 누적액' : '4.345 weeks accumulated'}
            </div>
          </div>
        </div>

        {/* 4 Insurance Criteria */}
        <div className="rounded-lg border border-border bg-card p-4 text-xs space-y-3">
          <h4 className="font-semibold text-foreground">{isKo ? '단시간·알바 4대보험 의무 가입 진단' : '4 Major Social Insurance Status'}</h4>
          <div className="grid gap-2 sm:grid-cols-2 text-muted-foreground">
            <div className="rounded border border-border p-2">
              <strong className="text-foreground">산재보험:</strong> <span className="text-primary font-medium">100% 필수 가입</span>
              <p className="mt-0.5 text-muted-foreground">{isKo ? '근로시간 무관 1일 알바생도 사업주 전액 부담' : '100% employer paid'}</p>
            </div>
            <div className="rounded border border-border p-2">
              <strong className="text-foreground">고용보험:</strong>{' '}
              <span className={calculation.weeklyHours >= 15 || workingMonths >= 3 ? 'text-primary font-medium' : 'text-muted-foreground'}>
                {calculation.weeklyHours >= 15 || workingMonths >= 3 ? (isKo ? '의무 가입' : 'Required') : (isKo ? '가입 제외' : 'Exempt')}
              </span>
              <p className="mt-0.5 text-muted-foreground">
                {calculation.weeklyHours >= 15
                  ? (isKo ? '주 15시간 이상 의무 가입 (근로자 0.9%)' : '15+ hrs/wk (0.9%)')
                  : workingMonths >= 3
                  ? (isKo ? '3개월 이상 근무로 의무 가입' : '3+ months continuous')
                  : (isKo ? '주 15시간 미만 & 3개월 미만 제외' : 'Under 3 mo exempt')}
              </p>
            </div>
            <div className="rounded border border-border p-2">
              <strong className="text-foreground">국민연금:</strong>{' '}
              <span className={calculation.isOver60Hours ? 'text-primary font-medium' : 'text-muted-foreground'}>
                {calculation.isOver60Hours ? (isKo ? '의무 가입' : 'Required') : (isKo ? '적용 제외' : 'Exempt')}
              </span>
              <p className="mt-0.5 text-muted-foreground">
                {calculation.isOver60Hours ? (isKo ? '월 60시간(주 15시간) 이상 직장가입 (4.5%)' : '60+ hrs/mo (4.5%)') : (isKo ? '월 60시간 미만 직장가입 제외' : 'Under 60 hrs exempt')}
              </p>
            </div>
            <div className="rounded border border-border p-2">
              <strong className="text-foreground">건강보험:</strong>{' '}
              <span className={calculation.isOver60Hours ? 'text-primary font-medium' : 'text-muted-foreground'}>
                {calculation.isOver60Hours ? (isKo ? '의무 가입' : 'Required') : (isKo ? '적용 제외' : 'Exempt')}
              </span>
              <p className="mt-0.5 text-muted-foreground">
                {calculation.isOver60Hours ? (isKo ? '월 60시간 이상 직장가입 (약 3.545%)' : '60+ hrs/mo (3.545%)') : (isKo ? '부모님 피부양자/지역가입자 유지' : 'Dependent maintained')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
