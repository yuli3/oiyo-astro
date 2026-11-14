import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, ShieldAlert, CheckCircle2, Receipt } from 'lucide-react';

export function RealEstateBrokerageVatGuard({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [feeManwon, setFeeManwon] = useState<number>(100); // 100만원
  const [taxType, setTaxType] = useState<'general' | 'simplified_over48' | 'simplified_under48'>('simplified_under48');
  const [demandedVatManwon, setDemandedVatManwon] = useState<number>(10); // 10만원 요구

  const fee = feeManwon * 10000;
  const demandedVat = demandedVatManwon * 10000;

  const result = useMemo(() => {
    let statutoryRate = 0;
    let typeName = '';
    let canInvoice = false;

    if (taxType === 'general') {
      statutoryRate = 0.10;
      typeName = isKo ? '일반과세자 (10%)' : 'General Taxpayer (10%)';
      canInvoice = true;
    } else if (taxType === 'simplified_over48') {
      statutoryRate = 0.04;
      typeName = isKo ? '간이과세자 (세금계산서 발급, 4%)' : 'Simplified Taxpayer (4%)';
      canInvoice = true;
    } else {
      statutoryRate = 0.00;
      typeName = isKo ? '영세 간이과세자 (0%)' : 'Micro Simplified Taxpayer (0%)';
      canInvoice = false;
    }

    const legalVat = Math.round(fee * statutoryRate);
    const totalLegal = fee + legalVat;
    const isOvercharging = demandedVat > legalVat;
    const overchargedAmount = isOvercharging ? demandedVat - legalVat : 0;

    return {
      fee,
      taxType,
      typeName,
      canInvoice,
      statutoryRate: `${(statutoryRate * 100).toFixed(0)}%`,
      legalVat,
      totalLegal,
      demandedVat,
      isOvercharging,
      overchargedAmount,
    };
  }, [fee, taxType, demandedVat, isKo]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* 헤더 */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" />
          <span>{isKo ? '복비 부가세 바가지 방어' : 'Brokerage Fee VAT Guard'}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {isKo ? '부동산 중개보수 부가세 과세유형 검증기' : 'Real Estate Brokerage Fee VAT Validator'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isKo
            ? '공인중개사 사업자등록 과세유형(일반 10%, 간이 4%, 영세 0%)을 대조하여 10% 부가세 바가지 청구를 즉시 진단합니다.'
            : 'Verify legitimate VAT rates (0% to 10%) on realtor brokerage fees based on business tax classification.'}
        </p>
      </div>

      {/* 중개사 과세 유형 선택 */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={taxType === 'simplified_under48' ? 'default' : 'outline'}
          onClick={() => {
            setTaxType('simplified_under48');
            setDemandedVatManwon(10);
          }}
        >
          {isKo ? '영세 간이과세자 (0%)' : 'Micro Simplified (0%)'}
        </Button>
        <Button
          variant={taxType === 'simplified_over48' ? 'default' : 'outline'}
          onClick={() => {
            setTaxType('simplified_over48');
            setDemandedVatManwon(10);
          }}
        >
          {isKo ? '간이과세자 (4%)' : 'Simplified (4%)'}
        </Button>
        <Button
          variant={taxType === 'general' ? 'default' : 'outline'}
          onClick={() => {
            setTaxType('general');
            setDemandedVatManwon(10);
          }}
        >
          {isKo ? '일반과세자 (10%)' : 'General (10%)'}
        </Button>
      </div>

      {/* 금액 입력 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>{isKo ? '중개수수료 및 청구 내역 입력' : 'Fee & Demanded VAT'}</CardTitle>
          <CardDescription>
            {isKo
              ? '계약서상 순수 법정 중개보수와 중개사가 요구한 부가세 금액을 만원 단위로 입력하세요.'
              : 'Enter agreed brokerage fee and demanded VAT amount.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isKo ? '순수 중개보수 (복비 원금)' : 'Base Brokerage Fee'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={feeManwon}
                  onChange={(e) => setFeeManwon(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">만원</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isKo ? '중개사가 요구한 부가세액' : 'Demanded VAT Amount'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={demandedVatManwon}
                  onChange={(e) => setDemandedVatManwon(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">만원</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 결과 분석 지표 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '법정 정당 부가세' : 'Legal Statutory VAT'}</span>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {(result.legalVat / 10000).toLocaleString()}만원
              </p>
              <p className="mt-1 text-xs text-muted-foreground">적용 요율: {result.statutoryRate}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '바가지 여부 판정' : 'Overcharge Status'}</span>
                {result.isOvercharging ? (
                  <Badge variant="destructive">{isKo ? '바가지 감지' : 'Overcharged'}</Badge>
                ) : (
                  <Badge variant="secondary">{isKo ? '정상 청구' : 'Fair'}</Badge>
                )}
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {result.isOvercharging
                  ? `+${(result.overchargedAmount / 10000).toLocaleString()}만원`
                  : (isKo ? '적법 금액' : 'Compliant')}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {result.isOvercharging ? (isKo ? '초과 징수 위험' : 'Unlawful markup') : (isKo ? '법정 한도 내' : 'Within legal cap')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '합법 최종 지급액' : 'Total Fair Payment'}</span>
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {(result.totalLegal / 10000).toLocaleString()}만원
              </p>
              <p className="mt-1 text-xs text-muted-foreground">복비 + 법정 부가세 합계</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 진단 가이드 및 현금영수증 권리 */}
      <Card>
        <CardHeader>
          <CardTitle>{isKo ? '소비자 필수 권리 및 대응 가이드' : 'Consumer Rights & Advice'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            {result.isOvercharging ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-destructive font-semibold">
                  <ShieldAlert className="h-4 w-4" />
                  <span>{isKo ? '불법 바가지 부가세 청구 경고' : 'Overcharge Warning'}</span>
                </div>
                <p>
                  {isKo
                    ? `선택하신 중개업소는 [${result.typeName}]입니다. 부가가치세법상 법정 부가세는 ${(result.legalVat / 10000).toLocaleString()}만원(${result.statutoryRate})에 불과하지만, 중개사가 ${(result.demandedVat / 10000).toLocaleString()}만원을 요구하여 약 ${(result.overchargedAmount / 10000).toLocaleString()}만원이 과다 청구되었습니다.`
                    : `This broker is classified as a ${result.typeName} with a maximum statutory VAT of ${(result.legalVat / 10000).toLocaleString()} KRW, but requested ${(result.demandedVat / 10000).toLocaleString()} KRW.`}
                </p>
                <p className="text-xs text-foreground font-medium">
                  💡 대응법: 홈택스에서 중개사의 사업자등록번호를 조회하여 간이과세자 여부를 확인하고, "법정 간이과세 요율({result.statutoryRate})에 맞춘 금액만 입금하겠다"고 고지하세요.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isKo ? '법정 부가세 준수 정상 거래' : 'Lawful VAT Charge'}</span>
                </div>
                <p>
                  {isKo
                    ? `청구된 부가세(${(result.demandedVat / 10000).toLocaleString()}만원)는 중개업소 과세 유형에 따른 법정 한도(${(result.legalVat / 10000).toLocaleString()}만원)를 준수하고 있습니다.`
                    : `The requested VAT is strictly within the legal statutory limit.`}
                </p>
              </div>
            )}

            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
              <span className="font-semibold text-foreground text-xs">
                💡 10만원 이상 복비는 현금영수증 의무 발행 대상 (소득세법 제162조의3)
              </span>
              <p className="text-xs">
                부동산 중개업은 현금영수증 의무발행 업종입니다. 소비자가 요청하지 않더라도 중개사는 10만원 이상 결제 시 5일 이내에 국세청 지정번호(010-000-1234)로 자진 발급해야 합니다. 미발급 시 국세청에 신고하면 포상금(발급 거부액의 20%)을 받을 수 있습니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
