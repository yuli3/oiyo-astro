"""Build public/data/sillok-1426-chars.json for /sillok-name-hanja/.

For every CJK character in the 1,149 entries of 世宗實錄 8年 (scripts/data/sejong-1426-sillok.json):
count, frequency rank, and the first entry it appears in (month-day, seq) with a short snippet.
The day ganzhi that opens each day's first entry (e.g. 丙申朔) is a date stamp, not prose, so it is skipped.
"""
import json, pathlib, collections
root = pathlib.Path(__file__).resolve().parent.parent
src = json.loads((root / "scripts/data/sejong-1426-sillok.json").read_text())
cjk = lambda ch: "一" <= ch <= "鿿" or "㐀" <= ch <= "䶿"
count = collections.Counter()
first = {}
for e in src["entries"]:
    t = e["text"]
    start = 2 if e["seq"] == 1 and t.startswith(e["day_ganzhi"]) else 0
    for i in range(start, len(t)):
        ch = t[i]
        if not cjk(ch):
            continue
        count[ch] += 1
        if ch not in first:
            a, b = max(start, i - 10), min(len(t), i + 11)
            first[ch] = [f"{e['month']}-{e['day']}", e["seq"], ("…" if a > start else "") + t[a:b] + ("…" if b < len(t) else "")]
ranked = sorted(count, key=lambda c: (-count[c], c))
rank = {}
for i, c in enumerate(ranked):
    rank[c] = rank[ranked[i - 1]] if i and count[ranked[i - 1]] == count[c] else i + 1
out = {
    "oldid": src["entries"][0]["oldid"],
    "entries": len(src["entries"]),
    "total": sum(count.values()),
    "kinds": len(count),
    "c": {c: [count[c], rank[c], *first[c]] for c in ranked},
}
(root / "public/data/sillok-1426-chars.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")) + "\n")
print(out["total"], out["kinds"], {c: out["c"][c][:2] for c in "民恩賢秀"})
