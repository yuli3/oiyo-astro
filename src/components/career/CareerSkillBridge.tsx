import type { CareerExample } from '@/lib/career-exploration'
import { getCareerSkillBridge } from '@/lib/career-skill-links'
import type { BridgeLocale } from '@/lib/career-skill-sample'

const COPY = {
  ko: { title: '직무 원자료에서 공통점과 차이를 살펴봐요', intro: '소프트웨어 개발자·데이터 분석가·데이터 과학자 3개 직업의 선별 표본이에요. 미국 O*NET·유럽 ESCO 직무와 부분적으로 연결했어요. 국내 직업과 완전히 같은 분류라는 뜻은 아니에요.', shared: '같은 원자료 ID로 연결된 역량', none: '이 선별 표본에는 공통 ID가 없어요. 두 직업의 공통점이 없다는 뜻은 아니에요.', different: '직업별 원자료를 비교해요', importance: '미국 O*NET 중요도 IM · 1–5', essential: '유럽 ESCO 필수 관계 · 순위 아님', missing: 'O*NET 30.3의 이 파일에 해당 직업의 IM 행이 없어요. 중요도 0이나 역량 부재를 뜻하지 않아요.', sample: '목록은 전체 역량이 아닌 선별 표본이에요. 직무 중요도는 개인의 능력·적합성·취업 가능성을 평가하지 않아요. 두 체계의 값을 합산하지 않아요.', action: '아래의 작은 활동에서 이 역량과 관련된 업무를 찾아보고, 직접 확인한 경험을 따로 적어 보세요.', source: '공식 직무 분류 보기', date: '자료 시점', license: '출처와 가공 고지' },
  en: { title: 'Explore shared skills and differences in job-source data', intro: 'A selected sample for software developers, data analysts and data scientists. The mappings to US O*NET and European ESCO occupations are partial, not official equivalences to local careers.', shared: 'Skills linked by identical source IDs', none: 'No shared IDs in this selected sample. This does not mean the careers have nothing in common.', different: 'Compare the source data for each career', importance: 'US O*NET importance IM · 1–5', essential: 'European ESCO essential relation · not a ranking', missing: 'This O*NET 30.3 file has no IM rows for this occupation. Missing data does not mean zero importance or no skills.', sample: 'These are selected examples, not complete skill lists. Job importance does not assess your ability, fit or employability. Values from the two systems are not added together.', action: 'Use the small activities below to find related tasks and record what you actually tried separately.', source: 'Open the official occupation reference', date: 'Data period', license: 'Sources and modifications' },
  ja: { title: '職務資料で共通点と違いを見てみましょう', intro: 'ソフトウェア開発者・データアナリスト・データサイエンティストの選定サンプルです。米国O*NET・欧州ESCOとの対応は部分的で、国内職業との公式な同一分類ではありません。', shared: '同じ資料IDで結ばれたスキル', none: 'このサンプルに共通IDはありません。職業に共通点がないという意味ではありません。', different: '職業別の資料を比べましょう', importance: '米国O*NET重要度 IM · 1–5', essential: '欧州ESCO必須関係 · 順位ではありません', missing: 'O*NET 30.3のこのファイルには、この職業のIM行がありません。重要度ゼロやスキルの欠如を意味しません。', sample: '全スキルではなく選定例です。職務の重要度は個人の能力・適性・就職可能性の評価ではありません。二つの体系の値は合算しません。', action: '下の小さな活動で関連する仕事を調べ、実際に試した経験を別に記録しましょう。', source: '公式の職業資料を見る', date: '資料の時点', license: '出典と加工の表示' },
  zh: { title: '从职业原始资料中了解共同点与差异', intro: '这是软件开发者、数据分析师和数据科学家三个职业的精选样本。与美国O*NET、欧洲ESCO的对应关系是部分映射，并不代表与本地职业的官方等同关系。', shared: '通过相同原始资料ID关联的技能', none: '此精选样本没有共同ID，并不表示两个职业没有共同点。', different: '比较各职业的原始资料', importance: '美国O*NET重要度 IM · 1–5', essential: '欧洲ESCO必需关系 · 并非排名', missing: '此O*NET 30.3文件没有该职业的IM记录。缺失数据不表示重要度为零或没有相关技能。', sample: '这些是精选示例，并非完整技能清单。职业重要度不评价个人能力、适合度或就业机会。两个体系的数值不会相加。', action: '通过下方的小活动寻找相关工作任务，并单独记录您实际尝试的经验。', source: '查看官方职业资料', date: '资料时期', license: '来源与修改说明' },
  fr: { title: 'Explorez les points communs et les différences dans les données métiers', intro: 'Échantillon choisi pour les développeurs logiciels, analystes et scientifiques des données. Les correspondances avec O*NET aux États-Unis et ESCO en Europe sont partielles, sans équivalence officielle avec les métiers locaux.', shared: 'Compétences reliées par les mêmes identifiants sources', none: 'Aucun identifiant commun dans cet échantillon. Cela ne signifie pas que les métiers n’ont rien en commun.', different: 'Comparez les sources pour chaque métier', importance: 'Importance O*NET aux États-Unis IM · 1–5', essential: 'Relation essentielle ESCO en Europe · sans classement', missing: 'Ce fichier O*NET 30.3 ne contient aucune ligne IM pour ce métier. Une donnée absente ne signifie ni importance nulle ni absence de compétences.', sample: 'Ce sont des exemples sélectionnés, pas des listes exhaustives. L’importance dans un métier ne mesure ni vos aptitudes, ni votre adéquation, ni votre employabilité. Les deux systèmes ne sont pas additionnés.', action: 'Avec les petites activités ci-dessous, recherchez des tâches liées et notez séparément ce que vous avez réellement essayé.', source: 'Consulter la référence métier officielle', date: 'Période des données', license: 'Sources et modifications' },
  es: { title: 'Explore coincidencias y diferencias en los datos de las profesiones', intro: 'Muestra seleccionada de desarrollo de software, análisis y ciencia de datos. Las correspondencias con O*NET de EE. UU. y ESCO de Europa son parciales, no equivalencias oficiales con profesiones locales.', shared: 'Competencias vinculadas por los mismos identificadores de origen', none: 'No hay identificadores comunes en esta muestra. Esto no significa que las profesiones no tengan nada en común.', different: 'Compare las fuentes de cada profesión', importance: 'Importancia O*NET de EE. UU. IM · 1–5', essential: 'Relación esencial ESCO de Europa · no es una clasificación', missing: 'Este archivo O*NET 30.3 no contiene filas IM de esta profesión. La ausencia de datos no significa importancia cero ni falta de competencias.', sample: 'Son ejemplos seleccionados, no listas completas. La importancia profesional no evalúa su capacidad, afinidad o empleabilidad. No se suman valores de los dos sistemas.', action: 'Use las pequeñas actividades de abajo para encontrar tareas relacionadas y anote por separado lo que haya probado.', source: 'Ver la referencia profesional oficial', date: 'Periodo de los datos', license: 'Fuentes y modificaciones' },
}

