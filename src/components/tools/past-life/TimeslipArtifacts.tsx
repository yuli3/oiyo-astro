import { useState } from "react";
import { TIMESLIP_ART_NOTE, TIMESLIP_UI_ROOT } from "../../../data/timeslip-ui-art";
import type { L } from "./shared";

export function ArtifactImage({ file, className = "h-56 w-auto", alt = "" }: { file: string; className?: string; alt?: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  const src = TIMESLIP_UI_ROOT + file;
  return failed === src ? null : <img src={src} alt={alt} width={640} height={file.startsWith("tablets/") ? 1138 : 853}
    className={className} loading="lazy" decoding="async" onError={() => setFailed(src)} />;
}

export function ArtifactNote({ l }: { l: L }) {
  return <p className="text-center text-xs leading-relaxed text-muted-foreground">{TIMESLIP_ART_NOTE[l]}</p>;
}

export function HopaeArtifact({ office, rank, province, label }: { office: string; rank: string; province: string; label: string }) {
  return <div className="timeslip-hopae" role="img" aria-label={label}>
    <ArtifactImage file="hopae/cord-red.webp" className="timeslip-hopae-cord" />
    <ArtifactImage file="hopae/wood-blank.webp" className="timeslip-hopae-board" />
    <div className="timeslip-hopae-text" aria-hidden="true">
      <span>{province}</span><span>{rank}</span><strong>{office}</strong>
    </div>
    <span className="timeslip-hopae-year" aria-hidden="true">宣德元年</span>
  </div>;
}
