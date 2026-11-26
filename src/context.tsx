import { createContext, useContext } from 'react';
import type { Character, ProbeRef } from './types';

export interface SheetContextValue {
  char: Character;
  update: (recipe: (draft: Character) => void) => void;
  probe: ProbeRef | null;
  setProbe: (p: ProbeRef | null) => void;
}

export const SheetContext = createContext<SheetContextValue | null>(null);

export function useSheet(): SheetContextValue {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error('useSheet außerhalb des SheetContext');
  return ctx;
}

export function isSameProbe(a: ProbeRef | null, b: ProbeRef): boolean {
  if (!a || a.type !== b.type) return false;
  if ('key' in a && 'key' in b) return a.key === b.key;
  if ('id' in a && 'id' in b) return a.id === b.id;
  return false;
}
