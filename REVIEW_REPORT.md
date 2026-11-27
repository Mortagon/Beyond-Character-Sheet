# REVIEW_REPORT.md — Code-Review Beyond Character Sheet

Datum: 2026-11-26 · Grundlage: `REVIEW.md`, `CLAUDE.md`, `TASK_FIRESTORE.md` (Abschnitte 6–7) · Stand: Commit `4641cd6` + Arbeitsverzeichnis (keine Commits, kein Deployment)

## Zusammenfassung

- **12 Bugs behoben**, davon einer kritisch (möglicher Datenverlust in Firestore beim Login).
- **Initiales JS-Bundle von 970 kB auf 375 kB verkleinert** (gzip 295 → 111 kB). Firebase und das Regelwerk werden jetzt bei Bedarf nachgeladen.
- Clean Code: doppelte Logik zusammengeführt, toter Code entfernt, keine `!`-Non-Null-Assertions mehr in den Komponenten-Updates, Barrierefreiheit verbessert.
- Funktionsumfang, Datenmodell (`StoredState`, `beyond_ttrpg_characters_v1`), Firestore-Pfad `users/{uid}`, Firebase-Config und das sichtbare Design sind **unverändert**. Keine neuen Abhängigkeiten.
- `npm.cmd run build` endet mit **Exit-Code 0**, ohne Fehler und ohne Warnungen.

---

## 1. Gefundene und behobene Bugs

| # | Datei | Problem | Fix |
|---|---|---|---|
| 1 | `src/App.tsx` | **Kritisch – Race beim Firestore-Sync:** `setUser()` hat den Save-Effekt *vor* dem Laden des Cloud-Dokuments ausgelöst. War `getDoc` langsamer als 700 ms, wurde der rein lokale Stand nach `users/{uid}` geschrieben. Dabei wird `characters` komplett ersetzt, Cloud-Charaktere eines anderen Geräts gingen also verloren. | Neuer State `cloudReadyUid`: In die Cloud wird erst geschrieben, wenn der Merge für genau diese UID abgeschlossen ist. |
| 2 | `src/App.tsx` | **`skipNextCloudSave` blieb hängen:** Hat der Merge denselben State zurückgegeben (kein Cloud-Dokument), kam es zu keinem Re-Render. Das Flag blieb `true`, und die **nächste echte Änderung wurde nicht in die Cloud gespeichert**. Zusätzlich gab es einen doppelten Write (direkter `saveCloudCharacters` plus Effekt). | Flag entfernt. Stattdessen werden Änderungen über einen Snapshot erkannt (`lastCloudSnapshot`): Geschrieben wird nur, wenn sich `characters`/`activeId` gegenüber dem letzten Cloud-Stand unterscheiden. |
| 3 | `src/App.tsx` | **Veraltete Auth-Antworten:** Bei schnellem Login → Logout → Login (oder Kontowechsel) konnte ein verspätetes `loadCloudCharacters` des alten Nutzers noch mergen. Außerdem hat der Merge `stateRef.current` benutzt statt des aktuellen State. | Laufnummer (`authSeq`) plus `cancelled`-Guard. Gemergt wird per funktionalem `setState((prev) => merge(prev, cloud))`. |
| 4 | `src/App.tsx` | Sync-Status blieb dauerhaft auf „syncing“, wenn eine Änderung zurückgenommen wurde, bevor der Debounce gefeuert hat. Fehler-Toasts kamen bei jedem Debounce-Zyklus erneut. | Bei unverändertem Snapshot wird der Status auf `synced` gesetzt. Fehler-Toast nur einmal pro Fehlerserie (`cloudErrorShown`). |
| 5 | `src/App.tsx` | Lokale Änderungen der letzten 250 ms gingen beim Schließen bzw. Verstecken des Tabs verloren (Tablet: App-Wechsel). | `pagehide`/`visibilitychange` speichern sofort in `localStorage`. |
| 6 | `src/App.tsx` | `update()` hat die aktive ID anders aufgelöst als `active`. Bei ungültiger `activeId` zeigte die UI `characters[0]`, Änderungen liefen aber ins Leere. | Gleiche Fallback-Logik wie bei `active`. |
| 7 | `src/App.tsx` | Theme-Timer wurden bei Unmount nicht aufgeräumt. Bei `prefers-reduced-motion` lief trotzdem eine Vollbild-Animation. | Timer in einer Ref, Cleanup bei Unmount. Bei reduzierter Bewegung wird das Theme direkt umgeschaltet. Timing-Konstanten sind benannt. |
| 8 | `src/App.tsx` / `DiceHud.tsx` | Situationsmodifikatoren im HUD (temporäre GlkW/PEW, Mehrfachaktion) blieben beim **Charakterwechsel** erhalten. Ein aus dem Glückspool von Charakter A eingesetzter GlkW landete so im Pool von Charakter B. | `<DiceHud key={active.id} />` setzt diese Modifikatoren pro Charakter zurück. |
| 9 | `src/logic/storage.ts` | JSON-Import von z. B. `[1, 2, 3]` erzeugte drei leere Charaktere. Ungültiges JSON zeigte die rohe Parser-Meldung. | Nicht-Objekte werden herausgefiltert, bei leerer Liste kommt eine Fehlermeldung. `SyntaxError` → „Keine gültige JSON-Datei.“ |
| 10 | `src/components/SkillsPanel.tsx` | Kategorie „Eigene“ gewählt, dann die letzte eigene Fertigkeit gelöscht (oder Charakter gewechselt): Die Liste war leer, und der Filter-Button zum Zurücksetzen war verschwunden. | Effektive Kategorie fällt automatisch auf „Alle“ zurück, wenn die gewählte nicht mehr existiert. |
| 11 | `src/components/Header.tsx` | Der Lösch-Timer wurde nie aufgeräumt. Mehrfaches Klicken erzeugte mehrere Timer. Die scharf geschaltete Bestätigung („Sicher?“) blieb beim **Charakterwechsel** bestehen, ein Klick hätte dann den neuen Charakter gelöscht. | Timer per `useEffect` mit Cleanup. Die Bestätigung wird bei `activeId`-Wechsel zurückgesetzt. |
| 12 | div. Panels | Aktuell-Werte konnten nach dem Senken des Max-Werts über dem Maximum stehen: Glückspool, Reaktionen, Lebenserhaltung, Spezial-Ressourcen. Anstrengung konnte nach dem Senken eines Attributs über dem Basiswert liegen. | Beim Ändern des Max-Werts wird `cur` begrenzt. Beim Ändern des Attributs wird `spentEffort ≤ value` erzwungen. Das ist dasselbe Verhalten, das Schilde und Begleiter-Tracker schon hatten. |

