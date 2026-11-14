import { useState, useMemo } from 'react';

type IsaType = 'standard' | 'rural-poor';

export default function IsaTaxBenefitCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [isaType, setIsaType] = useState<IsaType>('standard');
  const [gains, setGains] = useState<number>(6000000); // 600만원 이익
  const [losses, setLosses] = useState<number>(2000000); // 200만원 손실

  const calculation = useMemo(() => {
    // 1. 일반 계좌 세금 (15.4% 원천징수, 손익통산 불가)
    const regularTax = Math.round(gains * 0.154);

    // 2. ISA 손익통산 순이익
    const netProfit = Math.max(0, gains - losses);

    // 3. 비과세 한도
    const exemptLimit = isaType === 'rural-poor' ? 4000000 : 2000000;
    const appliedExemption = Math.min(netProfit, exemptLimit);

    // 4. 초과분 9.9% 분리과세
    const taxableProfit = Math.max(0, netProfit - appliedExemption);
    const isaTax = Math.round(taxableProfit * 0.099);

    // 5. 절세액 및 절감률
    const savings = regularTax - isaTax;
    const savingsRate = regularTax > 0 ? parseFloat(((savings / regularTax) * 100).toFixed(1)) : 100;

    return {
      regularTax,
      netProfit,
      exemptLimit,
      appliedExemption,
      taxableProfit,
      isaTax,
      savings,
      savingsRate,
    };
  }, [isaType, gains, losses]);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            {isKo ? 'ISA(개인종합자산관리계좌) 손익통산 & 세금 절감액 계산기' : 'ISA Tax-Shield & Net Profit Offsetting Calculator'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isKo
              ? '일반형(200만) vs 서민형(400만) 비과세 한도와 이익·손실 상계(손익통산), 9.9% 분리과세 절세액을 일반 증권계좌와 비교합니다.'
              : 'Compare ISA net profit offsetting and 9.9% separation tax against regular 15.4% brokerage accounts.'}
          </p>
        </div>

        {/* Inputs */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column: Account Type & Gains */}
          <div className="space-y-4 rounded-lg bg-muted/40 p-4 border border-border">
            <h4 className="text-sm font-semibold text-foreground">
              {isKo ? '1. ISA 가입 자격 유형' : '1. ISA Account Qualification'}
            </h4>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                {isKo ? '가입자 소득 기준' : 'Income Qualification'}
              </label>
              <select
                value={isaType}
                onChange={(e) => setIsaType(e.target.value as IsaType)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="standard">
                  {isKo ? '일반형 (총급여 5,000만원 초과 / 200만원 비과세)' : 'Standard Type (Income >50M / 2M Exemption)'}
                </option>
                <option value="rural-poor">
                  {isKo ? '서민형 (총급여 5,000만원 이하 / 400만원 비과세)' : 'Rural/Low-Income (Income <=50M / 4M Exemption)'}
                </option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{isKo ? '과세대상 이익 (배당금 및 과세ETF 차익)' : 'Taxable Gains (Dividends & ETFs)'}</span>
                <span className="font-semibold text-foreground">{(gains / 10000).toLocaleString()}{isKo ? '만원' : '0k KRW'}</span>
              </div>
              <input
                type="number"
                step="500000"
                value={gains}
                onChange={(e) => setGains(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
              <div className="flex gap-2 mt-2">
                {[2000000, 5000000, 10000000, 20000000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setGains(amt)}
                    className="rounded bg-muted px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    {(amt / 10000).toLocaleString()}{isKo ? '만' : '0k'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Capital Losses */}
          <div className="space-y-4 rounded-lg bg-muted/40 p-4 border border-border">
            <h4 className="text-sm font-semibold text-foreground">
              {isKo ? '2. 매매 손실 (손익통산 차감 대상)' : '2. Capital Losses (Offsetting Base)'}
            </h4>

            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{isKo ? '계좌 내 투자 손실 합계' : 'Total Capital Losses'}</span>
                <span className="font-semibold text-destructive">
                  {losses > 0 ? `-${(losses / 10000).toLocaleString()}${isKo ? '만원' : '0k KRW'}` : '0원'}
                </span>
              </div>
              <input
                type="number"
                step="500000"
                value={losses}
                onChange={(e) => setLosses(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              />
              <div className="flex gap-2 mt-2">
                {[0, 1000000, 2000000, 5000000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setLosses(amt)}
                    className="rounded bg-muted px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    {(amt / 10000).toLocaleString()}{isKo ? '만' : '0k'}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-md bg-card p-3 border border-border text-xs space-y-2 mt-4">
              <div className="flex justify-between text-muted-foreground">
                <span>{isKo ? '손익통산 후 순이익 (이익 - 손실)' : 'Net Profit (Gains - Losses)'}</span>
                <span className="font-bold text-foreground">{(calculation.netProfit).toLocaleString()}{isKo ? '원' : ' KRW'}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{isKo ? '법정 비과세 적용액 (0% 과세)' : 'Statutory Exemption (0% Tax)'}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  -{(calculation.appliedExemption).toLocaleString()}{isKo ? '원' : ' KRW'}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground border-t border-border pt-1.5">
                <span>{isKo ? '과세대상 초과 순이익 (9.9% 분리과세)' : 'Taxable Net Surplus (9.9% Rate)'}</span>
                <span className="font-semibold text-primary">{(calculation.taxableProfit).toLocaleString()}{isKo ? '원' : ' KRW'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results Banner */}
        <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-5 space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border pb-4">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {isKo ? 'ISA 계좌 활용 총 절세 금액' : 'Total ISA Tax Savings'}
              </span>
              <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {(calculation.savings).toLocaleString()}{isKo ? '원 절세' : ' KRW Saved'}
              </h4>
            </div>

            <div className="text-right">
              <span className="text-xs text-muted-foreground">{isKo ? '일반 증권계좌 대비 세금 절감률' : 'Tax Reduction Rate'}</span>
              <div className="text-2xl font-black text-primary">
                {calculation.savingsRate}% {isKo ? '절감' : 'Cut'}
              </div>
            </div>
          </div>

          {/* 2-Way Comparison Table */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Regular Account */}
            <div className="rounded-lg bg-card p-4 border border-border space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase">
                {isKo ? '일반 증권 위탁 계좌' : 'Regular Brokerage Account'}
              </div>
              <div className="text-2xl font-bold text-foreground">
                {(calculation.regularTax).toLocaleString()}{isKo ? '원 세금 납부' : ' KRW Tax'}
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 pt-1">
                <li>• {isKo ? `손익통산 불가: 손실 ${losses.toLocaleString()}원 차감 없이 이익 전액 과세` : 'No loss offsetting allowed'}</li>
                <li>• {isKo ? '배당소득세율 15.4% 전액 원천징수' : 'Flat 15.4% dividend tax deducted'}</li>
                <li>• {isKo ? '이자·배당 합산 2천만원 초과 시 금융소득종합과세 합산' : 'Subject to composite financial tax'}</li>
              </ul>
            </div>

            {/* ISA Account */}
            <div className="rounded-lg bg-primary/5 p-4 border border-primary/20 space-y-2">
              <div className="text-xs font-semibold text-primary uppercase">
                {isKo ? `ISA 계좌 (${isaType === 'rural-poor' ? '서민형 400만' : '일반형 200만'})` : 'ISA Tax-Shield Account'}
              </div>
              <div className="text-2xl font-bold text-primary">
                {(calculation.isaTax).toLocaleString()}{isKo ? '원 세금 납부' : ' KRW Tax'}
              </div>
              <ul className="text-xs text-foreground space-y-1 pt-1">
                <li>• {isKo ? `손익통산 적용: 순이익 ${calculation.netProfit.toLocaleString()}원만 과세 대상` : 'Net profits offset against losses'}</li>
                <li>• {isKo ? `최대 ${calculation.exemptLimit.toLocaleString()}원 전액 비과세 (세금 0원)` : 'Full exemption up to limit'}</li>
                <li>• {isKo ? '초과분 9.9% 분리과세 (금융소득종합과세 미합산)' : '9.9% low-rate separation tax on surplus'}</li>
              </ul>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="rounded-lg bg-card p-4 border border-border text-xs text-muted-foreground space-y-1.5">
            <h5 className="font-semibold text-foreground">
              💡 {isKo ? 'ISA 투자 필수 실전 팁' : 'ISA Practical Tips'}
            </h5>
            <ul className="list-disc list-inside space-y-1">
              <li>
                {isKo
                  ? '국내상장 미국 ETF 필수: S&P500, 나스닥100, 배당다우존스(SCHD) 등 배당소득세(15.4%)가 부과되는 ETF는 일반 계좌 대신 반드시 ISA 계좌에서 운용해야 세금을 극적으로 줄일 수 있습니다.'
                  : 'Domestic U.S. ETFs: Assets subject to 15.4% dividend tax should always be held in ISA accounts to maximize tax shield.'}
              </li>
              <li>
                {isKo
                  ? '3년 만기 후 연금계좌 전환 세액공제: 3년 의무 가입기간 만료 후 연금저축/IRP로 이전 시 전환 금액의 10%(최대 300만원)를 추가 세액공제받을 수 있습니다.'
                  : 'Pension Rollover: Transferring matured ISA funds into an IRP grants an additional 10% tax credit (up to 3M KRW).'}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
