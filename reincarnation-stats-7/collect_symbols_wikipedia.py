#!/usr/bin/env python3
"""National animals/flowers: facts from English Wikipedia lists (CC BY-SA 4.0),
items and labels from Wikidata (CC0), image licences from the Commons API."""
import collections, csv, html, json, re, time, urllib.parse, urllib.request, urllib.error
from pathlib import Path

HERE = Path(__file__).parent
ORIG = HERE / "original"
B5 = HERE.parent / "reincarnation-stats-5"
B6 = HERE.parent / "reincarnation-stats-6"
UA = "oiyo.net reincarnation data (support@oiyo.net)"
ENWIKI = "https://en.wikipedia.org/w/api.php"
WIKIDATA = "https://www.wikidata.org/w/api.php"
COMMONS = "https://commons.wikimedia.org/w/api.php"
COLS = ["iso3", "kind", "name_en", "name_ko", "qid", "commons_file", "image_url",
        "licence", "licence_url", "artist", "source_url", "list_page"]
PAGES = {"List of national animals": "List_of_national_animals.parse.json",
         "List of national flowers": "List_of_national_flowers.parse.json"}

# Flower rows were pulled from links inside a sentence, so some are not that country's national flower.
EXCLUDE = {
    ("FRA", "Iris pseudacorus"): "Kingdom of France / Brittany line, not the present state",
    ("FRA", "Ulex"): "Kingdom of France / Brittany line, not the present state",
    ("FRA", "heather"): "Kingdom of France / Brittany line, not the present state",
    ("LKA", "flame lily"): "Tamil Eelam (unrecognised state), not Sri Lanka",
    ("NOR", "Lily-of-the-valley"): "county flower (Østfold), not national",
    ("NOR", "Globe flower"): "county flower (Troms), not national",
    ("POL", "Kashubian vetch"): "regional flower (Kashubia), not national",
    ("NLD", "tulip"): "sentence says the tulip is a common belief, the daisy is the national flower",
    ("SGP", "Vanda hookeriana"): "parent species of the hybrid Vanda Miss Joaquim, not the flower itself",
    ("SGP", "Vanda teres"): "parent species of the hybrid Vanda Miss Joaquim, not the flower itself",
    ("ISR", "Cyclamen persicum"): "second sentence item, not the chosen national flower",
    ("BGD", "water lily"): "common-name link (family Nymphaeaceae) for Nymphaea nouchali, which batch 6 has",
    ("CAN", "maple leaf"): "leaf emblem, not a flower; batch 6 has the sugar maple as tree",
}
# English label on Wikidata that is not English (checked 2026-10-13).
NAME_EN_FIX = {"Q25851": "European rabbit"}

_last = [0.0]
def fetch(url, params):
    url = url + "?" + urllib.parse.urlencode(params)
    for attempt in range(6):
        wait = 0.25 - (time.time() - _last[0])
        if wait > 0:
            time.sleep(wait)
        _last[0] = time.time()
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            print("HTTP", e.code, url[:60], flush=True)
            if e.code not in (429, 500, 502, 503, 504):
                raise
            time.sleep(2 ** attempt * 2)
        except (urllib.error.URLError, TimeoutError):
            time.sleep(2 ** attempt * 2)
    raise RuntimeError("gave up: " + url[:120])

def save(name, res):
    (ORIG / name).write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding="utf-8")

def plain(s):
    s = re.sub(r"<[^>]+>", " ", s or "")
    return re.sub(r"\s+", " ", html.unescape(s)).strip()

def squash(s):
    return re.sub(r"\W+", "", s).lower()

def thumb(url):
    return url.split("?", 1)[0].replace("https://thumb.wikimedia.org/", "https://upload.wikimedia.org/", 1)

def licence_ok(short):
    s = short.strip().lower()
    if not s:
        return False
    if re.search(r"\b(nc|nd)\b", s.replace("-", " ")):
        return False
    if s.startswith("public domain") or s.startswith("pd") or s.startswith("cc0") or s == "no restrictions":
        return True
    return bool(re.match(r"cc[ -]by([ -]sa)?([ -]\d|$)", s))

LINK = re.compile(r'<a href="/wiki/([^"#]+)(?:#[^"]*)?"[^>]*>(.*?)</a>', re.S)
def title_of(m):
    return urllib.parse.unquote(m.group(1)).replace("_", " ")

def page_html(name):
    t = json.load(open(B5 / "original" / "wikipedia" / PAGES[name], encoding="utf-8"))["parse"]["text"]
    return t["*"] if isinstance(t, dict) else t

