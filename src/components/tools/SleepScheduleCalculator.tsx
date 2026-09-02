import { useState } from "react";
import { sleepSchedule } from "../../lib/sleep-schedule";

const DURATIONS = ["7 h", "7 h 30", "8 h", "8 h 30", "9 h"];

export default function SleepScheduleCalculator() {
  const [direction, setDirection] = useState<"bedtime" | "wake">("bedtime");
  const [value, setValue] = useState("07:00");
  const [submitted, setSubmitted] = useState(false);
  const schedule = submitted ? sleepSchedule(value, direction) : null;
  const invalid = submitted && !schedule;
  const label = direction === "bedtime" ? "Je veux me réveiller à" : "Je veux me coucher à";
  const resultLabel = direction === "bedtime" ? "Heures de coucher indicatives" : "Heures de réveil indicatives";
  return <section className="rounded-2xl border border-green-100 bg-surface-subtle p-5" aria-labelledby="sleep-calculator-title">
    <h1 id="sleep-calculator-title" className="text-2xl font-bold text-foreground">Calculateur de sommeil : heure de coucher et de réveil</h1>
    <p className="mt-2 text-sm leading-6 text-green-800">Entrez une heure pour obtenir des repères de coucher ou de réveil basés sur 7 à 9 heures de sommeil.</p>
    <fieldset className="mt-4"><legend className="font-semibold text-foreground">Choisissez un repère</legend><div className="mt-2 flex flex-wrap gap-3">
      <label><input type="radio" name="sleep-direction" checked={direction === "bedtime"} onChange={() => { setDirection("bedtime"); setSubmitted(false); }} /> Je veux me réveiller à</label>
      <label><input type="radio" name="sleep-direction" checked={direction === "wake"} onChange={() => { setDirection("wake"); setSubmitted(false); }} /> Je veux me coucher à</label>
    </div></fieldset>
    <div className="mt-4 flex flex-wrap items-end gap-3"><label className="grid gap-1 font-semibold text-foreground">{label}<input aria-invalid={invalid || undefined} className="rounded-lg border border-green-200 bg-card px-3 py-2" type="time" value={value} onChange={(event) => setValue(event.target.value)} /></label><button className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground" type="button" onClick={() => setSubmitted(true)}>Calculer</button></div>
    {invalid && <p className="mt-3 text-sm text-red-700" role="alert">Saisissez une heure valide au format HH:mm.</p>}
    {schedule && <div className="mt-5" aria-live="polite"><h2 className="font-semibold text-foreground">{resultLabel}</h2><ul className="mt-2 grid gap-2 sm:grid-cols-5">{schedule.map((entry, index) => <li className="rounded-lg bg-card p-3 text-center" key={entry.duration}><span className="block text-xs text-green-700">environ {DURATIONS[index]}</span><strong className="text-lg text-foreground">{entry.time}</strong></li>)}</ul></div>}
    <p className="mt-4 text-xs leading-5 text-green-800">Ce calcul donne des repères horaires, pas un diagnostic. Les besoins de sommeil varient selon l’âge, la santé et la situation. En cas d’insomnie durable, de somnolence diurne ou de réveils nocturnes préoccupants, parlez-en à un professionnel de santé.</p>
  </section>;
}
