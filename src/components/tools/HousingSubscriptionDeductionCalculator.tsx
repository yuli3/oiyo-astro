import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Home, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';

export function HousingSubscriptionDeductionCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [monthlyPaymentTenThousand, setMonthlyPaymentTenThousand] = useState<number>(25); // 월 25만원
  const [salaryTenThousand, setSalaryTenThousand] = useState<number>(5500); // 연봉 5,500만원
  const [isHouseholder, setIsHouseholder] = useState<boolean>(true); // 무주택 세대주
  const [hasCert, setHasCert] = useState<boolean>(true); // 무주택확인서 제출
  const [taxRate, setTaxRate] = useState<number>(15); // 한계세율 15%

  const result = useMemo(() => {
    const monthly = monthlyPaymentTenThousand * 10000;
    const salary = salaryTenThousand * 10000;

    const isSalaryOk = salary <= 70000000;
    const isEligible = isSalaryOk && isHouseholder && hasCert;

    const annualPayment = monthly * 12;
    const recognizedPayment = Math.min(annualPayment, 3000000); // 연 300만원 한도
    const deduction = isEligible ? Math.round(recognizedPayment * 0.40) : 0; // 40% (최대 120만원)

    const effectiveRate = (taxRate * 1.1) / 100;
    const refund = Math.round(deduction * effectiveRate);

    const failReasons: string[] = [];
    if (!isSalaryOk) failReasons.push(isKo ? '총급여 7,000만원 초과' : 'Salary exceeds 70M KRW');
    if (!isHouseholder) failReasons.push(isKo ? '12/31 기준 무주택 세대주 아님' : 'Not householder');
    if (!hasCert) failReasons.push(isKo ? '은행 무주택확인서 미제출' : 'Certificate not submitted');

    return {
      annualPayment,
      recognizedPayment,
      deduction,
      refund,
      isEligible,
      failReasons,
    };
  }, [monthlyPaymentTenThousand, salaryTenThousand, isHouseholder, hasCert, taxRate, isKo]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              <span className="flex items-center gap-1">
                <Home className="h-3.5 w-3.5" />
                {isKo ? '조세특례제한법 제87조' : 'Tax Restriction Act'}
              </span>
            </Badge>
            <Badge variant="secondary">{isKo ? '연 300만원(최대 120만 공제)' : 'Max 1.2M KRW'}</Badge>
          </div>
          <CardTitle>
            {isKo
              ? '주택청약종합저축 연말정산 소득공제 (최대 120만원) 계산기'
              : 'Housing Subscription Year-End Tax Deduction Calculator'}
          </CardTitle>
          <CardDescription>
            {isKo
              ? '2024년 세법 개정으로 연 300만원(소득공제 120만원)으로 상향된 주택청약저축의 총급여 7,000만원 이하 무주택 세대주 자격 및 실질 세금 환급액을 계산합니다.'
              : 'Calculate tax deductions up to 1.2M KRW on housing subscription deposits.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="monthly-input" className="text-sm font-medium">
                  {isKo ? '월 청약 납입금액 (만원)' : 'Monthly Deposit (10k KRW)'}
                </label>
                <Input
                  id="monthly-input"
                  type="number"
                  value={monthlyPaymentTenThousand}
                  onChange={(e) => setMonthlyPaymentTenThousand(Math.max(2, Number(e.target.value) || 0))}
                  step={5}
                  min={2}
                />
                <p className="text-xs text-muted-foreground">
                  {isKo
                    ? `연간 납입액 ${(monthlyPaymentTenThousand * 12).toLocaleString()}만원 (공제 한도: 연 300만원)`
                    : 'Statutory cap 3M KRW'}
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="salary-input" className="text-sm font-medium">
                  {isKo ? '근로자 총급여액 (만원)' : 'Gross Annual Salary (10k KRW)'}
                </label>
                <Input
                  id="salary-input"
                  type="number"
                  value={salaryTenThousand}
                  onChange={(e) => setSalaryTenThousand(Math.max(0, Number(e.target.value) || 0))}
                  step={500}
                  min={0}
                />
                <p className="text-xs text-muted-foreground">
                  {isKo ? '총급여 7,000만원 이하 근로자만 대상' : 'Must be <= 70M KRW'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold">{isKo ? '무주택 세대주 여부' : 'Householder'}</span>
                  <p className="text-xs text-muted-foreground">{isKo ? '12/31 기준 세대원 불가' : '12/31 basis'}</p>
                </div>
                <Button
                  variant={isHouseholder ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIsHouseholder(!isHouseholder)}
                >
                  {isHouseholder ? (isKo ? '세대주 ✅' : 'Yes') : (isKo ? '세대원 ❌' : 'No')}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold">{isKo ? '은행 무주택확인서 제출' : 'Cert Submitted'}</span>
                  <p className="text-xs text-muted-foreground">{isKo ? '다음 해 2월 말까지' : 'By Feb end'}</p>
                </div>
                <Button
                  variant={hasCert ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setHasCert(!hasCert)}
                >
                  {hasCert ? (isKo ? '제출 완료 ✅' : 'Yes') : (isKo ? '미제출 ❌' : 'No')}
                </Button>
              </div>

              <div className="space-y-1.5 p-3 border rounded-lg bg-background">
                <label htmlFor="tax-rate-select" className="text-xs font-semibold text-muted-foreground">
                  {isKo ? '소득세 한계세율 (%)' : 'Marginal Tax Rate'}
                </label>
                <select
                  id="tax-rate-select"
                  aria-label={isKo ? '소득세 한계세율 선택' : 'Select marginal tax rate'}
                  className="w-full h-8 px-2 bg-background border rounded text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                >
                  <option value={6}>{isKo ? '6% (과표 1,400만 이하)' : '6%'}</option>
                  <option value={15}>{isKo ? '15% (1,400만~5,000만, 일반 직장인)' : '15%'}</option>
                  <option value={24}>{isKo ? '24% (5,000만~8,800만)' : '24%'}</option>
                  <option value={35}>{isKo ? '35% (8,800만 초과)' : '35%'}</option>
                </select>
              </div>
            </div>

            {/* 시뮬레이션 결과 카드 */}
            <div className="p-4 bg-muted/60 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{isKo ? '연말정산 소득공제 진단 결과' : 'Deduction Result'}</span>
                </div>
                <Badge variant={result.isEligible ? 'default' : 'secondary'}>
                  {result.isEligible ? (isKo ? '공제 대상 적합 ✅' : 'Eligible') : (isKo ? '공제 불가 ❌' : 'Ineligible')}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-background space-y-2">
                  <span className="text-xs text-muted-foreground">{isKo ? '연말정산 소득공제 금액 (납입액 40%)' : 'Income Deduction'}</span>
                  <div className="text-2xl font-bold tracking-tight">
                    {(result.deduction / 10000).toLocaleString()}{isKo ? '만원' : ' 10k KRW'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isKo
                      ? `인정 납입액 ${(result.recognizedPayment / 10000).toLocaleString()}만원 × 40% (법정 최대 120만원)`
                      : '40% of recognized deposit up to 1.2M KRW'}
                  </p>
                </div>

                <div className="p-4 border rounded-lg bg-background space-y-2">
                  <span className="text-xs text-muted-foreground">
                    {isKo ? `실제 연말정산 환급액 (세율 ${taxRate}%)` : 'Actual Tax Refund'}
                  </span>
                  <div className="text-2xl font-bold tracking-tight text-primary">
                    +{(result.refund / 10000).toLocaleString()}{isKo ? '만원 환급' : ' KRW'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isKo ? '지방소득세(10%)가 합산 반영된 실질 입금 환급액입니다.' : 'Includes local income tax.'}
                  </p>
                </div>
              </div>

              {!result.isEligible ? (
                <div className="p-3 bg-muted rounded-lg border text-xs text-destructive space-y-1">
                  <div className="flex items-center gap-1 font-semibold">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{isKo ? '소득공제 탈락 사유:' : 'Ineligibility Reasons:'}</span>
                  </div>
                  <ul className="list-disc list-inside">
                    {result.failReasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-3 bg-background rounded-lg border text-xs text-muted-foreground space-y-1">
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    {isKo ? '중도 해지 시 추징 방어 팁' : 'Preservation Tip'}
                  </span>
                  <p>
                    {isKo
                      ? '가입 후 5년 이내에 일반 중도해지할 경우 누적 소득공제 감면세액(6.6%)이 추징됩니다. 단, 아파트 청약에 당첨되어 해지하거나 생애최초 주택구입, 해외이주, 개인회생 등의 정당한 사유가 있는 경우에는 추징되지 않습니다.'
                      : 'Closing within 5y triggers tax clawback unless winning housing subscription.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default HousingSubscriptionDeductionCalculator;
