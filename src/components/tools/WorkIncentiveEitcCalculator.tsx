import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertCircle, Sparkles, Coins, Users, Baby, Wallet } from 'lucide-react';

type HouseholdType = 'single' | 'single_earner' | 'dual_earner';

export default function WorkIncentiveEitcCalculator() {
  const [householdType, setHouseholdType] = useState<HouseholdType>('single_earner');
  const [earnedIncome, setEarnedIncome] = useState<number>(16000000);
  const [childrenCount, setChildrenCount] = useState<number>(1);
  const [totalAssets, setTotalAssets] = useState<number>(120000000);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const calculation = useMemo(() => {
    const isAssetEligible = totalAssets < 240000000;
    const isAssetReduced50 = totalAssets >= 170000000 && totalAssets < 240000000;

    let eitcBase = 0;
    let incomeLimit = 22000000;

    if (householdType === 'single') {
      incomeLimit = 22000000;
      if (earnedIncome < 4000000) {
        eitcBase = Math.round(earnedIncome * (1650000 / 4000000));
      } else if (earnedIncome < 9000000) {
        eitcBase = 1650000;
      } else if (earnedIncome < 22000000) {
        eitcBase = Math.round(1650000 - (earnedIncome - 9000000) * (1650000 / 13000000));
      }
    } else if (householdType === 'single_earner') {
      incomeLimit = 32000000;
      if (earnedIncome < 7000000) {
        eitcBase = Math.round(earnedIncome * (2850000 / 7000000));
      } else if (earnedIncome < 14000000) {
        eitcBase = 2850000;
      } else if (earnedIncome < 32000000) {
        eitcBase = Math.round(2850000 - (earnedIncome - 14000000) * (2850000 / 18000000));
      }
    } else {
      incomeLimit = 44000000;
      if (earnedIncome < 8000000) {
        eitcBase = Math.round(earnedIncome * (3300000 / 8000000));
      } else if (earnedIncome < 17000000) {
        eitcBase = 3300000;
      } else if (earnedIncome < 44000000) {
        eitcBase = Math.round(3300000 - (earnedIncome - 17000000) * (3300000 / 27000000));
      }
    }

    eitcBase = Math.max(0, eitcBase);
    const isEitcIncomeEligible = earnedIncome < incomeLimit;

    let ctcBasePerChild = 0;
    if (childrenCount > 0 && earnedIncome < 70000000) {
      if (householdType === 'single_earner') {
        if (earnedIncome < 21000000) {
          ctcBasePerChild = 1000000;
        } else {
          ctcBasePerChild = Math.round(1000000 - (earnedIncome - 21000000) * (500000 / 49000000));
        }
      } else {
        if (earnedIncome < 25000000) {
          ctcBasePerChild = 1000000;
        } else {
          ctcBasePerChild = Math.round(1000000 - (earnedIncome - 25000000) * (500000 / 45000000));
        }
      }
    }
    const totalCtcBase = Math.max(0, ctcBasePerChild * childrenCount);

    let finalEitc = isAssetEligible && isEitcIncomeEligible ? eitcBase : 0;
    let finalCtc = isAssetEligible ? totalCtcBase : 0;

    if (isAssetReduced50) {
      finalEitc = Math.round(finalEitc * 0.5);
      finalCtc = Math.round(finalCtc * 0.5);
    }

    const totalIncentive = finalEitc + finalCtc;
    const isEligible = isAssetEligible && (finalEitc > 0 || finalCtc > 0);

    return {
      isEligible,
      incomeLimit,
      isAssetEligible,
      isAssetReduced50,
      eitcBase,
      finalEitc,
      totalCtcBase,
      finalCtc,
      totalIncentive,
    };
  }, [householdType, earnedIncome, childrenCount, totalAssets]);

  const copyResult = () => {
    const text = `[OIYO 2026 근로장려금 & 자녀장려금 모의계산 결과]
- 가구 유형: ${householdType === 'single' ? '단독가구' : (householdType === 'single_earner' ? '홑벌이가구' : '맞벌이가구')}
- 총 지급 예상액: ${calculation.totalIncentive.toLocaleString()}원
  * 근로장려금: ${calculation.finalEitc.toLocaleString()}원
  * 자녀장려금: ${calculation.finalCtc.toLocaleString()}원 (부양자녀 ${childrenCount}명)
- 소득: ${(earnedIncome / 10000).toLocaleString()}만원 | 재산: ${(totalAssets / 10000).toLocaleString()}만원
${calculation.isAssetReduced50 ? '⚠️ 재산 1.7억 이상 50% 감액 적용됨' : ''}
https://tools.oiyo.net/ko/work-incentive-eitc-calculator/`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            <CardTitle>2026 근로장려금 · 자녀장려금 모의계산기</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            국세청 2024~2026년 개정 세법(맞벌이 4,400만 확대, 자녀장려금 1인당 100만 증액)을 반영한 맞춤 환급액을 즉시 계산합니다.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Household Type Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={householdType === 'single' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setHouseholdType('single')}
              >
                단독 가구 (연 2,200만 미만)
              </Button>
              <Button
                variant={householdType === 'single_earner' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setHouseholdType('single_earner')}
              >
                홑벌이 가구 (연 3,200만 미만)
              </Button>
              <Button
                variant={householdType === 'dual_earner' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setHouseholdType('dual_earner')}
              >
                맞벌이 가구 (연 4,400만 미만)
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Income and children */}
              <div className="space-y-4 border rounded-lg p-4 border-border bg-muted/20">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span>연간 소득 및 자녀 수</span>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="earnedIncome" className="text-xs">부부합산 연간 총급여액 (근로+사업소득, 원)</Label>
                  <Input
                    id="earnedIncome"
                    type="number"
                    value={earnedIncome}
                    step={1000000}
                    onChange={(e) => setEarnedIncome(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    소득 기준: {householdType === 'single' ? '2,200만원' : (householdType === 'single_earner' ? '3,200만원' : '4,400만원')} 미만
                  </p>
                </div>
                {householdType !== 'single' && (
                  <div className="space-y-1">
                    <Label htmlFor="childrenCount" className="text-xs">18세 미만 부양자녀 수 (자녀장려금)</Label>
                    <Input
                      id="childrenCount"
                      type="number"
                      value={childrenCount}
                      min={0}
                      max={6}
                      onChange={(e) => setChildrenCount(Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">자녀 1인당 최대 100만원 추가 지급 (소득 7천만 미만)</p>
                  </div>
                )}
              </div>

              {/* Assets Check */}
              <div className="space-y-4 border rounded-lg p-4 border-border bg-muted/20">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Users className="w-4 h-4 text-primary" />
                  <span>가구원 합산 재산 요건</span>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="totalAssets" className="text-xs">가구원 합산 총 재산 (주택, 전세, 차량, 예금 등 원)</Label>
                  <Input
                    id="totalAssets"
                    type="number"
                    value={totalAssets}
                    step={10000000}
                    onChange={(e) => setTotalAssets(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    재산 기준: 2억 4,000만원 미만 (1.7억 이상은 50% 감액)
                  </p>
                </div>

                <div className={`p-4 border rounded-md text-xs leading-relaxed space-y-1.5 ${
                  !calculation.isAssetEligible
                    ? 'bg-destructive/10 border-destructive/20 text-destructive'
                    : calculation.isAssetReduced50
                    ? 'bg-primary/10 border-primary/20 text-foreground'
                    : 'bg-card border-border text-foreground'
                }`}>
                  <div className="font-semibold flex items-center gap-1.5">
                    {!calculation.isAssetEligible ? (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    )}
                    <span>
                      {!calculation.isAssetEligible
                        ? '재산 한도(2.4억원) 초과로 지급 제외'
                        : calculation.isAssetReduced50
                        ? '재산 1.7억원 이상으로 장려금 50% 감액 대상'
                        : '재산 1.7억원 미만으로 100% 전액 지급 대상'}
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    재산 산정 시 주택은 공시가격으로 평가되며, 임차 보증금은 간주 전세금(공시가의 55%) 또는 실 보증금 중 적은 금액이 반영됩니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Results Box */}
            <div className="p-6 border rounded-xl border-border bg-card space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-bold text-lg">
                    {calculation.isEligible ? '🎉 근로·자녀장려금 환급 지급 대상입니다!' : '⚠️ 장려금 수급 요건을 확인해 주세요'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {calculation.isEligible
                      ? '국세청 홈택스(5월 정기/9월 반기) 신청 시 계좌로 직접 현금 입금됩니다.'
                      : '소득 상한 초과 또는 재산 2.4억원 초과 여부를 점검하세요.'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">예상 총 환급 수령액</span>
                  <p className="text-2xl font-black text-primary">
                    {calculation.totalIncentive.toLocaleString()}원
                  </p>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 text-xs border-t border-border">
                <div className="p-2 border rounded border-border bg-muted/10">
                  <span className="text-muted-foreground">근로장려금 (최종)</span>
                  <p className="font-bold text-sm">{(calculation.finalEitc / 10000).toLocaleString()}만원</p>
                </div>
                <div className="p-2 border rounded border-border bg-muted/10">
                  <span className="text-muted-foreground">자녀장려금 (최종)</span>
                  <p className="font-bold text-sm">{(calculation.finalCtc / 10000).toLocaleString()}만원</p>
                </div>
                <div className="p-2 border rounded border-border bg-muted/10">
                  <span className="text-muted-foreground">기본 산정 합계</span>
                  <p className="font-bold text-sm">{((calculation.eitcBase + calculation.totalCtcBase) / 10000).toLocaleString()}만원</p>
                </div>
                <div className="p-2 border rounded border-border bg-muted/10">
                  <span className="text-muted-foreground">재산 감액률</span>
                  <p className="font-bold text-sm">{calculation.isAssetReduced50 ? '50% 감액' : '0% (전액)'}</p>
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
