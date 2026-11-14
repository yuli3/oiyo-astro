import { compareMbti, type MbtiDim } from '@/lib/pair-result';

// MBTI 두 사람 비교. 축마다 "같다/다르다" 와 대화 제안 한 줄만 쓴다.
// 궁합 점수·좋은/나쁜 조합 표는 쓰지 않는다 — MBTI 는 선호를 보여 줄 뿐
// 관계의 결과를 예측하지 않는다(테스트 페이지 안내와 같은 태도).

type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es';

const UI: Record<Locale, { me: string; them: string; same: string; diff: string }> = {
  ko: { me: '나', them: '상대', same: '같아요', diff: '달라요' },
  en: { me: 'Me', them: 'Them', same: 'Same', diff: 'Different' },
  ja: { me: 'わたし', them: '相手', same: '同じ', diff: '違う' },
  zh: { me: '我', them: '对方', same: '相同', diff: '不同' },
  fr: { me: 'Moi', them: 'L’autre', same: 'Pareil', diff: 'Différent' },
  es: { me: 'Yo', them: 'La otra persona', same: 'Igual', diff: 'Distinto' },
};

const NOTES: Record<Locale, Record<MbtiDim, { name: string; same: string; diff: string }>> = {
  ko: {
    EI: { name: '에너지', same: '힘을 채우는 방식이 비슷해요. 함께 쉬는 방법을 정하기 쉬워요.', diff: '한 사람은 사람들 속에서, 한 사람은 혼자 있을 때 충전해요. 모임 뒤 쉬는 시간을 미리 말해 두세요.' },
    SN: { name: '정보', same: '무엇을 먼저 보는지가 비슷해요. 이야기가 빨리 통해요.', diff: '한 사람은 지금의 사실을, 한 사람은 앞으로의 가능성을 먼저 봐요. 계획할 때 서로의 질문을 하나씩 받아 주세요.' },
    TF: { name: '결정', same: '결정할 때 기준이 비슷해요.', diff: '한 사람은 논리를, 한 사람은 마음을 먼저 살펴요. 고민을 들을 때 "해결이 필요해, 들어 주길 바라?"를 먼저 물어보세요.' },
    JP: { name: '생활', same: '생활 리듬이 비슷해요.', diff: '한 사람은 미리 정하고, 한 사람은 열어 두는 편이에요. 꼭 정할 것과 열어 둘 것을 나눠 보세요.' },
  },
  en: {
    EI: { name: 'Energy', same: 'You recharge in similar ways, so planning downtime together is easy.', diff: 'One of you recharges around people, the other alone. Agree on quiet time after social plans.' },
    SN: { name: 'Information', same: 'You notice similar things first, so conversations click quickly.', diff: 'One of you looks at present facts, the other at future possibilities. When planning, take one question from each side.' },
    TF: { name: 'Decisions', same: 'You use similar yardsticks when deciding.', diff: 'One of you checks logic first, the other feelings. When listening, ask “Do you want solutions or just someone to listen?”' },
    JP: { name: 'Lifestyle', same: 'Your daily rhythms are similar.', diff: 'One of you likes things settled, the other likes options open. Split what must be decided from what can stay open.' },
  },
  ja: {
    EI: { name: 'エネルギー', same: '元気の取り戻し方が似ています。一緒の休み方を決めやすいです。', diff: '一人は人の中で、もう一人は一人の時間で充電します。集まりの後の休む時間を先に伝えておきましょう。' },
    SN: { name: '情報', same: '先に目が行くところが似ています。話がすぐ通じます。', diff: '一人は今の事実を、もう一人はこれからの可能性を先に見ます。計画の時はお互いの問いを一つずつ受け取りましょう。' },
    TF: { name: '決め方', same: '決めるときの基準が似ています。', diff: '一人は論理を、もう一人は気持ちを先に見ます。悩みを聞くときは「解決したい？聞いてほしい？」と先に聞いてみましょう。' },
    JP: { name: '暮らし', same: '生活のリズムが似ています。', diff: '一人は先に決めたい、もう一人は余白を残したいタイプです。決めることと空けておくことを分けてみましょう。' },
  },
  zh: {
    EI: { name: '能量', same: '你们恢复精力的方式相似，一起安排休息很容易。', diff: '一个人在人群中充电，另一个人在独处时充电。聚会后的休息时间，最好提前说好。' },
    SN: { name: '信息', same: '你们先注意到的东西相似，聊天很快就能对上。', diff: '一个人先看眼前的事实，另一个人先看未来的可能。做计划时，各自提一个问题。' },
    TF: { name: '决定', same: '你们做决定的标准相似。', diff: '一个人先看逻辑，另一个人先看感受。倾听烦恼时，先问一句“你需要办法，还是想让我听你说？”' },
    JP: { name: '生活', same: '你们的生活节奏相似。', diff: '一个人喜欢提前定好，另一个人喜欢留有余地。把必须定下的和可以留白的分开吧。' },
  },
  fr: {
    EI: { name: 'Énergie', same: 'Vous vous ressourcez de façon proche : facile de prévoir du repos ensemble.', diff: 'L’un se ressource avec les autres, l’autre seul. Convenez d’un temps calme après les sorties.' },
    SN: { name: 'Information', same: 'Vous remarquez d’abord les mêmes choses : la conversation passe vite.', diff: 'L’un regarde les faits présents, l’autre les possibles. Pour planifier, prenez une question de chaque côté.' },
    TF: { name: 'Décision', same: 'Vous décidez avec des critères proches.', diff: 'L’un regarde d’abord la logique, l’autre les ressentis. Pour écouter, demandez : « Tu veux une solution ou juste être écouté ? »' },
    JP: { name: 'Mode de vie', same: 'Vos rythmes de vie se ressemblent.', diff: 'L’un aime fixer les choses, l’autre garder des options. Séparez ce qui doit être décidé de ce qui peut rester ouvert.' },
  },
  es: {
    EI: { name: 'Energía', same: 'Recargáis energía de forma parecida: es fácil planear el descanso juntos.', diff: 'Uno recarga entre gente y el otro a solas. Acordad un rato tranquilo después de los planes sociales.' },
    SN: { name: 'Información', same: 'Os fijáis primero en cosas parecidas: la conversación fluye rápido.', diff: 'Uno mira los hechos presentes y el otro las posibilidades. Al planear, tomad una pregunta de cada lado.' },
    TF: { name: 'Decisiones', same: 'Usáis criterios parecidos para decidir.', diff: 'Uno revisa primero la lógica y el otro los sentimientos. Al escuchar, pregunta: «¿Quieres soluciones o que te escuche?»' },
    JP: { name: 'Estilo de vida', same: 'Vuestros ritmos diarios se parecen.', diff: 'A uno le gusta dejarlo todo decidido y al otro mantener opciones. Separad lo que hay que decidir de lo que puede quedar abierto.' },
  },
};

