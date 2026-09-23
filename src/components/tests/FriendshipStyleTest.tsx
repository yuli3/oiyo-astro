import { useState } from 'react'
import { useRecordFinishedTest } from '@/lib/user/use-record-finished-test'
import ShareResultButton from '../shared/ShareResultButton'

/**
 * 우정 스타일 — 친구 사이에서 내가 서는 자리.
 *
 * 2026-09-23 에 새로 세웠다. 옛 `ontology/traits/friendship-style` 이 다섯 유형과
 * 여섯 언어 자료를 갖고 있었지만 화면이 없어 죽은 코드였고, 정리 때 걷어냈다.
 * 유형의 뼈대(모험·웃음·살림·지지·생각)만 이어받고 문항과 문구는 여섯 언어로
 * 새로 썼다 — 옛 문구는 번역투가 섞여 있었다.
 *
 * 한 유형으로 자르지 않는다. 사람은 상황마다 다른 자리에 서므로 으뜸과 버금을
 * 함께 내고, 다섯의 비율을 그대로 보여 준다.
 */

type Style = 'adventurer' | 'entertainer' | 'organizer' | 'supporter' | 'thinker'
type Lang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'

const STYLES: Style[] = ['adventurer', 'entertainer', 'organizer', 'supporter', 'thinker']

const COLORS: Record<Style, string> = {
  adventurer: '#f97316',
  entertainer: '#eab308',
  organizer: '#3b82f6',
  supporter: '#22c55e',
  thinker: '#a855f7',
}

interface Question { text: string; options: string[] }
interface Result { emoji: string; title: string; tagline: string; description: string; strengths: string[]; watch: string[]; pairs: string }

const LABELS: Record<Lang, {
  title: string; subtitle: string; progress: (c: number, t: number) => string
  restart: string; share: string; shareMsg: string
  primary: string; secondary: string; mix: string
  strengths: string; watch: string; pairs: string; note: string
  styleNames: Record<Style, string>
}> = {
  ko: {
    title: '우정 스타일 검사', subtitle: '친구들 사이에서 나는 어떤 자리에 서 있나요?',
    progress: (c, t) => `${c} / ${t}`,
    restart: '다시 하기', share: '결과 공유', shareMsg: '내 우정 스타일은',
    primary: '으뜸 스타일', secondary: '버금 스타일', mix: '다섯 자리의 비율',
    strengths: '친구들이 기대는 점', watch: '조심할 점', pairs: '잘 맞는 자리',
    note: '한 사람이 한 자리만 맡지는 않아요. 모임과 시기에 따라 서는 자리가 달라져요.',
    styleNames: { adventurer: '모험가', entertainer: '분위기 메이커', organizer: '살림꾼', supporter: '지지자', thinker: '생각 친구' },
  },
  en: {
    title: 'Friendship style test', subtitle: 'Where do you stand among your friends?',
    progress: (c, t) => `${c} / ${t}`,
    restart: 'Retake', share: 'Share result', shareMsg: 'My friendship style is',
    primary: 'Main style', secondary: 'Second style', mix: 'How the five mix',
    strengths: 'What friends lean on', watch: 'Watch for', pairs: 'Goes well with',
    note: 'Nobody holds one place only. Where you stand shifts with the group and the season.',
    styleNames: { adventurer: 'Adventurer', entertainer: 'Spark', organizer: 'Organiser', supporter: 'Supporter', thinker: 'Thinking friend' },
  },
  ja: {
    title: '友情スタイル診断', subtitle: '友だちの中で、あなたはどの位置にいますか？',
    progress: (c, t) => `${c} / ${t}`,
    restart: 'もう一度', share: '結果を共有', shareMsg: '私の友情スタイルは',
    primary: '主なスタイル', secondary: '次のスタイル', mix: '五つの位置の割合',
    strengths: '友だちが頼るところ', watch: '気をつけたいこと', pairs: '合わせやすい相手',
    note: 'ひとりが一つの役だけを担うわけではありません。集まりや時期で立つ位置は変わります。',
    styleNames: { adventurer: '冒険役', entertainer: '盛り上げ役', organizer: 'まとめ役', supporter: '支え役', thinker: '考える友' },
  },
  zh: {
    title: '友情风格测验', subtitle: '在朋友里，你站在哪个位置？',
    progress: (c, t) => `${c} / ${t}`,
    restart: '重新测验', share: '分享结果', shareMsg: '我的友情风格是',
    primary: '主要风格', secondary: '次要风格', mix: '五个位置的比例',
    strengths: '朋友会靠你的地方', watch: '要留意的地方', pairs: '合得来的位置',
    note: '一个人不会只站一个位置。换个圈子、换个时期，位置就会变。',
    styleNames: { adventurer: '探路的', entertainer: '带气氛的', organizer: '张罗的', supporter: '撑着的', thinker: '陪你想的' },
  },
  fr: {
    title: 'Test du style d’amitié', subtitle: 'Quelle place occupez-vous parmi vos amis ?',
    progress: (c, t) => `${c} / ${t}`,
    restart: 'Recommencer', share: 'Partager le résultat', shareMsg: 'Mon style d’amitié est',
    primary: 'Style principal', secondary: 'Style secondaire', mix: 'Le mélange des cinq',
    strengths: 'Ce sur quoi vos amis s’appuient', watch: 'À surveiller', pairs: 'S’accorde bien avec',
    note: 'Personne ne tient une seule place. Elle change selon le groupe et la saison.',
    styleNames: { adventurer: 'Aventurier', entertainer: 'Étincelle', organizer: 'Organisateur', supporter: 'Soutien', thinker: 'Ami qui réfléchit' },
  },
  es: {
    title: 'Test de estilo de amistad', subtitle: '¿Qué lugar ocupas entre tus amigos?',
    progress: (c, t) => `${c} / ${t}`,
    restart: 'Repetir', share: 'Compartir resultado', shareMsg: 'Mi estilo de amistad es',
    primary: 'Estilo principal', secondary: 'Estilo secundario', mix: 'Cómo se mezclan los cinco',
    strengths: 'En qué se apoyan tus amigos', watch: 'Ten cuidado con', pairs: 'Encaja bien con',
    note: 'Nadie ocupa un solo lugar. Cambia según el grupo y la época.',
    styleNames: { adventurer: 'Aventurero', entertainer: 'Chispa', organizer: 'Organizador', supporter: 'Apoyo', thinker: 'Amigo que piensa' },
  },
}

