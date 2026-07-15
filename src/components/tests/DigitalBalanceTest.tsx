import React, { useState, useMemo } from 'react';
import ShareResultButton from '../shared/ShareResultButton'
import type { Locale } from '../../i18n';

interface Props { locale?: Locale }

interface Question { id: string; text: string; options: string[] }

const QUESTIONS: Record<Locale, Question[]> = {
  ko: [
    { id: "q1", text: "잠들기 직전까지 스마트폰을 확인합니까?", options: ["안 함", "가끔", "자주", "매일", "항상"] },
    { id: "q2", text: "스마트폰이 옆에 없으면 불안함이나 초조함을 느낍니까?", options: ["전혀 아님", "조금", "보통", "심함", "매우 심함"] },
    { id: "q3", text: "알림이 오지 않았는데도 습관적으로 폰을 확인합니까?", options: ["안 함", "가끔", "자주", "매우 자주", "무의식적으로 항상"] },
    { id: "q4", text: "스마트폰 사용 시간 때문에 일상 업무나 공부에 지장이 있습니까?", options: ["없음", "가끔", "자주", "심각함", "매우 심각함"] },
    { id: "q5", text: "대화 중에도 스마트폰을 확인하여 상대방을 불쾌하게 한 적이 있습니까?", options: ["없음", "가끔", "자주", "매우 자주", "습관임"] },
    { id: "q6", text: "스마트폰 사용 시간을 줄이려고 시도했지만 실패한 적이 있습니까?", options: ["없음", "1-2번", "3-5번", "많음", "포기함"] },
  ],
  en: [
    { id: "q1", text: "Do you check your phone right up until you fall asleep?", options: ["Never", "Sometimes", "Often", "Daily", "Always"] },
    { id: "q2", text: "Do you feel anxious or restless when your phone isn't next to you?", options: ["Not at all", "A little", "Moderate", "Strong", "Very strong"] },
    { id: "q3", text: "Do you habitually check your phone even with no notification?", options: ["Never", "Sometimes", "Often", "Very often", "Unconsciously, always"] },
    { id: "q4", text: "Does your screen time interfere with work or study?", options: ["Never", "Sometimes", "Often", "Seriously", "Very seriously"] },
    { id: "q5", text: "Have you upset someone by checking your phone mid-conversation?", options: ["Never", "Sometimes", "Often", "Very often", "It's a habit"] },
    { id: "q6", text: "Have you tried to cut your screen time but failed?", options: ["Never", "1–2 times", "3–5 times", "Many times", "Gave up"] },
  ],
  ja: [
    { id: "q1", text: "寝る直前までスマホを確認しますか？", options: ["しない", "たまに", "よく", "毎日", "いつも"] },
    { id: "q2", text: "スマホが手元にないと不安や落ち着かなさを感じますか？", options: ["全くない", "少し", "普通", "強い", "とても強い"] },
    { id: "q3", text: "通知が来ていなくても習慣的にスマホを見ますか？", options: ["しない", "たまに", "よく", "とてもよく", "無意識にいつも"] },
    { id: "q4", text: "スマホの使用時間のせいで仕事や勉強に支障がありますか？", options: ["ない", "たまに", "よく", "深刻", "とても深刻"] },
    { id: "q5", text: "会話中にスマホを見て相手を不快にさせたことがありますか？", options: ["ない", "たまに", "よく", "とてもよく", "習慣です"] },
    { id: "q6", text: "スマホの使用時間を減らそうとして失敗したことがありますか？", options: ["ない", "1〜2回", "3〜5回", "多い", "諦めた"] },
  ],
  zh: [
    { id: "q1", text: "你会一直看手机直到入睡吗？", options: ["从不", "偶尔", "经常", "每天", "总是"] },
    { id: "q2", text: "手机不在身边时你会感到焦虑或不安吗？", options: ["完全不会", "有点", "一般", "强烈", "非常强烈"] },
    { id: "q3", text: "即使没有通知你也会习惯性看手机吗？", options: ["从不", "偶尔", "经常", "非常频繁", "无意识地总是"] },
    { id: "q4", text: "手机使用时间是否影响你的工作或学习？", options: ["没有", "偶尔", "经常", "严重", "非常严重"] },
    { id: "q5", text: "你是否曾在交谈中看手机而让对方不快？", options: ["没有", "偶尔", "经常", "非常频繁", "已成习惯"] },
    { id: "q6", text: "你是否尝试减少手机使用时间却失败了？", options: ["没有", "1-2次", "3-5次", "很多次", "已放弃"] },
  ],
  fr: [
    { id: "q1", text: "Consultez-vous votre téléphone jusqu'au moment de vous endormir ?", options: ["Jamais", "Parfois", "Souvent", "Chaque jour", "Toujours"] },
    { id: "q2", text: "Vous sentez-vous anxieux quand votre téléphone n'est pas à côté de vous ?", options: ["Pas du tout", "Un peu", "Modéré", "Fort", "Très fort"] },
    { id: "q3", text: "Consultez-vous votre téléphone par habitude même sans notification ?", options: ["Jamais", "Parfois", "Souvent", "Très souvent", "Inconsciemment, toujours"] },
    { id: "q4", text: "Votre temps d'écran nuit-il à votre travail ou vos études ?", options: ["Jamais", "Parfois", "Souvent", "Sérieusement", "Très sérieusement"] },
    { id: "q5", text: "Avez-vous vexé quelqu'un en regardant votre téléphone en pleine conversation ?", options: ["Jamais", "Parfois", "Souvent", "Très souvent", "C'est une habitude"] },
    { id: "q6", text: "Avez-vous essayé de réduire votre temps d'écran sans y arriver ?", options: ["Jamais", "1–2 fois", "3–5 fois", "Souvent", "J'ai abandonné"] },
  ],
  es: [
    { id: "q1", text: "¿Miras el móvil hasta justo antes de dormirte?", options: ["Nunca", "A veces", "A menudo", "A diario", "Siempre"] },
    { id: "q2", text: "¿Sientes ansiedad o inquietud cuando el móvil no está a tu lado?", options: ["Para nada", "Un poco", "Moderado", "Fuerte", "Muy fuerte"] },
    { id: "q3", text: "¿Revisas el móvil por costumbre aunque no haya notificación?", options: ["Nunca", "A veces", "A menudo", "Muy a menudo", "Inconscientemente, siempre"] },
    { id: "q4", text: "¿El tiempo de pantalla interfiere con tu trabajo o estudio?", options: ["Nunca", "A veces", "A menudo", "Gravemente", "Muy gravemente"] },
    { id: "q5", text: "¿Has molestado a alguien mirando el móvil en plena conversación?", options: ["Nunca", "A veces", "A menudo", "Muy a menudo", "Es un hábito"] },
    { id: "q6", text: "¿Has intentado reducir el tiempo de pantalla sin lograrlo?", options: ["Nunca", "1–2 veces", "3–5 veces", "Muchas veces", "Me rendí"] },
  ],
};

