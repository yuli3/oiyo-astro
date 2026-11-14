import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';

export function WorkplaceHarassmentChecklist({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [hasSuperiority, setHasSuperiority] = useState<boolean>(true);
  const [exceedsScope, setExceedsScope] = useState<boolean>(true);
  const [causesSuffering, setCausesSuffering] = useState<boolean>(true);

  const [hasAudio, setHasAudio] = useState<boolean>(false);
  const [hasChat, setHasChat] = useState<boolean>(true);
  const [hasMedical, setHasMedical] = useState<boolean>(false);
  const [hasDiary, setHasDiary] = useState<boolean>(true);
  const [hasWitness, setHasWitness] = useState<boolean>(false);

  const result = useMemo(() => {
    const satisfiedCount = (hasSuperiority ? 1 : 0) + (exceedsScope ? 1 : 0) + (causesSuffering ? 1 : 0);
    const isAllMet = satisfiedCount === 3;

    let score = 0;
    if (hasAudio) score += 30;
    if (hasChat) score += 25;
    if (hasMedical) score += 25;
    if (hasDiary) score += 10;
    if (hasWitness) score += 10;

    let status = 'INSUFFICIENT';
    if (isAllMet && score >= 60) status = 'STRONG';
    else if (isAllMet && score >= 35) status = 'MODERATE';
    else if (isAllMet) status = 'WEAK';

    return {
      satisfiedCount,
      isAllMet,
      score,
      status,
    };
  }, [hasSuperiority, exceedsScope, causesSuffering, hasAudio, hasChat, hasMedical, hasDiary, hasWitness]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* 헤더 */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Shield className="h-3.5 w-3.5" />
          <span>{isKo ? '근로기준법 제76조의2' : 'Article 76-2 LSA'}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {isKo ? '직장 내 괴롭힘 3대 요건 판정 & 증거 체크리스트' : 'Workplace Harassment Legal Criteria & Evidence Guard'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isKo
            ? '법정 3대 성립 요건(우위성, 적정범위 초과, 고통·환경악화) 충족 여부와 증거력 점수를 실시간 진단합니다.'
            : 'Audit statutory elements and evaluate evidence strength for Labor Ministry complaints.'}
        </p>
      </div>

      {/* 3대 법정 요건 검토 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>{isKo ? '1. 직장 내 괴롭힘 법정 3대 요건 점검' : '1. Statutory Legal Requirements'}</CardTitle>
          <CardDescription>
            {isKo
              ? '세 가지 요건이 모두 충족되어야 법적으로 직장 내 괴롭힘에 해당합니다.'
              : 'All three elements must be satisfied to establish unlawful harassment under the Labor Standards Act.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border rounded-lg border border-border">
            <label className="flex items-center justify-between p-3 cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-sm font-medium text-foreground">
                  {isKo ? '① 직장에서의 지위 또는 관계 등의 우위 이용' : '① Superiority in Position or Relationship'}
                </span>
                <p className="text-xs text-muted-foreground">
                  {isKo
                    ? '상사·임원뿐만 아니라 선임, 다수 인원의 집단적 압박, 인사/인맥 영향력 등도 포함'
                    : 'Includes organizational rank, seniority, or peer-group numerical superiority.'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={hasSuperiority}
                onChange={(e) => setHasSuperiority(e.target.checked)}
                className="rounded border-input text-primary focus:ring-ring"
              />
            </label>

            <label className="flex items-center justify-between p-3 cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-sm font-medium text-foreground">
                  {isKo ? '② 업무상 적정범위를 넘는 행위' : '② Exceeding Appropriate Work Scope'}
                </span>
                <p className="text-xs text-muted-foreground">
                  {isKo
                    ? '폭언, 욕설, 따돌림, 사적 심부름, 과도한 감시, 일거리 박탈, 사적 영역 침해 등'
                    : 'Insults, ostracization, personal errands, or unachievable impossible deadlines.'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={exceedsScope}
                onChange={(e) => setExceedsScope(e.target.checked)}
                className="rounded border-input text-primary focus:ring-ring"
              />
            </label>

            <label className="flex items-center justify-between p-3 cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-sm font-medium text-foreground">
                  {isKo ? '③ 신체적·정신적 고통 또는 근무환경 악화' : '③ Physical/Mental Suffering or Hostile Environment'}
                </span>
                <p className="text-xs text-muted-foreground">
                  {isKo
                    ? '불면, 스트레스, 우울증 등 심리적 고통 또는 정상적인 근무가 곤란한 상태'
                    : 'Severe stress, sleep disturbance, depression, or impaired ability to work.'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={causesSuffering}
                onChange={(e) => setCausesSuffering(e.target.checked)}
                className="rounded border-input text-primary focus:ring-ring"
              />
            </label>
          </div>
        </CardContent>
      </Card>

      {/* 증거 수집 체크리스트 */}
      <Card>
        <CardHeader>
          <CardTitle>{isKo ? '2. 보유 중인 객관적 증거 체크' : '2. Objective Evidence Inventory'}</CardTitle>
          <CardDescription>
            {isKo
              ? '노동청 진정 시 가해자나 회사의 부인을 격파할 수 있는 증빙을 선택하세요.'
              : 'Select evidentiary materials you have preserved to substantiate the claim.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border rounded-lg border border-border">
            <label className="flex items-center justify-between p-3 cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-sm font-medium text-foreground">
                  {isKo ? '현장 대화 및 전화 통화 녹음 파일 (+30점)' : 'Audio Recordings of Conversation / Calls (+30 pts)'}
                </span>
                <p className="text-xs text-muted-foreground">
                  {isKo
                    ? '대화 당사자로서 본인이 참여한 대화 녹음은 통신비밀보호법상 100% 합법 증거'
                    : 'Legally admissible single-party participant recording of harassing remarks.'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={hasAudio}
                onChange={(e) => setHasAudio(e.target.checked)}
                className="rounded border-input text-primary focus:ring-ring"
              />
            </label>

            <label className="flex items-center justify-between p-3 cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-sm font-medium text-foreground">
                  {isKo ? '메신저, 카카오톡, 이메일, 사내 쪽지 캡처 (+25점)' : 'Messenger / KakaoTalk / Email Screen Captures (+25 pts)'}
                </span>
                <p className="text-xs text-muted-foreground">
                  {isKo
                    ? '모욕적 발언, 부당한 지시, 야간 연락 등이 포함된 원본 화면 캡처 및 백업'
                    : 'Screen captures with timestamps showing abusive text or unreasonable demands.'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={hasChat}
                onChange={(e) => setHasChat(e.target.checked)}
                className="rounded border-input text-primary focus:ring-ring"
              />
            </label>

            <label className="flex items-center justify-between p-3 cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-sm font-medium text-foreground">
                  {isKo ? '정신건강의학과 진단서 및 진료 기록 (+25점)' : 'Psychiatric / Medical Diagnosis Record (+25 pts)'}
                </span>
                <p className="text-xs text-muted-foreground">
                  {isKo
                    ? '직장 스트레스로 인한 우울·불안·적응장애 진단서 (인과관계 및 산재 입증 핵심)'
                    : 'Clinical documentation proving psychological harm and causation.'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={hasMedical}
                onChange={(e) => setHasMedical(e.target.checked)}
                className="rounded border-input text-primary focus:ring-ring"
              />
            </label>

            <label className="flex items-center justify-between p-3 cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-sm font-medium text-foreground">
                  {isKo ? '6하원칙에 따라 작성된 날짜별 일기/업무일지 (+10점)' : 'Detailed 5W1H Timestamped Incident Log (+10 pts)'}
                </span>
                <p className="text-xs text-muted-foreground">
                  {isKo
                    ? '일시, 장소, 발언자, 목격자, 구체적 발언 내용을 기록한 메모의 신빙성'
                    : 'Chronological diary recording date, time, location, remarks, and surrounding context.'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={hasDiary}
                onChange={(e) => setHasDiary(e.target.checked)}
                className="rounded border-input text-primary focus:ring-ring"
              />
            </label>

            <label className="flex items-center justify-between p-3 cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-sm font-medium text-foreground">
                  {isKo ? '동료 근로자의 목격 진술 및 증언 (+10점)' : 'Coworker Witness Statements (+10 pts)'}
                </span>
                <p className="text-xs text-muted-foreground">
                  {isKo
                    ? '사건 당시 함께 현장에 있었던 동료의 사실 확인서나 메신저 지지 대화'
                    : 'Corroborating statements from colleagues who observed the incident.'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={hasWitness}
                onChange={(e) => setHasWitness(e.target.checked)}
                className="rounded border-input text-primary focus:ring-ring"
              />
            </label>
          </div>
        </CardContent>
      </Card>

      {/* 진단 결과 카드 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '3대 법정 요건' : 'Statutory Elements'}</span>
                {result.isAllMet ? (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                )}
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {result.satisfiedCount} / 3 충족
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {result.isAllMet ? (isKo ? '법적 요건 완성' : 'All elements met') : (isKo ? '요건 결여' : 'Incomplete')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '객관적 증거력' : 'Evidence Strength'}</span>
                <Badge variant={result.score >= 60 ? 'secondary' : 'outline'}>
                  {result.score >= 60 ? (isKo ? '강력' : 'Strong') : (isKo ? '보강 필요' : 'Moderate')}
                </Badge>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{result.score}점</p>
              <p className="mt-1 text-xs text-muted-foreground">100점 만점 기준</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '노동청 진정 판정' : 'Filing Readiness'}</span>
                {result.status === 'STRONG' ? (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                ) : (
                  <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {result.status === 'STRONG'
                  ? (isKo ? '즉시 신고 가능' : 'Ready to File')
                  : result.status === 'MODERATE'
                  ? (isKo ? '증거 보강 권고' : 'Needs Polish')
                  : (isKo ? '신고 보류' : 'Hold Filing')}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {result.status === 'STRONG' ? (isKo ? '승소 유력' : 'High probability') : (isKo ? '보완 필요' : 'Inconclusive')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 맞춤형 조치 및 법적 보호 안내 */}
      <Card>
        <CardHeader>
          <CardTitle>{isKo ? '피해 근로자 법적 대응 로드맵' : 'Legal Action Roadmap'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            {result.status === 'STRONG' ? (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isKo ? '노동청 진정 및 사내 신고 권고 (입증력 충분)' : 'Ready for Formal Complaint'}</span>
                </div>
                <p>
                  {isKo
                    ? `법정 3대 요건이 모두 성립하고 증거 점수(${result.score}점)가 충분합니다. 사업장 관할 지방고용노동관서에 '직장 내 괴롭힘 진정서'를 접수하거나 사내 고충처리위원회에 정식 신고서를 제출하세요.`
                    : 'Evidence threshold is met with high legal sufficiency. Proceed with filing to the Ministry of Employment and Labor.'}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-destructive font-semibold">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{isKo ? '신고 전 증거 추가 확보 권고' : 'Evidence Reinforcement Advised'}</span>
                </div>
                <p>
                  {isKo
                    ? `현재 증거 점수는 ${result.score}점입니다. 가해자나 회사가 "통상적인 업무 지도였다"고 반박할 경우 기각될 수 있습니다. 대화 녹음이나 정신과 진단서(우울·적응장애)를 최소 1개 이상 추가 확보한 후 신고하는 것이 안전합니다.`
                    : 'Secure additional objective evidence (audio or psychiatric record) before initiating an official inquiry.'}
                </p>
              </div>
            )}

            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
              <span className="font-semibold text-foreground text-xs">
                💡 신고를 이유로 한 불리한 처우(해고·전직·징계)는 형사처벌 대상
              </span>
              <p className="text-xs">
                근로기준법 제76조의3 제6항에 따라 사용자는 직장 내 괴롭힘 발생 사실을 신고한 근로자 및 피해근로자에게 해고나 그 밖의 불리한 처우를 해서는 안 됩니다. 이를 위반하면 사용자에게 <strong>3년 이하의 징역 또는 3천만원 이하의 벌금</strong>에 처해집니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
