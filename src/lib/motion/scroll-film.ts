// Scroll film — a pinned, scroll-scrubbed "commercial" sequence (2026-11-11).
//
// Reference vocabulary: Motion Prompt (MIT, showheyohtaki/motion-prompt) #076 Pinning,
// #152 Zoom on scroll, #146 Scroll text reveal, #005 Mask reveal. We borrow the names
// and specs, not code: the samples there are canvas loops, ours drive real DOM.
//
// Rules (emil-design-eng / animation-performance skills): transform + opacity only,
// ease-out for entrances, no ease-in on UI, nothing starts from scale(0).
//
// The page is fully readable without this script: CSS shows every chapter stacked.
// Only when JS runs AND the reader has not asked for reduced motion does the root
// switch to data-film-mode="live", which pins the stage and crossfades chapters.
import { prefersReducedMotion } from "@/hooks/useMotion";

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function mountScrollFilm(root: HTMLElement): void {
  const track = root.querySelector<HTMLElement>("[data-film-track]");
  const intro = root.querySelector<HTMLElement>("[data-film-intro]");
  const chapters = [...root.querySelectorAll<HTMLElement>("[data-film-chapter]")];
  const ticks = [...root.querySelectorAll<HTMLElement>("[data-film-tick]")];
  if (!track || chapters.length === 0) return;

  // Reduced motion: keep the static stacked layout. Not "no motion at all" — the
  // global CSS blanket still lets opacity states change — just no scroll-jacked
  // pinning or zoom, which is exactly what vestibular users ask to avoid.
  if (prefersReducedMotion()) return;
  root.dataset.filmMode = "live";

  const n = chapters.length;
  let frame = 0;

  const render = () => {
    frame = 0;
    const vh = window.innerHeight;

    if (intro) {
      const r = intro.getBoundingClientRect();
      const q = clamp(-r.top / Math.max(1, r.height));
      intro.style.setProperty("--film-q", q.toFixed(4));
    }

    const r = track.getBoundingClientRect();
    const travel = Math.max(1, r.height - vh);
    const p = clamp(-r.top / travel);
    const L = p * n;
    let active = 0;

    chapters.forEach((el, i) => {
      const local = L - i; // 0..1 while this chapter owns the stage
      // Crossfade: fully visible in the middle 70%, fading over the outer 15%.
      // The first chapter is already up when the stage pins; the last one stays.
      let o = clamp(1 - (Math.abs(local - 0.5) - 0.35) / 0.15);
      if (i === 0 && local < 0.5) o = 1;
      if (i === n - 1 && local > 0.5) o = 1;

      // Slow push-in, like a Ken Burns move on a product shot.
      const s = 1.16 - 0.16 * clamp((local + 0.15) / 1.3);

      // Caption rises in after the picture settles, and leaves a beat before it.
      // The first caption is already in place when the stage pins (the intro led into it).
      const enter = i === 0 ? 1 : easeOut(clamp((local - 0.06) / 0.3));
      const leave = i === n - 1 ? 1 : clamp((0.92 - local) / 0.12);
      const co = enter * leave;
      const cy = (1 - enter) * 48;

      el.style.setProperty("--film-o", o.toFixed(4));
      el.style.setProperty("--film-s", s.toFixed(4));
      el.style.setProperty("--film-co", co.toFixed(4));
      el.style.setProperty("--film-cy", `${cy.toFixed(2)}px`);

      const visible = o > 0.5;
      if (visible) active = i;
      // Links in faded-out chapters must not take keyboard focus.
      el.toggleAttribute("inert", !visible);
      el.setAttribute("aria-hidden", visible ? "false" : "true");
    });

    ticks.forEach((t, i) => t.toggleAttribute("data-active", i === active));
    root.style.setProperty("--film-p", p.toFixed(4));
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  render();
}
