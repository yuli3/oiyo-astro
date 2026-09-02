import { useState, useEffect } from "react";
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import ShareResultButton from '../shared/ShareResultButton'
import { Questionnaire } from '@/components/ui/questionnaire'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type SupportedLocale = "ko" | "en" | "ja" | "zh" | "fr" | "es";

interface Props {
  locale?: string;
}

type SCLevel = "high" | "moderate_high" | "moderate_low" | "low";

interface Question {
  ko: string;
  en: string;
  ja: string;
  zh: string;
  fr: string;
  es: string;
  dimension: "self_kindness" | "common_humanity" | "mindfulness";
  reverse?: boolean; // self-judgment / isolation / over-identification items
}

// Kristin Neff's SCS-6 inspired — 3 dimensions x 4 questions
const questions: Question[] = [
  // Self-kindness
  { ko: "실수했을 때 스스로를 이해하고 따뜻하게 대하려고 한다", en: "When I make mistakes, I try to understand and be kind to myself", ja: "失敗したとき、自分を理解して優しく接しようとする", zh: "犯错时，我会试着理解自己，并温柔地对待自己", fr: "Quand je fais une erreur, j'essaie de me comprendre et de me traiter avec bienveillance", es: "Cuando cometo errores, intento comprenderme y tratarme con amabilidad", dimension: "self_kindness" },
  { ko: "어렵고 힘든 시간을 보낼 때 스스로를 돌보려고 한다", en: "I try to care for myself when going through difficult times", ja: "辛い時間を過ごすとき、自分を気にかけようとする", zh: "经历困难时期时，我会试着照顾自己", fr: "Quand je traverse une période difficile, j'essaie de prendre soin de moi", es: "Cuando atravieso momentos difíciles, intento cuidar de mí", dimension: "self_kindness" },
  { ko: "실수했을 때 자신을 비판하고 질책하는 경향이 있다", en: "I tend to criticize and blame myself when I make mistakes", ja: "失敗したとき、自分を批判して責める傾向がある", zh: "犯错时，我倾向于批评并责备自己", fr: "Quand je fais une erreur, j'ai tendance à me critiquer et à me blâmer", es: "Cuando cometo errores, tiendo a criticarme y culparme", dimension: "self_kindness", reverse: true },
  { ko: "고통스러울 때 자신에게 친절하지 못하다", en: "I am not kind to myself when I'm in pain", ja: "苦しいとき、自分に優しくできない", zh: "痛苦的时候，我很难善待自己", fr: "Quand je souffre, je n'arrive pas à être bienveillant envers moi-même", es: "Cuando estoy sufriendo, me cuesta ser amable conmigo", dimension: "self_kindness", reverse: true },

  // Common humanity
  { ko: "힘들 때 이런 어려움이 삶의 한 부분이라고 생각하며 나만 겪는 것이 아님을 안다", en: "When struggling, I see this difficulty as part of life, knowing I'm not alone", ja: "辛いとき、この困難は人生の一部であり、自分だけが経験することではないとわかる", zh: "挣扎时，我会把这种困难看作人生的一部分，并知道并不是只有我在经历", fr: "Quand je traverse une difficulté, je la vois comme une part de la vie et je sais que je ne suis pas seul", es: "Cuando tengo dificultades, las veo como parte de la vida y sé que no soy la única persona que las vive", dimension: "common_humanity" },
  { ko: "대부분의 사람들도 나와 비슷한 불충분함과 의심을 경험한다는 것을 이해한다", en: "I understand that most people experience similar feelings of inadequacy and doubt", ja: "ほとんどの人も自分と同じような不十分さや疑いを経験すると理解している", zh: "我理解大多数人也会经历和我相似的不足感与怀疑", fr: "Je comprends que la plupart des gens éprouvent aussi des sentiments d'insuffisance et de doute", es: "Entiendo que la mayoría de las personas también sienten dudas e insuficiencia parecidas", dimension: "common_humanity" },
  { ko: "힘들 때 나만 혼자 이런 어려움을 겪는 것 같은 느낌이 든다", en: "When struggling, I feel like I'm the only one dealing with these difficulties", ja: "辛いとき、自分だけがこんな困難を経験しているように感じる", zh: "挣扎时，我感觉好像只有自己在面对这些困难", fr: "Quand je vais mal, j'ai l'impression d'être le seul à vivre ce genre de difficultés", es: "Cuando tengo dificultades, siento que soy la única persona que pasa por algo así", dimension: "common_humanity", reverse: true },
  { ko: "나의 실패와 부족함으로 인해 다른 사람들로부터 고립된 느낌이 든다", en: "I feel isolated from others because of my failures and inadequacies", ja: "自分の失敗や不十分さのせいで他の人から孤立しているように感じる", zh: "因为自己的失败和不足，我会感到与他人隔绝", fr: "Je me sens isolé des autres à cause de mes échecs et de mes insuffisances", es: "Me siento aislado de los demás por mis fracasos y mis insuficiencias", dimension: "common_humanity", reverse: true },

  // Mindfulness
  { ko: "고통스러운 감정이 생길 때 균형 잡힌 관점을 유지하려고 한다", en: "When painful feelings arise, I try to maintain a balanced perspective", ja: "苦しい感情が生じるとき、バランスの取れた視点を保とうとする", zh: "当痛苦的情绪出现时，我会试着保持平衡的视角", fr: "Quand des émotions douloureuses apparaissent, j'essaie de garder une perspective équilibrée", es: "Cuando aparecen emociones dolorosas, intento mantener una perspectiva equilibrada", dimension: "mindfulness" },
  { ko: "부정적인 생각이나 감정에 지나치게 몰두하지 않으려고 한다", en: "I try not to get too absorbed in negative thoughts or feelings", ja: "ネガティブな考えや感情に過度に没頭しないようにする", zh: "我会试着不让自己过度陷入负面想法或情绪", fr: "J'essaie de ne pas me laisser absorber excessivement par les pensées ou émotions négatives", es: "Intento no quedarme demasiado atrapado en pensamientos o emociones negativas", dimension: "mindfulness" },
  { ko: "기분이 안 좋을 때 집착하고 모든 게 잘못되어 가고 있다는 생각에 사로잡힌다", en: "When I feel bad, I obsess and get caught up in thinking everything is going wrong", ja: "気分が悪いとき、こだわりすぎ、すべてがうまくいっていないという考えにとらわれる", zh: "心情不好时，我会反复纠结，并陷入一切都在出错的想法", fr: "Quand je me sens mal, je rumine et je me laisse prendre par l'idée que tout va de travers", es: "Cuando me siento mal, le doy vueltas a todo y me atrapa la idea de que todo está saliendo mal", dimension: "mindfulness", reverse: true },
  { ko: "중요한 일이 잘못되면 감정적으로 완전히 압도당하는 경향이 있다", en: "When something important goes wrong, I tend to be completely overwhelmed emotionally", ja: "重要なことがうまくいかないと、感情的に完全に圧倒される傾向がある", zh: "重要的事情出错时，我往往会在情绪上完全被压垮", fr: "Quand quelque chose d'important se passe mal, j'ai tendance à être complètement submergé émotionnellement", es: "Cuando algo importante sale mal, tiendo a sentirme completamente abrumado emocionalmente", dimension: "mindfulness", reverse: true },
];

