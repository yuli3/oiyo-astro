export type OntologyCoordinateId =
  | 'personality'
  | 'political'
  | 'economics'
  | 'joseon'
  | 'hobbies'
  | 'luck';

export interface OntologyCoordinateRecord {
  id: OntologyCoordinateId;
  resultLabel?: string;
  status: 'recorded';
  updatedAt: string;
}

export type OntologyCoordinateProgress = Partial<Record<OntologyCoordinateId, OntologyCoordinateRecord>>;

export const ONTOLOGY_PROGRESS_STORAGE_KEY = 'oiyo:ontology:coordinates';

export function readOntologyProgress(): OntologyCoordinateProgress {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(ONTOLOGY_PROGRESS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed as OntologyCoordinateProgress : {};
  } catch {
    return {};
  }
}

export function markOntologyCoordinateRecorded(id: OntologyCoordinateId, resultLabel?: string) {
  if (typeof window === 'undefined') return;
  try {
    const progress = readOntologyProgress();
    progress[id] = {
      id,
      resultLabel,
      status: 'recorded',
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(ONTOLOGY_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    window.dispatchEvent(new CustomEvent('oiyo:ontology-progress-updated', { detail: { id, resultLabel } }));
  } catch {
    // Ignore storage failures in private or restricted browsing modes.
  }
}
