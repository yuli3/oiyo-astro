import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Sparkles, ShieldCheck, Gift } from 'lucide-react';

function computeGiftTax(taxBase: number): number {
  if (taxBase <= 0) return 0;
  let tax = 0;
  if (taxBase <= 100000000) {
    tax = taxBase * 0.10;
  } else if (taxBase <= 500000000) {
    tax = 10000000 + (taxBase - 100000000) * 0.20;
  } else if (taxBase <= 1000000000) {
    tax = 90000000 + (taxBase - 500000000) * 0.30;
  } else if (taxBase <= 3000000000) {
    tax = 240000000 + (taxBase - 1000000000) * 0.40;
  } else {
    tax = 1040000000 + (taxBase - 3000000000) * 0.50;
  }
  return Math.round(tax * 0.97); // 신고세액공제 3%
}

export function MarriageBirthGiftCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [groomGiftHundredMillions, setGroomGiftHundredMillions] = useState<number>(1.5); // 신랑 1.5억
  const [brideGiftHundredMillions, setBrideGiftHundredMillions] = useState<number>(1.5); // 신부 1.5억
  const [groomPriorHundredMillions, setGroomPriorHundredMillions] = useState<number>(0);
  const [bridePriorHundredMillions, setBridePriorHundredMillions] = useState<number>(0);
  const [isWithin2Years, setIsWithin2Years] = useState<boolean>(true);

  const result = useMemo(() => {
    const groomGift = Math.round(groomGiftHundredMillions * 100000000);
    const brideGift = Math.round(brideGiftHundredMillions * 100000000);
    const groomPrior = Math.round(groomPriorHundredMillions * 100000000);
    const bridePrior = Math.round(bridePriorHundredMillions * 100000000);

    const marriageLimit = isWithin2Years ? 100000000 : 0;

    const calcOne = (gift: number, prior: number) => {
      const basicLimit = 50000000;
      const remBasic = Math.max(0, basicLimit - prior);
      const totalLimit = remBasic + marriageLimit;
      const actualDeduct = Math.min(gift, totalLimit);
      const taxBase = Math.max(0, gift - actualDeduct);
      const tax = computeGiftTax(taxBase);

      const baseWithout = Math.max(0, gift - remBasic);
      const taxWithout = computeGiftTax(baseWithout);
      const saved = Math.max(0, taxWithout - tax);

      return {
        gift,
        prior,
        remBasic,
        actualDeduct,
        taxBase,
        tax,
        saved,
      };
    };

    const groom = calcOne(groomGift, groomPrior);
    const bride = calcOne(brideGift, bridePrior);

    const totalGift = groomGift + brideGift;
    const totalDeduct = groom.actualDeduct + bride.actualDeduct;
    const totalTax = groom.tax + bride.tax;
    const totalSaved = groom.saved + bride.saved;

    return {
      groom,
      bride,
      totalGift,
      totalDeduct,
      totalTax,
      totalSaved,
      isExempt: totalTax === 0,
    };
  }, [groomGiftHundredMillions, brideGiftHundredMillions, groomPriorHundredMillions, bridePriorHundredMillions, isWithin2Years]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              <span className="flex items-center gap-1">
                <Gift className="h-3.5 w-3.5" />
                {isKo ? '상속세및증여세법 제53조의2' : 'Inheritance & Gift Tax Act'}
              </span>
            </Badge>
            <Badge variant="secondary">{isKo ? '2024 신설 특례' : 'New 2024 Law'}</Badge>
          </div>
          <CardTitle>
            {isKo
              ? '혼인·출산 증여재산공제 (최대 3억원 비과세) 계산기'
              : 'Marriage & Birth Gift Tax Exemption Calculator'}
          </CardTitle>
          <CardDescription>
            {isKo
              ? '혼인신고 전후 2년 또는 출산 2년 내 직계존속으로부터 증여받을 때, 기존 5천만원에 더해 1인당 1억원(부부 합산 최대 3억원)까지 증여세 0원 비과세 혜택을 계산합니다.'
              : 'Calculate tax exemptions up to 300M KRW for newlyweds under Korea gift tax law.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 p-3 border rounded-lg bg-background">
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  <Heart className="h-4 w-4 text-primary" />
                  {isKo ? '신랑 측 증여 정보' : 'Groom Gift Info'}
                </span>
                <div className="space-y-2 pt-1">
                  <div>
                    <label htmlFor="groom-gift-input" className="text-xs font-medium text-muted-foreground">
                      {isKo ? '신랑 증여받을 금액 (억원)' : 'Groom Gift Amount (100M KRW)'}
                    </label>
                    <Input
                      id="groom-gift-input"
                      type="number"
                      value={groomGiftHundredMillions}
                      onChange={(e) => setGroomGiftHundredMillions(Math.max(0, Number(e.target.value) || 0))}
                      step={0.1}
                      min={0}
                    />
                  </div>
                  <div>
                    <label htmlFor="groom-prior-input" className="text-xs font-medium text-muted-foreground">
                      {isKo ? '10년 내 사전 증여받은 금액 (억원)' : 'Prior Gifts in 10y (100M KRW)'}
                    </label>
                    <Input
                      id="groom-prior-input"
                      type="number"
                      value={groomPriorHundredMillions}
                      onChange={(e) => setGroomPriorHundredMillions(Math.max(0, Number(e.target.value) || 0))}
                      step={0.1}
                      min={0}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 p-3 border rounded-lg bg-background">
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  <Heart className="h-4 w-4 text-primary" />
                  {isKo ? '신부 측 증여 정보' : 'Bride Gift Info'}
                </span>
                <div className="space-y-2 pt-1">
                  <div>
                    <label htmlFor="bride-gift-input" className="text-xs font-medium text-muted-foreground">
                      {isKo ? '신부 증여받을 금액 (억원)' : 'Bride Gift Amount (100M KRW)'}
                    </label>
                    <Input
                      id="bride-gift-input"
                      type="number"
                      value={brideGiftHundredMillions}
                      onChange={(e) => setBrideGiftHundredMillions(Math.max(0, Number(e.target.value) || 0))}
                      step={0.1}
                      min={0}
                    />
                  </div>
                  <div>
                    <label htmlFor="bride-prior-input" className="text-xs font-medium text-muted-foreground">
                      {isKo ? '10년 내 사전 증여받은 금액 (억원)' : 'Prior Gifts in 10y (100M KRW)'}
                    </label>
                    <Input
                      id="bride-prior-input"
                      type="number"
                      value={bridePriorHundredMillions}
                      onChange={(e) => setBridePriorHundredMillions(Math.max(0, Number(e.target.value) || 0))}
                      step={0.1}
                      min={0}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
              <div className="space-y-0.5">
                <span className="text-sm font-medium">
                  {isKo ? '혼인신고일 전후 2년 이내 (또는 출산 2년 내) 증여' : 'Within 2 Years of Marriage/Birth'}
                </span>
                <p className="text-xs text-muted-foreground">
                  {isKo ? '혼인신고일 전 2년 ~ 후 2년 (총 4년) 사이 증여받은 재산' : 'Qualifying 4-year window'}
                </p>
              </div>
              <Button
                variant={isWithin2Years ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsWithin2Years(!isWithin2Years)}
              >
                {isWithin2Years ? (isKo ? '기한 내 충족 ✅' : 'Qualified') : (isKo ? '기한 경과 ❌' : 'Expired')}
              </Button>
            </div>

            {/* 시뮬레이션 결과 카드 */}
            <div className="p-4 bg-muted/60 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{isKo ? '증여세 시뮬레이션 결과' : 'Tax Calculation Result'}</span>
                </div>
                <Badge variant={result.isExempt ? 'default' : 'secondary'}>
                  {result.isExempt ? (isKo ? '전액 비과세 0원' : 'Exempt') : (isKo ? '일부 과세' : 'Tax Due')}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-background space-y-2">
                  <span className="text-xs text-muted-foreground">{isKo ? '총 증여재산공제액' : 'Total Exemption'}</span>
                  <div className="text-2xl font-bold tracking-tight">
                    {(result.totalDeduct / 100000000).toFixed(2)}{isKo ? '억원' : ' 100M KRW'}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div>• {isKo ? `신랑 공제: ${(result.groom.actualDeduct / 10000).toLocaleString()}만원` : `Groom: ${result.groom.actualDeduct / 10000}`}</div>
                    <div>• {isKo ? `신부 공제: ${(result.bride.actualDeduct / 10000).toLocaleString()}만원` : `Bride: ${result.bride.actualDeduct / 10000}`}</div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-background space-y-2">
                  <span className="text-xs text-muted-foreground">{isKo ? '최종 납부할 증여세' : 'Final Gift Tax Due'}</span>
                  <div className="text-2xl font-bold tracking-tight text-primary">
                    {result.totalTax === 0 ? (isKo ? '0원 (전액 면제)' : '0 KRW (Free)') : `${(result.totalTax / 10000).toLocaleString()}${isKo ? '만원' : ' KRW'}`}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isKo ? '자진신고세액공제(3%)가 이미 반영된 실납부 세액입니다.' : '3% self-filing credit applied.'}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-background rounded-lg border text-sm space-y-1">
                <div className="flex items-center justify-between font-medium">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    {isKo ? '혼인 특례로 절감된 총 증여세' : 'Total Tax Saved by Marriage Deduction'}
                  </span>
                  <span className="font-bold text-primary">
                    {isKo ? `약 ${(result.totalSaved / 10000).toLocaleString()}만원 절세!` : `Saved ${result.totalSaved / 10000} 10k KRW`}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isKo
                    ? '혼인출산 특례(1인당 1억원)가 없었을 때 납부해야 했던 증여세와 비교한 실제 순수 절세액입니다.'
                    : 'Actual net tax savings compared to standard rules.'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default MarriageBirthGiftCalculator;