const LEVELS: Record<SCLevel, {
  emoji: string;
  color: string;
} & Record<SupportedLocale, { title: string; description: string; impact: string; tip: string }>> = {
  high: {
    emoji: "💛",
    color: "#10b981",
    ko: {
      title: "높은 자기연민",
      description: "당신은 자신에게 친구에게 대하듯 친절하게 대하고, 어려움이 삶의 공통적 경험임을 받아들이며, 고통스러운 감정을 균형 잡힌 시각으로 바라봅니다. 크리스틴 네프 박사의 연구에 따르면 높은 자기연민은 정신 건강의 강력한 보호 요인입니다.",
      impact: "낮은 불안과 우울감, 더 빠른 회복력, 더 안정적인 자아감, 더 나은 관계 만족도",
      tip: "이미 훌륭한 자기연민을 갖추고 있습니다. 어려운 시기에도 이 능력을 꾸준히 실천하고, 주변 사람들에게도 자기연민의 중요성을 공유해보세요.",
    },
    en: {
      title: "High Self-Compassion",
      description: "You treat yourself with the kindness you'd show a friend, accept that difficulties are part of the common human experience, and view painful emotions with balanced perspective. Dr. Kristin Neff's research shows high self-compassion is a powerful mental health protective factor.",
      impact: "Lower anxiety and depression, faster resilience, more stable sense of self, better relationship satisfaction",
      tip: "You already have excellent self-compassion. Continue practicing during difficult times and share the importance of self-compassion with those around you.",
    },
    ja: {
      title: "高い自己思いやり",
      description: "自分を友人に接するように優しく扱い、困難は人生の共通体験であることを受け入れ、苦しい感情をバランスの取れた視点で見つめます。クリスティン・ネフ博士の研究によれば、高い自己思いやりは精神健康の強力な保護因子です。",
      impact: "低い不安とうつ感、より速い回復力、より安定した自己感覚、より良い関係満足度",
      tip: "すでに優れた自己思いやりを持っています。困難な時期にもこの能力を継続的に実践し、周りの人々にも自己思いやりの重要性を共有しましょう。",
    },
    zh: {
      title: "高自我关怀",
      description: "你会像对待朋友一样温柔地对待自己，接纳困难是人类共同经验的一部分，并以平衡的视角看待痛苦情绪。克里斯廷·内夫博士的研究显示，高自我关怀是心理健康的重要保护因素。",
      impact: "更低的焦虑和抑郁感、更快的复原力、更稳定的自我感、更好的关系满意度",
      tip: "你已经具备很好的自我关怀能力。请在困难时期继续练习，也可以和身边的人分享自我关怀的重要性。",
    },
    fr: {
      title: "Autocompassion élevée",
      description: "Vous vous traitez avec la bienveillance que vous offririez à un ami, vous acceptez que les difficultés fassent partie de l'expérience humaine commune et vous regardez les émotions douloureuses avec recul. Les recherches de la Dre Kristin Neff montrent qu'une autocompassion élevée protège fortement la santé mentale.",
      impact: "Moins d'anxiété et de dépression, meilleure résilience, sentiment de soi plus stable, relations plus satisfaisantes",
      tip: "Vous disposez déjà d'une excellente autocompassion. Continuez à la pratiquer dans les périodes difficiles et partagez son importance avec les personnes autour de vous.",
    },
    es: {
      title: "Autocompasión alta",
      description: "Te tratas con la amabilidad que ofrecerías a un amigo, aceptas que las dificultades forman parte de la experiencia humana compartida y observas las emociones dolorosas con una perspectiva equilibrada. La investigación de la Dra. Kristin Neff muestra que una autocompasión alta protege la salud mental.",
      impact: "Menos ansiedad y depresión, mayor resiliencia, sentido de identidad más estable y mejores relaciones",
      tip: "Ya cuentas con una excelente autocompasión. Sigue practicándola en los momentos difíciles y comparte su importancia con las personas cercanas.",
    },
  },
  moderate_high: {
    emoji: "🌼",
    color: "#3b82f6",
    ko: {
      title: "중상 수준의 자기연민",
      description: "자기연민의 기반이 잘 갖춰져 있습니다. 대체로 자신에게 친절하고 균형 잡힌 시각을 유지하지만, 특히 힘든 상황에서는 자기 비판이나 고립감이 나타날 수 있습니다.",
      impact: "정신 건강에 긍정적인 영향, 대부분의 어려움에서 건강하게 회복 가능",
      tip: "자기연민 명상(loving-kindness meditation)을 주기적으로 실천해보세요. '나는 행복하기를 바란다. 나는 고통에서 자유롭기를 바란다'와 같은 자기 자신을 위한 소원 목록을 만들어보세요.",
    },
    en: {
      title: "Moderate-High Self-Compassion",
      description: "You have a solid foundation of self-compassion. You're generally kind to yourself and maintain balanced perspective, but self-criticism or feelings of isolation may appear especially in difficult situations.",
      impact: "Positive impact on mental health; able to recover healthily from most difficulties",
      tip: "Practice loving-kindness meditation regularly. Create a 'wish list' for yourself: 'May I be happy. May I be free from suffering.'",
    },
    ja: {
      title: "中高程度の自己思いやり",
      description: "自己思いやりの基盤がしっかりと整っています。おおむね自分に優しくバランスの取れた視点を維持しますが、特に困難な状況では自己批判や孤立感が現れることがあります。",
      impact: "精神健康への良い影響；ほとんどの困難から健康的に回復できる",
      tip: "慈悲の瞑想（ラビングカインドネス瞑想）を定期的に実践しましょう。「私が幸せでありますように。私が苦しみから解放されますように」のような自分のための願いのリストを作りましょう。",
    },
    zh: {
      title: "中高水平自我关怀",
      description: "你的自我关怀基础较稳固。通常你能温柔地对待自己，并保持平衡的视角，但在特别困难的情境中，仍可能出现自我批评或孤立感。",
      impact: "对心理健康有积极影响；多数困难之后能够以健康方式恢复",
      tip: "可以定期练习慈心冥想。为自己写下这样的愿望：\"愿我幸福。愿我从痛苦中解脱。\"",
    },
    fr: {
      title: "Autocompassion plutôt élevée",
      description: "Votre base d'autocompassion est solide. Vous êtes généralement bienveillant envers vous-même et gardez une perspective équilibrée, même si l'autocritique ou le sentiment d'isolement peuvent apparaître dans les situations particulièrement difficiles.",
      impact: "Effet positif sur la santé mentale ; récupération saine après la plupart des difficultés",
      tip: "Pratiquez régulièrement la méditation de bienveillance. Créez une liste de souhaits pour vous-même : \"Puissé-je être heureux. Puissé-je être libéré de la souffrance.\"",
    },
    es: {
      title: "Autocompasión media-alta",
      description: "Tienes una base sólida de autocompasión. En general te tratas con amabilidad y mantienes una perspectiva equilibrada, aunque en situaciones especialmente difíciles pueden aparecer la autocrítica o la sensación de aislamiento.",
      impact: "Impacto positivo en la salud mental; capacidad de recuperarte de forma saludable de la mayoría de las dificultades",
      tip: "Practica con regularidad la meditación de bondad amorosa. Crea una lista de deseos para ti: \"Que pueda ser feliz. Que pueda liberarme del sufrimiento.\"",
    },
  },
  moderate_low: {
    emoji: "🌱",
    color: "#f59e0b",
    ko: {
      title: "중하 수준의 자기연민",
      description: "자기연민이 일부 있지만, 자기 비판, 고립감, 또는 감정에 과몰입하는 패턴이 자주 나타납니다. 자신에게 타인에게 대하는 것보다 훨씬 가혹하게 대하는 경향이 있을 수 있습니다.",
      impact: "자기 비판이 스트레스와 불안을 증가시킬 수 있으며, 실패 후 회복이 더딜 수 있음",
      tip: "자신에 대해 말할 때 친한 친구에게 말하듯 말하는 연습을 해보세요. '나는 이걸 못 해'라고 말하게 된다면, '네가 나의 친한 친구라면 이런 상황에서 뭐라고 말해줄까?'를 자문해보세요.",
    },
    en: {
      title: "Moderate-Low Self-Compassion",
      description: "You have some self-compassion, but patterns of self-criticism, feelings of isolation, or over-identification with emotions appear frequently. You may tend to treat yourself much more harshly than you'd treat others.",
      impact: "Self-criticism can increase stress and anxiety; recovery after failure may be slower",
      tip: "Practice speaking to yourself as you'd speak to a close friend. When you catch yourself saying 'I can't do this,' ask yourself 'If a close friend were in this situation, what would I tell them?'",
    },
    ja: {
      title: "中低程度の自己思いやり",
      description: "ある程度の自己思いやりがありますが、自己批判、孤立感、感情への過度の没入パターンが頻繁に現れます。他の人に接するよりもはるかに自分に厳しく接する傾向があるかもしれません。",
      impact: "自己批判がストレスと不安を増加させる可能性があり、失敗後の回復が遅れることがある",
      tip: "自分について話すとき、親友に話すように練習しましょう。「私にはこれができない」と言いそうになったら、「もし親友がこんな状況にいたら、何と言うだろう？」と自問してみましょう。",
    },
    zh: {
      title: "中低水平自我关怀",
      description: "你有一定的自我关怀，但自我批评、孤立感，或与情绪过度认同的模式经常出现。你可能比对待别人更加严厉地对待自己。",
      impact: "自我批评可能增加压力和焦虑；失败后的恢复可能较慢",
      tip: "练习像对亲近的朋友说话那样对自己说话。当你发现自己说\"我做不到\"时，问问自己：\"如果亲近的朋友处在这种情况，我会对他说什么？\"",
    },
    fr: {
      title: "Autocompassion plutôt faible",
      description: "Vous avez une certaine autocompassion, mais l'autocritique, le sentiment d'isolement ou la suridentification aux émotions apparaissent souvent. Vous avez peut-être tendance à vous traiter bien plus durement que vous ne traiteriez les autres.",
      impact: "L'autocritique peut augmenter le stress et l'anxiété ; la récupération après un échec peut être plus lente",
      tip: "Entraînez-vous à vous parler comme vous parleriez à un ami proche. Quand vous vous entendez dire \"Je n'y arriverai pas\", demandez-vous : \"Si un ami proche était dans cette situation, que lui dirais-je ?\"",
    },
    es: {
      title: "Autocompasión media-baja",
      description: "Tienes algo de autocompasión, pero aparecen con frecuencia patrones de autocrítica, aislamiento o sobreidentificación con las emociones. Puede que tiendas a tratarte con mucha más dureza de la que usarías con otras personas.",
      impact: "La autocrítica puede aumentar el estrés y la ansiedad; la recuperación después de un fracaso puede ser más lenta",
      tip: "Practica hablarte como le hablarías a un amigo cercano. Cuando te descubras diciendo \"No puedo con esto\", pregúntate: \"Si un amigo cercano estuviera en esta situación, ¿qué le diría?\"",
    },
  },
  low: {
    emoji: "🪴",
    color: "#ef4444",
    ko: {
      title: "낮은 자기연민",
      description: "현재 자신에게 매우 가혹한 기준을 적용하고, 어려움에서 혼자라는 느낌을 자주 받으며, 고통스러운 감정에 압도당하는 경향이 있습니다. 자기 비판이 동기를 높인다는 믿음이 있을 수 있지만, 연구는 오히려 반대임을 보여줍니다.",
      impact: "높은 불안, 우울 취약성, 실패 시 강한 수치심, 회복 지연",
      tip: "자기연민은 자기 방임이 아닙니다. 자기연민 훈련은 성과를 낮추지 않고 오히려 높입니다. 크리스틴 네프 박사의 '자기연민 명상(Self-Compassion Break)' 3단계: ① 이것이 고통의 순간이라는 것을 알아챈다 ② 고통은 삶의 한 부분이다 ③ 나에게 친절하게 대할 수 있다",
    },
    en: {
      title: "Low Self-Compassion",
      description: "You currently apply very harsh standards to yourself, frequently feel alone in difficulties, and tend to be overwhelmed by painful emotions. You may believe self-criticism raises motivation, but research shows the opposite.",
      impact: "High anxiety, vulnerability to depression, strong shame after failure, delayed recovery",
      tip: "Self-compassion is not self-indulgence. Self-compassion training doesn't lower performance — it raises it. Dr. Kristin Neff's 'Self-Compassion Break' 3 steps: ① Acknowledge 'This is a moment of suffering' ② 'Suffering is part of life' ③ 'I can be kind to myself'",
    },
    ja: {
      title: "低い自己思いやり",
      description: "現在、自分に非常に厳しい基準を適用し、困難の中で孤独を頻繁に感じ、苦しい感情に圧倒される傾向があります。自己批判が動機を高めるという信念があるかもしれませんが、研究は反対を示しています。",
      impact: "高い不安、うつへの脆弱性、失敗時の強い恥、回復の遅延",
      tip: "自己思いやりは自己甘やかしではありません。自己思いやりのトレーニングはパフォーマンスを下げるのではなく、むしろ上げます。クリスティン・ネフ博士の「自己思いやりの休憩」3ステップ：①「これは苦しみの瞬間」と気づく ②「苦しみは人生の一部」 ③「自分に優しくできる」",
    },
    zh: {
      title: "低自我关怀",
      description: "你目前可能对自己使用非常严苛的标准，经常在困难中感到孤单，并容易被痛苦情绪压倒。你也许相信自我批评能提升动力，但研究显示情况恰好相反。",
      impact: "较高焦虑、抑郁脆弱性、失败后的强烈羞耻感、恢复延迟",
      tip: "自我关怀不是自我放纵。自我关怀训练不会降低表现，反而可能提升表现。克里斯廷·内夫博士的\"自我关怀暂停\"三步：①觉察\"这是一个痛苦的时刻\" ②\"痛苦是人生的一部分\" ③\"我可以善待自己\"",
    },
    fr: {
      title: "Autocompassion faible",
      description: "Vous appliquez actuellement des critères très sévères envers vous-même, vous vous sentez souvent seul dans les difficultés et vous avez tendance à être submergé par les émotions douloureuses. Vous pouvez croire que l'autocritique stimule la motivation, mais la recherche montre plutôt l'inverse.",
      impact: "Anxiété élevée, vulnérabilité à la dépression, honte intense après l'échec, récupération retardée",
      tip: "L'autocompassion n'est pas de l'auto-indulgence. L'entraînement à l'autocompassion ne diminue pas la performance ; il peut l'améliorer. Les 3 étapes de la \"pause d'autocompassion\" de la Dre Kristin Neff : ① reconnaître \"C'est un moment de souffrance\" ② \"La souffrance fait partie de la vie\" ③ \"Je peux être bienveillant envers moi-même\"",
    },
    es: {
      title: "Autocompasión baja",
      description: "Actualmente aplicas estándares muy duros contigo, sueles sentirte solo ante las dificultades y tiendes a quedar desbordado por las emociones dolorosas. Puede que creas que la autocrítica aumenta la motivación, pero la investigación muestra lo contrario.",
      impact: "Ansiedad alta, vulnerabilidad a la depresión, vergüenza intensa tras el fracaso y recuperación más lenta",
      tip: "La autocompasión no es autoindulgencia. Entrenar la autocompasión no reduce el rendimiento; puede mejorarlo. Los 3 pasos de la \"pausa de autocompasión\" de la Dra. Kristin Neff: ① reconocer \"Este es un momento de sufrimiento\" ② \"El sufrimiento forma parte de la vida\" ③ \"Puedo ser amable conmigo\"",
    },
  },
};

