import { useEffect, useState } from 'react';
import ShareResultButton from '../shared/ShareResultButton';
import { recordTestResult } from '@/lib/user/test-results';

type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es';

// Holmes & Rahe (1967) Social Readjustment Rating Scale — 43 life events.
// Source: Holmes TH, Rahe RH. "The Social Readjustment Rating Scale."
// J Psychosom Res. 1967;11(2):213-218. Values are the original LCU weights.
const VALUES = [100, 73, 65, 63, 63, 53, 50, 47, 45, 45, 44, 40, 39, 39, 39, 38, 37, 36, 35, 31, 30, 29, 29, 29, 28, 26, 26, 25, 24, 23, 20, 20, 20, 19, 19, 18, 17, 16, 15, 15, 13, 12, 11];

const ITEMS: Record<Locale, string[]> = {
  ko: ['배우자의 죽음', '이혼', '부부 별거', '구속·수감', '가까운 가족의 죽음', '자신의 부상이나 질병', '결혼', '해고', '부부 관계 회복(재결합)', '은퇴', '가족의 건강 변화', '임신', '성생활의 어려움', '새 가족 구성원 생김', '사업 재조정', '재정 상태의 큰 변화', '친한 친구의 죽음', '직종 변경(이직)', '배우자와의 다툼 횟수 변화', '큰 금액의 대출(주택담보 등)', '대출·담보물 압류', '직장에서의 책임 변화', '자녀의 독립(출가)', '시댁·처가와의 갈등', '두드러진 개인적 성취', '배우자의 취업 또는 퇴직', '입학 또는 졸업', '생활 환경의 변화', '개인 습관의 교정', '상사와의 갈등', '근무 시간·조건의 변화', '이사', '전학·학교 변경', '여가 활동의 변화', '종교 활동의 변화', '사회 활동의 변화', '소액 대출', '수면 습관의 변화', '가족 모임 횟수의 변화', '식습관의 변화', '휴가', '명절·연말연시', '경미한 법규 위반'],
  en: ['Death of spouse', 'Divorce', 'Marital separation', 'Jail term', 'Death of close family member', 'Personal injury or illness', 'Marriage', 'Fired at work', 'Marital reconciliation', 'Retirement', 'Change in health of family member', 'Pregnancy', 'Sexual difficulties', 'Gain of new family member', 'Business readjustment', 'Major change in financial state', 'Death of close friend', 'Change to a different line of work', 'Change in number of arguments with spouse', 'Large mortgage or loan', 'Foreclosure of mortgage or loan', 'Change in responsibilities at work', 'Son or daughter leaving home', 'Trouble with in-laws', 'Outstanding personal achievement', 'Spouse begins or stops work', 'Beginning or ending school', 'Change in living conditions', 'Revision of personal habits', 'Trouble with boss', 'Change in work hours or conditions', 'Change in residence', 'Change in schools', 'Change in recreation', 'Change in church activities', 'Change in social activities', 'Small mortgage or loan', 'Change in sleeping habits', 'Change in number of family get-togethers', 'Change in eating habits', 'Vacation', 'Major holiday season', 'Minor violation of the law'],
  ja: ['配偶者の死', '離婚', '夫婦の別居', '拘留・服役', '近親者の死', '自分のけがや病気', '結婚', '解雇', '夫婦関係の修復', '退職・引退', '家族の健康の変化', '妊娠', '性生活の困難', '新しい家族が増える', '事業の再調整', '経済状態の大きな変化', '親しい友人の死', '転職・職種の変更', '配偶者との口論回数の変化', '高額のローン・住宅ローン', 'ローンや担保の差し押さえ', '仕事上の責任の変化', '子どもの独立', '義理の家族とのトラブル', '顕著な個人的成功', '配偶者の就職または退職', '入学または卒業', '生活環境の変化', '個人的習慣の見直し', '上司とのトラブル', '勤務時間・条件の変化', '引っ越し', '転校', '余暇活動の変化', '宗教活動の変化', '社会活動の変化', '少額のローン', '睡眠習慣の変化', '家族団らんの回数の変化', '食習慣の変化', '休暇', '年末年始・祝祭シーズン', '軽微な法律違反'],
  zh: ['配偶去世', '离婚', '夫妻分居', '拘留·服刑', '近亲去世', '自己受伤或生病', '结婚', '被解雇', '夫妻和好', '退休', '家人健康变化', '怀孕', '性生活困难', '新家庭成员加入', '事业调整', '经济状况重大变化', '好友去世', '更换工作领域', '与配偶争吵次数变化', '大额贷款·房贷', '贷款或抵押被没收', '工作职责变化', '子女离家独立', '与姻亲的矛盾', '突出的个人成就', '配偶开始或停止工作', '入学或毕业', '生活环境变化', '个人习惯调整', '与上司的矛盾', '工作时间·条件变化', '搬家', '转学', '休闲活动变化', '宗教活动变化', '社交活动变化', '小额贷款', '睡眠习惯变化', '家庭聚会次数变化', '饮食习惯变化', '休假', '重大节日', '轻微违法'],
  fr: ['Décès du conjoint', 'Divorce', 'Séparation conjugale', 'Incarcération', "Décès d'un proche parent", 'Blessure ou maladie personnelle', 'Mariage', 'Licenciement', 'Réconciliation conjugale', 'Retraite', "Changement de santé d'un membre de la famille", 'Grossesse', 'Difficultés sexuelles', "Arrivée d'un nouveau membre dans la famille", 'Réajustement professionnel', 'Changement financier important', "Décès d'un ami proche", 'Changement de métier', 'Changement du nombre de disputes conjugales', 'Gros emprunt ou hypothèque', "Saisie d'un prêt ou d'une hypothèque", 'Changement de responsabilités au travail', 'Départ d’un enfant du foyer', 'Problèmes avec la belle-famille', 'Réussite personnelle remarquable', 'Le conjoint commence ou arrête de travailler', 'Début ou fin de scolarité', 'Changement de conditions de vie', 'Révision des habitudes personnelles', 'Problèmes avec le supérieur', "Changement d'horaires ou de conditions de travail", 'Déménagement', "Changement d'école", 'Changement de loisirs', "Changement d'activités religieuses", "Changement d'activités sociales", 'Petit emprunt', 'Changement des habitudes de sommeil', 'Changement du nombre de réunions familiales', 'Changement des habitudes alimentaires', 'Vacances', 'Fêtes de fin d’année', 'Infraction mineure à la loi'],
  es: ['Muerte del cónyuge', 'Divorcio', 'Separación conyugal', 'Encarcelamiento', 'Muerte de un familiar cercano', 'Lesión o enfermedad personal', 'Matrimonio', 'Despido laboral', 'Reconciliación conyugal', 'Jubilación', 'Cambio en la salud de un familiar', 'Embarazo', 'Dificultades sexuales', 'Nuevo miembro en la familia', 'Reajuste del negocio', 'Cambio financiero importante', 'Muerte de un amigo cercano', 'Cambio de tipo de trabajo', 'Cambio en la cantidad de discusiones de pareja', 'Hipoteca o préstamo grande', 'Ejecución de hipoteca o préstamo', 'Cambio de responsabilidades laborales', 'Hijo/a que se va de casa', 'Problemas con la familia política', 'Logro personal destacado', 'El cónyuge empieza o deja de trabajar', 'Inicio o fin de estudios', 'Cambio en las condiciones de vida', 'Revisión de hábitos personales', 'Problemas con el jefe', 'Cambio de horario o condiciones laborales', 'Mudanza', 'Cambio de escuela', 'Cambio de actividades de ocio', 'Cambio de actividades religiosas', 'Cambio de actividades sociales', 'Préstamo pequeño', 'Cambio en hábitos de sueño', 'Cambio en la frecuencia de reuniones familiares', 'Cambio en hábitos alimentarios', 'Vacaciones', 'Fiestas importantes', 'Infracción legal menor'],
};

