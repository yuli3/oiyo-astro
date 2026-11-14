import { useState, useMemo } from 'react';

type RegionKey = 'seoul' | 'metro' | 'metro-cities' | 'others';

export default function CommercialRentGuard({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [deposit, setDeposit] = useState<number>(50000000); // 5천만원
  const [rent, setRent] = useState<number>(3000000); // 300만원
  const [region, setRegion] = useState<RegionKey>('seoul');
  const [tenureYears, setTenureYears] = useState<number>(4); // 4년차
  const [newDeposit, setNewDeposit] = useState<number>(50000000);
  const [newRent, setNewRent] = useState<number>(3300000); // 330만원 (+10%)

  const REGIONAL_LIMITS: Record<RegionKey, { nameKo: string; nameEn: string; limit: number }> = {
    seoul: {
      nameKo: '서울특별시',
      nameEn: 'Seoul Metropolitan',
      limit: 900000000,
    },
    metro: {
      nameKo: '수도권 과밀억제권역 / 부산광역시',
      nameEn: 'Capital Overcrowded / Busan',
      limit: 690000000,
    },
    'metro-cities': {
      nameKo: '광역시 / 세종 / 파주·화성·안산·용인·김포·광주',
      nameEn: 'Metropolitan Cities / Growing Cities',
      limit: 540000000,
    },
    others: {
      nameKo: '그 밖의 지역',
      nameEn: 'Other Regions',
      limit: 370000000,
    },
  };

  const calculation = useMemo(() => {
    const regionInfo = REGIONAL_LIMITS[region] || REGIONAL_LIMITS.seoul;
    const conversionBase = deposit + rent * 100;
    const isWithinConversionLimit = conversionBase <= regionInfo.limit;

    // 10년 계약갱신요구권 & 권리금 회수보호
    const hasRenewalRight = tenureYears < 10;
    const remainingRenewalYears = Math.max(0, 10 - tenureYears);
    const hasGoodwillProtection = true; // 환산보증금 초과 여부 불문 100% 보호

    // 법정 5% 증액 상한선 산출 (환산보증금 × 1.05)
    const maxLegalConversionBase = Math.round(conversionBase * 1.05);

    // 신규 보증금에 따른 법정 허용 최대 월세
    const maxAllowedRentForNewDeposit = Math.max(0, Math.round((maxLegalConversionBase - newDeposit) / 100));

    // 제안된 신규 환산보증금 및 인상률
    const proposedConversionBase = newDeposit + newRent * 100;
    const actualIncreasePercent = ((proposedConversionBase - conversionBase) / conversionBase) * 100;

    // 위반 여부 및 월 초과액
    const isViolating5PercentCap = isWithinConversionLimit && proposedConversionBase > maxLegalConversionBase;
    const excessMonthlyRent = isViolating5PercentCap ? Math.round((proposedConversionBase - maxLegalConversionBase) / 100) : 0;

    return {
      regionInfo,
      conversionBase,
      isWithinConversionLimit,
      hasRenewalRight,
      remainingRenewalYears,
      hasGoodwillProtection,
      maxLegalConversionBase,
      maxAllowedRentForNewDeposit,
      proposedConversionBase,
      actualIncreasePercent: parseFloat(actualIncreasePercent.toFixed(2)),
      isViolating5PercentCap,
      excessMonthlyRent,
    };
  }, [deposit, rent, region, tenureYears, newDeposit, newRent]);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            {isKo ? '상가건물 5% 증액 상한선 & 권리금 보호 진단기' : 'Commercial Rent 5% Cap & Goodwill Protection Guard'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isKo
              ? '상가건물 임대차보호법 10년 갱신권, 환산보증금 기준 5% 인상 상한선, 종료 6개월 전 권리금 보호 여부를 진단합니다.'
              : 'Audit 10-year contract renewal rights, statutory 5% rent cap by conversion deposit, and commercial goodwill rights.'}
          </p>
        </div>

        {/* Input Controls */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column: Current Lease */}
          <div className="space-y-4 rounded-lg bg-muted/40 p-4 border border-border">
            <h4 className="text-sm font-semibold text-foreground">
              {isKo ? '1. 현재 계약 조건' : '1. Current Lease Terms'}
            </h4>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                {isKo ? '소재지 (지역)' : 'Location'}
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as RegionKey)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="seoul">
                  {isKo ? '서울특별시 (기준 9억원 이하)' : 'Seoul (Limit: 900M KRW)'}
                </option>
                <option value="metro">
                  {isKo ? '수도권 과밀억제권역 / 부산 (기준 6.9억원 이하)' : 'Capital Overcrowded / Busan (Limit: 690M KRW)'}
                </option>
                <option value="metro-cities">
                  {isKo ? '광역시 / 세종 / 파주·화성·안산·용인·김포·광주 (기준 5.4억원 이하)' : 'Metropolitan / Major Cities (Limit: 540M KRW)'}
                </option>
                <option value="others">
                  {isKo ? '그 밖의 지역 (기준 3.7억원 이하)' : 'Other Regions (Limit: 370M KRW)'}
                </option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{isKo ? '현재 보증금' : 'Current Deposit'}</span>
                <span className="font-semibold text-foreground">{(deposit / 10000).toLocaleString()}{isKo ? '만원' : '0k KRW'}</span>
              </div>
              <input
                type="number"
                step="1000000"
                value={deposit}
                onChange={(e) => setDeposit(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{isKo ? '현재 월세 (부가가치세 제외)' : 'Current Monthly Rent (excl. VAT)'}</span>
                <span className="font-semibold text-foreground">{(rent / 10000).toLocaleString()}{isKo ? '만원' : '0k KRW'}</span>
              </div>
              <input
                type="number"
                step="100000"
                value={rent}
                onChange={(e) => setRent(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{isKo ? '현재까지 총 임차 기간' : 'Total Tenure Period'}</span>
                <span className="font-semibold text-primary">{tenureYears}{isKo ? '년차' : ' yrs'}</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                step="0.5"
                value={tenureYears}
                onChange={(e) => setTenureYears(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
                <span>1{isKo ? '년차' : ' yr'}</span>
                <span>5{isKo ? '년차' : ' yrs'}</span>
                <span>10{isKo ? '년 (법정 상한)' : ' yrs (Cap)'}</span>
                <span>12{isKo ? '년' : ' yrs'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Proposed Renewal */}
          <div className="space-y-4 rounded-lg bg-muted/40 p-4 border border-border">
            <h4 className="text-sm font-semibold text-foreground">
              {isKo ? '2. 임대인 인상 요구 조건' : '2. Landlord Proposed Renewal Terms'}
            </h4>

            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{isKo ? '요구 신규 보증금' : 'Proposed New Deposit'}</span>
                <span className="font-semibold text-foreground">{(newDeposit / 10000).toLocaleString()}{isKo ? '만원' : '0k KRW'}</span>
              </div>
              <input
                type="number"
                step="1000000"
                value={newDeposit}
                onChange={(e) => setNewDeposit(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{isKo ? '요구 신규 월세' : 'Proposed New Monthly Rent'}</span>
                <span className="font-semibold text-foreground">{(newRent / 10000).toLocaleString()}{isKo ? '만원' : '0k KRW'}</span>
              </div>
              <input
                type="number"
                step="100000"
                value={newRent}
                onChange={(e) => setNewRent(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>

            {/* Quick Summary Pill */}
            <div className="rounded-md bg-card p-3 border border-border text-xs space-y-1.5 mt-2">
              <div className="flex justify-between text-muted-foreground">
                <span>{isKo ? '현재 환산보증금 (보증금+월세×100)' : 'Current Conversion Base'}</span>
                <span className="font-medium text-foreground">{(calculation.conversionBase / 10000).toLocaleString()}{isKo ? '만원' : '0k'}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{isKo ? '해당 지역 법정 적용 기준선' : 'Regional Protection Limit'}</span>
                <span className="font-medium text-foreground">{(calculation.regionInfo.limit / 100000000).toFixed(1)}{isKo ? '억원 이하' : '00M KRW'}</span>
              </div>
              <div className="flex justify-between text-muted-foreground border-t border-border pt-1.5">
                <span>{isKo ? '인상 요구율 (환산액 기준)' : 'Proposed Increase Rate'}</span>
                <span className={`font-bold ${calculation.actualIncreasePercent > 5 ? 'text-destructive' : 'text-primary'}`}>
                  {calculation.actualIncreasePercent > 0 ? `+${calculation.actualIncreasePercent}%` : `${calculation.actualIncreasePercent}%`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic Results Card */}
        <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-5 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border pb-4">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {isKo ? '상가건물 임대차보호법 진단 결과' : 'Statutory Diagnostic Outcome'}
              </span>
              <h4 className="text-xl font-bold text-foreground mt-0.5">
                {calculation.isWithinConversionLimit
                  ? (calculation.isViolating5PercentCap
                    ? (isKo ? '🚨 법정 5% 증액 상한선 초과 위반!' : '🚨 Statutory 5% Cap Violated!')
                    : (isKo ? '✅ 법정 5% 증액 상한선 준수 적법' : '✅ Within Statutory 5% Cap'))
                  : (isKo ? 'ℹ️ 환산보증금 초과 상가 (시세 협의 대상)' : 'ℹ️ Exceeds Conversion Deposit Limit')}
              </h4>
            </div>

            <div className="text-right">
              <span className="text-xs text-muted-foreground">{isKo ? '법정 최대 허용 월세' : 'Max Legal Monthly Rent'}</span>
              <div className="text-2xl font-black text-primary">
                {calculation.isWithinConversionLimit
                  ? `${calculation.maxAllowedRentForNewDeposit.toLocaleString()}${isKo ? '원' : ' KRW'}`
                  : (isKo ? '시세 협의' : 'Negotiable')}
              </div>
            </div>
          </div>

          {/* 3 Status Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* 1. Renewal Right */}
            <div className="rounded-lg bg-card p-4 border border-border">
              <div className="text-xs text-muted-foreground">{isKo ? '10년 계약갱신요구권' : '10-Yr Renewal Right'}</div>
              <div className={`text-lg font-bold mt-1 ${calculation.hasRenewalRight ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
                {calculation.hasRenewalRight
                  ? (isKo ? `행사 가능 (${calculation.remainingRenewalYears}년 잔여)` : `Eligible (${calculation.remainingRenewalYears}y left)`)
                  : (isKo ? '10년 만료' : '10 Years Expired')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isKo
                  ? '※ 환산보증금을 초과해도 10년 갱신권은 100% 동일하게 법으로 보장됩니다.'
                  : '10-year renewal is protected even if conversion deposit exceeds regional limits.'}
              </p>
            </div>

            {/* 2. Goodwill Protection */}
            <div className="rounded-lg bg-card p-4 border border-border">
              <div className="text-xs text-muted-foreground">{isKo ? '권리금 회수기회 보호' : 'Goodwill Recovery Right'}</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {isKo ? '100% 법적 보호' : '100% Protected'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isKo
                  ? '※ 임대차 종료 6개월 전부터 임대인의 권리금 방해 행위 금지 및 손해배상 청구권 인정.'
                  : 'Landlords are legally barred from obstructing goodwill 6 months prior to lease end.'}
              </p>
            </div>

            {/* 3. 5% Cap Result */}
            <div className="rounded-lg bg-card p-4 border border-border">
              <div className="text-xs text-muted-foreground">{isKo ? '5% 상한선 초과 차액' : 'Excess Monthly Rent'}</div>
              <div className={`text-lg font-bold mt-1 ${calculation.excessMonthlyRent > 0 ? 'text-destructive' : 'text-primary'}`}>
                {calculation.excessMonthlyRent > 0
                  ? `+${calculation.excessMonthlyRent.toLocaleString()}${isKo ? '원/월' : ' KRW/mo'}`
                  : (isKo ? '초과 없음' : '0 KRW')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {calculation.excessMonthlyRent > 0
                  ? (isKo ? '법정 상한 초과분은 무효이므로 거부 또는 반환 청구 가능' : 'Excess is null and void under statutory law')
                  : (isKo ? '법정 인상 기준 충족' : 'Complies with statutory ceiling')}
              </p>
            </div>
          </div>

          {/* Legal Advisory Notes */}
          <div className="rounded-lg bg-card p-4 border border-border space-y-2 text-xs text-muted-foreground">
            <h5 className="font-semibold text-foreground">
              ⚖️ {isKo ? '상가건물 임차인 실무 대응 수칙' : 'Practical Tenant Advisory Guide'}
            </h5>
            <ul className="list-disc list-inside space-y-1">
              <li>
                {isKo
                  ? '환산보증금 이내 상가: 임대인이 5%를 초과하는 증액을 요구하더라도 임차인은 5% 이내 인상만을 수용할 법적 권리가 있습니다.'
                  : 'Within Limit: Tenants are only obligated to accept up to statutory 5% rent increases.'}
              </li>
              <li>
                {isKo
                  ? '환산보증금 초과 상가: 5% 상한은 미적용되나, 임대인이 주변 시세와 동떨어진 과도한 인상을 요구할 경우 분쟁조정위원회 또는 법원 조정을 통해 방어할 수 있습니다.'
                  : 'Over Limit: While the 5% cap is waived, excessive spikes inconsistent with nearby market rates can be arbitrated.'}
              </li>
              <li>
                {isKo
                  ? '계약갱신요구권 행사 기간: 임대차 기간 만료 6개월 전부터 1개월 전까지 내용증명 또는 문자·카카오톡(확인 기록)으로 반드시 행사해야 합니다.'
                  : 'Renewal Notice: Must be exercised 6 months to 1 month before expiration via registered mail or verifiable text message.'}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
