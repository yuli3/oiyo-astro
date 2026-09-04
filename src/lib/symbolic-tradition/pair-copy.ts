import type { Locale } from "@/i18n";
import type { CompatibilityLensId } from "./types";

/**
 * 관계별 해설. 렌즈(관점)가 늘어나면 관계 키도 늘어난다.
 *
 * 2026-09-04: `Record<relation, copy>` 평면 맵이었다. 로케일과 무관하게
 * 렌더돼서 ja/zh/fr/es 사용자가 선을 누르면 한국어가 나왔다. 로케일을 바깥에
 * 두어 언어별로 빠진 관계가 드러나게 하고, PairCopy 타입으로 형태를 고정한다.
 *
 * 새 렌즈를 더할 때: 그 렌즈가 낼 수 있는 relation 을 여기 6개 언어에 모두
 * 넣는다. 빠지면 `PAIR[lang][relation] ?? PAIR[lang].distinct` 로 떨어지므로
 * 화면은 깨지지 않지만 해설이 뭉개진다.
 */
export interface PairCopy { ask: string; care: string; help: string; label: string }

export const PAIR_COPY: Record<Locale, Record<`${CompatibilityLensId}:${string}`, PairCopy>> = {
  ko: {
    "five-elements:generating-cycle": { label: "이어지는 생성", help: "한쪽이 피우면 다른 쪽이 키웁니다.", care: "속도가 다르면 답답해질 수 있습니다.", ask: "요즘 내가 너에게 넘기는 일은 뭐야?" },
    "five-elements:controlling-cycle": { label: "서로 조절", help: "한쪽이 과하면 다른 쪽이 줄을 잡습니다.", care: "잔소리로 들릴 수 있습니다.", ask: "내가 너무 말리는 순간이 있어?" },
    "five-elements:same": { label: "같은 기운", help: "같은 리듬이라 말이 잘 통합니다.", care: "같은 약점도 겹칩니다.", ask: "우리 둘 다 미루는 일은?" },
    "chinese-zodiac:same-trine": { label: "같은 삼합", help: "방향이 비슷해 함께 가기 쉽습니다.", care: "밖으로만 향하면 서로를 놓칩니다.", ask: "이번 달에 같이 하고 싶은 건?" },
    "chinese-zodiac:opposite": { label: "마주 보는 축", help: "빈 칸을 서로 채웁니다.", care: "부딪히면 오래갑니다.", ask: "의견이 갈릴 때 우리는 어떻게 쉬어?" },
    "yin-yang:same-balance": { label: "비슷한 음양", help: "속도가 비슷합니다.", care: "둘 다 같은 쪽으로 기울면 치우칩니다.", ask: "요즘 기운이 비슷한가?" },
    "yin-yang:near-balance": { label: "가까운 리듬", help: "조금 다른 박자가 대화를 엽니다.", care: "타이밍을 맞추려다 지칠 수 있습니다.", ask: "누가 먼저 말 거는 편이야?" },
    "yin-yang:contrasting-balance": { label: "대비되는 리듬", help: "한쪽이 밀면 다른 쪽이 받습니다.", care: "서로를 이해하지 못하면 거리로 남습니다.", ask: "내가 너무 빠른가, 느린가?" },
    "sun-sign:same-sign": { label: "같은 별자리", help: "계절이 같습니다.", care: "같은 함정에 같이 빠집니다.", ask: "올해 우리 테마는 뭐로 둘까?" },
    "sun-sign:same-element": { label: "같은 원소", help: "감정의 결이 비슷합니다.", care: "과하면 같이 과합니다.", ask: "요즘 기분을 한 색으로 말하면?" },
    "sun-sign:same-modality": { label: "같은 행동 양식", help: "일을 시작하는 방식이 닮았습니다.", care: "멈추는 타이밍도 겹칩니다.", ask: "우리 둘 다 끝을 못 내는 일은?" },
    "chinese-zodiac:distinct": { label: "다른 결", help: "겹치지 않는 시야가 있습니다.", care: "번역이 필요합니다.", ask: "내가 모르는 네 세계는 뭐야?" },
    "chinese-zodiac:same": { label: "같은 띠", help: "같은 해의 기운이라 서로를 설명할 필요가 적습니다.", care: "닮은 만큼 서로의 버릇도 못 봅니다.", ask: "우리가 서로 안 짚어주는 습관은?" },
    "sun-sign:distinct": { label: "다른 별자리 결", help: "계절도 원소도 달라 시야가 겹치지 않습니다.", care: "당연한 걸 설명해야 할 때가 옵니다.", ask: "너한테는 당연한데 나는 모르는 게 뭐야?" },
    "element-complement:deep-mutual": { label: "깊이 채우는 사이", help: "서로 비어 있던 자리를 여러 칸 메웁니다.", care: "채워주는 데 익숙해지면 스스로 기르기를 미룹니다.", ask: "네가 없으면 내가 못 하게 된 건 뭐야?" },
    "element-complement:mutual-complement": { label: "서로 채우는 사이", help: "내게 없는 것을 상대가 갖고 있고, 그 반대도 그렇습니다.", care: "역할이 굳으면 바꿔 보기 어려워집니다.", ask: "네가 나에게 채워주는 게 뭘까?" },
    "element-complement:one-way-complement": { label: "한쪽이 채운다", help: "한 사람이 상대의 빈 자리를 메웁니다.", care: "주는 쪽만 계속 주면 지칩니다.", ask: "요즘 내가 너에게 기대고 있는 건 뭐야?" },
    "element-complement:shared-gap": { label: "같은 곳이 비었다", help: "없는 자리가 같아 서로를 잘 이해합니다.", care: "둘 다 없는 것은 아무도 채워주지 않습니다.", ask: "우리 둘 다 약한 건 어떻게 메울까?" },
    "element-complement:no-gap": { label: "둘 다 고르다", help: "각자 빈 자리 없이 갖췄습니다.", care: "채울 일이 없으면 서로를 찾을 이유도 옅어집니다.", ask: "우리가 굳이 함께 하는 이유는 뭘까?" },

  },
  en: {
    "five-elements:generating-cycle": { label: "One feeds the other", help: "One of you starts it, the other grows it.", care: "Different speeds can feel like stalling.", ask: "What am I handing over to you lately?" },
    "five-elements:controlling-cycle": { label: "Mutual check", help: "When one goes too far, the other pulls the rein.", care: "It can land as nagging.", ask: "When do I hold you back too much?" },
    "five-elements:same": { label: "Same current", help: "Same rhythm, so talk comes easily.", care: "The same weak spots overlap too.", ask: "What do we both keep putting off?" },
    "chinese-zodiac:same-trine": { label: "Same trine", help: "Similar direction, easy to move together.", care: "Face outward only and you lose each other.", ask: "What do we want to do together this month?" },
    "chinese-zodiac:opposite": { label: "Facing axis", help: "You fill each other's blanks.", care: "A clash between you lasts.", ask: "How do we take a break when we disagree?" },
    "yin-yang:same-balance": { label: "Similar yin-yang", help: "Your pace is close.", care: "Lean the same way and you both tip.", ask: "Is our energy running alike right now?" },
    "yin-yang:near-balance": { label: "Near rhythm", help: "A slightly different beat opens the conversation.", care: "Chasing each other's timing gets tiring.", ask: "Who usually speaks first?" },
    "yin-yang:contrasting-balance": { label: "Contrasting rhythm", help: "One pushes, the other catches.", care: "Without understanding it stays as distance.", ask: "Am I too fast, or too slow?" },
    "sun-sign:same-sign": { label: "Same sign", help: "You share a season.", care: "You fall into the same traps together.", ask: "What theme should we set for this year?" },
    "sun-sign:same-element": { label: "Same element", help: "Your feelings run in a similar grain.", care: "When it is too much, it is too much for both.", ask: "If today's mood were one colour, which?" },
    "sun-sign:same-modality": { label: "Same modality", help: "You start things the same way.", care: "You also stop at the same moment.", ask: "What do we both fail to finish?" },
    "chinese-zodiac:distinct": { label: "Different grain", help: "You have views that do not overlap.", care: "It needs translating.", ask: "What part of your world do I not know?" },
    "chinese-zodiac:same": { label: "Same zodiac year", help: "The same year-energy, so you explain yourselves less.", care: "Being alike, you miss each other's habits.", ask: "What habit do we never point out to each other?" },
    "sun-sign:distinct": { label: "Different sign grain", help: "Different season and element, so your views do not overlap.", care: "You will have to explain the obvious.", ask: "What is obvious to you that I do not get?" },
    "element-complement:deep-mutual": { label: "Filling each other deeply", help: "You cover several of each other's empty places.", care: "Getting used to being filled, you put off growing it yourself.", ask: "What can I no longer do without you?" },
    "element-complement:mutual-complement": { label: "Filling each other", help: "You hold what the other lacks, and the other way round.", care: "Once the roles set, they are hard to swap.", ask: "What do you fill in for me?" },
    "element-complement:one-way-complement": { label: "One side fills", help: "One of you covers the other's empty place.", care: "The giver alone tires out.", ask: "What am I leaning on you for lately?" },
    "element-complement:shared-gap": { label: "The same place is empty", help: "You lack the same thing, so you understand each other.", care: "What neither has, nobody fills.", ask: "How do we cover what we are both short on?" },
    "element-complement:no-gap": { label: "Both are even", help: "Each of you is complete, with no empty place.", care: "With nothing to fill, the reason to seek each other thins.", ask: "Why do we choose to be together?" },

  },
  ja: {
    "five-elements:generating-cycle": { label: "つながる生成", help: "片方が咲かせ、もう片方が育てます。", care: "速さが違うともどかしくなります。", ask: "最近わたしがあなたに渡していることは？" },
    "five-elements:controlling-cycle": { label: "たがいに調整", help: "片方が行きすぎると、もう片方が手綱を引きます。", care: "小言に聞こえることがあります。", ask: "わたしが止めすぎる場面はある？" },
    "five-elements:same": { label: "同じ気", help: "同じリズムなので話が通じます。", care: "弱いところも重なります。", ask: "二人とも先延ばしにしていることは？" },
    "chinese-zodiac:same-trine": { label: "同じ三合", help: "向きが似ていて、一緒に進みやすいです。", care: "外にばかり向くと互いを見失います。", ask: "今月いっしょにやりたいことは？" },
    "chinese-zodiac:opposite": { label: "向かい合う軸", help: "たがいの空白を埋めます。", care: "ぶつかると長引きます。", ask: "意見が割れたとき、どう休む？" },
    "yin-yang:same-balance": { label: "似た陰陽", help: "ペースが近いです。", care: "同じ方へ傾くと二人とも偏ります。", ask: "最近、気の流れは似ている？" },
    "yin-yang:near-balance": { label: "近いリズム", help: "少しずれた拍子が会話を開きます。", care: "タイミングを合わせようとして疲れます。", ask: "先に話しかけるのはどちら？" },
    "yin-yang:contrasting-balance": { label: "対照的なリズム", help: "片方が押し、もう片方が受けます。", care: "分かり合えないと距離のまま残ります。", ask: "わたしは速すぎる？ 遅すぎる？" },
    "sun-sign:same-sign": { label: "同じ星座", help: "季節が同じです。", care: "同じ落とし穴に一緒に落ちます。", ask: "今年のテーマは何にする？" },
    "sun-sign:same-element": { label: "同じ元素", help: "感情の手ざわりが似ています。", care: "過ぎるときは二人とも過ぎます。", ask: "今の気分を一色で言うなら？" },
    "sun-sign:same-modality": { label: "同じ行動様式", help: "始め方が似ています。", care: "止まる時も重なります。", ask: "二人とも終わらせられないことは？" },
    "chinese-zodiac:distinct": { label: "違う手ざわり", help: "重ならない視野があります。", care: "翻訳が要ります。", ask: "わたしの知らないあなたの世界は？" },
    "chinese-zodiac:same": { label: "同じ干支", help: "同じ年の気なので、説明しなくても通じます。", care: "似ている分、相手の癖が見えません。", ask: "おたがい指摘しない癖は？" },
    "sun-sign:distinct": { label: "違う星座の質", help: "季節も元素も違い、視野が重なりません。", care: "当たり前を説明する場面が来ます。", ask: "あなたには当然で、わたしが知らないことは？" },
    "element-complement:deep-mutual": { label: "深く満たし合う", help: "たがいの空いた場所をいくつも埋めます。", care: "満たされることに慣れると、自分で育てるのを後回しにします。", ask: "あなたがいないとできなくなったことは？" },
    "element-complement:mutual-complement": { label: "満たし合う", help: "わたしにないものを相手が持ち、その逆もあります。", care: "役割が固まると入れ替えにくくなります。", ask: "あなたがわたしに補ってくれるものは？" },
    "element-complement:one-way-complement": { label: "片方が満たす", help: "一方が相手の空いた場所を埋めます。", care: "与える側だけが続くと疲れます。", ask: "最近わたしがあなたに頼っていることは？" },
    "element-complement:shared-gap": { label: "同じ場所が空いている", help: "欠けているところが同じで、よく分かり合えます。", care: "二人ともないものは、誰も埋めてくれません。", ask: "二人とも弱いところはどう補う？" },
    "element-complement:no-gap": { label: "どちらも整っている", help: "それぞれ空きなく揃っています。", care: "埋めることがないと、たがいを求める理由も薄れます。", ask: "それでも一緒にいる理由は何だろう？" },

  },
  zh: {
    "five-elements:generating-cycle": { label: "相生相续", help: "一方开花，另一方培育。", care: "步调不同时会觉得憋闷。", ask: "最近我交给你的事情是什么？" },
    "five-elements:controlling-cycle": { label: "彼此约束", help: "一方过头时，另一方拉住缰绳。", care: "听起来可能像唠叨。", ask: "我有拦你拦得太多的时候吗？" },
    "five-elements:same": { label: "同一股气", help: "节奏相同，说话容易通。", care: "弱点也一样重叠。", ask: "我们俩都在拖延的事是什么？" },
    "chinese-zodiac:same-trine": { label: "同一三合", help: "方向相近，容易一起走。", care: "只朝外看就会错过彼此。", ask: "这个月想一起做什么？" },
    "chinese-zodiac:opposite": { label: "相对的轴", help: "彼此填补空白。", care: "一旦冲突会拖很久。", ask: "意见不合时我们怎么休息？" },
    "yin-yang:same-balance": { label: "相近的阴阳", help: "步调相近。", care: "一起偏向同一边就会失衡。", ask: "最近彼此的状态相近吗？" },
    "yin-yang:near-balance": { label: "相近的节奏", help: "稍不同的拍子打开对话。", care: "为了对上节奏容易疲惫。", ask: "通常是谁先开口？" },
    "yin-yang:contrasting-balance": { label: "对比的节奏", help: "一方推，一方接。", care: "不理解就只剩距离。", ask: "我是太快，还是太慢？" },
    "sun-sign:same-sign": { label: "同一星座", help: "季节相同。", care: "会一起掉进同样的坑。", ask: "今年我们的主题定成什么？" },
    "sun-sign:same-element": { label: "同一元素", help: "情绪的质地相近。", care: "过头的时候两个人一起过头。", ask: "如果用一种颜色说最近的心情？" },
    "sun-sign:same-modality": { label: "同一行动方式", help: "开始事情的方式相像。", care: "停下来的时机也重叠。", ask: "我们俩都收不了尾的事是什么？" },
    "chinese-zodiac:distinct": { label: "不同的质地", help: "有彼此不重叠的视野。", care: "需要翻译。", ask: "你有哪一块世界是我不知道的？" },
    "chinese-zodiac:same": { label: "同一生肖", help: "同一年的气，彼此不太需要解释。", care: "越像，越看不见对方的习惯。", ask: "我们从不互相点破的习惯是什么？" },
    "sun-sign:distinct": { label: "不同星座的质地", help: "季节和元素都不同，视野不重叠。", care: "会有需要解释理所当然之事的时候。", ask: "对你理所当然、我却不懂的是什么？" },
    "element-complement:deep-mutual": { label: "深深互补", help: "彼此空缺的地方被填上好几处。", care: "习惯被填满，就会把自己养成的事往后拖。", ask: "没有你我就做不到的事是什么？" },
    "element-complement:mutual-complement": { label: "互相填补", help: "我没有的你有，反过来也是。", care: "角色一旦固定就难以对调。", ask: "你替我补上的是什么？" },
    "element-complement:one-way-complement": { label: "一方填补", help: "一个人填上对方空着的地方。", care: "只有给的一方会累。", ask: "最近我在依赖你的是什么？" },
    "element-complement:shared-gap": { label: "空的地方相同", help: "缺的东西一样，所以彼此很懂。", care: "两个人都没有的，谁也补不上。", ask: "我们都弱的地方要怎么补？" },
    "element-complement:no-gap": { label: "两边都齐全", help: "各自都没有空缺。", care: "没有可填的，彼此寻找的理由也会变淡。", ask: "那我们在一起的理由是什么？" },

  },
  fr: {
    "five-elements:generating-cycle": { label: "L'un nourrit l'autre", help: "L'un lance, l'autre fait grandir.", care: "Des rythmes différents donnent l'impression de piétiner.", ask: "Qu'est-ce que je te passe en ce moment ?" },
    "five-elements:controlling-cycle": { label: "Régulation mutuelle", help: "Quand l'un va trop loin, l'autre tient la bride.", care: "Cela peut sonner comme un reproche.", ask: "Quand est-ce que je te freine trop ?" },
    "five-elements:same": { label: "Même courant", help: "Même rythme : la parole passe facilement.", care: "Les mêmes points faibles se superposent.", ask: "Qu'est-ce qu'on repousse tous les deux ?" },
    "chinese-zodiac:same-trine": { label: "Même trigone", help: "Direction proche, facile d'avancer ensemble.", care: "Tournés seulement vers l'extérieur, vous vous perdez.", ask: "Qu'a-t-on envie de faire ensemble ce mois-ci ?" },
    "chinese-zodiac:opposite": { label: "Axe opposé", help: "Vous comblez les vides de l'autre.", care: "Un heurt entre vous dure longtemps.", ask: "Comment fait-on une pause quand on n'est pas d'accord ?" },
    "yin-yang:same-balance": { label: "Yin-yang proche", help: "Vos allures se ressemblent.", care: "Pencher du même côté vous déséquilibre tous les deux.", ask: "Nos énergies se ressemblent-elles en ce moment ?" },
    "yin-yang:near-balance": { label: "Rythme voisin", help: "Un tempo un peu différent ouvre la conversation.", care: "Vouloir se caler l'un sur l'autre épuise.", ask: "Qui parle en premier, d'habitude ?" },
    "yin-yang:contrasting-balance": { label: "Rythmes contrastés", help: "L'un pousse, l'autre reçoit.", care: "Sans compréhension, cela reste de la distance.", ask: "Suis-je trop rapide, ou trop lent ?" },
    "sun-sign:same-sign": { label: "Même signe", help: "Vous partagez une saison.", care: "Vous tombez ensemble dans les mêmes pièges.", ask: "Quel thème se donne-t-on cette année ?" },
    "sun-sign:same-element": { label: "Même élément", help: "Vos émotions ont un grain semblable.", care: "Quand c'est trop, c'est trop pour les deux.", ask: "Si l'humeur du jour était une couleur ?" },
    "sun-sign:same-modality": { label: "Même modalité", help: "Vous commencez les choses de la même façon.", care: "Vous vous arrêtez au même moment aussi.", ask: "Qu'est-ce qu'on n'arrive ni l'un ni l'autre à finir ?" },
    "chinese-zodiac:distinct": { label: "Grain différent", help: "Vous avez des vues qui ne se recouvrent pas.", care: "Il faut traduire.", ask: "Quelle part de ton monde m'échappe ?" },
    "chinese-zodiac:same": { label: "Même signe chinois", help: "La même énergie d'année : vous vous expliquez moins.", care: "À se ressembler, vous ne voyez plus vos manies.", ask: "Quelle habitude ne se signale-t-on jamais ?" },
    "sun-sign:distinct": { label: "Grain de signe différent", help: "Saison et élément différents : vos vues ne se recouvrent pas.", care: "Il faudra expliquer l'évidence.", ask: "Qu'est-ce qui est évident pour toi et m'échappe ?" },
    "element-complement:deep-mutual": { label: "Se combler en profondeur", help: "Vous comblez plusieurs des vides de l'autre.", care: "À force d'être comblé, on remet à plus tard de le cultiver soi-même.", ask: "Que suis-je devenu incapable de faire sans toi ?" },
    "element-complement:mutual-complement": { label: "Se compléter", help: "Tu as ce qui me manque, et inversement.", care: "Une fois les rôles pris, ils s'échangent mal.", ask: "Qu'est-ce que tu complètes chez moi ?" },
    "element-complement:one-way-complement": { label: "L'un comble", help: "L'un de vous comble le vide de l'autre.", care: "Celui qui donne seul s'épuise.", ask: "Sur quoi est-ce que je m'appuie sur toi en ce moment ?" },
    "element-complement:shared-gap": { label: "Le même vide", help: "Il vous manque la même chose : vous vous comprenez.", care: "Ce qui manque aux deux, personne ne le comble.", ask: "Comment couvrir ce qui nous manque à tous les deux ?" },
    "element-complement:no-gap": { label: "Complets tous les deux", help: "Chacun est au complet, sans vide.", care: "Sans rien à combler, la raison de se chercher s'amincit.", ask: "Pourquoi choisit-on d'être ensemble ?" },

  },
  es: {
    "five-elements:generating-cycle": { label: "Uno alimenta al otro", help: "Uno lo enciende y el otro lo hace crecer.", care: "Ritmos distintos pueden sentirse como un freno.", ask: "¿Qué te estoy pasando últimamente?" },
    "five-elements:controlling-cycle": { label: "Ajuste mutuo", help: "Cuando uno se pasa, el otro sujeta las riendas.", care: "Puede sonar a regaño.", ask: "¿Cuándo te freno demasiado?" },
    "five-elements:same": { label: "La misma corriente", help: "Mismo ritmo: hablar resulta fácil.", care: "También se solapan los mismos puntos débiles.", ask: "¿Qué estamos dejando para después los dos?" },
    "chinese-zodiac:same-trine": { label: "El mismo trígono", help: "Dirección parecida, fácil avanzar juntos.", care: "Si solo miráis afuera, os perdéis.", ask: "¿Qué queremos hacer juntos este mes?" },
    "chinese-zodiac:opposite": { label: "Eje opuesto", help: "Cada uno llena el hueco del otro.", care: "Un choque entre vosotros dura.", ask: "¿Cómo descansamos cuando no coincidimos?" },
    "yin-yang:same-balance": { label: "Yin-yang parecido", help: "Vuestro paso es similar.", care: "Si os inclináis al mismo lado, los dos os desequilibráis.", ask: "¿Andamos con una energía parecida ahora?" },
    "yin-yang:near-balance": { label: "Ritmo cercano", help: "Un compás algo distinto abre la conversación.", care: "Perseguir el ritmo del otro cansa.", ask: "¿Quién suele hablar primero?" },
    "yin-yang:contrasting-balance": { label: "Ritmos contrastados", help: "Uno empuja y el otro recoge.", care: "Sin entenderlo, queda como distancia.", ask: "¿Voy demasiado rápido o demasiado lento?" },
    "sun-sign:same-sign": { label: "El mismo signo", help: "Compartís una estación.", care: "Caéis juntos en las mismas trampas.", ask: "¿Qué tema le ponemos a este año?" },
    "sun-sign:same-element": { label: "El mismo elemento", help: "Vuestras emociones tienen una textura parecida.", care: "Cuando es demasiado, lo es para los dos.", ask: "Si el ánimo de hoy fuera un color, ¿cuál?" },
    "sun-sign:same-modality": { label: "La misma modalidad", help: "Empezáis las cosas igual.", care: "También paráis en el mismo momento.", ask: "¿Qué no terminamos ninguno de los dos?" },
    "chinese-zodiac:distinct": { label: "Otra textura", help: "Tenéis miradas que no se solapan.", care: "Hace falta traducir.", ask: "¿Qué parte de tu mundo no conozco?" },
    "chinese-zodiac:same": { label: "El mismo signo chino", help: "La misma energía de año: os explicáis menos.", care: "De tan parecidos, no veis las manías del otro.", ask: "¿Qué costumbre nunca nos señalamos?" },
    "sun-sign:distinct": { label: "Otra textura de signo", help: "Estación y elemento distintos: vuestras miradas no se solapan.", care: "Habrá que explicar lo evidente.", ask: "¿Qué es obvio para ti y yo no capto?" },
    "element-complement:deep-mutual": { label: "Se llenan a fondo", help: "Cubrís varios de los huecos del otro.", care: "Acostumbrarse a que te llenen aplaza cultivarlo por tu cuenta.", ask: "¿Qué he dejado de poder hacer sin ti?" },
    "element-complement:mutual-complement": { label: "Se complementan", help: "Tienes lo que a mí me falta, y al revés.", care: "Cuando los papeles se fijan, cuesta cambiarlos.", ask: "¿Qué me completas tú a mí?" },
    "element-complement:one-way-complement": { label: "Uno llena", help: "Uno de los dos cubre el hueco del otro.", care: "Quien solo da acaba cansándose.", ask: "¿En qué me estoy apoyando en ti últimamente?" },
    "element-complement:shared-gap": { label: "El mismo hueco", help: "Os falta lo mismo, así que os entendéis.", care: "Lo que no tiene ninguno, no lo llena nadie.", ask: "¿Cómo cubrimos aquello en lo que ambos flojeamos?" },
    "element-complement:no-gap": { label: "Los dos completos", help: "Cada uno está completo, sin huecos.", care: "Sin nada que llenar, la razón de buscarse se adelgaza.", ask: "¿Por qué elegimos estar juntos?" },

  },
};
