import { SixLangString } from "../engine.contract";

/**
 * HEXACO Deep Shard Data
 * Per-dimension, per-level (low/moderate/high) interpretation and growth notes,
 * mirroring the tci-deep-shards.ts structure (engine + shard separation).
 */

export const HEXACO_DATA: Record<
  "H" | "E" | "X" | "A" | "C" | "O",
  Record<"high" | "low" | "moderate", { interpretation: SixLangString; growthPath: SixLangString }>
> = {
  H: {
    low: {
      interpretation: {
        ko: "규칙과 공정성보다 자신의 이익을 앞세우는 경향이 있고, 상황에 따라 전략적으로 행동합니다. 지위와 특권에 관심이 많고, 남을 조종하는 것에 거리낌이 적을 수 있습니다.",
        en: "You tend to prioritize your own interests over rules and fairness, acting strategically depending on the situation. You may care about status and privilege, and feel less hesitant about influencing others for your own ends.",
        ja: "規則や公正さより自分の利益を優先する傾向があり、状況に応じて戦略的に行動します。地位や特権に関心があり、他者を操ることへのためらいが少ない場合があります。",
        zh: "你倾向于把自身利益置于规则和公平之上，会根据情境采取策略性行动。你可能在意地位与特权，对为自己目的影响他人较少顾忌。",
        fr: "Vous avez tendance à privilégier vos propres intérêts par rapport aux règles et à l'équité, agissant stratégiquement selon la situation. Le statut et les privilèges peuvent vous importer, avec moins d'hésitation à influencer les autres pour vos propres fins.",
        es: "Tiendes a priorizar tus propios intereses por encima de las reglas y la equidad, actuando estratégicamente según la situación. Puede importarte el estatus y los privilegios, con menos dudas a la hora de influir en otros para tus propios fines.",
      },
      growthPath: {
        ko: "장기적으로는 신뢰가 관계의 가장 큰 자산임을 기억하세요. 작은 것부터 투명하게 행동하는 연습이 관계의 안정성을 높여줍니다.",
        en: "Remember that trust is the biggest long-term asset in relationships. Practicing transparency in small things strengthens the stability of your relationships.",
        ja: "長期的には信頼が人間関係の最大の資産であることを忘れないでください。小さなことから透明に行動する練習が関係の安定性を高めます。",
        zh: "长远来看，信任是关系中最大的资产。从小事做起练习透明行事，能提升关系的稳定性。",
        fr: "N'oubliez pas que la confiance est le plus grand atout à long terme dans les relations. Pratiquer la transparence sur de petites choses renforce la stabilité de vos relations.",
        es: "Recuerda que la confianza es el mayor activo a largo plazo en las relaciones. Practicar la transparencia en las pequeñas cosas fortalece la estabilidad de tus relaciones.",
      },
    },
    moderate: {
      interpretation: {
        ko: "상황에 따라 원칙과 실리 사이에서 균형을 잡는 편입니다. 대체로 공정하게 행동하지만, 필요하다고 느끼면 유연하게 타협하기도 합니다.",
        en: "You balance principle and practicality depending on the situation. You generally act fairly, but can flexibly compromise when you feel it's needed.",
        ja: "状況に応じて原則と実利のバランスを取る方です。概ね公正に行動しますが、必要と感じれば柔軟に妥協することもあります。",
        zh: "你会根据情境在原则与实际利益之间寻求平衡。通常表现公平，但在觉得必要时也会灵活妥协。",
        fr: "Vous équilibrez principe et pragmatisme selon la situation. Vous agissez généralement de manière équitable, mais pouvez faire des compromis avec souplesse quand vous le jugez nécessaire.",
        es: "Equilibras principios y pragmatismo según la situación. En general actúas con justicia, pero puedes ceder con flexibilidad cuando lo consideras necesario.",
      },
      growthPath: {
        ko: "원칙을 지킬 상황과 유연할 상황을 구분하는 자신만의 기준을 명확히 해두면 더 일관된 신뢰를 얻을 수 있습니다.",
        en: "Clarifying your own criteria for when to hold firm and when to be flexible will help you build more consistent trust.",
        ja: "原則を守る場面と柔軟になる場面を区別する自分なりの基準を明確にすると、より一貫した信頼を得られます。",
        zh: "明确自己在何时坚持原则、何时灵活变通的标准，能帮助你获得更稳定一致的信任。",
        fr: "Clarifier vos propres critères pour savoir quand tenir bon et quand être flexible vous aidera à instaurer une confiance plus constante.",
        es: "Aclarar tus propios criterios sobre cuándo mantenerte firme y cuándo ser flexible te ayudará a generar una confianza más constante.",
      },
    },
    high: {
      interpretation: {
        ko: "진실하고 겸손하며 공정함을 중시합니다. 특권이나 지위를 과시하기보다 원칙에 따라 행동하고, 다른 사람을 이용하는 것에 거부감을 느낍니다.",
        en: "You value sincerity, humility, and fairness. You act according to principle rather than flaunting privilege or status, and feel resistant to exploiting others.",
        ja: "誠実で謙虚、公正さを重んじます。特権や地位を誇示するより原則に従って行動し、他者を利用することに抵抗を感じます。",
        zh: "你重视真诚、谦逊与公平，依原则行事而非炫耀特权或地位，并对利用他人感到抗拒。",
        fr: "Vous valorisez la sincérité, l'humilité et l'équité. Vous agissez selon des principes plutôt que d'exhiber privilège ou statut, et ressentez de la résistance à exploiter les autres.",
        es: "Valoras la sinceridad, la humildad y la equidad. Actúas según principios en lugar de ostentar privilegio o estatus, y sientes resistencia a explotar a los demás.",
      },
      growthPath: {
        ko: "원칙을 지키는 것이 때로 손해로 느껴질 수 있습니다. 스스로를 위한 정당한 요구까지 억누르지 않도록 균형을 살펴보세요.",
        en: "Holding to your principles can sometimes feel like a disadvantage. Watch that you don't suppress even your own legitimate needs in the process.",
        ja: "原則を守ることが時に損に感じられることがあります。自分自身の正当な要求まで抑え込まないよう、バランスに気を配りましょう。",
        zh: "坚持原则有时会让你感觉吃亏。留意别在这个过程中连自己正当的诉求也一并压抑了。",
        fr: "Tenir à ses principes peut parfois sembler désavantageux. Veillez à ne pas réprimer même vos besoins légitimes dans ce processus.",
        es: "Mantener tus principios a veces puede sentirse como una desventaja. Cuida no reprimir incluso tus necesidades legítimas en el proceso.",
      },
    },
  },
  E: {
    low: {
      interpretation: {
        ko: "감정적으로 강인하고 독립적입니다. 위험이나 스트레스 상황에서도 비교적 침착함을 유지하며, 타인의 감정에 쉽게 휩쓸리지 않습니다.",
        en: "You are emotionally tough and independent. You stay relatively calm under risk or stress, and are not easily swept up in others' emotions.",
        ja: "感情的に強靭で独立しています。危険やストレスの状況でも比較的冷静さを保ち、他者の感情に流されにくいです。",
        zh: "你在情感上坚韧独立，即使在风险或压力情境下也能保持相对冷静，不易被他人的情绪所左右。",
        fr: "Vous êtes émotionnellement fort(e) et indépendant(e). Vous restez relativement calme face au risque ou au stress, et n'êtes pas facilement emporté(e) par les émotions des autres.",
        es: "Eres emocionalmente fuerte e independiente. Te mantienes relativamente tranquilo/a ante el riesgo o el estrés, y no te dejas arrastrar fácilmente por las emociones de los demás.",
      },
      growthPath: {
        ko: "강인함이 때로 타인의 감정적 신호를 놓치게 할 수 있습니다. 의식적으로 다른 사람의 감정 상태에 관심을 기울여보세요.",
        en: "Toughness can sometimes cause you to miss others' emotional cues. Consciously pay attention to the emotional states of people around you.",
        ja: "強靭さが時に他者の感情的なサインを見逃させることがあります。意識的に周囲の感情状態に注意を向けてみましょう。",
        zh: "坚韧有时会让你忽略他人的情感信号。有意识地留意身边人的情绪状态吧。",
        fr: "La force peut parfois vous faire manquer les signaux émotionnels des autres. Prêtez consciemment attention à l'état émotionnel des personnes autour de vous.",
        es: "La fortaleza a veces puede hacer que pases por alto las señales emocionales de los demás. Presta atención de forma consciente al estado emocional de quienes te rodean.",
      },
    },
    moderate: {
      interpretation: {
        ko: "상황에 따라 감정적으로 민감해지기도 하고, 침착함을 유지하기도 합니다. 스트레스에 대한 반응이 맥락에 따라 달라집니다.",
        en: "You become emotionally sensitive in some situations and stay calm in others. Your response to stress varies depending on context.",
        ja: "状況によって感情的に敏感になったり、冷静さを保ったりします。ストレスへの反応は文脈によって変わります。",
        zh: "你在某些情境中会情绪敏感，在另一些情境中则能保持冷静。你对压力的反应因情境而异。",
        fr: "Vous devenez émotionnellement sensible dans certaines situations et restez calme dans d'autres. Votre réaction au stress varie selon le contexte.",
        es: "Te vuelves emocionalmente sensible en algunas situaciones y te mantienes tranquilo/a en otras. Tu respuesta al estrés varía según el contexto.",
      },
      growthPath: {
        ko: "어떤 상황에서 감정이 특히 크게 요동치는지 패턴을 파악해두면, 스트레스가 클 때 미리 대비할 수 있습니다.",
        en: "Identifying the patterns of situations where your emotions swing most can help you prepare in advance for high-stress moments.",
        ja: "どんな状況で感情が特に大きく揺れ動くかパターンを把握しておくと、ストレスが大きいときに事前に備えられます。",
        zh: "识别出哪些情境最容易让你情绪波动，能帮助你在压力较大时提前做好准备。",
        fr: "Identifier les schémas de situations où vos émotions oscillent le plus peut vous aider à vous préparer à l'avance pour les moments de forte tension.",
        es: "Identificar los patrones de situaciones en las que tus emociones oscilan más puede ayudarte a prepararte con antelación para los momentos de mayor estrés.",
      },
    },
    high: {
      interpretation: {
        ko: "감정적으로 민감하고 공감 능력이 뛰어납니다. 타인의 고통에 깊이 공감하며, 위험한 상황에서 불안이나 걱정을 크게 느끼는 편입니다.",
        en: "You are emotionally sensitive and highly empathetic. You deeply empathize with others' pain, and tend to feel significant anxiety or worry in risky situations.",
        ja: "感情的に敏感で共感能力に優れています。他者の痛みに深く共感し、危険な状況で不安や心配を強く感じる傾向があります。",
        zh: "你情感敏感且极具同理心，能深切体会他人的痛苦，在危险情境中也容易感到强烈的焦虑或担忧。",
        fr: "Vous êtes émotionnellement sensible et très empathique. Vous compatissez profondément à la douleur des autres, et ressentez souvent une anxiété ou une inquiétude importante dans les situations risquées.",
        es: "Eres emocionalmente sensible y muy empático/a. Compartes profundamente el dolor de los demás, y tiendes a sentir ansiedad o preocupación considerable en situaciones de riesgo.",
      },
      growthPath: {
        ko: "다른 사람의 감정을 깊이 느끼는 힘은 강점이지만, 스스로를 지치게 할 수 있습니다. 감정적 회복을 위한 자기만의 루틴을 만들어보세요.",
        en: "Your ability to deeply feel others' emotions is a strength, but it can exhaust you. Build your own routine for emotional recovery.",
        ja: "他者の感情を深く感じる力は強みですが、自分自身を疲れさせることがあります。感情的な回復のための自分なりのルーティンを作ってみましょう。",
        zh: "深切感受他人情感的能力是一种优势，但也可能让你精疲力竭。为自己建立一套情绪恢复的日常习惯吧。",
        fr: "Votre capacité à ressentir profondément les émotions des autres est une force, mais elle peut vous épuiser. Créez votre propre routine de récupération émotionnelle.",
        es: "Tu capacidad para sentir profundamente las emociones de los demás es una fortaleza, pero puede agotarte. Crea tu propia rutina de recuperación emocional.",
      },
    },
  },
  X: {
    low: {
      interpretation: {
        ko: "내향적이고 독립적이며, 혼자 있는 시간에서 에너지를 회복합니다. 사교 모임보다 소수와의 깊은 대화나 개인적인 활동을 선호합니다.",
        en: "You are introverted and independent, recharging through time alone. You prefer deep conversation with a few people or solitary activities over social gatherings.",
        ja: "内向的で独立しており、一人の時間でエネルギーを回復します。社交の場より少人数との深い会話や個人的な活動を好みます。",
        zh: "你内向而独立，通过独处来恢复精力，比起社交聚会，更偏好与少数人深入交谈或独自进行的活动。",
        fr: "Vous êtes introverti(e) et indépendant(e), vous rechargeant par des moments seul(e). Vous préférez les conversations profondes avec peu de personnes ou les activités solitaires aux rassemblements sociaux.",
        es: "Eres introvertido/a e independiente, y recargas energía en momentos a solas. Prefieres conversaciones profundas con pocas personas o actividades individuales antes que las reuniones sociales.",
      },
      growthPath: {
        ko: "혼자만의 시간이 편안하더라도, 의미 있는 관계를 위해 의도적으로 사람들과의 접점을 조금씩 늘려보는 것도 도움이 됩니다.",
        en: "Even if solitude feels comfortable, intentionally increasing your contact with people little by little can help build meaningful relationships.",
        ja: "一人の時間が心地よくても、意味ある関係のために意図的に人との接点を少しずつ増やすことも助けになります。",
        zh: "即使独处让你感到舒适，有意识地一点点增加与人的接触，也有助于建立有意义的关系。",
        fr: "Même si la solitude vous semble confortable, augmenter intentionnellement vos contacts avec les autres, petit à petit, peut aider à construire des relations significatives.",
        es: "Aunque la soledad te resulte cómoda, aumentar intencionalmente tu contacto con la gente, poco a poco, puede ayudarte a construir relaciones significativas.",
      },
    },
    moderate: {
      interpretation: {
        ko: "상황에 따라 활발하게 어울리기도 하고, 혼자만의 시간을 즐기기도 합니다. 사교적 에너지의 필요량이 맥락에 따라 달라집니다.",
        en: "You socialize actively in some settings and enjoy solitary time in others. Your need for social energy varies by context.",
        ja: "状況に応じて活発に交流したり、一人の時間を楽しんだりします。社交的エネルギーの必要量は文脈によって変わります。",
        zh: "你在某些场合会积极社交，在另一些场合又能享受独处。你对社交能量的需求因情境而异。",
        fr: "Vous socialisez activement dans certains contextes et appréciez la solitude dans d'autres. Votre besoin d'énergie sociale varie selon le contexte.",
        es: "Socializas activamente en algunos contextos y disfrutas de la soledad en otros. Tu necesidad de energía social varía según el contexto.",
      },
      growthPath: {
        ko: "자신이 언제 사람들과의 교류에서 에너지를 얻고, 언제 소진되는지 관찰해두면 사회적 활동을 더 편하게 조절할 수 있습니다.",
        en: "Observing when you gain energy from social interaction and when you're drained by it helps you regulate social activity more comfortably.",
        ja: "自分がいつ人との交流からエネルギーを得て、いつ消耗するかを観察しておくと、社交活動をより快適に調整できます。",
        zh: "留意自己何时能从社交中获得能量、何时会被消耗，能帮助你更从容地调节社交活动。",
        fr: "Observer quand vous tirez de l'énergie des interactions sociales et quand elles vous épuisent vous aide à mieux réguler votre activité sociale.",
        es: "Observar cuándo obtienes energía de la interacción social y cuándo te agota te ayuda a regular tu actividad social con más comodidad.",
      },
    },
    high: {
      interpretation: {
        ko: "외향적이고 사교적이며 활동적입니다. 사람들과 어울리는 것에서 에너지를 얻고, 새로운 사람을 만나거나 주목받는 상황을 즐깁니다.",
        en: "You are outgoing, sociable, and active. You gain energy from being around people, and enjoy meeting new people or being in the spotlight.",
        ja: "外向的で社交的、活動的です。人と関わることからエネルギーを得て、新しい人と会ったり注目される状況を楽しみます。",
        zh: "你外向、爱交际且充满活力，能从与人相处中获得能量，也乐于结识新朋友或成为关注的焦点。",
        fr: "Vous êtes extraverti(e), sociable et actif(ve). Vous puisez de l'énergie dans la présence des autres, et aimez rencontrer de nouvelles personnes ou être sous les projecteurs.",
        es: "Eres extrovertido/a, sociable y activo/a. Obtienes energía al estar rodeado/a de gente, y disfrutas conociendo nuevas personas o estando en el centro de atención.",
      },
      growthPath: {
        ko: "활발한 사교 에너지가 강점이지만, 혼자 조용히 성찰하는 시간도 의도적으로 확보하면 균형 잡힌 회복에 도움이 됩니다.",
        en: "Your active social energy is a strength, but intentionally setting aside quiet, reflective time alone helps balanced recovery.",
        ja: "活発な社交エネルギーは強みですが、静かに一人で省みる時間も意図的に確保すると、バランスの取れた回復に役立ちます。",
        zh: "活跃的社交能量是你的优势，但有意识地留出安静独处、反思的时间，也有助于更均衡地恢复精力。",
        fr: "Votre énergie sociale active est une force, mais réserver intentionnellement du temps calme et introspectif seul(e) aide à un rétablissement équilibré.",
        es: "Tu energía social activa es una fortaleza, pero reservar intencionalmente tiempo tranquilo y reflexivo a solas ayuda a una recuperación equilibrada.",
      },
    },
  },
  A: {
    low: {
      interpretation: {
        ko: "비판적이고 직설적이며 경쟁적인 편입니다. 부당하다고 느끼면 참기보다 즉시 문제를 제기하고, 타협보다 원하는 것을 분명히 요구합니다.",
        en: "You tend to be critical, direct, and competitive. When you feel something is unfair, you raise it immediately rather than tolerating it, and clearly ask for what you want rather than compromise.",
        ja: "批判的で直接的、競争的な傾向があります。不当だと感じれば我慢するより即座に問題を提起し、妥協より望むものを明確に要求します。",
        zh: "你倾向于批判、直接且好胜。若感到不公，你会立刻提出而非隐忍，并明确表达自己的诉求，而非选择妥协。",
        fr: "Vous avez tendance à être critique, direct(e) et compétitif(ve). Quand vous sentez une injustice, vous la signalez immédiatement plutôt que de la tolérer, et demandez clairement ce que vous voulez plutôt que de faire un compromis.",
        es: "Tiendes a ser crítico/a, directo/a y competitivo/a. Cuando sientes que algo es injusto, lo señalas de inmediato en lugar de tolerarlo, y pides claramente lo que quieres en lugar de ceder.",
      },
      growthPath: {
        ko: "직설적인 태도가 명확함이라는 장점이 있지만, 상대에게는 공격적으로 느껴질 수 있습니다. 의견을 전할 때 상대의 입장을 한 번 더 살펴보세요.",
        en: "Your directness has the strength of clarity, but it can feel aggressive to others. Consider the other person's perspective once more when sharing your opinion.",
        ja: "率直な態度は明確さという長所がありますが、相手には攻撃的に感じられることがあります。意見を伝えるとき、相手の立場をもう一度考えてみましょう。",
        zh: "直率的态度有明确的优点，但可能让对方感到具有攻击性。表达意见时，不妨再多考虑一下对方的立场。",
        fr: "Votre franchise a l'avantage de la clarté, mais peut sembler agressive aux autres. Considérez une fois de plus le point de vue de l'autre personne en partageant votre opinion.",
        es: "Tu franqueza tiene la ventaja de la claridad, pero puede resultar agresiva para otros. Considera una vez más la perspectiva de la otra persona al compartir tu opinión.",
      },
    },
    moderate: {
      interpretation: {
        ko: "상황에 따라 갈등을 피하기도 하고, 필요하면 직접 맞서기도 합니다. 관용과 단호함 사이에서 유연하게 균형을 잡는 편입니다.",
        en: "You avoid conflict in some situations and confront it directly when needed. You flexibly balance tolerance and firmness.",
        ja: "状況によって対立を避けたり、必要なら直接対処したりします。寛容さと毅然さの間で柔軟にバランスを取る方です。",
        zh: "你会视情况回避冲突，也会在必要时直接应对。你善于在宽容与坚定之间灵活取得平衡。",
        fr: "Vous évitez le conflit dans certaines situations et l'affrontez directement quand c'est nécessaire. Vous équilibrez avec souplesse tolérance et fermeté.",
        es: "Evitas el conflicto en algunas situaciones y lo enfrentas directamente cuando es necesario. Equilibras con flexibilidad la tolerancia y la firmeza.",
      },
      growthPath: {
        ko: "언제 넘어가고 언제 맞서야 하는지에 대한 자신만의 기준을 명확히 해두면, 갈등 상황에서 더 일관되게 대응할 수 있습니다.",
        en: "Clarifying your own criteria for when to let something go and when to stand firm helps you respond more consistently in conflict.",
        ja: "いつ受け流し、いつ立ち向かうべきかについて自分なりの基準を明確にしておくと、対立状況でより一貫して対応できます。",
        zh: "明确自己何时该放过、何时该坚持的标准，能帮助你在冲突中做出更一致的应对。",
        fr: "Clarifier vos propres critères pour savoir quand laisser passer et quand tenir bon vous aide à réagir plus systématiquement en cas de conflit.",
        es: "Aclarar tus propios criterios sobre cuándo dejar pasar algo y cuándo mantenerte firme te ayuda a responder de forma más constante en los conflictos.",
      },
    },
    high: {
      interpretation: {
        ko: "인내심이 있고 너그러우며 평화를 중시합니다. 갈등 상황에서 먼저 양보하는 편이고, 다른 사람의 잘못에 대해서도 쉽게 화내지 않습니다.",
        en: "You are patient, tolerant, and value peace. You tend to be the one who yields first in conflict, and don't easily get angry at others' mistakes.",
        ja: "忍耐強く寛大で、平和を重んじます。対立状況では先に譲る方で、他者の過ちにもあまり怒りません。",
        zh: "你耐心宽容，重视和平，在冲突中往往先做出让步，也不容易因他人的过错而生气。",
        fr: "Vous êtes patient(e), tolérant(e) et valorisez la paix. Vous avez tendance à être celui/celle qui cède en premier dans un conflit, et ne vous fâchez pas facilement des erreurs des autres.",
        es: "Eres paciente, tolerante y valoras la paz. Tiendes a ser quien cede primero en un conflicto, y no te enojas fácilmente por los errores de los demás.",
      },
      growthPath: {
        ko: "양보와 관용은 관계를 부드럽게 하지만, 정당한 필요까지 계속 미루면 스스로에게 손해가 될 수 있습니다. 필요할 때는 직접 의견을 표현하는 연습을 해보세요.",
        en: "Yielding and tolerance smooth relationships, but continually deferring even your legitimate needs can work against you. Practice expressing your opinion directly when it's warranted.",
        ja: "譲歩と寛容は関係を円滑にしますが、正当な必要まで先延ばしにし続けると自分に不利益になることがあります。必要なときは直接意見を表現する練習をしてみましょう。",
        zh: "让步与宽容能让关系更顺畅，但一味推迟连自己正当的需求也不表达，可能会对自己不利。在必要时，练习直接表达自己的意见吧。",
        fr: "Céder et faire preuve de tolérance apaisent les relations, mais reporter continuellement même vos besoins légitimes peut jouer contre vous. Entraînez-vous à exprimer directement votre opinion quand cela se justifie.",
        es: "Ceder y ser tolerante suaviza las relaciones, pero postergar continuamente incluso tus necesidades legítimas puede jugar en tu contra. Practica expresar directamente tu opinión cuando esté justificado.",
      },
    },
  },
  C: {
    low: {
      interpretation: {
        ko: "즉흥적이고 유연하며, 정해진 절차보다 그때그때 상황에 맞춰 움직이는 것을 편하게 느낍니다. 계획보다 즉각적인 즐거움에 더 끌립니다.",
        en: "You are spontaneous and flexible, feeling comfortable moving with the moment rather than fixed procedures. You're drawn more to immediate pleasure than to plans.",
        ja: "即興的で柔軟であり、決まった手順より状況に合わせて動くことに心地よさを感じます。計画より即座の楽しみに惹かれます。",
        zh: "你随性灵活，比起固定流程，更能自在地随情境而动，也更容易被即时的乐趣所吸引，而非计划本身。",
        fr: "Vous êtes spontané(e) et flexible, à l'aise pour évoluer au gré du moment plutôt que selon des procédures fixes. Vous êtes davantage attiré(e) par le plaisir immédiat que par les plans.",
        es: "Eres espontáneo/a y flexible, y te sientes cómodo/a moviéndote según el momento en lugar de procedimientos fijos. Te atrae más el placer inmediato que los planes.",
      },
      growthPath: {
        ko: "유연함은 강점이지만, 장기 목표에는 최소한의 구조가 필요합니다. 정말 중요한 일 한두 가지만이라도 작은 루틴으로 만들어보세요.",
        en: "Flexibility is a strength, but long-term goals need at least minimal structure. Try turning even one or two truly important things into a small routine.",
        ja: "柔軟さは強みですが、長期目標には最小限の構造が必要です。本当に重要なことを一つか二つだけでも小さなルーティンにしてみましょう。",
        zh: "灵活是你的优势，但长期目标至少需要一点结构。不妨把一两件真正重要的事变成小小的日常习惯。",
        fr: "La flexibilité est une force, mais les objectifs à long terme nécessitent au moins une structure minimale. Essayez de transformer une ou deux choses vraiment importantes en petite routine.",
        es: "La flexibilidad es una fortaleza, pero las metas a largo plazo necesitan al menos una estructura mínima. Intenta convertir una o dos cosas realmente importantes en una pequeña rutina.",
      },
    },
    moderate: {
      interpretation: {
        ko: "일에 따라 철저하게 계획하기도 하고, 유연하게 즉흥적으로 처리하기도 합니다. 조직화와 자유로움 사이에서 균형을 잡는 편입니다.",
        en: "You plan thoroughly for some tasks and handle others flexibly and spontaneously. You balance organization and freedom.",
        ja: "物事によって徹底的に計画したり、柔軟に即興で処理したりします。組織化と自由さの間でバランスを取る方です。",
        zh: "你对有些事会周密计划，对另一些事则灵活随性地处理，善于在条理与自由之间取得平衡。",
        fr: "Vous planifiez minutieusement certaines tâches et en gérez d'autres avec souplesse et spontanéité. Vous équilibrez organisation et liberté.",
        es: "Planificas minuciosamente algunas tareas y manejas otras con flexibilidad y espontaneidad. Equilibras organización y libertad.",
      },
      growthPath: {
        ko: "어떤 일에는 철저한 계획이, 어떤 일에는 유연함이 더 맞는지 구분해두면 에너지를 더 효율적으로 쓸 수 있습니다.",
        en: "Distinguishing which tasks need thorough planning and which suit flexibility helps you use your energy more efficiently.",
        ja: "どんなことに徹底した計画が、どんなことに柔軟さがより合っているか区別しておくと、エネルギーをより効率的に使えます。",
        zh: "分辨哪些事需要周密计划、哪些事更适合灵活应对，能帮助你更高效地运用精力。",
        fr: "Distinguer les tâches qui nécessitent une planification rigoureuse de celles qui conviennent mieux à la flexibilité vous aide à utiliser votre énergie plus efficacement.",
        es: "Distinguir qué tareas necesitan planificación rigurosa y cuáles se adaptan mejor a la flexibilidad te ayuda a usar tu energía de forma más eficiente.",
      },
    },
    high: {
      interpretation: {
        ko: "자기 훈련이 강하고 조직적이며 꼼꼼합니다. 충분히 준비한 뒤 시작하고, 실수를 최소화하려 노력하며, 장기 목표를 향해 꾸준히 나아갑니다.",
        en: "You are highly self-disciplined, organized, and thorough. You prepare fully before starting, work to minimize mistakes, and steadily pursue long-term goals.",
        ja: "自己規律が強く組織的で几帳面です。十分に準備してから始め、ミスを最小限にしようと努め、長期目標に向けて着実に進みます。",
        zh: "你自律性强、有条理且细致，会在充分准备后才开始行动，努力将错误降到最低，并稳步朝长期目标前进。",
        fr: "Vous êtes très discipliné(e), organisé(e) et minutieux(se). Vous vous préparez pleinement avant de commencer, travaillez à minimiser les erreurs, et poursuivez régulièrement des objectifs à long terme.",
        es: "Eres muy autodisciplinado/a, organizado/a y minucioso/a. Te preparas por completo antes de empezar, trabajas para minimizar errores, y persigues tus metas a largo plazo con constancia.",
      },
      growthPath: {
        ko: "높은 기준이 좋은 결과를 만들지만, 완벽주의로 흘러 스스로를 지치게 할 수 있습니다. 때로는 '충분히 좋은' 상태에서 멈추는 것도 연습해보세요.",
        en: "High standards produce good results, but can slide into perfectionism that exhausts you. Practice sometimes stopping at 'good enough.'",
        ja: "高い基準は良い結果を生みますが、完璧主義に流れて自分を疲れさせることがあります。時には「十分に良い」状態で止まる練習もしてみましょう。",
        zh: "高标准能带来好结果，但也可能滑向完美主义而让自己疲惫不堪。试着练习偶尔在“足够好”的状态就停下来。",
        fr: "Des normes élevées produisent de bons résultats, mais peuvent glisser vers un perfectionnisme épuisant. Entraînez-vous parfois à vous arrêter à un niveau « suffisamment bon ».",
        es: "Los estándares altos producen buenos resultados, pero pueden derivar en un perfeccionismo agotador. Practica a veces detenerte en lo 'suficientemente bueno'.",
      },
    },
  },
  O: {
    low: {
      interpretation: {
        ko: "실용적이고 전통을 중시하며, 추상적인 것보다 구체적인 것을 선호합니다. 검증된 방식을 신뢰하고, 새로운 아이디어보다 확실한 결과를 우선합니다.",
        en: "You are practical, value tradition, and prefer the concrete over the abstract. You trust proven methods and prioritize sure results over new ideas.",
        ja: "実用的で伝統を重んじ、抽象的なものより具体的なものを好みます。実証された方法を信頼し、新しいアイデアより確実な結果を優先します。",
        zh: "你务实、重视传统，偏好具体事物而非抽象概念，信任经过验证的方法，把确切的结果看得比新点子更重要。",
        fr: "Vous êtes pratique, valorisez la tradition et préférez le concret à l'abstrait. Vous faites confiance aux méthodes éprouvées et privilégiez des résultats sûrs plutôt que de nouvelles idées.",
        es: "Eres práctico/a, valoras la tradición y prefieres lo concreto a lo abstracto. Confías en los métodos probados y priorizas resultados seguros sobre ideas nuevas.",
      },
      growthPath: {
        ko: "검증된 방식에 대한 신뢰는 안정감을 주지만, 가끔은 낯선 아이디어나 관점을 시도해보는 것도 시야를 넓혀줍니다.",
        en: "Trust in proven methods gives you stability, but occasionally trying unfamiliar ideas or perspectives can broaden your view.",
        ja: "実証された方法への信頼は安定感を与えますが、時には見慣れないアイデアや視点を試してみることも視野を広げてくれます。",
        zh: "对成熟方法的信任能带来安定感，但偶尔尝试陌生的想法或视角，也能拓宽你的视野。",
        fr: "La confiance envers les méthodes éprouvées vous apporte de la stabilité, mais essayer occasionnellement des idées ou perspectives inhabituelles peut élargir votre vision.",
        es: "La confianza en los métodos probados te da estabilidad, pero probar ocasionalmente ideas o perspectivas poco familiares puede ampliar tu visión.",
      },
    },
    moderate: {
      interpretation: {
        ko: "익숙한 방식과 새로운 시도 사이에서 균형을 잡습니다. 상황에 따라 전통을 따르기도 하고, 호기심을 발휘해 새로운 것을 탐색하기도 합니다.",
        en: "You balance familiar methods and new attempts. Depending on the situation, you follow tradition or exercise curiosity to explore something new.",
        ja: "馴染みのある方法と新しい試みの間でバランスを取ります。状況によって伝統に従ったり、好奇心を発揮して新しいものを探索したりします。",
        zh: "你在熟悉的方式与新的尝试之间取得平衡，会视情境或遵循传统，或发挥好奇心去探索新事物。",
        fr: "Vous équilibrez méthodes familières et nouvelles tentatives. Selon la situation, vous suivez la tradition ou faites preuve de curiosité pour explorer quelque chose de nouveau.",
        es: "Equilibras métodos familiares y nuevos intentos. Según la situación, sigues la tradición o ejerces curiosidad para explorar algo nuevo.",
      },
      growthPath: {
        ko: "어떤 영역에서 새로운 시도를 더 즐기는지 파악해두면, 그 영역을 중심으로 호기심을 더 적극적으로 키워볼 수 있습니다.",
        en: "Identifying which areas you enjoy trying new things in most lets you more actively cultivate curiosity centered on those areas.",
        ja: "どの領域で新しい試みをより楽しめるかを把握しておくと、その領域を中心に好奇心をより積極的に育てられます。",
        zh: "找出自己在哪些领域更享受尝试新事物，能让你以此为中心更积极地培养好奇心。",
        fr: "Identifier les domaines où vous aimez le plus essayer de nouvelles choses vous permet de cultiver plus activement votre curiosité dans ces domaines.",
        es: "Identificar en qué áreas disfrutas más probando cosas nuevas te permite cultivar tu curiosidad de forma más activa en esos ámbitos.",
      },
    },
    high: {
      interpretation: {
        ko: "창의적이고 지적 호기심이 강하며 상상력이 풍부합니다. 예술, 철학, 새로운 아이디어에 깊은 관심을 가지고, 다양한 문화와 관점을 이해하려 노력합니다.",
        en: "You are creative, intellectually curious, and imaginative. You have deep interest in art, philosophy, and new ideas, and strive to understand diverse cultures and perspectives.",
        ja: "創造的で知的好奇心が強く、想像力豊かです。芸術、哲学、新しいアイデアに深い関心を持ち、多様な文化や視点を理解しようと努めます。",
        zh: "你富有创造力、求知欲旺盛、想象力丰富，对艺术、哲学和新观点抱有浓厚兴趣，也努力去理解多元的文化与视角。",
        fr: "Vous êtes créatif(ve), intellectuellement curieux(se) et imaginatif(ve). Vous avez un profond intérêt pour l'art, la philosophie et les nouvelles idées, et vous efforcez de comprendre diverses cultures et perspectives.",
        es: "Eres creativo/a, intelectualmente curioso/a e imaginativo/a. Tienes un profundo interés por el arte, la filosofía y las ideas nuevas, y te esfuerzas por comprender culturas y perspectivas diversas.",
      },
      growthPath: {
        ko: "풍부한 상상력과 호기심은 강점이지만, 때로는 구체적인 실행으로 이어가는 것이 중요합니다. 좋아하는 아이디어 하나를 실제 결과물로 만들어보세요.",
        en: "Rich imagination and curiosity are strengths, but it's important to sometimes follow through with concrete execution. Try turning one idea you love into an actual result.",
        ja: "豊かな想像力と好奇心は強みですが、時には具体的な実行につなげることが重要です。好きなアイデアを一つ、実際の成果物にしてみましょう。",
        zh: "丰富的想象力和好奇心是你的优势，但有时把它们落实为具体行动也很重要。试着把一个你喜欢的想法真正变成成果吧。",
        fr: "Une imagination riche et la curiosité sont des forces, mais il est important de parfois les concrétiser par une exécution concrète. Essayez de transformer une idée que vous aimez en résultat concret.",
        es: "La imaginación rica y la curiosidad son fortalezas, pero es importante a veces llevarlas a una ejecución concreta. Intenta convertir una idea que te guste en un resultado real.",
      },
    },
  },
};
