/**
 * "조선통신사 일행 속 나" — the 11th mission (계미 1763–64, 정사 조엄), 477 people.
 *
 * Sources: 정은주, 「계미(1763)통신사행의 화원 활동 연구」 (477명, 격군 228, names, dates, 332일, 오사카 잔류 106,
 * 최천종 피살 1764.4.7, 부사선 파손 1763.12.3, 고구마 종자); 우리역사넷 「통신사행의 구성과 노정」 (typical
 * staff: 역관 20, 군관 17, 사문사 4, 의원 3, 사자관·화원 4, 자제군관 5, 노자 50여, 배 6척, 왕복 11,470리).
 * Only 격군 is the real 1763 count; the other roles follow the typical make-up, and the remainder (band, honour
 * guard, pages, riders, grooms, sailors' officers…) fills the 477.
 */

export type Six = { ko: string; en: string; ja: string; zh: string; fr: string; es: string };

export const TOTAL = 477;

export type RoleId = "samsa" | "yeokgwan" | "gungwan" | "samunsa" | "uiwon" | "hwawon" | "jaje" | "noja" | "gyeokgun" | "etc";
export type Role = { id: RoleId; n: number; name: Six; does: Six; edo: boolean; who?: string };

const r = (id: RoleId, n: number, edo: boolean, name: Six, does: Six, who?: string): Role => ({ id, n, edo, name, does, who });

const BASE: Role[] = [
  r("samsa", 3, true, { ko: "삼사(정사·부사·종사관)", en: "One of the three envoys", ja: "三使（正使・副使・従事官）", zh: "三使（正使·副使·从事官）", fr: "L'un des trois envoyés", es: "Uno de los tres enviados" },
    { ko: "국서를 받들고 일행 전체를 이끌어요. 쇼군 앞에서 국서를 전하는 게 가장 큰 일이에요.", en: "You carry the king's letter and lead the mission; presenting it to the shogun is the main event.", ja: "国書を奉じて一行を率います。将軍に国書を渡すのが最大の任務です。", zh: "奉国书率领全团，向将军递交国书是最大的任务。", fr: "Vous portez la lettre du roi et menez la mission jusqu'au shogun.", es: "Llevas la carta del rey y guías la misión hasta el shogún." }, "조엄·이인배·김상익"),
  r("yeokgwan", 20, true, { ko: "역관(통역관)", en: "Interpreter", ja: "訳官（通訳）", zh: "译官（翻译）", fr: "Interprète", es: "Intérprete" },
    { ko: "일본어로 말을 잇고 문서를 옮겨요. 쓰시마 쪽 통역과 늘 붙어 다녀요.", en: "You bridge Korean and Japanese and handle documents, side by side with Tsushima's interpreters.", ja: "日本語で言葉をつなぎ文書を訳します。対馬の通詞と常に行動します。", zh: "负责朝日语口译和文书翻译，与对马通事形影不离。", fr: "Vous faites le lien entre coréen et japonais, avec les interprètes de Tsushima.", es: "Haces de puente entre coreano y japonés, junto a los intérpretes de Tsushima." }),
  r("gungwan", 17, true, { ko: "군관", en: "Military officer", ja: "軍官", zh: "军官", fr: "Officier", es: "Oficial militar" },
    { ko: "삼사를 호위하고 일행의 질서를 잡아요.", en: "You guard the envoys and keep order in the party.", ja: "三使を護衛し一行の秩序を保ちます。", zh: "护卫三使，维持队伍秩序。", fr: "Vous protégez les envoyés et maintenez l'ordre.", es: "Proteges a los enviados y mantienes el orden." }),
  r("samunsa", 4, true, { ko: "제술관·서기(사문사)", en: "Official writer or secretary", ja: "製述官・書記", zh: "制述官·书记", fr: "Lettré officiel", es: "Letrado oficial" },
    { ko: "일본 문인들과 한시를 주고받으며 글솜씨로 나라의 체면을 세워요.", en: "You trade Chinese-style poems with Japanese scholars: the mission's literary face.", ja: "日本の文人と漢詩を応酬し、文の力で国の面目を保ちます。", zh: "与日本文人唱和汉诗，以文采维护国家体面。", fr: "Vous échangez des poèmes avec les lettrés japonais.", es: "Intercambias poemas con los letrados japoneses." }, "남옥·성대중·원중거·김인겸"),
  r("uiwon", 3, true, { ko: "의원", en: "Physician", ja: "医員", zh: "医员", fr: "Médecin", es: "Médico" },
    { ko: "1년 가까운 여정 동안 일행 400여 명의 병을 돌봐요.", en: "You look after the health of some 400 people for most of a year.", ja: "1年近い旅で一行400余人の病を診ます。", zh: "在近一年的旅途中照料四百余人的健康。", fr: "Vous veillez sur la santé de 400 personnes pendant près d'un an.", es: "Cuidas la salud de unas 400 personas durante casi un año." }),
  r("hwawon", 4, true, { ko: "화원·사자관", en: "Painter or calligrapher", ja: "画員・写字官", zh: "画员·写字官", fr: "Peintre ou calligraphe", es: "Pintor o calígrafo" },
    { ko: "가는 길의 풍경과 행사를 그리고, 국서와 글씨를 맡아요. 1763년엔 김유성이 그림을, 변박은 배를 몰며 그림도 그렸어요.", en: "You paint the route and ceremonies or write the formal script. In 1763 Kim Yu-seong painted, and Byeon Bak drew while captaining a ship.", ja: "道中の風景や行事を描き、国書の字を書きます。1763年は金有声が画を担当しました。", zh: "描绘沿途风景和仪式，或书写国书。1763年由金有声作画。", fr: "Vous peignez le voyage ou calligraphiez les documents officiels.", es: "Pintas el viaje o caligrafías los documentos oficiales." }, "김유성·변박·홍성원·이언우"),
  r("jaje", 5, true, { ko: "자제군관", en: "Envoy's young relative", ja: "子弟軍官", zh: "子弟军官", fr: "Jeune parent d'un envoyé", es: "Joven pariente de un enviado" },
    { ko: "삼사의 아들·조카 같은 젊은이로, 견문을 넓히러 따라가요.", en: "A son or nephew of an envoy, along to see the world.", ja: "三使の子や甥。見聞を広げるために同行します。", zh: "三使的子侄，随行增长见闻。", fr: "Fils ou neveu d'un envoyé, venu voir le monde.", es: "Hijo o sobrino de un enviado, que viaja para conocer mundo." }),
  r("noja", 50, true, { ko: "노자(하인)", en: "Servant", ja: "奴子（下僕）", zh: "奴子（仆人）", fr: "Serviteur", es: "Criado" },
    { ko: "짐을 지고 시중을 들어요. 기록에 이름은 잘 남지 않지만 일행이 굴러가게 하는 사람들이에요.", en: "You carry, fetch and serve. Rarely named, but the mission runs on you.", ja: "荷を担ぎ世話をします。名は残りにくいが一行を支える人々です。", zh: "背行李、做杂务。名字少有记载，却是使团运转的支柱。", fr: "Vous portez et servez ; rarement nommé, mais indispensable.", es: "Cargas y sirves; rara vez nombrado, pero imprescindible." }),
  r("gyeokgun", 228, false, { ko: "격군(노 젓는 뱃사람)", en: "Oarsman", ja: "格軍（漕ぎ手）", zh: "格军（桨手）", fr: "Rameur", es: "Remero" },
    { ko: "배 여섯 척을 저어 부산에서 쓰시마를 거쳐 오사카까지 가요. 배와 함께 오사카에 남아 일행이 에도에서 돌아오길 기다려요.", en: "You row the six ships from Busan via Tsushima to Osaka, then wait there with the ships while the party goes on to Edo.", ja: "6隻の船を漕いで釜山から対馬を経て大坂へ。船とともに大坂に残り、一行の帰りを待ちます。", zh: "划着六艘船从釜山经对马到大坂，随船留在大坂等使团从江户归来。", fr: "Vous ramez de Busan à Osaka, puis attendez avec les navires le retour d'Edo.", es: "Remas de Busan a Osaka y esperas allí con los barcos el regreso de Edo." }),
];

