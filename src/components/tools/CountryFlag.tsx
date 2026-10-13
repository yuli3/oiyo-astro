import { useEffect, useState } from "react";

/**
 * 나라 국기. 2026-10-13 세운: "나라 국기, 국조 등의 상징을 그림으로 … 다채롭게".
 *
 * 그림은 flag-icons(MIT, 국기 자체는 퍼블릭 도메인)의 4:3 SVG 다. 270개를 한 번에 싣지 않도록
 * 나라마다 따로 떨어진 파일로 빌드되고, 화면에 나온 나라 것만 받는다.
 * 국기는 옆의 나라 이름을 꾸미는 그림이라 alt 는 비운다.
 */
const FLAGS = import.meta.glob<string>("/node_modules/flag-icons/flags/4x3/*.svg", { query: "?url", import: "default" });

export function flagLoader(iso2: string): (() => Promise<string>) | undefined {
  return FLAGS[`/node_modules/flag-icons/flags/4x3/${iso2.toLowerCase()}.svg`];
}

interface Props {
  iso2: string;
  /** Tailwind 높이 클래스. 너비는 4:3 비율로 따라간다. */
  className?: string;
}

export default function CountryFlag({ iso2, className = "h-4" }: Props) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setSrc(null);
    void flagLoader(iso2)?.().then((url) => {
      if (live) setSrc(url);
    });
    return () => {
      live = false;
    };
  }, [iso2]);

  // 자리를 먼저 잡아 두어 그림이 늦게 와도 글줄이 밀리지 않게 한다.
  return (
    <span aria-hidden="true" className={`inline-block aspect-4/3 shrink-0 overflow-hidden rounded-sm bg-muted ring-1 ring-border ${className}`}>
      {src && <img src={src} alt="" className="size-full object-cover" loading="lazy" decoding="async" />}
    </span>
  );
}
