"""Trim scripts/data/sejong-jiriji-goeul.json into src/data/hometown-1426.json for /hometown-1426/."""
import json, pathlib, urllib.parse
root = pathlib.Path(__file__).resolve().parent.parent
src = json.loads((root / "scripts/data/sejong-jiriji-goeul.json").read_text())
out = []
for x in src:
    anchor = urllib.parse.unquote(x["source_url"].split("#", 1)[1]) if "#" in x["source_url"] else ""
    out.append({
        "id": x["id"], "p": x["province_ko"], "ph": x["province_hanja"],
        "h": x["name_hanja"], "k": x["name_ko"], "r": x["rank"], "rk": x["rank_ko"],
        "hh": x["households"], "pp": x["people"],
        "t": x["tusan"], "g": [] if x["tusan_recorded"] else x["togong_first5"],
        "a": anchor, "v": x["sillok_volume"], "f": x["frontier_appended"],
    })
(root / "src/data/hometown-1426.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")) + "\n")
print(len(out))
