import type { Locale, Period } from './periodic';

export const PERIODS = ['today', 'weekly', 'monthly', 'yearly'] as const satisfies readonly Period[];
export type FortuneDomain = 'saju' | 'zodiac';

type PageCopy = {
  title: string;
  description: string;
  h1: string;
  eyebrow: string;
  sub: string;
  introTitle: string;
  intro: string;
  freshnessTitle: string;
  freshness: string;
  conceptTitle: string;
  concepts: { title: string; body: string }[];
  useTitle: string;
  useCases: { title: string; body: string }[];
  faqTitle: string;
  faqs: { question: string; answer: string }[];
  howToTitle: string;
  howToSteps: string[];
  relatedTitle: string;
  related: { href: string; label: string; desc: string }[];
  disclaimer: string;
};

const periodLabel: Record<Period, Record<Locale, string>> = {
  today: { ko: '오늘', en: 'Today', ja: '今日', zh: '今日', fr: "Aujourd'hui", es: 'Hoy' },
  weekly: { ko: '이번 주', en: 'This Week', ja: '今週', zh: '本周', fr: 'Cette semaine', es: 'Esta semana' },
  monthly: { ko: '이번 달', en: 'This Month', ja: '今月', zh: '本月', fr: 'Ce mois', es: 'Este mes' },
  yearly: { ko: '올해', en: 'This Year', ja: '今年', zh: '今年', fr: 'Cette année', es: 'Este año' },
};

const labels: Record<FortuneDomain, Record<Locale, { name: string; app: string; cycle: Record<Period, string> }>> = {
  saju: {
    ko: { name: '사주', app: '사주 주기형 운세', cycle: { today: '오늘의 사주', weekly: '이번 주 사주', monthly: '이번 달 사주', yearly: '올해의 사주' } },
    en: { name: 'Saju', app: 'Saju Periodic Fortune', cycle: { today: "Today's Saju", weekly: 'Weekly Saju', monthly: 'Monthly Saju', yearly: 'Yearly Saju' } },
    ja: { name: '四柱推命', app: '四柱推命の周期運勢', cycle: { today: '今日の四柱推命', weekly: '今週の四柱推命', monthly: '今月の四柱推命', yearly: '今年の四柱推命' } },
    zh: { name: '四柱', app: '四柱周期运势', cycle: { today: '今日四柱', weekly: '本周四柱', monthly: '本月四柱', yearly: '今年四柱' } },
    fr: { name: 'Saju', app: 'Fortune Saju périodique', cycle: { today: 'Saju du jour', weekly: 'Saju de la semaine', monthly: 'Saju du mois', yearly: "Saju de l'année" } },
    es: { name: 'Saju', app: 'Fortuna Saju periódica', cycle: { today: 'Saju de hoy', weekly: 'Saju semanal', monthly: 'Saju mensual', yearly: 'Saju anual' } },
  },
  zodiac: {
    ko: { name: '별자리', app: '별자리 주기형 운세', cycle: { today: '오늘의 별자리', weekly: '이번 주 별자리', monthly: '이번 달 별자리', yearly: '올해의 별자리' } },
    en: { name: 'Zodiac', app: 'Zodiac Periodic Horoscope', cycle: { today: "Today's Horoscope", weekly: 'Weekly Horoscope', monthly: 'Monthly Horoscope', yearly: 'Yearly Horoscope' } },
    ja: { name: '星座', app: '星座の周期運勢', cycle: { today: '今日の星座占い', weekly: '今週の星座占い', monthly: '今月の星座占い', yearly: '今年の星座占い' } },
    zh: { name: '星座', app: '星座周期运势', cycle: { today: '今日星座运势', weekly: '本周星座运势', monthly: '本月星座运势', yearly: '今年星座运势' } },
    fr: { name: 'Zodiaque', app: 'Horoscope périodique', cycle: { today: 'Horoscope du jour', weekly: 'Horoscope de la semaine', monthly: 'Horoscope du mois', yearly: "Horoscope de l'année" } },
    es: { name: 'Zodiaco', app: 'Horóscopo periódico', cycle: { today: 'Horóscopo de hoy', weekly: 'Horóscopo semanal', monthly: 'Horóscopo mensual', yearly: 'Horóscopo anual' } },
  },
};

export function periodName(period: Period, locale: Locale) {
  return periodLabel[period][locale] ?? periodLabel[period].en;
}

export function appName(domain: FortuneDomain, locale: Locale) {
  return labels[domain][locale]?.app ?? labels[domain].en.app;
}

