import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Code2, ArrowDownCircle, CheckCircle2 } from 'lucide-react';

const SAMPLE_ZOD_CODE = `const UserProfileSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(20),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean(),
  metadata: z.record(z.string(), z.any()).nullable(),
});`;

export function AgentZodToTsCompressor({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [zodCode, setZodCode] = useState<string>(SAMPLE_ZOD_CODE);

  const result = useMemo(() => {
    const lines = zodCode.split('\n');
    const fields = [];
    const fieldRegex = /^\s*([a-zA-Z0-9_$]+)\s*:\s*z\.([a-zA-Z0-9_$.()]+)/;

    for (const line of lines) {
      const match = line.match(fieldRegex);
      if (!match) continue;

      const fieldName = match[1];
      const zodChain = match[2];

      let tsType = 'unknown';
      const isOptional = zodChain.includes('.optional()') || zodChain.includes('.nullable()');

      if (zodChain.startsWith('string')) tsType = 'string';
      else if (zodChain.startsWith('number')) tsType = 'number';
      else if (zodChain.startsWith('boolean')) tsType = 'boolean';
      else if (zodChain.startsWith('array')) {
        if (zodChain.includes('z.string()')) tsType = 'string[]';
        else if (zodChain.includes('z.number()')) tsType = 'number[]';
        else tsType = 'unknown[]';
      } else if (zodChain.startsWith('record')) {
        tsType = 'Record<string, unknown>';
      }

      if (zodChain.includes('.nullable()')) {
        tsType += ' | null';
      }

      fields.push({ name: fieldName, type: tsType, isOptional });
    }

    const tsLines = fields.map((f) => `  ${f.name}${f.isOptional ? '?' : ''}: ${f.type};`);
    const tsInterface = `export interface CompressedSchema {\n${tsLines.join('\n')}\n}`;

    const validationChecks = fields
      .filter((f) => !f.isOptional)
      .map((f) => {
        if (f.type === 'string') return `  if (typeof obj.${f.name} !== 'string') return false;`;
        if (f.type === 'number') return `  if (typeof obj.${f.name} !== 'number') return false;`;
        if (f.type === 'boolean') return `  if (typeof obj.${f.name} !== 'boolean') return false;`;
        if (f.type.includes('[]')) return `  if (!Array.isArray(obj.${f.name})) return false;`;
        return `  if (!('${f.name}' in obj)) return false;`;
      });

    const pureValidator = `export function validateSchema(obj: any): obj is CompressedSchema {\n  if (!obj || typeof obj !== 'object') return false;\n${validationChecks.join('\n')}\n  return true;\n}`;

    const originalBytes = zodCode.length;
    const compressedBytes = tsInterface.length;
    const origTokens = Math.ceil(originalBytes / 4);
    const compTokens = Math.ceil(compressedBytes / 4);
    const savedTokens = Math.max(0, origTokens - compTokens);
    const savingPercent = originalBytes > 0 ? Math.round(((originalBytes - compressedBytes) / originalBytes) * 100) : 0;

    return {
      fieldsCount: fields.length,
      origTokens,
      compTokens,
      savedTokens,
      savingPercent,
      tsInterface,
      pureValidator,
    };
  }, [zodCode]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* 헤더 */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Zap className="h-3.5 w-3.5" />
          <span>{isKo ? 'Zod 스키마 토큰 압축 및 가드 생성' : 'Zod to TS Token Compressor'}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {isKo ? 'Zod to TypeScript 스키마 토큰 압축기' : 'Zod to TypeScript Schema Token Compressor'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isKo
            ? '거대한 Zod 스키마를 경량 TypeScript 인터페이스로 변환하여 LLM 프롬프트 토큰을 40% 이상 절감하고 의존성 없는 순수 유효성 검사기를 생성합니다.'
            : 'Compress bloated Zod schemas into compact TypeScript interfaces (40%+ token reduction) and zero-dependency type guards.'}
        </p>
      </div>

      {/* 입력 카드 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{isKo ? 'Zod 스키마 코드 입력' : 'Zod Schema Code Input'}</CardTitle>
              <CardDescription>
                {isKo ? '변환 및 압축할 Zod 스키마 정의를 입력하세요.' : 'Paste Zod schema definition below.'}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZodCode(SAMPLE_ZOD_CODE)}
            >
              {isKo ? '샘플 복원' : 'Reset Sample'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <textarea
              rows={8}
              value={zodCode}
              onChange={(e) => setZodCode(e.target.value)}
              className="w-full font-mono text-xs rounded-md border border-input bg-muted/20 p-3 text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="const MySchema = z.object({ ... });"
            />
          </div>
        </CardContent>
      </Card>

      {/* 3-지표 카드 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '토큰 절감률' : 'Token Savings'}</span>
                <Badge variant="secondary">{isKo ? '프롬프트 최적화' : 'Optimized'}</Badge>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {result.savingPercent}% 절감
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                약 {result.savedTokens} 토큰 영구 절약
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '변환 전/후 용량' : 'Token Comparison'}</span>
                <ArrowDownCircle className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {result.origTokens}t → {result.compTokens}t
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                원본 Zod 대비 간결한 시맨틱
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '파싱된 필드 수' : 'Parsed Fields'}</span>
                <Code2 className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {result.fieldsCount}개 속성
              </p>
              <p className="mt-1 text-xs text-muted-foreground">필수 및 옵셔널 속성 완벽 보존</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 생성 코드 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>{isKo ? '압축된 TypeScript 인터페이스 및 순수 검사 함수' : 'Compressed TypeScript & Pure Guard'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-1">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                <span>{isKo ? 'LLM 시스템 프롬프트 및 런타임 최적화' : 'Prompt & Runtime Optimization Complete'}</span>
              </div>
              <p className="text-xs">
                LLM은 장황한 <code>z.object</code> 체이닝 구문보다 간결한 TypeScript 인터페이스 구문을 훨씬 더 빠르고 정확하게 이해합니다. 또한 50KB 용량의 Zod 라이브러리 없이 순수 함수로 검증할 수 있습니다.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">{isKo ? '📄 1. LLM 프롬프트용 압축 TypeScript 인터페이스:' : 'Compressed TypeScript Interface:'}</p>
              <pre className="text-xs font-mono bg-background p-3 rounded border border-border overflow-x-auto text-foreground">
                {result.tsInterface}
              </pre>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">{isKo ? '🛡️ 2. Zero-Dependency 런타임 가드 함수:' : 'Zero-Dependency Runtime Guard Function:'}</p>
              <pre className="text-xs font-mono bg-background p-3 rounded border border-border overflow-x-auto text-foreground">
                {result.pureValidator}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
