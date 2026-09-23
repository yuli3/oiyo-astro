import { useState } from 'react'
import { useRecordFinishedTest } from "@/lib/user/use-record-finished-test";
import ShareResultButton from '../shared/ShareResultButton'
import { Questionnaire } from '@/components/ui/questionnaire'

type PersonalityType = 'creator' | 'performer' | 'lurker' | 'connector'
type SupportedLang = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es'

function lang(locale: string): SupportedLang {
  return (['ko', 'en', 'ja', 'zh', 'fr', 'es'] as const).includes(locale as SupportedLang)
    ? (locale as SupportedLang)
    : 'en'
}

interface Option {
  label: string
  type: PersonalityType
}

interface Question {
  id: string
  text: string
  options: Option[]
}

interface ResultData {
  icon: string
  title: string
  subtitle: string
  description: string
  strengths: string[]
  tip: string
}

const LABELS: Record<SupportedLang, {
  title: string
  subtitle: string
  questionOf: (c: number, t: number) => string
  restart: string
  share: string
  shareMsg: string
  yourType: string
  strengths: string
  tip: string
  note: string
}> = {
  ko: {
    title: 'SNS 성격 유형 테스트',
    subtitle: '나는 어떤 소셜 미디어 유형일까?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: '다시 하기',
    share: '결과 공유',
    shareMsg: '나의 SNS 유형은',
    yourType: '나의 SNS 유형',
    strengths: '강점',
    tip: '팁',
    note: '결과는 재미 목적이며 심리학적 진단이 아닙니다.',
  },
  en: {
    title: 'Social Media Personality Test',
    subtitle: "What's your SNS type?",
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Retake',
    share: 'Share Result',
    shareMsg: 'My SNS personality type is',
    yourType: 'Your SNS Type',
    strengths: 'Strengths',
    tip: 'Tip',
    note: 'Results are for entertainment only and not a psychological diagnosis.',
  },
  ja: {
    title: 'SNS性格タイプテスト',
    subtitle: 'あなたのSNSタイプは？',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'もう一度',
    share: '結果を共有',
    shareMsg: '私のSNSタイプは',
    yourType: 'あなたのSNSタイプ',
    strengths: '強み',
    tip: 'ヒント',
    note: '結果はエンターテイメント目的であり、心理学的診断ではありません。',
  },
  zh: {
    title: '社交媒体性格测验',
    subtitle: '我是哪种社交媒体用户？',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: '重新测验',
    share: '分享结果',
    shareMsg: '我的社交媒体类型是',
    yourType: '我的社交媒体类型',
    strengths: '优势',
    tip: '小贴士',
    note: '结果仅供娱乐，不是心理学诊断。',
  },
  fr: {
    title: 'Test de personnalité sur les réseaux sociaux',
    subtitle: 'Quel type d’utilisateur des réseaux sociaux suis-je ?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Recommencer',
    share: 'Partager le résultat',
    shareMsg: 'Mon type sur les réseaux sociaux',
    yourType: 'Mon type sur les réseaux sociaux',
    strengths: 'Forces',
    tip: 'Conseil',
    note: 'Résultat proposé pour le plaisir ; ce n’est pas un diagnostic psychologique.',
  },
  es: {
    title: 'Test de personalidad en redes sociales',
    subtitle: '¿Qué tipo de usuario de redes sociales soy?',
    questionOf: (c, t) => `${c} / ${t}`,
    restart: 'Repetir',
    share: 'Compartir resultado',
    shareMsg: 'Mi tipo en redes sociales',
    yourType: 'Mi tipo en redes sociales',
    strengths: 'Fortalezas',
    tip: 'Consejo',
    note: 'Resultado solo para divertirse; no es un diagnóstico psicológico.',
  },
}

