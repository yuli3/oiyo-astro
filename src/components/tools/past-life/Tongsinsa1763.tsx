import { useEffect, useState } from "react";
import type { Locale } from "../../../i18n";
import { ROLES, TOTAL, drawRole, formatTongsinsa, oneIn, parseTongsinsa, type Role } from "../../../lib/tongsinsa-1763";
import { birthdayRandom } from "../../../lib/past-life-1426";
import { Button } from "../../ui/button";
import { CopyLink, Panel, Sources, numberFormat, pick, setShareQuery, toL, useFunnel, type Six } from "./shared";
import { BirthdayPicker, ModeTabs3, RarityBadge, SaveCard, SeriesNext, TimeWarp, stampEpisode, useWarp, type Mode } from "./timeslip";

const EP = "tongsinsa-1763" as const;

const C = {
  draw: { ko: "통신사 일행 속 내 자리 뽑기", en: "Find my place in the embassy", ja: "通信使一行の中の私を引く", zh: "抽出我在通信使团中的位置", fr: "Trouver ma place dans l'ambassade", es: "Encontrar mi lugar en la embajada" },
  again: { ko: "다시 뽑기", en: "Draw again", ja: "もう一度", zh: "再抽一次", fr: "Recommencer", es: "Otra vez" },
  heroKicker: { ko: "1763년 계미통신사 477명 중 나", en: "You among the 477 of the 1763 embassy to Japan", ja: "1763年 癸未通信使477人の中の私", zh: "1763年癸未通信使477人中的我", fr: "Vous parmi les 477 de l'ambassade de 1763", es: "Tú entre los 477 de la embajada de 1763" },
  edoYes: { ko: "에도까지 가서 쇼군에게 국서를 전하는 자리에 함께해요.", en: "You go all the way to Edo for the presentation of the king's letter to the shogun.", ja: "江戸まで行き、将軍への国書伝達に立ち会います。", zh: "一路到江户，见证向将军递交国书。", fr: "Vous allez jusqu'à Edo pour la remise de la lettre au shogun.", es: "Llegas hasta Edo para la entrega de la carta al shogún." },
  edoNo: { ko: "에도에는 가지 않아요. 이해 오사카에는 106명이 남았어요.", en: "You do not see Edo: 106 people stayed behind in Osaka that year.", ja: "江戸には行きません。この年は106人が大坂に残りました。", zh: "你不去江户。那年有106人留在大坂。", fr: "Vous ne verrez pas Edo : 106 personnes restèrent à Osaka.", es: "No verás Edo: 106 personas se quedaron en Osaka." },
  realNames: { ko: "1763년 실제 인물: {w}", en: "Real people in this role in 1763: {w}", ja: "1763年の実在人物：{w}", zh: "1763年的真实人物：{w}", fr: "Personnes réelles en 1763 : {w}", es: "Personas reales en 1763: {w}" },
  listTitle: { ko: "477명은 이렇게 꾸려졌어요", en: "How the 477 were made up", ja: "477人の構成", zh: "477人的构成", fr: "Composition des 477", es: "Composición de los 477" },
  listNote: { ko: "격군 228명은 1763년 실제 수, 나머지 직책은 통신사의 일반적인 구성 기준이에요.", en: "The 228 oarsmen are the real 1763 count; other roles follow the usual make-up of these missions.", ja: "格軍228人は1763年の実数、他の職は通信使の一般的な構成によります。", zh: "格军228人为1763年实数，其他职务按通信使的一般构成。", fr: "Les 228 rameurs sont le chiffre réel de 1763 ; le reste suit la composition habituelle.", es: "Los 228 remeros son la cifra real de 1763; el resto sigue la composición habitual." },
  me: { ko: "← 나", en: "← you", ja: "← 私", zh: "← 我", fr: "← vous", es: "← tú" },
  tripTitle: { ko: "332일의 여정", en: "A 332-day journey", ja: "332日の旅", zh: "332天的旅程", fr: "Un voyage de 332 jours", es: "Un viaje de 332 días" },
  trip: {
    ko: "(음력) 1763년 8월 3일 한양 출발 → 10월 6일 부산에서 배 6척으로 출항 → 쓰시마·이키를 지나 1764년 1월 21일 오사카 → 교토를 거쳐 2월 16일 에도 도착 → 3월 11일 귀로 → 7월 8일 경희궁에서 복명. 왕복 11,470리예요.",
    en: "Left Hanyang 3rd day of the 8th month, 1763 → sailed from Busan in six ships → Tsushima, Iki → Osaka on 21/1/1764 → Kyoto → Edo on 16/2 → homeward 11/3 → reported to the king on 8/7. 11,470 li there and back.",
    ja: "1763年8月3日漢陽出発 → 10月6日釜山から6隻で出航 → 対馬・壱岐を経て1764年1月21日大坂 → 京都を経て2月16日江戸着 → 3月11日帰路 → 7月8日慶熙宮で復命。往復11,470里。",
    zh: "1763年八月初三离开汉阳 → 十月初六自釜山乘六艘船出航 → 经对马、壹岐，1764年正月二十一日到大坂 → 经京都，二月十六日抵江户 → 三月十一日踏上归途 → 七月初八在庆熙宫复命。往返11,470里。",
    fr: "Départ de Hanyang (8e mois 1763) → Busan, six navires → Tsushima, Iki → Osaka (1764) → Kyoto → Edo → retour, rapport au roi au 7e mois. 11 470 li aller-retour.",
    es: "Salida de Hanyang (mes 8, 1763) → Busan, seis barcos → Tsushima, Iki → Osaka (1764) → Kioto → Edo → regreso, informe al rey en el mes 7. 11.470 li ida y vuelta.",
  },
  events: { ko: "이 여정에 실제로 있었던 일", en: "What really happened on this trip", ja: "この旅で実際に起きたこと", zh: "这趟旅程中真实发生的事", fr: "Ce qui s'est vraiment passé", es: "Lo que pasó de verdad" },
  e1: { ko: "1763년 12월 3일, 부사가 탄 배가 아이노시마에서 부서져 예물이 상했어요.", en: "3/12/1763: the deputy envoy's ship broke up at Ainoshima, damaging the gifts.", ja: "1763年12月3日、副使の船が藍島で破損し進物が傷みました。", zh: "1763年十二月初三，副使座船在蓝岛受损，礼物受损。", fr: "Le navire du vice-envoyé se brisa à Ainoshima, abîmant les présents.", es: "El barco del vice-enviado se rompió en Ainoshima y dañó los regalos." },
  e2: { ko: "1764년 4월 7일, 오사카에서 도훈도 최천종이 쓰시마 통역 스즈키 덴조에게 살해됐어요.", en: "7/4/1764: officer Choe Cheon-jong was killed in Osaka by Tsushima interpreter Suzuki Denzō.", ja: "1764年4月7日、大坂で都訓導の崔天宗が対馬の通詞・鈴木伝蔵に殺害されました。", zh: "1764年四月初七，都训导崔天宗在大坂被对马通事铃木传藏杀害。", fr: "À Osaka, l'officier Choe Cheon-jong fut tué par un interprète de Tsushima.", es: "En Osaka, el oficial Choe Cheon-jong fue asesinado por un intérprete de Tsushima." },
  e3: { ko: "정사 조엄은 돌아오는 길에 고구마 종자를 얻고 기르고 저장하는 법을 배워 왔어요.", en: "Chief envoy Jo Eom brought back sweet-potato seed and how to grow and store it.", ja: "正使・趙曮は帰路でサツマイモの種芋と栽培・貯蔵法を持ち帰りました。", zh: "正使赵曮在归途中得到红薯种薯，学会栽培和储藏之法带回朝鲜。", fr: "L'envoyé Jo Eom rapporta la patate douce et sa culture.", es: "El enviado Jo Eom trajo la batata y cómo cultivarla." },
  cardKicker: { ko: "1763 · 조선통신사 일행 속 나", en: "1763 · Me in the embassy to Japan", ja: "1763・朝鮮通信使一行の中の私", zh: "1763·朝鲜通信使团中的我", fr: "1763 · Moi dans l'ambassade au Japon", es: "1763 · Yo en la embajada a Japón" },
  badge: { ko: "계미통신사", en: "1763 embassy", ja: "癸未通信使", zh: "癸未通信使", fr: "Ambassade de 1763", es: "Embajada de 1763" },
  src1: { ko: "정은주, 「계미(1763)통신사행의 화원 활동 연구」", en: "Jeong Eun-ju, painters of the 1763 embassy (Korean Studies Quarterly)", ja: "鄭恩主「癸未通信使行の画員活動研究」", zh: "郑恩主《癸未通信使行画员活动研究》", fr: "Jeong Eun-ju, étude sur l'ambassade de 1763", es: "Jeong Eun-ju, estudio sobre la embajada de 1763" },
  src2: { ko: "우리역사넷, 「통신사행의 구성과 노정」", en: "Uri Yeoksa Net: make-up and route of the embassies", ja: "ウリヨクサネット「通信使行の構成と路程」", zh: "我们的历史网《通信使行的构成与路线》", fr: "Uri Yeoksa Net : composition et route", es: "Uri Yeoksa Net: composición y ruta" },
} satisfies Record<string, Six>;

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

