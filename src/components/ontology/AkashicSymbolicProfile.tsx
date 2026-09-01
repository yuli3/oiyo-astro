import { useEffect, useState } from 'react';
import { BookOpenText, GitBranch, RefreshCw, Sparkles } from 'lucide-react';
import { collectSignals } from '@/lib/ontology/signals';
import { buildSymbolicProfile, type SymbolicMotifId, type SymbolicSystemId } from '@/lib/ontology/akashic-symbolic-profile';
import { useUserStore } from '@/lib/user/store/user-store';

type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'fr' | 'es';

const copy: Record<Locale, { title: string; sub: string; weave: string; refresh: string; empty: string; emptySub: string; repeated: string; tensions: string; noRepeated: string; noTensions: string; method: string; sources: string }> = {
  ko: { title: '상징 프로필 엮기', sub: '서로 다른 체계의 신호를 지우지 않고 한 장에서 비교합니다.', weave: '내 상징 가지 펼치기', refresh: '현재 기록으로 다시 엮기', empty: '아직 엮을 신호가 없습니다', emptySub: '생년월일이나 성격 검사 결과를 저장하면 여기에 가지가 생깁니다.', repeated: '반복되는 상징', tensions: '서로 다른 관점', noRepeated: '두 체계 이상에서 반복된 모티프는 아직 없습니다.', noTensions: '서로 반대되는 관점은 아직 보이지 않습니다.', method: '편집적 교차표이며 검증된 심리 척도나 운명 판정이 아닙니다.', sources: '기여 체계' },
  en: { title: 'Weave a symbolic profile', sub: 'Compare different systems on one canvas without erasing their sources.', weave: 'Unfold my symbolic branches', refresh: 'Weave from current records', empty: 'No signals to weave yet', emptySub: 'Save a birth date or assessment result to grow branches here.', repeated: 'Recurring symbols', tensions: 'Different perspectives', noRepeated: 'No motif appears in two or more systems yet.', noTensions: 'No opposing perspectives appear yet.', method: 'This is an editorial crosswalk, not a validated scale or a destiny verdict.', sources: 'Contributing systems' },
  ja: { title: '象徴プロフィールを編む', sub: '異なる体系の出典を消さず、一枚で比較します。', weave: '象徴の枝を広げる', refresh: '現在の記録から編み直す', empty: '編めるシグナルがまだありません', emptySub: '生年月日や検査結果を保存すると枝が育ちます。', repeated: '繰り返す象徴', tensions: '異なる視点', noRepeated: '二つ以上の体系で繰り返すモチーフはまだありません。', noTensions: '反対の視点はまだ見えていません。', method: '編集上の対応表であり、検証済み尺度や運命判定ではありません。', sources: '寄与した体系' },
  zh: { title: '编织象征档案', sub: '保留每套体系的来源，在同一画面中比较。', weave: '展开我的象征枝条', refresh: '按当前记录重新编织', empty: '暂无可编织的信号', emptySub: '保存出生日期或测验结果后，枝条会在这里生长。', repeated: '重复出现的象征', tensions: '不同视角', noRepeated: '目前没有在两套以上体系中重复的主题。', noTensions: '目前没有相反视角。', method: '这是编辑性对照表，不是经验证量表或命运判断。', sources: '贡献体系' },
  fr: { title: 'Tisser un profil symbolique', sub: 'Comparer plusieurs systèmes sans effacer leur provenance.', weave: 'Déployer mes branches symboliques', refresh: 'Retisser depuis mes données', empty: 'Aucun signal à tisser', emptySub: 'Enregistrez une date de naissance ou un résultat pour faire pousser les branches.', repeated: 'Symboles récurrents', tensions: 'Regards différents', noRepeated: 'Aucun motif ne revient encore dans au moins deux systèmes.', noTensions: 'Aucun point de vue opposé n’apparaît encore.', method: 'Ceci est une grille éditoriale, pas une échelle validée ni un verdict du destin.', sources: 'Systèmes contributeurs' },
  es: { title: 'Tejer un perfil simbólico', sub: 'Compara sistemas distintos sin borrar su procedencia.', weave: 'Desplegar mis ramas simbólicas', refresh: 'Volver a tejer con mis datos', empty: 'Aún no hay señales que tejer', emptySub: 'Guarda una fecha de nacimiento o un resultado para hacer crecer ramas.', repeated: 'Símbolos recurrentes', tensions: 'Perspectivas distintas', noRepeated: 'Todavía no hay motivos repetidos en dos o más sistemas.', noTensions: 'Todavía no aparecen perspectivas opuestas.', method: 'Es una tabla editorial, no una escala validada ni un veredicto del destino.', sources: 'Sistemas contribuyentes' },
};

