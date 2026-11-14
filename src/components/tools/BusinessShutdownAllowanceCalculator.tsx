import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';

export function BusinessShutdownAllowanceCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [avgWageTenThousand, setAvgWageTenThousand] = useState<number>(350); // 월 평균임금 350만원
  const [ordWageTenThousand, setOrdWageTenThousand] = useState<number>(300); // 월 통상임금 300만원
  const [days, setDays] = useState<number>(14); // 휴업 일수 14일
  const [isFiveOrMore, setIsFiveOrMore] = useState<boolean>(true); // 5인 이상

  const result = useMemo(() => {
    const monthlyAvg = avgWageTenThousand * 10000;
    const monthlyOrd = ordWageTenThousand * 10000;

    const dailyAvg = Math.round(monthlyAvg / 30);
    const dailyOrd = Math.round((monthlyOrd / 209) * 8);

    if (!isFiveOrMore) {
      return {
        dailyAvg,
        dailyOrd,
        dailyAllowance: 0,
        totalAllowance: 0,
        isFiveOrMore: false,
        ruleText: isKo ? '5인 미만 사업장 법정 적용 제외' : 'Exempt (<5 employees)',
      };
    }

    const seventyAvg = Math.round(dailyAvg * 0.70);
    let dailyAllowance = seventyAvg;
    let ruleText = isKo ? '평균임금의 70% 적용' : '70% of Average Wage';

    if (seventyAvg > dailyOrd) {
      dailyAllowance = dailyOrd;
      ruleText = isKo ? '통상임금 한도 적용 (평균임금 70% > 통상임금)' : 'Ordinary Wage Cap Applied';
    }

    const totalAllowance = dailyAllowance * days;

    return {
      dailyAvg,
      dailyOrd,
      dailyAllowance,
      totalAllowance,
      isFiveOrMore: true,
      ruleText,
    };
  }, [avgWageTenThousand, ordWageTenThousand, days, isFiveOrMore, isKo]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              <span className="flex items-center gap-1">
                <Building className="h-3.5 w-3.5" />
                {isKo ? '근로기준법 제46조' : 'Labor Standards Act'}
              </span>
            </Badge>
            <Badge variant="secondary">{isKo ? '평균임금 70% 보장' : '70% Guarantee'}</Badge>
          </div>
          <CardTitle>
            {isKo
              ? '근로기준법 제46조 휴업수당 (평균임금 70%) 계산기'
              : 'Statutory Business Shutdown Allowance Calculator'}
          </CardTitle>
          <CardDescription>
            {isKo
              ? '회사 사정(경영 악화, 시설 공사 등 사용자 귀책사유)으로 휴업 시 법적으로 보장되는 평균임금 70%(또는 통상임금 한도) 휴업수당과 총 체불 임금을 계산합니다.'
              : 'Calculate statutory shutdown allowance (70% of average wage) under Korean Labor Law.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="avg-wage-input" className="text-sm font-medium">
                  {isKo ? '최근 3개월 월 평균임금 (만원)' : 'Monthly Average Wage (10k KRW)'}
                </label>
                <Input
                  id="avg-wage-input"
                  type="number"
                  value={avgWageTenThousand}
                  onChange={(e) => setAvgWageTenThousand(Math.max(100, Number(e.target.value) || 0))}
                  step={10}
                  min={100}
                />
                <p className="text-xs text-muted-foreground">
                  {isKo ? `1일 평균임금 약 ${(result.dailyAvg).toLocaleString()}원` : 'Daily average wage'}
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="ord-wage-input" className="text-sm font-medium">
                  {isKo ? '월 통상임금 (기본급+고정수당, 만원)' : 'Monthly Ordinary Wage (10k KRW)'}
                </label>
                <Input
                  id="ord-wage-input"
                  type="number"
                  value={ordWageTenThousand}
                  onChange={(e) => setOrdWageTenThousand(Math.max(100, Number(e.target.value) || 0))}
                  step={10}
                  min={100}
                />
                <p className="text-xs text-muted-foreground">
                  {isKo ? `1일 통상임금(8시간) 약 ${(result.dailyOrd).toLocaleString()}원` : 'Daily ordinary wage (8h)'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
              <div className="space-y-2">
                <label htmlFor="days-input" className="text-sm font-medium">
                  {isKo ? '회사 휴업 일수 (일)' : 'Shutdown Days'}
                </label>
                <Input
                  id="days-input"
                  type="number"
                  value={days}
                  onChange={(e) => setDays(Math.max(1, Number(e.target.value) || 1))}
                  min={1}
                />
                <p className="text-xs text-muted-foreground">
                  {isKo ? '휴업이 발생한 총 일수 (유급휴일 포함)' : 'Total days on shutdown'}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">{isKo ? '사업장 상시근로자 수' : 'Company Size'}</span>
                <div className="flex gap-2">
                  <Button
                    variant={isFiveOrMore ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setIsFiveOrMore(true)}
                  >
                    {isKo ? '5인 이상 (법정 의무 적용)' : '>= 5 Employees'}
                  </Button>
                  <Button
                    variant={!isFiveOrMore ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setIsFiveOrMore(false)}
                  >
                    {isKo ? '5인 미만 (법정 제외)' : '< 5 Employees'}
                  </Button>
                </div>
              </div>
            </div>

            {/* 계산 결과 카드 */}
            <div className="p-4 bg-muted/60 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{isKo ? '법정 휴업수당 산출 결과' : 'Allowance Verdict'}</span>
                </div>
                <Badge variant={result.isFiveOrMore ? 'default' : 'secondary'}>
                  {result.isFiveOrMore ? (isKo ? '법정 지급 대상 ✅' : 'Mandatory') : (isKo ? '5인 미만 제외 ⚠️' : 'Exempt')}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-background space-y-2">
                  <span className="text-xs text-muted-foreground">{isKo ? '1일당 법정 휴업수당' : 'Daily Allowance'}</span>
                  <div className="text-2xl font-bold tracking-tight">
                    {(result.dailyAllowance).toLocaleString()}{isKo ? '원 / 일' : ' KRW/day'}
                  </div>
                  <p className="text-xs text-muted-foreground">• {result.ruleText}</p>
                </div>

                <div className="p-4 border rounded-lg bg-background space-y-2">
                  <span className="text-xs text-muted-foreground">
                    {isKo ? `총 지급받을 법정 휴업수당 (${days}일치)` : 'Total Payable Allowance'}
                  </span>
                  <div className="text-2xl font-bold tracking-tight text-primary">
                    {(result.totalAllowance).toLocaleString()}{isKo ? '원' : ' KRW'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isKo ? '회사 사정으로 쉰 기간 동안 보장되는 최소 법정 임금입니다.' : 'Minimum legal compensation during shutdown.'}
                  </p>
                </div>
              </div>

              {!result.isFiveOrMore ? (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border text-xs text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>
                    {isKo
                      ? '5인 미만 사업장은 근로기준법상 휴업수당 의무가 제외됩니다. 단, 사업주 귀책으로 일하지 못한 경우 민법 제538조에 근거한 임금 청구 가능성을 노무사와 상담해야 합니다.'
                      : 'Exempt under labor standards act, but civil code claims may apply.'}
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-background rounded-lg border text-xs text-muted-foreground space-y-1">
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    {isKo ? '무급 휴직 강요 대처법' : 'Rights Defense'}
                  </span>
                  <p>
                    {isKo
                      ? '사업주가 "경영이 어려우니 무급으로 쉬어라"라고 일방적으로 통보하는 것은 불법입니다. 근로자가 동의하지 않는 한 최소 평균임금의 70%(또는 통상임금)의 휴업수당이 발생하며, 미지급 시 고용노동부에 임금체불 진정을 제기할 수 있습니다.'
                      : 'Unilateral unpaid leave without worker consent is illegal wage theft.'}
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

export default BusinessShutdownAllowanceCalculator;
