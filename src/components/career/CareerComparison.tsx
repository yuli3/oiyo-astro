import { useId } from 'react'
import { Button } from '@/components/ui/button'
import type { CareerExample } from '@/lib/career-exploration'
import CareerExplorationActivity from './CareerExplorationActivity'
import CareerSkillBridge from './CareerSkillBridge'

export const CAREER_COMPARISON_COPY = {
  ko: { title: '두 직업을 나란히 살펴봐요', intro: '관심 있는 직업을 최대 두 개 골라 설명을 비교해 보세요. 더 잘 맞는 직업을 판정하는 기능은 아니에요.', add: '비교에 담기', selected: '비교에 담았어요', full: '두 개를 골랐어요. 바꾸려면 먼저 하나를 빼 주세요.', empty: '아래 목록에서 비교할 직업을 골라 주세요.', one: '하나 더 고르면 나란히 볼 수 있어요.', remove: '빼기', description: '하는 일 요약', code: '흥미 코드', missing: '아직 확인하지 않았어요.', question: '다음에는 무엇을 확인할까요?', prompt: '각 직업의 실제 채용 공고에서 자주 하는 업무를 세 가지씩 찾아보세요. 설명만으로 알 수 없는 자격·근무환경도 따로 확인해 보세요.', neutral: '흥미 점수가 비슷해 직업명순으로 보여 드려요. 순서는 적합도 순위가 아니에요.', grouped: '흥미 코드로 묶어 보여 드려요. 순서는 적합도 순위가 아니에요.', removeLabel: (name: string) => `${name} 비교에서 빼기`, count: (n: number) => `비교할 직업 ${n} / 2개` },
  en: { title: 'Explore two careers side by side', intro: 'Choose up to two careers and compare their descriptions. This does not decide which career fits you better.', add: 'Add to comparison', selected: 'Added to comparison', full: 'Two careers selected. Remove one to choose another.', empty: 'Choose careers from the list below.', one: 'Choose one more career to compare them side by side.', remove: 'Remove', description: 'Work summary', code: 'Interest code', missing: 'Not yet checked.', question: 'What could you check next?', prompt: 'Find three recurring tasks in actual job listings for each career. Check qualifications and working conditions separately; these summaries cannot establish them.', neutral: 'Your interest scores are close, so careers appear alphabetically, not in order of fit.', grouped: 'Careers are grouped by interest code, not ranked by fit.', removeLabel: (name: string) => `Remove ${name}`, count: (n: number) => `${n} / 2 careers selected` },
  ja: { title: '二つの職業を並べて見てみましょう', intro: '気になる職業を二つまで選び、説明を比べられます。どちらが適職かを判定するものではありません。', add: '比較に追加', selected: '比較に追加済み', full: '二つ選択済みです。変更するには先に一つ外してください。', empty: '下の一覧から比べたい職業を選んでください。', one: 'もう一つ選ぶと並べて比較できます。', remove: '外す', description: '仕事内容の要約', code: '興味コード', missing: 'まだ確認していません。', question: '次は何を確認しましょうか？', prompt: 'それぞれの実際の求人で、繰り返し出てくる業務を三つ探してみましょう。資格や勤務環境は、この要約だけでは分からないため別途確認してください。', neutral: '興味の得点が近いため、職業名順で表示しています。適職の順位ではありません。', grouped: '興味コードでまとめています。適職の順位ではありません。', removeLabel: (name: string) => `${name}を比較から外す`, count: (n: number) => `比較する職業 ${n} / 2件` },
  zh: { title: '并排了解两种职业', intro: '最多选择两种感兴趣的职业，比较它们的介绍。这不能判断哪种职业更适合您。', add: '加入比较', selected: '已加入比较', full: '已选两种职业。如需更换，请先移除一种。', empty: '请从下方列表选择要比较的职业。', one: '再选一种职业，就能并排比较。', remove: '移除', description: '工作内容摘要', code: '兴趣代码', missing: '尚未核实。', question: '接下来可以核实什么？', prompt: '请在每种职业的实际招聘信息中找出三项经常出现的工作任务。资格和工作环境需要另行核实，不能仅凭摘要判断。', neutral: '您的兴趣得分接近，因此按职业名称排序，而非适合程度排序。', grouped: '按兴趣代码分组展示，并非适合程度排名。', removeLabel: (name: string) => `从比较中移除${name}`, count: (n: number) => `已选 ${n} / 2 种职业` },
  fr: { title: 'Explorez deux métiers côte à côte', intro: 'Choisissez jusqu’à deux métiers et comparez leurs descriptions. Cela ne détermine pas lequel vous convient le mieux.', add: 'Ajouter à la comparaison', selected: 'Ajouté à la comparaison', full: 'Deux métiers sélectionnés. Retirez-en un pour en choisir un autre.', empty: 'Choisissez des métiers dans la liste ci-dessous.', one: 'Choisissez un autre métier pour les comparer côte à côte.', remove: 'Retirer', description: 'Résumé des activités', code: 'Code d’intérêt', missing: 'Pas encore vérifié.', question: 'Que pourriez-vous vérifier ensuite ?', prompt: 'Repérez trois tâches récurrentes dans des offres réelles pour chaque métier. Vérifiez séparément les qualifications et les conditions de travail : ces résumés ne suffisent pas à les établir.', neutral: 'Vos scores d’intérêt sont proches : les métiers sont classés par nom, pas par adéquation.', grouped: 'Les métiers sont regroupés par code d’intérêt, sans classement d’adéquation.', removeLabel: (name: string) => `Retirer ${name}`, count: (n: number) => `${n} / 2 métiers sélectionnés` },
  es: { title: 'Explore dos profesiones en paralelo', intro: 'Elija hasta dos profesiones y compare sus descripciones. Esto no determina cuál encaja mejor con usted.', add: 'Añadir a la comparación', selected: 'Añadida a la comparación', full: 'Ha elegido dos profesiones. Quite una para elegir otra.', empty: 'Elija profesiones de la lista de abajo.', one: 'Elija otra profesión para compararlas en paralelo.', remove: 'Quitar', description: 'Resumen del trabajo', code: 'Código de interés', missing: 'Aún no se ha comprobado.', question: '¿Qué podría comprobar después?', prompt: 'Busque tres tareas recurrentes en ofertas reales de cada profesión. Compruebe por separado los requisitos y las condiciones laborales; estos resúmenes no bastan para establecerlos.', neutral: 'Sus puntuaciones de interés son cercanas: las profesiones se ordenan por nombre, no por adecuación.', grouped: 'Las profesiones se agrupan por código de interés, no por adecuación.', removeLabel: (name: string) => `Quitar ${name}`, count: (n: number) => `${n} / 2 profesiones seleccionadas` },
}