/** 문항 12개. 선택지는 언제나 모험·웃음·살림·지지·생각 순서다. */
const QUESTIONS: Record<Lang, Question[]> = {
  ko: [
    { text: '오랜만에 친구들과 모이기로 했어요. 나는…', options: ['안 가본 곳으로 가자고 한다', '만나기도 전부터 분위기를 띄운다', '날짜·장소·예약을 정리한다', '다들 편한 시간에 맞춘다', '무엇을 하면 좋을지 곰곰 생각한다'] },
    { text: '친구가 힘든 일을 털어놨을 때 나는…', options: ['기분 전환할 일을 만들어 데리고 나간다', '웃겨서라도 숨통을 틔워 준다', '당장 필요한 걸 챙겨 준다', '끝까지 듣고 곁에 있어 준다', '왜 그렇게 됐는지 같이 짚어 본다'] },
    { text: '모임에서 대화가 끊겼을 때 나는…', options: ['자리를 옮기자고 한다', '아무 말이나 던져 웃긴다', '다음 순서를 챙긴다', '말 없던 사람에게 말을 건넨다', '조용한 것도 나쁘지 않다고 둔다'] },
    { text: '친구들이 나를 부르는 이유는…', options: ['같이 가면 재미있으니까', '내가 있으면 웃으니까', '일이 굴러가니까', '마음이 놓이니까', '이야기가 깊어지니까'] },
    { text: '여행 계획을 짤 때 나의 몫은…', options: ['가고 싶은 곳을 지른다', '노래와 간식을 맡는다', '숙소·교통·예산을 챙긴다', '다들 지치지 않는지 살핀다', '무리하지 않는 동선을 따진다'] },
    { text: '친구 사이에 다툼이 났을 때 나는…', options: ['같이 바람 쐬며 풀자고 한다', '농담으로 굳은 공기를 녹인다', '자리를 만들어 이야기하게 한다', '양쪽 이야기를 따로 들어 준다', '무엇이 진짜 문제인지 짚는다'] },
    { text: '내가 지치는 순간은…', options: ['늘 같은 자리에 머무를 때', '아무도 반응하지 않을 때', '아무도 정리하지 않을 때', '내 마음은 아무도 묻지 않을 때', '생각할 틈 없이 몰아칠 때'] },
    { text: '연락이 뜸했던 친구에게 나는…', options: ['갑자기 어디 가자고 연락한다', '웃긴 걸 보내며 말을 건다', '생일이나 기념일을 먼저 챙긴다', '요즘 어떤지 안부를 묻는다', '떠오른 이유가 있을 때 길게 쓴다'] },
    { text: '단체 대화방에서 나는…', options: ['새로운 걸 제안하는 쪽', '이모지와 농담이 많은 쪽', '공지와 일정을 올리는 쪽', '반응을 빠짐없이 달아 주는 쪽', '필요할 때만 길게 쓰는 쪽'] },
    { text: '친구의 결정을 도울 때 나는…', options: ['일단 해보라고 등을 민다', '가볍게 만들어 부담을 던다', '선택지를 표로 정리해 준다', '어느 쪽이든 편이 되어 준다', '놓친 면을 짚어 준다'] },
    { text: '모임이 끝난 뒤 나는…', options: ['다음엔 어디 갈지 생각한다', '오늘 제일 웃겼던 장면을 떠올린다', '빠진 물건과 정산을 챙긴다', '오늘 조용했던 사람이 마음에 남는다', '오간 이야기를 되새긴다'] },
    { text: '나에게 좋은 우정이란…', options: ['같이 새로운 걸 겪는 것', '만나면 가벼워지는 것', '서로의 일상이 굴러가게 돕는 것', '무슨 일이 있어도 곁에 있는 것', '서로를 깊이 아는 것'] },
  ],
  en: [
    { text: 'Your friends are finally meeting up. You…', options: ['suggest somewhere none of you have been', 'get the mood going before anyone arrives', 'settle the date, the place, the booking', 'find the time that suits everyone', 'think carefully about what would be good to do'] },
    { text: 'A friend tells you they are struggling. You…', options: ['take them out and change the scenery', 'make them laugh so they can breathe', 'sort out what they need right now', 'listen to the end and stay beside them', 'work through with them how it got here'] },
    { text: 'The conversation dies at a gathering. You…', options: ['suggest moving somewhere else', 'say anything at all and make people laugh', 'take care of what comes next', 'turn to whoever has been quiet', 'let the quiet be; it is not a bad thing'] },
    { text: 'Friends call you because…', options: ['it is more fun with you along', 'people laugh when you are there', 'things actually happen', 'they feel at ease', 'the conversation goes deeper'] },
    { text: 'Planning a trip, your part is…', options: ['pushing for the place you want to see', 'the playlist and the snacks', 'rooms, transport and budget', 'checking nobody is worn out', 'a route that does not overreach'] },
    { text: 'Two friends fall out. You…', options: ['get everyone outside to shake it off', 'crack a joke to thaw the air', 'make the space for them to talk', 'hear each side separately', 'name what the real problem is'] },
    { text: 'What tires you out is…', options: ['staying in the same place forever', 'nobody reacting', 'nobody tidying up after anything', 'nobody asking how you are', 'being rushed with no room to think'] },
    { text: 'With a friend you have lost touch with, you…', options: ['message out of nowhere: let us go somewhere', 'send something funny to open the door', 'remember the birthday first', 'ask how they have been', 'write at length when something brings them to mind'] },
    { text: 'In a group chat you are the one who…', options: ['proposes new things', 'fills it with emoji and jokes', 'posts the notices and the schedule', 'replies to everyone without fail', 'writes long, but only when it matters'] },
    { text: 'Helping a friend decide, you…', options: ['nudge them to just try it', 'keep it light so it weighs less', 'lay the options out in a table', 'take their side either way', 'point out what they have missed'] },
    { text: 'After everyone goes home, you…', options: ['think about where to go next time', 'replay the funniest moment', 'chase the lost umbrella and the bill', 'keep thinking about whoever was quiet', 'turn over what was said'] },
    { text: 'Good friendship, to you, is…', options: ['going through new things together', 'feeling lighter every time you meet', 'helping each other’s days run', 'being there whatever happens', 'knowing each other deeply'] },
  ],
  ja: [
    { text: '久しぶりに友だちと集まることに。あなたは…', options: ['まだ行ったことのない場所を提案する', '会う前から場を温める', '日時・場所・予約を決める', 'みんなが動きやすい時間に合わせる', '何をすればいいかじっくり考える'] },
    { text: '友だちがつらいと打ち明けたとき、あなたは…', options: ['気分が変わるように連れ出す', '笑わせて息をつかせる', '今すぐ必要なものを用意する', '最後まで聞いてそばにいる', 'どうしてそうなったかを一緒に辿る'] },
    { text: '集まりで会話が途切れたとき、あなたは…', options: ['場所を変えようと言う', '何でもいいから言って笑わせる', '次の段取りを進める', '黙っていた人に話しかける', '静かなのも悪くないと構えない'] },
    { text: '友だちがあなたを誘う理由は…', options: ['一緒だと面白いから', 'いると笑えるから', '物事が前に進むから', '安心できるから', '話が深くなるから'] },
    { text: '旅行の計画で、あなたの担当は…', options: ['行きたい場所を押す', '音楽とおやつ', '宿・移動・予算', 'みんなが疲れていないか見る', '無理のない道順を考える'] },
    { text: '友だち同士がもめたとき、あなたは…', options: ['外に連れ出して空気を変える', '冗談で固い空気をほぐす', '話せる場をつくる', '両方の話を別々に聞く', '本当の問題はどこかを指す'] },
    { text: 'あなたが消耗するのは…', options: ['いつも同じ場所にいるとき', '誰も反応しないとき', '誰も片づけないとき', '自分の気持ちは誰も聞かないとき', '考える間もなく追われるとき'] },
    { text: '連絡が途絶えた友だちには…', options: ['急に「どこか行こう」と送る', '面白いものを送って口火を切る', '誕生日や記念日を先に覚えている', '最近どうしているかを尋ねる', '思い出す理由があったとき長く書く'] },
    { text: 'グループチャットでのあなたは…', options: ['新しいことを提案する側', '絵文字と冗談が多い側', 'お知らせと予定を上げる側', '反応を必ず返す側', '必要なときだけ長く書く側'] },
    { text: '友だちの決断を助けるとき、あなたは…', options: ['まずやってみなよと背中を押す', '軽くして重さを減らす', '選択肢を表にして見せる', 'どちらでも味方になる', '見落としを指摘する'] },
    { text: '集まりが終わったあと、あなたは…', options: ['次はどこへ行こうか考える', '一番笑った場面を思い出す', '忘れ物と精算を片づける', '今日静かだった人が心に残る', '交わした話を反芻する'] },
    { text: 'あなたにとって良い友情とは…', options: ['一緒に新しいことを経験すること', '会うと軽くなること', 'お互いの日常が回るよう助けること', '何があってもそばにいること', 'お互いを深く知ること'] },
  ],
  zh: [
    { text: '难得约到朋友见面，你会…', options: ['提议去没去过的地方', '还没见面就开始炒气氛', '把日期、地点、订位定下来', '迁就大家都方便的时间', '认真想想做什么才好'] },
    { text: '朋友说自己很难受时，你会…', options: ['带他出去换个环境', '把他逗笑，让他喘口气', '先把眼下需要的东西张罗好', '听到最后，陪在旁边', '跟他一起理一理怎么走到这一步'] },
    { text: '聚会里话题冷掉时，你会…', options: ['提议换个地方', '随便说点什么把大家逗乐', '把下一步安排起来', '找那个一直没说话的人聊', '觉得安静一下也没什么不好'] },
    { text: '朋友找你，是因为…', options: ['有你在比较好玩', '有你在大家会笑', '事情真的推得动', '心里踏实', '话能聊得深'] },
    { text: '规划旅行时，你负责…', options: ['力推想去的地方', '歌单和零食', '住宿、交通和预算', '看看有没有人累了', '安排不勉强的路线'] },
    { text: '朋友之间闹翻了，你会…', options: ['带大家出去透口气', '用玩笑把僵住的空气化开', '安排一个能好好说话的场合', '分开听两边讲', '指出真正的问题在哪'] },
    { text: '让你累的时刻是…', options: ['一直待在同一个地方', '说了没人回应', '谁都不收拾', '没人问你过得怎样', '连想一下的时间都没有'] },
    { text: '对很久没联络的朋友，你会…', options: ['突然说「走，去个地方」', '发点好笑的先搭上话', '先记得生日或纪念日', '问问他最近怎么样', '想起他的时候写长长一段'] },
    { text: '在群聊里，你是…', options: ['提新点子的那个', '表情包和玩笑最多的那个', '发通知和行程的那个', '每条都回的那个', '只在要紧时长篇写的那个'] },
    { text: '帮朋友做决定时，你会…', options: ['推他一把，先试了再说', '把事情说轻一点，减他的负担', '把选项列成表给他看', '不管他选哪边都站他这边', '点出他漏看的地方'] },
    { text: '聚会结束后，你会…', options: ['想下次去哪', '回味今天最好笑的一幕', '收尾：落下的东西和分账', '惦记今天话少的那个人', '把聊过的话再嚼一遍'] },
    { text: '对你来说，好的友情是…', options: ['一起经历新的事', '见了面就轻松下来', '帮彼此把日子过下去', '不管出什么事都在', '彼此了解得深'] },
  ],
  fr: [
    { text: 'Vos amis se retrouvent enfin. Vous…', options: ['proposez un endroit où personne n’est allé', 'lancez l’ambiance avant même d’arriver', 'fixez la date, le lieu, la réservation', 'trouvez l’heure qui arrange tout le monde', 'réfléchissez à ce qui serait bien de faire'] },
    { text: 'Un ami vous dit qu’il va mal. Vous…', options: ['l’emmenez dehors pour changer d’air', 'le faites rire pour qu’il respire', 'réglez ce dont il a besoin tout de suite', 'écoutez jusqu’au bout et restez près de lui', 'remontez avec lui le fil de ce qui s’est passé'] },
    { text: 'La conversation retombe. Vous…', options: ['proposez d’aller ailleurs', 'dites n’importe quoi et faites rire', 'enchaînez sur la suite', 'vous tournez vers celui qui n’a rien dit', 'laissez le silence : ce n’est pas grave'] },
    { text: 'Vos amis vous appellent parce que…', options: ['c’est plus drôle avec vous', 'on rit quand vous êtes là', 'les choses avancent vraiment', 'on se sent tranquille', 'la conversation va plus loin'] },
    { text: 'Pour un voyage, votre rôle c’est…', options: ['pousser pour l’endroit qui vous attire', 'la musique et les provisions', 'logement, transport et budget', 'vérifier que personne n’est épuisé', 'un itinéraire qui n’en fait pas trop'] },
    { text: 'Deux amis se fâchent. Vous…', options: ['sortez tout le monde prendre l’air', 'lâchez une blague pour détendre', 'créez le moment où ils pourront se parler', 'écoutez chacun séparément', 'nommez le vrai problème'] },
    { text: 'Ce qui vous épuise, c’est…', options: ['rester toujours au même endroit', 'que personne ne réagisse', 'que personne ne range derrière', 'que personne ne demande comment vous allez', 'être pressé sans place pour penser'] },
    { text: 'À un ami perdu de vue, vous…', options: ['écrivez soudain : on va quelque part ?', 'envoyez un truc drôle pour rouvrir la porte', 'pensez d’abord à son anniversaire', 'demandez comment il va', 'écrivez longuement quand quelque chose vous y fait penser'] },
    { text: 'Dans un groupe de discussion, vous êtes celui qui…', options: ['propose des choses nouvelles', 'met des émojis et des blagues', 'publie les infos et le planning', 'répond à tout le monde sans faute', 'écrit long, mais seulement quand il faut'] },
    { text: 'Pour aider un ami à décider, vous…', options: ['le poussez à essayer', 'allégez la chose pour qu’elle pèse moins', 'posez les options dans un tableau', 'êtes de son côté quoi qu’il choisisse', 'signalez ce qu’il n’a pas vu'] },
    { text: 'Une fois tout le monde rentré, vous…', options: ['pensez à la prochaine sortie', 'repassez le moment le plus drôle', 'récupérez l’objet oublié et faites les comptes', 'gardez en tête celui qui est resté silencieux', 'reprenez ce qui s’est dit'] },
    { text: 'Une bonne amitié, pour vous, c’est…', options: ['traverser du nouveau ensemble', 'repartir plus léger à chaque fois', 's’aider à faire tourner le quotidien', 'être là quoi qu’il arrive', 'se connaître en profondeur'] },
  ],
  es: [
    { text: 'Por fin quedáis todos. Tú…', options: ['propones un sitio donde nadie ha estado', 'animas el ambiente antes de llegar', 'cierras fecha, sitio y reserva', 'buscas la hora que le va bien a todos', 'piensas con calma qué estaría bien hacer'] },
    { text: 'Un amigo te cuenta que lo está pasando mal. Tú…', options: ['te lo llevas fuera a cambiar de aire', 'lo haces reír para que respire', 'le resuelves lo que necesita ahora mismo', 'escuchas hasta el final y te quedas a su lado', 'repasáis juntos cómo se llegó hasta ahí'] },
    { text: 'La conversación se apaga. Tú…', options: ['propones cambiar de sitio', 'sueltas cualquier cosa y haces reír', 'tiras del siguiente paso', 'te giras hacia quien lleva rato callado', 'dejas el silencio, que tampoco está mal'] },
    { text: 'Tus amigos te llaman porque…', options: ['contigo es más divertido', 'contigo se ríen', 'las cosas avanzan de verdad', 'se quedan tranquilos', 'la conversación llega más hondo'] },
    { text: 'En un viaje, tu parte es…', options: ['empujar para ir al sitio que te tira', 'la música y la comida', 'alojamiento, transporte y presupuesto', 'mirar que nadie esté reventado', 'una ruta que no se pase de ambiciosa'] },
    { text: 'Dos amigos se enfadan. Tú…', options: ['sacas a todos a tomar el aire', 'sueltas una broma para deshelar', 'montas el momento para que hablen', 'escuchas a cada uno por separado', 'pones nombre al problema de verdad'] },
    { text: 'Lo que te agota es…', options: ['quedarte siempre en el mismo sitio', 'que nadie reaccione', 'que nadie recoja nada', 'que nadie te pregunte cómo estás', 'que te metan prisa sin sitio para pensar'] },
    { text: 'A un amigo con quien perdiste el contacto, tú…', options: ['le escribes de golpe: ¿nos vamos a algún sitio?', 'le mandas algo divertido para abrir la puerta', 'te acuerdas primero de su cumpleaños', 'le preguntas qué tal le va', 'le escribes largo cuando algo te lo recuerda'] },
    { text: 'En un grupo de chat eres quien…', options: ['propone cosas nuevas', 'llena de emojis y bromas', 'publica los avisos y el plan', 'contesta a todos sin fallar', 'escribe largo, pero solo cuando importa'] },
    { text: 'Ayudando a un amigo a decidir, tú…', options: ['le empujas a probarlo', 'le quitas peso al asunto', 'le pones las opciones en una tabla', 'te pones de su lado elija lo que elija', 'le señalas lo que no ha visto'] },
    { text: 'Cuando todos se han ido, tú…', options: ['piensas adónde ir la próxima', 'repasas el momento más gracioso', 'persigues lo olvidado y las cuentas', 'te quedas pensando en quien estuvo callado', 'le das vueltas a lo que se habló'] },
    { text: 'Para ti, una buena amistad es…', options: ['vivir cosas nuevas juntos', 'salir más ligero cada vez', 'ayudarse a que el día a día funcione', 'estar ahí pase lo que pase', 'conoceros a fondo'] },
  ],
}

