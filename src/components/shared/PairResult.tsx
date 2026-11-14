import { useEffect, useRef, useState, type ReactNode } from 'react';

import { gaEvent } from '@/lib/analytics/ga-event';
import { buildPairUrl, readPairCode } from '@/lib/pair-result';

// 둘이 하는 결과 링크의 공용 화면. 결과 비교 문장은 테스트마다 다르므로
// renderCompare 로 받고, 여기서는 초대 버튼·도착 안내·측정만 맡는다.
// 측정 계약(2026-11-03 메모 1번): pair_link_created → pair_link_opened →
// pair_completed. 2주 동안 pair_completed 30건 미만이면 다른 테스트로 넓히지 않는다.

type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es';

const COPY: Record<Locale, {
  inviteTitle: string;
  inviteBody: string;
  invite: string;
  copied: string;
  failed: string;
  shareText: string;
  arrived: string;
  compareTitle: string;
  limit: string;
}> = {
  ko: {
    inviteTitle: '둘이 같이 보기',
    inviteBody: '이 링크를 받은 사람이 같은 테스트를 끝내면, 두 결과를 한 화면에 겹쳐 볼 수 있어요. 내 이름이나 답변은 보내지 않아요.',
    invite: '상대에게 테스트 보내기',
    copied: '링크를 복사했어요. 메신저에 붙여 넣어 보내세요.',
    failed: '복사하지 못했어요. 주소창의 링크를 직접 보내 주세요.',
    shareText: '나랑 같은 테스트 해 보고 결과 겹쳐 보자!',
    arrived: '함께 보자는 링크로 오셨어요. 끝까지 답하면 보낸 사람의 결과와 겹쳐 볼 수 있어요. 상대 결과는 다 끝난 뒤에 보여요.',
    compareTitle: '우리 둘',
    limit: '맞다·안 맞다를 판정하지 않아요. 서로 다른 점은 대화를 시작할 질문으로 읽어 주세요.',
  },
  en: {
    inviteTitle: 'See it together',
    inviteBody: 'When the person you send this to finishes the same test, you can see both results side by side. Your name and answers are not sent.',
    invite: 'Send the test to someone',
    copied: 'Link copied. Paste it into a message.',
    failed: 'Could not copy. Please send the link from the address bar.',
    shareText: 'Take the same test as me and let’s compare results!',
    arrived: 'You came from a “let’s compare” link. Finish the test to see your result next to the sender’s. Their result appears only after you finish.',
    compareTitle: 'The two of us',
    limit: 'This is not a match score. Read the differences as questions to start a conversation.',
  },
  ja: {
    inviteTitle: 'ふたりで見る',
    inviteBody: 'このリンクを受け取った人が同じテストを終えると、ふたりの結果を一画面で重ねて見られます。名前や回答は送られません。',
    invite: '相手にテストを送る',
    copied: 'リンクをコピーしました。メッセージに貼り付けて送ってください。',
    failed: 'コピーできませんでした。アドレスバーのリンクを送ってください。',
    shareText: '同じテストをやって、結果を重ねてみよう！',
    arrived: '「一緒に見よう」リンクから来ました。最後まで答えると、送った人の結果と重ねて見られます。相手の結果は終わった後に表示されます。',
    compareTitle: 'わたしたちふたり',
    limit: '相性の良し悪しを判定しません。違いは会話を始める問いとして読んでください。',
  },
  zh: {
    inviteTitle: '两个人一起看',
    inviteBody: '收到链接的人完成同一个测验后，两人的结果会放在同一页对照。不会发送你的名字或答案。',
    invite: '把测验发给对方',
    copied: '链接已复制，粘贴到消息里发送吧。',
    failed: '复制失败，请直接发送地址栏里的链接。',
    shareText: '和我做同一个测验，一起对照结果吧！',
    arrived: '你是通过“一起看”链接来的。答完后可以和发送者的结果对照。对方的结果在你完成后才会显示。',
    compareTitle: '我们两个',
    limit: '这里不判定合不合适。请把不同之处当作开启对话的问题。',
  },
  fr: {
    inviteTitle: 'Comparer à deux',
    inviteBody: 'Quand la personne qui reçoit ce lien termine le même test, vos deux résultats s’affichent côte à côte. Ni votre nom ni vos réponses ne sont envoyés.',
    invite: 'Envoyer le test à quelqu’un',
    copied: 'Lien copié. Collez-le dans un message.',
    failed: 'Copie impossible. Envoyez le lien de la barre d’adresse.',
    shareText: 'Fais le même test que moi et comparons nos résultats !',
    arrived: 'Vous arrivez par un lien « comparons ». Terminez le test pour voir votre résultat à côté de celui de l’expéditeur. Son résultat n’apparaît qu’à la fin.',
    compareTitle: 'Nous deux',
    limit: 'Ce n’est pas un score de compatibilité. Lisez les différences comme des questions pour commencer à parler.',
  },
  es: {
    inviteTitle: 'Verlo juntos',
    inviteBody: 'Cuando quien reciba este enlace termine el mismo test, podréis ver los dos resultados juntos. No se envían tu nombre ni tus respuestas.',
    invite: 'Enviar el test a alguien',
    copied: 'Enlace copiado. Pégalo en un mensaje.',
    failed: 'No se pudo copiar. Envía el enlace de la barra de direcciones.',
    shareText: '¡Haz el mismo test que yo y comparemos resultados!',
    arrived: 'Llegaste por un enlace para comparar. Termina el test para ver tu resultado junto al de quien te lo envió. Su resultado aparece solo al final.',
    compareTitle: 'Nosotros dos',
    limit: 'No es una puntuación de compatibilidad. Lee las diferencias como preguntas para empezar a hablar.',
  },
};

