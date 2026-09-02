// 온톨로지 개념 절 — 프로필 없이 읽는 개념 카드.
//
// lane 3개(innate·test·chosen)는 **내 좌표**를 다룬다. 그런데 이 사이트가 쓰는
// 개념 중에는 좌표가 아닌 것이 있다. 아카식 레코드가 그렇다 — 사람마다 값이
// 달라지는 것이 아니라 "그런 개념이 있다"는 설명이다. 그것을 좌표 lane 에 섞으면
// 방문자는 입력해야 볼 수 있는 것으로 오해한다.
//
// 세계관: 세계수가 화자다(2026-09-01 결정). 개념은 "나무가 간직한 기록"으로
// 소개하되, **신화 고유명을 UI 라벨로 쓰지 않고** 특정 신앙의 교리로 읽히지
// 않게 세 층(역사적·신앙적·현대적)을 분리해 표시한다. 이 분리는 아카식 PRD 의
// 수용 기준이다.
import type { Locale } from '../i18n';

export interface OntologyConcept {
  id: string;
  emoji: string;
  /** ontology-wiki-bridges 의 WIKI_DEF_LOCALES 키. 살아 있는 정의만 등재된다. */
  wikiSlug: string;
  /**
   * oiyo 안의 해설 경로(로케일 접두사 없이). 있으면 wiki 대신 이쪽으로 잇는다.
   * 2026-09-03: 아카식 해설이 wiki 에서 oiyo 로 옮겨졌다.
   */
  aboutPath?: string;
  name: Record<Locale, string>;
  /** 한 문장 요약. 단정하지 않는다. */
  summary: Record<Locale, string>;
  /** 세 층은 반드시 함께 보인다. 하나만 보이면 그 층이 사실처럼 읽힌다. */
  layers: {
    historical: Record<Locale, string>;
    faith: Record<Locale, string>;
    modern: Record<Locale, string>;
  };
}

export const LAYER_LABELS: Record<'historical' | 'faith' | 'modern', Record<Locale, string>> = {
  historical: {
    ko: '역사적으로', en: 'Historically', ja: '歴史的には', zh: '从历史来看', fr: 'Historiquement', es: 'Históricamente',
  },
  faith: {
    ko: '믿음의 자리에서', en: 'As a belief', ja: '信仰としては', zh: '作为信仰', fr: 'En tant que croyance', es: 'Como creencia',
  },
  modern: {
    ko: '오늘의 쓰임은', en: 'Used today', ja: '現代の使われ方', zh: '当代用法', fr: "Usage actuel", es: 'Uso actual',
  },
};

