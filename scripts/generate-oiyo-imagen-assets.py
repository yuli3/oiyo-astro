#!/usr/bin/env python3
import base64, json, os, urllib.request, urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ENV = Path.home() / ".hermes/.env"
if ENV.exists():
    for line in ENV.read_text().splitlines():
        if "=" in line and not line.lstrip().startswith("#"):
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))

api_key = os.environ.get("GOOGLE_API_KEY")
if not api_key:
    raise SystemExit("GOOGLE_API_KEY unavailable")

MODEL = "imagen-4.0-generate-001"
URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:predict?key={api_key}"
OUT = ROOT / "public/images/oiyo-imagen"
OUT.mkdir(parents=True, exist_ok=True)

STYLE = """
OIYO visual language: quiet editorial illustration on warm ivory handmade paper, subtle grain and letterpress texture, flat geometric shapes, thin ochre construction lines, restrained warm olive green, muted terracotta, antique gold, stone gray, and tiny navy accents. Mobile-first readability, generous negative space, calm and precise. The sacred tree is a PLACE and landscape landmark, never a person, mascot, deity, face, or human figure. No text, letters, numbers, logos, watermark, UI screenshot, photorealism, neon, purple, cyan, dark background, gradients, glossy 3D, or fantasy character.
"""

ASSETS = {
    "ontology-hero": "A sacred tree rooted in a circular landscape clearing, its roots becoming six fine paths that connect small abstract symbols for sky, earth, time, name, place, and relationship. The tree is the stable center of a personal knowledge map. Balanced frontal composition, strong silhouette, no human figure.",
    "natal-chart-hero": "A clean circular natal chart instrument hovering above rolling olive hills, with fine planetary meridian arcs and a small sacred tree on the horizon as a place marker. Mathematical and contemplative, not fortune-telling, no zodiac text or labels.",
    "today-hero": "A quiet dawn landscape around the sacred tree: low sun, one soft cloud, a few wind lines, a tiny moon and star fading above. A visual meeting of current weather, calendar, and daily sky. Serene, useful, not mystical prophecy.",
}

manifest = {"model": MODEL, "aspectRatio": "16:9", "assets": {}}
for name, subject in ASSETS.items():
    payload = {
        "instances": [{"prompt": STYLE + "\nSubject: " + subject}],
        "parameters": {
            "sampleCount": 1,
            "aspectRatio": "16:9",
            "personGeneration": "dont_allow",
            "includeRaiReason": True,
            "outputOptions": {"mimeType": "image/png"},
        },
    }
    req = urllib.request.Request(URL, data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=180) as response:
            data = json.load(response)
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode(errors="replace")
        raise SystemExit(f"{name}: HTTP {exc.code}: {detail[:600]}")
    pred = (data.get("predictions") or [{}])[0]
    encoded = pred.get("bytesBase64Encoded")
    if not encoded:
        raise SystemExit(f"{name}: no image returned: {json.dumps(data)[:600]}")
    path = OUT / f"{name}.png"
    path.write_bytes(base64.b64decode(encoded))
    manifest["assets"][name] = {"file": str(path.relative_to(ROOT)), "prompt": subject}
    print(path)

(OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
print(OUT / "manifest.json")
