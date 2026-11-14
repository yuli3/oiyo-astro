import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KeyRound, ShieldAlert, CheckCircle2, Copy, Check, Sparkles } from 'lucide-react';

const SAMPLE_JWT_CODE = `// AI 에이전트가 흔히 작성하는 취약한 JWT 인증 코드
const token = jwt.sign({ userId: user.id }, 'secret');

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, 'secret');
  req.user = decoded;
  next();
}`;

export function AgentJwtSecurityGuard({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [code, setCode] = useState<string>(SAMPLE_JWT_CODE);
  const [copied, setCopied] = useState<boolean>(false);

  const result = useMemo(() => {
    const vulns: { type: string; title: string; desc: string; severity: string }[] = [];

    if (/jwt\.(?:sign|verify)\([^,]+,\s*['"](?:secret|jwt-secret|mysecret|test|123456|password)['"]/i.test(code)) {
      vulns.push({
        type: 'WEAK_SECRET',
        severity: 'CRITICAL',
        title: isKo ? '취약한 하드코딩 시크릿 키' : 'Hardcoded Weak Secret',
        desc: isKo
          ? '예측 가능한 "secret" 문자열이 코드에 노출되어 브루트포스 공격에 취약합니다.'
          : 'Predictable secret string vulnerable to instant brute-force recovery.',
      });
    }

    if (/jwt\.verify\([^)]+\)/.test(code) && !/algorithms\s*:\s*\[['"][A-Za-z0-9_-]+['"]\]/.test(code)) {
      vulns.push({
        type: 'ALG_NONE_BYPASS',
        severity: 'CRITICAL',
        title: isKo ? '알고리즘 미검증 (alg: none 우회 결함)' : 'Missing Algorithm Verification (alg: none risk)',
        desc: isKo
          ? 'algorithms 옵션이 누락되어 헤더 변조를 통한 서명 위조 공격에 노출됩니다.'
          : 'Failure to pin allowed algorithms enables signature bypass attacks.',
      });
    }

    if (/jwt\.sign\([^)]+\)/.test(code) && !/expiresIn|exp\s*:/.test(code)) {
      vulns.push({
        type: 'NO_EXPIRY',
        severity: 'HIGH',
        title: isKo ? '만료 시간(expiresIn) 누락 영구 토큰' : 'Missing Token Expiration (Perpetual Token)',
        desc: isKo
          ? '만료 시간이 지정되지 않아 토큰 탈취 시 영구적으로 계정이 도용될 수 있습니다.'
          : 'Tokens without expiration remain valid forever if intercepted.',
      });
    }

    const isSafe = vulns.length === 0;
    const score = isSafe ? 100 : Math.max(0, 100 - vulns.length * 35);

    const fixCode = `// [OIYO Lab 정격 보안 패치: 강력한 JWT 발급 및 서명 검증]
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || Buffer.byteLength(JWT_SECRET, 'utf8') < 32) {
  throw new Error('FATAL: JWT_SECRET 환경변수가 누락되었거나 32바이트 미만입니다.');
}

export function signAuthToken(payload: { userId: string; role?: string }) {
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '1h',
    issuer: 'https://oiyo.net',
  });
}

export function verifyAuthToken(token: string) {
  return jwt.verify(token, JWT_SECRET, {
    algorithms: ['HS256'], // alg: none 변조 방어
    issuer: 'https://oiyo.net',
  });
}`;

    return {
      isSafe,
      score,
      vulns,
      fixCode,
    };
  }, [code, isKo]);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.fixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* 헤더 */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
          <KeyRound className="h-3.5 w-3.5" />
          <span>{isKo ? 'JWT 보안 감사' : 'JWT Security Audit'}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {isKo ? 'AI 에이전트 JWT 인증 취약점 진단 & 보안 패치' : 'AI Agent JWT Security Guard & RFC 7519 Hardener'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isKo
            ? '하드코딩 시크릿, alg: none 서명 우회 결함, 만료 시간 누락을 0.1ms 만에 감지하고 표준 패치 코드를 생성합니다.'
            : 'Detect weak secrets, alg: none bypass risks, and missing expirations in AI-generated JWT code.'}
        </p>
      </div>

      {/* 에디터 그리드: 원본 코드 vs 보안 패치 코드 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{isKo ? '검사할 JWT 인증 코드' : 'Source JWT Code'}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCode(SAMPLE_JWT_CODE)}
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                <span>{isKo ? '샘플 불러오기' : 'Sample'}</span>
              </Button>
            </div>
            <CardDescription>
              {isKo ? 'AI가 작성한 jwt.sign 또는 verify 코드를 붙여넣으세요.' : 'Paste jwt.sign or jwt.verify snippet.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={14}
              className="w-full resize-none rounded-md border border-input bg-muted/20 p-3 font-mono text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{isKo ? 'RFC 7519 보안 패치' : 'Hardened RFC 7519 Patch'}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
              >
                {copied ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
                <span>{copied ? (isKo ? '복사됨' : 'Copied') : (isKo ? '패치 복사' : 'Copy')}</span>
              </Button>
            </div>
            <CardDescription>
              {isKo ? '알고리즘 고정 및 환경변수 기반 프로덕션 코드입니다.' : 'Production-ready JWT handler with pinned HS256.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <textarea
              readOnly
              value={result.fixCode}
              rows={14}
              className="w-full resize-none rounded-md border border-input bg-muted/40 p-3 font-mono text-xs leading-relaxed text-foreground focus-visible:outline-none"
            />
          </CardContent>
        </Card>
      </div>

      {/* 진단 지표 카드 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '보안 상태' : 'Security Status'}</span>
                {result.isSafe ? (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                ) : (
                  <ShieldAlert className="h-4 w-4 text-destructive" />
                )}
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {result.isSafe ? (isKo ? '안전 (Safe)' : 'Safe') : (isKo ? '취약점 발견' : 'Vulnerable')}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">서명 및 검증 신뢰도</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '보안 적합도 점수' : 'Security Score'}</span>
                <Badge variant={result.score >= 80 ? 'secondary' : 'destructive'}>
                  {result.score >= 80 ? 'Pass' : 'Fail'}
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
                <span className="text-xs text-muted-foreground">{isKo ? '발견된 취약점' : 'Vulnerabilities'}</span>
                <KeyRound className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{result.vulns.length}건</p>
              <p className="mt-1 text-xs text-muted-foreground">키/알고리즘/만료 결함</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 취약점 상세 내역 */}
      {result.vulns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{isKo ? '감지된 JWT 보안 결함 상세' : 'Vulnerability Breakdown'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border rounded-lg border border-border">
              {result.vulns.map((v, idx) => (
                <li key={idx} className="p-3 text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">{v.severity}</Badge>
                    <span className="font-semibold text-foreground">{v.title}</span>
                  </div>
                  <p className="text-muted-foreground">{v.desc}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
