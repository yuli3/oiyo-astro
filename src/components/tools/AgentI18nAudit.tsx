import { useState, useMemo } from 'react';

const SAMPLE_BASE = JSON.stringify(
  {
    common: {
      confirm: '확인',
      cancel: '취소',
      welcome: '환영합니다, {username}님!',
    },
    billing: {
      title: '결제 관리',
      plan: '현재 플랜: {planName}',
      remainingDays: '{days}일 남음',
      upgrade: '업그레이드',
    },
    errors: {
      network: '네트워크 연결이 불안정합니다.',
      notFound: '페이지를 찾을 수 없습니다.',
    },
  },
  null,
  2
);

const SAMPLE_TARGET = JSON.stringify(
  {
    common: {
      confirm: 'Confirm',
      welcome: 'Welcome!', // {username} 누락
    },
    billing: {
      title: 'Billing Management',
      plan: 'Current Plan: {planName}',
      upgrade: 'Upgrade',
    },
    legacy: {
      deprecatedKey: 'Old feature string',
    },
  },
  null,
  2
);

function flattenObject(obj: any, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {};
  if (!obj || typeof obj !== 'object') return result;

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }
  return result;
}

function extractTokens(str: any): string[] {
  if (typeof str !== 'string') return [];
  const matches = str.match(/\{[a-zA-Z0-9_]+\}|%s|%d/g);
  return matches ? (matches as string[]).sort() : [];
}