type Props = { locale: keyof typeof CAREER_COMPARISON_COPY; careers: readonly CareerExample[]; catalog?: readonly CareerExample[]; onRemove: (id: string) => void }

export default function CareerComparison({ locale, careers, catalog = careers, onRemove }: Props) {
  const copy = CAREER_COMPARISON_COPY[locale]
  const titleId = useId()
  return (
    <section aria-labelledby={titleId} className="min-w-0 space-y-4 border-y border-border py-5">
      <div className="space-y-2">
        <h4 id={titleId} className="text-base font-semibold">{copy.title}</h4>
        <p className="text-sm leading-relaxed text-muted-foreground">{copy.intro}</p>
        <p className="text-sm font-medium" role="status" aria-atomic="true">{copy.count(careers.length)} · {careers.length === 0 ? copy.empty : careers.length === 1 ? copy.one : copy.full}</p>
      </div>
      {careers.length > 0 && <div className="grid min-w-0 gap-5 sm:grid-cols-2">
        {careers.map(career => <article key={career.id} className="min-w-0 space-y-3 break-words">
          <h5 className="text-base font-semibold">{career.title}</h5>
          <dl className="space-y-3 text-sm">
            <div><dt className="font-medium">{copy.description}</dt><dd className="mt-1 leading-relaxed text-muted-foreground">{career.description || copy.missing}</dd></div>
            <div><dt className="font-medium">{copy.code}</dt><dd className="mt-1 text-muted-foreground">{career.code.split('').join(' · ') || copy.missing}</dd></div>
          </dl>
          <Button type="button" variant="outline" aria-label={copy.removeLabel(career.title)} onClick={() => onRemove(career.id)}>{copy.remove}</Button>
        </article>)}
      </div>}
      {careers.length === 2 && <details className="text-sm">
        <summary className="min-h-11 cursor-pointer py-3 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">{copy.question}</summary>
        <p className="pb-2 leading-relaxed text-muted-foreground">{copy.prompt}</p>
      </details>}
      <CareerSkillBridge locale={locale} careers={careers} />
      {careers.length === 2 && <CareerExplorationActivity key={JSON.stringify(careers.map(career => career.id).sort())} locale={locale} careerIds={careers.map(career => career.id)} catalog={catalog} />}
    </section>
  )
}
