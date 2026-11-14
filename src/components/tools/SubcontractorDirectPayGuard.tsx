import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

export function SubcontractorDirectPayGuard({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [claimAmountManwon, setClaimAmountManwon] = useState<number>(5000); // 5,000만원
  const [insolvency, setInsolvency] = useState<boolean>(false);
  const [tripartiteAgreement, setTripartiteAgreement] = useState<boolean>(false);
  const [unpaidCount, setUnpaidCount] = useState<number>(2);
  const [noGuarantee, setNoGuarantee] = useState<boolean>(false);
  const [isBeforeAttachment, setIsBeforeAttachment] = useState<boolean>(true);

  const result = useMemo(() => {
    const reasons = [];
    if (insolvency) reasons.push(isKo ? '제1호: 원사업자 부도·파산·회생절차 개시' : 'Clause 1: Prime Contractor Insolvency');
    if (tripartiteAgreement) reasons.push(isKo ? '제2호: 발주자·원사업자·수급사업자 3자 직불합의' : 'Clause 2: Tripartite Direct Payment Agreement');
    if (unpaidCount >= 2) reasons.push(isKo ? `제3호: 하도급대금 2회 이상(${unpaidCount}회) 연체` : `Clause 3: 2+ Unpaid Payments (${unpaidCount} times)`);
    if (noGuarantee) reasons.push(isKo ? '제4호: 원사업자의 대금지급보증 미이행' : 'Clause 4: Payment Guarantee Default');

    const isEligible = reasons.length > 0;
    const isPriorityProtected = isEligible && isBeforeAttachment;

    return {
      isEligible,
      isPriorityProtected,
      satisfiedCount: reasons.length,
      reasons,
    };
  }, [insolvency, tripartiteAgreement, unpaidCount, noGuarantee, isBeforeAttachment, isKo]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* 헤더 */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>{isKo ? '하도급법 제14조 및 대법원 판례' : 'Subcontracting Act Art. 14 Direct Payment'}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {isKo ? '하도급 대금 직접지급 청구 자격 판정기' : 'Subcontractor Direct Payment Eligibility Guard'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isKo
            ? '원사업자의 부도·연체 시 수급사업자가 발주자(공공기관·건축주)에게 공사·용역 대금을 직접 청구할 수 있는 법정 요건과 대항력을 진단합니다.'
            : 'Audit statutory eligibility to directly claim unpaid subcontract payments from project owners under Art. 14.'}
        </p>
      </div>

      {/* 요건 입력 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>{isKo ? '하도급 계약 및 미지급 상태 입력' : 'Contract & Default Status'}</CardTitle>
          <CardDescription>
            {isKo
              ? '미지급된 하도급 대금과 해당하는 법정 사유를 선택하세요.'
              : 'Enter claim amount and toggle statutory conditions.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isKo ? '청구 대상 하도급 대금' : 'Claim Subcontract Amount'}
              </label>
              <div className="relative max-w-xs">
                <input
                  type="number"
                  value={claimAmountManwon}
                  onChange={(e) => setClaimAmountManwon(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background p-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">만원</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-sm font-medium text-foreground">
                {isKo ? '법정 4대 청구 사유 해당 여부 (1개 이상 해당 시 직접청구 가능)' : 'Statutory Direct Payment Clauses'}
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex items-start gap-2.5 rounded-lg border border-border p-3 text-sm cursor-pointer hover:bg-muted/30">
                  <input
                    type="checkbox"
                    checked={insolvency}
                    onChange={(e) => setInsolvency(e.target.checked)}
                    className="mt-0.5 rounded border-input text-primary focus:ring-ring"
                  />
                  <div>
                    <p className="font-semibold">{isKo ? '1. 원사업자 부도·회생·파산' : '1. Prime Contractor Insolvency'}</p>
                    <p className="text-xs text-muted-foreground">{isKo ? '어음부도, 당좌거래정지, 기업회생절차 개시 신청 등' : 'Default, dishonored notes, rehabilitation'}</p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 rounded-lg border border-border p-3 text-sm cursor-pointer hover:bg-muted/30">
                  <input
                    type="checkbox"
                    checked={tripartiteAgreement}
                    onChange={(e) => setTripartiteAgreement(e.target.checked)}
                    className="mt-0.5 rounded border-input text-primary focus:ring-ring"
                  />
                  <div>
                    <p className="font-semibold">{isKo ? '2. 발주자-원청-하청 3자 직불합의' : '2. Tripartite Direct Payment Agreement'}</p>
                    <p className="text-xs text-muted-foreground">{isKo ? '계약 시점 또는 공사 중 발주자가 직불하기로 3자 합의' : 'Direct payment signed by client, prime & subcontractor'}</p>
                  </div>
                </label>

                <div className="rounded-lg border border-border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{isKo ? '3. 하도급 대금 2회 이상 연체' : '3. 2+ Unpaid Payment Milestones'}</p>
                      <p className="text-xs text-muted-foreground">{isKo ? '기성금 또는 완료대금 2회 이상 미지급' : 'Consecutive unpaid progress invoices'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{isKo ? '미지급 회수:' : 'Count:'}</span>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((cnt) => (
                        <Button
                          key={cnt}
                          variant={unpaidCount === cnt ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setUnpaidCount(cnt)}
                        >
                          {cnt >= 3 ? `${cnt}회+` : `${cnt}회`}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-2.5 rounded-lg border border-border p-3 text-sm cursor-pointer hover:bg-muted/30">
                  <input
                    type="checkbox"
                    checked={noGuarantee}
                    onChange={(e) => setNoGuarantee(e.target.checked)}
                    className="mt-0.5 rounded border-input text-primary focus:ring-ring"
                  />
                  <div>
                    <p className="font-semibold">{isKo ? '4. 대금지급보증서 미발급' : '4. Payment Guarantee Default'}</p>
                    <p className="text-xs text-muted-foreground">{isKo ? '원사업자가 법정 하도급대금 지급보증을 미이행' : 'Prime failed to provide payment guarantee'}</p>
                  </div>
                </label>
              </div>

              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={isBeforeAttachment}
                    onChange={(e) => setIsBeforeAttachment(e.target.checked)}
                    className="rounded border-input text-primary focus:ring-ring"
                  />
                  <span>{isKo ? '원사업자의 다른 채권자로부터 가압류·압류 결정 통지가 발주자에게 도달하기 전임' : 'Notice arrives before third-party attachments on the prime contractor'}</span>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 결과 지표 카드 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '직접지급 청구 적격' : 'Claim Eligibility'}</span>
                {result.isEligible ? (
                  <Badge variant="default">{isKo ? '청구 가능' : 'Eligible'}</Badge>
                ) : (
                  <Badge variant="secondary">{isKo ? '사유 미충족' : 'Not Eligible'}</Badge>
                )}
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {result.isEligible ? `${result.satisfiedCount}개 요건 충족` : (isKo ? '청구 불가' : 'Ineligible')}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {result.isEligible ? (isKo ? '발주자 대상 직접청구권 발생' : 'Statutory claim rights active') : (isKo ? '법정 4대 사유 필요' : 'Requires at least 1 clause')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '우선변제 대항력 상태' : 'Priority Protection'}</span>
                {result.isPriorityProtected ? (
                  <Badge variant="secondary">{isKo ? '우선변제권 확보' : 'Protected'}</Badge>
                ) : (
                  <Badge variant="destructive">{isKo ? '경합 위험' : 'Attachment Risk'}</Badge>
                )}
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {result.isPriorityProtected ? (isKo ? '압류 전 최우선' : 'Prior to Attachment') : (isKo ? '배당 경합 주의' : 'Contested')}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {isBeforeAttachment ? (isKo ? '제3자 압류 전 확정일자 도달' : 'Before third-party liens') : (isKo ? '압류 송달 후는 공탁 배당' : 'Lien contestation')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '직접 청구 대상액' : 'Claim Target Amount'}</span>
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {claimAmountManwon.toLocaleString()}만원
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{isKo ? '발주자 잔여 기성금 한도 내' : 'Within remaining owner balance'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 종합 진단 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>{isKo ? '법적 효과 판정 및 필수 조치 체크리스트' : 'Legal Effects & Action Checklist'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            {result.isEligible ? (
              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isKo ? '하도급법 제14조 직접청구권 발생 완료' : 'Direct Payment Rights Triggered'}</span>
                </div>
                <p className="text-xs">
                  수급사업자의 직접지급 요청 통지가 발주자에게 도달하는 즉시 발주자의 원사업자에 대한 대금지급의무와 원사업자의 하도급대금 채무가 법률상 소멸하고, 발주자가 수급사업자에게 직접 대금을 변제해야 하는 직접지급채무가 성립합니다.
                </p>
                <div className="pt-2">
                  <p className="text-xs font-semibold text-foreground">{isKo ? '📌 수급사업자 3대 즉시 실행 조치:' : 'Action Items:'}</p>
                  <ul className="mt-1 list-disc list-inside text-xs space-y-1">
                    <li>발주자에게 우체국 내용증명(배달증명)으로 '하도급대금 직접지급 요청서' 즉시 발송</li>
                    <li>하도급 계약서 사본, 기성고 확인서, 세금계산서, 금융거래 내역서 증빙 동봉</li>
                    <li>발주자 회계/공무 부서에 원사업자에 대한 기성금 지급 보류 공식 공문 전달</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-2">
                <div className="flex items-center gap-2 text-destructive font-semibold">
                  <ShieldAlert className="h-4 w-4" />
                  <span>{isKo ? '법정 직접청구 요건 미충족' : 'Direct Payment Clauses Not Met'}</span>
                </div>
                <p className="text-xs">
                  현재 법정 4대 사유 중 충족된 항목이 없습니다. 단순 1회 지연이나 단순 구두 요청만으로는 발주자에게 직접 청구할 수 없으며, 원사업자 재산에 대한 가압류 및 지급명령 등 일반 민사 채권추심을 진행해야 합니다.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
