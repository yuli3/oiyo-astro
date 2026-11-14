import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, TrendingUp, HeartPulse } from 'lucide-react';

const TAX_BRACKETS = [
  { limit: 14000000, rate: 0.06, deduction: 0 },
  { limit: 50000000, rate: 0.15, deduction: 1260000 },
  { limit: 88000000, rate: 0.24, deduction: 5760000 },
  { limit: 150000000, rate: 0.35, deduction: 15440000 },
  { limit: 300000000, rate: 0.38, deduction: 19940000 },
  { limit: 500000000, rate: 0.40, deduction: 25940000 },
  { limit: 1000000000, rate: 0.42, deduction: 35940000 },
  { limit: Infinity, rate: 0.45, deduction: 65940000 },
];

function calculateProgressiveTax(taxBase: number): number {
  if (taxBase <= 0) return 0;
  for (const b of TAX_BRACKETS) {
    if (taxBase <= b.limit) {
      return Math.round(taxBase * b.rate - b.deduction);
    }
  }
  return 0;
}

export default function DividendFinancialTaxGuard() {
  const [dividendIncome, setDividendIncome] = useState<number>(24000000);
  const [otherIncome, setOtherIncome] = useState<number>(45000000);
  const [insuranceType, setInsuranceType] = useState<'dependent' | 'employee' | 'local'>('dependent');
  const [propertyValue, setPropertyValue] = useState<number>(300000000);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const simulation = useMemo(() => {
    const isCompositeTaxTarget = dividendIncome > 20000000;
    const excessDividend = Math.max(0, dividendIncome - 20000000);

    // 1. 소득세 계산
    let standardTax = 0;
    let localTax = 0;
    let totalIncomeTax = 0;

    if (!isCompositeTaxTarget) {
      standardTax = Math.round(dividendIncome * 0.14);
      localTax = Math.round(dividendIncome * 0.014);
      totalIncomeTax = standardTax + localTax;
    } else {
      const combinedBase = otherIncome + dividendIncome;
      const taxOption1 = calculateProgressiveTax(combinedBase);
      const baseDividendTax = Math.round(20000000 * 0.14);
      const taxOption2 = baseDividendTax + calculateProgressiveTax(otherIncome + excessDividend);
      standardTax = Math.max(taxOption1, taxOption2);
      localTax = Math.round(standardTax * 0.1);
      totalIncomeTax = standardTax + localTax;
    }

    // 2. 건강보험료 계산 (2024~2026 합산 요율 8.008%)
    const NHI_RATE = 0.0709 * (1 + 0.1295);
    let isDependentDisqualified = false;
    let additionalNhiYearly = 0;
    let nhiStatusMessage = '';
    let nhiSeverity: 'safe' | 'warning' | 'danger' = 'safe';

    if (insuranceType === 'dependent') {
      if (dividendIncome > 20000000) {
        isDependentDisqualified = true;
        nhiSeverity = 'danger';
        const incomeNhi = Math.round(dividendIncome * NHI_RATE);
        const propertyTaxBase = Math.max(0, propertyValue * 0.6 - 100000000);
        const estimatedPropertyNhi = propertyTaxBase > 0 ? Math.round((propertyTaxBase / 10000000) * 12000 * 12) : 0;
        additionalNhiYearly = incomeNhi + estimatedPropertyNhi;
        nhiStatusMessage = `금융소득 2,000만원 초과로 피부양자 자격이 영구 탈락되어 지역가입자로 강제 전환됩니다! (연간 약 ${Math.round(additionalNhiYearly / 10000)}만원 신규 부담)`;
      } else if (dividendIncome > 10000000) {
        nhiSeverity = 'warning';
        nhiStatusMessage = '금융소득 1,000만원 초과 주의: 2,000만원을 1원이라도 초과 시 피부양자 자격이 즉시 박탈됩니다.';
      } else {
        nhiSeverity = 'safe';
        nhiStatusMessage = '금융소득 1,000만원 이하로 피부양자 자격이 안전하게 유지됩니다.';
      }
    } else if (insuranceType === 'employee') {
      if (excessDividend > 0) {
        nhiSeverity = 'warning';
        additionalNhiYearly = Math.round(excessDividend * NHI_RATE);
        nhiStatusMessage = `직장인 보수외소득 2,000만원 초과로 매월 약 ${Math.round(additionalNhiYearly / 12).toLocaleString()}원의 건보료가 추가 청구됩니다.`;
      } else {
        nhiSeverity = 'safe';
        nhiStatusMessage = '보수외 금융소득 2,000만원 이하로 추가 건보료 0원입니다.';
      }
    } else {
      if (dividendIncome > 10000000) {
        nhiSeverity = 'danger';
        additionalNhiYearly = Math.round(dividendIncome * NHI_RATE);
        nhiStatusMessage = `지역가입자 건보료 절벽: 금융소득 1,000만원 초과 시 초과분이 아닌 전체(${dividendIncome.toLocaleString()}원)에 대해 연 ${Math.round(additionalNhiYearly / 10000)}만원의 건보료가 부과됩니다!`;
      } else {
        nhiSeverity = 'safe';
        nhiStatusMessage = '지역가입자 금융소득 1,000만원 이하로 건보료 부과 대상 소득에서 전액 비과세(0원) 제외됩니다.';
      }
    }

    return {
      isCompositeTaxTarget,
      excessDividend,
      totalIncomeTax,
      isDependentDisqualified,
      additionalNhiYearly,
      nhiStatusMessage,
      nhiSeverity,
      totalBurden: totalIncomeTax + additionalNhiYearly,
    };
  }, [dividendIncome, otherIncome, insuranceType, propertyValue]);

  const copyResult = () => {
    const text = `[OIYO 배당소득 금융종합과세 & 건강보험료 진단]
- 배당/이자소득: ${(dividendIncome / 10000).toLocaleString()}만원
- 금융소득 종합과세: ${simulation.isCompositeTaxTarget ? '⚠️ 2천만원 초과 종합과세 대상' : '✅ 15.4% 분리과세 종결'}
- 예상 소득세액: ${simulation.totalIncomeTax.toLocaleString()}원
- 추가 건보료 부담: 연 ${simulation.additionalNhiYearly.toLocaleString()}원 (월 약 ${Math.round(simulation.additionalNhiYearly / 12).toLocaleString()}원)
- 총 세금 + 건보료: ${simulation.totalBurden.toLocaleString()}원
https://tools.oiyo.net/ko/dividend-financial-tax-guard/`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <CardTitle>배당소득 금융소득종합과세 & 건보료 피부양자 시뮬레이터</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            연간 금융소득 2,000만원 초과 종합과세와 피부양자 탈락 및 지역건보료 1,000만원 절벽 효과를 정밀 계산합니다.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Presets */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground self-center">가입자 유형:</span>
              <Button
                variant={insuranceType === 'dependent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInsuranceType('dependent')}
              >
                건강보험 피부양자 (가족 밑)
              </Button>
              <Button
                variant={insuranceType === 'employee' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInsuranceType('employee')}
              >
                직장가입자 (회사원)
              </Button>
              <Button
                variant={insuranceType === 'local' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInsuranceType('local')}
              >
                지역가입자 (자영업·은퇴자)
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inputs */}
              <div className="space-y-4 border rounded-lg p-4 border-border bg-muted/20">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>금융소득 및 기타소득 설정</span>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dividendIncome" className="text-xs">연간 배당금 및 이자소득 합계 (원)</Label>
                  <Input
                    id="dividendIncome"
                    type="number"
                    value={dividendIncome}
                    step={1000000}
                    onChange={(e) => setDividendIncome(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    2,000만원 이하: 15.4% 원천징수 분리과세 | 2,000만원 초과: 종합과세 및 피부양자 박탈
                  </p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="otherIncome" className="text-xs">기타 종합소득 과세표준 (근로·사업 등, 원)</Label>
                  <Input
                    id="otherIncome"
                    type="number"
                    value={otherIncome}
                    step={1000000}
                    onChange={(e) => setOtherIncome(Number(e.target.value))}
                  />
                </div>
                {insuranceType === 'dependent' && (
                  <div className="space-y-1">
                    <Label htmlFor="propertyValue" className="text-xs">보유 부동산 공시가격 (원, 탈락 대비)</Label>
                    <Input
                      id="propertyValue"
                      type="number"
                      value={propertyValue}
                      step={10000000}
                      onChange={(e) => setPropertyValue(Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">피부양자 탈락 시 지역 건보료 산정 기준이 됩니다.</p>
                  </div>
                )}
              </div>

              {/* Status Explanation */}
              <div className="space-y-4 border rounded-lg p-4 border-border bg-muted/20">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <HeartPulse className="w-4 h-4 text-primary" />
                  <span>건강보험 및 종합과세 위험도</span>
                </div>

                <div className={`p-4 border rounded-md text-xs leading-relaxed space-y-2 ${
                  simulation.nhiSeverity === 'danger'
                    ? 'bg-destructive/10 border-destructive/20 text-destructive'
                    : simulation.nhiSeverity === 'warning'
                    ? 'bg-primary/10 border-primary/20 text-foreground'
                    : 'bg-card border-border text-foreground'
                }`}>
                  <div className="font-semibold flex items-center gap-1.5">
                    {simulation.nhiSeverity === 'danger' ? (
                      <ShieldAlert className="w-4 h-4 text-destructive" />
                    ) : simulation.nhiSeverity === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-primary" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    )}
                    <span>{simulation.nhiStatusMessage}</span>
                  </div>
                  <p className="text-muted-foreground">
                    {insuranceType === 'dependent'
                      ? '피부양자 자격은 2,000만원 초과 즉시 상실되며, 한번 탈락하면 다음 연도 11월 소득자료 갱신 시까지 최소 1년간 지역가입자로 유지됩니다.'
                      : insuranceType === 'local'
                      ? '지역가입자는 금융소득이 1,000만원을 1원이라도 초과하면 전체 금융소득에 대해 연 8.01%의 건보료가 부과됩니다.'
                      : '직장인은 2,000만원 초과분에 대해서만 보수외 소득월액 보험료가 부과되어 상대적으로 부담이 적습니다.'}
                  </p>
                </div>

                <div className="p-3 bg-card border rounded-md border-border text-xs text-muted-foreground space-y-1">
                  <span className="font-semibold text-foreground">💡 금융소득 절세 핵심 팁</span>
                  <p>
                    ISA(개인종합자산관리계좌)를 활용하면 배당소득이 연간 2,000만원 금융소득 한도에 일체 합산되지 않으므로 건보료와 종합과세를 동시에 방어할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Summary Box */}
            <div className="p-6 border rounded-xl border-border bg-card space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-bold text-lg">
                    {simulation.isCompositeTaxTarget ? '⚠️ 금융소득종합과세 합산 대상' : '✅ 15.4% 분리과세 안전 구간'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {simulation.isCompositeTaxTarget
                      ? `2,000만원 초과분(${(simulation.excessDividend / 10000).toLocaleString()}만원)이 타 종합소득과 합산 과세됩니다.`
                      : '금융기관 15.4% 원천징수로 모든 세금 신고 의무가 종결됩니다.'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">총 세금 + 추가 건보료 연간 부담액</span>
                  <p className="text-2xl font-black text-primary">
                    {simulation.totalBurden.toLocaleString()}원
                  </p>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 text-xs border-t border-border">
                <div className="p-2 border rounded border-border bg-muted/10">
                  <span className="text-muted-foreground">예상 소득세(국세+지방세)</span>
                  <p className="font-bold text-sm">{(simulation.totalIncomeTax / 10000).toLocaleString()}만원</p>
                </div>
                <div className="p-2 border rounded border-border bg-muted/10">
                  <span className="text-muted-foreground">추가 연간 건강보험료</span>
                  <p className="font-bold text-sm">{(simulation.additionalNhiYearly / 10000).toLocaleString()}만원</p>
                </div>
                <div className="p-2 border rounded border-border bg-muted/10">
                  <span className="text-muted-foreground">추가 월별 건보료</span>
                  <p className="font-bold text-sm">{Math.round(simulation.additionalNhiYearly / 12).toLocaleString()}원/월</p>
                </div>
                <div className="p-2 border rounded border-border bg-muted/10">
                  <span className="text-muted-foreground">실효 부담률 (배당금 대비)</span>
                  <p className="font-bold text-sm">
                    {dividendIncome > 0 ? ((simulation.totalBurden / dividendIncome) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={copyResult}>
                  {isCopied ? '복사 완료!' : '진단 결과 복사'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
