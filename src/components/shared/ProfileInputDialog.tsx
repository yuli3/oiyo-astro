"use client";

import { useEffect, useRef, useState } from "react";
import { OntologyBirthInput } from "@/components/ontology/OntologyBirthInput";

/**
 * The one place a visitor types their birth info, reachable from anywhere.
 *
 * Every calculator used to carry its own date box, so the same facts were
 * asked for again on each page and the answers did not travel. The profile at
 * /ontology is the record; this dialog is that same form, brought to whatever
 * page the visitor happens to be on, so no tool needs an input of its own.
 *
 * It renders OntologyBirthInput rather than a copy of its markup — two forms
 * writing the same profile would drift, and the fields, locales and save path
 * all already live there.
 */

type Lang = "ko" | "en" | "ja" | "zh" | "fr" | "es";

const COPY: Record<Lang, { close: string; heading: string; page: string }> = {
  ko: { close: "닫기", heading: "내 정보", page: "온톨로지에서 입력" },
  en: { close: "Close", heading: "Your info", page: "Enter on Ontology" },
  ja: { close: "閉じる", heading: "あなたの情報", page: "存在論で入力" },
  zh: { close: "关闭", heading: "你的信息", page: "到存在论填写" },
  fr: { close: "Fermer", heading: "Vos infos", page: "Saisir dans Ontologie" },
  es: { close: "Cerrar", heading: "Tus datos", page: "Completar en Ontología" },
};

export const asLang = (locale: string): Lang =>
  (["ko", "en", "ja", "zh", "fr", "es"].includes(locale) ? locale : "en") as Lang;

export function ProfileInputDialog({
  locale,
  onClose,
  open,
}: {
  locale: string;
  onClose: () => void;
  open: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const c = COPY[asLang(locale)];

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={c.heading}
      onClose={onClose}
      onClick={(event) => {
        // Native <dialog> puts the backdrop on the element itself, so a click
        // that lands on the dialog box but not its contents is a backdrop click.
        if (event.target === ref.current) onClose();
      }}
      className="w-[min(28rem,calc(100vw-2rem))] rounded-[28px] border border-green-100 bg-transparent p-0 backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm"
    >
      <div className="max-h-[85vh] overflow-y-auto rounded-[28px] bg-white">
        <OntologyBirthInput locale={locale} onSaved={onClose} />
        <div className="px-4 pb-4 sm:px-5">
          <a
            href={`/${asLang(locale)}/ontology/`}
            className="mb-2 flex h-11 w-full items-center justify-center rounded-2xl text-sm font-bold text-green-800 underline underline-offset-4"
          >
            {c.page}
          </a>
          <button
            type="button"
            onClick={onClose}
            className="h-11 w-full rounded-2xl border border-slate-200 text-sm font-bold text-slate-500 transition hover:bg-slate-50"
          >
            {c.close}
          </button>
        </div>
      </div>
    </dialog>
  );
}

/** Opens the profile dialog from anywhere; owns nothing but the open flag. */
export function useProfileDialog(locale: string) {
  const [open, setOpen] = useState(false);
  return {
    dialog: <ProfileInputDialog locale={locale} onClose={() => setOpen(false)} open={open} />,
    openDialog: () => setOpen(true),
  };
}
