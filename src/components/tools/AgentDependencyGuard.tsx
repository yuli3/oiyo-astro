import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertTriangle, Sparkles, Terminal, Copy, ShieldCheck, Box } from 'lucide-react';

interface HeavyModuleRule {
  name: string;
  sizeKb: number;
  category: string;
  risk: string;
  nativeReplacement: string;
  exampleCode: string;
}

const HEAVY_MODULE_RULES: Record<string, HeavyModuleRule> = {
  moment: {
    name: 'moment',
    sizeKb: 290,
    category: 'Date & Time',
    risk: 'High (Bundle Bloat & Immutable Mutation Issues)',
    nativeReplacement: 'Intl.DateTimeFormat 또는 Date.prototype',
    exampleCode: `// moment().format('YYYY-MM-DD HH:mm') 대체:
const formatted = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hour12: false
}).format(new Date());`,
  },
  'moment-timezone': {
    name: 'moment-timezone',
    sizeKb: 450,
    category: 'Date & Time',
    risk: 'High (Massive timezone data bundled)',
    nativeReplacement: 'Intl.DateTimeFormat(locale, { timeZone: "Asia/Seoul" })',
    exampleCode: `// moment.tz(date, 'Asia/Seoul') 대체:
const seoulTime = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  dateStyle: 'medium',
  timeStyle: 'medium'
}).format(new Date());`,
  },
  lodash: {
    name: 'lodash',
    sizeKb: 72,
    category: 'Utility',
    risk: 'Medium (Tree-shaking failure & Modern ES duplication)',
    nativeReplacement: 'Array.map/filter/flat, structuredClone, Object.assign',
    exampleCode: `// _.cloneDeep(obj) 대체:
const clone = structuredClone(originalObj);

// _.chunk(arr, 3) 대체:
const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, (i + 1) * size));`,
  },
  axios: {
    name: 'axios',
    sizeKb: 48,
    category: 'HTTP Client',
    risk: 'Medium (Unnecessary dependency in modern runtimes)',
    nativeReplacement: 'Global fetch() API',
    exampleCode: `// axios.post(url, data) 대체:
const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
const result = await res.json();`,
  },
  request: {
    name: 'request',
    sizeKb: 120,
    category: 'HTTP Client',
    risk: 'Critical (Deprecated & Abandoned since 2020)',
    nativeReplacement: 'Global fetch() API',
    exampleCode: `// request(url, callback) 대체:
const res = await fetch(url);
const data = await res.json();`,
  },
  'node-fetch': {
    name: 'node-fetch',
    sizeKb: 30,
    category: 'HTTP Client',
    risk: 'Low-Medium (Redundant since Node.js 18+)',
    nativeReplacement: 'Native globalThis.fetch',
    exampleCode: `// Node.js 18+ 환경에서는 별도 import 없이 바로 fetch() 호출 가능`,
  },
  uuid: {
    name: 'uuid',
    sizeKb: 12,
    category: 'ID Generation',
    risk: 'Low (Redundant dependency)',
    nativeReplacement: 'crypto.randomUUID()',
    exampleCode: `// uuid.v4() 대체:
const id = crypto.randomUUID();`,
  },
  chalk: {
    name: 'chalk',
    sizeKb: 24,
    category: 'CLI Styling',
    risk: 'Low (ESM-only friction & unnecessary for server)',
    nativeReplacement: 'node:util styleText (Node 20.12+) 또는 ANSI 코드',
    exampleCode: `// chalk.green('success') 대체 (Node 20.12+):
import { styleText } from 'node:util';
console.log(styleText('green', 'Success!'));`,
  },
  rimraf: {
    name: 'rimraf',
    sizeKb: 15,
    category: 'File System',
    risk: 'Low (Redundant since Node.js 14+)',
    nativeReplacement: 'fs.rmSync(path, { recursive: true, force: true })',
    exampleCode: `import fs from 'node:fs';
fs.rmSync(targetDir, { recursive: true, force: true });`,
  },
  mkdirp: {
    name: 'mkdirp',
    sizeKb: 10,
    category: 'File System',
    risk: 'Low (Redundant since Node.js 10+)',
    nativeReplacement: 'fs.mkdirSync(path, { recursive: true })',
    exampleCode: `import fs from 'node:fs';
fs.mkdirSync(targetDir, { recursive: true });`,
  },
  querystring: {
    name: 'querystring',
    sizeKb: 8,
    category: 'URL & Query',
    risk: 'Medium (Legacy Node.js API deprecated)',
    nativeReplacement: 'URLSearchParams',
    exampleCode: `// querystring.stringify(params) 대체:
const qs = new URLSearchParams({ key: 'value', page: '1' }).toString();`,
  },
};

