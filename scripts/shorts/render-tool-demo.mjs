#!/usr/bin/env node
// 실화면 도구 시연 쇼츠(1080x1920). 실제 사이트 화면을 그대로 찍는다 — 생성한 가짜 화면을 쓰지 않는다.
// 앞뒤 안내 카드 + 도구 화면에서 한 줄 입력 → 결과까지를 프레임으로 찍어 ffmpeg로 잇는다.
// 게시는 하지 않는다. 결과물은 .tmp/shorts/tool-demo/ 에만 쓴다 (2026-10-19).
//
//   npm i --no-save playwright-core        # 한 번만
//   node scripts/shorts/render-tool-demo.mjs electricity [--base http://localhost:4321]
//
// --base 를 안 주면 공개 사이트(https://blog.oiyo.net)를 찍는다. 로컬 dev 서버를 찍을 때는 Astro dev 툴바를 숨긴다.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const font = `data:font/woff2;base64,${readFileSync(join(root, "public/fonts/GowunBatang-ks-400.woff2")).toString("base64")}`;
const CHROME = [process.env.CHROME_PATH, "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"].find((p) => p && existsSync(p));

// 데모마다 앞 카드·입력·뒤 카드를 정한다. 입력 문장은 도구가 실제로 알아듣는 한 줄이다.
const DEMOS = {
  electricity: {
    path: "/ko/electricity-bill-calculator/",
    intro: ["12월 전기요금,", "고지서 전에 미리 보기"],
    introSub: "전기장판 하루 8시간이면 얼마나 늘까?",
    input: { placeholder: "예: 8월 350kWh", text: "12월 380kWh 전기장판 150W 하루 8시간", apply: "채우기" },
    result: "예상 청구액",
    extra: "이 기기 때문에 늘어나는 요금",
    outro: ["한 줄만 적으면", "누진 구간까지 계산해요"],
    url: "blog.oiyo.net 전기요금 계산기",
  },
};

function card(lines, sub, accent) {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>
    @font-face { font-family: Gowun; src: url(${font}) format("woff2"); }
    html,body { margin:0; width:360px; height:640px; background:#14301f; }
    body { font-family: Gowun, serif; color:#f4f7f1; display:flex; flex-direction:column; justify-content:center; padding:0 36px; box-sizing:border-box;
      background: radial-gradient(circle at 50% 20%, #3f6b3a 0%, #1f3d27 50%, #10241a 100%); }
    h1 { font-size:34px; line-height:1.35; margin:0 0 22px; word-break:keep-all; }
    p { font-size:18px; line-height:1.6; margin:0; opacity:.9; word-break:keep-all; }
    .accent { color:${accent}; font-size:22px; margin-top:26px; }
  </style></head><body><h1>${lines.join("<br/>")}</h1>${sub ? `<p${sub.accent ? ' class="accent"' : ""}>${sub.text}</p>` : ""}</body></html>`;
}

async function main() {
  const id = process.argv[2] ?? "electricity";
  const demo = DEMOS[id];
  if (!demo) throw new Error(`모르는 데모: ${id}`);
  const baseIdx = process.argv.indexOf("--base");
  const base = baseIdx > 0 ? process.argv[baseIdx + 1] : "https://blog.oiyo.net";
  const { chromium } = await import("playwright-core").catch(() => {
    throw new Error("playwright-core가 없어요. `npm i --no-save playwright-core` 후 다시 돌리세요.");
  });

  const dir = join(root, ".tmp/shorts/tool-demo", id);
  mkdirSync(dir, { recursive: true });
  const frames = [];
  const browser = await chromium.launch({ executablePath: CHROME, args: ["--no-sandbox"] });
  const page = await browser.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3 });
  const snap = async (sec) => {
    const file = join(dir, `f${String(frames.length).padStart(3, "0")}.png`);
    await page.screenshot({ path: file });
    frames.push([file, sec]);
  };

  await page.setContent(card(demo.intro, { text: demo.introSub }, "#f2c94c"));
  await snap(2.8);

  await page.goto(base + demo.path, { waitUntil: "networkidle", timeout: 120000 });
  await page.addStyleTag({ content: "astro-dev-toolbar{display:none!important}" });
  const box = page.getByPlaceholder(demo.input.placeholder, { exact: false }).first();
  await box.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
  await snap(1.0);
  await box.click();
  // 사람이 치는 속도처럼 두 글자씩 찍는다.
  for (let i = 2; i <= demo.input.text.length; i += 2) {
    await box.fill(demo.input.text.slice(0, i));
    await snap(0.12);
  }
  await box.fill(demo.input.text);
  await snap(0.8);
  await page.getByRole("button", { name: demo.input.apply }).first().click();
  await page.waitForTimeout(300);
  await page.getByText(demo.result, { exact: false }).first().evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.waitForTimeout(300);
  await snap(3.2);
  await page.getByText(demo.extra, { exact: false }).first().evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.waitForTimeout(300);
  await snap(3.0);

  await page.setContent(card(demo.outro, { text: demo.url, accent: true }, "#f2c94c"));
  await snap(3.0);
  await browser.close();

  const list = frames.flatMap(([f, s]) => [`file '${f}'`, `duration ${s}`]);
  list.push(`file '${frames.at(-1)[0]}'`); // concat demuxer는 마지막 장면을 한 번 더 적어야 길이를 지킨다.
  writeFileSync(join(dir, "frames.txt"), list.join("\n"));
  const total = frames.reduce((a, [, s]) => a + s, 0);
  const out = join(root, ".tmp/shorts/tool-demo", `${id}.mp4`);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", join(dir, "frames.txt"),
    "-vf", "scale=1080:1920:flags=lanczos,fps=30,format=yuv420p", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
    "-movflags", "+faststart", "-an", "-t", total.toFixed(2), out]);
  console.log(out, `${total.toFixed(1)}s`);
}

await main();