Weitere kleine Korrekturen:
- **`src/logic/firebase.ts`:** Der Fehlercode `unavailable` (meist einfach offline) wurde fälschlich als „Firestore nicht initialisiert“ gemeldet. Neue verständliche Meldungen gibt es für offline/Netzwerk, ein bereits offenes Login-Popup und zu große bzw. ungültige Dokumente (`resource-exhausted`/`invalid-argument`).
- **Toggles nutzen den Draft-Wert statt Closure-Werte** (Status-Tags, Verkrüppelt). So gehen schnelle Doppelklicks nicht mehr verloren.
- **Fraktions-Balken** werden bei importierten Werten außerhalb von ±6 begrenzt und laufen nicht mehr über.

## 2. Effizienz

| Änderung | Wirkung |
|---|---|
| **Firebase SDK per `import()` nachgeladen** (`loadFirebase()` in `App.tsx`). `mergeCharacterStates` ist nach `storage.ts` umgezogen, weil es kein Firebase braucht. | Initiales JS 970 kB → **375 kB** (gzip 295 → **111 kB**). Firebase (558 kB) lädt parallel nach dem ersten Rendern. |
| **`RulebookView` + GRW-Kodex per `React.lazy`/`Suspense`** | 40 kB werden nur beim Öffnen des Regelwerks geladen. |
| **Suchindex im Regelwerk** wird einmal beim Laden des Moduls aufgebaut statt bei jedem Tastendruck für jeden Abschnitt. Die Kapitelsuche passiert nur noch einmal pro Render. | Weniger Arbeit pro Tastendruck. |
| **Weniger Firestore-Writes:** Debounce 700 → 1000 ms, außerdem kein Write, wenn sich der Inhalt nicht geändert hat (Snapshot-Vergleich). Der doppelte Write beim Login entfällt. | Weniger Firestore-Kosten und Netzlast. |
| `SkillsPanel`: Filtern und Gruppieren per `useMemo` | Kein erneutes Filtern über alle ~47 Fertigkeiten bei jedem Render. |
| `ui.tsx`: Ton-/Farbtabellen (`Stepper`, `StatTile`, `Pips`) auf Modulebene. Ebenso `TRAIT_PRESETS`-Filter, `LOCATION_OPTIONS`, `CYBER_KINDS`, `DECK_STATS`. | Keine neuen Objekte/Arrays pro Render (die Stepper werden hundertfach gerendert). |
| `VitalsPanel`/`AttributesPanel`: mehrfach berechnete Werte (`chestWoundLpMalus`, `effectiveAttr`) zusammengefasst | Kleinere Render-Arbeit. |
| `vite.config.ts`: `chunkSizeWarningLimit: 600` mit Begründung | Der Firebase-Chunk wird bewusst nachgeladen. Die Warnung war nach dem Code-Splitting irreführend. |

