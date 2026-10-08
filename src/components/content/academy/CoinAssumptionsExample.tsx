import { useId, useState } from "react";

type SupportedLocale = "ko" | "en" | "ja" | "zh" | "fr" | "es";

const COPY = {
  ko: {
    title: "세 번 앞면이 나온 뒤, 다음 앞면은?",
    intro: "실제 동전 기록이 아닌 설명용 가정이에요. 가정을 바꿔 결론에 필요한 조건을 확인해 보세요.",
    sequence: "가정한 앞선 결과: 앞면, 앞면, 앞면",
    fair: "다음 던지기를 포함해 앞면과 뒷면의 확률이 같아요.",
    independent: "다음 결과는 앞선 결과 전체와 독립이에요.",
    result: "다음 앞면의 조건부 확률",
    known: "두 가정이 모두 맞다면 앞선 세 번의 결과와 관계없이 50%예요.",
    unknown: "정보 부족",
    missing: "이 가정만으로 다음 확률을 정할 수 없어요. 50%라는 결론을 그대로 쓰지 않아요.",
    note: "체크는 실제 동전의 성질을 입증하지 않아요. 가정 선택은 저장·전송하지 않으며 점수나 성격 판정을 만들지 않아요.",
  },
  en: {
    title: "After three heads, what is the chance of another?",
    intro: "This is an illustrative assumption, not a record of real tosses. Change the assumptions to see what the conclusion requires.",
    sequence: "Assumed previous results: heads, heads, heads",
    fair: "Heads and tails are equally likely on every toss, including the next.",
    independent: "The next result is independent of the whole earlier sequence.",
    result: "Conditional probability of the next heads",
    known: "If both assumptions hold, it is 50%, regardless of the previous three results.",
    unknown: "Insufficient information",
    missing: "These assumptions do not determine the next probability. We cannot keep the 50% conclusion.",
    note: "Checking a box does not establish a real coin's properties. Choices are not saved or sent; no personality score or verdict is produced.",
  },
  ja: {
    title: "3回続けて表が出たら、次の表の確率は？",
    intro: "実際の記録ではなく、説明のための仮定です。仮定を変えて、結論に必要な条件を確かめてください。",
    sequence: "仮定した前の結果：表、表、表",
    fair: "次の回も含め、表と裏の確率が同じです。",
    independent: "次の結果は、それまでの結果全体と独立です。",
    result: "次に表が出る条件付き確率",
    known: "両方の仮定が成り立つなら、前の3回の結果にかかわらず50%です。",
    unknown: "情報が足りません",
    missing: "この仮定だけでは次の確率を決められません。50%という結論をそのまま使いません。",
    note: "チェックしても実際のコインの性質を証明したことにはなりません。選択を保存・送信せず、性格の点数や判定も作りません。",
  },
  zh: {
    title: "连续三次正面之后，下一次正面的概率是多少？",
    intro: "这是用于说明的假设，不是真实投掷记录。改变假设，看看结论需要哪些条件。",
    sequence: "假设此前结果：正面、正面、正面",
    fair: "包括下一次在内，每次正面和反面的概率相同。",
    independent: "下一次结果与此前的整段结果相互独立。",
    result: "下一次正面的条件概率",
    known: "如果两个假设都成立，无论前三次结果如何，概率都是50%。",
    unknown: "信息不足",
    missing: "仅凭这些假设无法确定下一次的概率，不能继续使用50%的结论。",
    note: "勾选不能证明真实硬币的性质。选择不会保存或发送，也不会产生性格分数或判断。",
  },
  fr: {
    title: "Après trois faces, quelle est la probabilité d’une autre face ?",
    intro: "Il s’agit d’un exemple hypothétique, pas d’un relevé réel. Changez les hypothèses pour voir les conditions nécessaires à la conclusion.",
    sequence: "Résultats précédents supposés : face, face, face",
    fair: "Face et pile sont équiprobables à chaque lancer, y compris au prochain.",
    independent: "Le prochain résultat est indépendant de toute la séquence précédente.",
    result: "Probabilité conditionnelle d’obtenir face au prochain lancer",
    known: "Si les deux hypothèses sont vraies, elle vaut 50%, quels que soient les trois résultats précédents.",
    unknown: "Informations insuffisantes",
    missing: "Ces hypothèses ne permettent pas de déterminer la prochaine probabilité. On ne conserve pas la conclusion de 50%.",
    note: "Cocher une case ne prouve pas les propriétés d’une pièce réelle. Les choix ne sont ni enregistrés ni envoyés ; aucun score de personnalité ni verdict n’est produit.",
  },
  es: {
    title: "Después de tres caras, ¿cuál es la probabilidad de otra cara?",
    intro: "Es un ejemplo hipotético, no un registro real. Cambia los supuestos para ver qué condiciones necesita la conclusión.",
    sequence: "Resultados anteriores supuestos: cara, cara, cara",
    fair: "Cara y cruz son igual de probables en cada lanzamiento, incluido el próximo.",
    independent: "El próximo resultado es independiente de toda la secuencia anterior.",
    result: "Probabilidad condicional de cara en el próximo lanzamiento",
    known: "Si ambos supuestos se cumplen, es del 50%, sean cuales sean los tres resultados anteriores.",
    unknown: "Información insuficiente",
    missing: "Estos supuestos no determinan la próxima probabilidad. No podemos mantener la conclusión del 50%.",
    note: "Marcar una casilla no demuestra las propiedades de una moneda real. Las elecciones no se guardan ni se envían; no se genera una puntuación ni un diagnóstico de personalidad.",
  },
} satisfies Record<SupportedLocale, Record<string, string>>;

