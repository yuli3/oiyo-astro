import { useEffect, useRef, useState } from 'react';

import { gaEvent } from '../../../lib/analytics/ga-event';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../ui/card';
import { Spinner } from '../../ui/spinner';

// ChatGPT plan interpretation of an already-calculated chart.
// Design: company-brain projects/oiyo-ecosystem/chatgpt-plan-interpretation-supplement-2026-10-12.md
// Built dark on 2026-10-12 while OpenAI reviews the client ID request: renders
// nothing unless PUBLIC_SIWC_ENABLED=1 at build time AND the server reports enabled.
const FEATURE_ON = import.meta.env.PUBLIC_SIWC_ENABLED === '1';
const MANAGE_USAGE_URL = 'https://chatgpt.com/settings/usage';
const WELCOME_SEEN_KEY = 'oiyo:siwc:welcome-seen';

type Locale = 'ko' | 'en' | 'ja' | 'fr' | 'es' | 'zh';

export interface InterpretationPillar {
  stem: number;
  branch: number;
}

export interface InterpretationPillars {
  year: InterpretationPillar;
  month: InterpretationPillar;
  day: InterpretationPillar;
  hour: InterpretationPillar | null;
}

type ErrorCode =
  | 'not-connected' | 'no-plan-scope' | 'not-eligible' | 'usage-limit' | 'temporarily-unavailable'
  | 'region-or-policy' | 'reconnect' | 'rate-limited' | 'misconfigured' | 'unknown';

type ReturnStatus = 'connected' | 'no-plan-scope' | 'denied' | 'failed' | 'expired';

interface Copy {
  title: string;
  aiLabel: string;
  consent: string;
  continue: string;
  usingPlan: string;
  manageUsage: string;
  generate: string;
  generating: string;
  regenerate: string;
  clear: string;
  disconnect: string;
  disconnectedNotConfirmed: string;
  notice: string;
  filtered: string;
  truncated: string;
  stopped: string;
  welcomeTitle: string;
  welcomeBody: string;
  gotIt: string;
  returnStatus: Record<Exclude<ReturnStatus, 'connected'>, string>;
  errors: Record<ErrorCode, string>;
}

