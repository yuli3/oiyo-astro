import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Home, ShieldAlert, CheckCircle2, Percent, Coins } from 'lucide-react';

const STATUTORY_INTEREST_RATE = 0.035;

export function RentalDepositInterestTaxCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [houseCount, setHouseCount] = useState<number>(3);
  const [totalDepositEok, setTotalDepositEok] = useState<number>(8); // 8억원
  const [isRegistered, setIsRegistered] = useState<boolean>(false);

  const totalDeposit = totalDepositEok * 100000000;

  const result = useMemo(() => {
    const isTaxable = houseCount >= 3 && totalDeposit > 300000000;

    if (!isTaxable) {
      return {
        isTaxable: false,
        excessDeposit: 0,
        deemedIncome: 0,
        taxSeparated: 0,
      };
    }

    const excessDeposit = totalDeposit - 300000000;
    const deemedIncome = Math.round(excessDeposit * 0.60 * STATUTORY_INTEREST_RATE);

    const expenseRate = isRegistered ? 0.60 : 0.50;
    const basicDeduction = isRegistered ? 4000000 : 2000000;

    const netIncome = Math.max(0, deemedIncome * (1 - expenseRate));
    const taxableBase = Math.max(0, netIncome - basicDeduction);
    const taxSeparated = Math.round(taxableBase * 0.14 * 1.1);

    return {
      isTaxable: true,
      excessDeposit,
      deemedIncome,
      taxSeparated,
    };
  }, [houseCount, totalDeposit, isRegistered]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* 헤더 */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Home className="h-3.5 w-3.5" />
          <span>{isKo ? '소득세법 제25조 간주임대료' : 'Deemed Rental Income Tax'}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {isKo ? '간주임대료 3주택 보증금 3억 초과 소득세 계산기' : '3-House Rental Deposit Interest Tax Calculator'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isKo
            ? '부부 합산 3주택 이상 보유 시 전세보증금 합계 3억원 초과분에 대한 간주임대료(연 3.5%)와 14% 분리과세액을 계산합니다.'
            : 'Calculate deemed rental income tax on lump-sum lease deposits exceeding 300M KRW for owners of 3 or more homes.'}
        </p>
      </div>

      {/* 보유 주택 및 보증금 입력 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>{isKo ? '보유 주택 수 및 보증금 입력' : 'Property & Deposit Details'}</CardTitle>
          <CardDescription>
            {isKo
              ? '부부 합산 보유 주택 수(소형주택 제외)와 전세보증금 총액을 입력하세요.'
              : 'Enter total residential property count and combined lease deposits.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isKo ? '부부 합산 주택 수 (소형주택 40㎡·2억 이하 제외)' : 'Combined House Count'}
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((count) => (
                  <Button
                    key={count}
                    variant={houseCount === count ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setHouseCount(count)}
                  >
                    {count >= 4 ? `${count}채+` : `${count}채`}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isKo ? '전세보증금 합계액' : 'Total Combined Deposit'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={totalDepositEok}
                  onChange={(e) => setTotalDepositEok(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">억원</span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={isRegistered}
                  onChange={(e) => setIsRegistered(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-ring"
                />
                <span>{isKo ? '지자체 및 세무서 정식 등록 임대주택 (필요경비 60%, 기본공제 400만원 적용)' : 'Registered Rental Housing (60% expense, 4M deduction)'}</span>
              </label>
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
                <span className="text-xs text-muted-foreground">{isKo ? '과세 대상 여부' : 'Taxable Status'}</span>
                {result.isTaxable ? (
                  <Badge variant="destructive">{isKo ? '과세 대상' : 'Taxable'}</Badge>
                ) : (
                  <Badge variant="secondary">{isKo ? '전액 비과세' : 'Exempt'}</Badge>
                )}
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {result.isTaxable ? (isKo ? '3주택+3억 초과' : 'Subject') : (isKo ? '0원 (비과세)' : '0 KRW')}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {houseCount < 3 ? (isKo ? '2주택 이하 전세 비과세' : 'Under 3 homes exempt') : (isKo ? '3억원 초과분 과세' : 'Over 300M taxed')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '연간 간주임대료 수입' : 'Annual Deemed Income'}</span>
                <Percent className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {(result.deemedIncome / 10000).toLocaleString()}만원
              </p>
              <p className="mt-1 text-xs text-muted-foreground">(보증금 - 3억) x 60% x 3.5%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '14% 분리과세 세액' : 'Separated Tax Payable'}</span>
                <Coins className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {(result.taxSeparated / 10000).toLocaleString()}만원
              </p>
              <p className="mt-1 text-xs text-muted-foreground">지방소득세 포함 (실효 15.4%)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 종합 진단 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>{isKo ? '간주임대료 절세 및 판정 가이드' : 'Deemed Income Tax Guide'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            {!result.isTaxable ? (
              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-1">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isKo ? '전세보증금 비과세 안전 구간' : '100% Tax-Free Rental Deposit'}</span>
                </div>
                <p className="text-xs">
                  {houseCount < 3
                    ? '부부 합산 주택 수가 2채 이하이므로 전세보증금 액수와 상관없이 간주임대료가 전액 비과세됩니다. (월세를 받지 않는 순수 전세는 2주택자까지 세금이 전혀 없습니다.)'
                    : '전세보증금 합계액이 3억원 이하이므로 과세 대상 금액이 발생하지 않습니다.'}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-destructive font-semibold">
                  <ShieldAlert className="h-4 w-4" />
                  <span>{isKo ? '3주택자 간주임대료 과세 발생' : 'Deemed Rental Income Triggered'}</span>
                </div>
                <p className="text-xs">
                  부부 합산 3주택자로서 전세보증금이 3억원을 초과하였습니다. 초과액({(result.excessDeposit / 10000).toLocaleString()}만원)의 60%에 정기예금이자율(3.5%)을 곱한 연간 {(result.deemedIncome / 10000).toLocaleString()}만원이 임대수입으로 간주됩니다.
                </p>
                <p className="text-xs text-foreground font-medium">
                  💡 절세 팁: 주거전용면적 40㎡ 이하이면서 기준시가 2억원 이하인 소형주택은 3주택 카운트에서 자동 제외되므로, 소형 오피스텔이나 빌라 보유 여부를 재점검하세요.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
