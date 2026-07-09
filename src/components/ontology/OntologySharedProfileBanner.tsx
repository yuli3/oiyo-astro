"use client";

import { useEffect, useState } from "react";

import { parseSharedProfileSignals } from "@/lib/ontology/export";
import type { ProfileSignals } from "@/lib/ontology/signals";
import { readResultHash } from "@/lib/result-permalink";

// Track D addendum (2026-07-10): `OntologyExportPopover`'s "공유 링크"
// button writes a `#r=` permalink (`writeResultHash`), but nothing ever
// read it back — a recipient opening the link just saw their own (usually
// empty) /ontology page. This banner is that missing decoder.
//
// Mount-time only, read-only: it never calls `collectSignals()` or writes
// to localStorage, so a shared link can never bleed into the viewer's own
// profile — the same non-goal `SajuCalculator`'s permalink-restore effect
// already respects by skipping `saveBirth()` on shared state.
type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";
const LANGS: Lang[] = ["ko", "en", "ja", "zh", "fr", "es"];

const UI: Record<Lang, { badge: string; body: string }> = {
  ko: { badge: "공유된 프로필 · 당신의 데이터가 아니에요", body: "누군가 공유한 프로필 링크를 열었어요. 이 신호는 이 화면에서만 보여지고, 당신의 기기에는 저장되지 않아요." },
  en: { badge: "Shared profile — not your data", body: "You opened a profile link someone shared. These signals are shown here only and are never saved to your device." },
  ja: { badge: "共有プロフィール · あなたのデータではありません", body: "誰かが共有したプロフィールのリンクを開きました。この信号はこの画面にのみ表示され、あなたの端末には保存されません。" },
  zh: { badge: "共享资料 · 不是你的数据", body: "你打开了别人分享的资料链接。这些信号只显示在这个页面，不会保存到你的设备。" },
  fr: { badge: "Profil partagé — ce ne sont pas vos données", body: "Vous avez ouvert un lien de profil partagé par quelqu'un d'autre. Ces signaux ne sont affichés qu'ici et ne sont jamais enregistrés sur votre appareil." },
  es: { badge: "Perfil compartido — no son tus datos", body: "Abriste un enlace de perfil que alguien compartió. Estas señales solo se muestran aquí y nunca se guardan en tu dispositivo." },
};

/** Compact, order-stable badge list — same fields `OntologyExportPopover`'s summary card shows, plus big5 (per design doc: "MBTI/big5/RIASEC 있으면 표시"). */
function signalBadges(signals: ProfileSignals): { key: string; text: string }[] {
  const badges: { key: string; text: string }[] = [];
  if (signals.mbti) badges.push({ key: "mbti", text: signals.mbti.type });
  if (signals.riasec) badges.push({ key: "riasec", text: signals.riasec.code });
  if (signals.enneagram) badges.push({ key: "enneagram", text: `Ennea ${signals.enneagram}` });
  if (signals.zodiac) badges.push({ key: "zodiac", text: signals.zodiac });
  if (signals.saju) badges.push({ key: "saju", text: signals.saju.element });
  if (signals.big5) {
    const { O, C, E, A, N } = signals.big5;
    badges.push({ key: "big5", text: `O${O} C${C} E${E} A${A} N${N}` });
  }
  return badges;
}

export function OntologySharedProfileBanner({ locale }: { locale: string }) {
  const lang = (LANGS.includes(locale as Lang) ? locale : "en") as Lang;
  const t = UI[lang];
  const [signals, setSignals] = useState<ProfileSignals | null>(null);

  // Decode once on mount — same "read the hash exactly once" idiom as
  // SajuCalculator's permalink-restore effect. Silently renders nothing when
  // there is no hash, a different tool's hash, or a corrupted/version-
  // mismatched payload (`parseSharedProfileSignals` already guards all of
  // that) — never a crash, never a banner for a page with no shared link.
  useEffect(() => {
    setSignals(parseSharedProfileSignals(readResultHash<ProfileSignals>()));
  }, []);

  if (!signals) return null;
  const badges = signalBadges(signals);

  return (
    <div className="mb-5 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-indigo-900 shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-wider text-indigo-500">🔗 {t.badge}</p>
      <p className="mt-1 text-xs leading-5 text-indigo-800">{t.body}</p>
      {badges.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {badges.map((b) => (
            <span key={b.key} className="rounded-full bg-indigo-600 px-2.5 py-1 text-[11px] font-black text-white">
              {b.text}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
