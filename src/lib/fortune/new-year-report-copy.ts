// 2027 신년운세 리포트 미리보기 문구(6개 로케일). 엔진은 new-year-report.ts.
import type { Locale } from "./periodic";
import type { Role } from "./new-year-report";

export const ROLE_EMOJI: Record<Role, string> = {
  bigyeop: "🤝",
  siksang: "🎨",
  jaesung: "💰",
  gwansung: "🏛️",
  insung: "📚",
};

interface RoleText {
  label: string;
  year: string;
  month: string;
}

export interface NewYearReportCopy {
  page: {
    title: string;
    description: string;
    eyebrow: string;
    h1: string;
    sub: string;
    aboutHeading: string;
    about: string[];
    faqHeading: string;
    faqs: { question: string; answer: string }[];
  };
  ui: {
    birthDate: string;
    empty: string;
    yearHeading: string;
    surface: string;
    undercurrent: (label: string) => string;
    monthsHeading: string;
    monthsNote: string;
    previewHeading: (month: string) => string;
    lockedHeading: string;
    lockedItems: string[];
    lockedBadge: string;
    waitlistCta: string;
    waitlistDone: string;
    /** 출시 알림 메일 신청 링크 문구. ko 외 언어는 news의 영어 신청 페이지로 가므로 (영어) 표시를 붙인다 (2026-10-19). */
    notifyCta?: string;
    disclaimer: string;
  };
  role: Record<Role, RoleText>;
  relation: {
    clash: { year: string; month: string };
    harmony: { year: string; month: string };
  };
}

