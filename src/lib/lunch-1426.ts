/**
 * "오늘 점심을 600년 전으로" — take today's lunch back to 1426 Joseon and see what survives.
 *
 * Each ingredient is one of:
 * - ok: grown or made in early Joseon (rice, soy sauce, radish, garlic, sesame oil…)
 * - rare: existed but was a luxury or restricted (sugar was an imported medicine; beef was under slaughter bans;
 *   wheat flour was costly; milk was for the court)
 * - none: not in Korea in 1426. New World crops (chili, potato, sweet potato, corn, tomato, squash, peanut,
 *   bell pepper, cacao) only left the Americas after 1492; others (onion, cabbage, heading napa cabbage,
 *   curry powder, ketchup, mayonnaise, cheese, coffee) came in the modern era.
 * Arrival notes cite the source key in SOURCES. Where a Korean arrival date is not well documented we say
 * only "not in 1426", which is certain for New World crops.
 */

export type Status = "ok" | "rare" | "none";
export type Bi = { ko: string; en: string };

export type Ingredient = { name: Bi; status: Status; note: Bi; src?: SourceKey };

export const SOURCES = {
  chili: { label: "주간경향, 「‘임진왜란 때 고추 전래’ 뒤집었던 주장… 최근 연구가 내놓은 답은」(2026)", url: "https://weekly.khan.co.kr/article/202609240800001" },
  potato: { label: "서울신문, 「식품보감 ‹4› 감자」(2014)", url: "https://www.seoul.co.kr/news/2014/06/13/20140613015007" },
  sweetpotato: { label: "주간경향, 「고구마」(2008)", url: "https://weekly.khan.co.kr/article/18669" },
  squash: { label: "경북매일, 황광해 「호박」(2019)", url: "https://kbmaeil.com/article/201909300261404" },
  napa: { label: "서울신문, 「식품보감 ‹39› 배추」(2015)", url: "https://www.seoul.co.kr/news/2015/05/29/20150529024003" },
  sugar: { label: "중앙SUNDAY, 「꿀보다 달콤한 설탕, 조선인 입맛·체형까지 바꾸다」(2023)", url: "https://v.daum.net/v/20230812002057257" },
  americas: { label: "Britannica, 18 Food Crops Developed in the Americas", url: "https://www.britannica.com/story/18-food-crops-developed-in-the-americas" },
  foreign: { label: "차경희, 「조선 중기 외래식품의 도입과 그 영향」(한국식생활문화학회지, 2005)", url: "https://koreascience.kr/article/JAKO200504637322799.page?lang=ko" },
} as const;
export type SourceKey = keyof typeof SOURCES;

const NEW_WORLD: Bi = { ko: "아메리카 작물이라 1492년 이후에야 세계로 퍼졌어요.", en: "An American crop: it only left the Americas after 1492." };
const MODERN: Bi = { ko: "근대에 들어온 재료예요. 1426년 조선 기록에는 없어요.", en: "A modern arrival, absent from early Joseon records." };
const OK: Bi = { ko: "그때도 먹었어요.", en: "Eaten then too." };

