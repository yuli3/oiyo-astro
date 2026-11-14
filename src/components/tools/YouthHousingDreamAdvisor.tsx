import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertCircle, Sparkles, Home, Wallet, ShieldCheck, ArrowRight } from 'lucide-react';

export default function YouthHousingDreamAdvisor() {
  const [age, setAge] = useState<number>(28);
  const [militaryMonths, setMilitaryMonths] = useState<number>(18);
  const [annualIncome, setAnnualIncome] = useState<number>(38000000);
  const [isHomeowner, setIsHomeowner] = useState<boolean>(false);
  const [isHouseHead, setIsHouseHead] = useState<boolean>(true);
  const [subscriptionMonths, setSubscriptionMonths] = useState<number>(14);
  const [savedAmount, setSavedAmount] = useState<number>(12000000);
  const [targetSalePrice, setTargetSalePrice] = useState<number>(450000000);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const analysis = useMemo(() => {
    const adjustedAge = age - Math.floor(Math.min(militaryMonths, 72) / 12);
    const isAgeValid = adjustedAge >= 19 && adjustedAge <= 34;
    const isIncomeValid = annualIncome <= 50000000;
    const isAccountEligible = isAgeValid && isIncomeValid && !isHomeowner;
    const isTaxExemptEligible = isAccountEligible && annualIncome <= 36000000 && isHouseHead;

    const isLoanPeriodPassed = subscriptionMonths >= 12;
    const isLoanAmountPassed = savedAmount >= 10000000;
    const isPricePassed = targetSalePrice <= 600000000;
    const isLoanEligible = isAccountEligible && isLoanPeriodPassed && isLoanAmountPassed && isPricePassed;

    const maxLoanAmount = isLoanEligible ? Math.round(targetSalePrice * 0.80) : 0;
    let estimatedInterestRate = 2.2;
    if (annualIncome > 40000000) estimatedInterestRate = 2.8;
    else if (annualIncome > 20000000) estimatedInterestRate = 2.5;

    const checks = [
      {
        title: '연령 요건 (만 19~34세, 군복무 최대 6년 차감)',
        passed: isAgeValid,
        actual: `만 ${age}세 (복무 차감 후 만 ${adjustedAge}세)`,
      },
      {
        title: '소득 요건 (연 5,000만원 이하)',
        passed: isIncomeValid,
        actual: `${(annualIncome / 10000).toLocaleString()}만원`,
      },
      {
        title: '무주택 요건 (세대원도 가능)',
        passed: !isHomeowner,
        actual: !isHomeowner ? '무주택자' : '유주택자',
      },
    ];

    const loanChecks = [
      { title: '가입 기간 1년 이상', passed: isLoanPeriodPassed, actual: `${subscriptionMonths}개월` },
      { title: '누적 납입액 1,000만원 이상', passed: isLoanAmountPassed, actual: `${(savedAmount / 10000).toLocaleString()}만원` },
      { title: '분양가 6억원 이하', passed: isPricePassed, actual: `${(targetSalePrice / 100000000).toFixed(2)}억원` },
    ];

    return {
      isAccountEligible,
      isTaxExemptEligible,
      isLoanEligible,
      maxLoanAmount,
      estimatedInterestRate,
      checks,
      loanChecks,
    };
  }, [age, militaryMonths, annualIncome, isHomeowner, isHouseHead, subscriptionMonths, savedAmount, targetSalePrice]);

  const copyResult = () => {
    const text = `[OIYO 청년 주택드림 청약통장 & 대출 진단 결과]
- 청약통장 가입 자격: ${analysis.isAccountEligible ? '✅ 가입 가능 (최고 연 4.5% 우대금리)' : '❌ 가입 불가'}
- 이자소득 500만원 비과세: ${analysis.isTaxExemptEligible ? '✅ 대상 (소득 3,600만 이하 세대주)' : '미대상'}
- 주택드림 대출(최저 2.2%) 연계: ${analysis.isLoanEligible ? `✅ 연계 가능 (최대 ${(analysis.maxLoanAmount / 100000000).toFixed(2)}억원 대출)` : '준비 중 (가입 1년/1,000만 납입 필요)'}
https://tools.oiyo.net/ko/youth-housing-dream-advisor/`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            <CardTitle>청년 주택드림 청약통장(4.5%) & 대출(2.2%) 진단기</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            소득 5,000만원 이하 무주택 청년 전용 최고 연 4.5% 청약통장 가입 자격과 청약 당첨 시 최저 2.2% 주택드림대출(분양가 80%) 연계를 진단합니다.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Account Info */}
              <div className="space-y-4 border rounded-lg p-4 border-border bg-muted/20">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span>1. 청약통장 가입자 기본 정보</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="age" className="text-xs">신청자 만 나이</Label>
                    <Input
                      id="age"
                      type="number"
                      value={age}
                      min={15}
                      max={50}
                      onChange={(e) => setAge(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="militaryMonths" className="text-xs">군 복무 개월 수</Label>
                    <Input
                      id="militaryMonths"
                      type="number"
                      value={militaryMonths}
                      min={0}
                      max={72}
                      onChange={(e) => setMilitaryMonths(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="annualIncome" className="text-xs">직전년도 연간 소득 (원)</Label>
                  <Input
                    id="annualIncome"
                    type="number"
                    value={annualIncome}
                    step={1000000}
                    onChange={(e) => setAnnualIncome(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">가입 기준: 5,000만원 이하 | 비과세: 3,600만원 이하</p>
                </div>
                <div className="flex flex-col gap-2 pt-1 text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="homeownerCheck"
                      checked={!isHomeowner}
                      onChange={(e) => setIsHomeowner(!e.target.checked)}
                      className="rounded border-border text-primary"
                    />
                    <Label htmlFor="homeownerCheck" className="text-xs cursor-pointer">
                      본인 명의 무주택자입니다 (세대원도 가입 가능)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="houseHeadCheck"
                      checked={isHouseHead}
                      onChange={(e) => setIsHouseHead(e.target.checked)}
                      className="rounded border-border text-primary"
                    />
                    <Label htmlFor="houseHeadCheck" className="text-xs cursor-pointer">
                      무주택 세대주입니다 (이자소득 500만원 비과세 필수 요건)
                    </Label>
                  </div>
                </div>
              </div>

              {/* Right: Loan Link Info */}
              <div className="space-y-4 border rounded-lg p-4 border-border bg-muted/20">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Home className="w-4 h-4 text-primary" />
                  <span>2. 주택드림 대출 연계 요건</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="subscriptionMonths" className="text-xs">통장 가입 개월수</Label>
                    <Input
                      id="subscriptionMonths"
                      type="number"
                      value={subscriptionMonths}
                      min={0}
                      max={120}
                      onChange={(e) => setSubscriptionMonths(Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">1년(12개월) 이상</p>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="savedAmount" className="text-xs">통장 누적 납입액 (원)</Label>
                    <Input
                      id="savedAmount"
                      type="number"
                      value={savedAmount}
                      step={1000000}
                      onChange={(e) => setSavedAmount(Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">1,000만원 이상</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="targetSalePrice" className="text-xs">목표 청약 분양가 (원)</Label>
                  <Input
                    id="targetSalePrice"
                    type="number"
                    value={targetSalePrice}
                    step={10000000}
                    onChange={(e) => setTargetSalePrice(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">대출 연계 한도: 분양가 6억원 이하, 전용 85㎡ 이하</p>
                </div>
              </div>
            </div>

            {/* Results Box */}
            <div className="p-6 border rounded-xl border-border bg-card space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {analysis.isAccountEligible ? (
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-destructive" />
                  )}
                  <div>
                    <h3 className="font-bold text-lg">
                      {analysis.isAccountEligible
                        ? '🎉 청년 주택드림 청약통장 가입 대상입니다 (최고 연 4.5%)!'
                        : '⚠️ 청년 주택드림 통장 가입 요건 미충족'}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      기존 일반 청약저축 또는 청년우대형 통장에서 전환 가입 시 기존 납입 회차와 기간이 100% 인정됩니다.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">주택드림 대출 가능액 (분양가 80%)</span>
                  <p className="text-2xl font-black text-primary">
                    {analysis.maxLoanAmount > 0 ? `${(analysis.maxLoanAmount / 100000000).toFixed(2)}억원` : '0원'}
                  </p>
                </div>
              </div>

              {/* Account checks */}
              <div className="space-y-2 pt-2 border-t border-border">
                {analysis.checks.map((chk, idx) => (
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
                      {chk.actual} ({chk.passed ? '충족' : '초과'})
                    </span>
                  </div>
                ))}
              </div>

              {/* Loan check cards */}
              <div className="p-4 border rounded-lg border-border bg-muted/10 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>주택드림 대출(최저 2.2% 고정/변동) 연계 자격 현황:</span>
                  <span className={analysis.isLoanEligible ? 'text-primary' : 'text-muted-foreground'}>
                    {analysis.isLoanEligible ? '✅ 즉시 연계 가능' : '⚠️ 1년/1,000만 납입 충족 필요'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-muted-foreground">
                  {analysis.loanChecks.map((chk, idx) => (
                    <div key={idx} className="flex justify-between p-1.5 rounded border border-border bg-card">
                      <span>{chk.title}:</span>
                      <span className={chk.passed ? 'font-semibold text-primary' : 'text-destructive'}>
                        {chk.actual}
                      </span>
                    </div>
                  ))}
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