def animal_links():
    """Name cell of each table row (the cell that opens with a link) -> linked article.
    Returns {name: [(squashed role + scientific name, title) in table order]}."""
    out = collections.defaultdict(list)
    t = re.sub(r"<sup.*?</sup>", "", page_html("List of national animals"), flags=re.S)
    for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", t, re.S):
        tds = re.findall(r"<td[^>]*>(.*?)</td>", tr, re.S)
        for i, td in enumerate(tds[:-1]):
            m = LINK.match(td.strip())
            if m:
                role = plain(td[td.find("</a>"):])
                out[plain(m.group(2))].append((squash(role + plain(tds[i + 1])), title_of(m)))
                break
    return out

def flower_blocks():
    t = re.sub(r"<sup.*?</sup>", "", page_html("List of national flowers"), flags=re.S)
    return [(squash(plain(b)), b) for b in re.findall(r"<(?:p|li)\b[^>]*>(.*?)</(?:p|li)>", t, re.S)]

def kind_of(row, ent):
    note = row["note"].lower()
    desc = ent.get("descriptions", {}).get("en", {}).get("value", "").lower()
    if "national bird" in note:
        return "bird"
    if "national tree" in note:
        return "tree"
    if row["kind"] == "flower":
        return "flower"
    if re.search(r"\bbirds?\b", desc):
        return "bird"
    return "animal"

def is_plant(ent):
    desc = ent.get("descriptions", {}).get("en", {}).get("value", "").lower()
    return "P225" in ent.get("claims", {}) or bool(
        re.search(r"\b(plants?|flowers?|blossoms?|trees?|shrubs?|cultivar|orchid|rose)\b", desc))

def p18(ent):
    st = [s for s in ent.get("claims", {}).get("P18", [])
          if s.get("rank") != "deprecated" and s["mainsnak"].get("datavalue")]
    st.sort(key=lambda s: s.get("rank") != "preferred")
    return st[0]["mainsnak"]["datavalue"]["value"].replace("_", " ") if st else ""

