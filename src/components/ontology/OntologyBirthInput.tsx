"use client";

import { Calendar, Check, Pencil } from "lucide-react";
import { useState } from "react";
import { useUserProfile } from "@/lib/user/context/UserContext";

type Copy = {
  cancel: string;
  edit: string;
  prompt: string;
  save: string;
  saved: string;
  title: string;
};
const COPY: Record<string, Copy> = {
  ko: {
    cancel: "취소",
    edit: "수정",
    prompt: "생년월일을 입력하면 사주·별자리·오늘의 나 좌표가 열립니다.",
    save: "저장",
    saved: "생년월일이 기록되었습니다.",
    title: "생년월일 입력",
  },
  en: {
    cancel: "Cancel",
    edit: "Edit",
    prompt: "Enter your birth date to unlock Saju, zodiac, and today's coordinates.",
    save: "Save",
    saved: "Birth date saved.",
    title: "Birth date",
  },
  ja: {
    cancel: "キャンセル",
    edit: "編集",
    prompt: "生年月日を入力すると四柱・星座・今日の私の座標が開きます。",
    save: "保存",
    saved: "生年月日を記録しました。",
    title: "生年月日",
  },
  zh: {
    cancel: "取消",
    edit: "修改",
    prompt: "输入出生日期即可解锁八字、星座与今天的我的坐标。",
    save: "保存",
    saved: "已记录出生日期。",
    title: "出生日期",
  },
  fr: {
    cancel: "Annuler",
    edit: "Modifier",
    prompt: "Saisissez votre date de naissance pour débloquer Saju, zodiaque et aujourd'hui.",
    save: "Enregistrer",
    saved: "Date enregistrée.",
    title: "Date de naissance",
  },
  es: {
    cancel: "Cancelar",
    edit: "Editar",
    prompt: "Introduce tu fecha de nacimiento para desbloquear Saju, zodiaco y hoy.",
    save: "Guardar",
    saved: "Fecha guardada.",
    title: "Fecha de nacimiento",
  },
};

const toDateInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

export function OntologyBirthInput({ locale }: { locale: string }) {
  const { profile, setBirthDate } = useUserProfile();
  const c = COPY[locale] ?? COPY.en;
  const has = !!profile.birthDate;
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState("");

  const save = () => {
    const nextValue = val || toDateInput(profile.birthDate);
    if (!nextValue) return;
    setBirthDate(nextValue);
    setEditing(false);
    window.dispatchEvent(new Event("oiyo:ontology-progress-updated"));
  };

  const showForm = !has || editing;

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
          <label className="sr-only" htmlFor="ontology-birth-date">
            {c.title}
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="h-14 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-black text-slate-900 outline-none transition focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10"
              id="ontology-birth-date"
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setVal(e.target.value)}
              type="date"
              value={val || toDateInput(profile.birthDate)}
            />
            <button
              className="h-14 rounded-2xl bg-green-700 px-5 text-sm font-black text-white transition hover:bg-green-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-24"
              disabled={!val && !toDateInput(profile.birthDate)}
              onClick={save}
            >
              {c.save}
            </button>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] leading-5 text-slate-400">
              YYYY-MM-DD
            </p>
            {has && (
              <button
                className="rounded-xl px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                onClick={() => {
                  setEditing(false);
                  setVal("");
                }}
              >
                {c.cancel}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-green-50 px-3 py-3">
          <p className="flex min-w-0 items-center gap-2 text-xs leading-5 text-green-800">
            <Check className="h-4 w-4 shrink-0" />
            <span className="min-w-0">
              {c.saved}{" "}
              <span className="font-black">{toDateInput(profile.birthDate)}</span>
            </span>
          </p>
          <button
            className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-green-200 bg-white px-3 py-2 text-xs font-bold text-green-800 hover:border-green-300"
            onClick={() => {
              setEditing(true);
              setVal(toDateInput(profile.birthDate));
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
            {c.edit}
          </button>
        </div>
      )}
    </section>
  );
}
