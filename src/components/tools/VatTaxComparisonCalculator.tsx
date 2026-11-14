import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertCircle, Sparkles, Store, Building2, Calculator, Receipt } from 'lucide-react';

type IndustryKey = 'retail_food' | 'manufacturing' | 'accommodation' | 'construction_it' | 'services';

const VALUE_ADDED_RATES: Record<IndustryKey, { name: string; rate: number }> = {
  retail_food: { name: '소매업·음식점업', rate: 0.15 },
  manufacturing: { name: '제조업·농림어업', rate: 0.20 },
  accommodation: { name: '숙박업', rate: 0.25 },
  construction_it: { name: '건설·IT·운수업', rate: 0.30 },
  services: { name: '부동산임대·전문서비스', rate: 0.40 },
};

export default function VatTaxComparisonCalculator() {
  const [salesRevenue, setSalesRevenue] = useState<number>(75000000);
  const [purchaseExpense, setPurchaseExpense] = useState<number>(45000000);
  const [industryKey, setIndustryKey] = useState<IndustryKey>('retail_food');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const comparison = useMemo(() => {
    const industry = VALUE_ADDED_RATES[industryKey];

    // 1. 일반과세
    const generalSalesVat = Math.round(salesRevenue * (10 / 110));
    const generalPurchaseVat = Math.round(purchaseExpense * (10 / 110));
    const generalNetVat = generalSalesVat - generalPurchaseVat;

    // 2. 간이과세 (2024년 7월 1억 400만원 상향)
    const isSimplifiedEligible = salesRevenue < 104000000;
    const isExemptUnder48M = salesRevenue < 48000000;

    const simplifiedSalesVat = Math.round(salesRevenue * 0.10 * industry.rate);
    const simplifiedPurchaseCredit = Math.round(purchaseExpense * 0.005);
    let simplifiedNetVat = Math.max(0, simplifiedSalesVat - simplifiedPurchaseCredit);

    if (isExemptUnder48M) {
      simplifiedNetVat = 0;
    }

    let recommendation = '';
    let advantage = 0;

    if (!isSimplifiedEligible) {
      recommendation = '연매출 1억 400만원 이상으로 일반과세 의무 대상자입니다.';
      advantage = 0;
    } else if (generalNetVat < 0) {
      advantage = simplifiedNetVat - generalNetVat;
      recommendation = `초기 인테리어/설비 매입이 많아 일반과세 시 ${Math.abs(generalNetVat).toLocaleString()}원 부가세 전액 환급이 가능합니다!`;
    } else if (simplifiedNetVat < generalNetVat) {
      advantage = generalNetVat - simplifiedNetVat;
      recommendation = `간이과세 적용 시 일반과세 대비 연간 약 ${(advantage / 10000).toLocaleString()}만원의 부가세를 아낄 수 있습니다.`;
    } else {
      advantage = simplifiedNetVat - generalNetVat;
      recommendation = `매입 비중이 높아 일반과세가 연간 ${(advantage / 10000).toLocaleString()}만원 더 유리합니다.`;
    }

    return {
      industry,
      isSimplifiedEligible,
      isExemptUnder48M,
      generalSalesVat,
      generalPurchaseVat,
      generalNetVat,
      simplifiedSalesVat,
      simplifiedPurchaseCredit,
      simplifiedNetVat,
      recommendation,
      advantage,
    };
  }, [salesRevenue, purchaseExpense, industryKey]);

  const copyResult = () => {
    const text = `[OIYO 부가가치세 일반 vs 간이과세 비교]
- 업종: ${comparison.industry.name} (부가가치율 ${(comparison.industry.rate * 100).toFixed(0)}%)
- 연매출: ${(salesRevenue / 10000).toLocaleString()}만원 | 매입액: ${(purchaseExpense / 10000).toLocaleString()}만원
- 일반과세 납부/환급: ${comparison.generalNetVat < 0 ? `환급 -${Math.abs(comparison.generalNetVat).toLocaleString()}원` : `납부 ${comparison.generalNetVat.toLocaleString()}원`}
- 간이과세 납부: ${comparison.simplifiedNetVat.toLocaleString()}원 ${comparison.isExemptUnder48M ? '(4,800만 미만 전액 면제)' : ''}
- 맞춤 결론: ${comparison.recommendation}
https://tools.oiyo.net/ko/vat-tax-comparison-calculator/`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            <CardTitle>부가가치세 일반과세 vs 간이과세 절세 비교기</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            2024년 7월 개정된 간이과세 기준(연매출 1억 400만원 상향, 4,800만 납부면제)과 초기 시설투자 매입세액 환급 분기점을 비교합니다.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Industry buttons */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">업종 선택 (업종별 부가가치율 적용)</Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {(Object.keys(VALUE_ADDED_RATES) as IndustryKey[]).map((key) => (
                  <Button
                    key={key}
                    variant={industryKey === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIndustryKey(key)}
                  >
                    {VALUE_ADDED_RATES[key].name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sales and Purchase */}
              <div className="space-y-4 border rounded-lg p-4 border-border bg-muted/20">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Calculator className="w-4 h-4 text-primary" />
                  <span>연간 매출액 및 매입액 (공급대가)</span>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="salesRevenue" className="text-xs">연간 총 매출액 (부가세 포함, 원)</Label>
                  <Input
                    id="salesRevenue"
                    type="number"
                    value={salesRevenue}
                    step={5000000}
                    onChange={(e) => setSalesRevenue(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    간이과세 한도: 1억 400만원 미만 | 4,800만원 미만 시 부가세 0원 면제
                  </p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="purchaseExpense" className="text-xs">연간 총 매입액 (세금계산서/카드 매입, 원)</Label>
                  <Input
                    id="purchaseExpense"
                    type="number"
                    value={purchaseExpense}
                    step={5000000}
                    onChange={(e) => setPurchaseExpense(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">인테리어, 원재료, 장비 등 정규 영수증 매입액</p>
                </div>
              </div>

              {/* Status Explanation */}
              <div className="space-y-4 border rounded-lg p-4 border-border bg-muted/20">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Receipt className="w-4 h-4 text-primary" />
                  <span>과세 유형별 핵심 차이점</span>
                </div>
                <div className="p-3 bg-card border rounded-md border-border text-xs text-muted-foreground leading-relaxed space-y-2">
                  <div>
                    <span className="font-semibold text-foreground">🏢 일반과세:</span>
                    <p>매출세액에서 매입세액을 그대로 차감하므로, 초기 인테리어나 기계 장치 매입이 매출보다 크면 <strong>전액 세금 환급(Refund)</strong>이 가능합니다.</p>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">🏪 간이과세:</span>
                    <p>업종별 부가가치율(15~40%)만 세금으로 납부하므로 평소 세부담이 매우 낮으나, <strong>매입이 아무리 많아도 부가세 환급이 불가능(0원)</strong>합니다.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* General card */}
              <div className="p-5 border rounded-xl border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-base">1. 일반과세자 납부세액</h3>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">세액공제 10%</span>
                </div>
                <div className="space-y-1 pt-1 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>매출세액 (10%)</span>
                    <span>{comparison.generalSalesVat.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>매입세액 공제 (-10%)</span>
                    <span>-{comparison.generalPurchaseVat.toLocaleString()}원</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-border flex justify-between items-baseline">
                  <span className="font-medium text-xs">최종 세액:</span>
                  <p className="text-xl font-bold text-foreground">
                    {comparison.generalNetVat < 0
                      ? `환급 -${Math.abs(comparison.generalNetVat).toLocaleString()}원`
                      : `${comparison.generalNetVat.toLocaleString()}원`}
                  </p>
                </div>
              </div>

              {/* Simplified card */}
              <div className="p-5 border rounded-xl border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-base">2. 간이과세자 납부세액</h3>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                    1억 400만 기준
                  </span>
                </div>
                <div className="space-y-1 pt-1 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>매출세액 ({comparison.industry.name} {(comparison.industry.rate * 100).toFixed(0)}%)</span>
                    <span>{comparison.simplifiedSalesVat.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>매입 공급대가 공제 (-0.5%)</span>
                    <span>-{comparison.simplifiedPurchaseCredit.toLocaleString()}원</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-border flex justify-between items-baseline">
                  <span className="font-medium text-xs">최종 세액:</span>
                  <p className="text-xl font-bold text-primary">
                    {comparison.simplifiedNetVat.toLocaleString()}원
                  </p>
                </div>
              </div>
            </div>

            {/* Final recommendation box */}
            <div className="p-6 border rounded-xl border-border bg-card space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>OIYO 세무 진단 결과:</span>
              </div>
              <p className="text-sm font-semibold text-primary">{comparison.recommendation}</p>
              <div className="flex justify-end pt-2">
                <Button variant="outline" size="sm" onClick={copyResult}>
                  {isCopied ? '복사 완료!' : '결과 복사하기'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
