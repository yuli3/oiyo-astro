import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, FileText, Bus, Stethoscope, AlertTriangle, Users } from 'lucide-react';

export function VoluntaryResignationAdvisor({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [category, setCategory] = useState<'relocation' | 'wage_delay' | 'illness' | 'harassment' | 'family_care'>('relocation');
  const [commuteHours, setCommuteHours] = useState<number>(3.5);
  const [delayedMonths, setDelayedMonths] = useState<number>(2);
  const [hasDoctorNote, setHasDoctorNote] = useState<boolean>(true);
  const [hasLeaveDenied, setHasLeaveDenied] = useState<boolean>(true);
  const [hasEvidence, setHasEvidence] = useState<boolean>(true);

  const result = useMemo(() => {
    let eligible = false;
    let code = '';
    let docs: string[] = [];
    let summary = '';

    if (category === 'relocation') {
      eligible = commuteHours >= 3.0;
      code = eligible ? '코드 12 (사업장/거소 이전)' : '';
      docs = [
        isKo ? '주민등록등본 (이사 사실 증명)' : 'Resident Registration Copy',
        isKo ? '대중교통 왕복 3시간 이상 경로 캡처본' : 'Commute Transit Route Map (>3h)',
        isKo ? '출퇴근 경로 확인서' : 'Commute Verification Form',
      ];
      summary = eligible
        ? (isKo ? `왕복 통근 ${commuteHours}시간으로 법정 기준(3시간 이상) 충족! 자진퇴사라도 실업급여 수급 가능합니다.` : 'Qualified for unemployment benefits.')
        : (isKo ? `왕복 통근 ${commuteHours}시간으로 법정 기준(3시간 이상)에 미달하여 수급이 어렵습니다.` : 'Disqualified (<3 hours).');
    } else if (category === 'wage_delay') {
      eligible = delayedMonths >= 2;
      code = eligible ? '코드 22 (근로조건 저하)' : '';
      docs = [
        isKo ? '급여명세서 및 입금 통장 거래내역 사본' : 'Pay stubs and bank statements',
        isKo ? '고용노동부 임금체불 확인원' : 'MOEL Unpaid Wage Certificate',
      ];
      summary = eligible
        ? (isKo ? `최근 1년 내 ${delayedMonths}개월 체불로 정당한 이직 사유 인정!` : 'Eligible due to wage delay.')
        : (isKo ? '임금체불 기간이 2개월 이상이어야 정당한 사유로 인정됩니다.' : 'Requires at least 2 months of delayed wages.');
    } else if (category === 'illness') {
      eligible = hasDoctorNote && hasLeaveDenied;
      code = eligible ? '코드 23 (질병·부상)' : '';
      docs = [
        isKo ? '의사 진단서 (2~3개월 치료 및 업무불가 명시)' : 'Doctor Note (2-3mo therapy required)',
        isKo ? '사업주 작성 병가/휴직 불허 확인서' : 'Employer Sick Leave Denial Form',
        isKo ? '치료 후 구직활동 가능 소견서' : 'Post-recovery Job Search Doctor Note',
      ];
      summary = eligible
        ? (isKo ? '의사 진단서 및 회사 휴직 불허 확인서 구비로 수급 자격 충족!' : 'Eligible under medical leave.')
        : (isKo ? '의사 진단서와 회사의 병가/휴직 불허 확인서가 둘 다 있어야 인정됩니다.' : 'Doctor note and company denial form required.');
    } else if (category === 'harassment') {
      eligible = hasEvidence;
      code = eligible ? '코드 22 (직장내 괴롭힘)' : '';
      docs = [
        isKo ? '노동청 괴롭힘 인정 판정서 또는 사내 조사결과서' : 'MOEL Harassment Ruling Document',
        isKo ? '메신저 캡처, 녹취록, 진술서 등 객관적 증빙' : 'Chat logs and recording evidence',
      ];
      summary = eligible
        ? (isKo ? '객관적 증빙 확보로 자진퇴사 실업급여 인정 대상입니다.' : 'Eligible via workplace harassment proof.')
        : (isKo ? '괴롭힘 피해는 객관적 신고 및 입증 자료가 필수적입니다.' : 'Objective proof required.');
    } else {
      eligible = hasLeaveDenied;
      code = eligible ? '코드 23 (가족 간병)' : '';
      docs = [
        isKo ? '가족 30일 이상 간병 필요 진단서' : 'Family 30-day Care Need Doctor Note',
        isKo ? '회사의 가족돌봄휴직 불허 확인서' : 'Company Care Leave Denial Form',
      ];
      summary = eligible
        ? (isKo ? '가족 간병 필요 및 휴직 불허가 인정되어 수급 가능합니다.' : 'Eligible via family caregiving.')
        : (isKo ? '회사가 가족돌봄휴직을 불허했다는 확인서가 필요합니다.' : 'Care leave denial form required.');
    }

    return {
      eligible,
      code,
      docs,
      summary,
    };
  }, [category, commuteHours, delayedMonths, hasDoctorNote, hasLeaveDenied, hasEvidence, isKo]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {isKo ? '고용보험법 시행규칙 별표2' : 'Employment Insurance Act'}
              </span>
            </Badge>
            <Badge variant="secondary">{isKo ? '자진퇴사 13대 예외' : '13 Statutory Exceptions'}</Badge>
          </div>
          <CardTitle>
            {isKo
              ? '자진퇴사 실업급여 법정 정당한 이직 사유 판정기'
              : 'Voluntary Resignation Unemployment Benefits Advisor'}
          </CardTitle>
          <CardDescription>
            {isKo
              ? '원칙적으로 수급이 불가능한 자진퇴사라도 통근 3시간, 임금체불 2개월, 질병 퇴사, 괴롭힘 등 법정 정당한 사유 충족 여부와 필수 증빙 서류를 진단합니다.'
              : 'Evaluate eligibility for unemployment benefits after voluntary resignation under statutory exceptions.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-sm font-medium">{isKo ? '자진퇴사 사유 선택' : 'Resignation Reason'}</span>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <Button
                  variant={category === 'relocation' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategory('relocation')}
                >
                  <Bus className="h-3.5 w-3.5 mr-1" />
                  {isKo ? '통근 3시간' : 'Commute >3h'}
                </Button>
                <Button
                  variant={category === 'wage_delay' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategory('wage_delay')}
                >
                  <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                  {isKo ? '임금체불' : 'Wage Delay'}
                </Button>
                <Button
                  variant={category === 'illness' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategory('illness')}
                >
                  <Stethoscope className="h-3.5 w-3.5 mr-1" />
                  {isKo ? '질병·부상' : 'Illness'}
                </Button>
                <Button
                  variant={category === 'harassment' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategory('harassment')}
                >
                  <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                  {isKo ? '괴롭힘 피해' : 'Harassment'}
                </Button>
                <Button
                  variant={category === 'family_care' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategory('family_care')}
                >
                  <Users className="h-3.5 w-3.5 mr-1" />
                  {isKo ? '가족 간병' : 'Family Care'}
                </Button>
              </div>
            </div>

            {/* 조건별 세부 입력 */}
            <div className="p-4 border rounded-xl bg-background space-y-4">
              {category === 'relocation' && (
                <div className="space-y-2">
                  <label htmlFor="commute-input" className="text-sm font-medium">
                    {isKo ? '대중교통 왕복 소요시간 (시간)' : 'Roundtrip Transit Commute (Hours)'}
                  </label>
                  <Input
                    id="commute-input"
                    type="number"
                    value={commuteHours}
                    onChange={(e) => setCommuteHours(Math.max(0, Number(e.target.value) || 0))}
                    step={0.5}
                    min={0}
                  />
                  <p className="text-xs text-muted-foreground">
                    {isKo ? '사업장 이전, 전근, 결혼/동거로 인한 이사로 왕복 3시간 이상 시 인정' : 'Must exceed 3.0 hours roundtrip'}
                  </p>
                </div>
              )}

              {category === 'wage_delay' && (
                <div className="space-y-2">
                  <label htmlFor="delay-input" className="text-sm font-medium">
                    {isKo ? '최근 1년 이내 임금체불 누적 개월 수' : 'Months with Delayed Wages (Past 1y)'}
                  </label>
                  <Input
                    id="delay-input"
                    type="number"
                    value={delayedMonths}
                    onChange={(e) => setDelayedMonths(Math.max(0, Number(e.target.value) || 0))}
                    min={0}
                  />
                  <p className="text-xs text-muted-foreground">
                    {isKo ? '임금 전액 체불 또는 30% 이상 체불이 2개월 이상 발생 시 인정' : 'At least 2 months required'}
                  </p>
                </div>
              )}

              {category === 'illness' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/40">
                    <span className="text-xs font-medium">{isKo ? '의사 진단서 (2~3개월 치료 필요)' : 'Doctor Note'}</span>
                    <Button
                      variant={hasDoctorNote ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setHasDoctorNote(!hasDoctorNote)}
                    >
                      {hasDoctorNote ? (isKo ? '보유 ✅' : 'Yes') : (isKo ? '없음 ❌' : 'No')}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/40">
                    <span className="text-xs font-medium">{isKo ? '회사 병가/휴직 불허 확인서' : 'Leave Denial'}</span>
                    <Button
                      variant={hasLeaveDenied ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setHasLeaveDenied(!hasLeaveDenied)}
                    >
                      {hasLeaveDenied ? (isKo ? '보유 ✅' : 'Yes') : (isKo ? '없음 ❌' : 'No')}
                    </Button>
                  </div>
                </div>
              )}

              {category === 'harassment' && (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/40">
                  <span className="text-xs font-medium">{isKo ? '노동청 진정 또는 사내 조사 객관적 입증자료' : 'Objective Harassment Proof'}</span>
                  <Button
                    variant={hasEvidence ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setHasEvidence(!hasEvidence)}
                  >
                    {hasEvidence ? (isKo ? '확보 완료 ✅' : 'Yes') : (isKo ? '미확보 ❌' : 'No')}
                  </Button>
                </div>
              )}

              {category === 'family_care' && (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/40">
                  <span className="text-xs font-medium">{isKo ? '가족 30일 간병 진단서 및 회사 휴직 불허서' : 'Care Leave Denial Proof'}</span>
                  <Button
                    variant={hasLeaveDenied ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setHasLeaveDenied(!hasLeaveDenied)}
                  >
                    {hasLeaveDenied ? (isKo ? '보유 ✅' : 'Yes') : (isKo ? '없음 ❌' : 'No')}
                  </Button>
                </div>
              )}
            </div>

            {/* 판정 결과 카드 */}
            <div className="p-4 bg-muted/60 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{isKo ? '수급자격 판정 결과' : 'Eligibility Verdict'}</span>
                </div>
                <Badge variant={result.eligible ? 'default' : 'destructive'}>
                  {result.eligible ? (isKo ? '실업급여 수급 가능 ✅' : 'Eligible') : (isKo ? '수급 불가 대상 ❌' : 'Ineligible')}
                </Badge>
              </div>

              <div className="p-4 border rounded-lg bg-background space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{isKo ? '고용센터 이직 사유 코드' : 'Official Reason Code'}</span>
                  <span className="font-mono font-semibold text-primary">{result.code || (isKo ? '코드 11 (개인사정 일반퇴사)' : 'Code 11')}</span>
                </div>
                <p className="text-sm leading-relaxed">{result.summary}</p>
              </div>

              <div className="p-3 bg-background rounded-lg border text-xs space-y-2">
                <div className="flex items-center gap-1 font-semibold text-foreground">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>{isKo ? '고용복지플러스센터 필수 제출 서류 목록' : 'Required Documents'}</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {result.docs.map((doc, idx) => (
                    <li key={idx}>{doc}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default VoluntaryResignationAdvisor;
