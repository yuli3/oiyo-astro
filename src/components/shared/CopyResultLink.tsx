import { useState } from 'react';
import { currentShareUrl } from '../../lib/result-url';

type Locale = 'en' | 'ko' | 'ja' | 'zh' | 'fr' | 'es';

interface Props {
  locale: string;
}

const LABELS: Record<Locale, { copy: string; copied: string; failed: string; hint: string }> = {
  ko: { copy: '결과 링크 복사', copied: '링크를 복사했어요!', failed: '복사에 실패했어요', hint: '이 링크를 열면 같은 결과가 그대로 보여요.' },
  en: { copy: 'Copy result link', copied: 'Link copied!', failed: 'Could not copy', hint: 'Opening this link shows the same result.' },
  ja: { copy: '結果リンクをコピー', copied: 'リンクをコピーしました!', failed: 'コピーに失敗しました', hint: 'このリンクを開くと同じ結果が表示されます。' },
  zh: { copy: '复制结果链接', copied: '链接已复制!', failed: '复制失败', hint: '打开此链接将显示相同的结果。' },
  fr: { copy: 'Copier le lien du résultat', copied: 'Lien copié !', failed: 'Échec de la copie', hint: 'Ouvrir ce lien affiche le même résultat.' },
  es: { copy: 'Copiar enlace del resultado', copied: '¡Enlace copiado!', failed: 'No se pudo copiar', hint: 'Abrir este enlace muestra el mismo resultado.' },
};

export default function CopyResultLink({ locale }: Props) {
  const t = LABELS[(locale as Locale)] ?? LABELS.en;
  const [state, setState] = useState<'idle' | 'done' | 'error'>('idle');

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentShareUrl());
      setState('done');
      setTimeout(() => setState('idle'), 2500);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 2500);
    }
  };

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={onCopy}
        className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
      >
        {state === 'idle' && <>🔗 {t.copy}</>}
        {state === 'done' && <>✅ {t.copied}</>}
        {state === 'error' && t.failed}
      </button>
      <p className="mt-1.5 text-center text-xs text-slate-400">{t.hint}</p>
    </div>
  );
}