const systems: Record<Locale, Record<SymbolicSystemId, string>> = {
  ko: { saju: '사주', zodiac: '서양 별자리', mbti: 'MBTI', big5: 'Big Five', riasec: 'RIASEC', enneagram: '에니어그램' },
  en: { saju: 'Saju', zodiac: 'Western zodiac', mbti: 'MBTI', big5: 'Big Five', riasec: 'RIASEC', enneagram: 'Enneagram' },
  ja: { saju: '四柱', zodiac: '西洋星座', mbti: 'MBTI', big5: 'Big Five', riasec: 'RIASEC', enneagram: 'エニアグラム' },
  zh: { saju: '八字', zodiac: '西方星座', mbti: 'MBTI', big5: '大五人格', riasec: 'RIASEC', enneagram: '九型人格' },
  fr: { saju: 'Saju', zodiac: 'Zodiaque occidental', mbti: 'MBTI', big5: 'Big Five', riasec: 'RIASEC', enneagram: 'Ennéagramme' },
  es: { saju: 'Saju', zodiac: 'Zodiaco occidental', mbti: 'MBTI', big5: 'Big Five', riasec: 'RIASEC', enneagram: 'Eneagrama' },
};

const motifLabels: Record<Locale, Record<SymbolicMotifId, string>> = {
  ko: { inward: '내면', outward: '외부 표현', possibility: '가능성', grounded: '현실 감각', analysis: '분석', relation: '관계', structure: '구조', exploration: '탐색', sensitivity: '민감성', steadiness: '안정성' },
  en: { inward: 'inner focus', outward: 'outer expression', possibility: 'possibility', grounded: 'grounding', analysis: 'analysis', relation: 'relation', structure: 'structure', exploration: 'exploration', sensitivity: 'sensitivity', steadiness: 'steadiness' },
  ja: { inward: '内面', outward: '外への表現', possibility: '可能性', grounded: '現実感覚', analysis: '分析', relation: '関係', structure: '構造', exploration: '探索', sensitivity: '感受性', steadiness: '安定性' },
  zh: { inward: '内在', outward: '外在表达', possibility: '可能性', grounded: '现实感', analysis: '分析', relation: '关系', structure: '结构', exploration: '探索', sensitivity: '敏感性', steadiness: '稳定性' },
  fr: { inward: 'intériorité', outward: 'expression', possibility: 'possibilité', grounded: 'ancrage', analysis: 'analyse', relation: 'relation', structure: 'structure', exploration: 'exploration', sensitivity: 'sensibilité', steadiness: 'stabilité' },
  es: { inward: 'interioridad', outward: 'expresión', possibility: 'posibilidad', grounded: 'arraigo', analysis: 'análisis', relation: 'relación', structure: 'estructura', exploration: 'exploración', sensitivity: 'sensibilidad', steadiness: 'estabilidad' },
};

