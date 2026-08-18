"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";

import { ProfileInputDialog, asLang } from "@/components/shared/ProfileInputDialog";
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
  "h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-black text-slate-900 outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

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
  ko: { using: "내 정보", edit: "수정", missing: "생년월일이 아직 없어요", enter: "내 정보 입력" },
  en: { using: "Your info", edit: "Edit", missing: "No birth date saved yet", enter: "Enter your info" },
  ja: { using: "あなたの情報", edit: "編集", missing: "生年月日がまだありません", enter: "情報を入力" },
  zh: { using: "你的信息", edit: "修改", missing: "尚未填写出生日期", enter: "填写信息" },
  fr: { using: "Vos infos", edit: "Modifier", missing: "Aucune date de naissance enregistrée", enter: "Saisir vos infos" },
  es: { using: "Tus datos", edit: "Editar", missing: "Aún no hay fecha de nacimiento", enter: "Introducir tus datos" },
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
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-green-100 bg-green-50 px-4 py-3">
          <span className="min-w-0 text-sm font-black text-green-900">
            <span className="text-green-600">{c.using}</span>
            <span className="mx-2 text-green-300">·</span>
            {profileDate}
          </span>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-green-200 bg-white px-3 py-1.5 text-xs font-bold text-green-800 transition hover:border-green-300"
          >
            <Pencil className="h-3.5 w-3.5" />
            {c.edit}
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-green-200 bg-white px-4 py-4 text-center">
          <p className="text-sm font-bold text-slate-500">{c.missing}</p>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="mt-3 h-11 w-full rounded-2xl bg-green-700 text-sm font-black text-white transition hover:bg-green-800 active:scale-[0.98]"
          >
            {c.enter}
          </button>
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
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-green-100 bg-green-50 px-4 py-3">
          <span className="min-w-0 truncate text-sm font-black text-green-900">
            <span className="text-green-600">{c.using}</span>
            <span className="mx-2 text-green-300">·</span>
            {name}
          </span>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-green-200 bg-white px-3 py-1.5 text-xs font-bold text-green-800 transition hover:border-green-300"
          >
            <Pencil className="h-3.5 w-3.5" />
            {c.edit}
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-green-200 bg-white px-4 py-4 text-center">
          <p className="text-sm font-bold text-slate-500">{c.missing}</p>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="mt-3 h-11 w-full rounded-2xl bg-green-700 text-sm font-black text-white transition hover:bg-green-800 active:scale-[0.98]"
          >
            {c.enter}
          </button>
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
