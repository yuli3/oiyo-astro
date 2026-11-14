import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gift, Sparkles, Building, AlertTriangle } from 'lucide-react';

export function HometownDonationCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [donationAmount, setDonationAmount] = useState<number>(100000); // 10만원 기본
  const [determinedTax, setDeterminedTax] = useState<number>(1500000); // 연간 결정세액 150만원

  const result = useMemo(() => {
    const under100k = Math.min(donationAmount, 100000);
    const over100k = Math.max(0, donationAmount - 100000);

    const refundUnder100k = under100k;
    const refundOver100k = Math.round(over100k * 0.165);
    const theoreticalRefund = refundUnder100k + refundOver100k;

    const actualRefund = Math.min(theoreticalRefund, determinedTax);
    const giftValue = Math.round(donationAmount * 0.30);
    const totalBenefit = actualRefund + giftValue;
    const netOutOfPocket = donationAmount - totalBenefit;
    const netProfit = Math.max(0, -netOutOfPocket);

    return {
      donationAmount,
      under100k,
      over100k,
      actualRefund,
      giftValue,
      totalBenefit,
      netOutOfPocket: Math.max(0, netOutOfPocket),
      netProfit,
      isFullyCovered: actualRefund === theoreticalRefund,
    };
  }, [donationAmount, determinedTax]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              <span className="flex items-center gap-1">
                <Gift className="h-3.5 w-3.5" />
                {isKo ? '조세특례제한법 제58조' : 'Tax Reduction Act'}
              </span>
            </Badge>
            <Badge variant="secondary">{isKo ? '10만원 100% 환급' : '100% Tax Credit'}</Badge>
          </div>
          <CardTitle>
            {isKo
              ? '고향사랑기부금 세액공제 & 답례품(30%) 혜택 계산기'
              : 'Hometown Love Donation Tax Credit Calculator'}
          </CardTitle>
          <CardDescription>
            {isKo
              ? '10만원 기부 시 세금 10만원 전액(100%) 환급과 3만원 상당의 지역 특산물 답례품 혜택으로 실질 3만원의 순이득을 계산합니다.'
              : 'Calculate 100% tax credit up to 100k KRW plus 30% regional gift benefit.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="donation-input" className="text-sm font-medium">
                  {isKo ? '기부 희망 금액 (원)' : 'Donation Amount (KRW)'}
                </label>
                <Input
                  id="donation-input"
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(Math.max(0, Number(e.target.value) || 0))}
                  step={10000}
                  min={0}
                />
                <div className="flex gap-1.5 pt-1">
                  {[100000, 300000, 500000, 1000000].map((amt) => (
                    <Button
                      key={amt}
                      variant="outline"
                      size="sm"
                      onClick={() => setDonationAmount(amt)}
                    >
                      {amt / 10000}{isKo ? '만원' : '0k'}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="tax-input" className="text-sm font-medium">
                  {isKo ? '본인의 예상 소득세 결정세액 (원)' : 'Expected Annual Tax Liability (KRW)'}
                </label>
                <Input
                  id="tax-input"
                  type="number"
                  value={determinedTax}
                  onChange={(e) => setDeterminedTax(Math.max(0, Number(e.target.value) || 0))}
                  step={100000}
                  min={0}
                />
                <p className="text-xs text-muted-foreground">
                  {isKo
                    ? '원천징수영수증 상의 결정세액이 10만원 이상이면 전액 100% 환급됩니다.'
                    : 'Tax credit cannot exceed total tax liability.'}
                </p>
              </div>
            </div>

            {/* 시뮬레이션 결과 카드 */}
            <div className="p-4 bg-muted/60 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{isKo ? '기부 혜택 정밀 분석' : 'Benefit Breakdown'}</span>
                </div>
                <Badge variant={result.netProfit > 0 ? 'default' : 'secondary'}>
                  {result.netProfit > 0
                    ? (isKo ? `+${result.netProfit.toLocaleString()}원 순이익 🌟` : 'Net Profit')
                    : (isKo ? '실부담 발생' : 'Out of Pocket')}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 border rounded-lg bg-background space-y-1">
                  <span className="text-xs text-muted-foreground">{isKo ? '연말정산 세금 환급액' : 'Tax Refund'}</span>
                  <div className="text-lg font-bold text-primary">
                    +{result.actualRefund.toLocaleString()}{isKo ? '원' : ' KRW'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isKo ? '10만원까지 100% + 초과분 16.5%' : 'Full credit up to 100k'}
                  </p>
                </div>

                <div className="p-3 border rounded-lg bg-background space-y-1">
                  <span className="text-xs text-muted-foreground">{isKo ? '지자체 답례품 가치 (30%)' : 'Gift Value (30%)'}</span>
                  <div className="text-lg font-bold">
                    +{result.giftValue.toLocaleString()}{isKo ? '원' : ' KRW'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isKo ? '한우, 쌀, 지역사랑상품권 등 포인트' : 'Regional specialty items'}
                  </p>
                </div>

                <div className="p-3 border rounded-lg bg-background space-y-1">
                  <span className="text-xs text-muted-foreground">{isKo ? '총 체감 혜택' : 'Total Value'}</span>
                  <div className="text-lg font-bold">
                    {result.totalBenefit.toLocaleString()}{isKo ? '원' : ' KRW'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isKo ? '환급액 + 답례품 합계' : 'Refund + gifts'}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-background rounded-lg border text-sm space-y-1.5">
                <div className="flex items-center justify-between font-medium">
                  <span className="flex items-center gap-1.5">
                    <Building className="h-4 w-4 text-primary" />
                    {isKo ? '실질 체감 결과' : 'Net Economic Outcome'}
                  </span>
                  <span className="font-bold text-primary">
                    {result.netProfit > 0
                      ? (isKo ? `실부담 0원 + ${result.netProfit.toLocaleString()}원 순이득!` : 'Free + Net Profit!')
                      : (isKo ? `실부담 ${result.netOutOfPocket.toLocaleString()}원` : `Cost ${result.netOutOfPocket} KRW`)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {donationAmount === 100000
                    ? (isKo ? '10만원 기부 시 연말정산에서 10만원이 100% 통장으로 환급되고, 3만원 상당의 특산물까지 받으므로 직장인이라면 무조건 참여하는 것이 이득입니다.' : 'Net positive return.')
                    : (isKo ? '10만원 초과분은 16.5% 세액공제와 30% 답례품으로 총 46.5%의 혜택을 환급받습니다.' : '46.5% effective recovery.')}
                </p>
              </div>

              {!result.isFullyCovered && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border text-xs text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>
                    {isKo
                      ? `주의: 예상 결정세액(${determinedTax.toLocaleString()}원)이 세액공제액보다 적어 일부 금액만 환급됩니다.`
                      : 'Tax credit capped by annual tax liability.'}
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

export default HometownDonationCalculator;
