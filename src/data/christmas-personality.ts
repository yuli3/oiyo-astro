// 크리스마스 성격 테스트 (2026-11-21). 재미용 자기 이해 검사, 진단 아님.
// 유형은 특정 작품 캐릭터가 아닌 일반 상징(산타·순록·눈사람·생강쿠키·트리)으로 만든 오리지널이에요.
export type XmasType = "santa" | "reindeer" | "snowman" | "gingerbread" | "tree";
export type XmasLang = "ko" | "en" | "ja" | "zh" | "fr" | "es";
export const XMAS_TYPES: XmasType[] = ["santa", "reindeer", "snowman", "gingerbread", "tree"];

type Q = { text: string; options: [string, XmasType][] };

export const XMAS_QUESTIONS: Record<XmasLang, Q[]> = {
  ko: [
    { text: "12월 초, 달력을 보면 가장 먼저 드는 생각은?", options: [["누구에게 무슨 선물을 줄까", "santa"], ["연말 모임 일정부터 잡자", "reindeer"], ["드디어 쉬는 날이 온다", "snowman"], ["이번엔 뭘 하고 놀지?", "gingerbread"], ["집을 어떻게 꾸밀까", "tree"]] },
    { text: "친구들과 크리스마스 파티를 한다면 나는?", options: [["모두에게 작은 선물을 챙겨 간다", "santa"], ["장소·시간·메뉴를 정리한다", "reindeer"], ["구석 소파에서 편하게 이야기한다", "snowman"], ["게임을 시작하고 분위기를 띄운다", "gingerbread"], ["조명과 테이블을 꾸민다", "tree"]] },
    { text: "받으면 가장 기쁜 선물은?", options: [["손편지가 들어 있는 선물", "santa"], ["오래 쓸 수 있는 실용템", "reindeer"], ["포근한 담요와 잠옷", "snowman"], ["예상 못 한 웃긴 선물", "gingerbread"], ["예쁜 오너먼트나 인테리어 소품", "tree"]] },
    { text: "눈이 펑펑 오는 크리스마스 아침, 나는?", options: [["가족에게 따뜻한 음료를 만들어 준다", "santa"], ["길이 막히기 전에 먼저 움직인다", "reindeer"], ["이불 속에서 창밖을 본다", "snowman"], ["바로 나가서 눈싸움을 한다", "gingerbread"], ["눈 오는 풍경을 사진으로 남긴다", "tree"]] },
    { text: "크리스마스 영화를 고른다면?", options: [["가족이 다시 모이는 따뜻한 이야기", "santa"], ["팀이 힘을 합치는 모험", "reindeer"], ["잔잔한 겨울 로맨스", "snowman"], ["말도 안 되게 웃긴 코미디", "gingerbread"], ["화면이 예쁜 뮤지컬", "tree"]] },
    { text: "연말에 친구가 고민을 털어놓으면?", options: [["끝까지 들어 주고 챙겨 준다", "santa"], ["해결 방법을 같이 찾는다", "reindeer"], ["옆에 있어 주며 쉬게 한다", "snowman"], ["기분 전환하러 데리고 나간다", "gingerbread"], ["분위기 좋은 곳으로 데려간다", "tree"]] },
    { text: "크리스마스 카드에 쓰고 싶은 말은?", options: [["올해 고마웠어, 내가 더 잘할게", "santa"], ["내년엔 같이 이거 해 보자", "reindeer"], ["푹 쉬고 따뜻하게 보내", "snowman"], ["메리 크리스마스! (웃긴 그림)", "gingerbread"], ["예쁜 스티커와 손글씨로 가득", "tree"]] },
    { text: "새해를 맞는 나의 방식은?", options: [["고마운 사람들에게 연락한다", "santa"], ["새 계획표를 만든다", "reindeer"], ["늦잠 자고 천천히 시작한다", "snowman"], ["카운트다운 파티에 간다", "gingerbread"], ["다이어리와 방을 새로 꾸민다", "tree"]] },
  ],
  en: [
    { text: "It’s early December. What’s your first thought?", options: [["What gift for whom?", "santa"], ["Lock in the holiday plans first", "reindeer"], ["Finally, some time off", "snowman"], ["What fun are we having this year?", "gingerbread"], ["How should I decorate?", "tree"]] },
    { text: "At a Christmas party with friends, you…", options: [["Bring a small gift for everyone", "santa"], ["Sort out the place, time and food", "reindeer"], ["Chat on the comfy sofa in the corner", "snowman"], ["Start the games and liven things up", "gingerbread"], ["Set up the lights and the table", "tree"]] },
    { text: "The gift that makes you happiest?", options: [["Anything with a handwritten note", "santa"], ["Something practical that lasts", "reindeer"], ["A soft blanket and pajamas", "snowman"], ["A surprise that makes you laugh", "gingerbread"], ["A pretty ornament or decor piece", "tree"]] },
    { text: "It’s snowing on Christmas morning. You…", options: [["Make warm drinks for everyone", "santa"], ["Head out before the roads jam", "reindeer"], ["Watch from under the covers", "snowman"], ["Run out for a snowball fight", "gingerbread"], ["Take photos of the snowy view", "tree"]] },
    { text: "Pick a Christmas movie.", options: [["A family coming back together", "santa"], ["A team-up adventure", "reindeer"], ["A quiet winter romance", "snowman"], ["A ridiculous comedy", "gingerbread"], ["A beautiful musical", "tree"]] },
    { text: "A friend opens up to you in December. You…", options: [["Listen to the end and look after them", "santa"], ["Work out a fix together", "reindeer"], ["Stay with them and let them rest", "snowman"], ["Take them out to clear their head", "gingerbread"], ["Take them somewhere lovely", "tree"]] },
    { text: "What goes in your Christmas card?", options: [["Thank you for this year", "santa"], ["Let’s do this together next year", "reindeer"], ["Rest well and stay warm", "snowman"], ["Merry Christmas! (plus a silly doodle)", "gingerbread"], ["Stickers and fancy lettering", "tree"]] },
    { text: "How do you start the new year?", options: [["Message the people I’m grateful for", "santa"], ["Make a fresh plan", "reindeer"], ["Sleep in and start slowly", "snowman"], ["Go to a countdown party", "gingerbread"], ["Redo my planner and my room", "tree"]] },
  ],
  ja: [
    { text: "12月のはじめ、カレンダーを見て最初に思うことは？", options: [["誰に何をプレゼントしよう", "santa"], ["忘年会の予定を先に決めよう", "reindeer"], ["やっと休める", "snowman"], ["今年は何をして遊ぼう？", "gingerbread"], ["部屋をどう飾ろう", "tree"]] },
    { text: "友だちとのクリスマスパーティーで、あなたは？", options: [["みんなに小さなプレゼントを用意する", "santa"], ["場所・時間・料理を段取りする", "reindeer"], ["すみのソファでのんびり話す", "snowman"], ["ゲームを始めて盛り上げる", "gingerbread"], ["ライトとテーブルを飾る", "tree"]] },
    { text: "いちばんうれしいプレゼントは？", options: [["手紙が添えてある贈り物", "santa"], ["長く使える実用品", "reindeer"], ["ふかふかの毛布とパジャマ", "snowman"], ["笑える意外なもの", "gingerbread"], ["かわいいオーナメントや雑貨", "tree"]] },
    { text: "雪のクリスマスの朝、あなたは？", options: [["家族に温かい飲み物をいれる", "santa"], ["道が混む前に動く", "reindeer"], ["布団の中から窓の外を見る", "snowman"], ["すぐ外に出て雪合戦", "gingerbread"], ["雪景色を写真に残す", "tree"]] },
    { text: "クリスマス映画を選ぶなら？", options: [["家族がまた集まる温かい話", "santa"], ["仲間と力を合わせる冒険", "reindeer"], ["静かな冬のロマンス", "snowman"], ["ありえないほど笑えるコメディ", "gingerbread"], ["映像がきれいなミュージカル", "tree"]] },
    { text: "年末に友だちが悩みを打ち明けたら？", options: [["最後まで聞いて気づかう", "santa"], ["一緒に解決策を探す", "reindeer"], ["そばにいて休ませる", "snowman"], ["気分転換に連れ出す", "gingerbread"], ["素敵な場所に連れて行く", "tree"]] },
    { text: "クリスマスカードに書きたいことは？", options: [["今年もありがとう", "santa"], ["来年はこれを一緒にやろう", "reindeer"], ["ゆっくり温かく過ごしてね", "snowman"], ["メリークリスマス！（変な絵つき）", "gingerbread"], ["シールと手書き文字でいっぱい", "tree"]] },
    { text: "新年の迎え方は？", options: [["お世話になった人に連絡する", "santa"], ["新しい計画表を作る", "reindeer"], ["寝坊してゆっくり始める", "snowman"], ["カウントダウンパーティーへ", "gingerbread"], ["手帳と部屋を新しくする", "tree"]] },
  ],
  zh: [
    { text: "十二月初看到日历，你第一个想到的是？", options: [["要送谁什么礼物", "santa"], ["先把年末聚会排好", "reindeer"], ["终于能休息了", "snowman"], ["今年玩点什么？", "gingerbread"], ["家里怎么布置", "tree"]] },
    { text: "和朋友开圣诞派对时，你会？", options: [["给每个人带一份小礼物", "santa"], ["安排地点、时间和吃的", "reindeer"], ["窝在角落沙发上聊天", "snowman"], ["带头玩游戏、炒热气氛", "gingerbread"], ["布置灯光和餐桌", "tree"]] },
    { text: "收到什么礼物最开心？", options: [["附手写卡片的礼物", "santa"], ["能用很久的实用物品", "reindeer"], ["柔软的毯子和睡衣", "snowman"], ["让人笑出来的惊喜", "gingerbread"], ["漂亮的挂饰或摆件", "tree"]] },
    { text: "圣诞早晨下大雪，你会？", options: [["给家人做热饮", "santa"], ["趁路还没堵先出门", "reindeer"], ["躲在被窝里看窗外", "snowman"], ["马上出去打雪仗", "gingerbread"], ["拍下雪景", "tree"]] },
    { text: "选一部圣诞电影？", options: [["一家人重新团聚的温暖故事", "santa"], ["伙伴齐心的冒险", "reindeer"], ["安静的冬日爱情", "snowman"], ["离谱的喜剧", "gingerbread"], ["画面很美的歌舞片", "tree"]] },
    { text: "年底朋友向你倾诉烦恼，你会？", options: [["听完并照顾对方", "santa"], ["一起找解决办法", "reindeer"], ["陪在身边让他休息", "snowman"], ["拉他出去散散心", "gingerbread"], ["带他去氛围好的地方", "tree"]] },
    { text: "圣诞卡上想写什么？", options: [["谢谢你这一年", "santa"], ["明年一起做这件事吧", "reindeer"], ["好好休息，注意保暖", "snowman"], ["圣诞快乐！（配搞笑涂鸦）", "gingerbread"], ["贴纸加漂亮手写字", "tree"]] },
    { text: "你怎么迎接新年？", options: [["联系想感谢的人", "santa"], ["做一份新计划", "reindeer"], ["睡个懒觉慢慢开始", "snowman"], ["去跨年倒数派对", "gingerbread"], ["换新手账、整理房间", "tree"]] },
  ],
  fr: [
    { text: "Début décembre, votre première pensée ?", options: [["Quel cadeau pour qui ?", "santa"], ["Caler d’abord les dates des fêtes", "reindeer"], ["Enfin du repos", "snowman"], ["On s’amuse comment cette année ?", "gingerbread"], ["Comment décorer la maison ?", "tree"]] },
    { text: "À une fête de Noël entre amis, vous…", options: [["Apportez un petit cadeau pour chacun", "santa"], ["Organisez le lieu, l’heure et le repas", "reindeer"], ["Discutez tranquillement sur le canapé", "snowman"], ["Lancez les jeux et l’ambiance", "gingerbread"], ["Installez les lumières et la table", "tree"]] },
    { text: "Le cadeau qui vous fait le plus plaisir ?", options: [["Un cadeau avec un mot écrit à la main", "santa"], ["Un objet utile qui dure", "reindeer"], ["Un plaid tout doux et un pyjama", "snowman"], ["Une surprise qui fait rire", "gingerbread"], ["Une jolie boule ou un objet déco", "tree"]] },
    { text: "Il neige le matin de Noël. Vous…", options: [["Préparez des boissons chaudes pour tous", "santa"], ["Partez avant les bouchons", "reindeer"], ["Regardez par la fenêtre, sous la couette", "snowman"], ["Filez faire une bataille de boules de neige", "gingerbread"], ["Photographiez le paysage enneigé", "tree"]] },
    { text: "Un film de Noël ?", options: [["Une famille qui se retrouve", "santa"], ["Une aventure en équipe", "reindeer"], ["Une romance d’hiver toute douce", "snowman"], ["Une comédie complètement folle", "gingerbread"], ["Une comédie musicale très belle", "tree"]] },
    { text: "En décembre, un ami se confie. Vous…", options: [["L’écoutez jusqu’au bout et prenez soin de lui", "santa"], ["Cherchez une solution ensemble", "reindeer"], ["Restez près de lui pour qu’il se repose", "snowman"], ["L’emmenez se changer les idées", "gingerbread"], ["L’emmenez dans un bel endroit", "tree"]] },
    { text: "Dans votre carte de Noël ?", options: [["Merci pour cette année", "santa"], ["L’an prochain, on fait ça ensemble", "reindeer"], ["Repose-toi bien, reste au chaud", "snowman"], ["Joyeux Noël ! (avec un dessin rigolo)", "gingerbread"], ["Des autocollants et une belle écriture", "tree"]] },
    { text: "Comment commencez-vous la nouvelle année ?", options: [["J’écris aux gens que je remercie", "santa"], ["Je fais un nouveau plan", "reindeer"], ["Grasse matinée et démarrage en douceur", "snowman"], ["Soirée du compte à rebours", "gingerbread"], ["Nouvel agenda, chambre rangée", "tree"]] },
  ],
  es: [
    { text: "Principios de diciembre. ¿Qué piensas primero?", options: [["¿Qué regalo para quién?", "santa"], ["Cerrar primero los planes de las fiestas", "reindeer"], ["Por fin, descanso", "snowman"], ["¿A qué jugamos este año?", "gingerbread"], ["¿Cómo decoro la casa?", "tree"]] },
    { text: "En una fiesta de Navidad con amigos, tú…", options: [["Llevas un detalle para cada uno", "santa"], ["Organizas sitio, hora y comida", "reindeer"], ["Charlas tranquilo en el sofá", "snowman"], ["Empiezas los juegos y animas", "gingerbread"], ["Pones las luces y la mesa", "tree"]] },
    { text: "¿El regalo que más te alegra?", options: [["Uno con una nota escrita a mano", "santa"], ["Algo práctico que dure", "reindeer"], ["Una manta suave y un pijama", "snowman"], ["Una sorpresa que te haga reír", "gingerbread"], ["Un adorno bonito para casa", "tree"]] },
    { text: "Nieva la mañana de Navidad. Tú…", options: [["Preparas bebidas calientes para todos", "santa"], ["Sales antes de que haya atasco", "reindeer"], ["Miras por la ventana desde la cama", "snowman"], ["Sales a una guerra de bolas de nieve", "gingerbread"], ["Haces fotos del paisaje nevado", "tree"]] },
    { text: "¿Una película de Navidad?", options: [["Una familia que vuelve a reunirse", "santa"], ["Una aventura en equipo", "reindeer"], ["Un romance de invierno tranquilo", "snowman"], ["Una comedia disparatada", "gingerbread"], ["Un musical precioso", "tree"]] },
    { text: "En diciembre, un amigo te cuenta un problema. Tú…", options: [["Lo escuchas hasta el final y lo cuidas", "santa"], ["Buscáis juntos una solución", "reindeer"], ["Te quedas a su lado para que descanse", "snowman"], ["Te lo llevas a despejarse", "gingerbread"], ["Lo llevas a un sitio bonito", "tree"]] },
    { text: "¿Qué escribes en tu tarjeta de Navidad?", options: [["Gracias por este año", "santa"], ["El año que viene hacemos esto juntos", "reindeer"], ["Descansa y abrígate", "snowman"], ["¡Feliz Navidad! (con un dibujo gracioso)", "gingerbread"], ["Pegatinas y letra bonita", "tree"]] },
    { text: "¿Cómo empiezas el año nuevo?", options: [["Escribo a quien quiero dar las gracias", "santa"], ["Hago un plan nuevo", "reindeer"], ["Duermo hasta tarde y empiezo despacio", "snowman"], ["Voy a una fiesta de cuenta atrás", "gingerbread"], ["Agenda nueva y cuarto ordenado", "tree"]] },
  ],
};

