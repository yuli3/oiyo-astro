import { useState, useMemo } from 'react';

type InterimReason = 'house' | 'jeonse' | 'medical' | 'bankruptcy' | 'wage-peak' | 'none';

export default function SeverancePayGuard({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [baseSalary, setBaseSalary] = useState<number>(3800000); // 월 기본급
  const [fixedAllowance, setFixedAllowance] = useState<number>(300000); // 월 고정수당
  const [annualBonus, setAnnualBonus] = useState<number>(5000000); // 연간 상여금
  const [unusedLeaveAllowance, setUnusedLeaveAllowance] = useState<number>(600000); // 전년도 미사용 연차수당
  const [workingDays, setWorkingDays] = useState<number>(1460); // 재직일수 (4년)
  const [reason, setReason] = useState<InterimReason>('house'); // 중간정산 사유

  const calculation = useMemo(() => {
    const isEligible = workingDays >= 365;

    const threeMonthFixedWages = (baseSalary + fixedAllowance) * 3;
    const proratedBonus = Math.round(annualBonus * (3 / 12));
    const proratedLeave = Math.round(unusedLeaveAllowance * (3 / 12));

    const totalThreeMonthWage = threeMonthFixedWages + proratedBonus + proratedLeave;
    const daysInThreeMonths = 92;

    const dailyAverageWage = Math.round(totalThreeMonthWage / daysInThreeMonths);

    // 1일 통상임금 (월 209시간, 8시간 기준)
    const monthlyFixed = baseSalary + fixedAllowance;
    const dailyOrdinaryWage = Math.round((monthlyFixed / 209) * 8);

    // 근로기준법 제19조 제2항: 통상임금 최저선 보장
    const isOrdinaryWageApplied = dailyOrdinaryWage > dailyAverageWage;
    const finalDailyWage = Math.max(dailyAverageWage, dailyOrdinaryWage);

    let severancePay = 0;
    if (isEligible) {
      severancePay = Math.round(finalDailyWage * 30 * (workingDays / 365));
    }

    const reasonsMap: Record<InterimReason, { name: string; qualified: boolean; docs: string }> = {
      house: {
        name: isKo ? '무주택자의 본인 명의 주택 구입' : 'Home purchase for homeless worker',
        qualified: true,
        docs: isKo ? '무주택 확인서, 건물등기부등본, 매매계약서 사본' : 'Title deed, Purchase contract',
      },
      jeonse: {
        name: isKo ? '무주택자의 전세금·임차보증금 부담 (현 직장 1회 한정)' : 'Jeonse deposit for homeless worker (once per job)',
        qualified: true,
        docs: isKo ? '무주택 확인서, 등본, 확정일자 찍힌 임대차계약서' : 'Lease agreement with fixed date',
      },
      medical: {
        name: isKo ? '본인·가족의 6개월 이상 요양 (임금총액 12.5% 초과비용)' : '6+ mo medical care exceeding 12.5% wage',
        qualified: true,
        docs: isKo ? '의사 진단서, 병원비 영수증, 가족관계증명서' : 'Medical diagnosis, hospital receipts',
      },
      bankruptcy: {
        name: isKo ? '최근 5년 이내 파산선고 또는 개인회생 결정' : 'Bankruptcy or rehabilitation within 5 yrs',
        qualified: true,
        docs: isKo ? '법원 파산선고문 또는 개인회생 개시결정문' : 'Court bankruptcy decree',
      },
      'wage-peak': {
        name: isKo ? '임금피크제 또는 근로시간 단축 시행' : 'Wage peak or hours reduction',
        qualified: true,
        docs: isKo ? '취업규칙 변경 확인서, 근로계약서' : 'Employment contract amendments',
      },
      none: {
        name: isKo ? '일반 퇴직 시 전액 수령' : 'Lump sum at standard retirement',
        qualified: false,
        docs: isKo ? '퇴직 시 IRP 계좌 이전 또는 법정 지급' : 'IRP account transfer form',
      },
    };

    return {
      isEligible,
      workingYears: parseFloat((workingDays / 365).toFixed(1)),
      dailyAverageWage,
      dailyOrdinaryWage,
      isOrdinaryWageApplied,
      finalDailyWage,
      severancePay,
      interim: reasonsMap[reason],
    };
  }, [baseSalary, fixedAllowance, annualBonus, unusedLeaveAllowance, workingDays, reason, isKo]);

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            {isKo ? '급여 및 재직 기간 설정' : 'Wage & Tenure Setting'}
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '월 기본급' : 'Monthly Base Salary'}</span>
              <span className="font-semibold text-foreground">{(baseSalary / 10000).toLocaleString()}{isKo ? '만원' : ' KRW'}</span>
            </div>
            <input
              type="range"
              min={1000000}
              max={15000000}
              step={100000}
              value={baseSalary}
              onChange={(e) => setBaseSalary(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>100만원</span>
              <span>380만원</span>
              <span>1,500만원</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '월 고정수당 (직책·직무 등)' : 'Fixed Monthly Allowance'}</span>
              <span className="font-semibold text-foreground">{(fixedAllowance / 10000).toLocaleString()}{isKo ? '만원' : ' KRW'}</span>
            </div>
            <input
              type="range"
              min={0}
              max={3000000}
              step={50000}
              value={fixedAllowance}
              onChange={(e) => setFixedAllowance(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0원</span>
              <span>150만원</span>
              <span>300만원</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '연간 상여금 (3/12 일할 산입)' : 'Annual Bonus (3/12)'}</span>
              <span className="font-semibold text-foreground">{(annualBonus / 10000).toLocaleString()}{isKo ? '만원' : ' KRW'}</span>
            </div>
            <input
              type="range"
              min={0}
              max={30000000}
              step={500000}
              value={annualBonus}
              onChange={(e) => setAnnualBonus(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0원</span>
              <span>500만원</span>
              <span>3,000만원</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '총 재직일수' : 'Total Working Days'}</span>
              <span className="font-semibold text-foreground">{workingDays}{isKo ? '일' : ' days'} ({calculation.workingYears}{isKo ? '년' : ' yrs'})</span>
            </div>
            <input
              type="range"
              min={30}
              max={7300}
              step={30}
              value={workingDays}
              onChange={(e) => setWorkingDays(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="text-primary font-medium">{isKo ? '법정 기준: 365일 이상' : 'Min 365 days'}</span>
              <span>1,095일 (3년)</span>
              <span>7,300일 (20년)</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            {isKo ? '중간정산 사유 및 법적 보호' : 'Interim Settlement & Rights'}
          </h2>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {isKo ? '중간정산 신청 사유 선택' : 'Select Interim Reason'}
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as InterimReason)}
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="house">{isKo ? '무주택자의 본인 명의 주택 구입' : 'Homeless worker home purchase'}</option>
              <option value="jeonse">{isKo ? '무주택자의 주거 목적 전세금·임차보증금' : 'Homeless worker jeonse deposit'}</option>
              <option value="medical">{isKo ? '본인·가족의 6개월 이상 요양' : 'Medical care 6+ months'}</option>
              <option value="bankruptcy">{isKo ? '최근 5년 이내 파산·개인회생 결정' : 'Bankruptcy or rehabilitation'}</option>
              <option value="wage-peak">{isKo ? '임금피크제 또는 근로시간 단축' : 'Wage peak or hours cut'}</option>
              <option value="none">{isKo ? '해당 사항 없음 (일반 퇴직 시)' : 'None (Regular retirement)'}</option>
            </select>
          </div>

          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">🛡️ {isKo ? '근로기준법 제19조 제2항 통상임금 보장' : 'Art 19-2 Minimum Ordinary Wage'}</p>
            <p>
              {isKo
                ? '육아기 단축근무, 병가, 또는 최근 야근 축소로 평균임금이 낮아지더라도, 법에 의해 1일 통상임금이 최저 보장선으로 강제 적용됩니다.'
                : 'If average wage falls below ordinary wage due to leaves, ordinary wage statutorily overrides as minimum ceiling.'}
            </p>
          </div>

          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">⏰ {isKo ? '퇴직금 14일 지급 기한' : '14-Day Mandatory Payout'}</p>
            <p>
              {isKo
                ? '근로자퇴직급여 보장법 제9조에 따라 퇴직일로부터 14일 이내에 전액 지급해야 하며, 지연 시 연 20%의 지연이자가 법적으로 부과됩니다.'
                : 'Full settlement must be completed within 14 days of retirement; 20% APR statutory interest applies on delay.'}
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
                  ? (isKo ? '✅ 법정 퇴직금 수급 적격 (1년 이상)' : '✅ Qualified for Severance (1+ yr)')
                  : (isKo ? '❌ 1년 미만 (법정 수급권 미발생)' : '❌ Under 365 days (Exempt)')}
              </span>
              {calculation.isOrdinaryWageApplied && (
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {isKo ? '통상임금 최저선 보장 적용됨' : 'Ordinary Wage Floor Protected'}
                </span>
              )}
            </div>
            <h3 className="mt-2 text-2xl font-bold text-foreground">
              {isKo ? '법정 퇴직금 산출 예상액' : 'Estimated Statutory Severance Pay'}
            </h3>
          </div>
          <div className="text-left md:text-right">
            <div className="text-3xl font-extrabold text-primary">
              {calculation.severancePay.toLocaleString()}{isKo ? '원' : ' KRW'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {isKo ? '1일 적용 임금: ' : 'Daily Wage Base: '}
              {calculation.finalDailyWage.toLocaleString()}{isKo ? '원' : ' KRW'}
            </div>
          </div>
        </div>

        {/* 3 Metrics */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? '1일 평균임금' : 'Daily Average Wage'}</div>
            <div className="text-lg font-semibold text-foreground mt-1">
              {calculation.dailyAverageWage.toLocaleString()}{isKo ? '원' : ' KRW'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {isKo ? '3개월 급여 + 상여금 3/12' : '3-mo wages + prorated bonus'}
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? '1일 통상임금 (최저선)' : 'Daily Ordinary Wage'}</div>
            <div className="text-lg font-semibold text-primary mt-1">
              {calculation.dailyOrdinaryWage.toLocaleString()}{isKo ? '원' : ' KRW'}
            </div>
            <div className="text-xs text-primary font-medium mt-0.5">
              {isKo ? '근로기준법 제19조 최저선' : 'Statutory floor guaranteed'}
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? '중간정산 적격 여부' : 'Interim Eligibility'}</div>
            <div className={`text-lg font-semibold mt-1 ${calculation.interim.qualified ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
              {calculation.interim.qualified ? (isKo ? '신청 가능' : 'Eligible') : (isKo ? '신청 불가' : 'Not Eligible')}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5 truncate">
              {calculation.interim.name}
            </div>
          </div>
        </div>

        {/* Interim Details */}
        {calculation.interim.qualified && (
          <div className="rounded-lg border border-border bg-card p-4 text-xs space-y-2 text-muted-foreground">
            <h4 className="font-semibold text-foreground">
              📋 {isKo ? `[${calculation.interim.name}] 중간정산 필수 증빙 서류` : 'Required Documents for Interim Payout'}
            </h4>
            <p className="text-foreground font-medium">{calculation.interim.docs}</p>
            <p>
              {isKo
                ? '※ 회사는 근로자의 법정 중간정산 신청 요건이 충족되면 취업규칙 등에 따라 퇴직금을 중간 정산하여 지급할 수 있습니다.'
                : 'Employers are authorized to disburse accrued severance pay when statutory criteria are met.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