export const ING = {
  rice: { name: { ko: "쌀밥", en: "rice" }, status: "ok", note: OK },
  barley: { name: { ko: "보리", en: "barley" }, status: "ok", note: OK },
  soy: { name: { ko: "간장·된장", en: "soy sauce and soybean paste" }, status: "ok", note: OK },
  salt: { name: { ko: "소금", en: "salt" }, status: "ok", note: OK },
  garlic: { name: { ko: "마늘", en: "garlic" }, status: "ok", note: OK },
  scallion: { name: { ko: "파", en: "scallion" }, status: "ok", note: OK },
  ginger: { name: { ko: "생강", en: "ginger" }, status: "ok", note: OK },
  sesame: { name: { ko: "참기름·깨", en: "sesame oil and seeds" }, status: "ok", note: OK },
  radish: { name: { ko: "무", en: "radish" }, status: "ok", note: { ko: "조선 후기까지 김치의 주인공은 배추가 아니라 무였어요.", en: "Radish, not cabbage, was the main kimchi vegetable until late Joseon." }, src: "chili" },
  cucumber: { name: { ko: "오이", en: "cucumber" }, status: "ok", note: OK },
  eggplant: { name: { ko: "가지", en: "eggplant" }, status: "ok", note: OK },
  greens: { name: { ko: "나물(미나리·고사리·도라지)", en: "wild greens" }, status: "ok", note: OK },
  mushroom: { name: { ko: "버섯", en: "mushrooms" }, status: "ok", note: OK },
  tofu: { name: { ko: "두부", en: "tofu" }, status: "ok", note: OK },
  egg: { name: { ko: "달걀", en: "egg" }, status: "ok", note: OK },
  pork: { name: { ko: "돼지고기", en: "pork" }, status: "ok", note: OK },
  chicken: { name: { ko: "닭고기", en: "chicken" }, status: "ok", note: OK },
  fish: { name: { ko: "생선", en: "fish" }, status: "ok", note: OK },
  anchovy: { name: { ko: "멸치·젓갈", en: "anchovy and salted seafood" }, status: "ok", note: OK },
  seaweed: { name: { ko: "김·미역", en: "laver and seaweed" }, status: "ok", note: OK },
  buckwheat: { name: { ko: "메밀국수", en: "buckwheat noodles" }, status: "ok", note: OK },
  ricecake: { name: { ko: "떡", en: "rice cake" }, status: "ok", note: OK },
  vinegar: { name: { ko: "식초", en: "vinegar" }, status: "ok", note: OK },
  mustard: { name: { ko: "겨자", en: "mustard" }, status: "ok", note: OK },
  sancho: { name: { ko: "천초(산초)", en: "Sichuan-type pepper (sancho)" }, status: "ok", note: { ko: "고추가 오기 전 매운맛은 천초·생강·겨자가 냈어요.", en: "Before chili, heat came from sancho pepper, ginger and mustard." } },
  honey: { name: { ko: "꿀·엿", en: "honey and malt syrup" }, status: "ok", note: { ko: "단맛은 꿀과 엿으로 냈어요.", en: "Sweetness came from honey and malt syrup." }, src: "sugar" },
  oldnapa: { name: { ko: "배추(속이 덜 찬 옛 배추)", en: "loose-leaf cabbage" }, status: "rare", note: { ko: "속이 꽉 찬 통배추는 19세기 이후예요. 그때 배추는 잎이 벌어진 귀한 채소였어요.", en: "Heading napa cabbage is 19th-century; the old loose-leaf kind was scarce." }, src: "napa" },
  beef: { name: { ko: "소고기", en: "beef" }, status: "rare", note: { ko: "농사에 쓰는 소를 함부로 잡지 못하게 막던 때라 귀했어요.", en: "Scarce: slaughtering plough oxen was restricted." } },
  wheat: { name: { ko: "밀가루", en: "wheat flour" }, status: "rare", note: { ko: "밀은 귀해서 잔치 때나 썼어요.", en: "Wheat was costly, kept for feasts." } },
  milk: { name: { ko: "우유", en: "milk" }, status: "rare", note: { ko: "우유는 궁중에서 약처럼 쓰던 귀한 것이었어요.", en: "Milk was a rare court tonic." } },
  sugar: { name: { ko: "설탕", en: "sugar" }, status: "rare", note: { ko: "설탕은 중국에서 들여온 약재로 궁중·상류층만 썼어요. 음식에 흔히 쓴 건 1960년대부터예요.", en: "Imported sugar was a medicine for the court and elite; everyday cooking with sugar began in the 1960s." }, src: "sugar" },
  chili: { name: { ko: "고추·고춧가루·고추장", en: "chili, chili flakes, gochujang" }, status: "none", note: { ko: "임진왜란(1592) 무렵 들어왔어요. 1614년 『지봉유설』에 '남만초'로 처음 나와요.", en: "Arrived around the Imjin War (1590s); first named in 1614 in Jibong yuseol." }, src: "chili" },
  potato: { name: { ko: "감자", en: "potato" }, status: "none", note: { ko: "1824년 무렵 북쪽으로 들어왔다고 해요.", en: "Said to have entered from the north around 1824." }, src: "potato" },
  sweetpotato: { name: { ko: "고구마", en: "sweet potato" }, status: "none", note: { ko: "1763년 통신사 조엄이 대마도에서 들여왔다고 해요.", en: "Brought from Tsushima by envoy Jo Eom in 1763." }, src: "sweetpotato" },
  corn: { name: { ko: "옥수수", en: "corn" }, status: "none", note: NEW_WORLD, src: "americas" },
  tomato: { name: { ko: "토마토", en: "tomato" }, status: "none", note: NEW_WORLD, src: "americas" },
  squash: { name: { ko: "호박", en: "squash" }, status: "none", note: { ko: "17세기 초 기록부터 보여요. 아메리카 작물이에요.", en: "An American crop, recorded in Korea from the early 17th century." }, src: "squash" },
  peanut: { name: { ko: "땅콩", en: "peanut" }, status: "none", note: NEW_WORLD, src: "americas" },
  pepper: { name: { ko: "피망·파프리카", en: "bell pepper" }, status: "none", note: NEW_WORLD, src: "americas" },
  cacao: { name: { ko: "초콜릿", en: "chocolate" }, status: "none", note: NEW_WORLD, src: "americas" },
  onion: { name: { ko: "양파", en: "onion" }, status: "none", note: MODERN },
  cabbage: { name: { ko: "양배추", en: "cabbage" }, status: "none", note: MODERN },
  napa: { name: { ko: "통배추", en: "napa cabbage" }, status: "none", note: { ko: "속이 꽉 차는 배추는 19세기에야 자리 잡았어요.", en: "Heading napa cabbage only took hold in the 19th century." }, src: "napa" },
  curry: { name: { ko: "카레 가루", en: "curry powder" }, status: "none", note: MODERN },
  ketchup: { name: { ko: "케첩·마요네즈", en: "ketchup and mayonnaise" }, status: "none", note: MODERN },
  cheese: { name: { ko: "치즈", en: "cheese" }, status: "none", note: MODERN },
  coffee: { name: { ko: "커피", en: "coffee" }, status: "none", note: MODERN },
  ramen: { name: { ko: "인스턴트 라면", en: "instant noodles" }, status: "none", note: { ko: "1963년에 처음 나왔어요.", en: "First sold in Korea in 1963." } },
  chunjang: { name: { ko: "춘장", en: "black bean paste (chunjang)" }, status: "none", note: MODERN },
} satisfies Record<string, Ingredient>;
export type IngId = keyof typeof ING;