## 3. Clean Code

- **`patchById()`** (`logic/character.ts`) ersetzt das 5-zeilige Muster „Eintrag per ID suchen und Rezept anwenden“, das 9-mal kopiert war (Skills, Wissen, Waffen, Techniken, Begleiter, Cyberware, Items, Vorteile, Fraktionen). Damit sind auch die `find(...)!`-Assertions in den Spezial-Ressourcen weg; diese sind jetzt eine eigene `ResourceRow`-Komponente.
- **`effectiveMaxLp()`** (`logic/dice.ts`) ersetzt die dreifach kopierte Formel `max(0, lp.max − Brustwunden)` in Header, VitalsPanel und CompanionsTab.
- **`App.tsx`:** sechs fast identische Grid-Blöcke wurden zur Komponente `TwoColumns` zusammengefasst. `renderMenu` wurde zur Komponente `MenuContent`. `TEMPLATES.find(...)!` wurde durch `buildTemplate()` mit Fallback ersetzt. Overlays (ThemeTransition/Toast) werden nicht mehr doppelt gerendert. Magic Numbers sind jetzt benannte Konstanten.
- **Toter Code entfernt:** `TrackerControl` (nirgends benutzt), der Prop `step` an `NumInput` (wirkungslos auf `type="text"`), die nicht genutzten Exporte `auth`/`db` in `firebase.ts`, ungenutzte CSS-Regeln (`.scroll-col`, `input[type=number]`) und ungenutzte `@theme`-Farben (`void`, `steel`), der ungenutzte `CodexChapter`-Import, das wirkungslose `transition-opacity` in `ThemeTransition`.
- **Typisierung:** `React.ReactNode` über den globalen UMD-Namespace wurde durch einen expliziten `import type { ReactNode }` ersetzt. `Pips`/`CompTracker` nutzen den gemeinsamen `Tone`-Typ. `Select<AttrKey>` statt `as`-Cast. Es gibt keine `any` im Code.
- **Barrierefreiheit:**
  - `Panel`: Nur einklappbare Panels haben einen Button (mit `aria-expanded`). Nicht einklappbare Panels haben keinen funktionslosen Button mehr.
  - Vorlagen-Dialog: `role="dialog"`, `aria-modal`, `aria-labelledby`, schließen mit **Escape**.
  - `aria-pressed` für Status-Tags, Pips, Todeswürfe, WAP-Kästchen, Verkrüppelt, Verbrauchsgut und Kategorie-Filter. `aria-expanded` für Aufklapp-Zeilen. `aria-current` für Hauptmenü und Kapitel.
  - `aria-label` für Suchfelder, die Vorteil-Auswahl, den Sync-Status sowie für `NumInput` über `title`.
  - Fehler-Toasts haben `role="alert"`.
  - Globale `prefers-reduced-motion`-Regel in `index.css`.

## 4. Bewusst NICHT geändert / offene Empfehlungen

