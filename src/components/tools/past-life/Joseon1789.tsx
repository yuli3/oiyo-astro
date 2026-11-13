import { useEffect, useState } from "react";
import { localePath, type Locale } from "../../../i18n";
import { birthdayRandom } from "../../../lib/past-life-1426";
import {
  HEIGHT_CM, SURNAMES, YANGBAN_TREND, ageFromBirthday, compare1789, draw1789, format1789, isChild, isWidowJob, jobOf,
  oneIn1789, parse1789, registerLine, registerName, type Life1789, type Sex, type Status,
} from "../../../lib/joseon-1789";
import { Button } from "../../ui/button";
import { CopyLink, Panel, Sources, numberFormat, oneInText, pick, setShareQuery, toL, useFunnel, type L, type Six } from "./shared";
import { BirthdayPicker, FriendBanner, FriendCompare, ModeTabs3, RarityBadge, SaveCard, SeriesNext, TimeWarp, isOwn, rarityLabel, rememberOwn, stampEpisode, useWarp, type Mode } from "./timeslip";

const EP = "joseon-1789" as const;

const SRC = {
  status: { label: "매일신문 2004 「대구 호적 신분 구성」", url: "https://www.imaeil.com/page/view/2004031709351299743" },
  nobi: { label: "한국경제 김재호 2014 「노비」", url: "https://sgsg.hankyung.com/article/2014060504341" },
  women: { label: "「17~19세기 호적대장의 女性主戶」", url: "https://www.x-mol.com/paperRedirect/1356861838544191488" },
  height: { label: "한국경제 2025-06-24 (서울대 의대 유골 116구)", url: "https://www.hankyung.com/article/202506244916Y" },
  tax: { label: "한국민족문화대백과사전 「균역법」", url: "https://encykorea.aks.ac.kr/Article/E0007303" },
};

type FC<T extends string> = Record<T, Six>;

const STATUS: FC<Status> = {
  yangban: { ko: "양반", en: "Yangban (gentry)", ja: "両班", zh: "两班", fr: "Yangban (lettrés)", es: "Yangban (nobleza letrada)" },
  sangmin: { ko: "상민(양인)", en: "Commoner (sangmin)", ja: "常民（良人）", zh: "常民（良人）", fr: "Roturier (sangmin)", es: "Plebeyo (sangmin)" },
  nobi: { ko: "노비", en: "Slave (nobi)", ja: "奴婢", zh: "奴婢", fr: "Esclave (nobi)", es: "Esclavo (nobi)" },
};

const JOB_NOTE: Record<string, Six> = {
  yuhak: { ko: "벼슬 없이 학문을 닦는 양반. 18세기 호적에서 가장 흔한 양반 직역이에요.", en: "A yangban who studies without office, the commonest gentry title in the registers.", ja: "官職なしに学問を修める両班。戸籍で最も多い両班の職役です。", zh: "无官职、潜心读书的两班，户籍中最常见的两班职役。", fr: "Un lettré sans charge, le titre de yangban le plus courant des registres.", es: "Un letrado sin cargo, el título de yangban más común en los registros." },
  saengwon: { ko: "소과(생원시)에 합격한 선비. 성균관에 들어갈 자격이 있어요.", en: "Passed the lower civil exam; eligible for the national academy.", ja: "小科（生員試）に合格した士。成均館に入る資格があります。", zh: "考中小科（生员试）的士人，有资格进成均馆。", fr: "Reçu au petit examen, admissible à l'académie nationale.", es: "Aprobó el examen menor; puede entrar en la academia nacional." },
  chambong: { ko: "종9품 참봉 벼슬을 지낸 사람이에요.", en: "Once held the lowest court post, chambong (9th grade).", ja: "従九品の参奉を務めたことがある人です。", zh: "曾任从九品参奉。", fr: "A occupé le plus bas poste de cour (9e grade).", es: "Ocupó el cargo más bajo de la corte (grado 9)." },
  cheo: { ko: "호주의 아내로 호적에 올라요.", en: "Listed as the household head's wife.", ja: "戸主の妻として戸籍に載ります。", zh: "以户主之妻登记在户籍上。", fr: "Inscrite comme épouse du chef de foyer.", es: "Inscrita como esposa del cabeza de familia." },
  gwabu: { ko: "남편을 여읜 양반 여성이 집의 호주가 됐어요.", en: "A widowed yangban woman who heads the household.", ja: "夫を亡くした両班の女性が戸主になりました。", zh: "丧夫的两班女性成了户主。", fr: "Veuve yangban devenue chef de foyer.", es: "Viuda yangban que encabeza el hogar." },
  gwanyeo: { ko: "남편을 여읜 평민 여성이 집의 호주가 됐어요.", en: "A widowed commoner woman who heads the household.", ja: "夫を亡くした平民の女性が戸主になりました。", zh: "丧夫的平民女性成了户主。", fr: "Veuve roturière devenue chef de foyer.", es: "Viuda plebeya que encabeza el hogar." },
  songogun: { ko: "농사를 지으며 철마다 모여 훈련하는 지방 군사예요.", en: "A local soldier who farms and drills each season.", ja: "農作業をしながら季節ごとに訓練する地方の兵です。", zh: "一边务农一边按季集训的地方兵。", fr: "Soldat local qui cultive et s'entraîne à chaque saison.", es: "Soldado local que cultiva y entrena cada temporada." },
  bo: { ko: "금위영 군사를 뒷바라지하려 군포를 내는 보인(保人)이에요.", en: "A 'support man' who pays cloth to keep a capital-guard soldier.", ja: "禁衛営の兵を支えるため軍布を納める保人です。", zh: "为禁卫营士兵出军布的保人。", fr: "Un « soutien » qui paie en toile l'entretien d'un garde.", es: "Un «apoyo» que paga tela para mantener a un guardia." },
  sugun: { ko: "바다를 지키는 수군. 힘든 역으로 꼽혔어요.", en: "A navy man, counted among the hardest duties.", ja: "海を守る水軍。つらい役とされました。", zh: "守海的水军，被视为苦役。", fr: "Marin, l'une des corvées les plus dures.", es: "Marinero, uno de los servicios más duros." },
  gyosaeng: { ko: "고을 향교에서 공부하는 학생이에요.", en: "A student at the county Confucian school.", ja: "郷校で学ぶ学生です。", zh: "在乡校读书的学生。", fr: "Élève de l'école confucéenne du district.", es: "Alumno de la escuela confuciana del distrito." },
  eommu: { ko: "무과를 준비하며 무예를 익히는 사람이에요.", en: "Trains in arms for the military exam.", ja: "武科に備えて武芸を磨く人です。", zh: "习武备考武科的人。", fr: "S'entraîne pour l'examen militaire.", es: "Se entrena para el examen militar." },
  hyangni: { ko: "고을 관아에서 문서와 세금을 맡는 아전이에요.", en: "A county clerk who keeps the papers and taxes.", ja: "郡の役所で文書と税を扱う衙前です。", zh: "在郡衙管文书与税收的胥吏。", fr: "Greffier du district, chargé des écrits et des impôts.", es: "Escribano del distrito, a cargo de papeles e impuestos." },
  yajang: { ko: "쇠를 달궈 농기구를 만드는 대장장이예요.", en: "A blacksmith who forges farm tools.", ja: "鉄を打って農具を作る鍛冶屋です。", zh: "打造农具的铁匠。", fr: "Forgeron qui fait les outils agricoles.", es: "Herrero que forja aperos." },
  yeokri: { ko: "역참에서 말과 공문 전달을 맡아요.", en: "Runs horses and dispatches at a post station.", ja: "駅で馬と公文書の伝達を担います。", zh: "在驿站管马匹与公文传递。", fr: "Gère chevaux et dépêches au relais de poste.", es: "Lleva caballos y despachos en la posta." },
  sagijang: { ko: "흙을 빚어 그릇을 굽는 장인이에요.", en: "A potter who throws and fires bowls.", ja: "土をこねて器を焼く職人です。", zh: "揉泥烧碗的工匠。", fr: "Potier qui façonne et cuit les bols.", es: "Alfarero que modela y cuece cuencos." },
  sano: { ko: "개인에게 딸린 남자 종이에요.", en: "A male slave owned by a family.", ja: "個人に属する男の奴です。", zh: "属于私人的男奴。", fr: "Esclave homme appartenant à une famille.", es: "Esclavo varón de una familia." },
  gwanno: { ko: "관청에 딸린 남자 종이에요.", en: "A male slave of a government office.", ja: "役所に属する男の奴です。", zh: "属于官府的男奴。", fr: "Esclave homme d'un bureau officiel.", es: "Esclavo varón de una oficina pública." },
  sabi: { ko: "개인에게 딸린 여자 종이에요.", en: "A female slave owned by a family.", ja: "個人に属する女の婢です。", zh: "属于私人的女婢。", fr: "Esclave femme appartenant à une famille.", es: "Esclava de una familia." },
  gwanbi: { ko: "관청에 딸린 여자 종이에요.", en: "A female slave of a government office.", ja: "役所に属する女の婢です。", zh: "属于官府的女婢。", fr: "Esclave femme d'un bureau officiel.", es: "Esclava de una oficina pública." },
};

