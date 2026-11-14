import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HeartPulse, Sparkles, Building2, Home, ShieldCheck } from 'lucide-react';

const HOME_LIMITS: Record<number, number> = {
  1: 2069900,
  2: 1869600,
  3: 1453100,
  4: 1341800,
  5: 1154600,
  0: 643700,
};

const FACILITY_TOTALS: Record<number, number> = {
  1: 2535900,
  2: 2352600,
  3: 2175000,
  4: 2175000,
  5: 2175000,
  0: 0,
};

export function LongTermCareInsuranceCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [grade, setGrade] = useState<number>(2); // 2등급
  const [serviceType, setServiceType] = useState<'facility' | 'home'>('facility');
  const [copayType, setCopayType] = useState<'general' | 'reduce60' | 'reduce40' | 'basic'>('general');
  const [mealExpenseTenThousand, setMealExpenseTenThousand] = useState<number>(36); // 월 36만원

  const result = useMemo(() => {
    const isFacility = serviceType === 'facility';

    if (isFacility && grade === 0) {
      return {
        isEligible: false,
        totalCost: 0,
        support: 0,
        copay: 0,
        meal: 0,
        actualTotal: 0,
        savings: 0,
        ratePercent: 0,
        error: isKo
          ? '인지지원등급은 요양원 시설 입소가 불가능하며 주야간보호(데이케어) 등 재가급여만 이용할 수 있습니다.'
          : 'Cognitive support grade cannot enter facility care.',
      };
    }

    const totalCost = isFacility ? (FACILITY_TOTALS[grade] || 2175000) : (HOME_LIMITS[grade] || 1453100);

    let rate = 0;
    if (copayType === 'basic') {
      rate = 0.0;
    } else if (copayType === 'reduce60') {
      rate = isFacility ? 0.08 : 0.06;
    } else if (copayType === 'reduce40') {
      rate = isFacility ? 0.12 : 0.09;
    } else {
      rate = isFacility ? 0.20 : 0.15;
    }

    const copay = Math.round(totalCost * rate);
    const support = totalCost - copay;
    const meal = isFacility ? mealExpenseTenThousand * 10000 : 0;
    const actualTotal = copay + meal;
    const privateCareCost = 3800000;
    const savings = Math.max(0, privateCareCost - actualTotal);

    return {
      isEligible: true,
      totalCost,
      support,
      copay,
      meal,
      actualTotal,
      savings,
      ratePercent: Math.round(rate * 100),
      error: null,
    };
  }, [grade, serviceType, copayType, mealExpenseTenThousand, isKo]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              <span className="flex items-center gap-1">
                <HeartPulse className="h-3.5 w-3.5" />
                {isKo ? '노인장기요양보험법 제28조·제40조' : 'Long-Term Care Insurance Act'}
              </span>
            </Badge>
            <Badge variant="secondary">2026/2027</Badge>
          </div>
          <CardTitle>
            {isKo
              ? '노인장기요양보험 본인부담금 & 요양원 vs 재가 한도 계산기'
              : 'Long-Term Care Copayment & Cost Calculator'}
          </CardTitle>
          <CardDescription>
            {isKo
              ? '1~5등급별 국민건강보험공단 국비 지원금(80~85%), 본인부담금(일반 15~20%, 감경 6~12%, 수급자 0%), 요양원 식대 및 사설 간병 대비 절감액을 1초 만에 확인합니다.'
              : 'Calculate government subsidy and out-of-pocket costs for home vs nursing home care.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="grade-select" className="text-sm font-medium">
                  {isKo ? '장기요양 등급 선택' : 'Care Grade'}
                </label>
                <select
                  id="grade-select"
                  aria-label={isKo ? '장기요양 등급 선택' : 'Select care grade'}
                  className="w-full h-10 px-3 py-2 bg-background border rounded-md text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                >
                  <option value={1}>{isKo ? '1등급 (장기요양점수 95점 이상, 전적 도움)' : 'Grade 1 (Full assistance)'}</option>
                  <option value={2}>{isKo ? '2등급 (75점 이상 95점 미만, 상당 도움)' : 'Grade 2 (Substantial assistance)'}</option>
                  <option value={3}>{isKo ? '3등급 (60점 이상 75점 미만, 부분 도움)' : 'Grade 3 (Partial assistance)'}</option>
                  <option value={4}>{isKo ? '4등급 (51점 이상 60점 미만, 일정 도움)' : 'Grade 4 (Moderate assistance)'}</option>
                  <option value={5}>{isKo ? '5등급 (치매 환자, 45점 이상 51점 미만)' : 'Grade 5 (Dementia)'}</option>
                  <option value={0}>{isKo ? '인지지원등급 (치매 경증, 주야간보호 전용)' : 'Cognitive Support'}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="copay-select" className="text-sm font-medium">
                  {isKo ? '본인부담금 감경 자격' : 'Copay Category'}
                </label>
                <select
                  id="copay-select"
                  aria-label={isKo ? '본인부담금 감경 자격 선택' : 'Select copay category'}
                  className="w-full h-10 px-3 py-2 bg-background border rounded-md text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  value={copayType}
                  onChange={(e) => setCopayType(e.target.value as 'general' | 'reduce60' | 'reduce40' | 'basic')}
                >
                  <option value="general">{isKo ? '일반 대상자 (재가 15% / 시설 20%)' : 'General (Home 15% / Facility 20%)'}</option>
                  <option value="reduce40">{isKo ? '40% 감경자 (재가 9% / 시설 12%)' : '40% Reduction (Home 9% / Facility 12%)'}</option>
                  <option value="reduce60">{isKo ? '60% 감경자 (재가 6% / 시설 8%)' : '60% Reduction (Home 6% / Facility 8%)'}</option>
                  <option value="basic">{isKo ? '국민기초생활수급자 (본인부담 0% 면제)' : 'Basic Livelihood (0% Free)'}</option>
                </select>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">{isKo ? '이용 서비스 유형' : 'Service Type'}</span>
                <div className="flex gap-2">
                  <Button
                    variant={serviceType === 'facility' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setServiceType('facility')}
                  >
                    <Building2 className="h-4 w-4 mr-1.5" />
                    {isKo ? '시설급여 (요양원 입소)' : 'Facility (Nursing Home)'}
                  </Button>
                  <Button
                    variant={serviceType === 'home' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setServiceType('home')}
                  >
                    <Home className="h-4 w-4 mr-1.5" />
                    {isKo ? '재가급여 (방문요양·주야간)' : 'Home Care (Daycare)'}
                  </Button>
                </div>
              </div>

              {serviceType === 'facility' ? (
                <div className="space-y-2">
                  <label htmlFor="meal-input" className="text-sm font-medium">
                    {isKo ? '월 비급여 식대 (만원)' : 'Monthly Meal Cost (10k KRW)'}
                  </label>
                  <Input
                    id="meal-input"
                    type="number"
                    value={mealExpenseTenThousand}
                    onChange={(e) => setMealExpenseTenThousand(Math.max(0, Number(e.target.value) || 0))}
                    min={0}
                    step={1}
                  />
                  <p className="text-xs text-muted-foreground">
                    {isKo ? '식사재료비는 공단 미지원 100% 본인 부담 (보통 30~45만원)' : 'Non-covered meal expense'}
                  </p>
                </div>
              ) : (
                <div className="flex items-center p-3 border rounded-lg bg-muted/40 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 mr-1.5 text-primary shrink-0" />
                  {isKo ? '재가급여는 가정에서 방문요양 요양보호사 파견 또는 주야간보호센터를 이용합니다.' : 'Home care services.'}
                </div>
              )}
            </div>

            {/* 계산 결과 카드 */}
            {result.error ? (
              <div className="p-4 bg-muted rounded-xl border text-sm text-destructive">
                {result.error}
              </div>
            ) : (
              <div className="p-4 bg-muted/60 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{isKo ? '월 예상 간병 비용 명세' : 'Cost Breakdown'}</span>
                  </div>
                  <Badge variant="default">
                    {isKo ? `본인부담률 ${result.ratePercent}%` : `${result.ratePercent}% Copay`}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg bg-background space-y-2">
                    <span className="text-xs text-muted-foreground">
                      {isKo ? '🏛️ 공단 지원금 (국비 부담)' : 'Government Subsidy'}
                    </span>
                    <div className="text-2xl font-bold tracking-tight">
                      {(result.support / 10000).toLocaleString()}{isKo ? '만원 / 월' : ' 10k KRW/mo'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isKo
                        ? `월 총 급여비용 ${(result.totalCost / 10000).toLocaleString()}만원 중 ${100 - result.ratePercent}%를 국가가 전액 지원합니다.`
                        : 'Covered by National Health Insurance'}
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-background space-y-2">
                    <span className="text-xs text-muted-foreground">
                      {isKo ? '💵 최종 월 실부담금 (보호자 부담)' : 'Final Out-of-Pocket Cost'}
                    </span>
                    <div className="text-2xl font-bold tracking-tight text-primary">
                      {(result.actualTotal / 10000).toLocaleString()}{isKo ? '만원 / 월' : ' 10k KRW/mo'}
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <div>• {isKo ? `급여 본인부담금: ${(result.copay / 10000).toLocaleString()}만원` : `Copay: ${result.copay / 10000}`}</div>
                      {result.meal > 0 && (
                        <div>• {isKo ? `비급여 식사비: ${(result.meal / 10000).toLocaleString()}만원` : `Meals: ${result.meal / 10000}`}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-background rounded-lg border text-sm space-y-1">
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-xs text-muted-foreground">
                      {isKo ? '🎉 민간 사설 간병인(월 380만원) 대비 가족 절감액' : 'Monthly Savings vs Private Caregiver'}
                    </span>
                    <span className="font-bold text-primary">
                      {isKo ? `월 약 ${(result.savings / 10000).toLocaleString()}만원 절약!` : `Save ${result.savings / 10000}/mo`}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isKo
                      ? `연간 환산 시 약 ${(Math.round(result.savings * 12) / 10000).toLocaleString()}만원의 막대한 가계 간병비 부담이 경감됩니다.`
                      : 'Huge savings for family caregiving expenses.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LongTermCareInsuranceCalculator;
