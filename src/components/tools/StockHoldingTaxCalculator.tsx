import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, ShieldAlert, CheckCircle2, Coins, Sparkles } from 'lucide-react';

const MAJOR_THRESHOLD = 5000000000;
const BASIC_DEDUCTION = 2500000;

export function StockHoldingTaxCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [holdingValueEok, setHoldingValueEok] = useState<number>(55); // 55억원
  const [gainManwon, setGainManwon] = useState<number>(50000); // 5억원
  const [holdingPeriod, setHoldingPeriod] = useState<'over1yr' | 'under1yr'>('over1yr');
  const [isSme, setIsSme] = useState<boolean>(false);

  const holdingValue = holdingValueEok * 100000000;
  const gain = gainManwon * 10000;

  const result = useMemo(() => {
    const isMajor = holdingValue >= MAJOR_THRESHOLD;

    if (!isMajor) {
      return {
        isMajor: false,
        taxableBase: 0,
        nationalTax: 0,
        localTax: 0,
        totalTax: 0,
        effectiveRate: 0,
      };
    }

    const taxableBase = Math.max(0, gain - BASIC_DEDUCTION);
    let nationalTax = 0;

    if (!isSme && holdingPeriod === 'under1yr') {
      nationalTax = taxableBase * 0.30;
    } else {
      if (taxableBase <= 300000000) {
        nationalTax = taxableBase * 0.20;
      } else {
        nationalTax = 300000000 * 0.20 + (taxableBase - 300000000) * 0.25;
      }
    }

    const localTax = Math.floor(nationalTax * 0.10);
    const totalTax = nationalTax + localTax;
    const effectiveRate = gain > 0 ? Number(((totalTax / gain) * 100).toFixed(2)) : 0;

    return {
      isMajor: true,
      taxableBase,
      nationalTax,
      localTax,
      totalTax,
      effectiveRate,
    };
  }, [holdingValue, gain, holdingPeriod, isSme]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* 헤더 */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>{isKo ? '대주주 주식 세제 개편' : 'Major Shareholder Tax Code'}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {isKo ? '국내주식 대주주 50억 기준 양도세 계산기' : 'Domestic Stock 5B KRW Major Shareholder Tax Calculator'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isKo
            ? '종목당 지분 50억원 이상 대주주 해당 여부 및 과세표준(20~25%) 양도소득세를 실시간 산출합니다.'
            : 'Evaluate major shareholder threshold (5 Billion KRW) and calculate capital gains tax on domestic equities.'}
        </p>
      </div>

      {/* 보유 조건 입력 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>{isKo ? '주식 보유 및 양도 조건 입력' : 'Holding & Capital Gain Inputs'}</CardTitle>
          <CardDescription>
            {isKo
              ? '종목당 평가액(억원)과 실현된 매매차익(만원)을 입력하세요.'
              : 'Enter single-stock holding value and realized capital gain.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isKo ? '종목당 보유 평가액 (직전연도 말일 기준)' : 'Stock Holding Value per Ticker'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={holdingValueEok}
                  onChange={(e) => setHoldingValueEok(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">억원</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isKo ? '실현된 매매 양도차익' : 'Realized Capital Gain'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={gainManwon}
                  onChange={(e) => setGainManwon(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">만원</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isKo ? '보유 기간' : 'Holding Period'}
              </label>
              <div className="flex gap-2">
                <Button
                  variant={holdingPeriod === 'over1yr' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setHoldingPeriod('over1yr')}
                >
                  {isKo ? '1년 이상 보유' : 'Over 1 Year'}
                </Button>
                <Button
                  variant={holdingPeriod === 'under1yr' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setHoldingPeriod('under1yr')}
                >
                  {isKo ? '1년 미만 단기' : 'Under 1 Year'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isKo ? '기업 분류' : 'Enterprise Scale'}
              </label>
              <div className="flex gap-2">
                <Button
                  variant={!isSme ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIsSme(false)}
                >
                  {isKo ? '대기업·중견기업' : 'Large / Mid Cap'}
                </Button>
                <Button
                  variant={isSme ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIsSme(true)}
                >
                  {isKo ? '중소기업' : 'SME'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 결과 분석 지표 카드 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '대주주 해당 여부' : 'Shareholder Classification'}</span>
                {result.isMajor ? (
                  <Badge variant="destructive">{isKo ? '대주주 해당' : 'Major'}</Badge>
                ) : (
                  <Badge variant="secondary">{isKo ? '소액주주 (비과세)' : 'Exempt'}</Badge>
                )}
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {result.isMajor ? (isKo ? '과세 대상' : 'Taxable') : (isKo ? '전액 비과세' : '0 KRW')}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">기준선: 종목당 50억원</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '최종 양도소득세' : 'Total Tax Payable'}</span>
                <Coins className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {(result.totalTax / 10000).toLocaleString()}만원
              </p>
              <p className="mt-1 text-xs text-muted-foreground">국세 + 지방소득세(10%)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '실효 세율' : 'Effective Tax Rate'}</span>
                <Sparkles className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{result.effectiveRate}%</p>
              <p className="mt-1 text-xs text-muted-foreground">양도차익 대비 총 세금</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 종합 진단 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>{isKo ? '대주주 판정 및 절세 가이드' : 'Tax Assessment & Shield Guide'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            {!result.isMajor ? (
              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-1">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isKo ? '소액주주 전액 비과세 (0원)' : '100% Tax-Free Trading'}</span>
                </div>
                <p className="text-xs">
                  종목당 보유 평가액이 50억원 미만이므로, 국내 상장주식 장내 매매차익({(gain / 10000).toLocaleString()}만원)에 대해 납부할 양도소득세가 전혀 없습니다.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-destructive font-semibold">
                  <ShieldAlert className="h-4 w-4" />
                  <span>{isKo ? '대주주 양도소득세 과세 대상' : 'Major Shareholder Capital Gains Tax Triggered'}</span>
                </div>
                <p className="text-xs">
                  종목 평가액이 50억원 이상으로 대주주에 해당합니다. 연간 기본공제 250만원 차감 후, 3억원 이하 구간은 22%(지방세 포함), 3억원 초과 구간은 27.5%(지방세 포함)의 누진세율이 적용되어 총 {(result.totalTax / 10000).toLocaleString()}만원을 신고·납부해야 합니다.
                </p>
                <p className="text-xs text-foreground font-medium">
                  💡 절세 팁: 매년 12월 말일(주주명부 폐쇄일) 이전에 일부 지분을 매도하여 종목당 평가액을 50억원 미만으로 낮추면 다음 해에 소액주주로서 전액 비과세 혜택을 누릴 수 있습니다.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
