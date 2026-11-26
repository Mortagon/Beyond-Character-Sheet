# CLAUDE.md — "Beyond" TTRPG Universal Tablet Character Sheet SPA

## 1. Projektziel & Architektur
Erstelle eine responsive, touch-optimierte Single-Page Web Application (SPA) als universellen digitalen Charakterbogen für das Sci-Fi-Tabletop-Rollenspiel **"Beyond"**.
Primäre Zielplattform ist ein **Tablet im Querformat (Landscape Mode, z. B. iPad / Android Tablet, ≥ 1024px Breite)** am Spieltisch.

### Tech-Stack
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS (v3 oder v4 mit `@tailwindcss/vite` — sauber konfiguriert für Production Build)
- **Icons:** `lucide-react`
- **Persistenz:** Browser `localStorage` unter Key `beyond_ttrpg_characters_v1` + JSON-Export/Import

### Wichtige Grundregeln
1. **KEIN digitaler Würfelroller!** Es darf KEIN Zufallsgenerator (`Math.random()`, "Roll"-Buttons etc.) eingebaut werden. Alle Würfel werden physisch am Tisch geworfen. Die App dient als Tracker, Rechenhilfe und **Würfelpool-Anzeige**.
2. **Universell für alle Spieler:** Keine fest einprogrammierten Einzelcharakter-Daten als Zwang. Beim Start ist eine leere Vorlage oder eine Auswahl an Archetyp-Vorlagen verfügbar, und jeder Spieler kann beliebig eigene Charaktere anlegen, bearbeiten, duplizieren, löschen, exportieren und importieren.
3. **Sprache des UI:** Deutsch (passend zu den Beyond-Grundregeln).

---

## 2. Design & UX (Gritty Industrial Sci-Fi / Cyberpunk-Terminal)
- **Farbpalette (Dark Mode):**
  - Hintergrund: Tiefes Anthrazit `#0b0e14` / `#0f141d`
  - Karten/Panels: Mattierter Stahl `#151b26` / `#1b2332` mit feinen `1px` Rändern (`border-slate-700/70`) und optionalen technischen Corner-Accents / subtilen Scanlines.
  - Primär-Akzent (Goldwürfel / EP / Aktionen): Bernstein/Gold `#f59e0b` (`amber-400`/`amber-500`)
  - Sekundär-Akzent (Glückswürfel / Schilde / Tech / Info): Cyan `#06b6d4` (`cyan-400`/`cyan-500`)
  - Gefahr / Pechwürfel / Wunden / Status: Rot `#ef4444` (`red-500`)
  - Normale Würfel (NOW): Hellgrau/Weiß `#e2e8f0` (`slate-200`)
  - Typografie: Klare Sans-Serif für Labels/Texte + `font-mono tabular-nums` für alle Zahlenwerte, Würfelpools und Tracker.
- **Touch-Bedienung:**
  - Alle interaktiven `+` / `-` Stepper mindestens `36x36px` bis `44x44px` groß (`touch-manipulation`, kein Doppel-Tap-Zoom).
  - Schnelles Inline-Editing (Klick auf Namen/Werte oder direkte Input-Felder ohne verschachtelte Modals für Alltagswerte).
- **Layout:**
  - **Tablet Landscape (`lg:` / `xl:`):** Kompakter, immer sichtbarer Header + **3-Spalten-Dashboard** (`grid-cols-1 lg:grid-cols-12`, z. B. Spalte 1: `lg:col-span-4`, Spalte 2: `lg:col-span-4`, Spalte 3: `lg:col-span-4`). Jede Spalte soll auf großen Screens sauber scrollbar sein (`lg:h-[calc(100vh-...)] overflow-y-auto`) oder ergonomisch ohne endloses Seiten-Scrolling bedienbar bleiben; auf kleineren Bildschirmen/Portrait automatische Umschaltung oder sauberes Stacking / Mobile-Tab-Bar.

---

## 3. Beyond-Regelmechaniken (verbindliche Logik aus dem GRW)

### A. Das 4-Farben-W6-Würfelpool-System (GRW S. 5)
In Beyond werden alle Proben mit 6-seitigen Würfeln (W6) in 4 Qualitätsstufen geworfen:
1. **Normale Würfel (NOW)** — Grau/Weiß (Erfolg bei 5–6, 6en explodieren).
2. **Goldwürfel (GoW)** — Gold/Bernstein (Erfolg bei 3–6, 6en explodieren). **WICHTIG:** GoW **ersetzen** NOW im Basispool! Hat ein Pool z. B. Gesamtstufe `10` und `3 GoW`, dann besteht der Basispool aus `7 NOW` und `3 GoW`. Falls `GoW > Basisstufe` (Überschuss durch Boni), wird der Überschuss automatisch zu **Glückswürfeln (GlkW)**!
3. **Glückswürfel (GlkW)** — Cyan/Grün (werden zweimal gewürfelt, zum Pool addiert).
4. **Pechwürfel (PEW)** — Rot (Misserfolge 1–2 ziehen Erfolge ab, 1en explodieren; separat als Malus angezeigt).

