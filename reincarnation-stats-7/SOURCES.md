# 환생 통계 배치 7 출처: 위키백과 목록으로 넓힌 국조·국가 동물·국화

2026-10-13에 받았다. `collect_symbols_wikipedia.py`(표준 라이브러리만 사용)를 다시 돌리면 같은 방식으로 다시 만든다. API 응답은 `original/`에 있다. 배치 6(`reincarnation-stats-6/symbols.csv`)에 이미 있는 행(같은 `iso3`+`qid`)은 넣지 않았으므로 두 파일을 합쳐 쓴다.

## 결과

`symbols_wikipedia.csv` 267행, 코드 135개, 그림 파일 229개.

| kind | 행 | 코드 | 배치 6과 합친 행 |
|---|---|---|---|
| bird | 65 | 62 | 74 |
| animal | 126 | 83 | 139 |
| flower | 76 | 69 | 90 |
| tree | 0 | 0 | 3 |

- 국장 말고 다른 상징이 하나라도 있는 코드: 배치 6만 19개 → 합치면 **140개**(새로 생긴 코드 121개).
- 한국: 까치(Oriental Magpie, `bird`), 시베리아호랑이(`animal`), 무궁화(`flower`)가 생겼다.
- 목록별: `List of national animals` 191행, `List of national flowers` 76행.
- `tree`는 0행이다. 두 목록의 `note`에 "national tree"라고 적힌 행이 없다.
- `name_ko`가 빈 행 67개(Wikidata에 한국어 라벨이 없음), `artist`가 빈 행 6개.

열: 배치 6과 같은 11개(`iso3, kind, name_en, name_ko, qid, commons_file, image_url, licence, licence_url, artist, source_url`)에 `list_page`(사실이 나온 위키백과 목록 문서 이름)를 더했다.

## 사실 출처: 영어 위키백과 목록 (CC BY-SA 4.0)

"이 나라의 국조·국가 동물·국화는 무엇이다"라는 사실은 아래 두 문서에서 왔다. **CC BY-SA 4.0**이라 출처 표시가 필요하고, 가공본도 같은 조건으로 공개해야 한다. 배치 6(Wikidata, CC0)과 조건이 다르다.

| 문서 | 판(revision id) | 주소 |
|---|---|---|
| List of national animals | 1379858579 | https://en.wikipedia.org/w/index.php?title=List_of_national_animals&oldid=1379858579 |
| List of national flowers | 1377321774 | https://en.wikipedia.org/w/index.php?title=List_of_national_flowers&oldid=1377321774 |

입력은 배치 5의 `national_symbols_wikipedia.csv`에서 `kind`가 `animal`(211행)·`flower`(130행)인 341행이다. `dish`·`sport`는 쓰지 않았다. 저장해 둔 문서 HTML(`reincarnation-stats-5/original/wikipedia/*.parse.json`)에서 각 행의 링크를 찾아 문서 제목을 얻었다.

- 동물: 표에서 이름 칸의 링크. 같은 이름이 나라마다 다른 문서로 이어지는 경우(Lion → Lion / Lion (heraldry), Cow → Cow / Cow in Hinduism)는 구분·학명 칸까지 맞춰 그 나라 행의 링크를 골랐다.
- 꽃: `note`(문단 첫 문장)가 들어 있는 문단에서 이름과 글자가 같은 링크.
- 링크를 못 찾아 이름으로 대신 찾은 행 3개(`original/notes.json`): ARE Tribulus omanense(문서 없음), NOR Troms·POL Kashubia(지명이라 어차피 빠짐).

문서 제목 → Wikidata 항목은 MediaWiki API `action=query&prop=pageprops&ppprop=wikibase_item&redirects=1`(50개씩, `original/enwiki-pageprops-*.json`)로 얻었다.

### 종류 분류

`note`에 "national bird"가 있으면 `bird`, "national tree"가 있으면 `tree`, 꽃 목록 행은 `flower`, 나머지 동물 목록 행은 Wikidata 영어 설명에 bird가 있으면 `bird`, 아니면 `animal`. 물고기·곤충·파충류·개와 말 품종은 `animal`이다.

### 주의: 공식 지정이 아닌 것, 실제 동물이 아닌 것

- 목록에는 공식 지정이 아닌 "흔히 그렇게 부른다" 수준이 섞여 있다. 꽃 목록에서 문장이 "공식 국화는 없지만"으로 시작하는 나라: FRA(수레국화·마거리트·개양귀비·플뢰르 드 리스), NZL(은고사리, 꽃이 아니라 양치식물), BLR, HRV. 표시할 때 "공식"이라고 쓰지 않는 편이 안전하다.
- 동물 목록의 전설·문장 속 동물도 `animal`/`bird`로 들어 있다(15행): BEL Leo Belgicus, BGR·NLD lion(문장학 항목 Q338814), CHN Loong(용), GBR unicorn·Welsh Dragon, GRC phoenix, HUN Turul, ISR Lion of Judah, MDG zebu(문장), PRK chollima(천리마), PRT dragon·Rooster of Barcelos, RUS double-headed eagle, SRB Serbian eagle. 빼려면 이 `qid`로 거르면 된다. AUT·DEU·CZE의 문장 동물은 연결된 문서가 국장 문서여서 배치 6 국장과 같은 항목이라 들어가지 않았다.
- 영국(GBR)은 잉글랜드 사자, 스코틀랜드 유니콘, 웨일스 용처럼 구성국 상징이 GBR로 묶여 있다.
- 꽃 이름은 문장 속 링크라 속(屬)이나 과 수준인 것이 있다(AFG·TUR Tulipa, BGR Rosa, CZE·SVK Tilia, IRN Nymphaea, TUN Jasmine 등).
- NPL "Cow"는 목록이 Cow in Hinduism 문서로 연결해 항목이 `cattle in religion and mythology`(Q1178242)다. 그림은 소다.

