# TASK_FIRESTORE.md — Firestore: ein Dokument pro Charakter + Browser-Smoke-Test

## Teil A: Firestore-Struktur umstellen (`src/logic/firebase.ts` + Aufrufer in `src/App.tsx`)

### Ziel-Struktur
- `users/{uid}` → Metadaten-Dokument: `{ version, activeId, updatedAt }` (KEINE Charakterliste mehr).
- `users/{uid}/characters/{characterId}` → **ein Dokument pro Charakter** (vollständiges Charakter-Objekt + `updatedAt`).
- `firestore.rules` deckt Subcollections bereits ab (`match /{document=**}` unter `users/{userId}`) – nur anpassen, falls nötig.

### Entscheidungen des Users (verbindlich)
1. Anderes Google-Konto auf demselben Gerät übernimmt lokale Charaktere → **so lassen**.
2. **Ein Dokument pro Charakter** (wegen 1-MiB-Limit pro Dokument).
3. „Was lokal ist, ist lokal“: Ein auf Gerät A gelöschter Charakter darf von Gerät B (wo er noch lokal existiert) wieder hochgeladen werden → **kein Tombstone-/Lösch-Sync nötig**. Kleine Userbase.
   - Wenn der User auf DIESEM Gerät einen Charakter löscht, soll das zugehörige Cloud-Dokument gelöscht werden (sonst taucht er beim nächsten Login-Merge sofort wieder auf).

### Anforderungen
- **Migration:** Existiert im alten Format `users/{uid}` ein Feld mit der Charakterliste (bisheriges Format), diese beim Laden einlesen, in die Subcollection schreiben (Batch) und das Legacy-Feld danach entfernen (`deleteField()`). Merge mit localStorage wie bisher.
- **Effiziente Writes:** Nur geänderte Charaktere schreiben (z. B. anhand `updatedAt` oder Hash des zuletzt synchronisierten Stands), per `writeBatch` (max. 500 Ops beachten). Debounce und die bereits im Review eingebauten Schutzmechanismen (erst nach abgeschlossenem Merge speichern, veraltete Login-Antworten verwerfen, Flush beim Schließen des Tabs) beibehalten.
- Laden: `getDocs` auf die Subcollection + Metadaten-Dokument.
- Datenmodell im localStorage (`beyond_ttrpg_characters_v1`, `StoredState`) bleibt unverändert. Firebase-Config nicht ändern. Keine neuen Dependencies im `package.json`.
- `npm.cmd run build` → Exit-Code 0.
- Ergänze `REVIEW_REPORT.md` um einen Abschnitt „Firestore: ein Dokument pro Charakter“.

## Teil B: Browser-Smoke-Test mit Playwright
Der Vite-Dev-Server läuft bereits auf http://localhost:5173 (sonst selbst starten mit `npx.cmd vite --port 5173`).
Playwright temporär nutzen, OHNE `package.json`/`package-lock.json` dauerhaft zu ändern (z. B. in einem temporären Ordner außerhalb von `src` mit `npm.cmd install --no-save playwright` + `npx.cmd playwright install chromium`, oder vorhandene Installation). Viewport 1280×800 (Tablet Landscape).

Test-Schritte:
1. App lädt (kein leerer Screen); alle Console-Errors und Page-Errors sammeln.
2. Jedes Top-Level-Menü anklicken (Charakter & Stats, Fertigkeiten & Wissen, Kampf & Rüstung, Techniken & Geist, Drohnen & Cyber, Inventar & Notizen, Regelwerk) → Inhalt wird gerendert. Im Regelwerk ein Kapitel öffnen und nach „Glück“ suchen → Treffer.
3. LP-Stepper +/- → Wert ändert sich; Reload → Wert bleibt (localStorage).
4. Light/Dark-Toggle → Transition-Screen erscheint, Theme wechselt; zurückschalten.
5. Vorlagen-/Neuer-Charakter-Dialog öffnen, mit Escape schließen.
6. Neuen Charakter anlegen und wieder löschen (mit Bestätigung) → funktioniert, kein falscher Charakter gelöscht.
7. Google-Login NICHT durchführen (nur prüfen, dass der Login-Button sichtbar ist und kein Fehler beim Lazy-Load von Firebase auftritt).
- Screenshots je Menü in `test-screenshots/` ablegen (Ordner danach in `.gitignore` aufnehmen).
- Gefundene Bugs direkt beheben und den Test erneut laufen lassen.
- Temporäre Testskripte/Installationen danach entfernen (Screenshots behalten).
- Ergebnis (PASS/FAIL je Schritt + Console-Errors) als Abschnitt „Browser-Smoke-Test“ in `REVIEW_REPORT.md` ergänzen.

Keine Git-Commits, kein Deployment.
