import { useEffect, useState } from "react";
import type { Locale } from "../../../i18n";
import { ELEMENTS, formatNames, genFirst, makeNames, namesOf, parseNames, type Names, type Sex } from "../../../lib/joseon-names";
import { birthdayRandom } from "../../../lib/past-life-1426";
import { Button } from "../../ui/button";
import { CopyLink, Panel, Sources, pick, setShareQuery, toL, useFunnel, type Six } from "./shared";
import { BirthdayPicker, ModeTabs3, SaveCard, SeriesNext, TimeWarp, stampEpisode, useWarp, type Mode } from "./timeslip";

const EP = "joseon-names" as const;

const C = {
  draw: { ko: "조선에서 이름 받기", en: "Get my Joseon names", ja: "朝鮮で名前をもらう", zh: "领取朝鲜时代的名字", fr: "Recevoir mes noms de Joseon", es: "Recibir mis nombres de Joseon" },
  again: { ko: "다시 이름 받기", en: "Try other names", ja: "別の名前", zh: "换一组名字", fr: "D'autres noms", es: "Otros nombres" },
  male: { ko: "아들로 태어나기", en: "Born a son", ja: "息子として", zh: "生为儿子", fr: "Né fils", es: "Nacer hijo" },
  female: { ko: "딸로 태어나기", en: "Born a daughter", ja: "娘として", zh: "生为女儿", fr: "Née fille", es: "Nacer hija" },
  heroKicker: { ko: "조선 시대, 나는 평생 이런 이름들로 불렸어요", en: "In Joseon, these were your names through life", ja: "朝鮮時代、一生こう呼ばれました", zh: "在朝鲜时代，你一生被这样称呼", fr: "À Joseon, vos noms au fil de la vie", es: "En Joseon, tus nombres a lo largo de la vida" },
  childT: { ko: "아명 · 갓난아기 때", en: "Childhood name (아명)", ja: "幼名", zh: "乳名（儿名）", fr: "Nom d'enfance", es: "Nombre de infancia" },
  child: { ko: "귀신이 탐내지 않도록 일부러 천하게 지은 이름이에요. 고종의 아명은 '명복(命福)', 율곡 이이의 아명은 '현룡(見龍)'이었어요.", en: "Deliberately lowly, so spirits would not covet the child. King Gojong's childhood name was Myeongbok (命福); Yi I's was Hyeollyong (見龍).", ja: "鬼神に狙われないよう、わざと卑しく付けた名。高宗の幼名は「命福」、李珥は「見龍」でした。", zh: "故意取得低贱，免得鬼神惦记。高宗乳名“命福”，李珥乳名“见龙”。", fr: "Volontairement humble, pour ne pas attirer les esprits. Le roi Gojong s'appelait enfant Myeongbok (命福).", es: "Humilde a propósito, para no atraer a los espíritus. El rey Gojong se llamó de niño Myeongbok (命福)." },
  formalT: { ko: "관명 · 족보와 문서에 오르는 이름", en: "Formal name (관명)", ja: "冠名（正式な名）", zh: "冠名（正式名）", fr: "Nom officiel", es: "Nombre oficial" },
  formal: { ko: "가운데 '{gen}({genK})'는 같은 세대 형제·사촌이 함께 쓰는 항렬자예요. 우리 세대는 {el}의 차례라 {el} 기운이 든 글자를 {pos}에 써요. 다음 세대는 오행상생에 따라 {next}로 넘어가고, 글자 자리도 바뀌어요.", en: "'{gen}' ({genK}) is the generation character shared by brothers and cousins. Your generation's turn is {el}, so the character carries {el} and sits {pos}. The next generation moves on to {next} and the position swaps.", ja: "「{gen}」は同世代の兄弟・いとこが共有する行列字。今の世代は{el}の番で、その字を{pos}に置きます。次の世代は五行相生で{next}へ移り、位置も入れ替わります。", zh: "“{gen}”是同辈兄弟、堂兄弟共用的行辈字。本代轮到{el}，所以用带{el}的字，放在{pos}。下一代按五行相生轮到{next}，位置也互换。", fr: "« {gen} » est le caractère de génération partagé par frères et cousins. Votre génération suit {el}, placé {pos} ; la suivante passera à {next}.", es: "«{gen}» es el carácter generacional que comparten hermanos y primos. Tu generación sigue {el}, colocado {pos}; la siguiente pasará a {next}." },
  first: { ko: "앞자리", en: "first", ja: "前", zh: "前位", fr: "en premier", es: "primero" },
  second: { ko: "뒷자리", en: "second", ja: "後ろ", zh: "后位", fr: "en second", es: "segundo" },
  jaT: { ko: "자(字) · 관례를 치른 뒤", en: "Courtesy name (자), after coming of age", ja: "字（冠礼の後）", zh: "字（冠礼之后）", fr: "Nom de courtoisie (après la majorité)", es: "Nombre de cortesía (tras la mayoría de edad)" },
  ja: { ko: "열다섯에서 스무 살 무렵 관례를 치르면 받는 이름이에요. 본이름을 함부로 부르지 않는 풍습 때문에 친구와 이웃은 이 이름으로 불렀어요. 퇴계 이황의 자는 '경호(景浩)'였어요.", en: "Given at the coming-of-age rite, around 15 to 20. Because calling someone by their real name was avoided, friends and neighbours used this one. Yi Hwang's was Gyeongho (景浩).", ja: "15〜20歳ごろの冠礼で受ける名。本名を呼ぶのを避ける習わしから、友や隣人はこの名で呼びました。李滉の字は「景浩」。", zh: "约十五至二十岁行冠礼时所取。因避讳直呼本名，朋友邻里都以字相称。李滉字“景浩”。", fr: "Reçu au rite de passage (15–20 ans) ; on évitait le vrai nom, donc amis et voisins l'utilisaient. Yi Hwang : Gyeongho (景浩).", es: "Recibido en el rito de mayoría de edad (15–20 años); se evitaba el nombre real, así que amigos y vecinos lo usaban. Yi Hwang: Gyeongho (景浩)." },
  hoT: { ko: "호(號) · 어른이 되어 스스로 짓는 이름", en: "Pen name (호)", ja: "号", zh: "号", fr: "Nom de plume", es: "Seudónimo" },
  ho: { ko: "사는 곳이나 좋아하는 것에서 따와 스스로 짓거나 받는 이름이에요. 이황의 호 '퇴계(退溪)'는 물러나 살던 시냇물 이름에서 왔어요. 죽은 뒤 나라에서 시호를 받기도 했어요(이황은 문순, 이이는 문성).", en: "Chosen or given, often after a place or a favourite thing. Yi Hwang's Toegye (退溪) came from the stream he retired to. Some later received a posthumous title from the state (Yi Hwang: Munsun; Yi I: Munseong).", ja: "住む所や好きなものから自ら付けたり贈られたりする名。李滉の「退渓」は隠棲した渓流の名から。死後に諡号を受けることも（李滉は文純、李珥は文成）。", zh: "取自居所或喜爱之物，自号或受赠。李滉号“退溪”，源自他退隐的溪流。死后或获赐谥号（李滉文纯，李珥文成）。", fr: "Choisi ou reçu, souvent d'après un lieu. Toegye (退溪) vient du ruisseau où Yi Hwang se retira.", es: "Elegido o recibido, a menudo por un lugar. Toegye (退溪) viene del arroyo donde se retiró Yi Hwang." },
  ladyT: { ko: "시집간 뒤 · 성으로 불리는 이름", en: "After marriage: called by surname", ja: "嫁いだ後：姓で呼ばれる", zh: "出嫁后：以姓相称", fr: "Après le mariage : appelée par le nom de famille", es: "Tras casarse: llamada por el apellido" },
  lady: { ko: "조선의 여성은 특별한 경우가 아니면 아명 말고는 따로 이름을 받지 못했고, 어른이 되면 성을 따 '○씨 부인'으로 불렸어요. 기록에도 이름 대신 성만 남은 경우가 많아요.", en: "Apart from special cases, Joseon women received no name beyond the childhood one; as adults they were called by surname, 'Madam ○'. Many appear in records by surname alone.", ja: "朝鮮の女性は特別な場合を除き幼名以外の名を持たず、大人になると姓で「○氏夫人」と呼ばれました。記録にも姓だけが残ることが多いです。", zh: "朝鲜女性除特殊情况外，乳名之外没有别的名字，成年后以姓称“○氏夫人”。记录中常常只留下姓氏。", fr: "Sauf exception, les femmes n'avaient pas d'autre nom que celui d'enfance ; adultes, on les appelait par leur nom de famille.", es: "Salvo excepciones, las mujeres no tenían más nombre que el de infancia; de adultas se las llamaba por el apellido." },
  dangT: { ko: "당호 · 드물게 갖는 이름", en: "Hall name (당호), rare", ja: "堂号（まれ）", zh: "堂号（少见）", fr: "Nom de demeure (rare)", es: "Nombre de casa (raro)" },
  dang: { ko: "신사임당의 '사임당(師任堂)'처럼, 글을 배운 일부 여성은 스스로 당호를 지어 쓰기도 했어요. '사임'은 주나라 문왕의 어머니 태임을 본받는다는 뜻이에요.", en: "Like Sin Saimdang's Saimdang (師任堂), some educated women took a hall name. Saim means 'following Taeim', mother of King Wen of Zhou.", ja: "申師任堂の「師任堂」のように、学問をした一部の女性は堂号を名乗りました。「師任」は周の文王の母・太任に倣う意。", zh: "如申师任堂的“师任堂”，部分读书女性自取堂号。“师任”意为效法周文王之母太任。", fr: "Comme Saimdang (師任堂), certaines femmes lettrées prenaient un nom de demeure.", es: "Como Saimdang (師任堂), algunas mujeres instruidas tomaban un nombre de casa." },
  orderTitle: { ko: "항렬은 오행상생 순서로", en: "Generations follow the Five Phases", ja: "行列は五行相生の順", zh: "行辈按五行相生", fr: "Les générations suivent les cinq phases", es: "Las generaciones siguen las cinco fases" },
  orderNote: { ko: "항렬은 오행 말고도 천간이나 숫자 순서를 따르기도 했어요. 여기 글자들은 그 기운이 든 글자를 예로 고른 것이고, 실제 어느 집안의 항렬표가 아니에요.", en: "Some families used the heavenly stems or numbers instead. These characters are examples containing each phase, not any real family's table.", ja: "五行のほか十干や数字の順もありました。ここの字は各要素を含む例で、実在の家の行列表ではありません。", zh: "也有按天干或数字排行的。这里的字只是含该元素的示例，并非任何家族的真实行辈表。", fr: "Certaines familles suivaient les tiges célestes ou des nombres ; ces caractères ne sont que des exemples.", es: "Algunas familias usaban los troncos celestes o números; estos caracteres son solo ejemplos." },
  me: { ko: "← 우리 세대", en: "← your generation", ja: "← 私の世代", zh: "← 我这一代", fr: "← votre génération", es: "← tu generación" },
  note: { ko: "이름 글자는 놀이용으로 고른 예시예요. 실제 본관이나 족보와는 관계없어요.", en: "The characters are game examples, unrelated to any real clan or genealogy.", ja: "名前の字は遊び用の例で、実在の本貫や族譜とは無関係です。", zh: "名字用字为游戏示例，与真实本贯或族谱无关。", fr: "Caractères choisis pour le jeu, sans lien avec un vrai clan.", es: "Caracteres de juego, sin relación con ningún clan real." },
  cardKicker: { ko: "조선 시대 내 이름", en: "My Joseon names", ja: "朝鮮時代の私の名前", zh: "我在朝鲜时代的名字", fr: "Mes noms de Joseon", es: "Mis nombres de Joseon" },
  badge: { ko: "조선 이름", en: "Joseon names", ja: "朝鮮の名", zh: "朝鲜名字", fr: "Noms de Joseon", es: "Nombres de Joseon" },
  src1: { ko: "한국민족문화대백과사전: 이름", en: "Encyclopedia of Korean Culture: names", ja: "韓国民族文化大百科：名前", zh: "韩国民族文化大百科：名字", fr: "Encyclopédie de la culture coréenne : noms", es: "Enciclopedia de la cultura coreana: nombres" },
  src2: { ko: "한국민족문화대백과사전: 항렬", en: "Encyclopedia of Korean Culture: hangnyeol", ja: "韓国民族文化大百科：行列", zh: "韩国民族文化大百科：行列", fr: "Encyclopédie : hangnyeol", es: "Enciclopedia: hangnyeol" },
  src3: { ko: "한국민족문화대백과사전: 이황", en: "Encyclopedia of Korean Culture: Yi Hwang", ja: "韓国民族文化大百科：李滉", zh: "韩国民族文化大百科：李滉", fr: "Encyclopédie : Yi Hwang", es: "Enciclopedia: Yi Hwang" },
  src4: { ko: "한국민족문화대백과사전: 이이", en: "Encyclopedia of Korean Culture: Yi I", ja: "韓国民族文化大百科：李珥", zh: "韩国民族文化大百科：李珥", fr: "Encyclopédie : Yi I", es: "Enciclopedia: Yi I" },
} satisfies Record<string, Six>;

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

