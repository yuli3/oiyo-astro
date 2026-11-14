import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Landmark, Sparkles, TrendingUp, ShieldCheck, DollarSign } from 'lucide-react';

export function FinancialEstateDeductionCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [grossAssetsHundredMillions, setGrossAssetsHundredMillions] = useState(8); // 총 금융재산 (억원)
  const [debtsHundredMillions, setDebtsHundredMillions] = useState(1); // 금융부채 (억원)
  const [taxRatePercent, setTaxRatePercent] = useState(40); // 상속세 한계세율 (10~50%)

  const result = useMemo(() => {
    const gross = grossAssetsHundredMillions * 100000000;
    const debt = debtsHundredMillions * 100000000;
    const net = Math.max(0, gross - debt);

    let deduction = 0;
    let ruleText = '';

    if (net <= 0) {
      deduction = 0;
      ruleText = isKo ? '순금융재산 0원 이하' : 'Net assets 0 KRW';
    } else if (net <= 20000000) {
      deduction = net;
      ruleText = isKo ? '2,000만원 이하: 순금융재산 전액 공제' : 'Under 20M: Full deduction';
    } else if (net <= 100000000) {
      deduction = 20000000;
      ruleText = isKo ? '2천만~1억원: 2,000만원 정액 공제' : '20M~100M: 20M KRW fixed';
    } else {
      const raw20 = Math.round(net * 0.20);
      deduction = Math.min(200000000, raw20);
      ruleText = deduction >= 200000000
        ? (isKo ? '법정 최대 한도 2억원 달성 🌟' : 'Max Cap 200M KRW Reached')
        : (isKo ? '1억원 초과: 순금융재산의 20% 공제' : 'Over 100M: 20% deduction');
    }

    const savings = Math.round(deduction * (taxRatePercent / 100));

    return {
      gross,
      debt,
      net,
      deduction,
      ruleText,
      savings,
      isMaxCap: deduction >= 200000000,
    };
  }, [grossAssetsHundredMillions, debtsHundredMillions, taxRatePercent, isKo]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {isKo ? '💰 상속세 순금융재산 상속공제(최대 2억원) 계산기' : '💰 Financial Asset Estate Deduction (Up to 200M KRW) Calculator'}
              </CardTitle>
              <CardDescription>
                {isKo
                  ? '상증세법 제22조에 따른 예적금·주식·보험금 등 순금융재산 공제액(최대 2억원) 및 상속세 직접 절감액을 1초 만에 계산합니다.'
                  : 'Calculate net financial estate deduction (up to 200M KRW) and direct estate tax savings in Korea.'}
              </CardDescription>
            </div>
            <Badge variant={result.isMaxCap ? 'outline' : 'secondary'}>
              {result.isMaxCap ? (isKo ? '최대 2억원 공제 🌟' : '200M Max Cap') : `${(result.deduction / 10000).toLocaleString()}만원`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '총 금융재산 (예금/주식/보험금, 억원)' : 'Gross Financial Assets (100M KRW)'}
                </label>
                <Input
                  type="number"
                  min={0}
                  max={500}
                  step={0.5}
                  value={grossAssetsHundredMillions}
                  onChange={(e) => setGrossAssetsHundredMillions(Math.max(0, Number(e.target.value) || 0))}
                />
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '금융기관 채무 (대출금 등, 억원)' : 'Financial Debts (100M KRW)'}
                </label>
                <Input
                  type="number"
                  min={0}
                  max={500}
                  step={0.5}
                  value={debtsHundredMillions}
                  onChange={(e) => setDebtsHundredMillions(Math.max(0, Number(e.target.value) || 0))}
                />
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '상속세 예상 한계세율 (%)' : 'Marginal Estate Tax Rate (%)'}
                </label>
                <Input
                  type="number"
                  min={10}
                  max={50}
                  step={10}
                  value={taxRatePercent}
                  onChange={(e) => setTaxRatePercent(Math.max(10, Math.min(50, Number(e.target.value) || 10)))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {isKo ? '과표 1억(10%), 5억(20%), 10억(30%), 30억(40%), 초과(50%)' : '10% to 50% progressive brackets'}
                </p>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4 space-y-1 bg-muted/20">
                <div className="text-xs text-muted-foreground">{isKo ? '순금융재산가액' : 'Net Financial Assets'}</div>
                <div className="text-xl font-bold">
                  {(result.net / 100000000).toFixed(2)} {isKo ? '억원' : '100M KRW'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isKo ? '총 금융재산 - 금융채무' : 'Gross assets - debts'}
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-1 bg-muted/20">
                <div className="text-xs text-muted-foreground">{isKo ? '금융재산 상속공제액' : 'Estate Deduction'}</div>
                <div className="text-2xl font-bold text-primary">
                  {(result.deduction / 10000).toLocaleString()} {isKo ? '만원' : '10k KRW'}
                </div>
                <div className="text-xs text-muted-foreground">{result.ruleText}</div>
              </div>

              <div className="rounded-lg border p-4 space-y-1 bg-primary/5 border-primary/20">
                <div className="text-xs text-muted-foreground">{isKo ? '상속세 현금 절감액' : 'Direct Tax Savings'}</div>
                <div className="text-2xl font-bold text-primary">
                  {(result.savings / 10000).toLocaleString()} {isKo ? '만원 절세' : '10k KRW'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isKo ? `세율 ${taxRatePercent}% 적용 기준` : `At ${taxRatePercent}% tax rate`}
                </div>
              </div>
            </div>

            {/* Educational Defense Guide */}
            <div className="rounded-lg border p-4 text-xs space-y-2 bg-muted/10 text-muted-foreground">
              <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                {isKo ? '금융재산 상속공제 3대 절세 포인트' : '3 Key Rules for Financial Asset Deduction'}
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong>{isKo ? '부동산보다 금융자산이 유리한 구간' : 'Advantage over Real Estate'}:</strong> {isKo ? '부동산만 상속받으면 금융공제가 0원이지만, 금융자산이 있으면 순액의 20%를 최대 2억원까지 상속재산에서 깎아줍니다.' : 'Financial assets provide up to 200M KRW additional deduction.'}
                </li>
                <li>
                  <strong>{isKo ? '부채 차감 원칙' : 'Debt Netting Rule'}:</strong> {isKo ? '금융기관 채무가 금융재산보다 많으면 공제액은 0원이 되므로 상속 전 부채 상환 구조를 반드시 점검해야 합니다.' : 'Net financial assets must be positive to receive deduction.'}
                </li>
                <li>
                  <strong>{isKo ? '최대 10억원 보유 시 2억 풀공제' : 'Optimal 1B KRW'}:</strong> {isKo ? '순금융재산이 10억원일 때 법정 최고 한도인 2억원 공제를 100% 흡수하여 절세 효과가 극대화됩니다.' : '1B KRW in net financial assets absorbs the full 200M cap.'}
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default FinancialEstateDeductionCalculator;
