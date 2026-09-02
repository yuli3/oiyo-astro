import { useState } from "react";
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import { Questionnaire } from '@/components/ui/questionnaire';
import type { Locale } from "../../i18n";

interface Props { locale?: Locale; }
type Lang = "ko"|"en"|"ja"|"zh"|"fr"|"es";

// ─── Attachment Styles ────────────────────────────────────────────────────────
type AttachType = "secure"|"anxious"|"avoidant"|"disorganized";
type LoveLang = "words"|"acts"|"gifts"|"time"|"touch";
type ConflictStyle = "collaborate"|"compromise"|"accommodate"|"avoid"|"compete";

// ─── Questions ────────────────────────────────────────────────────────────────
// Section A: Attachment (8 questions, 2 per type)
// Section B: Love Language (10 questions, 2 per lang)
// Section C: Conflict Style (10 questions, 2 per style)

interface QSection { id: number; section: "A"|"B"|"C"; key: string; ko: string; en: string; ja: string; zh: string; fr: string; es: string; }

const QUESTIONS: QSection[] = [
  // A: Attachment
  { id:1,  section:"A", key:"secure",       ko:"관계에서 신뢰를 주고받는 것이 자연스럽고 편안하다.",               en:"Giving and receiving trust in relationships feels natural and comfortable.",             ja:"関係で信頼を与え合うことが自然で安心だ。",                     zh:"在关系中给予和接受信任感觉很自然、很自在。",                             fr:"Donner et recevoir de la confiance dans une relation me semble naturel et confortable.",                            es:"Dar y recibir confianza en las relaciones me resulta natural y cómodo." },
  { id:2,  section:"A", key:"secure",       ko:"파트너와 갈등이 생겨도 대화로 해결할 수 있다는 믿음이 있다.",         en:"When conflict arises, I trust we can resolve it through conversation.",                  ja:"パートナーと対立が生じても、話し合いで解決できるという信頼がある。",             zh:"即使关系中出现冲突，我也相信我们能通过对话解决。",                        fr:"Même en cas de conflit avec mon/ma partenaire, je crois que nous pouvons le résoudre par le dialogue.",             es:"Incluso si surge un conflicto con mi pareja, confío en que podemos resolverlo a través del diálogo." },
  { id:3,  section:"A", key:"anxious",      ko:"파트너가 나를 충분히 사랑하지 않을까봐 자주 걱정된다.",               en:"I often worry that my partner doesn't love me enough.",                                ja:"パートナーが私を十分に愛していないのではと頻繁に心配する。",                   zh:"我常常担心伴侣不够爱我。",                                          fr:"Je m'inquiète souvent que mon/ma partenaire ne m'aime pas assez.",                                                  es:"A menudo me preocupa que mi pareja no me quiera lo suficiente." },
  { id:4,  section:"A", key:"anxious",      ko:"파트너가 연락이 없으면 버려지는 것이 아닌지 불안해진다.",              en:"When my partner doesn't respond, I feel anxious about being abandoned.",                 ja:"パートナーから連絡がないと、見捨てられるのではないかと不安になる。",             zh:"当伴侣没有回复消息时，我会因为担心被抛弃而感到不安。",                     fr:"Quand mon/ma partenaire ne répond pas, je m'inquiète d'être abandonné(e).",                                          es:"Cuando mi pareja no responde, me angustia sentir que podría ser abandonado(a)." },
  { id:5,  section:"A", key:"avoidant",     ko:"관계가 깊어질수록 오히려 거리감이 필요하다는 느낌이 든다.",            en:"The deeper the relationship gets, the more I feel I need distance.",                    ja:"関係が深まるほど、むしろ距離が必要だという感覚がある。",                       zh:"关系越深，我反而越觉得需要保持距离。",                                   fr:"Plus la relation s'approfondit, plus je ressens le besoin de garder mes distances.",                                es:"Cuanto más profunda se vuelve la relación, más siento que necesito distancia." },
  { id:6,  section:"A", key:"avoidant",     ko:"파트너에게 내 감정을 깊이 표현하는 것이 불편하다.",                   en:"I feel uncomfortable deeply sharing my emotions with my partner.",                      ja:"パートナーに感情を深く表現することが不快だ。",                               zh:"向伴侣深入表达自己的情感让我感到不自在。",                               fr:"Je me sens mal à l'aise de partager mes émotions en profondeur avec mon/ma partenaire.",                            es:"Me siento incómodo(a) al compartir mis emociones profundamente con mi pareja." },
  { id:7,  section:"A", key:"disorganized", ko:"관계에서 친밀함을 원하면서도 동시에 두렵다.",                         en:"I want closeness in relationships but also fear it at the same time.",                  ja:"関係で親密さを望みながら、同時に恐れている。",                               zh:"我在关系中既渴望亲密，又同时感到害怕。",                                 fr:"Je désire l'intimité dans les relations tout en la craignant en même temps.",                                       es:"Deseo la cercanía en las relaciones, pero al mismo tiempo la temo." },
  { id:8,  section:"A", key:"disorganized", ko:"관계에서 예측 불가능한 패턴이 반복되어 혼란스러울 때가 있다.",          en:"I sometimes feel confused by unpredictable patterns that repeat in my relationships.",  ja:"関係で予測不可能なパターンが繰り返されて混乱することがある。",                 zh:"有时我会因为关系中反复出现的不可预测的模式而感到困惑。",                   fr:"Je me sens parfois confus(e) par des schémas imprévisibles qui se répètent dans mes relations.",                    es:"A veces me siento confundido(a) por patrones impredecibles que se repiten en mis relaciones." },
  // B: Love Language
  { id:9,  section:"B", key:"words",  ko:"파트너의 칭찬과 격려, 사랑의 말이 가장 크게 와 닿는다.",              en:"My partner's compliments, encouragement, and words of love mean the most to me.",      ja:"パートナーの褒め言葉や励まし、愛の言葉が最も心に響く。",                       zh:"伴侣的称赞、鼓励和爱的话语对我而言意义最大。",                             fr:"Les compliments, les encouragements et les mots d'amour de mon/ma partenaire comptent le plus pour moi.",           es:"Los cumplidos, el ánimo y las palabras de amor de mi pareja son lo que más significan para mí." },
  { id:10, section:"B", key:"words",  ko:"'사랑해', '잘했어' 같은 언어적 표현이 없으면 허전함을 느낀다.",          en:"Without verbal expressions like 'I love you' or 'Well done,' I feel empty.",           ja:"「愛してる」「よくやった」などの言語表現がないと空虚に感じる。",                 zh:"如果没有像「我爱你」「做得好」这样的语言表达，我会感到空虚。",             fr:"Sans expressions verbales comme « je t'aime » ou « bien joué », je me sens vide.",                                  es:"Sin expresiones verbales como «te amo» o «bien hecho», me siento vacío(a)." },
  { id:11, section:"B", key:"acts",   ko:"파트너가 내 일을 도와주거나 먼저 챙겨줄 때 사랑을 가장 크게 느낀다.",       en:"I feel most loved when my partner helps me or takes care of things for me.",            ja:"パートナーが私の仕事を手伝ってくれたり、先に気にかけてくれると最も愛を感じる。",   zh:"当伴侣帮我做事或主动照顾我时，我感受到的爱最深。",                         fr:"Je me sens le plus aimé(e) quand mon/ma partenaire m'aide ou s'occupe des choses pour moi.",                        es:"Me siento más amado(a) cuando mi pareja me ayuda o se ocupa de las cosas por mí." },
  { id:12, section:"B", key:"acts",   ko:"행동으로 보여주지 않으면 말만으로는 믿기 어렵다.",                      en:"Without action to back it up, words alone are hard to believe.",                       ja:"行動で示してくれなければ、言葉だけでは信じにくい。",                           zh:"如果没有行动来证明，光靠言语很难让我相信。",                               fr:"Sans actions pour les appuyer, les mots seuls sont difficiles à croire.",                                            es:"Sin acciones que lo respalden, las palabras solas son difíciles de creer." },
  { id:13, section:"B", key:"gifts",  ko:"특별한 선물이나 기억에 남는 이벤트가 관계에 의미를 더해준다.",               en:"Special gifts or memorable events add meaning to the relationship.",                    ja:"特別なプレゼントや思い出に残るイベントが関係に意味を加えてくれる。",             zh:"特别的礼物或令人难忘的活动会为关系增添意义。",                             fr:"Des cadeaux spéciaux ou des événements mémorables ajoutent du sens à la relation.",                                  es:"Los regalos especiales o los eventos memorables le dan significado a la relación." },
  { id:14, section:"B", key:"gifts",  ko:"파트너가 나를 생각하며 고른 선물은 아무리 작아도 감동적이다.",              en:"A gift chosen with me in mind moves me deeply, no matter how small.",                   ja:"パートナーが私のことを考えて選んだプレゼントは、どんなに小さくても感動的だ。",     zh:"伴侣特意为我挑选的礼物，无论多小都让我深受感动。",                         fr:"Un cadeau choisi en pensant à moi me touche profondément, peu importe sa taille.",                                   es:"Un regalo elegido pensando en mí me conmueve profundamente, sin importar lo pequeño que sea." },
  { id:15, section:"B", key:"time",   ko:"파트너와 함께하는 온전한 시간이 가장 소중하다.",                        en:"Quality time spent fully with my partner is what I treasure most.",                     ja:"パートナーとともに過ごす充実した時間が最も大切だ。",                           zh:"与伴侣全心投入共度的时光，是我最珍视的。",                                 fr:"Le temps de qualité passé pleinement avec mon/ma partenaire est ce que je chéris le plus.",                          es:"El tiempo de calidad que paso completamente presente con mi pareja es lo que más atesoro." },
  { id:16, section:"B", key:"time",   ko:"파트너가 다른 것에 집중하며 시간을 보내면 상처를 받는다.",                  en:"I feel hurt when my partner is distracted and not fully present with me.",              ja:"パートナーが他のことに集中して時間を過ごすと傷つく。",                         zh:"当伴侣心不在焉、无法全身心陪伴我时，我会感到受伤。",                       fr:"Je me sens blessé(e) quand mon/ma partenaire est distrait(e) et n'est pas pleinement présent(e) avec moi.",         es:"Me siento herido(a) cuando mi pareja está distraída y no está plenamente presente conmigo." },
  { id:17, section:"B", key:"touch",  ko:"포옹, 손잡기 같은 신체 접촉이 감정적 연결을 가장 잘 만들어준다.",           en:"Physical touch like hugs and holding hands creates the best emotional connection.",     ja:"ハグや手をつなぐなどの身体的接触が、最も感情的なつながりを生み出す。",           zh:"拥抱、牵手等身体接触最能建立情感联系。",                                   fr:"Le contact physique comme les câlins et se tenir la main crée la meilleure connexion émotionnelle.",                es:"El contacto físico como los abrazos y tomarse de la mano crea la mejor conexión emocional." },
  { id:18, section:"B", key:"touch",  ko:"파트너의 스킨십이 줄면 관계가 소원해지는 것처럼 느껴진다.",                 en:"When my partner's physical affection decreases, I feel like we're growing apart.",       ja:"パートナーのスキンシップが減ると、関係が疎遠になっているように感じる。",         zh:"当伴侣的亲密接触减少时，我会觉得关系变得疏远。",                           fr:"Quand l'affection physique de mon/ma partenaire diminue, j'ai l'impression que nous nous éloignons.",               es:"Cuando el afecto físico de mi pareja disminuye, siento que nos estamos distanciando." },
  // C: Conflict Style
  { id:19, section:"C", key:"collaborate", ko:"갈등이 생기면 서로 모두 만족할 수 있는 해결책을 찾으려 한다.",            en:"When conflict arises, I try to find a solution that satisfies both of us.",             ja:"対立が生じたら、お互いが満足できる解決策を見つけようとする。",                 zh:"发生冲突时，我会尝试找到让双方都满意的解决方案。",                         fr:"Quand un conflit survient, j'essaie de trouver une solution qui satisfait les deux parties.",                       es:"Cuando surge un conflicto, intento encontrar una solución que nos satisfaga a ambos." },
  { id:20, section:"C", key:"collaborate", ko:"문제의 근본 원인을 이해하고 함께 해결하는 것이 중요하다.",               en:"Understanding the root cause of a problem and solving it together is important.",        ja:"問題の根本原因を理解し、一緒に解決することが重要だ。",                         zh:"理解问题的根本原因并一起解决很重要。",                                     fr:"Comprendre la cause profonde d'un problème et le résoudre ensemble est important.",                                 es:"Entender la causa raíz de un problema y resolverlo juntos es importante." },
  { id:21, section:"C", key:"compromise",  ko:"갈등 시 서로 일부씩 양보해서 중간 지점을 찾는 편이다.",                 en:"In conflict, I tend to find a middle ground where we both give a little.",               ja:"対立の際は、互いに少し譲り合って中間点を見つける傾向がある。",                 zh:"发生冲突时，我倾向于双方各让一步，找到折中方案。",                         fr:"En cas de conflit, j'ai tendance à trouver un compromis où chacun cède un peu.",                                    es:"En un conflicto, tiendo a encontrar un punto medio donde ambos cedemos un poco." },
  { id:22, section:"C", key:"compromise",  ko:"완벽한 해결보다 빠른 타협이 더 실용적이라고 생각한다.",                 en:"Quick compromise is more practical than a perfect solution.",                           ja:"完璧な解決策より、素早い妥協の方が現実的だと思う。",                           zh:"比起完美的解决方案，快速的妥协更实际。",                                   fr:"Un compromis rapide est plus pratique qu'une solution parfaite.",                                                    es:"Un compromiso rápido es más práctico que una solución perfecta." },
  { id:23, section:"C", key:"accommodate", ko:"갈등을 피하기 위해 내 주장을 포기하고 상대방의 의견을 따를 때가 많다.",    en:"To avoid conflict, I often give up my position and go along with the other person.",    ja:"対立を避けるため、自分の主張を諦めて相手の意見に従うことが多い。",             zh:"为了避免冲突，我常常放弃自己的主张，顺从对方的意见。",                     fr:"Pour éviter les conflits, j'abandonne souvent ma position et me range à l'avis de l'autre.",                        es:"Para evitar conflictos, a menudo cedo mi postura y sigo la opinión de la otra persona." },
  { id:24, section:"C", key:"accommodate", ko:"관계 유지를 위해 내가 손해 보는 것도 괜찮다고 생각한다.",               en:"I think it's okay to lose something for the sake of maintaining the relationship.",      ja:"関係を維持するために、自分が損をしても構わないと思う。",                       zh:"我认为为了维持关系，自己吃点亏也没关系。",                                 fr:"Je pense qu'il est acceptable de perdre quelque chose pour préserver la relation.",                                 es:"Creo que está bien perder algo con tal de mantener la relación." },
  { id:25, section:"C", key:"avoid",       ko:"갈등이 생기면 일단 그 상황에서 벗어나거나 시간이 해결해주길 기다린다.",    en:"When conflict arises, I tend to step away or wait for time to resolve it.",             ja:"対立が生じると、その状況から離れたり、時間が解決してくれるのを待つ傾向がある。", zh:"发生冲突时，我倾向于先离开那个状况，或等待时间来解决。",                   fr:"Quand un conflit survient, j'ai tendance à m'éloigner ou à attendre que le temps résolve les choses.",              es:"Cuando surge un conflicto, tiendo a alejarme o esperar a que el tiempo lo resuelva." },
  { id:26, section:"C", key:"avoid",       ko:"갈등 주제를 직접 다루기보다 화제를 돌리거나 무시하는 편이다.",            en:"I tend to change the subject or ignore conflict rather than addressing it directly.",    ja:"対立の話題を直接扱うより、話題を変えたり無視したりする傾向がある。",           zh:"比起直接处理冲突话题，我更倾向于转移话题或忽略它。",                       fr:"Plutôt que d'aborder directement un sujet de conflit, j'ai tendance à changer de sujet ou à l'ignorer.",            es:"En lugar de abordar directamente un tema conflictivo, tiendo a cambiar de tema o ignorarlo." },
  { id:27, section:"C", key:"compete",     ko:"갈등 시 내 입장이 옳다고 생각하며 관철시키려는 경향이 있다.",             en:"In conflict, I tend to believe my position is right and try to prevail.",               ja:"対立の際、自分の立場が正しいと考えて貫こうとする傾向がある。",                 zh:"发生冲突时，我倾向于认为自己的立场是对的，并努力坚持到底。",               fr:"En cas de conflit, j'ai tendance à croire que ma position est la bonne et à essayer de l'imposer.",                es:"En un conflicto, tiendo a creer que mi postura es la correcta y trato de imponerla." },
  { id:28, section:"C", key:"compete",     ko:"협상에서 최선의 결과를 얻기 위해 강하게 주장하는 것이 필요하다.",          en:"Strongly asserting myself is necessary to get the best outcome in negotiations.",        ja:"交渉で最善の結果を得るためには、強く主張することが必要だ。",                   zh:"在谈判中，强烈地表达自己的主张是获得最佳结果所必需的。",                   fr:"S'affirmer fermement est nécessaire pour obtenir le meilleur résultat dans une négociation.",                       es:"Afirmarme con fuerza es necesario para obtener el mejor resultado en una negociación." },
];

