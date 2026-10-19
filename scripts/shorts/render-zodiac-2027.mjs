#!/usr/bin/env node
// 12띠 "2027 정미년 내 띠는?" 세로 쇼츠(1080x1920)를 만든다.
// HTML 장면을 Chromium 헤드리스로 찍고 ffmpeg로 잇는다. 클라우드와 Mac에서 같이 돈다.
// macOS `say`가 있으면 장면마다 Yuna 나레이션을 붙이고, 장면 길이를 목소리에 맞춰 늘린다.
// `say`가 없으면 자막만 있는 무음 영상을 만든다. 목소리는 SAY_VOICE로 바꾼다.
// 게시는 하지 않는다. 결과물은 .tmp/shorts/zodiac-2027/ 에만 쓴다 (2026-10-19).
//
//   node scripts/shorts/render-zodiac-2027.mjs            # 12편
//   node scripts/shorts/render-zodiac-2027.mjs horse      # 한 편
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { YEAR, ZODIAC_2027 } from "../../src/lib/fortune/zodiac-2027-copy.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const outDir = join(root, ".tmp/shorts/zodiac-2027");
const fontPath = join(root, "public/fonts/GowunBatang-ks-400.woff2");
// 무음일 때 장면 길이이자, 나레이션이 있을 때의 최소 길이.
const SCENE_SECONDS = [3.5, 6, 4.5, 4];
// 나레이션 끝과 다음 장면 사이 숨 고르기.
const VOICE_TAIL = 0.5;

