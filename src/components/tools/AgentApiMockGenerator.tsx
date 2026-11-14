import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Copy, Check, Sparkles } from 'lucide-react';

const SAMPLE_SCHEMA = `interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  amount: number;
  isActive: boolean;
  createdAt: string;
}`;

const KO_NAMES = ['김민준', '이지은', '박도윤', '최서연', '정하준', '강지우', '조예준', '윤서아'];
const EN_NAMES = ['Alex Morgan', 'Sarah Jenkins', 'Michael Chen', 'Emma Watson', 'David Miller'];
const ROLES = ['admin', 'member', 'viewer', 'manager'];

function createRng(seed = 12345) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function AgentApiMockGenerator({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [schemaText, setSchemaText] = useState<string>(SAMPLE_SCHEMA);
  const [count, setCount] = useState<number>(3);
  const [dataLocale, setDataLocale] = useState<'ko' | 'en'>('ko');
  const [copied, setCopied] = useState<boolean>(false);

  const result = useMemo(() => {
    if (!schemaText) return { fields: [], mockJson: '[]', factoryCode: '' };

    const rng = createRng(99);
    const fieldMatches = [...schemaText.matchAll(/([a-zA-Z0-9_$]+)\s*(\??)\s*:\s*([^;,\n}]+)/g)];

    const fields = fieldMatches.map((m) => ({
      name: m[1].trim(),
      optional: m[2] === '?',
      type: m[3].trim(),
    }));

    const generateSingleItem = (index: number) => {
      const item: Record<string, unknown> = {};

      fields.forEach((f) => {
        const lower = f.name.toLowerCase();
        const type = f.type.toLowerCase();

        if (lower.includes('id')) {
          item[f.name] = lower.includes('uuid') ? `usr_${Math.floor(rng() * 899999 + 100000)}` : index + 1;
        } else if (lower.includes('name')) {
          item[f.name] = dataLocale === 'ko' ? KO_NAMES[Math.floor(rng() * KO_NAMES.length)] : EN_NAMES[Math.floor(rng() * EN_NAMES.length)];
        } else if (lower.includes('email')) {
          item[f.name] = `user${index + 1}_${Math.floor(rng() * 899 + 100)}@oiyo.net`;
        } else if (lower.includes('role') || lower.includes('type')) {
          item[f.name] = ROLES[Math.floor(rng() * ROLES.length)];
        } else if (lower.includes('amount') || lower.includes('price')) {
          item[f.name] = Math.floor(rng() * 90 + 10) * 10000;
        } else if (lower.includes('active') || lower.includes('is')) {
          item[f.name] = rng() > 0.3;
        } else if (lower.includes('date') || lower.includes('created')) {
          const d = new Date(Date.now() - Math.floor(rng() * 30 * 86400000));
          item[f.name] = d.toISOString().split('T')[0];
        } else if (type.includes('number')) {
          item[f.name] = Math.floor(rng() * 100) + 1;
        } else if (type.includes('boolean')) {
          item[f.name] = rng() > 0.5;
        } else {
          item[f.name] = dataLocale === 'ko' ? `${f.name}_데이터_${index + 1}` : `Sample ${f.name} ${index + 1}`;
        }
      });

      return item;
    };

    const mockData = Array.from({ length: count }, (_, idx) => generateSingleItem(idx));
    const mockJson = JSON.stringify(mockData, null, 2);

    const factoryCode = `// [OIYO Lab Zero-Dependency Mock Factory]
export function createMockUsers(count = ${count}) {
  return ${mockJson};
}`;

    return {
      fields,
      mockJson,
      factoryCode,
    };
  }, [schemaText, count, dataLocale]);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.mockJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* 헤더 */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Database className="h-3.5 w-3.5" />
          <span>{isKo ? 'Faker 무설치 제로 디펜던시' : 'Zero-Dependency Mock'}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {isKo ? 'AI 에이전트 API 스키마 기반 목 데이터 생성기' : 'AI Agent API Schema to Mock Data Generator'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isKo
            ? 'TypeScript 인터페이스를 입력하면 외부 라이브러리 없이 0.1ms 만에 실감 나는 JSON 목 데이터 및 팩토리 코드를 생성합니다.'
            : 'Convert TypeScript interfaces into realistic deterministic JSON mock data and factory functions in sub-milliseconds.'}
        </p>
      </div>

      {/* 옵션 바 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button
            variant={dataLocale === 'ko' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDataLocale('ko')}
          >
            {isKo ? '한국어 더미' : 'Korean'}
          </Button>
          <Button
            variant={dataLocale === 'en' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDataLocale('en')}
          >
            {isKo ? '영어 더미' : 'English'}
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-muted-foreground">{isKo ? '생성 개수:' : 'Count:'}</span>
          {[1, 3, 5, 10].map((num) => (
            <Button
              key={num}
              variant={count === num ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCount(num)}
            >
              {num}
            </Button>
          ))}
        </div>
      </div>

      {/* 에디터 그리드: 스키마 입력 vs JSON 목 결과 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{isKo ? 'TypeScript 인터페이스 스키마' : 'TypeScript Interface'}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSchemaText(SAMPLE_SCHEMA)}
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                <span>{isKo ? '샘플 불러오기' : 'Sample'}</span>
              </Button>
            </div>
            <CardDescription>
              {isKo ? 'API 응답 타입이나 인터페이스를 입력하세요.' : 'Paste TypeScript interface or type definition.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <textarea
              value={schemaText}
              onChange={(e) => setSchemaText(e.target.value)}
              rows={14}
              className="w-full resize-none rounded-md border border-input bg-muted/20 p-3 font-mono text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{isKo ? '생성된 JSON 목 데이터' : 'Generated JSON Mock'}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
              >
                {copied ? <Check className="mr-1.5 h-3.5 w-3.5" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
                <span>{copied ? (isKo ? '복사됨' : 'Copied') : (isKo ? 'JSON 복사' : 'Copy')}</span>
              </Button>
            </div>
            <CardDescription>
              {isKo ? '테스트 및 프론트엔드 목킹에 즉시 사용할 수 있습니다.' : 'Ready for test harnesses and UI mocking.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <textarea
              readOnly
              value={result.mockJson}
              rows={14}
              className="w-full resize-none rounded-md border border-input bg-muted/40 p-3 font-mono text-xs leading-relaxed text-foreground focus-visible:outline-none"
            />
          </CardContent>
        </Card>
      </div>

      {/* 분석된 필드 배지 */}
      {result.fields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{isKo ? '인식된 스키마 필드 목록' : 'Detected Schema Fields'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.fields.map((f, idx) => (
                <div key={idx} className="flex items-center gap-1 rounded-md border border-border bg-muted/30 px-2 py-1 text-xs">
                  <span className="font-semibold text-foreground">{f.name}</span>
                  <span className="text-muted-foreground">({f.type})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