// 재미 요소(2026-11-03): 같은 축 개수로 "우리 조합 이름"을 붙인다. 좋고 나쁨의 등급이
// 아니라 모양의 이름이다. 0개여도 나쁜 말로 쓰지 않는다.
const CHEMISTRY: Record<Locale, { emoji: string; name: string; line: string }[]> = {
  ko: [
    { emoji: '🧩', name: '정반대 퍼즐 조각', line: '네 축이 모두 달라요. 서로 없는 칸을 채워 주는 조합이에요.' },
    { emoji: '🌗', name: '다른 듯 닮은 짝', line: '하나만 같고 셋이 달라요. 공통점 하나가 둘의 다리가 돼요.' },
    { emoji: '⚖️', name: '반반 듀오', line: '둘은 같고 둘은 달라요. 편하면서도 새로운 조합이에요.' },
    { emoji: '👯', name: '거의 쌍둥이', line: '셋이 같고 하나만 달라요. 그 하나가 대화거리예요.' },
    { emoji: '🪞', name: '거울 쌍둥이', line: '네 축이 모두 같아요. 말 안 해도 통하지만, 둘 다 놓치는 것도 같을 수 있어요.' },
  ],
  en: [
    { emoji: '🧩', name: 'Opposite puzzle pieces', line: 'All four axes differ. Each of you fills the other’s gaps.' },
    { emoji: '🌗', name: 'Different, yet alike', line: 'One axis matches, three differ. That one match is your bridge.' },
    { emoji: '⚖️', name: 'Half-and-half duo', line: 'Two match, two differ: comfortable and fresh at once.' },
    { emoji: '👯', name: 'Almost twins', line: 'Three match, one differs. That one is your best conversation topic.' },
    { emoji: '🪞', name: 'Mirror twins', line: 'All four match. You click without words, but may miss the same things.' },
  ],
  ja: [
    { emoji: '🧩', name: '正反対のパズル', line: '4つの軸がすべて違います。お互いの空白を埋める組み合わせです。' },
    { emoji: '🌗', name: '違うようで似たふたり', line: '1つだけ同じで3つ違います。その1つがふたりの橋です。' },
    { emoji: '⚖️', name: '半々コンビ', line: '2つ同じで2つ違います。気楽で新鮮な組み合わせです。' },
    { emoji: '👯', name: 'ほぼ双子', line: '3つ同じで1つだけ違います。その1つが話のタネです。' },
    { emoji: '🪞', name: '鏡の双子', line: '4つすべて同じ。言わなくても通じますが、見落とすところも同じかもしれません。' },
  ],
  zh: [
    { emoji: '🧩', name: '相反的拼图', line: '四个维度全都不同。你们正好补上彼此的空缺。' },
    { emoji: '🌗', name: '看似不同却相像', line: '一个相同、三个不同。这一个共同点就是你们的桥。' },
    { emoji: '⚖️', name: '一半一半组合', line: '两个相同、两个不同。既自在又新鲜。' },
    { emoji: '👯', name: '几乎是双胞胎', line: '三个相同、一个不同。那一个就是最好的话题。' },
    { emoji: '🪞', name: '镜子双胞胎', line: '四个全都相同。不用说也懂，但也可能一起漏掉同样的事。' },
  ],
  fr: [
    { emoji: '🧩', name: 'Pièces de puzzle opposées', line: 'Les quatre axes diffèrent : chacun comble les vides de l’autre.' },
    { emoji: '🌗', name: 'Différents mais proches', line: 'Un axe en commun, trois différents. Ce point commun est votre pont.' },
    { emoji: '⚖️', name: 'Duo moitié-moitié', line: 'Deux pareils, deux différents : confortable et nouveau à la fois.' },
    { emoji: '👯', name: 'Presque jumeaux', line: 'Trois pareils, un différent. Celui-là est votre meilleur sujet.' },
    { emoji: '🪞', name: 'Jumeaux miroirs', line: 'Les quatre pareils. Vous vous comprenez sans mots, mais risquez de rater les mêmes choses.' },
  ],
  es: [
    { emoji: '🧩', name: 'Piezas de puzle opuestas', line: 'Los cuatro ejes son distintos: cada uno llena los huecos del otro.' },
    { emoji: '🌗', name: 'Distintos pero parecidos', line: 'Un eje igual y tres distintos. Ese punto en común es vuestro puente.' },
    { emoji: '⚖️', name: 'Dúo mitad y mitad', line: 'Dos iguales y dos distintos: cómodo y nuevo a la vez.' },
    { emoji: '👯', name: 'Casi gemelos', line: 'Tres iguales y uno distinto. Ese es vuestro mejor tema de charla.' },
    { emoji: '🪞', name: 'Gemelos espejo', line: 'Los cuatro iguales. Os entendéis sin palabras, pero quizá se os escapen las mismas cosas.' },
  ],
};

