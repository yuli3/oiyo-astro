// French Republican calendar day names (Fabre d'Églantine, 1793).
// French from convertdate's table (source: Wikipedia "Calendrier républicain"),
// English and Korean glosses written for OIYO. Days 5, 15, 25 of each month are
// animals, days 10, 20, 30 are tools; Nivôse names minerals instead of plants.
// One string per month, "|" separated, 30 names each; month 13 = sansculottides.

const FR = [
  "Raisin|Safran|Châtaigne|Colchique|Cheval|Balsamine|Carotte|Amaranthe|Panais|Cuve|Pomme de terre|Immortelle|Potiron|Réséda|Âne|Belle de nuit|Citrouille|Sarrasin|Tournesol|Pressoir|Chanvre|Pêche|Navet|Amaryllis|Bœuf|Aubergine|Piment|Tomate|Orge|Tonneau",
  "Pomme|Céleri|Poire|Betterave|Oie|Héliotrope|Figue|Scorsonère|Alisier|Charrue|Salsifis|Mâcre|Topinambour|Endive|Dindon|Chervis|Cresson|Dentelaire|Grenade|Herse|Bacchante|Azerole|Garance|Orange|Faisan|Pistache|Macjonc|Coing|Cormier|Rouleau",
  "Raiponce|Turneps|Chicorée|Nèfle|Cochon|Mâche|Chou-fleur|Miel|Genièvre|Pioche|Cire|Raifort|Cèdre|Sapin|Chevreuil|Ajonc|Cyprès|Lierre|Sabine|Hoyau|Érable à sucre|Bruyère|Roseau|Oseille|Grillon|Pignon|Liège|Truffe|Olive|Pelle",
  "Tourbe|Houille|Bitume|Soufre|Chien|Lave|Terre végétale|Fumier|Salpêtre|Fléau|Granit|Argile|Ardoise|Grès|Lapin|Silex|Marne|Pierre à chaux|Marbre|Van|Pierre à plâtre|Sel|Fer|Cuivre|Chat|Étain|Plomb|Zinc|Mercure|Crible",
  "Lauréole|Mousse|Fragon|Perce-neige|Taureau|Laurier-thym|Amadouvier|Mézéréon|Peuplier|Coignée|Ellébore|Brocoli|Laurier|Avelinier|Vache|Buis|Lichen|If|Pulmonaire|Serpette|Thlaspi|Thimelé|Chiendent|Trainasse|Lièvre|Guède|Noisetier|Cyclamen|Chélidoine|Traîneau",
  "Tussilage|Cornouiller|Violier|Troène|Bouc|Asaret|Alaterne|Violette|Marceau|Bêche|Narcisse|Orme|Fumeterre|Vélar|Chèvre|Épinard|Doronic|Mouron|Cerfeuil|Cordeau|Mandragore|Persil|Cochléaria|Pâquerette|Thon|Pissenlit|Sylvie|Capillaire|Frêne|Plantoir",
  "Primevère|Platane|Asperge|Tulipe|Poule|Bette|Bouleau|Jonquille|Aulne|Couvoir|Pervenche|Charme|Morille|Hêtre|Abeille|Laitue|Mélèze|Ciguë|Radis|Ruche|Gainier|Romaine|Marronnier|Roquette|Pigeon|Lilas|Anémone|Pensée|Myrtille|Greffoir",
  "Rose|Chêne|Fougère|Aubépine|Rossignol|Ancolie|Muguet|Champignon|Hyacinthe|Râteau|Rhubarbe|Sainfoin|Bâton d'or|Chamerisier|Ver à soie|Consoude|Pimprenelle|Corbeille d'or|Arroche|Sarcloir|Statice|Fritillaire|Bourrache|Valériane|Carpe|Fusain|Civette|Buglosse|Sénevé|Houlette",
  "Luzerne|Hémérocalle|Trèfle|Angélique|Canard|Mélisse|Fromental|Martagon|Serpolet|Faux|Fraise|Bétoine|Pois|Acacia|Caille|Œillet|Sureau|Pavot|Tilleul|Fourche|Barbeau|Camomille|Chèvrefeuille|Caille-lait|Tanche|Jasmin|Verveine|Thym|Pivoine|Chariot",
  "Seigle|Avoine|Oignon|Véronique|Mulet|Romarin|Concombre|Échalote|Absinthe|Faucille|Coriandre|Artichaut|Girofle|Lavande|Chamois|Tabac|Groseille|Gesse|Cerise|Parc|Menthe|Cumin|Haricot|Orcanète|Pintade|Sauge|Ail|Vesce|Blé|Chalémie",
  "Épeautre|Bouillon blanc|Melon|Ivraie|Bélier|Prêle|Armoise|Carthame|Mûre|Arrosoir|Panic|Salicorne|Abricot|Basilic|Brebis|Guimauve|Lin|Amande|Gentiane|Écluse|Carline|Câprier|Lentille|Aunée|Loutre|Myrte|Colza|Lupin|Coton|Moulin",
  "Prune|Millet|Lycoperdon|Escourgeon|Saumon|Tubéreuse|Sucrion|Apocyn|Réglisse|Échelle|Pastèque|Fenouil|Épine vinette|Noix|Truite|Citron|Cardère|Nerprun|Tagette|Hotte|Églantier|Noisette|Houblon|Sorgho|Écrevisse|Bigarade|Verge d'or|Maïs|Marron|Panier",
  "Vertu|Génie|Travail|Opinion|Récompenses|Révolution",
];

