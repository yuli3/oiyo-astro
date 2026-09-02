import { useEffect, useMemo, useRef, useState } from 'react';
import { DREAM_SYMBOLS, DREAM_CATEGORY_LABELS, type DreamCategory } from '../../data/dream-symbols';
import type { Locale } from '../../i18n';

/**
 * 해몽 도구.
 *
 * 규칙 기반이 본체다. 꿈에 나온 상징과 깨어난 뒤 감정, 요즘 상황을 고르면
 * 사전 데이터를 엮어 읽기를 만든다. **이 부분은 네트워크도 모델도 쓰지 않는다.**
 *
 * Chrome 내장 LLM(Prompt API)은 **있을 때만 붙는 덤**이다. 감지에 실패하거나
 * 모델이 없으면 채팅 칸 자체를 그리지 않고, 규칙 기반 읽기는 그대로 동작한다.
 * 브라우저 안에서 도는 모델이라 입력이 밖으로 나가지 않는다 — 꿈 이야기는
 * 사적인 내용이므로 이 점이 중요하다.
 */

type Tone = 'calm' | 'uneasy' | 'scared' | 'sad' | 'glad';
type Context = 'work' | 'relationship' | 'health' | 'change' | 'none';

interface Props {
  locale: Locale;
}

const L: Record<Locale, {
  pickTitle: string; pickHint: string;
  toneTitle: string; ctxTitle: string;
  submit: string; reset: string;
  resultTitle: string; tradTitle: string; psychTitle: string; sceneTitle: string;
  emptyPick: string;
  toneLabels: Record<Tone, string>;
  ctxLabels: Record<Context, string>;
  toneLead: Record<Tone, string>;
  ctxLead: Record<Context, string>;
  closing: string;
  disclaimer: string;
  chatTitle: string; chatHint: string; chatPlaceholder: string; chatSend: string;
  chatThinking: string; chatPrivacy: string; chatFailed: string;
  chatNeedsDownload: string; chatEnable: string; chatDownloading: string; symbolPage: string;
}> = {
  ko: {
    pickTitle: '꿈에 나온 것을 고르세요',
    pickHint: '여러 개를 골라도 됩니다.',
    toneTitle: '깨어났을 때 기분은',
    ctxTitle: '요즘 마음이 가 있는 곳은',
    submit: '읽어 보기', reset: '다시 고르기',
    resultTitle: '읽기', tradTitle: '전통 해몽에서는', psychTitle: '꿈 연구의 관점에서는',
    sceneTitle: '장면별로 전해 오는 읽기',
    emptyPick: '상징을 하나 이상 골라 주세요.',
    toneLabels: { calm: '담담했다', uneasy: '뒤숭숭했다', scared: '무서웠다', sad: '슬펐다', glad: '좋았다' },
    ctxLabels: { work: '일', relationship: '관계', health: '몸', change: '큰 변화', none: '딱히 없다' },
    toneLead: {
      calm: '깨어난 뒤 담담했다면, 그 꿈은 지금 감당하기 버거운 일과는 거리가 있을 가능성이 큽니다.',
      uneasy: '뒤숭숭함이 남았다면 장면보다 그 감정이 더 오래 갑니다. 무엇이 정리되지 않았는지부터 보십시오.',
      scared: '무서웠다면 꿈의 내용보다 지금의 긴장도를 먼저 살피는 편이 낫습니다.',
      sad: '슬픔이 남았다면 잃었거나 잃을까 걱정하는 것이 있는지 짚어 보십시오.',
      glad: '기분이 좋았다면 그대로 두어도 됩니다. 좋은 꿈을 해석해 불안으로 바꿀 이유는 없습니다.',
    },
    ctxLead: {
      work: '요즘 일에 마음이 가 있다면, 아래 상징들을 일의 부담·마감·평가와 겹쳐 읽어 보십시오.',
      relationship: '관계에 마음이 가 있다면, 상징을 사람 사이의 거리와 겹쳐 읽어 보십시오.',
      health: '몸에 마음이 가 있다면 수면·피로·복용 중인 약이 꿈에 미치는 영향도 함께 보십시오.',
      change: '큰 변화를 앞두고 있다면, 전환기에는 상실과 통과의례 계열의 꿈 보고가 늘어납니다.',
      none: '특별히 짚이는 것이 없다면, 아래 읽기를 결론이 아니라 질문 목록으로 쓰십시오.',
    },
    closing: '이 읽기는 상징 사전과 고른 항목을 엮은 것입니다. 앞일을 알려 주지 않으며, 결정의 근거로 쓰지 마세요. 악몽이 반복되고 일상이 무너진다면 해몽이 아니라 전문가의 도움을 찾으십시오.',
    disclaimer: '해몽은 문화적 상징 해석입니다.',
    chatTitle: '더 물어보기',
    chatHint: '이 브라우저에 내장된 모델로 답합니다. 입력한 내용은 기기 밖으로 나가지 않습니다.',
    chatPlaceholder: '꿈에서 어떤 장면이 가장 오래 남았나요?',
    chatSend: '보내기', chatThinking: '생각하는 중…',
    chatPrivacy: '기기 안에서 처리됨',
    chatFailed: '지금은 답할 수 없습니다. 위의 읽기는 그대로 쓰실 수 있습니다.',
    chatNeedsDownload: '이 브라우저는 모델을 지원하지만 아직 기기에 내려받지 않았습니다. 처음 한 번만 받으면 됩니다.',
    chatEnable: '모델 받고 켜기',
    chatDownloading: '받는 중…',
    symbolPage: '{name} 자세히 보기',
  },
  en: {
    pickTitle: 'Pick what appeared in your dream',
    pickHint: 'You can choose more than one.',
    toneTitle: 'How you felt on waking',
    ctxTitle: "What's on your mind lately",
    submit: 'Read it', reset: 'Start over',
    resultTitle: 'Reading', tradTitle: 'In the traditional reading', psychTitle: 'From dream research',
    sceneTitle: 'Scene by scene, as it was handed down',
    emptyPick: 'Choose at least one symbol.',
    toneLabels: { calm: 'calm', uneasy: 'unsettled', scared: 'afraid', sad: 'sad', glad: 'good' },
    ctxLabels: { work: 'work', relationship: 'relationships', health: 'body', change: 'a big change', none: 'nothing in particular' },
    toneLead: {
      calm: 'If you woke calm, the dream is probably not tracking something you are struggling to carry.',
      uneasy: 'Unease outlasts the images. Start with what has been left unresolved.',
      scared: 'If it frightened you, look at your current level of strain before the dream content.',
      sad: 'If sadness stayed, ask what has been lost, or what you fear losing.',
      glad: 'If it felt good, leave it there. There is no reason to interpret a good dream into a worry.',
    },
    ctxLead: {
      work: 'With work on your mind, read the symbols against load, deadlines and being assessed.',
      relationship: 'With relationships on your mind, read the symbols against distance between people.',
      health: 'With the body on your mind, also weigh sleep, fatigue and any medication you take.',
      change: 'Before a big change, reports of loss and rite-of-passage dreams rise.',
      none: 'With nothing in particular, use the reading below as a list of questions, not a conclusion.',
    },
    closing: 'This reading is the symbol dictionary combined with what you selected. It does not foretell anything and should not ground a decision. If nightmares recur and daily life suffers, seek professional help rather than more interpretation.',
    disclaimer: 'Dream reading is cultural symbol interpretation.',
    chatTitle: 'Ask more',
    chatHint: "Answered by the model built into this browser. What you type never leaves your device.",
    chatPlaceholder: 'Which scene stayed with you longest?',
    chatSend: 'Send', chatThinking: 'Thinking…',
    chatPrivacy: 'processed on your device',
    chatFailed: 'It cannot answer right now. The reading above still stands.',
    chatNeedsDownload: 'This browser supports the model but has not downloaded it yet. It is a one-time download.',
    chatEnable: 'Download and enable',
    chatDownloading: 'Downloading…',
    symbolPage: 'More on {name}',
  },
  ja: {
    pickTitle: '夢に出たものを選んでください',
    pickHint: '複数選べます。',
    toneTitle: '目覚めたときの気分は',
    ctxTitle: '最近気になっていることは',
    submit: '読んでみる', reset: '選び直す',
    resultTitle: '読み', tradTitle: '伝統的な夢解きでは', psychTitle: '夢研究の観点では',
    sceneTitle: '場面ごとに伝わる読み',
    emptyPick: '象徴を一つ以上選んでください。',
    toneLabels: { calm: '淡々としていた', uneasy: '落ち着かなかった', scared: '怖かった', sad: '悲しかった', glad: '良かった' },
    ctxLabels: { work: '仕事', relationship: '人間関係', health: '体', change: '大きな変化', none: '特にない' },
    toneLead: {
      calm: '淡々と目覚めたなら、その夢はいま抱えきれない事柄とは距離がある可能性が高いです。',
      uneasy: '落ち着かなさは場面より長く残ります。何が片づいていないかから見てください。',
      scared: '怖かったなら、夢の内容よりいまの緊張度を先に見るほうが役立ちます。',
      sad: '悲しさが残ったなら、失ったもの・失うのが怖いものを挙げてみてください。',
      glad: '気分が良かったならそのままで構いません。良い夢を解釈して不安に変える理由はありません。',
    },
    ctxLead: {
      work: '仕事が気になっているなら、象徴を負荷・締切・評価と重ねて読んでください。',
      relationship: '人間関係が気になっているなら、象徴を人との距離と重ねて読んでください。',
      health: '体が気になっているなら、睡眠・疲労・服用中の薬が夢に与える影響も併せて見てください。',
      change: '大きな変化を前にしていると、喪失や通過儀礼の夢の報告が増えます。',
      none: '特に思い当たらないなら、下の読みを結論ではなく質問の一覧として使ってください。',
    },
    closing: 'この読みは象徴事典と選んだ項目を組み合わせたものです。先のことを告げるものではなく、判断の根拠にはしないでください。悪夢が繰り返され日常が崩れるなら、夢解きではなく専門家の助けを求めてください。',
    disclaimer: '夢解きは文化的な象徴解釈です。',
    chatTitle: 'もう少し聞く',
    chatHint: 'このブラウザに内蔵されたモデルが答えます。入力内容は端末の外に出ません。',
    chatPlaceholder: '夢のどの場面が一番長く残っていますか。',
    chatSend: '送信', chatThinking: '考えています…',
    chatPrivacy: '端末内で処理',
    chatFailed: 'いま答えられません。上の読みはそのままお使いいただけます。',
    chatNeedsDownload: 'このブラウザはモデルに対応していますが、まだ端末に取得していません。最初の一回だけです。',
    chatEnable: '取得して有効にする',
    chatDownloading: '取得中…',
    symbolPage: '{name} を詳しく',
  },
  zh: {
    pickTitle: '选出梦里出现的东西',
    pickHint: '可以多选。',
    toneTitle: '醒来时的心情',
    ctxTitle: '最近心思落在哪里',
    submit: '读一读', reset: '重新选择',
    resultTitle: '读法', tradTitle: '传统解梦中', psychTitle: '从梦的研究看',
    sceneTitle: '逐个场景的传统读法',
    emptyPick: '请至少选择一个象征。',
    toneLabels: { calm: '平静', uneasy: '心神不宁', scared: '害怕', sad: '难过', glad: '愉快' },
    ctxLabels: { work: '工作', relationship: '关系', health: '身体', change: '重大变动', none: '没什么特别的' },
    toneLead: {
      calm: '若醒来平静，这个梦多半与你此刻难以承担的事无关。',
      uneasy: '不安比画面留得更久。先看看什么还没有理清。',
      scared: '若感到害怕，比起梦的内容，先看当下的紧绷程度更有用。',
      sad: '若留下难过，想想失去了什么，或害怕失去什么。',
      glad: '若心情不错，就这样也好。没有理由把好梦解释成担忧。',
    },
    ctxLead: {
      work: '心思在工作上，就把象征与负荷、期限、被评价叠在一起读。',
      relationship: '心思在关系上，就把象征与人际距离叠在一起读。',
      health: '心思在身体上，也一并考虑睡眠、疲劳与正在服用的药。',
      change: '面临重大变动时，失落与过渡类的梦的报告会增多。',
      none: '若没有特别之处，请把下面的读法当作问题清单，而不是结论。',
    },
    closing: '这段读法是把象征词典与你的选择组合而成。它不预告将来，也不应作为决策依据。若噩梦反复且影响日常，请寻求专业帮助，而不是继续解梦。',
    disclaimer: '解梦是文化性的象征解释。',
    chatTitle: '再问一点',
    chatHint: '由这个浏览器内置的模型作答。你输入的内容不会离开本机。',
    chatPlaceholder: '梦里哪个场景留得最久？',
    chatSend: '发送', chatThinking: '思考中…',
    chatPrivacy: '在本机处理',
    chatFailed: '现在无法作答。上面的读法仍然可用。',
    chatNeedsDownload: '此浏览器支持该模型，但尚未下载到本机。只需下载一次。',
    chatEnable: '下载并启用',
    chatDownloading: '下载中…',
    symbolPage: '详看{name}',
  },
  fr: {
    pickTitle: 'Choisissez ce qui est apparu dans votre rêve',
    pickHint: 'Plusieurs choix possibles.',
    toneTitle: 'Votre état au réveil',
    ctxTitle: 'Ce qui vous occupe ces temps-ci',
    submit: 'Lire', reset: 'Recommencer',
    resultTitle: 'Lecture', tradTitle: 'Dans la lecture traditionnelle', psychTitle: 'Du côté de la recherche',
    sceneTitle: 'Scène par scène, telle que transmise',
    emptyPick: 'Choisissez au moins un symbole.',
    toneLabels: { calm: 'calme', uneasy: 'troublé(e)', scared: 'effrayé(e)', sad: 'triste', glad: 'bien' },
    ctxLabels: { work: 'le travail', relationship: 'les relations', health: 'le corps', change: 'un grand changement', none: 'rien de particulier' },
    toneLead: {
      calm: "Réveil calme : le rêve ne suit probablement pas une charge que vous peinez à porter.",
      uneasy: "Le trouble dure plus longtemps que les images. Commencez par ce qui reste en suspens.",
      scared: "S'il vous a effrayé, regardez votre niveau de tension actuel avant le contenu du rêve.",
      sad: "Si la tristesse est restée, demandez ce qui a été perdu, ou ce que vous craignez de perdre.",
      glad: "Si c'était agréable, laissez-le ainsi. Aucune raison de transformer un bon rêve en souci.",
    },
    ctxLead: {
      work: "Le travail en tête : lisez les symboles au regard de la charge, des échéances et de l'évaluation.",
      relationship: 'Les relations en tête : lisez les symboles au regard de la distance entre les personnes.',
      health: 'Le corps en tête : pesez aussi le sommeil, la fatigue et vos éventuels traitements.',
      change: "Avant un grand changement, les récits de perte et de rite de passage augmentent.",
      none: "Rien de précis : servez-vous de la lecture ci-dessous comme d'une liste de questions.",
    },
    closing: "Cette lecture combine le dictionnaire des symboles et vos choix. Elle ne prédit rien et ne doit fonder aucune décision. Si les cauchemars se répètent et que le quotidien se dégrade, cherchez une aide professionnelle plutôt qu'une interprétation de plus.",
    disclaimer: "L'interprétation des rêves est une lecture culturelle de symboles.",
    chatTitle: 'Demander plus',
    chatHint: "Réponse par le modèle intégré à ce navigateur. Ce que vous tapez ne quitte pas votre appareil.",
    chatPlaceholder: 'Quelle scène vous est le plus restée ?',
    chatSend: 'Envoyer', chatThinking: 'Réflexion…',
    chatPrivacy: 'traité sur votre appareil',
    chatFailed: "Impossible de répondre pour l'instant. La lecture ci-dessus reste valable.",
    chatNeedsDownload: "Ce navigateur prend en charge le modèle mais ne l'a pas encore téléchargé. Téléchargement unique.",
    chatEnable: 'Télécharger et activer',
    chatDownloading: 'Téléchargement…',
    symbolPage: 'En savoir plus sur {name}',
  },
  es: {
    pickTitle: 'Elige lo que apareció en tu sueño',
    pickHint: 'Puedes elegir varios.',
    toneTitle: 'Cómo te sentiste al despertar',
    ctxTitle: 'Qué te ocupa últimamente',
    submit: 'Leer', reset: 'Empezar de nuevo',
    resultTitle: 'Lectura', tradTitle: 'En la lectura tradicional', psychTitle: 'Desde la investigación',
    sceneTitle: 'Escena por escena, como se transmitió',
    emptyPick: 'Elige al menos un símbolo.',
    toneLabels: { calm: 'en calma', uneasy: 'inquieto/a', scared: 'con miedo', sad: 'triste', glad: 'bien' },
    ctxLabels: { work: 'el trabajo', relationship: 'las relaciones', health: 'el cuerpo', change: 'un cambio grande', none: 'nada en particular' },
    toneLead: {
      calm: 'Si despertaste en calma, el sueño probablemente no sigue algo que te cueste sostener.',
      uneasy: 'La inquietud dura más que las imágenes. Empieza por lo que quedó sin resolver.',
      scared: 'Si te asustó, mira tu nivel de tensión actual antes que el contenido del sueño.',
      sad: 'Si quedó tristeza, pregunta qué se ha perdido o qué temes perder.',
      glad: 'Si se sintió bien, déjalo así. No hay razón para volver preocupación un buen sueño.',
    },
    ctxLead: {
      work: 'Con el trabajo en mente, lee los símbolos junto a la carga, los plazos y la evaluación.',
      relationship: 'Con las relaciones en mente, lee los símbolos junto a la distancia entre personas.',
      health: 'Con el cuerpo en mente, pesa también el sueño, la fatiga y la medicación que tomes.',
      change: 'Ante un cambio grande aumentan los relatos de pérdida y de rito de paso.',
      none: 'Sin nada concreto, usa la lectura de abajo como lista de preguntas, no como conclusión.',
    },
    closing: 'Esta lectura combina el diccionario de símbolos con lo que elegiste. No predice nada ni debe fundamentar una decisión. Si las pesadillas se repiten y la vida diaria se resiente, busca ayuda profesional en vez de más interpretación.',
    disclaimer: 'La interpretación de sueños es lectura cultural de símbolos.',
    chatTitle: 'Preguntar más',
    chatHint: 'Responde el modelo integrado en este navegador. Lo que escribes no sale de tu dispositivo.',
    chatPlaceholder: '¿Qué escena se te quedó más tiempo?',
    chatSend: 'Enviar', chatThinking: 'Pensando…',
    chatPrivacy: 'procesado en tu dispositivo',
    chatFailed: 'Ahora no puede responder. La lectura de arriba sigue siendo válida.',
    chatNeedsDownload: 'Este navegador admite el modelo pero aún no lo ha descargado. Es una descarga única.',
    chatEnable: 'Descargar y activar',
    chatDownloading: 'Descargando…',
    symbolPage: 'Más sobre {name}',
  },
};

