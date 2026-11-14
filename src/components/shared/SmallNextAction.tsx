import { useId, useState } from 'react';
import { nextAction, type ActionEnergy, type ActionMinutes } from '../../lib/wellbeing/small-next-action';
const copy = {
  "ko": [
    "지금 할 수 있는 작은 한 가지",
    "현재 여유",
    "기운이 별로 없어요",
    "조금 여유가 있어요",
    "쓸 수 있는 시간",
    "분",
    "선택한 시간은 목표가 아닌 여유예요. 쉬거나 건너뛰어도 괜찮아요. 진단·치료를 대신하지 않아요.",
    [
      "화면에서 잠시 눈을 떼고 편한 자세로 쉬어보세요.",
      "눈앞의 물건 하나만 제자리에 놓아보세요.",
      "미뤄둔 일의 첫 단계만 잠깐 해보세요.",
      "오늘 해볼 일 하나를 한 문장으로 적어보세요.",
      "해볼 일에 필요한 것 하나를 준비해보세요.",
      "시간을 전부 쓰지 않아도 돼요. 요즘 나를 지치게 하는 것 한 가지를 적어보세요."
    ]
  ],
  "en": [
    "One small thing you could try",
    "Capacity right now",
    "Very little energy",
    "Some room to try",
    "Time available",
    "min",
    "This time is room to spare, not a target. Rest or skip this if you prefer. This does not replace diagnosis or treatment.",
    [
      "Look away from the screen and rest in a comfortable position.",
      "Put just one nearby item back in its place.",
      "Try only the first step of a task you have put off.",
      "Write one sentence naming something you might try today.",
      "Prepare one thing you would need for a task.",
      "You do not need to use all the time. Write down one thing that has been tiring you lately."
    ]
  ],
  "ja": [
    "今できそうな小さな一歩",
    "今の余裕",
    "あまり元気がありません",
    "少し余裕があります",
    "使える時間",
    "分",
    "時間は目標ではなく余裕の目安です。休んだり飛ばしたりしても大丈夫です。診断や治療の代わりにはなりません。",
    [
      "画面から目を離し、楽な姿勢で休んでみましょう。",
      "近くの物を一つだけ元の場所に戻してみましょう。",
      "後回しにしたことの最初の一歩だけ試してみましょう。",
      "今日試せそうなことを一文で書いてみましょう。",
      "やってみたいことに必要な物を一つ準備してみましょう。",
      "時間を全部使う必要はありません。最近疲れを感じる原因を一つ書いてみましょう。"
    ]
  ],
  "zh": [
    "现在可以尝试的一小步",
    "此刻的余力",
    "没什么精力",
    "还有一点余力",
    "可用时间",
    "分钟",
    "时间只是余裕，不是任务。可以休息，也可以跳过。这不能替代诊断或治疗。",
    [
      "暂时移开看屏幕的视线，以舒服的姿势休息。",
      "只把身边的一件物品放回原位。",
      "只尝试一件拖延事项的第一步。",
      "用一句话写下今天想试的一件事。",
      "为想做的事准备一样需要的东西。",
      "不必用完这些时间。写下一件最近让你疲惫的事。"
    ]
  ],
  "fr": [
    "Un petit geste à essayer",
    "Votre énergie actuelle",
    "Très peu d’énergie",
    "Un peu de disponibilité",
    "Temps disponible",
    "min",
    "Ce temps est une marge, pas un objectif. Vous pouvez vous reposer ou passer. Ceci ne remplace ni diagnostic ni traitement.",
    [
      "Détournez les yeux de l’écran et reposez-vous dans une position confortable.",
      "Remettez un seul objet proche à sa place.",
      "Essayez seulement la première étape d’une tâche reportée.",
      "Écrivez en une phrase une chose à essayer aujourd’hui.",
      "Préparez une chose nécessaire pour une tâche.",
      "Inutile d’utiliser tout ce temps. Notez une chose qui vous fatigue ces derniers temps."
    ]
  ],
  "es": [
    "Un pequeño paso que puedes probar",
    "Energía en este momento",
    "Muy poca energía",
    "Algo de margen",
    "Tiempo disponible",
    "min",
    "Este tiempo es un margen, no una meta. Puedes descansar u omitirlo. No sustituye un diagnóstico ni un tratamiento.",
    [
      "Aparta la vista de la pantalla y descansa en una postura cómoda.",
      "Devuelve a su sitio un solo objeto cercano.",
      "Prueba solo el primer paso de una tarea que has pospuesto.",
      "Escribe en una frase algo que podrías probar hoy.",
      "Prepara una cosa que necesites para una tarea.",
      "No hace falta usar todo el tiempo. Anota una cosa que te esté cansando últimamente."
    ]
  ]
} as const;
const kinds = ['pause','clear','start','choose','prepare','reflect'] as const;
export default function SmallNextAction({ locale }: { locale: string }) {
 const lang = locale === 'cn' ? 'zh' : locale;
 const t = copy[lang as keyof typeof copy] ?? copy.en;
 const id = useId();
 const [energy, setEnergy] = useState<ActionEnergy>('low');
 const [minutes, setMinutes] = useState<ActionMinutes>(1);
 const action = nextAction(energy, minutes);
 const alternatives = (['pause','clear','choose'] as const).filter(x => x !== action).slice(0,2);
 const more = ({ko:'다른 방법 두 가지',en:'Two alternatives',ja:'ほかの二つの方法',zh:'另外两种选择',fr:'Deux autres possibilités',es:'Otras dos opciones'})[lang as keyof typeof copy] ?? 'Two alternatives';
 return <section data-small-next-action className="rounded-xl border border-border bg-card p-4 space-y-3" aria-labelledby={id}>
  <h2 id={id} className="font-bold text-foreground">{t[0]}</h2>
  <fieldset><legend className="text-sm text-muted-foreground">{t[1]}</legend><div className="mt-2 flex flex-wrap gap-2">{(['low','available'] as const).map((v,i)=><button key={v} type="button" aria-pressed={energy===v} onClick={()=>setEnergy(v)} className={`min-h-11 rounded-lg border px-3 py-2 text-sm ${energy===v?'border-primary bg-primary text-primary-foreground':'border-border bg-background text-foreground'}`}>{t[i+2]}</button>)}</div></fieldset>
  <fieldset><legend className="text-sm text-muted-foreground">{t[4]}</legend><div className="mt-2 flex gap-2">{([1,5,15] as const).map(v=><button key={v} type="button" aria-pressed={minutes===v} onClick={()=>setMinutes(v)} className={`min-h-11 rounded-lg border px-3 py-2 text-sm ${minutes===v?'border-primary bg-primary text-primary-foreground':'border-border bg-background text-foreground'}`}>{v} {t[5]}</button>)}</div></fieldset>
  <p aria-live="polite" data-next-action={action} className="rounded-lg bg-muted p-3 text-sm leading-relaxed">{t[7][kinds.indexOf(action)]}</p>
  <details><summary className="cursor-pointer text-sm text-primary">{more}</summary><ul className="mt-2 list-disc space-y-2 pl-5 text-sm">{alternatives.map(a=><li key={a}>{t[7][kinds.indexOf(a)]}</li>)}</ul></details>
  <p className="text-xs leading-relaxed text-muted-foreground">{t[6]}</p>
 </section>;
}