const ko: NewYearReportCopy = {
  page: {
    title: "2027 신년운세 무료 미리보기 | 정미년 사주로 보는 한 해 | OIYO",
    description: "생년월일만 넣으면 2027년 정미년이 내 일간에 어떤 해인지, 12달 주제와 1월 운세를 무료로 미리 볼 수 있어요.",
    eyebrow: "2027 정미년 신년운세",
    h1: "2027 신년운세 미리보기",
    sub: "생년월일만 넣으면 2027년이 나에게 어떤 해인지 바로 보여 드려요. 시각은 몰라도 괜찮아요.",
    aboutHeading: "어떻게 읽나요",
    about: [
      "2027년은 정미(丁未)년이에요. 천간 정(丁)은 촛불 같은 음의 불, 지지 미(未)는 한여름 끝의 음의 흙이에요. 같은 해라도 사람마다 의미가 다른 이유는, 그해의 간지가 내 일간(태어난 날의 천간)과 어떤 관계인지가 사람마다 다르기 때문이에요.",
      "이 미리보기는 그해의 천간을 '겉으로 드러나는 주제', 지지를 '바탕에 깔린 흐름'으로 읽고, 내 일지와 충(沖)·합(合)인지를 함께 봐요. 달마다 같은 방식으로 월주를 읽어 12달의 주제를 정리했어요. 결과는 생년월일과 달력만으로 정해지는 계산이라, 같은 날 태어난 사람은 같은 결과를 봐요.",
    ],
    faqHeading: "자주 묻는 질문",
    faqs: [
      { question: "태어난 시각을 몰라도 되나요?", answer: "네. 이 미리보기는 일간과 일지만 쓰기 때문에 생년월일만으로 계산돼요. 시각이 필요한 용신 분석은 사주 계산기에서 따로 볼 수 있어요." },
      { question: "1월이 왜 아직 병오년이에요?", answer: "사주의 해는 입춘(2월 4일 무렵)에 바뀌어요. 그래서 2027년 1월은 병오년의 마지막 달(신축월)로 읽어요." },
      { question: "전체 리포트에는 무엇이 들어가나요?", answer: "2~12월 달별 해석, 재물·일·관계 흐름, 좋은 달과 조심할 달 정리를 담을 예정이에요. 관심 수를 보고 출시 여부를 정해요." },
    ],
  },
  ui: {
    birthDate: "생년월일",
    empty: "생년월일을 넣으면 바로 미리보기가 나와요.",
    yearHeading: "2027 정미년, 나에게는",
    surface: "겉으로 드러나는 주제",
    undercurrent: (label) => `바탕에는 ${label}의 흐름이 깔려 있어요.`,
    monthsHeading: "12달 주제 한눈에",
    monthsNote: "월주는 매달 15일 기준이에요. 사주의 달은 절기(매달 4~8일 무렵)에 바뀌어요.",
    previewHeading: (month) => `${month} 미리보기`,
    lockedHeading: "전체 리포트에 들어갈 것",
    lockedItems: ["2~12월 달별 자세한 해석", "재물·일·관계 흐름", "좋은 달과 조심할 달 정리", "저장해 두고 보는 PDF"],
    lockedBadge: "전체 리포트",
    waitlistCta: "전체 리포트 나오면 볼래요",
    waitlistDone: "관심 고마워요. 누른 분이 충분하면 전체 리포트를 만들어 이 페이지에 열게요.",
    notifyCta: "나오면 메일로 알려 주세요 →",
    disclaimer: "전통 명리의 상징 해석이에요. 중요한 결정은 사실과 전문가 조언을 바탕으로 하세요.",
  },
  role: {
    bigyeop: { label: "동료·경쟁", year: "나와 같은 기운이 들어오는 해예요. 동료와 경쟁자가 늘고, 독립하거나 내 몫을 주장하고 싶어져요. 혼자 다 하려 하기보다 함께할 사람을 고르는 게 핵심이에요. 돈은 나가기 쉬우니 공동 투자나 보증은 신중하게 보세요.", month: "사람이 모이는 달. 협업은 좋고, 돈 거래는 선을 분명히." },
    siksang: { label: "표현·창작", year: "표현하고 만들어 내는 해예요. 아이디어와 작업물이 바깥으로 흘러나가고 새 일을 벌이고 싶어져요. 결과물을 보여 줄 기회를 잡되, 말이 앞서 윗사람과 부딪치지 않게 조심하세요.", month: "표현의 달. 만들고 보여 주기 좋지만 말실수는 조심." },
    jaesung: { label: "재물·실속", year: "돈과 성과가 눈앞에 보이는 해예요. 수입과 거래, 실속을 챙길 기회가 늘고 현실적인 목표가 잘 맞아요. 욕심이 커지는 만큼 체력과 일정 관리가 같이 가야 해요.", month: "실속의 달. 수입과 거래를 챙기되 과욕은 금물." },
    gwansung: { label: "책임·평가", year: "책임과 평가의 해예요. 자리와 규칙, 조직이 화두가 되고 인정받을 기회와 압박이 같이 와요. 원칙을 지키는 쪽이 유리하고, 무리한 일정은 스트레스로 돌아와요.", month: "책임의 달. 평가와 마감이 몰리니 일정에 여유를." },
    insung: { label: "배움·지원", year: "배우고 도움받는 해예요. 공부와 자격, 문서와 계약이 잘 풀리고 나를 밀어 주는 사람이 생겨요. 생각이 많아 실행이 늦어지기 쉬우니 배운 것을 하나씩 써먹는 데 집중하세요.", month: "충전의 달. 배우고 계획하기 좋은 때." },
  },
  relation: {
    clash: { year: "올해의 지지가 내 일지와 충(沖)이에요. 이사·이직·관계 변화처럼 자리가 흔들리는 일이 생기기 쉬워요. 변화를 피하기보다 미리 계획해 두면 기회가 돼요.", month: "일지와 충: 변동이 생기기 쉬워요." },
    harmony: { year: "올해의 지지가 내 일지와 합(合)이에요. 새 인연이나 든든한 협력자가 생기기 쉬운 해예요.", month: "일지와 합: 인연과 협력이 붙어요." },
  },
};