// 2026-10-08: only the stated fair-and-independent model yields this value.
// Removing an assumption supplies no alternative distribution or measured data.
export function assumedNextHeadsProbability(fair: boolean, independent: boolean): number | null {
  return fair && independent ? 0.5 : null;
}

export function CoinAssumptionsExample({ locale = "ko" }: { locale?: SupportedLocale }) {
  const t = COPY[locale];
  const id = useId();
  const [fair, setFair] = useState(true);
  const [independent, setIndependent] = useState(true);
  const probability = assumedNextHeadsProbability(fair, independent);

  return (
    <section className="my-8 rounded-2xl border border-border bg-card p-5 sm:p-6" aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`} className="text-lg font-semibold text-foreground">{t.title}</h3>
      <p id={`${id}-intro`} className="mt-2 text-sm leading-6 text-muted-foreground">{t.intro}</p>
      <p className="mt-4 rounded-lg bg-muted p-3 text-sm font-medium text-foreground">{t.sequence}</p>
      <fieldset className="mt-4 space-y-2" aria-describedby={`${id}-intro ${id}-note`}>
        <legend className="sr-only">{t.intro}</legend>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-border p-3 text-sm leading-6 text-foreground">
          <input type="checkbox" className="size-5 shrink-0 accent-primary" checked={fair} onChange={(event) => setFair(event.target.checked)} />
          <span>{t.fair}</span>
        </label>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-border p-3 text-sm leading-6 text-foreground">
          <input type="checkbox" className="size-5 shrink-0 accent-primary" checked={independent} onChange={(event) => setIndependent(event.target.checked)} />
          <span>{t.independent}</span>
        </label>
      </fieldset>
      <div className="mt-4 rounded-xl bg-surface-subtle p-4" role="status" aria-live="polite" aria-atomic="true">
        <p className="text-sm font-medium text-muted-foreground">{t.result}</p>
        <p className="mt-2 text-2xl font-semibold text-foreground">{probability === null ? t.unknown : "50%"}</p>
        <p className="mt-2 text-sm leading-6 text-foreground">{probability === null ? t.missing : t.known}</p>
      </div>
      <p id={`${id}-note`} className="mt-4 text-xs leading-5 text-muted-foreground">{t.note}</p>
    </section>
  );
}
