import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HeartPulse, ShieldCheck, Coins, CheckCircle2 } from 'lucide-react';

const MINIMUM_DAILY_COMPENSATION_2026 = 80240;

export function IndustrialAccidentWageLossCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [monthlyWageManwon, setMonthlyWageManwon] = useState<number>(360);
  const [leaveDays, setLeaveDays] = useState<number>(90);
  const [nonReimbursedMedicalManwon, setNonReimbursedMedicalManwon] = useState<number>(400);
  const [employerFaultRate, setEmployerFaultRate] = useState<number>(80);

  const monthlyWage = monthlyWageManwon * 10000;
  const nonReimbursedMedical = nonReimbursedMedicalManwon * 10000;

  const result = useMemo(() => {
    const dailyAverageWage = Math.round(monthlyWage / 30);
    const statutoryDailyRate = Math.round(dailyAverageWage * 0.7);
    const dailyLeavePay = Math.max(statutoryDailyRate, MINIMUM_DAILY_COMPENSATION_2026);

    const totalSanjaeLeavePay = dailyLeavePay * leaveDays;
    const totalGrossLostWage = dailyAverageWage * leaveDays;
    const grossLostWageResidual = Math.max(0, totalGrossLostWage - totalSanjaeLeavePay);

    const faultDecimal = Math.min(100, Math.max(0, employerFaultRate)) / 100;
    const claimableWageLoss = Math.round(grossLostWageResidual * faultDecimal);
    const claimableMedical = Math.round(nonReimbursedMedical * faultDecimal);
    const totalCivilClaim = claimableWageLoss + claimableMedical;

    return {
      dailyAverageWage,
      dailyLeavePay,
      totalSanjaeLeavePay,
      grossLostWageResidual,
      claimableWageLoss,
      claimableMedical,
      totalCivilClaim,
      grandTotal: totalSanjaeLeavePay + totalCivilClaim,
    };
  }, [monthlyWage, leaveDays, nonReimbursedMedical, employerFaultRate]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* 헤더 */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
          <HeartPulse className="h-3.5 w-3.5" />
          <span>{isKo ? '산재보험법 제52조 및 민법 제750조' : 'Industrial Accident & Tort Compensation'}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {isKo ? '산재 휴업급여 및 사업주 손해배상 차액 계산기' : 'Workers Comp & Employer Liability Calculator'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isKo
            ? '근로복지공단 산재 휴업급여(70%)와 사업주 과실에 따른 잔여 일실수입(30%) 및 비급여 치료비 손해배상액을 통합 계산합니다.'
            : 'Calculate statutory 70% workers comp wage loss and residual tort liability from employer negligence.'}
        </p>
      </div>

      {/* 입력 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>{isKo ? '임금 및 산재 요양 정보 입력' : 'Wage & Accident Information'}</CardTitle>
          <CardDescription>
            {isKo
              ? '사고 전 세전 월평균 임금과 요양 기간, 비급여 치료비, 사업주 과실 비율을 입력하세요.'
              : 'Enter gross monthly wage, leave duration, medical expenses, and fault ratio.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isKo ? '사고 전 세전 월평균 임금' : 'Pre-Accident Monthly Wage'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={monthlyWageManwon}
                  onChange={(e) => setMonthlyWageManwon(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">만원</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isKo ? '산재 요양/휴업 일수' : 'Leave / Treatment Days'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={leaveDays}
                  onChange={(e) => setLeaveDays(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">일간</span>
              </div>
              <div className="flex gap-1">
                {[30, 60, 90, 180].map((d) => (
                  <Button
                    key={d}
                    variant={leaveDays === d ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLeaveDays(d)}
                  >
                    {d}일
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isKo ? '산재 미보상 비급여 치료비' : 'Non-Reimbursed Medical Fees'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={nonReimbursedMedicalManwon}
                  onChange={(e) => setNonReimbursedMedicalManwon(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">만원</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {isKo ? '도수치료, 비급여 MRI, 선택진료비, 상급병실료 차액 등' : 'Physical therapy, non-covered MRI, private room fees'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isKo ? '사업주 책임/과실 비율' : 'Employer Fault Ratio'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={employerFaultRate}
                  onChange={(e) => setEmployerFaultRate(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">%</span>
              </div>
              <div className="flex gap-1">
                {[50, 70, 80, 100].map((rate) => (
                  <Button
                    key={rate}
                    variant={employerFaultRate === rate ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setEmployerFaultRate(rate)}
                  >
                    {rate}%
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
                <span className="text-xs text-muted-foreground">{isKo ? '산재 휴업급여 (공단 수령)' : 'Workers Comp (70%)'}</span>
                <Badge variant="secondary">{isKo ? '전액 비과세' : 'Tax-Exempt'}</Badge>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {(result.totalSanjaeLeavePay / 10000).toLocaleString()}만원
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                1일 {result.dailyLeavePay.toLocaleString()}원 x {leaveDays}일
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '사업주 민사 손해배상' : 'Employer Liability Claim'}</span>
                <Coins className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {(result.totalCivilClaim / 10000).toLocaleString()}만원
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                잔여일실수입 {(result.claimableWageLoss / 10000).toLocaleString()}만 + 비급여 {(result.claimableMedical / 10000).toLocaleString()}만
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '총 보상 수령 예상액' : 'Grand Total Compensation'}</span>
                <ShieldCheck className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {(result.grandTotal / 10000).toLocaleString()}만원
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                산재 휴업급여 + 사업주 민사 합의/판결
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 종합 진단 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>{isKo ? '산재 보상 vs 민사 손해배상 법리 가이드' : 'Workers Comp vs Tort Recovery Guide'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                <span>{isKo ? '산재 승인 후에도 사업주 추가 배상 청구 가능' : 'Civil Tort Claims Remain Available Post-Comp'}</span>
              </div>
              <p className="text-xs">
                많은 재해 근로자가 '산재 처리를 받으면 끝'이라고 생각하지만, 산재보험은 과실을 불문하고 정률(70%)만 지급하므로 <strong>나머지 30%의 일실수입과 비급여 치료비</strong>는 근로복지공단에서 나오지 않습니다.
              </p>
              <p className="text-xs">
                사업주가 안전모 미지급, 안전난간 미설치 등 안전배려의무를 위반한 경우, 사업주 과실 비율({employerFaultRate}%)에 해당하는 잔여 일실수입({(result.claimableWageLoss / 10000).toLocaleString()}만원)과 비급여 치료비({(result.claimableMedical / 10000).toLocaleString()}만원), 그리고 별도의 정신적 위자료를 회사(또는 회사의 근재보험)에 추가 청구할 수 있습니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