const QUESTIONS: Record<SupportedLang, Question[]> = {
  ko: [
    {
      id: 'q1',
      text: 'SNS에서 주로 하는 행동은?',
      options: [
        { label: '나만의 사진·영상·글 등 오리지널 콘텐츠를 올린다', type: 'creator' },
        { label: '내 일상을 공유하고 반응을 살핀다', type: 'performer' },
        { label: '다른 사람 게시물을 조용히 구경한다', type: 'lurker' },
        { label: '유용한 정보를 골라 공유하거나 리포스트한다', type: 'connector' },
      ],
    },
    {
      id: 'q2',
      text: '팔로워 수에 대한 나의 태도는?',
      options: [
        { label: '숫자보다 콘텐츠 퀄리티가 중요하다', type: 'creator' },
        { label: '팔로워 증가가 동기부여가 된다', type: 'performer' },
        { label: '신경 쓰지 않는다. 팔로잉이 더 많을 수도 있다', type: 'lurker' },
        { label: '소수의 진짜 연결이 더 중요하다', type: 'connector' },
      ],
    },
    {
      id: 'q3',
      text: '친구가 SNS에 올린 내 사진이 마음에 안 들면?',
      options: [
        { label: '편집이나 필터가 내 스타일과 다르면 삭제 요청한다', type: 'creator' },
        { label: '댓글 반응이 좋으면 그냥 둔다', type: 'performer' },
        { label: '별로 신경 쓰지 않는다', type: 'lurker' },
        { label: '그 사람이 나쁜 의도가 아니면 그냥 둔다', type: 'connector' },
      ],
    },
    {
      id: 'q4',
      text: '새로운 SNS 플랫폼이 생기면?',
      options: [
        { label: '나의 창작물에 어울리는지 먼저 분석한다', type: 'creator' },
        { label: '팔로워 이동이 활발하면 합류한다', type: 'performer' },
        { label: '굳이 가입할 필요를 못 느낀다', type: 'lurker' },
        { label: '커뮤니티 형성 가능성을 살펴본다', type: 'connector' },
      ],
    },
    {
      id: 'q5',
      text: '업로드 전 가장 신경 쓰는 것은?',
      options: [
        { label: '구도, 편집, 전체적인 미감', type: 'creator' },
        { label: '좋아요를 많이 받을지 여부', type: 'performer' },
        { label: '거의 업로드를 하지 않는다', type: 'lurker' },
        { label: '이 콘텐츠가 다른 사람에게 도움이 되는가', type: 'connector' },
      ],
    },
    {
      id: 'q6',
      text: 'SNS에서 사회적 이슈를 접하면?',
      options: [
        { label: '나만의 시각으로 콘텐츠화한다', type: 'creator' },
        { label: '공감되면 재공유한다', type: 'performer' },
        { label: '혼자 읽고 생각한 뒤 넘긴다', type: 'lurker' },
        { label: '신뢰할 수 있는 정보인지 확인 후 확산한다', type: 'connector' },
      ],
    },
    {
      id: 'q7',
      text: 'SNS 사용 시간은?',
      options: [
        { label: '창작과 편집에 집중된 시간', type: 'creator' },
        { label: '올릴 때와 반응 확인할 때 집중적으로', type: 'performer' },
        { label: '무의식 중에 자주 스크롤한다', type: 'lurker' },
        { label: '댓글·메시지·커뮤니티 활동에 시간 쓴다', type: 'connector' },
      ],
    },
    {
      id: 'q8',
      text: 'DM이나 댓글을 받으면?',
      options: [
        { label: '창작에 대한 피드백이면 꼼꼼히 읽는다', type: 'creator' },
        { label: '반응이 많을수록 기분이 좋아진다', type: 'performer' },
        { label: '답장하는 게 부담스럽다', type: 'lurker' },
        { label: '관계 형성의 시작이라 생각해 적극 답한다', type: 'connector' },
      ],
    },
    {
      id: 'q9',
      text: '나에게 SNS란?',
      options: [
        { label: '나를 표현하는 캔버스', type: 'creator' },
        { label: '내 삶을 공유하는 무대', type: 'performer' },
        { label: '세상을 엿보는 창문', type: 'lurker' },
        { label: '사람들을 이어주는 다리', type: 'connector' },
      ],
    },
    {
      id: 'q10',
      text: '팔로우를 끊는 기준은?',
      options: [
        { label: '피드 미감이 깨지면', type: 'creator' },
        { label: '내 게시물에 전혀 반응하지 않으면', type: 'performer' },
        { label: '불쾌한 콘텐츠를 올리면', type: 'lurker' },
        { label: '잘못된 정보를 퍼뜨리면', type: 'connector' },
      ],
    },
  ],
  en: [
    {
      id: 'q1',
      text: 'What do you mainly do on social media?',
      options: [
        { label: 'Post original content — photos, videos, writing', type: 'creator' },
        { label: 'Share my daily life and check reactions', type: 'performer' },
        { label: 'Quietly browse other people\'s posts', type: 'lurker' },
        { label: 'Curate and share useful information or repost', type: 'connector' },
      ],
    },
    {
      id: 'q2',
      text: "What's your attitude toward follower counts?",
      options: [
        { label: 'Content quality matters more than numbers', type: 'creator' },
        { label: 'Growing followers motivates me', type: 'performer' },
        { label: "I don't care — I might follow more than follow me", type: 'lurker' },
        { label: 'A few genuine connections matter more', type: 'connector' },
      ],
    },
    {
      id: 'q3',
      text: "A friend posts a photo of you that you don't like. What do you do?",
      options: [
        { label: "Ask them to delete it if the editing doesn't match my style", type: 'creator' },
        { label: 'Leave it if the comments are positive', type: 'performer' },
        { label: "I don't really care", type: 'lurker' },
        { label: 'Leave it if their intentions were good', type: 'connector' },
      ],
    },
    {
      id: 'q4',
      text: 'A new social media platform launches. What do you do?',
      options: [
        { label: 'Analyze whether it suits my creative work first', type: 'creator' },
        { label: 'Join if my followers are migrating there', type: 'performer' },
        { label: "I don't feel the need to join", type: 'lurker' },
        { label: 'Look into its community-building potential', type: 'connector' },
      ],
    },
    {
      id: 'q5',
      text: 'What do you care about most before posting?',
      options: [
        { label: 'Composition, editing, overall aesthetic', type: 'creator' },
        { label: 'Whether it will get a lot of likes', type: 'performer' },
        { label: 'I rarely post anything', type: 'lurker' },
        { label: 'Whether this will be helpful to others', type: 'connector' },
      ],
    },
    {
      id: 'q6',
      text: 'You encounter a social issue on social media. What do you do?',
      options: [
        { label: 'Turn it into content through my own perspective', type: 'creator' },
        { label: 'Reshare it if I relate to it', type: 'performer' },
        { label: 'Read it alone, think about it, then scroll on', type: 'lurker' },
        { label: 'Verify the information before spreading it', type: 'connector' },
      ],
    },
    {
      id: 'q7',
      text: 'How do you spend time on social media?',
      options: [
        { label: 'Focused time on creating and editing', type: 'creator' },
        { label: 'Intensely when posting and checking reactions', type: 'performer' },
        { label: 'Unconsciously scrolling often', type: 'lurker' },
        { label: 'Time on comments, messages, and community activity', type: 'connector' },
      ],
    },
    {
      id: 'q8',
      text: 'You receive a DM or comment. What do you do?',
      options: [
        { label: 'Read carefully if it\'s feedback about my creative work', type: 'creator' },
        { label: 'The more reactions, the better I feel', type: 'performer' },
        { label: 'Replying feels like a burden', type: 'lurker' },
        { label: 'Reply actively — it\'s the start of a connection', type: 'connector' },
      ],
    },
    {
      id: 'q9',
      text: 'Social media to me is...',
      options: [
        { label: 'A canvas for self-expression', type: 'creator' },
        { label: 'A stage to share my life', type: 'performer' },
        { label: 'A window to peek at the world', type: 'lurker' },
        { label: 'A bridge connecting people', type: 'connector' },
      ],
    },
    {
      id: 'q10',
      text: "What's your reason to unfollow someone?",
      options: [
        { label: 'They ruin the aesthetic of my feed', type: 'creator' },
        { label: "They never react to my posts", type: 'performer' },
        { label: 'They post unpleasant content', type: 'lurker' },
        { label: 'They spread misinformation', type: 'connector' },
      ],
    },
  ],
  ja: [
    {
      id: 'q1',
      text: 'SNSで主にすることは？',
      options: [
        { label: '写真・動画・文章などオリジナルコンテンツを投稿する', type: 'creator' },
        { label: '日常をシェアして反応を確認する', type: 'performer' },
        { label: '他の人の投稿を静かに見る', type: 'lurker' },
        { label: '役立つ情報を選んでシェアやリポストする', type: 'connector' },
      ],
    },
    {
      id: 'q2',
      text: 'フォロワー数についての考えは？',
      options: [
        { label: '数よりコンテンツの質が大切', type: 'creator' },
        { label: 'フォロワーが増えることがモチベーションになる', type: 'performer' },
        { label: '気にしない。フォローの方が多いかも', type: 'lurker' },
        { label: '少数の本物のつながりの方が大切', type: 'connector' },
      ],
    },
    {
      id: 'q3',
      text: '友達がSNSに気に入らない自分の写真を投稿したら？',
      options: [
        { label: '編集やフィルターが自分のスタイルと違えば削除を頼む', type: 'creator' },
        { label: 'コメントの反応が良ければそのままにする', type: 'performer' },
        { label: 'あまり気にしない', type: 'lurker' },
        { label: '悪意がなければそのままにする', type: 'connector' },
      ],
    },
    {
      id: 'q4',
      text: '新しいSNSプラットフォームができたら？',
      options: [
        { label: '自分のクリエイティブに合っているか先に分析する', type: 'creator' },
        { label: 'フォロワーの移行が活発なら参加する', type: 'performer' },
        { label: '特に登録する必要を感じない', type: 'lurker' },
        { label: 'コミュニティ形成の可能性を調べる', type: 'connector' },
      ],
    },
    {
      id: 'q5',
      text: '投稿前に最も気にすることは？',
      options: [
        { label: '構図・編集・全体的な美感', type: 'creator' },
        { label: 'いいねがたくさんもらえるかどうか', type: 'performer' },
        { label: 'ほとんど投稿しない', type: 'lurker' },
        { label: 'このコンテンツが他の人の役に立つか', type: 'connector' },
      ],
    },
    {
      id: 'q6',
      text: 'SNSで社会問題を見かけたら？',
      options: [
        { label: '自分の視点でコンテンツにする', type: 'creator' },
        { label: '共感したら再シェアする', type: 'performer' },
        { label: '一人で読んで考えてからスクロールする', type: 'lurker' },
        { label: '信頼できる情報か確認してから広める', type: 'connector' },
      ],
    },
    {
      id: 'q7',
      text: 'SNSに使う時間は？',
      options: [
        { label: 'クリエイティブ制作と編集に集中した時間', type: 'creator' },
        { label: '投稿時と反応確認時に集中的に使う', type: 'performer' },
        { label: '無意識によくスクロールしている', type: 'lurker' },
        { label: 'コメント・メッセージ・コミュニティ活動に使う', type: 'connector' },
      ],
    },
    {
      id: 'q8',
      text: 'DMやコメントをもらったら？',
      options: [
        { label: 'クリエイティブへのフィードバックなら丁寧に読む', type: 'creator' },
        { label: '反応が多いほど嬉しい', type: 'performer' },
        { label: '返信するのが負担に感じる', type: 'lurker' },
        { label: 'つながりの始まりと思って積極的に返信する', type: 'connector' },
      ],
    },
    {
      id: 'q9',
      text: '自分にとってSNSとは？',
      options: [
        { label: '自己表現のキャンバス', type: 'creator' },
        { label: '自分の生活を共有するステージ', type: 'performer' },
        { label: '世界を覗く窓', type: 'lurker' },
        { label: '人々をつなぐ橋', type: 'connector' },
      ],
    },
    {
      id: 'q10',
      text: 'フォローを外す基準は？',
      options: [
        { label: 'フィードの美感が崩れるとき', type: 'creator' },
        { label: '自分の投稿に全く反応しないとき', type: 'performer' },
        { label: '不快なコンテンツを投稿するとき', type: 'lurker' },
        { label: '誤った情報を広めるとき', type: 'connector' },
      ],
    },
  ],
  zh: [
    {
      id: 'q1',
      text: '你在社交媒体上主要做什么？',
      options: [
        { label: '发布自己的照片、视频、文字等原创内容', type: 'creator' },
        { label: '分享日常，留意大家的反应', type: 'performer' },
        { label: '安静地看别人的动态', type: 'lurker' },
        { label: '挑选有用的信息分享或转发', type: 'connector' },
      ],
    },
    {
      id: 'q2',
      text: '你怎么看粉丝数？',
      options: [
        { label: '比起数字，内容质量更重要', type: 'creator' },
        { label: '粉丝增长是我的动力', type: 'performer' },
        { label: '不在意，关注的人可能比粉丝还多', type: 'lurker' },
        { label: '少数真正的连结更重要', type: 'connector' },
      ],
    },
    {
      id: 'q3',
      text: '朋友发了你不满意的照片，你会？',
      options: [
        { label: '修图或滤镜和我的风格不同，就请他删掉', type: 'creator' },
        { label: '评论反应好的话就算了', type: 'performer' },
        { label: '不太在意', type: 'lurker' },
        { label: '只要对方没有恶意就算了', type: 'connector' },
      ],
    },
    {
      id: 'q4',
      text: '出现新的社交平台时？',
      options: [
        { label: '先分析它适不适合我的作品', type: 'creator' },
        { label: '粉丝迁移很热闹的话就加入', type: 'performer' },
        { label: '觉得没必要注册', type: 'lurker' },
        { label: '看看有没有形成社群的可能', type: 'connector' },
      ],
    },
    {
      id: 'q5',
      text: '发布前你最在意什么？',
      options: [
        { label: '构图、剪辑和整体美感', type: 'creator' },
        { label: '会不会拿到很多赞', type: 'performer' },
        { label: '我几乎不发东西', type: 'lurker' },
        { label: '这条内容对别人有没有帮助', type: 'connector' },
      ],
    },
    {
      id: 'q6',
      text: '在社交媒体上看到社会议题时？',
      options: [
        { label: '用自己的视角做成内容', type: 'creator' },
        { label: '有共鸣就转发', type: 'performer' },
        { label: '自己读完想一想就划走', type: 'lurker' },
        { label: '确认信息可信后再扩散', type: 'connector' },
      ],
    },
    {
      id: 'q7',
      text: '你的社交媒体时间主要花在？',
      options: [
        { label: '集中在创作和剪辑', type: 'creator' },
        { label: '发布和查看反应的时候', type: 'performer' },
        { label: '不知不觉频繁地刷', type: 'lurker' },
        { label: '用在评论、私信和社群活动上', type: 'connector' },
      ],
    },
    {
      id: 'q8',
      text: '收到私信或评论时？',
      options: [
        { label: '如果是对作品的反馈，会仔细读', type: 'creator' },
        { label: '反应越多心情越好', type: 'performer' },
        { label: '回复让我有负担', type: 'lurker' },
        { label: '当成建立关系的开始，积极回复', type: 'connector' },
      ],
    },
    {
      id: 'q9',
      text: '对你来说社交媒体是？',
      options: [
        { label: '表达自我的画布', type: 'creator' },
        { label: '分享生活的舞台', type: 'performer' },
        { label: '窥看世界的窗口', type: 'lurker' },
        { label: '连接人与人的桥梁', type: 'connector' },
      ],
    },
    {
      id: 'q10',
      text: '你取消关注的标准是？',
      options: [
        { label: '破坏了动态的美感', type: 'creator' },
        { label: '对我的帖子毫无反应', type: 'performer' },
        { label: '发布令人不适的内容', type: 'lurker' },
        { label: '散布错误信息', type: 'connector' },
      ],
    },
  ],
  fr: [
    {
      id: 'q1',
      text: 'Que faites-vous surtout sur les réseaux sociaux ?',
      options: [
        { label: 'Je publie mes propres photos, vidéos ou textes', type: 'creator' },
        { label: 'Je partage mon quotidien et je surveille les réactions', type: 'performer' },
        { label: 'Je regarde discrètement les publications des autres', type: 'lurker' },
        { label: 'Je sélectionne et repartage des informations utiles', type: 'connector' },
      ],
    },
    {
      id: 'q2',
      text: 'Votre rapport au nombre d’abonnés ?',
      options: [
        { label: 'La qualité du contenu compte plus que les chiffres', type: 'creator' },
        { label: 'Voir mes abonnés augmenter me motive', type: 'performer' },
        { label: 'Je m’en moque ; je suis peut-être plus de comptes qu’on ne me suit', type: 'lurker' },
        { label: 'Quelques vrais liens comptent davantage', type: 'connector' },
      ],
    },
    {
      id: 'q3',
      text: 'Un ami publie une photo de vous qui ne vous plaît pas ?',
      options: [
        { label: 'Si la retouche ou le filtre ne me ressemble pas, je lui demande de la retirer', type: 'creator' },
        { label: 'Si les commentaires sont positifs, je laisse', type: 'performer' },
        { label: 'Ça ne me dérange pas vraiment', type: 'lurker' },
        { label: 'S’il n’y a pas de mauvaise intention, je laisse', type: 'connector' },
      ],
    },
    {
      id: 'q4',
      text: 'Une nouvelle plateforme apparaît ?',
      options: [
        { label: 'J’analyse d’abord si elle convient à mes créations', type: 'creator' },
        { label: 'Je la rejoins si les abonnés y migrent en masse', type: 'performer' },
        { label: 'Je ne vois pas l’intérêt de m’inscrire', type: 'lurker' },
        { label: 'J’évalue si une communauté peut s’y former', type: 'connector' },
      ],
    },
    {
      id: 'q5',
      text: 'Avant de publier, à quoi faites-vous le plus attention ?',
      options: [
        { label: 'Cadrage, montage et esthétique d’ensemble', type: 'creator' },
        { label: 'Savoir si ça va récolter beaucoup de likes', type: 'performer' },
        { label: 'Je ne publie presque jamais', type: 'lurker' },
        { label: 'Savoir si ce contenu sera utile aux autres', type: 'connector' },
      ],
    },
    {
      id: 'q6',
      text: 'Face à un sujet de société sur les réseaux ?',
      options: [
        { label: 'J’en fais un contenu avec mon propre regard', type: 'creator' },
        { label: 'Je le repartage s’il me parle', type: 'performer' },
        { label: 'Je lis, je réfléchis seul, et je passe', type: 'lurker' },
        { label: 'Je vérifie que l’information est fiable avant de la diffuser', type: 'connector' },
      ],
    },
    {
      id: 'q7',
      text: 'Votre temps sur les réseaux ?',
      options: [
        { label: 'Surtout consacré à créer et monter', type: 'creator' },
        { label: 'Concentré sur les moments où je publie et où je regarde les réactions', type: 'performer' },
        { label: 'Je scrolle souvent sans m’en rendre compte', type: 'lurker' },
        { label: 'Passé en commentaires, messages et vie de communauté', type: 'connector' },
      ],
    },
    {
      id: 'q8',
      text: 'Quand vous recevez un message ou un commentaire ?',
      options: [
        { label: 'Si c’est un retour sur ma création, je le lis attentivement', type: 'creator' },
        { label: 'Plus il y a de réactions, plus je suis content', type: 'performer' },
        { label: 'Répondre me pèse', type: 'lurker' },
        { label: 'J’y vois le début d’une relation et je réponds volontiers', type: 'connector' },
      ],
    },
    {
      id: 'q9',
      text: 'Pour vous, les réseaux sociaux sont…',
      options: [
        { label: 'Une toile pour m’exprimer', type: 'creator' },
        { label: 'Une scène pour partager ma vie', type: 'performer' },
        { label: 'Une fenêtre sur le monde', type: 'lurker' },
        { label: 'Un pont entre les gens', type: 'connector' },
      ],
    },
    {
      id: 'q10',
      text: 'Votre critère pour vous désabonner ?',
      options: [
        { label: 'Si l’esthétique du fil est cassée', type: 'creator' },
        { label: 'S’il ne réagit jamais à mes publications', type: 'performer' },
        { label: 'S’il publie du contenu désagréable', type: 'lurker' },
        { label: 'S’il diffuse de fausses informations', type: 'connector' },
      ],
    },
  ],
  es: [
    {
      id: 'q1',
      text: '¿Qué haces sobre todo en redes sociales?',
      options: [
        { label: 'Publico mis propias fotos, vídeos o textos', type: 'creator' },
        { label: 'Comparto mi día a día y miro las reacciones', type: 'performer' },
        { label: 'Miro en silencio las publicaciones de los demás', type: 'lurker' },
        { label: 'Selecciono información útil y la comparto o reposteo', type: 'connector' },
      ],
    },
    {
      id: 'q2',
      text: '¿Tu actitud ante el número de seguidores?',
      options: [
        { label: 'La calidad del contenido importa más que los números', type: 'creator' },
        { label: 'Ver crecer a mis seguidores me motiva', type: 'performer' },
        { label: 'Me da igual; puede que siga a más gente de la que me sigue', type: 'lurker' },
        { label: 'Pocas conexiones reales importan más', type: 'connector' },
      ],
    },
    {
      id: 'q3',
      text: '¿Un amigo sube una foto tuya que no te gusta?',
      options: [
        { label: 'Si la edición o el filtro no va con mi estilo, le pido que la quite', type: 'creator' },
        { label: 'Si los comentarios son buenos, la dejo', type: 'performer' },
        { label: 'No me importa mucho', type: 'lurker' },
        { label: 'Si no hay mala intención, la dejo', type: 'connector' },
      ],
    },
    {
      id: 'q4',
      text: '¿Aparece una nueva red social?',
      options: [
        { label: 'Analizo primero si encaja con mis creaciones', type: 'creator' },
        { label: 'Me uno si los seguidores se mudan en masa', type: 'performer' },
        { label: 'No veo la necesidad de registrarme', type: 'lurker' },
        { label: 'Miro si puede formarse una comunidad', type: 'connector' },
      ],
    },
    {
      id: 'q5',
      text: '¿Qué es lo que más cuidas antes de publicar?',
      options: [
        { label: 'Encuadre, edición y estética general', type: 'creator' },
        { label: 'Si va a recibir muchos «me gusta»', type: 'performer' },
        { label: 'Casi nunca publico', type: 'lurker' },
        { label: 'Si este contenido será útil para otros', type: 'connector' },
      ],
    },
    {
      id: 'q6',
      text: '¿Te encuentras un tema social en redes?',
      options: [
        { label: 'Lo convierto en contenido con mi propia mirada', type: 'creator' },
        { label: 'Si me identifico, lo comparto', type: 'performer' },
        { label: 'Lo leo, lo pienso a solas y paso', type: 'lurker' },
        { label: 'Compruebo que sea fiable antes de difundirlo', type: 'connector' },
      ],
    },
    {
      id: 'q7',
      text: '¿En qué se va tu tiempo en redes?',
      options: [
        { label: 'Sobre todo en crear y editar', type: 'creator' },
        { label: 'En cuando publico y cuando miro las reacciones', type: 'performer' },
        { label: 'Hago scroll a menudo sin darme cuenta', type: 'lurker' },
        { label: 'En comentarios, mensajes y actividad de comunidad', type: 'connector' },
      ],
    },
    {
      id: 'q8',
      text: '¿Cuando recibes un mensaje o comentario?',
      options: [
        { label: 'Si es opinión sobre lo que creo, la leo con atención', type: 'creator' },
        { label: 'Cuantas más reacciones, mejor me siento', type: 'performer' },
        { label: 'Me cuesta responder', type: 'lurker' },
        { label: 'Lo veo como el inicio de una relación y respondo con ganas', type: 'connector' },
      ],
    },
    {
      id: 'q9',
      text: 'Para ti, las redes sociales son…',
      options: [
        { label: 'Un lienzo para expresarme', type: 'creator' },
        { label: 'Un escenario para compartir mi vida', type: 'performer' },
        { label: 'Una ventana al mundo', type: 'lurker' },
        { label: 'Un puente entre personas', type: 'connector' },
      ],
    },
    {
      id: 'q10',
      text: '¿Tu criterio para dejar de seguir a alguien?',
      options: [
        { label: 'Si rompe la estética del feed', type: 'creator' },
        { label: 'Si nunca reacciona a mis publicaciones', type: 'performer' },
        { label: 'Si publica contenido desagradable', type: 'lurker' },
        { label: 'Si difunde información falsa', type: 'connector' },
      ],
    },
  ],
}

