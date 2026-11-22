#!/usr/bin/env node
// 시즌 도구·페이지 15초 세로 쇼츠(1080x1920) (2026-11-22).
// 장면 3개: 질문(4s) → 페이지에 실제로 있는 내용 3줄(6.5s) → 주소 카드(5.5s), 0.5초 겹침. 무음 트랙.
// 결과는 public/videos/season/<slug>.mp4. Buffer가 raw.githubusercontent.com 주소로 가져가므로 main에 커밋해야 예약할 수 있다.
// 문구는 각 페이지 제목·설명·본문에 있는 사실만 쓴다(날짜·숫자 새로 만들지 않기).
//
//   NODE_PATH=$(npm root -g) node scripts/shorts/render-season-short.mjs [slug...]
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const { chromium } = createRequire(import.meta.url)("playwright");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const font = `data:font/woff2;base64,${readFileSync(join(root, "public/fonts/GowunBatang-ks-400.woff2")).toString("base64")}`;

// bg·accent: 장면 색. art: public/images/shorts/<art>-keyart.webp 를 둘째 장면에 넣는다(게임). url: 마지막 카드 주소(https:// 없이).
export const SHORTS = {
  "secret-santa-generator": {
    bg: "#173a2c", accent: "#b3262d", tag: "OIYO 도구 · 송년회·크리스마스",
    hook: ["송년회 마니또,", "뽑은 사람도 모르게", "뽑을 수 있을까?"],
    lines: ["자기 이름은 절대 안 나와요", "커플·가족끼리 안 걸리게 제외", "결과는 사람마다 각자 링크로"],
    cta: "이름만 적고<br>뽑아 보세요", foot: "가입 없이 무료 · 폰 하나로 돌려 보기도", url: "tools.oiyo.net/ko/secret-santa-generator",
  },
  "annual-leave-combo-2027": {
    bg: "#1d2f4f", accent: "#d9822b", tag: "OIYO 도구 · 2027 연차 계획",
    hook: ["2027년 추석,", "연차 2일로", "9일 쉬는 법"],
    lines: ["추석: 연차 2일 → 9일 연휴", "설: 연차 1일 → 5일 연휴", "10월: 대체공휴일 두 번"],
    cta: "내 연차로<br>최장 연휴 찾기", foot: "연차 1~10일, 징검다리 날짜까지", url: "tools.oiyo.net/ko/annual-leave-combo-2027",
  },
  "christmas-personality-test": {
    bg: "#3a1820", accent: "#2f7a4f", tag: "OIYO 테스트 · 크리스마스",
    hook: ["크리스마스에", "나는 산타형?", "눈사람형?"],
    lines: ["질문 8개로 알아보는 내 유형", "산타·순록·눈사람·생강쿠키·트리", "올해의 추천과 잘 맞는 짝까지"],
    cta: "내 크리스마스 유형은?", foot: "결과를 친구와 비교해 보세요", url: "oiyo.net/ko/christmas-personality-test",
  },
  "dongji-2026": {
    bg: "#2b1a17", accent: "#9c2f24", tag: "OIYO · 동지 팥죽",
    hook: ["2026년 동지는", "12월 22일,", "왜 중동지일까?"],
    lines: ["음력 11월 14일이라 중동지", "애동지·중동지·노동지 구분", "팥죽과 새알심, 동지 책력 풍습"],
    cta: "팥죽 한 그릇으로<br>한 해 정리", foot: "올해 동지 풍습을 한눈에", url: "oiyo.net/ko/dongji-2026",
  },
  "new-year-2027": {
    bg: "#3d1414", accent: "#c9a227", tag: "OIYO · 2027 신년운세",
    hook: ["2027년은", "붉은 양의 해,", "내 신년운세는?"],
    lines: ["정미년 신년운세를 한곳에", "생일 하나로 띠·별자리·개인년", "토정비결·신년 사주로 이어 보기"],
    cta: "생일을 넣어 보세요", foot: "재미로 보는 새해 운세", url: "oiyo.net/ko/new-year-2027",
  },
  "sebaetdon-2027": {
    bg: "#402a12", accent: "#b3262d", tag: "OIYO · 2027 설날",
    hook: ["2027 설 세뱃돈,", "신권 몇 장", "바꿔야 할까?"],
    lines: ["설날 2월 7일(일), 연휴 2/6~9", "조카·자녀·부모님 봉투별 합계", "바꿀 신권 장수와 덕담까지"],
    cta: "봉투를 넣어<br>계산해 보세요", foot: "은행 가기 전에 한 번에 정리", url: "oiyo.net/ko/sebaetdon-2027",
  },
  "rampart-keeper": {
    bg: "#1f2340", accent: "#c98a2b", tag: "OIYO 게임 · 물리 디펜스", art: "rampart-keeper",
    hook: ["성문 앞에 돌을 쌓고", "몰려오는 적에게", "바위를 떨어뜨린다면?"],
    lines: ["나무·돌·들보를 쌓아 성문 지키기", "공성추·거인·폭탄 수레", "30웨이브, 설치 없이 바로"],
    cta: "성문을 지켜 보세요", foot: "무료 · 브라우저에서 바로", url: "game.oiyo.net/ko/rampart-keeper",
  },
  "season-workshop": {
    bg: "#2c2418", accent: "#a8412c", tag: "OIYO 게임 · 24절기 방치형", art: "season-workshop",
    hook: ["입춘첩부터", "동지 팥죽까지,", "24절기 공방을 차린다면?"],
    lines: ["절기마다 그때 만들던 물건", "연장·일꾼·아궁이 늘리기", "창을 닫아도 일꾼이 일해요"],
    cta: "공방을 열어 보세요", foot: "무료 · 동지 팥죽까지 24절기", url: "game.oiyo.net/ko/season-workshop",
  },
  "tidy-nook": {
    bg: "#3a2c28", accent: "#7d9b6a", tag: "OIYO 게임 · 코지 수납 퍼즐", art: "tidy-nook",
    hook: ["머그잔·책·곰 인형,", "선반 빈칸 없이", "다 넣을 수 있을까?"],
    lines: ["물건을 돌려 가며 꼭 맞게", "신발장부터 다락방까지 20개 방", "시간 제한 없는 느긋한 퍼즐"],
    cta: "방을 정리해 보세요", foot: "무료 · 브라우저에서 바로", url: "game.oiyo.net/ko/tidy-nook",
  },
  "link-duel": {
    bg: "#1b2d3a", accent: "#d14b5a", tag: "OIYO 게임 · 친구와 링크 대결", art: "link-duel",
    hook: ["링크 하나 보내면", "친구가 똑같은 10판으로", "내 점수에 도전!"],
    lines: ["암산·멈추기·점 세기·색 찾기", "같은 판으로 점수 겨루기", "서버·가입 없이 12리그"],
    cta: "10판 하고<br>링크 보내기", foot: "무료 · 단톡방에 던져 보세요", url: "game.oiyo.net/ko/link-duel",
  },
  "sunrise-2027": {
    bg: "#1d1f3d", accent: "#e0792b", tag: "OIYO · 2027 첫 해맞이", art: "sunrise-2027",
    hook: ["2027년 첫 해,", "가장 먼저 보는 곳은", "어디일까?"],
    lines: ["독도 7시 26분, 육지는 간절곶 7시 31분", "서울 7시 47분, 정동진 7시 39분", "내 위치 일출과 여명 시각까지"],
    cta: "해맞이 갈 곳<br>시각 확인하기", foot: "1월 1일(금) 해맞이 명소 일출표", url: "oiyo.net/ko/sunrise-2027",
  },
  "mandalart-2027": {
    bg: "#1e2b3a", accent: "#c9a227", tag: "OIYO 도구 · 2027 새해 목표", art: "mandalart-2027",
    hook: ["2027년 목표,", "81칸 만다라트로", "쪼개 볼까?"],
    lines: ["가운데 핵심 목표 1개", "세부 목표 8개, 실천 64개", "휴대폰 배경 이미지로 저장"],
    cta: "새해 목표<br>바로 채워 보기", foot: "인쇄 없이 · 자동 저장 · 가입 없음", url: "oiyo.net/ko/mandalart-2027",
  },
  "calendar-2027": {
    bg: "#2a1d1d", accent: "#b3262d", tag: "OIYO · 2027 달력", art: "calendar-2027",
    hook: ["2027년 빨간 날,", "대체공휴일까지", "한 번에 볼까?"],
    lines: ["설 연휴 2월 6~9일", "추석 9월 14~16일", "대체공휴일 6일, 24절기·손 없는 날"],
    cta: "2027 달력<br>보고 인쇄하기", foot: "월별 음력·절기까지 한 장씩", url: "oiyo.net/ko/calendar-2027",
  },
  "snowman-stack": {
    bg: "#1b2a44", accent: "#5fa8d3", tag: "OIYO 게임 · 겨울 물리 쌓기", art: "snowman-stack",
    hook: ["썰매에서 눈덩이를 떨궈", "넘어지지 않는", "눈사람을 쌓을 수 있을까?"],
    lines: ["닿으면 달라붙는 눈덩이", "기울면 와르르, 바람과 얼음 연못", "20단계, 설치 없이 바로"],
    cta: "눈사람을<br>쌓아 보세요", foot: "무료 · 브라우저에서 바로", url: "game.oiyo.net/ko/snowman-stack",
  },
  "yut-nori": {
    bg: "#3a1f14", accent: "#2f5fb3", tag: "OIYO 게임 · 설날 윷놀이", art: "yut-nori",
    hook: ["설날 윷놀이,", "전설의 할머니를", "이길 수 있을까?"],
    lines: ["옆집 꼬마부터 할머니까지 AI 10단계", "한 폰으로 가족과 둘이서", "빽도·업기·잡기·지름길 그대로"],
    cta: "윷을<br>던져 보세요", foot: "무료 · 설치 없이 바로", url: "game.oiyo.net/ko/yut-nori",
  },
};