// headless_shell은 --window-size를 뷰포트 그대로 쓴다. 일반 Chrome의 --headless=new는 창 테두리만큼
// 뷰포트가 줄어 아래가 비므로 html 배경을 같이 칠해 둔다.
const CHROME = [process.env.CHROME_PATH, "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].find((p) => p && existsSync(p));
if (!CHROME) throw new Error("Chromium을 찾지 못했어요. CHROME_PATH를 지정하세요.");

const MOOD = {
  good: { accent: "#f2b84b", word: "좋은 흐름" },
  self: { accent: "#ff7a59", word: "내 해" },
  move: { accent: "#7cc6ff", word: "변동" },
  careful: { accent: "#c9a7ff", word: "조심" },
  steady: { accent: "#9fe3b5", word: "무난" },
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function page(z, scene) {
  const m = MOOD[z.mood];
  const font = `data:font/woff2;base64,${readFileSync(fontPath).toString("base64")}`;
  const scenes = [
    `<p class="eyebrow">${YEAR.label} · ${YEAR.hanja} · ${YEAR.animal}의 해</p>
     <h1>${esc(z.name)}띠는?</h1><p class="big">${esc(z.hanja)}</p><p class="years">${esc(z.years)}년생</p>`,
    `<p class="badge" style="border-color:${m.accent};color:${m.accent}">${z.tag === m.word ? m.word : `${esc(z.tag)} · ${m.word}`}</p>
     <h2>${esc(z.hook)}</h2>${z.body.map((b) => `<p class="body">${esc(b)}</p>`).join("")}`,
    `<p class="eyebrow">올해 한 줄</p><h2 class="tip">${esc(z.tip)}</h2>`,
    `<h2>내 생일로 보면<br/>더 정확해요</h2><p class="body">띠는 태어난 해 하나만 봐요.<br/>신년운세 미리보기는 생년월일로 봐요.</p>
     <p class="url" style="color:${m.accent}">oiyo.net 신년운세</p>`,
  ];
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>
    @font-face { font-family: Gowun; src: url(${font}) format("woff2"); }
    html,body { margin:0; width:1080px; height:1920px; background:#170812; }
    body { font-family: Gowun, serif; color:#fbf4ea; display:flex; flex-direction:column; justify-content:center;
      padding:0 110px; box-sizing:border-box; background: radial-gradient(circle at 50% 18%, #7a2330 0%, #3a1220 45%, #170812 100%); }
    .eyebrow { font-size:46px; opacity:.85; margin:0 0 40px; letter-spacing:.02em; }
    h1 { font-size:150px; margin:0; line-height:1.1; }
    h2 { font-size:88px; line-height:1.3; margin:0 0 56px; word-break:keep-all; text-wrap:balance; }
    .tip { font-size:104px; }
    .big { font-size:300px; margin:30px 0 0; color:${m.accent}; line-height:1; }
    .years { font-size:52px; opacity:.8; margin-top:40px; }
    .body { font-size:54px; line-height:1.6; margin:0 0 28px; opacity:.92; word-break:keep-all; }
    .badge { display:inline-block; align-self:flex-start; font-size:46px; border:4px solid; border-radius:60px; padding:14px 40px; margin:0 0 56px; }
    .url { font-size:72px; margin-top:60px; }
    .foot { position:absolute; left:110px; right:110px; bottom:120px; font-size:34px; opacity:.6; line-height:1.5; }
  </style></head><body>${scenes[scene]}
  <p class="foot">띠만 보는 전통 상징 해석이에요. 1~2월생은 입춘(2월 4일 무렵) 전이면 앞 띠예요.</p></body></html>`;
}

function hasSay() {
  try { execFileSync("which", ["say"], { stdio: "ignore" }); return true; } catch { return false; }
}

// 장면마다 화면 글자와 같은 내용을 읽는다. 한 덩어리로 읽으면 화면과 목소리가 어긋난다.
function narration(z) {
  return [
    `${YEAR.label}, ${z.name}띠는?`,
    `${z.hook}. ${z.body.join(" ")}`,
    `올해 한 줄. ${z.tip}`,
    "내 생일로 보는 신년운세는 오이요 닷 넷에서 무료로 볼 수 있어요.",
  ];
}

function seconds(file) {
  return Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString().trim());
}

function render(z) {
  const dir = join(outDir, z.id);
  mkdirSync(dir, { recursive: true });
  const voiced = hasSay();
  const voice = process.env.SAY_VOICE || "Yuna";
  const clips = voiced ? narration(z).map((line, i) => {
    const file = join(dir, `voice-${i}.aiff`);
    execFileSync("say", ["-v", voice, "-o", file, line]);
    return file;
  }) : [];
  const sceneSeconds = SCENE_SECONDS.map((min, i) => (voiced ? Math.max(min, +(seconds(clips[i]) + VOICE_TAIL).toFixed(2)) : min));
  const list = [];
  sceneSeconds.forEach((sec, i) => {
    const html = join(dir, `scene-${i}.html`);
    const png = join(dir, `scene-${i}.png`);
    writeFileSync(html, page(z, i));
    execFileSync(CHROME, ["--headless", "--no-sandbox", "--hide-scrollbars", "--force-device-scale-factor=1",
      "--window-size=1080,1920", `--screenshot=${png}`, `file://${html}`], { stdio: "ignore" });
    list.push(`file '${png}'`, `duration ${sec}`);
  });
  list.push(list.at(-2)); // concat demuxer는 마지막 장면을 한 번 더 적어야 길이를 지킨다.
  writeFileSync(join(dir, "scenes.txt"), list.join("\n"));
  const out = join(outDir, `${z.id}-2027.mp4`);
  const total = +sceneSeconds.reduce((a, b) => a + b, 0).toFixed(2);
  const video = ["-f", "concat", "-safe", "0", "-i", join(dir, "scenes.txt")];
  const enc = ["-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-movflags", "+faststart"];
  if (voiced) {
    // 장면 길이만큼 각 나레이션 뒤를 무음으로 채워 이어 붙인다. 그래야 장면이 바뀔 때 다음 줄이 시작된다.
    const pads = sceneSeconds.map((sec, i) => `[${i + 1}:a]aresample=44100,apad=whole_dur=${sec}[a${i}]`);
    const joined = `${sceneSeconds.map((_, i) => `[a${i}]`).join("")}concat=n=${sceneSeconds.length}:v=0:a=1[aout]`;
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...video, ...clips.flatMap((c) => ["-i", c]),
      "-filter_complex", [...pads, joined].join(";"), "-map", "0:v", "-map", "[aout]",
      ...enc, "-c:a", "aac", "-b:a", "160k", "-t", String(total), out]);
  } else {
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...video, ...enc, "-an", "-t", String(total), out]);
  }
  return out;
}

const only = process.argv[2];
const targets = only ? ZODIAC_2027.filter((z) => z.id === only) : ZODIAC_2027;
if (!targets.length) throw new Error(`모르는 띠: ${only}`);
for (const z of targets) console.log(render(z));