const TONES: Tone[] = ['calm', 'uneasy', 'scared', 'sad', 'glad'];
const CONTEXTS: Context[] = ['work', 'relationship', 'health', 'change', 'none'];
const CATEGORY_ORDER: DreamCategory[] = ['nature', 'motion', 'body', 'creature', 'life', 'place'];

export default function DreamReading({ locale }: Props) {
  const t = L[locale] ?? L.en;
  const [picked, setPicked] = useState<string[]>([]);
  const [tone, setTone] = useState<Tone>('uneasy');
  const [context, setContext] = useState<Context>('none');
  const [shown, setShown] = useState(false);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const symbols = useMemo(
    () => DREAM_SYMBOLS.filter((s) => picked.includes(s.id)),
    [picked],
  );

  const grouped = useMemo(
    () =>
      CATEGORY_ORDER.map((c) => ({
        category: c,
        items: DREAM_SYMBOLS.filter((s) => s.category === c),
      })).filter((g) => g.items.length > 0),
    [],
  );

  function toggle(id: string) {
    setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setShown(false);
  }

  return (
    <div>
      <section>
        <h2 className="text-lg font-bold text-foreground">{t.pickTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t.pickHint}</p>
        {grouped.map((g) => (
          <div key={g.category} className="mt-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {DREAM_CATEGORY_LABELS[g.category][locale] ?? DREAM_CATEGORY_LABELS[g.category].en}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {g.items.map((s) => {
                const on = picked.includes(s.id);
                const r = s.l10n[locale] ?? s.l10n.en;
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(s.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      on
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-foreground hover:border-primary/50'
                    }`}
                  >
                    <span aria-hidden="true">{s.emoji}</span>
                    {r.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground">{t.toneTitle}</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {TONES.map((x) => (
            <button
              key={x}
              type="button"
              aria-pressed={tone === x}
              onClick={() => { setTone(x); setShown(false); }}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                tone === x ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              {t.toneLabels[x]}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-bold text-foreground">{t.ctxTitle}</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {CONTEXTS.map((x) => (
            <button
              key={x}
              type="button"
              aria-pressed={context === x}
              onClick={() => { setContext(x); setShown(false); }}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                context === x ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              {t.ctxLabels[x]}
            </button>
          ))}
        </div>
      </section>

      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setShown(true);
            window.requestAnimationFrame(() => resultRef.current?.scrollIntoView({ block: 'start' }));
          }}
          disabled={picked.length === 0}
          className="rounded-lg bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-primary-strong disabled:opacity-40"
        >
          {t.submit}
        </button>
        {picked.length === 0 && <span className="text-sm text-muted-foreground">{t.emptyPick}</span>}
        {picked.length > 0 && (
          <button type="button" onClick={() => { setPicked([]); setShown(false); }} className="text-sm text-muted-foreground underline underline-offset-4">
            {t.reset}
          </button>
        )}
      </div>

      {shown && symbols.length > 0 && (
        <div ref={resultRef} className="mt-10 scroll-mt-6">
          <h2 className="text-xl font-bold text-foreground">{t.resultTitle}</h2>
          <p className="mt-3 leading-8 text-foreground">{t.toneLead[tone]}</p>
          <p className="mt-2 leading-8 text-foreground">{t.ctxLead[context]}</p>

          {symbols.map((s) => {
            const r = s.l10n[locale] ?? s.l10n.en;
            return (
              <article key={s.id} className="mt-6 rounded-xl border border-border bg-card p-5">
                <h3 className="flex items-center gap-2 font-bold text-foreground">
                  <span aria-hidden="true">{s.emoji}</span>
                  {r.name}
                </h3>
                <p className="mt-3 text-sm font-semibold text-primary-strong">{t.tradTitle}</p>
                <p className="mt-1 text-sm leading-6 text-foreground">{r.traditional}</p>
                <p className="mt-3 text-sm font-semibold text-primary-strong">{t.psychTitle}</p>
                <p className="mt-1 text-sm leading-6 text-foreground">{r.psych}</p>
                <p className="mt-3 text-sm font-semibold text-primary-strong">{t.sceneTitle}</p>
                <ul className="mt-1 space-y-1.5">
                  {r.scenes.map((sc) => (
                    <li key={sc.when} className="text-sm leading-6 text-muted-foreground">
                      <span className="font-medium text-foreground">{sc.when}</span> — {sc.reads}
                    </li>
                  ))}
                </ul>
                <p className="mt-4">
                  <a className="text-sm text-primary-strong underline underline-offset-4" href={`/${locale}/dream/${s.id}/`}>
                    {t.symbolPage.replace('{name}', r.name)}
                  </a>
                </p>
              </article>
            );
          })}

          <p className="mt-6 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            {t.closing}
          </p>

          <DreamChat locale={locale} t={t} symbols={symbols.map((s) => (s.l10n[locale] ?? s.l10n.en).name)} tone={t.toneLabels[tone]} context={t.ctxLabels[context]} />
        </div>
      )}
    </div>
  );
}

/* ── Chrome 내장 모델(Prompt API) — 있으면 붙고 없으면 아무것도 그리지 않는다 ── */

type PromptSession = { prompt: (input: string) => Promise<string>; destroy?: () => void };

/**
 * 표준이 아직 움직이는 중이라 전역 이름이 브라우저마다 다르다.
 * 어느 것도 없으면 채팅은 그냥 없는 기능이 된다 — 그것이 정상 경로다.
 */
function getPromptApi(): { create: (opts?: unknown) => Promise<PromptSession>; availability?: () => Promise<string> } | null {
  const w = window as unknown as Record<string, any>;
  const candidates = [w.LanguageModel, w.ai?.languageModel, w.chrome?.ai?.languageModel];
  for (const c of candidates) {
    if (c && typeof c.create === 'function') return c;
  }
  return null;
}

function DreamChat({
  locale, t, symbols, tone, context,
}: {
  locale: Locale;
  t: (typeof L)[Locale];
  symbols: string[];
  tone: string;
  context: string;
}) {
  // 'ready' 바로 쓸 수 있음 · 'needs-download' 모델을 한 번 받아야 함 · 'none' 이 브라우저엔 없음
  const [state, setState] = useState<'unknown' | 'ready' | 'needs-download' | 'none'>('unknown');
  const [downloading, setDownloading] = useState(false);
  const [log, setLog] = useState<{ role: 'you' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const sessionRef = useRef<PromptSession | null>(null);

  // 감지는 결과가 그려진 뒤 한 번만 한다. 렌더 중에 상태를 바꾸면 안 되고,
  // 페이지를 열자마자 모델을 깨우지도 않는다.
  useEffect(() => {
    let alive = true;
    const api = getPromptApi();
    if (!api) { setState('none'); return; }
    if (typeof api.availability !== 'function') { setState('ready'); return; }
    api.availability()
      .then((a) => {
        if (!alive) return;
        // 'downloadable' 은 모델이 아직 기기에 없다는 뜻이다. 몇백 MB 를 말없이
        // 받아 오지 않고, 켜는 버튼을 보여 사용자가 고르게 한다.
        if (a === 'available' || a === 'readily') setState('ready');
        else if (a === 'downloadable' || a === 'downloading' || a === 'after-download') setState('needs-download');
        else setState('none');
      })
      .catch(() => { if (alive) setState('none'); });
    return () => { alive = false; };
  }, []);

  // 세션은 컴포넌트가 사라질 때 정리한다.
  useEffect(() => () => { sessionRef.current?.destroy?.(); }, []);

  if (state === 'unknown' || state === 'none') return null;

  async function send() {
    const q = input.trim();
    if (!q || busy) return;
    setInput('');
    setLog((l) => [...l, { role: 'you', text: q }]);
    setBusy(true);
    try {
      if (!sessionRef.current) {
        const api = getPromptApi();
        if (!api) throw new Error('no prompt api');
        sessionRef.current = await api.create({
          initialPrompts: [
            {
              role: 'system',
              content:
                `You help someone reflect on a dream. Locale: ${locale}. Always answer in that language.\n` +
                `Symbols they picked: ${symbols.join(', ')}. Feeling on waking: ${tone}. On their mind: ${context}.\n` +
                `Rules: never predict the future, never claim a dream foretells events, never give medical or ` +
                `financial advice. Distinguish traditional symbol lore from dream research when relevant. ` +
                `Prefer asking a clarifying question over asserting. Keep answers under 120 words. ` +
                `If nightmares sound recurrent and disabling, suggest talking to a professional.`,
            },
          ],
        });
      }
      const answer = await sessionRef.current.prompt(q);
      setLog((l) => [...l, { role: 'ai', text: answer }]);
    } catch {
      setLog((l) => [...l, { role: 'ai', text: t.chatFailed }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-border bg-surface-subtle p-5">
      <h3 className="flex flex-wrap items-center gap-2 font-bold text-foreground">
        {t.chatTitle}
        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {t.chatPrivacy}
        </span>
      </h3>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{t.chatHint}</p>

      {state === 'needs-download' && (
        <div className="mt-4">
          <p className="text-sm leading-6 text-muted-foreground">{t.chatNeedsDownload}</p>
          <button
            type="button"
            disabled={downloading}
            onClick={async () => {
              setDownloading(true);
              try {
                const api = getPromptApi();
                if (!api) throw new Error('no prompt api');
                sessionRef.current = await api.create();
                setState('ready');
              } catch {
                setState('none');
              } finally {
                setDownloading(false);
              }
            }}
            className="mt-3 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-40"
          >
            {downloading ? t.chatDownloading : t.chatEnable}
          </button>
        </div>
      )}

      {log.length > 0 && (
        <ul className="mt-4 space-y-3">
          {log.map((m, i) => (
            <li key={i} className={m.role === 'you' ? 'text-sm text-muted-foreground' : 'text-sm leading-6 text-foreground'}>
              {m.text}
            </li>
          ))}
        </ul>
      )}

      {state === 'ready' && (
      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void send(); }}
          placeholder={t.chatPlaceholder}
          className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={busy}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
        >
          {busy ? t.chatThinking : t.chatSend}
        </button>
      </div>
      )}
    </section>
  );
}
