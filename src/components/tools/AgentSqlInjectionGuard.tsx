import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Sparkles, AlertTriangle, Database, Copy, Check } from 'lucide-react';

const SAMPLE_SQL = `// AI 에이전트가 흔히 작성하는 취약한 SQL 코드 예시
const user = await db.query(\`SELECT * FROM users WHERE email = '\${userEmail}'\`);
const posts = await pool.query("SELECT * FROM posts WHERE title LIKE '%" + searchKeyword + "%'");
const item = await prisma.$queryRawUnsafe(\`SELECT * FROM inventory WHERE id = \${id}\`);`;

interface Vuln {
  line: number;
  snippet: string;
  type: string;
  desc: string;
}

export function AgentSqlInjectionGuard({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [code, setCode] = useState<string>(SAMPLE_SQL);
  const [dialect, setDialect] = useState<'postgres' | 'mysql'>('postgres');
  const [copied, setCopied] = useState<boolean>(false);

  const result = useMemo(() => {
    if (!code) return { safe: true, vulns: [], autoFix: '', score: 100 };

    const lines = code.split('\n');
    const vulns: Vuln[] = [];

    lines.forEach((line, idx) => {
      if (/(SELECT|INSERT|UPDATE|DELETE|DROP|FROM|WHERE)\b[^`"']*`[^`]*\$\{([^}]+)\}[^`]*`/i.test(line)) {
        vulns.push({
          line: idx + 1,
          snippet: line.trim(),
          type: 'TEMPLATE_INTERPOLATION',
          desc: isKo ? 'SQL 문자열 내 템플릿 변수(${...}) 직접 결합' : 'Template literal interpolation in raw SQL',
        });
      } else if (/(SELECT|INSERT|UPDATE|DELETE|WHERE)\b[^"']*["']\s*\+\s*([a-zA-Z0-9_$.]+)/i.test(line)) {
        vulns.push({
          line: idx + 1,
          snippet: line.trim(),
          type: 'STRING_CONCAT',
          desc: isKo ? '문자열 연결 연산자(+)를 통한 동적 쿼리' : 'String concatenation dynamic query',
        });
      } else if (/\$queryRawUnsafe\(/.test(line)) {
        vulns.push({
          line: idx + 1,
          snippet: line.trim(),
          type: 'UNSAFE_METHOD',
          desc: isKo ? 'Prisma 안전하지 않은 $queryRawUnsafe 호출' : 'Prisma $queryRawUnsafe usage',
        });
      }
    });

    const isSafe = vulns.length === 0;

    let fix = code;
    if (!isSafe) {
      let counter = 1;
      const paramsList: string[] = [];
      fix = code.replace(/`([^`]*)\$\{([^}]+)\}([^`]*)`/g, (_, before, varName, after) => {
        paramsList.push(varName.trim());
        const ph = dialect === 'postgres' ? `$${counter++}` : '?';
        return `\`${before}${ph}${after}\`, [${paramsList.join(', ')}]`;
      });
    }

    return {
      safe: isSafe,
      vulns,
      autoFix: fix,
      score: isSafe ? 100 : Math.max(0, 100 - vulns.length * 30),
    };
  }, [code, dialect, isKo]);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.autoFix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              <span className="flex items-center gap-1">
                <Database className="h-3.5 w-3.5" />
                {isKo ? 'OWASP Top 10 A03:2021 Injection' : 'OWASP A03 SQL Injection'}
              </span>
            </Badge>
            <Badge variant="secondary">Zero-Dependency</Badge>
          </div>
          <CardTitle>
            {isKo
              ? 'AI 에이전트 생성 SQL 인젝션 취약점 검사 & 매개변수화 변환기'
              : 'AI Agent SQL Injection Auditor & Parameterized Converter'}
          </CardTitle>
          <CardDescription>
            {isKo
              ? 'AI 코딩 에이전트가 작성한 백엔드 코드의 원시 SQL 템플릿 결합 취약점을 실시간 검사하고 Prepared Statement로 안전하게 변환합니다.'
              : 'Detect raw SQL string interpolation in AI-generated code and convert to parameterized queries.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="sql-code-input" className="text-sm font-medium">
                  {isKo ? '검사할 SQL / DB 쿼리 코드 스니펫' : 'SQL / DB Query Snippet'}
                </label>
                <div className="flex gap-1.5">
                  <Button
                    variant={dialect === 'postgres' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDialect('postgres')}
                  >
                    PostgreSQL ($1, $2)
                  </Button>
                  <Button
                    variant={dialect === 'mysql' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDialect('mysql')}
                  >
                    MySQL (?)
                  </Button>
                </div>
              </div>
              <textarea
                id="sql-code-input"
                className="w-full h-36 p-3 text-xs font-mono bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={isKo ? '검사할 데이터베이스 쿼리 코드를 입력하세요...' : 'Paste DB query code...'}
              />
            </div>

            {/* 감사 결과 카드 */}
            <div className="p-4 bg-muted/60 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="font-semibold">{isKo ? '보안 감사 점수 및 판정' : 'Security Score'}</span>
                </div>
                <Badge variant={result.safe ? 'default' : 'destructive'}>
                  {result.safe ? (isKo ? '보안 안전 (SECURE ✅)' : 'SECURE') : (isKo ? `취약점 ${result.vulns.length}건 감지 🚨` : 'VULNERABLE')}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-background space-y-2">
                  <span className="text-xs text-muted-foreground">{isKo ? '보안 건전성 점수' : 'Security Health Score'}</span>
                  <div className="text-2xl font-bold tracking-tight text-primary">
                    {result.score} / 100점
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {result.safe
                      ? (isKo ? '모든 쿼리가 안전하게 바인딩되어 있습니다.' : 'All queries are properly parameterized.')
                      : (isKo ? 'SQL 인젝션 악용 시 데이터 탈취 위험이 있습니다.' : 'High risk of SQL injection attack.')}
                  </p>
                </div>

                <div className="p-4 border rounded-lg bg-background space-y-2">
                  <span className="text-xs text-muted-foreground">{isKo ? '적용된 방어 메커니즘' : 'Defensive Target'}</span>
                  <div className="text-2xl font-bold tracking-tight">
                    {dialect === 'postgres' ? 'Prepared Statement ($N)' : 'Prepared Statement (?)'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isKo ? 'DB 엔진에 매개변수를 분리 전달하여 쿼리 변조 방지' : 'Strict separation of code and data.'}
                  </p>
                </div>
              </div>

              {result.vulns.length > 0 ? (
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-semibold text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {isKo ? '감지된 취약점 상세' : 'Detected Vulnerabilities'}
                  </span>
                  <div className="space-y-2">
                    {result.vulns.map((v, idx) => (
                      <div key={idx} className="p-3 border rounded-lg bg-background text-xs space-y-1">
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-semibold text-foreground">Line {v.line}: {v.type}</span>
                          <span className="text-destructive font-sans">{v.desc}</span>
                        </div>
                        <code className="block p-1.5 bg-muted rounded font-mono text-muted-foreground break-all">
                          {v.snippet}
                        </code>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">
                        {isKo ? `안전한 매개변수화 자동 변환 코드 (${dialect})` : 'Auto-fixed Code'}
                      </span>
                      <Button variant="outline" size="sm" onClick={handleCopy}>
                        {copied ? <Check className="h-3.5 w-3.5 mr-1 text-primary" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                        {copied ? (isKo ? '복사 완료!' : 'Copied!') : (isKo ? '코드 복사' : 'Copy')}
                      </Button>
                    </div>
                    <pre className="p-3 text-xs font-mono bg-background border rounded-lg whitespace-pre-wrap leading-relaxed text-muted-foreground">
                      {result.autoFix}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-background rounded-lg border text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    {isKo
                      ? '검사된 모든 데이터베이스 쿼리가 안전하게 분리되어 있어 SQL Injection 공격으로부터 안전합니다.'
                      : 'All queries are safe from SQL injection attacks.'}
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

export default AgentSqlInjectionGuard;
