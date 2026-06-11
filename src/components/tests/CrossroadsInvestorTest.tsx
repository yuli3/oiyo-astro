'use client';

import { useState } from 'react';
import ShareResultButton from '../shared/ShareResultButton';
import ResultNextSteps from '../shared/ResultNextSteps';

type SupportedLang = 'ko' | 'en' | 'ja';
type InvestorType = 'geopolitical' | 'macro' | 'tech' | 'dollar' | 'balanced';

function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja'] as const).includes(locale as SupportedLang)
    ? (locale as SupportedLang)
    : 'en';
}

interface Option {
  text: Record<SupportedLang, string>;
  scores: Record<InvestorType, number>;
}

interface Question {
  id: string;
  text: Record<SupportedLang, string>;
  options: Option[];
}

interface TypeInfo {
  name: Record<SupportedLang, string>;
  icon: string;
  desc: Record<SupportedLang, string>;
  strategy: Record<SupportedLang, string[]>;
  caution: Record<SupportedLang, string>;
  color: string;
}

const TYPES: Record<InvestorType, TypeInfo> = {
  geopolitical: {
    name: { ko: '지정학 리더형', en: 'Geopolitical Leader', ja: '地政学リーダー型' },
    icon: '🌏',
    desc: { ko: '지정학적 변화에서 투자 기회를 먼저 포착합니다. 전쟁·공급망·에너지 재편을 주도면밀하게 읽는 전략가 타입.', en: 'You spot investment opportunities from geopolitical changes first. A strategist type who reads wars, supply chains, and energy reshaping perceptively.', ja: '地政学的変化から投資機会をいち早く見つけます。戦争・サプライチェーン・エネルギー再編を的確に読む戦略家タイプ。' },
    strategy: {
      ko: ['방위산업 ETF 비중 확대', '에너지 전환 수혜주 (태양광, LNG, 원자력)', '리쇼어링 수혜 지역 (인도, 멕시코, 베트남)', '원자재 및 금 헤지 포지션'],
      en: ['Increase defense industry ETF allocation', 'Energy transition beneficiaries (solar, LNG, nuclear)', 'Reshoring beneficiary regions (India, Mexico, Vietnam)', 'Commodities and gold hedge positions'],
      ja: ['防衛産業ETFの比重拡大', 'エネルギー転換受益株（太陽光、LNG、原子力）', 'リショアリング受益地域（インド、メキシコ、ベトナム）', '原材料と金のヘッジポジション'],
    },
    caution: { ko: '지정학 리스크는 예측이 어렵습니다. 분산 투자를 통해 특정 사건에 과도하게 베팅하지 마세요.', en: 'Geopolitical risks are hard to predict. Diversify to avoid over-betting on specific events.', ja: '地政学リスクは予測が困難です。分散投資で特定事件への過度なベッティングを避けてください。' },
    color: 'indigo',
  },
  macro: {
    name: { ko: '거시경제 분석형', en: 'Macro Analyst', ja: 'マクロ経済分析型' },
    icon: '📊',
    desc: { ko: 'K자 경제, 연준 정책, 금리 사이클을 정밀하게 분석합니다. 데이터와 지표로 시장을 읽는 철저한 분석가 타입.', en: 'You precisely analyze the K-economy, Fed policy, and interest rate cycles. A thorough analyst type who reads the market through data and indicators.', ja: 'K字経済、FRB政策、金利サイクルを精密に分析します。データと指標で市場を読む徹底した分析家タイプ。' },
    strategy: {
      ko: ['금리 사이클에 맞춘 채권-주식 비중 조절', '물가연동채(TIPS)로 인플레이션 헤지', '경기 민감주/방어주 순환 전략', 'K자 상단 자산(빅테크, 프리미엄 부동산) 집중'],
      en: ['Adjust bond-stock allocation based on interest rate cycle', 'Hedge inflation with TIPS', 'Cyclical/defensive stock rotation strategy', 'Focus on K-top assets (big tech, premium real estate)'],
      ja: ['金利サイクルに合わせた債券・株式比重調整', '物価連動債（TIPS）でインフレヘッジ', '景気敏感株/ディフェンシブ株ローテーション戦略', 'K字上部資産（ビッグテック、プレミアム不動産）集中'],
    },
    caution: { ko: '모델이 항상 맞지는 않습니다. 블랙스완 이벤트에 대한 현금 버퍼를 항상 유지하세요.', en: 'Models are not always right. Always maintain a cash buffer for black swan events.', ja: 'モデルは常に正しいわけではありません。ブラックスワンイベントへの現金バッファを常に維持してください。' },
    color: 'blue',
  },
  tech: {
    name: { ko: 'AI·기술 혁신형', en: 'AI & Tech Innovator', ja: 'AI・技術革新型' },
    icon: '🤖',
    desc: { ko: 'AI 혁명의 구조적 성장에 베팅합니다. 기술 변화의 흐름을 읽고 장기 성장 기업에 집중 투자하는 성장 투자자 타입.', en: 'You bet on the structural growth of the AI revolution. A growth investor type who reads technological changes and concentrates on long-term growth companies.', ja: 'AI革命の構造的成長に賭けます。技術変化のトレンドを読み、長期成長企業に集中投資する成長投資家タイプ。' },
    strategy: {
      ko: ['AI 인프라 (엔비디아, TSMC, 데이터센터 리츠)', 'AI 플랫폼 빅테크 장기 보유', 'AI 애플리케이션 수혜 섹터 (헬스케어AI, 로보틱스)', '전력 인프라 (전력망, 원자력, 에너지저장)'],
      en: ['AI infrastructure (Nvidia, TSMC, data center REITs)', 'Long-term holding of AI platform big tech', 'AI application beneficiary sectors (healthcare AI, robotics)', 'Power infrastructure (grid, nuclear, energy storage)'],
      ja: ['AIインフラ（エヌビディア、TSMC、データセンターREIT）', 'AIプラットフォームビッグテック長期保有', 'AIアプリケーション受益セクター（ヘルスケアAI、ロボティクス）', '電力インフラ（電力網、原子力、エネルギー貯蔵）'],
    },
    caution: { ko: '기술 밸류에이션 거품을 주시하세요. 단기 조정에 흔들리지 않는 장기 관점이 필수입니다.', en: 'Watch for tech valuation bubbles. A long-term perspective that is not shaken by short-term corrections is essential.', ja: '技術バリュエーションの泡を注視してください。短期的な調整に揺れない長期的な視点が不可欠です。' },
    color: 'violet',
  },
  dollar: {
    name: { ko: '달러 글로벌 분산형', en: 'Dollar Global Diversifier', ja: 'ドルグローバル分散型' },
    icon: '💱',
    desc: { ko: '달러 사이클과 글로벌 자산 배분을 균형 있게 다룹니다. 환율·지역·자산군 다각화로 리스크를 낮추는 신중한 투자자 타입.', en: 'You balance the dollar cycle and global asset allocation. A cautious investor type who reduces risk through currency, regional, and asset class diversification.', ja: 'ドルサイクルとグローバル資産配分をバランスよく扱います。為替・地域・資産クラスの多角化でリスクを下げる慎重な投資家タイプ。' },
    strategy: {
      ko: ['달러 자산 40~50% + 비달러 선진국 20~25%', '신흥국 고성장 지역 (인도, 동남아) 15~20%', '금·원자재 달러 헤지 10~15%', '환 헤지 ETF 활용'],
      en: ['Dollar assets 40-50% + Non-dollar developed markets 20-25%', 'Emerging market high-growth regions (India, Southeast Asia) 15-20%', 'Gold/commodities dollar hedge 10-15%', 'Currency-hedged ETF utilization'],
      ja: ['ドル資産40~50%＋非ドル先進国20~25%', '新興国高成長地域（インド、東南アジア）15~20%', '金・原材料ドルヘッジ10~15%', '為替ヘッジETF活用'],
    },
    caution: { ko: '지나친 분산은 수익률을 희석시킵니다. 핵심 포지션은 견고하게 유지하고 주변 분산에 집중하세요.', en: 'Excessive diversification dilutes returns. Keep core positions solid and focus on peripheral diversification.', ja: '過度な分散は収益率を希釈します。コアポジションは堅固に維持し、周辺の分散に集中してください。' },
    color: 'emerald',
  },
  balanced: {
    name: { ko: '균형 포트폴리오형', en: 'Balanced Portfolio', ja: 'バランスポートフォリオ型' },
    icon: '⚖️',
    desc: { ko: '어느 한쪽에 과도하게 베팅하지 않습니다. 다양한 리스크 요인을 고려하여 안정적이고 지속 가능한 수익을 추구하는 신중한 투자자.', en: 'You do not over-bet on any one side. A prudent investor who considers various risk factors to pursue stable, sustainable returns.', ja: 'どちらかに過度にベッティングしません。様々なリスク要因を考慮し、安定的で持続可能なリターンを追求する慎重な投資家。' },
    strategy: {
      ko: ['글로벌 주식 60% + 채권 30% + 대체자산 10%', '리밸런싱 분기 1회 규칙적으로 실행', '저비용 인덱스 ETF 중심', '현금 5~10% 항상 유지'],
      en: ['Global stocks 60% + bonds 30% + alternative assets 10%', 'Regular rebalancing once per quarter', 'Low-cost index ETF focus', 'Always maintain 5-10% cash'],
      ja: ['グローバル株式60%＋債券30%＋代替資産10%', 'リバランスを四半期に1回定期実施', '低コストインデックスETF中心', '現金5~10%を常に維持'],
    },
    caution: { ko: '시장이 과열될 때 더 공격적으로, 하락할 때 더 방어적으로 전술적 조정을 가하는 것을 두려워하지 마세요.', en: "Don't be afraid to make tactical adjustments — more aggressive when the market is overheated, more defensive when it falls.", ja: '市場が過熱したときはより積極的に、下落したときはよりディフェンシブに戦術的調整を行うことを恐れないでください。' },
    color: 'slate',
  },
};

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: { ko: '러시아-우크라이나 전쟁이 장기화될 때, 당신의 첫 반응은?', en: 'When the Russia-Ukraine war drags on, what is your first reaction?', ja: 'ロシア・ウクライナ戦争が長期化したとき、あなたの最初の反応は？' },
    options: [
      { text: { ko: '방산주와 에너지 ETF를 찾는다', en: 'Look for defense stocks and energy ETFs', ja: '防衛株とエネルギーETFを探す' }, scores: { geopolitical: 4, macro: 1, tech: 1, dollar: 2, balanced: 2 } },
      { text: { ko: '인플레이션 영향을 계산하고 채권 비중을 조정한다', en: 'Calculate inflation impact and adjust bond allocation', ja: 'インフレへの影響を計算し債券比重を調整する' }, scores: { geopolitical: 1, macro: 4, tech: 1, dollar: 2, balanced: 2 } },
      { text: { ko: '단기 노이즈이므로 AI·기술주 보유를 유지한다', en: 'It\'s short-term noise, so I maintain my AI/tech stock holdings', ja: '短期的なノイズなのでAI・技術株の保有を維持する' }, scores: { geopolitical: 1, macro: 1, tech: 4, dollar: 1, balanced: 2 } },
      { text: { ko: '달러와 금 비중을 높여 헤지한다', en: 'Increase dollar and gold allocation to hedge', ja: 'ドルと金の比重を高めてヘッジする' }, scores: { geopolitical: 2, macro: 2, tech: 0, dollar: 4, balanced: 2 } },
    ],
  },
  {
    id: 'q2',
    text: { ko: '연준이 갑자기 금리를 올린다는 발표를 했습니다. 당신의 선택은?', en: 'The Fed suddenly announced a rate hike. What is your choice?', ja: 'FRBが突然利上げを発表しました。あなたの選択は？' },
    options: [
      { text: { ko: '공급망 관련 인플레이션 수혜주를 찾는다', en: 'Look for supply chain-related inflation beneficiaries', ja: 'サプライチェーン関連インフレ受益株を探す' }, scores: { geopolitical: 3, macro: 2, tech: 1, dollar: 2, balanced: 2 } },
      { text: { ko: '단기채로 이동해 높은 금리 수익을 확보한다', en: 'Move to short-term bonds to secure high interest income', ja: '短期債に移行して高い金利収益を確保する' }, scores: { geopolitical: 0, macro: 4, tech: 0, dollar: 3, balanced: 3 } },
      { text: { ko: '밸류에이션이 높은 성장주는 일부 줄이지만 AI 핵심주는 유지', en: 'Reduce some high-valuation growth stocks but maintain core AI stocks', ja: 'バリュエーションが高い成長株は一部減らすがAIコア株は維持' }, scores: { geopolitical: 1, macro: 2, tech: 4, dollar: 1, balanced: 2 } },
      { text: { ko: '전체 포트폴리오를 점검하고 리밸런싱한다', en: 'Review the entire portfolio and rebalance', ja: 'ポートフォリオ全体を見直し、リバランスする' }, scores: { geopolitical: 1, macro: 2, tech: 1, dollar: 2, balanced: 4 } },
    ],
  },
  {
    id: 'q3',
    text: { ko: 'AI 기업의 주가가 급락했습니다. 당신의 반응은?', en: 'AI company stocks have plummeted. What is your reaction?', ja: 'AI企業の株価が急落しました。あなたの反応は？' },
    options: [
      { text: { ko: '지정학 리스크가 원인인지 먼저 분석한다', en: 'First analyze whether geopolitical risk is the cause', ja: '地政学リスクが原因か先に分析する' }, scores: { geopolitical: 4, macro: 2, tech: 1, dollar: 1, balanced: 2 } },
      { text: { ko: '금리 상승이 원인이면 조정은 자연스럽다. 경기 데이터를 확인한다', en: 'If rate hikes are the cause, correction is natural. Check economic data', ja: '利上げが原因なら調整は自然。景気データを確認する' }, scores: { geopolitical: 1, macro: 4, tech: 2, dollar: 1, balanced: 2 } },
      { text: { ko: '장기 AI 성장 스토리는 변함없다. 추가 매수 기회다', en: 'The long-term AI growth story is unchanged. It\'s a buying opportunity', ja: '長期的なAI成長ストーリーは変わらない。追加買いのチャンスだ' }, scores: { geopolitical: 1, macro: 1, tech: 4, dollar: 0, balanced: 1 } },
      { text: { ko: '포트폴리오 내 비중이 과도하면 일부 이익실현한다', en: 'If the portfolio weight is excessive, take partial profits', ja: 'ポートフォリオ内の比重が過大なら一部利益確定する' }, scores: { geopolitical: 1, macro: 2, tech: 1, dollar: 2, balanced: 4 } },
    ],
  },
  {
    id: 'q4',
    text: { ko: '달러가 갑자기 10% 약세를 보입니다. 당신은?', en: 'The dollar suddenly weakens by 10%. What do you do?', ja: 'ドルが突然10%弱くなります。あなたは？' },
    options: [
      { text: { ko: '지정학 리스크 고조가 원인이면 금과 원자재를 더 산다', en: 'If heightened geopolitical risk is the cause, buy more gold and commodities', ja: '地政学リスクの高まりが原因なら金と原材料をさらに買う' }, scores: { geopolitical: 4, macro: 2, tech: 0, dollar: 2, balanced: 2 } },
      { text: { ko: '연준 정책 변화 때문이면 단기채와 물가연동채로 이동', en: 'If it\'s due to Fed policy change, move to short-term bonds and TIPS', ja: 'FRB政策変更が原因なら短期債と物価連動債に移行' }, scores: { geopolitical: 1, macro: 4, tech: 1, dollar: 2, balanced: 2 } },
      { text: { ko: '달러 약세는 글로벌 성장주에 유리하다. 기술주 보유 유지', en: 'Dollar weakness is favorable for global growth stocks. Maintain tech holdings', ja: 'ドル安はグローバル成長株に有利。技術株保有を維持' }, scores: { geopolitical: 1, macro: 1, tech: 3, dollar: 2, balanced: 2 } },
      { text: { ko: '비달러 자산(유럽, 신흥국) 비중을 높인다', en: 'Increase non-dollar assets (Europe, emerging markets)', ja: '非ドル資産（欧州、新興国）の比重を高める' }, scores: { geopolitical: 2, macro: 2, tech: 1, dollar: 4, balanced: 2 } },
    ],
  },
  {
    id: 'q5',
    text: { ko: '10년 후를 봤을 때 세계 경제 성장의 핵심 엔진은 무엇이라고 생각하나요?', en: 'Looking 10 years ahead, what do you think will be the core engine of global economic growth?', ja: '10年後を見据えたとき、世界経済成長の核心エンジンは何だと思いますか？' },
    options: [
      { text: { ko: '지정학 재편으로 새롭게 부상하는 지역 (인도, 중동, 동남아)', en: 'Regions newly emerging from geopolitical reshaping (India, Middle East, SE Asia)', ja: '地政学的再編で新たに台頭する地域（インド、中東、東南アジア）' }, scores: { geopolitical: 4, macro: 1, tech: 1, dollar: 3, balanced: 1 } },
      { text: { ko: '금리와 재정 정책을 잘 쓰는 선진국 경제', en: 'Developed economies that use interest rate and fiscal policy well', ja: '金利と財政政策をうまく活用する先進国経済' }, scores: { geopolitical: 1, macro: 4, tech: 1, dollar: 2, balanced: 2 } },
      { text: { ko: 'AI와 기술 혁명이 만드는 생산성 혁명', en: 'Productivity revolution created by AI and tech revolution', ja: 'AIと技術革命が生む生産性革命' }, scores: { geopolitical: 0, macro: 1, tech: 5, dollar: 1, balanced: 1 } },
      { text: { ko: '특정 엔진보다 균형 잡힌 글로벌 분산이 더 중요하다', en: 'Balanced global diversification is more important than any specific engine', ja: '特定エンジンより均衡のとれたグローバル分散の方が重要' }, scores: { geopolitical: 1, macro: 1, tech: 1, dollar: 2, balanced: 4 } },
    ],
  },
  {
    id: 'q6',
    text: { ko: '투자할 때 가장 먼저 확인하는 것은?', en: 'What do you check first when investing?', ja: '投資するとき最初に確認することは？' },
    options: [
      { text: { ko: '해당 국가나 산업의 지정학적 리스크', en: 'Geopolitical risks of the country or industry', ja: '当該国や産業の地政学的リスク' }, scores: { geopolitical: 5, macro: 1, tech: 0, dollar: 1, balanced: 1 } },
      { text: { ko: '금리, 인플레이션, GDP 성장률 등 거시지표', en: 'Macro indicators like interest rates, inflation, GDP growth', ja: '金利、インフレ、GDP成長率などのマクロ指標' }, scores: { geopolitical: 1, macro: 5, tech: 1, dollar: 1, balanced: 2 } },
      { text: { ko: '해당 기업의 기술적 해자와 AI 경쟁력', en: 'The company\'s technological moat and AI competitiveness', ja: '当該企業の技術的な堀とAI競争力' }, scores: { geopolitical: 0, macro: 1, tech: 5, dollar: 0, balanced: 1 } },
      { text: { ko: '환율과 글로벌 자금 흐름', en: 'Exchange rates and global capital flows', ja: '為替とグローバル資金の流れ' }, scores: { geopolitical: 1, macro: 2, tech: 0, dollar: 5, balanced: 2 } },
    ],
  },
];

