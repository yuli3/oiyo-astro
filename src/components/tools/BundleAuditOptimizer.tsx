import { useState, useMemo } from 'react';

interface AuditItem {
  pkg: string;
  category: string;
  rawKb: number;
  gzipKb: number;
  replacement: string;
  reason: string;
  sampleCode: string;
}

const REPLACEMENT_DATABASE: Record<string, Omit<AuditItem, 'pkg'>> = {
  moment: {
    rawKb: 290,
    gzipKb: 70,
    category: 'Date & Time',
    replacement: 'Intl.DateTimeFormat or date-fns / dayjs',
    reason: 'Zero tree-shaking support; bundles entire locale and timezone tables.',
    sampleCode: `// Native Intl.DateTimeFormat (0 KB)
const formatted = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date());`,
  },
  lodash: {
    rawKb: 72,
    gzipKb: 25,
    category: 'Utilities',
    replacement: 'ES2024 Native methods (structuredClone, Object.groupBy)',
    reason: 'CommonJS imports drag heavy dead code into client bundles.',
    sampleCode: `// Native deep clone (0 KB)
const clone = structuredClone(source);

// Native grouping (0 KB)
const grouped = Object.groupBy(items, i => i.type);`,
  },
  axios: {
    rawKb: 35,
    gzipKb: 12,
    category: 'HTTP Client',
    replacement: 'Native fetch + AbortSignal.timeout()',
    reason: 'Native fetch is built into modern browsers and Node 18+ with zero footprint.',
    sampleCode: `// Native Fetch with timeout (0 KB)
const res = await fetch(url, {
  signal: AbortSignal.timeout(5000),
  headers: { 'Content-Type': 'application/json' },
});
const data = await res.json();`,
  },
  uuid: {
    rawKb: 12,
    gzipKb: 4,
    category: 'ID Generator',
    replacement: 'crypto.randomUUID()',
    reason: 'Web Crypto API standard randomUUID() is natively available everywhere.',
    sampleCode: `// Native UUID v4 (0 KB)
const id = crypto.randomUUID();`,
  },
  'crypto-js': {
    rawKb: 48,
    gzipKb: 15,
    category: 'Cryptography',
    replacement: 'Web Crypto API (crypto.subtle) / node:crypto',
    reason: 'SubtleCrypto is 10x faster and requires 0 KB external bundle size.',
    sampleCode: `// Native SHA-256 (0 KB)
const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('text'));
const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');`,
  },
  'node-fetch': {
    rawKb: 25,
    gzipKb: 8,
    category: 'HTTP Client',
    replacement: 'Global fetch',
    reason: 'Redundant dependency since Node.js 18 natively provides global fetch.',
    sampleCode: `// Use built-in fetch directly (0 KB)
const res = await fetch('https://api.example.com');`,
  },
  rimraf: {
    rawKb: 15,
    gzipKb: 5,
    category: 'Filesystem',
    replacement: 'fs.rmSync(path, { recursive: true, force: true })',
    reason: 'Node.js 14.14+ natively supports recursive deletion in fs module.',
    sampleCode: `// Native fs deletion (0 KB)
import fs from 'node:fs';
fs.rmSync(dir, { recursive: true, force: true });`,
  },
  querystring: {
    rawKb: 8,
    gzipKb: 3,
    category: 'URL Parsing',
    replacement: 'URLSearchParams',
    reason: 'Native URLSearchParams is standard across browsers and Node runtimes.',
    sampleCode: `// Native URL params (0 KB)
const qs = new URLSearchParams({ page: '1', sort: 'desc' }).toString();`,
  },
};

const DEFAULT_INPUT = `{
  "dependencies": {
    "react": "^18.3.1",
    "moment": "^2.30.1",
    "lodash": "^4.17.21",
    "axios": "^1.7.2",
    "uuid": "^9.0.1"
  }
}`;

