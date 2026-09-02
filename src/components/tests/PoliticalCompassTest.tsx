import { useEffect, useRef, useState } from 'react'
import { markOntologyCoordinateRecorded } from '@/lib/ontology/progress'
import { recordTestResult } from '@/lib/user/test-results'
import { gaEvent } from '@/lib/analytics/ga-event'
import { POLITICAL_STEP_KEYS, scorePoliticalCompass } from '@/lib/engines/political-compass'
import ShareResultButton from '../shared/ShareResultButton';
import ResultNextSteps from '../shared/ResultNextSteps';
import RelatedReading from '../shared/RelatedReading';

type SupportedLang = 'ko' | 'en' | 'ja' | 'fr' | 'es' | 'zh'
const POLITICAL_INSTRUMENT_VERSION = 'political-compass-oiyo-41-v2'
function lang(locale: string): SupportedLang {
  return (['ko','en','ja','fr','es','zh'] as const).includes(locale as SupportedLang)
    ? (locale as SupportedLang) : 'en'
}

// ── 4축 결과 해석 ─────────────────────────────────────────────────
const AXIS_INFO: Record<SupportedLang, {
  economic: { name: string; left: string; right: string }
  social:   { name: string; left: string; right: string }
  global:   { name: string; left: string; right: string }
  state:    { name: string; left: string; right: string }
  resultTitle: string
  resultSub: string
  disclaimer: string
}> = {
  ko: {
    economic: { name: '경제',  left: '평등주의',  right: '시장주의' },
    social:   { name: '사회',  left: '전통주의',  right: '진보주의' },
    global:   { name: '외교',  left: '민족주의',  right: '국제주의' },
    state:    { name: '국가',  left: '권위주의',  right: '자유지상주의' },
    resultTitle: '나의 정치적 가치관 스펙트럼',
    resultSub: '4가지 축에서 내 위치를 확인해보세요',
    disclaimer: '이 테스트는 자기 이해를 위한 참고 도구이며, 특정 정당이나 이념을 지지하지 않습니다.',
  },
  en: {
    economic: { name: 'Economics', left: 'Equality',     right: 'Market' },
    social:   { name: 'Social',    left: 'Traditional',  right: 'Progressive' },
    global:   { name: 'Diplomacy', left: 'Nationalist',  right: 'Globalist' },
    state:    { name: 'State',     left: 'Authoritarian',right: 'Libertarian' },
    resultTitle: 'Your Political Value Spectrum',
    resultSub: 'See where you stand on 4 key axes',
    disclaimer: 'This test is a self-reflection tool and does not endorse any political party or ideology.',
  },
  ja: {
    economic: { name: '経済',  left: '平等主義',  right: '市場主義' },
    social:   { name: '社会',  left: '伝統主義',  right: '進歩主義' },
    global:   { name: '外交',  left: '民族主義',  right: '国際主義' },
    state:    { name: '国家',  left: '権威主義',  right: '自由至上主義' },
    resultTitle: '私の政治的価値観スペクトラム',
    resultSub: '4つの軸での位置を確認しましょう',
    disclaimer: 'このテストは自己理解のための参考ツールであり、特定の政党やイデオロギーを支持するものではありません。',
  },
  fr: {
    economic: { name: 'Économie',  left: 'Égalitaire',    right: 'Libéral' },
    social:   { name: 'Social',    left: 'Traditionnel',  right: 'Progressiste' },
    global:   { name: 'Diplomatie',left: 'Nationaliste',  right: 'Mondialiste' },
    state:    { name: 'État',      left: 'Autoritaire',   right: 'Libertaire' },
    resultTitle: 'Votre Spectre de Valeurs Politiques',
    resultSub: 'Voyez où vous vous situez sur 4 axes',
    disclaimer: 'Ce test est un outil de réflexion personnelle et ne soutient aucun parti politique.',
  },
  es: {
    economic: { name: 'Economía',  left: 'Igualitario',   right: 'Mercado' },
    social:   { name: 'Social',    left: 'Tradicional',   right: 'Progresista' },
    global:   { name: 'Diplomacia',left: 'Nacionalista',  right: 'Globalista' },
    state:    { name: 'Estado',    left: 'Autoritario',   right: 'Libertario' },
    resultTitle: 'Tu Espectro de Valores Políticos',
    resultSub: 'Ve dónde te encuentras en 4 ejes clave',
    disclaimer: 'Este test es una herramienta de reflexión personal y no respalda ningún partido político.',
  },
  zh: {
    economic: { name: '经济',  left: '平等主义',  right: '市场主义' },
    social:   { name: '社会',  left: '传统主义',  right: '进步主义' },
    global:   { name: '外交',  left: '民族主义',  right: '国际主义' },
    state:    { name: '国家',  left: '威权主义',  right: '自由意志主义' },
    resultTitle: '我的政治价值观谱系',
    resultSub: '查看您在4个轴上的位置',
    disclaimer: '本测试仅供自我了解使用，不支持任何政党或意识形态。',
  },
}

