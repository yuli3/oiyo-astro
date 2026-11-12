// Sound slots for the online sanctuary (2026-11-12).
//
// A slot is a named place for one sound. `file: null` means "not supplied yet": the
// slot is skipped (ambient) or falls back to the built-in synthesized sound (hit).
// To fill a slot later: drop the file in public/sounds/sanctuary/, record its source
// and licence in manifest.json there, and set `file` below. Nothing else changes.
export type SanctuaryScene = 'temple' | 'fire' | 'water' | 'fireworks' | 'cosmos';

export type AmbientSlot = {
  kind: 'ambient';
  file: string | null;
  /** Scenes where this loop plays while sound is on. */
  scenes: readonly SanctuaryScene[];
  gain: number;
  /** Heard from a distance: low-pass, a little echo. */
  far?: boolean;
  /** A stand-in recording that should be replaced when the real one arrives. */
  placeholder?: boolean;
};
export type HitSlot = { kind: 'hit'; file: string | null; gain: number };

const dir = '/sounds/sanctuary/';

export const SOUND_SLOTS = {
  // Filled 2026-11-12 from recordings CHOSEUN downloaded (Pixabay Content License).
  stream: { kind: 'ambient', file: `${dir}stream.mp3`, scenes: ['temple', 'water'], gain: 0.5 },
  firewood: { kind: 'ambient', file: `${dir}firewood.mp3`, scenes: ['fire'], gain: 0.8 },
  // Buddhist-style singing standing in for a real 반야심경 chanting recording.
  chant: { kind: 'ambient', file: `${dir}chant-placeholder.mp3`, scenes: ['temple'], gain: 0.16, far: true, placeholder: true },
  // Synthesized wooden-fish tap. Swap in a real moktak recording when one exists.
  moktak: { kind: 'hit', file: `${dir}moktak-synth.mp3`, gain: 0.7 },
  // Empty slots: skipped until a file is supplied.
  bell: { kind: 'hit', file: null, gain: 0.8 }, // 범종; falls back to the synthesized bell
  windChime: { kind: 'ambient', file: null, scenes: ['temple', 'cosmos'], gain: 0.25 }, // 풍경
  birds: { kind: 'ambient', file: null, scenes: ['temple', 'cosmos'], gain: 0.3 },
  rain: { kind: 'ambient', file: null, scenes: ['water'], gain: 0.4 },
  night: { kind: 'ambient', file: null, scenes: ['fireworks', 'cosmos'], gain: 0.3 }, // 풀벌레
} as const satisfies Record<string, AmbientSlot | HitSlot>;

export type SoundSlotId = keyof typeof SOUND_SLOTS;

export function ambientFor(scene: SanctuaryScene): SoundSlotId[] {
  return (Object.keys(SOUND_SLOTS) as SoundSlotId[]).filter((id) => {
    const slot: AmbientSlot | HitSlot = SOUND_SLOTS[id];
    return slot.kind === 'ambient' && slot.file !== null && slot.scenes.includes(scene);
  });
}

/** Plays the slots on one AudioContext. Every failure (missing file, decode error) is silent. */
export class SanctuarySound {
  private buffers = new Map<SoundSlotId, Promise<AudioBuffer | null>>();
  private playing = new Map<SoundSlotId, { source: AudioBufferSourceNode; gain: GainNode }>();
  private wanted: SoundSlotId[] = [];

  constructor(private ctx: AudioContext) {}

  private load(id: SoundSlotId): Promise<AudioBuffer | null> {
    let p = this.buffers.get(id);
    if (!p) {
      const file = SOUND_SLOTS[id].file;
      p = file
        ? fetch(file).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status))))).then((b) => this.ctx.decodeAudioData(b)).catch(() => null)
        : Promise.resolve(null);
      this.buffers.set(id, p);
    }
    return p;
  }

  /** Crossfade to the ambient loops of this scene. */
  async setScene(scene: SanctuaryScene | null): Promise<void> {
    const want = scene ? ambientFor(scene) : [];
    this.wanted = want;
    const now = this.ctx.currentTime;
    for (const [id, node] of this.playing) {
      if (want.includes(id)) continue;
      node.gain.gain.cancelScheduledValues(now);
      node.gain.gain.setTargetAtTime(0, now, 0.5);
      node.source.stop(now + 2.5);
      this.playing.delete(id);
    }
    await Promise.all(want.filter((id) => !this.playing.has(id)).map(async (id) => {
      const buffer = await this.load(id);
      // The scene may have changed while the file was loading.
      if (!buffer || !this.wanted.includes(id) || this.playing.has(id)) return;
      const slot = SOUND_SLOTS[id] as AmbientSlot;
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.setTargetAtTime(slot.gain, this.ctx.currentTime, 1.2);
      let tail: AudioNode = source;
      if (slot.far) {
        const high = this.ctx.createBiquadFilter(); high.type = 'highpass'; high.frequency.value = 180;
        const low = this.ctx.createBiquadFilter(); low.type = 'lowpass'; low.frequency.value = 1300;
        const delay = this.ctx.createDelay(1); delay.delayTime.value = 0.31;
        const feedback = this.ctx.createGain(); feedback.gain.value = 0.38;
        source.connect(high); high.connect(low);
        low.connect(delay); delay.connect(feedback); feedback.connect(delay); delay.connect(gain);
        tail = low;
      }
      tail.connect(gain); gain.connect(this.ctx.destination);
      source.start();
      this.playing.set(id, { source, gain });
    }));
  }

  /** One-shot. Returns false when the slot has no usable file so the caller can fall back. */
  async hit(id: SoundSlotId, delay = 0): Promise<boolean> {
    const buffer = await this.load(id);
    if (!buffer) return false;
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.value = SOUND_SLOTS[id].gain;
    source.connect(gain); gain.connect(this.ctx.destination);
    source.start(this.ctx.currentTime + delay);
    return true;
  }
}