export default function BundleAuditOptimizer({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [inputText, setInputText] = useState<string>(DEFAULT_INPUT);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const auditResult = useMemo(() => {
    let packageNames: string[] = [];

    // JSON 파싱 시도
    try {
      const parsed = JSON.parse(inputText);
      const deps = Object.keys(parsed.dependencies || {});
      const devDeps = Object.keys(parsed.devDependencies || {});
      packageNames = Array.from(new Set([...deps, ...devDeps]));
    } catch {
      // 텍스트/목록 파싱
      packageNames = inputText
        .split(/[\n,]+/)
        .map((p) => p.replace(/["':^{}]/g, '').trim())
        .filter(Boolean);
    }

    const findings: AuditItem[] = [];
    let totalRawKb = 0;
    let totalGzipKb = 0;

    for (const name of packageNames) {
      const lower = name.toLowerCase();
      if (REPLACEMENT_DATABASE[lower]) {
        const item = REPLACEMENT_DATABASE[lower];
        findings.push({
          pkg: name,
          ...item,
        });
        totalRawKb += item.rawKb;
        totalGzipKb += item.gzipKb;
      }
    }

    const estimatedTokenSavings = findings.length * 850;

    return {
      scannedCount: packageNames.length,
      findings,
      totalRawKb,
      totalGzipKb,
      estimatedTokenSavings,
    };
  }, [inputText]);

  const handleCopy = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {isKo ? 'package.json 또는 의존성 목록 입력' : 'Paste package.json or Dependencies'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isKo
                ? 'package.json 내용 전체 또는 moment, lodash 등의 패키지 이름을 붙여넣으세요.'
                : 'Paste JSON content or comma/newline separated package names.'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setInputText(DEFAULT_INPUT)}
              className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
            >
              {isKo ? '기본 예시 불러오기' : 'Load Sample'}
            </button>
            <button
              onClick={() => setInputText('moment, lodash, axios, uuid, crypto-js, node-fetch, rimraf')}
              className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
            >
              {isKo ? '고용량 7종 풀세트' : 'Heavy 7 Sample'}
            </button>
          </div>
        </div>

        <textarea
          rows={6}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isKo ? '{\n  "dependencies": {\n    "moment": "^2.30.1"\n  }\n}' : 'Paste dependencies here...'}
          className="w-full rounded-lg border border-border bg-background p-3 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Result Card */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 md:p-8 space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
          <div>
            <span className="inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
              {auditResult.findings.length} / {auditResult.scannedCount} {isKo ? '개 고용량 의존성 감지' : 'Heavy Packages Detected'}
            </span>
            <h3 className="mt-2 text-2xl font-bold text-foreground">
              {isKo ? '네이티브 대체 시 번들 절감 효과' : 'Estimated Bundle Size Reduction'}
            </h3>
          </div>
          <div className="text-left md:text-right">
            <div className="text-3xl font-extrabold text-primary">
              -{auditResult.totalGzipKb} KB (gzip)
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              -{auditResult.totalRawKb} KB uncompressed raw
            </div>
          </div>
        </div>

        {/* 3 Metrics */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? '웹 번들 크기 절감' : 'Bundle Savings'}</div>
            <div className="text-lg font-semibold text-primary mt-1">
              -{auditResult.totalGzipKb} KB
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {isKo ? '초기 로딩 LCP 대폭 단축' : 'Faster Initial Page Load'}
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? 'AI 에이전트 토큰 절약' : 'LLM Token Savings'}</div>
            <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              ~{auditResult.estimatedTokenSavings.toLocaleString()} {isKo ? '토큰' : 'Tokens'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {isKo ? '에이전트 컨텍스트 비용 절감' : 'Reduced context bloat'}
            </div>
          </div>

          <div className="rounded-lg bg-card p-4 border border-border">
            <div className="text-xs text-muted-foreground">{isKo ? '보안 취약점 & 종속성' : 'Security & Maintenance'}</div>
            <div className="text-lg font-semibold text-foreground mt-1">
              {auditResult.findings.length}{isKo ? '개 제로 디펜던시 전환' : ' Replaced with 0-Dep'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {isKo ? '공급망 공격 노출 제거' : 'Zero supply chain risks'}
            </div>
          </div>
        </div>

        {/* Actionable Findings Breakdown */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground">
            {isKo ? '발견된 패키지별 네이티브 대체 코드' : 'Modern Zero-Dependency Drop-in Replacements'}
          </h4>

          {auditResult.findings.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              {isKo ? '🎉 감지된 무거운 레거시 패키지가 없습니다. 깔끔한 의존성 구조입니다!' : '🎉 No heavy legacy packages detected. Clean dependencies!'}
            </div>
          ) : (
            <div className="space-y-4">
              {auditResult.findings.map((f, idx) => (
                <div key={f.pkg} className="rounded-lg border border-border bg-card p-4 space-y-3">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-foreground">{f.pkg}</span>
                      <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">{f.category}</span>
                      <span className="text-xs font-semibold text-primary">-{f.gzipKb} KB (gzip)</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <strong className="text-foreground">{isKo ? '권장: ' : 'Use: '}</strong>{f.replacement}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {f.reason}
                  </p>

                  <div className="relative">
                    <pre className="overflow-x-auto rounded-lg bg-muted/50 p-3 font-mono text-xs text-foreground">
                      <code>{f.sampleCode}</code>
                    </pre>
                    <button
                      onClick={() => handleCopy(f.sampleCode, idx)}
                      className="absolute right-2 top-2 rounded bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm hover:bg-background border border-border"
                    >
                      {copiedIndex === idx ? (isKo ? '✓ 복사됨' : '✓ Copied') : (isKo ? '코드 복사' : 'Copy Code')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
