"""Build public/data/sejong-birthday/MM.json for /sejong-birthdays/ (다른 해의 내 생일 실록).

Input: scripts/data/sejong-sillok-raw/NN.json.gz — zh.wikisource 朝鮮王朝實錄/世宗實錄/{元年…三十二年} wikitext.
For every proleptic-Gregorian month/day, and every year 1419–1450, find the lunar date of that day from the
Sillok's own day ganzhi (each lunar month's first day is voted from its dated entries) and keep the entry
count plus a short snippet of the first entry.

Output row: [gregorianYear, reignYear, lunarMonth, leap(0/1), lunarDay, entryCount, snippet]
Days with no dated entry are left out.
"""
import gzip, json, pathlib, re, collections

root = pathlib.Path(__file__).resolve().parent.parent
RAW = root / "scripts/data/sejong-sillok-raw"
OUT = root / "public/data/sejong-birthday"

STEMS, BRANCHES = "甲乙丙丁戊己庚辛壬癸", "子丑寅卯辰巳午未申酉戌亥"
GZ = [STEMS[i % 10] + BRANCHES[i % 12] for i in range(60)]
GZI = {g: i for i, g in enumerate(GZ)}


def jdn(y, m, d):
    a = (14 - m) // 12
    yy, mm = y + 4800 - a, m + 12 * a - 3
    return d + (153 * mm + 2) // 5 + 365 * yy + yy // 4 - yy // 100 + yy // 400 - 32045


def gz_of(j):
    return (j - 11) % 60


def clean(t):
    t = re.sub(r"<ref[^>]*/>", "", t)
    t = re.sub(r"<ref[^>]*>.*?</ref>", "", t, flags=re.S)
    t = re.sub(r"\{\{校\|[^|{}]*\|([^|{}]*)\}\}", r"\1", t)
    t = re.sub(r"\{\{參\|[^|{}]*\|衍字\}\}", "", t)
    t = re.sub(r"\{\{參\|([^|{}]*)\|[^{}]*\}\}", r"\1", t)
    t = re.sub(r"\{\{!\|([^|{}]*)\|[^{}]*\}\}", r"\1", t)
    t = re.sub(r"\{\{\*\|[^{}]*實錄卷第[^{}]*\}\}", "", t)
    for _ in range(3):
        t = re.sub(r"\{\{\*\|([^{}]*)\}\}", r"〔\1〕", t)
        t = re.sub(r"\{\{quote\|([^{}]*)\}\}", r"\1", t)
    t = re.sub(r"\{\{[^{}]*\}\}", "", t)
    t = re.sub(r"-\{(.*?)\}-", r"\1", t)
    t = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]*)\]\]", r"\1", t)
    t = re.sub(r"<[^>]+>", "", t)
    return re.sub(r"\s+", "", t)


