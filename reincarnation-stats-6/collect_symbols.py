#!/usr/bin/env python3
"""National symbol images: facts from Wikidata (CC0), licences from the Commons API."""
import csv, html, json, re, time, urllib.parse, urllib.request, urllib.error
from pathlib import Path

HERE = Path(__file__).parent
ORIG = HERE / "original"
UA = "oiyo.net reincarnation data (support@oiyo.net)"
SPARQL = "https://query.wikidata.org/sparql"
COMMONS = "https://commons.wikimedia.org/w/api.php"
COLS = ["iso3", "kind", "name_en", "name_ko", "qid", "commons_file", "image_url",
        "licence", "licence_url", "artist", "source_url"]

Q_EMBLEM = """SELECT ?c ?iso ?cEn ?img ?coa ?coaEn ?coaKo WHERE {
  ?c wdt:P298 ?iso ; wdt:P94 ?img .
  FILTER NOT EXISTS { ?c wdt:P576 ?end }
  OPTIONAL { ?c rdfs:label ?cEn FILTER(LANG(?cEn)="en") }
  OPTIONAL { ?c wdt:P237 ?coa .
    OPTIONAL { ?coa rdfs:label ?coaEn FILTER(LANG(?coaEn)="en") }
    OPTIONAL { ?coa rdfs:label ?coaKo FILTER(LANG(?coaKo)="ko") } }
}"""

Q_SYMBOL = """SELECT ?c ?iso ?s ?sEn ?sMul ?taxon ?sKo ?sDesc ?img ?roleEn WHERE {
  ?c wdt:P298 ?iso ; p:P2238 ?st .
  FILTER NOT EXISTS { ?c wdt:P576 ?end }
  ?st ps:P2238 ?s .
  FILTER NOT EXISTS { ?st wikibase:rank wikibase:DeprecatedRank }
  FILTER NOT EXISTS { ?st pq:P582 ?stEnd }
  OPTIONAL { ?s wdt:P18 ?img }
  OPTIONAL { ?s rdfs:label ?sEn FILTER(LANG(?sEn)="en") }
  OPTIONAL { ?s rdfs:label ?sMul FILTER(LANG(?sMul)="mul") }
  OPTIONAL { ?s wdt:P225 ?taxon }
  OPTIONAL { ?s rdfs:label ?sKo FILTER(LANG(?sKo)="ko") }
  OPTIONAL { ?s schema:description ?sDesc FILTER(LANG(?sDesc)="en") }
  OPTIONAL { ?st ?pq ?role . ?qp wikibase:qualifier ?pq . ?role rdfs:label ?roleEn FILTER(LANG(?roleEn)="en") }
}"""

_last = [0.0]
def fetch(url, data=None):
    for attempt in range(6):
        wait = 0.25 - (time.time() - _last[0])
        if wait > 0:
            time.sleep(wait)
        _last[0] = time.time()
        req = urllib.request.Request(url, data=data, headers={"User-Agent": UA, "Accept": "application/json"})
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

def sparql(name, query):
    (ORIG / f"{name}.rq").write_text(query + "\n", encoding="utf-8")
    res = fetch(SPARQL, urllib.parse.urlencode({"query": query, "format": "json"}).encode())
    (ORIG / f"{name}.json").write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding="utf-8")
    return [{k: v["value"] for k, v in b.items()} for b in res["results"]["bindings"]]

def qid(uri):
    return uri.rsplit("/", 1)[-1]

def qnum(uri):
    return int(qid(uri)[1:])

def filename(uri):
    return urllib.parse.unquote(uri.rsplit("/", 1)[-1]).replace("_", " ")

def thumb(url):
    """API returns thumb.wikimedia.org/...?utm_*; the same path is served by upload.wikimedia.org."""
    return url.split("?", 1)[0].replace("https://thumb.wikimedia.org/", "https://upload.wikimedia.org/", 1)

def plain(s):
    s = re.sub(r"<[^>]+>", " ", s or "")
    return re.sub(r"\s+", " ", html.unescape(s)).strip()

ANIMAL = r"\b(animal|mammal|fish|perch|insect|beetle|butterfly|snake|reptile|dog|horse|cat)\b"

def kind_of(rows):
    """Kind from the statement's qualifier labels, then the item's English description (both CC0)."""
    roles = " | ".join(sorted({r["roleEn"].lower() for r in rows if r.get("roleEn")}))
    desc = rows[0].get("sDesc", "").lower()
    for text in (roles, desc):
        if "heraldic animal" in text and text is desc:
            return None, roles
        if re.search(r"\bbirds?\b", text):
            return "bird", roles
        if re.search(r"\b(tree|arboreal)\b", text) and "blossom" not in text:
            return "tree", roles
        if re.search(r"\b(flower|floral|plants?|wattle|orchid|blossom)\b", text):
            return "flower", roles
        if re.search(ANIMAL, text):
            return "animal", roles
    return None, roles