const JOB_NAME: Record<string, Six> = {
  yuhak: { ko: "유학(幼學)", en: "Yuhak (scholar)", ja: "幼学", zh: "幼学", fr: "Yuhak (lettré)", es: "Yuhak (letrado)" },
  saengwon: { ko: "생원(生員)", en: "Saengwon (licentiate)", ja: "生員", zh: "生员", fr: "Saengwon (licencié)", es: "Saengwon (licenciado)" },
  chambong: { ko: "전 참봉(前參奉)", en: "Former chambong", ja: "前参奉", zh: "前参奉", fr: "Ancien chambong", es: "Exchambong" },
  cheo: { ko: "아내(妻)", en: "Wife", ja: "妻", zh: "妻", fr: "Épouse", es: "Esposa" },
  gwabu: { ko: "과부 호주(寡婦)", en: "Widow, head of house", ja: "寡婦の戸主", zh: "寡妇户主", fr: "Veuve, chef de foyer", es: "Viuda, cabeza de hogar" },
  gwanyeo: { ko: "과녀 호주(寡女)", en: "Widow, head of house", ja: "寡女の戸主", zh: "寡女户主", fr: "Veuve, chef de foyer", es: "Viuda, cabeza de hogar" },
  songogun: { ko: "속오군(束伍軍)", en: "Local militia", ja: "束伍軍", zh: "束伍军", fr: "Milice locale", es: "Milicia local" },
  bo: { ko: "금위보(禁衛保)", en: "Guard support man", ja: "禁衛保", zh: "禁卫保", fr: "Soutien de la garde", es: "Apoyo de la guardia" },
  sugun: { ko: "수군(水軍)", en: "Navy man", ja: "水軍", zh: "水军", fr: "Marin", es: "Marinero" },
  gyosaeng: { ko: "교생(校生)", en: "County-school student", ja: "校生", zh: "校生", fr: "Élève d'école de district", es: "Alumno de escuela de distrito" },
  eommu: { ko: "업무(業武)", en: "Martial trainee", ja: "業武", zh: "业武", fr: "Apprenti d'armes", es: "Aprendiz de armas" },
  hyangni: { ko: "향리(鄕吏)", en: "County clerk", ja: "郷吏", zh: "乡吏", fr: "Greffier de district", es: "Escribano de distrito" },
  yajang: { ko: "야장(冶匠)", en: "Blacksmith", ja: "冶匠", zh: "冶匠", fr: "Forgeron", es: "Herrero" },
  yeokri: { ko: "역리(驛吏)", en: "Post-station clerk", ja: "駅吏", zh: "驿吏", fr: "Commis de relais", es: "Empleado de posta" },
  sagijang: { ko: "사기장(沙器匠)", en: "Potter", ja: "沙器匠", zh: "沙器匠", fr: "Potier", es: "Alfarero" },
  sano: { ko: "사노(私奴)", en: "Private slave (man)", ja: "私奴", zh: "私奴", fr: "Esclave privé", es: "Esclavo privado" },
  gwanno: { ko: "관노(官奴)", en: "Government slave (man)", ja: "官奴", zh: "官奴", fr: "Esclave d'État", es: "Esclavo del Estado" },
  sabi: { ko: "사비(私婢)", en: "Private slave (woman)", ja: "私婢", zh: "私婢", fr: "Esclave privée", es: "Esclava privada" },
  gwanbi: { ko: "관비(官婢)", en: "Government slave (woman)", ja: "官婢", zh: "官婢", fr: "Esclave d'État (femme)", es: "Esclava del Estado" },
};

