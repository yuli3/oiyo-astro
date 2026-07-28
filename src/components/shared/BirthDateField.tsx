/**
 * Shared visual style for birth-date/time inputs, extracted from OntologyBirthInput.tsx
 * so individual tool calculators can match its look without adopting its global-profile
 * save logic. Presentational only — callers own their own state and validation.
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
}

export function BirthDateField({ id, label, value, onChange, min, max, className }: BirthDateFieldProps) {
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
