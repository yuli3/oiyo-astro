import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Smartphone, CheckCircle2, AlertTriangle, Sparkles, Copy, Check } from 'lucide-react';

const SAMPLE_CODE = `<nav className="flex items-center justify-between p-4">
  <a href="/" className="p-1 text-sm font-bold">OIYO</a>
  <div className="flex gap-2">
    <button className="p-0.5 w-6 h-6"><SearchIcon className="w-4 h-4" /></button>
    <button className="min-w-12 min-h-12 p-3 bg-primary text-primary-foreground rounded-lg">Action</button>
    <button className="h-7 px-2 text-xs">Small</button>
  </div>
</nav>`;

interface Violation {
  line: number;
  tag: string;
  classStr: string;
  reasons: string[];
  autoFix: string;
}

export function AgentA11yTouchTargetGuard({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [code, setCode] = useState(SAMPLE_CODE);
  const [strict, setStrict] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const result = useMemo(() => {
    if (!code) return { total: 0, violations: [], score: 100, pass: true };

    const lines = code.split('\n');
    const violations: Violation[] = [];
    let interactiveCount = 0;
    const tagRegex = /<(button|a|input|select|textarea)\b([^>]*)>/gi;

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      let match;

      while ((match = tagRegex.exec(line)) !== null) {
        interactiveCount++;
        const tag = match[1];
        const attrs = match[2];

        const classMatch = attrs.match(/className=["']([^"']+)["']/i) || attrs.match(/class=["']([^"']+)["']/i);
        const classStr = classMatch ? classMatch[1] : '';

        const hasSafe = /\b(min-w-1[12]|min-h-1[12]|h-1[12]|w-1[12]|size-1[12]|p-[3-6])\b/.test(classStr);
        let isBad = false;
        const reasons: string[] = [];

        if (!hasSafe) {
          if (/\b(w-[1-6]|h-[1-6]|size-[1-6])\b/.test(classStr)) {
            isBad = true;
            reasons.push(isKo ? 'WCAG 2.2 2.5.8 위반 (24px 미만 초소형)' : 'WCAG 2.2 SC 2.5.8 (<24px)');
          } else if (strict && /\b(w-[7-9]|h-[7-9]|size-[7-9]|p-[01])\b/.test(classStr)) {
            isBad = true;
            reasons.push(isKo ? 'Material/Apple 기준 미달 (48px 미만)' : 'Below 48x48px target');
          }
        }

        if (isBad) {
          violations.push({
            line: lineIdx + 1,
            tag,
            classStr,
            reasons,
            autoFix: `min-h-12 min-w-12 p-3 inline-flex items-center justify-center ${classStr}`.trim(),
          });
        }
      }
    }

    const score = interactiveCount > 0
      ? Math.max(0, Math.round(((interactiveCount - violations.length) / interactiveCount) * 100))
      : 100;

    return {
      total: interactiveCount,
      violations,
      score,
      pass: violations.length === 0,
    };
  }, [code, strict, isKo]);

  const handleCopy = (fix: string, idx: number) => {
    navigator.clipboard.writeText(fix);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              <span className="flex items-center gap-1">
                <Smartphone className="h-3.5 w-3.5" />
                {isKo ? 'W3C WCAG 2.2 SC 2.5.8' : 'WCAG 2.2 Touch Target'}
              </span>
            </Badge>
            <Badge variant="secondary">Level AA</Badge>
          </div>
          <CardTitle>
            {isKo
              ? '모바일 웹 터치 타겟(48x48px) 접근성 감사기'
              : 'Mobile Web Touch Target Accessibility Auditor'}
          </CardTitle>
          <CardDescription>
            {isKo
              ? '모바일 버튼과 링크가 최소 터치 면적(24px 법정 요건 및 48px 권장 기준)을 준수하는지 검사하고 자동 수정 코드를 생성합니다.'
              : 'Audit touch targets for buttons and links against WCAG 2.2 SC 2.5.8 and Google Material 48x48px standards.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="code-input" className="text-sm font-medium">
                  {isKo ? 'JSX / HTML 컴포넌트 코드' : 'JSX / HTML Component Code'}
                </label>
                <Button
                  variant={strict ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStrict(!strict)}
                >
                  {strict
                    ? (isKo ? '엄격 모드 (Google 48px)' : 'Strict (48px)')
                    : (isKo ? '기본 모드 (WCAG 24px)' : 'Standard (24px)')}
                </Button>
              </div>
              <textarea
                id="code-input"
                className="w-full h-36 p-3 text-xs font-mono bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={isKo ? '검사할 JSX/HTML 코드를 입력하세요...' : 'Paste JSX/HTML code...'}
              />
            </div>

            {/* 감사 결과 카드 */}
            <div className="p-4 bg-muted/60 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{isKo ? '접근성 적합도 점수' : 'Compliance Score'}</span>
                </div>
                <Badge variant={result.pass ? 'default' : 'destructive'}>
                  {result.pass ? (isKo ? '적합 PASS' : 'PASS') : (isKo ? `위반 ${result.violations.length}건` : 'FAIL')}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 border rounded-lg bg-background space-y-1">
                  <span className="text-xs text-muted-foreground">{isKo ? '인터랙티브 요소' : 'Interactive Items'}</span>
                  <div className="text-xl font-bold">{result.total}개 검사</div>
                  <p className="text-xs text-muted-foreground">{isKo ? '버튼, 링크, 입력창 감지' : 'Buttons, links, inputs'}</p>
                </div>

                <div className="p-3 border rounded-lg bg-background space-y-1">
                  <span className="text-xs text-muted-foreground">{isKo ? '터치 점수' : 'Target Score'}</span>
                  <div className="text-xl font-bold text-primary">{result.score}/100점</div>
                  <p className="text-xs text-muted-foreground">{isKo ? '터치 적합도 비율' : 'Touch compliance'}</p>
                </div>

                <div className="p-3 border rounded-lg bg-background space-y-1">
                  <span className="text-xs text-muted-foreground">{isKo ? 'WCAG 2.2 판정' : 'WCAG 2.2 Verdict'}</span>
                  <div className="text-xl font-bold flex items-center gap-1">
                    {result.pass ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <AlertTriangle className="h-5 w-5 text-destructive" />}
                    <span>{result.pass ? 'Level AA' : 'Non-Compliant'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">SC 2.5.8 Target Size</p>
                </div>
              </div>

              {result.violations.length > 0 ? (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-semibold text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {isKo ? '터치 미스 위험 요소 및 자동 수정 제안' : 'Violations & Auto-fix Code'}
                  </span>
                  <div className="space-y-2">
                    {result.violations.map((v, idx) => (
                      <div key={idx} className="p-3 border rounded-lg bg-background text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-semibold text-foreground">
                            Line {v.line}: &lt;{v.tag}&gt;
                          </span>
                          <span className="text-destructive font-sans">{v.reasons.join(', ')}</span>
                        </div>
                        <div className="text-muted-foreground font-mono">
                          Current: class=&quot;{v.classStr}&quot;
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t">
                          <span className="font-mono text-primary font-medium">
                            Fix: {v.autoFix}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(v.autoFix, idx)}
                          >
                            {copiedIdx === idx ? <Check className="h-3 w-3 mr-1 text-primary" /> : <Copy className="h-3 w-3 mr-1" />}
                            {copiedIdx === idx ? (isKo ? '복사됨' : 'Copied') : (isKo ? '클래스 복사' : 'Copy')}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-background rounded-lg border text-xs text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    {isKo
                      ? '모든 인터랙티브 요소가 모바일 사용자가 손가락으로 누르기에 충분한 안전 터치 영역을 확보하고 있습니다.'
                      : 'All interactive elements meet the minimum touch target dimensions.'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AgentA11yTouchTargetGuard;
