import { useState, useMemo } from 'react';

export default function DismissalNoticePayGuard({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [salary, setSalary] = useState<number>(3000000); // 300만원
  const [tenureMonths, setTenureMonths] = useState<number>(8); // 8개월
  const [noticeDays, setNoticeDays] = useState<number>(0); // 0일 (당일 해고)
  const [employees, setEmployees] = useState<number>(10); // 10인 사업장
  const [isOralOnly, setIsOralOnly] = useState<boolean>(true); // 문자/카톡/구두 통보

  const calculation = useMemo(() => {
    // 1. 1일 통상임금 (월 209시간, 8시간)
    const hourly = salary / 209;
    const dailyWage = Math.round(hourly * 8);

    // 2. 해고예고수당 (30일분 통상임금)
    const noticePay = dailyWage * 30;

    // 3. 해고예고수당 지급 의무 판정
    // 근로기준법 제26조 단서: 3개월 미만 근무자는 제외
    const isOver3Months = tenureMonths >= 3;
    const isNoticeViolated = noticeDays < 30;
    const isNoticePayEligible = isOver3Months && isNoticeViolated;

    // 4. 부당해고 구제신청 (5인 이상 사업장 + 서면통지의무 위반)
    const is5OrMore = employees >= 5;
    const isWrittenNoticeViolated = isOralOnly;
    const isUnfairDismissalHighRisk = is5OrMore && (isWrittenNoticeViolated || noticeDays === 0);

    return {
      tenureMonths,
      noticeDays,
      dailyWage,
      noticePay,
      isOver3Months,
      isNoticeViolated,
      isNoticePayEligible,
      is5OrMore,
      isWrittenNoticeViolated,
      isUnfairDismissalHighRisk,
    };
  }, [salary, tenureMonths, noticeDays, employees, isOralOnly]);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            {isKo ? '해고예고수당(30일분) 산출 & 부당해고 구제 진단기' : 'Dismissal Notice Pay (30-Day Wage) & Unfair Dismissal Guard'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isKo
              ? '근로기준법 제26조 30일 전 미예고 시 30일분 통상임금 지급 의무(5인 미만 포함) 및 제27조 서면통지의무 위반 여부를 실시간 진단합니다.'
              : 'Audit statutory 30-day dismissal notice pay under Labor Standards Act Art. 26 and test unfair dismissal claim eligibility.'}
          </p>
        </div>

        {/* Inputs */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4 rounded-lg bg-muted/40 p-4 border border-border">
            <h4 className="text-sm font-semibold text-foreground">
              {isKo ? '1. 급여 및 근속 기간' : '1. Wage & Employment Tenure'}
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
                {[2000000, 3000000, 4000000, 5000000].map((amt) => (
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
                <span>{isKo ? '근속 개월수' : 'Tenure (Months)'}</span>
                <span className="font-semibold text-foreground">{tenureMonths}{isKo ? '개월' : ' Months'}</span>
              </div>
              <input
                type="range"
                min="1"
                max="36"
                step="1"
                value={tenureMonths}
                onChange={(e) => setTenureMonths(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                <span>1개월</span>
                <span>3개월 (법적 분기점)</span>
                <span>12개월</span>
                <span>36개월</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4 rounded-lg bg-muted/40 p-4 border border-border">
            <h4 className="text-sm font-semibold text-foreground">
              {isKo ? '2. 해고 통보 상황' : '2. Dismissal Notification Context'}
            </h4>

            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{isKo ? '해고 사전 예고 일수' : 'Days of Advance Notice'}</span>
                <span className={`font-semibold ${noticeDays < 30 ? 'text-destructive' : 'text-primary'}`}>
                  {noticeDays === 0 ? (isKo ? '0일 (당일 해고)' : '0 Days (Same-day)') : `${noticeDays}${isKo ? '일 전 통보' : ' days'}`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                value={noticeDays}
                onChange={(e) => setNoticeDays(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                <span>0일 (당일)</span>
                <span>15일</span>
                <span>30일 (법정 기준선)</span>
                <span>40일</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                {isKo ? '사업장 상시 근로자 수' : 'Number of Employees'}
              </label>
              <select
                value={employees}
                onChange={(e) => setEmployees(parseInt(e.target.value))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={10}>{isKo ? '상시 5인 이상 사업장 (노동위원회 부당해고 구제 가능)' : '5+ Employees (Labor Commission Shield)'}</option>
                <option value={3}>{isKo ? '상시 5인 미만 사업장 (구제신청 불가, 해고수당은 보장)' : 'Under 5 Employees (Notice Pay Only)'}</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="oralOnly"
                checked={isOralOnly}
                onChange={(e) => setIsOralOnly(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              <label htmlFor="oralOnly" className="text-xs font-medium text-foreground cursor-pointer">
                {isKo ? '문자 / 카카오톡 / 구두로만 통보받음 (서면 종이 문서 미수령)' : 'Notified verbally or via text message only'}
              </label>
            </div>
          </div>
        </div>

        {/* Results Banner */}
        <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-5 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border pb-4">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {isKo ? '근로기준법 제26조 해고예고수당 판정' : 'Statutory Dismissal Notice Pay Assessment'}
              </span>
              <h4 className="text-2xl font-black text-primary mt-0.5">
                {calculation.isNoticePayEligible
                  ? `${calculation.noticePay.toLocaleString()}${isKo ? '원 청구 가능' : ' KRW Payable'}`
                  : (isKo ? '해고예고수당 미발생' : 'Not Eligible')}
              </h4>
            </div>

            <div className="text-right">
              <span className="text-xs text-muted-foreground">{isKo ? '1일 통상임금 기준' : 'Daily Ordinary Wage'}</span>
              <div className="text-xl font-bold text-foreground">
                {calculation.dailyWage.toLocaleString()}{isKo ? '원 / 일' : ' KRW / day'}
              </div>
            </div>
          </div>

          {/* 3 Status Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-card p-4 border border-border">
              <div className="text-xs text-muted-foreground">{isKo ? '30일분 해고예고수당' : '30-Day Notice Pay'}</div>
              <div className={`text-lg font-bold mt-1 ${calculation.isNoticePayEligible ? 'text-destructive' : 'text-muted-foreground'}`}>
                {calculation.isNoticePayEligible ? (isKo ? '즉시 지급 의무' : 'Immediate Duty') : (isKo ? '지급 의무 없음' : 'Exempt')}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {calculation.tenureMonths < 3
                  ? (isKo ? '3개월 미만 근무자는 법적 제외' : 'Exempt for <3 months')
                  : calculation.noticeDays >= 30
                  ? (isKo ? '30일 전 적법 예고 완료' : 'Notified 30 days prior')
                  : (isKo ? '5인 미만 사업장도 100% 지급 의무' : 'Applies to all workplaces')}
              </div>
            </div>

            <div className="rounded-lg bg-card p-4 border border-border">
              <div className="text-xs text-muted-foreground">{isKo ? '서면 통지 의무 위반' : 'Written Notice Duty'}</div>
              <div className={`text-lg font-bold mt-1 ${calculation.isWrittenNoticeViolated ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {calculation.isWrittenNoticeViolated ? (isKo ? '🚨 법 위반 (해고 무효)' : '🚨 Unlawful') : (isKo ? '서면 통지 준수' : 'Lawful')}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {calculation.isWrittenNoticeViolated
                  ? (isKo ? '문자·카톡 해고는 법 제27조 위반으로 부당해고 판정' : 'SMS/verbal dismissal is legally void')
                  : (isKo ? '서면 문서 통지 요건 충족' : 'Written formal notice')}
              </div>
            </div>

            <div className="rounded-lg bg-card p-4 border border-border">
              <div className="text-xs text-muted-foreground">{isKo ? '노동위원회 구제신청' : 'Labor Commission Action'}</div>
              <div className={`text-lg font-bold mt-1 ${calculation.is5OrMore ? 'text-primary' : 'text-muted-foreground'}`}>
                {calculation.is5OrMore ? (isKo ? '신청 가능 (3개월 내)' : 'Eligible (<3 mos)') : (isKo ? '신청 불가 (5인 미만)' : 'Ineligible (<5 staff)')}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {calculation.is5OrMore
                  ? (isKo ? '부당해고 인정 시 임금상당액 및 복직 명령' : 'Backpay + reinstatement remedy')
                  : (isKo ? '5인 미만은 해고수당 고용노동부 진정만 가능' : 'Labor office notice claim only')}
              </div>
            </div>
          </div>

          {/* Action Guide */}
          <div className="rounded-lg bg-card p-4 border border-border text-xs text-muted-foreground space-y-2">
            <h5 className="font-semibold text-foreground">
              ⚖️ {isKo ? '부당해고 및 해고수당 미지급 시 대응 수칙' : 'Actionable Legal Remedy Guide'}
            </h5>
            <ul className="list-disc list-inside space-y-1">
              <li>
                {isKo
                  ? '해고예고수당 미지급: 3개월 이상 근무자가 30일 전 예고 없이 해고당했으나 수당을 못 받은 경우, 퇴사 후 즉시 관할 고용노동청에 임금체불 진정을 제기할 수 있습니다.'
                  : 'File wage claim at the Ministry of Employment and Labor if notice pay is withheld.'}
              </li>
              <li>
                {isKo
                  ? '부당해고 구제신청(5인 이상): 해고일로부터 정확히 "3개월 이내"에 지방노동위원회에 구제신청서를 접수해야 합니다. 3개월이 지나면 제척기간 도과로 각하됩니다.'
                  : 'Unfair dismissal claims must be filed at the Labor Commission strictly within 3 months of dismissal.'}
              </li>
              <li>
                {isKo
                  ? '사직서 작성 절대 금지: 권고사직이나 해고에 동의하는 사직서를 제출하면 자진퇴사로 처리되어 부당해고 구제신청 및 해고수당 청구가 불가능해집니다.'
                  : 'Never sign a resignation letter, as it forfeits dismissal rights and severance notice claims.'}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