const en: NewYearReportCopy = {
  page: {
    title: "2027 Year Ahead Saju Reading, Free Preview | Year of the Fire Goat | OIYO",
    description: "Enter your birth date to see what 2027, the Ding-Wei (Fire Goat) year, means for your day master, with a 12-month theme map and a free January reading.",
    eyebrow: "2027 Fire Goat year reading",
    h1: "2027 Year Ahead Reading, Preview",
    sub: "Enter your birth date and see what kind of year 2027 is for you. You don't need your birth time.",
    aboutHeading: "How this reading works",
    about: [
      "2027 is the Ding-Wei (丁未) year. The stem Ding is yin fire, like candlelight; the branch Wei is yin earth at the end of high summer. The same year means different things to different people because its pillar relates differently to each person's day master, the stem of the day they were born.",
      "This preview reads the year's stem as the theme that shows on the surface and its branch as the undercurrent, then checks whether the branch clashes or harmonizes with your day branch. Each month is read the same way from its month pillar. Everything is calculated from your birth date and the calendar, so people born on the same day see the same result.",
    ],
    faqHeading: "FAQ",
    faqs: [
      { question: "Do I need my birth time?", answer: "No. This preview uses only your day master and day branch, which your birth date fixes. Analyses that need the hour, such as the favorable element, are in the Saju calculator." },
      { question: "Why is January still the previous year?", answer: "The Saju year turns at Lichun, around February 4. January 2027 is read as the last month (Xin-Chou) of the Bing-Wu year." },
      { question: "What will the full report include?", answer: "Detailed readings for February to December, money, work and relationship trends, and your best and most careful months. Whether we publish it depends on how many people ask for it." },
    ],
  },
  ui: {
    birthDate: "Birth date",
    empty: "Enter your birth date to see the preview.",
    yearHeading: "2027, the Fire Goat year, for you",
    surface: "Theme on the surface",
    undercurrent: (label) => `Underneath runs a current of ${label.toLowerCase()}.`,
    monthsHeading: "12 months at a glance",
    monthsNote: "Month pillars are taken on the 15th. Saju months turn at the solar terms, around the 4th to 8th of each month.",
    previewHeading: (month) => `${month} preview`,
    lockedHeading: "In the full report",
    lockedItems: ["Detailed readings for February to December", "Money, work and relationship trends", "Your best and most careful months", "A PDF to keep"],
    lockedBadge: "Full report",
    waitlistCta: "I'd read the full report",
    waitlistDone: "Thanks. If enough people ask, we'll build the full report and open it on this page.",
    notifyCta: "Email me when it's out →",
    disclaimer: "This is a symbolic reading from traditional Saju. Base important decisions on facts and professional advice.",
  },
  role: {
    bigyeop: { label: "Peers and rivals", year: "A year when energy like your own arrives. Peers and rivals multiply, and you may want independence or to claim your share. The key is choosing who to work with rather than doing everything alone. Money leaves easily, so be careful with joint investments and guarantees.", month: "A month of people. Good for teamwork; keep money lines clear." },
    siksang: { label: "Expression and creation", year: "A year of expressing and making. Ideas and work flow outward and you'll want to start new things. Take chances to show your work, but don't let words run ahead and clash with people above you.", month: "A month of expression. Good for making and showing; mind your words." },
    jaesung: { label: "Money and results", year: "A year when money and results come into view. Chances for income, deals and tangible gains grow, and practical goals fit well. As ambition grows, keep your energy and schedule in check.", month: "A month of results. Secure income and deals, but don't overreach." },
    gwansung: { label: "Duty and evaluation", year: "A year of responsibility and evaluation. Position, rules and organizations take center stage, bringing both recognition and pressure. Sticking to principles pays off; overloaded schedules turn into stress.", month: "A month of duty. Reviews and deadlines pile up; leave slack." },
    insung: { label: "Learning and support", year: "A year of learning and being helped. Study, credentials, paperwork and contracts go smoothly, and someone may back you. Overthinking can slow you down, so focus on using what you learn, one thing at a time.", month: "A month to recharge. Good for learning and planning." },
  },
  relation: {
    clash: { year: "This year's branch clashes with your day branch. Moves, job changes or shifts in relationships are more likely. Planning for change turns it into an opportunity.", month: "Clash with your day branch: changes are likely." },
    harmony: { year: "This year's branch harmonizes with your day branch. New connections or a reliable partner are more likely this year.", month: "Harmony with your day branch: good for connections." },
  },
};