export type Six = { ko: string; en: string; ja: string; zh: string; fr: string; es: string };
export type Dish = { id: string; name: Six; emoji: string; ing: IngId[]; then: Bi };

export const DISHES: Dish[] = [
  { id: "kimchi-jjigae", emoji: "🍲", name: { ko: "김치찌개", en: "Kimchi stew", ja: "キムチチゲ", zh: "泡菜汤", fr: "Ragoût de kimchi", es: "Guiso de kimchi" }, ing: ["napa", "chili", "pork", "tofu", "scallion", "garlic", "onion", "rice"], then: { ko: "고춧가루 없는 무 물김치(침채)에 돼지고기와 두부를 넣고 끓인 맑은 국과 밥.", en: "A clear soup of radish water-kimchi with pork and tofu, served with rice." } },
  { id: "doenjang-jjigae", emoji: "🥘", name: { ko: "된장찌개", en: "Soybean paste stew", ja: "テンジャンチゲ", zh: "大酱汤", fr: "Ragoût de doenjang", es: "Guiso de doenjang" }, ing: ["soy", "tofu", "squash", "potato", "onion", "chili", "garlic", "anchovy", "rice"], then: { ko: "호박·감자·양파 대신 무와 버섯을 넣은 된장국과 밥. 고추 대신 천초로 칼칼하게.", en: "Soybean soup with radish and mushrooms instead of squash, potato and onion; sancho for heat." } },
  { id: "jeyuk", emoji: "🍖", name: { ko: "제육볶음", en: "Spicy stir-fried pork", ja: "豚肉炒め（チェユク）", zh: "辣炒猪肉", fr: "Porc sauté épicé", es: "Cerdo salteado picante" }, ing: ["pork", "chili", "onion", "cabbage", "garlic", "sugar", "sesame", "rice"], then: { ko: "간장·마늘·생강에 재운 돼지고기 구이(맥적에 가까운 맛)와 밥. 빨간색은 없어요.", en: "Pork marinated in soy, garlic and ginger and grilled, close to old maekjeok. Not red." } },
  { id: "bibimbap", emoji: "🥗", name: { ko: "비빔밥", en: "Bibimbap", ja: "ビビンバ", zh: "拌饭", fr: "Bibimbap", es: "Bibimbap" }, ing: ["rice", "greens", "egg", "beef", "chili", "sesame", "mushroom"], then: { ko: "나물과 달걀을 얹고 간장·참기름으로 비빈 밥. 고추장도 소고기도 없어요.", en: "Rice with greens and egg, mixed with soy sauce and sesame oil. No gochujang, no beef." } },
  { id: "tteokbokki", emoji: "🌶️", name: { ko: "떡볶이", en: "Tteokbokki", ja: "トッポッキ", zh: "炒年糕", fr: "Tteokbokki", es: "Tteokbokki" }, ing: ["ricecake", "chili", "sugar", "cabbage", "scallion", "anchovy", "egg"], then: { ko: "떡을 간장과 고기로 볶은 '궁중 떡볶이' 쪽이에요. 빨간 떡볶이는 20세기 음식이에요.", en: "Rice cakes stir-fried with soy sauce and meat, the 'royal' style. Red tteokbokki is a 20th-century dish." } },
  { id: "jjajang", emoji: "🍜", name: { ko: "짜장면", en: "Jjajangmyeon", ja: "チャジャン麺", zh: "炸酱面", fr: "Jjajangmyeon", es: "Jjajangmyeon" }, ing: ["wheat", "chunjang", "onion", "pork", "cabbage", "cucumber", "sugar"], then: { ko: "춘장도 양파도 없어요. 메밀국수에 돼지고기 장조림과 오이채를 올린 국수 정도.", en: "No black bean paste, no onion: buckwheat noodles topped with soy-braised pork and cucumber." } },
  { id: "ramen", emoji: "🍜", name: { ko: "라면", en: "Ramyeon", ja: "ラーメン（韓国式）", zh: "韩式拉面", fr: "Ramyeon", es: "Ramyeon" }, ing: ["ramen", "chili", "scallion", "egg", "napa"], then: { ko: "인스턴트 라면은 1963년생이에요. 메밀국수에 달걀 푼 장국으로 대신해요.", en: "Instant noodles date from 1963. Try buckwheat noodles in soy broth with egg." } },
  { id: "kimbap", emoji: "🍙", name: { ko: "김밥", en: "Gimbap", ja: "キンパ", zh: "紫菜包饭", fr: "Gimbap", es: "Gimbap" }, ing: ["rice", "seaweed", "egg", "cucumber", "radish", "sesame", "pork"], then: { ko: "김에 밥을 싸 먹는 '김쌈'은 있었어요. 단무지 대신 무장아찌를 넣으면 거의 그대로예요.", en: "Rice wrapped in laver was eaten; with pickled radish it is almost the same." } },
  { id: "naengmyeon", emoji: "🥶", name: { ko: "냉면", en: "Cold noodles", ja: "冷麺", zh: "冷面", fr: "Nouilles froides", es: "Fideos fríos" }, ing: ["buckwheat", "radish", "cucumber", "egg", "beef", "vinegar", "mustard", "sugar"], then: { ko: "메밀국수에 동치미 국물, 식초와 겨자. 그때도 거의 이 맛이었을 거예요. 소고기 편육만 귀해요.", en: "Buckwheat noodles in radish-kimchi broth with vinegar and mustard: nearly the same then, minus easy beef." } },
  { id: "samgyeopsal", emoji: "🥓", name: { ko: "삼겹살", en: "Grilled pork belly", ja: "サムギョプサル", zh: "烤五花肉", fr: "Poitrine de porc grillée", es: "Panceta a la parrilla" }, ing: ["pork", "garlic", "greens", "soy", "chili", "sesame", "rice"], then: { ko: "돼지고기를 구워 마늘·쌈채소와 된장에 싸 먹기. 고추와 쌈장의 고추장만 빠져요.", en: "Grilled pork wrapped in greens with garlic and soybean paste; only the chili goes." } },
  { id: "fried-chicken", emoji: "🍗", name: { ko: "치킨", en: "Fried chicken", ja: "フライドチキン", zh: "炸鸡", fr: "Poulet frit", es: "Pollo frito" }, ing: ["chicken", "wheat", "chili", "sugar", "garlic", "ketchup"], then: { ko: "기름에 튀기는 건 귀한 일이었어요. 닭을 통째로 삶은 백숙이나 구이가 현실적이에요.", en: "Deep-frying was a luxury; boiled or grilled whole chicken is the realistic version." } },
  { id: "samgyetang", emoji: "🐔", name: { ko: "삼계탕", en: "Ginseng chicken soup", ja: "参鶏湯", zh: "参鸡汤", fr: "Soupe poulet-ginseng", es: "Sopa de pollo y ginseng" }, ing: ["chicken", "rice", "garlic", "ginger", "scallion", "salt"], then: { ko: "인삼만 귀했을 뿐 재료는 다 있었어요. 닭백숙은 그때도 가능한 점심이에요.", en: "Everything existed, though ginseng was precious: boiled chicken soup works in 1426." } },
  { id: "galbitang", emoji: "🍖", name: { ko: "갈비탕", en: "Beef rib soup", ja: "カルビタン", zh: "排骨汤", fr: "Soupe de côtes", es: "Sopa de costillas" }, ing: ["beef", "radish", "scallion", "garlic", "soy", "rice"], then: { ko: "재료는 다 있지만 소고기가 귀해요. 잔치 날에나 먹을 국이에요.", en: "All there, but beef was scarce: a feast-day soup." } },
  { id: "kalguksu", emoji: "🍜", name: { ko: "칼국수", en: "Knife-cut noodles", ja: "カルグクス", zh: "刀削面", fr: "Nouilles au couteau", es: "Fideos cortados a cuchillo" }, ing: ["wheat", "squash", "potato", "anchovy", "scallion", "garlic"], then: { ko: "밀가루가 귀해 메밀로 반죽해야 해요. 호박과 감자는 빼고 멸치 국물에 파만.", en: "Wheat was dear, so knead buckwheat; drop squash and potato, keep anchovy broth and scallion." } },
  { id: "jjamppong", emoji: "🦑", name: { ko: "짬뽕", en: "Jjamppong", ja: "チャンポン", zh: "炒码面", fr: "Jjamppong", es: "Jjamppong" }, ing: ["wheat", "chili", "onion", "cabbage", "fish", "pork", "garlic"], then: { ko: "빨간 국물도 양파·양배추도 없어요. 해산물을 넣고 끓인 맑은 국수에 가까워요.", en: "No red broth, onion or cabbage: a clear seafood noodle soup." } },
  { id: "donkatsu", emoji: "🍛", name: { ko: "돈가스", en: "Pork cutlet", ja: "とんかつ", zh: "炸猪排", fr: "Escalope de porc panée", es: "Escalope de cerdo" }, ing: ["pork", "wheat", "egg", "cabbage", "ketchup", "rice"], then: { ko: "튀김옷·소스·양배추가 다 없어요. 돼지고기 너비아니 구이로 바꿔야 해요.", en: "No batter, sauce or cabbage: make it a thin grilled pork steak." } },
  { id: "curry", emoji: "🍛", name: { ko: "카레라이스", en: "Curry rice", ja: "カレーライス", zh: "咖喱饭", fr: "Riz au curry", es: "Arroz con curry" }, ing: ["curry", "potato", "onion", "pork", "rice"], then: { ko: "카레 가루·감자·양파가 모두 없어요. 남는 건 돼지고기와 밥뿐.", en: "No curry powder, potato or onion: just pork and rice remain." } },
  { id: "hamburger", emoji: "🍔", name: { ko: "햄버거", en: "Hamburger", ja: "ハンバーガー", zh: "汉堡", fr: "Hamburger", es: "Hamburguesa" }, ing: ["wheat", "beef", "cheese", "tomato", "onion", "cabbage", "ketchup", "potato"], then: { ko: "빵도 치즈도 토마토도 없어요. 소고기 떡갈비를 밥과 먹는 게 가장 가까워요.", en: "No bun, cheese or tomato: a minced-beef patty with rice is the nearest." } },
  { id: "pizza", emoji: "🍕", name: { ko: "피자", en: "Pizza", ja: "ピザ", zh: "披萨", fr: "Pizza", es: "Pizza" }, ing: ["wheat", "tomato", "cheese", "pepper", "onion", "pork"], then: { ko: "토마토·치즈·피망 모두 없어요. 밀전병에 고기와 나물을 올린 부침개 정도.", en: "No tomato, cheese or peppers: a wheat pancake topped with meat and greens." } },
  { id: "sushi", emoji: "🍣", name: { ko: "초밥", en: "Sushi", ja: "寿司", zh: "寿司", fr: "Sushi", es: "Sushi" }, ing: ["rice", "fish", "vinegar", "seaweed", "soy", "sugar"], then: { ko: "설탕만 빼면 다 있어요. 식초밥에 회를 올리는 건 1426년에도 가능해요.", en: "All but sugar existed: vinegared rice with raw fish works in 1426." } },
  { id: "sandwich", emoji: "🥪", name: { ko: "샌드위치", en: "Sandwich", ja: "サンドイッチ", zh: "三明治", fr: "Sandwich", es: "Sándwich" }, ing: ["wheat", "egg", "cabbage", "tomato", "cheese", "ketchup", "pork"], then: { ko: "빵이 없던 때라 떡 사이에 고기를 끼운 '떡 샌드'가 최선이에요.", en: "No bread: meat between rice cakes is the best you'll get." } },
  { id: "tteokguk", emoji: "🥣", name: { ko: "떡국", en: "Rice cake soup", ja: "トックク", zh: "年糕汤", fr: "Soupe de tteok", es: "Sopa de tteok" }, ing: ["ricecake", "beef", "egg", "scallion", "seaweed", "soy", "garlic"], then: { ko: "소고기 대신 꿩이나 닭으로 국물을 내면 그대로예요. '꿩 대신 닭'이라는 말도 여기서 나왔다고 해요.", en: "Use pheasant or chicken for the broth instead of beef and it's the same dish." } },
  { id: "japchae", emoji: "🍝", name: { ko: "잡채", en: "Japchae", ja: "チャプチェ", zh: "杂菜", fr: "Japchae", es: "Japchae" }, ing: ["greens", "mushroom", "pork", "soy", "sesame", "onion", "pepper", "sugar"], then: { ko: "당면은 20세기 재료예요. 원래 잡채는 여러 채소와 고기를 볶아 무친 반찬이었어요.", en: "Glass noodles are 20th-century; the original japchae was mixed stir-fried vegetables and meat." } },
  { id: "budae", emoji: "🌭", name: { ko: "부대찌개", en: "Army stew", ja: "プデチゲ", zh: "部队锅", fr: "Ragoût de l'armée", es: "Guiso del ejército" }, ing: ["ramen", "cheese", "chili", "napa", "pork", "onion", "tofu"], then: { ko: "햄·라면·치즈 모두 20세기 이후예요. 두부와 돼지고기만 남아요.", en: "Ham, instant noodles and cheese are all modern; only tofu and pork remain." } },
  { id: "malatang", emoji: "🥵", name: { ko: "마라탕", en: "Malatang", ja: "麻辣湯", zh: "麻辣烫", fr: "Malatang", es: "Malatang" }, ing: ["sancho", "chili", "tofu", "mushroom", "greens", "beef", "potato"], then: { ko: "얼얼한 '마(麻)'는 산초라 그때도 있었지만, 매운 '라(辣)'의 고추는 없어요.", en: "The numbing 'ma' (sancho) existed; the fiery 'la' (chili) did not." } },
];

export type Verdict = { ok: IngId[]; rare: IngId[]; none: IngId[]; score: number };

/** score: share of ingredients usable in 1426 (rare counts half). */
export function judge(d: Dish): Verdict {
  const ok = d.ing.filter((i) => ING[i].status === "ok");
  const rare = d.ing.filter((i) => ING[i].status === "rare");
  const none = d.ing.filter((i) => ING[i].status === "none");
  const score = d.ing.length ? (ok.length + rare.length / 2) / d.ing.length : 0;
  return { ok, rare, none, score };
}

export const byId = (id: string) => DISHES.find((d) => d.id === id) ?? null;

export function formatLunch(id: string): string {
  return new URLSearchParams({ d: id }).toString();
}

export function parseLunch(search: string): string | null {
  const id = new URLSearchParams(search).get("d");
  return id && byId(id) ? id : null;
}
