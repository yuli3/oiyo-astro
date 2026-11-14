import { useState, useMemo } from 'react';

type HouseCount = '1' | '2' | '3' | '4_or_more';
type HouseArea = 'small' | 'large'; // 85㎡ 이하 (국민주택규모) vs 85㎡ 초과

export default function AcquisitionTaxCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [housePrice, setHousePrice] = useState<number>(600000000); // 매매 취득가액 (기본 6억원)
  const [houseCount, setHouseCount] = useState<HouseCount>('1'); // 취득 후 주택 수
  const [isAdjustedArea, setIsAdjustedArea] = useState<boolean>(false); // 조정대상지역 여부 (강남3구·용산)
  const [houseArea, setHouseArea] = useState<HouseArea>('small'); // 전용 85㎡ 이하 여부
  const [isFirstHome, setIsFirstHome] = useState<boolean>(true); // 생애최초 주택 구입 여부

  const calculation = useMemo(() => {
    // 1. 기본 취득세율 계산
    let baseTaxRate = 0; // %
    let eduTaxRate = 0; // 지방교육세 (%)
    let ruralTaxRate = 0; // 농어촌특별세 (%)
    let isSurcharged = false;

    // 농특세: 85㎡ 초과 시 0.2% 부과 (중과세율일 때는 0.4% or 1.0%)
    const isLarge = houseArea === 'large';

    if (houseCount === '1') {
      // 1주택자 기본세율
      if (housePrice <= 600000000) {
        baseTaxRate = 1.0;
        eduTaxRate = 0.1;
      } else if (housePrice <= 900000000) {
        // 6억~9억 누진공식: (취득가액 * 2 / 3억원 - 3) * 1%
        baseTaxRate = Number(((housePrice * 2 / 300000000 - 3)).toFixed(2));
        eduTaxRate = Number((baseTaxRate * 0.1).toFixed(2));
      } else {
        baseTaxRate = 3.0;
        eduTaxRate = 0.3;
      }
      ruralTaxRate = isLarge ? 0.2 : 0;
    } else if (houseCount === '2') {
      // 2주택자
      if (isAdjustedArea) {
        baseTaxRate = 8.0;
        eduTaxRate = 0.4;
        ruralTaxRate = isLarge ? 0.6 : 0;
        isSurcharged = true;
      } else {
        // 비조정지역 2주택은 1주택 기본세율과 동일
        if (housePrice <= 600000000) baseTaxRate = 1.0;
        else if (housePrice <= 900000000) baseTaxRate = Number(((housePrice * 2 / 300000000 - 3)).toFixed(2));
        else baseTaxRate = 3.0;
        eduTaxRate = Number((baseTaxRate * 0.1).toFixed(2));
        ruralTaxRate = isLarge ? 0.2 : 0;
      }
    } else if (houseCount === '3') {
      // 3주택자
      if (isAdjustedArea) {
        baseTaxRate = 12.0;
        eduTaxRate = 0.4;
        ruralTaxRate = isLarge ? 1.0 : 0.6;
      } else {
        baseTaxRate = 8.0;
        eduTaxRate = 0.4;
        ruralTaxRate = isLarge ? 0.6 : 0;
      }
      isSurcharged = true;
    } else {
      // 4주택 이상
      baseTaxRate = 12.0;
      eduTaxRate = 0.4;
      ruralTaxRate = isLarge ? 1.0 : 0.6;
      isSurcharged = true;
    }

    const totalTaxRate = Number((baseTaxRate + eduTaxRate + ruralTaxRate).toFixed(2));

    // 세액 산출
    const rawAcquisitionTax = Math.round(housePrice * (baseTaxRate / 100));
    const eduTax = Math.round(housePrice * (eduTaxRate / 100));
    const ruralTax = Math.round(housePrice * (ruralTaxRate / 100));
    const rawTotalTax = rawAcquisitionTax + eduTax + ruralTax;

    // 2. 생애최초 주택 구입 감면 (취득가액 12억원 이하, 최대 200만원 전액 감면)
    let firstHomeDiscount = 0;
    let isFirstHomeApplied = false;

    if (isFirstHome && houseCount === '1' && housePrice <= 1200000000) {
      firstHomeDiscount = Math.min(2000000, rawAcquisitionTax);
      isFirstHomeApplied = true;
    }

    const finalAcquisitionTax = Math.max(0, rawAcquisitionTax - firstHomeDiscount);
    const finalTotalTax = finalAcquisitionTax + eduTax + ruralTax;

    return {
      baseTaxRate,
      eduTaxRate,
      ruralTaxRate,
      totalTaxRate,
      isSurcharged,
      rawAcquisitionTax,
      eduTax,
      ruralTax,
      rawTotalTax,
      firstHomeDiscount,
      isFirstHomeApplied,
      finalAcquisitionTax,
      finalTotalTax,
    };
  }, [housePrice, houseCount, isAdjustedArea, houseArea, isFirstHome]);

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
              <span>🏡 2026 개정 주택 취득세율</span>
              <span>•</span>
              <span>생애최초 200만 감면 · 다주택 중과세율</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              {isKo ? '주택 취득세 계산기 & 생애최초 감면 판정기' : 'Property Acquisition Tax & First-Home Exemption Calculator'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isKo
                ? '매매 주택가격과 주택 수에 따른 취득세·지방교육세·농특세 합계와 생애최초 200만원 감면 혜택을 즉시 계산합니다.'
                : 'Calculate real estate acquisition taxes in Korea including 2M KRW first-home tax credits and multi-home surcharges.'}
            </p>
          </div>
          <div className="text-right p-4 rounded-lg bg-muted/50 border border-border">
            <span className="text-xs text-muted-foreground block">{isKo ? '최종 납부 세액 합계' : 'Total Payable Tax'}</span>
            <span className="text-2xl font-black text-primary">{formatKrw(calculation.finalTotalTax)}</span>
            <span className="text-xs text-muted-foreground block mt-0.5">
              (총 실효세율 {calculation.totalTaxRate}%)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 입력 섹션 */}
        <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-base border-b border-border pb-3">
            {isKo ? '1. 주택 매매 및 보유 조건' : '1. Property & Buyer Status'}
          </h3>

          {/* 취득가액 */}
          <div>
            <div className="flex justify-between items-center text-sm mb-1.5">
              <label htmlFor="housePrice" className="font-medium text-foreground">
                {isKo ? '주택 매매 취득가액' : 'Property Purchase Price'}
              </label>
              <span className="text-primary font-bold">{formatManwon(housePrice)}</span>
            </div>
            <input
              id="housePrice"
              type="range"
              min="100000000"
              max="2500000000"
              step="10000000"
              value={housePrice}
              onChange={(e) => setHousePrice(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1억원</span>
              <span>6억원 (세율구간)</span>
              <span>12억원 (감면상한)</span>
              <span>25억원</span>
            </div>
          </div>

          {/* 취득 후 주택 수 */}
          <div>
            <label htmlFor="houseCountSelect" className="block text-sm font-medium mb-1.5 text-foreground">
              {isKo ? '취득 후 보유 주택 수 (세대 기준)' : 'Total Properties Owned Post-Purchase'}
            </label>
            <select
              id="houseCountSelect"
              value={houseCount}
              onChange={(e) => setHouseCount(e.target.value as HouseCount)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="1">{isKo ? '1주택 (무주택자의 신규 취득, 기본 1~3%)' : '1 Home (Primary Residence)'}</option>
              <option value="2">{isKo ? '2주택 (1주택자의 추가 매수)' : '2 Homes'}</option>
              <option value="3">{isKo ? '3주택 (다주택 중과 대상)' : '3 Homes'}</option>
              <option value="4_or_more">{isKo ? '4주택 이상 또는 법인 (12% 중과)' : '4+ Homes / Corporation'}</option>
            </select>
          </div>

          {/* 조건 체크박스 */}
          <div className="space-y-2 pt-2 border-t border-border">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={isAdjustedArea}
                onChange={(e) => setIsAdjustedArea(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <span>{isKo ? '조정대상지역 소재 (서울 강남·서초·송파·용산)' : 'Located in Speculative Regulated Area'}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-foreground">
              <input
                type="checkbox"
                checked={isFirstHome}
                onChange={(e) => setIsFirstHome(e.target.checked)}
                disabled={houseCount !== '1'}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4 disabled:opacity-50"
              />
              <span>{isKo ? '생애최초 주택 구입 (세대원 전원 무주택 이력)' : 'First-Time Home Buyer Exemption'}</span>
            </label>
          </div>

          {/* 전용면적 선택 */}
          <div>
            <label htmlFor="areaSelect" className="block text-sm font-medium mb-1.5 text-foreground">
              {isKo ? '주택 전용면적 규모' : 'Exclusive Floor Area'}
            </label>
            <select
              id="areaSelect"
              value={houseArea}
              onChange={(e) => setHouseArea(e.target.value as HouseArea)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="small">{isKo ? '전용 85㎡ 이하 (국민주택규모, 농특세 비과세)' : '≤85㎡ (National Size, No Rural Tax)'}</option>
              <option value="large">{isKo ? '전용 85㎡ 초과 (대형 평수, 농어촌특별세 부과)' : '>85㎡ (Rural Tax Applied)'}</option>
            </select>
          </div>
        </div>

        {/* 결과 섹션 */}
        <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-base border-b border-border pb-3">
              {isKo ? '2. 취득세 상세 명세서' : '2. Tax Breakdown'}
            </h3>

            {/* 감면 또는 중과 알림 카드 */}
            <div className={`mt-4 p-4 rounded-xl border ${
              calculation.isFirstHomeApplied
                ? 'border-primary/30 bg-primary/10'
                : calculation.isSurcharged
                ? 'border-destructive/30 bg-destructive/10'
                : 'border-border bg-muted/40'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {isKo ? '세제 혜택 및 중과 판정' : 'Tax Status'}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold bg-background border ${
                  calculation.isFirstHomeApplied
                    ? 'text-primary border-primary/30'
                    : calculation.isSurcharged
                    ? 'text-destructive border-destructive/30'
                    : 'text-foreground border-border'
                }`}>
                  {calculation.isFirstHomeApplied
                    ? (isKo ? '생애최초 200만원 전액 감면' : '2M KRW Tax Credit')
                    : calculation.isSurcharged
                    ? (isKo ? '다주택 중과세율 적용' : 'Surcharged Rate')
                    : (isKo ? '일반 표준세율 적용' : 'Standard Rate')}
                </span>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-foreground">
                  {formatKrw(calculation.finalTotalTax)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {calculation.isFirstHomeApplied
                  ? (isKo ? `생애최초 감면으로 취득세에서 ${formatKrw(calculation.firstHomeDiscount)}을 즉시 절약했습니다.` : '2M KRW credited.')
                  : (isKo ? `취득세 ${calculation.baseTaxRate}% + 지방교육세 ${calculation.eduTaxRate}% ${calculation.ruralTaxRate > 0 ? `+ 농특세 ${calculation.ruralTaxRate}%` : ''}` : `Rate: ${calculation.totalTaxRate}%`)}
              </p>
            </div>

            {/* 세부 항목 표 */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">{isKo ? '취득세 본세' : 'Acquisition Tax'}</span>
                <span className="font-medium text-foreground">
                  {calculation.isFirstHomeApplied ? (
                    <span>
                      <s className="text-muted-foreground mr-1.5">{formatKrw(calculation.rawAcquisitionTax)}</s>
                      <strong className="text-primary">{formatKrw(calculation.finalAcquisitionTax)}</strong>
                    </span>
                  ) : formatKrw(calculation.finalAcquisitionTax)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">{isKo ? '지방교육세' : 'Local Education Tax'}</span>
                <span className="font-medium text-foreground">{formatKrw(calculation.eduTax)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">{isKo ? '농어촌특별세' : 'Special Rural Tax'}</span>
                <span className="font-medium text-foreground">{formatKrw(calculation.ruralTax)}</span>
              </div>
              {calculation.isFirstHomeApplied && (
                <div className="flex justify-between py-1.5 border-b border-border text-primary font-semibold">
                  <span>{isKo ? '생애최초 감면액' : 'First-Home Discount'}</span>
                  <span>-{formatKrw(calculation.firstHomeDiscount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* 주의사항 팁 */}
          <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground space-y-1">
            <div className="font-semibold text-foreground flex items-center gap-1">
              <span>💡 취득세 신고·납부 기한 및 실거주 의무</span>
            </div>
            <p>
              • <strong>취득일(잔금지급일)로부터 60일 이내</strong>에 관할 시·군·구청에 취득세를 신고·납부해야 가산세(20%)를 피할 수 있습니다.
            </p>
            <p>
              • 생애최초 감면을 받은 경우 <strong>3개월 이내 전입</strong>하고 <strong>3년 이상 실거주</strong>해야 감면액이 추징되지 않습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
