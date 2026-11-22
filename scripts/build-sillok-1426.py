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

# Weather, quake and rain-prayer notices (short entries only), for "그 무렵 한양 날씨".
import re
def kind(t):
    if re.search("祈雨|禱雨", t): return "pray"
    if "報祀" in t: return "thanks"
    if "風雲雷雨" in t: return None  # name of an altar/rite, not weather
    if "地震" in t: return "quake"
    if "雹" in t: return "hail"
    if "大雨" in t: return "storm"
    if "雷" in t: return "thunder"
    if "霧" in t: return "fog"
    if "大風" in t: return "wind"
    if re.search("雨澤愆期|不雨", t): return "drought"
    if "雨" in t: return "rain"
    return None
weather = []
for e in src["entries"]:
    t = e["text"]
    k = kind(t) if len(t) < 70 or "雨澤愆期" in t else None
    if k:
        weather.append([e["month"], e["day"], k, t if len(t) <= 80 else t[:80] + "…"])
out = {"oldid": src["entries"][0]["oldid"], "shuo": shuo, "days": days, "w": weather}
(root / "public/data").mkdir(exist_ok=True)
(root / "public/data/sillok-1426.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")) + "\n")
print(len(days), shuo, len(weather))
