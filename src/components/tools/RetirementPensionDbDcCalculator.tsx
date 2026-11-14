import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, TrendingUp, ShieldCheck, Scale, ArrowRight, AlertTriangle } from 'lucide-react';

export function RetirementPensionDbDcCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [monthlySalaryTenThousand, setMonthlySalaryTenThousand] = useState(400); // 월 400만원
  const [years, setYears] = useState(15); // 15년
  const [wageGrowthRate, setWageGrowthRate] = useState(4.0); // 4.0%
  const [investmentReturn, setInvestmentReturn] = useState(5.5); // 5.5%
  const [hasPeak, setHasPeak] = useState(false);
  const [peakStartYear, setPeakStartYear] = useState(12);
  const [peakCutRate, setPeakCutRate] = useState(15);

  const result = useMemo(() => {
    const monthlySalary = monthlySalaryTenThousand * 10000;
    const g = wageGrowthRate / 100;
    const r = investmentReturn / 100;

    let currentMonthly = monthlySalary;
    const yearlySalaries: number[] = [];

    for (let y = 1; y <= years; y++) {
      if (y > 1) {
        if (hasPeak && y >= peakStartYear) {
          currentMonthly = currentMonthly * (1 - peakCutRate / 100);
        } else {
          currentMonthly = currentMonthly * (1 + g);
        }
      }
      yearlySalaries.push(currentMonthly);
    }

    const finalMonthlySalary = yearlySalaries[yearlySalaries.length - 1] || monthlySalary;
    const dbTotal = Math.round(finalMonthlySalary * years);

    let dcTotal = 0;
    for (let y = 0; y < years; y++) {
      const contribution = yearlySalaries[y];
      const compoundingYears = years - (y + 1);
      const futureValue = contribution * Math.pow(1 + r, compoundingYears);
      dcTotal += futureValue;
    }
    dcTotal = Math.round(dcTotal);

    const diff = dcTotal - dbTotal;
    const isDcBetter = diff > 0;

    let low = -0.05;
    let high = 0.30;
    for (let iter = 0; iter < 40; iter++) {
      const mid = (low + high) / 2;
      let testDc = 0;
      for (let y = 0; y < years; y++) {
        testDc += yearlySalaries[y] * Math.pow(1 + mid, years - (y + 1));
      }
      if (testDc < dbTotal) {
        low = mid;
      } else {
        high = mid;
      }
    }
    const breakevenReturn = Math.round(((low + high) / 2) * 1000) / 10;

    return {
      monthlySalary,
      finalMonthlySalary: Math.round(finalMonthlySalary),
      dbTotal,
      dcTotal,
      diff,
      isDcBetter,
      breakevenReturn,
    };
  }, [monthlySalaryTenThousand, years, wageGrowthRate, investmentReturn, hasPeak, peakStartYear, peakCutRate]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              <span className="flex items-center gap-1">
                <Scale className="h-3.5 w-3.5" />
                {isKo ? '퇴직급여보장법 제13조·제19조' : 'Retirement Benefit Act'}
              </span>
            </Badge>
            <Badge variant="secondary">2026/2027</Badge>
          </div>
          <CardTitle>
            {isKo ? '퇴직연금 DB형 vs DC형 수익률 분기점 계산기' : 'Retirement Pension DB vs DC Calculator'}
          </CardTitle>
          <CardDescription>
            {isKo
              ? '임금상승률과 본인의 예상 투자수익률, 임금피크제를 반영하여 DB형과 DC형 중 어느 쪽이 퇴직금을 더 많이 받는지 시뮬레이션합니다.'
              : 'Compare DB and DC retirement pension outcomes based on wage growth, investment returns, and salary peak conditions.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="salary-input" className="text-sm font-medium">
                {isKo ? '현재 세전 월 급여 (만원)' : 'Current Monthly Salary (10k KRW)'}
              </label>
              <Input
                id="salary-input"
                type="number"
                value={monthlySalaryTenThousand}
                onChange={(e) => setMonthlySalaryTenThousand(Math.max(100, Number(e.target.value) || 0))}
                min={100}
                step={10}
              />
              <p className="text-xs text-muted-foreground">
                {isKo ? `연봉 약 ${(monthlySalaryTenThousand * 12).toLocaleString()}만원 수준` : 'Annual equivalent'}
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="years-input" className="text-sm font-medium">
                {isKo ? '예상 잔여 근속연수 (년)' : 'Expected Tenure (Years)'}
              </label>
              <Input
                id="years-input"
                type="number"
                value={years}
                onChange={(e) => setYears(Math.max(1, Math.min(40, Number(e.target.value) || 1)))}
                min={1}
                max={40}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="wage-growth-input" className="text-sm font-medium">
                {isKo ? '연평균 임금상승률 (%) [DB 기준]' : 'Annual Wage Growth Rate (%)'}
              </label>
              <Input
                id="wage-growth-input"
                type="number"
                value={wageGrowthRate}
                onChange={(e) => setWageGrowthRate(Number(e.target.value) || 0)}
                step={0.5}
              />
              <p className="text-xs text-muted-foreground">
                {isKo ? '기업 호봉 승급 및 물가 연동 임금 인상률' : 'Promotion & inflation adjustments'}
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="investment-return-input" className="text-sm font-medium">
                {isKo ? '개인 DC 연평균 투자수익률 (%)' : 'Personal DC Investment Return (%)'}
              </label>
              <Input
                id="investment-return-input"
                type="number"
                value={investmentReturn}
                onChange={(e) => setInvestmentReturn(Number(e.target.value) || 0)}
                step={0.5}
              />
              <p className="text-xs text-muted-foreground">
                {isKo ? 'TDF, 미국 ETF, 채권 혼합 등 포트폴리오 수익률' : 'Target portfolio return'}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {isKo ? '임금피크제 적용 여부' : 'Salary Peak System'}
              </span>
              <Button
                variant={hasPeak ? 'default' : 'outline'}
                size="sm"
                onClick={() => setHasPeak(!hasPeak)}
              >
                {hasPeak ? (isKo ? '적용 중' : 'Applied') : (isKo ? '미적용' : 'Not Applied')}
              </Button>
            </div>

            {hasPeak && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <label htmlFor="peak-start-input" className="text-xs font-medium">
                    {isKo ? '임금피크 적용 시작 연차' : 'Peak Start Year'}
                  </label>
                  <Input
                    id="peak-start-input"
                    type="number"
                    value={peakStartYear}
                    onChange={(e) => setPeakStartYear(Math.max(1, Number(e.target.value) || 1))}
                    min={1}
                    max={years}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="peak-cut-input" className="text-xs font-medium">
                    {isKo ? '연간 임금 삭감률 (%)' : 'Annual Salary Cut Rate (%)'}
                  </label>
                  <Input
                    id="peak-cut-input"
                    type="number"
                    value={peakCutRate}
                    onChange={(e) => setPeakCutRate(Math.max(1, Number(e.target.value) || 0))}
                    min={1}
                    max={50}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 시뮬레이션 결과 카드 */}
          <div className="p-4 bg-muted/60 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-semibold">
                  {isKo ? '퇴직연금 유형별 예상 수령액 비교' : 'Comparison Summary'}
                </span>
              </div>
              <Badge variant={result.isDcBetter ? 'default' : 'secondary'}>
                {result.isDcBetter ? (isKo ? 'DC형 추천' : 'DC Recommended') : (isKo ? 'DB형 추천' : 'DB Recommended')}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 border rounded-lg bg-background space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>{isKo ? 'DB형 (확정급여형)' : 'DB (Defined Benefit)'}</span>
                  </div>
                  <Badge variant="outline">{isKo ? '회사 운용' : 'Company Managed'}</Badge>
                </div>
                <div className="text-2xl font-bold tracking-tight">
                  {(result.dbTotal / 100000000).toFixed(2)}{isKo ? '억원' : ' 100M KRW'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isKo
                    ? `퇴직 시 최종 월급 ${(result.finalMonthlySalary / 10000).toLocaleString()}만원 × ${years}년`
                    : `Final salary ${(result.finalMonthlySalary / 10000).toFixed(0)} × ${years}y`}
                </p>
              </div>

              <div className="p-4 border rounded-lg bg-background space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-medium">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span>{isKo ? 'DC형 (확정기여형)' : 'DC (Defined Contribution)'}</span>
                  </div>
                  <Badge variant="outline">{isKo ? '근로자 운용' : 'Self Managed'}</Badge>
                </div>
                <div className="text-2xl font-bold tracking-tight">
                  {(result.dcTotal / 100000000).toFixed(2)}{isKo ? '억원' : ' 100M KRW'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isKo
                    ? `매년 1개월분 급여 적립 + 연 ${investmentReturn}% 복리 운용`
                    : `Annual contribution + ${investmentReturn}% compound`}
                </p>
              </div>
            </div>

            <div className="p-3 bg-background/80 rounded-lg border text-sm space-y-2">
              <div className="flex items-center justify-between font-medium">
                <span className="flex items-center gap-1">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  {isKo ? '손익분기점 DC 수익률' : 'Breakeven Return for DC'}
                </span>
                <span className="font-bold text-primary">
                  {isKo ? `연평균 ${result.breakevenReturn}%` : `${result.breakevenReturn}% / year`}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {isKo
                  ? `개인 운용 수익률이 연 ${result.breakevenReturn}%를 초과하면 DC형이 유리하고, 미달하면 DB형이 더 유리합니다.`
                  : `If your investment return exceeds ${result.breakevenReturn}%, DC is advantageous; otherwise DB is safer.`}
              </p>
            </div>

            {hasPeak && (
              <div className="flex items-start gap-2 p-3 bg-muted rounded-lg border text-xs text-muted-foreground">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <span>
                  {isKo
                    ? '⚠️ 주의: 임금피크제 적용 기업에서는 임금이 삭감되기 직전(피크 직전 해)에 반드시 DB형에서 DC형으로 전환해야 기존 높은 월급 기준의 퇴직금을 온전히 보전받을 수 있습니다.'
                    : 'Notice: Switch from DB to DC before salary peak cut to preserve past accumulated benefits.'}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      </Card>
    </div>
  );
}

export default RetirementPensionDbDcCalculator;
