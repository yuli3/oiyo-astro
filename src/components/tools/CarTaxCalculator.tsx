import { useState, useMemo } from 'react';

type VehicleType = 'passenger' | 'light' | 'ev' | 'hybrid' | 'van' | 'truck';
type RegionKey = 'seoul' | 'metro' | 'others';

export default function CarTaxCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [price, setPrice] = useState<number>(45000000); // 4,500만원
  const [vehicleType, setVehicleType] = useState<VehicleType>('passenger');
  const [region, setRegion] = useState<RegionKey>('seoul');
  const [isMultiChild, setIsMultiChild] = useState<boolean>(false);

  const calculation = useMemo(() => {
    // 1. 공급가액 (과세표준 = 차량가액 / 1.1)
    const supplyPrice = Math.round(price / 1.1);

    // 2. 차종별 세율
    let rate = 0.07;
    let ecoExemption = 0;
    let lightExemption = 0;

    switch (vehicleType) {
      case 'light':
        rate = 0.04;
        lightExemption = 750000;
        break;
      case 'ev':
        rate = 0.07;
        ecoExemption = 1400000;
        break;
      case 'hybrid':
        rate = 0.07;
        ecoExemption = 400000;
        break;
      case 'van':
      case 'truck':
        rate = 0.05;
        break;
      case 'passenger':
      default:
        rate = 0.07;
        break;
    }

    // 산출세액
    const baseTax = Math.round(supplyPrice * rate);

    // 감면 합산
    let appliedExemption = 0;
    if (vehicleType === 'light') {
      appliedExemption = Math.min(baseTax, lightExemption);
    } else if (ecoExemption > 0) {
      appliedExemption = Math.min(baseTax, ecoExemption);
    }

    // 다자녀 추가 감면 (최대 140만원)
    if (isMultiChild) {
      const remainingTax = Math.max(0, baseTax - appliedExemption);
      const multiChildDiscount = Math.min(remainingTax, 1400000);
      appliedExemption += multiChildDiscount;
    }

    const finalTax = Math.max(0, baseTax - appliedExemption);

    // 공채 매입 및 즉시할인
    let bondRate = 0.09;
    if (vehicleType === 'light' || vehicleType === 'ev') {
      bondRate = 0;
    } else if (region === 'metro') {
      bondRate = 0.08;
    } else if (region === 'others') {
      bondRate = 0.05;
    }

    const bondPurchaseAmount = Math.round(supplyPrice * bondRate);
    const bondDiscountRate = 0.105; // 10.5%
    const bondDiscountCost = Math.round(bondPurchaseAmount * bondDiscountRate);

    // 부대비용 (번호판, 인지/증지대)
    const incidentalFee = 40000;

    const totalCost = finalTax + bondDiscountCost + incidentalFee;

    return {
      supplyPrice,
      ratePercent: parseFloat((rate * 100).toFixed(1)),
      baseTax,
      appliedExemption,
      finalTax,
      bondRatePercent: parseFloat((bondRate * 100).toFixed(1)),
      bondPurchaseAmount,
      bondDiscountCost,
      incidentalFee,
      totalCost,
    };
  }, [price, vehicleType, region, isMultiChild]);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            {isKo ? '자동차 취등록세 & 공채매입 할인 및 친환경차 감면 계산기' : 'Automobile Registration Tax & Green Rebate Calculator'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isKo
              ? '지방세법 기준 일반 7%, 경차 4%(75만원 감면), 전기차(140만원), 하이브리드(40만원) 및 지자체 공채 즉시할인액을 실시간 산출합니다.'
              : 'Calculate statutory vehicle registration tax (7%, 4% for minicars), EV/Hybrid rebates, and municipal bond instant discount.'}
          </p>
        </div>

        {/* Form Inputs */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column: Vehicle Specs */}
          <div className="space-y-4 rounded-lg bg-muted/40 p-4 border border-border">
            <h4 className="text-sm font-semibold text-foreground">
              {isKo ? '1. 차량 기본 정보' : '1. Vehicle Details'}
            </h4>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                {isKo ? '차종 구분' : 'Vehicle Type'}
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as VehicleType)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="passenger">{isKo ? '일반 비영업용 승용차 (7%)' : 'Passenger Car (7%)'}</option>
                <option value="light">{isKo ? '경차 1,000cc 이하 (4% / 75만원 감면)' : 'Minicar <1,000cc (4% / 750k rebate)'}</option>
                <option value="ev">{isKo ? '전기차 / 수소차 (7% / 140만원 감면)' : 'Electric / FCEV (1.4M rebate)'}</option>
                <option value="hybrid">{isKo ? '하이브리드차 HEV (7% / 40만원 감면)' : 'Hybrid HEV (400k rebate)'}</option>
                <option value="van">{isKo ? '11인승 이상 승합차 (5%)' : 'Passenger Van 11+ seats (5%)'}</option>
                <option value="truck">{isKo ? '화물차 / 픽업트럭 (5%)' : 'Truck / Pickup (5%)'}</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{isKo ? '차량 출고가 (부가세 포함)' : 'Vehicle Purchase Price (incl. VAT)'}</span>
                <span className="font-semibold text-foreground">{(price / 10000).toLocaleString()}{isKo ? '만원' : '0k KRW'}</span>
              </div>
              <input
                type="number"
                step="1000000"
                value={price}
                onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
              <div className="flex gap-2 mt-2">
                {[18000000, 35000000, 50000000, 75000000, 100000000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setPrice(amt)}
                    className="rounded bg-muted px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    {(amt / 10000000).toFixed(0)}{isKo ? '천만' : '0M'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                {isKo ? '등록 지역 (공채 매입 비율)' : 'Registration Region (Bond Rate)'}
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as RegionKey)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="seoul">{isKo ? '서울특별시 (약 9% 공채)' : 'Seoul Metropolitan (~9%)'}</option>
                <option value="metro">{isKo ? '경기도 / 광역시 (약 8% 공채)' : 'Gyeonggi / Metros (~8%)'}</option>
                <option value="others">{isKo ? '기타 지방 자치단체 (약 5% 공채)' : 'Other Provinces (~5%)'}</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="multiChild"
                checked={isMultiChild}
                onChange={(e) => setIsMultiChild(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              <label htmlFor="multiChild" className="text-xs font-medium text-foreground cursor-pointer">
                {isKo ? '다자녀 가구 혜택 (18세 미만 자녀 3명 이상, 최대 140만원 감면)' : 'Multi-Child Family Rebate (Up to 1.4M KRW)'}
              </label>
            </div>
          </div>

          {/* Right Column: Breakdown */}
          <div className="space-y-4 rounded-lg bg-muted/40 p-4 border border-border">
            <h4 className="text-sm font-semibold text-foreground">
              {isKo ? '2. 세금 및 공채 상세 산출' : '2. Tax & Bond Calculation'}
            </h4>

            <div className="rounded-md bg-card p-3 border border-border text-xs space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>{isKo ? '차량 과세표준 (부가세 10% 제외)' : 'Tax Base (excl. VAT)'}</span>
                <span className="font-medium text-foreground">{(calculation.supplyPrice).toLocaleString()}{isKo ? '원' : ' KRW'}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{isKo ? `기본 산출 취득세 (${calculation.ratePercent}%)` : `Base Tax (${calculation.ratePercent}%)`}</span>
                <span className="font-medium text-foreground">{(calculation.baseTax).toLocaleString()}{isKo ? '원' : ' KRW'}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{isKo ? '친환경차 / 경차 / 다자녀 세액감면' : 'Total Tax Exemption'}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {calculation.appliedExemption > 0 ? `-${(calculation.appliedExemption).toLocaleString()}${isKo ? '원' : ' KRW'}` : '0원'}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground border-t border-border pt-1.5 font-medium">
                <span>{isKo ? '납부할 최종 취득세' : 'Final Payable Tax'}</span>
                <span className="font-bold text-primary">{(calculation.finalTax).toLocaleString()}{isKo ? '원' : ' KRW'}</span>
              </div>
            </div>

            <div className="rounded-md bg-card p-3 border border-border text-xs space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>{isKo ? `지자체 공채 매입액 (${calculation.bondRatePercent}%)` : `Bond Face Value (${calculation.bondRatePercent}%)`}</span>
                <span className="font-medium text-foreground">{(calculation.bondPurchaseAmount).toLocaleString()}{isKo ? '원' : ' KRW'}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{isKo ? '은행 즉시할인 매도 비용 (10.5%)' : 'Instant Bond Discount (10.5%)'}</span>
                <span className="font-semibold text-foreground">{(calculation.bondDiscountCost).toLocaleString()}{isKo ? '원' : ' KRW'}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{isKo ? '등록 부대비용 (번호판/증지/인지)' : 'Incidental Fees'}</span>
                <span className="font-medium text-foreground">{(calculation.incidentalFee).toLocaleString()}{isKo ? '원' : ' KRW'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Banner */}
        <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-5 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border pb-4">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {isKo ? '차량 등록 총 이전 부대비용' : 'Total Vehicle Registration Cost'}
              </span>
              <h4 className="text-2xl font-black text-primary mt-0.5">
                {calculation.totalCost.toLocaleString()}{isKo ? '원' : ' KRW'}
              </h4>
            </div>

            <div className="text-right">
              <span className="text-xs text-muted-foreground">{isKo ? '절감된 총 세액 감면' : 'Total Tax Savings'}</span>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {calculation.appliedExemption > 0 ? `${calculation.appliedExemption.toLocaleString()}${isKo ? '원' : ' KRW'}` : (isKo ? '0원' : '0 KRW')}
              </div>
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-card p-4 border border-border">
              <div className="text-xs text-muted-foreground">{isKo ? '실납부 취득세' : 'Payable Registration Tax'}</div>
              <div className="text-lg font-bold text-foreground mt-1">
                {calculation.finalTax.toLocaleString()}{isKo ? '원' : ' KRW'}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {isKo ? `산출세액 ${calculation.baseTax.toLocaleString()}원에서 감면 반영` : 'After legal exemptions'}
              </div>
            </div>

            <div className="rounded-lg bg-card p-4 border border-border">
              <div className="text-xs text-muted-foreground">{isKo ? '공채 할인 부담금' : 'Bond Discount Outlay'}</div>
              <div className="text-lg font-bold text-foreground mt-1">
                {calculation.bondDiscountCost.toLocaleString()}{isKo ? '원' : ' KRW'}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {calculation.bondRatePercent === 0
                  ? (isKo ? '경차/전기차 공채 전액 면제' : 'Exempt for EV/Minicar')
                  : (isKo ? '은행 즉시 매도 할인 적용' : 'Instant resale at bank')}
              </div>
            </div>

            <div className="rounded-lg bg-card p-4 border border-border">
              <div className="text-xs text-muted-foreground">{isKo ? '차량가액 대비 등록비율' : 'Cost-to-Price Ratio'}</div>
              <div className="text-lg font-bold text-primary mt-1">
                {((calculation.totalCost / price) * 100).toFixed(2)}%
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {isKo ? '차량 구입 시 준비해야 할 이전비용' : 'Total title transfer percentage'}
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="rounded-lg bg-card p-4 border border-border text-xs text-muted-foreground space-y-1.5">
            <h5 className="font-semibold text-foreground">
              💡 {isKo ? '차량 등록 및 절세 팁' : 'Vehicle Registration & Tax Tips'}
            </h5>
            <ul className="list-disc list-inside space-y-1">
              <li>
                {isKo
                  ? '경차 감면: 취득세액 75만원 이하인 경우 0원 면제되며, 75만원을 초과하는 고가 경차(예: 풀옵션 2,000만원)는 초과분만 납부합니다.'
                  : 'Minicar: Fully exempt up to 750,000 KRW; only the surplus is taxed for higher-trim minicars.'}
              </li>
              <li>
                {isKo
                  ? '1,600cc 미만 소형차 공채 면제: 2023년부터 1,600cc 미만 비영업용 승용차는 지자체 공채 매입 의무가 면제되어 공채할인 비용이 0원입니다.'
                  : 'Vehicles under 1,600cc are exempt from municipal bond purchases across Korea.'}
              </li>
              <li>
                {isKo
                  ? '친환경차 감면 일몰: 전기차(140만원) 및 하이브리드(40만원) 취득세 감면은 조세특례제한법에 따라 적용됩니다.'
                  : 'EV (1.4M KRW) and Hybrid (400k KRW) incentives are statutory tax shields.'}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
