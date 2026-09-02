import { useEffect, useState } from "react";
import { buildTestAchievementSnapshot, evaluateTestAchievements } from "@/lib/user/test-achievements";

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
  const [rows, setRows] = useState(() => evaluateTestAchievements({ finishedTests: 0, distinctTests: 0 }));

  useEffect(() => {
    setRows(evaluateTestAchievements(buildTestAchievementSnapshot()));
  }, []);

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-8">
      <div>
        <h1 className="text-2xl font-black">{t.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.hint}</p>
      </div>
      <ul className="space-y-3">
        {rows.map((row) => {
          const copy = t.names[row.id as keyof typeof t.names];
          return (
            <li key={row.id} className={`rounded-2xl border p-4 ${row.unlocked ? "bg-lime-50" : "bg-card"}`}>
              <p className="font-black">
                {row.icon} {copy?.title ?? row.id}
              </p>
              <p className="text-sm text-muted-foreground">{copy?.desc}</p>
              <p className="mt-1 font-mono text-xs">
                {row.progress}/{row.target}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
