import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Globe, ShieldAlert, CheckCircle2, Copy, Check, Sparkles } from 'lucide-react';

const SAMPLE_CODE = `// AI 에이전트가 흔히 작성하는 취약한 CORS 설정
app.use(cors({
  origin: '*',
  credentials: true,
}));`;

export function AgentCorsHeaderGuard({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [code, setCode] = useState<string>(SAMPLE_CODE);
  const [framework, setFramework] = useState<'express' | 'hono' | 'nextjs'>('express');
  const [copied, setCopied] = useState<boolean>(false);

  const result = useMemo(() => {
    const vulns: { type: string; title: string; desc: string; severity: string }[] = [];

    if (/(origin\s*:\s*['"]\*['"]|'Access-Control-Allow-Origin'\s*:\s*['"]\*['"])[\s\S]*?(credentials\s*:\s*true|'Access-Control-Allow-Credentials'\s*:\s*['"]true['"])/i.test(code)) {
      vulns.push({
        type: 'WILD_CARD_WITH_CREDENTIALS',
        severity: 'CRITICAL',
        title: isKo ? '와일드카드(*)와 인증 정보(credentials: true) 동시 사용' : 'Wildcard (*) with credentials: true',
        desc: isKo
          ? '브라우저 보안 스펙상 차단되며 심각한 인증 세션 유출 취약점을 유발합니다.'
          : 'Blocked by W3C CORS spec and creates critical credential exposure vulnerability.',
      });
    }

    if (/(origin\s*:\s*(?:true|req\.headers\.origin|req\.header\(['"]origin['"]\)|c\.req\.header\(['"]origin['"]\)))/i.test(code)) {
      vulns.push({
        type: 'ORIGIN_REFLECTION',
        severity: 'CRITICAL',
        title: isKo ? 'Origin 헤더 무조건 반사 (Origin Reflection)' : 'Unrestricted Origin Reflection',
        desc: isKo
          ? '모든 요청의 Origin을 검증 없이 그대로 허용하여 CSRF 및 악의적 사이트의 데이터 탈취를 허용합니다.'
          : 'Reflecting all origin headers allows arbitrary websites to steal authenticated data.',
      });
    }

    const isSafe = vulns.length === 0;
    const score = isSafe ? 100 : Math.max(0, 100 - vulns.length * 40);

    let fixCode = '';
    if (framework === 'express') {
      fixCode = `// [Express 안전한 CORS 화이트리스트 패치]
import cors from 'cors';

const ALLOWED_ORIGINS = [
  'https://oiyo.net',
  'https://tools.oiyo.net',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS 차단: 허용되지 않은 출처입니다.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));`;
    } else if (framework === 'hono') {
      fixCode = `// [Hono 안전한 CORS 화이트리스트 패치]
import { cors } from 'hono/cors';

const ALLOWED_ORIGINS = ['https://oiyo.net', 'https://tools.oiyo.net'];

app.use('*', cors({
  origin: (origin) => (ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]),
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));`;
    } else {
      fixCode = `// [Next.js Route Handler 안전한 CORS 헤더]
const ALLOWED_ORIGINS = ['https://oiyo.net', 'https://tools.oiyo.net'];

export function getCorsHeaders(request: Request) {
  const origin = request.headers.get('origin');
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}`;
    }

    return {
      isSafe,
      score,
      vulns,
      fixCode,
    };
  }, [code, framework, isKo]);

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
          <Globe className="h-3.5 w-3.5" />
          <span>{isKo ? 'API 보안 감사' : 'API Security Audit'}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {isKo ? 'AI 에이전트 CORS 헤더 취약점 검사 & 화이트리스트 변환기' : 'AI Agent CORS Header Guard & Whitelist Generator'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isKo
            ? '와일드카드(*)와 credentials 모순, 위험한 Origin 반사 취약점을 0.1ms 만에 감지하고 안전한 화이트리스트 코드를 생성합니다.'
            : 'Detect dangerous CORS misconfigurations and generate hardened origin whitelisting code for Express, Hono, and Next.js.'}
        </p>
      </div>

      {/* 프레임워크 선택 바 */}
      <div className="flex gap-2">
        <Button
          variant={framework === 'express' ? 'default' : 'outline'}
          onClick={() => setFramework('express')}
        >
          Express.js
        </Button>
        <Button
          variant={framework === 'hono' ? 'default' : 'outline'}
          onClick={() => setFramework('hono')}
        >
          Hono.dev
        </Button>
        <Button
          variant={framework === 'nextjs' ? 'default' : 'outline'}
          onClick={() => setFramework('nextjs')}
        >
          Next.js Route
        </Button>
      </div>

      {/* 에디터 그리드: 원본 코드 vs 보안 패치 코드 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{isKo ? '검사할 CORS 설정 코드' : 'Source CORS Code'}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCode(SAMPLE_CODE)}
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                <span>{isKo ? '샘플 불러오기' : 'Sample'}</span>
              </Button>
            </div>
            <CardDescription>
              {isKo ? 'AI가 작성한 Express, Hono, Next.js CORS 코드를 붙여넣으세요.' : 'Paste API CORS configuration snippet.'}
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
              <CardTitle>{isKo ? '보안 화이트리스트 패치' : 'Hardened Whitelist Patch'}</CardTitle>
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
              {isKo ? '도메인 화이트리스트 기반의 프로덕션 보안 코드입니다.' : 'Production-ready origin whitelisting.'}
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
                <span className="text-xs text-muted-foreground">{isKo ? 'CORS 보안 등급' : 'Security Status'}</span>
                {result.isSafe ? (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                ) : (
                  <ShieldAlert className="h-4 w-4 text-destructive" />
                )}
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {result.isSafe ? (isKo ? '안전 (Safe)' : 'Safe') : (isKo ? '취약점 발견' : 'Vulnerable')}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">보안 스펙 준수 상태</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '보안 적합도 점수' : 'Compliance Score'}</span>
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
                <span className="text-xs text-muted-foreground">{isKo ? '감지된 결함' : 'Vulnerabilities'}</span>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{result.vulns.length}건</p>
              <p className="mt-1 text-xs text-muted-foreground">스펙 모순 및 유출 결함</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 취약점 상세 내역 */}
      {result.vulns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{isKo ? '감지된 CORS 보안 결함 상세' : 'Vulnerability Breakdown'}</CardTitle>
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
