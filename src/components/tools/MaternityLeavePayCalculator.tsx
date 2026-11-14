import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Baby, Sparkles, Building, Calendar, CheckCircle2 } from 'lucide-react';

export function MaternityLeavePayCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [monthlyWageMillions, setMonthlyWageMillions] = useState(3.5); // 월 통상임금 (백만원)
  const [isSmallBiz, setIsSmallBiz] = useState(true); // 우선지원대상기업 여부
  const [isTwins, setIsTwins] = useState(false); // 다태아 여부

  const result = useMemo(() => {
    const monthlyWage = monthlyWageMillions * 1000000;
    const totalDays = isTwins ? 120 : 90;
    const employerPaidDays = isTwins ? 75 : 60;
    const remainingDays = totalDays - employerPaidDays;

    const capMonthly = 2100000;
    const capPerDay = capMonthly / 30;
    const wagePerDay = monthlyWage / 30;

    let govTotal = 0;
    let employerTotal = 0;

    if (isSmallBiz) {
      govTotal = Math.min(monthlyWage * (totalDays / 30), capMonthly * (totalDays / 30));
      const excessDaily = Math.max(0, wagePerDay - capPerDay);
      employerTotal = Math.round(excessDaily * employerPaidDays);
    } else {
      employerTotal = Math.round(wagePerDay * employerPaidDays);
      govTotal = Math.min(monthlyWage * (remainingDays / 30), capMonthly * (remainingDays / 30));
    }

    const totalReceipt = Math.round(govTotal + employerTotal);

    const m1Gov = isSmallBiz ? Math.min(monthlyWage, capMonthly) : 0;
    const m1Emp = isSmallBiz ? Math.max(0, monthlyWage - capMonthly) : monthlyWage;
    const m2Gov = isSmallBiz ? Math.min(monthlyWage, capMonthly) : 0;
    const m2Emp = isSmallBiz ? Math.max(0, monthlyWage - capMonthly) : monthlyWage;
    const m3Gov = Math.min(monthlyWage, capMonthly);
    const m3Emp = 0;

    return {
      totalDays,
      monthlyWage,
      govTotal: Math.round(govTotal),
      employerTotal: Math.round(employerTotal),
      totalReceipt,
      m1Total: Math.round(m1Gov + m1Emp),
      m2Total: Math.round(m2Gov + m2Emp),
      m3Total: Math.round(m3Gov + m3Emp),
      m1Gov: Math.round(m1Gov),
      m1Emp: Math.round(m1Emp),
      m2Gov: Math.round(m2Gov),
      m2Emp: Math.round(m2Emp),
      m3Gov: Math.round(m3Gov),
    };
  }, [monthlyWageMillions, isSmallBiz, isTwins]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {isKo ? '👶 출산전후휴가 90일 급여 & 회사 차액·정부지원금 계산기' : '👶 Korea Maternity Leave 90-Day Pay & Employer Top-Up Calculator'}
              </CardTitle>
              <CardDescription>
                {isKo
                  ? '근로기준법 제74조 기준 90일간 통상임금 100% 보장, 고용보험 지원금 및 중소/대기업별 회사 지급 차액을 계산합니다.'
                  : 'Calculate 90-day 100% ordinary wage maternity leave pay, employment insurance subsidies, and employer top-ups.'}
              </CardDescription>
            </div>
            <Badge variant="outline">
              {isKo ? `${result.totalDays}일 휴가 보장` : `${result.totalDays} Days`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '월 통상임금 (기본급+고정수당, 백만원)' : 'Monthly Ordinary Wage (Million KRW)'}
                </label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  step={0.1}
                  value={monthlyWageMillions}
                  onChange={(e) => setMonthlyWageMillions(Math.max(0.1, Number(e.target.value) || 0))}
                />
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '근무 회사 규모' : 'Company Scale'}
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={isSmallBiz ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setIsSmallBiz(true)}
                  >
                    {isKo ? '우선지원대상기업 (중소기업)' : 'SME (Priority)'}
                  </Button>
                  <Button
                    variant={!isSmallBiz ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setIsSmallBiz(false)}
                  >
                    {isKo ? '대규모기업 (대기업)' : 'Large Enterprise'}
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium pb-1.5 block">
                {isKo ? '태아 구분' : 'Birth Type'}
              </label>
              <div className="flex gap-2">
                <Button
                  variant={!isTwins ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setIsTwins(false)}
                >
                  {isKo ? '단태아 (90일 휴가)' : 'Single (90 Days)'}
                </Button>
                <Button
                  variant={isTwins ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setIsTwins(true)}
                >
                  {isKo ? '다태아 (쌍둥이 등, 120일 휴가)' : 'Multiple/Twins (120 Days)'}
                </Button>
              </div>
            </div>

            {/* Total Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4 space-y-1 bg-muted/20">
                <div className="text-xs text-muted-foreground">{isKo ? '고용보험 정부지원금' : 'Gov Subsidy'}</div>
                <div className="text-xl font-bold">
                  {(result.govTotal / 10000).toLocaleString()} {isKo ? '만원' : '10k KRW'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isKo ? '월 최대 210만원 지원' : 'Up to 2.1M/mo'}
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-1 bg-muted/20">
                <div className="text-xs text-muted-foreground">{isKo ? '회사 법정 지급액 (차액)' : 'Employer Top-up'}</div>
                <div className="text-xl font-bold">
                  {(result.employerTotal / 10000).toLocaleString()} {isKo ? '만원' : '10k KRW'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isKo ? '최초 60일 통상임금 100% 보장' : '100% wage guaranteed'}
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-1 bg-primary/5 border-primary/20">
                <div className="text-xs text-muted-foreground">{isKo ? '90일 총 실수령액' : 'Total 90-Day Receipt'}</div>
                <div className="text-2xl font-bold text-primary">
                  {(result.totalReceipt / 10000).toLocaleString()} {isKo ? '만원' : '10k KRW'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isKo ? '휴가 기간 내 통장 총 입금액' : 'Total cash inflow'}
                </div>
              </div>
            </div>

            {/* Monthly Schedule Table */}
            <div className="rounded-lg border p-4 space-y-3 bg-background">
              <div className="text-sm font-semibold flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-primary" />
                {isKo ? '📅 월별 입금 일정표 (3개월)' : '📅 Monthly Inflow Schedule'}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="border p-3 rounded-lg space-y-1 bg-muted/10">
                  <div className="font-semibold">{isKo ? '1개월차 (1~30일)' : 'Month 1'}</div>
                  <div className="text-lg font-bold">{(result.m1Total / 10000).toFixed(1)} {isKo ? '만원' : '10k KRW'}</div>
                  <div className="text-muted-foreground">
                    {isKo ? `정부 ${(result.m1Gov / 10000).toFixed(1)}만 + 회사 ${(result.m1Emp / 10000).toFixed(1)}만` : 'Gov + Employer'}
                  </div>
                </div>

                <div className="border p-3 rounded-lg space-y-1 bg-muted/10">
                  <div className="font-semibold">{isKo ? '2개월차 (31~60일)' : 'Month 2'}</div>
                  <div className="text-lg font-bold">{(result.m2Total / 10000).toFixed(1)} {isKo ? '만원' : '10k KRW'}</div>
                  <div className="text-muted-foreground">
                    {isKo ? `정부 ${(result.m2Gov / 10000).toFixed(1)}만 + 회사 ${(result.m2Emp / 10000).toFixed(1)}만` : 'Gov + Employer'}
                  </div>
                </div>

                <div className="border p-3 rounded-lg space-y-1 bg-muted/10">
                  <div className="font-semibold">{isKo ? '3개월차 (61~90일)' : 'Month 3'}</div>
                  <div className="text-lg font-bold">{(result.m3Total / 10000).toFixed(1)} {isKo ? '만원' : '10k KRW'}</div>
                  <div className="text-muted-foreground">
                    {isKo ? `정부 ${(result.m3Gov / 10000).toFixed(1)}만원 (상한 210만)` : 'Gov subsidy'}
                  </div>
                </div>
              </div>
            </div>

            {/* Educational Defense Guide */}
            <div className="rounded-lg border p-4 text-xs space-y-2 bg-muted/10 text-muted-foreground">
              <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                {isKo ? '출산전후휴가 모성보호 법정 상식' : 'Key Maternity Rights'}
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong>{isKo ? '출산 후 45일 의무' : 'Postnatal 45-Day Rule'}:</strong> {isKo ? '휴가 90일 중 반드시 출산일 이후에 45일(다태아 60일) 이상이 배정되어야 적법합니다.' : 'At least 45 days must be after birth.'}
                </li>
                <li>
                  <strong>{isKo ? '최초 60일 유급 보장' : 'First 60 Days 100% Paid'}:</strong> {isKo ? '중소기업 근로자라도 월 통상임금이 정부지원 상한(210만원)을 초과하면 회사가 60일간 차액을 지급할 법적 의무가 있습니다.' : 'Employer must top up difference above 2.1M for first 60 days.'}
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default MaternityLeavePayCalculator;