const RESULTS: Record<PersonalityType, Record<SupportedLang, ResultData>> = {
  creator: {
    ko: {
      icon: '🎨',
      title: '창작자',
      subtitle: '디지털 아티스트',
      description: 'SNS를 자기 표현의 캔버스로 활용합니다. 콘텐츠의 퀄리티와 미감을 최우선으로 생각하며, 팔로워 수보다 작품 자체에 집중합니다.',
      strengths: ['독창적 시각', '미적 감각', '창의적 표현'],
      tip: '알고리즘보다 자신만의 스타일을 지키세요.',
    },
    en: {
      icon: '🎨',
      title: 'Creator',
      subtitle: 'Digital Artist',
      description: 'You use social media as a canvas for self-expression. Content quality and aesthetics come first — you focus on the work itself, not follower counts.',
      strengths: ['Original perspective', 'Aesthetic sense', 'Creative expression'],
      tip: 'Stay true to your style over the algorithm.',
    },
    ja: {
      icon: '🎨',
      title: 'クリエイター',
      subtitle: 'デジタルアーティスト',
      description: 'SNSを自己表現のキャンバスとして活用します。コンテンツの質と美感を最優先に考え、フォロワー数より作品そのものに集中します。',
      strengths: ['独創的な視点', '美的センス', 'クリエイティブな表現'],
      tip: 'アルゴリズムより自分のスタイルを守りましょう。',
    },
    zh: {
      icon: '🎨',
      title: '创作者',
      subtitle: '数字艺术家',
      description: '你把社交媒体当作表达自我的画布。把内容质量和美感放在第一位，比起粉丝数，更专注作品本身。',
      strengths: ['独到的视角', '审美感', '创意表达'],
      tip: '比起算法，守住自己的风格。',
    },
    fr: {
      icon: '🎨',
      title: 'Créateur',
      subtitle: 'Artiste numérique',
      description: 'Vous utilisez les réseaux comme une toile pour vous exprimer. Qualité et esthétique passent avant tout : vous vous concentrez sur l’œuvre plus que sur le nombre d’abonnés.',
      strengths: ['Un regard original', 'Un sens esthétique', 'Une expression créative'],
      tip: 'Préservez votre style plutôt que de suivre l’algorithme.',
    },
    es: {
      icon: '🎨',
      title: 'Creador',
      subtitle: 'Artista digital',
      description: 'Usas las redes como un lienzo para expresarte. La calidad y la estética son lo primero: te centras en la obra más que en el número de seguidores.',
      strengths: ['Mirada original', 'Sentido estético', 'Expresión creativa'],
      tip: 'Mantén tu propio estilo antes que seguir al algoritmo.',
    },
  },
  performer: {
    ko: {
      icon: '✨',
      title: '퍼포머',
      subtitle: '소셜 스타',
      description: '반응과 연결에서 에너지를 얻습니다. 자신의 일상을 솔직하게 공유하며 팔로워와 활발하게 소통하는 것을 즐깁니다.',
      strengths: ['높은 참여율', '트렌드 감각', '솔직한 공유'],
      tip: '좋아요 수보다 진정성 있는 연결에 집중해보세요.',
    },
    en: {
      icon: '✨',
      title: 'Performer',
      subtitle: 'Social Star',
      description: 'You gain energy from reactions and connections. You enjoy sharing your life honestly and engaging actively with your followers.',
      strengths: ['High engagement rate', 'Trend awareness', 'Authentic sharing'],
      tip: 'Focus on genuine connections over like counts.',
    },
    ja: {
      icon: '✨',
      title: 'パフォーマー',
      subtitle: 'ソーシャルスター',
      description: '反応とつながりからエネルギーを得ます。自分の日常を正直にシェアし、フォロワーと活発に交流することを楽しみます。',
      strengths: ['高いエンゲージメント率', 'トレンド感覚', '素直なシェア'],
      tip: 'いいね数より本物のつながりに集中しましょう。',
    },
    zh: {
      icon: '✨',
      title: '表演者',
      subtitle: '社交之星',
      description: '你从反应和连结中获得能量。喜欢坦率地分享日常，和粉丝热络互动。',
      strengths: ['高互动率', '趋势敏感度', '坦率分享'],
      tip: '比起点赞数，试着专注于真诚的连结。',
    },
    fr: {
      icon: '✨',
      title: 'Performeur',
      subtitle: 'Star sociale',
      description: 'Vous puisez votre énergie dans les réactions et les liens. Vous aimez partager votre quotidien avec sincérité et échanger activement avec vos abonnés.',
      strengths: ['Fort engagement', 'Sens des tendances', 'Partage sincère'],
      tip: 'Misez sur des liens authentiques plutôt que sur le nombre de likes.',
    },
    es: {
      icon: '✨',
      title: 'Performer',
      subtitle: 'Estrella social',
      description: 'Te cargas de energía con las reacciones y las conexiones. Disfrutas compartiendo tu día a día con sinceridad e interactuando mucho con tus seguidores.',
      strengths: ['Alta participación', 'Olfato para las tendencias', 'Compartir con sinceridad'],
      tip: 'Céntrate en conexiones auténticas más que en los «me gusta».',
    },
  },
  lurker: {
    ko: {
      icon: '👁️',
      title: '관찰자',
      subtitle: '조용한 목격자',
      description: '소음보다 관찰을 선호하는 내성적 사용자입니다. 소비는 적극적으로 하지만 노출은 최소화합니다.',
      strengths: ['비판적 사고', '선택적 소비', '디지털 피로 없음'],
      tip: '가끔 댓글 하나로도 의미 있는 연결이 시작됩니다.',
    },
    en: {
      icon: '👁️',
      title: 'Lurker',
      subtitle: 'The Silent Observer',
      description: 'You prefer observation over noise — an introverted user who consumes actively but minimizes exposure.',
      strengths: ['Critical thinking', 'Selective consumption', 'No digital fatigue'],
      tip: 'Even a single comment can spark a meaningful connection.',
    },
    ja: {
      icon: '👁️',
      title: '観察者',
      subtitle: '静かな目撃者',
      description: 'ノイズより観察を好む内向的なユーザーです。積極的に消費しますが、発信は最小限にします。',
      strengths: ['批判的思考', '選択的消費', 'デジタル疲労なし'],
      tip: 'たった一つのコメントでも意味のあるつながりが始まります。',
    },
    zh: {
      icon: '👁️',
      title: '观察者',
      subtitle: '安静的目击者',
      description: '你是比起喧闹更喜欢观察的内向型用户。积极地看，但尽量少曝光自己。',
      strengths: ['批判性思考', '有选择地消费', '没有数字疲劳'],
      tip: '偶尔一条评论，也可能开启有意义的连结。',
    },
    fr: {
      icon: '👁️',
      title: 'Observateur',
      subtitle: 'Témoin discret',
      description: 'Vous êtes un utilisateur introverti qui préfère observer plutôt que faire du bruit. Vous consommez activement, mais vous vous exposez le moins possible.',
      strengths: ['Esprit critique', 'Consommation sélective', 'Pas de fatigue numérique'],
      tip: 'Un simple commentaire, de temps en temps, peut ouvrir un lien qui compte.',
    },
    es: {
      icon: '👁️',
      title: 'Observador',
      subtitle: 'Testigo silencioso',
      description: 'Eres un usuario introvertido que prefiere observar a hacer ruido. Consumes activamente, pero te expones lo mínimo.',
      strengths: ['Pensamiento crítico', 'Consumo selectivo', 'Sin fatiga digital'],
      tip: 'A veces un solo comentario basta para iniciar una conexión significativa.',
    },
  },
  connector: {
    ko: {
      icon: '🔗',
      title: '연결자',
      subtitle: '커뮤니티 허브',
      description: '양질의 정보와 사람을 이어주는 큐레이터입니다. 커뮤니티의 신뢰를 쌓고 의미 있는 네트워크를 구축합니다.',
      strengths: ['신뢰성', '공동체 의식', '정보 필터링 능력'],
      tip: '나만의 콘텐츠 창작도 시도해보세요.',
    },
    en: {
      icon: '🔗',
      title: 'Connector',
      subtitle: 'Community Hub',
      description: "You're a curator who bridges quality information and people. You build trust within communities and create meaningful networks.",
      strengths: ['Trustworthiness', 'Community mindset', 'Information filtering'],
      tip: 'Try creating some original content of your own too.',
    },
    ja: {
      icon: '🔗',
      title: 'コネクター',
      subtitle: 'コミュニティハブ',
      description: '質の高い情報と人々をつなぐキュレーターです。コミュニティの信頼を築き、意味のあるネットワークを作ります。',
      strengths: ['信頼性', 'コミュニティ意識', '情報フィルタリング能力'],
      tip: '自分だけのオリジナルコンテンツ作成にも挑戦してみましょう。',
    },
    zh: {
      icon: '🔗',
      title: '连接者',
      subtitle: '社群枢纽',
      description: '你是把优质信息和人串起来的策展人。在社群中累积信任，建立有意义的人脉。',
      strengths: ['可信度', '社群意识', '筛选信息的能力'],
      tip: '也试着创作属于自己的内容吧。',
    },
    fr: {
      icon: '🔗',
      title: 'Connecteur',
      subtitle: 'Pivot de la communauté',
      description: 'Vous êtes un curateur qui relie informations de qualité et personnes. Vous gagnez la confiance de la communauté et tissez un réseau qui a du sens.',
      strengths: ['Fiabilité', 'Esprit de communauté', 'Capacité à filtrer l’information'],
      tip: 'Essayez aussi de créer vos propres contenus.',
    },
    es: {
      icon: '🔗',
      title: 'Conector',
      subtitle: 'Centro de la comunidad',
      description: 'Eres un curador que une información de calidad y personas. Ganas la confianza de la comunidad y construyes una red significativa.',
      strengths: ['Fiabilidad', 'Sentido de comunidad', 'Capacidad de filtrar información'],
      tip: 'Prueba también a crear tu propio contenido.',
    },
  },
}

