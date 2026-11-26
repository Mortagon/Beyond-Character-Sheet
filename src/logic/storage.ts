import type { Character } from '../types';
import { normalizeCharacter, uid } from './character';

export const STORAGE_KEY = 'beyond_ttrpg_characters_v1';

export interface StoredState {
  version: 1;
  activeId: string | null;
  characters: Character[];
}

export function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 1, activeId: null, characters: [] };
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    const characters = Array.isArray(parsed.characters) ? parsed.characters.map(normalizeCharacter) : [];
    const activeId =
      parsed.activeId && characters.some((c) => c.id === parsed.activeId) ? parsed.activeId : characters[0]?.id ?? null;
    return { version: 1, activeId, characters };
  } catch (err) {
    console.error('Beyond: Laden aus localStorage fehlgeschlagen', err);
    return { version: 1, activeId: null, characters: [] };
  }
}

export function saveState(state: StoredState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.error('Beyond: Speichern fehlgeschlagen', err);
    return false;
  }
}

function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[äöüß]/g, (m) => ({ ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' })[m] ?? m)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'charakter'
  );
}

export function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportCharacter(c: Character): void {
  downloadJson({ format: 'beyond-character', version: 1, character: c }, `beyond-${slug(c.name)}.json`);
}

export function exportAll(chars: Character[]): void {
  const date = new Date().toISOString().slice(0, 10);
  downloadJson({ format: 'beyond-characters', version: 1, characters: chars }, `beyond-alle-charaktere-${date}.json`);
}

/** Akzeptiert Einzelcharakter, Array, {character}, {characters} */
export function parseImport(text: string, existingIds: Set<string>): Character[] {
  const data: unknown = JSON.parse(text);
  let list: unknown[] = [];
  if (Array.isArray(data)) list = data;
  else if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.characters)) list = o.characters;
    else if (o.character && typeof o.character === 'object') list = [o.character];
    else if ('attributes' in o || 'name' in o) list = [o];
  }
  if (list.length === 0) throw new Error('Keine Charakterdaten in der Datei gefunden.');
  return list.map((raw) => {
    const c = normalizeCharacter(raw);
    if (existingIds.has(c.id)) c.id = uid('ch');
    existingIds.add(c.id);
    c.updatedAt = Date.now();
    return c;
  });
}