interface Band { title: string; color: string; desc: string }
const BANDS: Record<Locale, [Band, Band, Band]> = {
  ko: [
    { title: "디지털 여유로움", color: "text-emerald-500", desc: "당신은 기술을 도구로 완벽하게 통제하고 있습니다. 현재의 균형을 유지하세요." },
    { title: "디지털 주의보", color: "text-amber-500", desc: "조금씩 스마트폰에 의존하기 시작했습니다. 의식적인 스크린 타임 관리가 필요합니다." },
    { title: "디지털 중독 위험", color: "text-rose-500", desc: "스마트폰이 당신의 일상을 지배하고 있을 가능성이 높습니다. '디지털 디톡스'가 절실한 시점입니다." },
  ],
  en: [
    { title: "Digitally Balanced", color: "text-emerald-500", desc: "You control technology as a tool, perfectly. Keep the balance you have." },
    { title: "Digital Caution", color: "text-amber-500", desc: "You're starting to lean on your phone. Some conscious screen-time management is in order." },
    { title: "Digital Dependence Risk", color: "text-rose-500", desc: "Your phone may be running your daily life. This is the moment for a real 'digital detox'." },
  ],
  ja: [
    { title: "デジタルに余裕あり", color: "text-emerald-500", desc: "あなたは技術を道具として完璧に使いこなしています。今のバランスを保ちましょう。" },
    { title: "デジタル注意報", color: "text-amber-500", desc: "少しずつスマホに依存し始めています。意識的なスクリーンタイム管理が必要です。" },
    { title: "デジタル依存リスク", color: "text-rose-500", desc: "スマホが日常を支配している可能性が高いです。今こそ『デジタルデトックス』が必要な時です。" },
  ],
  zh: [
    { title: "数字生活从容", color: "text-emerald-500", desc: "你把技术完美地当作工具来掌控。请保持现在的平衡。" },
    { title: "数字警戒", color: "text-amber-500", desc: "你开始逐渐依赖手机了，需要有意识地管理屏幕时间。" },
    { title: "数字成瘾风险", color: "text-rose-500", desc: "手机很可能正在主宰你的日常生活。现在正是进行『数字排毒』的时候。" },
  ],
  fr: [
    { title: "Équilibre numérique", color: "text-emerald-500", desc: "Vous maîtrisez parfaitement la technologie comme un outil. Gardez cet équilibre." },
    { title: "Vigilance numérique", color: "text-amber-500", desc: "Vous commencez à dépendre de votre téléphone. Une gestion consciente du temps d'écran s'impose." },
    { title: "Risque de dépendance", color: "text-rose-500", desc: "Votre téléphone dirige peut-être votre quotidien. C'est le moment d'une vraie « détox numérique »." },
  ],
  es: [
    { title: "Equilibrio digital", color: "text-emerald-500", desc: "Controlas la tecnología como una herramienta, a la perfección. Mantén ese equilibrio." },
    { title: "Alerta digital", color: "text-amber-500", desc: "Empiezas a depender del móvil. Conviene gestionar el tiempo de pantalla de forma consciente." },
    { title: "Riesgo de dependencia", color: "text-rose-500", desc: "Puede que el móvil gobierne tu día a día. Es el momento de una auténtica «desintoxicación digital»." },
  ],
};

