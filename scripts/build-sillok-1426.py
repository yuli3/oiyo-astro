"""Build public/data/sillok-1426.json for /sillok-birthday/ from the 世宗8年 Sillok transcription.

One featured entry per day (index in sejong-1426-sillok-picks.json, chosen by keyword score and
reviewed by hand) with a plain-language Korean and English summary (sejong-1426-sillok-summaries.tsv).
"""
import json, pathlib, collections
root = pathlib.Path(__file__).resolve().parent.parent
d = root / "scripts/data"
src = json.loads((d / "sejong-1426-sillok.json").read_text())
picks = json.loads((d / "sejong-1426-sillok-picks.json").read_text())
summ = {}
for line in (d / "sejong-1426-sillok-summaries.tsv").read_text().splitlines():
    if line.strip():
        k, ko, en = line.split("\t")
        summ[k] = (ko, en)
by = collections.defaultdict(list)
for e in src["entries"]:
    by[f"{e['month']}-{e['day']}"].append(e)
shuo = []
for m in range(1, 13):
    first = by[f"{m}-1"][0]
    shuo.append(first["day_ganzhi"])
days = {}
for k, xs in by.items():
    p = xs[picks[k]]
    t = p["text"]
    days[k] = {"gz": xs[0]["day_ganzhi"], "n": len(xs), "t": t if len(t) <= 240 else t[:240] + "…", "ko": summ[k][0], "en": summ[k][1]}
assert set(days) == set(summ), set(days) ^ set(summ)
out = {"oldid": src["entries"][0]["oldid"], "shuo": shuo, "days": days}
(root / "public/data").mkdir(exist_ok=True)
(root / "public/data/sillok-1426.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")) + "\n")
print(len(days), shuo)