function copyFor(locale: string) {
  return COPY[locale as Locale] ?? COPY.en;
}

function usePairCode(isValid: (code: string) => boolean): string | null {
  const [code, setCode] = useState<string | null>(null);
  useEffect(() => {
    setCode(readPairCode(window.location.search, isValid));
  }, [isValid]);
  return code;
}

/** 문항 화면 위: 초대 링크로 들어온 사람에게 왜 끝까지 해야 하는지 알린다. 상대 결과는 미리 보여 주지 않는다. */
export function PairArrivedNote({ locale, testId, isValid }: { locale: string; testId: string; isValid: (code: string) => boolean }) {
  const code = usePairCode(isValid);
  const sent = useRef(false);
  useEffect(() => {
    if (!code || sent.current) return;
    sent.current = true;
    gaEvent('pair_link_opened', { test_id: testId });
  }, [code, testId]);
  if (!code) return null;
  return (
    <p className="mb-4 rounded-xl border border-border bg-surface-subtle p-4 text-sm leading-6 text-foreground" role="status">
      💌 {copyFor(locale).arrived}
    </p>
  );
}

interface PanelProps {
  locale: string;
  testId: string;
  /** 내 결과 코드(받는 사람 주소에 실린다). */
  myCode: string;
  isValid: (code: string) => boolean;
  /** 상대 코드가 있을 때 비교 본문. */
  renderCompare: (theirCode: string) => ReactNode;
}

/** 결과 화면: 비교(링크로 왔다면) + 초대 버튼. */
export function PairResultPanel({ locale, testId, myCode, isValid, renderCompare }: PanelProps) {
  const t = copyFor(locale);
  const theirs = usePairCode(isValid);
  const [state, setState] = useState<'idle' | 'done' | 'error'>('idle');
  const completedSent = useRef(false);

  useEffect(() => {
    if (!theirs || completedSent.current) return;
    completedSent.current = true;
    gaEvent('pair_completed', { test_id: testId });
  }, [theirs, testId]);

  async function invite() {
    gaEvent('pair_link_created', { test_id: testId });
    const url = buildPairUrl(window.location.origin, window.location.pathname, myCode);
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ text: t.shareText, url });
        return;
      } catch (error) {
        // 사용자가 공유 시트를 닫은 경우 복사로 넘어가지 않는다(#47 환생 공유 취소와 같은 원칙).
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setState('done');
    } catch {
      setState('error');
    }
  }

  return (
    <section className="mt-6 space-y-4" aria-label={t.inviteTitle}>
      {theirs && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-lg font-black text-foreground">💞 {t.compareTitle}</h3>
          <div className="mt-3">{renderCompare(theirs)}</div>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">{t.limit}</p>
        </div>
      )}
      <div className="rounded-2xl border border-border bg-surface-subtle p-5">
        <h3 className="text-base font-bold text-foreground">{t.inviteTitle}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.inviteBody}</p>
        <button
          type="button"
          onClick={invite}
          className="mt-4 min-h-12 w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"
        >
          💌 {t.invite}
        </button>
        {state !== 'idle' && (
          <p className="mt-2 text-center text-xs text-muted-foreground" role="status">
            {state === 'done' ? t.copied : t.failed}
          </p>
        )}
      </div>
    </section>
  );
}
