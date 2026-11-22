import { useEffect, useMemo, useRef, useState } from 'react';

import { gaEvent, gaEventOnce } from '@/lib/analytics/ga-event';
import {
  BLOCK_TO_SUB,
  MAX_LEN,
  SUB_TO_BLOCK,
  cellText,
  emptyMandalart,
  filledCount,
  gridRows,
  isEmptyMandalart,
  normalizeMandalart,
  wrapText,
  type Mandalart,
} from '@/lib/mandalart';

// 2027 만다라트 81칸. 쓴 내용은 이 브라우저(localStorage)에만 저장하고 보내지 않는다.

type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es';

type Strings = {
  board: string;
  goal: string;
  sub: string;
  action: string;
  goalPh: string;
  subPh: string;
  actionPh: string;
  progress: (n: number, t: number) => string;
  editing: (name: string) => string;
  tapHint: string;
  centerHint: string;
  outerHint: string;
  needSub: string;
  example: string;
  save: string;
  saving: string;
  saved: string;
  failed: string;
  clear: string;
  clearConfirm: string;
  imageTitle: string;
  stored: string;
  sample: Mandalart;
};

const sample = (goal: string, subs: string[], actions: string[][]): Mandalart => ({ goal, subs, actions });

const S: Record<Locale, Strings> = {
  ko: {
    board: '만다라트 81칸', goal: '핵심 목표', sub: '세부 목표', action: '실천',
    goalPh: '2027년 핵심 목표', subPh: '세부 목표', actionPh: '실천 한 가지',
    progress: (n, t) => `${t}칸 중 ${n}칸 채움`,
    editing: (n) => `지금 쓰는 칸: ${n}`,
    tapHint: '아래 표에서 블록을 눌러 그 블록을 채워요.',
    centerHint: '가운데에 핵심 목표, 둘레 8칸에 그 목표를 이루는 세부 목표를 써요.',
    outerHint: '가운데 세부 목표를 이루는 매일·매주 실천 8개를 써요. 숫자가 들어가면 지키기 쉬워요.',
    needSub: '가운데 블록에서 이 자리의 세부 목표를 먼저 써 주세요.',
    example: '예시로 채워 보기', save: '이미지로 저장·공유', saving: '이미지 만드는 중…', saved: '이미지를 저장했어요', failed: '이미지를 만들지 못했어요',
    clear: '모두 지우기', clearConfirm: '한 번 더 누르면 모두 지워요', imageTitle: '나의 2027 만다라트',
    stored: '쓴 내용은 이 브라우저에만 저장돼요.',
    sample: sample('건강하고 단단한 2027', ['몸', '마음', '돈', '일', '배움', '관계', '집', '즐거움'], [
      ['주 3회 30분 걷기', '밤 11시 전 잠', '물 하루 1.5L', '계단 이용', '분기 1회 건강검진', '야식 주 1회 이하', '스트레칭 10분', '금연 유지'],
      ['일기 3줄', '주 1회 산책 명상', '화나면 10초 쉬기', '감사 1가지 쓰기', '휴대폰 침실 밖', '월 1회 혼자 시간', '상담 받아 보기', '칭찬 스스로 하기'],
      ['월급 20% 저축', '가계부 주 1회', '구독 정리', '비상금 3개월치', '연금저축 가입', '충동구매 24시간 보류', '연말정산 미리보기', '카드 1장으로'],
      ['오전 집중 2시간', '할 일 3개만', '회의 메모 바로 정리', '분기 목표 점검', '퇴근 후 업무 끄기', '자격증 1개', '포트폴리오 갱신', '동료에게 묻기'],
      ['책 월 2권', '영어 하루 15분', '강의 1개 완주', '배운 것 글로 쓰기', '새 취미 1개', '도서관 월 1회', '유튜브 대신 책', '전시 분기 1회'],
      ['부모님께 주 1회 전화', '친구 월 1회 만나기', '생일 챙기기', '먼저 연락하기', '고맙다고 말하기', '험담 안 하기', '경청 먼저', '가족 여행 1회'],
      ['주말 30분 정리', '안 쓰는 물건 비우기', '식물 키우기', '설거지 바로', '이불 정리', '장보기 목록', '집밥 주 4회', '분리수거 매일'],
      ['여행 2번', '공연 보기', '맛집 월 1곳', '새 운동 배우기', '사진 1장/일', '게임 적당히', '혼자 영화', '버킷리스트 3개'],
    ]),
  },
  en: {
    board: 'Mandalart 81 cells', goal: 'Core goal', sub: 'Sub-goal', action: 'Action',
    goalPh: 'Your 2027 core goal', subPh: 'Sub-goal', actionPh: 'One action',
    progress: (n, t) => `${n} of ${t} cells filled`,
    editing: (n) => `Editing: ${n}`,
    tapHint: 'Tap a block in the chart below to fill it in.',
    centerHint: 'Write your core goal in the middle and 8 sub-goals that get you there around it.',
    outerHint: 'Write 8 daily or weekly actions for the sub-goal in the middle. Numbers make them easier to keep.',
    needSub: 'Write the sub-goal for this spot in the center block first.',
    example: 'Fill with an example', save: 'Save & share as image', saving: 'Creating image…', saved: 'Image saved', failed: 'Could not create the image',
    clear: 'Clear all', clearConfirm: 'Tap again to clear everything', imageTitle: 'My 2027 Mandalart',
    stored: 'What you write is saved only in this browser.',
    sample: sample('A healthy, steady 2027', ['Body', 'Mind', 'Money', 'Work', 'Learning', 'People', 'Home', 'Fun'], [
      ['Walk 30 min 3×/wk', 'Bed before 11pm', '1.5 L water/day', 'Take the stairs', 'Annual checkup', 'Late snacks ≤1/wk', 'Stretch 10 min', 'Stay smoke-free'],
      ['3-line journal', 'Weekly mindful walk', 'Pause 10 s when angry', 'Note 1 gratitude', 'Phone out of bedroom', 'Monthly solo time', 'Try counseling', 'Praise yourself'],
      ['Save 20% of pay', 'Budget review weekly', 'Cancel unused subs', '3-month emergency fund', 'Open a retirement account', 'Wait 24 h before buying', 'Track taxes early', 'Use one card'],
      ['2 h deep work AM', 'Only 3 to-dos', 'Clean up notes now', 'Quarterly goal check', 'Off after hours', 'Earn 1 certificate', 'Update portfolio', 'Ask colleagues'],
      ['2 books a month', 'Language 15 min/day', 'Finish 1 course', 'Write what I learn', '1 new hobby', 'Library monthly', 'Books over scrolling', 'Museum quarterly'],
      ['Call parents weekly', 'See a friend monthly', 'Remember birthdays', 'Reach out first', 'Say thank you', 'No gossip', 'Listen first', '1 family trip'],
      ['Tidy 30 min weekends', 'Declutter monthly', 'Grow a plant', 'Dishes right away', 'Make the bed', 'Shopping list', 'Cook 4×/wk', 'Recycle daily'],
      ['2 trips', 'See a live show', 'New restaurant monthly', 'Learn a new sport', '1 photo a day', 'Games in moderation', 'Movie alone', '3 bucket-list items'],
    ]),
  },
  ja: {
    board: 'マンダラチャート81マス', goal: '中心の目標', sub: '目標', action: '行動',
    goalPh: '2027年の中心目標', subPh: '目標', actionPh: '行動をひとつ',
    progress: (n, t) => `${t}マス中 ${n}マス記入`,
    editing: (n) => `いま書いているブロック：${n}`,
    tapHint: '下の表のブロックをタップして記入します。',
    centerHint: '真ん中に中心目標、まわりの8マスにそれを実現する目標を書きます。',
    outerHint: '真ん中の目標のための毎日・毎週の行動を8つ。数字を入れると続けやすくなります。',
    needSub: '先に中央ブロックでこの位置の目標を書いてください。',
    example: '例で埋めてみる', save: '画像で保存・共有', saving: '画像を作成中…', saved: '画像を保存しました', failed: '画像を作成できませんでした',
    clear: 'すべて消す', clearConfirm: 'もう一度押すとすべて消えます', imageTitle: 'わたしの2027マンダラチャート',
    stored: '書いた内容はこのブラウザにだけ保存されます。',
    sample: sample('健康で着実な2027年', ['体', '心', 'お金', '仕事', '学び', '人間関係', '暮らし', '楽しみ'], [
      ['週3回30分歩く', '23時前に寝る', '水1.5L/日', '階段を使う', '年1回健診', '夜食は週1以下', 'ストレッチ10分', '禁煙を続ける'],
      ['3行日記', '週1回散歩瞑想', '怒ったら10秒待つ', '感謝を1つ書く', 'スマホは寝室の外', '月1回ひとり時間', 'カウンセリング', '自分をほめる'],
      ['給料の20%貯金', '家計簿を週1回', 'サブスク整理', '生活費3か月分', 'iDeCoを始める', '衝動買いは24時間待つ', 'ふるさと納税', 'カードは1枚'],
      ['午前に集中2時間', 'やることは3つ', '議事メモは即整理', '四半期ごとに見直し', '終業後は通知オフ', '資格を1つ', '実績を更新', '同僚に聞く'],
      ['月2冊読む', '英語15分/日', '講座を1つ完走', '学びを書く', '新しい趣味', '図書館月1回', '動画より本', '美術館を四半期1回'],
      ['親に週1回電話', '友人と月1回', '誕生日を覚える', '自分から連絡', 'ありがとうを言う', '陰口を言わない', 'まず聞く', '家族旅行1回'],
      ['週末30分片付け', '月1回断捨離', '植物を育てる', '皿洗いはすぐ', 'ベッドを整える', '買い物リスト', '自炊週4回', 'ごみ分別'],
      ['旅行2回', 'ライブに行く', '月1軒新しい店', '新しい運動', '1日1枚写真', 'ゲームはほどほど', 'ひとり映画', 'やりたい事3つ'],
    ]),
  },
  zh: {
    board: '曼陀罗九宫格 81 格', goal: '核心目标', sub: '子目标', action: '行动',
    goalPh: '2027 核心目标', subPh: '子目标', actionPh: '一个行动',
    progress: (n, t) => `已填 ${n}/${t} 格`,
    editing: (n) => `正在填写：${n}`,
    tapHint: '点击下方表格中的区块来填写。',
    centerHint: '中间写核心目标，周围 8 格写实现它的子目标。',
    outerHint: '为中间的子目标写 8 个每日或每周行动，带上数字更容易坚持。',
    needSub: '请先在中间区块写下这个位置的子目标。',
    example: '用示例填满', save: '保存·分享为图片', saving: '正在生成图片…', saved: '图片已保存', failed: '图片生成失败',
    clear: '全部清空', clearConfirm: '再点一次将全部清空', imageTitle: '我的 2027 曼陀罗计划',
    stored: '内容只保存在这个浏览器里。',
    sample: sample('健康踏实的 2027', ['身体', '心情', '理财', '工作', '学习', '人际', '居家', '乐趣'], [
      ['每周走路3次', '11点前睡', '每天喝水1.5L', '多走楼梯', '每年体检', '夜宵每周≤1次', '拉伸10分钟', '保持不吸烟'],
      ['三行日记', '每周散步冥想', '生气先停10秒', '写1件感恩', '手机不进卧室', '每月独处一次', '试试心理咨询', '自我表扬'],
      ['存工资20%', '每周记账', '取消闲置订阅', '3个月应急金', '开养老账户', '冲动消费等24小时', '提前看个税', '只用一张卡'],
      ['上午专注2小时', '每天只定3件事', '会议记录当场整理', '每季度复盘', '下班不看工作', '考1个证书', '更新作品集', '多请教同事'],
      ['每月读2本书', '外语每天15分钟', '学完1门课', '把学到的写下来', '1个新爱好', '每月去图书馆', '少刷视频多看书', '每季度看展'],
      ['每周给父母打电话', '每月见朋友', '记住生日', '主动联系', '常说谢谢', '不说闲话', '先倾听', '家庭旅行1次'],
      ['周末整理30分钟', '每月断舍离', '养一盆植物', '碗马上洗', '每天叠被', '列购物清单', '每周做饭4次', '垃圾分类'],
      ['旅行2次', '看一场演出', '每月一家新店', '学一项新运动', '每天1张照片', '游戏适度', '一个人看电影', '3个心愿清单'],
    ]),
  },
  fr: {
    board: 'Mandalart en 81 cases', goal: 'Objectif central', sub: 'Sous-objectif', action: 'Action',
    goalPh: 'Votre objectif 2027', subPh: 'Sous-objectif', actionPh: 'Une action',
    progress: (n, t) => `${n} cases remplies sur ${t}`,
    editing: (n) => `Bloc en cours : ${n}`,
    tapHint: 'Touchez un bloc du tableau ci-dessous pour le remplir.',
    centerHint: 'Au centre, votre objectif ; autour, 8 sous-objectifs pour l’atteindre.',
    outerHint: 'Écrivez 8 actions quotidiennes ou hebdomadaires pour le sous-objectif du centre. Les chiffres aident à tenir.',
    needSub: 'Écrivez d’abord le sous-objectif de cet emplacement dans le bloc central.',
    example: 'Remplir avec un exemple', save: 'Enregistrer et partager l’image', saving: 'Création de l’image…', saved: 'Image enregistrée', failed: 'Impossible de créer l’image',
    clear: 'Tout effacer', clearConfirm: 'Touchez encore pour tout effacer', imageTitle: 'Mon Mandalart 2027',
    stored: 'Vos réponses restent dans ce navigateur.',
    sample: sample('Une année 2027 saine et stable', ['Corps', 'Esprit', 'Argent', 'Travail', 'Apprendre', 'Relations', 'Maison', 'Plaisir'], [
      ['Marcher 30 min 3×/sem', 'Couché avant 23 h', '1,5 L d’eau/jour', 'Prendre l’escalier', 'Bilan de santé', 'Grignotage ≤1/sem', 'Étirements 10 min', 'Rester non-fumeur'],
      ['Journal 3 lignes', 'Marche méditative', 'Pause 10 s si colère', '1 gratitude/jour', 'Téléphone hors chambre', 'Temps seul mensuel', 'Voir un psy', 'Se féliciter'],
      ['Épargner 20 %', 'Budget chaque semaine', 'Trier les abonnements', 'Épargne 3 mois', 'Ouvrir un PER', 'Attendre 24 h avant achat', 'Anticiper les impôts', 'Une seule carte'],
      ['2 h de focus le matin', '3 tâches max', 'Notes de réunion aussitôt', 'Bilan trimestriel', 'Déconnexion le soir', '1 certification', 'Mettre à jour son CV', 'Demander aux collègues'],
      ['2 livres par mois', 'Langue 15 min/jour', 'Finir 1 cours', 'Écrire ce que j’apprends', '1 nouveau loisir', 'Bibliothèque mensuelle', 'Livres plutôt qu’écrans', 'Expo chaque trimestre'],
      ['Appeler les parents', 'Voir un ami/mois', 'Noter les anniversaires', 'Écrire en premier', 'Dire merci', 'Pas de ragots', 'Écouter d’abord', '1 voyage en famille'],
      ['Ranger 30 min le week-end', 'Désencombrer chaque mois', 'Une plante', 'Vaisselle tout de suite', 'Faire son lit', 'Liste de courses', 'Cuisiner 4×/sem', 'Trier les déchets'],
      ['2 voyages', 'Un concert', '1 resto nouveau/mois', 'Un nouveau sport', '1 photo par jour', 'Jeux avec mesure', 'Ciné en solo', '3 rêves à cocher'],
    ]),
  },
  es: {
    board: 'Mandalart de 81 casillas', goal: 'Meta central', sub: 'Submeta', action: 'Acción',
    goalPh: 'Tu meta para 2027', subPh: 'Submeta', actionPh: 'Una acción',
    progress: (n, t) => `${n} de ${t} casillas completas`,
    editing: (n) => `Editando: ${n}`,
    tapHint: 'Toca un bloque del cuadro de abajo para rellenarlo.',
    centerHint: 'En el centro tu meta principal; alrededor, 8 submetas que te llevan a ella.',
    outerHint: 'Escribe 8 acciones diarias o semanales para la submeta del centro. Con números es más fácil cumplirlas.',
    needSub: 'Primero escribe la submeta de esta posición en el bloque central.',
    example: 'Rellenar con un ejemplo', save: 'Guardar y compartir imagen', saving: 'Creando imagen…', saved: 'Imagen guardada', failed: 'No se pudo crear la imagen',
    clear: 'Borrar todo', clearConfirm: 'Toca otra vez para borrar todo', imageTitle: 'Mi Mandalart 2027',
    stored: 'Lo que escribes se guarda solo en este navegador.',
    sample: sample('Un 2027 sano y constante', ['Cuerpo', 'Mente', 'Dinero', 'Trabajo', 'Aprender', 'Personas', 'Casa', 'Diversión'], [
      ['Caminar 30 min 3×/sem', 'Dormir antes de 23 h', '1,5 L de agua/día', 'Usar escaleras', 'Chequeo anual', 'Picoteo nocturno ≤1/sem', 'Estirar 10 min', 'Seguir sin fumar'],
      ['Diario de 3 líneas', 'Paseo consciente', 'Pausa 10 s si me enfado', '1 gratitud al día', 'Móvil fuera del cuarto', 'Tiempo a solas al mes', 'Probar terapia', 'Felicitarme'],
      ['Ahorrar el 20 %', 'Presupuesto semanal', 'Revisar suscripciones', 'Fondo de 3 meses', 'Plan de pensiones', 'Esperar 24 h antes de comprar', 'Preparar la renta', 'Una sola tarjeta'],
      ['2 h de foco por la mañana', 'Solo 3 tareas', 'Ordenar notas al momento', 'Revisión trimestral', 'Desconectar al salir', '1 certificación', 'Actualizar el CV', 'Preguntar a colegas'],
      ['2 libros al mes', 'Idioma 15 min/día', 'Terminar 1 curso', 'Escribir lo aprendido', '1 afición nueva', 'Biblioteca mensual', 'Libros antes que pantallas', 'Museo cada trimestre'],
      ['Llamar a mis padres', 'Ver a un amigo al mes', 'Recordar cumpleaños', 'Escribir primero', 'Dar las gracias', 'Sin chismes', 'Escuchar primero', '1 viaje en familia'],
      ['Ordenar 30 min el finde', 'Despejar cada mes', 'Cuidar una planta', 'Fregar al momento', 'Hacer la cama', 'Lista de la compra', 'Cocinar 4×/sem', 'Reciclar a diario'],
      ['2 viajes', 'Un concierto', '1 restaurante nuevo/mes', 'Un deporte nuevo', '1 foto al día', 'Juegos con medida', 'Cine a solas', '3 deseos cumplidos'],
    ]),
  },
};

