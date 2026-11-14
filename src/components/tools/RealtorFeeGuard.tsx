import { useState, useMemo } from 'react';

type TransactionType = 'buy' | 'rent' | 'officetel-buy' | 'officetel-rent' | 'commercial';
type VatType = 'general' | 'simple' | 'none';

export default function RealtorFeeGuard({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [txType, setTxType] = useState<TransactionType>('rent');
  const [price, setPrice] = useState<number>(300000000); // 3억원
  const [deposit, setDeposit] = useState<number>(50000000); // 5,000만원
  const [monthlyRent, setMonthlyRent] = useState<number>(600000); // 60만원
  const [vatType, setVatType] = useState<VatType>('general');

  const calculation = useMemo(() => {
    let transactionAmount = 0;
    let isUnder50MApplied = false;

    if (txType === 'buy' || txType === 'officetel-buy') {
      transactionAmount = price;
    } else if (txType === 'rent' || txType === 'officetel-rent') {
      const initial = deposit + monthlyRent * 100;
      if (monthlyRent > 0 && initial < 50000000) {
        transactionAmount = deposit + monthlyRent * 70;
        isUnder50MApplied = true;
      } else {
        transactionAmount = initial;
      }
    } else if (txType === 'commercial') {
      transactionAmount = price > 0 ? price : deposit + monthlyRent * 100;
    }

    let rate = 0.004;
    let limitAmount = 0;

    if (txType === 'buy') {
      if (transactionAmount < 50000000) {
        rate = 0.006;
        limitAmount = 250000;
      } else if (transactionAmount < 200000000) {
        rate = 0.005;
        limitAmount = 800000;
      } else if (transactionAmount < 900000000) {
        rate = 0.004;
      } else if (transactionAmount < 1200000000) {
        rate = 0.005;
      } else if (transactionAmount < 1500000000) {
        rate = 0.006;
      } else {
        rate = 0.007;
      }
    } else if (txType === 'rent') {
      if (transactionAmount < 50000000) {
        rate = 0.005;
        limitAmount = 200000;
      } else if (transactionAmount < 100000000) {
        rate = 0.004;
        limitAmount = 300000;
      } else if (transactionAmount < 900000000) {
        rate = 0.003;
      } else if (transactionAmount < 1200000000) {
        rate = 0.004;
      } else if (transactionAmount < 1500000000) {
        rate = 0.005;
      } else {
        rate = 0.006;
      }
    } else if (txType === 'officetel-buy') {
      rate = 0.005;
    } else if (txType === 'officetel-rent') {
      rate = 0.004;
    } else if (txType === 'commercial') {
      rate = 0.009;
    }

    let baseFee = Math.round(transactionAmount * rate);
    if (limitAmount > 0 && baseFee > limitAmount) {
      baseFee = limitAmount;
    }

    let vatRate = 0.1;
    if (vatType === 'simple') vatRate = 0.04;
    else if (vatType === 'none') vatRate = 0.0;

    const vatAmount = Math.round(baseFee * vatRate);
    const totalFee = baseFee + vatAmount;
    const ripOffDefense = vatType !== 'general' ? Math.round(baseFee * 0.1) - vatAmount : 0;

    return {
      transactionAmount,
      isUnder50MApplied,
      ratePercent: parseFloat((rate * 100).toFixed(2)),
      limitAmount,
      baseFee,
      vatRatePercent: vatRate * 100,
      vatAmount,
      totalFee,
      ripOffDefense,
    };
  }, [txType, price, deposit, monthlyRent, vatType]);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            {isKo ? '부동산 중개수수료(복비) 상한요율 & 부가세 바가지 방어기' : 'Realtor Brokerage Fee & VAT Defense Guard'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isKo
              ? '공인중개사법 기준 매매·전월세 법정 상한요율(0.3~0.7%), 월세 5천만원 미만 70배 룰 및 간이과세자(4%/0%) 부가세 바가지 방어를 진단합니다.'
              : 'Audit statutory brokerage fee ceilings, 70x conversion rule for low deposits, and VAT overcharge defense.'}
          </p>
        </div>

        {/* Inputs */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column: Transaction Details */}
          <div className="space-y-4 rounded-lg bg-muted/40 p-4 border border-border">
            <h4 className="text-sm font-semibold text-foreground">
              {isKo ? '1. 거래 대상 및 유형' : '1. Transaction Details'}
            </h4>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                {isKo ? '거래 대상 종류' : 'Property & Contract Type'}
              </label>
              <select
                value={txType}
                onChange={(e) => setTxType(e.target.value as TransactionType)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="rent">{isKo ? '주택 임대차 (전세 / 월세 0.3~0.6%)' : 'Residential Lease (0.3~0.6%)'}</option>
                <option value="buy">{isKo ? '주택 매매 / 교환 (0.4~0.7%)' : 'Residential Sale (0.4~0.7%)'}</option>
                <option value="officetel-rent">{isKo ? '주거용 오피스텔 임대차 (0.4%)' : 'Studio / Officetel Lease (0.4%)'}</option>
                <option value="officetel-buy">{isKo ? '주거용 오피스텔 매매 (0.5%)' : 'Studio / Officetel Sale (0.5%)'}</option>
                <option value="commercial">{isKo ? '상가 / 토지 / 업무용 (0.9% 이내 협의)' : 'Commercial Property (Max 0.9%)'}</option>
              </select>
            </div>

            {txType === 'buy' || txType === 'officetel-buy' ? (
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{isKo ? '매매 대금' : 'Sale Price'}</span>
                  <span className="font-semibold text-foreground">{(price / 10000).toLocaleString()}{isKo ? '만원' : '0k KRW'}</span>
                </div>
                <input
                  type="number"
                  step="10000000"
                  value={price}
                  onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>
            ) : (
              <>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{isKo ? '보증금' : 'Deposit'}</span>
                    <span className="font-semibold text-foreground">{(deposit / 10000).toLocaleString()}{isKo ? '만원' : '0k KRW'}</span>
                  </div>
                  <input
                    type="number"
                    step="5000000"
                    value={deposit}
                    onChange={(e) => setDeposit(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{isKo ? '월세 (전세는 0원)' : 'Monthly Rent (0 for Jeonse)'}</span>
                    <span className="font-semibold text-foreground">{(monthlyRent / 10000).toLocaleString()}{isKo ? '만원' : '0k KRW'}</span>
                  </div>
                  <input
                    type="number"
                    step="50000"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                  />
                </div>
              </>
            )}
          </div>

          {/* Right Column: Broker Business Type */}
          <div className="space-y-4 rounded-lg bg-muted/40 p-4 border border-border">
            <h4 className="text-sm font-semibold text-foreground">
              {isKo ? '2. 중개업소 부가가치세(VAT) 유형' : '2. Broker VAT Status'}
            </h4>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                {isKo ? '공인중개사 사업자 등록 유형' : 'Brokerage Tax Registration Type'}
              </label>
              <select
                value={vatType}
                onChange={(e) => setVatType(e.target.value as VatType)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="general">{isKo ? '일반과세자 (부가세 10% 청구)' : 'General Taxpayer (VAT 10%)'}</option>
                <option value="simple">{isKo ? '간이과세자 세금계산서 발급업소 (부가세 4%만 청구 가능)' : 'Simplified Taxpayer (VAT 4% max)'}</option>
                <option value="none">{isKo ? '간이과세자 영세업소 연 4,800만 미만 (부가세 0% 면제)' : 'Micro Taxpayer (VAT 0% Exempt)'}</option>
              </select>
            </div>

            <div className="rounded-md bg-card p-3 border border-border text-xs space-y-2 mt-4">
              <div className="flex justify-between text-muted-foreground">
                <span>{isKo ? '거래 환산 산정금액' : 'Calculated Base Amount'}</span>
                <span className="font-semibold text-foreground">{(calculation.transactionAmount / 10000).toLocaleString()}{isKo ? '만원' : '0k'}</span>
              </div>
              {calculation.isUnder50MApplied && (
                <div className="text-primary font-medium text-xs">
                  {isKo ? '※ 월세 5천만원 미만 특례 (보증금 + 월세 × 70) 적용됨' : '70x conversion rule applied for <50M'}
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>{isKo ? `법정 상한 요율` : `Statutory Cap Rate`}</span>
                <span className="font-semibold text-primary">{calculation.ratePercent}%</span>
              </div>
              <div className="flex justify-between text-muted-foreground border-t border-border pt-1.5">
                <span>{isKo ? '법정 중개보수 상한액 (VAT 제외)' : 'Net Brokerage Cap'}</span>
                <span className="font-bold text-foreground">{(calculation.baseFee).toLocaleString()}{isKo ? '원' : ' KRW'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Banner */}
        <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-5 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border pb-4">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {isKo ? '최대 합법 중개보수 총액 (부가세 포함)' : 'Max Legal Total Fee (incl. VAT)'}
              </span>
              <h4 className="text-2xl font-black text-primary mt-0.5">
                {calculation.totalFee.toLocaleString()}{isKo ? '원' : ' KRW'}
              </h4>
            </div>

            <div className="text-right">
              <span className="text-xs text-muted-foreground">{isKo ? '바가지 부가세 방어 절감액' : 'Overcharge Defense Savings'}</span>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {calculation.ripOffDefense > 0 ? `-${calculation.ripOffDefense.toLocaleString()}${isKo ? '원 방어' : ' KRW saved'}` : (isKo ? '해당 없음' : 'N/A')}
              </div>
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-card p-4 border border-border">
              <div className="text-xs text-muted-foreground">{isKo ? '순수 중개수수료 (상한선)' : 'Net Fee Ceiling'}</div>
              <div className="text-lg font-bold text-foreground mt-1">
                {calculation.baseFee.toLocaleString()}{isKo ? '원' : ' KRW'}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {calculation.limitAmount > 0
                  ? (isKo ? `법정 한도액 ${calculation.limitAmount.toLocaleString()}원 적용` : 'Legal maximum cap applied')
                  : (isKo ? '상한액 제한 없는 요율 구간' : 'Standard rate bracket')}
              </div>
            </div>

            <div className="rounded-lg bg-card p-4 border border-border">
              <div className="text-xs text-muted-foreground">{isKo ? '합법 부가가치세' : 'Statutory VAT'}</div>
              <div className="text-lg font-bold text-foreground mt-1">
                {calculation.vatAmount.toLocaleString()}{isKo ? '원' : ' KRW'} ({calculation.vatRatePercent}%)
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {vatType === 'general'
                  ? (isKo ? '일반과세자 10% (현금영수증 필수)' : '10% General VAT')
                  : vatType === 'simple'
                  ? (isKo ? '간이과세자 4% (10% 요구 시 위법)' : '4% Simplified VAT')
                  : (isKo ? '간이과세 영세업소 부가세 0원' : '0% Exempt')}
              </div>
            </div>

            <div className="rounded-lg bg-card p-4 border border-border">
              <div className="text-xs text-muted-foreground">{isKo ? '현금영수증 의무 발행' : 'Cash Receipt Duty'}</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {isKo ? '의무 발행 대상' : 'Mandatory'}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {isKo ? '10만원 이상 거래 시 소비자 요구 없어도 발급 필수' : 'Required for >=100k KRW'}
              </div>
            </div>
          </div>

          {/* Defense Checklist */}
          <div className="rounded-lg bg-card p-4 border border-border text-xs text-muted-foreground space-y-2">
            <h5 className="font-semibold text-foreground">
              🛡️ {isKo ? '부동산 복비 계약 전 필수 수칙' : 'Brokerage Fee Negotiation Checklist'}
            </h5>
            <ul className="list-disc list-inside space-y-1">
              <li>
                {isKo
                  ? '법정 요율은 "상한선"입니다: 중개사와 계약서를 작성하기 전에 수수료 협의를 명시적으로 진행할 법적 권리가 있습니다.'
                  : 'Statutory rates are upper limits. You are legally entitled to negotiate the rate before signing.'}
              </li>
              <li>
                {isKo
                  ? '간이과세자 부가세 10% 요구 방어: 사업자등록증을 확인하여 간이과세자인 경우 부가세는 4% 이하만 지급해야 합니다. 10% 요구는 불법 부당이득입니다.'
                  : 'Check registration: Simplified taxpayers may only charge up to 4% VAT, not 10%.'}
              </li>
              <li>
                {isKo
                  ? '연말정산 소득공제: 현금영수증(소득공제용)을 발급받으면 연말정산 시 신용카드 등 사용금액 소득공제 혜택을 받을 수 있습니다.'
                  : 'Cash receipts qualify for year-end income tax deductions.'}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
