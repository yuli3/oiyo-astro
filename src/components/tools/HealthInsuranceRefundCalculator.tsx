import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HeartPulse, Sparkles, ShieldCheck, DollarSign, AlertCircle } from 'lucide-react';

const DECILE_TABLE: Record<number, { standard: number; nursingLong: number; nameKo: string; nameEn: string }> = {
  1: { standard: 870000, nursingLong: 1340000, nameKo: '1분위 (하위 10%)', nameEn: 'Decile 1 (Bottom 10%)' },
  2: { standard: 1080000, nursingLong: 1680000, nameKo: '2~3분위 (하위 10~30%)', nameEn: 'Decile 2-3 (10-30%)' },
  3: { standard: 1080000, nursingLong: 1680000, nameKo: '2~3분위 (하위 10~30%)', nameEn: 'Decile 2-3 (10-30%)' },
  4: { standard: 1620000, nursingLong: 2320000, nameKo: '4~5분위 (중위 30~50%)', nameEn: 'Decile 4-5 (30-50%)' },
  5: { standard: 1620000, nursingLong: 2320000, nameKo: '4~5분위 (중위 30~50%)', nameEn: 'Decile 4-5 (30-50%)' },
  6: { standard: 3030000, nursingLong: 3600000, nameKo: '6~7분위 (중위 50~70%)', nameEn: 'Decile 6-7 (50-70%)' },
  7: { standard: 3030000, nursingLong: 3600000, nameKo: '6~7분위 (중위 50~70%)', nameEn: 'Decile 6-7 (50-70%)' },
  8: { standard: 4140000, nursingLong: 4140000, nameKo: '8분위 (상위 20~30%)', nameEn: 'Decile 8 (70-80%)' },
  9: { standard: 4970000, nursingLong: 4970000, nameKo: '9분위 (상위 10~20%)', nameEn: 'Decile 9 (80-90%)' },
  10: { standard: 10140000, nursingLong: 10140000, nameKo: '10분위 (상위 10%)', nameEn: 'Decile 10 (Top 10%)' },
};