const STORE_KEY = 'oiyo:mandalart-2027';
const CJK = new Set<Locale>(['ko', 'ja', 'zh']);

function load(): Mandalart {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? normalizeMandalart(JSON.parse(raw)) : emptyMandalart();
  } catch {
    return emptyMandalart();
  }
}

async function drawImage(m: Mandalart, locale: Locale, title: string): Promise<Blob | null> {
  const W = 1080;
  const H = 1350;
  const pad = 48;
  const top = 230;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const font = '"Pretendard Variable", Pretendard, "Noto Sans KR", "Noto Sans JP", "Noto Sans SC", system-ui, sans-serif';
  ctx.fillStyle = '#fffaf2';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#b45309';
  ctx.font = `800 30px ${font}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, W / 2, 70);
  ctx.fillStyle = '#1c1917';
  ctx.font = `900 52px ${font}`;
  const goalLines = wrapText(m.goal || '2027', CJK.has(locale) ? 16 : 30, 2);
  goalLines.forEach((l, i) => ctx.fillText(l, W / 2, 140 + i * 60 - (goalLines.length - 1) * 30));

  const size = W - pad * 2;
  const cell = size / 9;
  const rows = gridRows(m);
  const maxChars = CJK.has(locale) ? 6 : 11;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const x = pad + c * cell;
      const y = top + r * cell;
      const block = Math.floor(r / 3) * 3 + Math.floor(c / 3);
      const inner = (r % 3) * 3 + (c % 3);
      const isGoal = block === 4 && inner === 4;
      const isSub = block === 4 || inner === 4;
      ctx.fillStyle = isGoal ? '#b45309' : isSub ? '#fde7c4' : '#ffffff';
      ctx.fillRect(x, y, cell, cell);
      ctx.strokeStyle = '#e7d8c3';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
      const text = rows[r][c];
      if (!text) continue;
      ctx.fillStyle = isGoal ? '#ffffff' : '#1c1917';
      const fs = isSub ? 19 : 17;
      ctx.font = `${isSub ? 800 : 500} ${fs}px ${font}`;
      const lines = wrapText(text, maxChars, 4);
      const lh = fs * 1.2;
      lines.forEach((l, i) => ctx.fillText(l, x + cell / 2, y + cell / 2 + (i - (lines.length - 1) / 2) * lh, cell - 8));
    }
  }
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 4;
  for (let i = 0; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(pad + i * cell * 3, top);
    ctx.lineTo(pad + i * cell * 3, top + size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pad, top + i * cell * 3);
    ctx.lineTo(pad + size, top + i * cell * 3);
    ctx.stroke();
  }
  ctx.fillStyle = '#78716c';
  ctx.font = `600 24px ${font}`;
  ctx.fillText(`oiyo.net/${locale}/mandalart-2027`, W / 2, H - 44);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
}

export default function Mandalart2027({ locale = 'ko' }: { locale?: Locale }) {
  const t = S[locale] ?? S.en;
  const [m, setM] = useState<Mandalart>(emptyMandalart);
  const [block, setBlock] = useState(4);
  const [loaded, setLoaded] = useState(false);
  const [imgState, setImgState] = useState<'idle' | 'working' | 'done' | 'error'>('idle');
  const [armClear, setArmClear] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setM(load());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(m));
    } catch {
      /* 저장 불가(사생활 보호 모드 등)면 이번 화면에서만 쓴다 */
    }
  }, [m, loaded]);

  const { filled, total } = useMemo(() => filledCount(m), [m]);

  function setCell(b: number, c: number, value: string) {
    const v = value.slice(0, MAX_LEN);
    gaEventOnce('tool_used', { tool_id: 'mandalart-2027' });
    setM((prev) => {
      const next: Mandalart = { goal: prev.goal, subs: [...prev.subs], actions: prev.actions.map((r) => [...r]) };
      if (b === 4) {
        if (c === 4) next.goal = v;
        else next.subs[BLOCK_TO_SUB[c]!] = v;
      } else {
        const sub = BLOCK_TO_SUB[b]!;
        if (c === 4) next.subs[sub] = v;
        else next.actions[sub][BLOCK_TO_SUB[c]!] = v;
      }
      return next;
    });
  }

  function pickBlock(b: number) {
    setBlock(b);
    requestAnimationFrame(() => editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  }

  async function saveImage() {
    if (imgState === 'working') return;
    setImgState('working');
    gaEvent('share_click', { test_id: 'mandalart-2027', share_surface: 'image' });
    try {
      const blob = await drawImage(m, locale, t.imageTitle);
      if (!blob) throw new Error('no blob');
      const file = new File([blob], 'mandalart-2027.png', { type: 'image/png' });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        try {
          await nav.share({ files: [file], title: t.imageTitle });
          setImgState('done');
          return;
        } catch (e) {
          if ((e as DOMException)?.name === 'AbortError') {
            setImgState('idle');
            return;
          }
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mandalart-2027.png';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setImgState('done');
      gaEventOnce('test_completed', { test_id: 'mandalart-2027', funnel_source: 'component' });
    } catch {
      setImgState('error');
    }
  }

  function clearAll() {
    if (!armClear) {
      setArmClear(true);
      setTimeout(() => setArmClear(false), 4000);
      return;
    }
    setArmClear(false);
    setM(emptyMandalart());
    setBlock(4);
  }

  const blockName = (b: number) => (b === 4 ? t.goal : cellText(m, b, 4) || `${t.sub} ${BLOCK_TO_SUB[b]! + 1}`);
  const subMissing = block !== 4 && !m.subs[BLOCK_TO_SUB[block]!].trim();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-black text-foreground">{t.progress(filled, total)}</p>
        <progress className="h-2 w-40 overflow-hidden rounded-full accent-primary" value={filled} max={total} aria-hidden="true" />
      </div>

      <section aria-label={t.board}>
        <p className="mb-2 text-xs text-muted-foreground">{t.tapHint}</p>
        <div className="grid grid-cols-3 gap-1.5 rounded-2xl border border-border bg-card p-1.5">
          {Array.from({ length: 9 }, (_, b) => (
            <button
              key={b}
              type="button"
              onClick={() => pickBlock(b)}
              aria-pressed={block === b}
              aria-label={blockName(b)}
              className={`grid aspect-square grid-cols-3 gap-px overflow-hidden rounded-lg border-2 p-0.5 text-left transition ${block === b ? 'border-primary' : 'border-transparent'} ${b === 4 ? 'bg-primary/10' : 'bg-muted/40'}`}
            >
              {Array.from({ length: 9 }, (_, c) => {
                const text = cellText(m, b, c);
                const core = c === 4;
                return (
                  <span
                    key={c}
                    className={`flex items-center justify-center overflow-hidden rounded-sm px-px text-center text-xs leading-none ${core ? (b === 4 ? 'bg-primary font-black text-primary-foreground' : 'bg-primary/20 font-black text-foreground') : b === 4 ? 'bg-primary/20 font-bold text-foreground' : 'bg-background text-muted-foreground'}`}
                  >
                    <span className="line-clamp-2 break-all">{text}</span>
                  </span>
                );
              })}
            </button>
          ))}
        </div>
      </section>

      <section ref={editorRef} className="rounded-2xl border border-primary/40 bg-card p-4" aria-label={t.editing(blockName(block))}>
        <h3 className="text-base font-black text-foreground">{t.editing(blockName(block))}</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{block === 4 ? t.centerHint : t.outerHint}</p>
        {subMissing && <p className="mt-2 rounded-lg bg-primary/10 p-2 text-xs font-bold text-primary">{t.needSub}</p>}
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {Array.from({ length: 9 }, (_, c) => {
            const core = c === 4;
            const ph = block === 4 ? (core ? t.goalPh : `${t.subPh} ${BLOCK_TO_SUB[c]! + 1}`) : core ? t.subPh : t.actionPh;
            return (
              <textarea
                key={`${block}-${c}`}
                value={cellText(m, block, c)}
                onChange={(e) => setCell(block, c, e.target.value.replace(/\n/g, ' '))}
                placeholder={ph}
                aria-label={ph}
                maxLength={MAX_LEN}
                rows={3}
                className={`min-h-20 w-full resize-none rounded-lg border p-1.5 text-center text-base leading-tight sm:text-sm ${core ? 'border-primary bg-primary/10 font-black' : 'border-border bg-background'}`}
              />
            );
          })}
        </div>
        {block === 4 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SUB_TO_BLOCK.map((b, i) => (
              <button key={b} type="button" onClick={() => pickBlock(b)} className="min-h-11 rounded-lg border border-border px-3 text-xs font-bold text-foreground hover:border-primary">
                {m.subs[i] || `${t.sub} ${i + 1}`} →
              </button>
            ))}
          </div>
        )}
        {block !== 4 && (
          <button type="button" onClick={() => pickBlock(4)} className="mt-3 min-h-11 rounded-lg border border-border px-3 text-xs font-bold text-foreground hover:border-primary">
            ← {t.goal}
          </button>
        )}
      </section>

      <div className="grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={saveImage} className="min-h-12 rounded-xl bg-primary px-5 py-3 text-base font-bold text-primary-foreground hover:opacity-90">
          {imgState === 'working' ? t.saving : imgState === 'done' ? t.saved : imgState === 'error' ? t.failed : t.save}
        </button>
        {isEmptyMandalart(m) ? (
          <button type="button" onClick={() => setM(normalizeMandalart(t.sample))} className="min-h-12 rounded-xl border border-border px-5 py-3 text-base font-bold text-foreground hover:border-primary">
            {t.example}
          </button>
        ) : (
          <button type="button" onClick={clearAll} className={`min-h-12 rounded-xl border px-5 py-3 text-base font-bold ${armClear ? 'border-destructive text-destructive' : 'border-border text-muted-foreground'}`}>
            {armClear ? t.clearConfirm : t.clear}
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{t.stored}</p>
    </div>
  );
}
