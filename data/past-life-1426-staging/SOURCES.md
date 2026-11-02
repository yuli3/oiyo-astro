# past-life-1426 sources (collected 2026-11-02 KST)

Nothing here has been used in a repo. Every licence is copied from the source's metadata, not reviewed by a lawyer.

## 1. US names: us-names-by-state.json
- Wanted: https://www.ssa.gov/oact/babynames/state/namesbystate.zip
- **Failed:** ssa.gov returned 403 Access Denied (Akamai) to every request, including the limits page. I did not change headers or try to get around it.
- Used: Wayback raw copy https://web.archive.org/web/20261014172026id_/https://www.ssa.gov/oact/babynames/state/namesbystate.zip
- Check: SHA-1 of the download equals the digest in the Wayback index (EECXNOW6Q5IVYS37O2MSMH5AWQFPNIXU). The same digest appears in all 5 snapshots checked, 2026-08-14 to 2026-10-14.
- Licence: US government work, public domain (per the brief; SSA's own page could not be opened to confirm).
- Result: 51 codes, latest year 2025 for all. Ties in the top 10 are broken alphabetically; `tied_at_10th` counts names sharing 10th place.
- Caveat: SSA omits names with fewer than 5 occurrences per state/year, so small states have thin lists.

## 2. US states: us-states-wikidata.json, flags-us/
- Wikidata (CC0): https://query.wikidata.org/sparql and wbgetentities. Items are P31=Q35657 with P300 US-xx, plus Q61 for DC. Fields: P41, P1449, P36.
- Flags: 51 SVG from Wikimedia Commons, all LicenseShortName "Public domain", none rejected. Artist and UsageTerms are stored per file. Licences via imageinfo/extmetadata.
- Birds: en.wikipedia "List of U.S. state birds" (https://en.wikipedia.org/wiki/List_of_U.S._state_birds, text CC BY-SA 4.0; raw copy in raw/). Used instead of a Wikidata property, as the brief allowed.
- Caveats: DC has no capital and no nickname in the data (null/empty). Many states have several nicknames, not ranked by me; some entries lack "The". Some bird cells carry a qualifier, such as "(state game bird)" or "(state songbird)". Wikidata capital/nickname values were not cross-checked against state sources.

## 3. Europe 1426: europe-1426.json, coa-eu/, rulers-eu/
- Wikidata (CC0) P94/P41/P18; files from Commons with per-file licence, Artist, Credit, UsageTerms and Commons page in the JSON. Only PD/CC0/CC BY/CC BY-SA kept. Nothing had to be rejected.
- **Most emblems are not 1426 emblems.** Wikidata's top statement is often another period. See `period_fit_1426` and `period_note` (my reading of file descriptions and statement dates, not a heraldic review):
  - ok (3): castile, cyprus, florence
  - undated (9): aragon, lithuania, naples, bosnia, papal, savoy, brittany, teutonic, hospitaller
  - check (4): navarre, burgundy, austria, serbia
  - mismatch (12): england, france, scotland, portugal, poland, hungary, hre, venice, milan, moldavia, muscovy, ottoman
  - fallback (2): kalmar, byzantium
  - `all_p94_p41` lists the other Wikidata files with dates, for choosing a period-correct one.
  - ottoman is the worst case: 1882-1922, and its own description says arms in the European style came much later.
- Fallbacks: kalmar and byzantium have no P94/P41, so I took images used in their en.wikipedia articles. The Kalmar flag's own description says it is a recreation with no surviving evidence.
- Redirects: poland resolves to "Crown of the Kingdom of Poland"; muscovy resolves to "Grand Principality of Moscow".
- Rulers: 28 distinct people for 29 files. hungary and hre are both Sigismund (copied file). florence has no ruler in the brief, so no portrait.
- Portrait caveats (`portrait_note`): many are later imaginings (e.g. 1579, 1664, 1672, 1684, 1878). bosnia is a coin, brittany a seal, moldavia a 1995 Moldovan stamp in GIF format (not JPG/PNG). naples: the Commons description names Louis of Orleans while the filename says Jeanne II, so check identity before use.
- Attribution needed for portraits: cyprus (CC BY-SA 3.0 cz), papal (CC BY 3.0), venice (CC BY-SA 4.0). Emblems: many CC BY / CC BY-SA, see JSON.
- Size: Commons only serves fixed thumbnail widths and returned 960px for a 512 request, so I used 330px wide (portrait) or 500px wide (landscape). Four long edges slightly exceed 512: milan 514, savoy 527, moldavia 531, ottoman 576. Some files are therefore smaller than 512.
- All SVG files have an `<svg>` root, and none contains `<script` or `onload=`.

## 4. People: people-alive-1426.json
- Wikidata (CC0), per-year SPARQL then wbgetentities. 482 rows from 737 candidates with at least 15 sitelinks.
- Dropped: 120 died before 1427, 82 no birth place or no coordinates, 43 best-ranked birth year out of range, 10 no year-precise death date.
- Kept only year-or-better precision. 81 rows have conflicting Wikidata dates, listed in `birth_year_alternatives`/`death_year_alternatives`. Birth years are often approximate (292 of 482 are year-only). Dates are as recorded, Julian or Gregorian not normalised.
- Coverage: 215 have a ko label, 397 have an image filename. Heavily weighted to people well covered on Wikipedia, mostly European and some major Asian figures; only 7 have Korean/Joseon citizenship. Sitelink counts include non-Wikipedia projects. Image files were not downloaded and their licences were not checked.

## 5. Joseon: joseon/ (raw), joseon-offices-stipends-robes.json, joseon-sejong-jiriji-households.json
- encykorea: https://encykorea.aks.ac.kr/Article/<id>. The site footer says it is a public work usable under 공공누리 (KOGL); the type per article was not read. Media are marked separately.
- **Search not used:** robots.txt disallows /Article/Search, so article IDs came from web search results. Article pages are allowed. Raw HTML and text are saved by ID.
- sillok: https://sillok.history.go.kr/id/kda_400040 through kda_400110 (provinces), kda_400020 Hanseong, kda_400030 Gaeseong, kda_400010 preface. The robots.txt path returned an error page with status 200, so no rules could be read; fetched 11 pages at a 3s gap. Pages show a 공공누리 mark; the exact type was not confirmed. The translated text belongs to the National Institute of Korean History.
- Officials: 정랑/좌랑 per 조 in 경국대전: 이조·호조·예조·공조 3 each; 병조·형조 4 each. Each ministry's article agrees with 낭관 E0012347. 병조's 4 include one added post each (가설). 경국대전 dates from 1485, not 1426.
- Stipends: all 18 grades parsed from each grade's article, quote kept beside the numbers. These are the 1438 녹과, so **later than 1426**. 정3품 values are for 당상관 (당하관 differs, see note). 정5품: the article reads "서맥 5석" and "저화 67장"; I read 서맥 as 소맥 and left 저화 empty because 67 does not fit neighbouring grades (6 and 4). Check against the 경국대전 text.
- Robes: 공복 E0004314 cites a 공복 rule set in **1426 (세종 8) 2월**, the closest to this date. It and 관복 E0004850 draw the rank boundaries differently (see `robes`). 공복 writes "1401년(태조 1)", where 1401 is actually 태종 1.
- Households: 8 provinces parsed from each province's text, quote kept. Totals: 201,853 households, 692,477 registered people. 강원도 reads "2만 9천 단(單) 9명" = 29,009.
- **Population is a severe undercount by the source's own statement:** the 경기 note says registers hold only one or two in ten. Do not use it as actual population.
- Not a 1426 count: no base year is stated. encykorea: compilation began 1424, 신찬팔도지리지 finished 1432, attached to the 실록 in 1454. No ready-made table was found on either site; the table is built from the province pages.
- Hanseong and Gaeseong figures are stored separately and not added to the totals; whether 경기 includes them was not determined. Hanseong's population was not found in the matched passage.
- Korean numerals were parsed by script and read against quotes; the 원문 한문 was not separately compared.
