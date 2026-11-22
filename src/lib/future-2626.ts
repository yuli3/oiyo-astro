/**
 * "Future archaeology, 2626" (time-slip season 3 #10, idea A9): the series in reverse.
 * Your everyday things as labels in a museum 600 years from now. Entirely playful fiction —
 * the misreadings are invented jokes, not predictions. No real people or brands.
 */

export type Six = { ko: string; en: string; ja: string; zh: string; fr: string; es: string };

export type Item = { id: string; emoji: string; name: Six; guesses: Six[]; material: Six };

export const ITEMS: Item[] = [
  {
    id: "phone", emoji: "📱", name: { ko: "스마트폰", en: "Smartphone", ja: "スマホ", zh: "智能手机", fr: "Smartphone", es: "Móvil" },
    material: { ko: "유리, 알루미늄, 희토류", en: "Glass, aluminium, rare earths", ja: "ガラス、アルミ、レアアース", zh: "玻璃、铝、稀土", fr: "Verre, aluminium, terres rares", es: "Vidrio, aluminio, tierras raras" },
    guesses: [
      { ko: "개인 기도용 검은 거울. 주인은 하루 수백 번 이것을 들여다보며 고개를 숙였던 것으로 보인다.", en: "A personal black mirror for prayer. Owners appear to have bowed their heads to it hundreds of times a day.", ja: "個人用の祈りの黒い鏡。持ち主は一日に何百回も頭を垂れて覗き込んだとみられる。", zh: "个人祈祷用的黑镜。主人似乎每天低头凝视它数百次。", fr: "Miroir noir de prière personnelle ; son propriétaire s'inclinait devant lui des centaines de fois par jour.", es: "Espejo negro de oración personal; su dueño se inclinaba ante él cientos de veces al día." },
      { ko: "손바닥 크기의 휴대용 벽돌. 사람들은 잠들기 직전까지 이것을 얼굴 위로 들고 있다가 떨어뜨렸던 듯하다.", en: "A palm-sized portable brick, apparently held above the face at night until it fell on the sleeper.", ja: "手のひら大の携帯用レンガ。寝る直前まで顔の上に掲げ、落としていたらしい。", zh: "巴掌大的便携砖块。人们似乎睡前一直举在脸上，直到砸下来。", fr: "Brique de poche tenue au-dessus du visage jusqu'à ce qu'elle tombe sur le dormeur.", es: "Ladrillo de bolsillo sostenido sobre la cara hasta que caía sobre el durmiente." },
    ],
  },
  {
    id: "earbuds", emoji: "🎧", name: { ko: "무선 이어폰", en: "Wireless earbuds", ja: "ワイヤレスイヤホン", zh: "无线耳机", fr: "Écouteurs sans fil", es: "Auriculares inalámbricos" },
    material: { ko: "플라스틱, 리튬", en: "Plastic, lithium", ja: "プラスチック、リチウム", zh: "塑料、锂", fr: "Plastique, lithium", es: "Plástico, litio" },
    guesses: [
      { ko: "귀에 꽂는 한 쌍의 장신구. 대부분 한 짝만 출토되어, 짝을 잃는 것이 당시의 풍습이었던 것으로 추정된다.", en: "Paired ear ornaments. Almost always found singly, suggesting that losing one was a custom of the age.", ja: "耳に挿す一対の装身具。ほとんど片方だけ出土し、片方をなくすのが当時の風習だったと推定される。", zh: "成对的耳饰，几乎总是只出土一只，推测丢一只是当时的习俗。", fr: "Bijoux d'oreille en paire, presque toujours retrouvés seuls : perdre l'un semble avoir été une coutume.", es: "Adornos de oreja en pareja, casi siempre hallados sueltos: perder uno parece haber sido costumbre." },
      { ko: "작은 알 모양 부적을 넣는 하얀 함. 함만 남고 알은 사라진 경우가 많다.", en: "A white case for small egg-shaped charms. Often the case survives and the eggs are gone.", ja: "小さな卵形のお守りを入れる白い箱。箱だけ残り卵が消えていることが多い。", zh: "装小蛋形护身符的白盒，常常只剩盒子，蛋不见了。", fr: "Écrin blanc pour petites amulettes ovoïdes ; l'écrin survit souvent sans elles.", es: "Estuche blanco para pequeños amuletos ovalados; a menudo sobrevive vacío." },
    ],
  },
  {
    id: "tumbler", emoji: "🥤", name: { ko: "텀블러", en: "Tumbler", ja: "タンブラー", zh: "保温杯", fr: "Gourde isotherme", es: "Termo" },
    material: { ko: "스테인리스강", en: "Stainless steel", ja: "ステンレス", zh: "不锈钢", fr: "Acier inoxydable", es: "Acero inoxidable" },
    guesses: [
      { ko: "개인 신분을 드러내는 금속 원통. 스티커의 수가 사회적 지위를 나타냈던 것으로 보인다.", en: "A metal cylinder of personal identity; the number of stickers seems to have marked social rank.", ja: "身分を示す金属の円筒。ステッカーの数が社会的地位を表したようだ。", zh: "显示身份的金属圆筒，贴纸数量似乎代表社会地位。", fr: "Cylindre métallique d'identité ; le nombre d'autocollants marquait le rang social.", es: "Cilindro metálico de identidad; el número de pegatinas marcaba el rango social." },
      { ko: "커피라 불린 쓴 물을 담아 다니던 의례용 그릇. 거의 모든 성인 무덤에서 나온다.", en: "A ritual vessel for a bitter liquid called coffee, found in nearly every adult burial.", ja: "コーヒーと呼ばれた苦い水を入れた儀礼用の器。ほぼすべての成人の墓から出る。", zh: "盛放一种叫咖啡的苦水的礼器，几乎每座成人墓都有。", fr: "Vase rituel pour un liquide amer, le café, présent dans presque toutes les sépultures adultes.", es: "Vasija ritual para un líquido amargo, el café, presente en casi todas las tumbas adultas." },
    ],
  },
  {
    id: "powerbank", emoji: "🔋", name: { ko: "보조배터리", en: "Power bank", ja: "モバイルバッテリー", zh: "充电宝", fr: "Batterie externe", es: "Batería externa" },
    material: { ko: "리튬 이온 전지, 플라스틱", en: "Lithium-ion cells, plastic", ja: "リチウムイオン電池、プラスチック", zh: "锂离子电池、塑料", fr: "Cellules lithium-ion, plastique", es: "Celdas de litio, plástico" },
    guesses: [
      { ko: "검은 거울에 생명을 불어넣던 휴대용 심장. 주인들은 이것이 비면 깊은 불안에 빠졌다고 전한다.", en: "A portable heart that kept the black mirror alive; owners reportedly fell into deep anxiety when it emptied.", ja: "黒い鏡に命を吹き込む携帯用の心臓。空になると持ち主は深い不安に陥ったという。", zh: "给黑镜续命的便携心脏，据说空了主人就陷入深深的焦虑。", fr: "Cœur portable qui maintenait le miroir noir en vie ; vide, il plongeait son porteur dans l'angoisse.", es: "Corazón portátil que mantenía vivo el espejo negro; vacío, sumía a su dueño en la angustia." },
      { ko: "무게추. 가방 밑바닥에서 자주 발견되어 몸을 단련하는 도구였던 것으로 보인다.", en: "A weight, often found at the bottom of bags; probably a training device.", ja: "重り。かばんの底からよく見つかり、体を鍛える道具だったとみられる。", zh: "砝码，常见于包底，可能是健身器具。", fr: "Un poids souvent trouvé au fond des sacs : sans doute un outil d'entraînement.", es: "Un peso hallado a menudo en el fondo de los bolsos: quizá un aparato de entrenamiento." },
    ],
  },
  {
    id: "card", emoji: "💳", name: { ko: "교통카드", en: "Transit card", ja: "交通系ICカード", zh: "交通卡", fr: "Carte de transport", es: "Tarjeta de transporte" },
    material: { ko: "플라스틱, 구리 안테나", en: "Plastic, copper antenna", ja: "プラスチック、銅アンテナ", zh: "塑料、铜天线", fr: "Plastique, antenne en cuivre", es: "Plástico, antena de cobre" },
    guesses: [
      { ko: "문을 여는 얇은 열쇠. 사람들은 이것을 기계에 대며 '삑' 하는 소리를 함께 냈던 것으로 보인다.", en: "A thin key that opened gates; people seem to have touched it to machines while a 'beep' sounded.", ja: "門を開ける薄い鍵。機械にかざすと「ピッ」と鳴ったらしい。", zh: "开门的薄钥匙，人们把它贴在机器上，伴随“嘀”的一声。", fr: "Fine clé qui ouvrait les portes au son d'un « bip ».", es: "Fina llave que abría puertas con un «pip»." },
      { ko: "지하 세계로 내려가는 통행증. 매일 아침 수백만 명이 같은 시각에 땅속으로 들어갔다.", en: "A pass to the underworld; every morning millions descended underground at the same hour.", ja: "地下世界への通行証。毎朝数百万人が同じ時刻に地中へ入った。", zh: "通往地下世界的通行证，每天早上数百万人同一时刻钻入地下。", fr: "Laissez-passer pour le monde souterrain, où des millions descendaient chaque matin.", es: "Pase al inframundo, donde millones bajaban cada mañana a la misma hora." },
    ],
  },
  {
    id: "remote", emoji: "📺", name: { ko: "리모컨", en: "Remote control", ja: "リモコン", zh: "遥控器", fr: "Télécommande", es: "Mando a distancia" },
    material: { ko: "플라스틱, 고무 단추", en: "Plastic, rubber buttons", ja: "プラスチック、ゴムボタン", zh: "塑料、橡胶按键", fr: "Plastique, boutons en caoutchouc", es: "Plástico, botones de goma" },
    guesses: [
      { ko: "가족 권력의 상징인 홀(笏). 소파 틈에서 자주 나와, 숨기는 것이 관습이었던 듯하다.", en: "A sceptre of household power, often found inside sofas; hiding it seems to have been customary.", ja: "家族の権力を示す笏。ソファの隙間からよく出土し、隠すのが慣習だったようだ。", zh: "象征家庭权力的笏，常在沙发缝里出土，似乎有藏起来的习俗。", fr: "Sceptre du pouvoir familial, souvent caché dans les canapés.", es: "Cetro del poder familiar, a menudo escondido en los sofás." },
      { ko: "숫자를 누르던 기도 도구. 같은 단추만 유난히 닳아 있다.", en: "A numbered prayer device; one button is always worn far more than the rest.", ja: "数字を押す祈りの道具。同じボタンだけ極端にすり減っている。", zh: "按数字的祈祷器具，总有一个键磨损得特别厉害。", fr: "Instrument de prière à chiffres ; un bouton est toujours bien plus usé.", es: "Instrumento de oración numerado; un botón siempre está mucho más gastado." },
    ],
  },
  {
    id: "sneakers", emoji: "👟", name: { ko: "운동화", en: "Sneakers", ja: "スニーカー", zh: "运动鞋", fr: "Baskets", es: "Zapatillas" },
    material: { ko: "합성 고무, 폴리에스터", en: "Synthetic rubber, polyester", ja: "合成ゴム、ポリエステル", zh: "合成橡胶、涤纶", fr: "Caoutchouc synthétique, polyester", es: "Caucho sintético, poliéster" },
    guesses: [
      { ko: "달리기 신에게 바친 신발. 대부분 거의 신지 않은 깨끗한 상태로 상자째 출토된다.", en: "Shoes offered to a god of running, mostly found unworn, still in their boxes.", ja: "走りの神に捧げた靴。ほとんど履かれず箱ごと出土する。", zh: "献给跑步之神的鞋，大多几乎没穿过，连盒出土。", fr: "Chaussures offertes à un dieu de la course, presque jamais portées, encore en boîte.", es: "Zapatillas ofrendadas a un dios de la carrera, casi sin usar, aún en su caja." },
      { ko: "부족을 구분하는 표식. 옆면 무늬로 서로 다른 무리를 알아봤던 것으로 보인다.", en: "Tribal markers: the side patterns seem to have told groups apart.", ja: "部族を見分ける標識。側面の模様で集団を見分けたらしい。", zh: "区分部落的标识，侧面花纹似乎用来辨认不同群体。", fr: "Marqueurs tribaux : les motifs latéraux distinguaient les groupes.", es: "Marcas tribales: los dibujos laterales distinguían a los grupos." },
    ],
  },
  {
    id: "keyboard", emoji: "⌨️", name: { ko: "키보드", en: "Keyboard", ja: "キーボード", zh: "键盘", fr: "Clavier", es: "Teclado" },
    material: { ko: "플라스틱, 금속 스프링", en: "Plastic, metal springs", ja: "プラスチック、金属ばね", zh: "塑料、金属弹簧", fr: "Plastique, ressorts métalliques", es: "Plástico, muelles metálicos" },
    guesses: [
      { ko: "문자를 새기던 판. 틈에서 과자 부스러기가 다량 나와, 일하며 먹는 풍습이 있었던 것으로 보인다.", en: "A tablet for inscribing letters; crumbs in its gaps suggest people ate while working.", ja: "文字を刻む板。隙間から菓子くずが大量に出て、働きながら食べる風習があったようだ。", zh: "刻字的板，缝隙里大量饼干屑，说明有边工作边吃的习俗。", fr: "Tablette d'écriture ; des miettes dans ses interstices révèlent qu'on mangeait en travaillant.", es: "Tablilla de escritura; las migas entre las teclas revelan que se comía trabajando." },
      { ko: "타악기. 밤늦게까지 '타닥타닥' 연주되었다는 기록이 많다.", en: "A percussion instrument, often recorded as being played late into the night.", ja: "打楽器。夜遅くまで「カタカタ」と演奏された記録が多い。", zh: "打击乐器，常有深夜“嗒嗒”演奏的记载。", fr: "Instrument de percussion, souvent joué tard dans la nuit.", es: "Instrumento de percusión, tocado a menudo hasta tarde." },
    ],
  },
  {
    id: "umbrella", emoji: "☂️", name: { ko: "우산", en: "Umbrella", ja: "傘", zh: "雨伞", fr: "Parapluie", es: "Paraguas" },
    material: { ko: "철 살, 나일론", en: "Steel ribs, nylon", ja: "鉄の骨、ナイロン", zh: "钢伞骨、尼龙", fr: "Baleines d'acier, nylon", es: "Varillas de acero, nailon" },
    guesses: [
      { ko: "공용 재산. 한 사람이 여러 개를 가졌지만 정작 비 오는 날에는 없었다는 기록이 남아 있다.", en: "Common property: one person owned many, yet records say none was at hand on rainy days.", ja: "共有財産。一人がいくつも持っていたが、雨の日には手元になかったと記録されている。", zh: "公共财产：一人拥有很多把，可下雨那天总是没有。", fr: "Bien commun : chacun en possédait plusieurs, mais jamais un les jours de pluie.", es: "Bien común: cada uno tenía varios, pero ninguno los días de lluvia." },
      { ko: "접이식 휴대 지붕. 지하철역 분실물 보관소에서 대량으로 출토된다.", en: "A folding portable roof, unearthed in huge numbers at station lost-property offices.", ja: "折りたたみ式の携帯屋根。駅の遺失物置き場から大量に出土する。", zh: "折叠便携屋顶，在车站失物招领处大量出土。", fr: "Toit portatif pliant, retrouvé en masse aux objets trouvés des gares.", es: "Tejado portátil plegable, hallado en masa en objetos perdidos de las estaciones." },
    ],
  },
  {
    id: "receipt", emoji: "🧾", name: { ko: "영수증", en: "Receipt", ja: "レシート", zh: "收据", fr: "Ticket de caisse", es: "Recibo" },
    material: { ko: "감열지", en: "Thermal paper", ja: "感熱紙", zh: "热敏纸", fr: "Papier thermique", es: "Papel térmico" },
    guesses: [
      { ko: "글자가 사라지는 신비한 두루마리. 지갑마다 수십 장씩 접혀 있어 부적으로 쓰였던 듯하다.", en: "A mysterious scroll whose letters fade; dozens are folded in every wallet, perhaps as charms.", ja: "文字が消える不思議な巻物。財布ごとに何十枚も折りたたまれ、お守りだったらしい。", zh: "字迹会消失的神秘卷轴，每个钱包里折着几十张，可能是护身符。", fr: "Rouleau mystérieux aux lettres qui s'effacent, plié par dizaines dans chaque portefeuille.", es: "Rollo misterioso de letras que se borran, doblado por docenas en cada cartera." },
      { ko: "21세기 사람들의 일기. 날짜와 먹은 것, 산 것이 빠짐없이 적혀 있다.", en: "Diaries of 21st-century people, recording every date, meal and purchase.", ja: "21世紀の人々の日記。日付と食べた物、買った物が漏れなく書かれている。", zh: "21世纪人的日记，日期、吃的和买的一样不落。", fr: "Journaux intimes du XXIe siècle : dates, repas et achats, sans exception.", es: "Diarios del siglo XXI: fechas, comidas y compras, sin excepción." },
    ],
  },
];