const HOUSE: FC<Status> = {
  yangban: { ko: "사랑채와 안채가 나뉜 기와집", en: "A tiled house with separate men's and women's quarters", ja: "舎廊棟と母屋に分かれた瓦屋根の家", zh: "分舍廊与内院的瓦房", fr: "Maison à toit de tuiles, quartiers des hommes et des femmes séparés", es: "Casa de tejas con alas de hombres y mujeres separadas" },
  sangmin: { ko: "방 두세 칸짜리 초가집", en: "A two- or three-room thatched house", ja: "二、三間の藁葺きの家", zh: "两三间的草房", fr: "Chaumière de deux ou trois pièces", es: "Casa de paja de dos o tres cuartos" },
  nobi: { ko: "주인집 행랑채 한 칸", en: "One room in the master's gate quarters", ja: "主人の家の行廊の一間", zh: "主人家廊房的一间", fr: "Une pièce dans les communs du maître", es: "Un cuarto en las dependencias del amo" },
};

type Day = [Six, Six, Six];
const DAY: Record<Status, Record<Sex, Day>> = {
  yangban: {
    m: [
      { ko: "닭이 울면 일어나 사당에 문안을 올리고, 사랑채에서 『논어』를 소리 내어 읽어요.", en: "Up at cockcrow, you bow at the family shrine and read the Analects aloud.", ja: "鶏が鳴くと起きて祠堂に挨拶し、舎廊で『論語』を声に出して読みます。", zh: "鸡鸣即起，到祠堂问安，在舍廊朗读《论语》。", fr: "Levé au chant du coq, vous saluez l'autel des ancêtres et lisez les Entretiens à voix haute.", es: "Al canto del gallo saludas el altar familiar y lees las Analectas en voz alta." },
      { ko: "찾아온 선비와 시를 주고받고, 노비가 가져온 소작료 장부를 살펴요.", en: "You trade poems with a visiting scholar and check the rent ledger a servant brings.", ja: "訪ねてきた士と詩を交わし、奴婢が持ってきた小作料の帳簿を確かめます。", zh: "与来访的士人唱和诗作，查看奴婢送来的佃租账簿。", fr: "Vous échangez des poèmes avec un lettré et vérifiez le registre des fermages.", es: "Intercambias poemas con un letrado y revisas el libro de rentas." },
      { ko: "해가 지면 등잔 아래 먹을 갈아 서울 친척에게 편지를 써요.", en: "At dusk you grind ink and write to relatives in the capital.", ja: "日が暮れると灯火の下で墨をすり、都の親戚に手紙を書きます。", zh: "日落后在灯下研墨，给京城亲戚写信。", fr: "Le soir, vous broyez l'encre et écrivez à la famille de la capitale.", es: "Al anochecer mueles tinta y escribes a parientes de la capital." },
    ],
    f: [
      { ko: "새벽에 일어나 시부모님께 문안을 드리고, 여종들에게 그날 할 일을 나눠요.", en: "At dawn you greet your parents-in-law and give the maids their tasks.", ja: "明け方に義父母へ挨拶し、婢たちにその日の仕事を割り振ります。", zh: "清晨向公婆问安，给婢女们分派当天的活。", fr: "À l'aube, vous saluez vos beaux-parents et répartissez les tâches des servantes.", es: "Al alba saludas a tus suegros y repartes las tareas de las criadas." },
      { ko: "안채에서 곳간 열쇠를 챙기고, 다가오는 제사 음식을 준비해요.", en: "In the inner quarters you keep the storeroom keys and prepare the next ancestral rite.", ja: "母屋で蔵の鍵を預かり、近づく祭祀の料理を準備します。", zh: "在内院掌管库房钥匙，准备即将到来的祭祀饭菜。", fr: "Dans les quartiers intérieurs, vous gardez les clés et préparez le prochain rite.", es: "En el ala interior guardas las llaves y preparas el próximo rito." },
      { ko: "밤에는 호롱불 아래 한글 편지를 써요. 바깥에 나갈 땐 쓰개치마로 얼굴을 가려요.", en: "At night you write letters in hangul. Outside, a veil covers your face.", ja: "夜は灯りの下でハングルの手紙を書きます。外に出るときは被り物で顔を隠します。", zh: "夜里在灯下用谚文写信。出门时要用披裙遮脸。", fr: "Le soir, vous écrivez en hangul. Dehors, un voile couvre votre visage.", es: "De noche escribes cartas en hangul. Fuera, un velo te cubre el rostro." },
    ],
  },
  sangmin: {
    m: [
      { ko: "해 뜨기 전에 일어나 소죽을 쑤고, 보리밥으로 아침을 먹어요.", en: "Before sunrise you boil the ox's feed and eat barley rice.", ja: "日の出前に起きて牛の餌を煮て、麦飯で朝食をとります。", zh: "天亮前起来煮牛食，吃大麦饭当早饭。", fr: "Avant l'aube, vous faites cuire la pâtée du bœuf et mangez de l'orge.", es: "Antes del alba cueces el pienso del buey y comes cebada." },
      { ko: "낮에는 맡은 일을 하고, 닷새마다 서는 장날엔 장터에 나가요.", en: "By day you do your work, and every fifth day you go to the market.", ja: "昼は自分の仕事をして、五日ごとの市の日には市場へ出かけます。", zh: "白天干自己的活，每五天的集日去赶集。", fr: "Le jour, vous travaillez ; tous les cinq jours, vous allez au marché.", es: "De día trabajas y cada cinco días vas al mercado." },
      { ko: "저녁엔 마당에서 새끼를 꼬며 올해 낼 군포 걱정을 해요.", en: "In the evening you twist straw rope and worry about this year's cloth tax.", ja: "夕方は庭で縄をないながら、今年の軍布を心配します。", zh: "傍晚在院子里搓草绳，发愁今年要交的军布。", fr: "Le soir, vous tressez de la paille en pensant à l'impôt en toile.", es: "Por la tarde trenzas paja pensando en el impuesto en tela." },
    ],
    f: [
      { ko: "새벽 우물가에서 물을 길어 오고, 아궁이에 불을 지펴 밥을 지어요.", en: "At dawn you draw water from the well and light the stove for rice.", ja: "明け方に井戸で水を汲み、かまどに火を起こしてご飯を炊きます。", zh: "清晨到井边打水，生火做饭。", fr: "À l'aube, vous tirez l'eau du puits et allumez le foyer.", es: "Al alba sacas agua del pozo y enciendes el fogón." },
      { ko: "낮에는 밭일을 거들고 베틀에 앉아 무명을 짜요. 그 베가 군포가 되기도 해요.", en: "By day you help in the field and weave cotton. That cloth may pay the household's tax.", ja: "昼は畑仕事を手伝い、機織りで木綿を織ります。その布が軍布になることも。", zh: "白天帮着干农活，坐上织布机织棉布。那布也可能拿去交军布。", fr: "Le jour, vous aidez aux champs et tissez le coton qui paiera peut-être l'impôt.", es: "De día ayudas en el campo y tejes algodón; esa tela puede pagar el impuesto." },
      { ko: "밤에는 다듬이질 소리가 마을에 울려요.", en: "At night the tap of laundry bats echoes through the village.", ja: "夜は砧を打つ音が村に響きます。", zh: "夜里，捣衣声在村中回响。", fr: "La nuit, le battoir à linge résonne dans le village.", es: "De noche resuena en la aldea el golpe del batidor de ropa." },
    ],
  },
  nobi: {
    m: [
      { ko: "주인집보다 먼저 일어나 마당을 쓸고 군불을 때요.", en: "You rise before the master's house to sweep the yard and stoke the floor fire.", ja: "主人の家より先に起きて庭を掃き、オンドルの火を焚きます。", zh: "比主人家起得早，扫院子、烧炕。", fr: "Levé avant les maîtres, vous balayez la cour et chauffez le sol.", es: "Te levantas antes que los amos, barres el patio y avivas el fuego del suelo." },
      { ko: "낮에는 주인의 논밭을 갈거나, 편지와 짐을 들고 다른 고을까지 심부름을 가요.", en: "By day you plough the master's land or carry letters to the next county.", ja: "昼は主人の田畑を耕すか、手紙や荷物を持って隣の郡まで使いに行きます。", zh: "白天给主人耕田，或带着信和货跑到别的郡去。", fr: "Le jour, vous labourez la terre du maître ou portez ses lettres au district voisin.", es: "De día aras la tierra del amo o llevas sus cartas al distrito vecino." },
      { ko: "밤에는 행랑채에 누워요. 호적에는 주인의 재산으로 올라 있어요.", en: "At night you lie in the gate quarters, listed in the register as your master's property.", ja: "夜は行廊で横になります。戸籍には主人の財産として載っています。", zh: "夜里躺在廊房里。户籍上你被记作主人的财产。", fr: "La nuit, vous dormez dans les communs, inscrit comme bien du maître.", es: "De noche duermes en las dependencias, inscrito como bien del amo." },
    ],
    f: [
      { ko: "새벽부터 주인집 부엌에서 밥을 짓고 물을 길어요.", en: "From dawn you cook and fetch water in the master's kitchen.", ja: "明け方から主人の家の台所でご飯を炊き、水を汲みます。", zh: "天不亮就在主人家厨房做饭打水。", fr: "Dès l'aube, vous cuisinez et portez l'eau chez le maître.", es: "Desde el alba cocinas y acarreas agua en casa del amo." },
      { ko: "낮에는 빨래와 바느질, 아이 돌보기를 맡아요.", en: "By day you wash, sew and mind the children.", ja: "昼は洗濯と針仕事、子守りを受け持ちます。", zh: "白天负责洗衣、缝补和照看孩子。", fr: "Le jour, vous lavez, cousez et gardez les enfants.", es: "De día lavas, coses y cuidas a los niños." },
      { ko: "늦은 밤 행랑채로 돌아와요. 마님의 이름은 호적에 없지만, 내 이름은 있어요.", en: "Late at night you return to the gate quarters. Your mistress's name is not in the register; yours is.", ja: "夜遅く行廊に戻ります。奥様の名は戸籍にないのに、わたしの名はあります。", zh: "深夜回到廊房。夫人的名字不在户籍上，我的名字却在。", fr: "Tard le soir, vous regagnez les communs. Le nom de la maîtresse n'est pas au registre ; le vôtre, si.", es: "Ya tarde vuelves a las dependencias. El nombre de la señora no está en el registro; el tuyo, sí." },
    ],
  },
};

