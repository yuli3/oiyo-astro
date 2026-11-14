import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldAlert, AlertTriangle, CheckCircle2, Building, Sparkles, Receipt } from 'lucide-react';

export function OfficetelTaxGuard({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [priceMillions, setPriceMillions] = useState(350); // 오피스텔 취득가 (백만원)
  const [isResidential, setIsResidential] = useState(true); // 주거용 사용 여부
  const [vatRefunded, setVatRefunded] = useState(true); // 부가세 환급 여부
  const [yearsHeld, setYearsHeld] = useState(3); // 보유 연수
  const [hasOtherHouse, setHasOtherHouse] = useState(true); // 기존 다른 주택 보유 여부

  const result = useMemo(() => {
    const price = priceMillions * 1000000;
    const acquisitionTax = Math.round(price * 0.046);

    // 건물분 70% 가정, 부가세 10%
    const totalVat = Math.round(price * 0.70 * 0.10);
    let vatClawback = 0;
    let isClawbackRisk = false;

    if (vatRefunded && isResidential) {
      const remainingRatio = Math.max(0, 1.0 - (yearsHeld * 0.10));
      if (remainingRatio > 0) {
        isClawbackRisk = true;
        vatClawback = Math.round(totalVat * remainingRatio);
      }
    }

    return {
      price,
      acquisitionTax,
      totalVat,
      vatClawback,
      isClawbackRisk,
      remainingYears: Math.max(0, 10 - yearsHeld),
      capitalGainsRisk: isResidential && hasOtherHouse,
    };
  }, [priceMillions, isResidential, vatRefunded, yearsHeld, hasOtherHouse]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {isKo ? '🏢 오피스텔 주택수 판정 & 세금·부가세 추징 가드' : '🏢 Officetel Housing Count & Tax Clawback Guard'}
              </CardTitle>
              <CardDescription>
                {isKo
                  ? '취득세(4.6% 단일), 양도세 주택수 산입 리스크 및 일반사업자 부가세 10% 환급 추징액을 1초 만에 진단합니다.'
                  : 'Evaluate officetel housing count classification for acquisition/capital gains taxes and check VAT clawback risks.'}
              </CardDescription>
            </div>
            <Badge variant={result.isClawbackRisk || result.capitalGainsRisk ? 'destructive' : 'outline'}>
              {result.isClawbackRisk || result.capitalGainsRisk
                ? (isKo ? '세무 주의 필요' : 'Tax Caution')
                : (isKo ? '세무 안전' : 'Tax Safe')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '오피스텔 매매/분양가 (백만원)' : 'Officetel Price (Million KRW)'}
                </label>
                <Input
                  type="number"
                  min={50}
                  max={5000}
                  value={priceMillions}
                  onChange={(e) => setPriceMillions(Math.max(1, Number(e.target.value) || 0))}
                />
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '현재 실제 사용 용도' : 'Actual Usage'}
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={isResidential ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setIsResidential(true)}
                  >
                    {isKo ? '주거용 (전입신고)' : 'Residential'}
                  </Button>
                  <Button
                    variant={!isResidential ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setIsResidential(false)}
                  >
                    {isKo ? '업무용 (사무실/사업자)' : 'Commercial'}
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '분양 당시 부가세 10% 환급 여부' : 'VAT 10% Refunded at Purchase'}
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={vatRefunded ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setVatRefunded(true)}
                  >
                    {isKo ? '일반임대사업자 환급받음' : 'Refunded'}
                  </Button>
                  <Button
                    variant={!vatRefunded ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setVatRefunded(false)}
                  >
                    {isKo ? '환급 안 받음 (주택임대 등)' : 'Not Refunded'}
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '보유 기간 (년)' : 'Years Held'}
                </label>
                <Input
                  type="number"
                  min={0}
                  max={20}
                  value={yearsHeld}
                  onChange={(e) => setYearsHeld(Math.max(0, Number(e.target.value) || 0))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium pb-1.5 block">
                {isKo ? '기존 다른 아파트/주택 보유 여부' : 'Owning Other Residential House'}
              </label>
              <div className="flex gap-2">
                <Button
                  variant={hasOtherHouse ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setHasOtherHouse(true)}
                >
                  {isKo ? '다른 주택 보유 중 (1주택 이상)' : 'Owns Other House'}
                </Button>
                <Button
                  variant={!hasOtherHouse ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setHasOtherHouse(false)}
                >
                  {isKo ? '무주택 (오피스텔 단독 보유)' : 'No Other House'}
                </Button>
              </div>
            </div>

            {/* 3-Tax Impact Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4 space-y-2 bg-muted/20">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Receipt className="h-4 w-4" />
                  {isKo ? '취득세 판정' : 'Acquisition Tax'}
                </div>
                <div className="text-xl font-bold">
                  {(result.acquisitionTax / 10000).toFixed(1)} {isKo ? '만원' : '10k KRW'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isKo ? '무조건 4.6% 단일세율 (주택 중과 배제)' : 'Fixed 4.6% Rate'}
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-2 bg-muted/20">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Building className="h-4 w-4" />
                  {isKo ? '양도세 주택수 판정' : 'Capital Gains Tax'}
                </div>
                <div className={`text-base font-bold ${result.capitalGainsRisk ? 'text-destructive' : 'text-primary'}`}>
                  {isResidential
                    ? (isKo ? '주택수 산입 (실질과세)' : 'Counted as House')
                    : (isKo ? '주택수 제외 (업무용)' : 'Excluded from House Count')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {result.capitalGainsRisk
                    ? (isKo ? '기존 아파트 비과세 박탈 위험!' : '1-Home Exemption at Risk!')
                    : (isKo ? '양도세 주택 중과 위험 없음' : 'Safe from multi-home tax')}
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-2 bg-muted/20">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  {isKo ? '부가세 10% 환급 추징' : 'VAT Clawback'}
                </div>
                <div className={`text-xl font-bold ${result.isClawbackRisk ? 'text-destructive' : 'text-primary'}`}>
                  {result.isClawbackRisk
                    ? `${(result.vatClawback / 10000).toFixed(1)} ${isKo ? '만원' : '10k KRW'}`
                    : (isKo ? '0원 (안전)' : '0 KRW (Safe)')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {result.isClawbackRisk
                    ? (isKo ? `10년 룰 잔여 ${result.remainingYears}년분 환수` : `10-year rule clawback`)
                    : (isKo ? '추징 리스크 없음' : 'No clawback')}
                </div>
              </div>
            </div>

            {/* Warning Details Banner */}
            {result.isClawbackRisk && (
              <div className="rounded-lg border p-4 space-y-2 bg-destructive/10 border-destructive/30">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-destructive" />
                  <span className="font-semibold text-sm">
                    {isKo ? '🚨 국세청 부가세 환급 추징 주의보!' : '🚨 VAT Refund Clawback Warning!'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isKo
                    ? `일반임대사업자로 환급받은 부가세 약 ${(result.totalVat / 10000).toFixed(1)}만원 중, 10년 의무기간 내 주거용(전입신고) 전용으로 인해 잔여기간 ${result.remainingYears}년에 해당하는 약 ${(result.vatClawback / 10000).toFixed(1)}만원이 국세청에 의해 추징(가산세 포함)될 수 있습니다.`
                    : 'Switching to residential use within 10 years triggers proportionate VAT clawback.'}
                </p>
              </div>
            )}

            {/* Educational Defense Guide */}
            <div className="rounded-lg border p-4 text-xs space-y-2 bg-muted/10 text-muted-foreground">
              <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                {isKo ? '오피스텔 세무조사 대비 3대 상식' : '3 Essential Rules for Officetels'}
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong>{isKo ? '실질과세 원칙' : 'Substance over Form'}:</strong> {isKo ? '건축물대장에 업무시설로 되어 있어도 세입자가 전입신고를 하거나 실제 거주하면 세법상 무조건 주택입니다.' : 'Actual residential use classifies officetel as house.'}
                </li>
                <li>
                  <strong>{isKo ? '아파트 매도 전 오피스텔 점검' : 'Check Before Selling Apartment'}:</strong> {isKo ? '주택 오피스텔을 가진 상태에서 1주택 아파트를 팔면 1세대 1주택 비과세를 받지 못하고 거액의 양도세가 부과됩니다.' : 'Selling an apartment while owning a residential officetel forfeits 1-home tax exemption.'}
                </li>
                <li>
                  <strong>{isKo ? '부가세 10년 의무' : '10-Year VAT Rule'}:</strong> {isKo ? '일반임대 부가세를 환급받았다면 10년간 업무용 임대 사업자등록 세입자만 받아야 안전합니다.' : 'Must maintain commercial lease for 10 years to avoid clawback.'}
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default OfficetelTaxGuard;
