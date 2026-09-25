import { useEffect, useMemo, useState } from "react";
import PhysicsJar, { type JarItem } from "@/components/visual/PhysicsJar";
import { useReducedMotion } from "@/hooks/useMotion";
import {
  buildTestAchievementSnapshot,
  evaluateTestAchievements,
  jarText,
  listAchievementTests,
  type AchievementTest,
} from "@/lib/user/test-achievements";

// 검사 종류별 공 색. 열기만 한 검사는 같은 색의 빈 공이다.
const KIND_COLOR: Record<string, string> = {
  psychometric: "#4ade80",
  mystic: "#c4b5fd",
  fortune: "#fcd34d",
  ontology: "#7dd3fc",
};
const OPENED_COLOR = "#94a3b8";

const JAR_COPY = {
  ko: { jar: "지금까지 연 검사", note: "공 하나가 서로 다른 검사 하나입니다. 꽉 찬 공은 결과까지 본 검사, 빈 공은 열어 본 검사예요. 공을 누르면 이름이 보입니다.", shake: "흔들기", finished: "결과까지", opened: "열어 봄", empty: "아직 연 검사가 없어요. 검사를 열면 여기에 공이 떨어집니다." },
  en: { jar: "Tests you’ve opened", note: "Each ball is one distinct test. Solid balls are tests you finished; hollow ones you opened. Tap a ball to see its name.", shake: "Shake", finished: "Finished", opened: "Opened", empty: "No tests opened yet. Open one and a ball drops here." },
  ja: { jar: "これまで開いたテスト", note: "ボール1つが異なるテスト1つです。塗りつぶしは結果まで見たテスト、中空は開いたテスト。タップで名前を表示します。", shake: "揺らす", finished: "結果まで", opened: "開いた", empty: "まだ開いたテストがありません。開くとここにボールが落ちます。" },
  zh: { jar: "打开过的测试", note: "一个球就是一个不同的测试。实心球是看到结果的测试，空心球是打开过的测试。点一下看名字。", shake: "摇一摇", finished: "看到结果", opened: "打开过", empty: "还没有打开过测试。打开一个，这里就会落下一个球。" },
  fr: { jar: "Tests ouverts", note: "Chaque bille est un test différent. Pleine : test terminé ; creuse : test ouvert. Touchez une bille pour voir son nom.", shake: "Secouer", finished: "Terminés", opened: "Ouverts", empty: "Aucun test ouvert. Ouvrez-en un et une bille tombera ici." },
  es: { jar: "Tests que abriste", note: "Cada bola es un test distinto. Las llenas son tests terminados; las huecas, tests abiertos. Toca una bola para ver su nombre.", shake: "Agitar", finished: "Terminados", opened: "Abiertos", empty: "Aún no abriste ningún test. Abre uno y caerá una bola aquí." },
} as const;

const COPY = {
  ko: {
    title: "테스트 업적",
    hint: "이 기기에 남은 결과만 셉니다. 계정은 없습니다.",
    names: {
      "first-test": { title: "첫 결과", desc: "테스트를 하나 끝까지 보세요." },
      "five-tests": { title: "다섯 장", desc: "서로 다른 테스트 5개를 여세요." },
      "twenty-tests": { title: "스무 장", desc: "서로 다른 테스트 20개를 여세요." },
      "atlas-tests": { title: "지도", desc: "서로 다른 테스트 40개를 여세요." },
    },
  },
  en: {
    title: "Test achievements",
    hint: "Counted on this device only. No account.",
    names: {
      "first-test": { title: "First result", desc: "Finish one test." },
      "five-tests": { title: "Five cards", desc: "Open 5 different tests." },
      "twenty-tests": { title: "Twenty cards", desc: "Open 20 different tests." },
      "atlas-tests": { title: "Atlas", desc: "Open 40 different tests." },
    },
  },
  ja: {
    title: "テスト実績",
    hint: "この端末の結果だけを数えます。",
    names: {
      "first-test": { title: "最初の結果", desc: "テストを1つ最後まで見る。" },
      "five-tests": { title: "5枚", desc: "異なるテストを5つ開く。" },
      "twenty-tests": { title: "20枚", desc: "異なるテストを20開く。" },
      "atlas-tests": { title: "地図", desc: "異なるテストを40開く。" },
    },
  },
  zh: {
    title: "测试成就",
    hint: "只统计这台设备上的结果。",
    names: {
      "first-test": { title: "第一份结果", desc: "做完一个测试。" },
      "five-tests": { title: "五张", desc: "打开5个不同测试。" },
      "twenty-tests": { title: "二十张", desc: "打开20个不同测试。" },
      "atlas-tests": { title: "地图", desc: "打开40个不同测试。" },
    },
  },
  fr: {
    title: "Succès des tests",
    hint: "Comptés sur cet appareil seulement.",
    names: {
      "first-test": { title: "Premier résultat", desc: "Terminez un test." },
      "five-tests": { title: "Cinq cartes", desc: "Ouvrez 5 tests différents." },
      "twenty-tests": { title: "Vingt cartes", desc: "Ouvrez 20 tests différents." },
      "atlas-tests": { title: "Atlas", desc: "Ouvrez 40 tests différents." },
    },
  },
  es: {
    title: "Logros de tests",
    hint: "Solo en este aparato.",
    names: {
      "first-test": { title: "Primer resultado", desc: "Termina un test." },
      "five-tests": { title: "Cinco cartas", desc: "Abre 5 tests distintos." },
      "twenty-tests": { title: "Veinte cartas", desc: "Abre 20 tests distintos." },
      "atlas-tests": { title: "Atlas", desc: "Abre 40 tests distintos." },
    },
  },
} as const;