const C = {
  sexLabel: { ko: "그 시대의 나는", en: "In that era I am", ja: "その時代のわたしは", zh: "那个时代的我是", fr: "À cette époque, je suis", es: "En esa época soy" },
  female: { ko: "여성", en: "Woman", ja: "女性", zh: "女性", fr: "Femme", es: "Mujer" },
  male: { ko: "남성", en: "Man", ja: "男性", zh: "男性", fr: "Homme", es: "Hombre" },
  fate: { ko: "운명에 맡기기", en: "Leave it to fate", ja: "運命に任せる", zh: "交给命运", fr: "Laisser faire le destin", es: "Dejarlo al destino" },
  draw: { ko: "1789년 호적 펼치기", en: "Open the 1789 register", ja: "1789年の戸籍を開く", zh: "翻开1789年户籍", fr: "Ouvrir le registre de 1789", es: "Abrir el registro de 1789" },
  again: { ko: "다른 집에서 다시 태어나기", en: "Be born into another house", ja: "別の家に生まれ直す", zh: "投胎到另一户人家", fr: "Renaître dans une autre maison", es: "Renacer en otra casa" },
  you: { ko: "1789년 정조 13년, 당신은", en: "In 1789, the 13th year of King Jeongjo, you are", ja: "1789年、正祖13年。あなたは", zh: "1789年，正祖十三年，你是", fr: "En 1789, 13e année du roi Jeongjo, vous êtes", es: "En 1789, año 13 del rey Jeongjo, eres" },
  register: { ko: "호적에 적힌 나", en: "You, as the register wrote you", ja: "戸籍に書かれたわたし", zh: "户籍上写的我", fr: "Vous, tel que l'écrit le registre", es: "Tú, tal como te escribe el registro" },
  registerNote: { ko: "실제 호적처럼 집 번호, 직역, 이름, 나이, 태어난 해의 간지, 본관 순으로 적었어요. 노비는 본관 없이 적었어요.", en: "Written like a real register: house number, title, name, age, birth-year cycle name and clan seat. Slaves have no clan seat.", ja: "実際の戸籍のように、戸番・職役・名前・年齢・生年の干支・本貫の順に書きました。奴婢は本貫なしです。", zh: "仿照真实户籍，按户号、职役、姓名、年龄、生年干支、本贯书写。奴婢不写本贯。", fr: "Écrit comme un vrai registre : n° de foyer, titre, nom, âge, année cyclique, clan. Les esclaves n'ont pas de clan.", es: "Escrito como un registro real: n.º de casa, título, nombre, edad, año cíclico y clan. Los esclavos no tienen clan." },
  me: { ko: "그 시대의 나", en: "You in 1789", ja: "その時代のわたし", zh: "那个时代的我", fr: "Vous en 1789", es: "Tú en 1789" },
  status: { ko: "신분", en: "Status", ja: "身分", zh: "身份", fr: "Statut", es: "Estatus" },
  job: { ko: "직역(하는 일)", en: "Register title", ja: "職役", zh: "职役", fr: "Titre au registre", es: "Título en el registro" },
  name: { ko: "이름", en: "Name", ja: "名前", zh: "名字", fr: "Nom", es: "Nombre" },
  age: { ko: "나이", en: "Age", ja: "年齢", zh: "年龄", fr: "Âge", es: "Edad" },
  bon: { ko: "본관", en: "Clan seat", ja: "本貫", zh: "本贯", fr: "Clan", es: "Clan" },
  house: { ko: "사는 집", en: "Home", ja: "住まい", zh: "住处", fr: "Logis", es: "Casa" },
  family: { ko: "가족", en: "Family", ja: "家族", zh: "家人", fr: "Famille", es: "Familia" },
  body: { ko: "키", en: "Height", ja: "身長", zh: "身高", fr: "Taille", es: "Estatura" },
  duty: { ko: "나라에 지는 의무", en: "Duty to the state", ja: "国への義務", zh: "对国家的义务", fr: "Devoir envers l'État", es: "Deber con el Estado" },
  noBon: { ko: "없음 (노비는 본관 없이 올랐어요)", en: "None (slaves were listed without one)", ja: "なし（奴婢は本貫なし）", zh: "无（奴婢不记本贯）", fr: "Aucun (esclaves inscrits sans clan)", es: "Ninguno (los esclavos sin clan)" },
  day: { ko: "나의 하루", en: "A day in your life", ja: "わたしの一日", zh: "我的一天", fr: "Une journée", es: "Un día" },
  dawn: { ko: "새벽", en: "Dawn", ja: "明け方", zh: "清晨", fr: "Aube", es: "Alba" },
  noon: { ko: "낮", en: "Day", ja: "昼", zh: "白天", fr: "Jour", es: "Día" },
  night: { ko: "밤", en: "Night", ja: "夜", zh: "夜晚", fr: "Nuit", es: "Noche" },
  childDay: { ko: "아직 아이라서 부모님 곁에서 심부름을 하고, 동생을 업어 키워요.", en: "You are still a child: you run errands and carry your younger sibling on your back.", ja: "まだ子どもなので、親のそばでお使いをし、弟妹をおぶって育てます。", zh: "你还是个孩子，在父母身边跑腿，背着弟妹带孩子。", fr: "Encore enfant, vous faites les commissions et portez vos cadets sur le dos.", es: "Aún eres niño: haces recados y cargas a tus hermanos a la espalda." },
  namesTitle: { ko: "이름이 사라진 여자들", en: "The women without names", ja: "名前が消えた女性たち", zh: "名字消失的女人们", fr: "Les femmes sans nom", es: "Las mujeres sin nombre" },
  namesBody: { ko: "호적에서 양반 여성은 \"김씨\"처럼 성 뒤에 氏만, 중간층 여성은 姓이나 召史(소사)만 붙여 올렸어요. 이름이 그대로 남은 여성은 오히려 여종(婢)이었어요. 신분이 높을수록 이름이 사라진 셈이에요.", en: "Registers listed yangban women only as surname + ssi (氏), middle-status women as surname + 姓 or 召史. The women whose own names were written down were slaves. The higher the status, the more the name disappeared.", ja: "戸籍では両班の女性は「金氏」のように姓に氏だけ、中間層の女性は姓や召史だけを付けて載せました。名前がそのまま残ったのはむしろ婢でした。身分が高いほど名前が消えたのです。", zh: "户籍中，两班女性只写\"金氏\"这样的姓加氏，中间阶层女性只写姓加姓或召史。名字被原样记下的反而是婢女。身份越高，名字越是消失。", fr: "Les registres n'inscrivaient les femmes yangban que par leur nom de famille + ssi (氏), les femmes de rang moyen par nom + 姓 ou 召史. Celles dont le prénom figurait étaient les esclaves. Plus le rang était haut, plus le prénom disparaissait.", es: "Los registros anotaban a las mujeres yangban solo con apellido + ssi (氏), y a las de rango medio con apellido + 姓 o 召史. Las que conservaban su nombre eran las esclavas. Cuanto más alto el rango, más desaparecía el nombre." },
  youUnnamed: { ko: "그래서 당신의 이름도 호적에는 없어요.", en: "So your own name is not in the register either.", ja: "だからあなたの名前も戸籍にはありません。", zh: "所以你的名字也不在户籍上。", fr: "Votre prénom n'y figure donc pas non plus.", es: "Así que tu nombre tampoco está en el registro." },
  youNamed: { ko: "그래서 당신의 이름은 호적에 남았어요.", en: "That is why your name survives in the register.", ja: "だからあなたの名前は戸籍に残りました。", zh: "所以你的名字留在了户籍上。", fr: "C'est pourquoi votre prénom y est resté.", es: "Por eso tu nombre quedó en el registro." },
  trendTitle: { ko: "양반이 늘어나던 시대", en: "An age when yangban multiplied", ja: "両班が増えていった時代", zh: "两班不断增多的时代", fr: "Le temps où les yangban se multipliaient", es: "Una época en que los yangban se multiplicaban" },
  trendBody: { ko: "같은 대구 호적에서 양반은 100년 사이 9%에서 38%로, 70년 뒤엔 70%로 늘었어요. 실제로 사람이 바뀐 게 아니라, 족보와 직역을 사고 고쳐서 호적 속 신분이 올라간 경우가 많았어요.", en: "In the same Daegu registers, yangban rose from 9% to 38% in a century, and to 70% seventy years later. Mostly not new people, but titles and genealogies bought or rewritten.", ja: "同じ大邱の戸籍で両班は100年で9%から38%に、70年後には70%に増えました。人が変わったのではなく、族譜や職役を買ったり書き換えたりして戸籍の身分が上がった例が多かったのです。", zh: "同一份大邱户籍中，两班在一百年间从9%增至38%，七十年后达到70%。多半不是换了人，而是买来或改写族谱、职役，使户籍上的身份上升。", fr: "Dans ces mêmes registres de Daegu, les yangban passent de 9 % à 38 % en un siècle, puis à 70 % soixante-dix ans plus tard : surtout des titres et des généalogies achetés ou réécrits.", es: "En los mismos registros de Daegu, los yangban pasaron del 9 % al 38 % en un siglo y al 70 % setenta años después: sobre todo títulos y genealogías comprados o reescritos." },
  howNote: { ko: "신분 비율(양반 38 · 상민 46 · 노비 16)은 대구 호적 연구의 1783년 양반 37.5%와 1789년 노비 15.9%를 반올림하고 나머지를 상민으로 둔 값이에요. 한 고을의 기록이라 전국 평균은 아니에요. 직역 안의 비율, 이름, 본관, 가족 구성은 OIYO가 정한 놀이용 값이에요.", en: "Status odds (yangban 38 · commoner 46 · slave 16) round the Daegu register figures (yangban 37.5% in 1783, slaves 15.9% in 1789), commoners being the rest. One county, not a national average. Title odds, names, clan seats and family are OIYO play values.", ja: "身分の比率（両班38・常民46・奴婢16）は大邱戸籍研究の1783年両班37.5%と1789年奴婢15.9%を丸め、残りを常民としました。一つの郡の記録で全国平均ではありません。職役内の比率・名前・本貫・家族はOIYOの遊び用の値です。", zh: "身份比例（两班38·常民46·奴婢16）取自大邱户籍研究：1783年两班37.5%、1789年奴婢15.9%，四舍五入后其余算作常民。这是一个郡的记录，不是全国平均。职役内比例、名字、本贯、家人是OIYO设定的游戏数值。", fr: "Les chances de statut (yangban 38 · roturier 46 · esclave 16) arrondissent les registres de Daegu (yangban 37,5 % en 1783, esclaves 15,9 % en 1789). Un seul district, pas une moyenne nationale. Titres, noms, clans et famille sont des valeurs de jeu OIYO.", es: "Las probabilidades de estatus (yangban 38 · plebeyo 46 · esclavo 16) redondean los registros de Daegu (yangban 37,5 % en 1783, esclavos 15,9 % en 1789). Un solo distrito, no una media nacional. Títulos, nombres, clanes y familia son valores de juego de OIYO." },
  france: { ko: "같은 해, 프랑스의 나는?", en: "Same year: who were you in France?", ja: "同じ年、フランスのわたしは？", zh: "同一年，法国的我是？", fr: "La même année, qui étiez-vous en France ?", es: "El mismo año, ¿quién eras en Francia?" },
  cardKicker: { ko: "1789 · 정조 13년 호적", en: "1789 · Joseon household register", ja: "1789・正祖13年の戸籍", zh: "1789·正祖十三年户籍", fr: "1789 · registre de Joseon", es: "1789 · registro de Joseon" },
  boss: { ko: "당신의 신분이 더 높아요.", en: "Your status is higher.", ja: "あなたの身分のほうが上です。", zh: "你的身份更高。", fr: "Votre statut est plus élevé.", es: "Tu estatus es más alto." },
  junior: { ko: "친구의 신분이 더 높아요.", en: "Your friend's status is higher.", ja: "友だちの身分のほうが上です。", zh: "朋友的身份更高。", fr: "Le statut de votre ami est plus élevé.", es: "El estatus de tu amigo es más alto." },
  peer: { ko: "같은 신분이에요.", en: "Same status.", ja: "同じ身分です。", zh: "同样的身份。", fr: "Même statut.", es: "Mismo estatus." },
} satisfies Record<string, Six>;