const EN = [
  "Grape|Saffron|Chestnut|Autumn crocus|Horse|Impatiens|Carrot|Amaranth|Parsnip|Vat|Potato|Everlasting flower|Squash|Mignonette|Donkey|Four o'clock flower|Pumpkin|Buckwheat|Sunflower|Wine press|Hemp|Peach|Turnip|Amaryllis|Ox|Aubergine|Chili pepper|Tomato|Barley|Barrel",
  "Apple|Celery|Pear|Beetroot|Goose|Heliotrope|Fig|Black salsify|Whitebeam|Plough|Salsify|Water chestnut|Jerusalem artichoke|Endive|Turkey|Skirret|Watercress|Leadwort|Pomegranate|Harrow|Baccharis|Azarole|Madder|Orange|Pheasant|Pistachio|Tuberous pea|Quince|Service tree|Roller",
  "Rampion|Turnip|Chicory|Medlar|Pig|Lamb's lettuce|Cauliflower|Honey|Juniper|Pickaxe|Wax|Horseradish|Cedar|Fir|Roe deer|Gorse|Cypress|Ivy|Savin juniper|Grub hoe|Sugar maple|Heather|Reed|Sorrel|Cricket|Pine nut|Cork|Truffle|Olive|Shovel",
  "Peat|Coal|Bitumen|Sulphur|Dog|Lava|Topsoil|Manure|Saltpetre|Flail|Granite|Clay|Slate|Sandstone|Rabbit|Flint|Marl|Limestone|Marble|Winnowing basket|Gypsum|Salt|Iron|Copper|Cat|Tin|Lead|Zinc|Mercury|Sieve",
  "Spurge laurel|Moss|Butcher's broom|Snowdrop|Bull|Laurustinus|Tinder fungus|Mezereon|Poplar|Axe|Hellebore|Broccoli|Bay laurel|Filbert|Cow|Box|Lichen|Yew|Lungwort|Pruning knife|Pennycress|Daphne|Couch grass|Knotgrass|Hare|Woad|Hazel|Cyclamen|Celandine|Sledge",
  "Coltsfoot|Dogwood|Wallflower|Privet|Billy goat|Wild ginger|Italian buckthorn|Violet|Goat willow|Spade|Daffodil|Elm|Fumitory|Hedge mustard|Goat|Spinach|Leopard's bane|Pimpernel|Chervil|Garden line|Mandrake|Parsley|Scurvy grass|Daisy|Tuna|Dandelion|Wood anemone|Maidenhair fern|Ash tree|Dibber",
  "Primrose|Plane tree|Asparagus|Tulip|Hen|Chard|Birch|Jonquil|Alder|Hatchery|Periwinkle|Hornbeam|Morel|Beech|Bee|Lettuce|Larch|Hemlock|Radish|Beehive|Judas tree|Romaine|Horse chestnut|Rocket|Pigeon|Lilac|Anemone|Pansy|Bilberry|Grafting knife",
  "Rose|Oak|Fern|Hawthorn|Nightingale|Columbine|Lily of the valley|Mushroom|Hyacinth|Rake|Rhubarb|Sainfoin|Gold wallflower|Fly honeysuckle|Silkworm|Comfrey|Burnet|Basket of gold|Orache|Hoe|Sea lavender|Fritillary|Borage|Valerian|Carp|Spindle tree|Chive|Bugloss|Mustard|Shepherd's crook",
  "Alfalfa|Daylily|Clover|Angelica|Duck|Lemon balm|Oat grass|Martagon lily|Wild thyme|Scythe|Strawberry|Betony|Pea|Acacia|Quail|Carnation|Elder|Poppy|Linden|Pitchfork|Cornflower|Chamomile|Honeysuckle|Bedstraw|Tench|Jasmine|Verbena|Thyme|Peony|Cart",
  "Rye|Oats|Onion|Speedwell|Mule|Rosemary|Cucumber|Shallot|Wormwood|Sickle|Coriander|Artichoke|Clove|Lavender|Chamois|Tobacco|Redcurrant|Vetchling|Cherry|Pen|Mint|Cumin|Bean|Alkanet|Guinea fowl|Sage|Garlic|Vetch|Wheat|Shawm",
  "Spelt|Mullein|Melon|Ryegrass|Ram|Horsetail|Mugwort|Safflower|Blackberry|Watering can|Panic grass|Glasswort|Apricot|Basil|Ewe|Marshmallow|Flax|Almond|Gentian|Canal lock|Carline thistle|Caper|Lentil|Elecampane|Otter|Myrtle|Rapeseed|Lupin|Cotton|Mill",
  "Plum|Millet|Puffball|Winter barley|Salmon|Tuberose|Sugar barley|Dogbane|Liquorice|Ladder|Watermelon|Fennel|Barberry|Walnut|Trout|Lemon|Teasel|Buckthorn|Marigold|Harvest basket|Dog rose|Hazelnut|Hops|Sorghum|Crayfish|Bitter orange|Goldenrod|Maize|Sweet chestnut|Basket",
  "Virtue|Genius|Labour|Opinion|Rewards|Revolution",
];