const W = 1080, H = 1920;
const art = (s) => s.art ? `file://${join(root, `public/images/shorts/${s.art}-keyart.webp`)}` : null;
const css = (s) => `@font-face{font-family:G;src:url(${font})}*{margin:0;box-sizing:border-box;word-break:keep-all}
body{width:${W}px;height:${H}px;overflow:hidden;font-family:G,serif;color:#fff;position:relative;
background:radial-gradient(circle at 30% 20%,${s.accent}55,transparent 55%),radial-gradient(circle at 80% 85%,${s.accent}44,transparent 50%),${s.bg}}
.c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 70px;gap:44px}
h1{font-size:104px;line-height:1.3;font-weight:400;text-shadow:0 4px 20px #0008}
p{font-size:46px;opacity:.85;line-height:1.4}
.tag{font-size:42px;opacity:.8;letter-spacing:2px}
ul{list-style:none;display:flex;flex-direction:column;gap:34px;width:100%}
li{background:#ffffff14;border-left:12px solid ${s.accent};border-radius:18px;padding:40px 44px;font-size:58px;text-align:left;line-height:1.35}
img{width:960px;border-radius:24px;box-shadow:0 20px 60px #000a}
.url{background:${s.accent};padding:28px 36px;border-radius:20px;font-size:${s.url.length > 30 ? 40 : 52}px;white-space:nowrap}`;