const AGE_UNIT: Six = { ko: "살", en: "", ja: "歳", zh: "岁", fr: " ans", es: " años" };
const ageText = (n: number, l: L) => (l === "en" ? `${n}` : `${n}${AGE_UNIT[l]}`);

function familyText(life: Life1789, l: L): string {
  const k = life.kids;
  if (isChild(life.age)) return pick({ ko: "아직 부모님 집의 아이예요.", en: "Still a child in your parents' house.", ja: "まだ親の家の子どもです。", zh: "还是父母家里的孩子。", fr: "Encore enfant chez vos parents.", es: "Aún niño en casa de tus padres." }, l);
  const partner = life.sex === "f" ? { ko: "남편", en: "husband", ja: "夫", zh: "丈夫", fr: "mari", es: "marido" } : { ko: "아내", en: "wife", ja: "妻", zh: "妻子", fr: "épouse", es: "esposa" };
  const p = pick(partner, l);
  const widow = isWidowJob(life.job);
  const grand = life.age >= 45 && k > 0;
  const kidsTxt = { ko: `아이 ${k}명`, en: `${k} ${k === 1 ? "child" : "children"}`, ja: `子ども${k}人`, zh: `${k}个孩子`, fr: `${k} enfant${k > 1 ? "s" : ""}`, es: `${k} hijo${k === 1 ? "" : "s"}` }[l];
  const lead = widow
    ? { ko: "남편을 먼저 보냈어요", en: "You have lost your husband", ja: "夫を先に亡くしました", zh: "丈夫已先离世", fr: "Vous avez perdu votre mari", es: "Has perdido a tu marido" }[l]
    : life.spouse
      ? { ko: `${p}가 있어요`, en: `You have a ${p}`, ja: `${p}がいます`, zh: `有${p}`, fr: `Vous avez un${life.sex === "f" ? "" : "e"} ${p}`, es: `Tienes ${life.sex === "f" ? "un" : "una"} ${p}` }[l]
      : { ko: "아직 혼자예요", en: "You are unmarried", ja: "まだ独り身です", zh: "还没成家", fr: "Vous n'êtes pas marié" + (life.sex === "f" ? "e" : ""), es: "No te has casado" }[l];
  const kidsPart = k > 0 ? { ko: `, ${kidsTxt}를 키워요`, en: `, raising ${kidsTxt}`, ja: `。${kidsTxt}を育てています`, zh: `，养着${kidsTxt}`, fr: `, ${kidsTxt} à élever`, es: `, crías ${kidsTxt}` }[l] : "";
  const grandPart = grand ? { ko: ". 손주를 볼 나이예요.", en: ". Old enough for grandchildren.", ja: "。孫がいてもおかしくない年です。", zh: "。到了抱孙子的年纪。", fr: ". L'âge d'être grand-parent.", es: ". Edad de tener nietos." }[l] : { ko: ".", en: ".", ja: "。", zh: "。", fr: ".", es: "." }[l];
  return `${lead}${kidsPart}${grandPart}`;
}