type Lang = keyof typeof COPY;

export default function TestAchievements({ locale }: { locale: string }) {
  const t = COPY[(locale in COPY ? locale : "en") as Lang];
  const j = JAR_COPY[(locale in JAR_COPY ? locale : "en") as keyof typeof JAR_COPY];
  const [rows, setRows] = useState(() => evaluateTestAchievements({ finishedTests: 0, distinctTests: 0 }));
  const [tests, setTests] = useState<AchievementTest[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    setRows(evaluateTestAchievements(buildTestAchievementSnapshot()));
    setTests(listAchievementTests());
  }, []);

  const items = useMemo<JarItem[]>(
    () =>
      tests.map((test) => ({
        id: test.testId,
        text: jarText(test.title ?? test.testId),
        color: test.finished ? (KIND_COLOR[test.kind ?? ""] ?? KIND_COLOR.psychometric) : OPENED_COLOR,
        hollow: !test.finished,
      })),
    [tests],
  );
  const finishedCount = tests.filter((test) => test.finished).length;
  const pickedTest = tests.find((test) => test.testId === picked);

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-8">
      <div>
        <h1 className="text-2xl font-black">{t.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.hint}</p>
      </div>
      {tests.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">{j.empty}</p>
      ) : (
        <section aria-label={j.jar}>
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-black">{j.jar}</h2>
            <p className="text-xs text-muted-foreground">
              {j.finished} {finishedCount} · {j.opened} {tests.length - finishedCount}
            </p>
          </div>
          {!reducedMotion ? (
            <PhysicsJar
              items={items}
              dropKey={1}
              onSelect={setPicked}
              shakeLabel={j.shake}
              ariaLabel={`${j.jar}: ${tests.length}`}
              height={260}
            />
          ) : null}
          <p className="mt-2 min-h-5 text-sm font-semibold" aria-live="polite">
            {pickedTest ? `${pickedTest.title ?? pickedTest.testId} · ${pickedTest.finished ? j.finished : j.opened}` : ""}
          </p>
          <p className="text-xs text-muted-foreground">{j.note}</p>
        </section>
      )}
      <ul className="space-y-3">
        {rows.map((row) => {
          const copy = t.names[row.id as keyof typeof t.names];
          return (
            <li key={row.id} className={`rounded-2xl border p-4 ${row.unlocked ? "bg-lime-50" : "bg-card"}`}>
              <p className="font-black">
                {row.icon} {copy?.title ?? row.id}
              </p>
              <p className="text-sm text-muted-foreground">{copy?.desc}</p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                  <div
                    className={`h-full rounded-full ${row.unlocked ? "bg-lime-500" : "bg-green-400"}`}
                    style={{ width: `${(row.progress / row.target) * 100}%` }}
                  />
                </div>
                <p className="font-mono text-xs">
                  {row.progress}/{row.target}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
