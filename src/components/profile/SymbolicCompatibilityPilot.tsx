"use client";

import { ArrowRight, CalendarDays, Check, Link2, MapPin, RotateCcw, Share2, ShieldCheck, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";

import SymbolicGroupSnapshotPanel from "@/components/profile/SymbolicGroupSnapshotPanel";
import { CITIES } from "@/lib/ontology/natal/signs";
import { resolveZonedCivilTime } from "@/lib/user/birth-record";
import {
  compareSymbolicProfiles,
  deriveSymbolicProfile,
  type BirthMoment,
  type SymbolicComparisonProfile,
  type SymbolicCompatibilityReport,
  type SymbolicProfile,
} from "@/lib/symbolic-tradition";
import {
  createSymbolicShareArtifact,
  readSymbolicShareFragment,
  symbolicShareFragment,
} from "@/lib/symbolic-tradition/share-artifact";
import {
  createEncryptedShortShare,
  deleteEncryptedShortShare,
  readEncryptedShortShare,
  type EncryptedShortShare,
} from "@/lib/symbolic-tradition/short-share";
import { decodeSymbolicGroupSnapshot, type SymbolicGroupSnapshot } from "@/lib/symbolic-tradition/group-snapshot";

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";
type PersonForm = { cityId: string; date: string; name: string; time: string };

const INITIAL_PERSON: PersonForm = { cityId: "", date: "", name: "", time: "" };
const NO_TOTAL: Record<Lang, string> = {
  ko: "총점 없음", en: "No total", ja: "総合点なし", zh: "无总分", fr: "Pas de total", es: "Sin total",
};

/** Shown under the bars, so a reader knows what the number is and is not. */
const INDEX_NOTE: Record<Lang, string> = {
  ko: "각 관점의 전통적 관계를 0–100으로 표현한 값입니다. 확률도, 관계 예측도 아닙니다.",
  en: "A 0–100 rendering of each tradition's relation. Not a probability, not a prediction.",
  ja: "各観点の伝統的な関係を0–100で表した値です。確率でも予測でもありません。",
  zh: "把各视角的传统关系表示为 0–100 的数值，既非概率也非预测。",
  fr: "Une expression de 0 à 100 de la relation propre à chaque tradition. Ni probabilité, ni prédiction.",
  es: "Una expresión de 0 a 100 de la relación de cada tradición. Ni probabilidad ni predicción.",
};

const SHARE_COPY: Record<Lang, { copied: string; damaged: string; delete: string; deleted: string; expires: string; fallback: string; invite: string; inviteHint: string; loading: string; received: string; shareFriend: string; shareMe: string; warning: string }> = {
  ko: { copied: "초대 링크를 복사했어요", damaged: "공유 링크가 만료되었거나 손상되었습니다.", delete: "이 링크 삭제", deleted: "짧은 링크를 삭제했어요", expires: "7일 뒤 자동 삭제", fallback: "짧은 링크를 만들 수 없어 서버 없는 직접 링크로 전환했어요.", invite: "친구 부르기", inviteHint: "내 생년월일만 있으면 링크를 던질 수 있어요. 친구는 자기 것만 적습니다.", loading: "초대를 여는 중…", received: "친구가 초대했어요. 내 정보만 넣으면 둘이 바로 보여요.", shareFriend: "친구 지도 공유", shareMe: "친구 부르기", warning: "프로필은 브라우저에서 암호화되며 복호화 키는 링크의 # 뒤에만 있습니다. 링크 전체를 가진 사람은 볼 수 있습니다." },
  en: { copied: "Invite link copied", damaged: "This share link is expired or damaged.", delete: "Delete this link", deleted: "Short link deleted", expires: "Deleted automatically in 7 days", fallback: "Short-link storage was unavailable, so a serverless direct link was used.", invite: "Invite a friend", inviteHint: "Your birth date is enough to send a link. Your friend only enters theirs.", loading: "Opening the invite…", received: "A friend invited you. Enter only your details to see the two of you.", shareFriend: "Share friend's map", shareMe: "Invite a friend", warning: "The profile is encrypted in your browser. Its key stays after # in the link. Anyone with the full link can view it." },
  ja: { copied: "招待リンクをコピーしました", damaged: "共有リンクは期限切れか破損しています。", delete: "このリンクを削除", deleted: "短縮リンクを削除しました", expires: "7日後に自動削除", fallback: "短縮リンクを作れないため、サーバーなしの直接リンクに切り替えました。", invite: "友だちを呼ぶ", inviteHint: "自分の生年月日だけでリンクを送れます。友だちは自分の情報だけ入力します。", loading: "招待を開いています…", received: "友だちに招待されました。自分の情報だけで二人のつながりが見られます。", shareFriend: "友だちの地図を共有", shareMe: "友だちを呼ぶ", warning: "プロフィールはブラウザで暗号化され、鍵はリンクの#以降だけにあります。完全なリンクを持つ人は閲覧できます。" },
  zh: { copied: "邀请链接已复制", damaged: "分享链接已过期或损坏。", delete: "删除此链接", deleted: "短链接已删除", expires: "7天后自动删除", fallback: "无法创建短链接，已改用无服务器直链。", invite: "邀请朋友", inviteHint: "只需你的出生日期就能发链接。朋友只填自己的信息。", loading: "正在打开邀请…", received: "朋友邀请了你。只需填写你的信息即可看到两人。", shareFriend: "分享朋友地图", shareMe: "邀请朋友", warning: "资料在浏览器中加密，密钥只位于链接#之后。持有完整链接的人可以查看。" },
  fr: { copied: "Lien d’invitation copié", damaged: "Ce lien a expiré ou est endommagé.", delete: "Supprimer ce lien", deleted: "Lien court supprimé", expires: "Suppression automatique dans 7 jours", fallback: "Le lien court étant indisponible, un lien direct sans serveur a été utilisé.", invite: "Inviter un ami", inviteHint: "Votre date de naissance suffit pour envoyer un lien. L’ami ne saisit que la sienne.", loading: "Ouverture de l’invitation…", received: "Un ami vous a invité. Saisissez seulement vos informations.", shareFriend: "Partager sa carte", shareMe: "Inviter un ami", warning: "Le profil est chiffré dans votre navigateur. La clé reste après #. Toute personne ayant le lien complet peut le voir." },
  es: { copied: "Enlace de invitación copiado", damaged: "El enlace caducó o está dañado.", delete: "Eliminar este enlace", deleted: "Enlace corto eliminado", expires: "Se elimina automáticamente en 7 días", fallback: "No se pudo crear el enlace corto; se usó un enlace directo sin servidor.", invite: "Invitar a una amistad", inviteHint: "Con tu fecha de nacimiento basta para enviar el enlace. La otra persona solo pone la suya.", loading: "Abriendo la invitación…", received: "Te invitaron. Ingresa solo tus datos para ver a los dos.", shareFriend: "Compartir su mapa", shareMe: "Invitar a una amistad", warning: "El perfil se cifra en tu navegador. La clave queda tras #. Quien tenga el enlace completo puede verlo." },
};

const COPY = {
  ko: { title: "친구와 나는 어디에서 연결될까?", sub: "두 사람의 생년월일시를 네 가지 전통 관점으로 나란히 봅니다. 한 점수로 줄 세우지 않습니다.", me: "나", friend: "친구", name: "별칭", nameHint: "이 화면에서만 사용", date: "생년월일", time: "태어난 시각", timeHint: "모르면 비워두세요", city: "출생 도시", cityHint: "도시를 선택하세요", action: "연결 보기", reset: "다시 비교", local: "서버 전송·저장 없음", disclaimer: "전통적 상징을 대화 소재로 보여주는 놀이형 해석입니다. 관계의 성공·미래·과학적 적합성을 예측하지 않습니다.", result: "우리의 네 가지 연결", evidence: "계산 근거", uncertainty: "정확도 안내", noUncertainty: "두 사람 모두 출생 시각과 도시가 확인되었습니다.", unknownTime: "태어난 시각이 없어 시주를 제외한 6개 좌표로 계산했습니다.", error: "날짜와 출생 도시를 확인해 주세요. DST 경계의 모호한 시각은 다른 시각을 선택하거나 시각을 비워 주세요.", lenses: { "five-elements": "오행", "yin-yang": "음양", "chinese-zodiac": "띠", "sun-sign": "태양궁" }, relations: { same: "같은 기운", "generating-cycle": "서로 이어지는 생성 흐름", "controlling-cycle": "서로 조절하는 흐름", "same-balance": "비슷한 음양 균형", "near-balance": "가까운 음양 리듬", "contrasting-balance": "대비되는 음양 리듬", "same-trine": "같은 삼합 흐름", opposite: "마주 보는 축", distinct: "서로 다른 결", "same-sign": "같은 별자리", "same-element": "같은 원소군", "same-modality": "같은 행동 양식" } },
  en: { title: "Where do you and a friend connect?", sub: "See two birth moments through four symbolic traditions—without reducing the relationship to one score.", me: "You", friend: "Friend", name: "Nickname", nameHint: "Used only on this screen", date: "Birth date", time: "Birth time", timeHint: "Leave blank if unknown", city: "Birth city", cityHint: "Select a city", action: "See connections", reset: "Compare again", local: "No server transfer or storage", disclaimer: "A playful reflection based on traditional symbols. It does not predict relationship success, the future, or scientific compatibility.", result: "Your four connections", evidence: "Calculation evidence", uncertainty: "Precision note", noUncertainty: "Birth time and city are confirmed for both people.", unknownTime: "An unknown birth time excludes the hour pillar and uses six coordinates.", error: "Check both dates and birth cities. For an ambiguous DST time, choose another time or leave it unknown.", lenses: { "five-elements": "Five elements", "yin-yang": "Yin–yang", "chinese-zodiac": "Chinese zodiac", "sun-sign": "Sun sign" }, relations: { same: "Same energy", "generating-cycle": "A generating flow", "controlling-cycle": "A regulating flow", "same-balance": "Similar yin–yang balance", "near-balance": "Nearby yin–yang rhythm", "contrasting-balance": "Contrasting yin–yang rhythm", "same-trine": "Same zodiac trine", opposite: "Opposing axis", distinct: "Different patterns", "same-sign": "Same sign", "same-element": "Same element group", "same-modality": "Same modality" } },
  ja: { title: "友だちと私は、どこでつながる？", sub: "二人の生年月日時を4つの象徴的な伝統で並べ、一つの点数にはしません。", me: "私", friend: "友だち", name: "呼び名", nameHint: "この画面だけで使用", date: "生年月日", time: "出生時刻", timeHint: "不明なら空欄", city: "出生都市", cityHint: "都市を選択", action: "つながりを見る", reset: "もう一度比較", local: "サーバー送信・保存なし", disclaimer: "伝統的な象徴を会話のきっかけにする娯楽的解釈です。関係の成功・未来・科学的適合性を予測しません。", result: "二人の4つのつながり", evidence: "計算根拠", uncertainty: "精度の案内", noUncertainty: "二人とも出生時刻と都市が確認されています。", unknownTime: "出生時刻不明のため時柱を除く6座標で計算しました。", error: "日付と出生都市を確認してください。", lenses: { "five-elements": "五行", "yin-yang": "陰陽", "chinese-zodiac": "干支", "sun-sign": "太陽星座" }, relations: {} },
  zh: { title: "我和朋友在哪里相连？", sub: "从四种象征传统并列查看两人的出生信息，不把关系缩成一个分数。", me: "我", friend: "朋友", name: "昵称", nameHint: "仅用于此页面", date: "出生日期", time: "出生时间", timeHint: "不知道可留空", city: "出生城市", cityHint: "选择城市", action: "查看连接", reset: "重新比较", local: "不上传或保存到服务器", disclaimer: "这是以传统象征作为对话素材的娱乐性解读，不预测关系成功、未来或科学适配度。", result: "我们的四种连接", evidence: "计算依据", uncertainty: "精度提示", noUncertainty: "两人的出生时间和城市均已确认。", unknownTime: "出生时间未知，因此排除时柱，以六个坐标计算。", error: "请检查日期和出生城市。", lenses: { "five-elements": "五行", "yin-yang": "阴阳", "chinese-zodiac": "生肖", "sun-sign": "太阳星座" }, relations: {} },
  fr: { title: "Où êtes-vous reliés, votre ami et vous ?", sub: "Observez deux naissances selon quatre traditions symboliques, sans réduire la relation à un score.", me: "Vous", friend: "Ami", name: "Surnom", nameHint: "Utilisé seulement ici", date: "Date de naissance", time: "Heure de naissance", timeHint: "Laissez vide si inconnue", city: "Ville de naissance", cityHint: "Choisir une ville", action: "Voir les liens", reset: "Recommencer", local: "Aucun envoi ni stockage serveur", disclaimer: "Une lecture ludique fondée sur des symboles traditionnels. Elle ne prédit ni réussite relationnelle, ni avenir, ni compatibilité scientifique.", result: "Vos quatre liens", evidence: "Base du calcul", uncertainty: "Précision", noUncertainty: "Heure et ville confirmées pour les deux personnes.", unknownTime: "Une heure inconnue exclut le pilier horaire et utilise six coordonnées.", error: "Vérifiez les dates et villes de naissance.", lenses: { "five-elements": "Cinq éléments", "yin-yang": "Yin–yang", "chinese-zodiac": "Zodiaque chinois", "sun-sign": "Signe solaire" }, relations: {} },
  es: { title: "¿Dónde conectan tú y tu amistad?", sub: "Mira dos nacimientos desde cuatro tradiciones simbólicas, sin reducir la relación a una puntuación.", me: "Tú", friend: "Amistad", name: "Apodo", nameHint: "Solo se usa aquí", date: "Fecha de nacimiento", time: "Hora de nacimiento", timeHint: "Déjala vacía si no la sabes", city: "Ciudad de nacimiento", cityHint: "Elige una ciudad", action: "Ver conexiones", reset: "Comparar de nuevo", local: "Sin envío ni almacenamiento", disclaimer: "Una lectura lúdica basada en símbolos tradicionales. No predice éxito, futuro ni compatibilidad científica.", result: "Sus cuatro conexiones", evidence: "Base del cálculo", uncertainty: "Nota de precisión", noUncertainty: "Hora y ciudad confirmadas para ambas personas.", unknownTime: "Una hora desconocida excluye el pilar horario y usa seis coordenadas.", error: "Comprueba las fechas y ciudades de nacimiento.", lenses: { "five-elements": "Cinco elementos", "yin-yang": "Yin–yang", "chinese-zodiac": "Zodiaco chino", "sun-sign": "Signo solar" }, relations: {} },
} as const;

function withJoin(url: string): string {
  const parsed = new URL(url);
  parsed.searchParams.set("join", "1");
  return parsed.toString();
}

function toBirthMoment(form: PersonForm): BirthMoment {
  const city = CITIES.find((item) => item.id === form.cityId);
  if (!city || !form.date) throw new RangeError("Missing birth coordinates");
  const civilTime = form.time || "12:00";
  const resolution = resolveZonedCivilTime({ civilDate: form.date, civilTime, zoneId: city.zoneId });
  if (resolution.status !== "resolved") throw new RangeError("Ambiguous birth moment");
  return {
    civilDate: form.date,
    civilTime: form.time || null,
    longitude: city.lon,
    utcOffsetMinutes: resolution.offsetMinutes,
  };
}

function PersonCard({ copy, form, label, lang, onChange }: { copy: typeof COPY[Lang]; form: PersonForm; label: string; lang: Lang; onChange: (next: PersonForm) => void }) {
  const inputClass = "mt-1 h-12 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 text-base font-semibold text-stone-900 outline-none focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-600/10";
  return <fieldset className="rounded-[1.75rem] border border-lime-200 bg-white p-4 shadow-sm sm:p-5">
    <legend className="px-2 text-sm font-black text-green-900">{label}</legend>
    <div className="space-y-4">
      <label className="block text-xs font-bold text-stone-600">{copy.name} <span className="font-normal text-stone-400">· {copy.nameHint}</span>
        <input className={inputClass} value={form.name} maxLength={24} autoComplete="off" onChange={(e) => onChange({ ...form, name: e.target.value })} />
      </label>
      <label className="block text-xs font-bold text-stone-600"><CalendarDays className="mr-1 inline h-3.5 w-3.5" />{copy.date}
        <input className={inputClass} required type="date" value={form.date} onChange={(e) => onChange({ ...form, date: e.target.value })} />
      </label>
      <label className="block text-xs font-bold text-stone-600">{copy.time} <span className="font-normal text-stone-400">· {copy.timeHint}</span>
        <input className={inputClass} type="time" value={form.time} onChange={(e) => onChange({ ...form, time: e.target.value })} />
      </label>
      <label className="block text-xs font-bold text-stone-600"><MapPin className="mr-1 inline h-3.5 w-3.5" />{copy.city}
        <select className={inputClass} required value={form.cityId} onChange={(e) => onChange({ ...form, cityId: e.target.value })}>
          <option value="">{copy.cityHint}</option>
          {CITIES.map((city) => <option key={city.id} value={city.id}>{city.label[lang]}</option>)}
        </select>
      </label>
    </div>
  </fieldset>;
}

export default function SymbolicCompatibilityPilot({ locale }: { locale: string }) {
  const lang = (["ko", "en", "ja", "zh", "fr", "es"].includes(locale) ? locale : "en") as Lang;
  const copy = COPY[lang];
  const shareCopy = SHARE_COPY[lang];
  const [a, setA] = useState<PersonForm>(INITIAL_PERSON);
  const [b, setB] = useState<PersonForm>(INITIAL_PERSON);
  const [receivedProfile, setReceivedProfile] = useState<SymbolicComparisonProfile | null>(null);
  const [receivedGroup, setReceivedGroup] = useState<SymbolicGroupSnapshot | null>(null);
  const [shortShare, setShortShare] = useState<EncryptedShortShare | null>(null);
  const [shareState, setShareState] = useState<"copied" | "damaged" | "deleted" | "fallback" | "idle" | "loading">("idle");
  const [result, setResult] = useState<null | { a: SymbolicProfile; b: SymbolicComparisonProfile; bFull: SymbolicProfile | null; report: SymbolicCompatibilityReport }>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const readFragment = async () => {
      const groupEncoded = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("group");
      const group = groupEncoded ? decodeSymbolicGroupSnapshot(groupEncoded) : null;
      setReceivedGroup(group);
      if (group) return;
      const decoded = readSymbolicShareFragment(window.location.hash);
      setReceivedProfile(null);
      setShareState("idle");
      setResult(null);
      if (!decoded) {
        const shortId = new URL(window.location.href).searchParams.get("share");
        if (!shortId) return;
        setShareState("loading");
        const encrypted = await readEncryptedShortShare(shortId, window.location.hash);
        if (!encrypted.ok) {
          setShareState("damaged");
          return;
        }
        setReceivedProfile(encrypted.artifact.profile);
        setShareState("idle");
        return;
      }
      if (!decoded.ok) {
        setShareState("damaged");
        return;
      }
      setReceivedProfile(decoded.artifact.profile);
    };
    void readFragment();
    const onHashChange = () => void readFragment();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const profileA = deriveSymbolicProfile(toBirthMoment(a));
      const profileB = receivedProfile ?? deriveSymbolicProfile(toBirthMoment(b));
      setResult({ a: profileA, b: profileB, bFull: receivedProfile ? null : profileB as SymbolicProfile, report: compareSymbolicProfiles(profileA, profileB) });
      setError("");
    } catch {
      setError(copy.error);
    }
  };
  const relationText = (relation: string) => (copy.relations as Record<string, string>)[relation] ?? COPY.en.relations[relation as keyof typeof COPY.en.relations] ?? relation;

  const shareProfile = async (profile: SymbolicProfile) => {
    let url: string;
    try {
      const created = await createEncryptedShortShare(profile, { locale: lang, origin: window.location.origin });
      setShortShare(created);
      url = withJoin(created.url);
    } catch {
      const artifact = createSymbolicShareArtifact(profile);
      const base = `${window.location.origin}${window.location.pathname}`;
      url = withJoin(`${base}${symbolicShareFragment(artifact)}`);
      setShareState("fallback");
    }
    if (navigator.share) {
      try {
        await navigator.share({ title: copy.title, text: shareCopy.inviteHint, url });
        return;
      } catch (shareError) {
        if (shareError instanceof DOMException && shareError.name === "AbortError") return;
      }
    }
    await navigator.clipboard.writeText(url);
    setShareState((current) => current === "fallback" ? "fallback" : "copied");
  };

  const deleteShortShare = async () => {
    if (!shortShare) return;
    if (await deleteEncryptedShortShare(shortShare.id, shortShare.deleteToken)) {
      setShortShare(null);
      setShareState("deleted");
    }
  };

  const inviteFromForm = async () => {
    try {
      await shareProfile(deriveSymbolicProfile(toBirthMoment(a)));
      setError("");
    } catch {
      setError(copy.error);
    }
  };

  if (receivedGroup) {
    return <main>
      <header className="text-center">
        <h1 className="mt-4 text-3xl font-black tracking-tight text-green-950 sm:text-4xl">{copy.title}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-stone-600">{copy.disclaimer}</p>
      </header>
      <SymbolicGroupSnapshotPanel initialSnapshot={receivedGroup} locale={lang} />
    </main>;
  }

  if (result) {
    const uncertain = result.a.source.timeStatus === "unknown" || result.b.fiveElements.observedCoordinates === 6;
    return <main>
      <header className="text-center">
        <h1 className="mt-4 text-3xl font-black tracking-tight text-green-950 sm:text-4xl">{copy.result}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-stone-600">{copy.disclaimer}</p>
      </header>

      <section className="mt-8 rounded-[2rem] border border-lime-200 bg-[#f7f8ed] p-4 sm:p-7" aria-label={copy.result}>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
          <div className="rounded-2xl bg-white px-3 py-4 font-black text-green-950 shadow-sm">{a.name.trim() || copy.me}</div>
          <Link2 className="h-6 w-6 text-lime-600" aria-hidden="true" />
          <div className="rounded-2xl bg-white px-3 py-4 font-black text-green-950 shadow-sm">{b.name.trim() || copy.friend}</div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {result.report.lenses.map((lens, index) => <article key={lens.id} className="rounded-2xl border border-lime-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-xs font-black uppercase tracking-wider text-lime-700">0{index + 1} · {copy.lenses[lens.id]}</p><p className="mt-2 text-base font-black text-green-950">{relationText(lens.relation)}</p></div>
              <span className="text-sm font-black text-green-800">{lens.harmonyIndex}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-lime-50">
              <div className="h-full rounded-full bg-green-700 transition-[width] duration-700 ease-out" style={{ width: `${lens.harmonyIndex}%` }} />
            </div>
          </article>)}
        </div>
        <p className="mt-3 text-xs leading-5 text-stone-500 [word-break:keep-all]">{INDEX_NOTE[lang]}</p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-stone-400">{NO_TOTAL[lang]}</p>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-stone-200 bg-white p-5"><h2 className="text-sm font-black text-stone-900">{copy.evidence}</h2><p className="mt-3 text-xs leading-6 text-stone-600">{a.name.trim() || copy.me}: {result.a.saju.year.heavenlyStem}-{result.a.saju.year.earthlyBranch} · {result.a.fiveElements.dominant} · {result.a.sunSign.sign}</p><p className="text-xs leading-6 text-stone-600">{receivedProfile ? copy.friend : b.name.trim() || copy.friend}: {result.bFull ? `${result.bFull.saju.year.heavenlyStem}-${result.bFull.saju.year.earthlyBranch} · ` : ""}{result.b.fiveElements.dominant} · {result.b.sunSign.sign}</p></div>
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5"><h2 className="text-sm font-black text-amber-900">{copy.uncertainty}</h2><p className="mt-3 text-xs leading-6 text-amber-800">{uncertain ? copy.unknownTime : copy.noUncertainty}</p></div>
      </section>
      <section className="mt-5 rounded-3xl border border-lime-200 bg-lime-50 p-5 text-center">
        <p className="text-xs font-bold text-stone-600">{shareCopy.expires} · {shareCopy.warning}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => void shareProfile(result.a)} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-green-800 px-5 text-sm font-black text-white"><Share2 className="h-4 w-4" />{shareCopy.shareMe}</button>
          {result.bFull && <button type="button" onClick={() => void shareProfile(result.bFull!)} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-green-700 bg-white px-5 text-sm font-black text-green-800"><Share2 className="h-4 w-4" />{shareCopy.shareFriend}</button>}
        </div>
        {shareState === "copied" && <p role="status" className="mt-3 inline-flex items-center gap-1 text-xs font-black text-green-800"><Check className="h-4 w-4" />{shareCopy.copied}</p>}
        {shareState === "fallback" && <p role="status" className="mt-3 text-xs font-bold text-amber-800">{shareCopy.fallback}</p>}
        {shareState === "deleted" && <p role="status" className="mt-3 inline-flex items-center gap-1 text-xs font-black text-green-800"><Check className="h-4 w-4" />{shareCopy.deleted}</p>}
        {shortShare && <button type="button" onClick={() => void deleteShortShare()} className="mt-3 min-h-11 rounded-full px-4 text-xs font-black text-red-700 underline underline-offset-4">{shareCopy.delete}</button>}
      </section>
      <SymbolicGroupSnapshotPanel
        initial={[
          { label: a.name.trim() || copy.me, profile: result.a },
          { label: receivedProfile ? copy.friend : b.name.trim() || copy.friend, profile: result.b },
        ]}
        locale={lang}
      />
      <button type="button" onClick={() => setResult(null)} className="mx-auto mt-7 flex min-h-12 items-center gap-2 rounded-full border border-green-700 px-6 text-sm font-black text-green-800"><RotateCcw className="h-4 w-4" />{copy.reset}</button>
    </main>;
  }

  return <main>
    <header className="text-center">
      <h1 className="mt-4 text-3xl font-black tracking-tight text-green-950 sm:text-4xl">{copy.title}</h1>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-stone-600">{copy.sub}</p>
      <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-green-700"><ShieldCheck className="h-4 w-4" />{copy.local}</p>
    </header>
    {shareState === "damaged" && <p role="alert" className="mt-6 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900"><TriangleAlert className="h-5 w-5 shrink-0" />{shareCopy.damaged}</p>}
    {shareState === "loading" && <p role="status" className="mt-6 rounded-2xl border border-lime-200 bg-lime-50 px-4 py-3 text-center text-sm font-bold text-green-900">{shareCopy.loading}</p>}
    {receivedProfile && <p role="status" className="mt-6 rounded-2xl border border-lime-200 bg-lime-50 px-4 py-3 text-center text-sm font-bold text-green-900">{shareCopy.received}</p>}
    <form className="mt-8" onSubmit={submit}>
      <div className={`grid gap-4 ${receivedProfile ? "mx-auto max-w-xl" : "sm:grid-cols-2"}`}><PersonCard copy={copy} form={a} label={copy.me} lang={lang} onChange={setA} />{!receivedProfile && <PersonCard copy={copy} form={b} label={copy.friend} lang={lang} onChange={setB} />}</div>
      {error && <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
      <button type="submit" className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-green-800 px-6 text-base font-black text-white shadow-lg shadow-green-900/10 transition hover:bg-green-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-800">{copy.action}<ArrowRight className="h-5 w-5" /></button>
      {!receivedProfile && <button type="button" onClick={() => void inviteFromForm()} className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-green-700 bg-white px-6 text-sm font-black text-green-800"><Share2 className="h-4 w-4" />{shareCopy.invite}</button>}
      {!receivedProfile && <p className="mt-2 text-center text-xs leading-5 text-stone-500">{shareCopy.inviteHint}</p>}
      {shareState === "copied" && <p role="status" className="mt-3 text-center text-xs font-black text-green-800"><Check className="mr-1 inline h-4 w-4" />{shareCopy.copied}</p>}
      {shareState === "fallback" && <p role="status" className="mt-3 text-center text-xs font-bold text-amber-800">{shareCopy.fallback}</p>}
    </form>
    <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-5 text-stone-500">{copy.disclaimer}</p>
  </main>;
}