1. **Kontowechsel auf demselben Gerät:** Lokale Charaktere bleiben nach dem Logout erhalten (gewolltes Verhalten: „Lokale Daten bleiben gespeichert“). Meldet sich danach **ein anderes Google-Konto** an, werden diese lokalen Charaktere in dessen Cloud gemergt. Auf einem geteilten Tablet kann das unerwünscht sein. *Empfehlung:* lokal die UID des letzten Kontos merken und bei einem anderen Konto nachfragen. Das ist eine Produktentscheidung und eine neue UX, darum nicht umgesetzt.
2. ~~**Firestore-Dokumentlimit 1 MiB**~~ → **umgesetzt**, siehe Abschnitt 6 (ein Dokument pro Charakter).
3. **Keine Löschsynchronisation zwischen Geräten** (laut Entscheidung des Users so gewollt, siehe Abschnitt 6): Der Merge ist bewusst „verlustfrei“. Ein auf Gerät A gelöschter Charakter kann von Gerät B (das ihn lokal noch hat) beim nächsten Login wieder hochgeladen werden. *Empfehlung:* Tombstones (`deletedIds` mit Zeitstempel). Das ändert das Datenmodell.
4. **Unbekannte Felder aus Importen** werden von `normalizeCharacter` durchgereicht. Enthalten sie verschachtelte Arrays, lehnt Firestore das Dokument ab. Das ist ein Grenzfall; lokal funktioniert alles weiter.
5. **Hartkodierte Farbwerte + `!important`-Light-Mode-Overrides** in `index.css`: Der Light Mode überschreibt einzelne Tailwind-Klassen. Neue Farbklassen in Komponenten brauchen dort jeweils einen Eintrag. *Empfehlung:* auf CSS-Variablen bzw. `@theme`-Tokens umstellen. Das ist ein größerer Umbau mit Risiko für das sichtbare Design, darum nicht umgesetzt.
6. **Kontext-weite Re-Renders:** Jede Änderung rendert alle Panels des aktiven Menüs neu (ein Kontext mit dem ganzen Charakter). Bei der aktuellen Größe ist das unkritisch. Feingranulare Selektoren würden eine größere Architekturänderung bedeuten.
7. `MiniStep` im DiceHud dupliziert teilweise den `Stepper`. Er zeigt aber Vorzeichen und Label im Wert an und hat kein Minimum, deshalb bleibt er bewusst getrennt.
8. Der Firebase-API-Key liegt im Client-Code. Das ist bei Firebase normal, die Absicherung erfolgt über die `firestore.rules`, die korrekt auf `request.auth.uid == userId` prüfen. Laut Vorgabe nicht geändert.

## 5. Verifikation

- **Build:** `npm.cmd run build` (`tsc -b && vite build`) → **Exit-Code 0**, keine TypeScript-Fehler, keine Warnungen.
  ```
  dist/index.html                         0.63 kB │ gzip:   0.39 kB
  dist/assets/index-*.css                53.12 kB │ gzip:   9.65 kB
  dist/assets/RulebookView-*.js          40.44 kB │ gzip:  16.79 kB   (lazy)
  dist/assets/index-*.js                375.16 kB │ gzip: 111.04 kB
  dist/assets/firebase-*.js             558.40 kB │ gzip: 168.32 kB   (lazy)
  ```
  Vorher: ein einziger Chunk mit `970.06 kB │ gzip: 294.90 kB` plus Chunk-Size-Warnung.
- **Logik-Smoke-Test** (temporär, wieder entfernt): alle 4 Vorlagen bauen, JSON-Roundtrip über `normalizeCharacter` ist identisch, Pools für alle Attribute, Fertigkeiten und Waffen lassen sich auflösen, beim Duplizieren bleiben die Waffe↔Fertigkeit-Links erhalten. Außerdem: `calculateDicePool` (GoW ersetzt NOW, Überschuss → GlkW), Import-Fehlerfälle und ID-Kollisionen, `mergeCharacterStates` (neuere Version gewinnt, ungültige `activeId`) → **alle bestanden**.
- **SSR-Render-Test** (temporär, wieder entfernt): Header, DiceHud und sämtliche Panels inkl. Regelwerk und Theme-Übergang wurden für alle 4 Vorlagen mit Attribut-, Abgeleitet- und Waffen-Probe gerendert → **ohne Fehler**.
- **Nicht getestet:** die Bedienung im echten Browser und der Google-Login bzw. Firestore-Sync gegen das Live-Projekt. Dafür standen weder ein Browser noch Zugangsdaten zur Verfügung. Empfehlung vor dem Deployment: Login auf zwei Geräten bzw. Tabs testen, offline bearbeiten und wieder online gehen, Theme-Wechsel und Import prüfen. *(Nachtrag: Die Browser-Bedienung ist inzwischen getestet, siehe Abschnitt 7.)*

