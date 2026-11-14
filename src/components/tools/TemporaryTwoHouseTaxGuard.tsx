import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Home, Sparkles, AlertTriangle, ShieldCheck, Calendar } from 'lucide-react';

function getStandardRate(price: number): number {
  if (price <= 600000000) return 0.011;
  if (price <= 900000000) {
    const rate = ((price * (2 / 300000000) - 3) / 100);
    return rate * 1.1;
  }
  return 0.033;
}

export function TemporaryTwoHouseTaxGuard({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [priceHundredMillions, setPriceHundredMillions] = useState<number>(8.0); // 신규 주택 8억원
  const [acquisitionDate, setAcquisitionDate] = useState<string>('2024-06-15');
  const [isAdjusted, setIsAdjusted] = useState<boolean>(true); // 조정지역
  const [isSold, setIsSold] = useState<boolean>(false);

  const result = useMemo(() => {
    const price = Math.round(priceHundredMillions * 100000000);
    const acq = new Date(acquisitionDate);
    const deadline = new Date(acq);
    deadline.setFullYear(deadline.getFullYear() + 3);

    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const isOverdue = remainingDays < 0;

    const stdRate = getStandardRate(price);
    const paidTax = Math.round(price * stdRate);

    const heavyRate = isAdjusted ? 0.084 : stdRate;
    const heavyTax = Math.round(price * heavyRate);
    const diff = Math.max(0, heavyTax - paidTax);

    const penaltyDays = isOverdue ? Math.abs(remainingDays) : 365 * 3;
    const underReportPenalty = Math.round(diff * 0.10);
    const latePenalty = Math.round(diff * 0.00022 * penaltyDays);
    const totalPenalty = underReportPenalty + latePenalty;
    const totalClawback = diff + totalPenalty;

    return {
      deadlineStr: deadline.toISOString().split('T')[0],
      remainingDays,
      isOverdue,
      paidTax,
      heavyTax,
      diff,
      totalPenalty,
      totalClawback,
    };
  }, [priceHundredMillions, acquisitionDate, isAdjusted]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              <span className="flex items-center gap-1">
                <Home className="h-3.5 w-3.5" />
                {isKo ? '지방세법 시행령 제28조의5' : 'Local Tax Act'}
              </span>
            </Badge>
            <Badge variant="secondary">{isKo ? '3년 처분 기한' : '3-Year Rule'}</Badge>
          </div>
          <CardTitle>
            {isKo
              ? '일시적 2주택 취득세 3년 처분기한 & 중과세율(8%) 추징 가드'
              : 'Temporary 2-Home Acquisition Tax Clawback Guard'}
          </CardTitle>
          <CardDescription>
            {isKo
              ? '일시적 2주택 신규 주택 취득 후 3년 내 종전 주택 미처분 시 소급 부과되는 2주택 중과세율(8%) 및 가산세 추징을 진단하고 D-Day를 추적합니다.'
              : 'Track the 3-year deadline to dispose of previous home and prevent heavy tax clawback.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="price-input" className="text-sm font-medium">
                  {isKo ? '신규 취득 주택 매매가액 (억원)' : 'New Home Purchase Price (100M KRW)'}
                </label>
                <Input
                  id="price-input"
                  type="number"
                  value={priceHundredMillions}
                  onChange={(e) => setPriceHundredMillions(Math.max(0.1, Number(e.target.value) || 0))}
                  step={0.1}
                  min={0.1}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="date-input" className="text-sm font-medium">
                  {isKo ? '신규 주택 취득일 (잔금일 / 등기일)' : 'Acquisition Date'}
                </label>
                <Input
                  id="date-input"
                  type="date"
                  value={acquisitionDate}
                  onChange={(e) => setAcquisitionDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium">{isKo ? '신규 주택 규제지역 여부' : 'Adjusted Area'}</span>
                  <p className="text-xs text-muted-foreground">{isKo ? '강남·서초·송파·용산구 해당' : 'Gangnam, Seocho, Songpa, Yongsan'}</p>
                </div>
                <Button
                  variant={isAdjusted ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIsAdjusted(!isAdjusted)}
                >
                  {isAdjusted ? (isKo ? '조정대상지역 (8% 중과)' : 'Adjusted Area') : (isKo ? '비조정대상지역' : 'Non-adjusted')}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium">{isKo ? '종전 주택 처분 완료 여부' : 'Previous Home Disposed'}</span>
                  <p className="text-xs text-muted-foreground">{isKo ? '이미 매도 잔금/등기 완료' : 'Already sold'}</p>
                </div>
                <Button
                  variant={isSold ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIsSold(!isSold)}
                >
                  {isSold ? (isKo ? '매도 완료 (안전) ✅' : 'Sold') : (isKo ? '보유 중 (매도 필요) ⏳' : 'Holding')}
                </Button>
              </div>
            </div>

            {/* 추징 진단 카드 */}
            <div className="p-4 bg-muted/60 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{isKo ? '3년 처분기한 추적 & 추징 리스크' : 'Clawback Risk Analysis'}</span>
                </div>
                <Badge variant={isSold ? 'default' : (result.isOverdue ? 'destructive' : 'secondary')}>
                  {isSold
                    ? (isKo ? '처분 완료 안전 ✅' : 'Safe')
                    : (result.isOverdue ? (isKo ? '기한 경과 추징 🚨' : 'Overdue') : (isKo ? `D-${result.remainingDays}일 남음 ⏳` : `D-${result.remainingDays}d`))}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 border rounded-lg bg-background space-y-1">
                  <span className="text-xs text-muted-foreground">{isKo ? '3년 법정 처분 마감일' : 'Disposal Deadline'}</span>
                  <div className="text-base font-bold flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{result.deadlineStr}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{isKo ? '신규 취득일로부터 정확히 3년' : '3 years from purchase'}</p>
                </div>

                <div className="p-3 border rounded-lg bg-background space-y-1">
                  <span className="text-xs text-muted-foreground">{isKo ? '기납부 일반세율 취득세' : 'Paid Acquisition Tax'}</span>
                  <div className="text-base font-bold">
                    {(result.paidTax / 10000).toLocaleString()}{isKo ? '만원' : ' 10k KRW'}
                  </div>
                  <p className="text-xs text-muted-foreground">{isKo ? '1주택 기본세율 적용' : 'Standard 1-home rate'}</p>
                </div>

                <div className="p-3 border rounded-lg bg-background space-y-1">
                  <span className="text-xs text-muted-foreground">{isKo ? '미처분 시 총 추징세액' : 'Estimated Clawback'}</span>
                  <div className="text-base font-bold text-destructive">
                    {(result.totalClawback / 10000).toLocaleString()}{isKo ? '만원' : ' 10k KRW'}
                  </div>
                  <p className="text-xs text-muted-foreground">{isKo ? '본세 차액 + 가산세 합계' : 'Tax gap + penalties'}</p>
                </div>
              </div>

              <div className="p-3 bg-background rounded-lg border text-sm space-y-1.5">
                <div className="flex items-center justify-between font-medium">
                  <span className="flex items-center gap-1.5">
                    {isSold ? <ShieldCheck className="h-4 w-4 text-primary" /> : <AlertTriangle className="h-4 w-4 text-destructive" />}
                    {isKo ? '실무 대응 가이드' : 'Action Guide'}
                  </span>
                  <span className="font-semibold text-xs text-muted-foreground">
                    {isSold ? (isKo ? '안전 완료' : 'Complete') : (isKo ? `마감일까지 D-${result.remainingDays}일` : 'In Progress')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isSold
                    ? (isKo ? '종전 주택이 3년 기한 내에 정상 처분되어 취득세 중과세율 추징 위험이 완전히 소멸되었습니다.' : 'Previous home sold within 3 years.')
                    : (isKo ? `마감일(${result.deadlineStr})까지 종전 주택의 매매 잔금 청산 또는 소유권이전등기를 완료하지 못하면 과소신고가산세(10%)와 매일 가산되는 납부지연가산세가 합산 추징되므로 여유 있게 매도를 진행해야 합니다.` : 'Previous home must be disposed before deadline to avoid heavy clawback.')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TemporaryTwoHouseTaxGuard;
