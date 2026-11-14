import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertCircle, Sparkles, Heart, Users, Landmark, Calculator } from 'lucide-react';

const TAX_BRACKETS = [
  { limit: 100000000, rate: 0.10, deduction: 0 },
  { limit: 500000000, rate: 0.20, deduction: 10000000 },
  { limit: 1000000000, rate: 0.30, deduction: 60000000 },
  { limit: 3000000000, rate: 0.40, deduction: 160000000 },
  { limit: Infinity, rate: 0.50, deduction: 460000000 },
];

export default function EstateSpouseDeductionCalculator() {
  const [realEstateValue, setRealEstateValue] = useState<number>(1200000000);
  const [netFinancialAssets, setNetFinancialAssets] = useState<number>(300000000);
  const [childrenCount, setChildrenCount] = useState<number>(2);
  const [hasSpouse, setHasSpouse] = useState<boolean>(true);
  const [spouseActualInherited, setSpouseActualInherited] = useState<number>(600000000);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const result = useMemo(() => {
    const totalEstateValue = realEstateValue + netFinancialAssets;
    const lumpSumDeduction = (hasSpouse || childrenCount > 0) ? 500000000 : 200000000;

    let spouseDeduction = 0;
    let spouseStatutoryLimit = 0;
    let spouseShareRatio = 0;

    if (hasSpouse) {
      const totalShares = 1.5 + (childrenCount * 1.0);
      spouseShareRatio = 1.5 / totalShares;
      spouseStatutoryLimit = Math.min(3000000000, Math.round(totalEstateValue * spouseShareRatio));

      if (spouseActualInherited <= 0) {
        spouseDeduction = 500000000;
      } else {
        const allowedShare = Math.min(spouseActualInherited, spouseStatutoryLimit);
        spouseDeduction = Math.max(500000000, allowedShare);
      }
    }

    let financialDeduction = 0;
    if (netFinancialAssets > 0) {
      if (netFinancialAssets <= 20000000) {
        financialDeduction = netFinancialAssets;
      } else if (netFinancialAssets <= 100000000) {
        financialDeduction = 20000000;
      } else {
        financialDeduction = Math.min(200000000, Math.round(netFinancialAssets * 0.20));
      }
    }

    const totalDeductions = lumpSumDeduction + spouseDeduction + financialDeduction;
    const taxBase = Math.max(0, totalEstateValue - totalDeductions);

    let calculatedTax = 0;
    if (taxBase > 0) {
      for (const b of TAX_BRACKETS) {
        if (taxBase <= b.limit) {
          calculatedTax = Math.round(taxBase * b.rate - b.deduction);
          break;
        }
      }
    }

    const reportCredit = Math.round(calculatedTax * 0.03);
    const finalTax = Math.max(0, calculatedTax - reportCredit);

    return {
      totalEstateValue,
      lumpSumDeduction,
      spouseDeduction,
      spouseStatutoryLimit,
      spouseShareRatio,
      financialDeduction,
      totalDeductions,
      taxBase,
      calculatedTax,
      reportCredit,
      finalTax,
      isFullyExempt: finalTax === 0,
    };
  }, [realEstateValue, netFinancialAssets, childrenCount, hasSpouse, spouseActualInherited]);

  const copyResult = () => {
    const text = `[OIYO 상속세 배우자 및 금융공제 계산 결과]
- 총 상속재산: ${(result.totalEstateValue / 100000000).toFixed(2)}억원 (부동산 ${(realEstateValue / 100000000).toFixed(2)}억 + 금융 ${(netFinancialAssets / 100000000).toFixed(2)}억)
- 상속세 총 공제액: ${(result.totalDeductions / 100000000).toFixed(2)}억원
  * 일괄공제: 5.00억원
  * 배우자 상속공제: ${(result.spouseDeduction / 100000000).toFixed(2)}억원 (최소 5억~최대 30억)
  * 금융재산 상속공제: ${(result.financialDeduction / 10000).toLocaleString()}만원 (최대 2억)
- 과세표준: ${(result.taxBase / 10000).toLocaleString()}만원
- 최종 납부 상속세: ${result.isFullyExempt ? '전액 면세 (0원)' : `${result.finalTax.toLocaleString()}원`}
https://tools.oiyo.net/ko/estate-spouse-deduction-calculator/`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            <CardTitle>상속세 배우자 상속공제(5억~30억) & 금융공제 계산기</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            상속세 및 증여세법 기준 일괄공제(5억), 배우자 실제 상속액 기준 공제(최소 5억~최대 30억) 및 금융재산 20% 공제(최대 2억)를 정밀 계산합니다.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assets inputs */}
              <div className="space-y-4 border rounded-lg p-4 border-border bg-muted/20">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Landmark className="w-4 h-4 text-primary" />
                  <span>1. 상속 재산가액 설정</span>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="realEstateValue" className="text-xs">부동산(아파트, 토지 등) 평가액 (원)</Label>
                  <Input
                    id="realEstateValue"
                    type="number"
                    value={realEstateValue}
                    step={50000000}
                    onChange={(e) => setRealEstateValue(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">시가(유사매매사례가) 또는 공시가격 기준</p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="netFinancialAssets" className="text-xs">순금융재산 (예금/주식 - 금융부채, 원)</Label>
                  <Input
                    id="netFinancialAssets"
                    type="number"
                    value={netFinancialAssets}
                    step={10000000}
                    onChange={(e) => setNetFinancialAssets(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">20% 상속공제 적용 (최대 2억원 한도)</p>
                </div>
              </div>

              {/* Family members inputs */}
              <div className="space-y-4 border rounded-lg p-4 border-border bg-muted/20">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Users className="w-4 h-4 text-primary" />
                  <span>2. 상속인 구성 및 실제 상속분</span>
                </div>
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="spouseCheck"
                      checked={hasSpouse}
                      onChange={(e) => setHasSpouse(e.target.checked)}
                      className="rounded border-border text-primary"
                    />
                    <Label htmlFor="spouseCheck" className="text-xs cursor-pointer">
                      배우자가 생존하여 상속에 참여합니다 (최소 5억 보장)
                    </Label>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="childrenCount" className="text-xs">자녀 수 (명)</Label>
                    <Input
                      id="childrenCount"
                      type="number"
                      value={childrenCount}
                      min={0}
                      max={6}
                      onChange={(e) => setChildrenCount(Number(e.target.value))}
                    />
                  </div>

                  {hasSpouse && (
                    <div className="space-y-1 pt-1">
                      <Label htmlFor="spouseActualInherited" className="text-xs">배우자 실제 상속 예정 금액 (원)</Label>
                      <Input
                        id="spouseActualInherited"
                        type="number"
                        value={spouseActualInherited}
                        step={50000000}
                        onChange={(e) => setSpouseActualInherited(Number(e.target.value))}
                      />
                      <p className="text-xs text-muted-foreground">
                        법정 상속지분 한도: {(result.spouseStatutoryLimit / 100000000).toFixed(2)}억원 (최대 30억)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Results Box */}
            <div className="p-6 border rounded-xl border-border bg-card space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-bold text-lg">
                    {result.isFullyExempt
                      ? '🎉 상속세 면세점 이하로 상속세 전액 0원입니다!'
                      : '✨ 상속세 모의 산출세액 결과'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {result.isFullyExempt
                      ? `총 공제액(${(result.totalDeductions / 100000000).toFixed(2)}억원)이 상속재산보다 커서 세금이 부과되지 않습니다.`
                      : '일괄공제, 배우자공제 및 금융공제가 전액 차감된 최종 납부세액입니다.'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">최종 납부할 상속세</span>
                  <p className="text-2xl font-black text-primary">
                    {result.finalTax.toLocaleString()}원
                  </p>
                </div>
              </div>

              {/* Deductions Breakdown Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 text-xs border-t border-border">
                <div className="p-2 border rounded border-border bg-muted/10">
                  <span className="text-muted-foreground">기본 일괄공제</span>
                  <p className="font-bold text-sm">{(result.lumpSumDeduction / 100000000).toFixed(2)}억원</p>
                </div>
                <div className="p-2 border rounded border-border bg-muted/10">
                  <span className="text-muted-foreground">배우자 상속공제</span>
                  <p className="font-bold text-sm text-primary">{(result.spouseDeduction / 100000000).toFixed(2)}억원</p>
                </div>
                <div className="p-2 border rounded border-border bg-muted/10">
                  <span className="text-muted-foreground">금융재산 상속공제</span>
                  <p className="font-bold text-sm">{(result.financialDeduction / 10000).toLocaleString()}만원</p>
                </div>
                <div className="p-2 border rounded border-border bg-muted/10">
                  <span className="text-muted-foreground">상속세 과세표준</span>
                  <p className="font-bold text-sm">{(result.taxBase / 10000).toLocaleString()}만원</p>
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
