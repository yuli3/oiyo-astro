"use client";

import { Calendar, Check, Pencil } from "lucide-react";
import { useState } from "react";
import { useUserProfile } from "@/lib/user/context/UserContext";

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";
type Copy = {
  cancel: string; edit: string; prompt: string; save: string; saved: string; title: string;
  date: string; time: string; timeHint: string; gender: string; male: string; female: string;
  blood: string; unknown: string; opens: string;
};
const COPY: Record<Lang, Copy> = {
  ko: { cancel: "취소", edit: "수정", prompt: "정보를 입력할수록 더 많은 좌표가 열립니다. 모두 이 브라우저에만 저장됩니다.", save: "저장", saved: "프로필이 기록되었습니다", title: "나의 출생 정보", date: "생년월일", time: "태어난 시각", timeHint: "모르면 비워두세요", gender: "성별", male: "남성", female: "여성", blood: "혈액형", unknown: "모름", opens: "사주·출생차트·오행·별자리 등에 사용됩니다" },
  en: { cancel: "Cancel", edit: "Edit", prompt: "The more you enter, the more coordinates unlock. All stays in this browser.", save: "Save", saved: "Profile saved", title: "Your birth info", date: "Birth date", time: "Birth time", timeHint: "Leave blank if unknown", gender: "Gender", male: "Male", female: "Female", blood: "Blood type", unknown: "Unknown", opens: "Used for Saju, natal chart, Five Elements, zodiac & more" },
  ja: { cancel: "キャンセル", edit: "編集", prompt: "入力するほど多くの座標が開きます。すべてこのブラウザだけに保存。", save: "保存", saved: "プロフィールを記録しました", title: "出生情報", date: "生年月日", time: "出生時刻", timeHint: "不明なら空欄", gender: "性別", male: "男性", female: "女性", blood: "血液型", unknown: "不明", opens: "四柱・出生図・五行・星座などに使用" },
  zh: { cancel: "取消", edit: "修改", prompt: "输入越多，解锁的坐标越多。全部只保存在此浏览器。", save: "保存", saved: "资料已记录", title: "出生信息", date: "出生日期", time: "出生时间", timeHint: "不知道可留空", gender: "性别", male: "男", female: "女", blood: "血型", unknown: "未知", opens: "用于八字、星盘、五行、星座等" },
  fr: { cancel: "Annuler", edit: "Modifier", prompt: "Plus vous saisissez, plus de coordonnées se débloquent. Tout reste dans ce navigateur.", save: "Enregistrer", saved: "Profil enregistré", title: "Vos infos de naissance", date: "Date de naissance", time: "Heure de naissance", timeHint: "Laissez vide si inconnu", gender: "Genre", male: "Homme", female: "Femme", blood: "Groupe sanguin", unknown: "Inconnu", opens: "Utilisé pour Saju, thème natal, Cinq Éléments, zodiaque…" },
  es: { cancel: "Cancelar", edit: "Editar", prompt: "Cuanto más ingreses, más coordenadas se desbloquean. Todo queda en este navegador.", save: "Guardar", saved: "Perfil guardado", title: "Tus datos de nacimiento", date: "Fecha de nacimiento", time: "Hora de nacimiento", timeHint: "Déjalo vacío si no lo sabes", gender: "Género", male: "Hombre", female: "Mujer", blood: "Grupo sanguíneo", unknown: "Desconocido", opens: "Se usa para Saju, carta natal, Cinco Elementos, zodiaco…" },
};

const toDateInput = (iso: string | null | undefined) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};
const BLOODS = ["A", "B", "O", "AB"] as const;

