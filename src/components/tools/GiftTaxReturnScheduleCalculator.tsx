import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, AlertTriangle, CheckCircle2, Percent, Sparkles } from 'lucide-react';

export function GiftTaxReturnScheduleCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [type, setType] = useState<'gift' | 'inheritance'>('gift');
  const [eventDate, setEventDate] = useState<string>('2026-10-15');
  const [taxAmountManwon, setTaxAmountManwon] = useState<number>(3000); // 3,000만원
  const [isForeign, setIsForeign] = useState<boolean>(false);

  const taxAmount = taxAmountManwon * 10000;

  const result = useMemo(() => {
    if (!eventDate) {
      return {
        deadlineStr: '',
        diffDays: 0,
        isOverdue: false,
        daysOverdue: 0,
        discount3Percent: 0,
        finalPayableOnTime: 0,
        unfiledPenalty: 0,
        delayedPenalty: 0,
        totalPenalty: 0,
      };
    }

    const [yearStr, monthStr] = eventDate.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    const monthsToAdd = type === 'gift' ? 3 : (isForeign ? 9 : 6);
    const deadlineDate = new Date(year, month + monthsToAdd, 0);

    const deadlineYear = deadlineDate.getFullYear();
    const deadlineMonth = String(deadlineDate.getMonth() + 1).padStart(2, '0');
    const deadlineDay = String(deadlineDate.getDate()).padStart(2, '0');
    const deadlineStr = `${deadlineYear}-${deadlineMonth}-${deadlineDay}`;

    const now = new Date();
    const current = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());
    const diffTime = target.getTime() - current.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const isOverdue = diffDays < 0;
    const daysOverdue = isOverdue ? Math.abs(diffDays) : 0;

    const discount3Percent = Math.round(taxAmount * 0.03);
    const finalPayableOnTime = taxAmount - discount3Percent;

    const unfiledPenalty = Math.round(taxAmount * 0.20);
    const delayedPenalty = Math.round(taxAmount * daysOverdue * 0.00022);
    const totalPenalty = unfiledPenalty + delayedPenalty;

    return {
      deadlineStr,
      diffDays,
      isOverdue,
      daysOverdue,
      discount3Percent,
      finalPayableOnTime,
      unfiledPenalty,
      delayedPenalty,
      totalPenalty,
    };
  }, [type, eventDate, taxAmount, isForeign]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* 타이틀 및 헤더 */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{isKo ? '국세청 법정 신고기한 D-Day' : 'Statutory Tax Filing Deadline'}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {isKo ? '증여세·상속세 신고기한 & 3% 공제 계산기' : 'Gift & Inheritance Tax Filing Deadline Calculator'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isKo
            ? '상증세법 제67조·제68조(말일 기준 3·6개월) 신고기한과 제69조 3% 자진신고세액공제 및 가산세(20%)를 실시간 계산합니다.'
            : 'Track statutory filing deadlines, 3% timely filing discounts, and late-filing penalty exposures under inheritance and gift tax acts.'}
        </p>
      </div>

      {/* 과세 유형 선택 */}
      <div className="flex gap-2">
        <Button
          variant={type === 'gift' ? 'default' : 'outline'}
          onClick={() => setType('gift')}
        >
          {isKo ? '증여세 (말일 기준 3개월)' : 'Gift Tax (3 Months)'}
        </Button>
        <Button
          variant={type === 'inheritance' ? 'default' : 'outline'}
          onClick={() => setType('inheritance')}
        >
          {isKo ? '상속세 (말일 기준 6개월)' : 'Inheritance Tax (6 Months)'}
        </Button>
      </div>

      {/* 입력 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>
            {type === 'gift'
              ? (isKo ? '증여 정보 입력' : 'Gift Transaction Details')
              : (isKo ? '상속 정보 입력' : 'Inheritance Details')}
          </CardTitle>
          <CardDescription>
            {isKo
              ? '증여일 또는 상속개시일과 예상 산출세액을 입력하세요.'
              : 'Enter event date and estimated tax assessment.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {type === 'gift' ? (isKo ? '증여일자' : 'Gift Date') : (isKo ? '상속개시일(사망일)' : 'Date of Death')}
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isKo ? '예상 산출세액 (공제 후)' : 'Estimated Tax Amount'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={taxAmountManwon}
                  onChange={(e) => setTaxAmountManwon(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">만원</span>
              </div>
            </div>

            {type === 'inheritance' && (
              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={isForeign}
                    onChange={(e) => setIsForeign(e.target.checked)}
                    className="rounded border-input text-primary focus:ring-ring"
                  />
                  <span>{isKo ? '피상속인 또는 상속인 전원 국외 거주 (9개월 기한 적용)' : 'All parties reside abroad (9-month deadline)'}</span>
                </label>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* D-Day 및 기한 카드 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '법정 신고기한' : 'Statutory Deadline'}</span>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{result.deadlineStr}</p>
              <p className="mt-1 text-xs text-muted-foreground">{type === 'gift' ? '해당 월 말일 + 3개월' : (isForeign ? '말일 + 9개월' : '말일 + 6개월')}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '잔여 D-Day' : 'Countdown'}</span>
                {result.isOverdue ? (
                  <Badge variant="destructive">{isKo ? '기한 도과' : 'Overdue'}</Badge>
                ) : (
                  <Badge variant="secondary">D-{result.diffDays}</Badge>
                )}
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {result.isOverdue ? `D+${result.daysOverdue}일` : `D-${result.diffDays}일`}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {result.isOverdue ? (isKo ? '가산세 부과 중' : 'Late penalties apply') : (isKo ? '자진신고 가능' : 'Timely filing eligible')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '3% 신고세액공제 혜택' : '3% Tax Discount'}</span>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                -{(result.discount3Percent / 10000).toLocaleString()}만원
              </p>
              <p className="mt-1 text-xs text-muted-foreground">상증세법 제69조</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 세액 분석 및 가산세 위험 안내 */}
      <Card>
        <CardHeader>
          <CardTitle>{isKo ? '신고 기한별 최종 세액 비교' : 'Payment Summary & Penalties'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{isKo ? '원래 산출세액' : 'Base Assessed Tax'}</span>
                <span className="font-semibold text-foreground">{(taxAmount / 10000).toLocaleString()}만원</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-primary font-medium">{isKo ? '기한 내 신고 시 3% 세액공제' : '3% On-Time Discount'}</span>
                <span className="font-semibold text-primary">-{(result.discount3Percent / 10000).toLocaleString()}만원</span>
              </div>
              <div className="border-t border-border pt-2 flex items-center justify-between text-base font-bold">
                <span>{isKo ? '기한 내 자진신고 실납부액' : 'Final Payable (On-Time)'}</span>
                <span className="text-primary">{(result.finalPayableOnTime / 10000).toLocaleString()}만원</span>
              </div>
            </div>

            {/* 기한 도과 시 가산세 패널티 경고 */}
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>{isKo ? '기한 도과(무신고) 시 불이익 경고' : 'Consequences of Late Filing'}</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside leading-relaxed">
                <li>
                  <strong>3% 신고세액공제 박탈</strong>: 즉시 {(result.discount3Percent / 10000).toLocaleString()}만원 손실
                </li>
                <li>
                  <strong>20% 일반 무신고 가산세</strong>: 산출세액의 20%인 {(result.unfiledPenalty / 10000).toLocaleString()}만원 추가 부과
                </li>
                <li>
                  <strong>납부지연 가산세</strong>: 1일당 0.022%(연 약 8.03%) 일할 계산 추가 가산
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
