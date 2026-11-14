import { useState, useMemo } from 'react';

export default function HousingSubscriptionScore({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [homelessYears, setHomelessYears] = useState<number>(10); // 무주택 기간 (10년)
  const [dependents, setDependents] = useState<number>(3); // 본인 제외 부양가족 수 (3명)
  const [accountYears, setAccountYears] = useState<number>(12); // 본인 청약통장 가입기간 (12년)
  const [spouseAccountYears, setSpouseAccountYears] = useState<number>(5); // 배우자 청약통장 가입기간 (5년)
  const [isHomeowner, setIsHomeowner] = useState<boolean>(false); // 유주택자 여부

  const calculation = useMemo(() => {
    // 1. 무주택 기간 점수 (최대 32점)
    let homelessScore = 0;
    if (!isHomeowner && homelessYears > 0) {
      if (homelessYears < 1) homelessScore = 2;
      else homelessScore = Math.min(32, 2 + Math.min(15, Math.floor(homelessYears)) * 2);
    }

    // 2. 부양가족 수 점수 (최대 35점)
    const validDependents = Math.min(6, Math.max(0, dependents));
    const dependentsScore = 5 + validDependents * 5;

    // 3. 본인 청약통장 점수 (최대 17점)
    let myAccountScore = 0;
    if (accountYears > 0) {
      if (accountYears < 0.5) myAccountScore = 1;
      else if (accountYears < 1) myAccountScore = 2;
      else myAccountScore = Math.min(17, 2 + Math.min(15, Math.floor(accountYears)));
    }

    // 4. 배우자 통장 가점 (50% 인정, 최대 3점 추가)
    let spouseBonus = 0;
    if (spouseAccountYears > 0) {
      let rawSpouseScore = 0;
      if (spouseAccountYears < 0.5) rawSpouseScore = 1;
      else if (spouseAccountYears < 1) rawSpouseScore = 2;
      else rawSpouseScore = Math.min(17, 2 + Math.min(15, Math.floor(spouseAccountYears)));
      spouseBonus = Math.min(3, Math.floor(rawSpouseScore * 0.5));
    }

    const totalAccountScore = Math.min(17, myAccountScore + spouseBonus);
    const totalScore = homelessScore + dependentsScore + totalAccountScore;

    let tierName = '';
    let tierColor = '';
    let recommendation = '';

    if (totalScore >= 69) {
      tierName = isKo ? 'S등급 (강남3구·용산 분양가상한제 로또 당첨권)' : 'S-Tier (Top-tier Core Seoul)';
      tierColor = 'text-primary';
      recommendation = isKo
        ? '서울 핵심지 분양가 상한제 단지 가점제 당첨이 유력한 초고득점입니다.'
        : 'Qualified for top Seoul price-capped apartments.';
    } else if (totalScore >= 60) {
      tierName = isKo ? 'A등급 (마용성 및 수도권 상급지 유력권)' : 'A-Tier (Prime Metro Areas)';
      tierColor = 'text-primary';
      recommendation = isKo
        ? '마포·용산·성동 및 과천, 판교, 동탄 등 수도권 최상급지 가점권에 포진해 있습니다.'
        : 'High chance for Seoul prime districts and top new towns.';
    } else if (totalScore >= 50) {
      tierName = isKo ? 'B등급 (수도권 신도시 당첨 및 추첨제 병행)' : 'B-Tier (Suburban New Towns)';
      tierColor = 'text-emerald-600 dark:text-emerald-400';
      recommendation = isKo
        ? '수도권 택지지구 당첨이 가능하며, 추첨제 물량(60~70%)을 적극 노려야 합니다.'
        : 'Good for new suburban towns; combine with lottery quotas.';
    } else {
      tierName = isKo ? 'C등급 (특별공급 및 추첨제 100% 집중)' : 'C-Tier (Focus on Special Quotas)';
      tierColor = 'text-muted-foreground';
      recommendation = isKo
        ? '가점제 진입은 어려우므로 신생아·신혼부부·생애최초 특별공급 또는 추첨제에 집중하세요.'
        : 'Focus on newborn, newlyweds, and first-time buyer special quotas.';
    }

    return {
      homelessScore,
      dependentsScore,
      myAccountScore,
      spouseBonus,
      totalAccountScore,
      totalScore,
      tierName,
      tierColor,
      recommendation,
    };
  }, [homelessYears, dependents, accountYears, spouseAccountYears, isHomeowner, isKo]);

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            {isKo ? '무주택 기간 및 부양가족' : 'Homeless Years & Family'}
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '무주택 기간' : 'Homeless Period'}</span>
              <span className="font-semibold text-foreground">
                {isHomeowner ? (isKo ? '유주택 (0점)' : 'Homeowner (0 pts)') : `${homelessYears}${isKo ? '년' : ' yrs'} (${calculation.homelessScore}${isKo ? '점' : ' pts'})`}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={15}
              step={1}
              disabled={isHomeowner}
              value={homelessYears}
              onChange={(e) => setHomelessYears(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary disabled:opacity-40"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0년 (만 30세 미만)</span>
              <span>7년 (16점)</span>
              <span>15년 이상 (32점 만점)</span>
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={isHomeowner}
                onChange={(e) => setIsHomeowner(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span>{isKo ? '본인 또는 세대원이 주택을 소유 중임 (유주택 0점)' : 'Currently owns a home (0 pts)'}</span>
            </label>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '부양가족 수 (본인 제외)' : 'Dependents (excl. applicant)'}</span>
              <span className="font-semibold text-foreground">{dependents}{isKo ? '명' : ' persons'} ({calculation.dependentsScore}{isKo ? '점' : ' pts'})</span>
            </div>
            <input
              type="range"
              min={0}
              max={6}
              step={1}
              value={dependents}
              onChange={(e) => setDependents(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0명 (본인만, 5점)</span>
              <span>3명 (4인가족, 20점)</span>
              <span>6명 이상 (35점 만점)</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            {isKo ? '청약통장 가입기간 (배우자 합산 특례)' : 'Subscription Account & Spouse Bonus'}
          </h2>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '본인 청약통장 가입기간' : 'My Account Period'}</span>
              <span className="font-semibold text-foreground">{accountYears}{isKo ? '년' : ' yrs'} ({calculation.myAccountScore}{isKo ? '점' : ' pts'})</span>
            </div>
            <input
              type="range"
              min={0}
              max={15}
              step={0.5}
              value={accountYears}
              onChange={(e) => setAccountYears(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0년</span>
              <span>7년 (9점)</span>
              <span>15년 이상 (17점 만점)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{isKo ? '배우자 통장 가입기간 (50% 합산)' : 'Spouse Account Period'}</span>
              <span className="font-semibold text-foreground">
                {spouseAccountYears}{isKo ? '년' : ' yrs'} (+{calculation.spouseBonus}{isKo ? '점 가산' : ' pts'})
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={15}
              step={0.5}
              value={spouseAccountYears}
              onChange={(e) => setSpouseAccountYears(Number(e.target.value))}
              className="h-2 w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0년 (미보유)</span>
              <span className="text-primary font-medium">{isKo ? '개정 특례: 최대 +3점 가산' : 'Max +3 pts'}</span>
              <span>15년</span>
            </div>
          </div>

          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">📌 {isKo ? '2024~2026 청약 개정 핵심 특례' : 'Key Regulatory Revisions'}</p>
            <p>
              {isKo
                ? '배우자의 청약통장 보유기간을 50% 인정하여 최대 3점까지 본인 점수에 합산할 수 있습니다. (단 통장 합산 총점은 17점 만점 한도)'
                : '50% of spouse subscription period is credited to applicant (up to +3 points; capped at 17 points total).'}
            </p>
          </div>
        </div>
      </div>

      {/* Result Card */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 md:p-8 space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                {calculation.tierName}
              </span>
              {calculation.spouseBonus > 0 && (
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {isKo ? `배우자 가점 +${calculation.spouseBonus}점 반영` : `Spouse +${calculation.spouseBonus} pts`}
                </span>
              )}
            </div>
            <h3 className="mt-2 text-2xl font-bold text-foreground">
              {isKo ? '총 청약 가점 결과' : 'Total Housing Subscription Score'}
            </h3>
          </div>
          <div className="text-left md:text-right">
            <div className="text-3xl font-extrabold text-primary">
              {calculation.totalScore}{isKo ? '점' : ' pts'} <span className="text-lg font-normal text-muted-foreground">/ 84점 만점</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {calculation.recommendation}
            </div>
          </div>
        </div>

        {/* 3 Metrics */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? '1. 무주택 기간 점수' : '1. Homeless Period'}</div>
            <div className="text-lg font-semibold text-foreground mt-1">
              {calculation.homelessScore}{isKo ? '점' : ' pts'} <span className="text-xs font-normal text-muted-foreground">/ 32점</span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {isHomeowner ? (isKo ? '유주택자 0점' : 'Homeowner 0') : `${homelessYears}${isKo ? '년 인정' : ' yrs'}`}
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? '2. 부양가족 수 점수' : '2. Dependents Score'}</div>
            <div className="text-lg font-semibold text-foreground mt-1">
              {calculation.dependentsScore}{isKo ? '점' : ' pts'} <span className="text-xs font-normal text-muted-foreground">/ 35점</span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {isKo ? `본인 포함 총 ${dependents + 1}인 가구` : `${dependents + 1} household members`}
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? '3. 청약통장 가입기간' : '3. Account Period'}</div>
            <div className="text-lg font-semibold text-primary mt-1">
              {calculation.totalAccountScore}{isKo ? '점' : ' pts'} <span className="text-xs font-normal text-muted-foreground">/ 17점</span>
            </div>
            <div className="text-xs text-primary font-medium mt-0.5">
              {isKo ? `본인 ${calculation.myAccountScore}점 + 배우자 ${calculation.spouseBonus}점` : `My ${calculation.myAccountScore} + Spouse ${calculation.spouseBonus}`}
            </div>
          </div>
        </div>

        {/* Strategic Roadmap */}
        <div className="rounded-lg border border-border bg-card p-4 text-xs space-y-2 text-muted-foreground">
          <h4 className="font-semibold text-foreground">{isKo ? '청약 당첨 전략 가이드라인' : 'Winning Subscription Roadmap'}</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong className="text-foreground">{isKo ? '60점 미만 공략법' : 'Scores Under 60'}:</strong> {isKo ? '수도권 84㎡ 초과 평형(추첨제 비율 70~100%)이나, 신혼부부·신생아 특별공급 물량을 최우선 타깃으로 설정해야 승산이 높습니다.' : 'Target >84m² units with 70~100% lottery quotas or special newborn allocations.'}
            </li>
            <li>
              <strong className="text-foreground">{isKo ? '부부 중복 청약' : 'Dual Spousal Applications'}:</strong> {isKo ? '2024년 3월 이후 부부가 같은 아파트 청약에 각각 동시 접수하는 것이 전면 허용되었으며, 둘 다 당첨될 경우 선접수분이 유효합니다.' : 'Both husband and wife can independently apply to the same apartment lottery.'}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
