import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertOctagon, Sparkles, ShieldCheck, ShieldAlert, RefreshCw, Zap } from 'lucide-react';

export function AgentLoopBreaker({ locale = 'ko' }: { locale?: string }) {
  const isKo = locale === 'ko';

  const [historyJson, setHistoryJson] = useState(JSON.stringify([
    { tool: 'run_tests', args: { suite: 'unit' }, error: 'AssertionError: Expected 200 to be 404' },
    { tool: 'fix_code', args: { file: 'api.ts' } },
    { tool: 'run_tests', args: { suite: 'unit' }, error: 'AssertionError: Expected 200 to be 404' },
    { tool: 'fix_code', args: { file: 'api.ts' } },
  ], null, 2));

  const result = useMemo(() => {
    let calls: any[] = [];
    try {
      calls = JSON.parse(historyJson);
      if (!Array.isArray(calls)) calls = [];
    } catch {
      return {
        status: 'ERROR',
        isLoop: false,
        risk: 'High',
        msg: isKo ? '올바른 JSON 배열 형식이 아닙니다.' : 'Invalid JSON array.',
        advice: isKo ? 'JSON 구문을 확인하세요.' : 'Check JSON syntax.',
      };
    }

    const len = calls.length;
    if (len === 0) {
      return {
        status: 'NORMAL',
        isLoop: false,
        risk: 'Safe',
        msg: isKo ? '호출 기록이 비어 있습니다.' : 'Call history is empty.',
        advice: isKo ? '정상 대기 상태입니다.' : 'Awaiting tool calls.',
      };
    }

    // 1. Exact Duplicate
    let dupCount = 1;
    const last = calls[len - 1];
    const lastSig = `${last.tool}:${JSON.stringify(last.args || {})}`;

    for (let i = len - 2; i >= 0; i--) {
      const curSig = `${calls[i].tool}:${JSON.stringify(calls[i].args || {})}`;
      if (curSig === lastSig) dupCount++;
      else break;
    }

    if (dupCount >= 3) {
      return {
        status: 'CIRCUIT_TRIPPED',
        isLoop: true,
        risk: 'Critical',
        msg: isKo
          ? `동일한 도구(${last.tool})와 인자가 연속 ${dupCount}회 중복 호출되었습니다.`
          : `Tool (${last.tool}) called ${dupCount} times with identical arguments.`,
        advice: isKo
          ? '🚨 즉시 도구 호출을 중단하고 사용자 개입을 요청하세요 (Circuit Breaker Tripped).'
          : 'Halt execution immediately and request human guidance.',
      };
    }

    // 2. Ping-Pong Cycle
    if (len >= 4) {
      const a1 = calls[len - 4]?.tool;
      const b1 = calls[len - 3]?.tool;
      const a2 = calls[len - 2]?.tool;
      const b2 = calls[len - 1]?.tool;

      if (a1 && b1 && a1 === a2 && b1 === b2 && a1 !== b1) {
        return {
          status: 'CIRCUIT_TRIPPED',
          isLoop: true,
          risk: 'High',
          msg: isKo
            ? `도구 [${a1}]과 [${b1}] 간의 교차 핑퐁 루프(A-B-A-B)가 감지되었습니다.`
            : `Ping-pong cycle detected between [${a1}] and [${b1}].`,
          advice: isKo
            ? '상호 의존 루프를 끊고 단방향 실행 계획으로 재정의하세요.'
            : 'Break circular dependencies and enforce linear execution.',
        };
      }
    }

    // 3. Consecutive Errors
    let errCount = 0;
    for (let i = len - 1; i >= 0; i--) {
      if (calls[i].error) errCount++;
      else break;
    }
    if (errCount >= 3) {
      return {
        status: 'WARNING',
        isLoop: true,
        risk: 'High',
        msg: isKo
          ? `동일 에러가 연속 ${errCount}회 발생하여 정체 늪에 빠졌습니다.`
          : `${errCount} consecutive failures detected.`,
        advice: isKo
          ? '반복 재시도를 멈추고 대체 도구나 다른 전략을 선택하세요.'
          : 'Halt retries and switch to alternative tools or strategies.',
      };
    }

    return {
      status: 'NORMAL',
      isLoop: false,
      risk: 'Safe',
      msg: isKo ? '정상 실행 상태입니다.' : 'Normal execution state.',
      advice: isKo ? '루프나 교착 상태가 감지되지 않았습니다.' : 'No loop or deadlock detected.',
    };
  }, [historyJson, isKo]);

  const handlePreset = (type: 'duplicate' | 'pingpong' | 'clean') => {
    if (type === 'duplicate') {
      setHistoryJson(JSON.stringify([
        { tool: 'edit_file', args: { path: 'src/app.ts', line: 15 } },
        { tool: 'edit_file', args: { path: 'src/app.ts', line: 15 } },
        { tool: 'edit_file', args: { path: 'src/app.ts', line: 15 } },
      ], null, 2));
    } else if (type === 'pingpong') {
      setHistoryJson(JSON.stringify([
        { tool: 'run_tests', args: {} },
        { tool: 'fix_code', args: {} },
        { tool: 'run_tests', args: {} },
        { tool: 'fix_code', args: {} },
      ], null, 2));
    } else {
      setHistoryJson(JSON.stringify([
        { tool: 'read_file', args: { path: 'package.json' } },
        { tool: 'run_command', args: { cmd: 'npm test' } },
        { tool: 'write_file', args: { path: 'README.md' } },
      ], null, 2));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {isKo ? '⚡ AI 에이전트 무한 루프 브레이커 (서킷 브레이커)' : '⚡ AI Agent Infinite Loop Circuit Breaker'}
              </CardTitle>
              <CardDescription>
                {isKo
                  ? '동일 도구 3회 중복 호출, 핑퐁 루프(A-B-A-B), 연속 실패 정체를 0.1ms 내에 실시간 감지하여 토큰 낭비를 원천 차단합니다.'
                  : 'Detect exact duplicate tool calls, ping-pong loops, and consecutive errors in sub-milliseconds.'}
              </CardDescription>
            </div>
            <Badge variant={result.status === 'CIRCUIT_TRIPPED' ? 'destructive' : 'outline'}>
              {result.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between pb-2">
                <label className="text-sm font-medium">
                  {isKo ? '도구 호출 기록 (JSON 배열)' : 'Tool Call History (JSON Array)'}
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => handlePreset('duplicate')}>
                    {isKo ? '중복 루프 예시' : 'Duplicate Sample'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handlePreset('pingpong')}>
                    {isKo ? '핑퐁 루프 예시' : 'Ping-Pong Sample'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handlePreset('clean')}>
                    {isKo ? '정상 예시' : 'Clean Sample'}
                  </Button>
                </div>
              </div>
              <Textarea
                rows={6}
                className="font-mono text-xs"
                value={historyJson}
                onChange={(e) => setHistoryJson(e.target.value)}
              />
            </div>

            {/* Circuit Breaker Status Banner */}
            <div className={`rounded-lg border p-4 space-y-2 ${result.isLoop ? 'bg-destructive/10 border-destructive/30' : 'bg-muted/20'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {result.isLoop ? (
                    <ShieldAlert className="h-5 w-5 text-destructive" />
                  ) : (
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  )}
                  <span className="font-semibold text-base">
                    {result.status === 'CIRCUIT_TRIPPED'
                      ? (isKo ? '🚨 서킷 브레이커 작동 (실행 차단!)' : '🚨 Circuit Breaker Tripped!')
                      : (result.status === 'WARNING'
                        ? (isKo ? '⚠️ 경고: 반복 실패 정체 감지' : '⚠️ Warning: Consecutive Failures')
                        : (isKo ? '✅ 정상: 루프 미감지' : '✅ Normal: Clean Execution'))}
                  </span>
                </div>
                <Badge variant={result.isLoop ? 'destructive' : 'outline'}>
                  {result.risk}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">{result.msg}</p>
                <p>👉 <strong>{isKo ? '권장 탈출 조치' : 'Recommended Action'}:</strong> {result.advice}</p>
              </div>
            </div>

            {/* Architecture Guide */}
            <div className="rounded-lg border p-4 text-xs space-y-2 bg-muted/10 text-muted-foreground">
              <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                {isKo ? '프로덕션 AI 에이전트 3대 안전 가드레일' : '3 Key Agent Safety Guardrails'}
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  <strong>{isKo ? '슬라이딩 윈도우 시그니처' : 'Sliding Window Signature'}:</strong> {isKo ? '최근 5~10회 도구 호출의 인자를 직렬화하여 해시 비교로 동일 호출을 즉시 차단합니다.' : 'Serialize arguments in sliding window to detect identical calls.'}
                </li>
                <li>
                  <strong>{isKo ? '최대 재시도 상한 (Max Attempts)' : 'Max Attempts'}:</strong> {isKo ? '동일 작업 실패 시 최대 재시도 횟수(3회)를 넘기면 에이전트가 우회로를 찾거나 사람에게 확인을 요청해야 합니다.' : 'Force fallback or human escalation after 3 failures.'}
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default AgentLoopBreaker;
