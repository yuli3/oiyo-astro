"use client";

import { useState } from "react";
import { useUserProfile } from "@/lib/user/context/UserContext";

type Copy = { title: string; prompt: string; save: string; saved: string; edit: string; cancel: string };
const COPY: Record<string, Copy> = {
  ko: { title: "생년월일로 지도 열기", prompt: "생년월일을 입력하면 사주·별자리·오늘의 나 좌표가 열립니다.", save: "저장", saved: "생년월일이 기록되어 사주·별자리 좌표가 열렸어요.", edit: "수정", cancel: "취소" },
  en: { title: "Open your map with your birth date", prompt: "Enter your birth date to unlock Saju, zodiac, and today's coordinates.", save: "Save", saved: "Birth date saved — Saju & zodiac coordinates unlocked.", edit: "Edit", cancel: "Cancel" },
  ja: { title: "生年月日で地図を開く", prompt: "生年月日を入力すると四柱・星座・今日の私の座標が開きます。", save: "保存", saved: "生年月日を記録しました。四柱・星座の座標が開きました。", edit: "編集", cancel: "キャンセル" },
  zh: { title: "用出生日期开启地图", prompt: "输入出生日期即可解锁八字、星座与今天的我的坐标。", save: "保存", saved: "已记录出生日期，八字与星座坐标已解锁。", edit: "修改", cancel: "取消" },
  fr: { title: "Ouvrez votre carte avec votre date de naissance", prompt: "Saisissez votre date de naissance pour débloquer Saju, zodiaque et aujourd'hui.", save: "Enregistrer", saved: "Date enregistrée — coordonnées Saju et zodiaque débloquées.", edit: "Modifier", cancel: "Annuler" },
  es: { title: "Abre tu mapa con tu fecha de nacimiento", prompt: "Introduce tu fecha de nacimiento para desbloquear Saju, zodiaco y hoy.", save: "Guardar", saved: "Fecha guardada — coordenadas de Saju y zodiaco desbloqueadas.", edit: "Editar", cancel: "Cancelar" },
};

const toDateInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

export function OntologyBirthInput({ locale }: { locale: string }) {
  const { profile, setBirthDate, isInitialized } = useUserProfile();
  const c = COPY[locale] ?? COPY.en;
  const has = !!profile.birthDate;
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState("");

  // Avoid hydration flash: render nothing until the persisted store is ready.
  if (!isInitialized) return null;

  const save = () => {
    if (!val) return;
    const iso = new Date(`${val}T00:00:00`).toISOString();
    setBirthDate(iso);
    setEditing(false);
    // Notify the server-rendered Zone 1 stats/journey to re-read.
    window.dispatchEvent(new Event("oiyo:ontology-progress-updated"));
  };

  const showForm = !has || editing;

  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
      <p className="text-sm font-black text-violet-950">{c.title}</p>
      {showForm ? (
        <>
          <p className="mt-1 text-xs leading-6 text-violet-700">{c.prompt}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={val || toDateInput(profile.birthDate)}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setVal(e.target.value)}
              className="rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm text-violet-900 outline-none focus:border-violet-500"
            />
            <button
              onClick={save}
              disabled={!val && !toDateInput(profile.birthDate)}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-black text-white transition hover:bg-violet-700 disabled:opacity-50"
            >
              {c.save}
            </button>
            {has && (
              <button onClick={() => { setEditing(false); setVal(""); }} className="rounded-lg px-3 py-2 text-sm font-bold text-violet-600 hover:text-violet-800">
                {c.cancel}
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs leading-6 text-emerald-700">✓ {c.saved} <span className="font-black">{toDateInput(profile.birthDate)}</span></p>
          <button onClick={() => { setEditing(true); setVal(toDateInput(profile.birthDate)); }} className="rounded-lg border border-violet-200 px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-white">
            {c.edit}
          </button>
        </div>
      )}
    </div>
  );
}
