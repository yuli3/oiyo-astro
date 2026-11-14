import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ShieldAlert, CheckCircle2, AlertTriangle, Coins } from 'lucide-react';

export function AnnualLeavePromotionGuard({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [unusedDays, setUnusedDays] = useState<number>(5);
  const [dailyWageManwon, setDailyWageManwon] = useState<number>(12); // 12만원

  const [written1, setWritten1] = useState<boolean>(true);
  const [onTime1, setOnTime1] = useState<boolean>(true);
  const [written2, setWritten2] = useState<boolean>(false);
  const [onTime2, setOnTime2] = useState<boolean>(false);
  const [refusalDoc, setRefusalDoc] = useState<boolean>(false);

  const dailyWage = dailyWageManwon * 10000;

  const result = useMemo(() => {
    const flaws: { step: string; flaw: string }[] = [];

    if (!written1) {
      flaws.push({
        step: isKo ? '1차 서면 촉구 결여' : 'Step 1 Written Notice Lacking',
        flaw: isKo
          ? '사내 메신저, 단체 이메일, 구두 공지는 법정 서면 촉구로 인정되지 않습니다.'
          : 'Group emails or verbal announcements do not meet statutory written standards.',
      });
    }

    if (!onTime1) {
      flaws.push({
        step: isKo ? '1차 기한 위반' : 'Step 1 Timing Violation',
        flaw: isKo
          ? '기간 만료 6개월 전 10일 이내(7월 1일~10일) 법정 시기를 도과하였습니다.'
          : 'Missed statutory 6-month prior 10-day window.',
      });
    }

    if (!written2) {
      flaws.push({
        step: isKo ? '2차 서면 지정 통보 결여' : 'Step 2 Written Designation Missing',
        flaw: isKo
          ? '근로자가 시기를 미지정했음에도 회사가 사용일을 서면으로 지정 통보하지 않았습니다.'
          : 'Employer failed to designate and deliver written leave dates.',
      });
    }

    if (!onTime2) {
      flaws.push({
        step: isKo ? '2차 기한 위반' : 'Step 2 Timing Violation',
        flaw: isKo
          ? '기간 만료 2개월 전까지 통보해야 하는 법정 시기를 도과하였습니다.'
          : 'Failed to notify 2 months prior to year-end deadline.',
      });
    }

    if (!refusalDoc) {
      flaws.push({
        step: isKo ? '노무수령 거부 미이행' : 'No Labor Refusal Document',
        flaw: isKo
          ? '지정 휴가일에 출근하여 근무했음에도 회사가 노무수령 거부 의사를 서면으로 교부하지 않았습니다.'
          : 'Employer accepted work on designated day without explicit written refusal notice.',
      });
    }

    const isValid = flaws.length === 0;
    const totalClaimable = unusedDays * dailyWage;

    return {
      isValid,
      flaws,
      totalClaimable,
    };
  }, [unusedDays, dailyWage, written1, onTime1, written2, onTime2, refusalDoc, isKo]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* 헤더 */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{isKo ? '근로기준법 제61조 연차 가드' : 'LSA Art. 61 Leave Promotion Guard'}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {isKo ? '연차사용촉진제 적법성 및 미사용수당 방어기' : 'Annual Leave Promotion Compliance & Pay Recovery Guard'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isKo
            ? '회사의 1차·2차 연차 촉진 절차상 법적 흠결을 검증하여 소멸 위기의 미사용 연차수당 청구권을 방어합니다.'
            : 'Audit employer compliance with 2-step annual leave promotion rules and protect your statutory unpaid leave claims.'}
        </p>
      </div>

      {/* 기본 정보 입력 */}
      <Card>
        <CardHeader>
          <CardTitle>{isKo ? '미사용 연차 및 임금 정보 입력' : 'Unused Days & Wage Information'}</CardTitle>
          <CardDescription>
            {isKo ? '잔여 연차 일수와 1일 통상임금을 입력하세요.' : 'Enter remaining days and daily ordinary wage.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isKo ? '소멸 위기 미사용 연차 일수' : 'Remaining Unused Leave Days'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={unusedDays}
                  onChange={(e) => setUnusedDays(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">일</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isKo ? '1일 통상임금 (기본급+고정수당 기준)' : 'Daily Ordinary Wage'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={dailyWageManwon}
                  onChange={(e) => setDailyWageManwon(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">만원</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 회사의 2단계 촉진 절차 체크리스트 */}
      <Card>
        <CardHeader>
          <CardTitle>{isKo ? '회사의 법정 촉진 절차 이행 여부' : 'Statutory Promotion Process Audit'}</CardTitle>
          <CardDescription>
            {isKo ? '회사가 실제로 진행한 방식을 사실대로 체크하세요.' : 'Verify company implementation of statutory requirements.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border rounded-lg border border-border">
            <label className="flex items-center justify-between p-3 cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-sm font-medium text-foreground">
                  {isKo ? '1차: 종이 서면으로 잔여일수 통보 및 시기 지정 촉구를 받았나요?' : 'Step 1: Received individual paper notice of remaining days?'}
                </span>
                <p className="text-xs text-muted-foreground">
                  {isKo ? '단체 메일, 메신저, 구두 통보는 서면이 아니므로 체크 해제' : 'Uncheck if notified only via group email or chat app.'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={written1}
                onChange={(e) => setWritten1(e.target.checked)}
                className="rounded border-input text-primary focus:ring-ring"
              />
            </label>

            <label className="flex items-center justify-between p-3 cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-sm font-medium text-foreground">
                  {isKo ? '1차: 만료 6개월 전 기준 10일 이내(7월 1일~10일)에 촉구받았나요?' : 'Step 1: Notified within statutory 10-day window (6 months prior)?'}
                </span>
                <p className="text-xs text-muted-foreground">
                  {isKo ? '기한을 넘겨 8월이나 9월에 촉구했다면 체크 해제' : 'Uncheck if notified late (e.g. August or September).'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={onTime1}
                onChange={(e) => setOnTime1(e.target.checked)}
                className="rounded border-input text-primary focus:ring-ring"
              />
            </label>

            <label className="flex items-center justify-between p-3 cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-sm font-medium text-foreground">
                  {isKo ? '2차: 회사가 사용 시기를 직접 지정하여 서면으로 통보했나요?' : 'Step 2: Employer designated dates and delivered written notice?'}
                </span>
                <p className="text-xs text-muted-foreground">
                  {isKo ? '근로자가 휴가원을 내지 않았을 때 회사가 직접 날짜를 못 박아 서면 교부한 경우만 체크' : 'Check only if employer formally designated dates in writing.'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={written2}
                onChange={(e) => setWritten2(e.target.checked)}
                className="rounded border-input text-primary focus:ring-ring"
              />
            </label>

            <label className="flex items-center justify-between p-3 cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-sm font-medium text-foreground">
                  {isKo ? '2차: 만료 2개월 전(10월 31일)까지 서면 지정 통보를 완료했나요?' : 'Step 2: Completed designation 2 months prior to year-end?'}
                </span>
                <p className="text-xs text-muted-foreground">
                  {isKo ? '11월이나 12월에 뒤늦게 지정 통보했다면 체크 해제' : 'Uncheck if designated late in November or December.'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={onTime2}
                onChange={(e) => setOnTime2(e.target.checked)}
                className="rounded border-input text-primary focus:ring-ring"
              />
            </label>

            <label className="flex items-center justify-between p-3 cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-sm font-medium text-foreground">
                  {isKo ? '휴가일에 출근 시 회사가 "노무수령 거부통지서"를 서면 교부했나요?' : 'Delivered written labor refusal notice when employee worked?'}
                </span>
                <p className="text-xs text-muted-foreground">
                  {isKo ? '지정일에 출근해서 일했는데 회사가 묵인하고 일을 시켰다면 체크 해제' : 'Uncheck if company permitted work without formal refusal.'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={refusalDoc}
                onChange={(e) => setRefusalDoc(e.target.checked)}
                className="rounded border-input text-primary focus:ring-ring"
              />
            </label>
          </div>
        </CardContent>
      </Card>

      {/* 판정 결과 카드 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '회사의 촉진 적법성' : 'Promotion Legality'}</span>
                {result.isValid ? (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                )}
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {result.isValid ? (isKo ? '적법 (수당 소멸)' : 'Valid') : (isKo ? '위법·절차 흠결' : 'Defective')}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {result.isValid ? (isKo ? '법정 절차 준수' : 'Compliant') : `${result.flaws.length}개 법적 하자 감지`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '수당 청구 가능 여부' : 'Pay Claim Right'}</span>
                {!result.isValid ? (
                  <Badge variant="secondary">{isKo ? '100% 청구 가능' : 'Claimable'}</Badge>
                ) : (
                  <Badge variant="outline">{isKo ? '수당 소멸' : 'Extinguished'}</Badge>
                )}
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {!result.isValid ? (isKo ? '청구 가능' : 'Valid Claim') : (isKo ? '청구 불가' : 'None')}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {!result.isValid ? (isKo ? '퇴직금 산입 대상' : 'Included in severance') : (isKo ? '면책 성립' : 'Exempt')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '보전 가능 연차수당' : 'Recoverable Pay'}</span>
                <Coins className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {(result.totalClaimable / 10000).toLocaleString()}만원
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{unusedDays}일 x 1일 {(dailyWage / 10000).toLocaleString()}만원</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 절차적 결함 목록 및 권리 구제 안내 */}
      <Card>
        <CardHeader>
          <CardTitle>{isKo ? '법적 절차 하자 상세 및 근로자 대응' : 'Legal Flaws & Worker Actions'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            {result.flaws.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-destructive font-semibold">
                  <ShieldAlert className="h-4 w-4" />
                  <span>{isKo ? '회사의 연차촉진 무효 사유' : 'Employer Promotion Nullification Grounds'}</span>
                </div>
                <ul className="divide-y divide-border rounded-lg border border-border">
                  {result.flaws.map((f, idx) => (
                    <li key={idx} className="p-3 text-xs space-y-1">
                      <span className="font-semibold text-foreground">⚠️ {f.step}</span>
                      <p>{f.flaw}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-1">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isKo ? '회사의 법정 요건 충족' : 'Employer Fully Complied'}</span>
                </div>
                <p className="text-xs">
                  회사가 근로기준법 제61조에 따른 모든 요건을 엄격히 준수하여 연차수당 지급의무가 적법하게 면책되었습니다.
                </p>
              </div>
            )}

            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
              <span className="font-semibold text-foreground text-xs">
                💡 연차수당 청구권 소멸시효 3년
              </span>
              <p className="text-xs">
                촉진 절차에 하자가 있어 살아있는 미사용 연차수당은 발생한 날로부터 <strong>3년 이내</strong>에 청구해야 합니다. 회사가 지급을 거부할 경우 관할 고용노동청에 임금체불 진정을 제기하여 즉시 전액을 수령할 수 있습니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
