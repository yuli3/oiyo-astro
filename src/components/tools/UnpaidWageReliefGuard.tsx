import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertCircle, ShieldAlert, Sparkles, Building, Landmark, Scale, FileText } from 'lucide-react';

export default function UnpaidWageReliefGuard() {
  const [unpaidWage, setUnpaidWage] = useState<number>(6000000);
  const [unpaidSeverance, setUnpaidSeverance] = useState<number>(5000000);
  const [businessActiveMonths, setBusinessActiveMonths] = useState<number>(12);
  const [monthsSinceResignation, setMonthsSinceResignation] = useState<number>(3);
  const [isEmployed, setIsEmployed] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const result = useMemo(() => {
    const totalUnpaid = unpaidWage + unpaidSeverance;
    const approvedWage = Math.min(unpaidWage, 7000000);
    const approvedSeverance = Math.min(unpaidSeverance, 7000000);
    const sumApproved = approvedWage + approvedSeverance;
    const reliefAmount = Math.min(sumApproved, 10000000);
    const uncompensatedAmount = Math.max(0, totalUnpaid - reliefAmount);

    const checks = [];
    const isBusinessValid = businessActiveMonths >= 6;
    checks.push({
      title: '사업주 6개월 이상 사업 영위 요건',
      passed: isBusinessValid,
      actual: `${businessActiveMonths}개월 가동`,
      description: isBusinessValid
        ? '산재보험 적용 6개월 이상 사업장 요건을 충족합니다.'
        : '사업 운영 기간이 6개월 미만인 경우 간이대지급금 지급이 불가할 수 있습니다.',
    });

    const isTimeLimitValid = isEmployed || monthsSinceResignation <= 12;
    checks.push({
      title: '법정 신청 기한 (퇴직 후 1년 이내)',
      passed: isTimeLimitValid,
      actual: isEmployed ? '재직자 (체불 발생 후 1년 이내)' : `퇴직 후 ${monthsSinceResignation}개월 경과`,
      description: isTimeLimitValid
        ? '법정 제척기간(퇴직 후 1년) 이내로 정상 청구 가능합니다.'
        : '퇴직 후 1년이 지나 대지급금 신청 기한이 도과되었습니다.',
    });

    const isEligible = checks.every(c => c.passed);

    return {
      totalUnpaid,
      approvedWage,
      approvedSeverance,
      reliefAmount: isEligible ? reliefAmount : 0,
      uncompensatedAmount: isEligible ? uncompensatedAmount : totalUnpaid,
      isEligible,
      checks,
    };
  }, [unpaidWage, unpaidSeverance, businessActiveMonths, monthsSinceResignation, isEmployed]);

  const copyResult = () => {
    const text = `[OIYO 임금체불 간이대지급금 진단 결과]
- 판정: ${result.isEligible ? '✅ 간이대지급금 지원 대상' : '❌ 지원 요건 미달'}
- 총 체불액: ${(result.totalUnpaid / 10000).toLocaleString()}만원
- 국가 우선 지급 예상액: ${(result.reliefAmount / 10000).toLocaleString()}만원 (최대 1,000만원)
  * 임금 인정분: ${(result.approvedWage / 10000).toLocaleString()}만원 (최대 700만원)
  * 퇴직금 인정분: ${(result.approvedSeverance / 10000).toLocaleString()}만원 (최대 700만원)
- 한도 초과 잔여 체불액: ${(result.uncompensatedAmount / 10000).toLocaleString()}만원 (민사 청구 필요)
https://tools.oiyo.net/ko/unpaid-wage-relief-guard/`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-primary" />
            <CardTitle>임금체불 간이대지급금(소액체당금) 모의계산기</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            임금채권보장법 제7조 기준, 사업주 대신 국가(근로복지공단)가 먼저 지급해주는 간이대지급금(최대 1,000만원) 수령액을 진단합니다.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Presets */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground self-center">빠른 예시:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setUnpaidWage(5000000);
                  setUnpaidSeverance(4000000);
                  setBusinessActiveMonths(12);
                  setMonthsSinceResignation(2);
                  setIsEmployed(false);
                }}
              >
                일반 퇴사자 (임금 500만 + 퇴직금 400만)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setUnpaidWage(9000000);
                  setUnpaidSeverance(6000000);
                  setBusinessActiveMonths(24);
                  setMonthsSinceResignation(5);
                  setIsEmployed(false);
                }}
              >
                고액 체불 (1,500만 체불, 1,000만 한도 초과)
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Input unpaid amounts */}
              <div className="space-y-4 border rounded-lg p-4 border-border bg-muted/20">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Scale className="w-4 h-4 text-primary" />
                  <span>체불 금액 입력</span>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="unpaidWage" className="text-xs">체불 임금 및 휴업수당 (최종 3개월분, 원)</Label>
                  <Input
                    id="unpaidWage"
                    type="number"
                    value={unpaidWage}
                    step={500000}
                    onChange={(e) => setUnpaidWage(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">항목별 지급 상한액: 최대 700만원</p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="unpaidSeverance" className="text-xs">체불 퇴직급여 (최종 3년분, 원)</Label>
                  <Input
                    id="unpaidSeverance"
                    type="number"
                    value={unpaidSeverance}
                    step={500000}
                    onChange={(e) => setUnpaidSeverance(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">항목별 지급 상한액: 최대 700만원</p>
                </div>
              </div>

              {/* Right: Conditions */}
              <div className="space-y-4 border rounded-lg p-4 border-border bg-muted/20">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Building className="w-4 h-4 text-primary" />
                  <span>사업장 및 퇴직 시기 요건</span>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="businessActiveMonths" className="text-xs">사업주 사업 영위 기간 (가동 월수)</Label>
                  <Input
                    id="businessActiveMonths"
                    type="number"
                    value={businessActiveMonths}
                    min={1}
                    max={120}
                    onChange={(e) => setBusinessActiveMonths(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">법정 요건: 산재보험 적용 최소 6개월 이상</p>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="employedCheck"
                      checked={isEmployed}
                      onChange={(e) => setIsEmployed(e.target.checked)}
                      className="rounded border-border text-primary"
                    />
                    <Label htmlFor="employedCheck" className="text-xs cursor-pointer">
                      현재 퇴사하지 않고 재직 중인 근로자입니다
                    </Label>
                  </div>

                  {!isEmployed && (
                    <div className="space-y-1 pt-1">
                      <Label htmlFor="monthsSinceResignation" className="text-xs">퇴직일로부터 경과 기간 (월)</Label>
                      <Input
                        id="monthsSinceResignation"
                        type="number"
                        value={monthsSinceResignation}
                        min={0}
                        max={36}
                        onChange={(e) => setMonthsSinceResignation(Number(e.target.value))}
                      />
                      <p className="text-xs text-muted-foreground">법정 기한: 퇴직 후 1년 이내 노동청 진정 필수</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Results Box */}
            <div className="p-6 border rounded-xl border-border bg-card space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {result.isEligible ? (
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-destructive" />
                  )}
                  <div>
                    <h3 className="font-bold text-lg">
                      {result.isEligible ? '🎉 간이대지급금 우선 지급 대상입니다!' : '⚠️ 대지급금 지급 요건 미충족'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {result.isEligible
                        ? '근로복지공단을 통해 사업주 대신 국가로부터 신속히 입금받을 수 있습니다.'
                        : '법정 가동 기간 또는 신청 기한(1년)을 확인해 주세요.'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">국가 우선 지급 예상액</span>
                  <p className="text-2xl font-black text-primary">
                    {result.reliefAmount.toLocaleString()}원
                  </p>
                </div>
              </div>

              {/* Checks */}
              <div className="space-y-2 pt-2 border-t border-border">
                {result.checks.map((chk, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-border bg-muted/20 text-xs">
                    <div className="flex items-center gap-2">
                      {chk.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-destructive" />
                      )}
                      <span>{chk.title}</span>
                    </div>
                    <span className={chk.passed ? 'font-semibold text-primary' : 'font-semibold text-destructive'}>
                      {chk.actual} ({chk.passed ? '충족' : '미달'})
                    </span>
                  </div>
                ))}
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 text-xs">
                <div className="p-2 border rounded border-border bg-muted/10">
                  <span className="text-muted-foreground">총 체불액</span>
                  <p className="font-bold text-sm">{(result.totalUnpaid / 10000).toLocaleString()}만원</p>
                </div>
                <div className="p-2 border rounded border-border bg-muted/10">
                  <span className="text-muted-foreground">임금 인정액 (최대 700만)</span>
                  <p className="font-bold text-sm">{(result.approvedWage / 10000).toLocaleString()}만원</p>
                </div>
                <div className="p-2 border rounded border-border bg-muted/10">
                  <span className="text-muted-foreground">퇴직금 인정액 (최대 700만)</span>
                  <p className="font-bold text-sm">{(result.approvedSeverance / 10000).toLocaleString()}만원</p>
                </div>
                <div className="p-2 border rounded border-border bg-muted/10">
                  <span className="text-muted-foreground">초과 미지급 잔여액</span>
                  <p className="font-bold text-sm">{(result.uncompensatedAmount / 10000).toLocaleString()}만원</p>
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
