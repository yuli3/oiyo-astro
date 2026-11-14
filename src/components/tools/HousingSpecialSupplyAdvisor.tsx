import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Award, XCircle } from 'lucide-react';

export function HousingSpecialSupplyAdvisor({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [hasNewborn, setHasNewborn] = useState(true); // 2년 내 신생아
  const [marriageYears, setMarriageYears] = useState(4); // 혼인 기간
  const [childrenCount, setChildrenCount] = useState(2); // 자녀 수
  const [isDual, setIsDual] = useState(true); // 맞벌이 여부
  const [incomeRatio, setIncomeRatio] = useState(150); // 도시근로자 소득비율 (%)

  const result = useMemo(() => {
    const maxIncome = isDual ? 200 : 160;
    const isIncomeOk = incomeRatio <= maxIncome;

    const newbornOk = hasNewborn && isIncomeOk;
    const newlywedOk = marriageYears <= 7 && isIncomeOk;
    const multiChildOk = childrenCount >= 2 && isIncomeOk;

    let bestPick = isKo ? '일반공급 검토' : 'General Supply';
    let bestReason = isKo ? '소득 요건 또는 자격 기준을 확인하세요.' : 'Check income or eligibility.';

    if (newbornOk) {
      bestPick = isKo ? '신생아 특별공급 (최우선 추천 🌟)' : 'Newborn Special Supply (Top Choice)';
      bestReason = isKo
        ? '2024년 신설된 전용 물량으로 경쟁률이 가장 낮고 당첨 확률이 극대화됩니다.'
        : 'Dedicated allocation for recent births with lowest competition.';
    } else if (multiChildOk && childrenCount >= 3) {
      bestPick = isKo ? '다자녀 특별공급 (강력 추천 🌟)' : 'Multi-Child Special Supply';
      bestReason = isKo
        ? '3자녀 이상 고가점으로 다자녀 특공 당첨 가점권에 진입합니다.'
        : 'High points with 3+ children.';
    } else if (newlywedOk && childrenCount >= 1) {
      bestPick = isKo ? '신혼부부 특별공급 1순위 (추천)' : 'Newlywed Supply (Priority 1)';
      bestReason = isKo
        ? '유자녀 1순위 자격으로 신혼부부 특공 우선 배정 경쟁이 가능합니다.'
        : 'Priority 1 with children within 7 years of marriage.';
    } else if (multiChildOk) {
      bestPick = isKo ? '다자녀 특별공급 (2자녀 완화)' : 'Multi-Child (2 Children)';
      bestReason = isKo
        ? '2자녀로 완화된 다자녀 특공 자격 충족으로 신청 가능합니다.'
        : 'Eligible under relaxed 2-child rule.';
    } else if (newlywedOk) {
      bestPick = isKo ? '신혼부부 특별공급 2순위 (추첨)' : 'Newlywed (Priority 2)';
      bestReason = isKo
        ? '무자녀 신혼 2순위로 추첨제 물량을 노려볼 수 있습니다.'
        : 'Eligible for lottery pool.';
    }

    return {
      isIncomeOk,
      newbornOk,
      newlywedOk,
      multiChildOk,
      bestPick,
      bestReason,
    };
  }, [hasNewborn, marriageYears, childrenCount, isDual, incomeRatio, isKo]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {isKo ? '🏘️ 2026 청약 특별공급(신생아·신혼·다자녀) 최적 유형 판정기' : '🏘️ 2026 Korea Housing Special Supply Advisor'}
              </CardTitle>
              <CardDescription>
                {isKo
                  ? '신생아 특공 신설, 신혼부부 맞벌이 소득 200% 완화, 다자녀 2자녀 기준을 반영하여 가장 당첨 확률이 높은 특공 유형을 진단합니다.'
                  : 'Evaluate optimal housing special supply eligibility: Newborn special, Newlywed 200% income, and 2-child rules.'}
              </CardDescription>
            </div>
            <Badge variant="outline">
              {isKo ? '2026 청약 개편 기준' : '2026 Housing Rules'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '2년 이내 신생아 출산/임신 여부' : 'Newborn within 2 Years'}
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={hasNewborn ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setHasNewborn(true)}
                  >
                    {isKo ? '출산/임신함 (신생아 O)' : 'Yes (Newborn)'}
                  </Button>
                  <Button
                    variant={!hasNewborn ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setHasNewborn(false)}
                  >
                    {isKo ? '해당 없음' : 'No'}
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '혼인 기간 (년)' : 'Years of Marriage'}
                </label>
                <Input
                  type="number"
                  min={0}
                  max={30}
                  value={marriageYears}
                  onChange={(e) => setMarriageYears(Math.max(0, Number(e.target.value) || 0))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {isKo ? '혼인신고일 기준 7년 이내 시 신혼부부 특공 자격' : 'Under 7 years for newlywed quota'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '미성년 자녀 수 (명)' : 'Minor Children Count'}
                </label>
                <Input
                  type="number"
                  min={0}
                  max={6}
                  value={childrenCount}
                  onChange={(e) => setChildrenCount(Math.max(0, Number(e.target.value) || 0))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {isKo ? '2024년부터 2자녀 이상 시 다자녀 특공 자격 충족!' : '2+ children for multi-child quota'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium pb-1.5 block">
                  {isKo ? '도시근로자 월평균소득 대비 비율 (%)' : 'Income Ratio vs Average (%)'}
                </label>
                <Input
                  type="number"
                  min={50}
                  max={300}
                  value={incomeRatio}
                  onChange={(e) => setIncomeRatio(Math.max(1, Number(e.target.value) || 0))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {isKo ? '맞벌이 최대 200%, 외벌이 160% 이하 시 적합' : 'Dual earner up to 200%'}
                </p>
              </div>
            </div>

            {/* Recommendation Banner */}
            <div className="rounded-lg border p-4 space-y-2 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <span className="font-semibold text-base">
                  {isKo ? '👉 당첨 확률 최고 추천 유형' : 'Recommended Quota'}: <span className="text-primary font-bold">{result.bestPick}</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{result.bestReason}</p>
            </div>

            {/* Eligibility Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4 space-y-2 bg-muted/20">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{isKo ? '신생아 특별공급' : 'Newborn Quota'}</span>
                  {result.newbornOk ? (
                    <Badge variant="outline">{isKo ? '적격 🌟' : 'Eligible'}</Badge>
                  ) : (
                    <Badge variant="secondary">{isKo ? '불가' : 'No'}</Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isKo
                    ? '2년 내 출산 가구 전용 물량 (경쟁률 최저)'
                    : 'Exclusive quota for recent births'}
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-2 bg-muted/20">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{isKo ? '신혼부부 특별공급' : 'Newlywed Quota'}</span>
                  {result.newlywedOk ? (
                    <Badge variant="outline">{isKo ? '적격' : 'Eligible'}</Badge>
                  ) : (
                    <Badge variant="secondary">{isKo ? '불가' : 'No'}</Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isKo
                    ? `혼인 7년 이내 (${childrenCount >= 1 ? '1순위 유자녀' : '2순위 무자녀'})`
                    : 'Within 7 years of marriage'}
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-2 bg-muted/20">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{isKo ? '다자녀 특별공급' : 'Multi-Child Quota'}</span>
                  {result.multiChildOk ? (
                    <Badge variant="outline">{isKo ? '적격' : 'Eligible'}</Badge>
                  ) : (
                    <Badge variant="secondary">{isKo ? '불가' : 'No'}</Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isKo
                    ? '2자녀 이상 가점제 경쟁'
                    : '2+ children point system'}
                </div>
              </div>
            </div>

            {/* Educational Defense Guide */}
            <div className="rounded-lg border p-4 text-xs space-y-2 bg-muted/10 text-muted-foreground">
              <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                {isKo ? '2026 청약 특별공급 3대 당첨 꿀팁' : '3 Key Rules for Special Supply'}
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong>{isKo ? '신생아가 있다면 무조건 신생아 특공' : 'Prioritize Newborn'}:</strong> {isKo ? '신생아 특공은 대상자 수가 적어 신혼부부 특공 대비 당첨 커트라인이 훨씬 낮습니다.' : 'Newborn quota has significantly lower competition.'}
                </li>
                <li>
                  <strong>{isKo ? '부부 중복 청약 적극 활용' : 'Dual Couple Applications'}:</strong> {isKo ? '같은 단지에 남편과 아내가 각각 특별공급을 신청할 수 있으며, 둘 다 당첨 시 선접수 건이 유효합니다.' : 'Both husband and wife can apply for the same complex.'}
                </li>
                <li>
                  <strong>{isKo ? '맞벌이 소득 200% 완화' : '200% Income Cap'}:</strong> {isKo ? '신혼 특공 맞벌이 소득 기준이 도시근로자 200%까지 늘어나 고소득 직장인 부부도 청약 가능합니다.' : 'Dual earner cap relaxed up to 200%.'}
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default HousingSpecialSupplyAdvisor;
