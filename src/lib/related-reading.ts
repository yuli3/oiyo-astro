/**
 * Central topic → blog/wiki recommendation map (SSOT).
 * Every slug is verified to exist in ko/en/ja content dirs of the target repo
 * unless restricted via `locales`. zh/fr/es readers are routed to the en version.
 */

type L3 = { ko: string; en: string; ja: string };

export interface ReadingLink {
  site: 'blog' | 'wiki' | 'oiyo';
  slug: string;
  label: L3;
  /** restrict to these UI locales (e.g. slug missing in ja) */
  locales?: string[];
}

export type ReadingTopic =
  | 'mbti' | 'mbti-career' | 'big5' | 'enneagram' | 'attachment' | 'love-language'
  | 'self-esteem' | 'burnout' | 'sleep' | 'adhd' | 'anxiety' | 'social-anxiety'
  | 'depression' | 'narcissism' | 'anger' | 'empathy' | 'eq' | 'inner-strength'
  | 'lazy-perfectionist' | 'lethargy' | 'commute' | 'investor' | 'political'
  | 'authoritarian' | 'personal-color';

// Shared link constants (reused across topics)
const W = (slug: string, label: L3, locales?: string[]): ReadingLink => ({ site: 'wiki', slug, label, locales });
/** oiyo 자체 해설. 2026-09-02 에 wiki 에서 넘겨받은 6개 주제가 여기 속한다. */
const O = (slug: string, label: L3, locales?: string[]): ReadingLink => ({ site: 'oiyo', slug, label, locales });
const B = (slug: string, label: L3, locales?: string[]): ReadingLink => ({ site: 'blog', slug, label, locales });

const wikiMbti = O('mbti/about', { ko: 'MBTI란 무엇인가', en: 'What is MBTI', ja: 'MBTIとは何か' });
const wikiEmotionReg = O('emotion-regulation/about', { ko: '감정 조절이란', en: 'What is emotion regulation', ja: '感情調節とは' });
const wikiBiases = O('cognitive-bias/about', { ko: '인지 편향 사전', en: 'Cognitive biases', ja: '認知バイアスとは' });
const wikiAttachment = O('attachment-style/about', { ko: '애착 이론이란', en: 'Attachment theory', ja: '愛着理論とは' });

const blogDarkTriad = B('dark-triad-human-nature-shadow', { ko: '다크 트라이어드 — 인간 본성의 그림자', en: 'The Dark Triad — shadow of human nature', ja: 'ダークトライアド — 人間性の影' });
const blogAbilene = B('abilene-paradox-groupthink', { ko: '애빌린 패러독스와 집단사고', en: 'The Abilene paradox & groupthink', ja: 'アビリーンのパラドックスと集団思考' });
const blogLookingGlass = B('looking-glass-self-cooley', { ko: '거울 자아 — 쿨리의 사회심리학', en: 'The looking-glass self', ja: '鏡映自己 — クーリーの社会心理学' });
const blogBurnoutDopamine = B('burnout-recovery-dopamine-reset', { ko: '번아웃 회복 — 도파민 리셋', en: 'Burnout recovery — dopamine reset', ja: 'バーンアウト回復 — ドーパミンリセット' });
const blogPurpose = O('power-of-purpose', { ko: '목적의 힘', en: 'The power of purpose', ja: '目的の力' });
const blogFiveLove = B('five-love-languages-connection', { ko: '5가지 사랑의 언어', en: 'The five love languages', ja: '5つの愛の言語' });

