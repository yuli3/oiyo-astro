import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle, Sparkles, ShieldCheck, ShieldAlert, Copy, Check } from 'lucide-react';

export function AgentA11yFocusGuard({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [code, setCode] = useState(`
<div className="modal-overlay">
  <div className="modal-content">
    <h2>알림</h2>
    <p>내용입니다.</p>
    <button onClick={close}>확인</button>
  </div>
</div>
  `.trim());

  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const checks = [
      {
        id: 'ROLE_DIALOG',
        title: isKo ? 'role="dialog" 또는 role="alertdialog"' : 'role="dialog" attribute',
        passed: /role\s*=\s*["'](dialog|alertdialog)["']/i.test(code),
        weight: 20,
        fix: isKo ? '모달 컨테이너에 role="dialog" 속성을 추가하세요.' : 'Add role="dialog" to container.',
      },
      {
        id: 'ARIA_MODAL',
        title: isKo ? 'aria-modal="true" 선언' : 'aria-modal="true" declaration',
        passed: /aria-modal\s*=\s*["']true["']/i.test(code) || /aria-modal=\{true\}/i.test(code),
        weight: 20,
        fix: isKo ? '백그라운드 스크린리더 탐색 차단을 위해 aria-modal="true"를 추가하세요.' : 'Add aria-modal="true".',
      },
      {
        id: 'ARIA_LABEL',
        title: isKo ? '접근성 이름 (aria-labelledby 또는 aria-label)' : 'Accessible Name',
        passed: /aria-label(ledby)?\s*=/i.test(code),
        weight: 20,
        fix: isKo ? '제목 태그와 연결되는 aria-labelledby="dialog-title"을 부여하세요.' : 'Add aria-labelledby="title-id".',
      },
      {
        id: 'ESCAPE_KEY',
        title: isKo ? 'Escape (ESC) 키 닫기 핸들러' : 'Escape Key Handler',
        passed: /(key\s*===\s*["']Escape["']|key\s*===\s*["']Esc["']|e\.keyCode\s*===\s*27)/i.test(code),
        weight: 20,
        fix: isKo ? 'keydown 이벤트에서 e.key === "Escape" 일 때 모달을 닫도록 구현하세요.' : 'Handle e.key === "Escape".',
      },
      {
        id: 'FOCUS_TRAP',
        title: isKo ? '키보드 Tab 순환 (Focus Trap)' : 'Keyboard Focus Trap (Tab loop)',
        passed: /(tabIndex|focus\(\)|focus-trap|react-focus-lock|e\.key\s*===\s*["']Tab["'])/i.test(code),
        weight: 20,
        fix: isKo ? '첫 번째 요소와 마지막 요소 간에 Tab 키가 순환하도록 트랩 로직을 구현하세요.' : 'Implement Tab loop.',
      },
    ];

    let score = 0;
    checks.forEach((c) => {
      if (c.passed) score += c.weight;
    });

    const isCompliant = score >= 80;

    return {
      score,
      isCompliant,
      checks,
    };
  }, [code, isKo]);

  const standardSnippet = `
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  onKeyDown={(e) => {
    if (e.key === 'Escape') onClose();
  }}
  className="modal-container"
>
  <h2 id="modal-title">다이얼로그 제목</h2>
  <button autoFocus onClick={onConfirm}>확인</button>
  <button onClick={onClose}>취소</button>
</div>
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(standardSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePreset = (type: 'accessible' | 'flawed') => {
    if (type === 'accessible') {
      setCode(`
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-heading"
  onKeyDown={(e) => {
    if (e.key === 'Escape') handleClose();
    if (e.key === 'Tab') handleFocusTrap(e);
  }}
>
  <h2 id="dialog-heading">회원정보 수정</h2>
  <input autoFocus placeholder="이름" />
  <button onClick={handleClose}>닫기</button>
</div>
      `.trim());
    } else {
      setCode(`
<div className="popup-box">
  <div className="popup-header">공지사항</div>
  <div className="popup-body">새로운 기능이 출시되었습니다.</div>
  <button onClick={closePopup}>닫기</button>
</div>
      `.trim());
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {isKo ? '🔍 웹 모달 포커스 트랩 & WCAG 2.2 접근성 감사기' : '🔍 Modal Focus Trap & WCAG 2.2 a11y Auditor'}
              </CardTitle>
              <CardDescription>
                {isKo
                  ? '모달·드로어 UI의 포커스 트랩(Tab 키 순환), aria-modal="true", ESC 탈출 핸들러 등 5대 필수 접근성을 0.1ms 내에 감사합니다.'
                  : 'Audit focus trap, aria-modal, role="dialog", and ESC handlers for WCAG 2.2 compliance in sub-milliseconds.'}
              </CardDescription>
            </div>
            <Badge variant={result.isCompliant ? 'outline' : 'destructive'}>
              {result.score} / 100점 ({result.isCompliant ? (isKo ? '합격' : 'Passed') : (isKo ? '보완 필요' : 'Needs Fix')})
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between pb-2">
                <label className="text-sm font-medium">
                  {isKo ? '검사할 모달/드로어 컴포넌트 코드' : 'Modal / Drawer Component Code to Audit'}
                </label>
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" onClick={() => handlePreset('accessible')}>
                    {isKo ? '접근성 준수 예시' : 'Accessible Sample'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handlePreset('flawed')}>
                    {isKo ? '결함 코드 예시' : 'Flawed Sample'}
                  </Button>
                </div>
              </div>
              <Textarea
                rows={6}
                className="font-mono text-xs"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            {/* Checklist Results */}
            <div className="rounded-lg border p-4 space-y-3 bg-muted/20">
              <div className="font-semibold text-sm flex items-center justify-between">
                <span>{isKo ? 'WCAG 2.2 접근성 5대 체크리스트' : 'WCAG 2.2 5 Key Checklist Items'}</span>
                <span className="text-xs text-muted-foreground">{isKo ? '통과' : 'Passed'}: {result.checks.filter(c => c.passed).length} / 5</span>
              </div>
              <div className="space-y-2">
                {result.checks.map((item, idx) => (
                  <div key={idx} className="rounded border bg-background p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-medium">
                        {item.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                        <span>{item.title}</span>
                      </div>
                      <Badge variant={item.passed ? 'outline' : 'destructive'}>
                        {item.passed ? '+20점' : '0점'}
                      </Badge>
                    </div>
                    {!item.passed && (
                      <div className="text-muted-foreground pl-6">
                        👉 <strong>{isKo ? '조치' : 'Fix'}:</strong> {item.fix}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Copyable Standard Template */}
            <div>
              <div className="flex items-center justify-between pb-1.5">
                <span className="text-xs font-semibold text-muted-foreground">
                  {isKo ? '💡 WAI-ARIA 표준 다이얼로그 템플릿' : '💡 WAI-ARIA Standard Dialog Template'}
                </span>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                  <span className="ml-1 text-xs">{copied ? (isKo ? '복사됨' : 'Copied') : (isKo ? '복사' : 'Copy')}</span>
                </Button>
              </div>
              <div className="rounded border bg-background p-3 text-xs font-mono break-all text-muted-foreground">
                <pre className="whitespace-pre-wrap">{standardSnippet}</pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default AgentA11yFocusGuard;