const L: Record<Locale, {
  title: string; subtitle: string; instruction: string; selected: string; seeResult: string; restart: string;
  yourScore: string; unit: string; band: Record<'low' | 'mid' | 'high', string>;
  bandDesc: Record<'low' | 'mid' | 'high', string>; note: string; source: string; heading: string;
}> = {
  ko: { title: '홈즈-라헤 생활사건 스트레스 테스트', subtitle: '최근 1년간 겪은 생활사건으로 스트레스 부하를 추정합니다', instruction: '최근 12개월 안에 겪은 사건을 모두 선택하세요.', selected: '개 선택', seeResult: '결과 보기', restart: '다시 하기', yourScore: '생활변화 단위(LCU) 합계', unit: '점', band: { low: '낮은 스트레스 부하', mid: '중간 스트레스 부하', high: '높은 스트레스 부하' }, bandDesc: { low: '150점 미만 — 생활사건으로 인한 스트레스 부하가 낮은 편입니다. 현재의 리듬을 유지하세요.', mid: '150~299점 — 누적된 생활 변화가 적지 않습니다. 원 연구에서는 이 구간에서 건강 문제 위험이 커진다고 보고했습니다. 의식적인 회복 시간이 필요합니다.', high: '300점 이상 — 생활 변화 부하가 큰 상태입니다. 수면·식사·휴식을 우선순위에 두고, 힘들면 주변이나 전문가에게 도움을 청하세요.' }, note: '이 척도는 1967년 연구 기반의 참고 도구이며 의학적 진단이 아닙니다.', source: '출처: Holmes & Rahe, J Psychosom Res (1967)', heading: '나의 스트레스 부하' },
  en: { title: 'Holmes–Rahe Life Stress Test', subtitle: 'Estimate your stress load from life events in the past year', instruction: 'Select every event you experienced in the last 12 months.', selected: 'selected', seeResult: 'See result', restart: 'Restart', yourScore: 'Total Life Change Units (LCU)', unit: 'pts', band: { low: 'Low stress load', mid: 'Moderate stress load', high: 'High stress load' }, bandDesc: { low: 'Under 150 — your life-event stress load is on the low side. Keep your current rhythm.', mid: '150–299 — a meaningful amount of accumulated change. The original study linked this range to elevated health risk. Build in deliberate recovery time.', high: '300+ — a heavy load of life change. Prioritize sleep, meals and rest, and reach out for support if it feels like too much.' }, note: 'This scale is a reference tool based on 1967 research, not a medical diagnosis.', source: 'Source: Holmes & Rahe, J Psychosom Res (1967)', heading: 'Your stress load' },
  ja: { title: 'ホームズ・レイ ライフイベント ストレステスト', subtitle: '過去1年の出来事からストレス負荷を推定します', instruction: '過去12か月に経験した出来事をすべて選んでください。', selected: '件選択', seeResult: '結果を見る', restart: 'もう一度', yourScore: '生活変化単位(LCU)合計', unit: '点', band: { low: '低いストレス負荷', mid: '中程度のストレス負荷', high: '高いストレス負荷' }, bandDesc: { low: '150点未満 — ライフイベントによる負荷は低めです。今のリズムを保ちましょう。', mid: '150〜299点 — 積み重なった変化が少なくありません。元の研究ではこの範囲で健康リスクが高まると報告されています。意識的な回復時間を。', high: '300点以上 — 生活変化の負荷が大きい状態です。睡眠・食事・休息を優先し、つらいときは周囲や専門家を頼ってください。' }, note: 'この尺度は1967年の研究に基づく参考ツールであり、医学的診断ではありません。', source: '出典: Holmes & Rahe, J Psychosom Res (1967)', heading: 'あなたのストレス負荷' },
  zh: { title: '霍尔姆斯-拉赫生活事件压力测试', subtitle: '根据过去一年的生活事件估算压力负荷', instruction: '请选择过去12个月内经历过的所有事件。', selected: '项已选', seeResult: '查看结果', restart: '重新测试', yourScore: '生活变化单位(LCU)总分', unit: '分', band: { low: '压力负荷较低', mid: '压力负荷中等', high: '压力负荷较高' }, bandDesc: { low: '低于150分 — 生活事件带来的压力负荷较低，保持当前节奏即可。', mid: '150~299分 — 累积的生活变化不少。原研究报告此区间健康风险上升，需要有意识地安排恢复时间。', high: '300分以上 — 生活变化负荷较大。请优先保证睡眠、饮食与休息，必要时向身边的人或专业人士求助。' }, note: '本量表是基于1967年研究的参考工具，并非医学诊断。', source: '来源: Holmes & Rahe, J Psychosom Res (1967)', heading: '我的压力负荷' },
  fr: { title: 'Test de stress Holmes-Rahe', subtitle: 'Estimez votre charge de stress à partir des événements de la dernière année', instruction: 'Sélectionnez tous les événements vécus au cours des 12 derniers mois.', selected: 'sélectionné(s)', seeResult: 'Voir le résultat', restart: 'Recommencer', yourScore: 'Total des unités de changement de vie (LCU)', unit: 'pts', band: { low: 'Charge de stress faible', mid: 'Charge de stress modérée', high: 'Charge de stress élevée' }, bandDesc: { low: 'Moins de 150 — votre charge liée aux événements de vie est plutôt faible. Gardez votre rythme.', mid: '150–299 — un cumul de changements non négligeable. L’étude originale associe cette zone à un risque accru pour la santé. Prévoyez des temps de récupération.', high: '300+ — une charge de changement importante. Priorisez sommeil, repas et repos, et demandez du soutien si nécessaire.' }, note: 'Cette échelle est un outil de référence basé sur une recherche de 1967, pas un diagnostic médical.', source: 'Source : Holmes & Rahe, J Psychosom Res (1967)', heading: 'Votre charge de stress' },
  es: { title: 'Test de estrés Holmes-Rahe', subtitle: 'Estima tu carga de estrés según los eventos del último año', instruction: 'Selecciona todos los eventos que viviste en los últimos 12 meses.', selected: 'seleccionados', seeResult: 'Ver resultado', restart: 'Repetir', yourScore: 'Total de unidades de cambio vital (LCU)', unit: 'pts', band: { low: 'Carga de estrés baja', mid: 'Carga de estrés moderada', high: 'Carga de estrés alta' }, bandDesc: { low: 'Menos de 150 — tu carga por eventos vitales es más bien baja. Mantén tu ritmo actual.', mid: '150–299 — una acumulación de cambios considerable. El estudio original asoció este rango con mayor riesgo de salud. Programa tiempo de recuperación.', high: '300+ — una carga de cambio vital alta. Prioriza sueño, comidas y descanso, y pide apoyo si lo necesitas.' }, note: 'Esta escala es una herramienta de referencia basada en una investigación de 1967; no es un diagnóstico médico.', source: 'Fuente: Holmes & Rahe, J Psychosom Res (1967)', heading: 'Tu carga de estrés' },
};