export const SITES: Six[] = [
  { ko: "옛 서울 강남 지층 제3층", en: "Old Seoul, Gangnam stratum 3", ja: "旧ソウル江南 第3層", zh: "旧首尔江南第3层", fr: "Ancienne Séoul, strate 3 de Gangnam", es: "Antigua Seúl, estrato 3 de Gangnam" },
  { ko: "옛 지하철 2호선 터널", en: "Former subway Line 2 tunnel", ja: "旧地下鉄2号線トンネル", zh: "旧地铁2号线隧道", fr: "Ancien tunnel de la ligne 2", es: "Antiguo túnel de la línea 2" },
  { ko: "옛 아파트 단지 분리수거장 유적", en: "Recycling yard of an old apartment complex", ja: "旧団地の分別ゴミ置き場遺跡", zh: "旧小区垃圾分类站遗址", fr: "Aire de tri d'une ancienne résidence", es: "Punto de reciclaje de un antiguo bloque" },
  { ko: "옛 대학가 원룸 유적", en: "Student studio ruins near an old university", ja: "旧大学街ワンルーム遺跡", zh: "旧大学城单间公寓遗址", fr: "Ruines de studios étudiants", es: "Ruinas de estudios estudiantiles" },
  { ko: "옛 편의점 창고 지층", en: "Convenience-store storeroom stratum", ja: "旧コンビニ倉庫の地層", zh: "旧便利店仓库地层", fr: "Strate d'une réserve de supérette", es: "Estrato de un almacén de tienda" },
];

