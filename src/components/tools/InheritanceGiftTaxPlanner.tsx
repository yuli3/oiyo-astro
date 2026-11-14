import { useState, useMemo } from 'react';

type RecipientType = 'spouse' | 'adult_child' | 'minor_child' | 'marriage_child';

export default function InheritanceGiftTaxPlanner({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [totalAssetValue, setTotalAssetValue] = useState<number>(1500000000); // 총 자산가액 (기본 15억원)
  const [giftAmount, setGiftAmount] = useState<number>(300000000); // 사전 증여 희망액 (기본 3억원)
  const [recipient, setRecipient] = useState<RecipientType>('adult_child'); // 수증자 (성인 자녀)
  const [hasSurvivingSpouse, setHasSurvivingSpouse] = useState<boolean>(true); // 상속 시 배우자 생존 여부

  const calculation = useMemo(() => {
    // 1. 세율 계산 헬퍼 (상속세·증여세 동일 10~50%)
    const calcTax = (base: number) => {
      if (base <= 0) return { tax: 0, rate: 0, prog: 0 };
      if (base <= 100000000) return { tax: base * 0.10, rate: 10, prog: 0 };
      if (base <= 500000000) return { tax: base * 0.20 - 10000000, rate: 20, prog: 10000000 };
      if (base <= 1000000000) return { tax: base * 0.30 - 60000000, rate: 30, prog: 60000000 };
      if (base <= 3000000000) return { tax: base * 0.40 - 160000000, rate: 40, prog: 160000000 };
      return { tax: base * 0.50 - 460000000, rate: 50, prog: 460000000 };
    };

    // 2. 증여세 공제 한도 산정 (10년간 누적)
    let giftExemption = 50000000; // 성인 자녀 5,000만원
    if (recipient === 'spouse') giftExemption = 600000000; // 배우자 6억원
    else if (recipient === 'minor_child') giftExemption = 20000000; // 미성년자 2,000만원
    else if (recipient === 'marriage_child') giftExemption = 150000000; // 혼인·출산 특례 (기본 5천 + 혼인 1억 = 1.5억)

    // 증여세 계산
    const giftTaxBase = Math.max(0, giftAmount - giftExemption);
    const rawGiftTax = calcTax(giftTaxBase).tax;
    const finalGiftTax = Math.round(rawGiftTax * 0.97); // 신고세액공제 3%

    // 3. 상속세 계산 시나리오
    // 상속공제: 일괄공제 5억원 + (배우자 생존 시 배우자상속공제 최소 5억원) = 최소 10억원 (배우자 없으면 5억원)
    const inheritanceDeduction = hasSurvivingSpouse ? 1000000000 : 500000000;

    // 시나리오 A: 사전 증여 없이 전액 사후 상속 시 상속세
    const estateBaseNoGift = Math.max(0, totalAssetValue - inheritanceDeduction);
    const rawEstateTaxNoGift = calcTax(estateBaseNoGift).tax;
    const finalEstateTaxNoGift = Math.round(rawEstateTaxNoGift * 0.97);

    // 시나리오 B: 사전 증여 후 10년 경과하여 상속재산에서 제외될 때의 상속세
    const remainingEstate = Math.max(0, totalAssetValue - giftAmount);
    const estateBaseWithGift = Math.max(0, remainingEstate - inheritanceDeduction);
    const rawEstateTaxWithGift = calcTax(estateBaseWithGift).tax;
    const finalEstateTaxWithGift = Math.round(rawEstateTaxWithGift * 0.97);

    // B 시나리오 총 세금 부담 (증여세 + 줄어든 상속세)
    const totalTaxCombined = finalGiftTax + finalEstateTaxWithGift;
    const taxSavings = finalEstateTaxNoGift - totalTaxCombined;

    return {
      giftExemption,
      giftTaxBase,
      finalGiftTax,
      inheritanceDeduction,
      finalEstateTaxNoGift,
      finalEstateTaxWithGift,
      totalTaxCombined,
      taxSavings,
      isGiftAdvantageous: taxSavings > 0,
    };
  }, [totalAssetValue, giftAmount, recipient, hasSurvivingSpouse]);

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
              <span>🏛️ 상속 vs 사전증여 절세 플래너</span>
              <span>•</span>
              <span>10년 합산 비과세 · 혼인출산 1.5억 특례</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              {isKo ? '상속세 vs 사전 증여세 비교 & 절세 플래너' : 'Inheritance vs Gift Tax Planner'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isKo
                ? '부모님의 자산을 일괄 상속받는 것과 10년 단위로 사전 분할 증여하는 것 중 어떤 방법이 세금을 더 아끼는지 비교합니다.'
                : 'Compare lump-sum post-mortem estate taxes against strategic 10-year lifetime gifting in Korea.'}
            </p>
          </div>
          <div className="text-right p-4 rounded-lg bg-muted/50 border border-border">
            <span className="text-xs text-muted-foreground block">{isKo ? '사전증여 시 절세 이득' : 'Tax Savings via Gifting'}</span>
            <span className={`text-2xl font-black ${calculation.isGiftAdvantageous ? 'text-primary' : 'text-foreground'}`}>
              {calculation.isGiftAdvantageous ? `+${formatManwon(calculation.taxSavings)}` : (isKo ? '사후상속 유리' : 'Inheritance Better')}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 입력 섹션 */}
        <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-base border-b border-border pb-3">
            {isKo ? '1. 자산 규모 및 증여 조건 설정' : '1. Asset Valuation & Gift Scenario'}
          </h3>

          {/* 총 상속 예상 자산가액 */}
          <div>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <label htmlFor="totalAssetValue" className="font-medium text-foreground">
                {isKo ? '총 자산가액 (부동산 + 금융자산)' : 'Total Family Net Assets'}
              </label>
              <span className="text-primary font-bold">{formatManwon(totalAssetValue)}</span>
            </div>
            <input
              id="totalAssetValue"
              type="range"
              min="500000000"
              max="5000000000"
              step="50000000"
              value={totalAssetValue}
              onChange={(e) => setTotalAssetValue(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>5억원</span>
              <span>10억원 (상속공제선)</span>
              <span>30억원</span>
              <span>50억원</span>
            </div>
          </div>

          {/* 사전 증여 대상자 */}
          <div>
            <label htmlFor="recipientSelect" className="block text-sm font-medium mb-1.5 text-foreground">
              {isKo ? '증여받는 사람 (수증자)' : 'Gift Recipient'}
            </label>
            <select
              id="recipientSelect"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value as RecipientType)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="adult_child">{isKo ? '성인 자녀 (10년간 5천만원 비과세)' : 'Adult Child (50M Exemption)'}</option>
              <option value="marriage_child">{isKo ? '혼인·출산 자녀 (기본 5천 + 특례 1억 = 1.5억 비과세)' : 'Marriage/Birth Child (150M Exemption)'}</option>
              <option value="spouse">{isKo ? '배우자 (10년간 6억원 비과세)' : 'Spouse (600M Exemption)'}</option>
              <option value="minor_child">{isKo ? '미성년 자녀 (10년간 2천만원 비과세)' : 'Minor Child (20M Exemption)'}</option>
            </select>
          </div>

          {/* 사전 증여할 금액 */}
          <div>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <label htmlFor="giftAmount" className="font-medium text-foreground">
                {isKo ? '이번에 사전 증여할 금액' : 'Lifetime Gift Amount'}
              </label>
              <span className="text-primary font-bold">{formatManwon(giftAmount)}</span>
            </div>
            <input
              id="giftAmount"
              type="range"
              min="0"
              max={Math.min(totalAssetValue, 1000000000)}
              step="10000000"
              value={giftAmount}
              onChange={(e) => setGiftAmount(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-1">
              선택한 수증자 비과세 한도: {formatManwon(calculation.giftExemption)} (과세표준: {formatManwon(calculation.giftTaxBase)})
            </p>
          </div>

          {/* 배우자 생존 여부 */}
          <div className="pt-2 border-t border-border">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={hasSurvivingSpouse}
                onChange={(e) => setHasSurvivingSpouse(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <span>{isKo ? '상속 시 배우자가 생존해 있음 (배우자 상속공제 최소 5억 적용)' : 'Surviving Spouse Exists (Min 500M Deduction)'}</span>
            </label>
          </div>
        </div>

        {/* 결과 섹션 */}
        <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-base border-b border-border pb-3">
              {isKo ? '2. 세금 비교 & 절세 효과' : '2. Tax Comparison & Savings'}
            </h3>

            {/* 추천 결과 박스 */}
            <div className={`mt-4 p-4 rounded-xl border ${
              calculation.isGiftAdvantageous
                ? 'border-primary/30 bg-primary/10'
                : 'border-border bg-muted/40'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {isKo ? '최적 상속·증여 전략' : 'Optimal Strategy'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-background text-primary border border-primary/30">
                  {calculation.isGiftAdvantageous ? (isKo ? '사전증여 분산 유리' : 'Lifetime Gift Better') : (isKo ? '사후상속 일괄공제 유리' : 'Post-Mortem Inheritance Better')}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-foreground">
                  {calculation.isGiftAdvantageous
                    ? `약 ${formatManwon(calculation.taxSavings)} 절세`
                    : (isKo ? '상속공제 10억 내로 세금 0원' : 'Zero Tax under 1B Deduction')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {calculation.isGiftAdvantageous
                  ? (isKo ? `증여 후 10년이 지나 상속재산에서 제외되면 높은 상속세율(30~40%)을 낮은 증여세율(10~20%)로 방어합니다.` : 'Pre-gifting reduces progressive tax brackets.')
                  : (isKo ? `총 자산이 상속공제 한도(${formatManwon(calculation.inheritanceDeduction)}) 이하이므로 증여세 없이 상속받는 것이 유리합니다.` : 'Total assets are covered by inheritance deduction.')}
              </p>
            </div>

            {/* 비교 표 */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-border bg-muted/20">
                  <div className="font-bold text-foreground mb-1">A. 전액 사후 상속 시</div>
                  <div className="text-muted-foreground">상속공제: {formatManwon(calculation.inheritanceDeduction)}</div>
                  <div className="font-semibold text-foreground mt-2 pt-1 border-t border-border">
                    상속세: {formatKrw(calculation.finalEstateTaxNoGift)}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-primary/30 bg-primary/5">
                  <div className="font-bold text-primary mb-1">B. 사전증여 분산 시</div>
                  <div className="text-muted-foreground">증여세: {formatKrw(calculation.finalGiftTax)}</div>
                  <div className="text-muted-foreground">잔여 상속세: {formatKrw(calculation.finalEstateTaxWithGift)}</div>
                  <div className="font-semibold text-primary mt-1 pt-1 border-t border-border">
                    총 세액: {formatKrw(calculation.totalTaxCombined)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 절세 핵심 가이드 */}
          <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground space-y-1">
            <div className="font-semibold text-foreground flex items-center gap-1">
              <span>💡 상속·증여 10년 룰 주의사항</span>
            </div>
            <p>
              • <strong>10년 합산 과세 규정</strong>: 상속 개시일(사망일) 전 10년 이내에 상속인에게 증여한 재산은 상속세 계산 시 다시 합산되므로 <strong>가능한 일찍 증여</strong>하는 것이 유리합니다.
            </p>
            <p>
              • <strong>혼인·출산 특례(1.5억)</strong>: 자녀의 결혼이나 출산 시 최대 1억 5,000만원까지 증여세가 전액 비과세되므로 최우선 활용 대상입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
