import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Sparkles, ShieldAlert, Award, Briefcase, CheckCircle2 } from 'lucide-react';

export function FamilyBusinessInheritanceGuard({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [businessYears, setBusinessYears] = useState(25); // 경영 연수
  const [estateValueHundredMillions, setEstateValueHundredMillions] = useState(420); // 가업 자산 (억원)
  const [annualSalesHundredMillions, setAnnualSalesHundredMillions] = useState(800); // 연매출 (억원)
  const [isSuccessorReady, setIsSuccessorReady] = useState(true); // 후계자 2년 종사

  const result = useMemo(() => {
    const estate = estateValueHundredMillions * 100000000;
    const isScaleOk = annualSalesHundredMillions < 5000;
    const isYearsOk = businessYears >= 10;

    let maxCap = 0;
    if (businessYears >= 30) maxCap = 60000000000;
    else if (businessYears >= 20) maxCap = 40000000000;
    else if (businessYears >= 10) maxCap = 30000000000;

    const isEligible = isScaleOk && isYearsOk && isSuccessorReady;
    const deduction = isEligible ? Math.min(estate, maxCap) : 0;
    const taxSavings = Math.round(deduction * 0.50);

    return {
      estate,
      maxCap,
      isScaleOk,
      isYearsOk,
      isEligible,
      deduction,
      taxSavings,
    };
  }, [businessYears, estateValueHundredMillions, annualSalesHundredMillions, isSuccessorReady]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {isKo ? '🏢 가업상속공제(최대 600억원) 적격성 & 5년 사후관리 가드' : '🏢 Family Business Estate Deduction (Up to 60B KRW) Guard'}
              </CardTitle>
              <CardDescription>
                {isKo
                  ? '상증세법 제18조의2 피상속인 경영기간별 공제한도(10년 300억, 20년 400억, 30년 600억) 및 5년 사후관리 위반 추징 리스크를 진단합니다.'
                  : 'Evaluate family business succession tax deduction up to 60B KRW and 5-year post-management compliance in Korea.'}
              </CardDescription>
            </div>
            <Badge variant={result.isEligible ? 'outline' : 'destructive'}>
              {result.isEligible
                ? (isKo ? `최대 ${(result.maxCap / 100000000).toLocaleString()}억 공제 가능` : `Up to ${(result.maxCap / 100000000).toLocaleString()}B KRW`)
                : (isKo ? '요건 보완 필요' : 'Ineligible')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '피상속인(부모) 대표이사 경영 기간 (년)' : 'Years of Management by Parent'}
                </label>
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={businessYears}
                  onChange={(e) => setBusinessYears(Math.max(1, Number(e.target.value) || 0))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {isKo ? '10년(300억), 20년(400억), 30년 이상(600억원 한도)' : '10y (30B), 20y (40B), 30y (60B)'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '가업 상속 자산 평가액 (억원)' : 'Family Business Asset Valuation (100M KRW)'}
                </label>
                <Input
                  type="number"
                  min={10}
                  max={2000}
                  value={estateValueHundredMillions}
                  onChange={(e) => setEstateValueHundredMillions(Math.max(1, Number(e.target.value) || 0))}
                />
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '직전 3개년 평균 연간 매출액 (억원)' : '3-Year Average Revenue (100M KRW)'}
                </label>
                <Input
                  type="number"
                  min={10}
                  max={10000}
                  value={annualSalesHundredMillions}
                  onChange={(e) => setAnnualSalesHundredMillions(Math.max(1, Number(e.target.value) || 0))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {isKo ? '중소기업 또는 매출액 5,000억원 미만 중견기업 대상' : 'Revenue under 500B KRW required'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '후계자(상속인) 2년 이상 가업 종사 여부' : 'Successor 2+ Years Service Met'}
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={isSuccessorReady ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setIsSuccessorReady(true)}
                  >
                    {isKo ? '2년 이상 종사 (임원)' : 'Satisfied'}
                  </Button>
                  <Button
                    variant={!isSuccessorReady ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setIsSuccessorReady(false)}
                  >
                    {isKo ? '종사기간 미달' : 'Not Met'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4 space-y-1 bg-muted/20">
                <div className="text-xs text-muted-foreground">{isKo ? '법정 가업공제 한도' : 'Statutory Deduction Cap'}</div>
                <div className="text-xl font-bold">
                  {(result.maxCap / 100000000).toLocaleString()} {isKo ? '억원' : '100M KRW'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isKo ? `경영기간 ${businessYears}년 인정` : `Based on ${businessYears}y`}
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-1 bg-muted/20">
                <div className="text-xs text-muted-foreground">{isKo ? '적용 가업상속공제액' : 'Applicable Deduction'}</div>
                <div className="text-2xl font-bold text-primary">
                  {(result.deduction / 100000000).toLocaleString()} {isKo ? '억원' : '100M KRW'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {result.isEligible ? (isKo ? '과세가액 전액 공제' : 'Deducted') : (isKo ? '적격 요건 미달' : 'Ineligible')}
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-1 bg-primary/5 border-primary/20">
                <div className="text-xs text-muted-foreground">{isKo ? '상속세 절감 효과 (50%)' : 'Estate Tax Savings (50%)'}</div>
                <div className="text-2xl font-bold text-primary">
                  {(result.taxSavings / 100000000).toLocaleString()} {isKo ? '억원 절세' : '100M KRW'}
                </div>
                <div className="text-xs text-muted-foreground">{isKo ? '최고세율 50% 기준' : 'At 50% rate'}</div>
              </div>
            </div>

            {/* 5-Year Post-Management Checklist */}
            <div className="rounded-lg border p-4 space-y-3 bg-muted/10">
              <div className="font-semibold text-sm flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-destructive" />
                {isKo ? '🚨 상속 후 5년간 사후관리 의무 (위반 시 상속세 전액 추징!)' : '5-Year Post-Management Mandatory Rules'}
              </div>
              <ul className="list-disc pl-4 space-y-1 text-xs text-muted-foreground">
                <li>
                  <strong>{isKo ? '자산 유지' : 'Asset Maintenance'}:</strong> {isKo ? '상속개시일로부터 5년간 가업용 자산의 40% 이상을 처분할 수 없습니다.' : 'Do not dispose of >=40% of business assets.'}
                </li>
                <li>
                  <strong>{isKo ? '고용 유지' : 'Employment Retention'}:</strong> {isKo ? '5년 통산 정규직 근로자 수가 기준의 90% 이상 유지되어야 합니다 (매년 80% 이상).' : 'Maintain 90% of aggregate workforce over 5 years.'}
                </li>
                <li>
                  <strong>{isKo ? '대표이사 직 유지' : 'CEO Role'}:</strong> {isKo ? '상속인은 상속세 신고기한까지 임원에 취임하고 2년 내 대표이사에 취임하여 5년간 유지해야 합니다.' : 'Successor must hold CEO position for 5 years.'}
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default FamilyBusinessInheritanceGuard;
