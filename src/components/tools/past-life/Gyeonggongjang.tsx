import { useEffect, useState } from "react";
import type { Locale } from "../../../i18n";
import { AGENCIES, SEAT_TOTAL, TRADES, TRADE_TOTAL, drawSeat, formatSeat, parseSeat, shiftsOf, type Seat } from "../../../lib/gyeonggongjang";
import { birthdayRandom } from "../../../lib/past-life-1426";
import { Button } from "../../ui/button";
import { CopyLink, Panel, Sources, numberFormat, pick, setShareQuery, toL, useFunnel, type Six } from "./shared";
import { BirthdayPicker, ModeTabs3, SaveCard, SeriesNext, TimeWarp, stampEpisode, useWarp, type Mode } from "./timeslip";

const EP = "gyeonggongjang" as const;

const C = {
  draw: { ko: "공장안에서 내 자리 찾기", en: "Find my place in the artisan register", ja: "工匠案で私の席を探す", zh: "在工匠案里找我的位置", fr: "Trouver ma place au registre", es: "Buscar mi lugar en el registro" },
  again: { ko: "다른 공방 둘러보기", en: "Visit another workshop", ja: "別の工房を見る", zh: "换个作坊看看", fr: "Voir un autre atelier", es: "Ver otro taller" },
  kicker: { ko: "1485 『경국대전』 · 서울 관청의 장인", en: "1485 Gyeongguk Daejeon · artisan of a Seoul office", ja: "1485『経国大典』・漢城の官庁の職人", zh: "1485《经国大典》·汉城官署的工匠", fr: "1485, Gyeongguk Daejeon · artisan d'un office de Séoul", es: "1485, Gyeongguk Daejeon · artesano de una oficina de Seúl" },
  atAgency: { ko: "{agency} 소속", en: "attached to {agency}", ja: "{agency}所属", zh: "隶属{agency}", fr: "rattaché au {agency}", es: "adscrito a {agency}" },
  seats: { ko: "이 관청의 같은 직종 {n}명 · 이 직종 전체 {all}명", en: "{n} of this trade here · {all} in the trade overall", ja: "この官庁の同職{n}名・この職種全体{all}名", zh: "本署同行{n}人·该行当共{all}人", fr: "{n} de ce métier ici · {all} au total", es: "{n} de este oficio aquí · {all} en total" },
  workTitle: { ko: "하는 일", en: "The work", ja: "仕事", zh: "做什么", fr: "Le travail", es: "El trabajo" },
  work: { ko: "맡은 일: {made}. 소속 관청 {agency}의 일: {role}.", en: "You make {made}. {agency} handled {role}.", ja: "{made}を作ります。{agency}は{role}を担う官庁です。", zh: "你制作{made}。{agency}负责{role}。", fr: "Vous faites {made}. Le {agency} s'occupait de : {role}.", es: "Haces {made}. {agency} se ocupaba de: {role}." },
  dutyTitle: { ko: "장적과 근무", en: "Register and service", ja: "匠籍と勤務", zh: "匠籍与服役", fr: "Registre et service", es: "Registro y servicio" },
  duty: { ko: "이름은 장적(공장안)에 올라 한성부·공조·소속 관청에 보관돼요. 1년 중 정해진 기간에 관청 공방으로 나가 {s}교대로 일하고, 그동안 급료를 받아요.", en: "Your name is in the artisan register kept by Hanseongbu, the Ministry of Works and your office. For set periods each year you work in the official workshop in {s} rotating shifts and are paid while on duty.", ja: "名前は匠籍（工匠案）に載り、漢城府・工曹・所属官庁に保管されます。年に決まった期間だけ官庁の工房で{s}交代で働き、その間は給料が出ます。", zh: "名字登在匠籍（工匠案）上，由汉城府、工曹和所属官署保管。每年在规定期间到官署作坊{s}班轮值，期间领取工钱。", fr: "Votre nom figure au registre des artisans tenu par le Hanseongbu, le ministère des Travaux et votre office. Chaque année, à des périodes fixées, vous travaillez à l'atelier officiel par roulement de {s} équipes, payé pendant le service.", es: "Tu nombre está en el registro de artesanos que guardan el Hanseongbu, el Ministerio de Obras y tu oficina. Cada año, en periodos fijados, trabajas en el taller oficial en {s} turnos rotativos y cobras mientras sirves." },
  promo: { ko: "솜씨가 좋고 근무 일수를 채우면 체아직(잡직) 벼슬을 받을 수 있었어요. 900일을 근무하면 품계가 하나 올랐어요.", en: "Skilled artisans who served enough days could receive a rotating minor post; 900 days of service raised you one rank.", ja: "腕が良く勤務日数を満たせば逓児職（雑職）がもらえ、900日勤めると品階が一つ上がりました。", zh: "手艺好、服役日数满了，可以得到递儿职（杂职）；服役900天升一级品阶。", fr: "Les artisans habiles ayant assez servi pouvaient recevoir un petit poste tournant ; 900 jours de service faisaient monter d'un rang.", es: "Los artesanos hábiles con días suficientes podían recibir un cargo menor rotativo; 900 días de servicio subían un rango." },
  cloth: { ko: "1464년(세조 10)부터는 직접 일하러 가는 대신 장포(옷감)를 내도 됐어요. 17세기에는 무기 등 일부를 빼고 관영 공방이 사라지고 민간 장인의 시대로 넘어가요.", en: "From 1464 you could pay cloth instead of serving. By the 17th century most official workshops, except arms, had given way to private craftsmen.", ja: "1464年（世祖10年）からは出仕の代わりに匠布（布）を納めてもよくなりました。17世紀には武器など一部を除き官営工房はなくなり、民間の職人の時代に移ります。", zh: "1464年（世祖十年）起，可以缴纳匠布代替服役。到17世纪，除兵器等外官营作坊消失，转入民间工匠时代。", fr: "Dès 1464, on pouvait payer en tissu au lieu de servir. Au XVIIe siècle, hors armement, les ateliers officiels avaient cédé la place aux artisans privés.", es: "Desde 1464 se podía pagar en tela en lugar de servir. En el siglo XVII, salvo armas, los talleres oficiales dieron paso a artesanos privados." },
  statusNote: { ko: "경공장은 양인과 관청·사찰에 속한 사람, 승려 등 여러 신분이 섞여 있었고 점차 양인이 다수가 됐어요. 이 뽑기는 신분을 뽑지 않아요.", en: "Seoul artisans came from several legal statuses, including commoners, government and temple bondspeople and monks; over time most were commoners. This draw does not assign a status.", ja: "京工匠には良人、官庁や寺院に属する人、僧などさまざまな身分が混ざり、次第に良人が多数になりました。この抽選では身分は引きません。", zh: "京工匠中有良人、隶属官署或寺院的人、僧人等多种身份，后来良人渐成多数。本抽签不抽身份。", fr: "Les artisans de Séoul relevaient de plusieurs statuts (roturiers, dépendants d'offices ou de temples, moines) ; peu à peu les roturiers devinrent majoritaires. Ce tirage n'attribue pas de statut.", es: "Los artesanos de Seúl tenían varios estatus (plebeyos, dependientes de oficinas o templos, monjes); con el tiempo predominaron los plebeyos. Este sorteo no asigna estatus." },
  aboutTitle: { ko: "어떻게 뽑나요", en: "How it is drawn", ja: "抽選の仕組み", zh: "怎么抽", fr: "Méthode", es: "Cómo se sortea" },
  about: { ko: "『경국대전』의 경공장은 30개 관청에 약 130종, 2,800여 명이에요(출처에 따라 2,795명 또는 2,841명). 이 중 출처에서 관청별 인원을 확인한 {seats}자리에서 인원 비율대로 뽑아요. 붓·먹을 만드는 장인처럼 숫자를 확인하지 못한 직종은 빠져 있어요.", en: "The Gyeongguk Daejeon lists about 130 trades and some 2,800 artisans in 30 Seoul offices (2,795 or 2,841, depending on the source). We draw in proportion from the {seats} places whose numbers we could confirm by office; trades without confirmed counts, such as brush and ink makers, are left out.", ja: "『経国大典』の京工匠は30官庁に約130種、2,800余名（出典により2,795名または2,841名）。このうち官庁別の人数を確認できた{seats}席から人数比で引きます。筆や墨の職人など人数未確認の職種は含みません。", zh: "《经国大典》中京工匠分属30个官署，约130种、2,800余人（因出处为2,795或2,841人）。本抽签只在确认了各署人数的{seats}个名额中按比例抽取；笔匠、墨匠等人数未确认的行当未收录。", fr: "Le Gyeongguk Daejeon compte environ 130 métiers et quelque 2 800 artisans dans 30 offices (2 795 ou 2 841 selon la source). Le tirage se fait au prorata des {seats} places dont l'effectif par office est confirmé ; les métiers non chiffrés (pinceaux, encre) sont exclus.", es: "El Gyeongguk Daejeon recoge unos 130 oficios y unos 2.800 artesanos en 30 oficinas (2.795 o 2.841 según la fuente). Sorteamos en proporción entre las {seats} plazas con cifras confirmadas por oficina; los oficios sin cifras (pinceles, tinta) quedan fuera." },
  src1: { ko: "한국민족문화대백과 「경공장」", en: "Encyclopedia of Korean Culture: Gyeonggongjang", ja: "韓国民族文化大百科「京工匠」", zh: "韩国民族文化大百科《京工匠》", fr: "Encyclopédie de la culture coréenne : Gyeonggongjang", es: "Enciclopedia de la cultura coreana: Gyeonggongjang" },
  src2: { ko: "한국민족문화대백과 「공장」", en: "Encyclopedia of Korean Culture: artisans", ja: "韓国民族文化大百科「工匠」", zh: "韩国民族文化大百科《工匠》", fr: "Encyclopédie de la culture coréenne : artisans", es: "Enciclopedia de la cultura coreana: artesanos" },
  src3: { ko: "실록위키 「군기시」", en: "Sillok Wiki: Gungisi", ja: "実録ウィキ「軍器寺」", zh: "实录维基《军器寺》", fr: "Sillok Wiki : Gungisi", es: "Sillok Wiki: Gungisi" },
  src4: { ko: "실록위키 「상의원」", en: "Sillok Wiki: Sangeuiwon", ja: "実録ウィキ「尚衣院」", zh: "实录维基《尚衣院》", fr: "Sillok Wiki : Sangeuiwon", es: "Sillok Wiki: Sangeuiwon" },
  src5: { ko: "우리역사넷 「관영 수공업」", en: "Contents.history.go.kr: state workshops", ja: "ウリ歴史ネット「官営手工業」", zh: "我们的历史网《官营手工业》", fr: "Contents.history.go.kr : ateliers d'État", es: "Contents.history.go.kr: talleres estatales" },
  cardKicker: { ko: "1485 · 경공장 장적 속 나", en: "1485 · Me in the artisan register", ja: "1485・匠籍の中の私", zh: "1485·匠籍里的我", fr: "1485 · Moi au registre des artisans", es: "1485 · Yo en el registro de artesanos" },
  badge: { ko: "경공장", en: "Royal artisan", ja: "京工匠", zh: "京工匠", fr: "Artisan royal", es: "Artesano real" },
} satisfies Record<string, Six>;

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