export default function AgentI18nAudit({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [baseJsonText, setBaseJsonText] = useState<string>(SAMPLE_BASE);
  const [targetJsonText, setTargetJsonText] = useState<string>(SAMPLE_TARGET);
  const [targetLangCode, setTargetLangCode] = useState<string>('en');
  const [copiedPatch, setCopiedPatch] = useState<boolean>(false);

  const auditResult = useMemo(() => {
    let baseDict: any = {};
    let targetDict: any = {};
    let parseError = '';

    try {
      baseDict = JSON.parse(baseJsonText);
    } catch {
      parseError = isKo ? '기준 언어 JSON 문법 오류가 있습니다.' : 'Base JSON syntax error.';
    }

    try {
      targetDict = JSON.parse(targetJsonText);
    } catch {
      parseError = isKo ? '비교 언어 JSON 문법 오류가 있습니다.' : 'Target JSON syntax error.';
    }

    if (parseError) {
      return { error: parseError };
    }

    const flatBase = flattenObject(baseDict);
    const flatTarget = flattenObject(targetDict);

    const baseKeys = Object.keys(flatBase);
    const targetKeys = Object.keys(flatTarget);
    const totalBaseKeys = baseKeys.length;

    const missingKeys: { key: string; baseValue: any }[] = [];
    const tokenMismatches: { key: string; baseTokens: string[]; targetTokens: string[]; missingTokens: string[] }[] = [];
    const orphanKeys: string[] = targetKeys.filter((k) => !(k in flatBase));
    let translatedCount = 0;

    for (const key of baseKeys) {
      if (!(key in flatTarget)) {
        missingKeys.push({
          key,
          baseValue: flatBase[key],
        });
      } else {
        const targetVal = flatTarget[key];
        if (targetVal !== '' && targetVal !== null && targetVal !== undefined) {
          translatedCount++;
          const baseTokens = extractTokens(flatBase[key]);
          const targetTokens = extractTokens(targetVal);
          const missingTokens = baseTokens.filter((t) => !targetTokens.includes(t));
          if (missingTokens.length > 0) {
            tokenMismatches.push({
              key,
              baseTokens,
              targetTokens,
              missingTokens,
            });
          }
        }
      }
    }

    const completeness = totalBaseKeys > 0 ? parseFloat(((translatedCount / totalBaseKeys) * 100).toFixed(1)) : 100;

    const patchStub: Record<string, string> = {};
    for (const item of missingKeys) {
      patchStub[item.key] = `[TODO: ${item.baseValue}]`;
    }

    return {
      error: '',
      totalBaseKeys,
      totalTargetKeys: targetKeys.length,
      translatedCount,
      missingKeys,
      tokenMismatches,
      orphanKeys,
      completeness,
      patchStubJson: JSON.stringify(patchStub, null, 2),
    };
  }, [baseJsonText, targetJsonText, isKo]);

  const handleCopyPatch = () => {
    if (auditResult.patchStubJson) {
      navigator.clipboard.writeText(auditResult.patchStubJson);
      setCopiedPatch(true);
      setTimeout(() => setCopiedPatch(false), 2000);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            {isKo ? 'AI 에이전트 다국어 i18n 누락 키 & 치환자 일관성 감사기' : 'Agent i18n Missing Keys & Token Consistency Auditor'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isKo
              ? '다국어 JSON 딕셔너리 간 누락된 키, 고아 키(Orphan), 변수 치환자({variable}) 누락 및 번역 완성도를 실시간 분석합니다.'
              : 'Audit missing i18n keys, orphan keys, lost interpolation tokens, and completeness across language files.'}
          </p>
        </div>

        {/* JSON Editors */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Base Locale Editor */}
          <div className="space-y-2 rounded-lg bg-muted/40 p-4 border border-border">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-foreground">
                {isKo ? '1. 기준 언어 JSON (Base Locale)' : '1. Base Locale JSON'}
              </label>
              <button
                onClick={() => setBaseJsonText(SAMPLE_BASE)}
                className="text-xs text-primary hover:underline"
              >
                {isKo ? '샘플 복원' : 'Reset Sample'}
              </button>
            </div>
            <textarea
              rows={12}
              value={baseJsonText}
              onChange={(e) => setBaseJsonText(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2.5 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Target Locale Editor */}
          <div className="space-y-2 rounded-lg bg-muted/40 p-4 border border-border">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-foreground">
                  {isKo ? '2. 비교 대상 언어 JSON' : '2. Target Locale JSON'}
                </label>
                <input
                  type="text"
                  value={targetLangCode}
                  onChange={(e) => setTargetLangCode(e.target.value.toLowerCase())}
                  className="w-12 rounded border border-input bg-background px-1.5 py-0.5 text-xs text-center font-mono uppercase text-foreground"
                />
              </div>
              <button
                onClick={() => setTargetJsonText(SAMPLE_TARGET)}
                className="text-xs text-primary hover:underline"
              >
                {isKo ? '샘플 복원' : 'Reset Sample'}
              </button>
            </div>
            <textarea
              rows={12}
              value={targetJsonText}
              onChange={(e) => setTargetJsonText(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2.5 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Audit Results */}
        {auditResult.error ? (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-xs font-medium text-destructive">
            {auditResult.error}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-5 space-y-5">
            {/* Header Metrics */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border pb-4">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {isKo ? `[${targetLangCode.toUpperCase()}] 언어 감사 결과` : `[${targetLangCode.toUpperCase()}] Audit Outcome`}
                </span>
                <h4 className="text-2xl font-black text-foreground mt-0.5">
                  {auditResult.completeness}% {isKo ? '번역 완성도' : 'Completeness'}
                </h4>
              </div>

              <div className="text-right">
                <span className="text-xs text-muted-foreground">{isKo ? '동기화 상태' : 'Sync Status'}</span>
                <div className={`text-xl font-bold ${auditResult.missingKeys && auditResult.missingKeys.length > 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {auditResult.missingKeys && auditResult.missingKeys.length > 0
                    ? (isKo ? `🚨 ${auditResult.missingKeys.length}개 키 누락` : `🚨 ${auditResult.missingKeys.length} Missing`)
                    : (isKo ? '✅ 100% 동기화' : '✅ 100% In Sync')}
                </div>
              </div>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-card p-4 border border-border">
                <div className="text-xs text-muted-foreground">{isKo ? '누락 키 (Missing)' : 'Missing Keys'}</div>
                <div className="text-xl font-bold text-destructive mt-1">
                  {auditResult.missingKeys ? auditResult.missingKeys.length : 0}{isKo ? '개' : ' keys'}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {isKo ? `기준 총 ${auditResult.totalBaseKeys}개 키 중` : `Out of ${auditResult.totalBaseKeys} base keys`}
                </div>
              </div>

              <div className="rounded-lg bg-card p-4 border border-border">
                <div className="text-xs text-muted-foreground">{isKo ? '치환 토큰 유실 (Tokens)' : 'Token Mismatches'}</div>
                <div className="text-xl font-bold text-primary mt-1">
                  {auditResult.tokenMismatches ? auditResult.tokenMismatches.length : 0}{isKo ? '개' : ' issues'}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {isKo ? '{var} 변수 누락으로 런타임 오류 위험' : 'Missing interpolation variables'}
                </div>
              </div>

              <div className="rounded-lg bg-card p-4 border border-border">
                <div className="text-xs text-muted-foreground">{isKo ? '고아 키 (Orphaned)' : 'Orphan Keys'}</div>
                <div className="text-xl font-bold text-muted-foreground mt-1">
                  {auditResult.orphanKeys ? auditResult.orphanKeys.length : 0}{isKo ? '개' : ' keys'}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {isKo ? '기준 파일에 없는 잉여 키' : 'Redundant deprecated keys'}
                </div>
              </div>
            </div>

            {/* Detailed Issues List */}
            {auditResult.missingKeys && auditResult.missingKeys.length > 0 && (
              <div className="rounded-lg bg-card p-4 border border-border space-y-2 text-xs">
                <h5 className="font-semibold text-destructive">
                  🚨 {isKo ? '누락된 키 목록 및 원문' : 'Missing Keys & Source Strings'}
                </h5>
                <div className="divide-y divide-border overflow-hidden rounded border border-border">
                  {auditResult.missingKeys.map((item) => (
                    <div key={item.key} className="flex justify-between items-center p-2.5 bg-muted/20">
                      <span className="font-mono font-medium text-foreground">{item.key}</span>
                      <span className="text-muted-foreground truncate max-w-xs">{String(item.baseValue)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {auditResult.tokenMismatches && auditResult.tokenMismatches.length > 0 && (
              <div className="rounded-lg bg-card p-4 border border-border space-y-2 text-xs">
                <h5 className="font-semibold text-primary">
                  ⚠️ {isKo ? '치환 토큰 유실 항목 (런타임 충돌 방지 요망)' : 'Missing Interpolation Tokens'}
                </h5>
                <div className="space-y-1">
                  {auditResult.tokenMismatches.map((item) => (
                    <div key={item.key} className="p-2.5 bg-muted/20 rounded border border-border space-y-1">
                      <div className="font-mono font-semibold text-foreground">{item.key}</div>
                      <div className="text-muted-foreground">
                        {isKo ? '누락된 필수 토큰: ' : 'Missing required token: '}
                        <span className="font-mono text-destructive font-bold">{item.missingTokens.join(', ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Copyable Patch Stub */}
            {auditResult.missingKeys && auditResult.missingKeys.length > 0 && (
              <div className="rounded-lg bg-muted/60 p-4 border border-border space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-foreground">
                    📋 {isKo ? '자동 생성된 누락 키 패치 스텁 (Patch Stub)' : 'Auto-Generated Patch Stub'}
                  </span>
                  <button
                    onClick={handleCopyPatch}
                    className="rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    {copiedPatch ? (isKo ? '복사 완료!' : 'Copied!') : (isKo ? '패치 JSON 복사' : 'Copy Patch JSON')}
                  </button>
                </div>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono bg-background p-3 rounded border border-border max-h-48 overflow-y-auto">
                  {auditResult.patchStubJson}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
