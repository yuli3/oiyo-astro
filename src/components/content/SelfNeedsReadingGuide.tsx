type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es';

const copy = {
  ko: {
    title: '반응, 내 해석, 감정을 나눠 봐요',
    example: '편집부의 가상 예시예요. 상대의 실제 생각이나 나의 성격을 판정하는 과정은 아니에요.',
    steps: [
      ['관찰한 일', '보낸 메시지에 아직 답장이 없어요.'],
      ['내가 붙인 해석', '“나를 싫어하나?”라고 생각했어요. 바쁘거나 답을 고민 중일 가능성도 남아 있어요.'],
      ['내가 느낀 감정', '불안하거나 서운할 수 있어요. 감정이 생겼다는 사실이 상대의 생각을 입증하지는 않아요.'],
    ],
    needsTitle: '욕구는 한 칸씩 통과하는 관문이 아니에요',
    needs: ['생리', '안전', '소속과 사랑', '존중', '자아실현'],
    note: '여러 욕구가 함께 작용할 수 있어요. 이 목록은 점수·성숙도·진단 결과가 아니라 지금의 필요를 살펴보는 읽기 안내예요.',
    source: '매슬로의 1943년 원문 읽기',
  },
  en: {
    title: 'Separate the event, your interpretation and your feelings',
    example: 'An imagined editorial example, not a way to determine someone’s thoughts or your personality.',
    steps: [
      ['What you observed', 'Your message has not received a reply yet.'],
      ['Your interpretation', '“Do they dislike me?” Other possibilities remain: they may be busy or considering a reply.'],
      ['What you feel', 'You may feel anxious or hurt. Having a feeling does not establish what the other person thinks.'],
    ],
    needsTitle: 'Needs are not gates you must pass one by one',
    needs: ['Physiological', 'Safety', 'Love and belonging', 'Esteem', 'Self-actualisation'],
    note: 'Several needs can operate together. This list is a reading aid for considering your needs, not a score, maturity scale or diagnosis.',
    source: 'Read Maslow’s 1943 paper',
  },
  ja: {
    title: '出来事・自分の解釈・感情を分けてみましょう',
    example: '編集部による架空の例です。相手の本心や自分の性格を判定する手順ではありません。',
    steps: [
      ['観察したこと', '送ったメッセージに、まだ返信がありません。'],
      ['自分の解釈', '「嫌われたのかな」と考えました。忙しい、返事を考えているなど、別の可能性もあります。'],
      ['感じたこと', '不安や寂しさを感じるかもしれません。その感情だけでは、相手の考えはわかりません。'],
    ],
    needsTitle: '欲求は一つずつ通過する関門ではありません',
    needs: ['生理的欲求', '安全', '所属と愛', '承認', '自己実現'],
    note: '複数の欲求が同時に働くことがあります。今の必要を考えるための案内であり、点数・成熟度・診断結果ではありません。',
    source: 'マズローの1943年の論文を読む',
  },
  zh: {
    title: '分清发生的事、自己的解释和感受',
    example: '这是编辑部编写的假设例子，不用于判定对方的想法或你的性格。',
    steps: [
      ['观察到的事', '你发出的消息暂时还没有收到回复。'],
      ['自己的解释', '你想：“对方是不是不喜欢我？”也可能是对方正忙，或还在考虑如何回复。'],
      ['自己的感受', '你可能感到不安或委屈。但这种感受并不能证明对方在想什么。'],
    ],
    needsTitle: '需求不是必须逐级通过的关卡',
    needs: ['生理', '安全', '归属与爱', '尊重', '自我实现'],
    note: '多种需求可以同时起作用。这份清单帮助你思考当下的需要，并不是分数、成熟度量表或诊断结果。',
    source: '阅读马斯洛1943年的论文原文',
  },
  fr: {
    title: 'Distinguez le fait, votre interprétation et votre émotion',
    example: 'Exemple fictif de la rédaction, et non méthode pour déterminer les pensées d’autrui ou votre personnalité.',
    steps: [
      ['Le fait observé', 'Votre message n’a pas encore reçu de réponse.'],
      ['Votre interprétation', '« Cette personne ne m’aime pas ? » Elle peut aussi être occupée ou réfléchir à sa réponse.'],
      ['Votre émotion', 'Vous pouvez ressentir de l’inquiétude ou de la peine. Cette émotion ne prouve pas ce que pense l’autre personne.'],
    ],
    needsTitle: 'Les besoins ne sont pas des étapes à valider une à une',
    needs: ['Besoins physiologiques', 'Sécurité', 'Appartenance et amour', 'Estime', 'Accomplissement de soi'],
    note: 'Plusieurs besoins peuvent agir ensemble. Cette liste aide à réfléchir à vos besoins actuels ; ce n’est ni un score, ni une échelle de maturité, ni un diagnostic.',
    source: 'Lire l’article de Maslow de 1943',
  },
  es: {
    title: 'Distingue el hecho, tu interpretación y tu emoción',
    example: 'Ejemplo ficticio de la redacción, no un método para determinar lo que alguien piensa ni tu personalidad.',
    steps: [
      ['El hecho observado', 'Tu mensaje todavía no ha recibido respuesta.'],
      ['Tu interpretación', '«¿Le caigo mal?» También puede estar ocupado o pensando qué responder.'],
      ['Tu emoción', 'Puedes sentir inquietud o tristeza. Esa emoción no demuestra lo que piensa la otra persona.'],
    ],
    needsTitle: 'Las necesidades no son etapas que debas superar una a una',
    needs: ['Fisiológicas', 'Seguridad', 'Pertenencia y amor', 'Estima', 'Autorrealización'],
    note: 'Varias necesidades pueden actuar a la vez. Esta lista ayuda a pensar en tus necesidades actuales; no es una puntuación, una escala de madurez ni un diagnóstico.',
    source: 'Leer el artículo de Maslow de 1943',
  },
} as const;

export function SelfNeedsReadingGuide({ locale = 'en' }: { locale?: Locale }) {
  const c = copy[locale];
  // WHY 2026-10-22: a static reading aid needs neither profile input nor hydration.
  // Equal-weight need labels avoid turning an illustrative hierarchy into a score.
  return (
    <aside className="my-6 space-y-6 border-y border-border py-5" data-self-needs-guide={locale}>
      <figure className="m-0">
        <figcaption className="font-semibold text-foreground">{c.title}</figcaption>
        <p className="mt-2 text-sm text-muted-foreground">{c.example}</p>
        <ol className="mt-3 grid list-none gap-4 p-0 md:grid-cols-3">
          {c.steps.map(([label, body]) => (
            <li key={label} className="min-w-0">
              <p className="m-0 font-semibold text-foreground">{label}</p>
              <p className="mb-0 mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </figure>
      <figure className="m-0">
        <figcaption className="font-semibold text-foreground">{c.needsTitle}</figcaption>
        <ul className="mt-3 grid list-none gap-x-4 gap-y-2 p-0 sm:grid-cols-2">
          {c.needs.map(need => <li key={need} className="min-w-0 text-sm text-foreground">{need}</li>)}
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.note}</p>
        <a className="text-sm text-primary underline underline-offset-4" href="https://psychclassics.yorku.ca/Maslow/motivation.htm">{c.source}</a>
      </figure>
    </aside>
  );
}