interface UI { title: string; subtitle: string; analyze: string; resultLabel: string; actionTitle: string; actions: string[]; retry: string; heading: string }
const UI_TEXT: Record<Locale, UI> = {
  ko: { title: "나의 디지털 중독 지수 테스트", subtitle: "간단한 체크를 통해 나의 디지털 웰빙 상태를 확인하세요.", analyze: "결과 분석하기", resultLabel: "분석 결과", actionTitle: "오늘부터 실천할 액션 아이템:", actions: ["📅 침실에는 스마트폰 들고 들어가지 않기", "📵 식사 시간에는 폰 멀리 두기", "🔔 불필요한 푸시 알림 모두 끄기"], retry: "다시 테스트하기", heading: "나의 디지털 중독 지수" },
  en: { title: "Digital Addiction Score Test", subtitle: "A quick check to see the state of your digital well-being.", analyze: "Analyze results", resultLabel: "Your result", actionTitle: "Action items to start today:", actions: ["📅 Don't bring your phone into the bedroom", "📵 Keep your phone away at mealtimes", "🔔 Turn off all non-essential push notifications"], retry: "Take the test again", heading: "My Digital Addiction Score" },
  ja: { title: "デジタル依存度テスト", subtitle: "簡単なチェックで、あなたのデジタルウェルビーイングの状態を確認しましょう。", analyze: "結果を分析", resultLabel: "分析結果", actionTitle: "今日から実践するアクション:", actions: ["📅 寝室にスマホを持ち込まない", "📵 食事中はスマホを遠ざける", "🔔 不要なプッシュ通知をすべてオフにする"], retry: "もう一度テストする", heading: "デジタル依存度" },
  zh: { title: "数字成瘾指数测试", subtitle: "通过简单的检测，了解你的数字健康状态。", analyze: "分析结果", resultLabel: "分析结果", actionTitle: "从今天开始实践的行动清单:", actions: ["📅 不把手机带进卧室", "📵 吃饭时把手机放远", "🔔 关闭所有不必要的推送通知"], retry: "重新测试", heading: "我的数字成瘾指数" },
  fr: { title: "Test d'indice de dépendance numérique", subtitle: "Un bilan rapide pour connaître l'état de votre bien-être numérique.", analyze: "Analyser les résultats", resultLabel: "Votre résultat", actionTitle: "Des actions à commencer dès aujourd'hui :", actions: ["📅 Ne pas emporter son téléphone dans la chambre", "📵 Éloigner son téléphone pendant les repas", "🔔 Désactiver toutes les notifications non essentielles"], retry: "Refaire le test", heading: "Mon indice de dépendance numérique" },
  es: { title: "Test del índice de adicción digital", subtitle: "Una comprobación rápida para ver el estado de tu bienestar digital.", analyze: "Analizar resultados", resultLabel: "Tu resultado", actionTitle: "Acciones para empezar hoy:", actions: ["📅 No llevar el móvil al dormitorio", "📵 Alejar el móvil durante las comidas", "🔔 Desactivar todas las notificaciones no esenciales"], retry: "Volver a hacer el test", heading: "Mi índice de adicción digital" },
};