const ja: NewYearReportCopy = {
  page: {
    title: "2027年 新年運勢 無料プレビュー | 丁未年の四柱推命 | OIYO",
    description: "生年月日を入れるだけで、2027年・丁未年があなたの日干にとってどんな年か、12か月のテーマと1月の運勢を無料で確認できます。",
    eyebrow: "2027年 丁未年の新年運勢",
    h1: "2027年 新年運勢プレビュー",
    sub: "生年月日を入れると、2027年があなたにとってどんな年かすぐに分かります。出生時刻は不要です。",
    aboutHeading: "読み方",
    about: [
      "2027年は丁未(ひのとひつじ)年です。天干の丁はろうそくの灯のような陰の火、地支の未は盛夏の終わりの陰の土です。同じ年でも人によって意味が違うのは、その年の干支とあなたの日干(生まれた日の天干)との関係が人ごとに異なるからです。",
      "このプレビューでは、年の天干を「表に出るテーマ」、地支を「底に流れる流れ」として読み、あなたの日支と冲・合の関係かどうかも見ます。各月も同じ方法で月柱を読み、12か月のテーマをまとめました。生年月日と暦だけで決まる計算なので、同じ日に生まれた人は同じ結果になります。",
    ],
    faqHeading: "よくある質問",
    faqs: [
      { question: "出生時刻が分からなくても大丈夫ですか?", answer: "はい。このプレビューは日干と日支だけを使うので、生年月日だけで計算できます。時刻が必要な用神の分析は四柱推命計算機で確認できます。" },
      { question: "なぜ1月はまだ前の年なのですか?", answer: "四柱推命の年は立春(2月4日ごろ)で切り替わります。そのため2027年1月は丙午年の最後の月(辛丑月)として読みます。" },
      { question: "完全版には何が入りますか?", answer: "2〜12月の月別の詳しい解説、金運・仕事・人間関係の流れ、良い月と注意する月のまとめを入れる予定です。関心の数を見て公開を決めます。" },
    ],
  },
  ui: {
    birthDate: "生年月日",
    empty: "生年月日を入れるとプレビューが表示されます。",
    yearHeading: "2027年 丁未年、あなたにとっては",
    surface: "表に出るテーマ",
    undercurrent: (label) => `底には「${label}」の流れがあります。`,
    monthsHeading: "12か月のテーマ",
    monthsNote: "月柱は毎月15日基準です。四柱推命の月は節気(毎月4〜8日ごろ)で切り替わります。",
    previewHeading: (month) => `${month}のプレビュー`,
    lockedHeading: "完全版に入るもの",
    lockedItems: ["2〜12月の月別の詳しい解説", "金運・仕事・人間関係の流れ", "良い月と注意する月のまとめ", "保存できるPDF"],
    lockedBadge: "完全版",
    waitlistCta: "完全版が出たら読みたい",
    waitlistDone: "ありがとうございます。希望が十分集まったら完全版を作り、このページで公開します。",
    notifyCta: "出たらメールで知らせて（英語のメール）→",
    disclaimer: "伝統的な命理の象徴的な解釈です。大切な決定は事実と専門家の助言に基づいて行ってください。",
  },
  role: {
    bigyeop: { label: "仲間・競争", year: "自分と同じ気が入ってくる年です。仲間やライバルが増え、独立したい、自分の取り分を主張したいと感じやすくなります。一人で抱え込むより、一緒に進む人を選ぶことが鍵です。お金は出ていきやすいので、共同投資や保証は慎重に。", month: "人が集まる月。協力は吉、お金の線引きははっきりと。" },
    siksang: { label: "表現・創作", year: "表現し、生み出す年です。アイデアや作品が外へ流れ出し、新しいことを始めたくなります。成果を見せる機会をつかみつつ、言葉が先走って目上の人とぶつからないよう注意しましょう。", month: "表現の月。作って見せるのに良いが、失言に注意。" },
    jaesung: { label: "財・実利", year: "お金と成果が目に見える年です。収入や取引、実利をつかむ機会が増え、現実的な目標がよく合います。欲が大きくなる分、体力とスケジュール管理も一緒に。", month: "実利の月。収入と取引を固めつつ、欲張りすぎない。" },
    gwansung: { label: "責任・評価", year: "責任と評価の年です。立場やルール、組織がテーマになり、認められる機会とプレッシャーが同時に来ます。原則を守る方が有利で、無理な予定はストレスになって返ってきます。", month: "責任の月。評価と締め切りが重なるので余裕を。" },
    insung: { label: "学び・支援", year: "学び、助けられる年です。勉強や資格、書類や契約がうまく進み、後押ししてくれる人が現れます。考えすぎて行動が遅れやすいので、学んだことを一つずつ使うことに集中しましょう。", month: "充電の月。学びと計画に向いています。" },
  },
  relation: {
    clash: { year: "今年の地支があなたの日支と冲の関係です。引っ越しや転職、人間関係の変化など、足元が揺れる出来事が起きやすい年です。変化を避けるより前もって計画すれば、チャンスになります。", month: "日支と冲:変動が起きやすい月。" },
    harmony: { year: "今年の地支があなたの日支と合の関係です。新しい縁や頼れる協力者ができやすい年です。", month: "日支と合:縁と協力に恵まれる月。" },
  },
};

