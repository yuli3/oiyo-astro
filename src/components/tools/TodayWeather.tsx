import { useEffect, useState } from 'react';
import type { Locale } from '../../i18n';
import { Skeleton } from '../ui/skeleton';

/** Open-Meteo, no key. Seoul default; optional lat/lon from ontology city. */
const SEOUL = { lat: 37.5665, lon: 126.978 };

const COPY: Record<Locale, { heading: string; fail: string; source: string }> = {
  ko: { heading: '지금 날씨', fail: '날씨를 불러오지 못했습니다.', source: 'Open-Meteo' },
  en: { heading: 'Weather now', fail: 'Could not load weather.', source: 'Open-Meteo' },
  ja: { heading: 'いまの天気', fail: '天気を取得できませんでした。', source: 'Open-Meteo' },
  zh: { heading: '现在天气', fail: '未能读取天气。', source: 'Open-Meteo' },
  fr: { heading: 'Météo', fail: 'Météo indisponible.', source: 'Open-Meteo' },
  es: { heading: 'Tiempo', fail: 'No se pudo cargar el tiempo.', source: 'Open-Meteo' },
};

export default function TodayWeather({ locale, lat, lon }: { locale: Locale; lat?: number; lon?: number }) {
  const t = COPY[locale] ?? COPY.en;
  const [text, setText] = useState<string | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    const la = lat ?? SEOUL.lat;
    const lo = lon ?? SEOUL.lon;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&current=temperature_2m,weather_code&timezone=auto`;
    let cancelled = false;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error('meteo');
        return r.json();
      })
      .then((j) => {
        if (cancelled) return;
        const temp = j?.current?.temperature_2m;
        if (typeof temp !== 'number') throw new Error('shape');
        setText(`${Math.round(temp)}°C`);
      })
      .catch(() => {
        if (!cancelled) setErr(true);
      });
    return () => { cancelled = true; };
  }, [lat, lon]);

  if (err) return null;
  if (!text) {
    return (
      <div className="rounded-xl border border-slate-200 bg-card p-3">
        <Skeleton className="h-6 w-24" />
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-primary/20 bg-card px-4 py-3 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t.heading}</p>
      <p className="text-2xl font-black text-green-900">{text}</p>
      <p className="text-[10px] text-slate-400">{t.source}</p>
    </div>
  );
}
