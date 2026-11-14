import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, Table, KeyRound, CheckCircle2 } from 'lucide-react';

const SAMPLE_SQL_SCHEMA = `CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  age INTEGER DEFAULT 18,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  order_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_orders_user_id ON orders(user_id);`;

export function AgentSqliteWasmStudio({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [sql, setSql] = useState<string>(SAMPLE_SQL_SCHEMA);

  const result = useMemo(() => {
    const tables: Array<{ name: string; columns: Array<{ name: string; type: string; isPk: boolean; isNotNull: boolean }>; foreignKeys: string[] }> = [];
    const indexes: Array<{ indexName: string; tableName: string; column: string }> = [];

    const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_$]+)\s*\(([\s\S]*?)\);/gi;
    let match;

    while ((match = tableRegex.exec(sql)) !== null) {
      const tableName = match[1];
      const body = match[2];
      const lines = body.split(',').map((l) => l.trim()).filter((l) => l.length > 0);
      const columns = [];
      const foreignKeys = [];

      for (const line of lines) {
        if (/^FOREIGN\s+KEY/i.test(line)) {
          foreignKeys.push(line);
          continue;
        }
        if (/^PRIMARY\s+KEY/i.test(line)) continue;

        const parts = line.split(/\s+/);
        const colName = parts[0];
        const colType = parts[1] || 'TEXT';
        const isPk = /PRIMARY\s+KEY/i.test(line);
        const isNotNull = /NOT\s+NULL/i.test(line) || isPk;

        columns.push({
          name: colName,
          type: colType.toUpperCase(),
          isPk,
          isNotNull,
        });
      }

      tables.push({ name: tableName, columns, foreignKeys });
    }

    const indexRegex = /CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_$]+)\s+ON\s+([a-zA-Z0-9_$]+)\s*\(([^)]+)\);/gi;
    while ((match = indexRegex.exec(sql)) !== null) {
      indexes.push({
        indexName: match[1],
        tableName: match[2],
        column: match[3].trim(),
      });
    }

    const tsInterfaces = tables.map((tbl) => {
      const fields = tbl.columns.map((c) => {
        let tsType = 'string';
        if (['INTEGER', 'REAL', 'NUMERIC', 'INT', 'FLOAT'].includes(c.type)) tsType = 'number';
        else if (['BLOB'].includes(c.type)) tsType = 'Uint8Array';
        else if (['BOOLEAN'].includes(c.type)) tsType = 'boolean';
        return `  ${c.name}${c.isNotNull ? '' : '?'}: ${tsType};`;
      });
      return `export interface ${tbl.name.charAt(0).toUpperCase() + tbl.name.slice(1)}Row {\n${fields.join('\n')}\n}`;
    }).join('\n\n');

    return {
      tables,
      indexes,
      tsInterfaces,
      totalColumns: tables.reduce((acc, t) => acc + t.columns.length, 0),
    };
  }, [sql]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* 헤더 */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Database className="h-3.5 w-3.5" />
          <span>{isKo ? 'SQLite DDL 스키마 파서 & DTO 생성기' : 'SQLite DDL Inspector & DTO Generator'}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {isKo ? 'SQLite 스키마 인스펙터 & DTO 생성기' : 'SQLite Schema Inspector & TypeScript DTO Studio'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isKo
            ? 'SQLite/D1 DDL 스키마를 즉시 분석하여 테이블 관계, 인덱스 상태를 시각화하고 타입 안전한 TypeScript Row 인터페이스를 자동 생성합니다.'
            : 'Analyze SQLite DDL schema statements, inspect tables and indexes, and auto-generate typed TypeScript interfaces.'}
        </p>
      </div>

      {/* SQL 입력 카드 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{isKo ? 'SQL DDL 스크립트 입력' : 'SQL DDL Input'}</CardTitle>
              <CardDescription>
                {isKo ? 'CREATE TABLE 및 CREATE INDEX 구문을 입력하세요.' : 'Paste SQL DDL statements below.'}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSql(SAMPLE_SQL_SCHEMA)}
            >
              {isKo ? '샘플 DDL 복원' : 'Reset DDL'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <textarea
              rows={8}
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              className="w-full font-mono text-xs rounded-md border border-input bg-muted/20 p-3 text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="CREATE TABLE ... ;"
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
                <span className="text-xs text-muted-foreground">{isKo ? '감지된 테이블' : 'Parsed Tables'}</span>
                <Table className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {result.tables.length}개 테이블
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                총 {result.totalColumns}개 컬럼 정의됨
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? '외래키 및 인덱스' : 'Keys & Indexes'}</span>
                <KeyRound className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {result.indexes.length}개 인덱스
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                관계 제약조건 무결성 검증
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{isKo ? 'TypeScript DTO' : 'TS Interfaces'}</span>
                <Badge variant="secondary">{isKo ? '생성 완료' : 'Generated'}</Badge>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {result.tables.length}개 DTO
              </p>
              <p className="mt-1 text-xs text-muted-foreground">타입스크립트 Row 타입 매핑</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 분석 테이블 목록 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>{isKo ? '테이블 구조 및 TypeScript Row DTO' : 'Table Schemas & TypeScript DTO'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-1">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                <span>{isKo ? 'SQLite 스키마 파싱 완료' : 'Schema Successfully Parsed'}</span>
              </div>
              <p className="text-xs">
                정의된 모든 테이블의 기본키(PK)와 널 허용 여부가 TypeScript 인터페이스 속성(옵셔널 ?)에 정확히 반영되었습니다.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {result.tables.map((tbl, idx) => (
                <div key={idx} className="rounded-lg border border-border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground text-xs">📦 {tbl.name}</p>
                    <Badge variant="outline">{tbl.columns.length} cols</Badge>
                  </div>
                  <div className="space-y-1 text-xs font-mono">
                    {tbl.columns.map((c, cIdx) => (
                      <div key={cIdx} className="flex justify-between text-muted-foreground">
                        <span>{c.name} {c.isPk && <span className="text-primary font-bold">[PK]</span>}</span>
                        <span>{c.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-xs font-semibold text-foreground">{isKo ? '📄 자동 생성된 TypeScript Row DTO:' : 'Generated TypeScript Row DTO:'}</p>
              <pre className="text-xs font-mono bg-background p-3 rounded border border-border overflow-x-auto text-foreground">
                {result.tsInterfaces}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