const zh: NewYearReportCopy = {
  page: {
    title: "2027年运势免费预览 | 丁未年八字流年 | OIYO",
    description: "输入出生日期,即可免费查看2027丁未年对你的日主意味着什么,包括12个月的主题和1月运势。",
    eyebrow: "2027丁未年流年运势",
    h1: "2027年运势预览",
    sub: "输入出生日期,马上看到2027年对你来说是怎样的一年。不需要出生时辰。",
    aboutHeading: "怎么解读",
    about: [
      "2027年是丁未年。天干丁是如烛光般的阴火,地支未是盛夏将尽时的阴土。同一年对不同的人意义不同,是因为当年的干支与每个人日主(出生当天的天干)的关系各不相同。",
      "本预览把流年天干读作\"表面的主题\",地支读作\"底下的暗流\",并看它与你的日支是冲还是合。每个月也用同样的方法读月柱,整理出12个月的主题。结果只由出生日期和历法计算得出,同一天出生的人会看到相同的结果。",
    ],
    faqHeading: "常见问题",
    faqs: [
      { question: "不知道出生时辰可以吗?", answer: "可以。本预览只用日主和日支,出生日期就能确定。需要时辰的用神分析请到八字计算器查看。" },
      { question: "为什么1月还是上一年?", answer: "八字的年份在立春(2月4日前后)交接。所以2027年1月按丙午年的最后一个月(辛丑月)来读。" },
      { question: "完整报告包括什么?", answer: "2至12月的逐月详解、财运·事业·人际的走势,以及好月份和需谨慎月份的整理。我们会根据感兴趣的人数决定是否推出。" },
    ],
  },
  ui: {
    birthDate: "出生日期",
    empty: "输入出生日期即可看到预览。",
    yearHeading: "2027丁未年,对你来说",
    surface: "表面的主题",
    undercurrent: (label) => `底下流动着\"${label}\"的暗流。`,
    monthsHeading: "12个月主题一览",
    monthsNote: "月柱以每月15日为准。八字的月份在节气(每月4至8日前后)交接。",
    previewHeading: (month) => `${month}预览`,
    lockedHeading: "完整报告包括",
    lockedItems: ["2至12月逐月详解", "财运·事业·人际走势", "好月份与需谨慎月份", "可保存的PDF"],
    lockedBadge: "完整报告",
    waitlistCta: "完整版出来我想看",
    waitlistDone: "谢谢。想看的人足够多时,我们会制作完整报告并在本页开放。",
    notifyCta: "上线时发邮件通知我（英文邮件）→",
    disclaimer: "这是传统命理的象征性解读。重要决定请以事实和专业意见为依据。",
  },
  role: {
    bigyeop: { label: "同伴·竞争", year: "与你同类的气场进入的一年。同伴和对手增多,你可能想独立或争取自己的份额。关键是选好同行的人,而不是事事一个人扛。钱财容易流出,合伙投资和担保要谨慎。", month: "人聚之月。合作顺利,金钱往来要界线分明。" },
    siksang: { label: "表达·创作", year: "表达与创造的一年。想法和作品向外流动,你会想开展新的事情。抓住展示成果的机会,但别让话说在前面而与上级冲突。", month: "表达之月。适合创作与展示,注意言辞。" },
    jaesung: { label: "财富·实利", year: "金钱和成果看得见的一年。收入、交易和实利的机会增多,务实的目标很合适。野心变大的同时,体力和日程也要管理好。", month: "实利之月。抓住收入和交易,但勿贪多。" },
    gwansung: { label: "责任·评价", year: "责任与评价的一年。职位、规则和组织成为主题,被认可的机会与压力同时到来。坚守原则更有利,过满的日程会变成压力。", month: "责任之月。评估和截止日期集中,日程留余地。" },
    insung: { label: "学习·支持", year: "学习和得到帮助的一年。学业、证书、文书和合同进展顺利,会有人支持你。想得太多容易拖慢行动,专注于把学到的东西逐一用起来。", month: "充电之月。适合学习和规划。" },
  },
  relation: {
    clash: { year: "今年的地支与你的日支相冲。搬家、换工作、关系变化等动荡更容易发生。与其回避变化,不如提前规划,把它变成机会。", month: "与日支相冲:容易有变动。" },
    harmony: { year: "今年的地支与你的日支相合。今年更容易结识新缘分或可靠的合作者。", month: "与日支相合:人缘与合作顺利。" },
  },
};

