import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import type { Character } from '../types';
import { normalizeCharacter } from './character';
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
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export type CloudSyncState = 'offline' | 'syncing' | 'synced' | 'error';

export function subscribeAuth(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export async function loginWithGoogle(): Promise<User | null> {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    return res.user;
  } catch (err) {
    const code = (err as { code?: string })?.code ?? '';
    if (code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw err;
  }
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
  if (code === 'auth/popup-closed-by-user') {
    return 'Anmeldefenster geschlossen.';
  }
  if (code === 'permission-denied' || msg.includes('PERMISSION_DENIED')) {
    return 'Firestore-Zugriff verweigert (Regeln oder Firestore-Datenbank in Firebase Console prüfen).';
  }
  if (msg.includes('Cloud Firestore API') || code === 'unavailable' || code === 'failed-precondition') {
    return 'Cloud Firestore ist im Firebase-Projekt noch nicht initialisiert.';
  }
  return msg;
}

/** Lädt das Nutzerdokument aus Firestore (null falls noch keines existiert). */
export async function loadCloudCharacters(uid: string): Promise<StoredState | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data() as { characters?: unknown[]; activeId?: string | null };
  const characters = Array.isArray(data.characters) ? data.characters.map(normalizeCharacter) : [];
  const activeId = typeof data.activeId === 'string' ? data.activeId : characters[0]?.id ?? null;
  return { version: 1, characters, activeId };
}

/** Speichert alle Charaktere unter users/{uid}. */
export async function saveCloudCharacters(uid: string, state: StoredState): Promise<void> {
  await setDoc(
    doc(db, 'users', uid),
    {
      version: 1,
      characters: state.characters,
      activeId: state.activeId,
      updatedAt: Date.now(),
    },
    { merge: true },
  );
}

/**
 * Führt lokale und Cloud-Charaktere anhand ihrer ID & updatedAt verlustfrei zusammen.
 * Neuere Version derselben ID gewinnt; eindeutige IDs aus beiden Quellen bleiben erhalten.
 */
export function mergeCharacterStates(local: StoredState, cloud: StoredState | null): StoredState {
  if (!cloud || cloud.characters.length === 0) return local;
  const map = new Map<string, Character>();
  for (const c of cloud.characters) map.set(c.id, c);
  for (const c of local.characters) {
    const existing = map.get(c.id);
    if (!existing || (c.updatedAt ?? 0) > (existing.updatedAt ?? 0)) {
      map.set(c.id, c);
    }
  }
  const merged = Array.from(map.values()).sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  const activeId =
    (cloud.activeId && map.has(cloud.activeId) ? cloud.activeId : null) ??
    (local.activeId && map.has(local.activeId) ? local.activeId : null) ??
    merged[0]?.id ??
    null;
  return { version: 1, characters: merged, activeId };
}