export const ONTOLOGY_CONCEPTS: OntologyConcept[] = [
  {
    id: 'akashic-records',
    emoji: '📜',
    wikiSlug: 'meaning-of-akashic-records',
    aboutPath: '/akashic-records/about',
    name: {
      ko: '아카식 레코드', en: 'Akashic Records', ja: 'アカシックレコード',
      zh: '阿卡西记录', fr: 'Annales akashiques', es: 'Registros akáshicos',
    },
    summary: {
      ko: '모든 일이 어딘가에 기록돼 있다는 생각. 좌표가 아니라 개념이라, 생년월일을 넣지 않아도 읽을 수 있습니다.',
      en: 'The idea that everything that happens is recorded somewhere. It is a concept rather than a coordinate, so it reads without entering a birth date.',
      ja: '起きたことはどこかに記録されているという考え。座標ではなく概念なので、生年月日を入れなくても読めます。',
      zh: '一种认为万事皆有记录的观念。它是概念而非坐标，无需输入生日即可阅读。',
      fr: "L'idée que tout ce qui arrive est consigné quelque part. C'est un concept et non une coordonnée : nul besoin d'une date de naissance.",
      es: 'La idea de que todo lo que ocurre queda registrado en algún lugar. Es un concepto, no una coordenada: se lee sin fecha de nacimiento.',
    },
    layers: {
      historical: {
        ko: '19세기 말 신지학 운동에서 산스크리트어 ākāśa(허공·에테르)를 빌려 쓴 표현으로 퍼졌습니다. 그보다 오래된 단일 원전이 확인된 것은 아닙니다.',
        en: 'The phrase spread through the late-19th-century Theosophical movement, borrowing the Sanskrit ākāśa (space, ether). No single older source text is established.',
        ja: '19世紀末の神智学運動でサンスクリット語 ākāśa（虚空・エーテル）を借りて広まった表現です。それより古い単一の原典が確認されているわけではありません。',
        zh: '该说法经由19世纪末的神智学运动传播，借用梵语 ākāśa（虚空、以太）。并没有确认更早的单一原典。',
        fr: "L'expression s'est diffusée via le mouvement théosophique de la fin du XIXe siècle, empruntant le sanskrit ākāśa (espace, éther). Aucun texte source plus ancien n'est établi.",
        es: 'La expresión se difundió con el movimiento teosófico de finales del siglo XIX, tomando el sánscrito ākāśa (espacio, éter). No hay un texto fuente más antiguo establecido.',
      },
      faith: {
        ko: '어떤 전통에서는 이 기록에 닿을 수 있다고 믿습니다. 이는 믿음의 영역이며, 이 사이트는 그 접근을 제공하지도 검증하지도 않습니다.',
        en: 'Some traditions hold that these records can be reached. That belongs to belief; this site neither offers nor verifies such access.',
        ja: '一部の伝統では、この記録に触れられると信じられています。これは信仰の領域であり、当サイトはその接近を提供も検証もしません。',
        zh: '某些传统相信可以接触这些记录。这属于信仰范畴，本站既不提供也不验证这种接触。',
        fr: "Certaines traditions estiment qu'on peut y accéder. Cela relève de la croyance ; ce site n'offre ni ne vérifie un tel accès.",
        es: 'Algunas tradiciones sostienen que se puede acceder a ellos. Eso pertenece a la creencia; este sitio no ofrece ni verifica tal acceso.',
      },
      modern: {
        ko: '오늘날에는 대개 은유로 쓰입니다 — 지나온 선택과 사건을 한자리에 놓고 보는 방식. 이 사이트에서도 그 뜻으로만 씁니다.',
        en: 'Today it is mostly used as a metaphor — a way of laying past choices and events side by side. That is the only sense used here.',
        ja: '今日ではほとんど比喩として使われます — これまでの選択と出来事を並べて見る方法です。当サイトでもその意味でのみ使います。',
        zh: '今天它多用作隐喻——把过往的选择与事件并置观看的一种方式。本站也只在此意义上使用。',
        fr: "Aujourd'hui, c'est surtout une métaphore : une manière de mettre côte à côte choix et événements passés. C'est le seul sens retenu ici.",
        es: 'Hoy se usa sobre todo como metáfora: una forma de poner lado a lado decisiones y hechos pasados. Ese es el único sentido aquí.',
      },
    },
  },
];

export const CONCEPT_SECTION: Record<Locale, { title: string; sub: string }> = {
  ko: { title: '📜 개념 — 나무가 간직한 기록', sub: '좌표가 아니라 개념입니다. 입력 없이 읽을 수 있고, 각 주장은 역사·믿음·오늘의 쓰임으로 나눠 표시합니다.' },
  en: { title: '📜 Concepts — what the tree keeps', sub: 'Concepts, not coordinates. They read without any input, and each claim is split into history, belief, and present-day use.' },
  ja: { title: '📜 概念 — 樹が保つ記録', sub: '座標ではなく概念です。入力なしで読め、各主張は歴史・信仰・現代の用法に分けて示します。' },
  zh: { title: '📜 概念 — 树所保存的记录', sub: '这是概念而非坐标。无需输入即可阅读，每项说法都分为历史、信仰与当代用法。' },
  fr: { title: '📜 Concepts — ce que garde l’arbre', sub: 'Des concepts, pas des coordonnées. Ils se lisent sans rien saisir, et chaque affirmation est séparée en histoire, croyance et usage actuel.' },
  es: { title: '📜 Conceptos — lo que guarda el árbol', sub: 'Conceptos, no coordenadas. Se leen sin introducir nada y cada afirmación se separa en historia, creencia y uso actual.' },
};