// ── 각 극(pole)의 정확한 정의 — 오염된 용어 바로잡기 ──────────────────
// axisIdx(0~3) × side(left|right). 한국 정치담론에서 자주 뒤섞이는 용어를
// 학술적 정의로 분리해 보여준다. ko 미보유 로케일은 en으로 폴백.
type PoleDefs = { left: string; right: string }[]
const POLE_GLOSSARY: Partial<Record<SupportedLang, PoleDefs>> = {
  ko: [
    { left: '부와 자원의 격차를 공공이 나서서 줄여야 한다고 본다. 복지·누진세·공공서비스 확대를 지지.',
      right: '자원 배분을 시장 경쟁과 개인 선택에 맡기고 정부 개입은 최소화한다. 감세·규제완화·민영화를 지지.' },
    { left: '가족·종교·관습 등 기존 사회 질서와 가치를 보존하려는 태도. (경제 입장과는 별개의 축)',
      right: '사회 규범과 제도를 시대 변화에 맞게 바꿔가야 한다는 태도. 한국에서 흔히 ‘진보’라 불리지만, 본래는 경제가 아니라 ‘사회 변화 수용’을 뜻한다.' },
    { left: '자국의 주권·정체성·국익을 우선한다. 대외 개방보다 자립을 중시.',
      right: '국가 간 협력·개방·보편 규범을 중시한다. 국제기구·자유무역·다자주의를 지지.' },
    { left: '권력을 소수에 집중하고 이견과 반대를 억눌러 질서를 강제하는 통치 방식. ‘강한 리더십’이나 ‘엄격함’이 아니라, 견제받지 않는 권력과 자유 제한이 핵심이다.',
      right: '개인의 자유와 자기결정권을 최대화하고 국가의 통제·간섭을 최소화한다. 한국어 ‘자유주의’와 혼동되지만, 여기서 핵심은 ‘개인 자유 우선’이다.' },
  ],
  en: [
    { left: 'The public should actively reduce gaps in wealth and resources — supports welfare, progressive taxation, and public services.',
      right: 'Leaves resource allocation to market competition and individual choice, minimizing government — supports tax cuts, deregulation, privatization.' },
    { left: 'Preserves existing social order and values (family, religion, custom). A separate axis from economics.',
      right: 'Society’s norms and institutions should evolve with the times. This is about accepting social change, not an economic position.' },
    { left: 'Prioritizes national sovereignty, identity, and interests over openness.',
      right: 'Values cooperation, openness, and universal norms — supports international institutions, free trade, multilateralism.' },
    { left: 'Rule that concentrates power in a few and suppresses dissent to enforce order. Not “strong leadership” or “strictness” — the core is unchecked power and restricted freedom.',
      right: 'Maximizes individual liberty and self-determination, minimizing state control. Often confused with “liberalism” — here the core is prioritizing individual freedom.' },
  ],
}

// ── 정치 용어 바로 알기 (한국 담론 오염 교정) ──────────────────────────
const TERM_CLARIFY: Partial<Record<SupportedLang, { title: string; items: string[] }>> = {
  ko: {
    title: '정치 용어 바로 알기',
    items: [
      '‘진보 / 보수’는 원래 ‘사회 변화에 대한 태도’(사회축)를 가리킨다. 한국에서는 경제·외교·안보 입장까지 한 덩어리로 뭉뚱그려 쓰여 혼란을 키운다 — 이 테스트는 그 축들을 분리해 본다.',
      '‘자유’는 특정 정당의 소유물이 아니다. 경제적 자유(시장주의)와 개인적 자유(자유지상주의)는 서로 다른 축이며, 정반대 성향의 사람이 둘 다 ‘자유’를 말할 수 있다.',
      '‘권위주의’는 강함·결단력·추진력이 아니라, 견제받지 않는 권력 집중과 이견 억압을 뜻한다. 진보·보수 어느 진영에서도 나타날 수 있다.',
      '한 사람의 가치관은 좌/우 한 점이 아니라 여러 축의 조합이다. ‘우리 편 / 상대 편’의 이분법은 이 다차원성을 지운다.',
    ],
  },
  en: {
    title: 'Reading political terms correctly',
    items: [
      '“Progressive / conservative” originally describe attitudes toward social change (the social axis). Lumping in economic, diplomatic, and security stances breeds confusion — this test separates those axes.',
      '“Freedom” is not owned by any party. Economic freedom (market) and personal freedom (libertarian) are different axes; people with opposite views can both invoke “freedom.”',
      '“Authoritarianism” is not strength or decisiveness — it means concentrated, unchecked power and suppression of dissent. It can appear on either the left or the right.',
      'A person’s values are a combination across several axes, not a single left/right point. The “us vs. them” binary erases that multidimensionality.',
    ],
  },
}

