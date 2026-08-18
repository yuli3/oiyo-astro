import { useState, useEffect } from "react";
import { Questionnaire } from "@/components/ui/questionnaire";
import ShareResultButton from '../shared/ShareResultButton';
import ResultNextSteps from '../shared/ResultNextSteps';
import RelatedReading from '../shared/RelatedReading';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

type SupportedLocale = "ko" | "en" | "ja" | "zh" | "fr" | "es";
interface Props { locale?: string; }

type AngerStyle = "explosive" | "suppressor" | "passive_aggressive" | "assertive" | "calm";

// Each question is a scenario with 5 choices mapped to styles
interface Scenario {
  ko: string; en: string; ja: string; zh: string; fr: string; es: string;
  choices: Record<SupportedLocale, string[]>;
  mapping: AngerStyle[]; // index 0-4 → style
}

const scenarios: Scenario[] = [
  {
    ko: "동료가 회의에서 나의 아이디어를 자기 것인 양 발표했습니다.",
    en: "A colleague presented my idea in a meeting as if it were their own.",
    ja: "同僚が会議で私のアイデアを自分のものとして発表しました。",
    zh: "一位同事在会议上把我的想法说得像是他自己的。",
    fr: "Un collègue a présenté mon idée en réunion comme si elle venait de lui.",
    es: "Un colega presentó mi idea en una reunión como si fuera suya.",
    choices: {
      ko: ["그 자리에서 큰 소리로 항의한다", "아무 말도 하지 않고 속으로 삭인다", "그 동료의 업무를 은근히 방해한다", "회의 후 조용히 그 동료에게 말한다", "일부러 신경 쓰지 않으려 한다"],
      en: ["Protest loudly on the spot", "Stay silent and bottle it up inside", "Subtly undermine that colleague's work later", "Quietly talk to the colleague after the meeting", "Intentionally try not to care"],
      ja: ["その場で大声で抗議する", "何も言わず内心で我慢する", "その同僚の仕事をこっそり妨害する", "会議後に静かにその同僚に話す", "わざと気にしないようにする"],
      zh: ["当场大声抗议", "什么也不说，把情绪憋在心里", "之后暗中影响那位同事的工作", "会后安静地和那位同事谈谈", "刻意让自己不要在意"],
      fr: ["Protester vivement sur-le-champ", "Ne rien dire et garder ça pour moi", "Nuire discrètement au travail de ce collègue plus tard", "Lui en parler calmement après la réunion", "Essayer volontairement de ne pas m'en soucier"],
      es: ["Protestar en voz alta en ese momento", "Quedarme en silencio y guardármelo", "Dificultar sutilmente el trabajo de ese colega después", "Hablar con ese colega con calma después de la reunión", "Intentar no darle importancia a propósito"],
    },
    mapping: ["explosive", "suppressor", "passive_aggressive", "assertive", "calm"],
  },
  {
    ko: "가까운 친구가 약속을 또 어겼습니다. 이번이 세 번째입니다.",
    en: "A close friend broke their promise again. This is the third time.",
    ja: "親しい友人がまた約束を破りました。これで3回目です。",
    zh: "一位亲近的朋友又一次失约了。这已经是第三次。",
    fr: "Un ami proche a encore manqué à sa promesse. C'est la troisième fois.",
    es: "Un amigo cercano volvió a romper su promesa. Es la tercera vez.",
    choices: {
      ko: ["그 자리에서 화를 내고 관계를 끊겠다고 말한다", "또 기다리며 아무 말도 하지 않는다", "약속을 지키지 않아도 될 상황을 만들어 복수한다", "진지하게 이것이 나에게 얼마나 상처가 됐는지 말한다", "이건 그 친구의 성격이라 받아들이고 넘어간다"],
      en: ["Get angry on the spot and say you're ending the friendship", "Wait again and say nothing", "Create situations where they also can't keep promises as payback", "Seriously tell them how much this has hurt you", "Accept it as their personality and move on"],
      ja: ["その場で怒り、関係を断つと言う", "また待って何も言わない", "相手も約束を守れない状況を作って復讐する", "真剣にこれが自分にどれほど傷ついたかを話す", "これはその友人の性格だと受け入れて乗り越える"],
      zh: ["当场生气，并说要结束这段友谊", "继续等着，什么也不说", "制造让对方也无法守约的情况来报复", "认真告诉对方这件事让我多么受伤", "把这当成朋友的性格，接受后翻篇"],
      fr: ["Me mettre en colère sur-le-champ et dire que je mets fin à l'amitié", "Attendre encore une fois sans rien dire", "Créer des situations où l'autre ne peut pas tenir ses promesses non plus", "Lui dire sérieusement à quel point cela m'a blessé", "Me dire que c'est son caractère et passer à autre chose"],
      es: ["Enojarme en ese momento y decir que termino la amistad", "Volver a esperar sin decir nada", "Crear situaciones en las que esa persona tampoco pueda cumplir promesas", "Decirle seriamente cuánto me dolió", "Aceptarlo como parte de su personalidad y seguir adelante"],
    },
    mapping: ["explosive", "suppressor", "passive_aggressive", "assertive", "calm"],
  },
  {
    ko: "음식점에서 주문한 것과 다른 음식이 나왔습니다.",
    en: "A restaurant brought out food different from what you ordered.",
    ja: "レストランで注文したものと違う料理が出てきました。",
    zh: "餐厅端上来的食物和你点的不一样。",
    fr: "Au restaurant, on vous apporte un plat différent de ce que vous avez commandé.",
    es: "En un restaurante te trajeron un plato distinto al que pediste.",
    choices: {
      ko: ["직원을 불러 큰 소리로 항의한다", "그냥 먹는다", "리뷰에 악평을 쓰지만 직접적으로는 말하지 않는다", "차분하게 직원에게 주문한 것과 다르다고 말한다", "실수는 있을 수 있다고 생각하며 그냥 먹는다"],
      en: ["Call the staff and protest loudly", "Just eat it", "Write a bad review but don't say anything directly", "Calmly tell the staff it's not what you ordered", "Think mistakes happen and just eat it"],
      ja: ["スタッフを呼んで大声で抗議する", "そのまま食べる", "レビューに悪評を書くが直接は言わない", "落ち着いてスタッフに注文と違うと伝える", "間違いはあり得ると思ってそのまま食べる"],
      zh: ["叫来店员并大声抗议", "直接吃掉", "写差评，但不当面说", "平静地告诉店员这不是我点的", "觉得失误难免，就直接吃掉"],
      fr: ["Appeler le serveur et protester bruyamment", "Le manger quand même", "Écrire un mauvais avis sans rien dire directement", "Dire calmement au personnel que ce n'est pas ma commande", "Me dire que les erreurs arrivent et le manger quand même"],
      es: ["Llamar al personal y protestar en voz alta", "Comérmelo sin más", "Escribir una mala reseña sin decir nada directamente", "Decirle con calma al personal que no es lo que pedí", "Pensar que los errores pasan y comérmelo"],
    },
    mapping: ["explosive", "suppressor", "passive_aggressive", "assertive", "calm"],
  },
  {
    ko: "가족이 나의 사생활이나 중요한 결정에 계속 간섭합니다.",
    en: "A family member keeps interfering with your privacy or important decisions.",
    ja: "家族が自分のプライバシーや重要な決断に干渉し続けています。",
    zh: "家人不断干涉你的隐私或重要决定。",
    fr: "Un membre de votre famille continue de s'immiscer dans votre vie privée ou vos décisions importantes.",
    es: "Un familiar sigue interfiriendo en tu privacidad o en decisiones importantes.",
    choices: {
      ko: ["폭발적으로 화를 내며 이제 그만하라고 소리친다", "참고 참다가 우울감이나 무기력함을 느낀다", "표면상 동의하지만 몰래 반대로 행동한다", "경계가 필요하다고 차분하게 대화를 요청한다", "명상이나 산책으로 감정을 스스로 해소한다"],
      en: ["Explode in anger and shout for them to stop", "Endure and endure until you feel depressed or helpless", "Outwardly agree but secretly do the opposite", "Calmly request a conversation about needing boundaries", "Release emotions yourself through meditation or walking"],
      ja: ["爆発的に怒り、もう止めろと叫ぶ", "我慢し続けてうつや無力感を感じる", "表面上同意するが秘かに反対のことをする", "冷静に境界線が必要だと対話を求める", "瞑想や散歩で感情を自分で解消する"],
      zh: ["情绪爆发，喊着让对方停止", "一忍再忍，直到感到低落或无力", "表面同意，私下却反着做", "平静地提出需要谈谈界限", "通过冥想或散步自己消化情绪"],
      fr: ["Exploser de colère et crier qu'il faut arrêter", "Encaisser encore et encore jusqu'à me sentir déprimé ou impuissant", "Accepter en apparence mais faire l'inverse en secret", "Demander calmement une discussion sur les limites nécessaires", "Évacuer mes émotions seul par la méditation ou la marche"],
      es: ["Explotar de enojo y gritar que ya basta", "Aguantar y aguantar hasta sentir tristeza o impotencia", "Aceptar por fuera pero hacer lo contrario en secreto", "Pedir con calma una conversación sobre los límites que necesito", "Liberar mis emociones por mi cuenta con meditación o caminando"],
    },
    mapping: ["explosive", "suppressor", "passive_aggressive", "assertive", "calm"],
  },
  {
    ko: "팀 프로젝트에서 내가 가장 많이 일하는데 공은 항상 팀장이 가져갑니다.",
    en: "In a team project, you do the most work but the team leader always gets the credit.",
    ja: "チームプロジェクトで最も多く働いているのに、いつもチームリーダーが手柄を持っていきます。",
    zh: "在团队项目中，你做的工作最多，但功劳总是归队长。",
    fr: "Dans un projet d'équipe, vous faites le plus gros du travail, mais le chef d'équipe en récolte toujours le mérite.",
    es: "En un proyecto de equipo, tú haces la mayor parte del trabajo, pero el líder siempre se lleva el mérito.",
    choices: {
      ko: ["공개적으로 불만을 쏟아내고 더 이상 일하지 않겠다고 한다", "억울하지만 혼자 삭히며 계속 일한다", "팀장이 알아채도록 일부러 실수를 늘린다", "팀장 또는 상사에게 기여도 인정을 요청한다", "이런 상황에서도 배울 게 있다고 생각하고 넘어간다"],
      en: ["Openly vent frustration and say you won't work anymore", "Feel wronged but suppress it and keep working", "Intentionally make more mistakes so the leader notices", "Ask the team leader or superior to recognize your contribution", "Think there's something to learn even in this situation and move on"],
      ja: ["公開的に不満をぶつけ、もう仕事しないと言う", "悔しいが一人で我慢して働き続ける", "チームリーダーが気づくようにわざとミスを増やす", "チームリーダーや上司に貢献度の認定を求める", "こんな状況でも学べることがあると思って乗り越える"],
      zh: ["公开发泄不满，并说自己不再干了", "觉得委屈，但独自忍着继续工作", "故意增加失误，让队长注意到", "请求队长或上司认可自己的贡献", "认为这种情况里也有可学之处，然后翻篇"],
      fr: ["Exprimer ouvertement ma frustration et dire que je ne travaillerai plus", "Me sentir lésé mais ravaler ma colère et continuer", "Faire exprès de multiplier les erreurs pour que le chef le remarque", "Demander au chef d'équipe ou à un supérieur de reconnaître ma contribution", "Me dire qu'il y a quand même quelque chose à apprendre et passer à autre chose"],
      es: ["Expresar abiertamente mi frustración y decir que ya no trabajaré más", "Sentirme tratado injustamente, pero guardármelo y seguir trabajando", "Cometer más errores a propósito para que el líder se dé cuenta", "Pedir al líder o a un superior que reconozca mi contribución", "Pensar que incluso en esta situación puedo aprender algo y seguir adelante"],
    },
    mapping: ["explosive", "suppressor", "passive_aggressive", "assertive", "calm"],
  },
];