export interface XmasResult { emoji: string; title: string; tagline: string; description: string; gift: string; match: XmasType }

export const XMAS_RESULTS: Record<XmasType, Record<XmasLang, XmasResult>> = {
  santa: {
    ko: { emoji: "🎅", title: "산타형", tagline: "주는 기쁨이 가장 큰 사람", description: "누가 무엇을 좋아하는지 기억해 두었다가 꼭 챙겨요. 모두가 웃는 걸 보면 나도 행복해요. 올해는 나에게도 선물 하나를 꼭 주세요.", gift: "나에게 주는 선물: 혼자 쉬는 반나절", match: "snowman" },
    en: { emoji: "🎅", title: "The Santa", tagline: "Happiest when giving", description: "You remember what everyone likes and you never forget them. Seeing people smile is your favorite part. This year, give yourself a gift too.", gift: "Gift for yourself: half a day of doing nothing", match: "snowman" },
    ja: { emoji: "🎅", title: "サンタタイプ", tagline: "あげる喜びがいちばん", description: "誰が何を好きか覚えていて、必ず気づかいます。みんなの笑顔が自分の幸せ。今年は自分にもプレゼントを。", gift: "自分へのご褒美：ひとりで休む半日", match: "snowman" },
    zh: { emoji: "🎅", title: "圣诞老人型", tagline: "给予让你最快乐", description: "你记得每个人喜欢什么，从不忘记照顾大家。看到别人笑你就开心。今年也送自己一份礼物吧。", gift: "送给自己：半天什么都不做", match: "snowman" },
    fr: { emoji: "🎅", title: "Le Père Noël", tagline: "Heureux quand il donne", description: "Vous retenez ce que chacun aime et vous n’oubliez personne. Les sourires des autres font votre bonheur. Cette année, offrez-vous aussi un cadeau.", gift: "Cadeau pour vous : une demi-journée rien que pour vous", match: "snowman" },
    es: { emoji: "🎅", title: "El Papá Noel", tagline: "Feliz cuando regala", description: "Recuerdas lo que le gusta a cada uno y nunca te olvidas de nadie. Ver sonrisas es lo que más te gusta. Este año, regálate algo también.", gift: "Regalo para ti: media tarde sin hacer nada", match: "snowman" },
  },
  reindeer: {
    ko: { emoji: "🦌", title: "순록형", tagline: "모두를 목적지까지 데려가는 사람", description: "모임이 흐지부지되지 않는 건 당신 덕분이에요. 계획하고 이끄는 데 강하고 믿음직해요. 연말엔 계획 없는 하루도 하나 남겨 두세요.", gift: "나에게 주는 선물: 일정 없는 휴일", match: "gingerbread" },
    en: { emoji: "🦌", title: "The Reindeer", tagline: "Gets everyone there", description: "Plans happen because of you. You lead, organize and people rely on you. Leave one day in December with no plan at all.", gift: "Gift for yourself: a day with an empty calendar", match: "gingerbread" },
    ja: { emoji: "🦌", title: "トナカイタイプ", tagline: "みんなを目的地まで運ぶ人", description: "集まりが実現するのはあなたのおかげ。計画と段取りに強く、頼りにされます。年末は予定のない日も一日残して。", gift: "自分へのご褒美：予定ゼロの休日", match: "gingerbread" },
    zh: { emoji: "🦌", title: "驯鹿型", tagline: "带大家抵达目的地", description: "聚会能办成全靠你。你擅长计划和带头，大家都信赖你。年底也给自己留一天不做计划。", gift: "送给自己：没有日程的一天", match: "gingerbread" },
    fr: { emoji: "🦌", title: "Le Renne", tagline: "Il mène tout le monde à bon port", description: "Les fêtes ont lieu grâce à vous : vous organisez, vous guidez, on compte sur vous. Gardez une journée de décembre sans aucun programme.", gift: "Cadeau pour vous : une journée sans agenda", match: "gingerbread" },
    es: { emoji: "🦌", title: "El Reno", tagline: "Lleva a todos a destino", description: "Los planes salen gracias a ti: organizas, guías y todos confían en ti. Guarda un día de diciembre sin ningún plan.", gift: "Regalo para ti: un día sin agenda", match: "gingerbread" },
  },
  snowman: {
    ko: { emoji: "⛄", title: "눈사람형", tagline: "있는 것만으로 편안한 사람", description: "서두르지 않고 지금 이 순간을 즐겨요. 곁에 있으면 마음이 차분해진다는 말을 자주 들어요. 좋아하는 사람 한 명을 먼저 불러내 보세요.", gift: "나에게 주는 선물: 좋은 잠옷과 따뜻한 차", match: "santa" },
    en: { emoji: "⛄", title: "The Snowman", tagline: "Calm just by being there", description: "You don’t rush; you enjoy the moment. People feel settled around you. This year, be the one who invites a friend over first.", gift: "Gift for yourself: good pajamas and warm tea", match: "santa" },
    ja: { emoji: "⛄", title: "雪だるまタイプ", tagline: "そこにいるだけで落ち着く人", description: "急がず今を楽しみます。一緒にいると落ち着くとよく言われます。今年は好きな人をひとり、自分から誘ってみて。", gift: "自分へのご褒美：いいパジャマと温かいお茶", match: "santa" },
    zh: { emoji: "⛄", title: "雪人型", tagline: "待在身边就让人安心", description: "你不慌不忙，享受当下。大家常说和你在一起很放松。今年试着主动约一个喜欢的人。", gift: "送给自己：舒服的睡衣和热茶", match: "santa" },
    fr: { emoji: "⛄", title: "Le Bonhomme de neige", tagline: "Apaisant par sa simple présence", description: "Vous ne vous pressez pas, vous profitez de l’instant. On se sent bien près de vous. Cette année, invitez vous-même un ami.", gift: "Cadeau pour vous : un bon pyjama et un thé chaud", match: "santa" },
    es: { emoji: "⛄", title: "El Muñeco de nieve", tagline: "Da calma solo con estar", description: "No tienes prisa y disfrutas el momento. A tu lado la gente se siente tranquila. Este año, sé tú quien invite primero a un amigo.", gift: "Regalo para ti: un buen pijama y un té caliente", match: "santa" },
  },
  gingerbread: {
    ko: { emoji: "🍪", title: "생강쿠키형", tagline: "어디서든 웃음을 만드는 사람", description: "당신이 오면 분위기가 살아나요. 재미있는 아이디어가 끝없이 나와요. 신나게 논 다음 날을 위한 쉬는 시간도 챙기세요.", gift: "나에게 주는 선물: 처음 해 보는 체험 하나", match: "reindeer" },
    en: { emoji: "🍪", title: "The Gingerbread", tagline: "Makes fun wherever it goes", description: "The room lights up when you arrive, and the ideas keep coming. Plan a quiet day after the big night too.", gift: "Gift for yourself: one thing you’ve never tried", match: "reindeer" },
    ja: { emoji: "🍪", title: "ジンジャーブレッドタイプ", tagline: "どこでも笑いをつくる人", description: "あなたが来ると場が明るくなり、楽しいアイデアが止まりません。盛り上がった翌日の休みも忘れずに。", gift: "自分へのご褒美：初めての体験ひとつ", match: "reindeer" },
    zh: { emoji: "🍪", title: "姜饼人型", tagline: "走到哪里笑声到哪里", description: "你一来气氛就活跃，好点子源源不断。玩得尽兴后，也给第二天留点休息时间。", gift: "送给自己：一次从没试过的体验", match: "reindeer" },
    fr: { emoji: "🍪", title: "Le Pain d’épice", tagline: "Il met de la joie partout", description: "L’ambiance décolle quand vous arrivez, et les idées ne manquent jamais. Prévoyez aussi une journée calme après la fête.", gift: "Cadeau pour vous : une expérience jamais tentée", match: "reindeer" },
    es: { emoji: "🍪", title: "La Galleta de jengibre", tagline: "Pone alegría allá donde va", description: "El ambiente se anima cuando llegas y las ideas no se acaban. Reserva también un día tranquilo después de la fiesta.", gift: "Regalo para ti: una experiencia nueva", match: "reindeer" },
  },
  tree: {
    ko: { emoji: "🎄", title: "트리형", tagline: "평범한 날을 특별하게 꾸미는 사람", description: "작은 소품 하나로도 공간의 분위기를 바꿔요. 아름다운 것을 알아보는 눈이 있어요. 완벽하지 않아도 충분히 예쁘다는 걸 기억하세요.", gift: "나에게 주는 선물: 마음에 쏙 드는 머그잔", match: "santa" },
    en: { emoji: "🎄", title: "The Tree", tagline: "Turns ordinary days into special ones", description: "One small touch from you changes a whole room. You have an eye for beautiful things. Remember: it doesn’t need to be perfect to be lovely.", gift: "Gift for yourself: a mug you truly love", match: "santa" },
    ja: { emoji: "🎄", title: "ツリータイプ", tagline: "ふつうの日を特別にする人", description: "小物ひとつで空間の雰囲気を変えられます。美しいものを見つける目があります。完璧でなくても十分すてきです。", gift: "自分へのご褒美：お気に入りのマグカップ", match: "santa" },
    zh: { emoji: "🎄", title: "圣诞树型", tagline: "把平凡日子装点得特别", description: "一个小摆件就能改变整个空间的气氛，你很会发现美。记住，不完美也一样好看。", gift: "送给自己：一只真心喜欢的马克杯", match: "santa" },
    fr: { emoji: "🎄", title: "Le Sapin", tagline: "Il rend les jours ordinaires spéciaux", description: "Une petite touche de votre part transforme une pièce. Vous avez l’œil pour le beau. Rappelez-vous : pas besoin d’être parfait pour être joli.", gift: "Cadeau pour vous : un mug que vous adorez", match: "santa" },
    es: { emoji: "🎄", title: "El Árbol", tagline: "Convierte días normales en especiales", description: "Un pequeño detalle tuyo cambia toda una habitación. Tienes ojo para lo bonito. Recuerda: no hace falta que sea perfecto para ser precioso.", gift: "Regalo para ti: una taza que te encante", match: "santa" },
  },
};

/** 가장 많이 고른 유형. 동점이면 마지막 문항에 가까운 답이 이겨요(최근 선택 우선). */
export function xmasResult(votes: XmasType[]): XmasType {
  const counts = new Map<XmasType, number>(XMAS_TYPES.map((t) => [t, 0]));
  votes.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1));
  const max = Math.max(...counts.values());
  for (let i = votes.length - 1; i >= 0; i--) if (counts.get(votes[i]) === max) return votes[i];
  return "santa";
}
