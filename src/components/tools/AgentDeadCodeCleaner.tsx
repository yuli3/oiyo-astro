import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Trash2, Copy, Check, Terminal, FileCode2, Zap } from 'lucide-react';

const SAMPLE_CODE = `import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Button, Input, Modal, Badge } from '@/components/ui';
import axios from 'axios';

export function UserDashboard({ userId }: { userId: string }) {
  const [data, setData] = useState<{ id: string; name: string } | null>(null);

  console.log('[DEBUG] Component mounted with userId:', userId);
  debugger;

  useEffect(() => {
    console.debug('Fetching user profile...');
    setData({ id: userId, name: 'Alice' });
  }, [userId]);

  return (
    <Card>
      <h2>사용자 대시보드</h2>
      <Button onClick={() => console.log('Action triggered')}>새로고침</Button>
    </Card>
  );
}`;

interface RemovedItem {
  type: 'UNUSED_IMPORT' | 'CONSOLE_LOG' | 'DEBUGGER';
  description: string;
}

export function AgentDeadCodeCleaner({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [code, setCode] = useState<string>(SAMPLE_CODE);
  const [removeConsole, setRemoveConsole] = useState<boolean>(true);
  const [removeDebugger, setRemoveDebugger] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const cleanResult = useMemo(() => {
    if (!code) {
      return {
        cleanedCode: '',
        removedItems: [],
        stats: {
          imports: 0,
          consoles: 0,
          debuggers: 0,
          bytesSaved: 0,
          tokensSaved: 0,
          linesSaved: 0,
        },
      };
    }

    const originalLength = new TextEncoder().encode(code).length;
    const originalLineCount = code.split('\n').length;
    const removedItems: RemovedItem[] = [];

    let processed = code;

    // 1. Debugger 제거
    if (removeDebugger) {
      const debuggerRegex = /^\s*debugger;\s*$\n?/gm;
      const matches = processed.match(debuggerRegex);
      if (matches) {
        matches.forEach(() => {
          removedItems.push({
            type: 'DEBUGGER',
            description: isKo ? '개발용 debugger; 구문 제거' : 'Removed debugger; statement',
          });
        });
        processed = processed.replace(debuggerRegex, '');
      }
    }

    // 2. Console 제거
    if (removeConsole) {
      const consoleRegex = /^\s*console\.(log|debug|info|dir|trace|time|timeEnd)\([^;]*\);?\s*$\n?/gm;
      const matches = processed.match(consoleRegex);
      if (matches) {
        matches.forEach((line) => {
          removedItems.push({
            type: 'CONSOLE_LOG',
            description: `${isKo ? '디버깅 로그 구문 제거' : 'Removed console log'}: ${line.trim()}`,
          });
        });
        processed = processed.replace(consoleRegex, '');
      }
    }

    // 3. Unused Imports 분석
    const importLines = processed.split('\n');
    const newLines: string[] = [];

    for (let i = 0; i < importLines.length; i++) {
      const line = importLines[i];
      const importMatch = line.match(/^\s*import\s+(?:(\w+)\s*,?\s*)?(?:\{([^}]+)\})?\s*(?:\*\s+as\s+(\w+)\s*)?from\s*['"]([^'"]+)['"];?\s*$/);

      if (!importMatch) {
        newLines.push(line);
        continue;
      }

      const defaultImport = importMatch[1] ? importMatch[1].trim() : null;
      const namedImportsRaw = importMatch[2] ? importMatch[2].split(',').map((s) => s.trim()).filter(Boolean) : [];
      const namespaceImport = importMatch[3] ? importMatch[3].trim() : null;
      const modulePath = importMatch[4];

      const codeExceptCurrentLine = processed.replace(line, '');

      const checkUsage = (ident: string) => {
        const actualName = ident.includes(' as ') ? ident.split(/\s+as\s+/)[1].trim() : ident;
        const regex = new RegExp(`\\b${actualName}\\b`, 'g');
        const count = (codeExceptCurrentLine.match(regex) || []).length;
        return count > 0;
      };

      let keptDefault = defaultImport;
      if (defaultImport && !checkUsage(defaultImport)) {
        keptDefault = null;
        removedItems.push({
          type: 'UNUSED_IMPORT',
          description: `${isKo ? '미사용 기본 임포트' : 'Unused default import'} '${defaultImport}' (${modulePath})`,
        });
      }

      let keptNamespace = namespaceImport;
      if (namespaceImport && !checkUsage(namespaceImport)) {
        keptNamespace = null;
        removedItems.push({
          type: 'UNUSED_IMPORT',
          description: `${isKo ? '미사용 네임스페이스 임포트' : 'Unused namespace import'} '* as ${namespaceImport}'`,
        });
      }

      const keptNamed: string[] = [];
      for (const named of namedImportsRaw) {
        if (checkUsage(named)) {
          keptNamed.push(named);
        } else {
          const cleanName = named.includes(' as ') ? named.split(/\s+as\s+/)[0].trim() : named;
          removedItems.push({
            type: 'UNUSED_IMPORT',
            description: `${isKo ? '미사용 명명 임포트' : 'Unused named import'} '${cleanName}' (${modulePath})`,
          });
        }
      }

      const parts: string[] = [];
      if (keptDefault) parts.push(keptDefault);
      if (keptNamed.length > 0) parts.push(`{ ${keptNamed.join(', ')} }`);
      if (keptNamespace) parts.push(`* as ${keptNamespace}`);

      if (parts.length > 0) {
        newLines.push(`import ${parts.join(', ')} from '${modulePath}';`);
      } else {
        // All unused in this statement -> pruned
      }
    }

    processed = newLines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';

    const cleanedLength = new TextEncoder().encode(processed).length;
    const cleanedLineCount = processed.split('\n').length;
    const bytesSaved = Math.max(0, originalLength - cleanedLength);
    const linesSaved = Math.max(0, originalLineCount - cleanedLineCount);

    return {
      cleanedCode: processed,
      removedItems,
      stats: {
        imports: removedItems.filter((x) => x.type === 'UNUSED_IMPORT').length,
        consoles: removedItems.filter((x) => x.type === 'CONSOLE_LOG').length,
        debuggers: removedItems.filter((x) => x.type === 'DEBUGGER').length,
        bytesSaved,
        tokensSaved: Math.round(bytesSaved / 4),
        linesSaved,
      },
    };
  }, [code, removeConsole, removeDebugger, isKo]);

  const handleCopy = () => {
    if (!cleanResult.cleanedCode) return;
    navigator.clipboard.writeText(cleanResult.cleanedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* 타이틀 및 헤더 */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Trash2 className="h-3.5 w-3.5" />
          <span>{isKo ? 'AI 에이전트 코드 정격화' : 'AI Agent Code Sanitizer'}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {isKo ? 'AI 에이전트 미사용 코드 정리기' : 'AI Agent Dead Code Cleaner'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isKo
            ? 'AI가 생성한 코드에서 미사용 import, 임시 디버깅 console.log, debugger 구문을 0.1ms 만에 감지하고 제거합니다.'
            : 'Instantly prune unused imports, console.log artifacts, and debugger statements generated by AI coding agents.'}
        </p>
      </div>

      {/* 설정 및 옵션 바 */}
      <Card>
        <CardContent>
          <div className="pt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeConsole}
                  onChange={(e) => setRemoveConsole(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-ring"
                />
                <span>{isKo ? '디버그 console.* 제거' : 'Remove console.*'}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeDebugger}
                  onChange={(e) => setRemoveDebugger(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-ring"
                />
                <span>{isKo ? 'debugger; 구문 제거' : 'Remove debugger;'}</span>
              </label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCode(SAMPLE_CODE)}
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              <span>{isKo ? '샘플 코드 불러오기' : 'Load Sample'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 절감 통계 대시보드 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '미사용 Import' : 'Unused Imports'}</span>
                <FileCode2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{cleanResult.stats.imports}건</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '디버깅 구문' : 'Debug Artifacts'}</span>
                <Terminal className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {cleanResult.stats.consoles + cleanResult.stats.debuggers}건
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '용량 절감' : 'Bytes Saved'}</span>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">-{cleanResult.stats.bytesSaved} B</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '토큰 절약' : 'Tokens Saved'}</span>
                <Sparkles className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">~{cleanResult.stats.tokensSaved} tok</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 에디터 그리드: 원본 코드 vs 정리된 결과 코드 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{isKo ? '원본 코드' : 'Source Code'}</CardTitle>
              <Badge variant="secondary">{code.split('\n').length}줄</Badge>
            </div>
            <CardDescription>
              {isKo ? '정리할 JavaScript / TypeScript 코드를 입력하세요.' : 'Paste JS / TS code to clean.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Paste your code here..."
              rows={16}
              className="w-full resize-none rounded-md border border-input bg-muted/20 p-3 font-mono text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{isKo ? '정격화된 결과 코드' : 'Cleaned Output'}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
              >
                {copied ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
                <span>{copied ? (isKo ? '복사됨' : 'Copied') : (isKo ? '코드 복사' : 'Copy')}</span>
              </Button>
            </div>
            <CardDescription>
              {isKo ? '미사용 잔재가 정격 제거된 프로덕션 코드입니다.' : 'Production-ready pruned code.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <textarea
              readOnly
              value={cleanResult.cleanedCode}
              rows={16}
              className="w-full resize-none rounded-md border border-input bg-muted/40 p-3 font-mono text-xs leading-relaxed text-foreground focus-visible:outline-none"
            />
          </CardContent>
        </Card>
      </div>

      {/* 상세 제거 목록 내역 */}
      {cleanResult.removedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{isKo ? '제거된 항목 내역' : 'Pruned Items Log'}</CardTitle>
            <CardDescription>
              {isKo ? '코드에서 감지되어 안전하게 제거된 요소들입니다.' : 'List of dead artifacts pruned.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border rounded-md border border-border">
              {cleanResult.removedItems.map((item, idx) => (
                <li key={idx} className="flex items-center justify-between p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant={item.type === 'DEBUGGER' ? 'destructive' : 'secondary'}>
                      {item.type}
                    </Badge>
                    <span className="font-mono text-foreground">{item.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 안내 및 핵심 가이드 */}
      <Card>
        <CardHeader>
          <CardTitle>{isKo ? '왜 AI 에이전트 코드 정리가 필요한가요?' : 'Why Clean Agent Dead Code?'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              {isKo
                ? 'LLM 에이전트는 프롬프트 지시에 따라 여러 컴포넌트와 훅을 미리 임포트하거나 중간 동작을 확인하기 위해 console.log를 과도하게 삽입합니다. 이는 번들 크기를 증가시킬 뿐만 아니라 다음 턴의 컨텍스트 윈도우 토큰을 낭비하고 브라우저 성능을 저하시킵니다.'
                : 'AI coding agents frequently import speculative modules or leave debugging logs that bloat bundle sizes and waste precious context window tokens.'}
            </p>
            <div className="rounded-md border border-border bg-muted/30 p-3 font-mono text-xs">
              <code>npx oiyo-skills agent-dead-code-cleaner --file ./src/App.tsx</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