const DigitalBalanceTest: React.FC<Props> = ({ locale = 'ko' }) => {
    const questions = QUESTIONS[locale] ?? QUESTIONS.en;
    const bands = BANDS[locale] ?? BANDS.en;
    const ui = UI_TEXT[locale] ?? UI_TEXT.en;

    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [showResults, setShowResults] = useState(false);

    const score = useMemo(() => {
        return Object.values(answers).reduce((acc, curr) => acc + curr, 0);
    }, [answers]);

    const handleSelect = (qId: string, val: number) => {
        setAnswers(prev => ({ ...prev, [qId]: val }));
    };

    const isComplete = Object.keys(answers).length === questions.length;

    const interpretation = score <= 6 ? bands[0] : score <= 15 ? bands[1] : bands[2];

    return (
        <div className="not-prose my-12 p-8 bg-slate-50 border border-slate-200 rounded-3xl shadow-lg max-w-2xl mx-auto">
            {!showResults ? (
                <div className="space-y-8">
                    <div className="text-center">
                        <h3 className="text-2xl font-black text-slate-900">{ui.title}</h3>
                        <p className="text-sm text-slate-500 mt-2">{ui.subtitle}</p>
                    </div>

                    <div className="space-y-8">
                        {questions.map((q, idx) => (
                            <div key={q.id} className="space-y-4">
                                <p className="text-lg font-bold text-slate-800">{idx + 1}. {q.text}</p>
                                <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs">
                                    {q.options.map((opt, val) => (
                                        <button
                                            key={val}
                                            onClick={() => handleSelect(q.id, val)}
                                            className={`flex-1 py-3 px-2 rounded-xl border transition-all ${
                                                answers[q.id] === val
                                                    ? 'bg-slate-900 border-slate-900 text-white font-bold'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-6 flex justify-center">
                        <button
                            disabled={!isComplete}
                            onClick={() => setShowResults(true)}
                            className={`px-10 py-4 rounded-full font-bold transition-all ${
                                isComplete
                                    ? 'bg-black text-white hover:scale-105 shadow-xl'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            {ui.analyze}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center space-y-8 py-6 animate-fade-in">
                    <div>
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{ui.resultLabel}</span>
                        <h3 className={`text-5xl font-black mt-2 ${interpretation.color}`}>{interpretation.title}</h3>
                    </div>

                    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-inner">
                        <p className="text-slate-700 leading-relaxed font-medium">
                            {interpretation.desc}
                        </p>
                    </div>

                    <div className="bg-slate-900 text-white p-6 rounded-2xl text-left space-y-3">
                        <p className="text-xs font-bold uppercase text-slate-400">{ui.actionTitle}</p>
                        <ul className="text-sm space-y-2 font-medium">
                            {ui.actions.map((a, i) => <li key={i}>{a}</li>)}
                        </ul>
                    </div>

                    <button
                        onClick={() => {setAnswers({}); setShowResults(false);}}
                        className="text-slate-400 text-sm hover:text-slate-900 transition-colors"
                    >
                        {ui.retry}
                    </button>
                    <ShareResultButton locale={locale} heading={ui.heading} resultTitle={interpretation.title} />
                </div>
            )}
        </div>
    );
};

export default DigitalBalanceTest;