export function AkashicSymbolicProfile({ locale: rawLocale }: { locale: string }) {
  const locale = (rawLocale in copy ? rawLocale : 'en') as Locale;
  const t = copy[locale];
  const storedProfile = useUserStore((state) => state.profile);
  const [profile, setProfile] = useState(() => buildSymbolicProfile({}));
  const [woven, setWoven] = useState(false);

  const weave = () => {
    setWoven(false);
    setProfile(buildSymbolicProfile(collectSignals()));
    requestAnimationFrame(() => setWoven(true));
  };
  useEffect(() => {
    const refreshFromRecords = () => {
      setProfile(buildSymbolicProfile(collectSignals()));
      setWoven(true);
    };

    setProfile(buildSymbolicProfile(collectSignals()));
    window.addEventListener('oiyo:ontology-progress-updated', refreshFromRecords);
    return () => window.removeEventListener('oiyo:ontology-progress-updated', refreshFromRecords);
  }, [storedProfile]);

  return (
    <div className="akashic-workbench rounded-2xl bg-green-950 p-4 text-white shadow-[0_14px_36px_-22px_rgba(20,83,45,0.85)] md:p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-lime-200 text-green-950"><GitBranch size={20} aria-hidden="true" /></span>
        <div>
          <h2 className="text-lg font-black tracking-[-0.02em]">{t.title}</h2>
          <p className="mt-1 text-sm leading-6 text-green-100">{t.sub}</p>
        </div>
      </div>

      {!woven ? (
        <button type="button" onClick={weave} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-lime-200 px-4 py-3 text-sm font-black text-green-950 transition-colors hover:bg-lime-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200">
          <Sparkles size={18} aria-hidden="true" />{t.weave}
        </button>
      ) : profile.sourceCount === 0 ? (
        <div className="mt-5 rounded-xl bg-white/8 p-4" role="status">
          <p className="font-black">{t.empty}</p><p className="mt-1 text-sm leading-6 text-green-100">{t.emptySub}</p>
          <button type="button" onClick={weave} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-black text-green-950"><RefreshCw size={16} aria-hidden="true" />{t.refresh}</button>
        </div>
      ) : (
        <div className="akashic-reveal mt-5" aria-live="polite">
          <div className="akashic-trunk" aria-hidden="true"><span /></div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {profile.branches.map((branch, index) => (
              <li key={branch.id} className="akashic-branch rounded-xl bg-white/9 p-3" style={{ '--branch-index': index } as React.CSSProperties}>
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-lime-200">{systems[locale][branch.id]}</p>
                <p className="mt-1 break-words text-sm font-black tabular-nums text-white">{branch.value}</p>
                {branch.motifs.length > 0 && <p className="mt-2 text-xs leading-5 text-green-100">{branch.motifs.map((motif) => motifLabels[locale][motif]).join(' · ')}</p>}
              </li>
            ))}
          </ul>

          <div className="mt-5 space-y-4 border-t border-white/12 pt-4">
            <section>
              <h3 className="flex items-center gap-2 text-sm font-black"><Sparkles size={16} className="text-lime-200" aria-hidden="true" />{t.repeated}</h3>
              {profile.resonances.length ? <ul className="mt-2 space-y-2">{profile.resonances.map((item) => <li key={item.motif} className="rounded-xl bg-lime-200 px-3 py-2 text-sm text-green-950"><strong>{motifLabels[locale][item.motif]}</strong><span className="mt-0.5 block text-xs text-green-800">{t.sources}: {item.sources.map((id) => systems[locale][id]).join(' · ')}</span></li>)}</ul> : <p className="mt-2 text-sm text-green-100">{t.noRepeated}</p>}
            </section>
            <section>
              <h3 className="flex items-center gap-2 text-sm font-black"><GitBranch size={16} className="text-lime-200" aria-hidden="true" />{t.tensions}</h3>
              {profile.tensions.length ? <ul className="mt-2 space-y-2">{profile.tensions.map((item) => <li key={`${item.left}-${item.right}`} className="rounded-xl bg-white/9 px-3 py-2 text-sm"><strong>{motifLabels[locale][item.left]} ↔ {motifLabels[locale][item.right]}</strong><span className="mt-0.5 block text-xs text-green-100">{item.leftSources.map((id) => systems[locale][id]).join(' · ')} ↔ {item.rightSources.map((id) => systems[locale][id]).join(' · ')}</span></li>)}</ul> : <p className="mt-2 text-sm text-green-100">{t.noTensions}</p>}
            </section>
          </div>
          <p className="mt-4 flex gap-2 rounded-xl bg-amber-100 p-3 text-xs leading-5 text-amber-950"><BookOpenText size={16} className="mt-0.5 shrink-0" aria-hidden="true" />{t.method}</p>
          <button type="button" onClick={weave} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-green-700 px-4 py-2 text-sm font-black text-green-50 hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200"><RefreshCw size={16} aria-hidden="true" />{t.refresh}</button>
        </div>
      )}
      <style>{`
        .akashic-trunk { height: 22px; overflow: hidden; position: relative; }
        .akashic-trunk::before { background: #bef264; content: ''; height: 2px; left: 50%; position: absolute; top: 0; transform: translateX(-50%); width: min(72%, 320px); }
        .akashic-trunk span { background: #bef264; display: block; height: 22px; margin: 0 auto; width: 2px; }
        .akashic-reveal .akashic-trunk::before { animation: akashic-spread 620ms cubic-bezier(.16,1,.3,1) both; transform-origin: center; }
        .akashic-reveal .akashic-trunk span { animation: akashic-grow 420ms cubic-bezier(.16,1,.3,1) both; transform-origin: top; }
        .akashic-branch { animation: akashic-leaf 460ms cubic-bezier(.16,1,.3,1) both; animation-delay: calc(120ms + var(--branch-index) * 55ms); }
        @keyframes akashic-spread { from { clip-path: inset(0 50%); filter: blur(3px); } to { clip-path: inset(0); filter: blur(0); } }
        @keyframes akashic-grow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
        @keyframes akashic-leaf { from { clip-path: inset(0 0 100%); filter: blur(4px); transform: translateY(-8px); } to { clip-path: inset(0); filter: blur(0); transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) { .akashic-reveal .akashic-trunk::before, .akashic-reveal .akashic-trunk span, .akashic-branch { animation: none; } }
      `}</style>
    </div>
  );
}
