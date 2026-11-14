import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, Building2, TrendingDown } from 'lucide-react';

export function RentalIncomeTaxCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [monthlyRent, setMonthlyRent] = useState(100); // 월세 (만원)
  const [isRegistered, setIsRegistered] = useState(false); // 등록 임대사업자 여부
  const [otherIncomeMillions, setOtherIncomeMillions] = useState(45); // 타 종합소득 (백만원)
  const [isDependent, setIsDependent] = useState(true); // 건보료 피부양자 여부

  const result = useMemo(() => {
    const annualRevenue = monthlyRent * 12 * 10000;
    const isEligibleSeparate = annualRevenue <= 20000000;
    const otherIncome = otherIncomeMillions * 1000000;

    // 1. 14% 분리과세 계산
    const expenseRatio = isRegistered ? 0.60 : 0.50;
    const basicDeduction = (otherIncome <= 20000000) ? (isRegistered ? 4000000 : 2000000) : 0;
    const separateTaxBase = Math.max(0, annualRevenue * (1 - expenseRatio) - basicDeduction);
    const separateIncomeTax = Math.round(separateTaxBase * 0.14);
    const separateLocalTax = Math.round(separateIncomeTax * 0.10);
    const totalSeparateTax = separateIncomeTax + separateLocalTax;

    // 2. 종합과세 합산 계산
    let marginalRate = 0.15;
    if (otherIncome > 1000000000) marginalRate = 0.45;
    else if (otherIncome > 500000000) marginalRate = 0.42;
    else if (otherIncome > 300000000) marginalRate = 0.40;
    else if (otherIncome > 150000000) marginalRate = 0.35;
    else if (otherIncome > 88000000) marginalRate = 0.24;
    else if (otherIncome > 50000000) marginalRate = 0.24;
    else if (otherIncome > 14000000) marginalRate = 0.15;
    else marginalRate = 0.06;

    const combinedExpenseRatio = 0.426;
    const combinedNetIncome = Math.round(annualRevenue * (1 - combinedExpenseRatio));
    const combinedIncomeTax = Math.round(combinedNetIncome * marginalRate);
    const combinedLocalTax = Math.round(combinedIncomeTax * 0.10);
    const totalCombinedTax = combinedIncomeTax + combinedLocalTax;

    // 3. 건보료 피부양자 탈락 판정
    const netIncomeForHealth = isRegistered ? (annualRevenue * 0.4) : (annualRevenue * 0.5);
    let loseDependent = false;
    let loseReason = '';

    if (isDependent) {
      if (isRegistered && netIncomeForHealth > 0) {
        loseDependent = true;
        loseReason = isKo
          ? '등록 사업자는 사업소득이 1원이라도 발생하면 피부양자 즉시 박탈.'
          : 'Registered landlords lose dependent status if net business income > 0.';
      } else if (!isRegistered && netIncomeForHealth > 5000000) {
        loseDependent = true;
        loseReason = isKo
          ? `미등록 사업자는 연간 소득금액 500만원 초과(${Math.round(netIncomeForHealth / 10000)}만원)로 피부양자 박탈.`
          : `Unregistered landlords lose dependent status if net income exceeds 5M KRW.`;
      }
    }

    // 탈락 시 예상 월/연 건보료
    const propertyScoreMonthly = 150000;
    const incomeScoreMonthly = Math.round((netIncomeForHealth / 12) * 0.0709);
    const totalMonthlyHealth = loseDependent ? (propertyScoreMonthly + incomeScoreMonthly) : 0;
    const totalAnnualHealth = totalMonthlyHealth * 12;

    const taxSavings = Math.abs(totalCombinedTax - totalSeparateTax);
    const isSeparateBetter = totalSeparateTax <= totalCombinedTax;

    return {
      annualRevenue,
      isEligibleSeparate,
      totalSeparateTax,
      totalCombinedTax,
      marginalRatePercent: Math.round(marginalRate * 100),
      isSeparateBetter,
      taxSavings,
      loseDependent,
      loseReason,
      totalMonthlyHealth,
      totalAnnualHealth,
    };
  }, [monthlyRent, isRegistered, otherIncomeMillions, isDependent, isKo]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {isKo ? '🏠 주택임대소득 14% 분리과세 vs 종합과세 & 건보료 가드' : '🏠 Rental Income Tax 14% Separate vs Combined Guard'}
              </CardTitle>
              <CardDescription>
                {isKo
                  ? '연 2,000만원 이하 주택임대소득 분리과세 절세액과 건강보험 피부양자 탈락 위험을 1초 만에 진단합니다.'
                  : 'Compare 14% separate tax vs combined income tax and check health insurance dependent qualification risks.'}
              </CardDescription>
            </div>
            <Badge variant={result.isEligibleSeparate ? 'outline' : 'destructive'}>
              {result.isEligibleSeparate
                ? (isKo ? '분리과세 선택 가능' : 'Separate Tax Eligible')
                : (isKo ? '2,000만원 초과 (종합과세 필수)' : 'Over 20M KRW (Combined Required)')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '월세 수입 (만원 / 월)' : 'Monthly Rent (10k KRW / month)'}
                </label>
                <Input
                  type="number"
                  min={10}
                  max={1000}
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(Math.max(1, Number(e.target.value) || 0))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {isKo
                    ? `연간 총수입: ${(result.annualRevenue / 10000).toLocaleString()}만원`
                    : `Annual Revenue: ${(result.annualRevenue / 10000).toLocaleString()} 10k KRW`}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '타 소득금액 (근로/사업 등, 백만원 / 연)' : 'Other Income (Million KRW / year)'}
                </label>
                <Input
                  type="number"
                  min={0}
                  max={500}
                  value={otherIncomeMillions}
                  onChange={(e) => setOtherIncomeMillions(Math.max(0, Number(e.target.value) || 0))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {isKo ? `적용 한계세율: 약 ${result.marginalRatePercent}%` : `Marginal Tax Rate: ~${result.marginalRatePercent}%`}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '지자체 및 세무서 임대사업자 등록 여부' : 'Registered Landlord Status'}
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={!isRegistered ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setIsRegistered(false)}
                  >
                    {isKo ? '미등록 사업자' : 'Unregistered'}
                  </Button>
                  <Button
                    variant={isRegistered ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setIsRegistered(true)}
                  >
                    {isKo ? '등록 사업자 (경비 60%)' : 'Registered (60%)'}
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '현재 건강보험 피부양자 등재 여부' : 'Health Insurance Dependent Status'}
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={isDependent ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setIsDependent(true)}
                  >
                    {isKo ? '피부양자 (직장가입자 가족)' : 'Dependent'}
                  </Button>
                  <Button
                    variant={!isDependent ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setIsDependent(false)}
                  >
                    {isKo ? '이미 지역/직장 가입자' : 'Already Enrolled'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Tax Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4 space-y-2 bg-muted/20">
                <div className="text-xs text-muted-foreground flex items-center justify-between">
                  <span>{isKo ? '14% 분리과세 납부세액' : '14% Separate Tax'}</span>
                  {result.isSeparateBetter && (
                    <Badge variant="outline">
                      {isKo ? '절세 추천' : 'Recommended'}
                    </Badge>
                  )}
                </div>
                <div className="text-2xl font-bold">
                  {(result.totalSeparateTax / 10000).toFixed(1)} {isKo ? '만원' : '10k KRW'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isKo
                    ? `필요경비 ${isRegistered ? '60%' : '50%'} 및 기본공제 반영 (지방소득세 포함)`
                    : 'Reflecting standard expenses and basic deduction'}
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-2 bg-muted/20">
                <div className="text-xs text-muted-foreground flex items-center justify-between">
                  <span>{isKo ? '종합소득세 합산 납부세액' : 'Combined Income Tax'}</span>
                  {!result.isSeparateBetter && (
                    <Badge variant="outline">
                      {isKo ? '절세 추천' : 'Recommended'}
                    </Badge>
                  )}
                </div>
                <div className="text-2xl font-bold">
                  {(result.totalCombinedTax / 10000).toFixed(1)} {isKo ? '만원' : '10k KRW'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isKo
                    ? `타 소득 합산 한계세율 ${result.marginalRatePercent}% 적용`
                    : `Applying marginal rate ${result.marginalRatePercent}%`}
                </div>
              </div>
            </div>

            {/* Health Insurance Risk Warning Banner */}
            <div className={`rounded-lg border p-4 space-y-2 ${result.loseDependent ? 'bg-destructive/10 border-destructive/30' : 'bg-muted/10'}`}>
              <div className="flex items-center gap-2">
                {result.loseDependent ? (
                  <ShieldAlert className="h-5 w-5 text-destructive" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                )}
                <span className="font-semibold text-sm">
                  {result.loseDependent
                    ? isKo
                      ? '🚨 건강보험 피부양자 자격 박탈 위험 감지!'
                      : '🚨 Health Insurance Dependent Qualification Lost!'
                    : isKo
                    ? '✅ 피부양자 자격 안전 유지'
                    : '✅ Dependent Status Safe'}
                </span>
              </div>
              {result.loseDependent ? (
                <div className="text-xs space-y-1 text-muted-foreground">
                  <p className="text-destructive font-medium">{result.loseReason}</p>
                  <p>
                    {isKo
                      ? `지역가입자로 전환되어 예상 건강보험료가 매월 약 ${(result.totalMonthlyHealth / 10000).toFixed(1)}만원 (연간 ${(result.totalAnnualHealth / 10000).toFixed(1)}만원) 추가 부과될 수 있습니다.`
                      : `Converted to regional subscriber with estimated monthly fee of ${(result.totalMonthlyHealth / 10000).toFixed(1)} 10k KRW.`}
                  </p>
                  <p className="font-semibold text-foreground">
                    👉 {isKo ? '소득세 절세액보다 건보료 증가액이 훨씬 클 수 있으니 사전에 임대료와 필요경비를 반드시 점검하세요!' : 'Ensure net income is managed properly.'}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {isKo
                    ? '현재 조건에서는 임대소득으로 인한 피부양자 박탈 기준을 초과하지 않습니다.'
                    : 'Current conditions do not trigger dependent disqualification.'}
                </p>
              )}
            </div>

            {/* Strategic Advice */}
            <div className="rounded-lg border p-4 text-xs space-y-2 bg-muted/10 text-muted-foreground">
              <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                {isKo ? '주택임대소득 절세 3대 핵심 공식' : '3 Key Rules for Rental Income Tax'}
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong>{isKo ? '2,000만원 한도 관리' : '20M KRW Threshold'}:</strong> {isKo ? '연 2,000만원 초과 시 무조건 종합과세 합산되어 누진세율이 적용됩니다.' : 'Exceeding 20M KRW forces combined taxation.'}
                </li>
                <li>
                  <strong>{isKo ? '타 소득 2,000만원 이하' : 'Other Income < 20M KRW'}:</strong> {isKo ? '임대소득 외 타 종합소득이 2,000만원 이하인 경우에만 기본공제(등록 400만, 미등록 200만)가 적용됩니다.' : 'Basic deduction requires other income <= 20M KRW.'}
                </li>
                <li>
                  <strong>{isKo ? '건보료 복병 주의' : 'Watch Out for Health Insurance'}:</strong> {isKo ? '피부양자 상태인 가족 명의 주택 임대 시 사업자등록을 하면 1원만 벌어도 지역보험료 폭탄이 발생합니다.' : 'Registering business loses dependent status immediately.'}
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default RentalIncomeTaxCalculator;