const styleInfo: Record<AngerStyle, {
  name: Record<SupportedLocale, string>; color: string; emoji: string;
  description: Record<SupportedLocale, string>;
  impact: Record<SupportedLocale, string>;
  growth: Record<SupportedLocale, string>;
  affirmation: Record<SupportedLocale, string>;
}> = {
  explosive: {
    name: { ko: "폭발형", en: "Explosive", ja: "爆発型", zh: "爆发型", fr: "Explosif", es: "Explosivo" }, color: "#ef4444", emoji: "🌋",
    description: {
      ko: "당신은 분노를 즉각적이고 강하게 표출하는 경향이 있습니다. 감정을 억누르지 않는 솔직함은 강점이지만, 폭발적인 표현은 관계를 손상시키고 신뢰를 잃게 만들 수 있습니다. 분노 자체는 자연스러운 감정이지만, 표현 방식이 중요합니다.",
      en: "You tend to express anger immediately and intensely. Your honesty in not suppressing feelings is a strength, but explosive expression can damage relationships and erode trust. Anger itself is natural, but how you express it matters.",
      ja: "あなたは怒りを即座に強く表出する傾向があります。感情を抑えない正直さは強みですが、爆発的な表現は関係を損傷させ信頼を失わせることがあります。怒りそのものは自然な感情ですが、表現方法が重要です。",
      zh: "你倾向于立刻、强烈地表达愤怒。不压抑情绪的坦率是一种优势，但爆发式表达可能伤害关系并削弱信任。愤怒本身是自然的情绪，关键在于表达方式。",
      fr: "Vous avez tendance à exprimer votre colère immédiatement et avec intensité. Votre franchise à ne pas refouler vos émotions est une force, mais une expression explosive peut abîmer les relations et éroder la confiance. La colère est naturelle ; la façon de l'exprimer compte.",
      es: "Tiendes a expresar la ira de forma inmediata e intensa. Tu honestidad al no reprimir lo que sientes es una fortaleza, pero una expresión explosiva puede dañar relaciones y erosionar la confianza. La ira en sí es natural; importa cómo la expresas.",
    },
    impact: {
      ko: "주변 사람들이 위축될 수 있고, 장기적으로 신뢰와 관계 질이 낮아질 수 있습니다.",
      en: "People around you may feel intimidated, and trust and relationship quality can decline over time.",
      ja: "周りの人が萎縮することがあり、長期的に信頼と関係の質が低下することがあります。",
      zh: "身边的人可能会感到畏缩，长期来看信任和关系质量可能下降。",
      fr: "Les personnes autour de vous peuvent se sentir intimidées, et la confiance comme la qualité des relations peuvent diminuer avec le temps.",
      es: "Las personas a tu alrededor pueden sentirse intimidadas, y con el tiempo la confianza y la calidad de las relaciones pueden disminuir.",
    },
    growth: {
      ko: "감정이 올라오면 '5초 규칙'을 써보세요: 반응하기 전 5초를 셉니다. 그리고 '나는 지금 화가 났다'는 것을 인식하되, 폭발하기 전에 자리를 피하거나 호흡을 먼저 하세요.",
      en: "Try the '5-second rule' when emotions rise: count 5 seconds before reacting. Recognize 'I am angry right now,' but step away or breathe before exploding.",
      ja: "感情が高まったとき「5秒ルール」を使ってみてください：反応する前に5秒数えます。「今怒っている」と認識しながら、爆発する前に場所を離れるか呼吸を先にしてください。",
      zh: "情绪升起来时，试试“5秒规则”：反应前先数5秒。承认“我现在很生气”，但在爆发前先离开现场或做几次呼吸。",
      fr: "Essayez la « règle des 5 secondes » quand l'émotion monte : comptez 5 secondes avant de réagir. Reconnaissez « je suis en colère maintenant », puis éloignez-vous ou respirez avant d'exploser.",
      es: "Prueba la “regla de los 5 segundos” cuando suba la emoción: cuenta 5 segundos antes de reaccionar. Reconoce “ahora estoy enojado”, pero aléjate o respira antes de explotar.",
    },
    affirmation: { ko: "나는 나의 분노를 인정하되, 그것이 나를 지배하게 두지 않습니다.", en: "I acknowledge my anger but don't let it control me.", ja: "私は怒りを認めますが、それに支配されることはありません。", zh: "我承认自己的愤怒，但不让它控制我。", fr: "Je reconnais ma colère sans la laisser me contrôler.", es: "Reconozco mi ira, pero no dejo que me controle." },
  },
  suppressor: {
    name: { ko: "억압형", en: "Suppressor", ja: "抑圧型", zh: "压抑型", fr: "Répressif", es: "Represor" }, color: "#607329", emoji: "🧊",
    description: {
      ko: "당신은 분노를 겉으로 드러내지 않고 내면에 쌓아두는 경향이 있습니다. 평화를 유지하려는 마음은 이해되지만, 감정을 계속 억압하면 신체화 증상(두통, 소화 장애)이나 우울감으로 이어질 수 있습니다. 표현하지 않은 분노는 사라지지 않고 쌓입니다.",
      en: "You tend to bottle up anger without showing it externally. Your desire to keep the peace is understandable, but continually suppressing emotions can lead to somatic symptoms (headaches, digestive issues) or depression. Unexpressed anger doesn't disappear — it accumulates.",
      ja: "あなたは怒りを外に表さず内側に溜め込む傾向があります。平和を保ちたい気持ちは理解できますが、感情を抑え続けると身体症状（頭痛、消化障害）やうつにつながることがあります。表現されない怒りは消えず蓄積されます。",
      zh: "你倾向于不在外表上表现愤怒，而是把它积存在内心。想维持和平可以理解，但长期压抑情绪可能导致躯体化症状（头痛、消化问题）或抑郁感。没有表达出来的愤怒不会消失，而会累积。",
      fr: "Vous avez tendance à garder votre colère à l'intérieur sans la montrer. Votre envie de préserver la paix est compréhensible, mais refouler continuellement ses émotions peut mener à des symptômes somatiques (maux de tête, troubles digestifs) ou à un état dépressif. Une colère non exprimée ne disparaît pas : elle s'accumule.",
      es: "Tiendes a guardar la ira por dentro sin mostrarla hacia afuera. Tu deseo de mantener la paz es comprensible, pero reprimir las emociones de forma continua puede llevar a síntomas somáticos (dolores de cabeza, problemas digestivos) o a tristeza depresiva. La ira no expresada no desaparece: se acumula.",
    },
    impact: {
      ko: "장기적으로 만성 스트레스, 번아웃, 원인 모를 우울감이 나타날 수 있습니다.",
      en: "Long-term chronic stress, burnout, or unexplained depression may emerge.",
      ja: "長期的に慢性ストレス、バーンアウト、原因不明のうつが現れることがあります。",
      zh: "长期来看，可能出现慢性压力、倦怠，或原因不明的低落感。",
      fr: "À long terme, du stress chronique, un épuisement ou une déprime inexpliquée peuvent apparaître.",
      es: "A largo plazo pueden aparecer estrés crónico, agotamiento o tristeza sin una causa clara.",
    },
    growth: {
      ko: "'분노 일기'를 써보세요. 말로 하기 어렵다면, 먼저 글로 표현하는 연습을 해보세요. '나는 ___할 때 화가 난다. 왜냐하면___이기 때문이다.' 형식으로 감정을 언어화해보세요.",
      en: "Try keeping an 'anger journal.' If verbal expression is hard, practice putting it in writing first. Use the format: 'I get angry when ___ because ___.'",
      ja: "「怒り日記」を書いてみてください。言葉で言うのが難しければ、まず文章で表現する練習をしてみてください。「私は___のとき怒る。なぜなら___だからだ」という形式で感情を言語化してみてください。",
      zh: "试着写“愤怒日记”。如果很难开口表达，可以先练习写下来。用“当___时，我会生气，因为___”这样的句式把情绪说清楚。",
      fr: "Essayez de tenir un « journal de colère ». Si l'expression orale est difficile, entraînez-vous d'abord par écrit. Utilisez la forme : « Je me mets en colère quand ___ parce que ___ ».",
      es: "Prueba llevar un “diario de ira”. Si te cuesta decirlo en voz alta, practica primero por escrito. Usa el formato: “Me enojo cuando ___ porque ___”.",
    },
    affirmation: { ko: "나의 감정을 표현하는 것은 자기 존중입니다.", en: "Expressing my feelings is an act of self-respect.", ja: "感情を表現することは自己尊重です。", zh: "表达我的感受，是一种自我尊重。", fr: "Exprimer mes émotions est un acte de respect envers moi-même.", es: "Expresar lo que siento es un acto de respeto propio." },
  },
  passive_aggressive: {
    name: { ko: "수동-공격형", en: "Passive-Aggressive", ja: "受動攻撃型", zh: "被动攻击型", fr: "Passif-agressif", es: "Pasivo-agresivo" }, color: "#5B915F", emoji: "🌫️",
    description: {
      ko: "당신은 분노를 직접 표현하지 않지만, 간접적인 행동(비꼬기, 지연, 방해)으로 드러내는 경향이 있습니다. 갈등을 피하고 싶지만 감정도 표현하고 싶은 두 마음의 타협입니다. 그러나 이 방식은 상대방을 혼란스럽게 하고 문제를 해결하지 못합니다.",
      en: "You don't express anger directly but tend to show it through indirect behavior (sarcasm, delays, obstruction). It's a compromise between wanting to avoid conflict and wanting to express feelings. But this approach confuses others and doesn't solve problems.",
      ja: "怒りを直接表現しませんが、間接的な行動（嫌味、遅延、妨害）で表す傾向があります。葛藤を避けたいが感情も表現したいという二つの心の妥協です。しかしこの方法は相手を混乱させ、問題を解決しません。",
      zh: "你不直接表达愤怒，却倾向于通过间接行为（讽刺、拖延、阻碍）表现出来。这像是在“避免冲突”和“表达感受”之间折中。但这种方式会让对方困惑，也无法真正解决问题。",
      fr: "Vous n'exprimez pas directement votre colère, mais vous avez tendance à la montrer par des comportements indirects (sarcasme, retards, obstruction). C'est un compromis entre l'envie d'éviter le conflit et celle d'exprimer ce que vous ressentez. Mais cette approche déroute les autres et ne résout pas le problème.",
      es: "No expresas la ira directamente, pero tiendes a mostrarla mediante conductas indirectas (sarcasmo, retrasos, obstrucción). Es un punto medio entre querer evitar el conflicto y querer expresar lo que sientes. Pero este enfoque confunde a los demás y no resuelve los problemas.",
    },
    impact: {
      ko: "주변 사람들이 당신의 의도를 파악하기 어렵고, 신뢰 손상과 관계 악화로 이어질 수 있습니다.",
      en: "Others find it hard to understand your intentions, leading to eroded trust and deteriorating relationships.",
      ja: "周りの人があなたの意図を把握しにくく、信頼損傷と関係悪化につながることがあります。",
      zh: "周围的人很难理解你的真实意图，这可能削弱信任并让关系变差。",
      fr: "Les autres ont du mal à comprendre vos intentions, ce qui peut abîmer la confiance et détériorer les relations.",
      es: "A los demás les cuesta entender tus intenciones, lo que puede erosionar la confianza y deteriorar las relaciones.",
    },
    growth: {
      ko: "'나'를 주어로 하는 표현을 연습해보세요: '당신이 X했을 때, 나는 Y를 느꼈다'는 방식으로 직접적이지만 공격적이지 않게 감정을 전달할 수 있습니다.",
      en: "Practice 'I' statements: 'When you did X, I felt Y.' This lets you communicate feelings directly without being aggressive.",
      ja: "「私」を主語にした表現を練習してみてください：「あなたがXしたとき、私はYを感じた」という方法で、直接的でありながら攻撃的でなく感情を伝えることができます。",
      zh: "练习以“我”为主语的表达：“当你做了X时，我感到Y。”这种方式能直接表达感受，同时不带攻击性。",
      fr: "Entraînez-vous aux phrases en « je » : « Quand tu as fait X, j'ai ressenti Y. » Cela permet de communiquer vos émotions directement sans être agressif.",
      es: "Practica los mensajes en primera persona: “Cuando hiciste X, sentí Y”. Así puedes comunicar lo que sientes de forma directa sin ser agresivo.",
    },
    affirmation: { ko: "나는 나의 감정을 직접적으로, 그리고 존중하는 방식으로 표현할 수 있습니다.", en: "I can express my feelings directly and respectfully.", ja: "私は自分の感情を直接的に、そして尊重する方法で表現できます。", zh: "我可以直接并以尊重的方式表达自己的感受。", fr: "Je peux exprimer mes émotions directement et avec respect.", es: "Puedo expresar lo que siento de forma directa y respetuosa." },
  },
  assertive: {
    name: { ko: "주장형 (건강한 분노)", en: "Assertive (Healthy Anger)", ja: "主張型（健全な怒り）", zh: "主张型（健康愤怒）", fr: "Assertif (colère saine)", es: "Asertivo (ira saludable)" }, color: "#10b981", emoji: "💬",
    description: {
      ko: "당신은 분노를 건강하게 표현하는 방식을 선택합니다. 감정을 억누르지도, 폭발시키지도 않으며, 차분하고 직접적으로 자신의 감정과 필요를 전달합니다. 이것은 심리학적으로 가장 건강한 분노 표현 방식입니다.",
      en: "You choose to express anger in a healthy way. You neither suppress nor explode, but calmly and directly communicate your feelings and needs. This is psychologically the healthiest way to express anger.",
      ja: "あなたは怒りを健全な方法で表現することを選びます。感情を抑えも爆発させもせず、落ち着いて直接的に自分の感情とニーズを伝えます。これは心理学的に最も健全な怒りの表現方法です。",
      zh: "你会选择以健康的方式表达愤怒。你既不压抑，也不爆发，而是平静、直接地表达自己的感受和需要。从心理学角度看，这是最健康的愤怒表达方式。",
      fr: "Vous choisissez d'exprimer votre colère de façon saine. Vous ne la refoulez pas et vous n'explosez pas ; vous communiquez calmement et directement vos émotions et vos besoins. Psychologiquement, c'est la manière la plus saine d'exprimer la colère.",
      es: "Eliges expresar la ira de una forma saludable. No la reprimes ni explotas; comunicas tus sentimientos y necesidades con calma y de manera directa. Psicológicamente, es la forma más sana de expresar la ira.",
    },
    impact: {
      ko: "갈등을 해결하고 관계를 더 깊게 만들며, 자기 존중감과 상대방의 신뢰를 동시에 높입니다.",
      en: "Resolves conflicts, deepens relationships, and simultaneously raises self-respect and others' trust in you.",
      ja: "葛藤を解決し関係をより深め、自己尊重感と相手の信頼を同時に高めます。",
      zh: "它能帮助解决冲突、加深关系，同时提升自尊感和他人对你的信任。",
      fr: "Ce style aide à résoudre les conflits, à approfondir les relations et à renforcer à la fois le respect de soi et la confiance des autres.",
      es: "Ayuda a resolver conflictos, profundiza las relaciones y aumenta tanto el respeto propio como la confianza de los demás.",
    },
    growth: {
      ko: "이미 건강한 방식을 사용하고 있습니다. 이 능력을 더 어려운 상황(권위적인 사람, 친밀한 관계)에서도 유지하는 연습을 해보세요.",
      en: "You're already using a healthy approach. Practice maintaining this ability in harder situations (authoritative people, intimate relationships).",
      ja: "すでに健全な方法を使っています。この能力をより困難な状況（権威的な人、親密な関係）でも維持する練習をしてみてください。",
      zh: "你已经在使用健康的方式。可以练习在更困难的情境中也保持这种能力，例如面对权威人物或亲密关系时。",
      fr: "Vous utilisez déjà une approche saine. Entraînez-vous à la maintenir dans des situations plus difficiles, comme avec des personnes d'autorité ou dans des relations intimes.",
      es: "Ya estás usando un enfoque saludable. Practica mantener esta habilidad en situaciones más difíciles, como con figuras de autoridad o en relaciones íntimas.",
    },
    affirmation: { ko: "나는 나의 감정을 존중하고, 타인도 존중하며 소통합니다.", en: "I communicate while respecting my emotions and those of others.", ja: "私は自分の感情を尊重し、他者も尊重してコミュニケーションします。", zh: "我在尊重自己情绪的同时，也尊重他人并进行沟通。", fr: "Je communique en respectant mes émotions et celles des autres.", es: "Me comunico respetando mis emociones y también las de los demás." },
  },
  calm: {
    name: { ko: "초연형", en: "Calm/Detached", ja: "超然型", zh: "冷静/疏离型", fr: "Calme/Détaché", es: "Calmo/Distante" }, color: "#3b82f6", emoji: "🌊",
    description: {
      ko: "당신은 분노 상황에서 감정적으로 거의 흔들리지 않습니다. 뛰어난 자기조절 능력이거나, 때로는 감정을 느끼지 않으려는 회피일 수 있습니다. 진정한 평온인지, 감정을 차단하는 것인지 스스로 살펴볼 필요가 있습니다.",
      en: "In anger-inducing situations, you remain emotionally unshaken. This could be excellent self-regulation, or sometimes an avoidance of feeling emotions. It's worth checking whether this is genuine calm or emotional blocking.",
      ja: "怒りの状況で感情的にほとんど揺れません。優れた自己調節能力であるか、時に感情を感じないようにする回避かもしれません。真の平静なのか、感情を遮断しているのかを自分で確認する必要があります。",
      zh: "在容易引发愤怒的情境中，你的情绪几乎不被动摇。这可能是出色的自我调节能力，也可能是回避感受情绪。你值得确认一下：这是真正的平静，还是在切断情绪。",
      fr: "Dans les situations qui provoquent la colère, vous restez presque imperturbable. Cela peut être une excellente autorégulation, ou parfois une façon d'éviter de ressentir vos émotions. Il vaut la peine de vérifier s'il s'agit d'un vrai calme ou d'un blocage émotionnel.",
      es: "En situaciones que provocan ira, te mantienes emocionalmente casi imperturbable. Puede ser una gran autorregulación, o a veces una forma de evitar sentir emociones. Conviene revisar si es calma genuina o bloqueo emocional.",
    },
    impact: {
      ko: "안정적인 인상을 줄 수 있지만, 감정을 완전히 차단하면 공감 부족이나 관계의 피상성으로 이어질 수 있습니다.",
      en: "You may seem stable, but fully blocking emotions can lead to a lack of empathy or superficiality in relationships.",
      ja: "安定した印象を与えられますが、感情を完全に遮断すると共感の不足や関係の表面性につながることがあります。",
      zh: "你可能给人稳定的印象，但如果完全切断情绪，可能导致共情不足或关系流于表面。",
      fr: "Vous pouvez donner une impression de stabilité, mais bloquer complètement les émotions peut conduire à un manque d'empathie ou à des relations superficielles.",
      es: "Puedes parecer estable, pero bloquear por completo las emociones puede llevar a falta de empatía o a relaciones superficiales.",
    },
    growth: {
      ko: "분노가 느껴지지 않는다면, 정말 괜찮은 건지 확인해보세요. 감정을 느끼는 것을 허용하는 것도 성장입니다. 신뢰하는 사람에게 최근의 불편했던 순간을 솔직하게 말해보세요.",
      en: "If you don't feel anger, check whether you're really okay. Allowing yourself to feel emotions is also growth. Try honestly telling a trusted person about a moment that was uncomfortable for you recently.",
      ja: "怒りが感じられないなら、本当に大丈夫かどうか確認してみてください。感情を感じることを許すことも成長です。信頼できる人に最近不快だった瞬間を正直に話してみてください。",
      zh: "如果你感觉不到愤怒，可以确认一下自己是否真的没事。允许自己感受情绪也是成长。试着把最近让你不舒服的时刻，诚实告诉一个值得信任的人。",
      fr: "Si vous ne ressentez pas de colère, demandez-vous si vous allez vraiment bien. S'autoriser à ressentir ses émotions fait aussi partie de la croissance. Essayez de parler honnêtement à une personne de confiance d'un moment récent qui vous a mis mal à l'aise.",
      es: "Si no sientes ira, revisa si de verdad estás bien. Permitirte sentir emociones también es crecimiento. Intenta contarle honestamente a una persona de confianza algún momento reciente que te incomodó.",
    },
    affirmation: { ko: "나는 감정을 느끼면서도 나의 중심을 잃지 않습니다.", en: "I feel my emotions while keeping my center.", ja: "私は感情を感じながらも中心を失いません。", zh: "我感受自己的情绪，同时不失去内在中心。", fr: "Je ressens mes émotions tout en gardant mon centre.", es: "Siento mis emociones sin perder mi centro." },
  },
};