const LABELS = {
  ko: {
    title: '갈림길 경제 투자 성향 퀴즈',
    subtitle: '당신은 어떤 투자자 유형인가요?',
    instruction: '각 상황에서 당신의 반응과 가장 가까운 것을 선택하세요.',
    result: '나의 투자 유형',
    strategy: '추천 투자 전략',
    caution: '주의사항',
    restart: '다시 하기',
    next: '다음',
    prev: '이전',
    submit: '결과 보기',
    note: '이 퀴즈는 투자 성향 파악을 위한 참고 도구입니다. 투자 조언이 아닙니다.',
  },
  en: {
    title: 'Crossroads Economy Investor Quiz',
    subtitle: 'What type of investor are you?',
    instruction: 'Select the response closest to yours in each situation.',
    result: 'My Investor Type',
    strategy: 'Recommended Investment Strategy',
    caution: 'Caution',
    restart: 'Restart',
    next: 'Next',
    prev: 'Previous',
    submit: 'See Results',
    note: 'This quiz is a reference tool for understanding investment tendencies. It is not investment advice.',
  },
  ja: {
    title: '岐路経済投資傾向クイズ',
    subtitle: 'あなたはどの投資家タイプですか？',
    instruction: '各状況でのあなたの反応に最も近いものを選んでください。',
    result: '私の投資タイプ',
    strategy: 'おすすめ投資戦略',
    caution: '注意事項',
    restart: 'やり直す',
    next: '次へ',
    prev: '前へ',
    submit: '結果を見る',
    note: 'このクイズは投資傾向を把握するための参考ツールです。投資アドバイスではありません。',
  },
};