type Props = { careers: readonly CareerExample[]; locale: BridgeLocale }

export default function CareerSkillBridge({ careers, locale }: Props) {
  const bridge = getCareerSkillBridge(careers.map(career => career.id))
  if (!bridge) return null
  const copy = COPY[locale]
  return <details className="min-w-0 rounded-xl border border-border px-3 text-sm">
    <summary className="min-h-11 cursor-pointer py-3 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">{copy.title}</summary>
    <div className="space-y-4 pb-3">
      <p className="leading-relaxed text-muted-foreground">{copy.intro}</p>
      <section className="space-y-2">
        <h5 className="font-semibold">{copy.shared}</h5>
        {bridge.shared.length ? <ul className="list-disc space-y-1 pl-5">{bridge.shared.map(skill => <li key={skill.id}>{skill.label[locale]} <span className="text-muted-foreground">({skill.kind === 'onet' ? 'O*NET®' : 'ESCO'})</span></li>)}</ul> : <p className="text-muted-foreground">{copy.none}</p>}
      </section>
      <h5 className="font-semibold">{copy.different}</h5>
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        {bridge.profiles.map(profile => <article key={profile.careerId} className="min-w-0 space-y-2 rounded-lg border border-border p-3">
          <h6 className="break-words font-semibold">{careers.find(career => career.id === profile.careerId)?.title}</h6>
          <p className="text-muted-foreground">{copy.importance}</p>
          {!profile.skills.some(skill => skill.kind === 'onet') && <p className="leading-relaxed text-muted-foreground">{copy.missing}</p>}
          <dl className="space-y-2">{profile.skills.filter(skill => skill.kind === 'onet').map(skill => <div key={skill.id} className="flex items-start justify-between gap-2">
            <dt className="min-w-0 break-words">{skill.label[locale]}<small className="block text-muted-foreground">{copy.date}: {skill.date}</small></dt>
            <dd className="shrink-0 font-medium">{skill.importance?.toFixed(2)} / 5</dd>
          </div>)}</dl>
          {profile.skills.some(skill => skill.kind === 'esco') && <><p className="text-muted-foreground">{copy.essential}</p><ul className="list-disc space-y-1 pl-5">{profile.skills.filter(skill => skill.kind === 'esco').map(skill => <li key={skill.id}>{skill.label[locale]}</li>)}</ul></>}
          <p><a className="underline underline-offset-4" href={`https://www.onetonline.org/link/summary/${profile.onetSoc}`}>{copy.source} · O*NET®</a></p>
          <p><a className="underline underline-offset-4" href={profile.escoOccupation.replace('http:', 'https:')}>{copy.source} · ESCO</a></p>
        </article>)}
      </div>
      <p className="leading-relaxed text-muted-foreground">{copy.sample}</p>
      <p className="leading-relaxed">{copy.action}</p>
      <details className="text-xs text-muted-foreground">
        <summary className="min-h-11 cursor-pointer py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">{copy.license}</summary>
        <p>O*NET® 30.3, USDOL/ETA · <a className="underline" href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. OIYO selected, mapped and translated this sample; no agency endorsement. <a className="underline" href="https://www.onetcenter.org/db_releases.html">O*NET® source archive</a>.</p>
        <p>This service uses the ESCO classification of the European Commission (1.2.1). OIYO selected and translated the sample. <a className="underline" href="https://commission.europa.eu/legal-notice_en">Reuse notice</a>.</p>
      </details>
    </div>
  </details>
}
