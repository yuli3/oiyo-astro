import { useState } from "react";

type SupportedLocale = "ko" | "en" | "ja" | "zh" | "fr" | "es";

const COPY = {
  ko: {
    title: "식사·생활 습관 돌아보기",
    intro: "최근 일주일을 돌아봐요. 아래 내용은 선택값 요약일 뿐, 장내 미생물·장벽·건강 상태를 측정하거나 진단하지 않아요. 저장하거나 전송하지 않아요.",
    plants: "일주일 동안 먹은 식물성 식재료 수",
    fermented: "발효 식품",
    processed: "초가공식품·단 음료",
    stress: "스트레스",
    rarely: "거의 없음",
    sometimes: "가끔",
    often: "자주",
    low: "낮음",
    medium: "보통",
    high: "높음",
    next: "내가 선택한 내용",
    reflection: "바꾸고 싶은 항목이 있나요? 하나를 골라 식사·수면·스트레스와 몸의 느낌을 따로 기록해봐요. 함께 변했다고 원인으로 단정하지 않아요.",
    notice: "복통, 출혈, 지속적인 설사·변비, 급격한 체중 변화가 있다면 이 결과와 관계없이 의료진에게 상담하세요.",
  },
  en: {
    title: "Reflect on food and daily habits",
    intro: "Reflect on the past week. This only summarizes your selections; it does not measure or diagnose your microbes, gut barrier, or health. Nothing is saved or sent.",
    plants: "Different plant foods this week",
    fermented: "Fermented foods",
    processed: "Ultra-processed food and sugary drinks",
    stress: "Stress",
    rarely: "Rarely",
    sometimes: "Sometimes",
    often: "Often",
    low: "Low",
    medium: "Medium",
    high: "High",
    next: "Your selections",
    reflection: "Is there one item you want to revisit? Record food, sleep, stress, and bodily sensations separately. Changes occurring together do not establish a cause.",
    notice: "Seek medical advice for pain, bleeding, persistent diarrhea or constipation, or rapid weight change regardless of this result.",
  },
  ja: {
    title: "食事と生活習慣を振り返る",
    intro: "直近1週間を振り返ります。選択内容の要約であり、微生物・腸のバリア・健康状態を測定、診断するものではありません。保存や送信はしません。",
    plants: "1週間に食べた植物性食材の種類",
    fermented: "発酵食品",
    processed: "超加工食品・甘い飲み物",
    stress: "ストレス",
    rarely: "ほぼなし",
    sometimes: "時々",
    often: "頻繁",
    low: "低い",
    medium: "普通",
    high: "高い",
    next: "選択した内容",
    reflection: "見直したい項目はありますか。食事、睡眠、ストレス、身体の感覚を分けて記録してみましょう。一緒に変化しても原因と断定はできません。",
    notice: "腹痛、出血、長引く下痢・便秘、急な体重変化がある場合は、この結果にかかわらず医療機関に相談してください。",
  },
  zh: {
    title: "回顾饮食与生活习惯",
    intro: "回顾最近一周。这里只汇总您的选择，不测量或诊断微生物、肠道屏障或健康状况。不会保存或发送数据。",
    plants: "本周吃过的植物性食物种类", fermented: "发酵食品", processed: "超加工食品与含糖饮料", stress: "压力",
    rarely: "很少", sometimes: "偶尔", often: "经常", low: "低", medium: "中等", high: "高",
    next: "您选择的内容",
    reflection: "有没有想重新审视的一项？分别记录饮食、睡眠、压力和身体感受。同时变化不代表存在因果关系。",
    notice: "若有疼痛、出血、持续腹泻或便秘，或体重迅速变化，请咨询医疗专业人员，不要依据此汇总判断。",
  },
  fr: {
    title: "Faire le point sur vos habitudes",
    intro: "Repensez à la semaine passée. Ce résumé reprend vos choix sans mesurer ni diagnostiquer votre microbiote, votre barrière intestinale ou votre santé. Rien n’est enregistré ni envoyé.",
    plants: "Types d’aliments végétaux cette semaine", fermented: "Aliments fermentés", processed: "Aliments ultratransformés et boissons sucrées", stress: "Stress",
    rarely: "Rarement", sometimes: "Parfois", often: "Souvent", low: "Faible", medium: "Modéré", high: "Élevé",
    next: "Vos choix",
    reflection: "Souhaitez-vous revoir un élément ? Notez séparément alimentation, sommeil, stress et sensations. Des changements simultanés ne prouvent pas une cause.",
    notice: "En cas de douleur, saignement, diarrhée ou constipation persistante, ou changement rapide de poids, consultez un professionnel de santé sans vous fier à ce résumé.",
  },
  es: {
    title: "Repase sus hábitos",
    intro: "Piense en la última semana. Este resumen solo refleja sus elecciones: no mide ni diagnostica la microbiota, la barrera intestinal ni su salud. No se guarda ni se envía nada.",
    plants: "Tipos de alimentos vegetales esta semana", fermented: "Alimentos fermentados", processed: "Alimentos ultraprocesados y bebidas azucaradas", stress: "Estrés",
    rarely: "Rara vez", sometimes: "A veces", often: "A menudo", low: "Bajo", medium: "Moderado", high: "Alto",
    next: "Sus elecciones",
    reflection: "¿Hay algo que quiera revisar? Registre por separado alimentación, sueño, estrés y sensaciones. Que cambien a la vez no demuestra una causa.",
    notice: "Consulte a un profesional ante dolor, sangrado, diarrea o estreñimiento persistentes, o cambios rápidos de peso, independientemente de este resumen.",
  },
};