const TOPICS: Record<ReadingTopic, ReadingLink[]> = {
  mbti: [
    O('8-cognitive-functions-deep-dive', { ko: '8가지 인지기능 깊이 읽기', en: '8 cognitive functions, in depth', ja: '8つの認知機能を深く読む' }),
    B('mbti-loops-grips-mental-rut', { ko: 'MBTI 루프와 그립 — 마음의 수렁', en: 'MBTI loops & grips', ja: 'MBTIループとグリップ' }),
    wikiMbti,
  ],
  'mbti-career': [
    blogPurpose,
    wikiMbti,
  ],
  big5: [
    O('big5/about', { ko: '빅파이브 5요인 모델', en: 'The Big Five model', ja: 'ビッグファイブ5因子モデル' }),
    O('hexaco/about', { ko: 'HEXACO 6요인 모델', en: 'The HEXACO model', ja: 'HEXACO 6因子モデル' }),
    O('evolving-self-saju-mbti', { ko: '사주와 MBTI로 보는 진화하는 나', en: 'The evolving self: Saju & MBTI', ja: '四柱とMBTIで見る進化する自分' }),
  ],
  enneagram: [
    O('enneagram-mbti-integration', { ko: '에니어그램 × MBTI 통합하기', en: 'Integrating Enneagram × MBTI', ja: 'エニアグラム×MBTIの統合' }),
    B('enneagram-love-relationships', { ko: '에니어그램과 사랑의 관계', en: 'Enneagram in love & relationships', ja: 'エニアグラムと愛の関係' }),
    O('enneagram/test', { ko: '에니어그램의 기원과 구조', en: 'Origin of the Enneagram', ja: 'エニアグラムの起源と構造' }),
  ],
  attachment: [
    B('attachment-theory-adults', { ko: '성인 애착 이론', en: 'Attachment theory for adults', ja: '大人の愛着理論' }),
    wikiAttachment,
    blogFiveLove,
  ],
  'love-language': [
    blogFiveLove,
    B('enneagram-love-relationships', { ko: '에니어그램과 사랑의 관계', en: 'Enneagram in love & relationships', ja: 'エニアグラムと愛の関係' }),
    wikiAttachment,
  ],
  'self-esteem': [
    blogLookingGlass,
  ],
  burnout: [blogBurnoutDopamine, O('burnout/about', { ko: '번아웃이란 무엇인가', en: 'What is burnout', ja: 'バーンアウトとは' })],
  sleep: [
    B('chronotypes-sleep-biology-optimization', { ko: '크로노타입 — 수면 생물학 최적화', en: 'Chronotypes & sleep biology', ja: 'クロノタイプと睡眠生物学' }),
    O('chronotypes/about', { ko: '크로노타입이란', en: 'What are chronotypes', ja: 'クロノタイプとは' }),
  ],
  adhd: [
  ],
  anxiety: [ wikiEmotionReg],
  'social-anxiety': [ blogLookingGlass],
  narcissism: [
    B('mythology-narcissus-echo-self-love', { ko: '나르키소스와 에코 — 자기애의 신화', en: 'Narcissus & Echo — the myth of self-love', ja: 'ナルキッソスとエコー — 自己愛の神話' }),
    blogDarkTriad,
  ],
  anger: [
    O('jung-shadow-psychology', { ko: '융의 그림자 심리학', en: "Jung's shadow psychology", ja: 'ユングの影の心理学' }),
    wikiEmotionReg,
    B('anger-management-psychology', { ko: '분노 관리의 심리학', en: 'The psychology of anger management', ja: '怒りの心理学' }, ['ko', 'en', 'zh', 'fr', 'es']),
  ],
  empathy: [
    B('magazine-empathy-types-and-test', { ko: '인지·정서·자비적 공감 이해하기', en: 'Cognitive, affective & compassionate empathy', ja: '認知・情動・思いやりの共感を理解する' }),
    B('empathy-types-and-boundaries', { ko: '공감 유형과 건강한 경계', en: 'Empathy styles & healthy boundaries', ja: '' }, ['ko', 'en']),
  ],
  eq: [
    wikiEmotionReg,
    O('tci/about', { ko: 'TCI 기질·성격 검사란', en: 'The TCI model', ja: 'TCI気質・性格検査とは' }),
    B('mbti-loops-grips-mental-rut', { ko: 'MBTI 루프와 그립 — 마음의 수렁', en: 'MBTI loops & grips', ja: 'MBTIループとグリップ' }),
  ],
  'inner-strength': [
    O('viktor-frankl-purpose', { ko: '빅터 프랭클 — 의미를 찾아서', en: 'Viktor Frankl — the search for meaning', ja: 'フランクル — 意味を求めて' }),
    blogPurpose,
  ],
  'lazy-perfectionist': [
    O('habit-builder/about', { ko: '실행 의도 기법', en: 'Implementation intentions', ja: '実行意図とは' }),
    B('dont-postpone-yourself', { ko: '자신을 미루지 마세요', en: "Don't postpone yourself", ja: '自分を後回しにしない' }),
  ],
  lethargy: [ blogBurnoutDopamine],
  commute: [
    O('cognitive-load/about', { ko: '인지 부하란', en: 'Cognitive load', ja: '認知負荷とは' }),
    O('flow-state-happiness-psychology', { ko: '몰입과 행복의 심리학', en: 'Flow & the psychology of happiness', ja: 'フローと幸福の心理学' }),
  ],
  investor: [
    wikiBiases,
  ],
  political: [blogAbilene, wikiBiases, blogDarkTriad],
  authoritarian: [blogDarkTriad, wikiBiases, blogAbilene],
  'personal-color': [
    B('color-psychology-complete-guide', { ko: '색채 심리학 완전 가이드', en: '', ja: '' }, ['ko']),
    O('moon-sign-secret-self', { ko: '월 별자리 — 숨겨진 자아', en: 'Moon sign — the secret self', ja: '月星座 — 秘められた自分' }),
  ],
};

const HOSTS = { blog: 'https://blog.oiyo.net', wiki: 'https://wiki.oiyo.net', oiyo: '' } as const;
const ICONS = { blog: '📖', wiki: '📚', oiyo: '🌳' } as const;

/** Content locale on blog/wiki: ko→ko, ja→ja, everything else → en. */
function contentLocale(locale: string): 'ko' | 'en' | 'ja' {
  return locale === 'ko' || locale === 'ja' ? locale : 'en';
}

export function getRelatedReading(topic: ReadingTopic, locale: string): { href: string; label: string }[] {
  const cl = contentLocale(locale);
  return (TOPICS[topic] ?? [])
    .filter((l) => !l.locales || l.locales.includes(locale))
    .map((l) => {
      // oiyo 내부 해설은 6로케일 전부 존재한다 — blog/wiki 처럼 en 으로 접지 않는다.
      const target = l.site === 'oiyo' ? locale : cl;
      return {
        href: `${HOSTS[l.site]}/${target}/${l.slug}/`,
        label: `${ICONS[l.site]} ${l.label[cl] || l.label.en}`,
      };
    });
}
