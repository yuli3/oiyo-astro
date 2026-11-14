import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GraduationCap, Sparkles, AlertTriangle, CheckCircle2, BookOpen } from 'lucide-react';

export function EducationExpenseDeductionCalculator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [selfExpense, setSelfExpense] = useState(0); // 본인 교육비 (만원)
  const [preschoolCount, setPreschoolCount] = useState(1); // 미취학 아동 수
  const [preschoolExpense, setPreschoolExpense] = useState(360); // 미취학 아동 교육비 (만원, 학원비 포함)
  const [schoolCount, setSchoolCount] = useState(1); // 초중고 자녀 수
  const [schoolExpense, setSchoolExpense] = useState(200); // 초중고 학교 납입금 (만원)
  const [schoolAcademyExpense, setSchoolAcademyExpense] = useState(240); // 초중고 사설학원비 (만원)
  const [collegeCount, setCollegeCount] = useState(0); // 대학생 자녀 수
  const [collegeExpense, setCollegeExpense] = useState(0); // 대학생 등록금 (만원)

  const result = useMemo(() => {
    // 1. 본인: 전액 인정
    const qualifiedSelf = selfExpense * 10000;

    // 2. 미취학: 1인당 300만원 한도
    const preschoolLimit = preschoolCount * 3000000;
    const qualifiedPreschool = Math.min(preschoolLimit, preschoolExpense * 10000);

    // 3. 초중고: 1인당 300만원 한도 (학원비 제외)
    const schoolLimit = schoolCount * 3000000;
    const qualifiedSchool = Math.min(schoolLimit, schoolExpense * 10000);

    // 4. 대학생: 1인당 900만원 한도
    const collegeLimit = collegeCount * 9000000;
    const qualifiedCollege = Math.min(collegeLimit, collegeExpense * 10000);

    const totalQualified = qualifiedSelf + qualifiedPreschool + qualifiedSchool + qualifiedCollege;
    const totalTaxCredit = Math.round(totalQualified * 0.15);

    return {
      qualifiedSelf,
      qualifiedPreschool,
      qualifiedSchool,
      qualifiedCollege,
      totalQualified,
      totalTaxCredit,
      hasExcludedSchoolAcademy: schoolAcademyExpense > 0,
    };
  }, [selfExpense, preschoolCount, preschoolExpense, schoolCount, schoolExpense, schoolAcademyExpense, collegeCount, collegeExpense]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {isKo ? '🎓 연말정산 교육비 15% 세액공제 & 학원비 판정기' : '🎓 Education Expense 15% Tax Credit Calculator'}
              </CardTitle>
              <CardDescription>
                {isKo
                  ? '취학 전 아동 학원비 공제 인정 및 초중고 학원비 공제 제외 요건, 대상별 법정 한도를 정밀 계산합니다.'
                  : 'Calculate 15% education tax credit: preschool private academy eligibility vs K-12 private academy exclusion.'}
              </CardDescription>
            </div>
            <Badge variant="outline">
              {isKo ? '15% 세액공제' : '15% Tax Credit'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '미취학 아동 수 (명)' : 'Preschool Children Count'}
                </label>
                <Input
                  type="number"
                  min={0}
                  max={5}
                  value={preschoolCount}
                  onChange={(e) => setPreschoolCount(Math.max(0, Number(e.target.value) || 0))}
                />
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '미취학 유치원·학원·체육시설비 (만원 / 연)' : 'Preschool Tuition & Academy (10k KRW)'}
                </label>
                <Input
                  type="number"
                  min={0}
                  max={2000}
                  value={preschoolExpense}
                  onChange={(e) => setPreschoolExpense(Math.max(0, Number(e.target.value) || 0))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {isKo ? '💡 태권도, 피아노, 수영, 어학원 등 주 1회 이상 월단위 전액 공제 인정!' : 'Private academies eligible!'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '초·중·고등학생 자녀 수 (명)' : 'K-12 Student Count'}
                </label>
                <Input
                  type="number"
                  min={0}
                  max={5}
                  value={schoolCount}
                  onChange={(e) => setSchoolCount(Math.max(0, Number(e.target.value) || 0))}
                />
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '초·중·고 학교 납입금 (만원 / 연)' : 'K-12 School Tuition & Books (10k KRW)'}
                </label>
                <Input
                  type="number"
                  min={0}
                  max={2000}
                  value={schoolExpense}
                  onChange={(e) => setSchoolExpense(Math.max(0, Number(e.target.value) || 0))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {isKo ? '수업료, 급식비, 교과서대, 방과후수업료, 교복(60만), 체험학습(30만)' : 'School fees eligible'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block text-destructive">
                  {isKo ? '초·중·고 사설 보습학원비 (만원 / 연, 공제 제외)' : 'K-12 Private Academy (Ineligible)'}
                </label>
                <Input
                  type="number"
                  min={0}
                  max={5000}
                  value={schoolAcademyExpense}
                  onChange={(e) => setSchoolAcademyExpense(Math.max(0, Number(e.target.value) || 0))}
                />
                <p className="text-xs text-destructive mt-1">
                  {isKo ? '🚨 초등학생 이상 사설학원비는 교육비 세액공제 전면 제외 대상입니다.' : 'Not eligible for credit.'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '대학생 자녀 등록금 (만원 / 연)' : 'College Tuition (10k KRW)'}
                </label>
                <Input
                  type="number"
                  min={0}
                  max={5000}
                  value={collegeExpense}
                  onChange={(e) => setCollegeExpense(Math.max(0, Number(e.target.value) || 0))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {isKo ? '1인당 연 900만원 한도 (자녀 대학원은 공제 불가)' : '9M KRW limit per child'}
                </p>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4 space-y-1 bg-muted/20">
                <div className="text-xs text-muted-foreground">{isKo ? '총 공제 인정 교육비' : 'Total Qualified Expenses'}</div>
                <div className="text-2xl font-bold">
                  {(result.totalQualified / 10000).toLocaleString()} {isKo ? '만원' : '10k KRW'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isKo
                    ? `미취학 ${(result.qualifiedPreschool / 10000).toLocaleString()}만 + 초중고 ${(result.qualifiedSchool / 10000).toLocaleString()}만`
                    : 'Within legal deduction caps'}
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-1 bg-primary/5 border-primary/20">
                <div className="text-xs text-muted-foreground">{isKo ? '최종 15% 세금 환급액' : 'Total 15% Tax Refund'}</div>
                <div className="text-2xl font-bold text-primary">
                  {(result.totalTaxCredit / 10000).toFixed(1)} {isKo ? '만원 환급' : '10k KRW'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isKo ? '연말정산 결정세액에서 직접 차감' : 'Directly subtracted from tax due'}
                </div>
              </div>
            </div>

            {/* Crucial Academy Rule Notice */}
            <div className="rounded-lg border p-4 text-xs space-y-2 bg-muted/10 text-muted-foreground">
              <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                {isKo ? '교육비 세액공제 학원비 판정 핵심 공식' : 'Key Academy Rules'}
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong>{isKo ? '미취학 아동 학원비' : 'Preschool Academy'}:</strong> {isKo ? '유치원·어린이집뿐 아니라 피아노, 태권도, 어학원 등 주 1회 이상 월단위 학원비는 1인당 300만원 한도로 전액 인정됩니다.' : 'Eligible up to 3M KRW.'}
                </li>
                <li>
                  <strong>{isKo ? '초등학교 입학 연도 1~2월' : 'Entrance Year Jan/Feb'}:</strong> {isKo ? '초등학교에 입학하는 해의 1월과 2월에 지출한 학원비는 아직 미취학 상태이므로 교육비 공제가 가능합니다.' : 'Jan/Feb academy fees in entrance year are eligible.'}
                </li>
                <li>
                  <strong>{isKo ? '초등학생 이상 학원비 불가' : 'K-12 Academy Ineligible'}:</strong> {isKo ? '초등학교 입학 이후(3월~) 사설 보습학원비는 교육비 공제가 절대 불가합니다 (신용카드 소득공제만 가능).' : 'Private academy fees for students in grade 1+ are ineligible.'}
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default EducationExpenseDeductionCalculator;
