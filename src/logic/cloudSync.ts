import type { Character } from '../types';
import type { StoredState } from './storage';

/**
 * Reine Diff-Logik für den Firestore-Sync (ohne Firebase-Abhängigkeit, damit sie im
 * Haupt-Bundle bleiben kann, während das Firebase SDK erst bei Bedarf geladen wird).
 *
 * Cloud-Struktur:
 *   users/{uid}                     → { version, activeId, updatedAt }
 *   users/{uid}/characters/{id}     → vollständiges Charakter-Objekt (inkl. updatedAt)
 */

/** Zuletzt mit Firestore abgeglichener Stand. */
export interface CloudSnapshot {
  /** Existiert das Metadaten-Dokument users/{uid} bereits im neuen Format? */
  metaExists: boolean;
  activeId: string | null;
  /** Charakter-ID → Fingerprint des zuletzt synchronisierten Inhalts */
  chars: Map<string, string>;
}

export interface CloudDiff {
  upserts: Character[];
  deletes: string[];
  /** Metadaten (activeId) müssen geschrieben werden */
  meta: boolean;
  activeId: string | null;
}

// Charaktere sind unveränderliche Objekte (update() erzeugt eine Kopie) → Fingerprint pro Objekt cachen.
const fingerprints = new WeakMap<Character, string>();

/** JSON-Fingerprint eines Charakters. Entspricht zugleich der Firestore-Nutzlast (ohne `undefined`). */
export function fingerprint(c: Character): string {
  let fp = fingerprints.get(c);
  if (fp === undefined) {
    fp = JSON.stringify(c);
    fingerprints.set(c, fp);
  }
  return fp;
}

export function emptySnapshot(): CloudSnapshot {
  return { metaExists: false, activeId: null, chars: new Map() };
}

export function snapshotOf(state: StoredState): CloudSnapshot {
  return {
    metaExists: true,
    activeId: state.activeId,
    chars: new Map(state.characters.map((c) => [c.id, fingerprint(c)])),
  };
}

/** Ermittelt, was gegenüber dem letzten Cloud-Stand geschrieben bzw. gelöscht werden muss. */
export function diffCloud(state: StoredState, prev: CloudSnapshot): CloudDiff {
  const upserts = state.characters.filter((c) => prev.chars.get(c.id) !== fingerprint(c));
  const current = new Set(state.characters.map((c) => c.id));
  // Lokal (auf diesem Gerät) gelöscht → Cloud-Dokument entfernen, sonst taucht er beim nächsten Merge wieder auf.
  const deletes = [...prev.chars.keys()].filter((id) => !current.has(id));
  const meta = !prev.metaExists || prev.activeId !== state.activeId;
  return { upserts, deletes, meta, activeId: state.activeId };
}

export function isEmptyDiff(d: CloudDiff): boolean {
  return d.upserts.length === 0 && d.deletes.length === 0 && !d.meta;
}
