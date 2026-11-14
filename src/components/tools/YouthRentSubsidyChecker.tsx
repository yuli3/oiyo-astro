import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, AlertCircle, Sparkles, Building, Wallet, User, Home, HelpCircle } from 'lucide-react';

interface CheckItem {
  title: string;
  target: string;
  actual: string;
  passed: boolean;
  description: string;
}

const MEDIAN_INCOME_2026: Record<number, number> = {
  1: 2328000,
  2: 3885000,
  3: 5025000,
  4: 6137000,
  5: 7192000,
};

export default function YouthRentSubsidyChecker() {
  const [age, setAge] = useState<number>(25);
  const [deposit, setDeposit] = useState<number>(10000000);
  const [rent, setRent] = useState<number>(450000);
  const [youthIncome, setYouthIncome] = useState<number>(1100000);
  const [youthAssets, setYouthAssets] = useState<number>(15000000);
  const [isParentExempt, setIsParentExempt] = useState<boolean>(false);
  const [householdSize, setHouseholdSize] = useState<number>(3);
  const [parentIncome, setParentIncome] = useState<number>(4200000);
  const [parentAssets, setParentAssets] = useState<number>(280000000);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const evaluation = useMemo(() => {
    const checks: CheckItem[] = [];

    // 1. 연령 체크 (만 19 ~ 34세)
    const isAgeValid = age >= 19 && age <= 34;
    checks.push({
      title: '연령 요건 (만 19~34세)',
      target: '만 19세 이상 만 34세 이하 청년',
      actual: `만 ${age}세`,
      passed: isAgeValid,
      description: isAgeValid ? '대상 연령 기준을 충족합니다.' : '신청 연도 기준 만 19~34세 범위를 벗어납니다.',
    });

    // 2. 주택 임차 기준
    const depositConversionRent = Math.round((deposit * 0.055) / 12);
    const totalAdjustedRent = rent + depositConversionRent;
    const isHousingBasicPassed = deposit <= 50000000 && rent <= 700000;
    const isHousingExceptionPassed = deposit <= 50000000 && totalAdjustedRent <= 900000;
    const isHousingValid = isHousingBasicPassed || isHousingExceptionPassed;

    checks.push({
      title: '주택 임차 요건 (보증금 5천 & 월세 70만)',
      target: '보증금 5천만원 이하 & 월세 70만원 이하 (환산합계 90만원 이하 특례)',
      actual: `보증금 ${(deposit / 10000).toLocaleString()}만원 / 월세 ${(rent / 10000).toLocaleString()}만원 (환산 ${Math.round(totalAdjustedRent / 10000)}만원)`,
      passed: isHousingValid,
      description: isHousingValid
        ? (rent <= 700000 ? '기본 주택 임차 기준 충족' : '월세 70만원 초과이나 보증금 환산 합계 90만원 이하 특례 인정')
        : '보증금 5천만원 초과 또는 월세 환산액 90만원 초과로 제외됩니다.',
    });

    // 3. 청년 독립가구 소득 및 재산
    const youthMedian100 = MEDIAN_INCOME_2026[1];
    const youthIncomeThreshold = Math.round(youthMedian100 * 0.6);
    const isYouthIncomePassed = youthIncome <= youthIncomeThreshold;
    const isYouthAssetPassed = youthAssets <= 122000000;

    checks.push({
      title: '청년가구 소득 요건 (중위 60% 이하)',
      target: `월 ${(youthIncomeThreshold / 10000).toLocaleString()}만원 이하 (1인가구 기준)`,
      actual: `월 ${(youthIncome / 10000).toLocaleString()}만원 (${Math.round((youthIncome / youthMedian100) * 100)}%)`,
      passed: isYouthIncomePassed,
      description: isYouthIncomePassed ? '청년 소득 요건을 만족합니다.' : '청년 소득 인정액 기준을 초과합니다.',
    });

    checks.push({
      title: '청년가구 재산 요건',
      target: '1억 2,200만원 이하 (주거부채 차감)',
      actual: `${(youthAssets / 10000).toLocaleString()}만원`,
      passed: isYouthAssetPassed,
      description: isYouthAssetPassed ? '청년 재산가액 기준을 만족합니다.' : '청년 재산가액 기준을 초과합니다.',
    });

    // 4. 원가구 소득 및 재산
    const autoExempt = age >= 30 || youthIncome >= Math.round(youthMedian100 * 0.5);
    const effectiveExempt = isParentExempt || autoExempt;

    if (!effectiveExempt) {
      const parentMedian100 = MEDIAN_INCOME_2026[householdSize] || MEDIAN_INCOME_2026[4];
      const isParentIncomePassed = parentIncome <= parentMedian100;
      const isParentAssetPassed = parentAssets <= 470000000;

      checks.push({
        title: `원가구(부모) 소득 요건 (${householdSize}인 가구 중위 100% 이하)`,
        target: `월 ${(parentMedian100 / 10000).toLocaleString()}만원 이하`,
        actual: `월 ${(parentIncome / 10000).toLocaleString()}만원`,
        passed: isParentIncomePassed,
        description: isParentIncomePassed ? '원가구 소득 요건 충족' : '원가구 소득 기준 초과',
      });

      checks.push({
        title: '원가구(부모) 재산 요건',
        target: '4억 7,000만원 이하 (주거부채 차감)',
        actual: `${(parentAssets / 10000).toLocaleString()}만원`,
        passed: isParentAssetPassed,
        description: isParentAssetPassed ? '원가구 재산 요건 충족' : '원가구 재산 기준 초과',
      });
    } else {
      checks.push({
        title: '원가구(부모) 심사 면제 특례',
        target: '만 30세 이상 / 기혼 / 중위 50% 이상 독립 생계 유지자',
        actual: age >= 30 ? `만 ${age}세 (30세 이상)` : `독립생계 인정 (청년소득 ${(youthIncome / 10000).toLocaleString()}만원)`,
        passed: true,
        description: '부모 소득·재산 심사가 전액 면제되어 청년 본인 기준만으로 심사합니다.',
      });
    }

    const isEligible = checks.every(c => c.passed);
    const monthlySubsidy = isEligible ? Math.min(200000, rent) : 0;
    const total12m = monthlySubsidy * 12;
    const total24m = monthlySubsidy * 24;

    return {
      checks,
      isEligible,
      monthlySubsidy,
      total12m,
      total24m,
      effectiveExempt,
    };
  }, [age, deposit, rent, youthIncome, youthAssets, isParentExempt, householdSize, parentIncome, parentAssets]);

  const copyResult = () => {
    const text = `[OIYO 청년월세 특별지원 진단 결과]
- 판정: ${evaluation.isEligible ? '✅ 수급 자격 충족 (월 20만원 지원 대상)' : '❌ 수급 자격 미충족'}
- 지원 예상액: 월 ${evaluation.monthlySubsidy.toLocaleString()}원 (1년 ${evaluation.total12m.toLocaleString()}원 / 2년 최대 ${evaluation.total24m.toLocaleString()}원)
- 신청자: 만 ${age}세 | 월세 ${rent.toLocaleString()}원 / 보증금 ${deposit.toLocaleString()}원
- 청년 월소득: ${youthIncome.toLocaleString()}원 | 재산: ${youthAssets.toLocaleString()}원
https://tools.oiyo.net/ko/youth-rent-subsidy-checker/`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            <CardTitle>2026 청년월세 특별지원 자격 및 모의판정기</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            국토교통부 기준 월 최대 20만원(최대 480만원) 무주택 청년 월세 지원 대상 여부를 1초 만에 확인하세요.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground self-center">빠른 예시:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAge(24);
                setDeposit(10000000);
                setRent(450000);
                setYouthIncome(1100000);
                setYouthAssets(15000000);
                setIsParentExempt(false);
                setParentIncome(4200000);
                setParentAssets(250000000);
              }}
            >
              대리기숙사/자취 20대 청년
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAge(31);
                setDeposit(20000000);
                setRent(600000);
                setYouthIncome(1350000);
                setYouthAssets(30000000);
                setIsParentExempt(true);
              }}
            >
              만 30세 이상 독립 청년 (부모 심사 면제)
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Youth Info */}
            <div className="space-y-4 border rounded-lg p-4 border-border bg-muted/20">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <User className="w-4 h-4 text-primary" />
                <span>1. 청년 본인 정보 (독립 가구)</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="age" className="text-xs">신청자 연령 (만 나이)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    min={15}
                    max={50}
                  />
                  <span className="text-xs text-muted-foreground">세</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="deposit" className="text-xs">임차 보증금 (원)</Label>
                  <Input
                    id="deposit"
                    type="number"
                    value={deposit}
                    step={1000000}
                    onChange={(e) => setDeposit(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="rent" className="text-xs">월세액 (원)</Label>
                  <Input
                    id="rent"
                    type="number"
                    value={rent}
                    step={10000}
                    onChange={(e) => setRent(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="youthIncome" className="text-xs">청년 월평균 소득 (원)</Label>
                <Input
                  id="youthIncome"
                  type="number"
                  value={youthIncome}
                  step={50000}
                  onChange={(e) => setYouthIncome(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">기준 중위소득 60%: 월 약 139만원 이하</p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="youthAssets" className="text-xs">청년 총 재산가액 (원, 부채 제외)</Label>
                <Input
                  id="youthAssets"
                  type="number"
                  value={youthAssets}
                  step={1000000}
                  onChange={(e) => setYouthAssets(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">기준 한도: 1억 2,200만원 이하</p>
              </div>
            </div>

            {/* Right: Parent Info */}
            <div className="space-y-4 border rounded-lg p-4 border-border bg-muted/20">
              <div className="flex items-center justify-between font-semibold text-sm">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-primary" />
                  <span>2. 원가구 (부모) 정보</span>
                </div>
                {evaluation.effectiveExempt && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    부모 심사 면제됨
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="exemptCheck"
                  checked={isParentExempt}
                  onChange={(e) => setIsParentExempt(e.target.checked)}
                  className="rounded border-border text-primary"
                />
                <Label htmlFor="exemptCheck" className="text-xs cursor-pointer">
                  만 30세 이상이거나 기혼/중위 50% 이상 독립생계자입니다
                </Label>
              </div>

              {!evaluation.effectiveExempt ? (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="householdSize" className="text-xs">원가구 가구원 수 (부모+본인 등)</Label>
                    <Input
                      id="householdSize"
                      type="number"
                      value={householdSize}
                      min={1}
                      max={6}
                      onChange={(e) => setHouseholdSize(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="parentIncome" className="text-xs">원가구 합산 월 소득 (원)</Label>
                    <Input
                      id="parentIncome"
                      type="number"
                      value={parentIncome}
                      step={100000}
                      onChange={(e) => setParentIncome(Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">
                      {householdSize}인가구 중위소득 100%: 월 약 {Math.round((MEDIAN_INCOME_2026[householdSize] || 5025000) / 10000)}만원 이하
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="parentAssets" className="text-xs">원가구 총 재산가액 (원, 부채 제외)</Label>
                    <Input
                      id="parentAssets"
                      type="number"
                      value={parentAssets}
                      step={10000000}
                      onChange={(e) => setParentAssets(Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">기준 한도: 4억 7,000만원 이하</p>
                  </div>
                </>
              ) : (
                <div className="p-4 border rounded-md border-border bg-card space-y-2">
                  <div className="flex items-center gap-2 text-primary font-medium text-xs">
                    <Sparkles className="w-4 h-4" />
                    <span>독립 가구 특례 혜택 적용!</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    만 30세 이상, 혼인, 또는 중위소득 50%(약 116만원) 이상의 소득으로 독립적인 생계를 유지하는 청년은
                    부모의 소득 및 주택·재산 유무와 무관하게 청년 본인의 기준만으로 수급 대상에 선정됩니다.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="p-6 border rounded-xl border-border bg-card space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {evaluation.isEligible ? (
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                ) : (
                  <XCircle className="w-6 h-6 text-destructive" />
                )}
                <div>
                  <h3 className="font-bold text-lg">
                    {evaluation.isEligible ? '🎉 청년월세 특별지원 수급 대상입니다!' : '⚠️ 수급 요건을 재확인해 주세요'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {evaluation.isEligible
                      ? `월 최대 ${evaluation.monthlySubsidy.toLocaleString()}원씩 실제 부담 월세 범위 내에서 현금 지급됩니다.`
                      : '아래 세부 판정 항목 중 미달된 기준을 확인하세요.'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground">지원 예상 총액 (최대 24개월)</span>
                <p className="text-2xl font-black text-primary">
                  {evaluation.total24m.toLocaleString()}원
                </p>
              </div>
            </div>

            {/* Checklist items */}
            <div className="space-y-2 pt-2 border-t border-border">
              {evaluation.checks.map((item, idx) => (
                <div key={idx} className="flex items-start justify-between p-2.5 rounded-lg border border-border bg-muted/20 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-medium">
                      {item.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                      )}
                      <span>{item.title}</span>
                    </div>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="text-right whitespace-nowrap pl-2">
                    <span className={item.passed ? 'font-semibold text-primary' : 'font-semibold text-destructive'}>
                      {item.passed ? '충족' : '초과/미달'}
                    </span>
                    <p className="text-muted-foreground text-xs">{item.actual}</p>
                  </div>
                </div>
              ))}
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
