'use client';

import { useEffect, useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { Questionnaire } from '@/components/ui/questionnaire';
import ShareResultButton from '../shared/ShareResultButton';
import ResultNextSteps from '../shared/ResultNextSteps';
import CopyResultLink from '../shared/CopyResultLink';
import { readResultCode, writeResultCode, clearResultCode } from '../../lib/result-url';

type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es';
type InvestorType = 'geopolitical' | 'macro' | 'tech' | 'dollar' | 'balanced';
const INVESTOR_TYPES: InvestorType[] = ['geopolitical', 'macro', 'tech', 'dollar', 'balanced'];

function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as SupportedLang)
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
    name: { ko: '지정학 리더형', en: 'Geopolitical Leader', ja: '地政学リーダー型', zh: '地缘政治引领型', fr: 'Stratège géopolitique', es: 'Estratega geopolítico' },
    icon: '🌏',
    desc: { ko: '지정학적 변화에서 투자 기회를 먼저 포착합니다. 전쟁·공급망·에너지 재편을 주도면밀하게 읽는 전략가 타입.', en: 'You spot investment opportunities from geopolitical changes first. A strategist type who reads wars, supply chains, and energy reshaping perceptively.', ja: '地政学的変化から投資機会をいち早く見つけます。戦争・サプライチェーン・エネルギー再編を的確に読む戦略家タイプ。', zh: '你会率先从地缘政治变化中捕捉投资机会。是缜密解读战争、供应链与能源重组的战略家。', fr: 'Vous repérez avant les autres les opportunités nées des changements géopolitiques. Un stratège qui lit avec minutie les guerres, les chaînes d’approvisionnement et la recomposition énergétique.', es: 'Detectas antes que nadie las oportunidades de inversión en los cambios geopolíticos. Un estratega que lee con detalle guerras, cadenas de suministro y la reorganización energética.' },
    strategy: {
      ko: ['방위산업 ETF 비중 확대', '에너지 전환 수혜주 (태양광, LNG, 원자력)', '리쇼어링 수혜 지역 (인도, 멕시코, 베트남)', '원자재 및 금 헤지 포지션'],
      en: ['Increase defense industry ETF allocation', 'Energy transition beneficiaries (solar, LNG, nuclear)', 'Reshoring beneficiary regions (India, Mexico, Vietnam)', 'Commodities and gold hedge positions'],
      ja: ['防衛産業ETFの比重拡大', 'エネルギー転換受益株（太陽光、LNG、原子力）', 'リショアリング受益地域（インド、メキシコ、ベトナム）', '原材料と金のヘッジポジション'],
      zh: ['提高国防产业 ETF 比重', '能源转型受益股（太阳能、液化天然气、核能）', '制造业回流受益地区（印度、墨西哥、越南）', '原材料及黄金对冲部位'],
      fr: ['Renforcer le poids des ETF de défense', 'Valeurs bénéficiant de la transition énergétique (solaire, GNL, nucléaire)', 'Régions bénéficiant de la relocalisation (Inde, Mexique, Vietnam)', 'Positions de couverture en matières premières et en or'],
      es: ['Aumentar el peso de ETF de defensa', 'Valores beneficiados por la transición energética (solar, GNL, nuclear)', 'Regiones beneficiadas por la relocalización (India, México, Vietnam)', 'Posiciones de cobertura en materias primas y oro'],
    },
    caution: { ko: '지정학 리스크는 예측이 어렵습니다. 분산 투자를 통해 특정 사건에 과도하게 베팅하지 마세요.', en: 'Geopolitical risks are hard to predict. Diversify to avoid over-betting on specific events.', ja: '地政学リスクは予測が困難です。分散投資で特定事件への過度なベッティングを避けてください。', zh: '地缘政治风险难以预测。请通过分散投资，避免对单一事件押注过重。', fr: 'Le risque géopolitique est difficile à prévoir. Diversifiez pour ne pas trop miser sur un événement précis.', es: 'El riesgo geopolítico es difícil de prever. Diversifica para no apostar demasiado a un único acontecimiento.' },
    color: 'indigo',
  },
  macro: {
    name: { ko: '거시경제 분석형', en: 'Macro Analyst', ja: 'マクロ経済分析型', zh: '宏观经济分析型', fr: 'Analyste macroéconomique', es: 'Analista macroeconómico' },
    icon: '📊',
    desc: { ko: 'K자 경제, 연준 정책, 금리 사이클을 정밀하게 분석합니다. 데이터와 지표로 시장을 읽는 철저한 분석가 타입.', en: 'You precisely analyze the K-economy, Fed policy, and interest rate cycles. A thorough analyst type who reads the market through data and indicators.', ja: 'K字経済、FRB政策、金利サイクルを精密に分析します。データと指標で市場を読む徹底した分析家タイプ。', zh: '精细分析 K 型经济、美联储政策与利率周期。是用数据和指标解读市场的彻底分析者。', fr: 'Vous analysez finement l’économie en K, la politique de la Fed et les cycles de taux. Un analyste rigoureux qui lit le marché à travers les données et les indicateurs.', es: 'Analizas con precisión la economía en K, la política de la Fed y el ciclo de tipos. Un analista riguroso que lee el mercado con datos e indicadores.' },
    strategy: {
      ko: ['금리 사이클에 맞춘 채권-주식 비중 조절', '물가연동채(TIPS)로 인플레이션 헤지', '경기 민감주/방어주 순환 전략', 'K자 상단 자산(빅테크, 프리미엄 부동산) 집중'],
      en: ['Adjust bond-stock allocation based on interest rate cycle', 'Hedge inflation with TIPS', 'Cyclical/defensive stock rotation strategy', 'Focus on K-top assets (big tech, premium real estate)'],
      ja: ['金利サイクルに合わせた債券・株式比重調整', '物価連動債（TIPS）でインフレヘッジ', '景気敏感株/ディフェンシブ株ローテーション戦略', 'K字上部資産（ビッグテック、プレミアム不動産）集中'],
      zh: ['依利率周期调整股债比重', '用通胀保值债券（TIPS）对冲通胀', '景气敏感股与防御股的轮动策略', '集中于 K 型上端资产（大型科技股、高端房地产）'],
      fr: ['Ajuster le poids actions-obligations selon le cycle des taux', 'Se couvrir contre l’inflation avec des obligations indexées (TIPS)', 'Rotation entre valeurs cycliques et défensives', 'Se concentrer sur les actifs du haut du K (grandes tech, immobilier haut de gamme)'],
      es: ['Ajustar el peso de bonos y acciones según el ciclo de tipos', 'Cubrir la inflación con bonos ligados a la inflación (TIPS)', 'Rotación entre valores cíclicos y defensivos', 'Concentrarse en activos de la parte alta de la K (grandes tecnológicas, inmobiliario premium)'],
    },
    caution: { ko: '모델이 항상 맞지는 않습니다. 블랙스완 이벤트에 대한 현금 버퍼를 항상 유지하세요.', en: 'Models are not always right. Always maintain a cash buffer for black swan events.', ja: 'モデルは常に正しいわけではありません。ブラックスワンイベントへの現金バッファを常に維持してください。', zh: '模型并不总是对的。请始终为黑天鹅事件保留现金缓冲。', fr: 'Les modèles ne sont pas toujours justes. Gardez toujours un coussin de liquidités face aux « cygnes noirs ».', es: 'Los modelos no siempre aciertan. Mantén siempre un colchón de liquidez ante los «cisnes negros».' },
    color: 'blue',
  },
  tech: {
    name: { ko: 'AI·기술 혁신형', en: 'AI & Tech Innovator', ja: 'AI・技術革新型', zh: 'AI・科技创新型', fr: 'Innovateur IA et tech', es: 'Innovador en IA y tecnología' },
    icon: '🤖',
    desc: { ko: 'AI 혁명의 구조적 성장에 베팅합니다. 기술 변화의 흐름을 읽고 장기 성장 기업에 집중 투자하는 성장 투자자 타입.', en: 'You bet on the structural growth of the AI revolution. A growth investor type who reads technological changes and concentrates on long-term growth companies.', ja: 'AI革命の構造的成長に賭けます。技術変化のトレンドを読み、長期成長企業に集中投資する成長投資家タイプ。', zh: '押注 AI 革命的结构性增长。是读懂技术变化潮流、集中投资长期成长企业的成长型投资者。', fr: 'Vous misez sur la croissance structurelle de la révolution de l’IA. Un investisseur de croissance qui suit les mutations technologiques et se concentre sur les entreprises à long terme.', es: 'Apuestas por el crecimiento estructural de la revolución de la IA. Un inversor de crecimiento que sigue el cambio tecnológico y se concentra en empresas de largo plazo.' },
    strategy: {
      ko: ['AI 인프라 (엔비디아, TSMC, 데이터센터 리츠)', 'AI 플랫폼 빅테크 장기 보유', 'AI 애플리케이션 수혜 섹터 (헬스케어AI, 로보틱스)', '전력 인프라 (전력망, 원자력, 에너지저장)'],
      en: ['AI infrastructure (Nvidia, TSMC, data center REITs)', 'Long-term holding of AI platform big tech', 'AI application beneficiary sectors (healthcare AI, robotics)', 'Power infrastructure (grid, nuclear, energy storage)'],
      ja: ['AIインフラ（エヌビディア、TSMC、データセンターREIT）', 'AIプラットフォームビッグテック長期保有', 'AIアプリケーション受益セクター（ヘルスケアAI、ロボティクス）', '電力インフラ（電力網、原子力、エネルギー貯蔵）'],
      zh: ['AI 基础设施（英伟达、台积电、数据中心 REITs）', '长期持有 AI 平台大型科技股', 'AI 应用受益板块（医疗 AI、机器人）', '电力基础设施（电网、核能、储能）'],
      fr: ['Infrastructures d’IA (Nvidia, TSMC, foncières de centres de données)', 'Détention à long terme des grandes plateformes tech d’IA', 'Secteurs bénéficiant des applications d’IA (IA santé, robotique)', 'Infrastructures électriques (réseaux, nucléaire, stockage d’énergie)'],
      es: ['Infraestructura de IA (Nvidia, TSMC, SOCIMI de centros de datos)', 'Mantener a largo plazo las grandes plataformas tecnológicas de IA', 'Sectores beneficiados por aplicaciones de IA (IA sanitaria, robótica)', 'Infraestructura eléctrica (redes, nuclear, almacenamiento de energía)'],
    },
    caution: { ko: '기술 밸류에이션 거품을 주시하세요. 단기 조정에 흔들리지 않는 장기 관점이 필수입니다.', en: 'Watch for tech valuation bubbles. A long-term perspective that is not shaken by short-term corrections is essential.', ja: '技術バリュエーションの泡を注視してください。短期的な調整に揺れない長期的な視点が不可欠です。', zh: '留意科技估值泡沫。不被短期调整动摇的长期视角是必需的。', fr: 'Surveillez les bulles de valorisation tech. Une vision de long terme, insensible aux corrections, est indispensable.', es: 'Vigila las burbujas de valoración tecnológica. Es imprescindible una visión a largo plazo que no se altere con las correcciones.' },
    color: 'violet',
  },
  dollar: {
    name: { ko: '달러 글로벌 분산형', en: 'Dollar Global Diversifier', ja: 'ドルグローバル分散型', zh: '美元全球分散型', fr: 'Diversificateur mondial en dollars', es: 'Diversificador global en dólares' },
    icon: '💱',
    desc: { ko: '달러 사이클과 글로벌 자산 배분을 균형 있게 다룹니다. 환율·지역·자산군 다각화로 리스크를 낮추는 신중한 투자자 타입.', en: 'You balance the dollar cycle and global asset allocation. A cautious investor type who reduces risk through currency, regional, and asset class diversification.', ja: 'ドルサイクルとグローバル資産配分をバランスよく扱います。為替・地域・資産クラスの多角化でリスクを下げる慎重な投資家タイプ。', zh: '平衡处理美元周期与全球资产配置。是以汇率、地区、资产类别多元化降低风险的谨慎投资者。', fr: 'Vous gérez de façon équilibrée le cycle du dollar et l’allocation mondiale. Un investisseur prudent qui réduit le risque en diversifiant devises, régions et classes d’actifs.', es: 'Gestionas con equilibrio el ciclo del dólar y la asignación global de activos. Un inversor prudente que reduce el riesgo diversificando divisas, regiones y clases de activos.' },
    strategy: {
      ko: ['달러 자산 40~50% + 비달러 선진국 20~25%', '신흥국 고성장 지역 (인도, 동남아) 15~20%', '금·원자재 달러 헤지 10~15%', '환 헤지 ETF 활용'],
      en: ['Dollar assets 40-50% + Non-dollar developed markets 20-25%', 'Emerging market high-growth regions (India, Southeast Asia) 15-20%', 'Gold/commodities dollar hedge 10-15%', 'Currency-hedged ETF utilization'],
      ja: ['ドル資産40~50%＋非ドル先進国20~25%', '新興国高成長地域（インド、東南アジア）15~20%', '金・原材料ドルヘッジ10~15%', '為替ヘッジETF活用'],
      zh: ['美元资产 40–50% + 非美元发达市场 20–25%', '新兴市场高增长地区（印度、东南亚）15–20%', '黄金・原材料美元对冲 10–15%', '利用汇率对冲 ETF'],
      fr: ['Actifs en dollars 40–50 % + pays développés hors dollar 20–25 %', 'Régions émergentes à forte croissance (Inde, Asie du Sud-Est) 15–20 %', 'Or et matières premières en couverture du dollar 10–15 %', 'Recourir à des ETF couverts contre le change'],
      es: ['Activos en dólares 40–50 % + desarrollados no dólar 20–25 %', 'Regiones emergentes de alto crecimiento (India, Sudeste Asiático) 15–20 %', 'Oro y materias primas como cobertura del dólar 10–15 %', 'Usar ETF con cobertura de divisa'],
    },
    caution: { ko: '지나친 분산은 수익률을 희석시킵니다. 핵심 포지션은 견고하게 유지하고 주변 분산에 집중하세요.', en: 'Excessive diversification dilutes returns. Keep core positions solid and focus on peripheral diversification.', ja: '過度な分散は収益率を希釈します。コアポジションは堅固に維持し、周辺の分散に集中してください。', zh: '过度分散会稀释收益。请牢牢守住核心部位，把分散集中在外围。', fr: 'Trop diversifier dilue le rendement. Gardez des positions clés solides et diversifiez à la marge.', es: 'Diversificar en exceso diluye la rentabilidad. Mantén firmes las posiciones clave y diversifica en la periferia.' },
    color: 'emerald',
  },
  balanced: {
    name: { ko: '균형 포트폴리오형', en: 'Balanced Portfolio', ja: 'バランスポートフォリオ型', zh: '平衡组合型', fr: 'Portefeuille équilibré', es: 'Cartera equilibrada' },
    icon: '⚖️',
    desc: { ko: '어느 한쪽에 과도하게 베팅하지 않습니다. 다양한 리스크 요인을 고려하여 안정적이고 지속 가능한 수익을 추구하는 신중한 투자자.', en: 'You do not over-bet on any one side. A prudent investor who considers various risk factors to pursue stable, sustainable returns.', ja: 'どちらかに過度にベッティングしません。様々なリスク要因を考慮し、安定的で持続可能なリターンを追求する慎重な投資家。', zh: '不会对任何一方押注过重。是综合考虑各种风险因素、追求稳定可持续收益的谨慎投资者。', fr: 'Vous ne misez jamais trop d’un seul côté. Un investisseur prudent qui tient compte de multiples risques pour viser un rendement stable et durable.', es: 'Nunca apuestas demasiado a un solo lado. Un inversor prudente que tiene en cuenta múltiples riesgos para buscar una rentabilidad estable y sostenible.' },
    strategy: {
      ko: ['글로벌 주식 60% + 채권 30% + 대체자산 10%', '리밸런싱 분기 1회 규칙적으로 실행', '저비용 인덱스 ETF 중심', '현금 5~10% 항상 유지'],
      en: ['Global stocks 60% + bonds 30% + alternative assets 10%', 'Regular rebalancing once per quarter', 'Low-cost index ETF focus', 'Always maintain 5-10% cash'],
      ja: ['グローバル株式60%＋債券30%＋代替資産10%', 'リバランスを四半期に1回定期実施', '低コストインデックスETF中心', '現金5~10%を常に維持'],
      zh: ['全球股票 60% + 债券 30% + 另类资产 10%', '每季度规律地再平衡一次', '以低成本指数 ETF 为主', '始终保留 5–10% 现金'],
      fr: ['Actions mondiales 60 % + obligations 30 % + actifs alternatifs 10 %', 'Rééquilibrer régulièrement une fois par trimestre', 'Privilégier les ETF indiciels à bas coût', 'Garder toujours 5–10 % de liquidités'],
      es: ['Acciones globales 60 % + bonos 30 % + activos alternativos 10 %', 'Reequilibrar con regularidad una vez por trimestre', 'Priorizar ETF indexados de bajo coste', 'Mantener siempre un 5–10 % en liquidez'],
    },
    caution: { ko: '시장이 과열될 때 더 공격적으로, 하락할 때 더 방어적으로 전술적 조정을 가하는 것을 두려워하지 마세요.', en: "Don't be afraid to make tactical adjustments — more aggressive when the market is overheated, more defensive when it falls.", ja: '市場が過熱したときはより積極的に、下落したときはよりディフェンシブに戦術的調整を行うことを恐れないでください。', zh: '市场过热时更进取、下跌时更防御——别害怕做这样的战术调整。', fr: 'N’ayez pas peur d’ajuster tactiquement : plus offensif quand le marché surchauffe, plus défensif quand il baisse.', es: 'No temas los ajustes tácticos: más ofensivo cuando el mercado se recalienta, más defensivo cuando cae.' },
    color: 'slate',
  },
};

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: { ko: '러시아-우크라이나 전쟁이 장기화될 때, 당신의 첫 반응은?', en: 'When the Russia-Ukraine war drags on, what is your first reaction?', ja: 'ロシア・ウクライナ戦争が長期化したとき、あなたの最初の反応は？', zh: '俄乌战争长期化时，你的第一反应是？', fr: 'Si la guerre Russie-Ukraine s’enlise, votre première réaction ?', es: 'Si la guerra entre Rusia y Ucrania se alarga, ¿tu primera reacción?' },
    options: [
      { text: { ko: '방산주와 에너지 ETF를 찾는다', en: 'Look for defense stocks and energy ETFs', ja: '防衛株とエネルギーETFを探す', zh: '寻找国防股和能源 ETF', fr: 'Chercher des valeurs de défense et des ETF énergie', es: 'Buscar valores de defensa y ETF de energía' }, scores: { geopolitical: 4, macro: 1, tech: 1, dollar: 2, balanced: 2 } },
      { text: { ko: '인플레이션 영향을 계산하고 채권 비중을 조정한다', en: 'Calculate inflation impact and adjust bond allocation', ja: 'インフレへの影響を計算し債券比重を調整する', zh: '计算通胀影响，调整债券比重', fr: 'Calculer l’effet sur l’inflation et ajuster la part obligataire', es: 'Calcular el efecto en la inflación y ajustar el peso de bonos' }, scores: { geopolitical: 1, macro: 4, tech: 1, dollar: 2, balanced: 2 } },
      { text: { ko: '단기 노이즈이므로 AI·기술주 보유를 유지한다', en: 'It\'s short-term noise, so I maintain my AI/tech stock holdings', ja: '短期的なノイズなのでAI・技術株の保有を維持する', zh: '这是短期杂音，继续持有 AI・科技股', fr: 'C’est du bruit de court terme : je garde mes valeurs IA et tech', es: 'Es ruido a corto plazo: mantengo IA y tecnología' }, scores: { geopolitical: 1, macro: 1, tech: 4, dollar: 1, balanced: 2 } },
      { text: { ko: '달러와 금 비중을 높여 헤지한다', en: 'Increase dollar and gold allocation to hedge', ja: 'ドルと金の比重を高めてヘッジする', zh: '提高美元和黄金比重来对冲', fr: 'Renforcer dollar et or pour me couvrir', es: 'Subir el peso de dólar y oro para cubrirme' }, scores: { geopolitical: 2, macro: 2, tech: 0, dollar: 4, balanced: 2 } },
    ],
  },
  {
    id: 'q2',
    text: { ko: '연준이 갑자기 금리를 올린다는 발표를 했습니다. 당신의 선택은?', en: 'The Fed suddenly announced a rate hike. What is your choice?', ja: 'FRBが突然利上げを発表しました。あなたの選択は？', zh: '美联储突然宣布加息。你的选择是？', fr: 'La Fed annonce une hausse de taux surprise. Votre choix ?', es: 'La Fed anuncia de repente una subida de tipos. ¿Qué eliges?' },
    options: [
      { text: { ko: '공급망 관련 인플레이션 수혜주를 찾는다', en: 'Look for supply chain-related inflation beneficiaries', ja: 'サプライチェーン関連インフレ受益株を探す', zh: '寻找供应链相关的通胀受益股', fr: 'Chercher les valeurs qui profitent de l’inflation liée aux chaînes d’approvisionnement', es: 'Buscar valores que se benefician de la inflación ligada a las cadenas de suministro' }, scores: { geopolitical: 3, macro: 2, tech: 1, dollar: 2, balanced: 2 } },
      { text: { ko: '단기채로 이동해 높은 금리 수익을 확보한다', en: 'Move to short-term bonds to secure high interest income', ja: '短期債に移行して高い金利収益を確保する', zh: '转向短债，锁定较高的利率收益', fr: 'Passer sur des obligations courtes pour capter des taux élevés', es: 'Pasar a bonos cortos para asegurar tipos altos' }, scores: { geopolitical: 0, macro: 4, tech: 0, dollar: 3, balanced: 3 } },
      { text: { ko: '밸류에이션이 높은 성장주는 일부 줄이지만 AI 핵심주는 유지', en: 'Reduce some high-valuation growth stocks but maintain core AI stocks', ja: 'バリュエーションが高い成長株は一部減らすがAIコア株は維持', zh: '减掉部分高估值成长股，但保留 AI 核心股', fr: 'Alléger les valeurs de croissance chères, mais garder les valeurs clés de l’IA', es: 'Reducir algo de crecimiento caro, pero mantener los valores clave de IA' }, scores: { geopolitical: 1, macro: 2, tech: 4, dollar: 1, balanced: 2 } },
      { text: { ko: '전체 포트폴리오를 점검하고 리밸런싱한다', en: 'Review the entire portfolio and rebalance', ja: 'ポートフォリオ全体を見直し、リバランスする', zh: '检视整体投资组合并再平衡', fr: 'Revoir tout le portefeuille et le rééquilibrer', es: 'Revisar toda la cartera y reequilibrar' }, scores: { geopolitical: 1, macro: 2, tech: 1, dollar: 2, balanced: 4 } },
    ],
  },
  {
    id: 'q3',
    text: { ko: 'AI 기업의 주가가 급락했습니다. 당신의 반응은?', en: 'AI company stocks have plummeted. What is your reaction?', ja: 'AI企業の株価が急落しました。あなたの反応は？', zh: 'AI 公司股价暴跌。你的反应是？', fr: 'Le cours d’une entreprise d’IA s’effondre. Votre réaction ?', es: 'La acción de una empresa de IA se desploma. ¿Tu reacción?' },
    options: [
      { text: { ko: '지정학 리스크가 원인인지 먼저 분석한다', en: 'First analyze whether geopolitical risk is the cause', ja: '地政学リスクが原因か先に分析する', zh: '先分析原因是不是地缘政治风险', fr: 'Analyser d’abord si la cause est géopolitique', es: 'Analizar primero si la causa es geopolítica' }, scores: { geopolitical: 4, macro: 2, tech: 1, dollar: 1, balanced: 2 } },
      { text: { ko: '금리 상승이 원인이면 조정은 자연스럽다. 경기 데이터를 확인한다', en: 'If rate hikes are the cause, correction is natural. Check economic data', ja: '利上げが原因なら調整は自然。景気データを確認する', zh: '如果是加息造成的，调整是自然的。确认经济数据', fr: 'Si c’est la hausse des taux, la correction est normale : je vérifie les données économiques', es: 'Si es por la subida de tipos, la corrección es natural: reviso los datos económicos' }, scores: { geopolitical: 1, macro: 4, tech: 2, dollar: 1, balanced: 2 } },
      { text: { ko: '장기 AI 성장 스토리는 변함없다. 추가 매수 기회다', en: 'The long-term AI growth story is unchanged. It\'s a buying opportunity', ja: '長期的なAI成長ストーリーは変わらない。追加買いのチャンスだ', zh: '长期的 AI 增长故事没变。这是加码的机会', fr: 'L’histoire de croissance de l’IA à long terme n’a pas changé : c’est une occasion de renforcer', es: 'La historia de crecimiento de la IA a largo plazo no ha cambiado: es una oportunidad de comprar más' }, scores: { geopolitical: 1, macro: 1, tech: 4, dollar: 0, balanced: 1 } },
      { text: { ko: '포트폴리오 내 비중이 과도하면 일부 이익실현한다', en: 'If the portfolio weight is excessive, take partial profits', ja: 'ポートフォリオ内の比重が過大なら一部利益確定する', zh: '若在组合中比重过高，就部分获利了结', fr: 'Si son poids est trop élevé dans le portefeuille, je prends une partie des bénéfices', es: 'Si pesa demasiado en la cartera, recojo parte de los beneficios' }, scores: { geopolitical: 1, macro: 2, tech: 1, dollar: 2, balanced: 4 } },
    ],
  },
  {
    id: 'q4',
    text: { ko: '달러가 갑자기 10% 약세를 보입니다. 당신은?', en: 'The dollar suddenly weakens by 10%. What do you do?', ja: 'ドルが突然10%弱くなります。あなたは？', zh: '美元突然走弱 10%。你会？', fr: 'Le dollar chute soudain de 10 %. Vous…', es: 'El dólar cae de repente un 10 %. Tú…' },
    options: [
      { text: { ko: '지정학 리스크 고조가 원인이면 금과 원자재를 더 산다', en: 'If heightened geopolitical risk is the cause, buy more gold and commodities', ja: '地政学リスクの高まりが原因なら金と原材料をさらに買う', zh: '若是地缘风险升高所致，就多买黄金和原材料', fr: 'Si c’est la montée du risque géopolitique, j’achète plus d’or et de matières premières', es: 'Si es por el aumento del riesgo geopolítico, compro más oro y materias primas' }, scores: { geopolitical: 4, macro: 2, tech: 0, dollar: 2, balanced: 2 } },
      { text: { ko: '연준 정책 변화 때문이면 단기채와 물가연동채로 이동', en: 'If it\'s due to Fed policy change, move to short-term bonds and TIPS', ja: 'FRB政策変更が原因なら短期債と物価連動債に移行', zh: '若是美联储政策变化所致，就转向短债和通胀保值债', fr: 'Si c’est un changement de politique de la Fed, je passe sur obligations courtes et indexées', es: 'Si es por un cambio de política de la Fed, paso a bonos cortos y ligados a la inflación' }, scores: { geopolitical: 1, macro: 4, tech: 1, dollar: 2, balanced: 2 } },
      { text: { ko: '달러 약세는 글로벌 성장주에 유리하다. 기술주 보유 유지', en: 'Dollar weakness is favorable for global growth stocks. Maintain tech holdings', ja: 'ドル安はグローバル成長株に有利。技術株保有を維持', zh: '美元走弱对全球成长股有利。继续持有科技股', fr: 'Un dollar faible favorise les valeurs de croissance mondiales : je garde la tech', es: 'Un dólar débil favorece al crecimiento global: mantengo la tecnología' }, scores: { geopolitical: 1, macro: 1, tech: 3, dollar: 2, balanced: 2 } },
      { text: { ko: '비달러 자산(유럽, 신흥국) 비중을 높인다', en: 'Increase non-dollar assets (Europe, emerging markets)', ja: '非ドル資産（欧州、新興国）の比重を高める', zh: '提高非美元资产（欧洲、新兴市场）比重', fr: 'J’augmente la part des actifs hors dollar (Europe, émergents)', es: 'Subo el peso de activos no dólar (Europa, emergentes)' }, scores: { geopolitical: 2, macro: 2, tech: 1, dollar: 4, balanced: 2 } },
    ],
  },
  {
    id: 'q5',
    text: { ko: '10년 후를 봤을 때 세계 경제 성장의 핵심 엔진은 무엇이라고 생각하나요?', en: 'Looking 10 years ahead, what do you think will be the core engine of global economic growth?', ja: '10年後を見据えたとき、世界経済成長の核心エンジンは何だと思いますか？', zh: '放眼十年后，你认为世界经济增长的核心引擎是什么？', fr: 'À dix ans, quel sera selon vous le moteur principal de la croissance mondiale ?', es: 'Mirando a diez años, ¿cuál crees que será el motor principal del crecimiento mundial?' },
    options: [
      { text: { ko: '지정학 재편으로 새롭게 부상하는 지역 (인도, 중동, 동남아)', en: 'Regions newly emerging from geopolitical reshaping (India, Middle East, SE Asia)', ja: '地政学的再編で新たに台頭する地域（インド、中東、東南アジア）', zh: '在地缘重组中新崛起的地区（印度、中东、东南亚）', fr: 'Les régions qui émergent de la recomposition géopolitique (Inde, Moyen-Orient, Asie du Sud-Est)', es: 'Las regiones que surgen con la reorganización geopolítica (India, Oriente Medio, Sudeste Asiático)' }, scores: { geopolitical: 4, macro: 1, tech: 1, dollar: 3, balanced: 1 } },
      { text: { ko: '금리와 재정 정책을 잘 쓰는 선진국 경제', en: 'Developed economies that use interest rate and fiscal policy well', ja: '金利と財政政策をうまく活用する先進国経済', zh: '善用利率与财政政策的发达经济体', fr: 'Les économies développées qui manient bien taux et politique budgétaire', es: 'Las economías desarrolladas que manejan bien tipos y política fiscal' }, scores: { geopolitical: 1, macro: 4, tech: 1, dollar: 2, balanced: 2 } },
      { text: { ko: 'AI와 기술 혁명이 만드는 생산성 혁명', en: 'Productivity revolution created by AI and tech revolution', ja: 'AIと技術革命が生む生産性革命', zh: 'AI 与科技革命带来的生产力革命', fr: 'La révolution de productivité portée par l’IA et la technologie', es: 'La revolución de productividad impulsada por la IA y la tecnología' }, scores: { geopolitical: 0, macro: 1, tech: 5, dollar: 1, balanced: 1 } },
      { text: { ko: '특정 엔진보다 균형 잡힌 글로벌 분산이 더 중요하다', en: 'Balanced global diversification is more important than any specific engine', ja: '特定エンジンより均衡のとれたグローバル分散の方が重要', zh: '比起特定引擎，均衡的全球分散更重要', fr: 'Une diversification mondiale équilibrée compte plus qu’un moteur précis', es: 'Más que un motor concreto, importa una diversificación global equilibrada' }, scores: { geopolitical: 1, macro: 1, tech: 1, dollar: 2, balanced: 4 } },
    ],
  },
  {
    id: 'q6',
    text: { ko: '투자할 때 가장 먼저 확인하는 것은?', en: 'What do you check first when investing?', ja: '投資するとき最初に確認することは？', zh: '投资时你最先确认的是？', fr: 'Que vérifiez-vous en premier avant d’investir ?', es: '¿Qué compruebas primero al invertir?' },
    options: [
      { text: { ko: '해당 국가나 산업의 지정학적 리스크', en: 'Geopolitical risks of the country or industry', ja: '当該国や産業の地政学的リスク', zh: '该国或产业的地缘政治风险', fr: 'Le risque géopolitique du pays ou du secteur', es: 'El riesgo geopolítico del país o sector' }, scores: { geopolitical: 5, macro: 1, tech: 0, dollar: 1, balanced: 1 } },
      { text: { ko: '금리, 인플레이션, GDP 성장률 등 거시지표', en: 'Macro indicators like interest rates, inflation, GDP growth', ja: '金利、インフレ、GDP成長率などのマクロ指標', zh: '利率、通胀、GDP 增长率等宏观指标', fr: 'Les indicateurs macro : taux, inflation, croissance du PIB', es: 'Indicadores macro: tipos, inflación, crecimiento del PIB' }, scores: { geopolitical: 1, macro: 5, tech: 1, dollar: 1, balanced: 2 } },
      { text: { ko: '해당 기업의 기술적 해자와 AI 경쟁력', en: 'The company\'s technological moat and AI competitiveness', ja: '当該企業の技術的な堀とAI競争力', zh: '该公司的技术护城河与 AI 竞争力', fr: 'L’avantage technologique et la compétitivité en IA de l’entreprise', es: 'La ventaja tecnológica y la competitividad en IA de la empresa' }, scores: { geopolitical: 0, macro: 1, tech: 5, dollar: 0, balanced: 1 } },
      { text: { ko: '환율과 글로벌 자금 흐름', en: 'Exchange rates and global capital flows', ja: '為替とグローバル資金の流れ', zh: '汇率与全球资金流向', fr: 'Les taux de change et les flux de capitaux mondiaux', es: 'Los tipos de cambio y los flujos de capital globales' }, scores: { geopolitical: 1, macro: 2, tech: 0, dollar: 5, balanced: 2 } },
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
  zh: {
    title: '岔路经济・投资风格测试',
    subtitle: '你是哪种类型的投资者？',
    instruction: '请在每种情境下，选出最接近你反应的选项。',
    result: '我的投资类型',
    strategy: '推荐的投资策略',
    caution: '注意事项',
    restart: '重新测验',
    next: '下一题',
    prev: '上一题',
    submit: '查看结果',
    note: '本测验是了解投资倾向的参考工具，不构成投资建议。',
  },
  fr: {
    title: 'Quiz du profil d’investisseur à la croisée des chemins',
    subtitle: 'Quel type d’investisseur êtes-vous ?',
    instruction: 'Dans chaque situation, choisissez la réaction la plus proche de la vôtre.',
    result: 'Mon type d’investisseur',
    strategy: 'Stratégies d’investissement suggérées',
    caution: 'Points de vigilance',
    restart: 'Recommencer',
    next: 'Suivant',
    prev: 'Précédent',
    submit: 'Voir le résultat',
    note: 'Ce quiz est un outil de référence pour cerner votre profil d’investisseur. Ce n’est pas un conseil en investissement.',
  },
  es: {
    title: 'Quiz de perfil inversor en la encrucijada económica',
    subtitle: '¿Qué tipo de inversor eres?',
    instruction: 'En cada situación, elige la reacción más parecida a la tuya.',
    result: 'Mi tipo de inversor',
    strategy: 'Estrategias de inversión sugeridas',
    caution: 'Precauciones',
    restart: 'Repetir',
    next: 'Siguiente',
    prev: 'Anterior',
    submit: 'Ver resultado',
    note: 'Este quiz es una herramienta de referencia para conocer tu perfil inversor. No es asesoramiento de inversión.',
  },
};

const COLOR_MAP: Record<string, { bg: string; border: string; badge: string; text: string }> = {
  indigo: { bg: 'bg-surface-subtle', border: 'border-green-200', badge: 'bg-green-100 text-green-700', text: 'text-green-700' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', text: 'text-blue-700' },
  violet: { bg: 'bg-surface-subtle', border: 'border-green-200', badge: 'bg-green-100 text-green-700', text: 'text-green-700' },
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
  useRecordFinishedTest({ testId: "crossroads-investor", title: "CrossroadsInvestorTest", finished: Boolean(done) });
  // A shared/revisited result type read from the URL (?type=tech).
  const [forcedType, setForcedType] = useState<InvestorType | null>(null);

  useEffect(() => {
    const code = readResultCode('type') as InvestorType | null;
    if (code && INVESTOR_TYPES.includes(code)) { setForcedType(code); setDone(true); }
  }, []);

  const q = QUESTIONS[current];
  const total = QUESTIONS.length;
  const progress = ((current + 1) / total) * 100;

  // 고르면 바로 다음 문항으로 넘어간다 — 공용 Questionnaire 와 같은 모델이라
  // 선택 후 "다음"을 한 번 더 누르던 2단계 확인은 없앴다. 답은 문항 id 로 남으므로
  // 뒤로 가면 고른 값이 그대로 표시된다.
  const pick = (optionIdx: number) => {
    setAnswers(prev => ({ ...prev, [q.id]: optionIdx }));
    if (current < total - 1) setCurrent(c => c + 1);
    else setDone(true);
  };

  const handleRestart = () => { setAnswers({}); setCurrent(0); setDone(false); setForcedType(null); clearResultCode('type'); };

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

  // Keep the URL in sync with the result so it is shareable/revisitable.
  useEffect(() => {
    if (done) writeResultCode('type', forcedType ?? computeResult());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  if (done) {
    const type = forcedType ?? computeResult();
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

        <div className="bg-card rounded-2xl border border-slate-200 p-6">
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
        <CopyResultLink locale={locale} />
        <ResultNextSteps
          locale={locale}
          links={[
            { href: `/${locale}/political/test/`, label: ({ ko: '🧭 정치 나침반 테스트', en: '🧭 Political compass test', ja: '🧭 政治コンパステスト', zh: '🧭 政治坐标测验', fr: '🧭 Test de la boussole politique', es: '🧭 Test de la brújula política' } as Record<string, string>)[locale] ?? '🧭 Political compass test' },
            { href: `/${locale}/ontology/luck/`, label: ({ ko: '🍀 운 지도', en: '🍀 Luck map', ja: '🍀 運のマップ', zh: '🍀 运势地图', fr: '🍀 Carte de la chance', es: '🍀 Mapa de la suerte' } as Record<string, string>)[locale] ?? '🍀 Luck map' },
            { href: `/${locale}/today/`, label: ({ ko: '📅 오늘의 운세', en: '📅 Today', ja: '📅 今日の運勢', zh: '📅 今日', fr: '📅 Aujourd’hui', es: '📅 Hoy' } as Record<string, string>)[locale] ?? '📅 Today' },
          ]}
        />

        <button onClick={handleRestart} className="w-full py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900 transition-colors">
          {lb.restart}
        </button>
      </div>
    );
  }

  const prevAnswer = answers[q.id];

  return (
    <Questionnaire
      title={lb.title}
      subtitle={lb.subtitle}
      question={q.text[L]}
      questionLabel={`${current + 1} / ${total}`}
      progress={Math.round(progress)}
      options={q.options.map((opt, idx) => ({ label: opt.text[L], value: idx + 1 }))}
      selectedValue={prevAnswer === undefined ? undefined : prevAnswer + 1}
      note={lb.instruction}
      previousLabel={lb.prev}
      onPrevious={current > 0 ? () => setCurrent(c => c - 1) : undefined}
      onSelect={(value) => pick(value - 1)}
    />
  );
}