---

## 6. Firestore: ein Dokument pro Charakter

### Neue Struktur

| Pfad | Inhalt |
|---|---|
| `users/{uid}` | Metadaten: `{ version: 1, activeId, updatedAt }`, **keine** Charakterliste mehr |
| `users/{uid}/characters/{characterId}` | ein Dokument pro Charakter: vollständiges Charakter-Objekt inkl. `updatedAt` |

`firestore.rules` musste nicht geändert werden: `match /{document=**}` unter `users/{userId}` deckt die Subcollection bereits ab (gleiche Prüfung `request.auth.uid == userId`). localStorage (`beyond_ttrpg_characters_v1`, `StoredState`), Firebase-Config und `package.json` sind unverändert.

### Umsetzung

| Datei | Änderung |
|---|---|
| `src/logic/cloudSync.ts` (neu) | Reine Diff-Logik ohne Firebase-Abhängigkeit. Sie bleibt im Haupt-Bundle, Firebase wird weiterhin lazy geladen. `CloudSnapshot` ist der zuletzt synchronisierte Stand: Fingerprint je Charakter-ID, `activeId` und ob das Metadaten-Dokument existiert. `diffCloud()` liefert `upserts` (neue/geänderte Charaktere), `deletes` (auf diesem Gerät gelöschte) und ob die Metadaten geschrieben werden müssen. Fingerprints werden per `WeakMap` pro (unveränderlichem) Charakter-Objekt gecacht. Pro Änderung wird also nur der geänderte Charakter neu serialisiert. |
| `src/logic/firebase.ts` | `loadCloudCharacters()` lädt Metadaten (`getDoc`) und Subcollection (`getDocs`) parallel und führt bei Bedarf die **Migration** aus. `saveCloudChanges(uid, diff)` schreibt nur den Diff per `writeBatch`, aufgeteilt in Batches à max. 500 Ops. Metadaten werden nur bei geänderter `activeId` (bzw. fehlendem Metadaten-Dokument) geschrieben, also kein zusätzlicher Write pro Charakter-Änderung. `saveCloudCharacters()` (Ein-Dokument-Format) entfällt. |
| `src/App.tsx` | Änderungserkennung auf `CloudSnapshot`/`diffCloud` umgestellt. Saves laufen **seriell** über eine Promise-Queue, damit sich Batches nicht überholen, und nutzen zum Ausführungszeitpunkt den aktuellsten State. Beibehalten: Write erst nach abgeschlossenem Merge (`cloudReadyUid`, für async Code zusätzlich als Ref `cloudUidRef`), Verwerfen veralteter Login-Antworten (`authSeq`), Debounce 1000 ms, einmaliger Fehler-Toast. **Neu:** Beim Verstecken/Schließen des Tabs (`visibilitychange`/`pagehide`) wird neben dem localStorage-Flush auch ein anstehender Cloud-Save sofort ausgelöst statt erst nach dem Debounce (Tablet: App-Wechsel). |
| `src/logic/character.ts` | `normalizeCharacter` vergibt eine neue ID, wenn die vorhandene keine gültige Firestore-Dokument-ID ist (`/`, `.`/`..`, `__…__`, > 200 Zeichen). Sonst würde z. B. ein importierter Charakter mit `"id": "a/b"` den Pfad `characters/{id}` sprengen. Gültige IDs bleiben unverändert. |

### Migration aus dem alten Format