export function getPeriodicPageCopy(domain: FortuneDomain, period: Period, locale: Locale): PageCopy {
  const l = labels[domain][locale] ?? labels[domain].en;
  const p = l.cycle[period];

  if (domain === 'saju') {
    const copy: Record<Locale, PageCopy> = {
      ko: {
        title: `${p} 운세 - 생년월일로 보는 오행 흐름`,
        description: `${p} 운세를 생년월일 기반 사주 오행으로 확인하세요. 같은 주기에는 같은 결과를 유지하고 ${periodName(period, 'ko')}이 바뀌면 새로 갱신됩니다.`,
        h1: `${p} 운세`,
        eyebrow: '주기형 사주',
        sub: '생년월일 기반 오행 흐름을 오늘·이번 주·이번 달 단위로 확인합니다.',
        introTitle: '사주를 재방문형 체크인으로 읽기',
        intro: '사주는 한 번 보는 결과보다 시간의 흐름과 함께 비교할 때 활용도가 높습니다. 이 페이지는 생년월일에서 얻은 오행 기준을 주기 키와 결합해, 같은 주기에는 안정적인 문장을 보여주고 다음 주기에는 새 흐름을 제안합니다.',
        freshnessTitle: '갱신 기준',
        freshness: '오늘의 사주는 매일, 이번 주 사주는 ISO 주차 기준, 이번 달 사주는 월 단위로 갱신됩니다. 결과는 실시간 AI 생성이 아니라 사전 작성된 다국어 문장과 결정론적 시드로 구성됩니다.',
        conceptTitle: '이 페이지가 보는 것',
        concepts: [
          { title: '오행 균형', body: '목·화·토·금·수 중 현재 해석의 중심이 되는 기운을 봅니다.' },
          { title: '주기 키', body: '오늘, 이번 주, 이번 달을 분리해 재방문 시 비교 가능한 결과를 만듭니다.' },
          { title: '자기 점검', body: '좋다/나쁘다 판정보다 집중할 태도와 조심할 과잉을 읽습니다.' },
        ],
        useTitle: '활용 루프',
        useCases: [
          { title: '아침 점검', body: '오늘의 오행 메시지를 보고 하루의 행동 키워드를 하나 정합니다.' },
          { title: '주간 계획', body: '이번 주 사주를 월요일에 확인하고 무리할 일과 줄일 일을 나눕니다.' },
          { title: '월간 회고', body: '이번 달 메시지와 실제 사건을 비교해 다음 달의 선택 기준을 만듭니다.' },
        ],
        faqTitle: '자주 묻는 질문',
        faqs: [
          { question: '사주 주기형 운세는 기존 사주 계산기와 무엇이 다른가요?', answer: '사주 계산기는 구조와 오행 분포를 자세히 보는 도구이고, 주기형 운세는 같은 정보를 오늘·이번 주·이번 달의 체크인으로 짧게 읽는 도구입니다.' },
          { question: '결과는 언제 바뀌나요?', answer: '오늘은 매일, 주간은 ISO 주차가 바뀔 때, 월간은 달이 바뀔 때 갱신됩니다.' },
          { question: '사주 운세가 미래를 보장하나요?', answer: '아니요. 전통 상징을 바탕으로 한 자기 성찰용 콘텐츠이며 중요한 결정을 대신하지 않습니다.' },
        ],
        howToTitle: '사용 방법',
        howToSteps: ['생년월일을 입력합니다.', `${periodName(period, 'ko')} 사주 결과를 확인합니다.`, '오행 카드의 키워드를 기록합니다.', '다음 주기에 다시 방문해 실제 흐름과 비교합니다.'],
        relatedTitle: '사주 클러스터',
        related: [
          { href: `/${locale}/saju/calculator/`, label: '사주 계산기', desc: '팔자와 오행 분포를 자세히 봅니다.' },
          { href: `/${locale}/saju/fortune/`, label: '사주 오늘의 운세', desc: '기존 일일 사주 운세를 확인합니다.' },
          { href: `/${locale}/fortune/${period}/`, label: '종합 운세', desc: '사주·12지신·별자리를 한 화면에서 비교합니다.' },
          { href: 'https://oiyo.net/ko/saju/calculator/', label: '사주팔자 계산기', desc: '내 사주 여덟 글자를 직접 뽑아 구조를 확인합니다.' },
        ],
        disclaimer: '사주 운세는 오락과 자기 성찰 목적입니다. 진로, 투자, 의료, 법률 결정을 대신하지 않습니다.',
      },
      en: {
        title: `${p} - Five Element Timing by Birth Date`,
        description: `Check ${p.toLowerCase()} with a Saju five-element reading from your birth date. Results stay stable within the same cycle and refresh with the next one.`,
        h1: p,
        eyebrow: 'Periodic Saju',
        sub: 'A daily, weekly, or monthly five-element check-in from your birth date.',
        introTitle: 'Read Saju as a returning timing check',
        intro: 'Saju becomes more useful when you compare it across time. This page combines your birth-date element with the current cycle, keeps the same result during that cycle, and refreshes when the next day, week, or month begins.',
        freshnessTitle: 'Freshness rule',
        freshness: 'Daily Saju refreshes each day, weekly Saju follows the ISO week, and monthly Saju changes with the month. Text is assembled from prepared multilingual copy and deterministic seeds, not live AI generation.',
        conceptTitle: 'What this page reads',
        concepts: [
          { title: 'Five-element balance', body: 'The reading starts from wood, fire, earth, metal, or water as the active symbolic frame.' },
          { title: 'Cycle key', body: 'Today, this week, and this month are separated so return visits can be compared.' },
          { title: 'Reflection', body: 'Use it to name a focus and a possible excess, not to label a day as good or bad.' },
        ],
        useTitle: 'Return loop',
        useCases: [
          { title: 'Morning check', body: 'Choose one action keyword from today’s element reading.' },
          { title: 'Weekly planning', body: 'Read weekly Saju on Monday and decide what to push, pause, or simplify.' },
          { title: 'Monthly review', body: 'Compare the monthly message with actual events before setting the next focus.' },
        ],
        faqTitle: 'Frequently asked questions',
        faqs: [
          { question: 'How is periodic Saju different from the Saju calculator?', answer: 'The calculator explains your chart structure and element balance. Periodic Saju turns that material into a short daily, weekly, or monthly check-in.' },
          { question: 'When does the result change?', answer: 'Daily changes each day, weekly changes with the ISO week, and monthly changes when the month changes.' },
          { question: 'Does Saju fortune predict the future?', answer: 'No. It is symbolic reflection content and should not replace important decisions.' },
        ],
        howToTitle: 'How to use it',
        howToSteps: ['Enter your birth date.', `Read the ${periodName(period, 'en').toLowerCase()} Saju result.`, 'Save one element keyword.', 'Return next cycle and compare it with what happened.'],
        relatedTitle: 'Saju cluster',
        related: [
          { href: `/${locale}/saju/calculator/`, label: 'Saju calculator', desc: 'Read your Four Pillars and element balance.' },
          { href: `/${locale}/saju/fortune/`, label: 'Saju daily fortune', desc: 'Use the existing daily Saju page.' },
          { href: `/${locale}/fortune/${period}/`, label: 'Combined fortune', desc: 'Compare Saju, Chinese zodiac, and star sign together.' },
          { href: 'https://oiyo.net/en/saju/calculator/', label: 'Saju calculator', desc: 'Draw your own four pillars and read their structure.' },
        ],
        disclaimer: 'Saju fortune is for entertainment and self-reflection. It does not replace career, financial, medical, or legal decisions.',
      },
      ja: {
        title: `${p} - 生年月日の五行で読む流れ`,
        description: `${p}を生年月日の五行から確認します。同じ周期では同じ結果を保ち、次の周期で更新されます。`,
        h1: p,
        eyebrow: '周期型の四柱推命',
        sub: '今日・今週・今月の単位で五行の流れを確認します。',
        introTitle: '四柱推命を再訪するチェックインとして読む',
        intro: '四柱推命は一度だけの結果より、時間の流れと比べることで使いやすくなります。このページは生年月日の五行と現在の周期を組み合わせ、同じ周期では安定した結果を表示します。',
        freshnessTitle: '更新基準',
        freshness: '今日の四柱推命は毎日、今週はISO週、今月は月替わりで更新されます。文章はAI生成ではなく、多言語文と決定論的シードで構成されます。',
        conceptTitle: 'このページで見ること',
        concepts: [
          { title: '五行のバランス', body: '木・火・土・金・水のうち、今の読みの中心になる気を見ます。' },
          { title: '周期キー', body: '今日、今週、今月を分け、再訪時に比較できるようにします。' },
          { title: '自己点検', body: '吉凶の判定ではなく、集中する姿勢と注意する過剰を読みます。' },
        ],
        useTitle: '活用ループ',
        useCases: [
          { title: '朝の確認', body: '今日の五行メッセージから行動キーワードを一つ選びます。' },
          { title: '週間計画', body: '月曜日に今週の四柱推命を読み、進めることと減らすことを分けます。' },
          { title: '月間レビュー', body: '今月のメッセージと実際の出来事を比較します。' },
        ],
        faqTitle: 'よくある質問',
        faqs: [
          { question: '四柱推命計算機と何が違いますか？', answer: '計算機は命式と五行を詳しく見る道具です。周期型はそれを今日・今週・今月の短い確認にしたものです。' },
          { question: '結果はいつ変わりますか？', answer: '今日分は毎日、週分はISO週、月分は月替わりで更新されます。' },
          { question: '未来を保証しますか？', answer: 'いいえ。象徴的な自己省察コンテンツであり、重要な判断の代わりにはなりません。' },
        ],
        howToTitle: '使い方',
        howToSteps: ['生年月日を入力します。', `${periodName(period, 'ja')}の四柱推命結果を読みます。`, '五行キーワードを一つ記録します。', '次の周期に再訪して実際の流れと比べます。'],
        relatedTitle: '四柱推命クラスター',
        related: [
          { href: `/${locale}/saju/calculator/`, label: '四柱推命計算機', desc: '四柱と五行バランスを詳しく見ます。' },
          { href: `/${locale}/saju/fortune/`, label: '今日の四柱推命', desc: '既存の日次ページを確認します。' },
          { href: `/${locale}/fortune/${period}/`, label: '総合運勢', desc: '四柱・十二支・星座を比較します。' },
          { href: 'https://oiyo.net/ja/saju/calculator/', label: '四柱推命 計算機', desc: '自分の四柱を出して構造を確認します。' },
        ],
        disclaimer: '四柱推命の運勢は娯楽と自己省察のためのものです。進路、投資、医療、法律の判断を代替しません。',
      },
      zh: {
        title: `${p} - 按出生日期查看五行节奏`,
        description: `用出生日期查看${p}。同一周期结果保持稳定，下一个周期自动更新。`,
        h1: p,
        eyebrow: '周期型四柱',
        sub: '按今日、本周、本月查看五行流动。',
        introTitle: '把四柱当作可回访的节奏检查',
        intro: '四柱不只是一张静态结果，更适合随时间比较。本页把出生日期对应的五行与当前周期结合，在同一周期保持稳定，并在周期切换后更新。',
        freshnessTitle: '更新规则',
        freshness: '今日四柱每天更新，本周四柱按 ISO 周更新，本月四柱随月份更新。文本由多语言语料和确定性种子组合，并非实时 AI 生成。',
        conceptTitle: '本页关注什么',
        concepts: [
          { title: '五行平衡', body: '从木、火、土、金、水中读取当前象征框架。' },
          { title: '周期键', body: '区分今日、本周、本月，方便回访比较。' },
          { title: '自我观察', body: '重点不是吉凶，而是当前可关注的态度和可能的过度。' },
        ],
        useTitle: '回访方式',
        useCases: [
          { title: '早晨检查', body: '从今日五行信息中选一个行动关键词。' },
          { title: '周计划', body: '周一查看本周四柱，决定推进、暂停或简化的事情。' },
          { title: '月复盘', body: '把本月信息与实际事件对照，再设定下月重点。' },
        ],
        faqTitle: '常见问题',
        faqs: [
          { question: '它和四柱计算器有什么不同？', answer: '计算器更详细说明命盘结构和五行分布；周期型四柱把它转成今日、本周、本月的简短检查。' },
          { question: '结果什么时候变化？', answer: '今日结果每天变，周结果随 ISO 周变，月结果随月份变化。' },
          { question: '四柱运势能预测未来吗？', answer: '不能。它是象征性的自我反思内容，不能代替重要决定。' },
        ],
        howToTitle: '使用方法',
        howToSteps: ['输入出生日期。', `查看${periodName(period, 'zh')}四柱结果。`, '记录一个五行关键词。', '下个周期回访，与实际情况比较。'],
        relatedTitle: '四柱内容组',
        related: [
          { href: `/${locale}/saju/calculator/`, label: '四柱计算器', desc: '查看四柱和五行分布。' },
          { href: `/${locale}/saju/fortune/`, label: '四柱今日运势', desc: '查看已有的日运页面。' },
          { href: `/${locale}/fortune/${period}/`, label: '综合运势', desc: '比较四柱、生肖和星座。' },
          { href: 'https://oiyo.net/zh/saju/calculator/', label: '八字计算器', desc: '排出自己的四柱，查看结构。' },
        ],
        disclaimer: '四柱运势用于娱乐和自我反思，不替代职业、投资、医疗或法律决定。',
      },
      fr: {
        title: `${p} - rythme des cinq éléments par date de naissance`,
        description: `Consultez ${p.toLowerCase()} avec une lecture Saju des cinq éléments. Le résultat reste stable dans le même cycle puis se renouvelle.`,
        h1: p,
        eyebrow: 'Saju périodique',
        sub: 'Un point quotidien, hebdomadaire ou mensuel sur les cinq éléments.',
        introTitle: 'Lire le Saju comme un point de retour',
        intro: 'Le Saju devient plus utile lorsqu’il est comparé dans le temps. Cette page combine l’élément lié à votre date de naissance avec le cycle actuel, puis renouvelle la lecture au prochain jour, à la prochaine semaine ou au prochain mois.',
        freshnessTitle: 'Règle de fraîcheur',
        freshness: 'Le Saju du jour change chaque jour, le Saju hebdomadaire suit la semaine ISO, et le Saju mensuel change avec le mois. Le texte vient de copies multilingues préparées et de graines déterministes.',
        conceptTitle: 'Ce que lit cette page',
        concepts: [
          { title: 'Équilibre des cinq éléments', body: 'La lecture part du bois, du feu, de la terre, du métal ou de l’eau comme cadre symbolique.' },
          { title: 'Clé de cycle', body: 'Aujourd’hui, cette semaine et ce mois sont séparés pour comparer les retours.' },
          { title: 'Réflexion', body: 'Servez-vous-en pour nommer un axe et un excès possible, pas pour juger un jour.' },
        ],
        useTitle: 'Boucle de retour',
        useCases: [
          { title: 'Point du matin', body: 'Choisissez un mot d’action depuis la lecture du jour.' },
          { title: 'Plan de semaine', body: 'Lisez le Saju hebdomadaire le lundi pour décider quoi pousser, ralentir ou simplifier.' },
          { title: 'Bilan mensuel', body: 'Comparez le message du mois avec les faits réels.' },
        ],
        faqTitle: 'Questions fréquentes',
        faqs: [
          { question: 'Quelle différence avec le calculateur Saju ?', answer: 'Le calculateur explique la structure du thème et les éléments. Le Saju périodique en fait un court point quotidien, hebdomadaire ou mensuel.' },
          { question: 'Quand le résultat change-t-il ?', answer: 'Le quotidien change chaque jour, l’hebdomadaire avec la semaine ISO, et le mensuel avec le mois.' },
          { question: 'Le Saju prédit-il l’avenir ?', answer: 'Non. C’est un contenu symbolique de réflexion et il ne remplace pas les décisions importantes.' },
        ],
        howToTitle: 'Mode d’emploi',
        howToSteps: ['Entrez votre date de naissance.', `Lisez le résultat Saju pour ${periodName(period, 'fr').toLowerCase()}.`, 'Notez un mot-clé d’élément.', 'Revenez au cycle suivant et comparez avec ce qui s’est passé.'],
        relatedTitle: 'Cluster Saju',
        related: [
          { href: `/${locale}/saju/calculator/`, label: 'Calculateur Saju', desc: 'Lire vos quatre piliers et les éléments.' },
          { href: `/${locale}/saju/fortune/`, label: 'Fortune Saju du jour', desc: 'Utiliser la page quotidienne existante.' },
          { href: `/${locale}/fortune/${period}/`, label: 'Fortune combinée', desc: 'Comparer Saju, zodiaque chinois et signe astral.' },
          { href: 'https://oiyo.net/fr/saju/calculator/', label: 'Calculateur Saju', desc: 'Établissez vos quatre piliers et lisez leur structure.' },
        ],
        disclaimer: 'La fortune Saju est destinée au divertissement et à la réflexion. Elle ne remplace pas les décisions de carrière, finance, santé ou droit.',
      },
      es: {
        title: `${p} - ritmo de cinco elementos por fecha de nacimiento`,
        description: `Consulta ${p.toLowerCase()} con una lectura Saju de cinco elementos. El resultado se mantiene en el mismo ciclo y se renueva después.`,
        h1: p,
        eyebrow: 'Saju periódico',
        sub: 'Un chequeo diario, semanal o mensual de cinco elementos.',
        introTitle: 'Leer Saju como chequeo de regreso',
        intro: 'Saju es más útil cuando se compara a través del tiempo. Esta página combina el elemento de tu fecha de nacimiento con el ciclo actual y renueva la lectura al cambiar el día, la semana o el mes.',
        freshnessTitle: 'Regla de actualización',
        freshness: 'El Saju diario cambia cada día, el semanal sigue la semana ISO y el mensual cambia con el mes. El texto usa copias multilingües preparadas y semillas deterministas.',
        conceptTitle: 'Qué lee esta página',
        concepts: [
          { title: 'Equilibrio de cinco elementos', body: 'La lectura parte de madera, fuego, tierra, metal o agua como marco simbólico.' },
          { title: 'Clave de ciclo', body: 'Hoy, esta semana y este mes se separan para poder comparar visitas.' },
          { title: 'Reflexión', body: 'Úsalo para nombrar un foco y un posible exceso, no para juzgar un día.' },
        ],
        useTitle: 'Ciclo de regreso',
        useCases: [
          { title: 'Chequeo matutino', body: 'Elige una palabra de acción desde la lectura diaria.' },
          { title: 'Plan semanal', body: 'Lee el Saju semanal el lunes y decide qué impulsar, pausar o simplificar.' },
          { title: 'Revisión mensual', body: 'Compara el mensaje del mes con lo que ocurrió.' },
        ],
        faqTitle: 'Preguntas frecuentes',
        faqs: [
          { question: '¿En qué se diferencia del calculador Saju?', answer: 'El calculador explica la estructura y los elementos. El Saju periódico lo convierte en un chequeo diario, semanal o mensual.' },
          { question: '¿Cuándo cambia el resultado?', answer: 'El diario cambia cada día, el semanal con la semana ISO y el mensual al cambiar el mes.' },
          { question: '¿Saju predice el futuro?', answer: 'No. Es contenido simbólico de reflexión y no reemplaza decisiones importantes.' },
        ],
        howToTitle: 'Cómo usarlo',
        howToSteps: ['Introduce tu fecha de nacimiento.', `Lee el resultado Saju de ${periodName(period, 'es').toLowerCase()}.`, 'Guarda una palabra clave de elemento.', 'Vuelve en el siguiente ciclo y compara con lo ocurrido.'],
        relatedTitle: 'Cluster Saju',
        related: [
          { href: `/${locale}/saju/calculator/`, label: 'Calculador Saju', desc: 'Lee tus cuatro pilares y elementos.' },
          { href: `/${locale}/saju/fortune/`, label: 'Fortuna Saju diaria', desc: 'Usa la página diaria existente.' },
          { href: `/${locale}/fortune/${period}/`, label: 'Fortuna combinada', desc: 'Compara Saju, zodiaco chino y signo.' },
          { href: 'https://oiyo.net/es/saju/calculator/', label: 'Calculadora de Saju', desc: 'Genera tus cuatro pilares y lee su estructura.' },
        ],
        disclaimer: 'La fortuna Saju es para entretenimiento y autorreflexión. No reemplaza decisiones de carrera, finanzas, salud o legales.',
      },
    };
    return copy[locale] ?? copy.en;
  }

  const copy: Record<Locale, PageCopy> = {
    ko: {
      title: `${p} 운세 - 12별자리 주기형 운세`,
      description: `${p} 운세를 태양 별자리 기준으로 확인하세요. 오늘·이번 주·이번 달 단위로 안정적으로 갱신되는 별자리 체크인입니다.`,
      h1: `${p} 운세`,
      eyebrow: '주기형 별자리',
      sub: '태양 별자리 기준으로 오늘·이번 주·이번 달의 감정과 행동 키워드를 봅니다.',
      introTitle: '별자리 운세를 재방문형 루프로 만들기',
      intro: '별자리 운세는 매일 소비하는 짧은 콘텐츠이지만, 주간과 월간 흐름까지 나누면 사용자가 다시 돌아와 비교하기 쉬워집니다. 이 페이지는 생년월일에서 태양 별자리를 계산하고 현재 주기와 결합해 같은 주기에는 같은 메시지를 보여줍니다.',
      freshnessTitle: '갱신 기준',
      freshness: '오늘의 별자리는 매일, 이번 주 별자리는 ISO 주차 기준, 이번 달 별자리는 월 단위로 갱신됩니다.',
      conceptTitle: '이 페이지가 보는 것',
      concepts: [
        { title: '태양 별자리', body: '생일 기준 별자리로 감정적 초점과 행동 경향을 읽습니다.' },
        { title: '주기별 메시지', body: '오늘은 실행, 이번 주는 계획, 이번 달은 큰 흐름에 맞춥니다.' },
        { title: '현실 점검', body: '예언보다 하루·주·월을 돌아보는 질문으로 사용합니다.' },
      ],
      useTitle: '활용 루프',
      useCases: [
        { title: '오늘의 태도', body: '별자리 키워드를 하루의 관찰 포인트로 잡습니다.' },
        { title: '주간 관계 점검', body: '이번 주 메시지를 대화, 속도, 휴식의 기준으로 봅니다.' },
        { title: '월간 테마', body: '이번 달의 감정 흐름과 실제 선택을 함께 기록합니다.' },
      ],
      faqTitle: '자주 묻는 질문',
      faqs: [
        { question: '기존 별자리 오늘의 운세와 무엇이 다른가요?', answer: '기존 페이지는 일일 운세 중심이고, 이 페이지는 오늘·이번 주·이번 달 검색 의도를 각각 받을 수 있는 주기형 페이지입니다.' },
        { question: '태양 별자리만으로 충분한가요?', answer: '개인 전체 차트를 설명하기에는 부족하지만, 가벼운 재방문 체크인으로는 접근성이 좋습니다.' },
        { question: '나쁜 운세가 나오면 일정을 바꿔야 하나요?', answer: '아니요. 중요한 결정은 사실과 조언을 기준으로 하고, 운세는 태도 점검에만 사용하세요.' },
      ],
      howToTitle: '사용 방법',
      howToSteps: ['생년월일을 입력합니다.', `${periodName(period, 'ko')} 별자리 결과를 확인합니다.`, '감정·관계·행동 키워드를 하나 기록합니다.', '다음 방문 때 실제 흐름과 비교합니다.'],
      relatedTitle: '별자리 클러스터',
      related: [
        { href: `/${locale}/zodiac/personality/`, label: '별자리 성격', desc: '태양 별자리 성향을 자세히 봅니다.' },
        { href: `/${locale}/zodiac/fortune/`, label: '별자리 오늘의 운세', desc: '기존 일일 별자리 페이지입니다.' },
        { href: `/${locale}/fortune/${period}/`, label: '종합 운세', desc: '사주·12지신·별자리를 함께 봅니다.' },
      ],
      disclaimer: '별자리 운세는 오락과 자기 성찰 목적입니다. 진로, 투자, 의료, 법률 결정을 대신하지 않습니다.',
    },
    en: {
      title: `${p} - Zodiac Horoscope by Birth Date`,
      description: `Check your ${p.toLowerCase()} by Sun sign. A stable daily, weekly, or monthly horoscope check-in that refreshes with the cycle.`,
      h1: p,
      eyebrow: 'Periodic Zodiac',
      sub: 'Sun-sign keywords for today, this week, or this month.',
      introTitle: 'Turn horoscope reading into a return loop',
      intro: 'Horoscopes are often read daily, but weekly and monthly pages give users a clearer reason to return and compare. This page calculates the Sun sign from birth date and combines it with the current cycle.',
      freshnessTitle: 'Freshness rule',
      freshness: 'Daily horoscope refreshes each day, weekly follows the ISO week, and monthly changes when the month changes.',
      conceptTitle: 'What this page reads',
      concepts: [
        { title: 'Sun sign', body: 'The birthday-based sign gives a simple emotional and behavioral frame.' },
        { title: 'Cycle message', body: 'Today is for action, this week for planning, and this month for larger themes.' },
        { title: 'Reality check', body: 'Read it as a question for reflection, not as a fixed prediction.' },
      ],
      useTitle: 'Return loop',
      useCases: [
        { title: 'Today’s attitude', body: 'Use one sign keyword as the day’s observation point.' },
        { title: 'Weekly relationship check', body: 'Use the weekly note to think about pace, conversation, and rest.' },
        { title: 'Monthly theme', body: 'Record the month’s emotional theme beside actual choices.' },
      ],
      faqTitle: 'Frequently asked questions',
      faqs: [
        { question: 'How is this different from the daily horoscope page?', answer: 'The existing page focuses on daily fortune. This page targets today, weekly, and monthly horoscope searches with stable cycle-based results.' },
        { question: 'Is the Sun sign enough?', answer: 'It is not a full natal chart, but it is accessible and useful for a light returning check-in.' },
        { question: 'Should I change plans after a difficult horoscope?', answer: 'No. Important choices should rely on facts and advice. Use the horoscope only as an attitude check.' },
      ],
      howToTitle: 'How to use it',
      howToSteps: ['Enter your birth date.', `Read the ${periodName(period, 'en').toLowerCase()} zodiac result.`, 'Save one emotion, relationship, or action keyword.', 'Return next cycle and compare it with real events.'],
      relatedTitle: 'Zodiac cluster',
      related: [
        { href: `/${locale}/zodiac/personality/`, label: 'Zodiac personality', desc: 'Read your Sun-sign traits in more detail.' },
        { href: `/${locale}/zodiac/fortune/`, label: 'Daily horoscope', desc: 'Use the existing daily horoscope page.' },
        { href: `/${locale}/fortune/${period}/`, label: 'Combined fortune', desc: 'Compare Saju, Chinese zodiac, and star sign together.' },
      ],
      disclaimer: 'Horoscopes are for entertainment and self-reflection. They do not replace career, financial, medical, or legal decisions.',
    },
    ja: {
      title: `${p} - 12星座の周期運勢`,
      description: `${p}を太陽星座で確認します。今日・今週・今月ごとに安定して更新される星座チェックインです。`,
      h1: p,
      eyebrow: '周期型の星座占い',
      sub: '太陽星座で今日・今週・今月の感情と行動キーワードを見ます。',
      introTitle: '星座占いを再訪しやすいループにする',
      intro: '星座占いは毎日読まれますが、週と月の流れを分けると比較しやすくなります。このページは生年月日から太陽星座を計算し、現在の周期と組み合わせます。',
      freshnessTitle: '更新基準',
      freshness: '今日の星座占いは毎日、今週はISO週、今月は月替わりで更新されます。',
      conceptTitle: 'このページで見ること',
      concepts: [
        { title: '太陽星座', body: '生年月日から出す星座で、感情と行動の枠組みを読みます。' },
        { title: '周期メッセージ', body: '今日は実行、今週は計画、今月は大きなテーマに合わせます。' },
        { title: '現実の確認', body: '予言ではなく、振り返りの質問として使います。' },
      ],
      useTitle: '活用ループ',
      useCases: [
        { title: '今日の姿勢', body: '星座キーワードを一日の観察点にします。' },
        { title: '週間の関係確認', body: '会話、速度、休息を考える材料にします。' },
        { title: '月間テーマ', body: '今月の感情テーマと実際の選択を一緒に記録します。' },
      ],
      faqTitle: 'よくある質問',
      faqs: [
        { question: '既存の今日の星座占いと何が違いますか？', answer: '既存ページは日次中心です。このページは今日・今週・今月の検索意図に合わせた周期型ページです。' },
        { question: '太陽星座だけで十分ですか？', answer: '出生図全体ではありませんが、軽い再訪チェックインとしては使いやすい入口です。' },
        { question: '悪い結果なら予定を変えるべきですか？', answer: 'いいえ。重要な判断は事実と助言を基準にし、占いは姿勢の確認に使ってください。' },
      ],
      howToTitle: '使い方',
      howToSteps: ['生年月日を入力します。', `${periodName(period, 'ja')}の星座結果を読みます。`, '感情・関係・行動キーワードを一つ記録します。', '次回の訪問で実際の流れと比べます。'],
      relatedTitle: '星座クラスター',
      related: [
        { href: `/${locale}/zodiac/personality/`, label: '星座性格', desc: '太陽星座の性質を詳しく見ます。' },
        { href: `/${locale}/zodiac/fortune/`, label: '今日の星座占い', desc: '既存の日次ページです。' },
        { href: `/${locale}/fortune/${period}/`, label: '総合運勢', desc: '四柱・十二支・星座を比較します。' },
      ],
      disclaimer: '星座占いは娯楽と自己省察のためのものです。進路、投資、医療、法律の判断を代替しません。',
    },
    zh: {
      title: `${p} - 12星座周期运势`,
      description: `按太阳星座查看${p}。今日、本周、本月会按周期稳定更新。`,
      h1: p,
      eyebrow: '周期型星座',
      sub: '按太阳星座查看今日、本周、本月的情绪与行动关键词。',
      introTitle: '把星座运势做成可回访循环',
      intro: '星座运势常被每天阅读，但区分周和月后更容易回访比较。本页按出生日期计算太阳星座，并与当前周期结合。',
      freshnessTitle: '更新规则',
      freshness: '今日星座每天更新，本周星座按 ISO 周更新，本月星座随月份更新。',
      conceptTitle: '本页关注什么',
      concepts: [
        { title: '太阳星座', body: '用生日对应的星座提供情绪和行动框架。' },
        { title: '周期信息', body: '今日偏执行，本周偏计划，本月偏大主题。' },
        { title: '现实检查', body: '把它当作反思问题，而不是固定预言。' },
      ],
      useTitle: '回访方式',
      useCases: [
        { title: '今日态度', body: '选择一个星座关键词作为今天的观察点。' },
        { title: '每周关系检查', body: '用本周信息思考对话、节奏和休息。' },
        { title: '每月主题', body: '记录本月情绪主题和实际选择。' },
      ],
      faqTitle: '常见问题',
      faqs: [
        { question: '它和已有星座今日运势有什么不同？', answer: '已有页面以日运为主；本页针对今日、本周、本月三个搜索意图提供周期型结果。' },
        { question: '只看太阳星座够吗？', answer: '它不能代表完整星盘，但作为轻量回访检查很容易使用。' },
        { question: '结果不好要改计划吗？', answer: '不用。重要决定应根据事实和建议，星座运势只用于态度检查。' },
      ],
      howToTitle: '使用方法',
      howToSteps: ['输入出生日期。', `查看${periodName(period, 'zh')}星座结果。`, '记录一个情绪、关系或行动关键词。', '下次回访时与实际事件比较。'],
      relatedTitle: '星座内容组',
      related: [
        { href: `/${locale}/zodiac/personality/`, label: '星座性格', desc: '查看太阳星座特质。' },
        { href: `/${locale}/zodiac/fortune/`, label: '星座今日运势', desc: '使用已有日运页面。' },
        { href: `/${locale}/fortune/${period}/`, label: '综合运势', desc: '比较四柱、生肖和星座。' },
      ],
      disclaimer: '星座运势用于娱乐和自我反思，不替代职业、投资、医疗或法律决定。',
    },
    fr: {
      title: `${p} - horoscope périodique par signe`,
      description: `Consultez ${p.toLowerCase()} selon votre signe solaire. Un point quotidien, hebdomadaire ou mensuel qui se renouvelle avec le cycle.`,
      h1: p,
      eyebrow: 'Zodiaque périodique',
      sub: 'Mots-clés du signe solaire pour aujourd’hui, cette semaine ou ce mois.',
      introTitle: 'Transformer l’horoscope en boucle de retour',
      intro: 'Les horoscopes se lisent souvent chaque jour, mais les pages hebdomadaires et mensuelles donnent une raison plus claire de revenir et de comparer. Cette page calcule le signe solaire puis l’associe au cycle actuel.',
      freshnessTitle: 'Règle de fraîcheur',
      freshness: 'L’horoscope du jour change chaque jour, l’hebdomadaire suit la semaine ISO, et le mensuel change avec le mois.',
      conceptTitle: 'Ce que lit cette page',
      concepts: [
        { title: 'Signe solaire', body: 'Le signe basé sur l’anniversaire donne un cadre émotionnel et comportemental simple.' },
        { title: 'Message de cycle', body: 'Aujourd’hui sert à agir, cette semaine à planifier, ce mois à voir le thème large.' },
        { title: 'Vérification réelle', body: 'Lisez-le comme une question de réflexion, pas comme une prédiction fixe.' },
      ],
      useTitle: 'Boucle de retour',
      useCases: [
        { title: 'Attitude du jour', body: 'Utilisez un mot-clé du signe comme point d’observation.' },
        { title: 'Relation de la semaine', body: 'Servez-vous de la note pour penser au rythme, à la conversation et au repos.' },
        { title: 'Thème du mois', body: 'Notez le thème émotionnel du mois avec vos choix réels.' },
      ],
      faqTitle: 'Questions fréquentes',
      faqs: [
        { question: 'Quelle différence avec l’horoscope quotidien ?', answer: 'La page existante vise le quotidien. Celle-ci cible les recherches du jour, de la semaine et du mois avec des résultats par cycle.' },
        { question: 'Le signe solaire suffit-il ?', answer: 'Ce n’est pas un thème natal complet, mais c’est un point d’entrée accessible pour un court retour.' },
        { question: 'Faut-il changer ses plans après un horoscope difficile ?', answer: 'Non. Les choix importants doivent reposer sur des faits et des conseils. Utilisez l’horoscope pour vérifier votre attitude.' },
      ],
      howToTitle: 'Mode d’emploi',
      howToSteps: ['Entrez votre date de naissance.', `Lisez le résultat zodiacal pour ${periodName(period, 'fr').toLowerCase()}.`, 'Notez un mot émotionnel, relationnel ou d’action.', 'Revenez au cycle suivant et comparez avec les faits.'],
      relatedTitle: 'Cluster zodiaque',
      related: [
        { href: `/${locale}/zodiac/personality/`, label: 'Personnalité zodiacale', desc: 'Lire les traits de votre signe solaire.' },
        { href: `/${locale}/zodiac/fortune/`, label: 'Horoscope du jour', desc: 'Utiliser la page quotidienne existante.' },
        { href: `/${locale}/fortune/${period}/`, label: 'Fortune combinée', desc: 'Comparer Saju, zodiaque chinois et signe astral.' },
      ],
      disclaimer: 'Les horoscopes sont destinés au divertissement et à la réflexion. Ils ne remplacent pas les décisions de carrière, finance, santé ou droit.',
    },
    es: {
      title: `${p} - horóscopo periódico por signo`,
      description: `Consulta ${p.toLowerCase()} según tu signo solar. Un chequeo diario, semanal o mensual que se renueva con el ciclo.`,
      h1: p,
      eyebrow: 'Zodiaco periódico',
      sub: 'Palabras clave del signo solar para hoy, esta semana o este mes.',
      introTitle: 'Convertir el horóscopo en ciclo de regreso',
      intro: 'Los horóscopos suelen leerse a diario, pero las páginas semanales y mensuales dan una razón clara para volver y comparar. Esta página calcula el signo solar y lo une al ciclo actual.',
      freshnessTitle: 'Regla de actualización',
      freshness: 'El horóscopo diario cambia cada día, el semanal sigue la semana ISO y el mensual cambia con el mes.',
      conceptTitle: 'Qué lee esta página',
      concepts: [
        { title: 'Signo solar', body: 'El signo por cumpleaños ofrece un marco emocional y de comportamiento sencillo.' },
        { title: 'Mensaje de ciclo', body: 'Hoy sirve para actuar, esta semana para planear y este mes para ver el tema amplio.' },
        { title: 'Chequeo real', body: 'Léelo como una pregunta de reflexión, no como una predicción fija.' },
      ],
      useTitle: 'Ciclo de regreso',
      useCases: [
        { title: 'Actitud de hoy', body: 'Usa una palabra del signo como punto de observación.' },
        { title: 'Relación semanal', body: 'Usa la nota para pensar en ritmo, conversación y descanso.' },
        { title: 'Tema mensual', body: 'Registra el tema emocional del mes junto a tus decisiones reales.' },
      ],
      faqTitle: 'Preguntas frecuentes',
      faqs: [
        { question: '¿En qué se diferencia del horóscopo diario?', answer: 'La página existente se centra en lo diario. Esta página cubre búsquedas de hoy, semanal y mensual con resultados por ciclo.' },
        { question: '¿Basta con el signo solar?', answer: 'No es una carta natal completa, pero es un punto de entrada accesible para un chequeo ligero.' },
        { question: '¿Debo cambiar planes por un horóscopo difícil?', answer: 'No. Las decisiones importantes deben basarse en hechos y consejos. Usa el horóscopo para revisar tu actitud.' },
      ],
      howToTitle: 'Cómo usarlo',
      howToSteps: ['Introduce tu fecha de nacimiento.', `Lee el resultado zodiacal de ${periodName(period, 'es').toLowerCase()}.`, 'Guarda una palabra emocional, relacional o de acción.', 'Vuelve en el siguiente ciclo y compara con los hechos.'],
      relatedTitle: 'Cluster zodiaco',
      related: [
        { href: `/${locale}/zodiac/personality/`, label: 'Personalidad zodiacal', desc: 'Lee rasgos de tu signo solar.' },
        { href: `/${locale}/zodiac/fortune/`, label: 'Horóscopo diario', desc: 'Usa la página diaria existente.' },
        { href: `/${locale}/fortune/${period}/`, label: 'Fortuna combinada', desc: 'Compara Saju, zodiaco chino y signo.' },
      ],
      disclaimer: 'Los horóscopos son para entretenimiento y autorreflexión. No reemplazan decisiones de carrera, finanzas, salud o legales.',
    },
  };

  return copy[locale] ?? copy.en;
}