const RESULTS: Record<Style, Record<Lang, Result>> = {
  adventurer: {
    ko: { emoji: '🧭', title: '모험가', tagline: '같이 새로운 데로 데려가는 친구', description: '모임이 같은 자리에 머물 때 먼저 움직이는 쪽이에요. 친구들의 여름이 기억에 남는다면 그중 몇 장면은 당신이 만든 거예요.', strengths: ['가보지 않은 쪽으로 첫발을 뗀다', '멈춘 분위기를 움직이게 한다', '함께한 기억을 많이 남긴다'], watch: ['모두가 같은 속도는 아니에요', '새로움이 없으면 금세 시들해질 수 있어요'], pairs: '살림꾼 — 벌인 일을 굴러가게 해 줘요' },
    en: { emoji: '🧭', title: 'Adventurer', tagline: 'The friend who takes everyone somewhere new', description: 'When the group settles into the same place, you are the one who moves first. If your friends remember a summer, some of those scenes are yours.', strengths: ['Takes the first step toward the untried', 'Gets a stalled mood moving', 'Leaves behind a lot of shared memory'], watch: ['Not everyone moves at your speed', 'Without novelty your interest can fade fast'], pairs: 'The Organiser — they keep what you start running' },
    ja: { emoji: '🧭', title: '冒険役', tagline: 'みんなを新しい場所へ連れ出す友', description: '集まりが同じ場所に留まるとき、先に動くのがあなたです。友だちの夏に残る場面のいくつかは、あなたが作ったものです。', strengths: ['まだ試していない方へ一歩を出す', '止まった空気を動かす', '一緒の記憶をたくさん残す'], watch: ['みんなが同じ速さではありません', '新しさがないと熱が冷めやすい'], pairs: 'まとめ役 — 始めたことを回してくれます' },
    zh: { emoji: '🧭', title: '探路的', tagline: '把大家带去新地方的朋友', description: '当大家停在同一个地方，先动起来的是你。朋友记得的那些夏天，有几幕是你做出来的。', strengths: ['敢往没试过的方向迈第一步', '能把停住的气氛带动起来', '留下很多一起的回忆'], watch: ['不是每个人都跟得上你的节奏', '没有新鲜感时，热度掉得快'], pairs: '张罗的 — 把你起的头接着跑下去' },
    fr: { emoji: '🧭', title: 'Aventurier', tagline: 'L’ami qui emmène les autres ailleurs', description: 'Quand le groupe s’installe au même endroit, c’est vous qui bougez le premier. Si vos amis se souviennent d’un été, plusieurs scènes viennent de vous.', strengths: ['Fait le premier pas vers l’inconnu', 'Remet en mouvement une ambiance figée', 'Laisse beaucoup de souvenirs communs'], watch: ['Tout le monde n’avance pas à votre allure', 'Sans nouveauté, l’élan retombe vite'], pairs: 'L’Organisateur — il fait tourner ce que vous lancez' },
    es: { emoji: '🧭', title: 'Aventurero', tagline: 'El amigo que lleva a los demás a sitios nuevos', description: 'Cuando el grupo se queda en el mismo sitio, tú eres quien se mueve primero. Si tus amigos recuerdan un verano, varias escenas son tuyas.', strengths: ['Das el primer paso hacia lo no probado', 'Pones en marcha un ambiente parado', 'Dejas muchos recuerdos compartidos'], watch: ['No todos van a tu ritmo', 'Sin novedad, el interés se te enfría rápido'], pairs: 'El Organizador — sostiene lo que tú arrancas' },
  },
  entertainer: {
    ko: { emoji: '✨', title: '분위기 메이커', tagline: '있으면 공기가 가벼워지는 친구', description: '무거운 자리에 숨통을 틔우는 쪽이에요. 웃음은 가볍지만, 굳은 자리를 푸는 일은 아무나 못 해요.', strengths: ['긴장을 풀고 말문을 연다', '처음 온 사람을 섞이게 한다', '지친 자리에 온기를 넣는다'], watch: ['웃기느라 내 힘든 얘기를 못 꺼낼 수 있어요', '반응이 없으면 유난히 허전해져요'], pairs: '지지자 — 당신의 마음도 물어봐 줘요' },
    en: { emoji: '✨', title: 'Spark', tagline: 'The friend who makes the air lighter', description: 'You are the one who lets a heavy room breathe. Laughter sounds light, but loosening a stuck room is not something everyone can do.', strengths: ['Eases tension and opens people up', 'Folds newcomers into the group', 'Brings warmth to a tired table'], watch: ['Keeping things funny can leave your own hard news unsaid', 'Silence in response lands harder on you than on most'], pairs: 'The Supporter — they ask how you are, too' },
    ja: { emoji: '✨', title: '盛り上げ役', tagline: 'いると空気が軽くなる友', description: '重たい場に息をつかせるのがあなたです。笑いは軽く見えますが、固まった場をほどけるのは誰にでもできることではありません。', strengths: ['緊張をほどき、口を開かせる', '初めての人を輪に入れる', '疲れた場に温度を足す'], watch: ['笑わせるうちに自分のつらさを言えなくなることがあります', '反応がないと人一倍こたえます'], pairs: '支え役 — あなたの気持ちも聞いてくれます' },
    zh: { emoji: '✨', title: '带气氛的', tagline: '你在，空气就轻起来的朋友', description: '你是能让沉重的场子喘口气的人。笑声听着轻，可要把僵住的场面解开，不是谁都做得到。', strengths: ['把紧绷解开，让人肯开口', '让第一次来的人融进来', '给疲惫的场子添点温度'], watch: ['忙着逗大家，自己的难处反而说不出口', '没人回应时，你比别人更难受'], pairs: '撑着的 — 也会问问你过得怎样' },
    fr: { emoji: '✨', title: 'Étincelle', tagline: 'L’ami qui allège l’atmosphère', description: 'Vous êtes celui qui laisse respirer une pièce trop lourde. Le rire paraît léger, mais dénouer une ambiance figée n’est pas donné à tout le monde.', strengths: ['Dénoue la tension et délie les langues', 'Intègre celui qui arrive pour la première fois', 'Réchauffe une tablée fatiguée'], watch: ['À force de faire rire, vos propres peines restent non dites', 'Le silence en retour vous atteint plus que les autres'], pairs: 'Le Soutien — il demande aussi comment vous allez' },
    es: { emoji: '✨', title: 'Chispa', tagline: 'El amigo que aligera el ambiente', description: 'Eres quien deja respirar una sala pesada. La risa parece ligera, pero soltar un ambiente agarrotado no lo hace cualquiera.', strengths: ['Aflojas la tensión y sueltas las lenguas', 'Metes en el grupo a quien llega nuevo', 'Das calor a una mesa cansada'], watch: ['De tanto hacer reír, lo tuyo se queda sin contar', 'Que nadie responda te pesa más que a otros'], pairs: 'El Apoyo — también pregunta cómo estás tú' },
  },
  organizer: {
    ko: { emoji: '🗂️', title: '살림꾼', tagline: '모임이 실제로 굴러가게 하는 친구', description: '날짜를 정하고 예약을 잡고 정산을 마무리하는 쪽이에요. 당신이 없으면 "언제 한번 보자"가 몇 달째 그대로예요.', strengths: ['말로 끝날 일을 일정으로 만든다', '빠뜨린 것을 알아채고 챙긴다', '뒷정리까지 마무리한다'], watch: ['혼자 도맡으면 고마움이 당연함으로 바뀌어요', '계획이 흐트러질 때 유독 날카로워질 수 있어요'], pairs: '모험가 — 어디로 갈지 먼저 정해 줘요' },
    en: { emoji: '🗂️', title: 'Organiser', tagline: 'The friend who makes it actually happen', description: 'You pick the date, make the booking, close the bill. Without you, "let us meet sometime" stays exactly that for months.', strengths: ['Turns talk into a date on the calendar', 'Notices what was left out and handles it', 'Sees the clearing-up through'], watch: ['Carrying it alone turns gratitude into assumption', 'You can get sharp when the plan slips'], pairs: 'The Adventurer — they decide where to go first' },
    ja: { emoji: '🗂️', title: 'まとめ役', tagline: '集まりを実際に回す友', description: '日程を決め、予約を取り、精算を終わらせるのがあなたです。あなたがいないと「今度会おう」は何か月もそのままです。', strengths: ['話で終わることを予定に変える', '抜けているものに気づいて手当てする', '片づけまでやり切る'], watch: ['ひとりで背負うと、感謝が当たり前に変わります', '計画が崩れると、とくに厳しくなりがちです'], pairs: '冒険役 — どこへ行くかを先に決めてくれます' },
    zh: { emoji: '🗂️', title: '张罗的', tagline: '让聚会真的成事的朋友', description: '定日子、订位子、把账算清的是你。没有你，「改天聚聚」能原地放好几个月。', strengths: ['把说说而已变成日程', '看得出漏了什么，顺手补上', '连收尾都做完'], watch: ['一个人扛久了，感谢会变成理所当然', '计划被打乱时，你会变得特别锐利'], pairs: '探路的 — 先帮你定好去哪' },
    fr: { emoji: '🗂️', title: 'Organisateur', tagline: 'L’ami grâce à qui ça se fait vraiment', description: 'Vous fixez la date, prenez la réservation, soldez l’addition. Sans vous, « on se voit bientôt » reste tel quel pendant des mois.', strengths: ['Transforme une intention en date', 'Repère ce qui manque et s’en occupe', 'Va jusqu’au rangement'], watch: ['Tout porter seul transforme la gratitude en évidence', 'Vous pouvez devenir sec quand le plan dérape'], pairs: 'L’Aventurier — il décide d’abord où aller' },
    es: { emoji: '🗂️', title: 'Organizador', tagline: 'El amigo por el que la cosa ocurre de verdad', description: 'Fijas la fecha, haces la reserva, cierras la cuenta. Sin ti, el «a ver si quedamos» se queda igual durante meses.', strengths: ['Conviertes la intención en fecha', 'Ves lo que falta y lo resuelves', 'Llegas hasta el recoger'], watch: ['Cargarlo solo convierte el agradecimiento en costumbre', 'Cuando el plan se tuerce te pones cortante'], pairs: 'El Aventurero — decide primero adónde ir' },
  },
  supporter: {
    ko: { emoji: '🤝', title: '지지자', tagline: '무슨 일이 있어도 곁에 있는 친구', description: '말을 끝까지 듣고, 편을 들고, 남아 있는 쪽이에요. 친구들이 힘들 때 제일 먼저 떠올리는 이름이 당신일 가능성이 커요.', strengths: ['판단하지 않고 끝까지 듣는다', '조용한 사람을 알아본다', '오래가는 신뢰를 만든다'], watch: ['다 받아 주다 내 몫이 사라질 수 있어요', '거절하지 못해 지치는 날이 쌓여요'], pairs: '생각 친구 — 감정에 파묻힐 때 길을 보여 줘요' },
    en: { emoji: '🤝', title: 'Supporter', tagline: 'The friend who stays, whatever happens', description: 'You listen to the end, take their side, and remain. When friends are struggling, yours is likely the first name they think of.', strengths: ['Listens without judging', 'Notices the quiet one', 'Builds trust that lasts'], watch: ['Taking everything in can leave no room for your own', 'Days of not saying no pile up into exhaustion'], pairs: 'The Thinking friend — they show a way out when feeling floods' },
    ja: { emoji: '🤝', title: '支え役', tagline: '何があってもそばにいる友', description: '最後まで聞き、味方になり、残るのがあなたです。友だちがつらいとき、まず思い浮かぶ名前があなたである可能性は高いです。', strengths: ['判断せずに最後まで聞く', '静かな人に気づく', '長く続く信頼をつくる'], watch: ['全部受け止めるうちに自分の分がなくなります', '断れない日が積もって消耗します'], pairs: '考える友 — 感情に沈むとき道を示してくれます' },
    zh: { emoji: '🤝', title: '撑着的', tagline: '不管出什么事都在的朋友', description: '你会听到最后，会站在他那边，会留下来。朋友难受时，第一个想到的名字很可能是你。', strengths: ['不急着评判，听到最后', '看得见那个不出声的人', '把信任养得长久'], watch: ['什么都接住，自己的份就没了', '不会拒绝的日子攒多了，人会空掉'], pairs: '陪你想的 — 在情绪里打转时帮你看到路' },
    fr: { emoji: '🤝', title: 'Soutien', tagline: 'L’ami qui reste, quoi qu’il arrive', description: 'Vous écoutez jusqu’au bout, prenez leur parti et restez. Quand un ami traverse une mauvaise passe, c’est souvent votre nom qui vient d’abord.', strengths: ['Écoute sans juger', 'Remarque celui qui se tait', 'Bâtit une confiance qui dure'], watch: ['À tout recevoir, votre part finit par disparaître', 'Les jours où vous ne savez pas dire non s’accumulent'], pairs: 'L’Ami qui réfléchit — il montre une issue quand l’émotion déborde' },
    es: { emoji: '🤝', title: 'Apoyo', tagline: 'El amigo que se queda, pase lo que pase', description: 'Escuchas hasta el final, te pones de su lado y te quedas. Cuando un amigo lo pasa mal, es probable que tu nombre sea el primero que le venga.', strengths: ['Escuchas sin juzgar', 'Ves a quien se queda callado', 'Construyes una confianza que dura'], watch: ['De tanto sostener, tu parte acaba desapareciendo', 'Los días de no saber decir que no se acumulan'], pairs: 'El Amigo que piensa — te enseña una salida cuando la emoción desborda' },
  },
  thinker: {
    ko: { emoji: '🌙', title: '생각 친구', tagline: '대화를 깊은 데로 데려가는 친구', description: '가벼운 이야기 끝에 진짜 질문을 던지는 쪽이에요. 당신과의 대화는 짧아도 오래 남아요.', strengths: ['남들이 놓친 면을 짚는다', '진짜 문제를 이름 붙인다', '깊고 오래가는 관계를 맺는다'], watch: ['생각이 앞서 마음을 나중에 표현할 때가 있어요', '가벼운 자리를 무겁게 만들 수도 있어요'], pairs: '분위기 메이커 — 무거워진 공기를 풀어 줘요' },
    en: { emoji: '🌙', title: 'Thinking friend', tagline: 'The friend who takes the conversation deeper', description: 'After the small talk, you ask the real question. A short conversation with you tends to stay with people.', strengths: ['Names the angle everyone missed', 'Puts a name to the real problem', 'Makes relationships that go deep and last'], watch: ['Thought can arrive first and feeling only later', 'A light evening can turn heavy under your questions'], pairs: 'The Spark — they lift the air when it gets heavy' },
    ja: { emoji: '🌙', title: '考える友', tagline: '会話を深いところへ連れていく友', description: '軽い話のあとに本当の問いを置くのがあなたです。あなたとの会話は短くても長く残ります。', strengths: ['みんなが見落とした面を指す', '本当の問題に名前をつける', '深く長く続く関係を結ぶ'], watch: ['考えが先に立ち、気持ちは後になりがちです', '軽い場を重くしてしまうこともあります'], pairs: '盛り上げ役 — 重くなった空気をほどいてくれます' },
    zh: { emoji: '🌙', title: '陪你想的', tagline: '把话带往深处的朋友', description: '闲聊之后，把真正的问题问出口的是你。跟你聊过的话，就算短，也会留很久。', strengths: ['点出大家都漏看的那一面', '能给真正的问题命名', '关系交得深，也走得久'], watch: ['想法先到，心意常常慢半拍', '有时会把轻松的场合弄得沉重'], pairs: '带气氛的 — 把沉下来的空气托起来' },
    fr: { emoji: '🌙', title: 'Ami qui réfléchit', tagline: 'L’ami qui emmène la conversation plus loin', description: 'Après les banalités, c’est vous qui posez la vraie question. Une conversation courte avec vous reste longtemps.', strengths: ['Désigne l’angle que personne n’a vu', 'Met un nom sur le vrai problème', 'Noue des liens profonds et durables'], watch: ['La pensée arrive d’abord, le sentiment ensuite', 'Une soirée légère peut s’alourdir sous vos questions'], pairs: 'L’Étincelle — elle allège l’air quand il devient lourd' },
    es: { emoji: '🌙', title: 'Amigo que piensa', tagline: 'El amigo que lleva la conversación más hondo', description: 'Después de la charla ligera, eres quien hace la pregunta de verdad. Una conversación corta contigo se queda mucho tiempo.', strengths: ['Señalas el ángulo que nadie vio', 'Le pones nombre al problema real', 'Haces vínculos hondos y duraderos'], watch: ['El pensamiento llega antes; el sentimiento, después', 'Una noche ligera puede volverse pesada con tus preguntas'], pairs: 'La Chispa — levanta el aire cuando se pone denso' },
  },
}

