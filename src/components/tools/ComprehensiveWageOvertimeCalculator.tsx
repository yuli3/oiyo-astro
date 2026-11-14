import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ShieldAlert, CheckCircle2, Coins, AlertCircle } from 'lucide-react';

const MINIMUM_HOURLY_WAGE_2026 = 10030;

export function ComprehensiveWageOvertimeCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [monthlySalaryManwon, setMonthlySalaryManwon] = useState<number>(350);
  const [fixedOtHours, setFixedOtHours] = useState<number>(20);
  const [actualOtHours, setActualOtHours] = useState<number>(35);

  const monthlySalary = monthlySalaryManwon * 10000;

  const result = useMemo(() => {
    const multiplier = 1 + (fixedOtHours * 1.5) / 209;
    const baseSalary = Math.round(monthlySalary / multiplier);
    const fixedOtPay = monthlySalary - baseSalary;

    const ordinaryHourlyWage = Math.round(baseSalary / 209);
    const isMinimumWageViolated = ordinaryHourlyWage < MINIMUM_HOURLY_WAGE_2026;

    const excessOtHours = Math.max(0, actualOtHours - fixedOtHours);
    const unpaidOvertimeAllowance = Math.round(excessOtHours * ordinaryHourlyWage * 1.5);

    return {
      baseSalary,
      fixedOtPay,
      ordinaryHourlyWage,
      isMinimumWageViolated,
      excessOtHours,
      unpaidOvertimeAllowance,
    };
  }, [monthlySalary, fixedOtHours, actualOtHours]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* 헤더 */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{isKo ? '근로기준법 제56조 및 대법원 2010다23282' : 'Comprehensive Wage & Overtime Pay'}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {isKo ? '포괄임금제 고정연장수당 역산 및 초과수당 체불 계산기' : 'Comprehensive Wage Overtime Deconstruction Calculator'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isKo
            ? '월 총급여에서 기본급과 고정OT수당을 역산 분해하여 실질 통상시급을 산출하고, 약정 시간을 초과한 야근에 대한 미지급 수당을 계산합니다.'
            : 'Deconstruct monthly comprehensive salary into base wage and fixed OT, auditing minimum wage compliance and unpaid overtime.'}
        </p>
      </div>

      {/* 입력 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>{isKo ? '급여 계약 및 실제 근무시간 입력' : 'Contract Salary & Actual Hours'}</CardTitle>
          <CardDescription>
            {isKo
              ? '근로계약서 상의 세전 월 총급여와 계약된 고정OT 시간, 이번 달 실제 야근 시간을 입력하세요.'
              : 'Enter contracted monthly gross salary, contracted fixed OT hours, and actual overtime hours.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isKo ? '월 세전 총급여액' : 'Monthly Gross Salary'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={monthlySalaryManwon}
                  onChange={(e) => setMonthlySalaryManwon(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">만원</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isKo ? '계약상 고정OT 시간' : 'Contracted Fixed OT Hours'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={fixedOtHours}
                  onChange={(e) => setFixedOtHours(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">시간/월</span>
              </div>
              <div className="flex gap-1">
                {[10, 20, 30, 40].map((h) => (
                  <Button
                    key={h}
                    variant={fixedOtHours === h ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFixedOtHours(h)}
                  >
                    {h}h
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isKo ? '실제 수행한 연장근로' : 'Actual Overtime Hours'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={actualOtHours}
                  onChange={(e) => setActualOtHours(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">시간/월</span>
              </div>
              <div className="flex gap-1">
                {[20, 30, 40, 50].map((h) => (
                  <Button
                    key={h}
                    variant={actualOtHours === h ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActualOtHours(h)}
                  >
                    {h}h
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3-지표 카드 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '실질 통상시급' : 'Ordinary Hourly Wage'}</span>
                {result.isMinimumWageViolated ? (
                  <Badge variant="destructive">{isKo ? '최저임금 위반' : 'Below Minimum'}</Badge>
                ) : (
                  <Badge variant="secondary">{isKo ? '최저임금 충족' : 'Compliant'}</Badge>
                )}
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {result.ordinaryHourlyWage.toLocaleString()}원
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                2026년 법정 최저시급: {MINIMUM_HOURLY_WAGE_2026.toLocaleString()}원
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '기본급 vs 고정OT 분해' : 'Base vs Fixed OT'}</span>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {(result.baseSalary / 10000).toLocaleString()}만원
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                기본급 {(result.baseSalary / 10000).toLocaleString()}만 + 고정OT {(result.fixedOtPay / 10000).toLocaleString()}만
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '미지급 초과수당 (체불액)' : 'Unpaid Overtime'}</span>
                {result.excessOtHours > 0 ? (
                  <Badge variant="destructive">{isKo ? `${result.excessOtHours}h 초과` : `${result.excessOtHours}h Excess`}</Badge>
                ) : (
                  <Badge variant="secondary">{isKo ? '정상 범위' : 'Normal'}</Badge>
                )}
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {(result.unpaidOvertimeAllowance / 10000).toLocaleString()}만원
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {result.excessOtHours > 0 ? `초과 ${result.excessOtHours}h x 통상시급 x 1.5배` : '고정OT 시간 이내 근무'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 종합 진단 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>{isKo ? '포괄임금제 법리 판정 및 근로자 가이드' : 'Legal Assessment & Worker Guide'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            {result.excessOtHours > 0 ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-destructive font-semibold">
                  <ShieldAlert className="h-4 w-4" />
                  <span>{isKo ? '초과 연장근로수당 미지급 체불 발생' : 'Unpaid Overtime Wage Liability Triggered'}</span>
                </div>
                <p className="text-xs">
                  대법원 2010다23282 판례에 따라 포괄임금 계약이라 하더라도 계약서에 포함된 고정 연장시간({fixedOtHours}시간)을 넘어서 실제 근무한 초과 {result.excessOtHours}시간에 대해서는 사용자가 1.5배 가산수당({(result.unpaidOvertimeAllowance / 10000).toLocaleString()}만원)을 지급해야 합니다. 포괄임금제라는 이유로 지급을 거부하는 것은 불법 임금체불에 해당합니다.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-1">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isKo ? '약정 고정OT 범위 내 정상 근무' : 'Within Contracted Overtime Allowance'}</span>
                </div>
                <p className="text-xs">
                  실제 연장근로시간({actualOtHours}시간)이 계약상 고정OT({fixedOtHours}시간) 범위 이내이므로 추가로 발생한 미지급 체불 수당은 없습니다.
                </p>
              </div>
            )}

            {result.isMinimumWageViolated && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-1">
                <div className="flex items-center gap-2 text-destructive font-semibold">
                  <AlertCircle className="h-4 w-4" />
                  <span>{isKo ? '🚨 최저임금법 제6조 위반' : 'Minimum Wage Act Violation'}</span>
                </div>
                <p className="text-xs">
                  역산된 통상시급({result.ordinaryHourlyWage.toLocaleString()}원)이 2026년 최저시급({MINIMUM_HOURLY_WAGE_2026.toLocaleString()}원)에 미달합니다. 최저임금 미달 포괄임금 약정은 강행규정 위반으로 무효이며, 최저임금 기준 차액을 회사에 청구하거나 고용노동부에 진정을 제기할 수 있습니다.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
