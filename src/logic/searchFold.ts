/**
 * Umlaut-tolerante Suche: Text wird kleingeschrieben und ä/ö/ü/ß werden zu ae/oe/ue/ss aufgefaltet.
 * „Glueck“ und „Glück“ ergeben so beide „glueck“. Für das Highlighting merkt sich `map`, aus welchem
 * Zeichen des Originaltexts jedes gefaltete Zeichen stammt.
 */
export interface FoldedText {
  /** Gefalteter Suchtext */
  text: string;
  /** map[i] = Index im Originaltext, aus dem folded.text[i] entstanden ist */
  map: number[];
}

const UMLAUT_FOLD: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss', ẞ: 'ss' };

/** Nur den gefalteten Text erzeugen (für Query und Suchindex). */
export function foldText(input: string): string {
  return input.toLowerCase().replace(/[äöüßẞ]/g, (ch) => UMLAUT_FOLD[ch]);
}

/** Gefalteten Text inkl. Positions-Mapping auf den Originaltext erzeugen. */
export function foldWithMap(input: string): FoldedText {
  let text = '';
  const map: number[] = [];
  for (let i = 0; i < input.length; i++) {
    const lower = input[i].toLowerCase();
    for (const ch of lower) {
      const out = UMLAUT_FOLD[ch] ?? ch;
      text += out;
      for (let k = 0; k < out.length; k++) map.push(i);
    }
  }
  return { text, map };
}

const foldCache = new Map<string, FoldedText>();
const FOLD_CACHE_LIMIT = 5000;

/** Memoisierte Variante – Regelwerk-Texte sind statisch, jeder Text wird nur einmal gefaltet. */
export function foldCached(input: string): FoldedText {
  let hit = foldCache.get(input);
  if (!hit) {
    if (foldCache.size >= FOLD_CACHE_LIMIT) foldCache.clear();
    hit = foldWithMap(input);
    foldCache.set(input, hit);
  }
  return hit;
}

/** Trefferbereiche [start, end) im ORIGINALtext für eine bereits gefaltete Query. */
export function findMatchRanges(input: string, foldedQuery: string): Array<[number, number]> {
  if (!foldedQuery) return [];
  const { text, map } = foldCached(input);
  const ranges: Array<[number, number]> = [];
  let from = 0;
  while (from <= text.length - foldedQuery.length) {
    const idx = text.indexOf(foldedQuery, from);
    if (idx < 0) break;
    const start = map[idx];
    const end = map[idx + foldedQuery.length - 1] + 1;
    const last = ranges[ranges.length - 1];
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else ranges.push([start, end]);
    from = idx + foldedQuery.length;
  }
  return ranges;
}