export default function Tongsinsa1763({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const fmt = numberFormat(l);
  const [mode, setMode] = useState<Mode>("birthday");
  const [role, setRole] = useState<Role | null>(null);
  const [round, setRound] = useState(0);
  const funnel = useFunnel(EP);
  const warp = useWarp();

  useEffect(() => {
    const shared = parseTongsinsa(window.location.search);
    if (shared) setRole(shared);
  }, []);

  function show(next: Role, how: string) {
    funnel(how);
    warp.start(() => {
      setRole(next);
      setRound((r) => r + 1);
      setShareQuery(formatTongsinsa(next.id));
      stampEpisode(EP);
    });
  }

  const edoText = role ? pick(role.edo ? C.edoYes : C.edoNo, l) : "";

  return (
    <div className="space-y-6">
      {warp.warping && <TimeWarp from={new Date().getFullYear()} to={1763} l={l} onDone={warp.finish} />}
      <ModeTabs3 mode={mode} onMode={setMode} l={l} modes={["birthday", "random"]} />
      {mode === "birthday" ? (
        <BirthdayPicker l={l} cta={pick(C.draw, l)} onSubmit={(b) => show(drawRole(birthdayRandom(EP, b)), "birthday")} />
      ) : (
        <Button size="lg" className="w-full" onClick={() => show(drawRole(), "random")}>
          {pick(role ? C.again : C.draw, l)}
        </Button>
      )}

      {role && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-md">
            <p className="text-sm font-bold text-muted-foreground">{pick(C.heroKicker, l)}</p>
            <p className="mt-3 text-3xl font-black text-primary">{pick(role.name, l)}</p>
            <div className="mt-3">
              <RarityBadge n={oneIn(role)} l={l} fmt={fmt} />
            </div>
            <p className="mt-4 text-base leading-relaxed text-foreground">{pick(role.does, l)}</p>
            <p className="mt-3 text-sm text-muted-foreground">{edoText}</p>
            {role.who && <p className="mt-2 text-xs text-muted-foreground">{fill(pick(C.realNames, l), { w: role.who })}</p>}
          </section>

          <Panel label={pick(C.listTitle, l)}>
            <ul className="space-y-1 text-sm">
              {ROLES.map((x) => (
                <li key={x.id} className={x.id === role.id ? "font-bold text-primary" : "text-muted-foreground"}>
                  {pick(x.name, l)} {fmt.format(x.n)}
                  {x.id === role.id && ` ${pick(C.me, l)}`}
                </li>
              ))}
            </ul>
            <p className="pt-2 text-xs text-muted-foreground">{pick(C.listNote, l)} ({fmt.format(TOTAL)})</p>
          </Panel>

          <Panel label={pick(C.tripTitle, l)}>
            <p className="text-sm leading-relaxed">{pick(C.trip, l)}</p>
            <p className="pt-3 text-sm font-bold text-foreground">{pick(C.events, l)}</p>
            <ul className="space-y-1 pt-1 text-sm leading-relaxed">
              <li>· {pick(C.e1, l)}</li>
              <li>· {pick(C.e2, l)}</li>
              <li>· {pick(C.e3, l)}</li>
            </ul>
          </Panel>

          <Sources
            l={l}
            items={[
              { label: pick(C.src1, l), url: "https://accesson.kr/ksq/assets/pdf/40787/journal-34-2-333.pdf" },
              { label: pick(C.src2, l), url: "https://contents.history.go.kr/mobile/km/view.do?levelId=km_029_0040_0010_0020" },
            ]}
          />

          <SaveCard
            l={l}
            testId={EP}
            filename={`oiyo-tongsinsa-1763-${role.id}`}
            spec={{
              kicker: pick(C.cardKicker, l),
              title: pick(role.name, l),
              subtitle: edoText,
              badge: pick(C.badge, l),
              lines: [pick(role.does, l)],
              footer: "oiyo.net · 1763",
              accent: "#1f4e6b",
            }}
          />
          <CopyLink l={l} testId={EP} />
          <SeriesNext l={l} locale={locale} current={EP} round={round} />
        </div>
      )}
    </div>
  );
}
