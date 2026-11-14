import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, ShieldCheck, Heart } from 'lucide-react';

export function EstateFuneralDeductionCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [generalExpenseManwon, setGeneralExpenseManwon] = useState<number>(1200); // 1,200만원
  const [facilityExpenseManwon, setFacilityExpenseManwon] = useState<number>(400); // 400만원
  const [marginalRate, setMarginalRate] = useState<number>(0.30); // 30%

  const generalExpense = generalExpenseManwon * 10000;
  const facilityExpense = facilityExpenseManwon * 10000;

  const result = useMemo(() => {
    let generalDeduction = 5000000;
    if (generalExpense > 5000000) {
      generalDeduction = Math.min(generalExpense, 10000000);
    }

    const facilityDeduction = Math.min(facilityExpense, 5000000);
    const totalDeduction = generalDeduction + facilityDeduction;
    const taxSaved = Math.round(totalDeduction * marginalRate);

    return {
      generalDeduction,
      facilityDeduction,
      totalDeduction,
      taxSaved,
    };
  }, [generalExpense, facilityExpense, marginalRate]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* 헤더 */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Heart className="h-3.5 w-3.5" />
          <span>{isKo ? '상속세 공과금·장례비 공제' : 'Inheritance Funeral Deduction'}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {isKo ? '상속세 장례비용 및 봉안시설 추가공제 계산기' : 'Estate Funeral Expense & Columbaria Deduction Calculator'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isKo
            ? '상증세법 제14조에 따라 증빙 없이 기본 500만원, 최대 1,500만원까지 인정되는 장례비 상속공제와 절세액을 계산합니다.'
            : 'Calculate statutory funeral deductions (minimum 5M, maximum 15M KRW) and direct tax savings under Article 14 of the Inheritance Tax Act.'}
        </p>
      </div>

      {/* 입력 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>{isKo ? '장례 및 안치 비용 입력' : 'Expense Details'}</CardTitle>
          <CardDescription>
            {isKo
              ? '장례식장 식대/비용과 봉안당/수목장 등 안치 시설 비용을 만원 단위로 입력하세요.'
              : 'Enter general funeral costs and columbaria/cemetery facility expenses.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isKo ? '일반 장례비용 (장례식장, 식대, 제구비 등)' : 'General Funeral Expenses'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={generalExpenseManwon}
                  onChange={(e) => setGeneralExpenseManwon(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">만원</span>
              </div>
              <p className="text-xs text-muted-foreground">증빙 없어도 최소 500만원 기본 공제 (최대 1,000만원)</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isKo ? '봉안시설·자연장지 비용 (봉안당, 수목장 등)' : 'Columbaria / Natural Burial Costs'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={facilityExpenseManwon}
                  onChange={(e) => setFacilityExpenseManwon(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">만원</span>
              </div>
              <p className="text-xs text-muted-foreground">일반 장례비와 별도로 최대 500만원 추가 공제</p>
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">
                {isKo ? '예상 상속세 한계세율 선택' : 'Marginal Estate Tax Rate'}
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '10% (1억 이하)', rate: 0.10 },
                  { label: '20% (1억~5억)', rate: 0.20 },
                  { label: '30% (5억~10억)', rate: 0.30 },
                  { label: '40% (10억~30억)', rate: 0.40 },
                  { label: '50% (30억 초과)', rate: 0.50 },
                ].map((item) => (
                  <Button
                    key={item.rate}
                    variant={marginalRate === item.rate ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMarginalRate(item.rate)}
                  >
                    {item.label}
                  </Button>
                ))}
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
                <span className="text-xs text-muted-foreground">{isKo ? '일반 장례비 인정액' : 'General Deduction'}</span>
                <Badge variant="secondary">최대 1,000만원</Badge>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {(result.generalDeduction / 10000).toLocaleString()}만원
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {generalExpense < 5000000 ? (isKo ? '기본 500만원 혜택 적용' : '5M minimum floor') : (isKo ? '실제 증빙액 인정' : 'Actual receipt applied')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '봉안시설 추가 인정액' : 'Facility Extra'}</span>
                <Badge variant="secondary">최대 500만원</Badge>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {(result.facilityDeduction / 10000).toLocaleString()}만원
              </p>
              <p className="mt-1 text-xs text-muted-foreground">상증세법 제14조 나목</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '총 법정 장례비 공제' : 'Total Deduction'}</span>
                <ShieldCheck className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {(result.totalDeduction / 10000).toLocaleString()}만원
              </p>
              <p className="mt-1 text-xs text-muted-foreground">법정 최고 한도 1,500만원</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 직접 절세 혜택 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>{isKo ? '상속세 직접 절세액 산출 결과' : 'Direct Tax Savings Summary'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Coins className="h-5 w-5" />
                  <span>{isKo ? '장례비 공제로 아끼는 상속세' : 'Direct Estate Tax Reduced'}</span>
                </div>
                <span className="text-2xl font-extrabold text-primary">
                  {(result.taxSaved / 10000).toLocaleString()}만원
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                총 공제액 {(result.totalDeduction / 10000).toLocaleString()}만원 x 적용 한계세율 {(marginalRate * 100).toFixed(0)}%
              </p>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
              <span className="font-semibold text-foreground text-xs">
                💡 500만원 미만 지출했거나 영수증이 없어도 기본 500만원 전액 공제
              </span>
              <p className="text-xs">
                상증세법 제14조에 따라 실제 장례 비용 영수증이 없거나 300만원만 지출했더라도, 법적으로 <strong>최소 500만원은 묻지도 따지지도 않고 기본 공제</strong>됩니다. 만약 지출액이 500만원을 넘는다면 카드 전표나 계좌이체 내역을 챙겨 최대 1,000만원까지 공제받고, 봉안당 영수증으로 추가 500만원을 챙겨 총 1,500만원 공제를 완성하세요.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