const dimLabels: Record<string, Record<SupportedLocale, string>> = {
  self_kindness: { ko: "자기친절", en: "Self-Kindness", ja: "自己親切", zh: "自我友善", fr: "Bienveillance envers soi", es: "Amabilidad con uno mismo" },
  common_humanity: { ko: "보편적 인류", en: "Common Humanity", ja: "共通の人間性", zh: "共同人性", fr: "Humanité commune", es: "Humanidad compartida" },
  mindfulness: { ko: "마음챙김", en: "Mindfulness", ja: "マインドフルネス", zh: "正念", fr: "Pleine conscience", es: "Atención plena" },
};

const t = {
  ko: {
    title: "자기연민 테스트",
    subtitle: "나는 나 자신에게 얼마나 친절한가?",
    instruction: "각 문장이 자신에게 얼마나 해당하는지 선택해주세요",
    never: "거의 안 그렇다",
    rarely: "가끔 그렇다",
    sometimes: "자주 그렇다",
    often: "항상 그렇다",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "자기연민 진단 결과",
    yourScore: "총점",
    impact: "생활 영향",
    tip: "성장 팁",
    dimTitle: "3가지 요소별 점수",
    restart: "다시 하기",
    share: "결과 공유",
    copied: "복사됨!",
  },
  en: {
    title: "Self-Compassion Test",
    subtitle: "How Kind Are You to Yourself?",
    instruction: "Choose how much each statement applies to you",
    never: "Rarely",
    rarely: "Sometimes",
    sometimes: "Often",
    often: "Almost always",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Self-Compassion Assessment",
    yourScore: "Total Score",
    impact: "Life Impact",
    tip: "Growth Tip",
    dimTitle: "Score by 3 Dimensions",
    restart: "Restart",
    share: "Share Result",
    copied: "Copied!",
  },
  ja: {
    title: "自己思いやりテスト",
    subtitle: "自分にどれくらい優しくしていますか？",
    instruction: "各文章がどれくらい自分に当てはまるか選んでください",
    never: "ほとんどそうでない",
    rarely: "時々そうだ",
    sometimes: "よくそうだ",
    often: "いつもそうだ",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "自己思いやり診断結果",
    yourScore: "合計点",
    impact: "生活への影響",
    tip: "成長のヒント",
    dimTitle: "3要素別スコア",
    restart: "もう一度",
    share: "結果をシェア",
    copied: "コピーされました！",
  },
  zh: {
    title: "自我关怀测试",
    subtitle: "你对自己有多温柔？",
    instruction: "请选择每句话有多符合你",
    never: "几乎不是",
    rarely: "有时是",
    sometimes: "经常是",
    often: "总是如此",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "自我关怀评估结果",
    yourScore: "总分",
    impact: "生活影响",
    tip: "成长提示",
    dimTitle: "3个要素得分",
    restart: "重新测试",
    share: "分享结果",
    copied: "已复制！",
  },
  fr: {
    title: "Test d'autocompassion",
    subtitle: "À quel point êtes-vous bienveillant envers vous-même ?",
    instruction: "Choisissez dans quelle mesure chaque phrase vous correspond",
    never: "Rarement",
    rarely: "Parfois",
    sometimes: "Souvent",
    often: "Presque toujours",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Résultat de l'évaluation d'autocompassion",
    yourScore: "Score total",
    impact: "Impact au quotidien",
    tip: "Conseil de progression",
    dimTitle: "Scores des 3 dimensions",
    restart: "Recommencer",
    share: "Partager le résultat",
    copied: "Copié !",
  },
  es: {
    title: "Test de autocompasión",
    subtitle: "¿Qué tan amable eres contigo?",
    instruction: "Elige cuánto se aplica a ti cada afirmación",
    never: "Rara vez",
    rarely: "A veces",
    sometimes: "A menudo",
    often: "Casi siempre",
    progress: (cur: number, total: number) => `${cur} / ${total}`,
    resultTitle: "Resultado de autocompasión",
    yourScore: "Puntuación total",
    impact: "Impacto en la vida",
    tip: "Consejo de crecimiento",
    dimTitle: "Puntuación en 3 dimensiones",
    restart: "Reiniciar",
    share: "Compartir resultado",
    copied: "¡Copiado!",
  },
};