def licence_ok(short):
    s = short.strip().lower()
    if not s:
        return False
    if re.search(r"\b(nc|nd)\b", s.replace("-", " ")):
        return False
    if s.startswith("public domain") or s.startswith("pd") or s in ("cc0", "cc0 1.0", "no restrictions"):
        return True
    if s.startswith("cc0"):
        return True
    return bool(re.match(r"cc[ -]by([ -]sa)?([ -]\d|$)", s))

def main():
    ORIG.mkdir(exist_ok=True)
    with open(ORIG / "iso3166.csv", encoding="utf-8") as f:
        iso_ok = {r["alpha-3"] for r in csv.DictReader(f)}
    cand, notes = [], {"non_iso_code": [], "emblem_dupe_iso": [], "symbol_unclassified": [], "symbol_no_image": []}

    # 1. emblems: one per iso3, lowest-numbered country item, first image by file name
    by_iso = {}
    for r in sparql("ql-emblem", Q_EMBLEM):
        by_iso.setdefault(r["iso"], {}).setdefault(r["c"], []).append(r)
    for iso, items in sorted(by_iso.items()):
        if iso not in iso_ok:
            notes["non_iso_code"].append(iso)
            continue
        if len(items) > 1:
            notes["emblem_dupe_iso"].append(iso + ": " + ", ".join(sorted(qid(c) for c in items)))
        c = min(items, key=qnum)
        r = sorted(items[c], key=lambda x: (x["img"], x.get("coa", "")))[0]
        cand.append({"iso3": iso, "kind": "emblem",
                     "name_en": r.get("coaEn") or f"Coat of arms of {r.get('cEn', iso)}",
                     "name_ko": r.get("coaKo", "") if r.get("coaEn") else "",
                     "qid": qid(r["coa"]) if r.get("coa") else qid(c),
                     "commons_file": filename(r["img"])})

    # 2. official symbols (P2238)
    groups = {}
    for r in sparql("ql-official-symbol", Q_SYMBOL):
        groups.setdefault((r["iso"], r["s"]), []).append(r)
    for (iso, s), rows in sorted(groups.items()):
        if iso not in iso_ok:
            continue
        kind, roles = kind_of(rows)
        label = rows[0].get("sEn") or rows[0].get("sMul") or rows[0].get("taxon", "")
        if not kind:
            notes["symbol_unclassified"].append(f"{iso} {qid(s)} {label} [{roles}]")
            continue
        imgs = sorted({r["img"] for r in rows if r.get("img")})
        if not imgs:
            notes["symbol_no_image"].append(f"{iso} {kind} {qid(s)} {label}")
            continue
        cand.append({"iso3": iso, "kind": kind, "name_en": label, "name_ko": rows[0].get("sKo", ""),
                     "qid": qid(s), "commons_file": filename(imgs[0])})

    # 3. Commons licences, 50 titles per request
    files = sorted({c["commons_file"] for c in cand})
    info = {}
    for i in range(0, len(files), 50):
        batch = files[i:i + 50]
        res = fetch(COMMONS + "?" + urllib.parse.urlencode({
            "action": "query", "prop": "imageinfo", "iiprop": "url|extmetadata", "iiurlwidth": 320,
            "format": "json", "formatversion": 2, "titles": "|".join("File:" + f for f in batch)}))
        (ORIG / f"commons-imageinfo-{i // 50:02d}.json").write_text(
            json.dumps(res, ensure_ascii=False, indent=1), encoding="utf-8")
        norm = {n["from"]: n["to"] for n in res["query"].get("normalized", [])}
        pages = {p["title"]: p for p in res["query"]["pages"]}
        for f in batch:
            info[f] = pages.get(norm.get("File:" + f, "File:" + f))

    kept, dropped = [], []
    for c in cand:
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

    order = {k: i for i, k in enumerate(["emblem", "bird", "animal", "flower", "tree"])}
    key = lambda r: (r["iso3"], order[r["kind"]], r["name_en"])
    for name, rows, cols in (("symbols.csv", kept, COLS), ("dropped.csv", dropped, COLS + ["reason"])):
        with open(HERE / name, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=cols)
            w.writeheader()
            w.writerows(sorted(rows, key=key))
    (ORIG / "notes.json").write_text(json.dumps(notes, ensure_ascii=False, indent=1), encoding="utf-8")
    print("kept", len(kept), "dropped", len(dropped), "files", len(files))

if __name__ == "__main__":
    main()