// ─── Result Descriptions ──────────────────────────────────────────────────────
const ATTACH_DESC: Record<AttachType, Record<Lang, { name:string; desc:string; tip:string }>> = {
  secure:      { ko:{name:"안정 애착",      desc:"관계에서 자연스러운 신뢰와 편안함을 느낍니다. 갈등도 대화로 해결할 수 있다는 믿음이 있습니다.",        tip:"현재의 안정감을 유지하며 파트너에게도 안전한 기반이 되어주세요."},
                 en:{name:"Secure",         desc:"You feel natural trust and comfort in relationships and believe conflicts can be resolved through dialogue.", tip:"Maintain your current stability and be a secure base for your partner."},
                 ja:{name:"安定型",         desc:"関係で自然な信頼と安心感を覚えます。対立も対話で解決できるという信念があります。",               tip:"現在の安定感を保ち、パートナーにとっても安全な基盤になりましょう。"},
                 zh:{name:"安全型依恋",     desc:"你在关系中感受到自然的信任与自在，相信冲突也能通过对话解决。",                                   tip:"保持现在的安全感，也为伴侣提供一个可靠的依靠。"},
                 fr:{name:"Sécurisant",     desc:"Vous ressentez une confiance et un confort naturels dans les relations, et croyez que les conflits peuvent être résolus par le dialogue.", tip:"Maintenez votre stabilité actuelle et soyez une base sûre pour votre partenaire."},
                 es:{name:"Seguro",         desc:"Sientes confianza y comodidad naturales en las relaciones, y crees que los conflictos se pueden resolver mediante el diálogo.", tip:"Mantén tu estabilidad actual y sé una base segura para tu pareja."} },
  anxious:     { ko:{name:"불안 애착",      desc:"파트너의 애정을 끊임없이 확인하고 싶은 욕구가 강합니다. 버려짐에 대한 두려움이 클 수 있습니다.",       tip:"자기 자신에게 안정감의 근원을 찾는 연습을 해보세요."},
                 en:{name:"Anxious",        desc:"You have a strong need to constantly confirm your partner's affection and may have a strong fear of abandonment.", tip:"Practice finding the source of security within yourself."},
                 ja:{name:"不安型",         desc:"パートナーの愛情を絶えず確認したい欲求が強く、見捨てられることへの恐れが大きい場合があります。", tip:"自分自身に安定感の源を見つける練習をしてみましょう。"},
                 zh:{name:"焦虑型依恋",     desc:"你有强烈的需求不断确认伴侣的爱，可能对被抛弃有较大的恐惧。",                                     tip:"试着练习从自身寻找安全感的来源。"},
                 fr:{name:"Anxieux",        desc:"Vous avez un fort besoin de confirmer constamment l'affection de votre partenaire et pouvez avoir une peur intense de l'abandon.", tip:"Entraînez-vous à trouver en vous-même la source de votre sécurité."},
                 es:{name:"Ansioso",        desc:"Tienes una fuerte necesidad de confirmar constantemente el cariño de tu pareja y puedes tener un miedo intenso al abandono.", tip:"Practica encontrar en ti mismo(a) la fuente de la seguridad."} },
  avoidant:    { ko:{name:"회피 애착",      desc:"친밀감이 깊어질수록 불편함을 느끼고 독립성을 지키려는 경향이 강합니다.",                            tip:"감정 표현이 약점이 아닌 강함의 일부임을 기억하세요."},
                 en:{name:"Avoidant",       desc:"The deeper the intimacy, the more discomfort you feel, with a strong tendency to maintain independence.",   tip:"Remember that expressing emotions is not weakness but part of strength."},
                 ja:{name:"回避型",         desc:"親密さが深まるほど不快感を感じ、独立性を保とうとする傾向が強い。",                                   tip:"感情表現は弱さではなく、強さの一部であることを覚えておきましょう。"},
                 zh:{name:"回避型依恋",     desc:"亲密感越深，你越容易感到不适，并倾向于强烈地维护独立性。",                                       tip:"记住，表达情感不是软弱，而是力量的一部分。"},
                 fr:{name:"Évitant",        desc:"Plus l'intimité s'approfondit, plus vous ressentez d'inconfort, avec une forte tendance à préserver votre indépendance.", tip:"Rappelez-vous qu'exprimer ses émotions n'est pas une faiblesse mais une force."},
                 es:{name:"Evitativo",      desc:"Cuanto más profunda es la intimidad, más incomodidad sientes, con una fuerte tendencia a proteger tu independencia.", tip:"Recuerda que expresar tus emociones no es debilidad, sino parte de tu fortaleza."} },
  disorganized:{ ko:{name:"혼란 애착",      desc:"친밀함을 원하면서도 두려운 양가적 감정을 경험합니다. 관계에서 예측 불가능한 패턴이 나타날 수 있습니다.", tip:"전문가의 도움을 통해 내면의 패턴을 이해하는 것이 큰 도움이 됩니다."},
                 en:{name:"Disorganized",   desc:"You experience ambivalent feelings of wanting closeness while also fearing it. Unpredictable patterns may appear in relationships.", tip:"Professional guidance can greatly help you understand your internal patterns."},
                 ja:{name:"混乱型",         desc:"親密さを望みながら恐れるという両価的な感情を経験します。関係で予測不可能なパターンが現れることがあります。", tip:"専門家の助けを借りて内面のパターンを理解することが大いに役立ちます。"},
                 zh:{name:"混乱型依恋",     desc:"你会同时体验到渴望亲密又害怕亲密的矛盾情感，关系中可能出现难以预测的模式。",                     tip:"借助专业人士的帮助来理解自己内在的模式会非常有帮助。"},
                 fr:{name:"Désorganisé",    desc:"Vous vivez des sentiments ambivalents, désirant la proximité tout en la craignant. Des schémas imprévisibles peuvent apparaître dans vos relations.", tip:"Un accompagnement professionnel peut grandement vous aider à comprendre vos schémas intérieurs."},
                 es:{name:"Desorganizado",  desc:"Experimentas sentimientos ambivalentes: deseas la cercanía y a la vez la temes. Pueden aparecer patrones impredecibles en tus relaciones.", tip:"La orientación profesional puede ayudarte enormemente a comprender tus patrones internos."} },
};