Enthält `users/{uid}` noch das Legacy-Feld `characters` (Array):
1. Die Legacy-Charaktere werden normalisiert und je ID mit der Subcollection verglichen. **Die neuere Version (`updatedAt`) gewinnt**, nur Gewinner werden geschrieben.
2. Geschrieben wird per Batch nach `users/{uid}/characters/{id}`. Das Legacy-Feld wird per `deleteField()` im **letzten** Batch entfernt, also erst, wenn alle Charaktere sicher geschrieben sind. Schlägt die Migration fehl, bleibt das Legacy-Feld erhalten und es wird nichts weiter in die Cloud geschrieben (`cloudReadyUid` bleibt leer). Beim nächsten Login wird erneut migriert.
3. Danach folgt der Merge mit localStorage wie bisher (`mergeCharacterStates`). Lokale Charaktere, die neuer sind oder in der Cloud fehlen, werden anschließend über den normalen Diff hochgeladen.

Schreibt ein noch nicht aktualisierter Client (alter Bundle-Stand im Cache) wieder ein `characters`-Feld, wird es beim nächsten Login mit der neuen Version erneut migriert (neuere Version gewinnt).

### Lösch-Verhalten (gemäß Entscheidung 3)

- Löschen eines Charakters **auf diesem Gerät im angemeldeten Zustand** → das Cloud-Dokument wird gelöscht (`batch.delete`). Er taucht beim nächsten Login-Merge nicht wieder auf.
- Ein anderes Gerät, auf dem er lokal noch existiert, lädt ihn beim nächsten Login wieder hoch. Das ist gewollt („was lokal ist, ist lokal“), es gibt keine Tombstones.
- Wird ein Charakter **im abgemeldeten Zustand** gelöscht, kennt die App den Cloud-Stand nicht. Das Cloud-Dokument bleibt und der Charakter kommt beim nächsten Login wieder. Für eine Lösung müssten Löschungen lokal vorgemerkt werden (neuer localStorage-Eintrag). Das ist bewusst nicht umgesetzt, weil das Datenmodell unverändert bleiben soll.

### Verifikation

- `npm.cmd run build` → **Exit-Code 0**, keine Fehler, keine Warnungen. Haupt-Bundle 376.5 kB (gzip 111.5 kB). Firebase-Chunk 564.8 kB lazy, +6 kB durch `writeBatch`/`getDocs`.
- Die Diff-Logik wurde im Browser gegen den Dev-Server geprüft (Abschnitt 7, Zusatztest): Erst-Upload aller Charaktere + Metadaten; unveränderter Stand → kein Write; Einzeländerung → genau 1 Upsert ohne Metadaten; lokale Löschung → 1 Delete; `activeId`-Wechsel → nur Metadaten.
- **Nicht getestet:** Migration und Writes gegen das Live-Firestore (kein Login durchgeführt, kein Emulator vorhanden). Empfehlung vor dem Deployment: Mit einem Testkonto einloggen, das noch Daten im alten Format hat. In der Firebase Console prüfen, dass `users/{uid}/characters/*` angelegt und das Feld `characters` entfernt wurde. Danach auf einem zweiten Gerät bzw. Tab bearbeiten und löschen.

---

## 7. Browser-Smoke-Test

Playwright 1.65.1 (Chromium headless) wurde temporär in einem Ordner außerhalb des Projekts installiert (`npm install --no-save`) und danach samt Testskript und heruntergeladenem Browser wieder entfernt. `package.json`/`package-lock.json` sind unverändert. Viewport **1280×800** (Tablet Landscape), Touch aktiviert, Dev-Server `http://localhost:5173`, frischer Browser-Kontext (leerer localStorage). Screenshots liegen in `test-screenshots/` (in `.gitignore` aufgenommen).

### Ergebnis (finaler Lauf)