function Stage({ title, big, small, body }: { title: string; big: string; small?: string; body: string }) {
  return (
    <Panel label={title}>
      <p className="text-3xl font-black text-foreground">
        {big}
        {small && <span className="ml-2 text-lg font-bold text-muted-foreground">{small}</span>}
      </p>
      <p className="text-sm leading-relaxed">{body}</p>
    </Panel>
  );
}

export default function JoseonNames({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const [mode, setMode] = useState<Mode>("birthday");
  const [sex, setSex] = useState<Sex>("m");
  const [names, setNames] = useState<Names | null>(null);
  const [round, setRound] = useState(0);
  const funnel = useFunnel(EP);
  const warp = useWarp();

  useEffect(() => {
    const shared = parseNames(window.location.search);
    if (shared) {
      setNames(shared);
      setSex(shared.sex);
    }
  }, []);

  function draw(rand: () => number, how: string) {
    const next = makeNames(sex, rand);
    funnel(how);
    warp.start(() => {
      setNames(next);
      setRound((r) => r + 1);
      setShareQuery(formatNames(next));
      stampEpisode(EP);
    });
  }

  const r = names ? namesOf(names) : null;
  const isF = names?.sex === "f";

  return (
    <div className="space-y-6">
      {warp.warping && <TimeWarp from={new Date().getFullYear()} to={1750} l={l} onDone={warp.finish} />}
      <div className="grid grid-cols-2 gap-2" role="group">
        <Button variant={sex === "m" ? "default" : "outline"} aria-pressed={sex === "m"} onClick={() => setSex("m")}>{pick(C.male, l)}</Button>
        <Button variant={sex === "f" ? "default" : "outline"} aria-pressed={sex === "f"} onClick={() => setSex("f")}>{pick(C.female, l)}</Button>
      </div>
      <ModeTabs3 mode={mode} onMode={setMode} l={l} modes={["birthday", "random"]} />
      {mode === "birthday" ? (
        <BirthdayPicker l={l} cta={pick(C.draw, l)} onSubmit={(b) => draw(birthdayRandom(EP, b), "birthday")} />
      ) : (
        <Button size="lg" className="w-full" onClick={() => draw(Math.random, "random")}>
          {pick(names ? C.again : C.draw, l)}
        </Button>
      )}

      {names && r && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          <section className="rounded-3xl border border-border bg-card p-6 text-center shadow-md">
            <p className="text-sm font-bold text-muted-foreground">{pick(C.heroKicker, l)}</p>
            <p className="mt-3 text-4xl font-black text-primary">{isF ? r.child : `${r.formal.hangul}`}</p>
            {!isF && <p className="mt-1 text-2xl font-bold text-foreground" lang="ko-Hani">{r.formal.hanja}</p>}
            <p className="mt-3 text-sm font-bold text-muted-foreground">
              {isF ? `${r.child} → ${r.lady} → ${r.ho.hangul.slice(0, 1)}당` : `${r.child} → ${r.formal.hangul} → ${r.ja.hangul} → ${r.ho.hangul}`}
            </p>
          </section>

          <Stage title={pick(C.childT, l)} big={r.child} body={pick(C.child, l)} />
          {isF ? (
            <>
              <Stage title={pick(C.ladyT, l)} big={r.lady} body={pick(C.lady, l)} />
              <Stage title={pick(C.dangT, l)} big={`${r.ho.hangul.slice(0, 1)}당`} small={`${r.ho.hanja.slice(0, 1)}堂`} body={pick(C.dang, l)} />
            </>
          ) : (
            <>
              <Stage
                title={pick(C.formalT, l)}
                big={r.formal.hangul}
                small={r.formal.hanja}
                body={fill(pick(C.formal, l), { gen: r.gen.hanja, genK: r.gen.hangul, el: pick(r.gen.element.name, l), pos: pick(genFirst(names) ? C.first : C.second, l), next: pick(r.childNext.name, l) })}
              />
              <Stage title={pick(C.jaT, l)} big={r.ja.hangul} small={r.ja.hanja} body={pick(C.ja, l)} />
              <Stage title={pick(C.hoT, l)} big={r.ho.hangul} small={r.ho.hanja} body={pick(C.ho, l)} />
              <Panel label={pick(C.orderTitle, l)}>
                <ul className="space-y-1 text-sm">
                  {ELEMENTS.map((e, k) => (
                    <li key={e.id} className={k === names.el ? "font-bold text-primary" : "text-muted-foreground"}>
                      {pick(e.name, l)}: <span lang="ko-Hani">{e.chars.map((c) => c[0]).join(" ")}</span>
                      {k === names.el && ` ${pick(C.me, l)}`}
                    </li>
                  ))}
                </ul>
                <p className="pt-2 text-xs text-muted-foreground">{pick(C.orderNote, l)}</p>
              </Panel>
            </>
          )}
          <p className="text-xs text-muted-foreground">{pick(C.note, l)}</p>

          <Sources
            l={l}
            items={[
              { label: pick(C.src1, l), url: "https://encykorea.aks.ac.kr/Article/E0044126" },
              { label: pick(C.src2, l), url: "https://encykorea.aks.ac.kr/Article/E0062386" },
              { label: pick(C.src3, l), url: "https://encykorea.aks.ac.kr/Article/E0046626" },
              { label: pick(C.src4, l), url: "https://encykorea.aks.ac.kr/Article/E0045546" },
            ]}
          />

          <SaveCard
            l={l}
            testId={EP}
            filename={`oiyo-joseon-names-${names.sex}`}
            spec={{
              kicker: pick(C.cardKicker, l),
              title: isF ? r.lady : `${r.formal.hangul} ${r.formal.hanja}`,
              subtitle: isF ? `${r.child} · ${r.ho.hangul.slice(0, 1)}당` : `${r.child} · 字 ${r.ja.hanja} · 號 ${r.ho.hanja}`,
              badge: pick(C.badge, l),
              lines: isF ? [pick(C.ladyT, l)] : [`${pick(r.gen.element.name, l)} · ${r.gen.hanja}`],
              footer: "oiyo.net · 朝鮮",
              accent: "#2f4a3a",
            }}
          />
          <CopyLink l={l} testId={EP} />
          <SeriesNext l={l} locale={locale} current={EP} round={round} />
        </div>
      )}
    </div>
  );
}
