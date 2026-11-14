export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'failed';

/** A dismissed share sheet must not unexpectedly overwrite the clipboard (2026-11-02). */
export async function deliverReincarnationShare(
  payload: { title: string; text: string; url: string },
  platform: { share?: (data: { title: string; text: string; url: string }) => Promise<void>; copy: (text: string) => Promise<void> },
): Promise<ShareOutcome> {
  if (platform.share) {
    try { await platform.share(payload); return 'shared'; }
    catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return 'cancelled';
      return 'failed';
    }
  }
  try { await platform.copy(`${payload.text}\n${payload.url}`); return 'copied'; }
  catch { return 'failed'; }
}