function dutyText(life: Life1789, l: L): string {
  if (isChild(life.age)) return pick({ ko: "아이라서 아직 없어요.", en: "None yet: you are a child.", ja: "子どもなのでまだありません。", zh: "还是孩子，暂时没有。", fr: "Aucun : vous êtes enfant.", es: "Ninguno: eres niño." }, l);
  if (life.status === "nobi") return pick({ ko: "주인을 위해 일하거나, 따로 산다면 해마다 몸값(신공)을 바쳐요.", en: "You work for your master or, living apart, pay a yearly fee for your body.", ja: "主人のために働くか、別に暮らすなら毎年身貢を納めます。", zh: "为主人干活；若分开住，则每年交身贡。", fr: "Vous travaillez pour le maître ou, logé ailleurs, lui versez une redevance annuelle.", es: "Trabajas para el amo o, si vives aparte, le pagas un tributo anual." }, l);
  if (life.sex === "f") return pick({ ko: "군포는 남자 몫이지만, 집에서 짠 베가 그 군포가 되기도 해요.", en: "The cloth tax falls on men, but the cloth you weave may pay it.", ja: "軍布は男の役目ですが、家で織った布がその軍布になることもあります。", zh: "军布是男人的事，但家里织的布也常拿去交。", fr: "L'impôt en toile revient aux hommes, mais votre tissage peut le payer.", es: "El impuesto en tela es cosa de hombres, pero tu tejido puede pagarlo." }, l);
  if (life.status === "yangban") return pick({ ko: "군포를 내지 않아요. 양반은 사실상 군역에서 빠져 있었어요.", en: "No cloth tax: yangban were in practice exempt from military service.", ja: "軍布は納めません。両班は事実上軍役から外れていました。", zh: "不交军布，两班实际上不服军役。", fr: "Pas d'impôt en toile : les yangban étaient de fait exemptés.", es: "Sin impuesto en tela: los yangban estaban exentos en la práctica." }, l);
  if (life.age > 60) return pick({ ko: "나이가 많아 군포에서 벗어났어요.", en: "Too old now for the cloth tax.", ja: "高齢で軍布から外れました。", zh: "年纪大了，免交军布。", fr: "Trop âgé pour l'impôt en toile.", es: "Demasiado mayor para el impuesto en tela." }, l);
  return pick({ ko: "해마다 군포 1필(돈으로는 2냥)을 내요. 1750년 균역법 전에는 2필이었어요.", en: "One bolt of cloth (or 2 nyang) a year. Before the 1750 reform it was two.", ja: "毎年軍布1疋（銭なら2両）を納めます。1750年の均役法の前は2疋でした。", zh: "每年交军布一匹（折钱二两）。1750年均役法之前是两匹。", fr: "Une pièce de toile (ou 2 nyang) par an ; deux avant la réforme de 1750.", es: "Una pieza de tela (o 2 nyang) al año; dos antes de la reforma de 1750." }, l);
}

