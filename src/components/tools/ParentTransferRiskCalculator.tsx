import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Home, ShieldAlert, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

const ANNUITY_FACTOR_5YR = 3.79078;
const STATUTORY_RENT_RATE = 0.02;

export function ParentTransferRiskCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [calcType, setCalcType] = useState<'rent' | 'sale'>('rent');
  const [marketValueManwon, setMarketValueManwon] = useState<number>(60000); // 6억원
  const [salePriceManwon, setSalePriceManwon] = useState<number>(45000); // 4.5억원
  const [priorGiftManwon, setPriorGiftManwon] = useState<number>(0);

  const marketValue = marketValueManwon * 10000;
  const salePrice = salePriceManwon * 10000;
  const priorGifts = priorGiftManwon * 10000;

  const result = useMemo(() => {
    if (calcType === 'rent') {
      const fiveYearBenefit = Math.round(marketValue * STATUTORY_RENT_RATE * ANNUITY_FACTOR_5YR);
      const isExempt = fiveYearBenefit < 10000000;
      const basicDeduction = Math.max(0, 50000000 - priorGifts);

      let taxable = 0;
      let giftTax = 0;
      if (!isExempt) {
        taxable = Math.max(0, fiveYearBenefit - basicDeduction);
        if (taxable > 0) {
          if (taxable <= 100000000) giftTax = taxable * 0.10;
          else if (taxable <= 500000000) giftTax = taxable * 0.20 - 10000000;
          else giftTax = taxable * 0.30 - 60000000;
        }
      }

      const safeMonthlyRentMin = Math.round((marketValue * STATUTORY_RENT_RATE) / 12);

      return {
        type: 'rent' as const,
        fiveYearBenefit,
        isExempt,
        basicDeduction,
        taxable,
        giftTax: Math.round(giftTax),
        safeMonthlyRentMin,
      };
    } else {
      const diff = Math.max(0, marketValue - salePrice);
      const giftTaxThreshold = Math.min(marketValue * 0.30, 300000000);
      const childGiftTaxable = Math.max(0, diff - giftTaxThreshold);

      let childGiftTax = 0;
      if (childGiftTaxable > 0) {
        const basicDeduction = Math.max(0, 50000000 - priorGifts);
        const netTaxable = Math.max(0, childGiftTaxable - basicDeduction);
        if (netTaxable <= 100000000) childGiftTax = netTaxable * 0.10;
        else if (netTaxable <= 500000000) childGiftTax = netTaxable * 0.20 - 10000000;
        else childGiftTax = netTaxable * 0.30 - 60000000;
      }

      const parentDenialThreshold = Math.min(marketValue * 0.05, 300000000);
      const isParentUnfair = diff >= parentDenialThreshold;
      const safeMinPriceGiftOnly = marketValue - giftTaxThreshold;
      const safeMinPriceStrict = marketValue - parentDenialThreshold;

      return {
        type: 'sale' as const,
        diff,
        discountRate: marketValue > 0 ? Number(((diff / marketValue) * 100).toFixed(1)) : 0,
        childGiftTaxable,
        childGiftTax: Math.round(childGiftTax),
        isParentUnfair,
        parentDenialThreshold,
        safeMinPriceGiftOnly,
        safeMinPriceStrict,
      };
    }
  }, [calcType, marketValue, salePrice, priorGifts]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* 헤더 */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Home className="h-3.5 w-3.5" />
          <span>{isKo ? '가족 간 부동산 거래 세무 가드' : 'Family Real Estate Transfer Tax Guard'}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {isKo ? '부모-자녀 무상임대 & 저가양도 세무 리스크 진단기' : 'Parent-Child Rent-Free & Below-Market Sale Guard'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isKo
            ? '상증세법 제41조의4(무상사용 5년 1천만원 비과세) 및 소득세법 제101조(부당행위계산 부인) 기준 증여세와 양도세 추징 위험을 진단합니다.'
            : 'Evaluate gift tax and capital gains tax clawback risks on parent-child rent-free living and below-market home sales.'}
        </p>
      </div>

      {/* 모드 선택 바 */}
      <div className="flex gap-2">
        <Button
          variant={calcType === 'rent' ? 'default' : 'outline'}
          onClick={() => setCalcType('rent')}
        >
          {isKo ? '부모 주택 무상 거주 (임대)' : 'Rent-Free Residence'}
        </Button>
        <Button
          variant={calcType === 'sale' ? 'default' : 'outline'}
          onClick={() => setCalcType('sale')}
        >
          {isKo ? '부모-자녀 간 저가 매매' : 'Below-Market Sale'}
        </Button>
      </div>

      {/* 입력 폼 */}
      <Card>
        <CardHeader>
          <CardTitle>
            {calcType === 'rent'
              ? (isKo ? '무상 거주 부동산 정보 입력' : 'Residence Property Details')
              : (isKo ? '저가 매매 거래 조건 입력' : 'Sale Transaction Details')}
          </CardTitle>
          <CardDescription>
            {isKo
              ? '현재 시가(KB시세 또는 최근 실거래가)와 거래 조건을 만원 단위로 입력하세요.'
              : 'Enter market value and transaction terms in 10,000 KRW units.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isKo ? '부동산 시가 (KB시세/실거래가)' : 'Property Market Value'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={marketValueManwon}
                  onChange={(e) => setMarketValueManwon(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">만원</span>
              </div>
            </div>

            {calcType === 'sale' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {isKo ? '실제 자녀 매매 거래가액' : 'Actual Sale Price to Child'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={salePriceManwon}
                    onChange={(e) => setSalePriceManwon(Number(e.target.value))}
                    className="w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">만원</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isKo ? '최근 10년 내 기증여액 (성인 자녀)' : 'Prior Gifts in 10 Years'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={priorGiftManwon}
                  onChange={(e) => setPriorGiftManwon(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">만원</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 결과 분석 카드 */}
      {result.type === 'rent' ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent>
              <div className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{isKo ? '5년간 법정 무상사용이익' : '5-Yr Imputed Benefit'}</span>
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {(result.fiveYearBenefit / 10000).toLocaleString()}만원
                </p>
                <p className="mt-1 text-xs text-muted-foreground">시가 x 2% x 3.79078</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{isKo ? '1,000만원 비과세 여부' : '10M Exemption'}</span>
                  {result.isExempt ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  )}
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {result.isExempt ? (isKo ? '전액 비과세' : 'Exempt') : (isKo ? '과세 검토 대상' : 'Subject to Tax')}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">상증세법 제41조의4</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{isKo ? '안전 권장 월 임대료' : 'Safe Monthly Rent'}</span>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {(Math.round(result.safeMonthlyRentMin / 10000)).toLocaleString()}만원/월
                </p>
                <p className="mt-1 text-xs text-muted-foreground">법정 연 2% 적정 사용료</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent>
              <div className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{isKo ? '시가 대비 할인액' : 'Discount from Market'}</span>
                  <Badge variant="secondary">{result.discountRate}%</Badge>
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {(result.diff / 10000).toLocaleString()}만원
                </p>
                <p className="mt-1 text-xs text-muted-foreground">시가 - 실제 거래가</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{isKo ? '부모 양도세 부당행위' : 'Parent Tax Denial'}</span>
                  {result.isParentUnfair ? (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {result.isParentUnfair ? (isKo ? '시가로 재계산' : 'Denied (Market Basis)') : (isKo ? '정상 인정' : 'Recognized')}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">5% 또는 3억원 초과 시 부인</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{isKo ? '자녀 예상 증여세' : 'Child Gift Tax'}</span>
                  <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {(result.childGiftTax / 10000).toLocaleString()}만원
                </p>
                <p className="mt-1 text-xs text-muted-foreground">30% 또는 3억원 초과분 과세</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 세부 종합 진단 메시지 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>{isKo ? '국세청 세무 리스크 진단 결과' : 'Tax Assessment Summary'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            {result.type === 'rent' ? (
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                <h4 className="font-semibold text-foreground">
                  {result.isExempt
                    ? '✅ 100% 비과세 안전 구간'
                    : result.giftTax === 0
                    ? 'ℹ️ 기본공제 내 증여세 0원 (안전)'
                    : '⚠️ 증여세 과세 위험 구간'}
                </h4>
                <p>
                  {result.isExempt
                    ? '부동산 시가 기준 5년간 무상사용 이익이 1,000만원 미만이므로 상증세법상 증여세가 전액 비과세됩니다.'
                    : result.giftTax === 0
                    ? `5년간 무상사용 이익(${(result.fiveYearBenefit / 10000).toLocaleString()}만원)이 1천만원을 초과하지만, 성인 자녀 기본공제(${(result.basicDeduction / 10000).toLocaleString()}만원) 범위 내에 있어 납부할 증여세는 0원입니다.`
                    : `5년간 무상사용 이익이 기본공제를 초과하여 약 ${(result.giftTax / 10000).toLocaleString()}만원의 증여세가 추징될 수 있습니다. 증여세를 피하려면 매월 최소 ${(Math.round(result.safeMonthlyRentMin / 10000)).toLocaleString()}만원 이상의 임대료를 부모님 통장으로 계좌 이체하고 임대차계약서를 작성해야 합니다.`}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                <h4 className="font-semibold text-foreground">
                  {result.isParentUnfair
                    ? result.childGiftTaxable > 0
                      ? '🚨 양도소득세 부당행위 부인 & 자녀 증여세 동시 추징 위험'
                      : '⚠️ 부모 양도소득세 부당행위계산 부인 대상'
                    : '✅ 정상 가족 간 거래 인정 구간'}
                </h4>
                <p>
                  {result.isParentUnfair
                    ? `시가 대비 할인액(${(result.diff / 10000).toLocaleString()}만원)이 시가의 5%(${(result.parentDenialThreshold / 10000).toLocaleString()}만원)를 초과하여 부모님은 실제 거래가가 아닌 원래 시가(${(marketValue / 10000).toLocaleString()}만원)를 기준으로 양도소득세를 재계산하여 납부해야 합니다.`
                    : '할인율이 시가의 5% 이내이므로 부모의 양도소득세 부당행위계산 부인 및 자녀 증여세 과세 위험이 없습니다.'}
                </p>
                {result.safeMinPriceGiftOnly > 0 && (
                  <p className="text-xs text-foreground font-medium">
                    💡 자녀 증여세가 0원이 되는 최저 매매가 한한선은 <span className="underline">{(result.safeMinPriceGiftOnly / 10000).toLocaleString()}만원</span>(시가 - 30% 또는 3억)입니다.
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