export function HealthInsuranceRefundCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [copayMillions, setCopayMillions] = useState(6.5); // 1년간 급여 본인부담금 (백만원)
  const [decile, setDecile] = useState(4); // 소득분위 (1~10)
  const [isNursingLong, setIsNursingLong] = useState(false); // 요양병원 120일 초과

  const result = useMemo(() => {
    const copay = copayMillions * 1000000;
    const info = DECILE_TABLE[decile] || DECILE_TABLE[4];
    const cap = isNursingLong ? info.nursingLong : info.standard;
    const refund = Math.max(0, copay - cap);

    return {
      copay,
      cap,
      refund,
      isRefund: refund > 0,
      decileName: isKo ? info.nameKo : info.nameEn,
    };
  }, [copayMillions, decile, isNursingLong, isKo]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {isKo ? '🏥 국민건강보험 본인부담상한제 사후환급금 계산기' : '🏥 Korea National Health Insurance Out-of-Pocket Cap Refund Calculator'}
              </CardTitle>
              <CardDescription>
                {isKo
                  ? '건강보험법 제44조에 따라 1년간 지출한 급여 병원비 중 소득분위 상한액을 초과한 금액을 전액 현금 환급받는 액수를 계산합니다.'
                  : 'Calculate annual health insurance co-pay refunds exceeding personal income decile caps in Korea.'}
              </CardDescription>
            </div>
            <Badge variant={result.isRefund ? 'outline' : 'secondary'}>
              {result.isRefund ? (isKo ? '환급 대상 🌟' : 'Refund Eligible') : (isKo ? '상한액 미도달' : 'Under Cap')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '1년간 건강보험 급여 본인부담금 (백만원)' : 'Annual Covered Medical Co-pay (Million KRW)'}
                </label>
                <Input
                  type="number"
                  min={0.1}
                  max={100}
                  step={0.5}
                  value={copayMillions}
                  onChange={(e) => setCopayMillions(Math.max(0, Number(e.target.value) || 0))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {isKo ? '영수증상 "급여 본인부담금" 합계 (비급여 제외)' : 'Sum of covered co-pays only'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '건강보험료 소득구간 (1~10분위)' : 'Income Decile (1-10)'}
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 4, 6, 8, 9, 10].map((d) => (
                    <Button
                      key={d}
                      variant={decile === d ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDecile(d)}
                    >
                      {d}분위
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {isKo ? `선택: ${result.decileName}` : `Selected: ${result.decileName}`}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium pb-1.5 block">
                {isKo ? '요양병원 120일 초과 입원 여부' : 'Nursing Hospital Stay > 120 Days'}
              </label>
              <div className="flex gap-2">
                <Button
                  variant={!isNursingLong ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setIsNursingLong(false)}
                >
                  {isKo ? '일반 진료/입원 (일반 상한선 적용)' : 'General Medical'}
                </Button>
                <Button
                  variant={isNursingLong ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setIsNursingLong(true)}
                >
                  {isKo ? '요양병원 120일 초과 장기입원' : 'Nursing Hospital >120 Days'}
                </Button>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4 space-y-1 bg-muted/20">
                <div className="text-xs text-muted-foreground">{isKo ? '지출 급여 병원비' : 'Total Co-Pay'}</div>
                <div className="text-xl font-bold">
                  {(result.copay / 10000).toLocaleString()} {isKo ? '만원' : '10k KRW'}
                </div>
                <div className="text-xs text-muted-foreground">{isKo ? '연간 합산' : 'Annual sum'}</div>
              </div>

              <div className="rounded-lg border p-4 space-y-1 bg-muted/20">
                <div className="text-xs text-muted-foreground">{isKo ? '내 소득분위 법정 상한액' : 'Legal Decile Cap'}</div>
                <div className="text-xl font-bold">
                  {(result.cap / 10000).toLocaleString()} {isKo ? '만원' : '10k KRW'}
                </div>
                <div className="text-xs text-muted-foreground">{result.decileName}</div>
              </div>

              <div className="rounded-lg border p-4 space-y-1 bg-primary/5 border-primary/20">
                <div className="text-xs text-muted-foreground">{isKo ? '건보공단 현금 환급액' : 'Cash Refund Due'}</div>
                <div className="text-2xl font-bold text-primary">
                  {(result.refund / 10000).toLocaleString()} {isKo ? '만원 환급' : '10k KRW'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {result.isRefund ? (isKo ? '공단에서 전액 입금 🌟' : 'Full refund from NHIS') : (isKo ? '상한액 이하' : 'Zero refund')}
                </div>
              </div>
            </div>

            {/* Claim Instruction */}
            {result.isRefund && (
              <div className="rounded-lg border p-4 space-y-2 bg-primary/5 border-primary/20">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">
                    {isKo ? '💡 국민건강보험공단 사후환급금 수령 방법' : 'How to Claim Your Refund'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isKo
                    ? `매년 8월경 국민건강보험공단에서 발송하는 환급금 지급신청 안내문을 기다리거나, 지금 즉시 국민건강보험공단 홈페이지 또는 모바일 "The건강보험" 앱(민원여기요 > 환급금 조회/신청)에서 ${(result.refund / 10000).toLocaleString()}만원을 직접 조회하고 계좌로 입금받을 수 있습니다 (소멸시효 3년).`
                    : 'Check your refund via the NHIS website or "The NHIS" mobile app within 3 years.'}
                </p>
              </div>
            )}

            {/* Educational Defense Guide */}
            <div className="rounded-lg border p-4 text-xs space-y-2 bg-muted/10 text-muted-foreground">
              <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                {isKo ? '본인부담상한제 3대 필수 상식' : '3 Key Rules for Co-Pay Cap'}
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong>{isKo ? '비급여 제외' : 'Excluding Non-Covered'}:</strong> {isKo ? '도수치료, 비급여 주사, 상급병실료, 치과 임플란트 등 건강보험이 적용되지 않는 비급여는 산정 대상이 아닙니다.' : 'Non-covered treatments are excluded.'}
                </li>
                <li>
                  <strong>{isKo ? '3년 소멸시효' : '3-Year Expiration'}:</strong> {isKo ? '지급 신청을 하지 않고 3년이 지나면 권리가 소멸되어 국가로 귀속되므로 최근 3개년치 환급금을 반드시 조회하세요.' : 'Unclaimed refunds expire after 3 years.'}
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default HealthInsuranceRefundCalculator;