const LOVELANG_DESC: Record<LoveLang, Record<Lang, { name:string; desc:string }>> = {
  words:  { ko:{name:"인정의 말",      desc:"칭찬과 격려, 사랑의 말이 가장 큰 에너지를 줍니다. 언어적 표현이 풍부한 환경에서 행복합니다."},      en:{name:"Words of Affirmation", desc:"Compliments, encouragement, and words of love energize you most."},         ja:{name:"肯定の言葉",     desc:"褒め言葉、励まし、愛の言葉が最もエネルギーをくれます。"},
          zh:{name:"肯定的言语",      desc:"称赞、鼓励和爱的话语给你带来最大的能量，你在语言表达丰富的环境中感到幸福。"},                        fr:{name:"Paroles valorisantes", desc:"Les compliments, les encouragements et les mots d'amour vous donnent le plus d'énergie."}, es:{name:"Palabras de afirmación", desc:"Los cumplidos, el ánimo y las palabras de amor son lo que más energía te dan."} },
  acts:   { ko:{name:"봉사 행위",      desc:"파트너의 실질적인 도움과 배려가 사랑으로 느껴집니다. 말보다 행동을 중요시합니다."},                    en:{name:"Acts of Service",      desc:"Your partner's practical help and care feel like love to you. You value action over words."}, ja:{name:"奉仕の行為",     desc:"パートナーの実質的な助けと配慮が愛として感じられます。"},
          zh:{name:"服务行为",        desc:"伴侣切实的帮助和关怀让你感受到爱，你更重视行动而非言语。"},                                          fr:{name:"Services rendus",      desc:"L'aide concrète et l'attention de votre partenaire vous font sentir aimé(e). Vous valorisez l'action plus que les mots."}, es:{name:"Actos de servicio", desc:"La ayuda concreta y el cuidado de tu pareja se sienten como amor para ti. Valoras la acción más que las palabras."} },
  gifts:  { ko:{name:"선물",          desc:"나를 생각하며 선택한 선물이나 이벤트가 관계에 의미를 더해줍니다."},                                    en:{name:"Receiving Gifts",      desc:"Gifts and events chosen with you in mind add meaning to the relationship."},  ja:{name:"贈り物",         desc:"あなたのことを考えて選ばれたプレゼントやイベントが関係に意味を加えます。"},
          zh:{name:"礼物",            desc:"特意为你挑选的礼物或活动会为关系增添意义。"},                                                        fr:{name:"Cadeaux reçus",        desc:"Les cadeaux et événements choisis en pensant à vous ajoutent du sens à la relation."}, es:{name:"Recibir regalos", desc:"Los regalos y eventos elegidos pensando en ti le dan significado a la relación."} },
  time:   { ko:{name:"함께하는 시간",  desc:"온전히 집중하며 함께하는 시간이 가장 소중합니다. 산만한 주의는 상처가 됩니다."},                        en:{name:"Quality Time",         desc:"Time spent fully focused together is what you treasure most."},              ja:{name:"充実した時間",   desc:"完全に集中して一緒に過ごす時間が最も大切です。"},
          zh:{name:"共度时光",        desc:"全心投入、专注共处的时间对你而言最珍贵，心不在焉会让你受伤。"},                                      fr:{name:"Moments de qualité",   desc:"Le temps passé pleinement concentré ensemble est ce que vous chérissez le plus."}, es:{name:"Tiempo de calidad", desc:"El tiempo que pasan juntos con plena atención es lo que más valoras."} },
  touch:  { ko:{name:"신체 접촉",     desc:"포옹, 손잡기 등 신체적 스킨십이 가장 강력한 감정적 연결을 만들어냅니다."},                              en:{name:"Physical Touch",       desc:"Physical touch like hugs and holding hands creates the strongest emotional connection."}, ja:{name:"身体的接触",     desc:"ハグや手をつなぐなどの身体的スキンシップが最強の感情的つながりを生み出します。"},
          zh:{name:"身体接触",        desc:"拥抱、牵手等身体上的亲密接触创造出最强烈的情感联系。"},                                              fr:{name:"Toucher physique",     desc:"Le contact physique comme les câlins et se tenir la main crée la connexion émotionnelle la plus forte."}, es:{name:"Contacto físico", desc:"El contacto físico como los abrazos y tomarse de la mano crea la conexión emocional más fuerte."} },
};

