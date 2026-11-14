import { useState, useMemo } from 'react';

type RelationType = 'spouse' | 'parents' | 'children' | 'siblings';

export default function HealthInsuranceDependentChecker({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [relation, setRelation] = useState<RelationType>('parents');
  const [hasBusinessReg, setHasBusinessReg] = useState<boolean>(false); // 사업자등록 여부
  const [hasRentalIncome, setHasRentalIncome] = useState<boolean>(false); // 주택임대소득 여부
  const [businessIncome, setBusinessIncome] = useState<number>(0); // 사업소득금액 (원)
  const [otherIncome, setOtherIncome] = useState<number>(12000000); // 연금·근로·이자배당 소득 (원, 기본 1,200만원)
  const [propertyBase, setPropertyBase] = useState<number>(300000000); // 재산세 과세표준 (원, 기본 3억원)
  const [isMarried, setIsMarried] = useState<boolean>(false);
  const [spouseIncome, setSpouseIncome] = useState<number>(0);

  const calculation = useMemo(() => {
    const totalIncome = businessIncome + otherIncome;
    const reasons: string[] = [];

    // 1. 임대소득 요건
    if (hasRentalIncome) {
      reasons.push(isKo ? '주택임대소득이 발생하면 사업자등록 여부와 무관하게 즉시 탈락합니다.' : 'Rental income disqualifies dependent status immediately.');
    }

    // 2. 사업소득 요건
    if (hasBusinessReg && businessIncome > 0) {
      reasons.push(isKo ? '사업자등록이 있는 경우 사업소득이 1원이라도 발생하면 탈락합니다.' : 'Registered business owners with any net income are disqualified.');
    } else if (!hasBusinessReg && businessIncome > 5000000) {
      reasons.push(isKo ? '사업자등록이 없는 프리랜서/특고는 사업소득 연 500만원 초과 시 탈락합니다.' : 'Unregistered freelance income over 5M KRW/year disqualifies.');
    }

    // 3. 전체 합산 소득 요건
    if (totalIncome > 20000000) {
      reasons.push(isKo ? '연간 종합소득 합계가 2,000만원을 초과하여 탈락합니다.' : 'Total annual income exceeds 20M KRW ceiling.');
    }

    // 4. 재산 요건 (재산세 과세표준)
    if (relation === 'siblings') {
      if (propertyBase > 180000000) {
        reasons.push(isKo ? '형제·자매는 재산세 과세표준이 1억 8,000만원을 초과하면 탈락합니다.' : 'Siblings must have property tax base under 180M KRW.');
      }
    } else {
      if (propertyBase > 900000000) {
        reasons.push(isKo ? '재산세 과세표준 9억원을 초과하여 소득과 무관하게 무조건 탈락합니다.' : 'Property tax base exceeds 900M KRW (absolute disqualification).');
      } else if (propertyBase > 540000000 && totalIncome > 10000000) {
        reasons.push(isKo ? '재산세 과세표준 5.4억~9억원 구간은 연 소득이 1,000만원을 초과하면 탈락합니다.' : 'Property 540M-900M KRW requires income under 10M KRW.');
      }
    }

    // 5. 배우자 동반 탈락 요건
    if (isMarried && spouseIncome > 20000000) {
      reasons.push(isKo ? '기혼자는 부부 중 1명이라도 연소득 2,000만원을 초과하면 부부 모두 동반 탈락합니다.' : 'Spouse income over 20M KRW results in joint disqualification.');
    }

    const isEligible = reasons.length === 0;

    // 6. 탈락 시 예상 지역건강보험료 산출
    let estimatedMonthlyPremium = 0;
    if (!isEligible) {
      // 소득 보험료 (연소득의 약 7.09% + 장기요양 12.95%)
      const monthlyIncome = totalIncome / 12;
      const incomePremium = monthlyIncome * 0.0709 * 1.1295;

      // 재산 보험료 (과표 구간별 대략적 점수: 3억 기준 약 10~15만원)
      let propertyPremium = 0;
      if (propertyBase <= 100000000) propertyPremium = 35000;
      else if (propertyBase <= 300000000) propertyPremium = 95000;
      else if (propertyBase <= 600000000) propertyPremium = 175000;
      else if (propertyBase <= 900000000) propertyPremium = 240000;
      else propertyPremium = 320000;

      estimatedMonthlyPremium = Math.round(incomePremium + propertyPremium);
    }

    return {
      totalIncome,
      isEligible,
      reasons,
      estimatedMonthlyPremium,
      annualLoss: estimatedMonthlyPremium * 12,
    };
  }, [relation, hasBusinessReg, hasRentalIncome, businessIncome, otherIncome, propertyBase, isMarried, spouseIncome, isKo]);

  const formatKrw = (val: number) => {
    return new Intl.NumberFormat(isKo ? 'ko-KR' : 'en-US').format(Math.round(val)) + (isKo ? '원' : ' KRW');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-foreground">
      {/* 배너 헤더 */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-foreground mb-2">
              <span>🏥 국민건강보험공단 최신 기준</span>
              <span>•</span>
              <span>소득 2,000만 · 재산 5.4억/9억 정밀 판정</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              {isKo ? '건강보험 피부양자 자격 판정 & 건보료 폭탄 방지 계산기' : 'Health Insurance Dependent Eligibility & Premium Simulator'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isKo
                ? '부모님이나 은퇴 가족의 피부양자 자격 유지 여부와 탈락 시 부과될 지역보험료를 즉시 진단합니다.'
                : 'Diagnose whether your parents or retired family members can maintain 0 KRW health insurance dependent status.'}
            </p>
          </div>
          <div className="text-right p-4 rounded-lg bg-muted/50 border border-border">
            <span className="text-xs text-muted-foreground block">{isKo ? '진단 상태' : 'Status'}</span>
            <span className={`text-lg font-bold ${calculation.isEligible ? 'text-primary' : 'text-destructive'}`}>
              {calculation.isEligible ? (isKo ? '✅ 피부양자 유지 가능' : 'Eligible (0 KRW)') : (isKo ? '⚠️ 탈락 위험 (지역 전환)' : 'Disqualified')}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 입력 섹션 */}
        <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-base border-b border-border pb-3">
            {isKo ? '1. 가족 관계 및 소득·재산 입력' : '1. Family, Income & Property'}
          </h3>

          {/* 대상 가족 관계 */}
          <div>
            <label htmlFor="relationSelect" className="block text-sm font-medium mb-1.5 text-foreground">
              {isKo ? '직장가입자와의 관계' : 'Relationship to Primary Insured'}
            </label>
            <select
              id="relationSelect"
              value={relation}
              onChange={(e) => setRelation(e.target.value as RelationType)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="parents">{isKo ? '부모님 / 시부모 / 장인·장모 (직계존속)' : 'Parents / In-laws'}</option>
              <option value="spouse">{isKo ? '배우자 (법률혼)' : 'Spouse'}</option>
              <option value="children">{isKo ? '자녀 / 손자녀 (직계비속)' : 'Children / Grandchildren'}</option>
              <option value="siblings">{isKo ? '형제·자매 (30세 미만/65세 이상/장애인)' : 'Siblings (<30, 65+, Disabled)'}</option>
            </select>
          </div>

          {/* 사업자등록 및 임대소득 체크박스 */}
          <div className="space-y-2 pt-1 border-t border-border">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={hasBusinessReg}
                onChange={(e) => setHasBusinessReg(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <span>{isKo ? '사업자등록증을 보유하고 있음' : 'Has Business Registration'}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={hasRentalIncome}
                onChange={(e) => setHasRentalIncome(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <span>{isKo ? '주택임대소득(월세 등)이 발생함' : 'Has Residential Rental Income'}</span>
            </label>
          </div>

          {/* 연간 사업소득금액 */}
          <div>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <label htmlFor="businessIncome" className="font-medium text-foreground">
                {isKo ? '연간 사업소득금액 (수입 - 경비)' : 'Annual Net Business Income'}
              </label>
              <span className="text-primary font-bold">{formatKrw(businessIncome)}</span>
            </div>
            <input
              id="businessIncome"
              type="range"
              min="0"
              max="30000000"
              step="500000"
              value={businessIncome}
              onChange={(e) => setBusinessIncome(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0원</span>
              <span>500만원 (미등록 한도)</span>
              <span>3,000만원</span>
            </div>
          </div>

          {/* 연금·이자·기타 연간 소득 */}
          <div>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <label htmlFor="otherIncome" className="font-medium text-foreground">
                {isKo ? '기타 연소득 (공적연금·근로·이자/배당)' : 'Other Annual Income (Pension/Dividends)'}
              </label>
              <span className="text-primary font-bold">{formatKrw(otherIncome)}</span>
            </div>
            <input
              id="otherIncome"
              type="range"
              min="0"
              max="50000000"
              step="1000000"
              value={otherIncome}
              onChange={(e) => setOtherIncome(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0원</span>
              <span>2,000만원 (합산 기준)</span>
              <span>5,000만원</span>
            </div>
          </div>

          {/* 재산세 과세표준 */}
          <div>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <label htmlFor="propertyBase" className="font-medium text-foreground">
                {isKo ? '재산세 과세표준 (공시가격 × 공정시장가액비율)' : 'Property Tax Assessment Base'}
              </label>
              <span className="text-primary font-bold">{formatKrw(propertyBase)}</span>
            </div>
            <input
              id="propertyBase"
              type="range"
              min="0"
              max="1500000000"
              step="20000000"
              value={propertyBase}
              onChange={(e) => setPropertyBase(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0원</span>
              <span>5.4억원</span>
              <span>9억원 (절대 탈락)</span>
            </div>
          </div>
        </div>

        {/* 결과 및 진단 섹션 */}
        <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-base border-b border-border pb-3">
              {isKo ? '2. 판정 결과 및 예상 건보료' : '2. Diagnosis & Local Premium'}
            </h3>

            {/* 판정 상태 카드 */}
            <div className={`mt-4 p-4 rounded-xl border ${
              calculation.isEligible
                ? 'bg-primary/10 border-primary/30'
                : 'bg-destructive/10 border-destructive/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {isKo ? '피부양자 자격 판정' : 'Eligibility Verdict'}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold bg-background border ${
                  calculation.isEligible ? 'text-primary border-primary/30' : 'text-destructive border-destructive/30'
                }`}>
                  {calculation.isEligible ? (isKo ? '등재 유지' : 'Maintained') : (isKo ? '자격 상실 위험' : 'Disqualified')}
                </span>
              </div>
              <div className="mt-2">
                <span className={`text-2xl font-black ${calculation.isEligible ? 'text-primary' : 'text-destructive'}`}>
                  {calculation.isEligible
                    ? (isKo ? '건강보험료 0원 유지 가능' : '0 KRW Premium Maintained')
                    : (isKo ? `월 약 ${formatKrw(calculation.estimatedMonthlyPremium)} 청구 예상` : `Approx. ${formatKrw(calculation.estimatedMonthlyPremium)} / mo`)}
                </span>
              </div>
              {!calculation.isEligible && (
                <p className="text-xs text-muted-foreground mt-1">
                  {isKo ? `탈락 시 연간 약 ${formatKrw(calculation.annualLoss)}의 지역건보료가 청구됩니다.` : `Annual estimated regional premium: ${formatKrw(calculation.annualLoss)}`}
                </p>
              )}
            </div>

            {/* 탈락 사유 또는 안전 요건 명세 */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="font-semibold text-foreground mb-1">
                {calculation.isEligible ? (isKo ? '✔ 안전 요건 확인' : 'Passed Criteria') : (isKo ? '❌ 탈락 사유 목록' : 'Disqualification Reasons')}
              </div>
              {calculation.isEligible ? (
                <div className="space-y-1 text-muted-foreground">
                  <p>• 총 연소득 {formatKrw(calculation.totalIncome)} (2,000만원 기준 이하 충족)</p>
                  <p>• 재산세 과세표준 {formatKrw(propertyBase)} (안전 범위 충족)</p>
                  <p>• 사업소득 및 임대소득 요건 충족</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {calculation.reasons.map((r, i) => (
                    <div key={i} className="p-2 rounded bg-destructive/5 text-destructive border border-destructive/20">
                      • {r}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 절세 & 방어 팁 */}
          <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground space-y-1.5">
            <div className="font-semibold text-foreground flex items-center gap-1">
              <span>💡 피부양자 박탈 방지 핵심 전략</span>
            </div>
            <p>
              • <strong>임의계속가입 제도</strong>: 은퇴 직후 탈락했다면 최대 36개월간 이전 직장보험료 수준으로 납부하는 ‘임의계속가입’을 신청하여 지역 건보료 폭탄을 피할 수 있습니다.
            </p>
            <p>
              • <strong>금융소득 2,000만원 분산</strong>: 이자·배당 소득이 2,000만원을 1원이라도 초과하면 전체가 합산되어 피부양자에서 즉시 탈락하므로 ISA나 비과세 계좌를 적극 활용하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
