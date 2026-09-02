"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";

import { ProfileInputDialog, asLang } from "@/components/shared/ProfileInputDialog";
import { CITIES } from "@/lib/ontology/natal/signs";
import { useProfilePrefill } from "@/lib/user/useProfilePrefill";
import { useUserStore } from "@/lib/user/store/user-store";

/**
 * The birth date a tool works from, sourced from the profile rather than asked
 * for again.
 *
 * Each calculator used to render its own date box, so a visitor typed the same
 * birth date on every page and the answers never travelled. The profile at
 * /ontology is now the record: when it holds a date this shows what is being
 * used and offers Edit; when it does not, it offers the same profile form in a
 * dialog. Either way the tool sees only the value arriving through onChange,
 * so no calculator needed changing.
 *
 * Pass `standalone` for a date that is genuinely not the visitor's own — a
 * friend's birthday in a comparison, say — and it falls back to a plain input.
 */

const FIELD_CLASS =
  "h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-black text-slate-900 outline-none transition focus:border-green-500 focus:bg-card focus:ring-4 focus:ring-green-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

interface BirthDateFieldProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  className?: string;
  /** Render a plain date input — for dates that are not the visitor's own. */
  standalone?: boolean;
  /** Locale for the dialog copy; defaults to the <html lang> the page carries. */
  locale?: string;
}

const COPY = {
  ko: { using: "내 정보", edit: "수정", missing: "생년월일이 아직 없어요", enter: "내 정보 입력", page: "온톨로지에서 입력" },
  en: { using: "Your info", edit: "Edit", missing: "No birth date saved yet", enter: "Enter your info", page: "Enter on Ontology" },
  ja: { using: "あなたの情報", edit: "編集", missing: "生年月日がまだありません", enter: "情報を入力", page: "存在論で入力" },
  zh: { using: "你的信息", edit: "修改", missing: "尚未填写出生日期", enter: "填写信息", page: "到存在论填写" },
  fr: { using: "Vos infos", edit: "Modifier", missing: "Aucune date de naissance enregistrée", enter: "Saisir vos infos", page: "Saisir dans Ontologie" },
  es: { using: "Tus datos", edit: "Editar", missing: "Aún no hay fecha de nacimiento", enter: "Introducir tus datos", page: "Completar en Ontología" },
} as const;

function BirthDateInput({ id, label, value, onChange, min, max, className }: BirthDateFieldProps) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-[11px] font-black uppercase tracking-wider text-green-600">
          {label}
        </label>
      )}
      <input
        id={id}
        type="date"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={FIELD_CLASS}
      />
    </div>
  );
}

export function BirthDateField(props: BirthDateFieldProps) {
  const { className, label, locale, onChange, standalone, value } = props;
  const { parsed } = useProfilePrefill();
  const [dialogOpen, setDialogOpen] = useState(false);

  const lang = asLang(
    locale ?? (typeof document !== "undefined" ? document.documentElement.lang : "en") ?? "en",
  );
  const c = COPY[lang];

  const profileDate = parsed
    ? `${String(parsed.year).padStart(4, "0")}-${String(parsed.month).padStart(2, "0")}-${String(parsed.day).padStart(2, "0")}`
    : "";

  // The profile is the record, so the tool follows it — including a later edit
  // that changes the date out from under a result the visitor already has.
  useEffect(() => {
    if (!standalone && profileDate && profileDate !== value) onChange(profileDate);
  }, [profileDate, standalone]);

  if (standalone) return <BirthDateInput {...props} />;

  return (
    <div className={className}>
      {label && (
        <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-green-600">{label}</span>
      )}
      {profileDate ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-green-100 bg-surface-subtle px-4 py-3">
          <span className="min-w-0 text-sm font-black text-green-900">
            <span className="text-green-600">{c.using}</span>
            <span className="mx-2 text-green-300">·</span>
            {profileDate}
          </span>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-green-200 bg-card px-3 py-1.5 text-xs font-bold text-green-800 transition hover:border-green-300"
          >
            <Pencil className="h-3.5 w-3.5" />
            {c.edit}
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-green-200 bg-card px-4 py-4 text-center">
          <p className="text-sm font-bold text-slate-500">{c.missing}</p>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="mt-3 h-11 w-full rounded-2xl bg-green-700 text-sm font-black text-white transition hover:bg-green-800 active:scale-[0.98]"
          >
            {c.enter}
          </button>
          <a href={`/${lang}/ontology/`} className="mt-2 inline-block text-xs font-bold text-green-800 underline underline-offset-4">
            {COPY[lang].page}
          </a>
        </div>
      )}
      <ProfileInputDialog locale={lang} onClose={() => setDialogOpen(false)} open={dialogOpen} />
    </div>
  );
}


interface ProfileNameFieldProps {
  label?: string;
  locale?: string;
  onChange: (value: string) => void;
  value: string;
  className?: string;
  /** Shown under the name when the tool cannot use it (e.g. Latin-only maths). */
  warning?: string;
}

