import { useState, useMemo } from 'react';

export default function ReducedWorkingHoursParenting({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [salary, setSalary] = useState<number>(3500000); // 350만원
  const [reducedHours, setReducedHours] = useState<number>(10); // 주 10시간 단축 (하루 2시간)
  const [childAge, setChildAge] = useState<number>(8); // 만 8세

  const calculation = useMemo(() => {
    const isEligible = childAge <= 12; // 2026년 기준 초6 / 만 12세 이하

    const clampedReduced = Math.min(25, Math.max(5, reducedHours));
    const weeklyWorked = 40 - clampedReduced;

    // 회사 지급분
    const companyPay = Math.round(salary * (weeklyWorked / 40));

    // 고용보험 지원금 구간 1 (최초 5시간 100%, 상한 200만, 하한 50만)
    const t1Wage = Math.min(2000000, Math.max(500000, salary));
    const t1Hours = Math.min(5, clampedReduced);
    const govT1 = Math.round(t1Wage * (t1Hours / 40) * 1.0);

    // 고용보험 지원금 구간 2 (5시간 초과분 80%, 상한 150만, 하한 50만)
    const t2Wage = Math.min(1500000, Math.max(500000, salary));
    const t2Hours = Math.max(0, clampedReduced - 5);
    const govT2 = Math.round(t2Wage * (t2Hours / 40) * 0.8);

    const totalGov = govT1 + govT2;
    const totalIncome = companyPay + totalGov;
    const retentionRate = parseFloat(((totalIncome / salary) * 100).toFixed(1));

    return {
      isEligible,
      weeklyWorked,
      clampedReduced,
      companyPay,
      govT1,
      govT2,
      totalGov,
      totalIncome,
      retentionRate,
    };
  }, [salary, reducedHours, childAge]);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            {isKo ? '2026 육아기 근로시간 단축 급여 & 연차휴가 보장 계산기' : 'Reduced Working Hours for Childcare & Salary Retention Guard'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isKo
              ? '개정 남녀고용평등법(만 12세·초6 이하, 최대 3년) 고용보험 정부지원금, 회사 급여 실수령액 및 연차 100% 보장 여부를 진단합니다.'
              : 'Calculate government subsidies, company pay, and 100% annual leave protection for childcare working hour reductions.'}
          </p>
        </div>

        {/* Inputs */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4 rounded-lg bg-muted/40 p-4 border border-border">
            <h4 className="text-sm font-semibold text-foreground">
              {isKo ? '1. 단축 전 급여 및 자녀 정보' : '1. Pre-Reduction Wage & Child Info'}
            </h4>

            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{isKo ? '월 통상임금 (기본급+고정수당)' : 'Monthly Ordinary Wage'}</span>
                <span className="font-semibold text-foreground">{(salary / 10000).toLocaleString()}{isKo ? '만원' : '0k KRW'}</span>
              </div>
              <input
                type="number"
                step="100000"
                value={salary}
                onChange={(e) => setSalary(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
              <div className="flex gap-2 mt-2">
                {[2500000, 3500000, 4500000, 6000000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setSalary(amt)}
                    className="rounded bg-muted px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    {(amt / 10000).toLocaleString()}{isKo ? '만' : '0k'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{isKo ? '자녀 만 나이' : 'Child Age (Years)'}</span>
                <span className={`font-semibold ${calculation.isEligible ? 'text-primary' : 'text-destructive'}`}>
                  {isKo ? `만 ${childAge}세` : `${childAge} yrs`} ({calculation.isEligible ? (isKo ? '신청 가능' : 'Eligible') : (isKo ? '대상 초과' : 'Ineligible')})
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="14"
                step="1"
                value={childAge}
                onChange={(e) => setChildAge(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                <span>만 0세</span>
                <span>만 8세 (구 기준)</span>
                <span>만 12세 (초6 개정)</span>
                <span>만 14세</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4 rounded-lg bg-muted/40 p-4 border border-border">
            <h4 className="text-sm font-semibold text-foreground">
              {isKo ? '2. 주당 단축 시간 설정' : '2. Hours Reduction Setting'}
            </h4>

            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{isKo ? '주당 단축 시간' : 'Hours Reduced / Week'}</span>
                <span className="font-semibold text-primary">
                  {isKo ? `주 ${calculation.clampedReduced}시간 단축 (하루 ${(calculation.clampedReduced / 5).toFixed(1)}시간)` : `${calculation.clampedReduced}h / wk`}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                step="1"
                value={reducedHours}
                onChange={(e) => setReducedHours(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                <span>주 5시간 (하루 1h)</span>
                <span>주 10시간 (하루 2h)</span>
                <span>주 20시간</span>
                <span>주 25시간 (최대)</span>
              </div>
            </div>

            <div className="rounded-md bg-card p-3 border border-border text-xs space-y-2 mt-4">
              <div className="flex justify-between text-muted-foreground">
                <span>{isKo ? '단축 후 주 근로시간' : 'Post-Reduction Working Hours'}</span>
                <span className="font-semibold text-foreground">{calculation.weeklyWorked}{isKo ? '시간 / 주' : 'h / week'}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{isKo ? '회사 지급 비례 급여' : 'Company Pay Base'}</span>
                <span className="font-medium text-foreground">{(calculation.companyPay).toLocaleString()}{isKo ? '원' : ' KRW'}</span>
              </div>
              <div className="flex justify-between text-muted-foreground border-t border-border pt-1.5">
                <span>{isKo ? '고용보험 국비 지원금' : 'Gov Childcare Subsidy'}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  +{(calculation.totalGov).toLocaleString()}{isKo ? '원' : ' KRW'}
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
                {isKo ? '단축 기간 최종 월 총 수령액' : 'Total Monthly Income During Reduction'}
              </span>
              <h4 className="text-2xl font-black text-primary mt-0.5">
                {(calculation.totalIncome).toLocaleString()}{isKo ? '원 / 월' : ' KRW / mo'}
              </h4>
            </div>

            <div className="text-right">
              <span className="text-xs text-muted-foreground">{isKo ? '원래 급여 대비 소득 보전율' : 'Income Retention Rate'}</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {calculation.retentionRate}% {isKo ? '보전' : 'Maintained'}
              </div>
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-card p-4 border border-border">
              <div className="text-xs text-muted-foreground">{isKo ? '회사 지급 급여' : 'Company Pay'}</div>
              <div className="text-lg font-bold text-foreground mt-1">
                {(calculation.companyPay).toLocaleString()}{isKo ? '원' : ' KRW'}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {isKo ? `주 ${calculation.weeklyWorked}시간 근무 비례 지급` : `Pro-rated for ${calculation.weeklyWorked}h/wk`}
              </div>
            </div>

            <div className="rounded-lg bg-card p-4 border border-border">
              <div className="text-xs text-muted-foreground">{isKo ? '정부 지원금 합계' : 'Government Subsidy'}</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                +{(calculation.totalGov).toLocaleString()}{isKo ? '원' : ' KRW'}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {isKo ? `최초 5h(100%): ${calculation.govT1.toLocaleString()}원 + 초과(80%): ${calculation.govT2.toLocaleString()}원` : 'Tier 1 (100%) + Tier 2 (80%)'}
              </div>
            </div>

            <div className="rounded-lg bg-card p-4 border border-border">
              <div className="text-xs text-muted-foreground">{isKo ? '연차유급휴가 보장' : 'Annual Leave Guarantee'}</div>
              <div className="text-lg font-bold text-primary mt-1">
                {isKo ? '100% 정상 발생' : '100% Guaranteed'}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {isKo ? '근로기준법 제60조 단축 기간 출근 간주' : 'Legally counted as full attendance'}
              </div>
            </div>
          </div>

          {/* Legal Checklist */}
          <div className="rounded-lg bg-card p-4 border border-border text-xs text-muted-foreground space-y-1.5">
            <h5 className="font-semibold text-foreground">
              📋 {isKo ? '육아기 근로시간 단축 필수 법적 권리' : 'Statutory Protection Checklist'}
            </h5>
            <ul className="list-disc list-inside space-y-1">
              <li>
                {isKo
                  ? '최대 3년 사용 가능: 기본 1년에 더해 미사용 육아휴직 기간(최대 1년)을 합산하여 최대 3년까지 단축 근무를 활용할 수 있습니다.'
                  : 'Up to 3 Years: Can combine unused parental leave to extend reduction up to 3 full years.'}
              </li>
              <li>
                {isKo
                  ? '연차휴가 삭감 금지: 회사가 단축 근무를 이유로 연차 일수를 비례 삭감하는 것은 명백한 근로기준법 위반입니다.'
                  : 'No Annual Leave Prorating: Employers are prohibited by law from reducing accrued leave days.'}
              </li>
              <li>
                {isKo
                  ? '연장근로 금지 원칙: 근로자의 명시적 청구가 없는 한 회사는 단축 근로자에게 시간외 근로를 시킬 수 없습니다.'
                  : 'Overtime Ban: Employers cannot order overtime without explicit written employee request.'}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
