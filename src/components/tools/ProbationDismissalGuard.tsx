import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Scale, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export function ProbationDismissalGuard({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [companySize, setCompanySize] = useState<number>(10);
  const [writtenNotice, setWrittenNotice] = useState<boolean>(false);
  const [objectiveEvaluation, setObjectiveEvaluation] = useState<boolean>(false);
  const [priorFeedback, setPriorFeedback] = useState<boolean>(false);
  const [workedMonths, setWorkedMonths] = useState<number>(3);

  const result = useMemo(() => {
    const is5Plus = companySize >= 5;
    const violations: { rule: string; desc: string; severity: string }[] = [];

    if (!writtenNotice) {
      violations.push({
        rule: isKo ? '근로기준법 제27조 (서면통지 의무 위반)' : 'Art. 27 LSA (Written Notice Violation)',
        desc: isKo
          ? '해고사유와 시기를 서면으로 교부하지 않은 해고는 절차상 절대 무효입니다.'
          : 'Dismissal without written notice stating reasons and date is automatically void.',
        severity: 'CRITICAL',
      });
    }

    if (!objectiveEvaluation) {
      violations.push({
        rule: isKo ? '대법원 판례 (객관적 평가 기준 결여)' : 'Supreme Court Precedent (No Objective Criteria)',
        desc: isKo
          ? '사전 고지된 평가표나 계량화된 점수 근거가 없는 본채용 거부는 부당해고입니다.'
          : 'Refusal without pre-notified criteria or quantitative scores constitutes unfair dismissal.',
        severity: 'HIGH',
      });
    }

    if (!priorFeedback) {
      violations.push({
        rule: isKo ? '노동위원회 심판 (상당성 요건 미충족)' : 'Labor Commission Standard (Lack of Prior Warning)',
        desc: isKo
          ? '수습 기간 중 구체적 피드백과 시정 기회를 사전에 부여하지 않은 점은 사용자 측에 불리합니다.'
          : 'Failure to provide feedback or opportunity to improve weakens employer justification.',
        severity: 'MEDIUM',
      });
    }

    const requiresNoticePay = workedMonths >= 3;
    const eligibleForLaborCommission = is5Plus;

    let successRate = 10;
    if (!writtenNotice) successRate = 95;
    else if (!objectiveEvaluation) successRate = 80;
    else if (!priorFeedback) successRate = 50;

    return {
      is5Plus,
      violations,
      requiresNoticePay,
      eligibleForLaborCommission,
      successRate,
    };
  }, [companySize, writtenNotice, objectiveEvaluation, priorFeedback, workedMonths, isKo]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* 헤더 */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Scale className="h-3.5 w-3.5" />
          <span>{isKo ? '수습·시용근로자 권리 구제' : 'Probation Worker Rights Guard'}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {isKo ? '수습근로자 본채용 거부 및 부당해고 진단기' : 'Probation Dismissal Legality & Remedy Guard'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isKo
            ? '근로기준법 제23조·제27조(서면통지) 및 대법원 2003두74 판례 기준 본채용 거절의 적법성과 구제신청 승소 가능성을 진단합니다.'
            : 'Evaluate unfair dismissal risks and Labor Commission claim remedies for rejected probationary workers.'}
        </p>
      </div>

      {/* 상황 체크리스트 폼 */}
      <Card>
        <CardHeader>
          <CardTitle>{isKo ? '본채용 거부 상황 체크리스트' : 'Dismissal Circumstances'}</CardTitle>
          <CardDescription>
            {isKo ? '회사의 통보 방식과 평가 절차를 사실대로 체크하세요.' : 'Select relevant notification and appraisal conditions.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {isKo ? '사업장 상시 근로자 수' : 'Company Employee Count'}
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={companySize >= 5 ? 'default' : 'outline'}
                    onClick={() => setCompanySize(10)}
                  >
                    {isKo ? '5인 이상 (법 적용)' : '5+ Employees'}
                  </Button>
                  <Button
                    variant={companySize < 5 ? 'default' : 'outline'}
                    onClick={() => setCompanySize(4)}
                  >
                    {isKo ? '5인 미만' : 'Under 5'}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {isKo ? '실제 총 근무 기간' : 'Total Months Worked'}
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={workedMonths >= 3 ? 'default' : 'outline'}
                    onClick={() => setWorkedMonths(3)}
                  >
                    {isKo ? '3개월 이상' : '3+ Months'}
                  </Button>
                  <Button
                    variant={workedMonths < 3 ? 'default' : 'outline'}
                    onClick={() => setWorkedMonths(2)}
                  >
                    {isKo ? '3개월 미만' : 'Under 3 Months'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="divide-y divide-border rounded-lg border border-border">
              <label className="flex items-center justify-between p-3 cursor-pointer">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium text-foreground">
                    {isKo ? '서면(종이 문서)으로 해고사유와 일자를 통지받았나요?' : 'Received written notice stating reasons and date?'}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {isKo ? '문자, 카카오톡, 구두 통보는 서면 통지가 아닙니다.' : 'Text message or verbal notice does not qualify.'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={writtenNotice}
                  onChange={(e) => setWrittenNotice(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-ring"
                />
              </label>

              <label className="flex items-center justify-between p-3 cursor-pointer">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium text-foreground">
                    {isKo ? '사전 고지된 객관적 평가 기준과 점수표가 존재하나요?' : 'Were objective scoring criteria and rubrics shared?'}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {isKo ? '취업규칙이나 계약서에 기준이 없거나 대표의 주관적 느낌인 경우 체크 해제' : 'Uncheck if dismissal was based purely on subjective feel.'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={objectiveEvaluation}
                  onChange={(e) => setObjectiveEvaluation(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-ring"
                />
              </label>

              <label className="flex items-center justify-between p-3 cursor-pointer">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium text-foreground">
                    {isKo ? '수습 기간 중 구체적 피드백과 업무 개선 기회를 부여받았나요?' : 'Given prior feedback and chance to improve?'}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {isKo ? '경고나 피드백 없이 갑자기 본채용 거부를 통보받았다면 체크 해제' : 'Uncheck if rejected abruptly without any prior warning.'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={priorFeedback}
                  onChange={(e) => setPriorFeedback(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-ring"
                />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 진단 지표 카드 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '부당해고 인정 확률' : 'Remedy Win Rate'}</span>
                <Scale className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{result.successRate}%</p>
              <p className="mt-1 text-xs text-muted-foreground">노동위원회 판정례 기준</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '노동위원회 구제신청' : 'Commission Remedy'}</span>
                {result.eligibleForLaborCommission ? (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                )}
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {result.eligibleForLaborCommission ? (isKo ? '신청 적격' : 'Eligible') : (isKo ? '신청 불가' : 'Ineligible')}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {result.is5Plus ? (isKo ? '5인 이상 사업장' : '5+ employees') : (isKo ? '5인 미만 적용 제외' : 'Under 5 exempt')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '30일분 해고예고수당' : '30-Day Notice Pay'}</span>
                {result.requiresNoticePay ? (
                  <Badge variant="secondary">{isKo ? '청구 가능' : 'Entitled'}</Badge>
                ) : (
                  <Badge variant="outline">{isKo ? '청구 불가' : 'Not Entitled'}</Badge>
                )}
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {result.requiresNoticePay ? (isKo ? '청구 가능' : '30 Days Pay') : (isKo ? '해당 없음' : 'None')}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {result.requiresNoticePay ? (isKo ? '3개월 이상 근무 시 보장' : '3+ months worked') : (isKo ? '3개월 미만 수습은 예외' : 'Under 3 months')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 법적 하자 및 대응 권고 */}
      <Card>
        <CardHeader>
          <CardTitle>{isKo ? '법적 위반 진단 및 대응 가이드' : 'Violations & Action Guide'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            {result.violations.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-destructive font-semibold">
                  <ShieldAlert className="h-4 w-4" />
                  <span>{isKo ? '회사의 중대한 법적 절차 위반 발견' : 'Critical Employer Violations Found'}</span>
                </div>
                <ul className="divide-y divide-border rounded-lg border border-border">
                  {result.violations.map((v, idx) => (
                    <li key={idx} className="p-3 text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={v.severity === 'CRITICAL' ? 'destructive' : 'secondary'}>
                          {v.severity}
                        </Badge>
                        <span className="font-semibold text-foreground">{v.rule}</span>
                      </div>
                      <p>{v.desc}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-1">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isKo ? '회사의 절차적 요건 구비' : 'Lawful Dismissal Process Followed'}</span>
                </div>
                <p className="text-xs">
                  서면 통지와 객관적 평가 기준을 준수한 경우 법적으로 본채용 거부의 정당성이 인정될 가능성이 큽니다.
                </p>
              </div>
            )}

            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
              <span className="font-semibold text-foreground text-xs">
                💡 노동위원회 부당해고 구제신청 3개월 골든타임
              </span>
              <p className="text-xs">
                본채용 거부(해고)가 발생한 날로부터 <strong>3개월 이내</strong>에 사업장 관할 지방노동위원회에 구제신청서를 접수해야 합니다. 3개월이 지나면 구제신청 권리가 소멸합니다. 노동위원회에서 부당해고로 인정되면, 해고 기간 동안 일했더라면 받을 수 있었던 임금 상당액 전액을 일시불로 보상받을 수 있습니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
