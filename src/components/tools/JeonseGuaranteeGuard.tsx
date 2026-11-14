import { useState, useMemo } from 'react';

type HouseCategory = 'villa' | 'apartment' | 'officetel';

export default function JeonseGuaranteeGuard({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [houseCategory, setHouseCategory] = useState<HouseCategory>('villa');
  const [publishedPrice, setPublishedPrice] = useState<number>(200000000); // 부동산 공시가격 (기본 2억원)
  const [marketPrice, setMarketPrice] = useState<number>(260000000); // 실거래 매매 시세 (기본 2.6억원)
  const [jeonseDeposit, setJeonseDeposit] = useState<number>(230000000); // 희망 전세보증금 (기본 2.3억원)
  const [priorMortgage, setPriorMortgage] = useState<number>(0); // 선순위 근저당/대출금 (원)
  const [isYouthOrNewlywed, setIsYouthOrNewlywed] = useState<boolean>(true); // 청년/신혼부부 보증료 할인 대상

  const calculation = useMemo(() => {
    // 1. HUG 주택가격 인정 기준 (공시가격의 140%)
    const hugAppraisedHousePrice = Math.round(publishedPrice * 1.40);

    // 2. HUG 전세보증금 상한선 (공시가격의 126% 룰 = 140% * 90%)
    const maxJeonseDepositAllowed = Math.round(publishedPrice * 1.26);

    // 3. 선순위 근저당 한도 검증: 선순위 채권은 주택가격의 60% 이하
    const maxPriorMortgageAllowed = Math.round(hugAppraisedHousePrice * 0.60);
    const isMortgageSafe = priorMortgage <= maxPriorMortgageAllowed;

    // 4. 선순위 채권 + 전세보증금 합계는 주택가격의 100% 이하
    const totalDebt = priorMortgage + jeonseDeposit;
    const isTotalDebtSafe = totalDebt <= hugAppraisedHousePrice;

    // 5. 전세보증금이 공시가 126% 이하인지 확인
    const isDepositUnder126 = jeonseDeposit <= maxJeonseDepositAllowed;

    // 종합 HUG 보증보험 가입 가능 여부
    const isHugEligible = isDepositUnder126 && isMortgageSafe && isTotalDebtSafe;

    // 6. 전세가율 계산 (매매시세 대비 전세보증금 비율)
    const jeonseRatio = marketPrice > 0 ? (jeonseDeposit / marketPrice) * 100 : 0;

    let riskLevel: 'safe' | 'caution' | 'warning' | 'danger' = 'safe';
    let riskLabel = '';

    if (jeonseRatio <= 60) {
      riskLevel = 'safe';
      riskLabel = isKo ? '안전 (깡통전세 위험 낮음)' : 'Safe (Low Risk)';
    } else if (jeonseRatio <= 70) {
      riskLevel = 'caution';
      riskLabel = isKo ? '보통 (일반적 수준)' : 'Moderate';
    } else if (jeonseRatio <= 80) {
      riskLevel = 'warning';
      riskLabel = isKo ? '주의 (경매 시 보증금 손실 위험)' : 'Warning (High Ratio)';
    } else {
      riskLevel = 'danger';
      riskLabel = isKo ? '위험 (깡통전세 고위험군)' : 'Danger (Tin Can Risk)';
    }

    // 7. 예상 HUG 보증료 (2년 기준, 아파트 약 0.122%, 기타 약 0.154%)
    const baseRate = houseCategory === 'apartment' ? 0.00122 : 0.00154;
    const rawFee = jeonseDeposit * baseRate * 2;
    const discountMultiplier = isYouthOrNewlywed ? 0.5 : 1.0; // 청년/신혼부부 등 50% 할인
    const finalFee = Math.round(rawFee * discountMultiplier);

    return {
      hugAppraisedHousePrice,
      maxJeonseDepositAllowed,
      maxPriorMortgageAllowed,
      isDepositUnder126,
      isMortgageSafe,
      isTotalDebtSafe,
      isHugEligible,
      jeonseRatio: jeonseRatio.toFixed(1),
      riskLevel,
      riskLabel,
      finalFee,
    };
  }, [houseCategory, publishedPrice, marketPrice, jeonseDeposit, priorMortgage, isYouthOrNewlywed, isKo]);

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
              <span>🛡️ HUG 126% 룰 보증보험 진단</span>
              <span>•</span>
              <span>공시가 126% 가입 자격 · 깡통전세 위험 판별</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              {isKo ? 'HUG 전세보증보험 가입 자격 & 깡통전세 계산기' : 'Jeonse Deposit Guarantee & Risk Inspector'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isKo
                ? 'HUG 공시가격 126% 룰 적용 가입 가능 여부와 시세 대비 전세가율로 깡통전세 보증금 미반환 위험을 즉시 진단합니다.'
                : 'Check whether your rental lease qualifies for HUG deposit refund insurance under the 126% rule in Korea.'}
            </p>
          </div>
          <div className="text-right p-4 rounded-lg bg-muted/50 border border-border">
            <span className="text-xs text-muted-foreground block">{isKo ? '보증보험 가입 진단' : 'HUG Status'}</span>
            <span className={`text-lg font-bold ${calculation.isHugEligible ? 'text-primary' : 'text-destructive'}`}>
              {calculation.isHugEligible ? (isKo ? '✅ HUG 보증 가입 가능' : 'Eligible') : (isKo ? '❌ 보증 가입 불가' : 'Ineligible')}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 입력 섹션 */}
        <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-base border-b border-border pb-3">
            {isKo ? '1. 주택 가격 및 전세 계약 정보' : '1. Property & Lease Terms'}
          </h3>

          {/* 주택 유형 */}
          <div>
            <label htmlFor="houseCategorySelect" className="block text-sm font-medium mb-1.5 text-foreground">
              {isKo ? '주택 유형' : 'Property Type'}
            </label>
            <select
              id="houseCategorySelect"
              value={houseCategory}
              onChange={(e) => setHouseCategory(e.target.value as HouseCategory)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="villa">{isKo ? '다세대·연립·빌라 (공시가 126% 엄격 적용)' : 'Villa / Multi-family'}</option>
              <option value="apartment">{isKo ? '아파트 (보증료 할인 우대)' : 'Apartment'}</option>
              <option value="officetel">{isKo ? '주거용 오피스텔' : 'Officetel'}</option>
            </select>
          </div>

          {/* 공시가격 */}
          <div>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <label htmlFor="publishedPrice" className="font-medium text-foreground">
                {isKo ? '부동산 공시가격 (국토부 알리미 기준)' : 'Official Published Price'}
              </label>
              <span className="text-primary font-bold">{formatManwon(publishedPrice)}</span>
            </div>
            <input
              id="publishedPrice"
              type="range"
              min="50000000"
              max="800000000"
              step="5000000"
              value={publishedPrice}
              onChange={(e) => setPublishedPrice(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-1">
              HUG 보증 가능 전세보증금 상한선(126%): <strong>{formatManwon(calculation.maxJeonseDepositAllowed)}</strong>
            </p>
          </div>

          {/* 희망 전세보증금 */}
          <div>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <label htmlFor="jeonseDeposit" className="font-medium text-foreground">
                {isKo ? '계약하려는 전세보증금' : 'Jeonse Deposit Amount'}
              </label>
              <span className="text-primary font-bold">{formatManwon(jeonseDeposit)}</span>
            </div>
            <input
              id="jeonseDeposit"
              type="range"
              min="50000000"
              max="800000000"
              step="5000000"
              value={jeonseDeposit}
              onChange={(e) => setJeonseDeposit(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
            />
          </div>

          {/* 매매 시세 및 선순위 근저당 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="marketPrice" className="block text-sm font-medium mb-1.5 text-foreground">
                {isKo ? '실제 매매 시세' : 'Market Price'}
              </label>
              <input
                id="marketPrice"
                type="number"
                step="5000000"
                value={marketPrice}
                onChange={(e) => setMarketPrice(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="priorMortgage" className="block text-sm font-medium mb-1.5 text-foreground">
                {isKo ? '선순위 근저당 (대출)' : 'Prior Mortgage'}
              </label>
              <input
                id="priorMortgage"
                type="number"
                step="5000000"
                value={priorMortgage}
                onChange={(e) => setPriorMortgage(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          {/* 청년/신혼부부 할인 체크 */}
          <div className="pt-2 border-t border-border">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={isYouthOrNewlywed}
                onChange={(e) => setIsYouthOrNewlywed(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <span>{isKo ? '청년(만 19~34세) 또는 신혼부부 (보증료 50% 할인)' : 'Youth / Newlywed (50% Fee Discount)'}</span>
            </label>
          </div>
        </div>

        {/* 결과 섹션 */}
        <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-base border-b border-border pb-3">
              {isKo ? '2. HUG 가입 판정 & 깡통전세 위험도' : '2. Guarantee Verdict & Risk'}
            </h3>

            {/* 메인 상태 카드 */}
            <div className={`mt-4 p-4 rounded-xl border ${
              calculation.isHugEligible
                ? 'border-primary/30 bg-primary/10'
                : 'border-destructive/30 bg-destructive/10'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {isKo ? 'HUG 반환보증 가입 여부' : 'HUG Eligibility'}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold bg-background border ${
                  calculation.isHugEligible ? 'text-primary border-primary/30' : 'text-destructive border-destructive/30'
                }`}>
                  {calculation.isHugEligible ? (isKo ? '가입 가능 (안전)' : 'Approved') : (isKo ? '가입 거절 대상' : 'Rejected')}
                </span>
              </div>
              <div className="mt-2">
                <span className={`text-2xl font-black ${calculation.isHugEligible ? 'text-primary' : 'text-destructive'}`}>
                  {calculation.isHugEligible
                    ? (isKo ? '보증보험 가입으로 보증금 100% 보호 가능' : '100% Protected')
                    : (isKo ? '공시가 126% 기준 초과로 가입 불가' : 'Exceeds 126% Cap')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isKo
                  ? `전세가율 ${calculation.jeonseRatio}% [${calculation.riskLabel}]`
                  : `Jeonse ratio: ${calculation.jeonseRatio}% [${calculation.riskLabel}]`}
              </p>
            </div>

            {/* 세부 명세표 */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">{isKo ? 'HUG 인정 주택가격 (공시가의 140%)' : 'HUG Appraised Price'}</span>
                <span className="font-medium text-foreground">{formatManwon(calculation.hugAppraisedHousePrice)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">{isKo ? 'HUG 보증 한도 상한 (공시가의 126%)' : '126% Guarantee Ceiling'}</span>
                <span className="font-bold text-primary">{formatManwon(calculation.maxJeonseDepositAllowed)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">{isKo ? '선순위 대출 한도 (주택가격 60%)' : 'Prior Debt Limit'}</span>
                <span className="font-medium text-foreground">{formatManwon(calculation.maxPriorMortgageAllowed)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">{isKo ? '2년 예상 HUG 보증료' : 'Estimated 2-Yr Guarantee Fee'}</span>
                <span className="font-bold text-foreground">{formatKrw(calculation.finalFee)}</span>
              </div>
            </div>
          </div>

          {/* 전세사기 예방 팁 */}
          <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground space-y-1">
            <div className="font-semibold text-foreground flex items-center gap-1">
              <span>💡 계약 전 전세사기 예방 핵심 체크</span>
            </div>
            <p>
              • 특약 추가: <strong>"임대인은 임차인의 전세보증금 반환보증 가입에 적극 협조하며, 가입 거절 시 계약금을 즉시 반환한다"</strong> 특약을 반드시 명시하세요.
            </p>
            <p>
              • 지자체 청년 지원: 각 지자체에서 청년 전세보증보험 가입 보증료를 <strong>최대 30만원까지 전액 현금 지원</strong>합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