const UI: Record<SupportedLang, {
  title: string; subtitle: string; stepOf: (c:number,t:number)=>string
  axes: string; disagree: string; neutral: string; agree: string
  prev: string; next: string; submit: string; restart: string
  loading: string; error: string; unanswered: string
  privacy: string
  step1: string; step2: string; step3: string; step4: string
}> = {
  ko: {
    title: '정치 나침반 테스트', subtitle: '내 가치관과 세계관의 좌표를 찾아보세요',
    stepOf: (c,t) => `${c}단계 / 총 ${t}단계`,
    axes: '4가지 측정 축',
    disagree: '동의 안 함', neutral: '모름', agree: '동의함',
    prev: '이전', next: '다음', submit: '결과 보기', restart: '다시 하기',
    loading: '분석 중...', error: '모든 문항에 답해주세요.', unanswered: '번이 아직 미답변입니다.', privacy: '응답은 이 기기에서만 채점되며 문항별 답변은 저장하거나 외부 서버로 보내지 않습니다. 완료하면 4축 요약 코드만 이 기기에 저장됩니다.',
    step1: '경제관', step2: '사회관', step3: '세계관', step4: '국가관',
  },
  en: {
    title: 'Political Compass Test', subtitle: 'Find your coordinates on the political spectrum',
    stepOf: (c,t) => `Step ${c} of ${t}`,
    axes: '4 Measurement Axes',
    disagree: 'Disagree', neutral: 'Neutral', agree: 'Agree',
    prev: 'Previous', next: 'Next', submit: 'See Results', restart: 'Restart',
    loading: 'Analyzing...', error: 'Please answer all questions.', unanswered: ' question(s) unanswered.', privacy: 'Responses are scored on this device. Item-level answers are not stored or sent to an external server. After completion, only the four-axis summary code is stored on this device.',
    step1: 'Economics', step2: 'Social', step3: 'Diplomacy', step4: 'State Power',
  },
  ja: {
    title: '政治コンパステスト', subtitle: '政治的スペクトラム上の自分の座標を見つけよう',
    stepOf: (c,t) => `${c}/${t}ステップ`,
    axes: '4つの測定軸',
    disagree: '同意しない', neutral: 'わからない', agree: '同意する',
    prev: '前へ', next: '次へ', submit: '結果を見る', restart: 'やり直す',
    loading: '分析中...', error: 'すべての質問に答えてください。', unanswered: '問が未回答です。', privacy: '回答はこの端末内で採点され、各設問の回答は保存も外部送信もされません。完了後は4軸の要約コードだけがこの端末に保存されます。',
    step1: '経済観', step2: '社会観', step3: '世界観', step4: '国家観',
  },
  fr: {
    title: 'Test Boussole Politique', subtitle: 'Trouvez vos coordonnées sur le spectre politique',
    stepOf: (c,t) => `Étape ${c}/${t}`,
    axes: '4 Axes de Mesure',
    disagree: 'Pas d\'accord', neutral: 'Neutre', agree: 'D\'accord',
    prev: 'Précédent', next: 'Suivant', submit: 'Voir les résultats', restart: 'Recommencer',
    loading: 'Analyse...', error: 'Veuillez répondre à toutes les questions.', unanswered: ' question(s) sans réponse.', privacy: 'Les réponses sont calculées sur cet appareil. Les réponses détaillées ne sont ni stockées ni envoyées à un serveur externe. Après le test, seul le code récapitulatif des quatre axes est conservé sur cet appareil.',
    step1: 'Économique', step2: 'Social', step3: 'Diplomatique', step4: 'État',
  },
  es: {
    title: 'Test Brújula Política', subtitle: 'Encuentra tus coordenadas en el espectro político',
    stepOf: (c,t) => `Paso ${c} de ${t}`,
    axes: '4 Ejes de Medición',
    disagree: 'No estoy de acuerdo', neutral: 'Neutral', agree: 'De acuerdo',
    prev: 'Anterior', next: 'Siguiente', submit: 'Ver resultados', restart: 'Reiniciar',
    loading: 'Analizando...', error: 'Por favor responde todas las preguntas.', unanswered: ' pregunta(s) sin responder.', privacy: 'Las respuestas se puntúan en este dispositivo. Las respuestas por pregunta no se guardan ni se envían a un servidor externo. Al terminar, solo se guarda en este dispositivo el código resumen de los cuatro ejes.',
    step1: 'Económico', step2: 'Social', step3: 'Diplomático', step4: 'Estado',
  },
  zh: {
    title: '政治指南针测试', subtitle: '在政治光谱中找到你的坐标',
    stepOf: (c,t) => `第${c}步，共${t}步`,
    axes: '4个测量轴',
    disagree: '不同意', neutral: '不确定', agree: '同意',
    prev: '上一步', next: '下一步', submit: '查看结果', restart: '重新开始',
    loading: '分析中...', error: '请回答所有问题。', unanswered: '个问题未回答。', privacy: '回答仅在此设备上评分；逐题答案不会保存，也不会发送到外部服务器。完成后，仅在此设备保存四轴摘要代码。',
    step1: '经济观', step2: '社会观', step3: '外交观', step4: '国家观',
  },
}

