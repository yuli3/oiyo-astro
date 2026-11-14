import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendingUp, Sparkles, ShieldAlert, Award, Globe, LineChart } from 'lucide-react';

export function StockEtfTaxComparisonCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [profitMillions, setProfitMillions] = useState(10); // 연간 실현수익 (백만원)
  const [otherFinancialMillions, setOtherFinancialMillions] = useState(15); // 타 금융소득 (백만원)

  const result = useMemo(() => {
    const profit = profitMillions * 1000000;
    const otherFinancial = otherFinancialMillions * 1000000;

    // 1. 국내 주식 (매매차익 비과세)
    const domesticTax = 0;
    const domesticNet = profit;

    // 2. 미국 주식 직투 (22% 양도세, 250만원 기본공제)
    const usTaxable = Math.max(0, profit - 2500000);
    const usTax = Math.round(usTaxable * 0.22);
    const usNet = profit - usTax;
    const usEffectiveRate = Math.round((usTax / profit) * 1000) / 10;

    // 3. 국내상장 해외ETF
    // 3-1. 일반계좌 (15.4% 배당소득세)
    const etfGeneralTax = Math.round(profit * 0.154);
    const etfGeneralNet = profit - etfGeneralTax;
    const totalFinancialIncome = otherFinancial + profit;
    const isFinancialBomb = totalFinancialIncome > 20000000;

    // 3-2. ISA 계좌 (200만원 비과세 + 9.9% 분리과세)
    const isaTaxable = Math.max(0, profit - 2000000);
    const isaTax = Math.round(isaTaxable * 0.099);
    const isaNet = profit - isaTax;
    const isaSavings = etfGeneralTax - isaTax;

    // 3-3. 연금저축/IRP (5.5% 연금세 가정)
    const pensionTax = Math.round(profit * 0.055);
    const pensionNet = profit - pensionTax;
    const pensionSavings = etfGeneralTax - pensionTax;

    return {
      profit,
      domesticNet,
      usTax,
      usNet,
      usEffectiveRate,
      etfGeneralTax,
      etfGeneralNet,
      isFinancialBomb,
      totalFinancialIncome,
      isaTax,
      isaNet,
      isaSavings,
      pensionTax,
      pensionNet,
      pensionSavings,
    };
  }, [profitMillions, otherFinancialMillions]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {isKo ? '📈 2026 주식 vs 해외ETF 세금 3-Way & 절세계좌 비교기' : '📈 2026 Stock vs ETF Tax 3-Way & Account Comparison'}
              </CardTitle>
              <CardDescription>
                {isKo
                  ? '금투세 폐지 확정 반영: 국내주식(비과세), 미국주식 직투(22%), 국내상장 해외ETF(일반 vs ISA vs 연금저축)의 실질 세후 수익을 비교합니다.'
                  : 'Compare post-tax returns across Domestic Stocks, Direct US Stocks, and Overseas ETFs across ISA/Pension accounts.'}
              </CardDescription>
            </div>
            <Badge variant="outline">
              {isKo ? '2026 금투세 폐지 확정' : '2026 Tax Standard'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '연간 실현 수익 (백만원)' : 'Annual Realized Profit (Million KRW)'}
                </label>
                <Input
                  type="number"
                  min={1}
                  max={1000}
                  value={profitMillions}
                  onChange={(e) => setProfitMillions(Math.max(1, Number(e.target.value) || 0))}
                />
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '기존 타 금융소득 (이자/배당 등, 백만원)' : 'Other Financial Income (Million KRW)'}
                </label>
                <Input
                  type="number"
                  min={0}
                  max={500}
                  value={otherFinancialMillions}
                  onChange={(e) => setOtherFinancialMillions(Math.max(0, Number(e.target.value) || 0))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {isKo ? '연 2,000만원 초과 시 금융소득종합과세 판정 기준' : '20M KRW limit for Comprehensive Financial Tax'}
                </p>
              </div>
            </div>

            {/* Top 3 Direct Asset Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Domestic Stock */}
              <div className="rounded-lg border p-4 space-y-2 bg-muted/20">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <LineChart className="h-4 w-4" />
                  {isKo ? '1. 국내 주식 / 국내ETF' : '1. Domestic Stock / ETF'}
                </div>
                <div className="text-2xl font-bold text-primary">
                  {(result.domesticNet / 10000).toLocaleString()} {isKo ? '만원' : '10k KRW'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isKo ? '세금 0원 (매매차익 100% 비과세)' : 'Tax: 0 KRW (100% Exempt)'}
                </div>
              </div>

              {/* US Direct Stock */}
              <div className="rounded-lg border p-4 space-y-2 bg-muted/20">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Globe className="h-4 w-4" />
                  {isKo ? '2. 미국 주식 직투 (SPY/QQQ 등)' : '2. US Stock (Direct)'}
                </div>
                <div className="text-2xl font-bold">
                  {(result.usNet / 10000).toLocaleString()} {isKo ? '만원' : '10k KRW'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isKo
                    ? `세금 ${(result.usTax / 10000).toFixed(1)}만원 (실효세율 ${result.usEffectiveRate}%, 분류과세)`
                    : `Tax: ${(result.usTax / 10000).toFixed(1)} (Rate ${result.usEffectiveRate}%)`}
                </div>
              </div>

              {/* Overseas ETF in General Account */}
              <div className="rounded-lg border p-4 space-y-2 bg-muted/20">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4" />
                  {isKo ? '3. 국내상장 해외ETF (일반)' : '3. Overseas ETF (General)'}
                </div>
                <div className="text-2xl font-bold">
                  {(result.etfGeneralNet / 10000).toLocaleString()} {isKo ? '만원' : '10k KRW'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isKo
                    ? `세금 ${(result.etfGeneralTax / 10000).toFixed(1)}만원 (15.4% 배당소득세)`
                    : `Tax: ${(result.etfGeneralTax / 10000).toFixed(1)} (15.4% Dividend)`}
                </div>
              </div>
            </div>

            {/* Financial Income Warning */}
            {result.isFinancialBomb && (
              <div className="rounded-lg border p-4 space-y-1 bg-destructive/10 border-destructive/30">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-destructive" />
                  <span className="font-semibold text-sm">
                    {isKo ? '🚨 금융소득 2,000만원 초과 주의보!' : '🚨 Financial Income Exceeds 20M KRW!'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isKo
                    ? `국내상장 해외ETF 매매차익은 배당소득으로 잡혀 합산 금융소득이 ${(result.totalFinancialIncome / 10000).toLocaleString()}만원으로 2,000만원을 초과합니다. 종합소득세 누진세율 합산 및 건강보험료 피부양자 탈락/추가 부과 대상이 됩니다.`
                    : 'Classified as dividend income, exceeding 20M KRW triggers comprehensive income tax and insurance fee increases.'}
                </p>
              </div>
            )}

            {/* Tax-Advantaged Account Comparison for Overseas ETF */}
            <div className="space-y-3">
              <div className="text-sm font-semibold flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                {isKo ? '🌟 국내상장 해외ETF 절세계좌 담았을 때 세금 혜택' : '🌟 Tax-Advantaged Account Benefits for Overseas ETFs'}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border p-4 space-y-2 bg-primary/5 border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{isKo ? 'ISA 계좌 (추천 🌟)' : 'ISA Account'}</span>
                    <Badge variant="outline">{isKo ? '9.9% 분리과세' : '9.9% Separate'}</Badge>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {(result.isaNet / 10000).toLocaleString()} {isKo ? '만원 (세후)' : '10k KRW'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isKo
                      ? `일반계좌 대비 ${(result.isaSavings / 10000).toFixed(1)}만원 절세! (200만원 비과세 + 금융소득종합과세 배제)`
                      : `Saves ${(result.isaSavings / 10000).toFixed(1)} vs general account!`}
                  </div>
                </div>

                <div className="rounded-lg border p-4 space-y-2 bg-primary/5 border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{isKo ? '연금저축 / IRP 계좌' : 'Pension / IRP'}</span>
                    <Badge variant="outline">{isKo ? '과세이연 + 5.5% 저율' : 'Tax Deferred + 5.5%'}</Badge>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {(result.pensionNet / 10000).toLocaleString()} {isKo ? '만원 (세후)' : '10k KRW'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isKo
                      ? `일반계좌 대비 ${(result.pensionSavings / 10000).toFixed(1)}만원 절세! (배당세 없이 복리 굴린 후 55세 연금 수령)`
                      : `Saves ${(result.pensionSavings / 10000).toFixed(1)} vs general account!`}
                  </div>
                </div>
              </div>
            </div>

            {/* Educational Strategy Guide */}
            <div className="rounded-lg border p-4 text-xs space-y-2 bg-muted/10 text-muted-foreground">
              <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                {isKo ? '2026 투자자 맞춤형 계좌 배치 공식' : '2026 Account Allocation Strategy'}
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong>{isKo ? '국내 주식' : 'Domestic Stocks'}:</strong> {isKo ? '매매차익 비과세이므로 굳이 한도가 있는 ISA를 쓰지 않고 일반 계좌에서 매매하는 것이 효율적입니다.' : 'Trade in general accounts as capital gains are tax-exempt.'}
                </li>
                <li>
                  <strong>{isKo ? '미국 지수 ETF(S&P500, 나스닥)' : 'US Index ETFs'}:</strong> {isKo ? '일반계좌 대신 반드시 ISA 계좌(연 2,000만원 한도)나 연금저축에 담아 15.4% 배당세와 금융종합과세를 피하세요.' : 'Always hold in ISA or pension accounts to avoid 15.4% dividend tax.'}
                </li>
                <li>
                  <strong>{isKo ? '미국 개별 주식 직투' : 'Direct US Stocks'}:</strong> {isKo ? 'ISA에 담을 수 없으므로 250만원 기본공제를 매년 활용하고 손실상계(Tax-loss harvesting)를 실행하세요.' : 'Utilize 2.5M deduction and tax-loss harvesting.'}
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default StockEtfTaxComparisonCalculator;
