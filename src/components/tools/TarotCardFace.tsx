type Suit = "wands" | "cups" | "swords" | "pentacles";

const SUIT_MARK: Record<Suit, string> = {
  wands: "棍",
  cups: "杯",
  swords: "剣",
  pentacles: "幣",
};

const SUIT_COLOR: Record<Suit, string> = {
  wands: "#b45309",
  cups: "#1d4ed8",
  swords: "#334155",
  pentacles: "#15803d",
};

const PIP_SLOTS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[50, 28], [50, 72]],
  3: [[50, 22], [50, 50], [50, 78]],
  4: [[32, 28], [68, 28], [32, 72], [68, 72]],
  5: [[32, 26], [68, 26], [50, 50], [32, 74], [68, 74]],
  6: [[32, 24], [68, 24], [32, 50], [68, 50], [32, 76], [68, 76]],
  7: [[32, 22], [68, 22], [50, 38], [32, 54], [68, 54], [32, 78], [68, 78]],
  8: [[32, 20], [68, 20], [32, 40], [68, 40], [32, 60], [68, 60], [32, 80], [68, 80]],
  9: [[32, 18], [68, 18], [32, 38], [68, 38], [50, 50], [32, 62], [68, 62], [32, 82], [68, 82]],
  10: [[32, 16], [68, 16], [32, 34], [68, 34], [32, 50], [68, 50], [32, 66], [68, 66], [32, 84], [68, 84]],
};

export function TarotCardFace({
  name,
  symbol,
  roman,
  suit,
  rank,
  reversed,
}: {
  name: string;
  symbol?: string;
  roman?: string;
  suit?: string;
  rank?: number;
  reversed?: boolean;
}) {
  const knownSuit = suit && suit in SUIT_MARK ? (suit as Suit) : undefined;
  const color = knownSuit ? SUIT_COLOR[knownSuit] : "#854d0e";
  const pips = knownSuit && rank && rank >= 1 && rank <= 10 ? PIP_SLOTS[rank] : null;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[0.65rem] border-2 border-amber-200 bg-[#f7f1e1] text-[#3f2a14]">
      <div className="pointer-events-none absolute inset-1 rounded-[0.45rem] border border-amber-800/25" />
      <div className={`flex flex-1 flex-col ${reversed ? "rotate-180" : ""}`}>
        <header className="flex items-start justify-between px-2 pt-1.5 text-[10px] font-black tracking-widest">
          <span>{roman ?? (rank ? String(rank) : "")}</span>
          <span style={{ color }}>{knownSuit ? SUIT_MARK[knownSuit] : "✦"}</span>
        </header>
        <div className="relative mx-2 min-h-0 flex-1 overflow-hidden rounded-sm bg-[#fffaf0]">
          {pips ? (
            <PipField color={color} pips={pips} mark={SUIT_MARK[knownSuit!]} />
          ) : (
            <MajorGlyph symbol={symbol ?? "✦"} color={color} />
          )}
        </div>
        <footer className="px-2 pb-1.5 pt-1 text-center font-serif text-[10px] font-bold leading-tight">
          {name}
        </footer>
      </div>
    </div>
  );
}

function PipField({ color, pips, mark }: { color: string; pips: [number, number][]; mark: string }) {
  return (
    <div className="relative h-full w-full">
      {pips.map(([x, y], i) => (
        <span
          key={`${x}-${y}-${i}`}
          className="absolute -translate-x-1/2 -translate-y-1/2 font-black"
          style={{ left: `${x}%`, top: `${y}%`, color, fontSize: pips.length > 7 ? "0.7rem" : "0.95rem" }}
        >
          {mark}
        </span>
      ))}
    </div>
  );
}

function MajorGlyph({ symbol, color }: { symbol: string; color: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1">
      <span className="text-4xl leading-none" style={{ color }} aria-hidden>
        {symbol}
      </span>
      <svg viewBox="0 0 80 24" className="h-5 w-16 text-amber-800/40" aria-hidden>
        <path d="M4 12 H76 M40 2 V22" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="40" cy="12" r="4" fill="none" stroke="currentColor" />
      </svg>
    </div>
  );
}

export function romanMajor(id: number): string {
  const map = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];
  return map[id] ?? String(id);
}