const ui: Record<SupportedLocale, { title: string; subtitle: string; progress: string; choose: string; resultTitle: string; allStyles: string; impact: string; growth: string; affirmation: string; restart: string; share: string; copied: string; note: string }> = {
  ko: { title: "분노 표현 스타일 테스트", subtitle: "나는 화가 날 때 어떻게 반응하나요?", progress: "상황", choose: "나와 가장 비슷한 반응은?", resultTitle: "나의 분노 표현 스타일", allStyles: "스타일별 점수", impact: "이 스타일의 영향", growth: "성장 방법", affirmation: "오늘의 확언", restart: "다시 테스트하기", share: "결과 공유", copied: "링크가 복사되었습니다!", note: "이 테스트는 분노 표현 유형에 관한 심리학 연구를 참고하며, 자기 이해를 위한 도구입니다." },
  en: { title: "Anger Style Test", subtitle: "How do you react when you're angry?", progress: "Scenario", choose: "Which response is most like you?", resultTitle: "My Anger Expression Style", allStyles: "Scores by Style", impact: "Impact of This Style", growth: "Ways to Grow", affirmation: "Today's Affirmation", restart: "Retake Test", share: "Share Result", copied: "Link copied!", note: "This test references psychological research on anger expression types and is a self-understanding tool." },
  ja: { title: "怒り表現スタイルテスト", subtitle: "怒ったとき、あなたはどう反応しますか？", progress: "状況", choose: "自分に最も近い反応は？", resultTitle: "私の怒り表現スタイル", allStyles: "スタイル別スコア", impact: "このスタイルの影響", growth: "成長方法", affirmation: "今日のアファメーション", restart: "もう一度テストする", share: "結果を共有", copied: "リンクをコピーしました！", note: "このテストは怒り表現タイプに関する心理学研究を参考にしており、自己理解のためのツールです。" },
  zh: { title: "愤怒表达风格测试", subtitle: "当你生气时，会如何反应？", progress: "情境", choose: "哪种反应最像你？", resultTitle: "我的愤怒表达风格", allStyles: "各风格得分", impact: "这种风格的影响", growth: "成长方法", affirmation: "今日肯定语", restart: "重新测试", share: "分享结果", copied: "链接已复制！", note: "本测试参考关于愤怒表达类型的心理学研究，是用于自我理解的工具。" },
  fr: { title: "Test du style d'expression de la colère", subtitle: "Comment réagissez-vous quand vous êtes en colère ?", progress: "Situation", choose: "Quelle réaction vous ressemble le plus ?", resultTitle: "Mon style d'expression de la colère", allStyles: "Scores par style", impact: "Impact de ce style", growth: "Pistes de progression", affirmation: "Affirmation du jour", restart: "Refaire le test", share: "Partager le résultat", copied: "Lien copié !", note: "Ce test s'appuie sur des recherches psychologiques sur les types d'expression de la colère et sert d'outil de compréhension de soi." },
  es: { title: "Test de estilo de ira", subtitle: "¿Cómo reaccionas cuando te enojas?", progress: "Escenario", choose: "¿Qué respuesta se parece más a ti?", resultTitle: "Mi estilo de expresión de la ira", allStyles: "Puntuaciones por estilo", impact: "Impacto de este estilo", growth: "Formas de crecer", affirmation: "Afirmación de hoy", restart: "Repetir test", share: "Compartir resultado", copied: "¡Enlace copiado!", note: "Este test toma como referencia investigaciones psicológicas sobre tipos de expresión de la ira y es una herramienta de autoconocimiento." },
};

