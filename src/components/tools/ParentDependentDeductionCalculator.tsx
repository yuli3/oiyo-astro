import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, CheckCircle2, XCircle, Sparkles, Heart, CreditCard } from 'lucide-react';

export function ParentDependentDeductionCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [birthYear, setBirthYear] = useState(1956); // 1956년생 (만 70세)
  const [annualIncomeTenThousand, setAnnualIncomeTenThousand] = useState(0); // 소득 없음
  const [isEarnedOnly, setIsEarnedOnly] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [siblingClaimed, setSiblingClaimed] = useState(false);
  const [taxRate, setTaxRate] = useState(15); // 한계세율 15%

  const result = useMemo(() => {
    const age = 2026 - birthYear;
    const isAgeQualified = age >= 60 || isDisabled;
    const income = annualIncomeTenThousand * 10000;
    const isIncomeQualified = isEarnedOnly ? income <= 5000000 : income <= 1000000;
    const isNoConflict = !siblingClaimed;

    const isEligible = isAgeQualified && isIncomeQualified && isNoConflict;

    let basic = 0;
    let senior = 0;
    let disabled = 0;

    if (isEligible) {
      basic = 1500000;
      if (age >= 70) senior = 1000000;
      if (isDisabled) disabled = 2000000;
    }

    const total = basic + senior + disabled;
    const effectiveRate = (taxRate * 1.1) / 100;
    const savings = Math.round(total * effectiveRate);

    const failReasons: string[] = [];
    if (!isAgeQualified) failReasons.push(isKo ? `만 60세 미만 (만 ${age}세)` : `Under 60y (Age ${age})`);
    if (!isIncomeQualified) failReasons.push(isKo ? '연간 소득금액 100만원 초과' : 'Income exceeds 1M KRW');
    if (!isNoConflict) failReasons.push(isKo ? '다른 형제가 이미 공제 신청' : 'Claimed by another sibling');

    return {
      age,
      isEligible,
      basic,
      senior,
      disabled,
      total,
      savings,
      failReasons,
      canCard: isIncomeQualified,
    };
  }, [birthYear, annualIncomeTenThousand, isEarnedOnly, isDisabled, siblingClaimed, taxRate, isKo]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {isKo ? '소득세법 제50조·제51조' : 'Income Tax Act'}
              </span>
            </Badge>
            <Badge variant="secondary">2026/2027</Badge>
          </div>
          <CardTitle>
            {isKo
              ? '따로 사는 부모님 연말정산 부양가족 공제 판정기'
              : 'Parents Dependent Tax Deduction Calculator'}
          </CardTitle>
          <CardDescription>
            {isKo
              ? '주거 형편상 따로 사는 부모님(시부모·장인장모 포함)의 만 60세 연령 및 소득 100만원 요건, 경로우대 100만원 추가공제와 형제간 중복공제 추징을 진단합니다.'
              : 'Evaluate year-end tax deduction eligibility for elderly parents living separately.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="birth-year-input" className="text-sm font-medium">
                  {isKo ? '부모님 출생연도 (연세)' : 'Parents Birth Year'}
                </label>
                <Input
                  id="birth-year-input"
                  type="number"
                  value={birthYear}
                  onChange={(e) => setBirthYear(Number(e.target.value) || 1950)}
                  min={1920}
                  max={2010}
                />
                <p className="text-xs text-muted-foreground">
                  {isKo
                    ? `2026년 기준 만 ${result.age}세 ${result.age >= 70 ? '(경로우대 100만 대상 🌟)' : result.age >= 60 ? '(만 60세 이상 충족 ✅)' : '(만 60세 미만 ⚠️)'}`
                    : `Age ${result.age}`}
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="income-input" className="text-sm font-medium">
                  {isKo ? '부모님 연간 소득금액 (만원)' : 'Annual Net Income (10k KRW)'}
                </label>
                <Input
                  id="income-input"
                  type="number"
                  value={annualIncomeTenThousand}
                  onChange={(e) => setAnnualIncomeTenThousand(Math.max(0, Number(e.target.value) || 0))}
                  min={0}
                  step={10}
                />
                <p className="text-xs text-muted-foreground">
                  {isKo
                    ? '기초연금은 비과세로 제외. 국민연금은 연 516만원 이하 시 공제 가능.'
                    : 'Basic pension is tax-exempt.'}
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="tax-rate-select" className="text-sm font-medium">
                  {isKo ? '본인의 소득세 한계세율 (%)' : 'Your Marginal Tax Rate (%)'}
                </label>
                <select
                  id="tax-rate-select"
                  aria-label={isKo ? '소득세 한계세율 선택' : 'Select marginal tax rate'}
                  className="w-full h-10 px-3 py-2 bg-background border rounded-md text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                >
                  <option value={6}>{isKo ? '6% (과세표준 1,400만원 이하)' : '6% (<= 14M)'}</option>
                  <option value={15}>{isKo ? '15% (1,400만~5,000만원, 일반 직장인)' : '15% (14M~50M)'}</option>
                  <option value={24}>{isKo ? '24% (5,000만~8,800만원)' : '24% (50M~88M)'}</option>
                  <option value={35}>{isKo ? '35% (8,800만~1억 5,000만원)' : '35% (88M~150M)'}</option>
                  <option value={38}>{isKo ? '38% (1억 5,000만원 초과)' : '38% (> 150M)'}</option>
                </select>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">{isKo ? '소득 유형' : 'Income Source'}</span>
                <div className="flex gap-2">
                  <Button
                    variant={!isEarnedOnly ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setIsEarnedOnly(false)}
                  >
                    {isKo ? '종합/연금/사업 (100만 이하)' : 'General/Pension'}
                  </Button>
                  <Button
                    variant={isEarnedOnly ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setIsEarnedOnly(true)}
                  >
                    {isKo ? '근로소득만 (총급여 500만 이하)' : 'Wage Only'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium">{isKo ? '장애인 / 중증질환자 여부' : 'Disabled / Critical Illness'}</span>
                  <p className="text-xs text-muted-foreground">{isKo ? '암·치매·난치성질환 치료 중 포함 (나이 무관)' : 'Includes cancer/dementia'}</p>
                </div>
                <Button
                  variant={isDisabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIsDisabled(!isDisabled)}
                >
                  {isDisabled ? (isKo ? '해당' : 'Yes') : (isKo ? '비해당' : 'No')}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium">{isKo ? '다른 형제·자매 공제 여부' : 'Claimed by Siblings'}</span>
                  <p className="text-xs text-muted-foreground">{isKo ? '형제 중 1명만 공제 가능 (중복 추징)' : 'Only 1 child can claim'}</p>
                </div>
                <Button
                  variant={siblingClaimed ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => setSiblingClaimed(!siblingClaimed)}
                >
                  {siblingClaimed ? (isKo ? '다른 형제 공제함' : 'Claimed') : (isKo ? '내가 단독 공제' : 'Sole Claim')}
                </Button>
              </div>
            </div>

            {/* 판정 결과 카드 */}
            <div className="p-4 bg-muted/60 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{isKo ? '연말정산 공제 진단 결과' : 'Tax Deduction Result'}</span>
                </div>
                <Badge variant={result.isEligible ? 'default' : 'secondary'}>
                  {result.isEligible ? (isKo ? '공제 대상 적합 ✅' : 'Eligible') : (isKo ? '공제 불가 ❌' : 'Ineligible')}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-background space-y-2">
                  <span className="text-xs text-muted-foreground">{isKo ? '총 소득공제 금액' : 'Total Deduction'}</span>
                  <div className="text-2xl font-bold tracking-tight">
                    {(result.total / 10000).toLocaleString()}{isKo ? '만원' : ' 10k KRW'}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div>• {isKo ? `기본공제: ${(result.basic / 10000).toLocaleString()}만원` : `Basic: ${result.basic / 10000}`}</div>
                    <div>• {isKo ? `경로우대(만 70세 이상): ${(result.senior / 10000).toLocaleString()}만원` : `Senior: ${result.senior / 10000}`}</div>
                    <div>• {isKo ? `장애인 추가공제: ${(result.disabled / 10000).toLocaleString()}만원` : `Disabled: ${result.disabled / 10000}`}</div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-background space-y-2">
                  <span className="text-xs text-muted-foreground">
                    {isKo ? `예상 연말정산 환급액 (한계세율 ${taxRate}%)` : 'Estimated Tax Refund'}
                  </span>
                  <div className="text-2xl font-bold tracking-tight text-primary">
                    +{(result.savings / 10000).toLocaleString()}{isKo ? '만원 환급' : ' KRW'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isKo ? '지방소득세(10%)가 합산 반영된 실질 입금 환급액입니다.' : 'Includes local income tax.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-background rounded-lg border text-xs space-y-1">
                  <div className="flex items-center justify-between font-medium">
                    <span className="flex items-center gap-1">
                      <CreditCard className="h-3.5 w-3.5 text-primary" />
                      {isKo ? '부모님 카드/현금영수증 사용액' : 'Card Spending'}
                    </span>
                    {result.canCard ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <XCircle className="h-4 w-4 text-destructive" />}
                  </div>
                  <p className="text-muted-foreground">
                    {result.canCard
                      ? (isKo ? '소득 요건(100만 이하)을 충족하므로 부모님 명의 카드 사용액 공제 가능' : 'Eligible for card deduction')
                      : (isKo ? '부모님 소득 초과 시 카드 사용액은 공제 불가' : 'Ineligible')}
                  </p>
                </div>

                <div className="p-3 bg-background rounded-lg border text-xs space-y-1">
                  <div className="flex items-center justify-between font-medium">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5 text-primary" />
                      {isKo ? '부모님 의료비 지출액' : 'Medical Expenses'}
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-muted-foreground">
                    {isKo
                      ? '의료비는 나이 및 소득 제한 없이 부양하는 근로자가 전액 세액공제(15%) 가능'
                      : 'Medical expenses are 100% deductible regardless of age or income.'}
                  </p>
                </div>
              </div>

              {!result.isEligible && (
                <div className="p-3 bg-muted rounded-lg border text-xs text-destructive space-y-1">
                  <span className="font-semibold">{isKo ? '공제 탈락 사유:' : 'Disqualification:'}</span>
                  <ul className="list-disc list-inside">
                    {result.failReasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ParentDependentDeductionCalculator;