export default function HolmesRaheTest({ locale = 'ko' }: { locale?: Locale }) {
  const t = L[locale] ?? L.en;
  const items = ITEMS[locale] ?? ITEMS.en;
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);

  const score = [...checked].reduce((s, i) => s + VALUES[i], 0);
  const band: 'low' | 'mid' | 'high' = score < 150 ? 'low' : score < 300 ? 'mid' : 'high';
  const bandColor = band === 'low' ? 'text-green-600' : band === 'mid' ? 'text-amber-600' : 'text-red-600';
  const barColor = band === 'low' ? 'bg-green-500' : band === 'mid' ? 'bg-amber-500' : 'bg-red-500';

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  useEffect(() => {
    if (!done) return;
    recordTestResult({
      kind: 'psychometric',
      testId: 'holmes-rahe',
      title: locale === 'ko' ? '홈즈-라헤 생활사건 스트레스' : 'Holmes-Rahe life stress',
      resultLabel: `${score} LCU`,
      inputs: { events: [...checked] },
      result: { score, band },
      locale,
      sourcePath: `/${locale}/stress-events/test`,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  if (done) {
    const pct = Math.min(100, Math.round((score / 450) * 100));
    return (
      <div className="space-y-5">
        <div className="text-center space-y-1">
          <p className="text-sm text-muted-foreground">{t.heading}</p>
          <p className={`text-5xl font-black ${bandColor}`}>{score}<span className="ml-1 text-lg">{t.unit}</span></p>
          <p className={`font-bold ${bandColor}`}>{t.band[band]}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground"><span>0</span><span>150</span><span>300</span><span>450+</span></div>
          <div className="relative h-3 rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed pt-1">{t.bandDesc[band]}</p>
        </div>
        <p className="text-center text-xs text-muted-foreground">{t.note}<br />{t.source}</p>
        <ShareResultButton
          locale={locale}
          heading={t.title}
          emoji={band === 'low' ? '🌿' : band === 'mid' ? '⚖️' : '🔥'}
          resultTitle={`${score} LCU — ${t.band[band]}`}
          description={`${checked.size} ${t.selected}`}
        />
        <button onClick={() => { setChecked(new Set()); setDone(false); }}
          className="w-full rounded-xl border bg-card px-4 py-3 text-sm font-bold hover:bg-accent transition-colors">
          {t.restart}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t.instruction}</p>
      <div className="grid gap-1.5">
        {items.map((label, i) => (
          <button key={i} type="button" onClick={() => toggle(i)}
            aria-pressed={checked.has(i)}
            className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition-colors ${
              checked.has(i) ? 'border-primary bg-primary/10 font-semibold' : 'bg-card hover:bg-accent'
            }`}>
            <span>{label}</span>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{VALUES[i]}</span>
          </button>
        ))}
      </div>
      <div className="sticky bottom-3 flex items-center gap-3 rounded-2xl border bg-card/95 p-3 shadow-lg backdrop-blur">
        <span className="text-xs font-bold text-muted-foreground">{checked.size} {t.selected} · {score} {t.unit}</span>
        <button onClick={() => setDone(true)} disabled={checked.size === 0}
          className="ml-auto rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity">
          {t.seeResult}
        </button>
      </div>
    </div>
  );
}
