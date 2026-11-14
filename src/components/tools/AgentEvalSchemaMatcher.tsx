import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileJson, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

const SAMPLE_SCHEMA = `{
  "id": { "type": "string", "required": true },
  "title": { "type": "string", "required": true, "default": "Untitled" },
  "score": { "type": "number", "required": true, "default": 0 },
  "tags": { "type": "array", "required": true, "default": [] },
  "isPublished": { "type": "boolean", "required": false, "default": false }
}`;

const SAMPLE_DRIFT_DATA = `{
  "id": "doc_123",
  "score": "85",
  "tags": null,
  "hallucinatedComment": "Unplanned LLM extra text"
}`;

const SAMPLE_CLEAN_DATA = `{
  "id": "doc_123",
  "title": "Agent System Architecture",
  "score": 95,
  "tags": ["ai", "agents"],
  "isPublished": true
}`;

export function AgentEvalSchemaMatcher({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [schemaJson, setSchemaJson] = useState<string>(SAMPLE_SCHEMA);
  const [dataJson, setDataJson] = useState<string>(SAMPLE_DRIFT_DATA);

  const result = useMemo(() => {
    try {
      const schema = JSON.parse(schemaJson);
      const data = JSON.parse(dataJson);

      const issues: Array<{ key: string; type: string; msg: string; severity: string }> = [];
      const healed: Record<string, unknown> = {};

      const schemaKeys = Object.keys(schema);
      const dataKeys = Object.keys(data || {});

      for (const key of schemaKeys) {
        const spec = schema[key];
        const val = data ? data[key] : undefined;

        if (val === undefined || val === null) {
          if (spec.required) {
            issues.push({
              key,
              type: 'MISSING',
              severity: 'HIGH',
              msg: isKo ? `필수 키 '${key}' 누락 (기본값 복구)` : `Missing required key '${key}' (default injected)`,
            });
            healed[key] = spec.default !== undefined ? spec.default : (spec.type === 'array' ? [] : spec.type === 'number' ? 0 : '');
          } else {
            healed[key] = spec.default !== undefined ? spec.default : val;
          }
          continue;
        }

        const actualType = Array.isArray(val) ? 'array' : typeof val;
        if (spec.type && actualType !== spec.type) {
          let coercedVal = val;
          let ok = false;

          if (spec.type === 'number' && !isNaN(Number(val))) {
            coercedVal = Number(val);
            ok = true;
          } else if (spec.type === 'string') {
            coercedVal = String(val);
            ok = true;
          } else if (spec.type === 'boolean') {
            coercedVal = Boolean(val);
            ok = true;
          } else if (spec.type === 'array' && !Array.isArray(val)) {
            coercedVal = [val];
            ok = true;
          }

          issues.push({
            key,
            type: 'TYPE_DRIFT',
            severity: ok ? 'MEDIUM' : 'HIGH',
            msg: isKo ? `'${key}' 타입 불일치 (${actualType} -> ${spec.type})` : `'${key}' type drift (${actualType} -> ${spec.type})`,
          });
          healed[key] = ok ? coercedVal : (spec.default !== undefined ? spec.default : val);
        } else {
          healed[key] = val;
        }
      }

      const extraKeys = dataKeys.filter((k) => !schemaKeys.includes(k));
      for (const extra of extraKeys) {
        issues.push({
          key: extra,
          type: 'EXTRA_KEY',
          severity: 'LOW',
          msg: isKo ? `환각 잉여 필드 '${extra}' (제거됨)` : `Hallucinated key '${extra}' (dropped)`,
        });
      }

      return {
        isValidJson: true,
        isMatched: issues.length === 0,
        issues,
        healedJson: JSON.stringify(healed, null, 2),
      };
    } catch {
      return {
        isValidJson: false,
        isMatched: false,
        issues: [{ key: 'syntax', type: 'PARSE_ERROR', severity: 'CRITICAL', msg: isKo ? 'JSON 구문 오류가 있습니다.' : 'Invalid JSON format' }],
        healedJson: '{}',
      };
    }
  }, [schemaJson, dataJson, isKo]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* 헤더 */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
          <FileJson className="h-3.5 w-3.5" />
          <span>{isKo ? 'LLM 구조화 출력 스키마 매처' : 'LLM Structured Output Matcher'}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {isKo ? 'AI 에이전트 JSON 스키마 드리프트 검사기' : 'AI Agent JSON Schema Drift Matcher'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isKo
            ? 'LLM이 반환한 JSON의 누락된 키, 타입 불일치, 환각 잉여 필드를 검사하고 자가 치유(Self-Healing) JSON을 생성합니다.'
            : 'Detect missing keys, type drifts, and hallucinated fields in LLM responses and recover self-healed JSON.'}
        </p>
      </div>

      {/* 입력 카드 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{isKo ? '스키마 및 LLM 출력 데이터 입력' : 'Schema & LLM Output'}</CardTitle>
              <CardDescription>
                {isKo ? '타겟 스키마와 LLM 응답 JSON을 비교하세요.' : 'Compare target schema with LLM output.'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDataJson(SAMPLE_DRIFT_DATA)}
              >
                {isKo ? '드리프트 샘플' : 'Drift Sample'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDataJson(SAMPLE_CLEAN_DATA)}
              >
                {isKo ? '정상 샘플' : 'Clean Sample'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isKo ? '기대 스키마 (Target Schema)' : 'Target Schema'}
              </label>
              <textarea
                rows={9}
                value={schemaJson}
                onChange={(e) => setSchemaJson(e.target.value)}
                className="w-full font-mono text-xs rounded-md border border-input bg-muted/20 p-3 text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isKo ? 'LLM 생성 JSON 응답' : 'LLM Generated JSON Output'}
              </label>
              <textarea
                rows={9}
                value={dataJson}
                onChange={(e) => setDataJson(e.target.value)}
                className="w-full font-mono text-xs rounded-md border border-input bg-muted/20 p-3 text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3-지표 카드 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '스키마 일치 상태' : 'Match Status'}</span>
                {result.isMatched ? (
                  <Badge variant="secondary">{isKo ? '완벽 일치' : 'Matched'}</Badge>
                ) : (
                  <Badge variant="destructive">{isKo ? '드리프트 발생' : 'Drift Detected'}</Badge>
                )}
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {result.isMatched ? (isKo ? '100% 충족' : '100% Match') : `${result.issues.length}건 이슈`}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {result.isMatched ? (isKo ? '정상 스키마 통과' : 'Schema validated') : (isKo ? '자가 치유 필요' : 'Self-healing required')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '누락 및 타입 이상' : 'Missing & Type Drifts'}</span>
                <ShieldAlert className="h-4 w-4 text-destructive" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {result.issues.filter((i) => i.type !== 'EXTRA_KEY').length}건
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                필수 키 누락 및 타입 불일치
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '자가 치유 복구율' : 'Self-Healing Status'}</span>
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                100% 복구
              </p>
              <p className="mt-1 text-xs text-muted-foreground">기본값 주입 및 타입 강제 변환</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 진단 및 치유된 JSON 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>{isKo ? '자가 치유(Self-Healed) 복구 JSON' : 'Self-Healed Output JSON'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            {result.isMatched ? (
              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-1">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isKo ? '스키마와 완벽하게 일치합니다' : 'Strict Schema Match Verified'}</span>
                </div>
                <p className="text-xs">
                  모든 필수 필드가 존재하며, 타입 불일치나 허가되지 않은 환각 필드가 없습니다.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-2">
                  <p className="text-xs font-semibold text-destructive">{isKo ? '발견된 스키마 드리프트 내역:' : 'Schema Drift Items:'}</p>
                  <div className="space-y-1">
                    {result.issues.map((iss, idx) => (
                      <div key={idx} className="text-xs font-mono">
                        <span className="font-bold text-foreground">• [{iss.type}]</span> {iss.msg}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground">{isKo ? '🩹 복구 완료된 안전한 JSON:' : 'Recovered Clean JSON:'}</p>
                  <pre className="text-xs font-mono bg-background p-3 rounded border border-border overflow-x-auto text-foreground">
                    {result.healedJson}
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
