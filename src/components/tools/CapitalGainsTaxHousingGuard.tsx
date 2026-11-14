import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, AlertCircle, ShieldCheck, Home, FileText, Calculator } from 'lucide-react';

type CaseType = 'single' | 'temporary_2house' | 'inherited_general_first' | 'inherited_first';

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

export default function CapitalGainsTaxHousingGuard() {
  const [salePrice, setSalePrice] = useState<number>(1400000000);
  const [acquisitionPrice, setAcquisitionPrice] = useState<number>(800000000);
  const [expenses, setExpenses] = useState<number>(30000000);
  const [holdingYears, setHoldingYears] = useState<number>(5);
  const [residenceYears, setResidenceYears] = useState<number>(4);
  const [caseType, setCaseType] = useState<CaseType>('temporary_2house');
  const [firstHousePast1Year, setFirstHousePast1Year] = useState<boolean>(true);
  const [within3Years, setWithin3Years] = useState<boolean>(true);
  const [isSeparateHouseholdInheritance, setIsSeparateHouseholdInheritance] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const calculation = useMemo(() => {
    const totalGain = Math.max(0, salePrice - acquisitionPrice - expenses);

    let isExemptEligible = false;
    let exemptionReason = '';
    const conditions: { title: string; passed: boolean; note: string }[] = [];

    if (caseType === 'single') {
      const holdPass = holdingYears >= 2;
      conditions.push({
        title: '보유 기간 2년 이상',
        passed: holdPass,
        note: holdPass ? '2년 이상 보유 요건 충족' : '2년 미만 보유로 비과세 불가',
      });
      isExemptEligible = holdPass;
      exemptionReason = isExemptEligible
        ? '1세대 1주택 비과세 요건(12억원 한도)을 충족하였습니다.'
        : '2년 미만 보유하여 비과세 대상에서 제외됩니다.';
    } else if (caseType === 'temporary_2house') {
      conditions.push({
        title: '신규주택 취득 시기 (종전주택 취득 1년 이상 경과 후)',
        passed: firstHousePast1Year,
        note: firstHousePast1Year ? '종전주택 1년 경과 요건 충족' : '1년 미만 내 취득 시 투기로 간주되어 특례 제외',
      });
      conditions.push({
        title: '신규주택 취득일로부터 3년 이내 종전주택 양도',
        passed: within3Years,
        note: within3Years ? '3년 이내 양도 기한 충족' : '3년 경과 시 일반 2주택 과세',
      });
      conditions.push({
        title: '종전주택 2년 이상 보유 요건',
        passed: holdingYears >= 2,
        note: holdingYears >= 2 ? '종전주택 2년 보유 충족' : '2년 미만 보유',
      });

      isExemptEligible = firstHousePast1Year && within3Years && holdingYears >= 2;
      exemptionReason = isExemptEligible
        ? '일시적 1세대 2주택 비과세 특례(1-2-3 법칙) 충족!'
        : '일시적 2주택 비과세 요건 중 미충족 항목이 있어 정상 과세 대상입니다.';
    } else if (caseType === 'inherited_general_first') {
      conditions.push({
        title: '별도 세대 피상속인으로부터 상속',
        passed: isSeparateHouseholdInheritance,
        note: isSeparateHouseholdInheritance ? '별도세대 상속 인정' : '동일세대 상속 시 특례 제한',
      });
      conditions.push({
        title: '기존 일반주택 먼저 양도 (상속주택 주택수 제외)',
        passed: true,
        note: '상속주택은 주택 수에서 제외되어 일반주택이 1주택으로 비과세 인정',
      });
      conditions.push({
        title: '일반주택 2년 이상 보유 요건',
        passed: holdingYears >= 2,
        note: holdingYears >= 2 ? '2년 이상 보유 충족' : '보유기간 미달',
      });

      isExemptEligible = isSeparateHouseholdInheritance && holdingYears >= 2;
      exemptionReason = isExemptEligible
        ? '상속주택 특례: 상속주택이 주택 수에서 완전 제외되어 기존 주택 12억 비과세가 적용됩니다.'
        : '상속 특례 요건 미충족으로 과세 대상입니다.';
    } else {
      conditions.push({
        title: '상속주택을 일반주택보다 먼저 양도',
        passed: false,
        note: '상속주택 자체를 먼저 양도하는 경우에는 비과세 특례가 적용되지 않습니다.',
      });
      isExemptEligible = false;
      exemptionReason = '상속주택을 기존 일반주택보다 먼저 매각할 때는 비과세 특례가 적용되지 않고 정상 과세됩니다.';
    }

    let taxableGain = 0;
    let longTermDeductionRate = 0;
    let longTermDeduction = 0;
    let standardTax = 0;
    let localIncomeTax = 0;
    let totalTax = 0;

    if (isExemptEligible) {
      if (salePrice <= 1200000000) {
        taxableGain = 0;
        totalTax = 0;
      } else {
        const taxableRatio = (salePrice - 1200000000) / salePrice;
        const initialTaxableGain = Math.round(totalGain * taxableRatio);

        const holdRate = Math.min(0.40, Math.max(0, holdingYears >= 3 ? holdingYears * 0.04 : 0));
        const resRate = Math.min(0.40, Math.max(0, residenceYears >= 2 ? residenceYears * 0.04 : 0));
        longTermDeductionRate = holdRate + resRate;
        longTermDeduction = Math.round(initialTaxableGain * longTermDeductionRate);

        const netIncome = Math.max(0, initialTaxableGain - longTermDeduction);
        const taxBase = Math.max(0, netIncome - 2500000);
        taxableGain = taxBase;

        for (const bracket of TAX_BRACKETS) {
          if (taxBase <= bracket.limit) {
            standardTax = Math.max(0, Math.round(taxBase * bracket.rate - bracket.deduction));
            break;
          }
        }
        localIncomeTax = Math.round(standardTax * 0.1);
        totalTax = standardTax + localIncomeTax;
      }
    } else {
      longTermDeductionRate = Math.min(0.30, Math.max(0, holdingYears >= 3 ? holdingYears * 0.02 : 0));
      longTermDeduction = Math.round(totalGain * longTermDeductionRate);
      const taxBase = Math.max(0, totalGain - longTermDeduction - 2500000);
      taxableGain = taxBase;

      for (const bracket of TAX_BRACKETS) {
        if (taxBase <= bracket.limit) {
          standardTax = Math.max(0, Math.round(taxBase * bracket.rate - bracket.deduction));
          break;
        }
      }
      localIncomeTax = Math.round(standardTax * 0.1);
      totalTax = standardTax + localIncomeTax;
    }

    return {
      totalGain,
      isExemptEligible,
      exemptionReason,
      conditions,
      taxableGain,
      longTermDeductionRate,
      longTermDeduction,
      standardTax,
      localIncomeTax,
      totalTax,
    };
  }, [salePrice, acquisitionPrice, expenses, holdingYears, residenceYears, caseType, firstHousePast1Year, within3Years, isSeparateHouseholdInheritance]);

  const copyResult = () => {
    const text = `[OIYO 주택 양도소득세 비과세 특례 진단 결과]
- 신청 유형: ${caseType}
- 판정: ${calculation.isExemptEligible ? '✅ 1세대 1주택 비과세 특례 충족' : '❌ 과세 대상'}
- 양도가액: ${(salePrice / 100000000).toFixed(2)}억원 | 취득가액: ${(acquisitionPrice / 100000000).toFixed(2)}억원
- 총 양도차익: ${(calculation.totalGain / 10000).toLocaleString()}만원
- 최종 납부세액: ${calculation.totalTax.toLocaleString()}원
https://tools.oiyo.net/ko/capital-gains-tax-housing-guard/`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            <CardTitle>1세대 1주택 · 일시적 2주택 · 상속주택 양도세 비과세 계산기</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            소득세법 시행령 제155조 특례(일시적 2주택 3년 처분, 상속주택 주택수 제외, 12억 고가주택 안분계산)를 원클릭 진단합니다.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Case Type Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                variant={caseType === 'single' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCaseType('single')}
              >
                1세대 1주택 기본
              </Button>
              <Button
                variant={caseType === 'temporary_2house' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCaseType('temporary_2house')}
              >
                일시적 1세대 2주택
              </Button>
              <Button
                variant={caseType === 'inherited_general_first' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCaseType('inherited_general_first')}
              >
                상속 후 일반주택 양도
              </Button>
              <Button
                variant={caseType === 'inherited_first' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCaseType('inherited_first')}
              >
                상속주택 먼저 양도
              </Button>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price Inputs */}
            <div className="space-y-4 border rounded-lg p-4 border-border bg-muted/20">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Calculator className="w-4 h-4 text-primary" />
                <span>주택 거래 금액 및 보유 기간</span>
              </div>
              <div className="space-y-1">
                <Label htmlFor="salePrice" className="text-xs">양도 예상 가액 (매도가액, 원)</Label>
                <Input
                  id="salePrice"
                  type="number"
                  value={salePrice}
                  step={10000000}
                  onChange={(e) => setSalePrice(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">12억원 이하는 비과세 적용 시 세액 0원</p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="acquisitionPrice" className="text-xs">취득가액 (매수가액, 원)</Label>
                <Input
                  id="acquisitionPrice"
                  type="number"
                  value={acquisitionPrice}
                  step={10000000}
                  onChange={(e) => setAcquisitionPrice(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="expenses" className="text-xs">필요경비 (취득세, 중개보수, 샷시 등 원)</Label>
                <Input
                  id="expenses"
                  type="number"
                  value={expenses}
                  step={1000000}
                  onChange={(e) => setExpenses(Number(e.target.value))}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
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
                </div>
                <div className="space-y-1">
                  <Label htmlFor="residenceYears" className="text-xs">실제 거주 기간 (년)</Label>
                  <Input
                    id="residenceYears"
                    type="number"
                    value={residenceYears}
                    min={0}
                    max={50}
                    onChange={(e) => setResidenceYears(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Special Conditions Check */}
            <div className="space-y-4 border rounded-lg p-4 border-border bg-muted/20">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>비과세 특례 심사 조건</span>
              </div>

              {caseType === 'temporary_2house' && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="past1year"
                      checked={firstHousePast1Year}
                      onChange={(e) => setFirstHousePast1Year(e.target.checked)}
                      className="rounded border-border text-primary"
                    />
                    <Label htmlFor="past1year" className="text-xs cursor-pointer">
                      종전주택 취득 후 1년 이상 경과 후 신규주택 취득함
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="within3y"
                      checked={within3Years}
                      onChange={(e) => setWithin3Years(e.target.checked)}
                      className="rounded border-border text-primary"
                    />
                    <Label htmlFor="within3y" className="text-xs cursor-pointer">
                      신규주택 취득일로부터 3년 이내에 종전주택을 양도함
                    </Label>
                  </div>
                  <div className="p-3 bg-card border rounded-md border-border text-xs text-muted-foreground leading-relaxed">
                    💡 2023년 시행령 개정으로 종전 2년이었던 처분 기한이 <strong>3년으로 영구 완화</strong>되어 3년 이내 양도 시 1세대 1주택 비과세가 유지됩니다.
                  </div>
                </div>
              )}

              {caseType === 'inherited_general_first' && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sepInh"
                      checked={isSeparateHouseholdInheritance}
                      onChange={(e) => setIsSeparateHouseholdInheritance(e.target.checked)}
                      className="rounded border-border text-primary"
                    />
                    <Label htmlFor="sepInh" className="text-xs cursor-pointer">
                      상속 당시 돌아가신 분(피상속인)과 별도 세대였음
                    </Label>
                  </div>
                  <div className="p-3 bg-card border rounded-md border-border text-xs text-muted-foreground leading-relaxed">
                    💡 <strong>황금 매각 순서:</strong> 상속주택과 기존 보유주택이 있을 때는 <strong>기존 일반주택을 먼저 매각</strong>해야 상속주택이 주택수에서 제외되어 비과세 혜택을 받습니다.
                  </div>
                </div>
              )}

              {caseType === 'inherited_first' && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-xs text-destructive space-y-2">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>주의: 상속주택 선 매각 시 비과세 특례 불가</span>
                  </div>
                  <p className="leading-relaxed">
                    상속받은 주택을 기존 일반주택보다 먼저 매도하면 세법상 비과세 특례를 적용받지 못하며 2주택 일반 과세 대상이 됩니다.
                  </p>
                </div>
              )}

              {caseType === 'single' && (
                <div className="p-4 bg-card border rounded-md border-border text-xs text-muted-foreground space-y-2">
                  <span className="font-semibold text-foreground">1세대 1주택 비과세 요건:</span>
                  <p className="leading-relaxed">
                    양도일 현재 1주택을 보유하고 보유기간이 2년 이상이어야 합니다. 2017년 8월 3일 이후 조정대상지역 소재 주택을 취득한 경우 2년 이상 거주 요건도 충족해야 합니다.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="p-6 border rounded-xl border-border bg-card space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {calculation.isExemptEligible ? (
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                ) : (
                  <XCircle className="w-6 h-6 text-destructive" />
                )}
                <div>
                  <h3 className="font-bold text-lg">
                    {calculation.isExemptEligible
                      ? (salePrice <= 1200000000 ? '🎉 양도소득세 0원 전액 비과세!' : '✨ 12억원 초과 고가주택 특례 세액')
                      : '⚠️ 양도소득세 과세 대상'}
                  </h3>
                  <p className="text-xs text-muted-foreground">{calculation.exemptionReason}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground">총 납부할 양도세액 (지방소득세 포함)</span>
                <p className="text-2xl font-black text-primary">
                  {calculation.totalTax.toLocaleString()}원
                </p>
              </div>
            </div>

            {/* Condition Check Row */}
            <div className="space-y-2 pt-2 border-t border-border">
              {calculation.conditions.map((cond, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-border bg-muted/20 text-xs">
                  <div className="flex items-center gap-2">
                    {cond.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    )}
                    <span>{cond.title}</span>
                  </div>
                  <span className={cond.passed ? 'font-semibold text-primary' : 'font-semibold text-destructive'}>
                    {cond.note}
                  </span>
                </div>
              ))}
            </div>

            {/* Tax Breakdown Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 text-xs">
              <div className="p-2 border rounded border-border bg-muted/10">
                <span className="text-muted-foreground">총 양도차익</span>
                <p className="font-bold text-sm">{(calculation.totalGain / 10000).toLocaleString()}만원</p>
              </div>
              <div className="p-2 border rounded border-border bg-muted/10">
                <span className="text-muted-foreground">장기보유특별공제</span>
                <p className="font-bold text-sm">{(calculation.longTermDeductionRate * 100).toFixed(0)}% ({(calculation.longTermDeduction / 10000).toLocaleString()}만)</p>
              </div>
              <div className="p-2 border rounded border-border bg-muted/10">
                <span className="text-muted-foreground">양도소득 국세</span>
                <p className="font-bold text-sm">{(calculation.standardTax / 10000).toLocaleString()}만원</p>
              </div>
              <div className="p-2 border rounded border-border bg-muted/10">
                <span className="text-muted-foreground">지방소득세 (10%)</span>
                <p className="font-bold text-sm">{(calculation.localIncomeTax / 10000).toLocaleString()}만원</p>
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