const SAMPLE_LEGACY_PACKAGE = `{
  "name": "my-legacy-app",
  "version": "1.0.0",
  "dependencies": {
    "axios": "^1.6.0",
    "moment": "^2.30.1",
    "lodash": "^4.17.21",
    "uuid": "^9.0.0",
    "react": "^18.2.0"
  },
  "devDependencies": {
    "rimraf": "^5.0.0",
    "chalk": "^4.1.2"
  }
}`;

const SAMPLE_CLEAN_PACKAGE = `{
  "name": "modern-agent-stack",
  "version": "2.0.0",
  "dependencies": {
    "react": "^19.0.0"
  }
}`;

export default function AgentDependencyGuard() {
  const [jsonText, setJsonText] = useState<string>(SAMPLE_LEGACY_PACKAGE);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const auditResult = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonText);
      const allDeps = {
        ...(parsed.dependencies || {}),
        ...(parsed.devDependencies || {}),
      };

      const detected = [];
      let totalSavedKb = 0;

      for (const [depName, version] of Object.entries(allDeps)) {
        if (HEAVY_MODULE_RULES[depName]) {
          const rule = HEAVY_MODULE_RULES[depName];
          totalSavedKb += rule.sizeKb;
          detected.push({
            module: depName,
            installedVersion: version as string,
            isDev: Boolean(parsed.devDependencies && parsed.devDependencies[depName]),
            ...rule,
          });
        }
      }

      return {
        isValid: true,
        scannedTotal: Object.keys(allDeps).length,
        detectedCount: detected.length,
        totalSavedKb,
        detected,
      };
    } catch {
      return {
        isValid: false,
        scannedTotal: 0,
        detectedCount: 0,
        totalSavedKb: 0,
        detected: [],
      };
    }
  }, [jsonText]);

  const copyCode = (code: string, name: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(name);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-primary" />
            <CardTitle>AI 에이전트 패키지 번들 가드 & 네이티브 마이그레이터</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            package.json의 불필요하고 무거운 레거시 의존성(moment, lodash, axios, uuid 등)을 감지하고 모던 웹 표준 네이티브 코드로 교체합니다.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Presets */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground self-center">예시 템플릿:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setJsonText(SAMPLE_LEGACY_PACKAGE)}
              >
                레거시 웹 앱 (moment + lodash + axios + uuid)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setJsonText(SAMPLE_CLEAN_PACKAGE)}
              >
                클린 제로 디펜던시 앱
              </Button>
            </div>

            {/* Input textarea */}
            <div className="space-y-2">
              <Label htmlFor="pkgJson" className="text-xs font-semibold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-primary" />
                <span>package.json 내용을 붙여넣으세요:</span>
              </Label>
              <textarea
                id="pkgJson"
                rows={8}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className="w-full rounded-md border border-border bg-muted/20 p-3 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder='{ "dependencies": { "moment": "^2.30.1" } }'
              />
              {!auditResult.isValid && (
                <p className="text-xs text-destructive">유효한 JSON 형식이 아닙니다. 형식을 확인해 주세요.</p>
              )}
            </div>

            {/* Summary Metrics */}
            {auditResult.isValid && (
              <div className="p-6 border rounded-xl border-border bg-card space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    {auditResult.detectedCount === 0 ? (
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-primary" />
                    )}
                    <div>
                      <h3 className="font-bold text-lg">
                        {auditResult.detectedCount === 0
                          ? '🎉 무거운 레거시 의존성이 0개인 완벽한 패키지입니다!'
                          : `⚠️ 최적화 대상 모듈 ${auditResult.detectedCount}개 발견!`}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        전체 {auditResult.scannedTotal}개 의존성 중 {auditResult.detectedCount}개의 네이티브 교체 가능한 모듈이 감지되었습니다.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">예상 번들 절감 용량</span>
                    <p className="text-2xl font-black text-primary">
                      ~{auditResult.totalSavedKb} KB
                    </p>
                  </div>
                </div>

                {/* Detected list */}
                {auditResult.detected.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-border">
                    {auditResult.detected.map((item) => (
                      <div key={item.module} className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">📦 {item.module}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                              {item.installedVersion} ({item.isDev ? 'dev' : 'prod'})
                            </span>
                            <span className="text-xs font-semibold text-primary">
                              -{item.sizeKb} KB
                            </span>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                            대체: {item.nativeReplacement}
                          </span>
                        </div>

                        {/* Code snippet */}
                        <div className="relative rounded-md bg-muted/40 p-3 font-mono text-xs text-foreground border border-border">
                          <pre className="overflow-x-auto whitespace-pre-wrap">{item.exampleCode}</pre>
                          <div className="absolute top-2 right-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyCode(item.exampleCode, item.module)}
                            >
                              <Copy className="w-3.5 h-3.5 mr-1" />
                              {copiedSnippet === item.module ? '복사됨' : '코드 복사'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