const CONFLICT_DESC: Record<ConflictStyle, Record<Lang, { name:string; desc:string; tip:string }>> = {
  collaborate: { ko:{name:"협력형",  desc:"갈등의 근본 원인을 파악하고 모두가 만족하는 해결책을 추구합니다.",              tip:"최선의 갈등 해결 스타일이지만 항상 가능한 것은 아닙니다. 때로는 타협도 필요합니다."},
                 en:{name:"Collaborative", desc:"You seek to understand the root cause and find solutions that satisfy everyone.", tip:"This is the best conflict style, but not always possible — sometimes compromise is needed."},
                 ja:{name:"協力型",  desc:"対立の根本原因を把握し、全員が満足できる解決策を追求します。",                  tip:"最善の対立解決スタイルですが、常に可能とは限りません。時には妥協も必要です。"},
                 zh:{name:"协作型",  desc:"你会找出冲突的根本原因，并追求让所有人都满意的解决方案。",                      tip:"这是最理想的冲突解决方式，但并非总能实现——有时也需要妥协。"},
                 fr:{name:"Collaboratif", desc:"Vous cherchez à comprendre la cause profonde et à trouver des solutions qui satisfont tout le monde.", tip:"C'est le meilleur style de résolution de conflit, mais pas toujours possible — parfois un compromis est nécessaire."},
                 es:{name:"Colaborativo", desc:"Buscas comprender la causa raíz y encontrar soluciones que satisfagan a todos.", tip:"Este es el mejor estilo de resolución de conflictos, pero no siempre es posible: a veces se necesita compromiso."} },
  compromise:  { ko:{name:"타협형",  desc:"서로 양보하여 현실적인 중간 해결책을 찾습니다.",                            tip:"효율적이지만 양측 모두 완전히 만족하지 못할 수 있습니다."},
                 en:{name:"Compromising", desc:"You find a realistic middle ground through mutual concession.",               tip:"Efficient, but both sides may not be fully satisfied."},
                 ja:{name:"妥協型",  desc:"互いに譲歩して現実的な中間解決策を見つけます。",                              tip:"効率的ですが、双方が完全に満足できないこともあります。"},
                 zh:{name:"妥协型",  desc:"你会通过相互让步，找到现实可行的折中方案。",                                  tip:"高效，但双方可能都无法完全满意。"},
                 fr:{name:"Compromis", desc:"Vous trouvez un terrain d'entente réaliste grâce à des concessions mutuelles.", tip:"Efficace, mais les deux parties peuvent ne pas être totalement satisfaites."},
                 es:{name:"Comprometido", desc:"Encuentras un punto medio realista mediante concesiones mutuas.", tip:"Eficiente, pero es posible que ninguna de las partes quede totalmente satisfecha."} },
  accommodate: { ko:{name:"수용형",  desc:"관계 유지를 위해 자신의 주장을 양보하는 경향이 있습니다.",                    tip:"자신의 필요를 표현하는 연습이 건강한 관계를 만듭니다."},
                 en:{name:"Accommodating", desc:"You tend to give up your position to maintain the relationship.",           tip:"Practicing expressing your own needs creates healthier relationships."},
                 ja:{name:"受容型",  desc:"関係を維持するために自分の主張を譲る傾向があります。",                          tip:"自分のニーズを表現する練習が健全な関係を作ります。"},
                 zh:{name:"顺应型",  desc:"你倾向于为了维持关系而放弃自己的主张。",                                        tip:"练习表达自己的需求会带来更健康的关系。"},
                 fr:{name:"Accommodant", desc:"Vous avez tendance à abandonner votre position pour préserver la relation.", tip:"Pratiquer l'expression de vos propres besoins crée des relations plus saines."},
                 es:{name:"Complaciente", desc:"Tiendes a ceder tu postura para mantener la relación.", tip:"Practicar la expresión de tus propias necesidades crea relaciones más sanas."} },
  avoid:       { ko:{name:"회피형",  desc:"갈등 상황에서 직접 대면보다 시간이 해결해주길 기다리는 경향이 있습니다.",       tip:"피하는 것은 일시적 해결책. 핵심 문제는 결국 반드시 다뤄야 합니다."},
                 en:{name:"Avoiding", desc:"You tend to wait for time to resolve conflict rather than direct confrontation.",   tip:"Avoiding is a temporary fix. Core issues must ultimately be addressed."},
                 ja:{name:"回避型",  desc:"対立状況で直接対面するより、時間が解決してくれるのを待つ傾向があります。",       tip:"回避は一時的な解決策。核心問題は最終的に必ず対処しなければなりません。"},
                 zh:{name:"回避型",  desc:"在冲突情境下，你倾向于等待时间解决，而不是直接面对。",                          tip:"回避只是暂时的解决办法，核心问题终究需要面对。"},
                 fr:{name:"Évitant", desc:"Vous avez tendance à attendre que le temps résolve le conflit plutôt que de l'affronter directement.", tip:"Éviter n'est qu'une solution temporaire. Les problèmes de fond doivent finalement être traités."},
                 es:{name:"Evitativo", desc:"Tiendes a esperar a que el tiempo resuelva el conflicto en lugar de enfrentarlo directamente.", tip:"Evitar es una solución temporal. Los problemas de fondo finalmente deben abordarse."} },
  compete:     { ko:{name:"경쟁형",  desc:"자신의 입장을 관철시키는 것이 중요합니다. 강한 주장과 결단력이 특징입니다.",     tip:"승리보다 관계가 중요할 때가 많습니다. 언제 양보할지를 배우세요."},
                 en:{name:"Competing", desc:"Prevailing with your position is important. Strong assertion and decisiveness are your hallmarks.", tip:"Relationships matter more than winning. Learn when to concede."},
                 ja:{name:"競争型",  desc:"自分の立場を貫くことが重要です。強い主張と決断力が特徴です。",                   tip:"勝利より関係が重要な場面も多いです。いつ譲るかを学びましょう。"},
                 zh:{name:"竞争型",  desc:"坚持自己的立场对你而言很重要，你以强烈的主张和果断著称。",                      tip:"关系往往比输赢更重要，学会何时该让步。"},
                 fr:{name:"Compétitif", desc:"Défendre votre position est important pour vous. Une forte assertivité et une grande décision vous caractérisent.", tip:"La relation compte souvent plus que la victoire. Apprenez quand céder."},
                 es:{name:"Competitivo", desc:"Defender tu postura es importante para ti. Una fuerte asertividad y determinación te caracterizan.", tip:"La relación a menudo importa más que ganar. Aprende cuándo ceder."} },
};