| Schritt | Ergebnis | Details |
|---|---|---|
| 1. App lädt | **PASS** | Erststart zeigt den Vorlagen-Dialog, „Leerer Charakterbogen“ → Bogen wird gerendert |
| 2. Menü „Charakter & Stats“ | **PASS** | `menu-charakter.png` |
| 2. Menü „Fertigkeiten & Wissen“ | **PASS** | `menu-fertigkeiten.png` |
| 2. Menü „Kampf & Rüstung“ | **PASS** | `menu-kampf.png` |
| 2. Menü „Techniken & Geist“ | **PASS** | `menu-techniken.png` |
| 2. Menü „Drohnen & Cyber“ | **PASS** | `menu-drohnen.png` |
| 2. Menü „Inventar & Notizen“ | **PASS** | `menu-inventar.png` |
| 2. Menü „Regelwerk“ | **PASS** | `menu-regelwerk.png` (lazy geladen) |
| 2b. Regelwerk: Kapitel öffnen + Suche „Glück“ | **PASS** | Kapitel „Kampf, Effekte & Gesundheit“ aktiv; 7 Treffer für „Glück“ (`regelwerk-suche-glueck.png`) |
| 3. LP-Stepper +/- und Reload | **PASS** | 2 → −2 → 0 → +1 → 1; nach Reload weiterhin 1 (localStorage) |
| 4. Light/Dark-Toggle | **PASS** | Transition-Screen erscheint (`theme-transition.png`), `theme-light` aktiv (`theme-light.png`), Rückwechsel auf Dark ebenfalls mit Übergang |
| 5. Neuer-Charakter-Dialog + Escape | **PASS** | `dialog-neuer-charakter.png`; Escape schließt den Dialog |
| 6. Charakter anlegen + löschen | **PASS** | Vorlage „Soldat / Söldner“ angelegt und aktiv; Löschen → „Sicher?“ → gelöscht; Original-Charakter erhalten, localStorage konsistent; die scharf geschaltete Bestätigung entschärft sich nach 3,5 s |
| 7. Google-Login-Button / Firebase-Lazy-Load | **PASS** | Button sichtbar, Firebase-Modul nachgeladen, keine Fehler. Kein Login durchgeführt |
| Zusatz: Firestore-Diff-Logik | **PASS** | siehe Abschnitt 6 |
| Zusatz: Stepper-Touch-Ziele ≥ 36 px | **PASS** (nach Fix) | 48 Stepper-Buttons, min. 36 px |

**Console-Errors/Warnings:** keine · **Page-Errors:** keine · **Fehlgeschlagene Requests:** keine. Abgebrochene Modul-Requests während `page.reload()` sind normal und wurden ausgefiltert.

### Gefundene und behobene Bugs

| # | Datei | Problem | Fix |
|---|---|---|---|
| 1 | `src/components/ui.tsx` (`Stepper`), `src/components/DiceHud.tsx` (`MiniStep`) | **Touch-Ziele zu klein:** Alle +/−-Stepper-Buttons waren nur **30×30 px** groß (`size="sm"`: `h-8` inkl. Rahmen), bei `md` 34 px. CLAUDE.md fordert mindestens 36×36 px. Im ersten Testlauf waren 48 von 48 Buttons zu klein. | `sm`: 36×36 px (`h-[38px]` inkl. Rahmen, `w-9`), `md`: 40×40 px (`h-[42px]`, `w-10`). Die HUD-Situations-Stepper sind ebenfalls 36×36 px. Layout in Dark und Light per Screenshot geprüft, nichts bricht um. |
| 2 | `src/components/VitalsPanel.tsx` | **Barrierefreiheit:** Alle Vital-Stepper hießen für Screenreader nur „Wert verringern/erhöhen“. LP, Schilde, Reaktionen usw. waren nicht unterscheidbar (fiel beim Ansteuern des LP-Steppers auf). | Sprechende `ariaLabel`s: Lebenspunkte, Temporäre LP, Schilde, Glückspool, Verteidigungswert, Reaktionen, Adrenalin, Erschöpfung, Wunden {Zone}, Wahnsinnspunkte. |

Im ersten Lauf gab es außerdem in Schritt 6 einen Timeout. Ursache war das Testskript, nicht die App: Der Bestätigungs-Button hat den zugänglichen Namen „Sicher?“ (sichtbarer Text), nicht seinen `title`. Nach der Korrektur des Selektors lief der Schritt mit PASS durch.

### Nicht im Browser getestet

Google-Login und Firestore-Sync gegen das Live-Projekt (laut Vorgabe kein Login) sowie JSON-Import/-Export über den Dateidialog.