const COLOR_MAP: Record<string, { bg: string; border: string; badge: string; text: string }> = {
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-700', text: 'text-indigo-700' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', text: 'text-blue-700' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700', text: 'text-violet-700' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700', text: 'text-emerald-700' },
  slate: { bg: 'bg-slate-50', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-700', text: 'text-slate-700' },
};

interface Props { locale?: string; }

export default function CrossroadsInvestorTest({ locale: lp = 'ko' }: Props) {
  const L = lang(lp);
  const locale = L;
  const lb = LABELS[L];
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const q = QUESTIONS[current];
  const total = QUESTIONS.length;
  const progress = ((current + 1) / total) * 100;

  const handleAnswer = (optionIdx: number) => { setSelected(optionIdx); };

  const handleNext = () => {
    if (selected === null) return;
    setAnswers(prev => ({ ...prev, [q.id]: selected }));
    setSelected(null);
    if (current < total - 1) setCurrent(c => c + 1);
    else {
      const finalAnswers = { ...answers, [q.id]: selected };
      setAnswers(finalAnswers);
      setDone(true);
    }
  };

  const handlePrev = () => {
    if (selected !== null) setAnswers(prev => ({ ...prev, [q.id]: selected }));
    setSelected(null);
    if (current > 0) setCurrent(c => c - 1);
  };

  const handleRestart = () => { setAnswers({}); setCurrent(0); setDone(false); setSelected(null); };

  const computeResult = (): InvestorType => {
    const totals: Record<InvestorType, number> = { geopolitical: 0, macro: 0, tech: 0, dollar: 0, balanced: 0 };
    QUESTIONS.forEach(q => {
      const ans = answers[q.id];
      if (ans !== undefined) {
        const opt = q.options[ans];
        (Object.keys(opt.scores) as InvestorType[]).forEach(t => { totals[t] += opt.scores[t]; });
      }
    });
    return (Object.entries(totals) as [InvestorType, number][]).reduce((a, b) => b[1] > a[1] ? b : a)[0];
  };

  if (done) {
    const type = computeResult();
    const info = TYPES[type];
    const colors = COLOR_MAP[info.color];
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className={`rounded-3xl border-2 ${colors.border} ${colors.bg} p-8 text-center`}>
          <div className="text-5xl mb-3">{info.icon}</div>
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${colors.badge}`}>{lb.result}</div>
          <h2 className={`text-2xl font-black mb-3 ${colors.text}`}>{info.name[L]}</h2>
          <p className="text-slate-600 leading-relaxed">{info.desc[L]}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4">📋 {lb.strategy}</h3>
          <ul className="space-y-2">
            {info.strategy[L].map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className={`font-bold mt-0.5 ${colors.text}`}>✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
          <h3 className="font-bold text-amber-800 mb-2">⚠️ {lb.caution}</h3>
          <p className="text-sm text-amber-700">{info.caution[L]}</p>
        </div>

        <p className="text-center text-xs text-slate-400">{lb.note}</p>
        <ShareResultButton
          locale={locale}
          heading={lb.title}
          resultTitle={info.name[L]}
          emoji={info.icon}
          description={info.desc[L]}
        />
        <ResultNextSteps
          locale={locale}
          links={[
            { href: `/${locale}/political/test`, label: locale === 'ko' ? '🧭 정치 나침반 테스트' : locale === 'ja' ? '🧭 政治コンパステスト' : '🧭 Political compass test' },
            { href: `/${locale}/ontology/luck`, label: locale === 'ko' ? '🍀 운 온톨로지' : locale === 'ja' ? '🍀 運のオントロジー' : '🍀 Luck ontology' },
            { href: `/${locale}/today`, label: locale === 'ko' ? '📅 오늘의 운세' : locale === 'ja' ? '📅 今日の運勢' : '📅 Today' },
          ]}
        />

        <button onClick={handleRestart} className="w-full py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900 transition-colors">
          {lb.restart}
        </button>
      </div>
    );
  }

  const prevAnswer = answers[q.id];
  const displaySelected = selected !== null ? selected : (prevAnswer !== undefined ? prevAnswer : null);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center">
        <div className="text-3xl mb-2">💹</div>
        <h1 className="text-2xl font-bold text-slate-900">{lb.title}</h1>
        <p className="text-slate-500 text-sm mt-1">{lb.subtitle}</p>
      </div>

      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>{current + 1} / {total}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <p className="text-lg font-semibold text-slate-800 leading-relaxed mb-6">{q.text[L]}</p>
        <div className="space-y-3">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm ${
                displaySelected === idx
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold'
                  : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
              }`}
            >
              <span className={`inline-block w-6 h-6 rounded-full border-2 mr-2 align-middle flex-shrink-0 ${displaySelected === idx ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'}`} />
              {opt.text[L]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        {current > 0 && (
          <button onClick={handlePrev} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50">
            {lb.prev}
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={displaySelected === null}
          className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {current === total - 1 ? lb.submit : lb.next}
        </button>
      </div>
      <p className="text-center text-xs text-slate-400">{lb.instruction}</p>
    </div>
  );
}
