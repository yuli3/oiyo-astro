import { useId, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { CareerExample } from '@/lib/career-exploration'
import CareerNoteStorage from './CareerNoteStorage'

const COPY = {
  ko: {
    title: '작게 해 보고 판단해요', intro: '두 직업 중 궁금한 쪽부터 시작해 보세요. 활동은 예시라 다른 방법으로 탐색하거나 건너뛰어도 괜찮아요. 소요 시간은 대략적인 분량이에요.',
    temporary: '저장하지 않은 메모는 새로고침·페이지 이동·비교 직업 변경 시 사라져요. 아래에서 명시적으로 저장한 기록은 따로 불러올 수 있어요. 검사 점수나 공유 결과에는 반영하지 않아요.',
    activities: [
      { title: '공고에서 업무 찾기 · 약 15분', body: '실제 채용 공고 하나를 읽고 반복되는 업무 세 가지를 찾아보세요. 공고 하나가 직업 전체를 대표하지는 않아요. 자격·근무환경은 따로 확인해 주세요.' },
      { title: '개인용 초안 만들기 · 약 20분', body: '관심 업무와 관련된 작은 글·도표·계획을 개인 연습용으로 만들어 보세요. 실제 고객 업무나 자격이 필요한 실무는 하지 않아요. 완성도보다 어느 부분에 흥미가 생기는지 살펴봐요.' },
      { title: '물어볼 질문 만들기 · 약 10분', body: '현직자에게 물어보고 싶은 질문 세 가지를 적어보세요. 평소 업무, 어려운 점, 시작할 때 필요한 준비를 물을 수 있어요. 여기서 연락처를 입력하거나 메시지를 보내지는 않아요.' },
    ], labels: ['무엇을 해 봤나요? (선택)', '어떤 부분이 흥미로웠나요? (선택)', '다시 확인할 점은 무엇인가요? (선택)'], done: '이 활동을 해 봤어요', planned: '탐색 중이에요. 완료 표시는 직접 선택해 주세요.', completed: '해 본 활동으로 표시했어요. 이것만으로 직업 적합성을 판단하지 않아요.', clear: '이 활동 메모 지우기', skip: '지금은 건너뛰기', limit: '각 항목 최대 1,000자 · 자동 저장 없음',
  },
  en: {
    title: 'Try something small before deciding', intro: 'Start with whichever of the two careers interests you. These are optional examples: explore another way or skip them. Times are approximate activity lengths.',
    temporary: 'Unsaved notes disappear when you reload, leave the page or change the compared careers. Records you explicitly save below can be restored separately. Notes do not affect test scores or shared results.',
    activities: [
      { title: 'Find tasks in a listing · about 15 min', body: 'Read one actual job listing and identify three recurring tasks. One listing does not represent an entire profession. Check qualifications and working conditions separately.' },
      { title: 'Make a private draft · about 20 min', body: 'Create a short text, diagram or plan related to a task that interests you, for personal practice only. Do not take on real client work or work requiring qualifications. Notice what engages you rather than judging the finished product.' },
      { title: 'Prepare questions · about 10 min', body: 'Write three questions you would ask someone in the profession, perhaps about daily tasks, difficulties and preparation. Do not enter contact details here; this tool does not send messages.' },
    ], labels: ['What did you try? (optional)', 'What interested you? (optional)', 'What would you check next? (optional)'], done: 'I tried this activity', planned: 'Exploring. Mark the activity when you have tried it.', completed: 'Marked as tried. This alone does not establish career fit.', clear: 'Clear notes for this activity', skip: 'Skip for now', limit: 'Up to 1,000 characters per field · no automatic saving',
  },
  ja: {
    title: '小さく試してから考えましょう', intro: '二つの職業のうち、気になる方から始めてください。任意の活動例なので、別の方法を選んだり、見送ったりしても構いません。時間はおおよその目安です。',
    temporary: '未保存のメモは、再読み込み・ページ移動・比較する職業の変更で消えます。下で明示的に保存した記録は別途読み込めます。検査の得点や共有結果には反映されません。',
    activities: [
      { title: '求人から業務を探す · 約15分', body: '実際の求人を一つ読み、繰り返し出てくる業務を三つ探してください。一つの求人が職業全体を代表するわけではありません。資格や勤務環境は別途確認してください。' },
      { title: '個人練習の草案を作る · 約20分', body: '気になる業務に関する短い文章・図・計画を、個人練習として作ってみてください。実際の顧客業務や資格が必要な実務は行いません。完成度より、どの部分に興味が湧くかを見てみましょう。' },
      { title: '聞きたい質問を考える · 約10分', body: 'その職業の方に聞きたい質問を三つ書いてください。日々の業務、難しい点、始めるための準備などが候補です。ここに連絡先を入力する必要はなく、メッセージの送信も行いません。' },
    ], labels: ['何を試しましたか？（任意）', 'どの部分に興味を持ちましたか？（任意）', '次に何を確認したいですか？（任意）'], done: 'この活動を試しました', planned: '探索中です。試したら、ご自身でチェックしてください。', completed: '試した活動として記録しました。これだけで職業適性を判断するものではありません。', clear: 'この活動のメモを消す', skip: '今は見送る', limit: '各欄1,000文字まで · 自動保存なし',
  },
  zh: {
    title: '先做一次小尝试，再作判断', intro: '请从两种职业中更好奇的一种开始。这些活动仅供选择，您也可以换一种探索方式或跳过。时间只是大致参考。',
    temporary: '未保存的笔记会在刷新、离开页面或更换比较职业时清除。您在下方主动保存的记录可另行恢复。笔记不会影响测试得分或分享结果。',
    activities: [
      { title: '从招聘信息找任务 · 约15分钟', body: '阅读一则真实招聘信息，找出三项反复出现的工作任务。一则信息不能代表整个职业，资格与工作环境仍需另行核实。' },
      { title: '做一份个人练习草稿 · 约20分钟', body: '围绕感兴趣的任务，写一段文字、画一张图或拟一份计划，仅供个人练习。不要承担真实客户业务或需要专业资格的工作。先观察哪些部分让您感兴趣，而不是评判成品质量。' },
      { title: '准备想问的问题 · 约10分钟', body: '写下三个想向从业者了解的问题，例如日常任务、困难和入行准备。请勿在此输入联系方式；本工具不会发送消息。' },
    ], labels: ['您尝试了什么？（选填）', '哪些部分让您感兴趣？（选填）', '接下来想核实什么？（选填）'], done: '我尝试过这项活动', planned: '正在探索。尝试后，请自行勾选。', completed: '已标记为尝试过。不能仅凭这次活动判断职业适合程度。', clear: '清除这项活动的笔记', skip: '暂时跳过', limit: '每项最多1,000字 · 不会自动保存',
  },
  fr: {
    title: 'Faites un petit essai avant de décider', intro: 'Commencez par celui des deux métiers qui vous intrigue. Ces activités sont facultatives : vous pouvez explorer autrement ou les passer. Les durées sont indicatives.',
    temporary: 'Les notes non enregistrées disparaissent si vous rechargez, quittez la page ou changez les métiers comparés. Les enregistrements effectués explicitement ci-dessous peuvent être restaurés séparément. Les notes ne modifient ni les scores ni les résultats partagés.',
    activities: [
      { title: 'Repérer les tâches d’une offre · environ 15 min', body: 'Lisez une offre réelle et repérez trois tâches récurrentes. Une seule offre ne représente pas toute une profession. Vérifiez séparément les qualifications et les conditions de travail.' },
      { title: 'Créer un brouillon personnel · environ 20 min', body: 'Rédigez un court texte, un schéma ou un plan lié à une tâche qui vous intéresse, pour vous entraîner uniquement. N’effectuez pas de travail pour un vrai client ni de tâche exigeant une qualification. Observez ce qui vous intéresse plutôt que la qualité du résultat.' },
      { title: 'Préparer des questions · environ 10 min', body: 'Notez trois questions à poser à une personne du métier, sur son quotidien, les difficultés ou la préparation nécessaire. Ne saisissez pas de coordonnées ici ; cet outil n’envoie aucun message.' },
    ], labels: ['Qu’avez-vous essayé ? (facultatif)', 'Qu’est-ce qui vous a intéressé ? (facultatif)', 'Que voulez-vous vérifier ensuite ? (facultatif)'], done: 'J’ai essayé cette activité', planned: 'Exploration en cours. Cochez lorsque vous avez essayé.', completed: 'Activité marquée comme essayée. Cela ne suffit pas à établir une adéquation professionnelle.', clear: 'Effacer les notes de cette activité', skip: 'Passer pour le moment', limit: '1 000 caractères maximum par champ · aucun enregistrement automatique',
  },
  es: {
    title: 'Haga una pequeña prueba antes de decidir', intro: 'Empiece por la profesión que más curiosidad le despierte. Estas actividades son opcionales: puede explorar de otra forma u omitirlas. Los tiempos son orientativos.',
    temporary: 'Las notas no guardadas se borran al recargar, salir de la página o cambiar las profesiones comparadas. Los registros que guarde expresamente abajo pueden restaurarse por separado. Las notas no modifican las puntuaciones ni los resultados compartidos.',
    activities: [
      { title: 'Identificar tareas en una oferta · unos 15 min', body: 'Lea una oferta real e identifique tres tareas recurrentes. Una sola oferta no representa toda una profesión. Compruebe por separado los requisitos y las condiciones laborales.' },
      { title: 'Crear un borrador personal · unos 20 min', body: 'Prepare un texto breve, un diagrama o un plan relacionado con una tarea que le interese, solo como práctica personal. No realice trabajo para clientes reales ni tareas que requieran habilitación profesional. Observe qué le interesa, sin juzgar la calidad del resultado.' },
      { title: 'Preparar preguntas · unos 10 min', body: 'Escriba tres preguntas para una persona de esa profesión, sobre su trabajo diario, las dificultades o la preparación necesaria. No introduzca datos de contacto aquí; esta herramienta no envía mensajes.' },
    ], labels: ['¿Qué ha probado? (opcional)', '¿Qué le ha interesado? (opcional)', '¿Qué quiere comprobar después? (opcional)'], done: 'He probado esta actividad', planned: 'Exploración en curso. Marque la casilla cuando lo haya probado.', completed: 'Actividad marcada como probada. Esto no basta para determinar la adecuación profesional.', clear: 'Borrar las notas de esta actividad', skip: 'Omitir por ahora', limit: 'Hasta 1.000 caracteres por campo · sin guardado automático',
  },
}

type Note = { fields: string[]; done: boolean }
const emptyNote = (): Note => ({ fields: ['', '', ''], done: false })

export default function CareerExplorationActivity({ locale, careerIds, catalog }: { locale: keyof typeof COPY; careerIds: string[]; catalog: readonly CareerExample[] }) {
  const copy = COPY[locale]
  const id = useId()
  const activityButtons = useRef<(HTMLButtonElement | null)[]>([])
  const [active, setActive] = useState<number | null>(null)
  const [notes, setNotes] = useState<Note[]>(() => copy.activities.map(emptyNote))
  const note = active === null ? null : notes[active]
  function updateNote(update: (note: Note) => Note) {
    if (active === null) return
    setNotes(previous => previous.map((entry, index) => index === active ? update(entry) : entry))
  }
  // 2026-10-12 approved batch 3: drafts stay transient; only the explicit save control persists reflection.
  return <section aria-labelledby={`${id}-title`} className="space-y-4 border-t border-border pt-5 print:hidden" data-html2canvas-ignore="true">
    <h5 id={`${id}-title`} className="text-base font-semibold">{copy.title}</h5>
    <p className="text-sm leading-relaxed text-muted-foreground">{copy.intro}</p>
    <p id={`${id}-temporary`} className="text-sm leading-relaxed">{copy.temporary}</p>
    <div className="flex flex-col items-start gap-2">
      {copy.activities.map((activity, index) => <Button key={index} ref={node => { activityButtons.current[index] = node }} type="button" variant={active === index ? 'secondary' : 'outline'} className="h-auto min-h-11 max-w-full whitespace-normal text-left" aria-pressed={active === index} aria-controls={`${id}-activity`} onClick={() => setActive(index)}>{activity.title}</Button>)}
    </div>
    <div id={`${id}-activity`} className="space-y-4">{active !== null && note && <>
      <p className="text-sm leading-relaxed">{copy.activities[active].body}</p>
      <p className="text-xs text-muted-foreground">{copy.limit}</p>
      {copy.labels.map((label, index) => <div key={index} className="space-y-2">
        <label htmlFor={`${id}-note-${index}`} className="block text-sm font-medium">{label}</label>
        <textarea id={`${id}-note-${index}`} rows={3} maxLength={1000} aria-describedby={`${id}-temporary`} className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring" value={note.fields[index]} onChange={event => updateNote(previous => ({ ...previous, fields: previous.fields.map((field, fieldIndex) => fieldIndex === index ? event.target.value : field) }))} />
      </div>)}
      <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" className="size-5 accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring" checked={note.done} onChange={event => updateNote(previous => ({ ...previous, done: event.target.checked }))} />{copy.done}</label>
      <p role="status" className="text-sm text-muted-foreground">{note.done ? copy.completed : copy.planned}</p>
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap">
        <Button type="button" variant="outline" className="h-auto min-h-11 max-w-full whitespace-normal" onClick={() => updateNote(emptyNote)}>{copy.clear}</Button>
        <Button type="button" variant="ghost" className="h-auto min-h-11 max-w-full whitespace-normal" onClick={() => {
          // 2026-10-12: the skipped panel unmounts, so return keyboard focus before hiding its trigger.
          activityButtons.current[active]?.focus()
          setActive(null)
        }}>{copy.skip}</Button>
      </div>
    </>}</div>
    <CareerNoteStorage locale={locale} catalog={catalog} draft={{ careerIds, activities: notes.map((entry, activityId) => ({ activityId, fields: entry.fields, done: entry.done })) }} onRestore={record => {
      setNotes(record.activities.map(entry => ({ fields: [...entry.fields], done: entry.done })))
      setActive(0)
    }} />
  </section>
}
