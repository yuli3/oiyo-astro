import { useState, useMemo } from 'react';

export default function AnnualLeavePayCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [monthlyWage, setMonthlyWage] = useState<number>(3800000); // 월 통상임금 (380만원)
  const [tenureYears, setTenureYears] = useState<number>(3); // 근속연수 (3년차)
  const [unusedDays, setUnusedDays] = useState<number>(8); // 잔여 미사용 연차 (8일)
  const [writtenNotice, setWrittenNotice] = useState<boolean>(false); // 서면 촉진 여부 (false = 이메일/메신저 등 무효 촉진)

  const calculation = useMemo(() => {
    let generatedDays = 15;
    let under1YearNote = '';

    if (tenureYears < 1) {
      const months = Math.min(11, Math.max(1, Math.floor(tenureYears * 12)));
      generatedDays = months;
      under1YearNote = isKo ? `입사 1년 미만: 1개월 개근 시 1일씩 (누적 ${months}일)` : `< 1 yr: 1 day per month (cum. ${months} days)`;
    } else {
      const additional = Math.floor((Math.floor(tenureYears) - 1) / 2);
      generatedDays = Math.min(25, 15 + additional);
      under1YearNote = isKo ? `입사 만 1년 누적 26일 (1년차 11일 + 2년차 15일)` : `Total 26 days across 1st & 2nd yr`;
    }

    const hourlyOrdinary = monthlyWage / 209;
    const dailyOrdinary = Math.round(hourlyOrdinary * 8);

    const validUnused = Math.min(generatedDays, Math.max(0, unusedDays));
    const totalPayout = Math.round(validUnused * dailyOrdinary);

    return {
      generatedDays,
      under1YearNote,
      dailyOrdinary,
      validUnused,
      totalPayout,
    };
  }, [monthlyWage, tenureYears, unusedDays, isKo]);

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            {isKo ? '급여 및 근속연수 설정' : 'Salary & Service Tenure'}
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '월 통상임금 (기본급+고정수당)' : 'Monthly Ordinary Wage'}</span>
              <span className="font-semibold text-foreground">{(monthlyWage / 10000).toLocaleString()}{isKo ? '만원' : ' KRW'}</span>
            </div>
            <input
              type="range"
              min={1500000}
              max={12000000}
              step={100000}
              value={monthlyWage}
              onChange={(e) => setMonthlyWage(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>150만원</span>
              <span>380만원</span>
              <span>1,200만원</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '근속연수' : 'Tenure Years'}</span>
              <span className="font-semibold text-foreground">{tenureYears}{isKo ? '년차' : ' yrs'}</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={25}
              step={0.5}
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1년 미만 (월 1일)</span>
              <span>3년차 (16일)</span>
              <span>20년차 (최대 25일)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '잔여 미사용 연차 일수' : 'Unused Days Left'}</span>
              <span className="font-semibold text-foreground">{unusedDays}{isKo ? '일' : ' days'} (발생: {calculation.generatedDays}{isKo ? '일' : 'd'})</span>
            </div>
            <input
              type="range"
              min={0}
              max={calculation.generatedDays}
              step={0.5}
              value={unusedDays}
              onChange={(e) => setUnusedDays(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0일</span>
              <span>{Math.round(calculation.generatedDays / 2)}일</span>
              <span>전부 미사용 ({calculation.generatedDays}일)</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            {isKo ? '사용촉진제도 적법성 진단' : 'Promotion Compliance'}
          </h2>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={writtenNotice}
                onChange={(e) => setWrittenNotice(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span>{isKo ? '회사가 서면(종이 문서)으로 개인별 통보를 완료함' : 'Employer issued written paper notice'}</span>
            </label>
            <p className="mt-1 text-xs text-muted-foreground pl-6">
              {isKo
                ? '※ 체크 해제 시: 사내 메신저, 이메일, 게시판 공고 등은 근로기준법 제61조상 무효이므로 회사는 수당을 100% 현금 지급해야 합니다.'
                : 'Email, messenger, or oral notices are legally void under Art 61; employer must disburse cash.'}
            </p>
          </div>

          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">⚖️ {isKo ? '대법원 판례 (대법 2020다248197)' : 'Supreme Court Precedent'}</p>
            <p>
              {isKo
                ? '전자문서나 이메일 촉진은 사규상 명시적 서면대체 동의가 없는 한 법적 효력이 없어 회사의 연차수당 지급 의무가 면제되지 않습니다.'
                : 'Electronic or email notices without prior formal agreement are statutorily invalid.'}
            </p>
          </div>

          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">📅 {isKo ? '1년 미만 입사자 26일의 원리' : 'Rule of 26 Days for 1st Year'}</p>
            <p>
              {isKo
                ? '2020년 근로기준법 개정으로 1년 미만 기간에 1개월 개근마다 1일(최대 11일)이 발생하고, 1년 만근 시 15일이 별도로 발생하여 입사 만 1년 시점에 누적 26일의 권리가 생깁니다.'
                : '1st-year employees accrue up to 11 days (monthly) plus 15 days upon completing 1 year = 26 days total.'}
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
                  !writtenNotice
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-destructive/20 text-destructive'
                }`}
              >
                {!writtenNotice
                  ? (isKo ? '✅ 100% 수당 전액 청구 가능 (촉진 무효)' : '✅ 100% Payout Guaranteed')
                  : (isKo ? '⚠️ 수당 소멸 가능 (적법 서면 촉진)' : '⚠️ Exemption Possible')}
              </span>
              <span className="text-xs text-muted-foreground">
                {isKo ? `(근속 ${tenureYears}년차 법정 발생: ${calculation.generatedDays}일)` : `(${calculation.generatedDays} days accrued)`}
              </span>
            </div>
            <h3 className="mt-2 text-2xl font-bold text-foreground">
              {isKo ? '미사용 연차 보상 수당 총액' : 'Unused Annual Leave Compensation'}
            </h3>
          </div>
          <div className="text-left md:text-right">
            <div className="text-3xl font-extrabold text-primary">
              +{calculation.totalPayout.toLocaleString()}{isKo ? '원' : ' KRW'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {isKo ? '1일 통상임금: ' : 'Daily Wage: '}
              {calculation.dailyOrdinary.toLocaleString()}{isKo ? '원' : ' KRW'}
            </div>
          </div>
        </div>

        {/* 3 Metrics */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? '1일 통상임금 가치' : '1 Day Value'}</div>
            <div className="text-lg font-semibold text-foreground mt-1">
              {calculation.dailyOrdinary.toLocaleString()}{isKo ? '원' : ' KRW'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {isKo ? '월 통상임금 / 209 × 8시간' : 'Wage / 209 * 8 hrs'}
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? '당해 연도 법정 발생' : 'Accrued Days'}</div>
            <div className="text-lg font-semibold text-primary mt-1">
              {calculation.generatedDays}{isKo ? '일' : ' Days'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {calculation.under1YearNote}
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? '잔여 미사용 일수' : 'Unused Days Claimed'}</div>
            <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              {calculation.validUnused}{isKo ? '일' : ' Days'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {isKo ? '퇴사 시 또는 연말 전액 정산' : 'Settled at year-end or exit'}
            </div>
          </div>
        </div>

        {/* Advice */}
        <div className="rounded-lg border border-border bg-card p-4 text-xs space-y-2 text-muted-foreground">
          <h4 className="font-semibold text-foreground">{isKo ? '직장인 연차수당 정산 체크포인트' : 'Settlement Checkpoints'}</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong className="text-foreground">{isKo ? '퇴사 시 정산' : 'Upon Resignation'}:</strong> {isKo ? '퇴사 시점까지 쓰지 못한 모든 잔여 연차는 퇴직일로부터 14일 이내에 미사용 연차수당으로 전액 현금 지급되어야 합니다.' : 'All remaining unused days must be disbursed in cash within 14 days of resignation.'}
            </li>
            <li>
              <strong className="text-foreground">{isKo ? '이메일 촉진은 무효' : 'Email Notice is Void'}:</strong> {isKo ? '인사팀이 슬랙이나 이메일로만 "연차 쓰세요"라고 공지한 경우, 법적 사용촉진 요건을 갖추지 못해 연차가 소멸되지 않고 수당으로 100% 보전받을 수 있습니다.' : 'Slack or email notifications do not satisfy statutory promotion criteria.'}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