**Berechnungsfunktion `calculateDicePool({ basePool, gow, glkw, pew })`:**
- `effectiveGow = Math.min(Math.max(0, gow), Math.max(0, basePool))`
- `now = Math.max(0, basePool - effectiveGow)`
- `gowOverflowAsGlkw = Math.max(0, gow - Math.max(0, basePool))`
- `totalGlkw = Math.max(0, glkw) + gowOverflowAsGlkw`
- `totalPew = Math.max(0, pew)`

**Pool-Inspektor / Würfel-HUD (Wichtiges Komfort-Feature):**
- Wenn der Spieler auf ein **Attribut**, **Abgeleitetes Attribut**, eine **Fertigkeit**, eine **Wissensfertigkeit** oder eine **Waffe** tippt, wird diese Probe im **Würfelpool-HUD** (kompakte, gut sichtbare Leiste direkt unter dem Header oder als fixiertes Bottom-Bar-Banner) fokussiert!
- Das HUD zeigt unmissverständlich:
  `[Probe: z. B. Schrotflinte (WAH + Kurzfeuerwaffen)]` → Große farbige Würfel-Badges:
  `X WEISS (NOW)` · `Y GOLD (GoW)` · `Z CYAN (GlkW)` · `W ROT (PEW)` + Hinweise (z. B. Waffen-PRÄZ, effektive Rüstungsbelastung, Wunden-Malus, aktive Status-Malus).
- Im HUD gibt es schnelle **Situations-Buttons** für den Tisch:
  - Temporäre `+ / - GlkW` (z. B. Rückendeckung, erhöhte Position, Glücks-Ausgabe mit "1 GlkW aus Sitzungspool einsetzen"-Button!)
  - Temporäre `+ / - PEW` & **Mehrfachaktion-Buttons**: `Normal (0 PEW)`, `+1 Aktion (+2 PEW)`, `+2 Aktionen (+4 PEW)`, `+3 Aktionen (+8 PEW)`, sowie Reset auf 0.

### B. Attribute & Abgeleitete Attribute (GRW S. 7, 88–89)
Die **8 Basisattribute** (plus optionales **9. Attribut Psionik** für Psioniker/Illdari/Alchemisten):
- **Stärke (STR)** → Abgeleitet: *Kraftakt (KRA)* = `effSTR * 2`, Tragkraft = `effSTR * 10 kg`
- **Geschicklichkeit (GES)** → Abgeleitet: *Körperbeherrschung (KÖR)* = `effGES * 2`
- **Konstitution (KON)** → Abgeleitet: *Ausdauer (AUS)* = `effKON * 2`
- **Wahrnehmung (WAH)** → Abgeleitet: *Aufmerksamkeit (AUF)* = `effWAH * 2`
- **Intelligenz (INT)** → Abgeleitet: *Logik (LOG)* = `effINT * 2`
- **Willenskraft (WIL)** → Abgeleitet: *Beherrschung (BEH)* = `effWIL * 2`
- **Glück (GLK)** → Abgeleitet: *Vorteil (VOR)* = `aktuellesGLK * 2` (sowie separater Tracker für **Glückspool Aktuell / Max** für im Spiel ausgegebene GlkW)
- **Charisma (CHA)** → Abgeleitet: *Empathie (EMP)* = `effCHA * 2`
- **Psionik (PSI)** *(ein-/ausblendbar)* → Abgeleitet: *Macht (MAC)* = `effPSI * 2`

Je Attribut speicherbar & editierbar:
- `value` (Basiswert, Standard 1–6+)
- `spentEffort` (durch **Anstrengung** ausgegebene Punkte bis zur Langen Rast → `effectiveValue = Math.max(0, value - spentEffort)`)
- `gow`, `glkw`, `pew` (permanente Bonus-/Maluswürfel)
- GoW auf ein Attribut vererben sich nach Beyond-Regeln auch auf das abgeleitete Attribut (`abgeleitet GoW = attr.gow * 2`, sofern manuell nicht anders gewünscht, oder klar als Basis + GoW des Attributs angezeigt — halte es transparent!).

