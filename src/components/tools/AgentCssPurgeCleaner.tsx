import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Paintbrush, Copy, Check, Sparkles, Layers, Zap } from 'lucide-react';

const SAMPLE_JSX = `<div className="flex block p-4 p-2 text-sm text-lg font-bold items-center font-bold">
  <span className="text-muted text-primary font-normal font-semibold">Label</span>
  <button className="rounded-md rounded-full bg-primary p-2">Submit</button>
</div>`;

const CONFLICT_GROUPS = [
  { name: 'display', regex: /^(flex|block|inline-block|inline|grid|hidden|inline-flex|inline-grid)$/ },
  { name: 'padding-all', regex: /^p-\d+(\.\d+)?$/ },
  { name: 'padding-x', regex: /^px-\d+(\.\d+)?$/ },
  { name: 'padding-y', regex: /^py-\d+(\.\d+)?$/ },
  { name: 'margin-all', regex: /^m-\d+(\.\d+)?$/ },
  { name: 'margin-x', regex: /^mx-\d+(\.\d+)?$/ },
  { name: 'margin-y', regex: /^my-\d+(\.\d+)?$/ },
  { name: 'font-size', regex: /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)$/ },
  { name: 'font-weight', regex: /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/ },
  { name: 'text-align', regex: /^text-(left|center|right|justify|start|end)$/ },
  { name: 'rounded', regex: /^rounded(-none|-sm|-md|-lg|-xl|-2xl|-3xl|-full)?$/ },
];

function cleanClassString(classString: string) {
  const tokens = classString.split(/\s+/).filter(Boolean);
  const seenExact = new Set<string>();
  const duplicates: string[] = [];
  const conflicts: { group: string; overwritten: string; winner: string }[] = [];

  const uniqueTokens: string[] = [];
  tokens.forEach((token) => {
    if (seenExact.has(token)) {
      duplicates.push(token);
    } else {
      seenExact.add(token);
      uniqueTokens.push(token);
    }
  });

  const groupLastIndex = new Map<string, number>();
  uniqueTokens.forEach((token, idx) => {
    for (const group of CONFLICT_GROUPS) {
      if (group.regex.test(token)) {
        if (groupLastIndex.has(group.name)) {
          const prevIdx = groupLastIndex.get(group.name)!;
          conflicts.push({
            group: group.name,
            overwritten: uniqueTokens[prevIdx],
            winner: token,
          });
        }
        groupLastIndex.set(group.name, idx);
        break;
      }
    }
  });

  const finalTokens = uniqueTokens.filter((token, idx) => {
    for (const group of CONFLICT_GROUPS) {
      if (group.regex.test(token)) {
        return groupLastIndex.get(group.name) === idx;
      }
    }
    return true;
  });

  return {
    cleanedString: finalTokens.join(' '),
    duplicates,
    conflicts,
  };
}

export function AgentCssPurgeCleaner({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [code, setCode] = useState<string>(SAMPLE_JSX);
  const [copied, setCopied] = useState<boolean>(false);

  const result = useMemo(() => {
    if (!code) {
      return {
        cleanedCode: '',
        duplicatesRemoved: 0,
        conflictsResolved: 0,
        bytesSaved: 0,
        resolvedDetails: [],
      };
    }

    const originalLength = new TextEncoder().encode(code).length;
    let totalDuplicates = 0;
    let totalConflicts = 0;
    const allConflicts: { overwritten: string; winner: string; group: string }[] = [];

    const cleanedCode = code.replace(/(class(?:Name)?\s*=\s*['"])([^'"]+)(['"])/g, (_, prefix, classStr, suffix) => {
      const res = cleanClassString(classStr);
      totalDuplicates += res.duplicates.length;
      totalConflicts += res.conflicts.length;
      allConflicts.push(...res.conflicts);
      return `${prefix}${res.cleanedString}${suffix}`;
    });

    const cleanedLength = new TextEncoder().encode(cleanedCode).length;
    const bytesSaved = Math.max(0, originalLength - cleanedLength);

    return {
      cleanedCode,
      duplicatesRemoved: totalDuplicates,
      conflictsResolved: totalConflicts,
      bytesSaved,
      resolvedDetails: allConflicts,
    };
  }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.cleanedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* 헤더 */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Paintbrush className="h-3.5 w-3.5" />
          <span>{isKo ? 'Tailwind CSS 최적화' : 'Tailwind CSS Optimization'}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {isKo ? 'AI 에이전트 Tailwind 클래스 충돌 & 중복 정리기' : 'AI Agent Tailwind Class Conflict & Duplicate Purger'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isKo
            ? 'AI가 수정한 JSX/HTML에서 상충되는 유틸리티 클래스(p-4 p-2, flex block)와 중복 선언을 0.1ms 만에 정격 정리합니다.'
            : 'Detect and resolve conflicting Tailwind CSS utilities (padding, flex/block, typography) and duplicate declarations.'}
        </p>
      </div>

      {/* 에디터 그리드: 원본 코드 vs 정리된 결과 코드 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{isKo ? '원본 JSX / HTML 코드' : 'Source Code'}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCode(SAMPLE_JSX)}
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                <span>{isKo ? '샘플 불러오기' : 'Sample'}</span>
              </Button>
            </div>
            <CardDescription>
              {isKo ? '정리할 컴포넌트나 HTML 스니펫을 입력하세요.' : 'Paste JSX/HTML with Tailwind classNames.'}
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
              {isKo ? '충돌 및 중복이 해결된 간결한 코드입니다.' : 'Purged, conflict-free class strings.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <textarea
              readOnly
              value={result.cleanedCode}
              rows={14}
              className="w-full resize-none rounded-md border border-input bg-muted/40 p-3 font-mono text-xs leading-relaxed text-foreground focus-visible:outline-none"
            />
          </CardContent>
        </Card>
      </div>

      {/* 절감 지표 카드 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '해결된 클래스 충돌' : 'Conflicts Resolved'}</span>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{result.conflictsResolved}건</p>
              <p className="mt-1 text-xs text-muted-foreground">상충 속성 마지막 선언 유지</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '제거된 단순 중복' : 'Duplicates Pruned'}</span>
                <Paintbrush className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{result.duplicatesRemoved}건</p>
              <p className="mt-1 text-xs text-muted-foreground">완전 일치 중복 클래스</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '절감된 코드 크기' : 'Bytes Saved'}</span>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">-{result.bytesSaved} B</p>
              <p className="mt-1 text-xs text-muted-foreground">페이로드 및 번들 다이어트</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 충돌 해결 상세 내역 */}
      {result.resolvedDetails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{isKo ? '해결된 상충 클래스 내역' : 'Resolved Class Conflicts'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border rounded-lg border border-border">
              {result.resolvedDetails.map((c, idx) => (
                <li key={idx} className="flex items-center justify-between p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{c.group}</Badge>
                    <span className="line-through text-muted-foreground">{c.overwritten}</span>
                    <span className="text-foreground font-semibold">➔ {c.winner}</span>
                  </div>
                  <span className="text-muted-foreground">최종 선언 유지</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
