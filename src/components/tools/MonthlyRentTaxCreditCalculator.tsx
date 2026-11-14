import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertCircle, Sparkles, Home, Receipt, Calculator, Percent } from 'lucide-react';

export default function MonthlyRentTaxCreditCalculator() {
  const [monthlyRent, setMonthlyRent] = useState<number>(700000);
  const [annualSalary, setAnnualSalary] = useState<number>(48000000);
  const [isHomeowner, setIsHomeowner] = useState<boolean>(false);
  const [isRegisteredAddress, setIsRegisteredAddress] = useState<boolean>(true);
  const [houseSizePassed, setHouseSizePassed] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const result = useMemo(() => {
    const totalAnnualRent = monthlyRent * 12;
    const eligibleRentLimit = Math.min(totalAnnualRent, 10000000);

    const isSalaryEligible = annualSalary <= 80000000;
    const isTaxCreditEligible = !isHomeowner && isRegisteredAddress && houseSizePassed && isSalaryEligible;

    let taxCreditRate = 0;
    let taxCreditRefund = 0;

    if (isTaxCreditEligible) {
      taxCreditRate = annualSalary <= 55000000 ? 0.17 : 0.15;
      taxCreditRefund = Math.round(eligibleRentLimit * taxCreditRate);
    }

    let marginalRate = 0.066;
    if (annualSalary > 88000000) marginalRate = 0.385;
    else if (annualSalary > 50000000) marginalRate = 0.264;
    else if (annualSalary > 14000000) marginalRate = 0.165;

    const incomeDeductionAmount = Math.round(totalAnnualRent * 0.30);
    const cashReceiptRefund = Math.round(incomeDeductionAmount * marginalRate);

    let recommendation = '';
    if (isTaxCreditEligible) {
      const advantage = taxCreditRefund - cashReceiptRefund;
      recommendation = `월세 세액공제(최대 1,000만 한도) 자격을 충족하여 현금영수증 소득공제 대비 연간 ${advantage.toLocaleString()}원 더 많은 환급을 받습니다!`;
    } else {
      recommendation = `월세 세액공제 요건 미달(무주택·총급여 8,000만원 등)이나, 홈택스 주택임차료 현금영수증 신청으로 연간 약 ${cashReceiptRefund.toLocaleString()}원의 소득공제 절세가 가능합니다.`;
    }

    return {
      totalAnnualRent,
      eligibleRentLimit,
      isTaxCreditEligible,
      taxCreditRate,
      taxCreditRefund,
      cashReceiptRefund,
      recommendation,
      isSalaryEligible,
    };
  }, [monthlyRent, annualSalary, isHomeowner, isRegisteredAddress, houseSizePassed]);

  const copyResult = () => {
    const text = `[OIYO 연말정산 월세 세액공제 vs 소득공제 비교]
- 월세: 월 ${monthlyRent.toLocaleString()}원 (연간 ${(result.totalAnnualRent / 10000).toLocaleString()}만원)
- 총급여: ${(annualSalary / 10000).toLocaleString()}만원
- 1. 월세 세액공제 예상 환급: ${result.isTaxCreditEligible ? `${result.taxCreditRefund.toLocaleString()}원 (${(result.taxCreditRate * 100).toFixed(0)}%)` : '자격 미달 (0원)'}
- 2. 현금영수증 소득공제 환급: ${result.cashReceiptRefund.toLocaleString()}원 (30% 소득공제)
- 추천: ${result.recommendation}
https://tools.oiyo.net/ko/monthly-rent-tax-credit-calculator/`;
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
            <CardTitle>연말정산 월세 세액공제 vs 현금영수증 소득공제 비교기</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            2024~2026년 개정 세법(총급여 8,000만원 상향, 연 1,000만원 한도) 기준 세액공제 17%/15%와 현금영수증 30% 소득공제를 1초 만에 비교합니다.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inputs */}
              <div className="space-y-4 border rounded-lg p-4 border-border bg-muted/20">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Calculator className="w-4 h-4 text-primary" />
                  <span>급여 및 월세 금액 입력</span>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="monthlyRent" className="text-xs">매월 지급하는 월세액 (원)</Label>
                  <Input
                    id="monthlyRent"
                    type="number"
                    value={monthlyRent}
                    step={50000}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    연간 합계: {(result.totalAnnualRent / 10000).toLocaleString()}만원 (공제 한도 연 1,000만원 적용)
                  </p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="annualSalary" className="text-xs">연간 총급여액 (근로소득, 원)</Label>
                  <Input
                    id="annualSalary"
                    type="number"
                    value={annualSalary}
                    step={1000000}
                    onChange={(e) => setAnnualSalary(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    5,500만원 이하: 17% 세액공제 | 5,500만~8,000만원: 15% 세액공제
                  </p>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-4 border rounded-lg p-4 border-border bg-muted/20">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Percent className="w-4 h-4 text-primary" />
                  <span>세액공제 필수 요건 점검</span>
                </div>
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="homeCheck"
                      checked={!isHomeowner}
                      onChange={(e) => setIsHomeowner(!e.target.checked)}
                      className="rounded border-border text-primary"
                    />
                    <Label htmlFor="homeCheck" className="text-xs cursor-pointer">
                      12월 31일 현재 세대원 전원 무주택자입니다
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="addressCheck"
                      checked={isRegisteredAddress}
                      onChange={(e) => setIsRegisteredAddress(e.target.checked)}
                      className="rounded border-border text-primary"
                    />
                    <Label htmlFor="addressCheck" className="text-xs cursor-pointer">
                      임대차계약서 주소지로 전입신고를 완료했습니다
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sizeCheck"
                      checked={houseSizePassed}
                      onChange={(e) => setHouseSizePassed(e.target.checked)}
                      className="rounded border-border text-primary"
                    />
                    <Label htmlFor="sizeCheck" className="text-xs cursor-pointer">
                      국민주택규모(85㎡ 이하) 또는 기준시가 4억원 이하입니다
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                    💡 위 요건 중 하나라도 미달되면 세액공제가 불가하지만, 국세청 홈택스에서 <strong>주택임차료 현금영수증(소득공제 30%)</strong>을 발급받아 연말정산 환급을 챙길 수 있습니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 border rounded-xl border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-base">1. 월세 세액공제 (15~17%)</h3>
                  </div>
                  {result.isTaxCreditEligible ? (
                    <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">자격 충족</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">자격 미달</span>
                  )}
                </div>
                <div className="space-y-1 pt-1 text-xs text-muted-foreground">
                  <p>공제율: {result.isTaxCreditEligible ? `${(result.taxCreditRate * 100).toFixed(0)}%` : '0%'}</p>
                  <p>인정 월세액: {(result.eligibleRentLimit / 10000).toLocaleString()}만원 (연 1,000만원 한도)</p>
                </div>
                <div className="pt-2 border-t border-border flex justify-between items-baseline">
                  <span className="font-medium text-xs">예상 세금 환급액:</span>
                  <p className="text-xl font-bold text-primary">
                    {result.taxCreditRefund.toLocaleString()}원
                  </p>
                </div>
              </div>

              <div className="p-5 border rounded-xl border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-base">2. 현금영수증 소득공제 (30%)</h3>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">홈택스 상시 발급</span>
                </div>
                <div className="space-y-1 pt-1 text-xs text-muted-foreground">
                  <p>공제율: 신용카드 등 소득공제 30% 적용</p>
                  <p>소득공제 금액: {Math.round((result.totalAnnualRent * 0.3) / 10000).toLocaleString()}만원</p>
                </div>
                <div className="pt-2 border-t border-border flex justify-between items-baseline">
                  <span className="font-medium text-xs">예상 절세 환급액:</span>
                  <p className="text-xl font-bold text-foreground">
                    {result.cashReceiptRefund.toLocaleString()}원
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendation Box */}
            <div className="p-6 border rounded-xl border-border bg-card space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>OIYO 연말정산 최적화 추천:</span>
              </div>
              <p className="text-sm font-semibold text-primary">{result.recommendation}</p>
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