const COPY: Record<Locale, Copy> = {
  ko: {
    title: '내 결과 풀어 읽기',
    aiLabel: 'ChatGPT가 풀어 쓴 글',
    consent: '계산된 값(네 기둥·오행)만 OpenAI로 보내고, 내 ChatGPT 구독 한도로 풀이를 받아요. 생년월일·이름은 보내지 않고, OIYO는 글을 저장하지 않아요.',
    continue: 'Continue with ChatGPT',
    usingPlan: 'ChatGPT 요금제 사용 중',
    manageUsage: '사용량 관리',
    generate: '풀이 받기',
    generating: '쓰는 중…',
    regenerate: '다시 쓰기',
    clear: '지우기',
    disconnect: '연결 끊기',
    disconnectedNotConfirmed: '이 브라우저의 연결은 끊었어요. ChatGPT 설정에서 앱 연결도 끊을 수 있어요.',
    notice: 'AI가 계산 결과를 바탕으로 쓴 글이라 매번 조금씩 달라질 수 있어요. 상징 해석이며 과학적 근거가 없고, 건강·법률·돈에 관한 결정에 쓰지 마세요.',
    filtered: '안내 기준에 맞지 않는 문장 일부를 걸렀어요.',
    truncated: '여기까지 보여 드려요.',
    stopped: '중간에 멈췄어요. 받은 부분까지만 보여 드려요.',
    welcomeTitle: '내 ChatGPT 요금제를 쓰고 있어요',
    welcomeBody: '이 풀이는 내 ChatGPT 요금제 사용량에서 나가요. 사용량은 ChatGPT 설정에서 관리할 수 있어요.',
    gotIt: '확인',
    returnStatus: {
      'no-plan-scope': '구독 사용을 허용해야 풀이를 받을 수 있어요. 다시 연결할 때 요금제 사용을 허용해 주세요.',
      denied: '연결을 취소했어요.',
      failed: '연결하지 못했어요. 잠시 뒤 다시 시도해 주세요.',
      expired: '연결 시간이 지났어요. 다시 시도해 주세요.',
    },
    errors: {
      'not-connected': 'ChatGPT 연결이 끝났어요. 다시 연결해 주세요.',
      'no-plan-scope': '구독 사용을 허용해야 풀이를 받을 수 있어요.',
      'not-eligible': '이 ChatGPT 계정에서는 요금제 사용을 쓸 수 없어요.',
      'usage-limit': '사용 한도에 닿았어요. 요금제 전체가 아니라 이 앱 한도일 수 있어요.',
      'temporarily-unavailable': '지금은 확인할 수 없어요. 잠시 뒤 다시 시도해 주세요.',
      'region-or-policy': '지금 계신 곳이나 계정 정책 때문에 쓸 수 없을 수 있어요.',
      reconnect: '연결을 다시 확인해야 해요. 다시 연결해 주세요.',
      'rate-limited': '한 번 연결에 다섯 번까지 쓸 수 있어요.',
      misconfigured: '지금은 쓸 수 없어요. 계산 결과는 그대로 볼 수 있어요.',
      unknown: '풀이를 받지 못했어요. 계산 결과는 그대로 볼 수 있어요.',
    },
  },
  en: {
    title: 'Read my result in plain words',
    aiLabel: 'Written by ChatGPT',
    consent: 'Only the calculated values (four pillars and elements) go to OpenAI, and the explanation uses your own ChatGPT plan. Your birth date and name are not sent, and OIYO does not store the text.',
    continue: 'Continue with ChatGPT',
    usingPlan: 'Using ChatGPT plan',
    manageUsage: 'Manage usage',
    generate: 'Explain my result',
    generating: 'Writing…',
    regenerate: 'Write again',
    clear: 'Clear',
    disconnect: 'Disconnect',
    disconnectedNotConfirmed: 'Disconnected in this browser. You can also disconnect the app in ChatGPT settings.',
    notice: 'AI-written from your calculated result, so it can differ each time. Symbolic interpretation, not science; do not use it for health, legal or money decisions.',
    filtered: 'Some sentences that crossed our guidelines were removed.',
    truncated: 'That is as far as we show.',
    stopped: 'It stopped part-way. Showing what arrived.',
    welcomeTitle: "You're using your ChatGPT plan",
    welcomeBody: 'This explanation uses your ChatGPT plan. You can manage usage in ChatGPT settings.',
    gotIt: 'Got it',
    returnStatus: {
      'no-plan-scope': 'Plan use needs to be allowed for an explanation. Allow it when you connect again.',
      denied: 'You cancelled the connection.',
      failed: 'Could not connect. Please try again shortly.',
      expired: 'The connection timed out. Please try again.',
    },
    errors: {
      'not-connected': 'Your ChatGPT connection ended. Please connect again.',
      'no-plan-scope': 'Plan use needs to be allowed for an explanation.',
      'not-eligible': 'Plan use is not available for this ChatGPT account.',
      'usage-limit': 'Usage limit reached. The limit may be for this app rather than your whole plan.',
      'temporarily-unavailable': 'Usage could not be checked right now. Please try again shortly.',
      'region-or-policy': 'This may not be available where you are or under your account policy.',
      reconnect: 'Your connection needs to be checked again. Please reconnect.',
      'rate-limited': 'You can use this up to five times per connection.',
      misconfigured: 'Not available right now. Your calculated result is unchanged.',
      unknown: 'Could not get an explanation. Your calculated result is unchanged.',
    },
  },
  ja: {
    title: '自分の結果をことばで読む',
    aiLabel: 'ChatGPTが書いた解説',
    consent: '計算した値（四柱・五行）だけをOpenAIに送り、ご自身のChatGPTプランで解説を受け取ります。生年月日や名前は送らず、OIYOは文章を保存しません。',
    continue: 'Continue with ChatGPT',
    usingPlan: 'ChatGPTプランを使用中',
    manageUsage: '使用量を管理',
    generate: '解説を受け取る',
    generating: '作成中…',
    regenerate: 'もう一度書く',
    clear: '消す',
    disconnect: '接続を解除',
    disconnectedNotConfirmed: 'このブラウザでの接続を解除しました。ChatGPTの設定からアプリの接続も解除できます。',
    notice: '計算結果をもとにAIが書いた文章なので、毎回少しずつ変わることがあります。象徴的な解釈で科学的根拠はなく、健康・法律・お金の判断には使わないでください。',
    filtered: 'ガイドラインに合わない文の一部を除きました。',
    truncated: 'ここまで表示します。',
    stopped: '途中で止まりました。受け取った部分まで表示します。',
    welcomeTitle: 'ChatGPTプランを使っています',
    welcomeBody: 'この解説はご自身のChatGPTプランの使用量から使われます。使用量はChatGPTの設定で管理できます。',
    gotIt: 'OK',
    returnStatus: {
      'no-plan-scope': '解説を受け取るにはプランの使用を許可する必要があります。次に接続するときに許可してください。',
      denied: '接続をキャンセルしました。',
      failed: '接続できませんでした。しばらくしてからもう一度お試しください。',
      expired: '接続の時間が切れました。もう一度お試しください。',
    },
    errors: {
      'not-connected': 'ChatGPTとの接続が切れました。もう一度接続してください。',
      'no-plan-scope': '解説を受け取るにはプランの使用を許可する必要があります。',
      'not-eligible': 'このChatGPTアカウントではプランの使用ができません。',
      'usage-limit': '使用上限に達しました。プラン全体ではなく、このアプリの上限かもしれません。',
      'temporarily-unavailable': '今は確認できません。しばらくしてからもう一度お試しください。',
      'region-or-policy': 'お住まいの地域やアカウントのポリシーにより使えない場合があります。',
      reconnect: '接続をもう一度確認する必要があります。再接続してください。',
      'rate-limited': '1回の接続で5回まで使えます。',
      misconfigured: '今は使えません。計算結果はそのままご覧いただけます。',
      unknown: '解説を受け取れませんでした。計算結果はそのままご覧いただけます。',
    },
  },
  zh: {
    title: '用文字读懂我的结果',
    aiLabel: 'ChatGPT 撰写的解读',
    consent: '只把计算出的数值（四柱、五行）发送给 OpenAI，并用你自己的 ChatGPT 套餐生成解读。不会发送出生日期和姓名，OIYO 也不保存文字。',
    continue: 'Continue with ChatGPT',
    usingPlan: '正在使用 ChatGPT 套餐',
    manageUsage: '管理用量',
    generate: '获取解读',
    generating: '撰写中…',
    regenerate: '重新撰写',
    clear: '清除',
    disconnect: '断开连接',
    disconnectedNotConfirmed: '已在此浏览器中断开连接。你也可以在 ChatGPT 设置中断开应用连接。',
    notice: '这是 AI 根据计算结果撰写的文字，每次可能略有不同。属于象征性解读，没有科学依据，请勿用于健康、法律或金钱方面的决定。',
    filtered: '已移除部分不符合准则的句子。',
    truncated: '只显示到这里。',
    stopped: '中途停止了，只显示已收到的部分。',
    welcomeTitle: '你正在使用自己的 ChatGPT 套餐',
    welcomeBody: '这份解读会消耗你的 ChatGPT 套餐用量。你可以在 ChatGPT 设置中管理用量。',
    gotIt: '知道了',
    returnStatus: {
      'no-plan-scope': '需要允许使用套餐才能获取解读。再次连接时请允许。',
      denied: '你取消了连接。',
      failed: '无法连接，请稍后再试。',
      expired: '连接已超时，请重试。',
    },
    errors: {
      'not-connected': 'ChatGPT 连接已结束，请重新连接。',
      'no-plan-scope': '需要允许使用套餐才能获取解读。',
      'not-eligible': '此 ChatGPT 账户无法使用套餐。',
      'usage-limit': '已达到用量上限。这可能是此应用的上限，而不是整个套餐的上限。',
      'temporarily-unavailable': '目前无法确认用量，请稍后再试。',
      'region-or-policy': '由于所在地区或账户政策，可能无法使用。',
      reconnect: '需要重新确认连接，请重新连接。',
      'rate-limited': '每次连接最多可使用五次。',
      misconfigured: '目前无法使用。计算结果不受影响。',
      unknown: '未能获取解读。计算结果不受影响。',
    },
  },
  fr: {
    title: 'Lire mon résultat en mots simples',
    aiLabel: 'Texte écrit par ChatGPT',
    consent: 'Seules les valeurs calculées (quatre piliers et éléments) sont envoyées à OpenAI, et l’explication utilise votre propre forfait ChatGPT. Votre date de naissance et votre nom ne sont pas envoyés, et OIYO ne conserve pas le texte.',
    continue: 'Continue with ChatGPT',
    usingPlan: 'Forfait ChatGPT utilisé',
    manageUsage: 'Gérer l’utilisation',
    generate: 'Expliquer mon résultat',
    generating: 'Rédaction…',
    regenerate: 'Réécrire',
    clear: 'Effacer',
    disconnect: 'Se déconnecter',
    disconnectedNotConfirmed: 'Déconnecté dans ce navigateur. Vous pouvez aussi déconnecter l’application dans les réglages de ChatGPT.',
    notice: 'Texte écrit par une IA à partir de votre résultat calculé ; il peut varier d’une fois à l’autre. Interprétation symbolique, sans fondement scientifique ; ne l’utilisez pas pour des décisions de santé, juridiques ou financières.',
    filtered: 'Certaines phrases contraires à nos règles ont été retirées.',
    truncated: 'Nous affichons jusqu’ici.',
    stopped: 'Le texte s’est arrêté en cours de route. Voici ce qui est arrivé.',
    welcomeTitle: 'Vous utilisez votre forfait ChatGPT',
    welcomeBody: 'Cette explication utilise votre forfait ChatGPT. Vous pouvez gérer l’utilisation dans les réglages de ChatGPT.',
    gotIt: 'Compris',
    returnStatus: {
      'no-plan-scope': 'L’utilisation du forfait doit être autorisée pour obtenir une explication. Autorisez-la lors de la prochaine connexion.',
      denied: 'Vous avez annulé la connexion.',
      failed: 'Connexion impossible. Réessayez dans un moment.',
      expired: 'La connexion a expiré. Veuillez réessayer.',
    },
    errors: {
      'not-connected': 'Votre connexion à ChatGPT est terminée. Reconnectez-vous.',
      'no-plan-scope': 'L’utilisation du forfait doit être autorisée pour obtenir une explication.',
      'not-eligible': 'L’utilisation du forfait n’est pas disponible pour ce compte ChatGPT.',
      'usage-limit': 'Limite d’utilisation atteinte. Il peut s’agir de la limite de cette application plutôt que de tout votre forfait.',
      'temporarily-unavailable': 'Impossible de vérifier l’utilisation pour le moment. Réessayez dans un moment.',
      'region-or-policy': 'Ce service n’est peut-être pas disponible dans votre région ou selon la politique de votre compte.',
      reconnect: 'Votre connexion doit être vérifiée à nouveau. Reconnectez-vous.',
      'rate-limited': 'Vous pouvez l’utiliser jusqu’à cinq fois par connexion.',
      misconfigured: 'Indisponible pour le moment. Votre résultat calculé reste inchangé.',
      unknown: 'Impossible d’obtenir une explication. Votre résultat calculé reste inchangé.',
    },
  },
  es: {
    title: 'Leer mi resultado con palabras sencillas',
    aiLabel: 'Texto escrito por ChatGPT',
    consent: 'Solo se envían a OpenAI los valores calculados (cuatro pilares y elementos), y la explicación usa tu propio plan de ChatGPT. No se envían tu fecha de nacimiento ni tu nombre, y OIYO no guarda el texto.',
    continue: 'Continue with ChatGPT',
    usingPlan: 'Usando el plan de ChatGPT',
    manageUsage: 'Gestionar uso',
    generate: 'Explicar mi resultado',
    generating: 'Escribiendo…',
    regenerate: 'Volver a escribir',
    clear: 'Borrar',
    disconnect: 'Desconectar',
    disconnectedNotConfirmed: 'Desconectado en este navegador. También puedes desconectar la aplicación en la configuración de ChatGPT.',
    notice: 'Texto escrito por IA a partir de tu resultado calculado, así que puede variar cada vez. Interpretación simbólica, sin base científica; no lo uses para decisiones de salud, legales o de dinero.',
    filtered: 'Se quitaron algunas frases que no cumplían nuestras pautas.',
    truncated: 'Mostramos hasta aquí.',
    stopped: 'Se detuvo a mitad de camino. Mostramos lo que llegó.',
    welcomeTitle: 'Estás usando tu plan de ChatGPT',
    welcomeBody: 'Esta explicación usa tu plan de ChatGPT. Puedes gestionar el uso en la configuración de ChatGPT.',
    gotIt: 'Entendido',
    returnStatus: {
      'no-plan-scope': 'Hay que permitir el uso del plan para recibir una explicación. Permítelo al conectar de nuevo.',
      denied: 'Cancelaste la conexión.',
      failed: 'No se pudo conectar. Inténtalo de nuevo en un momento.',
      expired: 'La conexión caducó. Inténtalo de nuevo.',
    },
    errors: {
      'not-connected': 'Tu conexión con ChatGPT terminó. Vuelve a conectar.',
      'no-plan-scope': 'Hay que permitir el uso del plan para recibir una explicación.',
      'not-eligible': 'El uso del plan no está disponible para esta cuenta de ChatGPT.',
      'usage-limit': 'Se alcanzó el límite de uso. Puede ser el límite de esta aplicación y no de todo tu plan.',
      'temporarily-unavailable': 'No se pudo comprobar el uso ahora. Inténtalo de nuevo en un momento.',
      'region-or-policy': 'Puede que no esté disponible en tu región o según la política de tu cuenta.',
      reconnect: 'Hay que volver a comprobar tu conexión. Vuelve a conectar.',
      'rate-limited': 'Puedes usarlo hasta cinco veces por conexión.',
      misconfigured: 'No disponible ahora. Tu resultado calculado no cambia.',
      unknown: 'No se pudo obtener una explicación. Tu resultado calculado no cambia.',
    },
  },
};