function HabitSelect({ label, value, onChange, options }: { label: string; value: number; onChange: (value: number) => void; options: string[] }) {
  return <label className="block text-sm font-semibold text-foreground">{label}<select className="mt-2 min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2" value={value} onChange={(event) => onChange(Number(event.target.value))}>{options.map((option, index) => <option key={option} value={index}>{option}</option>)}</select></label>;
}

export const GutGardenSimulator = ({ locale = "ko" }: { locale?: string }) => {
  const language: SupportedLocale = Object.hasOwn(COPY, locale) ? locale as SupportedLocale : "ko";
  const t = COPY[language];
  const [plants, setPlants] = useState(12);
  const [fermented, setFermented] = useState(1);
  const [processed, setProcessed] = useState(1);
  const [stress, setStress] = useState(1);

  const options = [t.rarely, t.sometimes, t.often];
  // 2026-10-07: self-reported choices cannot measure microbes or gut barriers.
  // Show the inputs themselves, never an invented biological score.
  const summary = [[t.plants, String(plants)], [t.fermented, options[fermented]], [t.processed, options[processed]], [t.stress, [t.low, t.medium, t.high][stress]]];

  return <section className="my-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
    <h3 className="text-xl font-bold text-foreground">{t.title}</h3>
    <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.intro}</p>
    <div className="mt-6 space-y-5">
      <label className="block text-sm font-semibold text-foreground">{t.plants}: <strong>{plants}</strong><input className="mt-3 block min-h-11 w-full" type="range" min="0" max="40" step="1" value={plants} onChange={(event) => setPlants(Number(event.target.value))} /></label>
      <div className="space-y-4"><HabitSelect label={t.fermented} value={fermented} onChange={setFermented} options={options} /><HabitSelect label={t.processed} value={processed} onChange={setProcessed} options={options} /><HabitSelect label={t.stress} value={stress} onChange={setStress} options={[t.low, t.medium, t.high]} /></div>
    </div>
    <div className="mt-5 rounded-xl bg-muted/50 p-4"><h4 className="text-sm font-bold text-foreground">{t.next}</h4><dl className="mt-3 space-y-3" aria-live="polite">{summary.map(([label, value]) => <div key={label}><dt className="text-sm text-muted-foreground">{label}</dt><dd className="font-semibold text-foreground">{value}</dd></div>)}</dl><p className="mt-4 text-sm leading-6 text-muted-foreground">{t.reflection}</p></div>
    <p className="mt-4 text-xs leading-5 text-muted-foreground">{t.notice}</p>
  </section>;
};