const KO = [
  "포도|사프란|밤|콜키쿰|말|봉선화|당근|아마란스|파스닙|술통|감자|밀짚꽃|서양호박|레세다|당나귀|분꽃|호박|메밀|해바라기|포도 압착기|삼|복숭아|순무|아마릴리스|소|가지|고추|토마토|보리|나무통",
  "사과|셀러리|배|비트|거위|헬리오트로프|무화과|검은 선모|팥배나무|쟁기|선모|마름|돼지감자|엔다이브|칠면조|스커릿|물냉이|플룸바고|석류|써레|바카리스|아자롤|꼭두서니|오렌지|꿩|피스타치오|덩이완두|마르멜로|서양마가목|땅 고르는 롤러",
  "라푼젤|사료용 순무|치커리|서양모과|돼지|콘샐러드|콜리플라워|꿀|노간주나무|곡괭이|밀랍|서양고추냉이|시더|전나무|노루|가시금작화|사이프러스|아이비|사빈향나무|괭이|사탕단풍|헤더|갈대|수영|귀뚜라미|잣|코르크|트뤼플|올리브|삽",
  "토탄|석탄|역청|유황|개|용암|겉흙|거름|초석|도리깨|화강암|점토|점판암|사암|토끼|부싯돌|이회토|석회암|대리석|키|석고|소금|철|구리|고양이|주석|납|아연|수은|체",
  "로레올|이끼|루스쿠스|스노드롭|황소|비부르눔|말굽버섯|메제레온|포플러|도끼|헬레보어|브로콜리|월계수|서양개암|암소|회양목|지의류|주목|풀모나리아|전지칼|말냉이|팥꽃나무|개밀|마디풀|산토끼|대청|개암나무|시클라멘|애기똥풀|썰매",
  "관동화|층층나무|꽃무|쥐똥나무|숫염소|족도리풀|상록갈매나무|제비꽃|호랑버들|가래|수선화|느릅나무|푸마리아|장대나물|암염소|시금치|도로니쿰|별봄맞이|처빌|정원 줄|맨드레이크|파슬리|스커비그래스|데이지|참치|민들레|숲바람꽃|공작고사리|물푸레나무|파종 막대",
  "앵초|플라타너스|아스파라거스|튤립|암탉|근대|자작나무|노랑수선화|오리나무|부화장|빈카|서어나무|곰보버섯|너도밤나무|꿀벌|상추|낙엽송|독당근|래디시|벌통|박태기나무|로메인|마로니에|루콜라|비둘기|라일락|아네모네|팬지|빌베리|접칼",
  "장미|참나무|고사리|산사나무|나이팅게일|매발톱꽃|은방울꽃|버섯|히아신스|갈퀴|대황|세인포인|노랑꽃무|괴불나무|누에|컴프리|오이풀|알리숨|오라크|호미|스타티스|패모|보리지|쥐오줌풀|잉어|화살나무|차이브|부글로스|겨자|목동 지팡이",
  "알팔파|원추리|토끼풀|안젤리카|오리|레몬밤|귀리풀|마르타곤 백합|백리향|큰 낫|딸기|베토니|완두|아카시아|메추라기|카네이션|딱총나무|양귀비|린덴|쇠스랑|수레국화|캐모마일|인동덩굴|솔나물|텐치|재스민|버베나|타임|작약|수레",
  "호밀|귀리|양파|꼬리풀|노새|로즈마리|오이|샬롯|쓴쑥|낫|고수|아티초크|정향|라벤더|샤무아|담배|레드커런트|연리초|체리|가축우리|박하|커민|강낭콩|알카넷|뿔닭|세이지|마늘|살갈퀴|밀|목동 피리",
  "스펠트밀|우단담배풀|멜론|독보리|숫양|쇠뜨기|쑥|잇꽃|블랙베리|물뿌리개|개기장|퉁퉁마디|살구|바질|암양|마시멜로 풀|아마|아몬드|용담|수문|카를리나 엉겅퀴|케이퍼|렌틸콩|목향|수달|도금양|유채|루피너스|목화|방앗간",
  "자두|기장|말불버섯|겨울보리|연어|월하향|사탕보리|개정향풀|감초|사다리|수박|회향|매자나무|호두|송어|레몬|산토끼꽃|갈매나무|메리골드|수확 바구니|들장미|헤이즐넛|홉|수수|가재|광귤|미역취|옥수수|마롱|바구니",
  "미덕|재능|노동|여론|보상|혁명",
];

const split = (rows: string[]) => rows.map((r) => r.split("|"));
export const REPUBLICAN_DAYS = { fr: split(FR), en: split(EN), ko: split(KO) } as const;