const UI_TEXT: Record<Lang, {
  title: string; subtitle: string;
  sections: { A: string; B: string; C: string };
  progress: (n: number, t: number) => string;
  scale: string[];
  resultTitle: string;
  attachLabel: string; loveLabel: string; conflictLabel: string;
  retryBtn: string; nextBtn: string; prevBtn: string; submitBtn: string; startBtn: string;
}> = {
  ko: { title:"통합 연애 프로파일러", subtitle:"애착유형 · 사랑언어 · 갈등방식으로 나의 연애 스타일을 분석합니다",
    sections:{ A:"섹션 A: 애착 유형 (8문항)", B:"섹션 B: 사랑의 언어 (10문항)", C:"섹션 C: 갈등 방식 (10문항)" },
    progress:(n:number,t:number)=>`${n}/${t}`,
    scale:["전혀 아님","아님","보통","그렇다","매우 그렇다"],
    resultTitle:"나의 연애 프로필",
    attachLabel:"애착 유형", loveLabel:"주요 사랑의 언어", conflictLabel:"갈등 방식",
    retryBtn:"다시 테스트", nextBtn:"다음", prevBtn:"이전", submitBtn:"결과 보기", startBtn:"시작하기 →",
  },
  en: { title:"Love Profile Test", subtitle:"Analyze your relationship style through Attachment · Love Language · Conflict Style",
    sections:{ A:"Section A: Attachment Style (8 items)", B:"Section B: Love Language (10 items)", C:"Section C: Conflict Style (10 items)" },
    progress:(n:number,t:number)=>`${n}/${t}`,
    scale:["Not at all","Slightly","Moderate","Mostly","Very much"],
    resultTitle:"My Love Profile",
    attachLabel:"Attachment Style", loveLabel:"Primary Love Language", conflictLabel:"Conflict Style",
    retryBtn:"Retake", nextBtn:"Next", prevBtn:"Back", submitBtn:"See Results", startBtn:"Start →",
  },
  ja: { title:"統合恋愛プロファイラー", subtitle:"愛着タイプ・愛の言語・葛藤スタイルであなたの恋愛スタイルを分析します",
    sections:{ A:"セクションA：愛着タイプ（8問）", B:"セクションB：愛の言語（10問）", C:"セクションC：葛藤スタイル（10問）" },
    progress:(n:number,t:number)=>`${n}/${t}`,
    scale:["全くそう思わない","そう思わない","普通","そう思う","非常にそう思う"],
    resultTitle:"私の恋愛プロフィール",
    attachLabel:"愛着タイプ", loveLabel:"主な愛の言語", conflictLabel:"葛藤スタイル",
    retryBtn:"もう一度", nextBtn:"次へ", prevBtn:"前へ", submitBtn:"結果を見る", startBtn:"始める →",
  },
  zh: { title:"综合恋爱剖析师", subtitle:"通过依恋类型・爱之语言・冲突方式来分析你的恋爱风格",
    sections:{ A:"第A部分：依恋类型（8题）", B:"第B部分：爱之语言（10题）", C:"第C部分：冲突方式（10题）" },
    progress:(n:number,t:number)=>`${n}/${t}`,
    scale:["完全不符合","不符合","一般","符合","非常符合"],
    resultTitle:"我的恋爱档案",
    attachLabel:"依恋类型", loveLabel:"主要爱之语言", conflictLabel:"冲突方式",
    retryBtn:"重新测试", nextBtn:"下一步", prevBtn:"上一步", submitBtn:"查看结果", startBtn:"开始 →",
  },
  fr: { title:"Profileur amoureux intégré", subtitle:"Analysez votre style relationnel à travers l'Attachement, le Langage de l'amour et le Style de conflit",
    sections:{ A:"Section A : Style d'attachement (8 questions)", B:"Section B : Langage de l'amour (10 questions)", C:"Section C : Style de conflit (10 questions)" },
    progress:(n:number,t:number)=>`${n}/${t}`,
    scale:["Pas du tout","Un peu","Modérément","Plutôt","Tout à fait"],
    resultTitle:"Mon profil amoureux",
    attachLabel:"Style d'attachement", loveLabel:"Langage de l'amour principal", conflictLabel:"Style de conflit",
    retryBtn:"Recommencer", nextBtn:"Suivant", prevBtn:"Précédent", submitBtn:"Voir les résultats", startBtn:"Commencer →",
  },
  es: { title:"Perfilador de amor integrado", subtitle:"Analiza tu estilo de relación a través del Apego, el Lenguaje del amor y el Estilo de conflicto",
    sections:{ A:"Sección A: Estilo de apego (8 preguntas)", B:"Sección B: Lenguaje del amor (10 preguntas)", C:"Sección C: Estilo de conflicto (10 preguntas)" },
    progress:(n:number,t:number)=>`${n}/${t}`,
    scale:["Nada","Un poco","Moderado","Bastante","Totalmente"],
    resultTitle:"Mi perfil amoroso",
    attachLabel:"Estilo de apego", loveLabel:"Lenguaje del amor principal", conflictLabel:"Estilo de conflicto",
    retryBtn:"Repetir", nextBtn:"Siguiente", prevBtn:"Anterior", submitBtn:"Ver resultados", startBtn:"Comenzar →",
  },
};