const NAME_COPY = {
  ko: { using: "내 정보", edit: "수정", missing: "이름이 아직 없어요", enter: "내 정보 입력" },
  en: { using: "Your info", edit: "Edit", missing: "No name saved yet", enter: "Enter your info" },
  ja: { using: "あなたの情報", edit: "編集", missing: "名前がまだありません", enter: "情報を入力" },
  zh: { using: "你的信息", edit: "修改", missing: "尚未填写姓名", enter: "填写信息" },
  fr: { using: "Vos infos", edit: "Modifier", missing: "Aucun nom enregistré", enter: "Saisir vos infos" },
  es: { using: "Tus datos", edit: "Editar", missing: "Aún no hay nombre", enter: "Introducir tus datos" },
} as const;

/**
 * The visitor's name, from the profile — the text counterpart to
 * BirthDateField. Tools keep their value/onChange contract and stop asking.
 */
export function ProfileNameField({ className, label, locale, onChange, value, warning }: ProfileNameFieldProps) {
  const profileName = useUserStore((state) => state.profile.name) ?? "";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const name = hydrated ? profileName : "";

  useEffect(() => {
    if (name && name !== value) onChange(name);
  }, [name]);

  const lang = asLang(locale ?? "en");
  const c = NAME_COPY[lang];

  return (
    <div className={className}>
      {label && (
        <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-green-600">{label}</span>
      )}
      {name ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-green-100 bg-surface-subtle px-4 py-3">
          <span className="min-w-0 truncate text-sm font-black text-green-900">
            <span className="text-green-600">{c.using}</span>
            <span className="mx-2 text-green-300">·</span>
            {name}
          </span>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-green-200 bg-card px-3 py-1.5 text-xs font-bold text-green-800 transition hover:border-green-300"
          >
            <Pencil className="h-3.5 w-3.5" />
            {c.edit}
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-green-200 bg-card px-4 py-4 text-center">
          <p className="text-sm font-bold text-slate-500">{c.missing}</p>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="mt-3 h-11 w-full rounded-2xl bg-green-700 text-sm font-black text-white transition hover:bg-green-800 active:scale-[0.98]"
          >
            {c.enter}
          </button>
          <a href={`/${lang}/ontology/`} className="mt-2 inline-block text-xs font-bold text-green-800 underline underline-offset-4">
            {COPY[lang].page}
          </a>
        </div>
      )}
      {name && warning && (
        <p className="mt-2 text-xs leading-5 text-amber-700 [word-break:keep-all]">{warning}</p>
      )}
      <ProfileInputDialog locale={lang} onClose={() => setDialogOpen(false)} open={dialogOpen} />
    </div>
  );
}

interface BirthTimeFieldProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  disabled?: boolean;
}

export function BirthTimeField({ id, label, value, onChange, hint, disabled }: BirthTimeFieldProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1 block text-[11px] font-black uppercase tracking-wider text-green-600">
          {label}
          {hint && <span className="font-medium text-slate-400 normal-case"> · {hint}</span>}
        </label>
      )}
      <input
        id={id}
        type="time"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={FIELD_CLASS}
      />
    </div>
  );
}

type ChipCopy = { using: string; edit: string; missing: string; enter: string; page: string };

function ProfileChip({
  className,
  display,
  label,
  locale,
  missing,
  present,
  unlock,
}: {
  className?: string;
  display: string;
  label?: string;
  locale?: string;
  missing: string;
  present: boolean;
  unlock?: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const lang = asLang(locale ?? "en");
  const c = COPY[lang] as ChipCopy;
  return (
    <div className={className}>
      {label && (
        <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-green-600">{label}</span>
      )}
      {present ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-green-100 bg-surface-subtle px-4 py-3">
          <span className="min-w-0 truncate text-sm font-black text-green-900">
            <span className="text-green-600">{c.using}</span>
            <span className="mx-2 text-green-300">·</span>
            {display}
          </span>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-green-200 bg-card px-3 py-1.5 text-xs font-bold text-green-800 transition hover:border-green-300"
          >
            <Pencil className="h-3.5 w-3.5" />
            {c.edit}
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-green-200 bg-card px-4 py-4 text-center">
          <p className="text-sm font-bold text-slate-500">{missing}</p>
          {unlock && <p className="mt-1 text-xs leading-5 text-slate-400">{unlock}</p>}
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="mt-3 h-11 w-full rounded-2xl bg-green-700 text-sm font-black text-white transition hover:bg-green-800 active:scale-[0.98]"
          >
            {c.enter}
          </button>
          <a href={`/${lang}/ontology/`} className="mt-2 inline-block text-xs font-bold text-green-800 underline underline-offset-4">
            {c.page}
          </a>
        </div>
      )}
      <ProfileInputDialog locale={lang} onClose={() => setDialogOpen(false)} open={dialogOpen} />
    </div>
  );
}