export default function Gyeonggongjang({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const fmt = numberFormat(l);
  const [mode, setMode] = useState<Mode>("birthday");
  const [seat, setSeat] = useState<Seat | null>(null);
  const [round, setRound] = useState(0);
  const funnel = useFunnel(EP);
  const warp = useWarp();

  useEffect(() => {
    const shared = parseSeat(window.location.search);
    if (shared) setSeat(shared);
  }, []);

  function draw(rand: () => number, how: string) {
    const next = drawSeat(rand);
    funnel(how);
    warp.start(() => {
      setSeat(next);
      setRound((r) => r + 1);
      setShareQuery(formatSeat(next));
      stampEpisode(EP);
    });
  }

  const trade = seat ? TRADES[seat.ti]! : null;
  const post = seat && trade ? trade.posts[seat.pi]! : null;
  const agency = post ? AGENCIES[post[0]]! : null;

  return (
    <div className="space-y-6">
      {warp.warping && <TimeWarp from={new Date().getFullYear()} to={1485} l={l} onDone={warp.finish} />}
      <ModeTabs3 mode={mode} onMode={setMode} l={l} modes={["birthday", "random"]} />
      {mode === "birthday" ? (
        <BirthdayPicker l={l} cta={pick(C.draw, l)} onSubmit={(b) => draw(birthdayRandom(EP, b), "birthday")} />
      ) : (
        <Button size="lg" className="w-full" onClick={() => draw(Math.random, "random")}>
          {pick(seat ? C.again : C.draw, l)}
        </Button>
      )}

      {seat && trade && post && agency && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-md">
            <p className="text-sm font-bold text-muted-foreground">{pick(C.kicker, l)}</p>
            <p className="mt-3 font-serif text-4xl font-black text-foreground">{trade.hanja}</p>
            <p className="mt-2 text-2xl font-black text-foreground">{pick(trade.name, l)}</p>
            <p className="mt-2 text-sm font-bold text-foreground">{fill(pick(C.atAgency, l), { agency: `${pick(agency.name, l)} ${l === "ko" ? agency.hanja : ""}`.trim() })}</p>
            <p className="mt-2 text-xs text-muted-foreground">{fill(pick(C.seats, l), { n: fmt.format(post[1]), all: fmt.format(TRADE_TOTAL(trade)) })}</p>
          </section>

          <Panel label={pick(C.workTitle, l)}>
            <p className="text-base leading-relaxed text-foreground">{fill(pick(C.work, l), { made: pick(trade.made, l), agency: pick(agency.name, l), role: pick(agency.role, l) })}</p>
          </Panel>

          <Panel label={pick(C.dutyTitle, l)}>
            <p className="text-sm leading-relaxed">{fill(pick(C.duty, l), { s: shiftsOf(seat) })}</p>
            <p className="text-sm leading-relaxed">{pick(C.promo, l)}</p>
            <p className="text-sm leading-relaxed">{pick(C.cloth, l)}</p>
            <p className="pt-2 text-xs text-muted-foreground">{pick(C.statusNote, l)}</p>
          </Panel>

          <Panel label={pick(C.aboutTitle, l)}>
            <p className="text-sm leading-relaxed">{fill(pick(C.about, l), { seats: fmt.format(SEAT_TOTAL) })}</p>
          </Panel>

          <Sources
            l={l}
            items={[
              { label: pick(C.src1, l), url: "https://encykorea.aks.ac.kr/Article/E0002288" },
              { label: pick(C.src2, l), url: "https://encykorea.aks.ac.kr/Article/E0004428" },
              { label: pick(C.src3, l), url: "https://dh.aks.ac.kr/sillokwiki/index.php/%EA%B5%B0%EA%B8%B0%EC%8B%9C%28%E8%BB%8D%E5%99%A8%E5%AF%BA%29" },
              { label: pick(C.src4, l), url: "https://dh.aks.ac.kr/sillokwiki/index.php/%EC%83%81%EC%9D%98%EC%9B%90(%E5%B0%99%E8%A1%A3%E9%99%A2)" },
              { label: pick(C.src5, l), url: "https://contents.history.go.kr/mobile/km/view.do?levelId=km_016_0040_0020_0010" },
            ]}
          />

          <SaveCard
            l={l}
            testId={EP}
            filename="oiyo-gyeonggongjang"
            spec={{
              kicker: pick(C.cardKicker, l),
              title: `${trade.hanja} ${pick(trade.name, l)}`,
              subtitle: fill(pick(C.atAgency, l), { agency: pick(agency.name, l) }),
              badge: pick(C.badge, l),
              lines: [pick(trade.made, l), fill(pick(C.seats, l), { n: fmt.format(post[1]), all: fmt.format(TRADE_TOTAL(trade)) })],
              footer: `oiyo.net · 1485 · ${agency.hanja}`,
              accent: "#6b4a2b",
            }}
          />
          <CopyLink l={l} testId={EP} />
          <SeriesNext l={l} locale={locale} current={EP} round={round} />
        </div>
      )}
    </div>
  );
}
