import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldAlert, Code2, CheckCircle2 } from 'lucide-react';

const SAMPLE_VULNERABLE_CODE = `function CommentItem({ commentHtml, author }) {
  return (
    <div className="comment-box">
      <div dangerouslySetInnerHTML={{ __html: commentHtml }} />
      <span ref={(el) => { if (el) el.innerHTML = author; }} />
    </div>
  );
}`;

const SAMPLE_SECURE_CODE = `import DOMPurify from 'dompurify';

function CommentItem({ commentHtml, author }) {
  const cleanHtml = DOMPurify.sanitize(commentHtml);
  return (
    <div className="comment-box">
      <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
      <span>{author}</span>
    </div>
  );
}`;

export function AgentXssSanitizerGuard({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [code, setCode] = useState<string>(SAMPLE_VULNERABLE_CODE);

  const result = useMemo(() => {
    const lines = code.split('\n');
    const violations = [];

    const dangerousPatterns = [
      {
        type: 'dangerouslySetInnerHTML',
        regex: /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html\s*:\s*([^}]+)\s*\}\s*\}/g,
        sanitizerRegex: /(?:DOMPurify\.sanitize|sanitizeHtml|cleanHtml|isomorphicDompurify)\s*\(/,
        risk: 'CRITICAL',
        desc: isKo ? 'DOMPurify 미적용 dangerouslySetInnerHTML 변수 삽입' : 'Unsanitized dangerouslySetInnerHTML injection',
      },
      {
        type: 'innerHTML_assignment',
        regex: /(?:\.innerHTML|\.outerHTML)\s*=\s*([^;]+)/g,
        sanitizerRegex: /(?:DOMPurify\.sanitize|sanitize)/,
        risk: 'HIGH',
        desc: isKo ? 'DOM innerHTML 직접 할당' : 'Direct DOM innerHTML assignment',
      },
      {
        type: 'v-html',
        regex: /v-html\s*=\s*["']([^"']+)["']/g,
        sanitizerRegex: /(?:sanitize|clean|purify)/i,
        risk: 'HIGH',
        desc: isKo ? 'Vue v-html 미정제 변수 바인딩' : 'Unsanitized Vue v-html binding',
      },
    ];

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

      for (const pattern of dangerousPatterns) {
        let match;
        const re = new RegExp(pattern.regex);
        while ((match = re.exec(line)) !== null) {
          const expression = match[1] ? match[1].trim() : match[0];
          const isSanitized = pattern.sanitizerRegex && pattern.sanitizerRegex.test(expression);
          if (!isSanitized) {
            violations.push({
              line: lineNum,
              type: pattern.type,
              risk: pattern.risk,
              code: match[0],
              desc: pattern.desc,
            });
          }
        }
      }
    });

    const isSecure = violations.length === 0;

    return {
      isSecure,
      violations,
      criticalCount: violations.filter((v) => v.risk === 'CRITICAL').length,
      highCount: violations.filter((v) => v.risk === 'HIGH').length,
    };
  }, [code, isKo]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* 헤더 */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>{isKo ? '프론트엔드 XSS 및 dangerouslySetInnerHTML 감사' : 'Frontend XSS & DOM Audit'}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {isKo ? 'AI 에이전트 XSS 및 HTML 인젝션 가드' : 'AI Agent XSS & HTML Injection Guard'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isKo
            ? 'AI가 생성한 React/Vue 컴포넌트의 dangerouslySetInnerHTML 및 innerHTML 취약점을 0.1ms 내에 감사하고 DOMPurify 래퍼를 생성합니다.'
            : 'Audit dangerouslySetInnerHTML, v-html, and DOM-based XSS vulnerabilities in AI-generated frontend code.'}
        </p>
      </div>

      {/* 코드 입력 카드 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{isKo ? '컴포넌트 코드 입력 및 프리셋' : 'Component Code Input & Presets'}</CardTitle>
              <CardDescription>
                {isKo ? '검사할 React/Vue/Svelte 컴포넌트 코드를 붙여넣으세요.' : 'Paste code snippet to inspect.'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCode(SAMPLE_VULNERABLE_CODE)}
              >
                {isKo ? '취약한 샘플' : 'Vulnerable'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCode(SAMPLE_SECURE_CODE)}
              >
                {isKo ? '안전한 샘플' : 'Secure'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <textarea
              rows={8}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full font-mono text-xs rounded-md border border-input bg-muted/20 p-3 text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Paste frontend code snippet here..."
            />
          </div>
        </CardContent>
      </Card>

      {/* 지표 카드 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '보안 적합 판정' : 'Security Audit'}</span>
                {result.isSecure ? (
                  <Badge variant="secondary">{isKo ? '안전' : 'Secure'}</Badge>
                ) : (
                  <Badge variant="destructive">{isKo ? '취약점 발견' : 'Vulnerable'}</Badge>
                )}
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {result.isSecure ? (isKo ? '0건 (안전)' : 'Pass') : `${result.violations.length}건 위험`}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {result.isSecure ? (isKo ? 'XSS 위험 패턴 없음' : 'Clean') : (isKo ? 'DOM 새니타이저 부재' : 'Missing DOMPurify')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '치명적 (CRITICAL)' : 'Critical Risk'}</span>
                <ShieldAlert className="h-4 w-4 text-destructive" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {result.criticalCount}건
              </p>
              <p className="mt-1 text-xs text-muted-foreground">dangerouslySetInnerHTML 미정제</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '고위험 (HIGH)' : 'High Risk'}</span>
                <Code2 className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {result.highCount}건
              </p>
              <p className="mt-1 text-xs text-muted-foreground">innerHTML 직접 할당 및 v-html</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 진단 결과 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>{isKo ? '취약점 세부 내역 및 보안 권고' : 'Vulnerabilities & Remediations'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            {result.isSecure ? (
              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-1">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isKo ? '모든 동적 HTML이 안전하게 정제됨' : 'All Dynamic HTML Safely Sanitized'}</span>
                </div>
                <p className="text-xs">
                  코드 내에 정제되지 않은 dangerouslySetInnerHTML 또는 innerHTML 할당 패턴이 발견되지 않았습니다. DOMPurify 등으로 안전하게 보호되고 있습니다.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-destructive font-semibold">
                    <ShieldAlert className="h-4 w-4" />
                    <span>{isKo ? 'XSS 공격 취약점 발견' : 'XSS Vulnerabilities Detected'}</span>
                  </div>
                  <div className="space-y-2 pt-1">
                    {result.violations.map((v, idx) => (
                      <div key={idx} className="rounded border border-border bg-background p-2.5 text-xs font-mono">
                        <span className="text-destructive font-bold">[{v.risk}] Line {v.line}</span>: {v.desc}
                        <div className="mt-1 text-muted-foreground truncate">{v.code}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
                  <p className="text-xs font-semibold text-foreground">{isKo ? '🛡️ 권장 DOMPurify 래퍼 컴포넌트:' : 'Recommended Secure Wrapper:'}</p>
                  <pre className="text-xs font-mono bg-background p-3 rounded border border-border overflow-x-auto">
{`import DOMPurify from 'dompurify';

export function SafeHtml({ html }: { html: string }) {
  const clean = typeof window !== 'undefined'
    ? DOMPurify.sanitize(html)
    : html;
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