// 2026-11-11: 같은 글자 수(0~4)별 그림(Grok Build).
const PAIR_ICONS = ['0-puzzle', '1-moon', '2-scale', '3-twins', '4-mirror'].map((n) => `/images/grok-20261106/oiyo-icon-pair-chemistry-mbti-${n}.webp`);

export function mbtiChemistry(locale: string, mine: string, theirs: string) {
  const l = (locale in CHEMISTRY ? locale : 'en') as Locale;
  const same = compareMbti(mine, theirs).filter((r) => r.same).length;
  return CHEMISTRY[l][same];
}

export default function MbtiPairCompare({ locale, mine, theirs }: { locale: string; mine: string; theirs: string }) {
  const l = (locale in UI ? locale : 'en') as Locale;
  const ui = UI[l];
  const rows = compareMbti(mine, theirs);
  const chem = mbtiChemistry(l, mine, theirs);
  return (
    <div className="space-y-3">
      <div className="animate-fadeInUp rounded-2xl border border-primary/40 bg-primary/5 p-4 text-center">
        <img src={PAIR_ICONS[compareMbti(mine, theirs).filter((r) => r.same).length]} alt="" width="72" height="72" decoding="async" className="mx-auto h-16 w-16" />
        <p className="mt-1 text-xl font-black text-foreground">{chem.name}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{chem.line}</p>
      </div>
      <p className="text-center text-2xl font-black text-foreground">
        {ui.me} {mine.toUpperCase()} · {ui.them} {theirs.toUpperCase()}
      </p>
      <ul className="space-y-2">
        {rows.map((row) => {
          const note = NOTES[l][row.dim];
          return (
            <li key={row.dim} className="rounded-xl border border-border p-3">
              <p className="text-sm font-bold text-foreground">
                {note.name} · {row.mine} / {row.theirs} · <span className="text-muted-foreground">{row.same ? ui.same : ui.diff}</span>
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{row.same ? note.same : note.diff}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