function scenes(s) {
  const wrap = (inner) => `<!doctype html><meta charset=utf-8><style>${css(s)}</style><div class=c>${inner}</div>`;
  return [
    wrap(`<div class=tag>${s.tag}</div><h1>${s.hook.join("<br>")}</h1>`),
    s.art
      ? wrap(`<div class=tag>${s.tag}</div><img src="${art(s)}"><ul>${s.lines.map((l) => `<li>${l}</li>`).join("")}</ul>`)
      : wrap(`<div class=tag>${s.tag}</div><ul>${s.lines.map((l) => `<li>${l}</li>`).join("")}</ul>`),
    wrap(`<h1>${s.cta}</h1><div class=url>${s.url}</div><p>${s.foot}</p>`),
  ];
}

async function render(browser, slug) {
  const s = SHORTS[slug];
  if (!s) throw new Error(`unknown short ${slug}`);
  const tmp = join(root, ".tmp/shorts/season", slug);
  mkdirSync(tmp, { recursive: true });
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const pngs = [];
  for (const [i, html] of scenes(s).entries()) {
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
  const durs = [4, 6.5, 5.5];
  const zoom = (i, d) => `[${i}:v]scale=${W * 2}:${H * 2},zoompan=z='min(zoom+0.0006,1.06)':d=${Math.round(d * 30)}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${W}x${H}:fps=30,setsar=1,format=yuv420p[v${i}]`;
  const filter = [zoom(0, durs[0]), zoom(1, durs[1]), zoom(2, durs[2]),
    `[v0][v1]xfade=transition=fade:duration=0.5:offset=${durs[0] - 0.5}[a]`,
    `[a][v2]xfade=transition=fade:duration=0.5:offset=${durs[0] + durs[1] - 1}[v]`].join(";");
  const out = join(root, `public/videos/season/${slug}.mp4`);
  execFileSync("ffmpeg", ["-v", "error", "-y",
    ...pngs.flatMap((p, i) => ["-loop", "1", "-t", String(durs[i]), "-i", p]),
    "-f", "lavfi", "-t", "15", "-i", "anullsrc=r=44100:cl=stereo",
    "-filter_complex", filter, "-map", "[v]", "-map", "3:a",
    "-c:v", "libx264", "-preset", "slow", "-crf", "26", "-r", "30", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "64k", "-t", "15", "-movflags", "+faststart", out]);
  console.log(out);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const slugs = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SHORTS);
  mkdirSync(join(root, "public/videos/season"), { recursive: true });
  const browser = await chromium.launch();
  try { for (const s of slugs) await render(browser, s); } finally { await browser.close(); }
}
