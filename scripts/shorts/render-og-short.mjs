#!/usr/bin/env node
// 타임슬립 회차 OG 그림으로 15초 세로 쇼츠(1080x1920)를 만든다 (2026-11-22).
// 장면 3개: 질문(4s) → 회차 그림(6s) → 주소 카드(5s), 0.5초 겹침. 소리는 무음 트랙(YouTube 업로드 호환).
// 그림은 public/images/past-life-1426/og/<og>.webp, 결과는 public/videos/timeslip/<slug>.mp4.
// Buffer가 raw.githubusercontent.com 주소로 영상을 가져가므로 main에 커밋해야 예약할 수 있다.
//
//   node scripts/shorts/render-og-short.mjs            # 아래 EPISODES 전부
//   node scripts/shorts/render-og-short.mjs cotton-1426 # 하나만
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

// playwright는 의존성에 없다. 전역 설치(NODE_PATH)나 `npm i --no-save playwright`로 찾는다.
const { chromium } = createRequire(import.meta.url)("playwright");

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const font = `data:font/woff2;base64,${readFileSync(join(root, "public/fonts/GowunBatang-ks-400.woff2")).toString("base64")}`;

// hook: 첫 화면 질문(줄 단위). sub: 그림 위아래 한 줄. cta·foot: 마지막 카드(기본은 생일 뽑기 문구). 문구는 페이지에 실제로 있는 내용만 쓴다.
export const EPISODES = {
  "parallel-lives": { og: "parallel-lives", hook: ["신라부터 오늘까지", "내 평행 인생을", "한 장에 모으면?"], sub: "타임슬립 시리즈 결과를 연표 한 장으로", cta: "내 연표를 만들어 보세요", foot: "회차를 돌수록 칸이 채워져요" },
  "future-2626": { og: "future-2626", hook: ["600년 뒤 박물관에", "내 스마트폰이", "걸려 있다면?"], sub: "미래 학자가 쓴 내 물건 유물 설명", cta: "내 물건을 골라 보세요", foot: "엉뚱한 미래 유물 설명서<br>친구와 비교도 돼요" },
  "joseon-time": { og: "joseon-time", hook: ["지금 이 시각,", "조선 사람에게는", "몇 시였을까?"], sub: "해시계 기준 12시·각·경점으로 바꿔요", cta: "지금 시각을 바꿔 보세요", foot: "한양 해시계(앙부일구) 기준" },
  "gyeonggongjang": { og: "gyeonggongjang", hook: ["1485년 서울", "관청 장인이라면", "나는 무엇을 만들까?"], sub: "『경국대전』 경공장 장적 속 내 자리" },
  "night-sky-1426": { og: "night-sky-1426", hook: ["1426년", "내 생일 밤", "한양 하늘에는?"], sub: "세종 8년, 그날 밤의 달과 행성", cta: "생일을 넣어 보세요", foot: "그날 밤 달 모양과 행성 위치" },
  "sillok-name-hanja": { og: "sillok-name-hanja", hook: ["내 이름 한자가", "세종실록에", "몇 번 나올까?"], sub: "1426년 실록 속 내 이름 글자 순위", cta: "이름 한자를 넣어 보세요", foot: "전체 2,950자 가운데 몇 위?" },
  "cotton-1426": { og: "cotton-1426", hook: ["1426년 한양이라면", "내 월급은", "면포 몇 필?"], sub: "세종실록 속 말값·포상금과 견줘 봐요", cta: "내 월급을 넣어 보세요", foot: "면포·쌀·저화·동전으로 환산" },
  "hanyang-fire-1426": { og: "hanyang-fire-1426", hook: ["1426년 한양 대화재,", "불 대책 5가지를", "고른다면?"], sub: "세종 조정의 실제 대책과 맞춰 보기", cta: "대책 5가지를 골라 보세요", foot: "실록에 남은 실제 대책과 비교" },
  "sejong-birthdays": { og: "sejong-birthdays", hook: ["세종 32년 동안", "해마다 내 생일에", "무슨 일이?"], sub: "실록 기사 3만여 건에서 내 생일만", cta: "생일을 넣어 보세요", foot: "32년 치 실록을 한 번에" },
  "silla-golpum": { og: "silla", hook: ["1300년 전 신라에서", "나는 어느 골품,", "어디까지 오를까?"], sub: "골품과 17관등, 실제 제도 그대로", cta: "내 골품을 뽑아 보세요", foot: "재미로 보는 역사 고증 놀이" },
};