// ── 질문 데이터 (41문항) ──────────────────────────────────────────
const QUESTIONS: Record<string, Record<SupportedLang, string>> = {
  's1_1':  { ko:'정부는 시장에 개입해서는 안 된다.', en:'The government should not intervene in the market.', ja:'政府は市場に介入すべきでない。', fr:'Le gouvernement ne doit pas intervenir dans le marché.', es:'El gobierno no debe intervenir en el mercado.', zh:'政府不应干预市场。' },
  's1_2':  { ko:'정부는 기업 활동을 최소한으로 규제해야 한다.', en:'The government should minimally regulate corporate activities.', ja:'政府は企業活動を最小限に規制すべきだ。', fr:"Le gouvernement doit minimiser la régulation des activités d'entreprise.", es:'El gobierno debe regular mínimamente las actividades corporativas.', zh:'政府应最小程度地监管企业活动。' },
  's1_3':  { ko:'정부는 사회적 약자를 보호하기 위해 시장 경제에 개입해야 한다.', en:'The government should intervene in the market economy to protect the vulnerable.', ja:'政府は社会的弱者を守るため市場経済に介入すべきだ。', fr:'Le gouvernement doit intervenir dans l\'économie de marché pour protéger les personnes vulnérables.', es:'El gobierno debe intervenir en la economía de mercado para proteger a los vulnerables.', zh:'政府应干预市场以保护弱势群体。' },
  's1_4':  { ko:'자유 시장 경제는 경쟁을 통해 효율성을 증가시킨다.', en:'A free market economy increases efficiency through competition.', ja:'自由市場経済は競争を通じて効率を高める。', fr:"Une économie de marché libre augmente l'efficacité par la concurrence.", es:'Una economía de libre mercado aumenta la eficiencia a través de la competencia.', zh:'自由市场经济通过竞争提高效率。' },
  's1_5':  { ko:'정부는 소득 불평등을 줄이기 위해 노력해야 한다.', en:'The government should strive to reduce income inequality.', ja:'政府は所得格差を縮小するよう努力すべきだ。', fr:'Le gouvernement doit s\'efforcer de réduire les inégalités de revenus.', es:'El gobierno debe esforzarse por reducir la desigualdad de ingresos.', zh:'政府应努力减少收入不平等。' },
  's1_6':  { ko:'정부는 사회 복지보다 민간 자선 단체 확장을 우선해야 한다.', en:'The government should prioritize expanding private charities over social welfare.', ja:'政府は社会福祉より民間の慈善団体の拡大を優先すべきだ。', fr:'Le gouvernement doit prioriser les organismes de bienfaisance privés plutôt que le bien-être social.', es:'El gobierno debe priorizar la expansión de organizaciones benéficas privadas sobre el bienestar social.', zh:'政府应优先发展私人慈善机构而非社会福利。' },
  's1_7':  { ko:'정부는 도로, 철도, 전기, 수도를 민영화해야 한다.', en:'The government should privatize roads, railways, electricity, and water.', ja:'政府は道路・鉄道・電力・水道を民営化すべきだ。', fr:'Le gouvernement doit privatiser les routes, chemins de fer, l\'électricité et l\'eau.', es:'El gobierno debe privatizar carreteras, ferrocarriles, electricidad y agua.', zh:'政府应将道路、铁路、电力和水务私有化。' },
  's1_8':  { ko:'모든 사람은 기본적인 생활 수준을 보장받아야 한다.', en:'Everyone should be guaranteed a basic standard of living.', ja:'すべての人は基本的な生活水準を保障されるべきだ。', fr:'Chacun devrait bénéficier d\'un niveau de vie de base garanti.', es:'Todo el mundo debería tener garantizado un nivel de vida básico.', zh:'每个人都应该获得基本生活保障。' },
  's1_9':  { ko:'더 높은 소득세율은 부유층의 사회 기여를 높이기 위해 필요하다.', en:'Higher income tax rates are necessary to increase the wealthy\'s contribution to society.', ja:'高い所得税率は富裕層の社会への貢献を増やすために必要だ。', fr:'Des taux d\'imposition plus élevés sont nécessaires pour accroître la contribution des riches à la société.', es:'Se necesitan tasas impositivas más altas para aumentar la contribución de los ricos a la sociedad.', zh:'更高的所得税率是增加富人对社会贡献的必要手段。' },
  's1_10': { ko:'정부는 주택, 의료, 교육 등 기본적인 필요를 충족시켜야 한다.', en:'The government should fulfill basic needs such as housing, healthcare, and education.', ja:'政府は住宅・医療・教育などの基本的ニーズを満たすべきだ。', fr:'Le gouvernement doit répondre aux besoins fondamentaux tels que le logement, la santé et l\'éducation.', es:'El gobierno debe satisfacer necesidades básicas como vivienda, atención médica y educación.', zh:'政府应满足住房、医疗、教育等基本需求。' },
  's2_1':  { ko:'동성 결혼은 합법화되어야 한다.', en:'Same-sex marriage should be legalized.', ja:'同性婚は合法化されるべきだ。', fr:'Le mariage homosexuel devrait être légalisé.', es:'El matrimonio entre personas del mismo sexo debería ser legalizado.', zh:'同性婚姻应当合法化。' },
  's2_2':  { ko:'낙태는 합법화되어야 한다.', en:'Abortion should be legalized.', ja:'中絶は合法化されるべきだ。', fr:"L'avortement devrait être légalisé.", es:'El aborto debería ser legalizado.', zh:'堕胎应当合法化。' },
  's2_3':  { ko:'대중 매체는 다양한 문화를 보여줘야 한다.', en:'Mass media should represent diverse cultures.', ja:'マスメディアは多様な文化を反映すべきだ。', fr:'Les médias de masse devraient représenter des cultures diverses.', es:'Los medios de comunicación de masas deberían representar culturas diversas.', zh:'大众媒体应该呈现多元文化。' },
  's2_4':  { ko:'종교적 또는 전통적 가치는 중요하다.', en:'Religious or traditional values are important.', ja:'宗教的または伝統的な価値観は重要だ。', fr:'Les valeurs religieuses ou traditionnelles sont importantes.', es:'Los valores religiosos o tradicionales son importantes.', zh:'宗教或传统价值观很重要。' },
  's2_5':  { ko:'과학 기술 발전은 사회에 긍정적인 영향을 미친다.', en:'Technological advancement has a positive impact on society.', ja:'科学技術の進歩は社会にポジティブな影響を与える。', fr:'Le progrès technologique a un impact positif sur la société.', es:'El avance tecnológico tiene un impacto positivo en la sociedad.', zh:'科技发展对社会有积极影响。' },
  's2_6':  { ko:'과학 기술 발전은 윤리적 제약을 받아야 한다.', en:'Technological advancement should be subject to ethical constraints.', ja:'科学技術の進歩は倫理的制約を受けるべきだ。', fr:'Le progrès technologique devrait être soumis à des contraintes éthiques.', es:'El avance tecnológico debería estar sujeto a restricciones éticas.', zh:'科技发展应受到伦理约束。' },
  's2_7':  { ko:'교육은 전통적인 가치를 강조해야 한다.', en:'Education should emphasize traditional values.', ja:'教育は伝統的価値観を強調すべきだ。', fr:"L'éducation devrait mettre l'accent sur les valeurs traditionnelles.", es:'La educación debería enfatizar los valores tradicionales.', zh:'教育应强调传统价值观。' },
  's2_8':  { ko:'모든 사람은 성별·성정체성·성적 지향에 상관없이 동등한 권리를 가져야 한다.', en:'Everyone should have equal rights regardless of gender, identity, or sexual orientation.', ja:'すべての人は性別・性自認・性的指向にかかわらず平等な権利を持つべきだ。', fr:'Chacun devrait avoir des droits égaux indépendamment du genre, de l\'identité ou de l\'orientation sexuelle.', es:'Todo el mundo debería tener iguales derechos independientemente del género, identidad u orientación sexual.', zh:'无论性别、性别认同或性取向，每个人都应享有平等权利。' },
  's2_9':  { ko:'사회 변화는 신중하게 이루어져야 하며 너무 빠른 변화는 해로울 수 있다.', en:'Social change should occur cautiously; rapid change can be harmful.', ja:'社会変化は慎重に行われるべきであり、急激な変化は有害な場合がある。', fr:'Le changement social devrait se faire prudemment; un changement trop rapide peut être nuisible.', es:'El cambio social debe ocurrir con cautela; el cambio rápido puede ser perjudicial.', zh:'社会变革应谨慎进行，变化过快可能有害。' },
  's3_1':  { ko:'우리나라는 국제 사회에서 더 적극적인 역할을 해야 한다.', en:'Our country should play a more active role in the international community.', ja:'我が国は国際社会でより積極的な役割を果たすべきだ。', fr:'Notre pays devrait jouer un rôle plus actif dans la communauté internationale.', es:'Nuestro país debería desempeñar un papel más activo en la comunidad internacional.', zh:'我国应在国际社会发挥更积极的作用。' },
  's3_2':  { ko:'우리나라는 군사력을 강화해야 한다.', en:'Our country should strengthen its military power.', ja:'我が国は軍事力を強化すべきだ。', fr:'Notre pays devrait renforcer sa puissance militaire.', es:'Nuestro país debería fortalecer su poder militar.', zh:'我国应加强军事力量。' },
  's3_3':  { ko:'우리나라는 다른 나라에 경제 지원을 강화해야 한다.', en:'Our country should increase economic support to other countries.', ja:'我が国は他国への経済支援を強化すべきだ。', fr:'Notre pays devrait augmenter son soutien économique aux autres pays.', es:'Nuestro país debería aumentar el apoyo económico a otros países.', zh:'我国应加强对其他国家的经济援助。' },
  's3_4':  { ko:'국방비 지출은 돈 낭비이다.', en:'Military spending is a waste of money.', ja:'国防費は無駄遣いだ。', fr:'Les dépenses militaires sont un gaspillage d\'argent.', es:'El gasto militar es un desperdicio de dinero.', zh:'国防开支是浪费金钱。' },
  's3_5':  { ko:'국제 사회는 협력해야 한다.', en:'The international community must cooperate.', ja:'国際社会は協力すべきだ。', fr:'La communauté internationale doit coopérer.', es:'La comunidad internacional debe cooperar.', zh:'国际社会必须合作。' },
  's3_6':  { ko:'국경을 넘는 자유로운 이민은 국제 경제에 해롭다.', en:'Free immigration across borders is harmful to the international economy.', ja:'国境を越える自由な移民は国際経済に有害だ。', fr:"L'immigration libre au-delà des frontières est nuisible à l'économie internationale.", es:'La inmigración libre a través de fronteras es perjudicial para la economía internacional.', zh:'跨越国界的自由移民对国际经济有害。' },
  's3_7':  { ko:'국제 분쟁 해결보다 국가 안보를 우선해야 한다.', en:'National security should be prioritized over resolving international conflicts.', ja:'国際紛争の解決より国家安全保障を優先すべきだ。', fr:'La sécurité nationale devrait être prioritaire sur la résolution des conflits internationaux.', es:'La seguridad nacional debe priorizarse sobre la resolución de conflictos internacionales.', zh:'国家安全应优先于解决国际冲突。' },
  's3_8':  { ko:'국제 무역보다 자국 내 생산을 우선시하는 것이 좋다.', en:'Domestic production should be prioritized over international trade.', ja:'国際貿易より国内生産を優先すべきだ。', fr:'La production nationale devrait être priorisée par rapport au commerce international.', es:'La producción doméstica debería priorizarse sobre el comercio internacional.', zh:'国内生产应优先于国际贸易。' },
  's3_9':  { ko:'국가의 주권은 국제 기구나 협약보다 우선해야 한다.', en:'National sovereignty should take precedence over international organizations and agreements.', ja:'国家主権は国際機関や協定より優先されるべきだ。', fr:'La souveraineté nationale devrait primer sur les organisations et accords internationaux.', es:'La soberanía nacional debe tener precedencia sobre las organizaciones y acuerdos internacionales.', zh:'国家主权应优先于国际组织和协议。' },
  's3_10': { ko:'국가 간 협력은 종종 비효율적이다.', en:'Cooperation between nations is often inefficient.', ja:'国家間の協力はしばしば非効率だ。', fr:'La coopération entre nations est souvent inefficace.', es:'La cooperación entre naciones suele ser ineficiente.', zh:'国家间合作往往效率低下。' },
  's3_11': { ko:'국가는 자유 무역보다 공정 무역을 추구해야 한다.', en:'The nation should pursue fair trade rather than free trade.', ja:'国家は自由貿易よりも公正貿易を追求すべきだ。', fr:'La nation devrait poursuivre le commerce équitable plutôt que le libre-échange.', es:'La nación debería buscar el comercio justo en lugar del libre comercio.', zh:'国家应追求公平贸易而非自由贸易。' },
  's4_1':  { ko:'정부는 테러 예방을 위해 국민을 감시해야 한다.', en:'The government should monitor citizens to prevent terrorism.', ja:'政府はテロ防止のために市民を監視すべきだ。', fr:'Le gouvernement devrait surveiller les citoyens pour prévenir le terrorisme.', es:'El gobierno debería vigilar a los ciudadanos para prevenir el terrorismo.', zh:'政府应监控公民以预防恐怖主义。' },
  's4_2':  { ko:'정부는 개인 정보 보호보다 국가 안보를 우선해야 한다.', en:'The government should prioritize national security over personal privacy.', ja:'政府は個人のプライバシーより国家安全保障を優先すべきだ。', fr:'Le gouvernement devrait prioriser la sécurité nationale sur la vie privée.', es:'El gobierno debería priorizar la seguridad nacional sobre la privacidad personal.', zh:'政府应将国家安全置于个人隐私之上。' },
  's4_3':  { ko:'정부는 범죄 예방을 위해 시민의 온라인 활동을 감시해야 한다.', en:'The government should monitor citizens\' online activities to prevent crime.', ja:'政府は犯罪防止のため市民のオンライン活動を監視すべきだ。', fr:'Le gouvernement devrait surveiller les activités en ligne des citoyens pour prévenir la criminalité.', es:'El gobierno debería monitorear las actividades en línea de los ciudadanos para prevenir delitos.', zh:'政府应监控公民网络活动以预防犯罪。' },
  's4_4':  { ko:'국가는 범죄 예방을 위해 더 강력한 권한을 가져야 한다.', en:'The state should have stronger powers to prevent crime.', ja:'国家は犯罪防止のためにより強い権限を持つべきだ。', fr:'L\'État devrait avoir des pouvoirs plus étendus pour prévenir la criminalité.', es:'El estado debería tener poderes más fuertes para prevenir el crimen.', zh:'国家应拥有更强大的权力以预防犯罪。' },
  's4_5':  { ko:'정부는 혐오 발언을 금지해야 한다.', en:'The government should prohibit hate speech.', ja:'政府はヘイトスピーチを禁止すべきだ。', fr:'Le gouvernement devrait interdire les discours de haine.', es:'El gobierno debería prohibir el discurso de odio.', zh:'政府应禁止仇恨言论。' },
  's4_6':  { ko:'법 질서를 유지하는 것은 중요하다.', en:'Maintaining law and order is important.', ja:'法と秩序を維持することは重要だ。', fr:'Le maintien de l\'ordre et de la loi est important.', es:'Mantener el orden público es importante.', zh:'维护法律和秩序很重要。' },
  's4_7':  { ko:'정부는 환경 보호를 위해 기업을 규제해야 한다.', en:'The government should regulate corporations for environmental protection.', ja:'政府は環境保護のために企業を規制すべきだ。', fr:'Le gouvernement devrait réglementer les entreprises pour la protection de l\'environnement.', es:'El gobierno debería regular las empresas para proteger el medio ambiente.', zh:'政府应为保护环境而监管企业。' },
  's4_8':  { ko:'개인의 자유는 최대로 보장되어야 한다.', en:'Individual liberty should be guaranteed to the maximum.', ja:'個人の自由は最大限に保障されるべきだ。', fr:'La liberté individuelle doit être garantie au maximum.', es:'La libertad individual debe garantizarse al máximo.', zh:'个人自由应得到最大保障。' },
  's4_9':  { ko:'모든 아이들은 평등한 교육 기회를 가져야 한다.', en:'All children have the right to equal educational opportunities.', ja:'すべての子どもは平等な教育機会を持つべきだ。', fr:'Tous les enfants ont droit à des opportunités éducatives égales.', es:'Todos los niños tienen derecho a iguales oportunidades educativas.', zh:'所有儿童都应享有平等的教育机会。' },
  's4_10': { ko:'모든 사람은 자신의 성별을 자유롭게 선택할 권리가 있다.', en:'Everyone has the right to freely choose their gender.', ja:'すべての人は自分の性別を自由に選択する権利を持つ。', fr:'Chacun a le droit de choisir librement son genre.', es:'Todo el mundo tiene derecho a elegir libremente su género.', zh:'每个人都有自由选择性别的权利。' },
  's4_11': { ko:'표현의 자유는 사회의 안정보다 중요하다.', en:'Freedom of expression is more important than social stability.', ja:'表現の自由は社会の安定より重要だ。', fr:"La liberté d'expression est plus importante que la stabilité sociale.", es:'La libertad de expresión es más importante que la estabilidad social.', zh:'言论自由比社会稳定更重要。' },
}