function nameShown(life: Life1789, l: L) {
  const n = registerName(life);
  return l === "ko" ? `${n.ko} (${n.hanja})` : n.hanja;
}
function bonShown(life: Life1789, l: L) {
  if (life.status === "nobi") return pick(C.noBon, l);
  const b = SURNAMES[life.surname]!.bon[life.bon]!;
  return l === "ko" ? `${b.ko} (${b.hanja})` : b.hanja;
}
function jobShown(life: Life1789, l: L) {
  if (isChild(life.age) && life.status !== "nobi") return pick(life.sex === "m" ? { ko: "아들(子)", en: "Son", ja: "子", zh: "子", fr: "Fils", es: "Hijo" } : { ko: "딸(女)", en: "Daughter", ja: "女", zh: "女", fr: "Fille", es: "Hija" }, l);
  return pick(JOB_NAME[life.job]!, l);
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-3 gap-3 border-b border-border py-2 last:border-b-0">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="col-span-2 text-foreground">{v}</dd>
    </div>
  );
}

function SexPicker({ value, onChange, l }: { value: Sex | "fate" | null; onChange: (v: Sex | "fate") => void; l: L }) {
  const opts: [Sex | "fate", Six][] = [["f", C.female], ["m", C.male], ["fate", C.fate]];
  return (
    <div className="space-y-2">
      <p className="text-sm font-bold text-foreground">{pick(C.sexLabel, l)}</p>
      <div className="grid grid-cols-3 gap-2" role="radiogroup">
        {opts.map(([v, label]) => (
          <Button key={v} role="radio" aria-checked={value === v} variant={value === v ? "default" : "outline"} onClick={() => onChange(v)}>
            {pick(label, l)}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default function Joseon1789({ locale }: { locale: Locale }) {
  const l = toL(locale);
  const fmt = numberFormat(l);
  const [mode, setMode] = useState<Mode>("birthday");
  const [sex, setSex] = useState<Sex | "fate" | null>(null);
  const [life, setLife] = useState<Life1789 | null>(null);
  const [friend, setFriend] = useState<Life1789 | null>(null);
  const [round, setRound] = useState(0);
  const funnel = useFunnel(EP);
  const warp = useWarp();

  useEffect(() => {
    const shared = parse1789(window.location.search);
    if (shared) {
      setLife(shared);
      if (!isOwn(EP, format1789(shared))) setFriend(shared);
    }
  }, []);

  function show(next: Life1789, how: string) {
    funnel(how);
    warp.start(() => {
      setLife(next);
      setRound((r) => r + 1);
      setShareQuery(format1789(next));
      rememberOwn(EP, format1789(next));
      stampEpisode(EP);
    });
  }

  const chosenSex = sex === "f" || sex === "m" ? sex : undefined;
  const title = (x: Life1789) => `${pick(STATUS[x.status], l)} · ${jobShown(x, l)}`;
  const verdict = (v: "me" | "friend" | "same") => pick(v === "me" ? C.boss : v === "friend" ? C.junior : C.peer, l);

  return (
    <div className="space-y-6">
      {warp.warping && <TimeWarp from={2026} to={1789} l={l} onDone={warp.finish} />}
      <SexPicker value={sex} onChange={setSex} l={l} />
      <ModeTabs3 mode={mode} onMode={setMode} l={l} modes={["birthday", "random"]} />
      {sex === null ? (
        <Button size="lg" className="w-full" disabled>
          {pick({ ko: "먼저 위에서 성별을 골라 주세요", en: "Pick an option above first", ja: "先に上で選んでください", zh: "请先在上面选择", fr: "Choisissez d'abord ci-dessus", es: "Elige primero arriba" }, l)}
        </Button>
      ) : mode === "birthday" ? (
        <BirthdayPicker l={l} onSubmit={(b) => show(draw1789({ sex: chosenSex, age: ageFromBirthday(b) }, birthdayRandom(EP, `${b}|${sex}`)), "birthday")} />
      ) : (
        <Button size="lg" className="w-full" onClick={() => show(draw1789({ sex: chosenSex }), "random")}>
          {life && life !== friend ? pick(C.again, l) : pick(C.draw, l)}
        </Button>
      )}

      {life && friend && life === friend && <FriendBanner l={l} />}

      {life && (
        <div key={round} className="animate-fadeInUp space-y-4" aria-live="polite">
          {friend && life !== friend && (
            <FriendCompare
              l={l}
              fmt={fmt}
              testId={EP}
              mine={{ label: title(life), n: oneIn1789(life) }}
              friend={{ label: title(friend), n: oneIn1789(friend) }}
              verdict={verdict(compare1789(life, friend))}
            />
          )}

          <section className="rounded-3xl border border-border bg-muted p-6 text-center">
            <p className="text-sm font-bold text-muted-foreground">{pick(C.you, l)}</p>
            <p className="mt-1 text-xl font-bold text-foreground">{pick(STATUS[life.status], l)}</p>
            <p className="font-serif text-4xl font-black text-foreground">{nameShown(life, l)}</p>
            <p className="mt-1 text-sm text-muted-foreground">{jobShown(life, l)} · {ageText(life.age, l)}</p>
          </section>
          <RarityBadge n={oneIn1789(life)} l={l} fmt={fmt} />

          <Panel label={pick(C.register, l)}>
            <p className="rounded-xl border border-border bg-muted px-4 py-5 text-center font-serif text-2xl font-black leading-relaxed tracking-widest text-foreground">{registerLine(life)}</p>
            <p className="pt-1 text-xs text-muted-foreground">{pick(C.registerNote, l)}</p>
          </Panel>

          <Panel label={pick(C.me, l)}>
            <dl>
              <Row k={pick(C.status, l)} v={pick(STATUS[life.status], l)} />
              <Row k={pick(C.job, l)} v={`${jobShown(life, l)}${isChild(life.age) && life.status !== "nobi" ? "" : ` — ${pick(JOB_NOTE[jobOf(life).id]!, l)}`}`} />
              <Row k={pick(C.name, l)} v={nameShown(life, l)} />
              <Row k={pick(C.age, l)} v={ageText(life.age, l)} />
              <Row k={pick(C.bon, l)} v={bonShown(life, l)} />
              <Row k={pick(C.house, l)} v={pick(HOUSE[life.status], l)} />
              <Row k={pick(C.family, l)} v={familyText(life, l)} />
              <Row k={pick(C.body, l)} v={`${pick(life.sex === "m" ? { ko: "그 시대 남자 평균", en: "Average man then", ja: "当時の男性平均", zh: "当时男性平均", fr: "Homme moyen d'alors", es: "Hombre medio de entonces" } : { ko: "그 시대 여자 평균", en: "Average woman then", ja: "当時の女性平均", zh: "当时女性平均", fr: "Femme moyenne d'alors", es: "Mujer media de entonces" }, l)} ${HEIGHT_CM[life.sex]}cm`} />
              <Row k={pick(C.duty, l)} v={dutyText(life, l)} />
            </dl>
            <Sources l={l} items={[SRC.height, SRC.tax]} />
          </Panel>

          <Panel label={pick(C.day, l)}>
            {isChild(life.age) ? (
              <p className="text-base">{pick(C.childDay, l)}</p>
            ) : (
              <ol className="space-y-3">
                {DAY[life.status][life.sex].map((line, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="w-12 shrink-0 font-bold text-primary">{pick([C.dawn, C.noon, C.night][i]!, l)}</span>
                    <span className="text-base leading-relaxed">{pick(line, l)}</span>
                  </li>
                ))}
              </ol>
            )}
          </Panel>

          <Panel label={pick(C.namesTitle, l)}>
            <p className="text-base leading-relaxed">{pick(C.namesBody, l)}</p>
            {life.sex === "f" && <p className="text-lg font-bold">{pick(registerName(life).named ? C.youNamed : C.youUnnamed, l)}</p>}
            <Sources l={l} items={[SRC.women]} />
          </Panel>

          <Panel label={pick(C.trendTitle, l)}>
            <ol className="grid grid-cols-3 gap-2 text-center">
              {YANGBAN_TREND.map((t) => (
                <li key={t.year} className={`rounded-xl border border-border p-3 ${t.year === 1783 ? "bg-primary/10" : "bg-muted"}`}>
                  <p className="text-xs text-muted-foreground">{t.year}</p>
                  <p className="text-2xl font-black text-foreground">{t.pct}%</p>
                </li>
              ))}
            </ol>
            <p className="pt-2 text-sm leading-relaxed">{pick(C.trendBody, l)}</p>
            <Sources l={l} items={[SRC.status, SRC.nobi]} />
          </Panel>

          <p className="text-xs leading-relaxed text-muted-foreground">{pick(C.howNote, l)}</p>

          <SaveCard
            l={l}
            testId={EP}
            filename={`oiyo-joseon1789-${life.status}-${life.job}`}
            spec={{
              kicker: pick(C.cardKicker, l),
              title: nameShown(life, l),
              subtitle: title(life),
              badge: `★ ${rarityLabel(oneIn1789(life), l)} · ${oneInText(oneIn1789(life), l, fmt)}`,
              lines: [registerLine(life), familyText(life, l)],
              footer: "oiyo.net · 1789",
              accent: "#7a4a1f",
            }}
          />
          <CopyLink l={l} testId={EP} />
          <Button asChild variant="outline" className="w-full">
            <a href={localePath(locale, "/france-1789/")}>🇫🇷 {pick(C.france, l)}</a>
          </Button>
          <SeriesNext l={l} locale={locale} current={EP} round={round} />
        </div>
      )}
    </div>
  );
}