export default function AngerStyleTest({ locale: localeProp }: Props) {
  const lp = (localeProp ?? "en").toLowerCase();
  const locale: SupportedLocale = (["ko", "en", "ja", "zh", "fr", "es"].includes(lp) ? lp : "en") as SupportedLocale;
  const t = ui[locale];

  const [idx, setIdx] = useState(0);
  const [scores, setScores] = useState<Record<AngerStyle, number>>({ explosive: 0, suppressor: 0, passive_aggressive: 0, assertive: 0, calm: 0 });
  const [result, setResult] = useState<AngerStyle | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const as_ = p.get("as") as AngerStyle | null;
    if (as_ && as_ in styleInfo) setResult(as_);
  }, []);

  function pick(choiceIdx: number) {
    const style = scenarios[idx].mapping[choiceIdx];
    const next = { ...scores, [style]: scores[style] + 1 };
    if (idx + 1 < scenarios.length) {
      setScores(next);
      setTimeout(() => setIdx(idx + 1), 280);
    } else {
      const dominant = (Object.keys(next) as AngerStyle[]).reduce((a, b) => next[a] >= next[b] ? a : b);
      setScores(next);
      setResult(dominant);
      const url = new URL(window.location.href);
      url.searchParams.set("as", dominant);
      window.history.replaceState({}, "", url.toString());
    }
  }

  function restart() {
    setIdx(0); setScores({ explosive: 0, suppressor: 0, passive_aggressive: 0, assertive: 0, calm: 0 }); setResult(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("as");
    window.history.replaceState({}, "", url.toString());
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) { await navigator.share({ title: t.title, url }); }
    else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }

  if (result) {
    const d = styleInfo[result];
    const chartData = (Object.keys(styleInfo) as AngerStyle[]).map((s) => ({
      name: styleInfo[s].name[locale].split(" ")[0],
      value: scores[s], color: styleInfo[s].color, fill: styleInfo[s].color,
    })).sort((a, b) => b.value - a.value);

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">{t.resultTitle}</h1>
          <div className="text-3xl">{d.emoji}</div>
          <div className="inline-block px-4 py-2 rounded-full text-white font-semibold" style={{ backgroundColor: d.color }}>{d.name[locale]}</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <h2 className="font-semibold text-gray-700 mb-2 text-sm">{t.allStyles}</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 24 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <p className="text-gray-700 leading-relaxed">{d.description[locale]}</p>
          <div className="bg-orange-50 rounded-lg p-3">
            <h3 className="font-semibold text-orange-800 text-sm mb-1">⚡ {t.impact}</h3>
            <p className="text-sm text-orange-700">{d.impact[locale]}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <h3 className="font-semibold text-green-800 text-sm mb-1">🌱 {t.growth}</h3>
            <p className="text-sm text-green-700">{d.growth[locale]}</p>
          </div>
          <div className="text-center py-3 rounded-lg" style={{ backgroundColor: d.color + "18" }}>
            <p className="text-sm italic" style={{ color: d.color }}>"{d.affirmation[locale]}"</p>
            <p className="text-xs text-gray-400 mt-1">{t.affirmation}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 text-center">{t.note}</p>
        <ShareResultButton
          locale={locale}
          heading={t.title}
          resultTitle={d.name[locale]}
          emoji={d.emoji}
          description={d.description[locale]}
        />
        <ResultNextSteps
          locale={locale}
          links={[
            { href: `/${locale}/breathing/timer`, label: locale === 'ko' ? '🫁 호흡 타이머' : locale === 'ja' ? '🫁 呼吸タイマー' : locale === 'zh' ? '🫁 呼吸计时器' : locale === 'fr' ? '🫁 Minuteur de respiration' : locale === 'es' ? '🫁 Temporizador de respiración' : '🫁 Breathing timer' },
            { href: `/${locale}/eq/test`, label: locale === 'ko' ? '💛 감성 지능 테스트' : locale === 'ja' ? '💛 感情知性テスト' : locale === 'zh' ? '💛 情绪智力测试' : locale === 'fr' ? '💛 Test d’intelligence émotionnelle' : locale === 'es' ? '💛 Test de inteligencia emocional' : '💛 Emotional intelligence test' },
            { href: `/${locale}/habit-builder/guide`, label: locale === 'ko' ? '✅ 습관 만들기 가이드' : locale === 'ja' ? '✅ 習慣づくりガイド' : locale === 'zh' ? '✅ 习惯养成指南' : locale === 'fr' ? '✅ Guide de création d’habitudes' : locale === 'es' ? '✅ Guía para crear hábitos' : '✅ Habit builder guide' },
          ]}
        />
        <RelatedReading locale={locale} topic="anger" />
        <div className="flex gap-3 justify-center">
          <button onClick={restart} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium text-sm">{t.restart}</button>
          <button onClick={share} className="px-5 py-2 text-white rounded-full font-medium text-sm" style={{ backgroundColor: d.color }}>{copied ? t.copied : t.share}</button>
        </div>
      </div>
    );
  }

  const s = scenarios[idx];
  return (
    <Questionnaire
      title={t.title}
      subtitle={t.subtitle}
      question={s[locale]}
      questionLabel={`${t.progress} ${idx + 1} / ${scenarios.length}`}
      progress={Math.round(((idx + 1) / scenarios.length) * 100)}
      options={s.choices[locale].map((label, i) => ({ label, value: i + 1 }))}
      note={t.choose}
      onSelect={(value) => pick(value - 1)}
    />
  );
}
