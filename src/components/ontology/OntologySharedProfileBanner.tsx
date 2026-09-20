"use client";

import { useEffect, useState } from "react";

import { parseSharedProfileSignals } from "@/lib/ontology/export";
import type { ProfileSignals } from "@/lib/ontology/signals";
import { readEncryptedResultPermalink } from "@/lib/encrypted-result-permalink";
import { readResultHash, type DecodedResult } from "@/lib/result-permalink";

// The current share stores ciphertext server-side and keeps its key in the
// fragment. Older `#r=` links remain readable only after an explicit warning.
//
// Mount-time only, read-only: it never calls `collectSignals()` or writes
// to localStorage, so a shared link can never bleed into the viewer's own
// profile — the same non-goal `SajuCalculator`'s permalink-restore effect
// already respects by skipping `saveBirth()` on shared state.
type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";
const LANGS: Lang[] = ["ko", "en", "ja", "zh", "fr", "es"];

const UI: Record<Lang, { badge: string; body: string; legacyTitle: string; legacyBody: string; legacyOpen: string }> = {
  ko: { badge: "공유된 프로필 · 당신의 데이터가 아니에요", body: "누군가 공유한 프로필 링크를 열었어요. 이 신호는 이 화면에서만 보여지고, 당신의 기기에는 저장되지 않아요.", legacyTitle: "예전 형식의 공유 링크예요", legacyBody: "이 평문 링크에는 프로필 신호와 출생정보가 복원 가능한 형태로 들어 있을 수 있습니다. 내용을 확인한 뒤에만 여세요.", legacyOpen: "프로필 열기" },
  en: { badge: "Shared profile — not your data", body: "You opened a profile link someone shared. These signals are shown here only and are never saved to your device.", legacyTitle: "This is an older share link", legacyBody: "This plaintext link may contain reconstructable profile signals and birth details. Open it only after reviewing this notice.", legacyOpen: "Open profile" },
  ja: { badge: "共有プロフィール · あなたのデータではありません", body: "誰かが共有したプロフィールのリンクを開きました。この信号はこの画面にのみ表示され、あなたの端末には保存されません。", legacyTitle: "旧形式の共有リンクです", legacyBody: "この平文リンクには、プロフィール信号や出生情報が復元可能な形で含まれる場合があります。確認してから開いてください。", legacyOpen: "プロフィールを開く" },
  zh: { badge: "共享资料 · 不是你的数据", body: "你打开了别人分享的资料链接。这些信号只显示在这个页面，不会保存到你的设备。", legacyTitle: "这是旧格式分享链接", legacyBody: "此明文链接可能以可还原的形式包含资料信号和出生信息。请阅读提示后再打开。", legacyOpen: "打开资料" },
  fr: { badge: "Profil partagé — ce ne sont pas vos données", body: "Vous avez ouvert un lien de profil partagé par quelqu'un d'autre. Ces signaux ne sont affichés qu'ici et ne sont jamais enregistrés sur votre appareil.", legacyTitle: "Ancien format de lien", legacyBody: "Ce lien en clair peut contenir des signaux de profil et des données de naissance reconstituables. Ouvrez-le seulement après cet avertissement.", legacyOpen: "Ouvrir le profil" },
  es: { badge: "Perfil compartido — no son tus datos", body: "Abriste un enlace de perfil que alguien compartió. Estas señales solo se muestran aquí y nunca se guardan en tu dispositivo.", legacyTitle: "Este enlace usa el formato anterior", legacyBody: "Este enlace en texto claro puede contener señales del perfil y datos de nacimiento reconstruibles. Ábrelo solo tras revisar este aviso.", legacyOpen: "Abrir perfil" },
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
  const [legacySignals, setLegacySignals] = useState<ProfileSignals | null>(null);

  // Decode once on mount. Encrypted shares open directly; legacy plaintext
  // shares are held behind the localized confirmation below.
  useEffect(() => {
    let cancelled = false;
    const restore = async () => {
      const id = new URL(window.location.href).searchParams.get("result");
      if (id) {
        const encrypted = await readEncryptedResultPermalink(id, window.location.hash);
        if (!cancelled && encrypted.ok) {
          setSignals(parseSharedProfileSignals(encrypted.result as DecodedResult<ProfileSignals>));
        }
        return;
      }
      const legacy = parseSharedProfileSignals(readResultHash<ProfileSignals>());
      if (!cancelled && legacy) setLegacySignals(legacy);
    };
    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  if (legacySignals && !signals) {
    return (
      <div role="alert" className="mb-5 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 shadow-sm">
        <p className="font-bold">{t.legacyTitle}</p>
        <p className="mt-1 text-sm leading-6">{t.legacyBody}</p>
        <button type="button" className="mt-3 rounded-xl border border-amber-500 px-4 py-2 text-sm font-bold" onClick={() => { setSignals(legacySignals); setLegacySignals(null); }}>
          {t.legacyOpen}
        </button>
      </div>
    );
  }
  if (!signals) return null;
  const badges = signalBadges(signals);

  return (
    <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-wider text-amber-600">🔗 {t.badge}</p>
      <p className="mt-1 text-xs leading-5 text-amber-800">{t.body}</p>
      {badges.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {badges.map((b) => (
            <span key={b.key} className="rounded-full bg-amber-600 px-2.5 py-1 text-[11px] font-black text-white">
              {b.text}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