export const CONDITION: Six[] = [
  { ko: "보존 상태 양호", en: "Well preserved", ja: "保存状態良好", zh: "保存良好", fr: "Bien conservé", es: "Bien conservado" },
  { ko: "화면에 금이 감", en: "Cracked surface", ja: "表面にひび", zh: "表面有裂纹", fr: "Surface fêlée", es: "Superficie agrietada" },
  { ko: "스티커 흔적 다수", en: "Many sticker marks", ja: "シール跡多数", zh: "多处贴纸痕迹", fr: "Nombreuses traces d'autocollants", es: "Muchas marcas de pegatinas" },
  { ko: "부분 결실", en: "Partly missing", ja: "一部欠損", zh: "部分缺损", fr: "Partiellement manquant", es: "Parcialmente perdido" },
];

export type Dig = { items: [number, number, number]; guesses: [number, number, number]; site: number; cond: number; no: number };

export function makeDig(rand: () => number = Math.random): Dig {
  const i = (n: number) => Math.floor(rand() * n);
  const pool = ITEMS.map((_, k) => k);
  const items: number[] = [];
  while (items.length < 3) items.push(pool.splice(i(pool.length), 1)[0]!);
  return { items: items as Dig["items"], guesses: [i(2), i(2), i(2)], site: i(SITES.length), cond: i(CONDITION.length), no: 1000 + i(9000) };
}

export function formatDig(d: Dig): string {
  return new URLSearchParams({ i: d.items.join("."), g: d.guesses.join(""), s: String(d.site), c: String(d.cond), n: String(d.no) }).toString();
}

export function parseDig(search: string): Dig | null {
  const q = new URLSearchParams(search);
  const items = (q.get("i") ?? "").split(".").map(Number);
  const guesses = (q.get("g") ?? "").split("").map(Number);
  const site = Number(q.get("s")), cond = Number(q.get("c")), no = Number(q.get("n"));
  if (items.length !== 3 || new Set(items).size !== 3 || items.some((v) => !Number.isInteger(v) || v < 0 || v >= ITEMS.length)) return null;
  if (guesses.length !== 3 || guesses.some((v) => v !== 0 && v !== 1)) return null;
  if (!Number.isInteger(site) || site < 0 || site >= SITES.length || !Number.isInteger(cond) || cond < 0 || cond >= CONDITION.length) return null;
  if (!Number.isInteger(no) || no < 1000 || no > 9999) return null;
  return { items: items as Dig["items"], guesses: guesses as Dig["guesses"], site, cond, no };
}
