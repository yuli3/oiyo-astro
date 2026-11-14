import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export function ReconstructionRightsTaxCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [type, setType] = useState<'rights' | 'presale'>('rights'); // 조합원 입주권 vs 일반 분양권
  const [salePriceHundredMillions, setSalePriceHundredMillions] = useState(11); // 양도가액 (억원)
  const [gainMillions, setGainMillions] = useState(300); // 양도차익 (백만원)
  const [holdingMonths, setHoldingMonths] = useState(28); // 보유기간 (개월)
  const [isOnlyRights, setIsOnlyRights] = useState(true); // 무주택 1입주권 여부
  const [isOriginalQualified, setIsOriginalQualified] = useState(true); // 종전주택 2년 보유 충족

  const result = useMemo(() => {
    const salePrice = salePriceHundredMillions * 100000000;
    const capitalGain = gainMillions * 1000000;
    const isPresale = type === 'presale';

    let isTaxExempt = false;
    let taxRateDesc = '';
    let effectiveRate = 0;
    let taxableGain = Math.max(0, capitalGain - 2500000);

    if (isPresale) {
      if (holdingMonths < 12) {
        effectiveRate = 0.70;
        taxRateDesc = isKo ? '70% 단일세율 (1년 미만)' : '70% Flat Rate (<1 yr)';
      } else {
        effectiveRate = 0.60;
        taxRateDesc = isKo ? '60% 단일세율 (1년 이상)' : '60% Flat Rate (>=1 yr)';
      }
    } else {
      if (isOnlyRights && isOriginalQualified) {
        if (salePrice <= 1200000000) {
          isTaxExempt = true;
          taxableGain = 0;
          effectiveRate = 0;
          taxRateDesc = isKo ? '1세대 1입주권 비과세 (12억 이하)' : '1-Right Tax Exemption';
        } else {
          const taxableRatio = (salePrice - 1200000000) / salePrice;
          taxableGain = Math.max(0, Math.round(capitalGain * taxableRatio) - 2500000);
          effectiveRate = 0.38;
          taxRateDesc = isKo ? '12억원 초과분 기본세율 과세' : 'Basic Rates on >1.2B KRW';
        }
      } else {
        if (holdingMonths < 12) {
          effectiveRate = 0.70;
          taxRateDesc = isKo ? '70% 단일세율 (1년 미만)' : '70% (<1 yr)';
        } else if (holdingMonths < 24) {
          effectiveRate = 0.60;
          taxRateDesc = isKo ? '60% 단일세율 (1~2년)' : '60% (1-2 yrs)';
        } else {
          taxRateDesc = isKo ? '기본세율 (6~45%)' : 'Standard Progressive (6-45%)';
          if (taxableGain <= 14000000) effectiveRate = 0.06;
          else if (taxableGain <= 50000000) effectiveRate = 0.15;
          else if (taxableGain <= 88000000) effectiveRate = 0.24;
          else if (taxableGain <= 150000000) effectiveRate = 0.35;
          else if (taxableGain <= 300000000) effectiveRate = 0.38;
          else if (taxableGain <= 500000000) effectiveRate = 0.40;
          else effectiveRate = 0.42;
        }
      }
    }

    const incomeTax = isTaxExempt ? 0 : Math.round(taxableGain * effectiveRate);
    const localTax = isTaxExempt ? 0 : Math.round(incomeTax * 0.10);
    const totalTax = incomeTax + localTax;

    return {
      salePrice,
      capitalGain,
      isTaxExempt,
      taxRateDesc,
      taxableGain,
      incomeTax,
      localTax,
      totalTax,
    };
  }, [type, salePriceHundredMillions, gainMillions, holdingMonths, isOnlyRights, isOriginalQualified, isKo]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {isKo ? '🏗️ 재건축·재개발 입주권 vs 분양권 양도세 & 비과세 가이드' : '🏗️ Reconstruction Rights vs Presale Tax Calculator'}
              </CardTitle>
              <CardDescription>
                {isKo
                  ? '조합원 입주권과 일반 분양권의 세율 차이 및 1세대 1입주권 비과세(12억원 한도) 요건을 정밀 진단합니다.'
                  : 'Calculate capital gains tax differences between reconstruction tenant rights and presale tickets.'}
              </CardDescription>
            </div>
            <Badge variant={result.isTaxExempt ? 'outline' : 'secondary'}>
              {result.isTaxExempt
                ? (isKo ? '100% 비과세' : 'Tax Exempt')
                : `${result.taxRateDesc}`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '보유 권리 유형' : 'Holding Asset Type'}
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={type === 'rights' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setType('rights')}
                  >
                    {isKo ? '조합원 입주권 (비과세 가능)' : 'Reconstruction Right'}
                  </Button>
                  <Button
                    variant={type === 'presale' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setType('presale')}
                  >
                    {isKo ? '일반 분양권 (단일세율)' : 'Presale Ticket'}
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '보유 기간 (개월)' : 'Holding Months'}
                </label>
                <Input
                  type="number"
                  min={1}
                  max={120}
                  value={holdingMonths}
                  onChange={(e) => setHoldingMonths(Math.max(1, Number(e.target.value) || 0))}
                />
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '양도가액 (억원)' : 'Sale Price (100M KRW)'}
                </label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  step={0.5}
                  value={salePriceHundredMillions}
                  onChange={(e) => setSalePriceHundredMillions(Math.max(0.1, Number(e.target.value) || 0))}
                />
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '양도차익 (백만원)' : 'Capital Gain (Million KRW)'}
                </label>
                <Input
                  type="number"
                  min={1}
                  max={5000}
                  value={gainMillions}
                  onChange={(e) => setGainMillions(Math.max(0, Number(e.target.value) || 0))}
                />
              </div>
            </div>

            {type === 'rights' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg bg-muted/10">
                <div>
                  <label className="text-sm font-medium pb-1.5 block">
                    {isKo ? '관리처분일 당시 종전주택 2년 보유/거주 여부' : 'Original Home 2-Year Met at Approval'}
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant={isOriginalQualified ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => setIsOriginalQualified(true)}
                    >
                      {isKo ? '충족함' : 'Satisfied'}
                    </Button>
                    <Button
                      variant={!isOriginalQualified ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => setIsOriginalQualified(false)}
                    >
                      {isKo ? '미충족' : 'Not Met'}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium pb-1.5 block">
                    {isKo ? '양도 시점 다른 주택 보유 여부' : 'Other House Owned at Sale'}
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant={isOnlyRights ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => setIsOnlyRights(true)}
                    >
                      {isKo ? '무주택 (입주권만 보유)' : 'Only Right Owned'}
                    </Button>
                    <Button
                      variant={!isOnlyRights ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => setIsOnlyRights(false)}
                    >
                      {isKo ? '다른 주택 있음' : 'Owns Other House'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4 space-y-1 bg-muted/20">
                <div className="text-xs text-muted-foreground">{isKo ? '적용 세율' : 'Applied Tax Rate'}</div>
                <div className="text-xl font-bold">{result.taxRateDesc}</div>
                <div className="text-xs text-muted-foreground">
                  {isKo ? `보유 ${holdingMonths}개월 기준` : `Based on ${holdingMonths} months`}
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-1 bg-muted/20">
                <div className="text-xs text-muted-foreground">{isKo ? '과세대상 양도차익' : 'Taxable Gain'}</div>
                <div className="text-xl font-bold">
                  {(result.taxableGain / 10000).toLocaleString()} {isKo ? '만원' : '10k KRW'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isKo ? '기본공제 250만원 반영' : 'Reflecting 2.5M deduction'}
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-1 bg-muted/20">
                <div className="text-xs text-muted-foreground">{isKo ? '최종 납부세액 (지방세 포함)' : 'Total Tax Due'}</div>
                <div className={`text-2xl font-bold ${result.isTaxExempt ? 'text-primary' : 'text-foreground'}`}>
                  {result.isTaxExempt
                    ? (isKo ? '0원 (전액 비과세)' : '0 KRW (Exempt)')
                    : `${(result.totalTax / 10000).toLocaleString()} ${isKo ? '만원' : '10k KRW'}`}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isKo ? `소득세 ${(result.incomeTax / 10000).toLocaleString()}만 + 지방세 ${(result.localTax / 10000).toLocaleString()}만` : 'Income + local tax'}
                </div>
              </div>
            </div>

            {/* Educational Defense Guide */}
            <div className="rounded-lg border p-4 text-xs space-y-2 bg-muted/10 text-muted-foreground">
              <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                {isKo ? '입주권·분양권 양도세 핵심 실무 가이드' : 'Key Tax Practice Rules'}
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong>{isKo ? '분양권은 비과세 불가' : 'Presale Tickets Never Exempt'}:</strong> {isKo ? '일반 분양권은 아무리 오래 보유해도 단일 60%가 적용되며 비과세가 적용되지 않습니다.' : 'Presale tickets are subject to flat 60~70% without exemptions.'}
                </li>
                <li>
                  <strong>{isKo ? '입주권 12억원 초과 안분' : 'Rights Over 1.2B KRW'}:</strong> {isKo ? '1세대 1입주권 비과세 요건을 갖췄더라도 12억원을 초과하는 고가 입주권은 12억 초과 비율만큼 기본세율로 과세됩니다.' : 'Portion exceeding 1.2B KRW is taxed proportionally.'}
                </li>
                <li>
                  <strong>{isKo ? '대체주택 비과세 3년 룰' : 'Alternative Housing 3-Year Rule'}:</strong> {isKo ? '사업시행인가 후 거주용 대체주택을 산 경우 완공 전 또는 완공 후 3년 내 매도하고 3년 내 전입하여 1년 이상 살면 비과세됩니다.' : 'Alternative home exemption requires 3-year sale & 1-year residency.'}
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default ReconstructionRightsTaxCalculator;