const fr: NewYearReportCopy = {
  page: {
    title: "Horoscope Saju 2027, aperçu gratuit | Année de la Chèvre de Feu | OIYO",
    description: "Entrez votre date de naissance pour voir ce que 2027, l'année Ding-Wei (Chèvre de Feu), signifie pour votre maître du jour, avec les thèmes des 12 mois et un aperçu gratuit de janvier.",
    eyebrow: "Année 2027 de la Chèvre de Feu",
    h1: "Aperçu de votre année 2027",
    sub: "Entrez votre date de naissance pour voir quel genre d'année 2027 sera pour vous. L'heure de naissance n'est pas nécessaire.",
    aboutHeading: "Comment lire cet aperçu",
    about: [
      "2027 est l'année Ding-Wei (丁未). Le tronc Ding est un feu yin, comme une flamme de bougie ; la branche Wei est une terre yin de la fin de l'été. La même année a un sens différent pour chacun, car son pilier se relie différemment au maître du jour de chaque personne, c'est-à-dire au tronc du jour de naissance.",
      "Cet aperçu lit le tronc de l'année comme le thème visible et la branche comme le courant de fond, puis vérifie si la branche entre en clash ou en harmonie avec votre branche du jour. Chaque mois est lu de la même façon à partir de son pilier. Tout est calculé à partir de la date de naissance et du calendrier : les personnes nées le même jour voient le même résultat.",
    ],
    faqHeading: "Questions fréquentes",
    faqs: [
      { question: "Faut-il connaître son heure de naissance ?", answer: "Non. Cet aperçu n'utilise que le maître du jour et la branche du jour, fixés par la date de naissance. Les analyses qui demandent l'heure, comme l'élément favorable, sont dans le calculateur Saju." },
      { question: "Pourquoi janvier appartient-il encore à l'année précédente ?", answer: "L'année Saju change à Lichun, vers le 4 février. Janvier 2027 se lit donc comme le dernier mois (Xin-Chou) de l'année Bing-Wu." },
      { question: "Que contiendra le rapport complet ?", answer: "Des lectures détaillées de février à décembre, les tendances argent, travail et relations, et vos meilleurs mois et ceux où rester prudent. Sa publication dépendra du nombre de personnes intéressées." },
    ],
  },
  ui: {
    birthDate: "Date de naissance",
    empty: "Entrez votre date de naissance pour voir l'aperçu.",
    yearHeading: "2027, année de la Chèvre de Feu, pour vous",
    surface: "Thème visible",
    undercurrent: (label) => `En fond, un courant de ${label.toLowerCase()}.`,
    monthsHeading: "Les 12 mois en un coup d'œil",
    monthsNote: "Les piliers du mois sont pris le 15. Les mois Saju changent aux termes solaires, vers le 4 à 8 de chaque mois.",
    previewHeading: (month) => `Aperçu de ${month}`,
    lockedHeading: "Dans le rapport complet",
    lockedItems: ["Lectures détaillées de février à décembre", "Tendances argent, travail et relations", "Vos meilleurs mois et ceux où rester prudent", "Un PDF à garder"],
    lockedBadge: "Rapport complet",
    waitlistCta: "Je lirais le rapport complet",
    waitlistDone: "Merci. Si assez de personnes le demandent, nous préparerons le rapport complet et l'ouvrirons sur cette page.",
    notifyCta: "Prévenez-moi par e-mail (en anglais) →",
    disclaimer: "Il s'agit d'une lecture symbolique du Saju traditionnel. Fondez vos décisions importantes sur les faits et des conseils professionnels.",
  },
  role: {
    bigyeop: { label: "Pairs et rivaux", year: "Une année où arrive une énergie semblable à la vôtre. Pairs et rivaux se multiplient, et vous pourriez vouloir plus d'indépendance ou réclamer votre part. L'essentiel est de bien choisir avec qui avancer plutôt que de tout porter seul. L'argent part facilement : prudence avec les investissements communs et les cautions.", month: "Un mois de rencontres. Bon pour le travail d'équipe ; gardez les comptes clairs." },
    siksang: { label: "Expression et création", year: "Une année pour s'exprimer et créer. Idées et réalisations sortent, et l'envie de lancer de nouveaux projets grandit. Saisissez les occasions de montrer votre travail, sans laisser vos mots devancer la réflexion face à vos supérieurs.", month: "Un mois d'expression. Bon pour créer et montrer ; attention aux paroles." },
    jaesung: { label: "Argent et résultats", year: "Une année où l'argent et les résultats deviennent visibles. Les occasions de revenus, d'affaires et de gains concrets augmentent, et les objectifs pratiques conviennent bien. Plus l'ambition grandit, plus il faut gérer son énergie et son agenda.", month: "Un mois de résultats. Consolidez revenus et affaires, sans excès." },
    gwansung: { label: "Devoir et évaluation", year: "Une année de responsabilités et d'évaluation. Poste, règles et organisation passent au premier plan, avec à la fois reconnaissance et pression. Tenir ses principes paie ; un agenda surchargé se transforme en stress.", month: "Un mois de devoirs. Évaluations et échéances s'accumulent ; gardez de la marge." },
    insung: { label: "Apprentissage et soutien", year: "Une année pour apprendre et être aidé. Études, diplômes, papiers et contrats avancent bien, et quelqu'un peut vous soutenir. Trop réfléchir ralentit l'action : concentrez-vous sur l'usage de ce que vous apprenez, une chose à la fois.", month: "Un mois pour recharger. Idéal pour apprendre et planifier." },
  },
  relation: {
    clash: { year: "La branche de l'année entre en clash avec votre branche du jour. Déménagements, changements d'emploi ou de relations sont plus probables. Anticiper le changement en fait une occasion.", month: "Clash avec votre branche du jour : changements probables." },
    harmony: { year: "La branche de l'année est en harmonie avec votre branche du jour. Nouvelles rencontres ou partenaire fiable sont plus probables cette année.", month: "Harmonie avec votre branche du jour : bon pour les liens." },
  },
};