function calcScores(answers: Record<number,number>) {
  const attach: Record<AttachType,number> = {secure:0,anxious:0,avoidant:0,disorganized:0};
  const love:   Record<LoveLang,number>   = {words:0,acts:0,gifts:0,time:0,touch:0};
  const conf:   Record<ConflictStyle,number> = {collaborate:0,compromise:0,accommodate:0,avoid:0,compete:0};

  for (const q of QUESTIONS) {
    const score = answers[q.id] ?? 3;
    if (q.section === "A") attach[q.key as AttachType] += score;
    if (q.section === "B") love[q.key as LoveLang] += score;
    if (q.section === "C") conf[q.key as ConflictStyle] += score;
  }

  const topAttach = (Object.entries(attach) as [AttachType,number][]).sort((a,b)=>b[1]-a[1])[0][0];
  const topLove   = (Object.entries(love)   as [LoveLang,number][]).sort((a,b)=>b[1]-a[1])[0][0];
  const topConf   = (Object.entries(conf)   as [ConflictStyle,number][]).sort((a,b)=>b[1]-a[1])[0][0];

  return { attach: topAttach, love: topLove, conflict: topConf };
}

const ATTACH_EMOJI: Record<AttachType,string> = {secure:"🔐",anxious:"😰",avoidant:"🚪",disorganized:"🌀"};
const LOVE_EMOJI:   Record<LoveLang,string>   = {words:"💬",acts:"🛠️",gifts:"🎁",time:"⏰",touch:"🤝"};
const CONF_EMOJI:   Record<ConflictStyle,string> = {collaborate:"🤝",compromise:"⚖️",accommodate:"🕊️",avoid:"🏃",compete:"🥊"};