function calcResult(answers: PersonalityType[]): PersonalityType {
  const counts: Record<PersonalityType, number> = { creator: 0, performer: 0, lurker: 0, connector: 0 }
  for (const a of answers) counts[a]++
  return (Object.entries(counts) as [PersonalityType, number][]).reduce(
    (best, [type, count]) => (count > counts[best] ? type : best),
    'creator' as PersonalityType,
  )
}

const TYPE_COLORS: Record<PersonalityType, string> = {
  creator: '#435D31',
  performer: '#f59e0b',
  lurker: '#64748b',
  connector: '#22c55e',
}

interface Props { locale?: string }

export default function SocialMediaPersonalityTest({ locale: lp = 'ko' }: Props) {
  const locale = lang(lp ?? 'ko')
  const lb = LABELS[locale]
  const questions = QUESTIONS[locale]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<PersonalityType[]>([])
  const [result, setResult] = useState<PersonalityType | null>(null)
  useRecordFinishedTest({ testId: "social-media-personality", title: "SocialMediaPersonalityTest", finished: Boolean(result) });

  function pick(type: PersonalityType) {
    const newAnswers = answers.slice(0, current)
    newAnswers[current] = type
    if (current + 1 >= questions.length) setResult(calcResult(newAnswers))
    setAnswers(newAnswers)
    setCurrent(current + 1)
  }

  function previous() {
    if (current === 0) return
    setCurrent(current - 1)
  }

  function restart() {
    setAnswers([])
    setCurrent(0)
    setResult(null)
  }

  function share() {
    if (!result) return
    const url = window.location.href
    const text = `${lb.shareMsg} — ${RESULTS[result][locale].icon} ${RESULTS[result][locale].title}`
    if (navigator.share) navigator.share({ title: lb.title, text, url })
    else navigator.clipboard.writeText(url)
  }

  const finished = current >= questions.length

  if (!finished) {
    const q = questions[current]
    const progress = Math.round((current / questions.length) * 100)
    return (
      <Questionnaire
        title={lb.title}
        subtitle={lb.subtitle}
        question={q.text}
        questionLabel={lb.questionOf(current + 1, questions.length)}
        progress={progress}
        options={q.options.map((opt) => ({ label: opt.label, value: opt.type }))}
        selectedValue={answers[current]}
        note={lb.note}
        previousLabel={(({ ko: '이전 질문', en: 'Previous question', ja: '前の質問', zh: '上一题', fr: 'Question précédente', es: 'Pregunta anterior' } as Record<string, string>)[locale] ?? 'Previous question')}
        onPrevious={current > 0 ? previous : undefined}
        onSelect={pick}
      />
    )
  }

  if (!result) return null

  const r = RESULTS[result][locale]
  const color = TYPE_COLORS[result]

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">{lb.yourType}</p>
        <div className="text-5xl">{r.icon}</div>
        <div
          className="inline-block rounded-full px-5 py-2 text-xl font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {r.title}
        </div>
        <p className="font-medium text-muted-foreground">{r.subtitle}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
      </div>
      <div className="rounded-xl border bg-card p-4 space-y-2">
        <h3 className="font-semibold text-sm">{lb.strengths}</h3>
        <div className="flex flex-wrap gap-2">
          {r.strengths.map((s) => (
            <span
              key={s}
              className="rounded-full px-3 py-1 text-xs font-medium text-white"
              style={{ backgroundColor: color }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-1">
        <h3 className="font-semibold text-sm text-primary">{lb.tip}</h3>
        <p className="text-sm text-muted-foreground">{r.tip}</p>
      </div>
      <p className="text-center text-xs text-muted-foreground">{lb.note}</p>
      <div className="flex gap-3">
        <button
          onClick={restart}
          className="flex-1 rounded-lg border bg-card px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
        >
          {lb.restart}
        </button>
        <button
          onClick={share}
          className="flex-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {lb.share}
        </button>
      </div>
      <ShareResultButton locale={lp} heading={lb.title} resultTitle={r.title} />
    </div>
  )
}
