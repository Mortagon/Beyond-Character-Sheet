# REVIEW.md — Code-Review-Auftrag für Claude CLI

## Kontext
Beyond Character Sheet (React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + lucide-react + Firebase Web SDK).
Spezifikation: siehe `CLAUDE.md`. Live: https://beyond-character-sheet.web.app

Ein Teil des Codes wurde NICHT von dir (Claude CLI) geschrieben, sondern nachträglich direkt vom Projektmanager-Agenten.
Diese Teile sollen jetzt gründlich geprüft und verbessert werden.

## Prüf-Schwerpunkt (vom PM nachträglich geschrieben/geändert)
- `src/App.tsx`
- `src/index.css`
- `src/components/ui.tsx`
- `src/components/Header.tsx`
- `src/components/VitalsPanel.tsx`
- `src/components/DiceHud.tsx`
- `src/components/SkillsPanel.tsx`
- `src/components/AttributesPanel.tsx`
- `src/components/BeyondLogo.tsx`
- `src/components/ThemeTransition.tsx`
- `src/components/RulebookView.tsx`
- `src/components/tabs/CompanionsTab.tsx`
- `src/components/tabs/InventoryTab.tsx`
- `src/components/tabs/NotesTab.tsx`
- `src/logic/firebase.ts`
- `src/data/grwCodex.ts`, `src/data/presets.ts`, `src/data/templates.ts`

Die restlichen Dateien (`src/logic/*`, `src/types.ts`, `src/context.tsx`, übrige Komponenten) nur mitprüfen, wenn sie mit den obigen interagieren.

## Prüfkriterien
1. **Bugs:** Logikfehler, falsche State-Updates (stale closures, fehlende/zu viele useEffect-Dependencies), Race Conditions beim Firestore-Sync (Login/Logout, Merge mit localStorage, Speicher-Schleifen, Debounce), Fehlerbehandlung, Edge Cases (leere Listen, negative Werte, ungültiger JSON-Import), Theme-Toggle/Transition-Timing, Accessibility-Grundlagen.
2. **Effizienz:** Unnötige Re-Renders, fehlendes/überflüssiges `useMemo`/`useCallback`, zu häufige `localStorage`-/Firestore-Writes, Bundle-Größe (z. B. Lazy-Loading für `RulebookView`/`grwCodex` und Firebase, falls sinnvoll), teure Berechnungen im Render.
3. **Clean Code:** Duplikate zusammenführen, konsistente Benennung, klare Komponenten-Grenzen, keine toten Imports/Variablen, keine `any`, einheitliche Nutzung der UI-Primitives aus `ui.tsx`, verständliche Struktur.

## Grenzen
- Funktionsumfang, Datenmodell (`StoredState`, `STORAGE_KEY = 'beyond_ttrpg_characters_v1'`), Firestore-Pfad `users/{uid}` und das sichtbare Design beibehalten. Keine neuen Features.
- Keine neuen Dependencies ohne zwingenden Grund.
- `src/logic/firebase.ts` Firebase-Config nicht ändern.
- Keine Git-Commits, kein Deployment (macht der PM).

## Abschluss
1. `npm.cmd run build` muss fehlerfrei durchlaufen (Exit-Code 0).
2. Schreibe einen Bericht nach `REVIEW_REPORT.md` mit: gefundenen Bugs (Datei + Beschreibung + Fix), Effizienz-Verbesserungen, Clean-Code-Änderungen, bewusst NICHT geänderten Punkten / offenen Empfehlungen, sowie Ergebnis des Builds.
