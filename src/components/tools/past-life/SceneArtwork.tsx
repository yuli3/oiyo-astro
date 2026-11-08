import { useState } from "react";
import type { Locale } from "../../../i18n";
import { PAST_LIFE_ART, PAST_LIFE_ART_NOTE, type PastLifeArtKey } from "../../../data/past-life-art";

export default function SceneArtwork({ scene, locale }: { scene: PastLifeArtKey; locale: Locale }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const asset = PAST_LIFE_ART[scene];
  const src = `/images/past-life-1426/${asset.file}`;
  // A failed picture must not hide the result or keep an empty image frame.
  // Compare the source so another result can still load after a prior failure.
  return (
    <figure className="space-y-2" data-timeslip-scene={scene}>
      {failedSource !== src && (
        <img src={src} alt={asset.alt[locale]} width={1248} height={832}
          loading="lazy" decoding="async" className="h-auto w-full rounded-xl"
          onError={() => setFailedSource(src)} />
      )}
      <figcaption className="px-1 text-xs leading-relaxed text-muted-foreground">
        {PAST_LIFE_ART_NOTE[locale]}
      </figcaption>
    </figure>
  );
}
