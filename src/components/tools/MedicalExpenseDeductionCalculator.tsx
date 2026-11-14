import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HeartPulse, Sparkles, ShieldAlert, Award, Users } from 'lucide-react';

export function MedicalExpenseDeductionCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [salaryMillions, setSalaryMillions] = useState(60); // 본인 총급여 (백만원)
  const [spouseSalaryMillions, setSpouseSalaryMillions] = useState(35); // 배우자 총급여 (백만원)
  const [generalMillions, setGeneralMillions] = useState(5); // 일반 부양가족 의료비 (백만원)
  const [unlimitedMillions, setUnlimitedMillions] = useState(2); // 본인/65세이상/장애인 의료비 (백만원)
  const [refundMillions, setRefundMillions] = useState(1); // 실손보험금 수령액 (백만원)

  const result = useMemo(() => {
    const salary = salaryMillions * 1000000;
    const spouseSalary = spouseSalaryMillions * 1000000;
    const general = generalMillions * 1000000;
    const unlimited = unlimitedMillions * 1000000;
    const refund = refundMillions * 1000000;

    const netGeneral = Math.max(0, general - refund);
    const remRefund = Math.max(0, refund - general);
    const netUnlimited = Math.max(0, unlimited - remRefund);

    function calc(sal: number) {
      const threshold = Math.round(sal * 0.03);
      let remThreshold = threshold;

      const genAbove = Math.max(0, netGeneral - remThreshold);
      remThreshold = Math.max(0, remThreshold - netGeneral);
      const qualGen = Math.min(7000000, genAbove);

      const unlimAbove = Math.max(0, netUnlimited - remThreshold);
      const credit = Math.round((qualGen * 0.15) + (unlimAbove * 0.15));

      return { threshold, qualGen, unlimAbove, credit };
    }

    const selfCalc = calc(salary);
    const spouseCalc = calc(spouseSalary);

    const betterSpouse = spouseCalc.credit > selfCalc.credit;
    const diff = Math.abs(spouseCalc.credit - selfCalc.credit);

    return {
      netGeneral,
      netUnlimited,
      selfCalc,
      spouseCalc,
      betterSpouse,
      diff,
    };
  }, [salaryMillions, spouseSalaryMillions, generalMillions, unlimitedMillions, refundMillions]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {isKo ? '🩺 연말정산 의료비 세액공제 & 맞벌이 몰아주기 최적화기' : '🩺 Medical Expense Tax Credit & Dual-Earner Optimizer'}
              </CardTitle>
              <CardDescription>
                {isKo
                  ? '총급여 3% 문턱 계산, 실손보험금 의무 차감 및 맞벌이 부부 중 환급액을 극대화하는 최적 명의자를 판정합니다.'
                  : 'Calculate 15% medical tax credit after insurance reimbursement deduction and optimize dual-earner allocation.'}
              </CardDescription>
            </div>
            <Badge variant="outline">
              {isKo ? '실손보험금 의무 차감 반영' : 'Insurance Deduction'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '본인 총급여액 (연봉, 백만원)' : 'Self Annual Salary (Million KRW)'}
                </label>
                <Input
                  type="number"
                  min={10}
                  max={500}
                  value={salaryMillions}
                  onChange={(e) => setSalaryMillions(Math.max(1, Number(e.target.value) || 0))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {isKo
                    ? `본인 3% 공제 문턱: ${(result.selfCalc.threshold / 10000).toLocaleString()}만원`
                    : `3% threshold: ${(result.selfCalc.threshold / 10000).toLocaleString()}`}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '배우자 총급여액 (연봉, 백만원)' : 'Spouse Annual Salary (Million KRW)'}
                </label>
                <Input
                  type="number"
                  min={10}
                  max={500}
                  value={spouseSalaryMillions}
                  onChange={(e) => setSpouseSalaryMillions(Math.max(1, Number(e.target.value) || 0))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {isKo
                    ? `배우자 3% 공제 문턱: ${(result.spouseCalc.threshold / 10000).toLocaleString()}만원`
                    : `3% threshold: ${(result.spouseCalc.threshold / 10000).toLocaleString()}`}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '일반 부양가족 의료비 (백만원)' : 'General Medical Expenses (Million KRW)'}
                </label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={generalMillions}
                  onChange={(e) => setGeneralMillions(Math.max(0, Number(e.target.value) || 0))}
                />
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '본인/65세이상/장애인 의료비 (한도없음, 백만원)' : 'Unlimited Medical Expenses (Million KRW)'}
                </label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={unlimitedMillions}
                  onChange={(e) => setUnlimitedMillions(Math.max(0, Number(e.target.value) || 0))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium pb-1.5 block text-destructive">
                {isKo ? '🚨 보험사 실손의료보험금 수령액 (필수 차감, 백만원)' : '🚨 Insurance Reimbursement Received (Million KRW)'}
              </label>
              <Input
                type="number"
                min={0}
                max={50}
                value={refundMillions}
                onChange={(e) => setRefundMillions(Math.max(0, Number(e.target.value) || 0))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {isKo
                  ? '국세청 전산 검증 대상: 실손보험금을 차감하지 않고 신청하면 가산세가 추징됩니다.'
                  : 'Mandatory deduction: failing to deduct insurance reimbursement triggers tax penalties.'}
              </p>
            </div>

            {/* Comparison of Allocation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4 space-y-2 bg-muted/20">
                <div className="text-xs text-muted-foreground flex items-center justify-between">
                  <span>{isKo ? '본인 명의로 공제받을 때' : 'Claiming under Self'}</span>
                  {!result.betterSpouse && <Badge variant="outline">{isKo ? '추천' : 'Recommended'}</Badge>}
                </div>
                <div className="text-2xl font-bold">
                  {(result.selfCalc.credit / 10000).toFixed(1)} {isKo ? '만원 환급' : '10k KRW'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isKo ? `총급여 3% 문턱 ${(result.selfCalc.threshold / 10000).toFixed(1)}만원 초과분 공제` : '3% threshold applied'}
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-2 bg-muted/20">
                <div className="text-xs text-muted-foreground flex items-center justify-between">
                  <span>{isKo ? '배우자 명의로 몰아줄 때' : 'Claiming under Spouse'}</span>
                  {result.betterSpouse && <Badge variant="outline">{isKo ? '추천 🌟' : 'Recommended 🌟'}</Badge>}
                </div>
                <div className="text-2xl font-bold text-primary">
                  {(result.spouseCalc.credit / 10000).toFixed(1)} {isKo ? '만원 환급' : '10k KRW'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isKo ? `총급여 3% 문턱 ${(result.spouseCalc.threshold / 10000).toFixed(1)}만원 초과분 공제` : '3% threshold applied'}
                </div>
              </div>
            </div>

            {/* Strategic Recommendation */}
            <div className="rounded-lg border p-4 space-y-2 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">
                  {result.betterSpouse
                    ? (isKo ? `배우자(급여 낮은 쪽)에게 몰아주면 ${(result.diff / 10000).toFixed(1)}만원 더 환급받습니다!` : 'Allocating to spouse yields higher refund!')
                    : (isKo ? '본인 명의로 공제받는 것이 유리합니다.' : 'Allocating to self is optimal.')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {isKo
                  ? '의료비 세액공제는 나이·소득 요건이 없어 맞벌이 부부 중 누구라도 지출한 자가 부양가족 의료비를 공제받을 수 있습니다. 총급여가 낮은 쪽이 3% 문턱이 낮아 환급액이 커집니다.'
                  : 'Steering medical expenses to the lower-earner spouse reduces the 3% threshold, maximizing tax refund.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default MedicalExpenseDeductionCalculator;
