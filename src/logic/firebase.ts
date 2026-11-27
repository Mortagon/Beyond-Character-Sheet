import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  writeBatch,
  type DocumentReference,
  type Firestore,
} from 'firebase/firestore';
import type { Character } from '../types';
import { normalizeCharacter } from './character';
import { fingerprint, type CloudDiff, type CloudSnapshot } from './cloudSync';
import type { StoredState } from './storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDwu36xGfe82lAL4x1pNuiZweCzofnR7MA',
  authDomain: 'beyond-character-sheet.firebaseapp.com',
  projectId: 'beyond-character-sheet',
  storageBucket: 'beyond-character-sheet.firebasestorage.app',
  messagingSenderId: '486677728495',
  appId: '1:486677728495:web:0bae7c758db444f70cdf1a',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export type CloudSyncState = 'offline' | 'syncing' | 'synced' | 'error';

export function subscribeAuth(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export async function loginWithGoogle(): Promise<User | null> {
  // Fehler (auch auth/popup-blocked) gehen an den Aufrufer, der per formatFirebaseError einen Hinweis zeigt.
  const res = await signInWithPopup(auth, googleProvider);
  return res.user;
}

/** Firebase-Codes, bei denen der User das Login-Popup selbst geschlossen/abgebrochen hat – kein echter Fehler. */
const LOGIN_CANCEL_CODES = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/user-cancelled']);

export function isLoginCancelled(err: unknown): boolean {
  return LOGIN_CANCEL_CODES.has((err as { code?: string })?.code ?? '');
}

export async function logoutGoogle(): Promise<void> {
  await signOut(auth);
}

export function formatFirebaseError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  const msg = err instanceof Error ? err.message : String(err);
  if (code === 'auth/operation-not-allowed' || code === 'auth/configuration-not-found') {
    return 'Google-Login ist in der Firebase Console noch nicht aktiviert (Authentication → Sign-in method → Google).';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'Diese Domain ist in Firebase Authentication noch nicht autorisiert.';
  }
  if (LOGIN_CANCEL_CODES.has(code)) {
    return 'Anmeldung abgebrochen';
  }
  if (code === 'auth/popup-blocked') {
    return 'Das Anmeldefenster wurde vom Browser blockiert – bitte Popups für diese Seite erlauben und erneut anmelden.';
  }
  if (code === 'permission-denied' || msg.includes('PERMISSION_DENIED')) {
    return 'Firestore-Zugriff verweigert (Regeln oder Firestore-Datenbank in Firebase Console prüfen).';
  }
  if (code === 'auth/network-request-failed' || code === 'unavailable') {
    return 'Cloud nicht erreichbar (offline?). Änderungen bleiben lokal gespeichert.';
  }
  if (msg.includes('Cloud Firestore API') || code === 'failed-precondition') {
    return 'Cloud Firestore ist im Firebase-Projekt noch nicht initialisiert.';
  }
  if (code === 'resource-exhausted' || code === 'invalid-argument') {
    return `Cloud-Speichern abgelehnt (${code}) – Daten evtl. zu groß oder ungültig. Lokal bleibt alles gespeichert.`;
  }
  return msg;
}

/** Firestore erlaubt max. 500 Operationen pro Batch. */
const MAX_BATCH_OPS = 500;

type BatchOp = (batch: ReturnType<typeof writeBatch>) => void;

/** Führt die Operationen in Batches à max. 500 Ops nacheinander aus (Reihenfolge bleibt erhalten). */
async function commitInBatches(firestore: Firestore, ops: BatchOp[]): Promise<void> {
  for (let i = 0; i < ops.length; i += MAX_BATCH_OPS) {
    const batch = writeBatch(firestore);
    for (const op of ops.slice(i, i + MAX_BATCH_OPS)) op(batch);
    await batch.commit();
  }
}

function metaRef(uid: string): DocumentReference {
  return doc(db, 'users', uid);
}

function characterRef(uid: string, id: string): DocumentReference {
  return doc(db, 'users', uid, 'characters', id);
}

/** Firestore-Nutzlast: reines JSON (entfernt `undefined`, das Firestore ablehnt) + updatedAt. */
function characterPayload(c: Character): Record<string, unknown> {
  return { ...(JSON.parse(fingerprint(c)) as Record<string, unknown>), updatedAt: c.updatedAt ?? Date.now() };
}

export interface CloudLoadResult {
  state: StoredState;
  /** Stand, der nach dem Laden (und ggf. der Migration) in Firestore liegt */
  snapshot: CloudSnapshot;
}

/**
 * Lädt Metadaten-Dokument + Subcollection `users/{uid}/characters`.
 * Enthält `users/{uid}` noch das Legacy-Feld `characters` (altes Ein-Dokument-Format), werden diese
 * Charaktere in die Subcollection migriert (neuere Version je ID gewinnt) und das Feld danach entfernt.
 */
export async function loadCloudCharacters(uid: string): Promise<CloudLoadResult> {
  const [metaSnap, charSnap] = await Promise.all([getDoc(metaRef(uid)), getDocs(collection(db, 'users', uid, 'characters'))]);

  const byId = new Map<string, Character>();
  for (const d of charSnap.docs) byId.set(d.id, normalizeCharacter({ ...d.data(), id: d.id }));

  const meta = metaSnap.exists() ? (metaSnap.data() as { characters?: unknown; activeId?: unknown }) : null;
  let activeId = typeof meta?.activeId === 'string' ? meta.activeId : null;

  if (meta && 'characters' in meta) {
    // ---- Migration aus dem Legacy-Format ----
    const legacy = Array.isArray(meta.characters) ? meta.characters.map(normalizeCharacter) : [];
    const toWrite: Character[] = [];
    for (const c of legacy) {
      const existing = byId.get(c.id);
      if (!existing || (c.updatedAt ?? 0) > (existing.updatedAt ?? 0)) {
        byId.set(c.id, c);
        toWrite.push(c);
      }
    }
    const ops: BatchOp[] = toWrite.map((c) => (b) => b.set(characterRef(uid, c.id), characterPayload(c)));
    // Legacy-Feld erst im letzten Batch entfernen – also erst, wenn alle Charaktere geschrieben sind.
    ops.push((b) =>
      b.set(metaRef(uid), { version: 1, activeId, updatedAt: Date.now(), characters: deleteField() }, { merge: true }),
    );
    await commitInBatches(db, ops);
  }

  const characters = [...byId.values()].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  if (!activeId || !byId.has(activeId)) activeId = characters[0]?.id ?? null;

  return {
    state: { version: 1, characters, activeId },
    snapshot: {
      metaExists: meta !== null,
      activeId: typeof meta?.activeId === 'string' ? meta.activeId : null,
      chars: new Map(characters.map((c) => [c.id, fingerprint(c)])),
    },
  };
}

/** Schreibt nur geänderte/neue Charaktere, löscht lokal entfernte und aktualisiert bei Bedarf die Metadaten. */
export async function saveCloudChanges(uid: string, diff: CloudDiff): Promise<void> {
  const ops: BatchOp[] = [
    ...diff.upserts.map((c): BatchOp => (b) => b.set(characterRef(uid, c.id), characterPayload(c))),
    ...diff.deletes.map((id): BatchOp => (b) => b.delete(characterRef(uid, id))),
  ];
  // Metadaten nur bei Änderung schreiben (spart einen Write pro Charakter-Änderung).
  if (diff.meta) {
    ops.push((b) => b.set(metaRef(uid), { version: 1, activeId: diff.activeId, updatedAt: Date.now() }, { merge: true }));
  }
  await commitInBatches(db, ops);
}