const SUPPORTED_LOCALES: Lang[] = ["ko", "en", "ja", "zh", "fr", "es"];

export default function LoveProfileTest({ locale }: Props) {

  const lang: Lang = SUPPORTED_LOCALES.includes(locale as Lang) ? (locale as Lang) : "en";
  const ui = UI_TEXT[lang];
  const total = QUESTIONS.length;

  const [answers, setAnswers] = useState<Record<number,number>>({});
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<{attach:AttachType; love:LoveLang; conflict:ConflictStyle}|null>(null);
  useRecordFinishedTest({ testId: "love-profile", title: "LoveProfileTest", finished: Boolean(result) });

  const current = step - 1;
  const q = QUESTIONS[current];
  const answered = Object.keys(answers).length;
  const progress = Math.round((answered / total) * 100);

  function answer(score: number) {
    const newAns = { ...answers, [q.id]: score };
    setAnswers(newAns);
    if (step < total) setStep(s => s + 1);
    else { setResult(calcScores(newAns)); setStep(total + 1); }
  }

  function submit() {
    const filled = { ...answers };
    for (const qq of QUESTIONS) if (!(qq.id in filled)) filled[qq.id] = 3;
    setResult(calcScores(filled));
    setStep(total + 1);
  }

  function reset() { setAnswers({}); setStep(0); setResult(null); }

  if (step === 0) {
    return (
      <div className="max-w-xl mx-auto p-4 text-center">
        <div className="text-4xl mb-3">💑</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{ui.title}</h2>
        <p className="text-sm text-gray-500 mb-5">{ui.subtitle}</p>
        <div className="space-y-2 text-left mb-5">
          {(["A","B","C"] as const).map(s => (
            <div key={s} className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700">
              {s === "A" ? "🔐" : s === "B" ? "💬" : "⚡"} {ui.sections[s]}
            </div>
          ))}
        </div>
        <button
          onClick={() => setStep(1)}
          className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold rounded-2xl shadow-md hover:shadow-lg active:scale-95 transition-all"
        >
          {ui.startBtn}
        </button>
      </div>
    );
  }

  if (result) {
    const ad = ATTACH_DESC[result.attach][lang];
    const ld = LOVELANG_DESC[result.love][lang];
    const cd = CONFLICT_DESC[result.conflict][lang];
    return (
      <div className="max-w-xl mx-auto p-4 space-y-4">
        <h2 className="text-xl font-bold text-center text-gray-800">{ui.resultTitle}</h2>

        {/* Attach */}
        <div className="bg-surface-subtle border border-green-100 rounded-2xl p-4">
          <p className="text-xs font-semibold text-green-600 mb-1">🔐 {ui.attachLabel}</p>
          <p className="font-bold text-green-800 text-lg">{ATTACH_EMOJI[result.attach]} {ad.name}</p>
          <p className="text-sm text-green-700 mt-1">{ad.desc}</p>
          <p className="text-xs text-green-600 mt-2 italic">💡 {ad.tip}</p>
        </div>

        {/* Love Language */}
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">
          <p className="text-xs font-semibold text-rose-600 mb-1">💝 {ui.loveLabel}</p>
          <p className="font-bold text-rose-800 text-lg">{LOVE_EMOJI[result.love]} {ld.name}</p>
          <p className="text-sm text-rose-700 mt-1">{ld.desc}</p>
        </div>

        {/* Conflict */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <p className="text-xs font-semibold text-amber-600 mb-1">⚡ {ui.conflictLabel}</p>
          <p className="font-bold text-amber-800 text-lg">{CONF_EMOJI[result.conflict]} {cd.name}</p>
          <p className="text-sm text-amber-700 mt-1">{cd.desc}</p>
          <p className="text-xs text-amber-600 mt-2 italic">💡 {cd.tip}</p>
        </div>

        <button onClick={reset} className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          {ui.retryBtn}
        </button>
      </div>
    );
  }

  const sectionLabel = q?.section ? ui.sections[q.section] : "";
  const qText = q ? q[lang] : "";

  return (
    <Questionnaire
      title={ui.title}
      subtitle={sectionLabel}
      question={qText}
      questionLabel={ui.progress(step, total)}
      progress={progress}
      options={ui.scale.map((label, i) => ({ label, value: i + 1 }))}
      selectedValue={q ? answers[q.id] : undefined}
      previousLabel={ui.prevBtn}
      onPrevious={step > 1 ? () => setStep(s => s - 1) : undefined}
      onSelect={answer}
    />
  );
}
