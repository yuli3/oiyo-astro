import { useState, useMemo } from 'react';

export default function NationalPensionBreakeven({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [monthlyPension, setMonthlyPension] = useState<number>(1500000); // 정상 만 65세 기준 월 수령액 (150만원)
  const [earlyYears, setEarlyYears] = useState<number>(5); // 조기 수령 연수 (1~5년, 최대 5년)
  const [delayYears, setDelayYears] = useState<number>(5); // 연기 수령 연수 (1~5년, 최대 5년)
  const [lifeExpectancy, setLifeExpectancy] = useState<number>(85); // 예상 수명 (85세)

  const calculation = useMemo(() => {
    const normalStartAge = 65;
    const earlyStartAge = normalStartAge - earlyYears;
    const delayStartAge = normalStartAge + delayYears;

    const earlyMonthly = Math.round(monthlyPension * (1 - earlyYears * 0.06));
    const normalMonthly = monthlyPension;
    const delayMonthly = Math.round(monthlyPension * (1 + delayYears * 0.072));

    const cutoffMonthly = 1666667; // 연 2,000만원 기준
    const delayExceedsCutoff = delayMonthly > cutoffMonthly;

    let cumulativeEarly = 0;
    let cumulativeNormal = 0;
    let cumulativeDelay = 0;

    let earlyVsNormalBreakeven = 77;
    let normalVsDelayBreakeven = 84;

    let foundEarlyNormal = false;
    let foundNormalDelay = false;

    let targetEarly = 0;
    let targetNormal = 0;
    let targetDelay = 0;

    for (let age = earlyStartAge; age <= 100; age++) {
      if (age >= earlyStartAge) cumulativeEarly += earlyMonthly * 12;
      if (age >= normalStartAge) cumulativeNormal += normalMonthly * 12;
      if (age >= delayStartAge) cumulativeDelay += delayMonthly * 12;

      if (!foundEarlyNormal && cumulativeNormal > cumulativeEarly && age >= normalStartAge) {
        earlyVsNormalBreakeven = age;
        foundEarlyNormal = true;
      }
      if (!foundNormalDelay && cumulativeDelay > cumulativeNormal && age >= delayStartAge) {
        normalVsDelayBreakeven = age;
        foundNormalDelay = true;
      }

      if (age === lifeExpectancy) {
        targetEarly = cumulativeEarly;
        targetNormal = cumulativeNormal;
        targetDelay = cumulativeDelay;
      }
    }

    let bestOption = 'normal';
    if (targetEarly > targetNormal && targetEarly > targetDelay) {
      bestOption = 'early';
    } else if (targetDelay > targetNormal && targetDelay > targetEarly) {
      bestOption = 'delay';
    }

    return {
      earlyStartAge,
      normalStartAge,
      delayStartAge,
      earlyMonthly,
      normalMonthly,
      delayMonthly,
      earlyVsNormalBreakeven,
      normalVsDelayBreakeven,
      targetEarly,
      targetNormal,
      targetDelay,
      bestOption,
      delayExceedsCutoff,
    };
  }, [monthlyPension, earlyYears, delayYears, lifeExpectancy]);

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            {isKo ? '예상 수령액 및 신청 시기' : 'Pension Amount & Start Timing'}
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '만 65세 정상 예상 월 수령액' : 'Normal Age 65 Pension'}</span>
              <span className="font-semibold text-foreground">{(monthlyPension / 10000).toLocaleString()}{isKo ? '만원/월' : ' KRW/mo'}</span>
            </div>
            <input
              type="range"
              min={500000}
              max={3000000}
              step={50000}
              value={monthlyPension}
              onChange={(e) => setMonthlyPension(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>50만원</span>
              <span>150만원 (평균)</span>
              <span>300만원</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '조기노령 수령 시기' : 'Early Retirement Timing'}</span>
              <span className="font-semibold text-foreground">만 {calculation.earlyStartAge}{isKo ? '세' : ' yrs'} (-{earlyYears * 6}%)</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={earlyYears}
              onChange={(e) => setEarlyYears(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>만 64세 (1년 조기 -6%)</span>
              <span>만 60세 (최대 5년 조기 -30%)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '연기연금 신청 시기' : 'Delayed Pension Timing'}</span>
              <span className="font-semibold text-foreground">만 {calculation.delayStartAge}{isKo ? '세' : ' yrs'} (+{(delayYears * 7.2).toFixed(1)}%)</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={delayYears}
              onChange={(e) => setDelayYears(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>만 66세 (1년 연기 +7.2%)</span>
              <span>만 70세 (최대 5년 연기 +36%)</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            {isKo ? '기대수명 및 리스크 분석' : 'Life Expectancy & Risk Analysis'}
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '예상 기대 수명' : 'Expected Age'}</span>
              <span className="font-semibold text-foreground">만 {lifeExpectancy}{isKo ? '세' : ' yrs'}</span>
            </div>
            <input
              type="range"
              min={65}
              max={95}
              step={1}
              value={lifeExpectancy}
              onChange={(e) => setLifeExpectancy(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>만 65세</span>
              <span>한국 남성 평균(80.6세)</span>
              <span>한국 여성 평균(86.6세)</span>
              <span>95세</span>
            </div>
          </div>

          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">⚖️ {isKo ? '골든 크로스(누적 수령액 역전 연령)' : 'Golden Cross Crossover Ages'}</p>
            <p>
              {isKo
                ? `[조기 vs 정상]은 만 ${calculation.earlyVsNormalBreakeven}세, [정상 vs 연기]는 만 ${calculation.normalVsDelayBreakeven}세에서 누적 수령액이 역전됩니다.`
                : `Early vs Normal crosses at age ${calculation.earlyVsNormalBreakeven}; Normal vs Delay crosses at age ${calculation.normalVsDelayBreakeven}.`}
            </p>
          </div>

          {calculation.delayExceedsCutoff && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive space-y-1">
              <p className="font-semibold">⚠️ {isKo ? '건보료 피부양자 박탈 경고' : 'Health Insurance Surcharge Risk'}</p>
              <p>
                {isKo
                  ? `연기연금 신청 시 월 ${calculation.delayMonthly.toLocaleString()}원으로 연 2,000만원 기준을 초과하여, 건강보험 피부양자 자격이 박탈되고 매월 지역건보료(10~30만원)가 부과될 수 있습니다.`
                  : `Monthly delayed pension exceeds 1.67M KRW; dependent insurance status will be stripped.`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Result Card */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 md:p-8 space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
          <div>
            <span className="inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
              {isKo ? `만 ${lifeExpectancy}세 기준 최적 플랜` : `Optimal Strategy for Age ${lifeExpectancy}`}
            </span>
            <h3 className="mt-2 text-2xl font-bold text-foreground">
              {calculation.bestOption === 'delay'
                ? (isKo ? '👉 연기연금 수령이 가장 유리합니다 (+36%)' : '👉 Delayed Pension (+36%) is optimal')
                : calculation.bestOption === 'normal'
                ? (isKo ? '👉 만 65세 정상수령이 가장 유리합니다' : '👉 Normal Age 65 is optimal')
                : (isKo ? '👉 조기노령연금 수령이 더 유리합니다 (-30%)' : '👉 Early Pension is optimal')}
            </h3>
          </div>
          <div className="text-left md:text-right">
            <div className="text-3xl font-extrabold text-primary">
              {calculation.bestOption === 'delay'
                ? (calculation.targetDelay / 10000).toLocaleString()
                : calculation.bestOption === 'normal'
                ? (calculation.targetNormal / 10000).toLocaleString()
                : (calculation.targetEarly / 10000).toLocaleString()}{isKo ? '만원 누적 수령' : '0k KRW'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {isKo ? `만 ${lifeExpectancy}세까지 평생 수령 총액` : 'Lifetime cumulative payout'}
            </div>
          </div>
        </div>

        {/* 3 Options Comparison */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? '조기노령연금 (만 60세 개시)' : 'Early Pension (Age 60)'}</div>
            <div className="text-lg font-semibold text-foreground mt-1">
              {calculation.earlyMonthly.toLocaleString()}{isKo ? '원/월' : ' KRW/mo'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {isKo ? `누적 총액: ${(calculation.targetEarly / 10000).toLocaleString()}만원` : `Cum: ${(calculation.targetEarly / 10000).toLocaleString()}M`}
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? '정상연금 (만 65세 개시)' : 'Normal Pension (Age 65)'}</div>
            <div className="text-lg font-semibold text-primary mt-1">
              {calculation.normalMonthly.toLocaleString()}{isKo ? '원/월' : ' KRW/mo'}
            </div>
            <div className="text-xs text-primary font-medium mt-0.5">
              {isKo ? `누적 총액: ${(calculation.targetNormal / 10000).toLocaleString()}만원` : `Cum: ${(calculation.targetNormal / 10000).toLocaleString()}M`}
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? '연기연금 (만 70세 개시)' : 'Delayed Pension (Age 70)'}</div>
            <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              {calculation.delayMonthly.toLocaleString()}{isKo ? '원/월' : ' KRW/mo'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {isKo ? `누적 총액: ${(calculation.targetDelay / 10000).toLocaleString()}만원` : `Cum: ${(calculation.targetDelay / 10000).toLocaleString()}M`}
            </div>
          </div>
        </div>

        {/* Strategic Takeaway */}
        <div className="rounded-lg border border-border bg-card p-4 text-xs space-y-2 text-muted-foreground">
          <h4 className="font-semibold text-foreground">{isKo ? '국민연금 수령시기 선택 핵심 가이드' : 'Key Decision Guide'}</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong className="text-foreground">{isKo ? '만 76세 이하 예상 시' : 'Expected < 76 yrs'}:</strong> {isKo ? '건강이 좋지 않거나 조기 은퇴 후 당장 생활비가 급한 경우, 일찍부터 수령하는 조기연금이 총액 면에서 유리합니다.' : 'Early pension provides immediate cashflow and breaks even up to age 76.'}
            </li>
            <li>
              <strong className="text-foreground">{isKo ? '만 84세 이상 장수 예상 시' : 'Expected > 84 yrs'}:</strong> {isKo ? '여성 근로자이거나 장수 유전자가 있는 경우, 연기연금(최대 +36%)을 통해 84세 이후 평생 압도적인 누적 연금을 수령할 수 있습니다.' : 'Delayed pension delivers substantial lifetime surplus past age 84.'}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
