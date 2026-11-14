import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Sparkles, ShieldAlert, CheckCircle2, AlertTriangle, Calculator } from 'lucide-react';

export function OrdinaryWageCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [salaryMillions, setSalaryMillions] = useState(3.2); // 월 총급여 (백만원)
  const [fixedOtHours, setFixedOtHours] = useState(20); // 계약 고정연장시간
  const [actualOtHours, setActualOtHours] = useState(35); // 실제 연장근무시간

  const result = useMemo(() => {
    const monthlySalary = salaryMillions * 1000000;
    const standardHours = 209;
    const otWeightedHours = fixedOtHours * 1.5;
    const totalWeightedHours = standardHours + otWeightedHours;

    const hourlyWage = Math.round(monthlySalary / totalWeightedHours);
    const baseSalary = Math.round(hourlyWage * standardHours);
    const fixedOtPay = Math.round(hourlyWage * otWeightedHours);

    const minWage2026 = 10030;
    const isMinWageViolated = hourlyWage < minWage2026;
    const minWageShortfall = isMinWageViolated ? Math.round((minWage2026 - hourlyWage) * standardHours) : 0;

    const excessHours = Math.max(0, actualOtHours - fixedOtHours);
    const unpaidPay = Math.round(excessHours * hourlyWage * 1.5);

    return {
      monthlySalary,
      hourlyWage,
      minWage2026,
      isMinWageViolated,
      minWageShortfall,
      baseSalary,
      fixedOtPay,
      excessHours,
      unpaidPay,
    };
  }, [salaryMillions, fixedOtHours, actualOtHours]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {isKo ? '⏱️ 통상임금 시급 산정 & 포괄임금제 고정연장수당 분해기' : '⏱️ Ordinary Hourly Wage & Comprehensive Wage Decomposition'}
              </CardTitle>
              <CardDescription>
                {isKo
                  ? '월 209시간 기준 통상시급 역산, 2026년 최저시급(10,030원) 위반 여부 및 약정 초과근무 시 추가 청구 수당을 진단합니다.'
                  : 'Calculate ordinary hourly wage, check 2026 minimum wage (10,030 KRW) compliance, and decompose overtime pay.'}
              </CardDescription>
            </div>
            <Badge variant={result.isMinWageViolated ? 'destructive' : 'outline'}>
              {result.isMinWageViolated
                ? (isKo ? '🚨 최저임금 미달' : 'Min Wage Violation')
                : (isKo ? '최저임금 준수' : 'Min Wage Compliant')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '포괄임금 계약 월 급여 (백만원)' : 'Monthly Total Salary (Million KRW)'}
                </label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  step={0.1}
                  value={salaryMillions}
                  onChange={(e) => setSalaryMillions(Math.max(0.1, Number(e.target.value) || 0))}
                />
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '계약서상 고정 연장시간 (시간 / 월)' : 'Contract Fixed Overtime (Hours)'}
                </label>
                <Input
                  type="number"
                  min={0}
                  max={80}
                  value={fixedOtHours}
                  onChange={(e) => setFixedOtHours(Math.max(0, Number(e.target.value) || 0))}
                />
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '실제 근무한 연장시간 (시간 / 월)' : 'Actual Overtime Worked (Hours)'}
                </label>
                <Input
                  type="number"
                  min={0}
                  max={120}
                  value={actualOtHours}
                  onChange={(e) => setActualOtHours(Math.max(0, Number(e.target.value) || 0))}
                />
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4 space-y-1 bg-muted/20">
                <div className="text-xs text-muted-foreground">{isKo ? '환산 통상시급' : 'Ordinary Hourly Wage'}</div>
                <div className={`text-2xl font-bold ${result.isMinWageViolated ? 'text-destructive' : 'text-primary'}`}>
                  {result.hourlyWage.toLocaleString()} {isKo ? '원 / 시간' : 'KRW / hr'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isKo ? '2026 최저시급 10,030원 대비' : 'vs 10,030 KRW min wage'}
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-1 bg-muted/20">
                <div className="text-xs text-muted-foreground">{isKo ? '역산 기본급 (209시간)' : 'Decomposed Base Salary'}</div>
                <div className="text-2xl font-bold">
                  {(result.baseSalary / 10000).toLocaleString()} {isKo ? '만원' : '10k KRW'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isKo
                    ? `고정연장수당: ${(result.fixedOtPay / 10000).toLocaleString()}만원`
                    : `Fixed OT: ${(result.fixedOtPay / 10000).toLocaleString()}`}
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-1 bg-primary/5 border-primary/20">
                <div className="text-xs text-muted-foreground">{isKo ? '추가 청구 가능 연장수당' : 'Unpaid Overtime Due'}</div>
                <div className="text-2xl font-bold text-primary">
                  {result.unpaidPay.toLocaleString()} {isKo ? '원' : 'KRW'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isKo ? `초과 ${result.excessHours}시간분 150% 가산` : `${result.excessHours} extra hours × 150%`}
                </div>
              </div>
            </div>

            {/* Min Wage Violation Warning */}
            {result.isMinWageViolated && (
              <div className="rounded-lg border p-4 space-y-1 bg-destructive/10 border-destructive/30">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-destructive" />
                  <span className="font-semibold text-sm">
                    {isKo ? '🚨 최저임금법 위반 감지!' : '🚨 Minimum Wage Violation Detected!'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isKo
                    ? `포괄임금제 고정연장시간을 반영한 실질 통상시급(${result.hourlyWage.toLocaleString()}원)이 2026년 법정 최저시급(10,030원)에 미달합니다. 매월 최소 ${result.minWageShortfall.toLocaleString()}원의 임금이 법정 최저선보다 부족하게 지급되고 있습니다.`
                    : 'Ordinary hourly wage falls below the 2026 legal minimum wage.'}
                </p>
              </div>
            )}

            {/* Educational Defense Guide */}
            <div className="rounded-lg border p-4 text-xs space-y-2 bg-muted/10 text-muted-foreground">
              <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                {isKo ? '포괄임금제 근로자 3대 법적 권리' : '3 Essential Rights for Comprehensive Wage'}
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong>{isKo ? '초과근로수당 청구권' : 'Overtime Top-Up Right'}:</strong> {isKo ? '포괄임금 계약이라도 계약서상 명시된 고정시간(예: 20시간)을 초과해 일했다면 초과분에 대해 1.5배 수당을 회사에 청구할 수 있습니다 (대법원 판례).' : 'Overtime worked beyond contract hours must be paid at 150%.'}
                </li>
                <li>
                  <strong>{isKo ? '최저임금 산입 기준' : 'Minimum Wage Standard'}:</strong> {isKo ? '고정연장수당은 최저임금 산정 범위에 포함되지 않으므로, 기본급만으로 209시간 기준 월 2,096,270원을 넘어야 합법입니다.' : 'Base salary alone must satisfy monthly minimum wage (2,096,270 KRW).'}
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default OrdinaryWageCalculator;