const used = BASE.reduce((s, x) => s + x.n, 0);
export const ROLES: Role[] = [
  ...BASE,
  r("etc", TOTAL - used, true, { ko: "악대·의장대·소동·마상재 등", en: "Band, honour guard, page or trick rider", ja: "楽隊・儀仗・小童・馬上才など", zh: "乐队·仪仗·小童·马上才等", fr: "Musicien, garde d'honneur, page ou cavalier acrobate", es: "Músico, guardia de honor, paje o jinete acróbata" },
    { ko: "악대와 깃발, 심부름하는 소동, 말 위 묘기를 부리는 마상재까지. 마상재는 1636년 쇼군의 요청으로 에도에서 처음 공연했어요.", en: "Musicians, flag carriers, page boys and trick riders; the riders first performed in Edo in 1636 at the shogun's request.", ja: "楽隊や旗、小童、馬上で曲芸をする馬上才。馬上才は1636年に将軍の求めで江戸で初めて演じました。", zh: "乐手、旗手、小童和马上才。马上才1636年应将军之请首次在江户表演。", fr: "Musiciens, porte-drapeaux, pages et acrobates à cheval, appelés à Edo dès 1636 par le shogun.", es: "Músicos, abanderados, pajes y jinetes acróbatas, llamados a Edo en 1636 por el shogún." }),
];

export const roleById = (id: string) => ROLES.find((x) => x.id === id) ?? null;
export const oneIn = (x: Role) => Math.round(TOTAL / x.n);

export function drawRole(rand: () => number = Math.random): Role {
  let k = Math.floor(rand() * TOTAL);
  for (const x of ROLES) {
    if (k < x.n) return x;
    k -= x.n;
  }
  return ROLES[ROLES.length - 1];
}

export const FACTS = { days: 332, li: 11470, ships: 6, missions: 12, leftOsaka: 106 } as const;

export function formatTongsinsa(id: RoleId): string {
  return new URLSearchParams({ r: id }).toString();
}

export function parseTongsinsa(search: string): Role | null {
  const id = new URLSearchParams(search).get("r");
  return id ? roleById(id) : null;
}