function getLevel(score: number): SCLevel {
  if (score >= 38) return "high";
  if (score >= 28) return "moderate_high";
  if (score >= 18) return "moderate_low";
  return "low";
}

export default function SelfCompassionTest({ locale: localeProp }: Props) {

  const lp = (localeProp ?? "en").toLowerCase();
  const locale: SupportedLocale = (["ko", "en", "ja", "zh", "fr", "es"].includes(lp) ? lp : "en") as SupportedLocale;
  const tx = t[locale];

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{ level: SCLevel; score: number; dims: Record<string, number> } | null>(null);
  useRecordFinishedTest({ testId: "self-compassion", title: "SelfCompassionTest", finished: Boolean(result) });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const sc = p.get("sc") as SCLevel | null;
    const ss = p.get("ss");
    if (sc && ss && LEVELS[sc]) {
      setResult({ level: sc, score: parseInt(ss, 10), dims: {} });
    }
  }, []);

  const scoreOptions = [
    { label: tx.never, value: 1 },
    { label: tx.rarely, value: 2 },
    { label: tx.sometimes, value: 3 },
    { label: tx.often, value: 4 },
  ] as const;

  function pick(rawScore: number) {
    const q = questions[idx];
    const score = q.reverse ? 5 - rawScore : rawScore;
    const next = answers.slice(0, idx);
    next[idx] = score;

    if (next.length < questions.length) {
      setAnswers(next);
      setTimeout(() => setIdx(next.length), 280);
    } else {
      const total = next.reduce((a, b) => a + b, 0);
      const dims: Record<string, number> = { self_kindness: 0, common_humanity: 0, mindfulness: 0 };
      questions.forEach((q, i) => {
        dims[q.dimension] += next[i] ?? 0;
      });
      const level = getLevel(total);
      setResult({ level, score: total, dims });
      const url = new URL(window.location.href);
      url.searchParams.set("sc", level);
      url.searchParams.set("ss", String(total));
      window.history.replaceState({}, "", url.toString());
    }
  }

  function previous() {
    if (idx === 0) return;
    setIdx(idx - 1);
  }

  function restart() {
    setIdx(0);
    setAnswers([]);
    setResult(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("sc");
    url.searchParams.delete("ss");
    window.history.replaceState({}, "", url.toString());
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: tx.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const maxScore = questions.length * 4;

  if (result) {
    const lv = LEVELS[result.level];
    const ld = lv[locale];
    const pct = Math.round((result.score / maxScore) * 100);
    const radarData = Object.entries(result.dims).map(([k, v]) => ({
      subject: dimLabels[k][locale],
      score: v,
      fullMark: 16,
    }));

    return (
      <div className="space-y-6">
        <div className="rounded-2xl p-6 text-center" style={{ background: `${lv.color}12`, border: `1px solid ${lv.color}40` }}>
          <p className="mb-1 text-sm font-medium text-gray-500">{tx.resultTitle}</p>
          <div className="mb-2 text-5xl">{lv.emoji}</div>
          <h2 className="text-2xl font-bold text-gray-900">{ld.title}</h2>
          <p className="mt-2 text-sm text-gray-500">{tx.yourScore}: {result.score} / {maxScore}</p>
          <div className="mx-auto mt-4 max-w-xs">
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: lv.color }} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-card p-5 shadow-sm">
          <p className="text-sm text-gray-700 leading-relaxed">{ld.description}</p>
        </div>

        {radarData.every(d => d.score > 0) && (
          <div className="rounded-xl border border-gray-100 bg-card p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-gray-700">{tx.dimTitle}</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <Radar dataKey="score" stroke={lv.color} fill={lv.color} fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="rounded-xl border border-gray-100 bg-card p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-semibold text-gray-700">📊 {tx.impact}</h3>
            <p className="mt-1 text-sm text-gray-600">{ld.impact}</p>
          </div>
          <div className="rounded-lg p-4" style={{ background: `${lv.color}10` }}>
            <h3 className="font-semibold" style={{ color: lv.color }}>💡 {tx.tip}</h3>
            <p className="mt-1 text-sm text-gray-700">{ld.tip}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={restart} className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
            {tx.restart}
          </button>
          <button onClick={share} className="flex-1 rounded-xl py-3 text-sm font-medium text-white transition" style={{ backgroundColor: lv.color }}>
            {copied ? tx.copied : tx.share}
          </button>
        </div>
        <ShareResultButton locale={localeProp ?? 'ko'} heading={tx.title} resultTitle={ld.title} />
      </div>
    );
  }

  const q = questions[idx];

  return (
    <Questionnaire
      title={tx.title}
      subtitle={tx.subtitle}
      question={q[locale]}
      questionLabel={tx.progress(idx + 1, questions.length)}
      progress={Math.round((idx / questions.length) * 100)}
      options={scoreOptions.map((opt) => ({ label: opt.label, value: opt.value }))}
      selectedValue={answers[idx] === undefined ? undefined : q.reverse ? 5 - answers[idx] : answers[idx]}
      note={tx.instruction}
      previousLabel={locale === 'ko' ? '이전 질문' : locale === 'ja' ? '前の質問' : 'Previous question'}
      onPrevious={idx > 0 ? previous : undefined}
      onSelect={pick}
    />
  );
}