NUM = {"正": 1, "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9, "十": 10, "十一": 11, "十二": 12, "臘": 12}


def month_of(h2):
    leap = "閏" in h2
    core = re.sub(r"^[春夏秋冬]", "", h2.replace("閏", "")).replace("月", "")
    return NUM.get(core), leap


def parse_year(n):
    w = json.load(gzip.open(RAW / f"{n:02d}.json.gz"))["wikitext"]
    w = w.split("==註釋==")[0]
    months = []  # [(m, leap, {day: [entries]})]
    cur = None
    day = None
    for line in w.split("\n"):
        h2 = re.fullmatch(r"==([^=].*?)==\s*", line)
        h3 = re.fullmatch(r"===(閏?)(\d+)月(\d+)日===\s*", line)
        if h3:
            m, leap, d = int(h3.group(2)), bool(h3.group(1)), int(h3.group(3))
            if cur is None or cur[0] != m or cur[1] != leap:
                cur = (m, leap, collections.OrderedDict())
                months.append(cur)
            day = cur[2].setdefault(d, [])
            continue
        if h2:
            day = None
            continue
        if day is None:
            continue
        for part in clean(line).split("○"):
            if part:
                day.append(part)
    return months


def first_gz(entries):
    for e in entries[:1]:
        for k in range(0, 5):
            if e[k:k + 2] in GZI:
                return GZI[e[k:k + 2]]
    return None


def build():
    anchor = jdn(1426, 1, 21)
    while GZ[gz_of(anchor)] != "丙申":
        anchor += 1
    seq = []  # (reign, m, leap, days)
    for n in range(1, 33):
        for m, leap, days in parse_year(n):
            seq.append((n, m, leap, days))
    i1426 = next(i for i, s in enumerate(seq) if s[0] == 8 and s[1] == 1 and not s[2])
    starts = []
    for i, (n, m, leap, days) in enumerate(seq):
        votes = collections.Counter()
        for d, es in days.items():
            g = first_gz(es)
            if g is not None:
                votes[(g - (d - 1)) % 60] += 1
        if not votes:
            raise SystemExit(f"no ganzhi in {n} {m} {leap}")
        s, c = votes.most_common(1)[0]
        est = anchor + round((i - i1426) * 29.530589)
        best = min((j for j in range(est - 40, est + 41) if gz_of(j) == s), key=lambda j: abs(j - est))
        starts.append(best)
    for k in range(1, len(starts)):
        gap = starts[k] - starts[k - 1]
        if gap in (28, 31):
            # 예: 세종 19년 11월 丁亥朔 → 12월 戊午朔(31일) → 20년 정월(28일). 원문 일진을 그대로 따른다.
            print("note: gap", gap, "before", seq[k][:3])
        elif gap not in (29, 30):
            raise SystemExit(f"bad gap {gap} at {seq[k][:3]} (prev {seq[k-1][:3]})")
    end = starts[-1] + 30
    by_jdn = {}
    for k, (n, m, leap, days) in enumerate(seq):
        nxt = starts[k + 1] if k + 1 < len(starts) else end
        for d, es in days.items():
            j = starts[k] + d - 1
            g = first_gz(es)
            if g is not None and gz_of(j) != g:
                # 그날 기사의 일진이 달 첫날 계산과 어긋나면 일진을 믿는다(±3일 안).
                cand = [x for x in range(j - 3, j + 4) if gz_of(x) == g]
                if cand:
                    j = cand[0]
            if j in by_jdn:
                print("note: duplicate day", (n, m, leap, d), "vs", by_jdn[j][:4])
                continue
            by_jdn[j] = (n, m, int(leap), d, es)
    OUT.mkdir(parents=True, exist_ok=True)
    total = 0
    for gm in range(1, 13):
        out = {}
        for gd in range(1, 32):
            rows = []
            for y in range(1419, 1451):
                try:
                    j = jdn(y, gm, gd)
                except Exception:
                    continue
                if (y % 4 or (y % 100 == 0 and y % 400)) and gm == 2 and gd == 29:
                    continue
                hit = by_jdn.get(j)
                if not hit:
                    continue
                n, m, leap, d, es = hit
                first = es[0]
                if first[:2] in GZI:
                    first = re.sub(r"^..(朔|晦)?[，,]?", "", first)
                pick = next((e for e in [first, *es[1:]] if len(e) >= 8), first)
                snip = pick[:56] + ("…" if len(pick) > 56 else "")
                rows.append([y, n, m, leap, d, len(es), snip])
            if rows:
                out[str(gd)] = rows
                total += len(rows)
        (OUT / f"{gm:02d}.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")) + "\n")
    meta = {"years": [1419, 1450], "months": len(seq), "days": len(by_jdn), "entries": sum(len(v[4]) for v in by_jdn.values()),
            "oldids": {n: json.load(gzip.open(RAW / f"{n:02d}.json.gz"))["oldid"] for n in range(1, 33)}}
    (OUT / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, separators=(",", ":")) + "\n")
    print(meta["months"], meta["days"], meta["entries"], total)
    return by_jdn, starts, seq


if __name__ == "__main__":
    build()