const W = 1080, H = 1920;
const css = `@font-face{font-family:G;src:url(${font})}*{margin:0;box-sizing:border-box;word-break:keep-all}
body{width:${W}px;height:${H}px;overflow:hidden;font-family:G,serif;color:#fff;background:#2a241d;position:relative}
.bg{position:absolute;inset:-60px;background-size:cover;background-position:center;filter:blur(28px) brightness(.45)}
.c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 70px;gap:40px}
h1{font-size:104px;line-height:1.3;font-weight:400;text-shadow:0 4px 20px #0008}
p{font-size:46px;opacity:.85}
.tag{font-size:44px;opacity:.8}
img{width:960px;border-radius:18px;box-shadow:0 20px 60px #000a}
.url{background:#8a2a1e;padding:28px 36px;border-radius:20px;font-size:52px;white-space:nowrap}`;

function scenes(slug, ep) {
  const art = "file://" + join(root, `public/images/past-life-1426/og/${ep.og}.webp`);
  const wrap = (inner) => `<!doctype html><meta charset=utf-8><style>${css}</style><div class=bg style="background-image:url('${art}')"></div><div class=c>${inner}</div>`;
  return [
    wrap(`<h1>${ep.hook.join("<br>")}</h1><p>${ep.sub}</p>`),
    wrap(`<div class=tag>OIYO 타임슬립</div><img src="${art}"><p>${ep.sub}</p>`),
    wrap(`<h1>${ep.cta || "생일로 뽑아 보세요"}</h1><div class=url>oiyo.net/ko/${slug}</div><p>${ep.foot || "같은 생일은 늘 같은 결과<br>친구와 비교도 돼요"}</p>`),
  ];
}

async function render(browser, slug) {
  const ep = EPISODES[slug];
  if (!ep) throw new Error(`unknown episode ${slug}`);
  const tmp = join(root, ".tmp/shorts/og", slug);
  mkdirSync(tmp, { recursive: true });
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const pngs = [];
  for (const [i, html] of scenes(slug, ep).entries()) {
    const file = join(tmp, `s${i}.html`);
    writeFileSync(file, html);
    await page.goto("file://" + file);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(200);
    const png = join(tmp, `s${i}.png`);
    await page.screenshot({ path: png });
    pngs.push(png);
  }
  await page.close();
  const durs = [4, 6.5, 5.5]; // 겹침 0.5s ×2 → 15s
  const zoom = (i, d) => `[${i}:v]scale=${W * 2}:${H * 2},zoompan=z='min(zoom+0.0006,1.06)':d=${Math.round(d * 30)}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${W}x${H}:fps=30,setsar=1,format=yuv420p[v${i}]`;
  const filter = [zoom(0, durs[0]), zoom(1, durs[1]), zoom(2, durs[2]),
    `[v0][v1]xfade=transition=fade:duration=0.5:offset=${durs[0] - 0.5}[a]`,
    `[a][v2]xfade=transition=fade:duration=0.5:offset=${durs[0] + durs[1] - 1}[v]`].join(";");
  const out = join(root, `public/videos/timeslip/${slug}.mp4`);
  execFileSync("ffmpeg", ["-v", "error", "-y",
    ...pngs.flatMap((p, i) => ["-loop", "1", "-t", String(durs[i]), "-i", p]),
    "-f", "lavfi", "-t", "15", "-i", "anullsrc=r=44100:cl=stereo",
    "-filter_complex", filter, "-map", "[v]", "-map", "3:a",
    "-c:v", "libx264", "-preset", "slow", "-crf", "26", "-r", "30", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "64k", "-t", "15", "-movflags", "+faststart", out]);
  console.log(out);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const slugs = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(EPISODES);
  if (!existsSync(join(root, "public/videos/timeslip"))) mkdirSync(join(root, "public/videos/timeslip"), { recursive: true });
  const browser = await chromium.launch();
  try { for (const s of slugs) await render(browser, s); } finally { await browser.close(); }
}