### C. Vitalwerte, WAP-System, Rüstung & Zustände (GRW S. 14–18, 157)
- **Lebenspunkte (LP):** Aktuell / Max (`default Max = KON * 2`, frei editierbar für Boni wie Zähigkeit/Verstärkte Knochen/Brustwunde), plus `tempLp` (Temporäre LP / Zähigkeit), plus **KON-Schadenswiderstandspool** (Hinweis wenn KON GoW > 0).
- **Todeswürfe (GRW S. 16):** 3 Erfolge vs. 3 Misserfolge (anklickbare Pips, automatisch hervorgehoben bei `LP <= 0`).
- **Schilde (SW):** Aktuell / Max mit `+/-` und Quick-Recharge.
- **Wahnsinnspunkte (WAP):** Wert `0–36`, visuell dargestellt in **6 WAP-Graden à 6 Kästchen**:
  - Grad 1 (1–6): Mentaler Widerstand `-3`
  - Grad 2 (7–12): Mentaler Widerstand `-2`
  - Grad 3 (13–18): Mentaler Widerstand `-1`
  - Grad 4 (19–24): Mentaler Widerstand `+1`
  - Grad 5 (25–30): Mentaler Widerstand `+2`
  - Grad 6 (31–36): Mentaler Widerstand `+3`
  - Anzeige der aktuell **angefangenen WAP-Grade** (= PEW auf Beherrschungswurf gegen Verrücktheiten).
- **Rüstung & Schilde (GRW S. 157):**
  - **NRW** (Natürlicher Rüstungswert), **RW-Ist / RW-Soll** (Getragene Rüstung), **Härte (HAR)**, **Belastung (BEL)**, **Kapazität (KAP)**.
  - Berechnung der effektiven Belastung: `effBEL = Math.max(0, BEL - Math.floor(STR / 2))` (Hinweis im UI: gilt als PEW auf körperliche Aktionen außer Fernkampf).
- **Kampfwerte im Header:**
  - **INI** (Initiative), **VW** (Verteidigungswert + Anzeige `VW/2` passiv + Reaktionen-Stepper `Aktuell / Max`), **PW** (Physischer Widerstand), **GW** (Geistiger Widerstand), **Vorteil-Punkte / Glückspool**, **Adrenalin (ADR)** (`0–6+`), **Erschöpfung (ERP)**.
- **Status-Tags (Toggles im Header, leuchten rot/amber auf wenn aktiv, inkl. Kurzregel):**
  - *Angeschlagen* (`Angriffe gegen Ziel +3 GlkW`)
  - *Betäubt* (`Keine Handlung, VW = 1`)
  - *Brennend* (`3 Schaden / Runde`)
  - *Blutend* (`-1 verfügbarer Todeswurf`)
  - *Frost* (`Bewegung /2, +3 PEW KÖR & GES`)
  - *Übelkeit* (`+4 PEW auf alle Aktionen`)
  - *Geschwächt* (`+2 eingehender Schaden`)
  - *Verlangsamt* (`+1 Aktionskosten, Bewegung /2`)
  - *Verflucht* (`PEW auf Psionik & Glück`)
  - *Verätzt* (`Härte -1, 1W6 Schaden / Runde`)
  - *Schwebend / Niedergeschlagen* (`VW /2, keine Reaktion`)
  - *Schock* (`PEW auf körperliche Aktionen`)
  - *Furcht* (`+6 PEW gegen Quelle, 2x WAP`)
  - *Verkrüppelt* (`Unheilbare Wunde`)

### D. Waffen, Fertigkeiten, Techniken, Module & Tabs
- **Spalte 1 (Links):**
  - **8 (+1) Basisattribute & Abgeleitete Attribute**
  - **Waffen & Angriffe** (mit `+ Waffe hinzufügen` + Schnellauswahl-Presets aus dem GRW, Edit-Modus für alle Werte: Name, Fertigkeit, Reichweite/FM, Schaden, RK, PBW, PRÄZ, KRIT, NAL, ZUV, HÄR, MODS, Munitionstyp, Eigenschaften, sowie **interaktivem Munitions-Tracker** mit klickbaren Pips & Nachladen-Button).
- **Spalte 2 (Mitte):**
  - **Aktionsfertigkeiten:** Alle ~47 Standard-Fertigkeiten aus dem GRW vorbefüllt (mit Kategorie, zugeordnetem Attribut, Stufe `0–6`, Spezialisierung, `GoW`, `GlkW`, `PEW` und berechneter Pool-Anzeige `Attr + Fertigkeit`). Suchfeld, "Nur Gelernte (Stufe > 0)"-Toggle, Kategorie-Filter sowie "+ Eigene Fertigkeit".
  - **Wissensfertigkeiten & Sprachen:** Dynamische Liste (Kategorie: Akademisch/Beruf/Hobby/Straße/Sprache, Name, Stufe, GoW/GlkW/PEW, automatische Verknüpfung mit `INT` oder freier Pool).
  - **Techniken & Talente:** Karten-Liste mit Name, Archetyp/Quelle, Kosten (z. B. `2 ADR`, `1 Aktion`, `2 Teer`), Voraussetzung, Anwendungszähler (`Aktuell / Max`), und aufklappbarem Regeltext. Inkl. kleiner Preset-Auswahl bekannter Techniken aus dem GRW + freier Erstellung.
