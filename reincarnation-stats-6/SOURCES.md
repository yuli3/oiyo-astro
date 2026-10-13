# 환생 통계 배치 6 출처: 나라 상징 그림

2026-10-13에 받았다. `collect_symbols.py`(표준 라이브러리만 사용)를 다시 돌리면 같은 방식으로 다시 만든다. 원본 응답은 `original/`에 있다. 국기는 저장소의 flag-icons(MIT)를 쓰므로 여기에 없다.

## 결과

`symbols.csv` 274행, 코드 235개(그림이 하나라도 있는 곳).

| kind | 행 | 코드 |
|---|---|---|
| emblem (국장) | 235 | 235 |
| flower | 14 | 13 |
| animal | 13 | 7 |
| bird | 9 | 9 |
| tree | 3 | 3 |

국장 말고 다른 상징이 있는 코드는 19개뿐이다(ALA AUS BEL BGD BGR CAN COD FIN GUM ISR JOR JPN MEX MUS NGA SAU SGP THA USA). 한국은 국장만 있다.

열: `iso3, kind, name_en, name_ko, qid, commons_file, image_url, licence, licence_url, artist, source_url`.

- `name_en`·`name_ko`: Wikidata 라벨. 국장은 P237(국장 항목) 라벨이고, 그 항목이 없으면 `Coat of arms of <나라>`로 적고 `name_ko`는 비웠다(15행). 영어 라벨이 없는 상징 2개는 mul 라벨·학명(P225)을 썼다. `name_ko`는 라벨 그대로라 `국화 (식물)`처럼 괄호가 붙은 것이 있다.
- `qid`: 상징 항목. 국장은 P237 항목, 없으면 나라 항목.
- `image_url`: **너비 330px**이다. 요청은 320px이었지만 Wikimedia가 썸네일 너비를 정해진 단계로만 내준다. `iiurlwidth=320`을 주면 API가 330px 주소를 돌려주고, `upload.wikimedia.org/.../320px-...`는 HTTP 400이다. API가 준 주소는 `thumb.wikimedia.org/...?utm_*` 꼴이어서 쿼리 문자열을 떼고 호스트를 `upload.wikimedia.org`로 바꿨다. 같은 경로가 200으로 응답하는 것을 9개 뽑아 확인했다. SVG 원본은 PNG 썸네일이다.
- `artist`: Commons `Artist` 값에서 HTML을 걷어낸 글자. 32행은 비어 있다(대부분 퍼블릭 도메인 국장). 일부는 길다(KAZ 643자).

## 사실 출처: Wikidata만 (CC0)

위키백과 목록 문서는 쓰지 않았다. 질의는 `original/ql-emblem.rq`, `original/ql-official-symbol.rq`에 그대로 있다(Wikidata Query Service).

- 나라: P298(ISO 3166-1 alpha-3)이 있고 P576(해체일)이 없는 항목. 배치 3의 ISO 코드표(`original/iso3166.csv`, 249개)에 있는 코드만 남겼다. 코드표에 없는 P298 값 6개(ASC ATB ATN CRQ JTN XKS)는 뺐다.
- 국장: P94(문장 그림)의 truthy 값. 한 나라에 값이 여럿이면 파일 이름순 첫 번째. 이름은 P237.
- 상징: P2238(공식 상징) 진술 중 폐기 등급과 종료일(P582) 한정어가 있는 것을 뺀 것. 그림은 상징 항목의 P18(여럿이면 파일 이름순 첫 번째).
- 종류 분류: 진술 한정어의 영어 라벨(예: national bird, floral emblem, arboreal emblem, tree, flower, animal, fish, dog)을 먼저 보고, 없으면 상징 항목의 영어 설명(species of bird / mammal / plant …)으로 정했다. 둘 다 Wikidata(CC0)다. 곤충·물고기·개·말 품종은 `animal`에 넣었다. 분류 계통(P171)을 따라가는 질의는 504 시간 초과여서 쓰지 않았다.
- 다섯 종류에 안 맞아 뺀 진술 9개: 호수·암석·보석·음식·스포츠·건물, 인도 국장 항목, 살라딘의 독수리(문장 도안). 목록은 `original/notes.json`.

Wikidata에는 "국조·국화"를 나타내는 전용 속성이 없고 P2238을 쓴 나라가 21개 코드뿐이다. 배치 5에서 찾아본 다른 구조(national flower 등 분류 항목, `ql-national-items-*.tsv`)도 10여 건이라 이번에는 더하지 않았다. 그래서 새·동물·꽃·나무는 39행에 그친다.

## 그림 라이선스: Commons API

파일 278개를 `action=query&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=320`으로 50개씩 물었다(`original/commons-imageinfo-*.json`). `LicenseShortName`이 Public domain, CC0, CC BY, CC BY-SA인 것만 남겼다.

남긴 274행:

| 라이선스 | 행 |
|---|---|
| Public domain | 166 |
| CC BY-SA 3.0 | 53 |
| CC BY-SA 4.0 | 31 |
| CC0 | 8 |
| CC BY 2.0 | 4 |
| CC BY 4.0 | 4 |
| CC BY-SA 2.5 | 2 |
| CC BY 3.0 | 2 |
| CC BY 2.5 | 2 |
| CC BY-SA 2.0 | 2 |

라이선스 때문에 뺀 파일 4개(`dropped.csv`):

| 코드 | kind | 파일 | 라이선스 |
|---|---|---|---|
| DMA | emblem | Coat of arms of Dominica.svg | Attribution |
| NIC | emblem | Coat of arms of Nicaragua.svg | Attribution |
| OMN | emblem | National emblem of Oman.svg | OGL-om 1.0 |
| THA | animal | Asian elephant - melbourne zoo.jpg | GFDL 1.2 |

Commons에 없는 파일은 0개였다.

## 쓸 때 주의

- CC BY·CC BY-SA 100행은 그림마다 저작자(`artist`)·라이선스(`licence`, `licence_url`)·원본(`source_url`) 표시가 필요하다. CC BY-SA는 그림을 고쳐 쓰면 같은 조건으로 공개해야 한다.
- Commons의 "Public domain" 표시는 저작권만 말한다. 국장은 나라마다 사용을 제한하는 법이 따로 있을 수 있고(Commons의 insignia 경고), 이번에 나라별로 확인하지 않았다.
- 라이선스 값은 Commons 파일 설명의 기계 판독 값이다. 파일 설명을 하나씩 읽어 확인하지는 않았다.
- 국장이 없는 ISO 코드 14개: ATA BES BVT CXR DMA ESH HMD MTQ NIC OMN SHN SJM TUR UMI. DMA·NIC·OMN은 라이선스로 빠졌고, 나머지는 Wikidata 나라 항목에 P94가 없다(튀르키예는 공식 국장이 없다).
- 요청 헤더는 `User-Agent: oiyo.net reincarnation data (support@oiyo.net)`, 요청 간격 0.25초 이상.