const TIME_COPY = {
  ko: { missing: "태어난 시각이 아직 없어요", unlock: "시각을 알려 주면 시주와 상승궁이 열립니다." },
  en: { missing: "No birth time saved yet", unlock: "Add a time to unlock the hour pillar and rising sign." },
  ja: { missing: "出生時刻がまだありません", unlock: "時刻を入れると時柱と上昇宮が開きます。" },
  zh: { missing: "尚未填写出生时间", unlock: "补上时间后会打开时柱和上升宫。" },
  fr: { missing: "Aucune heure de naissance", unlock: "Ajoutez l'heure pour ouvrir le pilier de l'heure et l'ascendant." },
  es: { missing: "Aún no hay hora de nacimiento", unlock: "Añade la hora para abrir el pilar de la hora y el ascendente." },
} as const;

const PLACE_COPY = {
  ko: { missing: "출생지가 아직 없어요", unlock: "도시를 알려 주면 시간대와 상승궁이 열립니다." },
  en: { missing: "No birthplace saved yet", unlock: "Add a city to unlock timezone and the rising sign." },
  ja: { missing: "出生地がまだありません", unlock: "都市を入れると時差と上昇宮が開きます。" },
  zh: { missing: "尚未填写出生地", unlock: "补上城市后会打开时区和上升宫。" },
  fr: { missing: "Aucun lieu de naissance", unlock: "Ajoutez une ville pour le fuseau et l'ascendant." },
  es: { missing: "Aún no hay lugar de nacimiento", unlock: "Añade una ciudad para zona horaria y ascendente." },
} as const;

const GENDER_COPY = {
  ko: { missing: "성별이 아직 없어요", unlock: "성별을 알려 주면 배우자궁이 열립니다.", male: "남성", female: "여성" },
  en: { missing: "No gender saved yet", unlock: "Add gender to unlock spouse-palace reading.", male: "Male", female: "Female" },
  ja: { missing: "性別がまだありません", unlock: "性別を入れると配偶者宮が開きます。", male: "男性", female: "女性" },
  zh: { missing: "尚未填写性别", unlock: "补上性别后会打开配偶宫。", male: "男", female: "女" },
  fr: { missing: "Aucun genre enregistré", unlock: "Ajoutez le genre pour ouvrir le palais du conjoint.", male: "Homme", female: "Femme" },
  es: { missing: "Aún no hay género", unlock: "Añade el género para abrir el palacio del cónyuge.", male: "Hombre", female: "Mujer" },
} as const;

export function ProfileTimeField({
  className,
  label,
  locale,
  onChange,
  value,
  syncProfile = true,
}: {
  className?: string;
  label?: string;
  locale?: string;
  onChange: (value: string) => void;
  value: string;
  syncProfile?: boolean;
}) {
  const { parsed } = useProfilePrefill();
  const lang = asLang(locale ?? "en");
  const c = TIME_COPY[lang];
  const profileTime =
    parsed?.hour !== null && parsed?.hour !== undefined
      ? `${String(parsed.hour).padStart(2, "0")}:${String(parsed.minute ?? 0).padStart(2, "0")}`
      : "";

  useEffect(() => {
    if (syncProfile && profileTime !== value) onChange(profileTime);
  }, [profileTime, syncProfile]);

  return (
    <ProfileChip
      className={className}
      display={profileTime}
      label={label}
      locale={locale}
      missing={c.missing}
      present={!!profileTime}
      unlock={c.unlock}
    />
  );
}

export function ProfilePlaceField({
  className,
  label,
  locale,
  onChange,
  value,
}: {
  className?: string;
  label?: string;
  locale?: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const cityId = useUserStore((s) => s.profile.birthCityId) ?? "";
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const id = hydrated ? cityId : "";
  const lang = asLang(locale ?? "en");
  const c = PLACE_COPY[lang];
  const city = CITIES.find((x) => x.id === id);
  const display = city?.label[lang] ?? id;

  useEffect(() => {
    if (id !== value) onChange(id);
  }, [id]);

  return (
    <ProfileChip
      className={className}
      display={display}
      label={label}
      locale={locale}
      missing={c.missing}
      present={!!id}
      unlock={c.unlock}
    />
  );
}

export function ProfileGenderField({
  className,
  label,
  locale,
  onChange,
  value,
}: {
  className?: string;
  label?: string;
  locale?: string;
  onChange: (value: "female" | "male" | "") => void;
  value: string;
}) {
  const gender = useUserStore((s) => s.profile.gender) ?? "";
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const g = hydrated && (gender === "male" || gender === "female") ? gender : "";
  const lang = asLang(locale ?? "en");
  const c = GENDER_COPY[lang];

  useEffect(() => {
    if (g !== value) onChange(g);
  }, [g]);

  return (
    <ProfileChip
      className={className}
      display={g === "male" ? c.male : g === "female" ? c.female : ""}
      label={label}
      locale={locale}
      missing={c.missing}
      present={!!g}
      unlock={c.unlock}
    />
  );
}