- **Spalte 3 (Rechts) — Modulares Tab-Panel:**
  - **Tab 1: Begleiter / Drohne / Fahrzeug & Cyberware**
    - Beliebig viele Begleiter/Drohnen/Fahrzeuge/Raumschiffe hinzufügbar (Name, Typ, Rumpfpunkte Aktuell/Max, Panzerung Aktuell/Max, Härte, Schilde Aktuell/Max, Reaktor/Energie Aktuell/Max, Treibstoff/Ausdauer Aktuell/Max, Kortex/Systemwerte, Module & Waffen).
    - **Cyberware / Bioware / Exoware (6 Slots):** Kopf/Schädel, Nervensystem, Torso, Arme, Beine, Ganzkörper — mit Name, Typ, **Cyberwarekosten-Summe vs. Max LP** Warnanzeige, Kapazität, Effektbeschreibung.
    - **Spezial-Ressourcen & Cyberdeck (aufklappbar/kompakt):** Cyberdeck (`VS, FW, SI, HW, CPU, RAM`), Parakausale/Klassen-Ressourcen (*Teer, Blutpunkte/SBS/SHS, Mutagene, KABA-Kristalle, Forschungspunkte FP*).
  - **Tab 2: Inventar, Rüstung & Credits**
    - Credits-Zähler (mit Quick-Buttons `+100`, `+500`, `+1000`, `-100`, `-500`), Lebensstil & monatliche Kosten.
    - Detaillierte Rüstungs- & Schildverwaltung (RW Ist/Soll, Härte, Belastung, Kapazität, Modifikationen, Raumanzug-Lebenserhaltung in Stunden).
    - Ausrüstungsliste kategorisiert nach **Bereit / Gürteltasche**, **Rucksack (2 Aktionen)**, **Lager**, jeweils mit Menge (`+/-`), Gewicht/Slots, Verbrauchsgut-Toggle und Notizen.
  - **Tab 3: Vorteile, Nachteile, Wunden, Ruf & Notizen**
    - **Vorteile & Nachteile** (mit Preset-Auswahl aus GRW S. 90–93 + eigene Einträge + Nutzungs-Tracker z. B. `3/3 pro Sitzung`).
    - **Wundzonen & Verkrüppelungen (6 Zonen, GRW S. 16):** Kopf, Brust, Arm, Bein, Nervenschäden, Interne Schäden (mit direkter Anzeige der kumulativen Mali).
    - **Ruf & Ansehen (GRW S. 66–68):** Bekanntheit + Fraktions-Stepper (`-6` bis `+6`) für Hohe Häuser und Syndikate.
    - **Kampagnen-Notizen, Kontakte, Ziele & die 6 Charakterfragen.**

---

## 4. Charakter-Profile & Archetyp-Vorlagen
Stelle mindestens **3 sofort spielbereite Vorlagen** zur Auswahl bei "+ Neuer Charakter" bereit (plus **"Leerer Charakterbogen"** als Standard):
1. **Leerer Standardbogen** (alle Werte sauber initialisiert, alle Standardfertigkeiten auf Stufe 0)
2. **Beispiel-Vorlage: Soldat / Söldner** (Mensch, Kampfwerte & Gewehr/Schrotflinte vorkonfiguriert)
3. **Beispiel-Vorlage: Techniker / Rigger** (inkl. vorkonfigurierter Aufklärungs-/Kampfdrohne & Cyberware)
4. **Beispiel-Vorlage: Gauner / Illdari-Psioniker** (inkl. Psionik-Attribut, Techniken & Vorteil-Pool)

---

## 5. Qualitätssicherung & Abnahme-Kriterien
Bevor die Aufgabe abgeschlossen ist:
1. `npm run build` (TypeScript Check + Vite Production Build) muss **mit Exit Code 0 und ohne Fehler** durchlaufen.
2. Alle Texte im UI sind sauber auf Deutsch, konsistent im Dark Industrial Sci-Fi Theme gestylt und für Tablet-Querformat (1024px–1366px+) optimiert.
3. Keine hardcodierte Abhängigkeit auf nur einen Charakter; Profilwechsel, Anlegen, Löschen, Duplizieren, JSON-Export und JSON-Import funktionieren lückenlos über `localStorage`.