def main():
    ORIG.mkdir(exist_ok=True)
    with open(B5 / "national_symbols_wikipedia.csv", encoding="utf-8") as f:
        rows = [r for r in csv.DictReader(f) if r["kind"] in ("animal", "flower")]
    with open(B6 / "symbols.csv", encoding="utf-8") as f:
        have = {(r["iso3"], r["qid"]) for r in csv.DictReader(f)}
    skipped = []  # rows that never reach the image step
    def skip(r, reason, **extra):
        skipped.append(dict(iso3=r["iso3"], kind=r["kind"], name=r["name"], reason=reason,
                            list_page=r["wikipedia_page"], **extra))

    # 1. list row -> linked article title
    amap, blocks, seen_a = animal_links(), flower_blocks(), collections.Counter()
    cand, ambiguous = [], []
    for r in rows:
        if not r["name"]:
            skip(r, "no linked name in the list sentence")
            continue
        if (r["iso3"], r["name"]) in EXCLUDE:
            skip(r, "excluded: " + EXCLUDE[(r["iso3"], r["name"])])
            continue
        title = ""
        if r["kind"] == "animal":
            ts = amap.get(r["name"], [])
            same = [t for k, t in ts if k == squash(r["note"])]  # Lion / Cow link differently per country
            pick = same or [t for _, t in ts]
            if pick:
                title = collections.Counter(pick).most_common(1)[0][0]
                if len(set(pick)) > 1:
                    ambiguous.append(f"{r['iso3']} {r['name']}: {sorted(set(pick))} -> {title}")
        else:
            key = squash(r["note"])[:60]
            for text, b in blocks:
                n = min(len(text), len(key))
                if n >= 10 and text[:n] == key[:n]:
                    hit = [title_of(m) for m in LINK.finditer(b) if plain(m.group(2)) == r["name"]]
                    if hit:
                        title = hit[0]
                        break
        cand.append(dict(r, title=title or r["name"], linked=bool(title)))

    # 2. article -> Wikidata item
    titles = sorted({c["title"] for c in cand})
    qid_of = {}
    for i in range(0, len(titles), 50):
        batch = titles[i:i + 50]
        res = fetch(ENWIKI, {"action": "query", "prop": "pageprops", "ppprop": "wikibase_item", "redirects": 1,
                             "format": "json", "formatversion": 2, "titles": "|".join(batch)})
        save(f"enwiki-pageprops-{i // 50:02d}.json", res)
        q = res["query"]
        step = {}
        for key in ("normalized", "redirects"):
            for n in q.get(key, []):
                step[n["from"]] = n["to"]
        pages = {p["title"]: p for p in q.get("pages", [])}
        for t in batch:
            end = t
            for _ in range(3):
                end = step.get(end, end)
            p = pages.get(end, {})
            qid_of[t] = (p.get("pageprops", {}).get("wikibase_item", ""), end, bool(p.get("missing")))

    # 3. item -> labels, description, P18
    qids = sorted({v[0] for v in qid_of.values() if v[0]}, key=lambda q: int(q[1:]))
    ents = {}
    for i in range(0, len(qids), 50):
        res = fetch(WIKIDATA, {"action": "wbgetentities", "ids": "|".join(qids[i:i + 50]), "format": "json",
                               "props": "labels|descriptions|claims", "languages": "en|ko"})
        slim = {q: {"labels": e.get("labels", {}), "descriptions": e.get("descriptions", {}),
                    "claims": {p: e.get("claims", {}).get(p, []) for p in ("P18", "P225", "P31")
                               if p in e.get("claims", {})}}
                for q, e in res.get("entities", {}).items()}
        save(f"wikidata-entities-{i // 50:02d}.json", slim)
        ents.update(slim)

    picked, seen = [], set()
    for c in cand:
        q, article, missing = qid_of[c["title"]]
        if not q:
            skip(c, "no Wikipedia article" if missing else "article has no Wikidata item", article=article)
            continue
        e = ents[q]
        if c["kind"] == "flower" and not is_plant(e):
            skip(c, "linked item is not a plant", article=article, qid=q)
            continue
        if (c["iso3"], q) in have:
            skip(c, "already in batch 6", article=article, qid=q)
            continue
        if (c["iso3"], q) in seen:
            skip(c, "same item listed twice for this country", article=article, qid=q)
            continue
        seen.add((c["iso3"], q))
        f = p18(e)
        if not f:
            skip(c, "item has no P18 image", article=article, qid=q)
            continue
        picked.append({"iso3": c["iso3"], "kind": kind_of(c, e),
                       "name_en": NAME_EN_FIX.get(q) or e["labels"].get("en", {}).get("value", "") or article,
                       "name_ko": e["labels"].get("ko", {}).get("value", ""),
                       "qid": q, "commons_file": f, "list_page": c["wikipedia_page"]})

    # 4. Commons licences
    files = sorted({p["commons_file"] for p in picked})
    info = {}
    for i in range(0, len(files), 50):
        batch = files[i:i + 50]
        res = fetch(COMMONS, {"action": "query", "prop": "imageinfo", "iiprop": "url|extmetadata",
                              "iiurlwidth": 320, "format": "json", "formatversion": 2,
                              "titles": "|".join("File:" + f for f in batch)})
        save(f"commons-imageinfo-{i // 50:02d}.json", res)
        norm = {n["from"]: n["to"] for n in res["query"].get("normalized", [])}
        pages = {p["title"]: p for p in res["query"]["pages"]}
        for f in batch:
            info[f] = pages.get(norm.get("File:" + f, "File:" + f))

    kept, dropped = [], []
    for c in picked:
        p = info.get(c["commons_file"])
        ii = (p or {}).get("imageinfo", [None])[0] if p else None
        row = dict(c, image_url="", licence="", licence_url="", artist="",
                   source_url="https://commons.wikimedia.org/wiki/File:" +
                              urllib.parse.quote(c["commons_file"].replace(" ", "_")))
        if not ii:
            dropped.append(dict(row, reason="file not found on Commons"))
            continue
        em = ii.get("extmetadata", {})
        g = lambda k: em.get(k, {}).get("value", "")
        row.update(image_url=thumb(ii.get("thumburl", "")), licence=plain(g("LicenseShortName")),
                   licence_url=g("LicenseUrl"), artist=plain(g("Artist")))
        if not licence_ok(row["licence"]):
            dropped.append(dict(row, reason="licence not PD/CC0/CC BY/CC BY-SA"))
        elif not row["image_url"].startswith("https://upload.wikimedia.org/"):
            dropped.append(dict(row, reason="no upload.wikimedia.org thumbnail"))
        else:
            kept.append(row)

    order = {k: i for i, k in enumerate(["bird", "animal", "flower", "tree"])}
    key = lambda r: (r["iso3"], order[r["kind"]], r["name_en"])
    for name, out, cols in (("symbols_wikipedia.csv", kept, COLS), ("dropped.csv", dropped, COLS + ["reason"])):
        with open(HERE / name, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=cols)
            w.writeheader()
            w.writerows(sorted(out, key=key))
    with open(HERE / "skipped.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["iso3", "kind", "name", "article", "qid", "reason", "list_page"],
                           restval="")
        w.writeheader()
        w.writerows(skipped)
    unlinked = [f"{c['iso3']} {c['name']}" for c in cand if not c["linked"]]
    save("notes.json", {"rows_in": len(rows), "fallback_to_name": unlinked, "ambiguous_link": ambiguous})
    print("rows", len(rows), "kept", len(kept), "dropped", len(dropped), "skipped", len(skipped),
          "fallback", len(unlinked))

if __name__ == "__main__":
    main()
