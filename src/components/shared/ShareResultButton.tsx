import { useState } from 'react';
import { shareResultImage, type ShareCardPayload } from '../../lib/share-result-image';

type Locale = 'en' | 'ko' | 'ja' | 'zh' | 'fr' | 'es';

interface Props {
  locale: string;
  heading: string;
  resultTitle: string;
  emoji?: string;
  description?: string;
}

const LABELS: Record<Locale, { share: string; working: string; downloaded: string; failed: string }> = {
  ko: { share: '결과 이미지 저장·공유', working: '이미지 만드는 중…', downloaded: '이미지를 저장했어요!', failed: '이미지 생성에 실패했어요' },
  en: { share: 'Save & share result image', working: 'Creating image…', downloaded: 'Image saved!', failed: 'Could not create image' },
  ja: { share: '結果画像を保存・共有', working: '画像を作成中…', downloaded: '画像を保存しました!', failed: '画像の作成に失敗しました' },
  zh: { share: '保存·分享结果图片', working: '正在生成图片…', downloaded: '图片已保存!', failed: '图片生成失败' },
  fr: { share: 'Enregistrer et partager l’image', working: 'Création de l’image…', downloaded: 'Image enregistrée !', failed: 'Échec de la création' },
  es: { share: 'Guardar y compartir imagen', working: 'Creando imagen…', downloaded: '¡Imagen guardada!', failed: 'No se pudo crear la imagen' },
};

export default function ShareResultButton({ locale, heading, resultTitle, emoji, description }: Props) {
  const t = LABELS[(locale as Locale)] ?? LABELS.en;
  const [state, setState] = useState<'idle' | 'working' | 'done' | 'error'>('idle');

  const onShare = async () => {
    if (state === 'working') return;
    setState('working');
    const payload: ShareCardPayload = {
      heading,
      resultTitle,
      emoji,
      description,
      url: typeof location !== 'undefined'
        ? `oiyo.net${location.pathname.replace(/\/$/, '')}`
        : 'oiyo.net',
    };
    try {
      await shareResultImage(payload);
      setState('done');
      setTimeout(() => setState('idle'), 2500);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 2500);
    }
  };

  return (
    <button
      type="button"
      onClick={onShare}
      disabled={state === 'working'}
      className="mt-3 w-full rounded-xl border-2 border-lime-700 bg-lime-50 px-5 py-3 text-sm font-bold text-lime-800 transition hover:bg-lime-100 disabled:opacity-60"
    >
      {state === 'idle' && <>📸 {t.share}</>}
      {state === 'working' && t.working}
      {state === 'done' && <>✅ {t.downloaded}</>}
      {state === 'error' && t.failed}
    </button>
  );
}