export function OntologyBirthInput({ locale }: { locale: string }) {
  const { profile, setProfileData } = useUserProfile();
  const lang = (["ko", "en", "ja", "zh", "fr", "es"].includes(locale) ? locale : "en") as Lang;
  const c = COPY[lang];
  const has = !!profile.birthDate;
  const [editing, setEditing] = useState(false);
  // Local form state, seeded from the store.
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [blood, setBlood] = useState<string>("");

  const seed = () => {
    setDate(toDateInput(profile.birthDate));
    setTime(profile.birthTime ?? "");
    setGender((profile.gender as "male" | "female") ?? "");
    setBlood(profile.bloodType ?? "");
  };

  const save = () => {
    const d = date || toDateInput(profile.birthDate);
    if (!d) return;
    setProfileData({
      birthDate: d,
      birthTime: time || null,
      gender: gender || null,
      bloodType: (blood || null) as "A" | "B" | "O" | "AB" | null,
    });
    setEditing(false);
    window.dispatchEvent(new Event("oiyo:ontology-progress-updated"));
  };

  const showForm = !has || editing;
  const pill = (active: boolean) =>
    "rounded-xl border px-3 py-2 text-sm font-bold transition " +
    (active ? "border-green-600 bg-green-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-green-400");

  return (
    <section className="mx-auto w-full max-w-md rounded-[28px] border border-green-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-800">
          <Calendar className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-slate-950">{c.title}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{c.prompt}</p>
        </div>
      </div>

      {showForm ? (
        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-[11px] font-black uppercase tracking-wider text-green-600" htmlFor="ob-date">{c.date}</label>
            <input id="ob-date" type="date" max={new Date().toISOString().slice(0, 10)}
              value={date || toDateInput(profile.birthDate)} onChange={(e) => setDate(e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-black text-slate-900 outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10" />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-black uppercase tracking-wider text-green-600" htmlFor="ob-time">{c.time} <span className="font-medium text-slate-400 normal-case">· {c.timeHint}</span></label>
            <input id="ob-time" type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-black text-slate-900 outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10" />
          </div>
          <div>
            <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-green-600">{c.gender}</span>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setGender(gender === "male" ? "" : "male")} className={pill(gender === "male")}>{c.male}</button>
              <button type="button" onClick={() => setGender(gender === "female" ? "" : "female")} className={pill(gender === "female")}>{c.female}</button>
            </div>
          </div>
          <div>
            <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-green-600">{c.blood}</span>
            <div className="grid grid-cols-4 gap-2">
              {BLOODS.map((b) => (
                <button key={b} type="button" onClick={() => setBlood(blood === b ? "" : b)} className={pill(blood === b)}>{b}</button>
              ))}
            </div>
          </div>
          <p className="text-[11px] leading-5 text-slate-400">{c.opens}</p>
          <div className="flex items-center gap-2">
            <button onClick={save} disabled={!(date || profile.birthDate)}
              className="h-12 flex-1 rounded-2xl bg-green-700 text-sm font-black text-white transition hover:bg-green-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">{c.save}</button>
            {has && (
              <button onClick={() => setEditing(false)} className="h-12 rounded-2xl px-4 text-xs font-bold text-slate-500 hover:bg-slate-50">{c.cancel}</button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-green-50 px-3 py-3">
          <p className="flex min-w-0 flex-col gap-0.5 text-xs leading-5 text-green-800">
            <span className="flex items-center gap-1.5 font-black"><Check className="h-4 w-4 shrink-0" />{c.saved}</span>
            <span className="text-green-700">
              {toDateInput(profile.birthDate)}
              {profile.birthTime ? ` · ${profile.birthTime}` : ""}
              {profile.gender ? ` · ${profile.gender === "male" ? c.male : c.female}` : ""}
              {profile.bloodType ? ` · ${profile.bloodType}` : ""}
            </span>
          </p>
          <button onClick={() => { seed(); setEditing(true); }}
            className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-green-200 bg-white px-3 py-2 text-xs font-bold text-green-800 hover:border-green-300">
            <Pencil className="h-3.5 w-3.5" />{c.edit}
          </button>
        </div>
      )}
    </section>
  );
}