const RETURN_STATUSES: ReturnStatus[] = ['connected', 'no-plan-scope', 'denied', 'failed', 'expired'];

interface Paragraph {
  basis: string | null;
  text: string;
}

/** The model is told to open each paragraph with its basis values in [brackets]. */
export function splitParagraphs(text: string): Paragraph[] {
  return text
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      const match = /^\[([^\]]{1,80})\]\s*/.exec(paragraph);
      return match ? { basis: match[1], text: paragraph.slice(match[0].length) } : { basis: null, text: paragraph };
    });
}

function readWelcomeSeen(): boolean {
  try {
    return window.localStorage.getItem(WELCOME_SEEN_KEY) === '1';
  } catch {
    return true;
  }
}

export default function ChatGptInterpretation({ locale, pillars }: { locale: Locale; pillars: InterpretationPillars }) {
  const copy = COPY[locale] ?? COPY.en;
  const [enabled, setEnabled] = useState(false);
  const [connected, setConnected] = useState(false);
  const [returnStatus, setReturnStatus] = useState<ReturnStatus | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [text, setText] = useState('');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<ErrorCode | null>(null);
  const [filtered, setFiltered] = useState(false);
  const [ending, setEnding] = useState<'truncated' | 'stopped' | null>(null);
  const [disconnectNote, setDisconnectNote] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!FEATURE_ON) return;
    let cancelled = false;
    const url = new URL(window.location.href);
    const fromReturn = url.searchParams.get('siwc') as ReturnStatus | null;
    if (fromReturn) {
      url.searchParams.delete('siwc');
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    }
    fetch('/api/siwc/status', { credentials: 'same-origin' })
      .then((response) => (response.ok ? response.json() : { enabled: false, connected: false }))
      .then((body: { enabled?: boolean; connected?: boolean }) => {
        if (cancelled || !body.enabled) return;
        setEnabled(true);
        setConnected(Boolean(body.connected));
        gaEvent('siwc_prompt_view', { locale });
        if (fromReturn && RETURN_STATUSES.includes(fromReturn)) {
          setReturnStatus(fromReturn);
          if (fromReturn === 'connected') {
            gaEvent('siwc_login_done', { locale });
            if (!readWelcomeSeen()) setShowWelcome(true);
          }
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      abortRef.current?.abort();
    };
  }, [locale]);

  if (!FEATURE_ON || !enabled) return null;

  const loginHref = `/api/siwc/login?return_to=${encodeURIComponent(`${window.location.pathname}${window.location.search}`)}`;

  function dismissWelcome() {
    setShowWelcome(false);
    try {
      window.localStorage.setItem(WELCOME_SEEN_KEY, '1');
    } catch {
      // Private mode: the notice may show again next time, which is harmless.
    }
  }

  function clearOutput() {
    abortRef.current?.abort();
    setText('');
    setError(null);
    setFiltered(false);
    setEnding(null);
    setRunning(false);
  }

  async function generate() {
    clearOutput();
    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    gaEvent('ai_interpretation_start', { locale });
    try {
      const response = await fetch('/api/siwc/interpret', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, pillars }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) {
        const body = (await response.json().catch(() => ({}))) as { error?: ErrorCode };
        const code = body.error && body.error in copy.errors ? body.error : 'unknown';
        if (code === 'reconnect' || code === 'not-connected') setConnected(false);
        setError(code);
        gaEvent(code === 'usage-limit' ? 'ai_interpretation_limit' : 'ai_interpretation_error', { code, locale });
        return;
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line) continue;
          const event = JSON.parse(line) as { type: string; text?: string; truncated?: boolean; code?: ErrorCode };
          if (event.type === 'delta' && event.text) setText((previous) => previous + event.text);
          else if (event.type === 'filtered') setFiltered(true);
          else if (event.type === 'done') {
            if (event.truncated) setEnding('truncated');
            gaEvent('ai_interpretation_complete', { locale });
          } else if (event.type === 'error') {
            const code = event.code ?? 'unknown';
            setEnding('stopped');
            setError(code);
            gaEvent(code === 'usage-limit' ? 'ai_interpretation_limit' : 'ai_interpretation_error', { code, locale });
          }
        }
      }
    } catch (caught) {
      if ((caught as Error).name !== 'AbortError') {
        setEnding((current) => current ?? 'stopped');
        gaEvent('ai_interpretation_error', { code: 'network', locale });
      }
    } finally {
      setRunning(false);
    }
  }

  async function disconnect() {
    clearOutput();
    const response = await fetch('/api/siwc/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => null);
    const body = (await response?.json().catch(() => null)) as { remoteRevoked?: boolean | null } | null;
    setConnected(false);
    setReturnStatus(null);
    setDisconnectNote(body?.remoteRevoked !== true);
  }

  const paragraphs = splitParagraphs(text);
  const returnMessage = returnStatus && returnStatus !== 'connected' ? copy.returnStatus[returnStatus] : null;

  return (
    <Card aria-live="polite">
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
        {connected ? (
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{copy.usingPlan}</Badge>
            <a href={MANAGE_USAGE_URL} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline underline-offset-4">
              {copy.manageUsage}
            </a>
          </div>
        ) : (
          <CardDescription>{copy.consent}</CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {showWelcome && (
            <div role="status" className="rounded-xl border border-border bg-muted p-4">
              <p className="text-sm font-semibold text-foreground">{copy.welcomeTitle}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{copy.welcomeBody}</p>
              <Button onClick={dismissWelcome} variant="secondary" size="sm" className="mt-3">{copy.gotIt}</Button>
            </div>
          )}
          {returnMessage && <p role="alert" className="text-xs text-destructive">{returnMessage}</p>}
          {disconnectNote && <p className="text-xs text-muted-foreground">{copy.disconnectedNotConfirmed}</p>}

          {!connected && (
            <Button asChild className="w-full">
              <a href={loginHref} onClick={() => gaEvent('siwc_login_start', { locale })}>{copy.continue}</a>
            </Button>
          )}

          {connected && !text && !running && (
            <Button onClick={generate} className="w-full">{copy.generate}</Button>
          )}

          {(text || running) && (
            <section aria-label={copy.aiLabel} className="space-y-3 rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-semibold text-muted-foreground">{copy.aiLabel}</p>
              {paragraphs.map((paragraph, index) => (
                <div key={index} className="space-y-1">
                  {paragraph.basis && <Badge variant="outline">{paragraph.basis}</Badge>}
                  <p className="text-sm leading-relaxed text-foreground">{paragraph.text}</p>
                </div>
              ))}
              {running && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground"><Spinner />{copy.generating}</p>
              )}
              {filtered && <p className="text-xs text-muted-foreground">{copy.filtered}</p>}
              {ending && <p className="text-xs text-muted-foreground">{ending === 'truncated' ? copy.truncated : copy.stopped}</p>}
              <p className="text-xs leading-relaxed text-muted-foreground">{copy.notice}</p>
            </section>
          )}

          {error && (
            <div role="alert" className="space-y-2">
              <p className="text-xs text-destructive">{copy.errors[error]}</p>
              {error === 'usage-limit' && (
                <Button asChild variant="outline" size="sm">
                  <a href={MANAGE_USAGE_URL} target="_blank" rel="noopener noreferrer">{copy.manageUsage}</a>
                </Button>
              )}
              {(error === 'no-plan-scope' || error === 'reconnect' || error === 'not-connected') && (
                <Button asChild variant="outline" size="sm">
                  <a href={loginHref}>{copy.continue}</a>
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>

      {connected && (text || error) && !running && (
        <CardFooter>
          <div className="flex flex-wrap gap-2">
            <Button onClick={generate} variant="outline" size="sm">{copy.regenerate}</Button>
            <Button onClick={clearOutput} variant="ghost" size="sm">{copy.clear}</Button>
            <Button onClick={disconnect} variant="ghost" size="sm">{copy.disconnect}</Button>
          </div>
        </CardFooter>
      )}
      {connected && !text && !error && !running && (
        <CardFooter>
          <Button onClick={disconnect} variant="ghost" size="sm">{copy.disconnect}</Button>
        </CardFooter>
      )}
    </Card>
  );
}