## 이름과 그림: Wikidata (CC0)

`wbgetentities`(50개씩, `original/wikidata-entities-*.json`, 라벨·설명·P18·P225·P31만 남겨 저장)에서 영어·한국어 라벨과 P18(그림)을 받았다. P18이 여럿이면 선호 등급, 그다음 첫 번째. 새 이름은 Wikidata 표기 그대로라 `Red-crested Turaco`처럼 대문자가 섞여 있다. 영어 라벨이 영어가 아닌 1건(Q25851 `Poponejo`)은 `European rabbit`으로 적었다.

## 넣지 않은 행

입력 341행 = 남긴 267 + 라이선스로 뺀 8 + 그 전에 빠진 66(`skipped.csv`).

| 이유 | 행 |
|---|---|
| 배치 6에 이미 있음(같은 iso3+qid) | 23 |
| 꽃 목록 링크가 식물이 아님(언어·지명 등. P225도 없고 설명에 식물 낱말도 없음) | 19 |
| 직접 뺌(아래) | 13 |
| 문장에 링크된 이름이 없음(ARM AZE BTN CHN ECU HUN VNM) | 7 |
| 항목에 P18 그림 없음(BTN Druk, MNG Scabiosa comosa, MUS Ruizia boutoniana) | 3 |
| 위키백과 문서 없음(ARE Tribulus omanense) | 1 |

직접 뺀 13행은 그 나라의 국화가 아닌 링크다.

| 코드 | 이름 | 이유 |
|---|---|---|
| BGD | water lily | common-name link (family Nymphaeaceae) for Nymphaea nouchali, which batch 6 has |
| CAN | maple leaf | leaf emblem, not a flower; batch 6 has the sugar maple as tree |
| FRA | Iris pseudacorus | Kingdom of France / Brittany line, not the present state |
| FRA | Ulex | Kingdom of France / Brittany line, not the present state |
| FRA | heather | Kingdom of France / Brittany line, not the present state |
| ISR | Cyclamen persicum | second sentence item, not the chosen national flower |
| LKA | flame lily | Tamil Eelam (unrecognised state), not Sri Lanka |
| NLD | tulip | sentence says the tulip is a common belief, the daisy is the national flower |
| NOR | Lily-of-the-valley | county flower (Østfold), not national |
| NOR | Globe flower | county flower (Troms), not national |
| POL | Kashubian vetch | regional flower (Kashubia), not national |
| SGP | Vanda hookeriana | parent species of the hybrid Vanda Miss Joaquim, not the flower itself |
| SGP | Vanda teres | parent species of the hybrid Vanda Miss Joaquim, not the flower itself |

BTN(blue poppy)·HUN(tulip)은 목록에 이름이 있지만 링크가 없어 빠졌다. BOL·PER 칸투타, CYP 시클라멘, PRT 라벤더는 아래 라이선스 때문에 빠졌다.

## 그림 라이선스: Commons API

파일 236개를 `action=query&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=320`으로 50개씩 물었다(`original/commons-imageinfo-*.json`). `LicenseShortName`이 Public domain, CC0, CC BY, CC BY-SA인 것만 남겼다. `image_url`은 배치 6과 같이 API가 준 330px 주소에서 쿼리 문자열을 떼고 호스트를 `upload.wikimedia.org`로 바꾼 것이다(6개 뽑아 HTTP 200 확인).

남긴 267행:

| 라이선스 | 행 |
|---|---|
| CC BY-SA 3.0 | 97 |
| CC BY-SA 4.0 | 69 |
| Public domain | 32 |
| CC BY-SA 2.0 | 18 |
| CC BY 2.0 | 17 |
| CC BY-SA 2.5 | 9 |
| CC BY 4.0 | 9 |
| CC BY 3.0 | 7 |
| CC0 | 4 |
| CC BY-SA 1.0 | 3 |
| CC BY-SA 2.0 de | 1 |
| CC BY 2.5 | 1 |

라이선스 때문에 뺀 8행(`dropped.csv`, 파일 7개). GFDL 단독과 `Attribution`은 요청한 네 종류가 아니어서 뺐다.

| 코드 | kind | 이름 | 파일 | 라이선스 |
|---|---|---|---|---|
| AUS | animal | Osphranter rufus | Red kangaroo - melbourne zoo.jpg | GFDL 1.2 |
| BOL | flower | Cantua buxifolia | Kantutas Cuzco.jpg | GFDL |
| BWA | animal | Equus quagga | Plains Zebra Equus quagga.jpg | GFDL 1.2 |
| CYP | flower | Cyclamen cyprium | Cyclamen cyprium.jpg | GFDL |
| LVA | animal | Adalia bipunctata | Adalia bipunctata (2007-04-08).jpg | Attribution |
| PER | flower | Cantua buxifolia | Kantutas Cuzco.jpg | GFDL |
| PRT | flower | Lavandula | Single lavender flower02.jpg | GFDL 1.2 |
| TZA | animal | giraffe | Giraffe Mikumi National Park.jpg | GFDL 1.2 |

## 표시할 때

- 사실: "출처: 영어 위키백과 List of national animals / List of national flowers, CC BY-SA 4.0"과 문서 링크.
- 그림: 행마다 `artist`, `licence`, `source_url`. CC BY·CC BY-SA는 저작자와 라이선스 표시가 필요하다.
