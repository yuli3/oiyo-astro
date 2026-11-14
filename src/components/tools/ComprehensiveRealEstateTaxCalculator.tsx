import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertCircle, Sparkles, Building, Landmark, Percent } from 'lucide-react';

const TAX_BRACKETS = [
  { limit: 300000000, rate: 0.005, deduction: 0 },
  { limit: 600000000, rate: 0.007, deduction: 600000 },
  { limit: 1200000000, rate: 0.010, deduction: 2400000 },
  { limit: 2500000000, rate: 0.013, deduction: 6000000 },
  { limit: 5000000000, rate: 0.015, deduction: 11000000 },
  { limit: 9400000000, rate: 0.020, deduction: 36000000 },
  { limit: Infinity, rate: 0.027, deduction: 101800000 },
];

export default function ComprehensiveRealEstateTaxCalculator() {
  const [officialPrice, setOfficialPrice] = useState<number>(1600000000);
  const [isSingle1Home, setIsSingle1Home] = useState<boolean>(true);
  const [ownerAge, setOwnerAge] = useState<number>(66);
  const [holdingYears, setHoldingYears] = useState<number>(11);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const taxResult = useMemo(() => {
    const basicDeduction = isSingle1Home ? 1200000000 : 900000000;
    const taxableExcess = Math.max(0, officialPrice - basicDeduction);
    const fairMarketRatio = 0.60;
    const taxBase = Math.round(taxableExcess * fairMarketRatio);

    if (taxBase <= 0) {
      return {
        basicDeduction,
        taxBase: 0,
        calculatedTax: 0,
        propertyTaxDeduction: 0,
        netTaxBeforeCredit: 0,
        ageCreditRate: 0,
        holdingCreditRate: 0,
        totalCreditRate: 0,
        taxCreditAmount: 0,
        finalNht: 0,
        ruralSpecialTax: 0,
        totalPayable: 0,
        isExempt: true,
      };
    }

    let calculatedTax = 0;
    for (const b of TAX_BRACKETS) {
      if (taxBase <= b.limit) {
        calculatedTax = Math.max(0, Math.round(taxBase * b.rate - b.deduction));
        break;
      }
    }

    const propertyTaxDeduction = Math.round(taxBase * 0.0035);
    const netTaxBeforeCredit = Math.max(0, calculatedTax - propertyTaxDeduction);

    let ageCreditRate = 0;
    let holdingCreditRate = 0;

    if (isSingle1Home) {
      if (ownerAge >= 70) ageCreditRate = 0.40;
      else if (ownerAge >= 65) ageCreditRate = 0.30;
      else if (ownerAge >= 60) ageCreditRate = 0.20;

      if (holdingYears >= 15) holdingCreditRate = 0.50;
      else if (holdingYears >= 10) holdingCreditRate = 0.40;
      else if (holdingYears >= 5) holdingCreditRate = 0.20;
    }

    const totalCreditRate = Math.min(0.80, ageCreditRate + holdingCreditRate);
    const taxCreditAmount = Math.round(netTaxBeforeCredit * totalCreditRate);
    const finalNht = Math.max(0, netTaxBeforeCredit - taxCreditAmount);
    const ruralSpecialTax = Math.round(finalNht * 0.20);
    const totalPayable = finalNht + ruralSpecialTax;

    return {
      basicDeduction,
      taxBase,
      calculatedTax,
      propertyTaxDeduction,
      netTaxBeforeCredit,
      ageCreditRate,
      holdingCreditRate,
      totalCreditRate,
      taxCreditAmount,
      finalNht,
      ruralSpecialTax,
      totalPayable,
      isExempt: totalPayable === 0,
    };
  }, [officialPrice, isSingle1Home, ownerAge, holdingYears]);

  const copyResult = () => {
    const text = `[OIYO 종합부동산세(종부세) 계산 결과]
- 주택 공시가격: ${(officialPrice / 100000000).toFixed(2)}억원 (${isSingle1Home ? '1세대 1주택' : '다주택'})
- 기본공제: ${(taxResult.basicDeduction / 100000000).toFixed(0)}억원 | 과세표준: ${(taxResult.taxBase / 10000).toLocaleString()}만원
- 1주택 세액공제: ${(taxResult.totalCreditRate * 100).toFixed(0)}% (고령 ${(taxResult.ageCreditRate * 100).toFixed(0)}% + 장특 ${(taxResult.holdingCreditRate * 100).toFixed(0)}%)
- 최종 납부 종부세: ${taxResult.totalPayable.toLocaleString()}원 (농특세 포함)
https://tools.oiyo.net/ko/comprehensive-real-estate-tax-calculator/`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            <CardTitle>종합부동산세(종부세) 1세대 1주택 & 80% 세액공제 계산기</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            2024~2026년 종부세법(1주택 12억 기본공제, 공정시장가액비율 60%, 고령·장기보유 최대 80% 공제)을 반영합니다.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 1Home toggle */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground self-center">주택 소유 구분:</span>
              <Button
                variant={isSingle1Home ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsSingle1Home(true)}
              >
                1세대 1주택자 (12억원 공제 + 최대 80% 세액공제)
              </Button>
              <Button
                variant={!isSingle1Home ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsSingle1Home(false)}
              >
                다주택자 (9억원 기본공제)
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inputs */}
              <div className="space-y-4 border rounded-lg p-4 border-border bg-muted/20">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Landmark className="w-4 h-4 text-primary" />
                  <span>주택 공시가격 및 보유 기간</span>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="officialPrice" className="text-xs">주택 공시가격 합계액 (원)</Label>
                  <Input
                    id="officialPrice"
                    type="number"
                    value={officialPrice}
                    step={10000000}
                    onChange={(e) => setOfficialPrice(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    국토교통부 부동산공시가격알리미 기준 합산 공시가액 (12억원 이하는 0원 비과세)
                  </p>
                </div>

                {isSingle1Home && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="space-y-1">
                      <Label htmlFor="ownerAge" className="text-xs">소유자 만 나이</Label>
                      <Input
                        id="ownerAge"
                        type="number"
                        value={ownerAge}
                        min={20}
                        max={100}
                        onChange={(e) => setOwnerAge(Number(e.target.value))}
                      />
                      <p className="text-xs text-muted-foreground">만 60세 이상 20~40% 공제</p>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="holdingYears" className="text-xs">보유 기간 (년)</Label>
                      <Input
                        id="holdingYears"
                        type="number"
                        value={holdingYears}
                        min={0}
                        max={50}
                        onChange={(e) => setHoldingYears(Number(e.target.value))}
                      />
                      <p className="text-xs text-muted-foreground">5년 이상 20~50% 공제</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Deduction explanation */}
              <div className="space-y-4 border rounded-lg p-4 border-border bg-muted/20">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Percent className="w-4 h-4 text-primary" />
                  <span>세액공제 적용 현황</span>
                </div>
                <div className="p-3 bg-card border rounded-md border-border text-xs text-muted-foreground leading-relaxed space-y-2">
                  <div className="flex justify-between items-center pb-1 border-b border-border">
                    <span>1세대 1주택 기본공제</span>
                    <span className="font-semibold text-foreground">{(taxResult.basicDeduction / 100000000).toFixed(0)}억원</span>
                  </div>
                  <div className="flex justify-between items-center pb-1 border-b border-border">
                    <span>공정시장가액비율</span>
                    <span className="font-semibold text-foreground">60%</span>
                  </div>
                  {isSingle1Home && (
                    <>
                      <div className="flex justify-between items-center pb-1 border-b border-border">
                        <span>고령자 세액공제 (만 {ownerAge}세)</span>
                        <span className="font-semibold text-primary">{(taxResult.ageCreditRate * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between items-center pb-1 border-b border-border">
                        <span>장기보유 세액공제 ({holdingYears}년)</span>
                        <span className="font-semibold text-primary">{(taxResult.holdingCreditRate * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 font-bold text-foreground">
                        <span>합산 세액공제율 (최대 80%)</span>
                        <span className="text-primary">{(taxResult.totalCreditRate * 100).toFixed(0)}%</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Results Box */}
            <div className="p-6 border rounded-xl border-border bg-card space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-bold text-lg">
                    {taxResult.isExempt
                      ? '🎉 종합부동산세 납부 대상이 아닙니다 (0원 전액 비과세)!'
                      : '✨ 종합부동산세 계산 결과'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {taxResult.isExempt
                      ? `공시가격이 기본공제(${(taxResult.basicDeduction / 100000000).toFixed(0)}억원) 이하이므로 종부세가 부과되지 않습니다.`
                      : '재산세 이중과세 공제 및 1주택 고령·장기보유 세액공제가 모두 반영된 실납부액입니다.'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">총 납부할 종합부동산세</span>
                  <p className="text-2xl font-black text-primary">
                    {taxResult.totalPayable.toLocaleString()}원
                  </p>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 text-xs border-t border-border">
                <div className="p-2 border rounded border-border bg-muted/10">
                  <span className="text-muted-foreground">과세표준 (공시가 60%)</span>
                  <p className="font-bold text-sm">{(taxResult.taxBase / 10000).toLocaleString()}만원</p>
                </div>
                <div className="p-2 border rounded border-border bg-muted/10">
                  <span className="text-muted-foreground">재산세 이중과세 공제</span>
                  <p className="font-bold text-sm">-{(taxResult.propertyTaxDeduction / 10000).toLocaleString()}만원</p>
                </div>
                <div className="p-2 border rounded border-border bg-muted/10">
                  <span className="text-muted-foreground">1주택 세액공제 ({(taxResult.totalCreditRate * 100).toFixed(0)}%)</span>
                  <p className="font-bold text-sm">-{(taxResult.taxCreditAmount / 10000).toLocaleString()}만원</p>
                </div>
                <div className="p-2 border rounded border-border bg-muted/10">
                  <span className="text-muted-foreground">농어촌특별세 (20%)</span>
                  <p className="font-bold text-sm">{(taxResult.ruralSpecialTax / 10000).toLocaleString()}만원</p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex justify-end gap-2 pt-2">
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
