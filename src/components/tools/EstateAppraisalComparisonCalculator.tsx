import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Scale, Sparkles, ShieldCheck } from 'lucide-react';

function computeInheritanceTax(estateVal: number, hasSpouse: boolean): number {
  const deduction = hasSpouse ? 1000000000 : 500000000;
  const taxBase = Math.max(0, estateVal - deduction);
  if (taxBase <= 0) return 0;

  let tax = 0;
  if (taxBase <= 100000000) tax = taxBase * 0.10;
  else if (taxBase <= 500000000) tax = 10000000 + (taxBase - 100000000) * 0.20;
  else if (taxBase <= 1000000000) tax = 90000000 + (taxBase - 500000000) * 0.30;
  else if (taxBase <= 3000000000) tax = 240000000 + (taxBase - 1000000000) * 0.40;
  else tax = 1040000000 + (taxBase - 3000000000) * 0.50;

  return Math.round(tax * 0.97);
}

function computeCapitalGainsTax(sellPrice: number, buyPrice: number): number {
  const gain = Math.max(0, sellPrice - buyPrice - 2500000);
  if (gain <= 0) return 0;

  let tax = 0;
  if (gain <= 14000000) tax = gain * 0.06;
  else if (gain <= 50000000) tax = 840000 + (gain - 14000000) * 0.15;
  else if (gain <= 88000000) tax = 6240000 + (gain - 50000000) * 0.24;
  else if (gain <= 150000000) tax = 15360000 + (gain - 88000000) * 0.35;
  else if (gain <= 300000000) tax = 37060000 + (gain - 150000000) * 0.38;
  else if (gain <= 500000000) tax = 94060000 + (gain - 300000000) * 0.40;
  else if (gain <= 1000000000) tax = 174060000 + (gain - 500000000) * 0.42;
  else tax = 384060000 + (gain - 1000000000) * 0.45;

  return Math.round(tax * 1.1);
}

export function EstateAppraisalComparisonCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [officialHundredMillions, setOfficialHundredMillions] = useState<number>(6.0); // 공시가 6억
  const [appraisalHundredMillions, setAppraisalHundredMillions] = useState<number>(9.0); // 감정가 9억
  const [sellHundredMillions, setSellHundredMillions] = useState<number>(10.0); // 매도가 10억
  const [hasSpouse, setHasSpouse] = useState<boolean>(true); // 배우자 유(10억 공제)
  const [feeTenThousand, setFeeTenThousand] = useState<number>(200); // 감정평가 수수료 200만원

  const result = useMemo(() => {
    const officialPrice = Math.round(officialHundredMillions * 100000000);
    const appraisalPrice = Math.round(appraisalHundredMillions * 100000000);
    const expectedSellPrice = Math.round(sellHundredMillions * 100000000);
    const appraisalFee = Math.round(feeTenThousand * 10000);

    const inhOfficial = computeInheritanceTax(officialPrice, hasSpouse);
    const capOfficial = computeCapitalGainsTax(expectedSellPrice, officialPrice);
    const totalOfficial = inhOfficial + capOfficial;

    const inhAppraisal = computeInheritanceTax(appraisalPrice, hasSpouse);
    const capAppraisal = computeCapitalGainsTax(expectedSellPrice, appraisalPrice);
    const totalAppraisal = inhAppraisal + capAppraisal + appraisalFee;

    const netSavings = totalOfficial - totalAppraisal;
    const isAppraisalBetter = netSavings > 0;

    return {
      inhOfficial,
      capOfficial,
      totalOfficial,
      inhAppraisal,
      capAppraisal,
      totalAppraisal,
      netSavings: Math.abs(netSavings),
      isAppraisalBetter,
    };
  }, [officialHundredMillions, appraisalHundredMillions, sellHundredMillions, hasSpouse, feeTenThousand]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              <span className="flex items-center gap-1">
                <Scale className="h-3.5 w-3.5" />
                {isKo ? '상증세법 제60조 · 소득세법 제97조' : 'Tax Evaluation Act'}
              </span>
            </Badge>
            <Badge variant="secondary">{isKo ? '상속세 vs 양도세 골든크로스' : 'Tax Arbitrage'}</Badge>
          </div>
          <CardTitle>
            {isKo
              ? '상속주택 감정평가 vs 공시가격 세금 비교기'
              : 'Inherited Property Appraisal vs Official Price Comparison'}
          </CardTitle>
          <CardDescription>
            {isKo
              ? '상속 시 감정평가를 받아 취득가액을 높이는 것이 미래 양도소득세 절세에 유리한지, 상속세 증가분과 비교하여 최적의 분기점을 진단합니다.'
              : 'Compare total tax liabilities between official assessed value and certified appraisal value.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5 p-3 border rounded-lg bg-background">
                <label htmlFor="official-input" className="text-xs font-semibold text-muted-foreground">
                  {isKo ? '상속 당시 공시가격 (억원)' : 'Official Price (100M KRW)'}
                </label>
                <Input
                  id="official-input"
                  type="number"
                  value={officialHundredMillions}
                  onChange={(e) => setOfficialHundredMillions(Math.max(0.1, Number(e.target.value) || 0))}
                  step={0.1}
                  min={0.1}
                />
              </div>

              <div className="space-y-1.5 p-3 border rounded-lg bg-background">
                <label htmlFor="appraisal-input" className="text-xs font-semibold text-muted-foreground">
                  {isKo ? '예상 시가 / 감정평가액 (억원)' : 'Appraisal Value (100M KRW)'}
                </label>
                <Input
                  id="appraisal-input"
                  type="number"
                  value={appraisalHundredMillions}
                  onChange={(e) => setAppraisalHundredMillions(Math.max(0.1, Number(e.target.value) || 0))}
                  step={0.1}
                  min={0.1}
                />
              </div>

              <div className="space-y-1.5 p-3 border rounded-lg bg-background">
                <label htmlFor="sell-input" className="text-xs font-semibold text-muted-foreground">
                  {isKo ? '향후 예상 매도가액 (억원)' : 'Expected Sale Price (100M KRW)'}
                </label>
                <Input
                  id="sell-input"
                  type="number"
                  value={sellHundredMillions}
                  onChange={(e) => setSellHundredMillions(Math.max(0.1, Number(e.target.value) || 0))}
                  step={0.1}
                  min={0.1}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium">{isKo ? '배우자 상속 여부' : 'Spouse Exemption'}</span>
                  <p className="text-xs text-muted-foreground">
                    {hasSpouse ? (isKo ? '상속공제 최소 10억원 적용' : '1.0B KRW limit') : (isKo ? '일괄공제 5억원 적용' : '0.5B KRW limit')}
                  </p>
                </div>
                <Button
                  variant={hasSpouse ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setHasSpouse(!hasSpouse)}
                >
                  {hasSpouse ? (isKo ? '배우자 있음' : 'Yes') : (isKo ? '배우자 없음' : 'No')}
                </Button>
              </div>

              <div className="space-y-1 p-3 border rounded-lg bg-background">
                <label htmlFor="fee-input" className="text-xs font-medium text-muted-foreground">
                  {isKo ? '감정평가 수수료 (만원)' : 'Appraisal Fee (10k KRW)'}
                </label>
                <Input
                  id="fee-input"
                  type="number"
                  value={feeTenThousand}
                  onChange={(e) => setFeeTenThousand(Math.max(0, Number(e.target.value) || 0))}
                  step={10}
                  min={0}
                />
              </div>
            </div>

            {/* 비교 분석 카드 */}
            <div className="p-4 bg-muted/60 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{isKo ? '세무 전략 비교 분석' : 'Strategy Comparison'}</span>
                </div>
                <Badge variant={result.isAppraisalBetter ? 'default' : 'secondary'}>
                  {result.isAppraisalBetter ? (isKo ? '감정평가 신고 추천 🌟' : 'Appraisal Recommended') : (isKo ? '공시가격 신고 추천 🛡️' : 'Official Price Recommended')}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-background space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{isKo ? 'Option A: 공시가격 신고' : 'Option A: Official Price'}</span>
                    <Badge variant="outline">{isKo ? '현재 상속세 절감' : 'Low Current Tax'}</Badge>
                  </div>
                  <div className="text-2xl font-bold tracking-tight">
                    {(result.totalOfficial / 10000).toLocaleString()}{isKo ? '만원' : ' 10k KRW'}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div>• {isKo ? `상속세: ${(result.inhOfficial / 10000).toLocaleString()}만원` : `Inheritance: ${result.inhOfficial / 10000}`}</div>
                    <div>• {isKo ? `매도 시 양도세: ${(result.capOfficial / 10000).toLocaleString()}만원 (취득가액 낮음 ⚠️)` : `Cap Gains: ${result.capOfficial / 10000}`}</div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-background space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{isKo ? 'Option B: 감정평가 신고' : 'Option B: Appraisal'}</span>
                    <Badge variant="default">{isKo ? '미래 양도세 대폭 방어' : 'Shield Future Gains'}</Badge>
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-primary">
                    {(result.totalAppraisal / 10000).toLocaleString()}{isKo ? '만원' : ' 10k KRW'}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div>• {isKo ? `상속세: ${(result.inhAppraisal / 10000).toLocaleString()}만원` : `Inheritance: ${result.inhAppraisal / 10000}`}</div>
                    <div>• {isKo ? `매도 시 양도세: ${(result.capAppraisal / 10000).toLocaleString()}만원 (취득가액 높음 ✅)` : `Cap Gains: ${result.capAppraisal / 10000}`}</div>
                    <div>• {isKo ? `감정평가 수수료: ${feeTenThousand}만원` : `Fee: ${feeTenThousand}`}</div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-background rounded-lg border text-sm space-y-1">
                <div className="flex items-center justify-between font-medium">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    {isKo ? '최종 절세 효과' : 'Net Tax Savings'}
                  </span>
                  <span className="font-bold text-primary">
                    {isKo
                      ? `약 ${(result.netSavings / 10000).toLocaleString()}만원 절세 이득!`
                      : `Save ${result.netSavings / 10000} 10k KRW`}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {result.isAppraisalBetter
                    ? (isKo ? '상속공제 한도 내에서는 감정평가로 취득가액을 최대한 끌어올려 미래 매도 시 양도소득세를 아끼는 것이 절대적으로 유리합니다.' : 'Appraisal raises basis and slashes future capital gains tax.')
                    : (isKo ? '상속재산이 공제 한도를 크게 초과하여 상속세율이 양도세율보다 높으므로 공시가격으로 신고하는 것이 유리합니다.' : 'Inheritance tax exceeds future capital gains savings.')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EstateAppraisalComparisonCalculator;