const es: NewYearReportCopy = {
  page: {
    title: "Horóscopo Saju 2027, vista previa gratis | Año de la Cabra de Fuego | OIYO",
    description: "Introduce tu fecha de nacimiento y descubre qué significa 2027, el año Ding-Wei (Cabra de Fuego), para tu maestro del día, con los temas de los 12 meses y una lectura gratuita de enero.",
    eyebrow: "Año 2027 de la Cabra de Fuego",
    h1: "Vista previa de tu año 2027",
    sub: "Introduce tu fecha de nacimiento y mira qué tipo de año será 2027 para ti. No necesitas la hora de nacimiento.",
    aboutHeading: "Cómo se lee",
    about: [
      "2027 es el año Ding-Wei (丁未). El tronco Ding es fuego yin, como la luz de una vela; la rama Wei es tierra yin del final del verano. El mismo año significa cosas distintas para cada persona porque su pilar se relaciona de forma diferente con el maestro del día de cada uno, el tronco del día en que nació.",
      "Esta vista previa lee el tronco del año como el tema visible y la rama como la corriente de fondo, y comprueba si la rama choca o armoniza con tu rama del día. Cada mes se lee igual a partir de su pilar. Todo se calcula con la fecha de nacimiento y el calendario, así que quienes nacieron el mismo día ven el mismo resultado.",
    ],
    faqHeading: "Preguntas frecuentes",
    faqs: [
      { question: "¿Necesito mi hora de nacimiento?", answer: "No. Esta vista previa solo usa el maestro del día y la rama del día, que fija tu fecha de nacimiento. Los análisis que requieren la hora, como el elemento favorable, están en la calculadora Saju." },
      { question: "¿Por qué enero sigue siendo el año anterior?", answer: "El año Saju cambia en Lichun, hacia el 4 de febrero. Por eso enero de 2027 se lee como el último mes (Xin-Chou) del año Bing-Wu." },
      { question: "¿Qué incluirá el informe completo?", answer: "Lecturas detalladas de febrero a diciembre, tendencias de dinero, trabajo y relaciones, y tus mejores meses y los de más cuidado. Publicarlo dependerá de cuántas personas lo pidan." },
    ],
  },
  ui: {
    birthDate: "Fecha de nacimiento",
    empty: "Introduce tu fecha de nacimiento para ver la vista previa.",
    yearHeading: "2027, año de la Cabra de Fuego, para ti",
    surface: "Tema visible",
    undercurrent: (label) => `Debajo corre una corriente de ${label.toLowerCase()}.`,
    monthsHeading: "Los 12 meses de un vistazo",
    monthsNote: "Los pilares del mes se toman el día 15. Los meses Saju cambian en los términos solares, hacia el 4 a 8 de cada mes.",
    previewHeading: (month) => `Vista previa de ${month}`,
    lockedHeading: "En el informe completo",
    lockedItems: ["Lecturas detalladas de febrero a diciembre", "Tendencias de dinero, trabajo y relaciones", "Tus mejores meses y los de más cuidado", "Un PDF para guardar"],
    lockedBadge: "Informe completo",
    waitlistCta: "Leería el informe completo",
    waitlistDone: "Gracias. Si lo piden suficientes personas, prepararemos el informe completo y lo abriremos en esta página.",
    notifyCta: "Avísenme por correo (en inglés) →",
    disclaimer: "Es una lectura simbólica del Saju tradicional. Basa las decisiones importantes en hechos y en consejo profesional.",
  },
  role: {
    bigyeop: { label: "Compañeros y rivales", year: "Un año en que llega una energía como la tuya. Aumentan compañeros y rivales, y puede que quieras independizarte o reclamar tu parte. La clave es elegir con quién avanzar en lugar de cargar con todo. El dinero sale con facilidad: cuidado con inversiones conjuntas y avales.", month: "Un mes de gente. Bueno para colaborar; deja claras las cuentas." },
    siksang: { label: "Expresión y creación", year: "Un año para expresar y crear. Ideas y trabajos salen hacia fuera y tendrás ganas de empezar cosas nuevas. Aprovecha para mostrar tu trabajo, pero que tus palabras no se adelanten y choquen con tus superiores.", month: "Un mes de expresión. Bueno para crear y mostrar; cuida tus palabras." },
    jaesung: { label: "Dinero y resultados", year: "Un año en que el dinero y los resultados se hacen visibles. Crecen las oportunidades de ingresos, negocios y ganancias concretas, y los objetivos prácticos encajan bien. A medida que crece la ambición, cuida tu energía y tu agenda.", month: "Un mes de resultados. Asegura ingresos y tratos, sin excederte." },
    gwansung: { label: "Deber y evaluación", year: "Un año de responsabilidad y evaluación. Cargo, normas y organización pasan al centro, con reconocimiento y presión a la vez. Mantener los principios compensa; una agenda sobrecargada se convierte en estrés.", month: "Un mes de deberes. Se acumulan evaluaciones y plazos; deja margen." },
    insung: { label: "Aprendizaje y apoyo", year: "Un año para aprender y recibir ayuda. Estudios, títulos, papeles y contratos avanzan bien, y alguien puede respaldarte. Pensar demasiado puede frenarte: céntrate en usar lo que aprendes, una cosa cada vez.", month: "Un mes para recargar. Bueno para aprender y planificar." },
  },
  relation: {
    clash: { year: "La rama del año choca con tu rama del día. Mudanzas, cambios de trabajo o de relaciones son más probables. Planificar el cambio lo convierte en oportunidad.", month: "Choque con tu rama del día: cambios probables." },
    harmony: { year: "La rama del año armoniza con tu rama del día. Este año son más probables nuevos vínculos o un socio de confianza.", month: "Armonía con tu rama del día: buenos vínculos." },
  },
};

const COPY: Record<Locale, NewYearReportCopy> = { ko, en, ja, zh, fr, es };

export function getNewYearReportCopy(locale: Locale): NewYearReportCopy {
  return COPY[locale] ?? COPY.en;
}

const INTL_LOCALE: Record<Locale, string> = { ko: "ko-KR", en: "en-US", ja: "ja-JP", zh: "zh-CN", fr: "fr-FR", es: "es-ES" };

export function monthName(locale: Locale, month: number, style: "long" | "short" = "long"): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], { month: style, timeZone: "UTC" }).format(
    new Date(Date.UTC(2027, month - 1, 15)),
  );
}
