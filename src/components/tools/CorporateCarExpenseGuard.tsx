import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertCircle, ShieldAlert, Sparkles, Car, Building2, Calculator, FileSpreadsheet } from 'lucide-react';

export default function CorporateCarExpenseGuard() {
  const [carPrice, setCarPrice] = useState<number>(95000000);
  const [annualMaintenance, setAnnualMaintenance] = useState<number>(12000000);
  const [hasMileageLog, setHasMileageLog] = useState<boolean>(true);
  const [businessRatio, setBusinessRatio] = useState<number>(85);
  const [isCorporate, setIsCorporate] = useState<boolean>(true);
  const [hasGreenPlate, setHasGreenPlate] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const analysis = useMemo(() => {
    const isGreenPlateTarget = isCorporate && carPrice >= 80000000;
    const isGreenPlateViolated = isGreenPlateTarget && !hasGreenPlate;
    const yearlyDepreciation = Math.round(carPrice / 5);
    const ratioDecimal = businessRatio / 100;

    let approvedDepreciation = 0;
    let approvedMaintenance = 0;
    let disallowedAmount = 0;
    let reason = '';

    if (isGreenPlateViolated) {
      approvedDepreciation = 0;
      approvedMaintenance = 0;
      disallowedAmount = yearlyDepreciation + annualMaintenance;
      reason = '🚨 8,000만원 이상 법인 고가 승용차 연두색 번호판 미부착으로 세법상 비용 인정 전액 불산입(0원 인정) 처리됩니다!';
    } else if (!hasMileageLog) {
      const totalCost = yearlyDepreciation + annualMaintenance;
      if (totalCost <= 15000000) {
        approvedDepreciation = yearlyDepreciation;
        approvedMaintenance = annualMaintenance;
        disallowedAmount = 0;
        reason = '운행기록부 미작성이나 연간 총 비용이 1,500만원 이하이므로 전액 비용 인정됩니다.';
      } else {
        approvedDepreciation = Math.min(yearlyDepreciation, 8000000);
        const remainingLimit = 15000000 - approvedDepreciation;
        approvedMaintenance = Math.min(annualMaintenance, remainingLimit);
        disallowedAmount = totalCost - (approvedDepreciation + approvedMaintenance);
        reason = `운행기록부 미작성으로 연간 1,500만원 한도만 인정되며, 초과액 ${(disallowedAmount / 10000).toLocaleString()}만원은 손금불산입(상여 과세)됩니다.`;
      }
    } else {
      const effectiveDepreciation = Math.round(yearlyDepreciation * ratioDecimal);
      approvedDepreciation = Math.min(effectiveDepreciation, 8000000);
      const carriedOverDepreciation = effectiveDepreciation - approvedDepreciation;
      approvedMaintenance = Math.round(annualMaintenance * ratioDecimal);
      disallowedAmount = Math.round((yearlyDepreciation + annualMaintenance) * (1 - ratioDecimal));
      reason = `운행기록부(업무비율 ${businessRatio}%) 작성으로 연간 총 ${((approvedDepreciation + approvedMaintenance) / 10000).toLocaleString()}만원 손금 인정됩니다. ${carriedOverDepreciation > 0 ? `(800만 초과분 ${(carriedOverDepreciation / 10000).toLocaleString()}만 익년 이월)` : ''}`;
    }

    const totalApproved = approvedDepreciation + approvedMaintenance;
    const estimatedTaxSavings = Math.round(totalApproved * 0.20);

    return {
      isGreenPlateTarget,
      isGreenPlateViolated,
      yearlyDepreciation,
      approvedDepreciation,
      approvedMaintenance,
      totalApproved,
      disallowedAmount,
      estimatedTaxSavings,
      reason,
    };
  }, [carPrice, annualMaintenance, hasMileageLog, businessRatio, isCorporate, hasGreenPlate]);

  const copyResult = () => {
    const text = `[OIYO 업무용 승용차 비용처리 & 연두색 번호판 진단]
- 차량가액: ${(carPrice / 10000).toLocaleString()}만원 (${isCorporate ? '법인' : '개인사업자'})
- 연두색 번호판: ${analysis.isGreenPlateTarget ? (hasGreenPlate ? '✅ 부착 완료' : '🚨 미부착 (전액 불산입 위기)') : '비대상 (8,000만 미만)'}
- 운행기록부: ${hasMileageLog ? `작성 (${businessRatio}%)` : '미작성 (연 1,500만 한도)'}
- 세법상 손금 인정액: ${(analysis.totalApproved / 10000).toLocaleString()}만원 (연간 절세 효과 ~${(analysis.estimatedTaxSavings / 10000).toLocaleString()}만원)
- 불인정(손금불산입) 금액: ${(analysis.disallowedAmount / 10000).toLocaleString()}만원
https://tools.oiyo.net/ko/corporate-car-expense-guard/`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            <CardTitle>업무용 승용차 비용처리(1,500만원 한도) & 연두색 번호판 가드</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            법인·개인사업자 차량의 감가상각 800만원 한도, 운행일지 유무별 손금 인정액 및 2024년 8,000만원 이상 연두색 번호판 의무를 판정합니다.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Entity Buttons */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground self-center">사업자 구분:</span>
              <Button
                variant={isCorporate ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsCorporate(true)}
              >
                법인 사업자 (8,000만원 이상 연두색 번호판 적용)
              </Button>
              <Button
                variant={!isCorporate ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsCorporate(false)}
              >
                개인 사업자
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inputs */}
              <div className="space-y-4 border rounded-lg p-4 border-border bg-muted/20">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Calculator className="w-4 h-4 text-primary" />
                  <span>차량 가액 및 유지 비용</span>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="carPrice" className="text-xs">차량 취득가액 (부가세 포함, 원)</Label>
                  <Input
                    id="carPrice"
                    type="number"
                    value={carPrice}
                    step={5000000}
                    onChange={(e) => setCarPrice(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    연간 감가상각비(5년 균등): {((carPrice / 5) / 10000).toLocaleString()}만원/년 (법정한도 800만)
                  </p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="annualMaintenance" className="text-xs">연간 차량 유지비 (유류비, 보험료, 수리비 등 원)</Label>
                  <Input
                    id="annualMaintenance"
                    type="number"
                    value={annualMaintenance}
                    step={1000000}
                    onChange={(e) => setAnnualMaintenance(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Log & Plate Options */}
              <div className="space-y-4 border rounded-lg p-4 border-border bg-muted/20">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <FileSpreadsheet className="w-4 h-4 text-primary" />
                  <span>운행기록부 및 번호판 요건</span>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="logCheck"
                      checked={hasMileageLog}
                      onChange={(e) => setHasMileageLog(e.target.checked)}
                      className="rounded border-border text-primary"
                    />
                    <Label htmlFor="logCheck" className="text-xs cursor-pointer">
                      차량 운행기록부를 성실히 작성하고 있습니다
                    </Label>
                  </div>

                  {hasMileageLog ? (
                    <div className="space-y-1 pl-6">
                      <Label htmlFor="businessRatio" className="text-xs">업무 사용 비율 (%)</Label>
                      <Input
                        id="businessRatio"
                        type="number"
                        value={businessRatio}
                        min={1}
                        max={100}
                        onChange={(e) => setBusinessRatio(Number(e.target.value))}
                      />
                      <p className="text-xs text-muted-foreground">업무 주행거리 ÷ 총 주행거리 비율</p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground pl-6">
                      ⚠️ 운행기록부 미작성 시 연간 총 1,500만원(감가 800만+유지비 700만)까지만 손금 인정됩니다.
                    </p>
                  )}

                  {analysis.isGreenPlateTarget && (
                    <div className="p-3 border rounded-md border-border bg-card space-y-2 pt-2">
                      <div className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          id="plateCheck"
                          checked={hasGreenPlate}
                          onChange={(e) => setHasGreenPlate(e.target.checked)}
                          className="rounded border-border text-primary"
                        />
                        <Label htmlFor="plateCheck" className="text-xs font-semibold cursor-pointer">
                          8,000만원 이상 법인 전용 연두색 번호판 부착 완료
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        2024년 1월부터 시행: 미부착 시 차량 유지비 및 감가상각비 전액(100%) 손금불산입됩니다.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Results Box */}
            <div className="p-6 border rounded-xl border-border bg-card space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {!analysis.isGreenPlateViolated ? (
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  ) : (
                    <ShieldAlert className="w-6 h-6 text-destructive" />
                  )}
                  <div>
                    <h3 className="font-bold text-lg">
                      {!analysis.isGreenPlateViolated ? '✨ 세법상 손금(비용) 인정 계산 완료' : '🚨 연두색 번호판 미부착 경고!'}
                    </h3>
                    <p className="text-xs text-muted-foreground">{analysis.reason}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">총 손금 인정 금액 (비용처리)</span>
                  <p className="text-2xl font-black text-primary">
                    {analysis.totalApproved.toLocaleString()}원
                  </p>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 text-xs border-t border-border">
                <div className="p-2 border rounded border-border bg-muted/10">
                  <span className="text-muted-foreground">인정 감가상각비 (연 800만 한도)</span>
                  <p className="font-bold text-sm">{(analysis.approvedDepreciation / 10000).toLocaleString()}만원</p>
                </div>
                <div className="p-2 border rounded border-border bg-muted/10">
                  <span className="text-muted-foreground">인정 차량유지비</span>
                  <p className="font-bold text-sm">{(analysis.approvedMaintenance / 10000).toLocaleString()}만원</p>
                </div>
                <div className="p-2 border rounded border-border bg-muted/10">
                  <span className="text-muted-foreground">불인정(과세/상여처분)</span>
                  <p className="font-bold text-sm text-destructive">{(analysis.disallowedAmount / 10000).toLocaleString()}만원</p>
                </div>
                <div className="p-2 border rounded border-border bg-muted/10">
                  <span className="text-muted-foreground">예상 법인세/소득세 절세액</span>
                  <p className="font-bold text-sm text-primary">~{(analysis.estimatedTaxSavings / 10000).toLocaleString()}만원</p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={copyResult}>
                  {isCopied ? '복사 완료!' : '결과 복사하기'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