interface Props { locale?: string }

export default function FriendshipStyleTest({ locale: lp = 'ko' }: Props) {
  const lang = (['ko', 'en', 'ja', 'zh', 'fr', 'es'].includes(lp) ? lp : 'en') as Lang
  const t = LABELS[lang]
  const questions = QUESTIONS[lang]
  const [answers, setAnswers] = useState<Style[]>([])
  const done = answers.length === questions.length

  const scores = STYLES.reduce((acc, style) => {
    acc[style] = answers.filter((a) => a === style).length
    return acc
  }, {} as Record<Style, number>)
  const ranked = [...STYLES].sort((a, b) => scores[b] - scores[a])
  const primary = ranked[0]
  const secondary = ranked[1]

  useRecordFinishedTest({ testId: 'friendship-style', title: 'FriendshipStyle', finished: done, resultLabel: done ? LABELS.en.styleNames[primary] : undefined, result: done ? { primary, secondary, scores } : undefined, locale: lang })

  function choose(style: Style) {
    setAnswers((prev) => [...prev, style])
  }

  if (!done) {
    const index = answers.length
    const q = questions[index]
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>{t.progress(index + 1, questions.length)}</span>
            <span>{Math.round((index / questions.length) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(index / questions.length) * 100}%` }} />
          </div>
          <p className="text-base font-semibold text-foreground [word-break:keep-all]">{q.text}</p>
          <ul className="space-y-2">
            {q.options.map((label, i) => (
              <li key={label}>
                <button
                  className="w-full rounded-lg border border-border bg-card px-4 py-3 text-left text-sm leading-6 text-foreground transition-colors hover:bg-accent [word-break:keep-all]"
                  onClick={() => choose(STYLES[i])}
                  type="button"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-center text-xs leading-6 text-muted-foreground [word-break:keep-all]">{t.note}</p>
      </div>
    )
  }

  const r = RESULTS[primary][lang]
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t.primary}</p>
        <p className="mt-2 text-5xl">{r.emoji}</p>
        <h2 className="mt-2 text-2xl font-black text-foreground">{r.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{r.tagline}</p>
        <p className="mt-4 text-sm leading-7 text-foreground [word-break:keep-all]">{r.description}</p>
        {/* 버금은 점수가 실제로 있을 때만 적는다 — 0 점을 두 번째 스타일이라고
            부르면 없는 근거를 만들어 내는 셈이다. */}
        {scores[secondary] > 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            {t.secondary} · <span className="font-bold text-foreground">{t.styleNames[secondary]}</span>
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-bold text-foreground">{t.mix}</h3>
        <ul className="mt-3 space-y-2">
          {ranked.map((style) => (
            <li key={style} className="flex items-center gap-3 text-sm">
              <span className="w-28 shrink-0 text-muted-foreground">{t.styleNames[style]}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <span className="block h-full rounded-full" style={{ background: COLORS[style], width: `${(scores[style] / questions.length) * 100}%` }} />
              </span>
              <span className="w-12 shrink-0 text-right font-mono text-xs text-muted-foreground">{scores[style]}/{questions.length}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-bold text-emerald-700">{t.strengths}</h3>
          <ul className="mt-2 space-y-1.5">
            {r.strengths.map((s) => <li key={s} className="text-sm leading-6 text-muted-foreground [word-break:keep-all]">+ {s}</li>)}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-bold text-amber-700">{t.watch}</h3>
          <ul className="mt-2 space-y-1.5">
            {r.watch.map((s) => <li key={s} className="text-sm leading-6 text-muted-foreground [word-break:keep-all]">△ {s}</li>)}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <h3 className="text-sm font-bold text-primary">{t.pairs}</h3>
        <p className="mt-1 text-sm leading-6 text-foreground [word-break:keep-all]">{r.pairs}</p>
      </div>

      <p className="text-center text-xs leading-6 text-muted-foreground [word-break:keep-all]">{t.note}</p>

      <div className="flex gap-3">
        <button className="flex-1 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent" onClick={() => setAnswers([])} type="button">
          {t.restart}
        </button>
      </div>
      <ShareResultButton locale={lang} heading={t.title} resultTitle={`${r.emoji} ${r.title}`} description={r.description} />
    </div>
  )
}