// 결과 문자를 축으로 해석
function parseResult(code: string): Array<{axis: string; left: string; right: string; position: 'left'|'right'|'neutral'}> {
  return []
}

function getAxisLabel(char: string, axisIdx: number, locale: SupportedLang) {
  const ax = AXIS_INFO[locale]
  const axes = [ax.economic, ax.social, ax.global, ax.state]
  const axis = axes[axisIdx]
  if (!axis) return { name: '', label: '', side: 'neutral' as const }

  const leftChars = ['E','T','N','A']
  const rightChars = ['M','P','G','L']

  if (char === '?') return { name: axis.name, label: '—', side: 'neutral' as const, left: axis.left, right: axis.right }
  if (leftChars[axisIdx] === char) return { name: axis.name, label: axis.left, side: 'left' as const, left: axis.left, right: axis.right }
  if (rightChars[axisIdx] === char) return { name: axis.name, label: axis.right, side: 'right' as const, left: axis.left, right: axis.right }
  return { name: axis.name, label: char, side: 'neutral' as const, left: axis.left, right: axis.right }
}

interface Props { locale: string }

export default function PoliticalCompassTest({ locale }: Props) {
  const L = lang(locale)
  const ui = UI[L]
  const [step, setStep] = useState(0) // 0-based
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [unanswered, setUnanswered] = useState<string[]>([])
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const started = useRef(false)

  useEffect(() => {
    if (!done || !result) return
    const code = result.replace(/[\s\"]/g, '').slice(0, 4)
    markOntologyCoordinateRecorded('political', code)
    recordTestResult({
      kind: 'preference',
      testId: 'political-compass',
      title: L === 'ko' ? '정치성향' : 'Political compass',
      resultLabel: code,
      result: { code, instrumentVersion: POLITICAL_INSTRUMENT_VERSION },
      locale: L,
      sourcePath: `/${L}/political/test`,
    })
  }, [done, result])

  const currentKeys = POLITICAL_STEP_KEYS[step] ?? []

  const setAnswer = (key: string, val: string) => {
    if (!started.current) {
      gaEvent('test_started', { test_id: 'political-compass', instrument_version: POLITICAL_INSTRUMENT_VERSION })
      started.current = true
    }
    setAnswers(prev => ({ ...prev, [key]: val }))
    setUnanswered(prev => prev.filter(k => k !== key))
  }

  const checkStep = () => {
    const missing = currentKeys.filter(k => !answers[k])
    if (missing.length > 0) {
      setUnanswered(missing)
      setError(ui.error)
      setTimeout(() => setError(null), 3000)
      return false
    }
    return true
  }

  const handleNext = () => { if (checkStep()) setStep(s => s + 1) }
  const handlePrev = () => setStep(s => Math.max(0, s - 1))

  const handleSubmit = () => {
    if (!checkStep()) return
    setLoading(true)
    try {
      setResult(scorePoliticalCompass(answers))
      setDone(true)
      gaEvent('test_completed', { test_id: 'political-compass', instrument_version: POLITICAL_INSTRUMENT_VERSION })
    } catch {
      setError(ui.error)
      setTimeout(() => setError(null), 4000)
    } finally {
      setLoading(false)
    }
  }

  const handleRestart = () => {
    setStep(0); setAnswers({}); setUnanswered([])
    setResult(null); setDone(false); setError(null)
    started.current = false
  }

  // ── 결과 화면 ──
  if (done && result) {
    const chars = result.replace(/[\s"]/g, '').split('')
    const axes = chars.slice(0, 4).map((c, i) => getAxisLabel(c, i, L))
    const info = AXIS_INFO[L]
    const glossary = POLE_GLOSSARY[L] ?? POLE_GLOSSARY.en!
    const clarify = TERM_CLARIFY[L] ?? TERM_CLARIFY.en!

    return (
      <div class="space-y-6">
        <div class="rounded-2xl border border-green-200 bg-surface-subtle p-6 text-center">
          <p class="text-xs font-semibold uppercase tracking-widest text-green-600">{info.resultTitle}</p>
          <p class="mt-1 text-sm text-green-700">{info.resultSub}</p>
          <div class="mt-4 inline-flex rounded-xl border-2 border-green-800 bg-card px-6 py-3">
            <span class="font-mono text-3xl font-black tracking-[0.3em] text-green-900">{chars.slice(0,4).join('')}</span>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          {axes.map((ax, i) => (
            <div key={i} class={`rounded-xl border-2 p-4 ${ax.side === 'left' ? 'border-amber-300 bg-amber-50' : ax.side === 'right' ? 'border-green-300 bg-surface-subtle' : 'border-slate-200 bg-slate-50'}`}>
              <p class="text-xs font-bold uppercase tracking-widest text-slate-500">{ax.name}</p>
              <p class={`mt-1 text-xl font-black ${ax.side === 'left' ? 'text-amber-800' : ax.side === 'right' ? 'text-green-800' : 'text-slate-500'}`}>{ax.label}</p>
              <div class="mt-2 flex items-center gap-1">
                <span class="text-xs text-slate-400">{ax.left}</span>
                <div class="relative mx-1 h-2 flex-1 rounded-full bg-slate-200">
                  <div class={`absolute top-0 h-2 w-2 -translate-x-1/2 rounded-full border-2 border-white shadow ${ax.side === 'left' ? 'left-[20%] bg-amber-500' : ax.side === 'right' ? 'left-[80%] bg-green-500' : 'left-[50%] bg-slate-400'}`} />
                </div>
                <span class="text-xs text-slate-400">{ax.right}</span>
              </div>
              {ax.side !== 'neutral' && glossary[i] && (
                <p class="mt-3 border-t border-slate-200/70 pt-2 text-xs leading-relaxed text-slate-600">
                  {glossary[i][ax.side as 'left' | 'right']}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* 정치 용어 바로 알기 — 한국 담론 오염 교정 */}
        <div class="rounded-xl border-2 border-green-200 bg-green-50/60 p-5">
          <p class="mb-3 flex items-center gap-2 text-sm font-black text-green-900">
            <span>📚</span>{clarify.title}
          </p>
          <ul class="space-y-2">
            {clarify.items.map((it, i) => (
              <li key={i} class="flex gap-2 text-xs leading-relaxed text-slate-700">
                <span class="mt-0.5 font-black text-green-600">·</span>
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>

        <p class="rounded-lg bg-slate-100 p-3 text-center text-xs text-slate-500">{info.disclaimer}</p>
        <ShareResultButton
          locale={L}
          heading={ui.title}
          resultTitle={chars.slice(0, 4).join('')}
          emoji="🧭"
          description={info.resultSub}
        />
        <ResultNextSteps
          locale={L}
          links={[
            { href: `/${L}/authoritarian/test/`, label: L === 'ko' ? '⚖️ 권위주의 성향 테스트' : L === 'ja' ? '⚖️ 権威主義傾向テスト' : '⚖️ Authoritarian scale test' },
            { href: `/${L}/big5/test/`, label: L === 'ko' ? '🧬 Big5 성격 테스트' : L === 'ja' ? '🧬 Big5性格テスト' : '🧬 Big Five personality test' },
            { href: `/${L}/ontology/personality/`, label: L === 'ko' ? '🧭 성격 온톨로지' : L === 'ja' ? '🧭 性格オントロジー' : '🧭 Personality ontology' },
          ]}
        />
        <RelatedReading locale={L} topic="political" />

        <button
          onClick={handleRestart}
          class="w-full rounded-xl border-2 border-green-700 bg-card py-3 font-bold text-green-700 transition hover:bg-primary hover:text-primary-foreground"
        >
          {ui.restart}
        </button>
      </div>
    )
  }

  const stepLabels = [ui.step1, ui.step2, ui.step3, ui.step4]

  return (
    <div class="space-y-6">
      {/* 헤더 */}
      <div class="text-center">
        <h1 class="text-2xl font-black text-slate-900">{ui.title}</h1>
        <p class="mt-1 text-sm text-slate-500">{ui.subtitle}</p>
      </div>

      {/* 스텝 인디케이터 */}
      <div class="flex items-center gap-1">
        {POLITICAL_STEP_KEYS.map((_, i) => (
          <div key={i} class={`h-2 flex-1 rounded-full transition-all ${i < step ? 'bg-green-500' : i === step ? 'bg-primary' : 'bg-slate-200'}`} />
        ))}
      </div>
      <p class="text-center text-sm font-semibold text-green-700">
        {ui.stepOf(step + 1, 4)} — {stepLabels[step]}
      </p>
      <p class="rounded-xl border border-green-100 bg-surface-subtle p-3 text-xs leading-5 text-green-900">
        {ui.privacy}
      </p>

      {/* 오류 배너 */}
      {error && (
        <div class="rounded-xl border-2 border-red-300 bg-red-50 p-3 text-center text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {/* 질문 목록 */}
      <div class="space-y-5">
        {currentKeys.map((key, qi) => {
          const q = QUESTIONS[key]?.[L] ?? QUESTIONS[key]?.en ?? ''
          const isUnanswered = unanswered.includes(key)
          const current = answers[key]
          return (
            <div key={key} class={`rounded-xl border-2 p-4 transition ${isUnanswered ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-card'}`}>
              <p class="mb-3 font-medium leading-relaxed text-slate-800">
                <span class="mr-2 font-black text-green-600">{qi + 1}.</span>{q}
              </p>
              <div class="grid grid-cols-3 gap-2">
                {(['1','2','3'] as const).map((val, vi) => {
                  const labels = [ui.disagree, ui.neutral, ui.agree]
                  const isSelected = current === val
                  return (
                    <button
                      key={val}
                      onClick={() => setAnswer(key, val)}
                      class={`rounded-lg border-2 py-2 text-sm font-semibold transition ${
                        isSelected
                          ? vi === 0 ? 'border-amber-500 bg-amber-500 text-white'
                            : vi === 2 ? 'border-green-500 bg-green-500 text-white'
                            : 'border-slate-500 bg-slate-500 text-white'
                          : 'border-slate-200 bg-card text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      {labels[vi]}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* 네비게이션 */}
      <div class="flex gap-3 pt-2">
        <button
          onClick={handlePrev}
          disabled={step === 0}
          class="flex-1 rounded-xl border-2 border-slate-300 py-3 font-bold text-slate-600 transition hover:border-slate-500 disabled:opacity-40"
        >
          {ui.prev}
        </button>
        {step < 3 ? (
          <button
            onClick={handleNext}
            class="flex-1 rounded-xl border-2 border-green-700 bg-primary py-3 font-bold text-primary-foreground transition hover:bg-green-800"
          >
            {ui.next}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            class="flex-1 rounded-xl border-2 border-green-700 bg-primary py-3 font-bold text-primary-foreground transition hover:bg-green-800 disabled:opacity-60"
          >
            {loading ? ui.loading : ui.submit}
          </button>
        )}
      </div>
    </div>
  )
}
