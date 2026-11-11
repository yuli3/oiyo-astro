import { useState } from 'react';

import ExplainLab from '../../shared/ExplainLab';
import { gaEvent } from '@/lib/analytics/ga-event';

// 토정비결 괘 번호를 고르는 "나머지" 규칙. 합을 8·6·3으로 나눈 나머지(0이면 나누는 수)가 괘 숫자다.
// 실제 세 괘는 합이 서로 다르다(나이+태세, 달 일수+월건, 생일+일진). 여기서는 규칙만 보여 준다. ko 전용.

const DIVS = [
  { name: '상괘', div: 8 },
  { name: '중괘', div: 6 },
  { name: '하괘', div: 3 },
];
const rem = (n: number, d: number) => (n % d === 0 ? d : n % d);

function Dial({ div, value }: { div: number; value: number }) {
  const R = 34;
  return (
    <svg viewBox="0 0 90 90" className="mx-auto w-full max-w-24" aria-hidden="true">
      {Array.from({ length: div }, (_, i) => {
        const a = (i / div) * Math.PI * 2 - Math.PI / 2;
        const cx = 45 + R * Math.cos(a);
        const cy = 45 + R * Math.sin(a);
        const on = i + 1 === value;
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={on ? 11 : 8} className={on ? 'fill-primary' : 'fill-muted'} />
            <text x={cx} y={cy + 4} textAnchor="middle" className={on ? 'fill-primary-foreground text-xs font-black' : 'fill-muted-foreground text-xs'}>{i + 1}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function TojeongRemainderLab() {
  const [sum, setSum] = useState(47);
  return (
    <ExplainLab
      locale="ko"
      title="괘 숫자는 나머지로 골라요"
      intro="토정비결은 숫자 셋을 더한 합을 상괘는 8, 중괘는 6, 하괘는 3으로 나눠요. 나머지가 괘 숫자이고, 딱 나누어떨어지면 나누는 수 그대로예요. 합을 움직여 보세요."
      note="실제 세 괘의 합은 서로 달라요(상괘 나이+태세수, 중괘 그 달 날수+월건수, 하괘 생일+일진수). 여기서는 같은 합으로 규칙만 보여 줘요."
      conclusion={
        <p>
          합이 <b>{sum}</b>이면 {DIVS.map((d, i) => (
            <span key={d.name}>{i ? ', ' : ''}{d.name} {sum}÷{d.div} → <b>{rem(sum, d.div)}</b></span>
          ))}
          . 세 숫자를 이어 쓴 <b>{DIVS.map((d) => rem(sum, d.div)).join('')}</b>이 괘 번호가 돼요.
        </p>
      }
    >
      <div className="grid grid-cols-3 gap-2 text-center text-sm font-bold">
        {DIVS.map((d) => (
          <div key={d.name}>
            <Dial div={d.div} value={rem(sum, d.div)} />
            <p className="mt-1">{d.name} (÷{d.div})</p>
          </div>
        ))}
      </div>
      <label className="mt-3 block text-xs text-muted-foreground">
        합: <b className="text-foreground">{sum}</b>
        <input
          type="range"
          min={2}
          max={90}
          value={sum}
          onChange={(e) => setSum(Number(e.target.value))}
          onPointerUp={() => gaEvent('explain_lab', { lab: 'tojeong-remainder' })}
          className="mt-1 block min-h-11 w-full accent-primary"
        />
      </label>
    </ExplainLab>
  );
}
