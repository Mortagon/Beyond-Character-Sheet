export interface CodexTable {
  headers: string[];
  rows: string[][];
}

export interface CodexSection {
  id: string;
  title: string;
  page: string;
  tags: string[];
  summary: string;
  bullets?: string[];
  table?: CodexTable;
}

export interface CodexChapter {
  id: string;
  title: string;
  pages: string;
  subtitle: string;
  sections: CodexSection[];
}

export const GRW_CHAPTERS: CodexChapter[] = [
  {
    id: 'regeln',
    title: 'Grundregeln & Reisen',
    pages: 'S. 5–10',
    subtitle: '4-Farben-W6-System, Proben, Anstrengung, Glück & Schiffsreisen',
    sections: [
      {
        id: 'wuerfel',
        title: 'Das 4-Farben-W6-System',
        page: 'S. 5',
        tags: ['NOW', 'GoW', 'GlkW', 'PEW', 'Würfelpool', 'Explodieren'],
        summary:
          'Beyond verwendet ein W6-Poolsystem (Attribut + Fähigkeit bis zu einem unmodifizierten Maximum von 12). Ergebnisverteilung pro W6: 1–2 Misserfolg, 3–4 Neutral, 5–6 Erfolg. Wenn nicht anders angegeben, explodieren 6en (werden zu einem Glückswürfel, der neu gewürfelt wird, solange 6en fallen).',
        bullets: [
          'Normale Würfel (NOW): Standardwürfel (Weiß/Grau). Erfolg bei 5–6 (1/3 Chance), 6en explodieren.',
          'Goldene Würfel (GoW): Erfolg bei 3–6 (2/3 Chance), 6en explodieren. GoW erweitern den Pool nicht, sondern ersetzen NOW. GoW-Überschuss über den Basispool wird zu GlkW.',
          'Glückswürfel (GlkW): Bonuswürfel durch günstige Umstände oder den Glückswert. Jeder GlkW darf zweimal gewürfelt werden.',
          'Pechwürfel (PEW): Maluswürfel durch erschwerende Umstände. Jeder Misserfolg (1–2) auf PEW zieht 1 Erfolg vom Gesamtergebnis ab. Keine explodierenden 6en, aber explodierende 1en!',
        ],
      },
      {
        id: 'schwierigkeit',
        title: 'Wurfergebnisse & Schwierigkeitsgrade (MW)',
        page: 'S. 6–7',
        tags: ['MW', 'Kritischer Erfolg', 'Kritischer Misserfolg', 'Anstrengung', 'Helfen'],
        summary:
          'Ein durchschnittlich schwieriger Mindestwert (MW) ist 3 Erfolge. Bei Gleichstand zwischen Angreifer und Verteidiger gewinnt der Angreifer.',
        bullets: [
          'Kritischer Erfolg: Wurf erfolgreich UND 2, 4, 6 … über dem Zielwert → zusätzliche positive Effekte; im Kampf steigen Schaden/Effektstärken um +4, +6, +8 … je nach übererzielten Erfolgen.',
          'Kritischer Misserfolg: Wurf gescheitert UND 2, 4, 6 … unter dem Zielwert → zusätzliche negative Konsequenzen (z. B. Ladehemmung).',
          'Erfolge ansagen: Spieler darf nach SL-Freigabe Erfolge ansagen und nimmt dafür selbst PEW auf den Wurf, um die Effektstärke zu steigern.',
          'Anstrengung & Erschöpfung (ERP): Attributspunkte ausgeben garantiert je Punkt 2 Erfolge auf diesen Wurf. Das Attribut sinkt bis zu einer Langen Rast. Jeder ERP erhöht die Belastung um 1 und wird auf Anstrengen-Kosten addiert.',
          'Helfen: Höhere Stufe beim Helfer → Ziel erhält Differenz der Stufen als GlkW. Gleiche/niedrigere Stufe → Ziel darf Wurf zweimal würfeln (zweites Ergebnis zählt).',
          'Abgeleitete Fähigkeiten: Ist eine verwandte Fähigkeit plausibel, darf mit halber Fähigkeitsstufe + passendem Attribut improvisiert werden.',
        ],
      },
      {
        id: 'glueck-vorteil',
        title: 'Glück & Vorteil',
        page: 'S. 8',
        tags: ['Glück', 'Vorteil', 'VOR', 'Glücksspiel'],
        summary:
          'Der Glückswert repräsentiert einen auszugebenden Glückswürfel-Pool für die Sitzung. Das abgeleitete Attribut Vorteil (VOR = GLK × 2) sinkt, wenn GlkW ausgegeben werden.',
        bullets: [
          'Szene beeinflussen: Spieler beschreibt eine ungeklärte, günstige Möglichkeit als Frage an den SL und würfelt mit Vorteil gegen einen vom SL gesetzten MW (z. B. seltener Gegenstand beim Händler oder Granate bei gefallener Wache).',
          'Glücksspiel: 1 GlkW ausgeben, um einen Glücksspielwurf zu wiederholen (zweites Ergebnis zählt).',
        ],
      },
      {
        id: 'reisen-stationen',
        title: 'Schiffsreisen, Ereignisse & Stationen',
        page: 'S. 9–10',
        tags: ['Reise', 'Rationen', 'Ereignisse', 'Stationen', 'Dockgebühren'],
        summary:
          'Reisen laufen in Reiseschritten ab. Dauert ein Schritt 6+ Tage: Geistiger Widerstand gegen (2 + Reiseschritte seit letztem Landgang), sonst WAP Str 6|3 + 1 GoW je Schritt. Pro Reisetag wird 1 Ration pro Person verbraucht (6 pro Etappe).',
        table: {
          headers: ['W6', 'Ereignis-Tabelle', 'Natur-Tabelle', 'Stationsmodul (25 % Rabatt / Bonus)'],
          rows: [
            ['1', 'Schiffswrack', 'Moment der Ruhe', 'Handelszentrum (+2 GlkW/Größe auf Verfügbarkeit)'],
            ['2', 'Asteroidenfeld', 'Willkommene Überraschung', 'Bergbaumodul (25 % Bonus auf Rohstoffe)'],
            ['3', 'Raumstation', 'Veränderung in der Umgebung', 'Verschrottungszone (25 % Rabatt Ersatzteile)'],
            ['4', 'Frachtgut (VOR-Wurf)', 'Risikosteigerung', 'Werft (25 % Rabatt Schiffsteile/Schiffe)'],
            ['5', 'Schiffssichtung', 'Unerwartete Wendung', 'Wachtposten (Unterstützung in 3 Runden)'],
            ['6', 'Gravimetrische Anomalie', 'Unangenehme Überraschung', 'Biodom (25 % Rabatt auf Rationen)'],
          ],
        },
      },
    ],
  },
  {
    id: 'kampf',
    title: 'Kampf, Effekte & Gesundheit',
    pages: 'S. 11–18',
    subtitle: 'Initiative, Mehrfachaktionen, Verteidigung, 0G/+G, Zustände, Wunden & WAP',
    sections: [
      {
        id: 'kampfablauf',
        title: 'Kampf in Runden, Aktionen & Verteidigung',
        page: 'S. 11–12',
        tags: ['Initiative', 'Mehrfachaktion', 'VW', 'Reaktion', 'Blindwütig', 'Deckung'],
        summary:
          'Zu Kampfbeginn würfelt jeder mit seinem Initiative-Pool (W6 = INI + Erfolge = Ergebnis). Pro Runde hat man 1 Aktion + 1 Bewegungsaktion (6 m; Rennen/Schwimmen = Athletik-Erfolge in Metern).',
        bullets: [
          'Mehrfachaktionen (zu Rundenbeginn ansagen): 1 Zusatzaktion = 2 PEW, 2 Zusatzaktionen = 4 PEW, 3 Zusatzaktionen = 8 PEW.',
          'Angriffe & Verteidigung: Grund-MW gegen Angriffe ist VW / 2. Mit 1 Reaktion (Anzahl = VW) wird voller VW zum MW. Ohne Reaktion: Aktives Ausweichen (1 Aktion) mit VW × 2 gegen Angriff (Gleichstand = Angreifer gewinnt).',
          'Physischer & Geistiger Widerstand (PW / GW): Effekte wirken gegen PW oder GW. Mit 1 Widerstandspunkt wird voller PW/GW zum MW; sonst aktiv würfeln mit PW×2 / GW×2.',
          'Blindwütige Angriffe: VW freiwillig reduzieren → doppelte Bonuswürfel auf Nahkampfangriff + Schaden um Reduktion erhöht (hält ganze Runde).',
          'Flankieren & Position: Angriff von hinten = +2 GlkW. Ziel im Nahkampf mit anderem Ziel = +1 automatischer Erfolg je weiterem Angreifer. Erhöhte Position = +1 GlkW je 2 m Höhenunterschied.',
          'Deckung: Viertel-Deckung +1 VW, Halbe Deckung +2 VW, ¾-Deckung +3 VW, Volle Deckung +4 VW.',
        ],
      },
      {
        id: 'gravitation',
        title: 'Kampf & Bewegung in 0G und erhöhter Schwerkraft',
        page: 'S. 12–13',
        tags: ['0G', 'Schwerelosigkeit', 'Gravitation', '2G', '3G', '6G'],
        summary:
          'Extreme Gravitation verändert Bewegungsreichweite, Belastung und Anstrengungskosten.',
        table: {
          headers: ['Gravitation', 'Effekte'],
          rows: [
            ['0G (Schwerelos)', 'Bewegung erfordert Aktion + Athletik (2 PEW), Reichweite ×2; Orientierung: AUF 2 PEW; Schusswaffen-Rückstoß ½ Kästchen zurück.'],
            ['2G', 'Rüstungsbelastung steigt um +1.'],
            ['3G', 'BEL +2; Anstrengung +1; Bewegung erfordert KRA gegen 3 (sonst halbiert, krit. Misserfolg = unbeweglich); Sturzschaden m × 2.'],
            ['4G', 'BEL +3; Anstrengung +2; Bewegung KRA gegen 4; Sturzschaden m × 2.'],
            ['5G', 'BEL +4; Anstrengung +3; Bewegung KRA gegen 5; Sturzschaden m × 3.'],
            ['6G', 'BEL +5; Anstrengung +4; Bewegung KRA gegen 6 (Misserfolg = Sturz m × 4, krit. Misserfolg +3 ERP).'],
          ],
        },
      },
      {
        id: 'adrenalin-effekte',
        title: 'Adrenalin (ADR) & die 14 Status-Effekte',
        page: 'S. 14–15',
        tags: ['Adrenalin', 'ADR', 'Betäubt', 'Brennen', 'Bluten', 'Frost', 'Übelkeit', 'Angeschlagen', 'Furcht'],
        summary:
          'Bei gelungenem Angriff erhält der Angreifer Adrenalinwürfel (ADR) = (Angriff − Verteidigung) / 2. ADR verfallen nach dem Kampf und können als Bonus-Schadenspool oder zum Durchatmen (Aktion: ADR-Wurf als LP oder Anstrengung) genutzt werden.',
        table: {
          headers: ['Zustand', 'Regelwirkung'],
          rows: [
            ['Betäubt', 'Kann nicht handeln, VW sinkt auf 1. Endet bei Schaden oder Ende Runde mit PW-Wurf (4 PEW).'],
            ['Brennen', 'Erleidet jede Runde 3 Punkte Schaden.'],
            ['Bluten', 'Reduziert verfügbare Todeswürfe um 1.'],
            ['Frost', 'Bewegung halbiert; 3 PEW auf alle KÖR- & GES-Würfe.'],
            ['Übelkeit', '4 PEW auf alle Aktionen.'],
            ['Angeschlagen', 'Alle Angriffe gegen das Ziel erhalten +3 GlkW.'],
            ['Geschwächt', 'Eingehender Schaden wird um +2 erhöht.'],
            ['Verlangsamt', 'Aktionskosten +1; Bewegung halbiert.'],
            ['Verflucht', 'Psionik und Glück erhalten PEW = Differenz Effektwurf/Verteidigung.'],
            ['Verätzt', 'Härte der Rüstung sinkt um 1; jede Runde 1W6 Schaden.'],
            ['Schwebend / Niedergeschl.', 'Keine Bewegungskontrolle, VW halbiert, keine Reaktion.'],
            ['Schock', 'Körperliche Aktionen erhalten PEW = Differenz Effektwurf/Verteidigung.'],
            ['Furcht', '6 PEW auf alle Aktionen gegen Quelle der Furcht; erhaltene WAP verdoppelt.'],
          ],
        },
      },
      {
        id: 'gesundheit-wunden',
        title: 'Lebenspunkte, Todeswürfe & Wundzonen',
        page: 'S. 16',
        tags: ['LP', 'Todeswürfe', 'Wunden', 'Verkrüppelung', 'Wundzonen'],
        summary:
          'Max-LP = KON × 2. Goldwürfel auf KON ergeben einen NOW-Pool, der bei LP-Schaden gewürfelt wird (Erfolge reduzieren Schaden). Bei 0 LP jede Runde 1W6 Todeswurf (gerade = Erfolg): 3 Erfolge = stabilisiert, 3 Misserfolge = Tod (oder dauerhafte Verkrüppelung wählen). Jeder gescheiterte Todeswurf erzeugt eine Wunde an W4-Trefferzone.',
        table: {
          headers: ['W6', 'Wundzone', 'Kumulativer Malus bis zur Heilung'],
          rows: [
            ['1', 'Kopfwunde', '+4 PEW auf WIL, INT, WAH, PSI; Anstrengung dieser Attribute +1'],
            ['2', 'Brustwunde', 'Max-LP −1; +2 PEW auf KON; Anstrengung KON +1'],
            ['3', 'Armwunde', '+2 PEW auf GES; Anstrengung GES +1'],
            ['4', 'Beinwunde', '+2 PEW auf STR; Anstrengung STR +1'],
            ['5', 'Nervenschäden', '+2 PEW auf CHA; Anstrengung CHA +1'],
            ['6', 'Interne Schäden', 'Eingehender Schaden +1; alle Anstrengungen +1'],
          ],
        },
      },
      {
        id: 'wahnsinn-heilung',
        title: 'Geistige Gesundheit (WAP), Verrücktheiten & Heilung',
        page: 'S. 17–18',
        tags: ['WAP', 'Wahnsinn', 'Verrücktheit', 'Heilung', 'Medizin', 'Therapie', 'Erholung'],
        summary:
          'Wahnsinnspunkte (WAP) füllen 6 Grade à 6 Punkte. Beim Füllen von Grad 3–6 (oder durch Schock): Beherrschungswurf mit PEW = angefangene WAP-Grade gegen STR der Geisteskrankheit.',
        bullets: [
          'WAP-Grade: Grad 1 (−3 eingehende WAP), Grad 2 (−2), Grad 3 (−1), Grad 4 (+1), Grad 5 (+2), Grad 6 (+3).',
          'Verrücktheiten (W6): 1 Katatonie (Betäubt), 2 Hysterie (1W6 min, Angeschlagen), 3 Wutausbruch, 4 Halluzinationen (Geblendet), 5 Ego-Tod, 6 Panikanfall.',
          'Natürliche Heilung: 24h ohne körperliche Würfe → KON × 2 W6 als geheilte LP.',
          'Medizin & Wunden: Krankenstation + Medizinwurf (Todeswurf 1: MW 4 / 8 Tage; Todeswurf 2: MW 8 / 16 Tage; Todeswurf 3: unheilbar; Arztkosten 10.000 ₡).',
          'Therapie: Wissen: Psychologie-Erfolge als GoW auf Beherrschungswurf des Patienten → Erfolge heilen WAP. Alternativ gesellige Aktivitäten + Beherrschungswurf.',
          'Erholung: 8h Rast → KON × 2 W6 heilt Anstrengung & ERP; 1h Rast → KON W6 heilt nur ERP.',
        ],
      },
    ],
  },
  {
    id: 'fahrzeuge',
    title: 'Schiffe, Drohnen & Fahrzeuge',
    pages: 'S. 19–48',
    subtitle: 'Raumschiffbau, Raumkampf, Rollen an Bord, Drohnen & Bodenfahrzeuge',
    sections: [
      {
        id: 'raumschiffdesign',
        title: 'Raumschiffdesign & Attribute',
        page: 'S. 19–21',
        tags: ['Raumschiff', 'Brücke', 'Reaktor', 'Triebwerk', 'Habitate', 'Stationen'],
        summary:
          'Ein einsatzfähiges Raumschiff benötigt Brücke (Panzerung, Sensoren, Computer, +2 RP), Reaktor (begrenzt Rumpfmodule & Systemmodule, definiert Schilde; Kosten Stufe × 40.000 ₡, Max 6) und Triebwerk (Treibstoff, Energie, Wendigkeit, Schnelligkeit; 2 Slots). Jedes Rumpfmodul gibt +2 RP, 3 Erweiterungsplätze und 1 Frachtzeile (1 PEW Malus für Piloten pro Modul).',
        bullets: [
          'Schilde: Verbrauchen 1 Schildpunkt, um Schaden & Effekt eines Treffers zu ignorieren; Aufladen kostet Energie.',
          'Ersatzteile: 600 ₡ pro Einheit; Reparatur per Mechanik gegen fehlende RP (25 Ersatzteile pro 2 RP).',
          'Raumkampf: Gruppeninitiative (Durchschnitt der Crew); Pilot würfelt zu Rundenbeginn auf Pilotenfähigkeit als Schiffs-MW/VW. Manöver: Halbschleife (3 Treibstoff, auto-Ausweichen), Fassrolle (2 Treibstoff, GlkW = Pilot auf nächsten Schuss), Tauchfahrt (2 Energie, Sensorikwurf für Feinde oder PEW).',
          'Schiffsstationen (je 1 pro Rumpfmodul): Lazarus (Krankenstation), Apollo (Forschungslabor +6 GoW), Hephaistos (Werkstatt), Mnemosyne (Neurale Schnittstelle für Hacking), Demeter (Biolabor), Hestia (+4 GlkW gegen Reise-WAP), Hades (Gefängnis), Olympus (Sportstudio +3 Anstrengen), Hera (Waffenkammer), Artemis (Schießstand), Ares (Dojo), Odyssey (Hangar), Hypnos (Neuraler Simulator).',
        ],
      },
      {
        id: 'bordrollen',
        title: 'Rollen an Bord (je Trick 4 EP)',
        page: 'S. 22–24',
        tags: ['Kanonier', 'Mechaniker', 'Schiffsarzt', 'Navigator', 'Pilot'],
        summary:
          'Crewmitglieder übernehmen feste Rollen und können rollenspezifische Tricks für je 4 EP erlernen.',
        bullets: [
          'Kanonier: Gezielte Gewalt (+1 Geschützschaden), Einbrennen (Laser überhitzen Panzerung), Vor-Feuern (Ziel-Pilotwurf wiederholen), Zorros Methode (3 Geschütze zugleich).',
          'Mechaniker: Bolzen und Farbe (Ersatzteilkosten senken), Notreparatur (bei 0 RP Mechanikwurf), Auf Reserve (Treibstoff 0 retten), Kickstart (Energie 0 retten).',
          'Schiffsarzt: Von der Seele reden (keine Reise-WAP), Leonisation (+2 temporäre LP), Sport Programm (−1/−2 EP auf körperl. Attributssteigerung), Meditationskurse.',
          'Navigator: Astrometrie (Reisezeit bis 3 Tage verkürzen), Drei-Körper-Problem (Bonusaktionen), Slingshot (halbe Manöverkosten), Beyond (1W6: bei 6 Wurmloch).',
          'Pilot: Gib Alles (Bonusaktionen), Fliehkräfte (+Schaden am Ziel), 180 (Angreifer erhält PEW), Heute nicht (gescheiterte Ausweichwürfe wiederholen).',
        ],
      },
      {
        id: 'drohnendesign',
        title: 'Drohnendesign & Module',
        page: 'S. 36–43',
        tags: ['Drohne', 'Frame', 'Kortex', 'Reaktor', 'Antrieb', 'Drohnensysteme'],
        summary:
          'Eine Drohne benötigt 4 Kernmodule: Frame (RP, Panzerung, Härte, Modulplätze), Reaktor (Stufe 1–12, Kosten Stufe × 2.000 ₡, Energie & Schilde), Kortex (Sensoren, Computer, Zielcomputer; erhält ½ Stufe GoW min. 1 und Stufe/4 GlkW min. 1) und Antrieb (Treibstoff = je 1 Punkt für 2 Aktionen/Runde, Wendigkeit, Schnelligkeit, Tragkraft, Boden/Flug/Schwimmend).',
        bullets: [
          'Gewichtsregel: Das Gewicht des Frames (Leicht/Mittel/Schwer) darf das des Antriebs nicht überschreiten.',
          'Drohnenwaffen: Nutzen Waffen aus dem Ausrüstungskapitel (je Waffe 1 Modulplatz). Ersatzteile: 100 ₡ pro Einheit.',
          'Drohnensysteme (je 4.500 ₡, 2 Energie): Rettungsmodul (Medizin 8 & 3 GoW), Stimdifusor (+3W6 Heilung 6m), Perimeterschutz (Halbe Deckung 6m), EM Puls (−2W6 Schilde), Sensorbank (+4 GoW), Universallabor (6 GoW Analyse), Pulsschild (3 SP), Kletterhaken (+5 GoW), Greifarme (+5 GoW), Bergbauausrüstung.',
        ],
      },
      {
        id: 'fahrzeugdesign',
        title: 'Fahrzeugdesign & Mods',
        page: 'S. 44–48',
        tags: ['Fahrzeug', 'Motor', 'Chassie', 'Antrieb', 'Grip', 'Federung'],
        summary:
          'Fahrzeuge bestehen aus Motor (Stufe 1–12, definiert Treibstoff & Leistung), Chassie (Modulplätze, Panzerung, Härte, RP, Geschw./Wendigkeit-Mods) und Antrieb (Wendigkeit auf Krit-Erfolge, Grip & Federung zum Reduzieren von Hindernis-MW).',
        bullets: [
          'Ersatzteile: 300 ₡ pro Einheit. Standard-Laderaum: 1 Frachtzeile + Charakter-Lager.',
          'Kompatibilität: Fahrzeuge können auch Raumschiff-Mods (50 % günstiger) und Drohnen-Module (50 % teurer) einbauen; Energiekosten werden mit Treibstoff bezahlt.',
          'Fahrzeug-Mods: Anhänger (30.000 ₡), Ladefläche (+1 Frachtzeile), Panzerung (+1 Panzerung/Härte), Rammsporn (+1W6 Verlust beim Ziel), Flutlicht (ignoriert Dunkelheitsmali).',
        ],
      },
    ],
  },
  {
    id: 'forschung-hacking',
    title: 'Forschung, Spiele & Hacking',
    pages: 'S. 49–65',
    subtitle: 'Materialstufen, Crafting, Glücksspiel, Verheizen, Cyberdecks & Quickhacks',
    sections: [
      {
        id: 'ressourcen-crafting',
        title: 'Ressourcen, Forschung & Produktion',
        page: 'S. 49–56',
        tags: ['Forschung', 'FP', 'Bauplan', 'Produktion', 'Handwerk', 'Effekte'],
        summary:
          'Ressourcen haben eine Art (Tierisch, Pflanzlich, Mineralisch, Metallisch, Chemisch, Technisch, Fremdartig) und Qualitätsstufe 1–9. Analyse mit passender Wissenschafts-Fähigkeit gegen MW = Stufe verleiht Erfolge × FPM als Forschungspunkte (FP).',
        table: {
          headers: ['Stufe', 'Material', 'Wert', 'FPM', 'Dauer / Voraussetzung'],
          rows: [
            ['1–2', 'Einfach / Gewöhnlich', '50 / 150 ₡', '10 / 15', '10 / 20 Min · kein Werkzeug'],
            ['3–4', 'Komplex / Sehr Komplex', '500 / 1.500 ₡', '30 / 150', '60 / 120 Min · Werkzeug (ab 4: Effekte)'],
            ['5–6', 'Selten / Besonderes', '5.000 / 13.000 ₡', '200 / 250', '6 / 12 Std. · Werkbank'],
            ['7–8', 'Geheim / Vergessen', '40.000 / 100.000 ₡', '1.000 / 2.000', '36 Std. / 3 Tage · Werkstatt'],
            ['9', 'Legendäres Material', '300.000 ₡', '10.000', '9 Tage · Labor'],
          ],
        },
        bullets: [
          'Bauplan-Entwicklung: Jede Eigenschaft ist ein Modul (GoW kostet je 2 Effektstufen). Kosten = Effektstufe × 1.000 FP, Dauer = Stufe in Tagen. Fehlende FP können durch Nachteile improvisiert werden.',
          'Produktion: Kombinierte Ressourcenstufe = Effektstufe. Handwerkswurf gegen (höchste Seltenheit × 2) mit PEW = Effektstufe / 2 (genaue Stufen-Übereinstimmung gibt 2 + Effektstufe/2 GlkW). Finaler Zusammenbau gegen MW = Modulanzahl.',
        ],
      },
      {
        id: 'brot-spiele',
        title: 'Glücksspiele, Rennen & Minispiele',
        page: 'S. 57–62',
        tags: ['Roulette', 'Blackjack', 'Rennen', 'Verheizen', 'Schlösserknacken', 'Giiker'],
        summary:
          'Freizeitbeschäftigungen & mechanische Herausforderungen zwischen den Aufträgen.',
        bullets: [
          'Roulette (1W100): Einzelzahl ×99, 5er-Set ×20, 10er-Set ×10, Gerade/Ungerade oder Rot/Schwarz (0 ist grün) ×2.',
          'Spielautomaten (3W6): Drei Gleiche gewinnen (111 = Einsatz bis 666 = Einsatz + 5× Einsatz).',
          'Blackjack (1W100 Kartenwerte): Ziel 21; Ass+10 zahlt Einsatz + 2× Einsatz.',
          'Rennen: Dauer in Runden; Pilotwürfe gegen (Streckenschwierigkeit + 2); Wendigkeit addiert auf krit. Erfolge, Geschwindigkeit als Treibstoff-GlkW-Pool.',
          'Schlösserknacken: 1–6 Tumbler (1W2–1W20). Erfolgswurf auf Mechanik (Schlösserknacken) bestimmt Wiederholungen; Treffer muss auf ±1 genau an SL-Wurf liegen.',
          'Hacken (Minispiel): Super-Decoder-Zeitbasis (150/120/90s) + (INT + Computer + 2 Spez.) × 10s; Systemscan deckt Farben vorab auf.',
        ],
      },
      {
        id: 'hacking-quickhacks',
        title: 'Hacking, Cyberdecks & Quickhacks',
        page: 'S. 63–65',
        tags: ['Hacking', 'Cyberdeck', 'VS', 'FW', 'SI', 'HW', 'CPU', 'RAM', 'Quickhack'],
        summary:
          'Cyberdecks & Konstrukte haben Verteidigung (VS Verschlüsselung, FW Firewall, SI Softwareintegrität, HW Hardware), Angriff (CPU als W6-Schadenspool) und RAM. Quickhacks: Computerwurf gegen VS des Ziels. Softwarekosten = (Aktion × RAM) × 2.000 ₡.',
        table: {
          headers: ['Quickhack', 'Typ', 'Aktion / RAM', 'Effekt'],
          rows: [
            ['Brute Force', 'Angriff', '1 / 1', 'Verursacht volle CPU-Stufe direkt als Schaden (kein Pool) gegen Verteidigung.'],
            ['Bypass', 'Angriff', '2 / 3', 'Umgeht Firewall, verursacht CPU als W6-Schadenspool gegen SI und HW.'],
            ['Systemabsturz', 'Angriff', '2 / 6', 'Cyborg: Betäuben (STR CPU×2 vs PW); Konstrukt: gegen CPU ausgeschaltet.'],
            ['Overclock', 'Verteidigung', 'Aktiv / 1', 'Reduziert CPU-Stufe und erhöht ein anderes Attribut um diesen Wert.'],
            ['Überhitzen', 'Kontrolle', 'Aktiv / 2', 'Max-LP um Cyberwarekosten senken (0 = ohnmächtig); Roboter erhalten PW als PEW.'],
            ['Kurzschluss', 'Kontrolle', '1 / 3', 'W6-Pool = CPU × Cyberware-Menge vs PW → Betäuben (bei Konstrukt tödlich).'],
            ['Reboot', 'Kontrolle', '1 / 3', 'Startet Ziel neu; Konstrukte sind 1W6 Runden Betäubt.'],
            ['Cheating', 'Kontrolle', '2 / 3', 'Reduziert eigene CPU für 1W6 Runden für direkten, verteidigungsignorierenden Schaden.'],
            ['Master / Slave', 'Kontrolle', 'Aktiv / 2', 'Verbindet LOG-Erfolge an Zielen; Hacks treffen alle verbundenen Ziele.'],
            ['Bug / Ping', 'Kontrolle', '1 / 1', 'Bug: Fehlfunktion 1W6 Runden (Cyberware/Waffe). Ping: Enthüllt aktive Netzwerkgeräte.'],
          ],
        },
      },
    ],
  },
  {
    id: 'charakterbau',
    title: 'Charaktere, Spezies & Ruf',
    pages: 'S. 66–93',
    subtitle: 'Bekanntheit, Ansehen, Charaktererschaffung, EP, Spezies, Häuser, Vorteile & Nachteile',
    sections: [
      {
        id: 'ruf-ansehen',
        title: 'Bekanntheit, Häuser & Syndikate',
        page: 'S. 66–68, 84–87',
        tags: ['Bekanntheit', 'Ruf', 'Ansehen', 'Häuser', 'Syndikate'],
        summary:
          'Bekanntheit (12 Stufen à 12 Punkte) wächst mit verdienten EP (bei Charaktertod geteilt durch Charakteranzahl). Ansehen reicht von −6 bis +6 (wirkt bei Proben als GoW oder PEW; bei Syndikaten ±20 % bis ±60 % Preise/Belohnungen).',
        bullets: [
          'Die Hohen Häuser: Haus des Winters (Tartarus), Haus der drei Sonnen (Minerva), Hauslos, Haus der Wölfe (Das Riff / Illdari), Haus des Regens (Leviathan), Haus der Stürme (Taurus).',
          'Die 6 Syndikate: Teufel der Leere (Korsarie/Hexerei), Der Blutstrom („die Roten“, Piraterie), Die Handelsliga (Schmuggel/Glücksspiel), Die Familie (Technonekromanten), Vanars Haie (Deserteure), Schattenjäger (Assassinen).',
        ],
      },
      {
        id: 'erschaffung-ep',
        title: 'Charaktererschaffung & EP-Fortschritt',
        page: 'S. 69–72, 88–89',
        tags: ['Erschaffung', 'EP', 'Steigerung', 'Attribute', 'Abgeleitete Attribute'],
        summary:
          'Reihenfolge: 1. Spezies → 2. Geschlecht (+1 GoW LOG oder EMP) → 3. Herkunft → 4. Haus → 5. Hintergrund → 6. Attribute (8× 1W4/1W6, 1er neu) → 7. Fähigkeiten (Generalist: 8 Fähigkeiten + 1 Spez.; Spezialist: 4 Fähigkeiten + 4W4 GoW + 2 Spez.) → 8. 3 Techniken → 9. Vorteile/Nachteile → 10. Lebensstil → 11. Ausrüstungspaket → 12. 6 Fragen.',
        bullets: [
          'EP-Belohnung: In der Regel max. 5 EP pro Sitzung (EP bleiben bei Charaktertod für den Nachfolger erhalten).',
          'Steigerungskosten: Fähigkeit steigern = nächste Stufe in EP; GoW in Fähigkeit = 2× Würfelstufe. Attribut steigern = 10 EP; GoW in Attribut = 16 EP. Neue Technik = 8 EP. Sprache = 8 EP.',
          'Abgeleitete Attribute (jeweils 2× Basisattribut): KRA (STR), KÖR (GES), AUS (KON), AUF (WAH), LOG (INT), BEH (WIL), VOR (GLK), EMP (CHA), MAC (PSI).',
        ],
      },
      {
        id: 'spezies-herkunft',
        title: 'Die 4 Spezies & Herkunftswelten',
        page: 'S. 73–77',
        tags: ['Mensch', 'Aberrant', 'Illdari', 'Verlorener', 'Tartarus', 'Minerva', 'Pandarve', 'Freihafen 7'],
        summary:
          'Wähle oder erwürfle (1W4) eine der 4 Spezies sowie deinen Heimatplaneten (1W6).',
        bullets: [
          'Mensch: +1 Vorteil und +1 Attributsstufe nach Wahl.',
          'Aberrant (Verhasst, −1 Vorteil): Daemon (+1 GoW/+2 GlkW auf GES & STR, Hitzeresistenz) · Maari (Immunität gg. Überraschen, Wasseratmung, Gegner Unglück auf Heimlichkeit) · Ogroi (+1 GoW/+2 GlkW auf STR, Zähigkeit) · Chithkin (+1 GoW/+2 GlkW auf WAH, +2 NRW).',
          'Illdari: Beginnen mit +1 PSI sowie +1 GoW & +2 GlkW auf PSI.',
          'Verlorener: Nanitenkörper (+1 LP Regeneration/Min), +3 zusätzliche Fähigkeiten, +1W4 GoW auf Fähigkeiten; Verhasst, keine Cyberware, kein Psionikwert.',
          'Herkunft (W6): Tartarus (Bergbau, Ausdauer, Überleben), Minerva (Kultur, Überreden, Geschichte), Pandarve (Überleben, Kontakte), Freihafen 7 (Gassenwissen, Elektronik/Ruf), Das Riff (Gravitänzer, +1 PW Strahlung, Gassenwissen), Leviathan (Xenobiologie, Mechanik, Elektronik), Taurus (Bergbau/Botanik, +1 PW Kälte, Computer).',
        ],
      },
      {
        id: 'vorteile-nachteile',
        title: 'Vorteile & Nachteile (Übersicht)',
        page: 'S. 90–93',
        tags: ['Vorteile', 'Nachteile', 'Zähigkeit', 'Glück', 'Psionik', 'Gremlins', 'Gesucht'],
        summary:
          'Standardmäßig 2 Vorteile (Menschen 3, Aberranten 1). Jeder zusätzliche Vorteil erfordert einen Nachteil.',
        bullets: [
          'Talent & Gen-Therapie: Analytischer Geist (+2 GlkW LOG), Bewegungstalent (+2 GlkW Athletik), Durchsetzungsstark (+2 GlkW Überzeugen), Fotografisches Gedächtnis (+4 GlkW Erinnern), Mutig (+2 GW Angst/Wahnsinn), Techn. Improvisationstalent (+2 GlkW Technik), Gummigelenke, Katzenhaft (+2 GlkW Heimlichkeit), Schnellheilung (2× Heilungsrate), Starkes Immunsystem, Zähigkeit (−1 Schaden, +2 Temp-LP), Umweltwiderstand (+2 PW).',
          'Herkunft & Astral: Aktien, Hochgeboren, Freund der Schatten / des Systems (2× Ruf), Kontakte des Reisenden, Vertrautes Terrain (+2 GlkW), Psionik (1W6 PSI), Glück (3×/Sitzung Re-Roll), Schutzgeist (wie Freund, 3×), Segen (3× GoW verdoppeln), Berührt (3× Psionik ignorieren), Sternenlicht (½ Lebenshaltung).',
          'Nachteile: Albträume, Naiv, Blutgier, Gier, Neugierig, Gremlins (+3 PEW Technik), Allergie, Asthma, Immunabstoßung (+2 Cyberwarekosten), Mimose (+1 Schaden), Hässlich (−2 Sozial), Schlechte Konstitution, Abhängigkeit, Berüchtigt, Analphabet, Dunkles Geheimnis, Feind, Gesucht, Psionisches Leuchtfeuer, Unglück, Poltergeist, Fluch, Verlassen, Hunger der Leere.',
        ],
      },
    ],
  },
  {
    id: 'archetypen',
    title: 'Fertigkeiten & Archetypen',
    pages: 'S. 94–149',
    subtitle: '38 Aktionsfertigkeiten, Sozialer Kampf, Psionik, Techniker, Priester, Hexe & alle 17 Pfade',
    sections: [
      {
        id: 'fertigkeiten-sozial',
        title: 'Fertigkeiten & Sozialer Kampf',
        page: 'S. 94–101',
        tags: ['Fertigkeiten', 'Sozialer Kampf', 'Wissensfertigkeiten', 'Sprachen'],
        summary:
          '38 Aktionsfertigkeiten (Kampf, Körperlich, Mobilität, Medizin, Technik, Sozial) plus Wissensfertigkeiten (immer mit INT verknüpft; bei Erschaffung ⌈INT/2⌉ Stück). Im Sozialen Kampf entsprechen „LP“ der Überzeugung (GW × 2); Argumente verursachen Schaden = Attribut.',
        bullets: [
          'Sozialer Kampf Verteidigung: Durchhalten (bis zu GW× ignorieren gegen GW), Zurückweisen (Aktion, GW × 2 vs Angriff) oder Gegenargument (Aktion, soziale Fertigkeit vs Argument).',
          'Sprachen: Nominell Wissensfertigkeiten der Stufe 1 (8 EP). Ohne Sprache: Kommunikationswurf (INT + CHA).',
        ],
      },
      {
        id: 'psionik-tech-wissen',
        title: 'Psioniker, Techniker, Erfinder & Schreiber',
        page: 'S. 102–109',
        tags: ['Psioniker', 'Techniker', 'Erfinder', 'Schreiber', 'QDP', 'Drohne', 'Geschützturm'],
        summary:
          'Technisch-intellektuelle und psionische Archetypen des Systems.',
        bullets: [
          'Psioniker: Beherrschen Telepathie, Psychogrammatrie, Telekinese (MW: Trivial 0, Leicht 2, Herausfordernd 4, Schwierig 8, Legendär 16, Gott 32) und Barriere (Aktiv: PSI-Malus = SP; Reaktiv: REA + PSI-Wurf gegen Schaden). Scheitern löst Überanstrengung gegen GW aus (Differenz = WAP & LP-Schaden).',
          'Techniker: Autonomer Geschützturm, Mobile Barriere (Struktur = Mechanik×4), Schildpylone, Schildraub, Schilde Überlasten, Struktureller Experte, Focaultschilde (5–6 auf W6 leitet Treffer ab), Tüftler (eigene Drohne aus 3×1, 2×2, 1×3 Stufen), Medizintechnik (Stimexperte, Heilungspylone).',
          'Erfinder: Veredelung, Geistesblitz, Wiederverwertung, Meisterhandwerker (−2 PEW Herstellung), Werkzeugmeister (+2 GlkW), Erinnerungspalast, Genie & Wahnsinn.',
          'Schreiber (nur Haus der drei Sonnen): Nutzen Sesch en Ka-u, THOTH & Djeb aan en Sesch mit KABA-Kristallen für Quantendeontologische Phrasen (QDP: Ziel → Effekt → Stärke → Dauer, je max. Stufe 6) aus den 49 Worten der Vorfahren.',
        ],
      },
      {
        id: 'kampf-schatten',
        title: 'Soldat, Gauner, Bukanier, Grabprospektor, Klingentänzer & Wanderer',
        page: 'S. 110–126',
        tags: ['Soldat', 'Gauner', 'Bukanier', 'Grabprospektor', 'Klingentänzer', 'Wanderer'],
        summary:
          'Kampf-, Infiltrations- und Erkundungsarchetypen.',
        bullets: [
          'Soldat: Waffenausbildung, Schutz suchen (+1 Deckung), Geländeausbildung (0G/High-G/Umwelt), Kampfausbildung (CQB, Deckung, Hinterhalt), Schnelles Nachladen, Feindmarkierung (+3 GlkW), Kugelhagel, Blutrausch, Feldmediziner (Lazarus).',
          'Gauner: Akimbo (2 Handfeuerwaffen ohne Mehrfachaktionsmalus), Schnellziehen, Im Schatten bleiben, Schummeln, Treuer Freund (kleines/mittleres Tier mit Tricks), Plan B (rückwirkende Vorbereitung), Durch die Menge, Duell, Fächern, Großes Eisen, Panzerknacker.',
          'Bukanier: Zähne des Leviathans, Bein stellen, Seegang (+2 GlkW an Bord), Blut an Deck, Blutstrudel, Blutzorn, Klingenwirbel, Rasende Hiebe, Riposte, Mogeln, Seebär.',
          'Grabprospektor: Gefahrensinn (+GlkW gegen Fallen), Fallenexperte, Blick des Grabräubers, Georäumlicher Sinn, Sechster Sinn (20 m Vibrationen), Echolokation, Dunkelsicht.',
          'Klingentänzer: Klingentanz (REA → ADR), Ehrenkodex (+3 GlkW auf GW), 4 Stände (Strand +2 GlkW Parieren, Welle +2 GlkW Ausweichen, Mond +4 GlkW Angriff / −2 Vert., Fluss +1 GlkW kumulativ) & Techniken (Wasserschlag, Blitzschlag, Klingensturm).',
          'Wanderer (Waffenlos): Wie die Weide (VW = GES+WAH/2 oder GES/2+WAH), Drachenkrallenschlag (GES/2 Schaden), Körperspannung, Trümmerschlag, Lähmungsschlag, Kampfmeditation, Blitzreflex (Geschosse abwehren).',
        ],
      },
      {
        id: 'parakausal-blut',
        title: 'Mutant, Ikone, Priester, Hexerei, Arkana, Hämophage & Alchemie',
        page: 'S. 127–149',
        tags: ['Mutant', 'Ikone', 'Priester', 'Teer', 'Hexerei', 'Arkana', 'Hämophage', 'Alchemie'],
        summary:
          'Biologische, soziale und parakausale Archetypen (inkl. verbotener Künste).',
        bullets: [
          'Mutant: Hornklingen, Augen des Jägers, Chamäleonhaut, Carapax (+4 NRW), Flügel, Adrenalindrüse, Redundante Lunge, Notfallnervensystem (Aberranten aktivieren Mutagene ohne Mutagenkosten bis zu LP×/Sitzung).',
          'Ikone: Mesmer (Sozialer Kampf, Erster Eindruck, Silberzunge), Rampensau (Overtüre, Hype Train, Rip & Tear – geteilte Gruppenpools), Thot (Liebesspiel, E-Thot).',
          'Priester: Konsumieren schwarzen Teer (Vorteilswurf gegen 2 + 3× Teer; Fehlschlag verursacht verstümmelte Mutation) für Wunder (Teerkosten 2–6: Asche, Schwarze Nadel, Unendlichkeit, Rückkehr, Wiedergeburt, Schmerz, Kosmisches Tor) und Rituale.',
          'Hexerei (WIL): Kodiert 4 Glyphen ins Hexenprisma; Zauber kosten 1W6–4W6 WAP (Osteostase, Osteoporose, Raum veröden, Neutrinofeuer, Entropischer Schild, Gravastar).',
          'Arkana (INT): Bindet magische Effekte (Effekt + Natur + Distanz + Stärke + Aktionen + Dauer = BS) in Ressourcen der Mindeststufe BS und verzaubert Gegenstände (max. Bestandteile/3).',
          'Hämophage (Varossymbiont): 4 Familien (Aschetrinker, Na`Thair, Sekh Nuit, Bellatores Sanguinis). Ausfahrbare Klauen (GES/2+2), Fänge, Jägersinne, Hämobolismus. Basistechniken: SBS & SHS (alle 12h 2 Blutpunkte verbraucht); Kräfte: Bluttrinken, Blutschub, Blutschwelle, Bluttaufe.',
          'Alchemie (PSI): Manipuliert Materie über Frequenzen (Analyse, Dekonstruktion, Substitution, Rekonstruktion, Transmutation, Frequente Verbindung).',
        ],
      },
    ],
  },
  {
    id: 'ausruestung',
    title: 'Ausrüstung, Waffen & Cyberware',
    pages: 'S. 150–188',
    subtitle: 'Lebensstile, Rüstungen, Waffentabellen, Inventar, Drogen & 6 Cyberware-Slots',
    sections: [
      {
        id: 'lebensstil-ruestung',
        title: 'Lebensstile, Rüstung, Schilde & Raumanzüge',
        page: 'S. 150–158',
        tags: ['Lebensstil', 'Rüstung', 'Schild', 'Raumanzug', 'Belastung', 'Reparatur'],
        summary:
          'Lebensstile bestimmen monatliche Kosten und Startkapital. Rüstung schützt durch RW-Ist (sinkt um 1, wenn Schaden ≥ Härte). Schilde (SW 0,5–9) ignorieren eine Anzahl Angriffe pro Kampf und laden sich danach wieder auf (Nahkampfwaffen ignorieren Schilde!).',
        table: {
          headers: ['Gegenstand', 'Werte', 'Kosten'],
          rows: [
            ['Leichte Rüstung', 'RW 4 · HAR 2 · BEL 2 · KAP 2', '1.100 ₡'],
            ['Mittlere Rüstung', 'RW 8 · HAR 4 · BEL 4 · KAP 4', '3.375 ₡'],
            ['Schwere Rüstung', 'RW 12 · HAR 6 · BEL 6 · KAP 6', '11.525 ₡'],
            ['Raumanzug', 'RW 6 · HAR 3 · BEL 3 · Lebenserh. 4 (½ Stufe in Std.)', '30.000 ₡'],
            ['Leichter / Mittlerer / Schwerer Schild', 'SW 2 (KAP 1) / SW 4 (KAP 2) / SW 6 (KAP 3)', '1.100 / 3.000 / 6.000 ₡'],
          ],
        },
        bullets: [
          'Lebensstile: Auf der Straße (0 ₡), Squatter (500 ₡), Unterschicht (1.000 ₡), Mittelschicht (2.000 ₡), Oberschicht (10.000 ₡), Luxusleben (100.000 ₡).',
          'Rüstung reparieren: Wurf gegen Härte + ½ Härte Reparaturkits + Härte × 10 Min → repariert 1 + Differenz in RW.',
          'Inventar & Belastung: Jeder Punkt Belastung gibt 1 PEW auf körperliche Aktionen (STR, GES, KON; nicht Fernkampf). Halbe STR darf von BEL abgezogen werden. Gürteltasche = bereit; Rucksack = 2 Aktionen.',
        ],
      },
      {
        id: 'waffentabelle',
        title: 'Waffen-Vokabular & Waffentabellen',
        page: 'S. 159–167',
        tags: ['Waffen', 'Schaden', 'PBW', 'PRÄZ', 'KRIT', 'FM', 'Vibro', 'Aquamater'],
        summary:
          'Alle Fernkampfwaffen (SCH, RK, PBW, FM, PRÄZ, KRIT, NAL, MUN, ZUV, HÄR, MODS) sowie Nahkampf- und Wurfwaffen aus dem GRW.',
        table: {
          headers: ['Waffe', 'SCH', 'RK / PBW / FM', 'PRÄZ / KRIT / MUN / NAL', 'Preis'],
          rows: [
            ['Maschinenpistole', '4', 'RK 2 · PBW +1 · A', 'PRÄZ −3 · KRIT 0 · MUN 4 · NAL 1', '> 250 ₡'],
            ['Leichte Pistole', '6', 'RK 1 · PBW 0 · E', 'PRÄZ 0 · KRIT 0 · MUN 6 · NAL 1', '> 500 ₡'],
            ['Schwere Pistole', '8', 'RK 2 · PBW 3 · E', 'PRÄZ +1 · KRIT +1 · MUN 3 · NAL 1', '> 1.000 ₡'],
            ['Leichtes MG', '6', 'RK 2 · PBW 0 · A', 'PRÄZ −1 · KRIT 0 · MUN 6 · NAL 2', '> 1.200 ₡'],
            ['Maschinengewehr', '8', 'RK 2 · PBW 0 · VA', 'PRÄZ −3 · KRIT 0 · MUN 10 · NAL 3', '> 3.000 ₡'],
            ['Schrotflinte', '10', 'RK 3 · PBW −1 · C', 'PRÄZ −2 · KRIT 1 · MUN 4 · NAL 2', '> 1.200 ₡'],
            ['Scharfschützengewehr', '12', 'RK 3 · PBW −3 · W', 'PRÄZ +3 · KRIT 3 · MUN 3 · NAL 2', '> 5.000 ₡'],
            ['Granatenwerfer', '8', 'RK 2 · PBW −2 · E', 'PRÄZ −1 · KRIT 0 · MUN 6 · NAL 3', '> 2.000 ₡'],
            ['Partikelgewehr', '6', 'RK 0 · FIBO · S', 'PRÄZ +2 · KRIT 0 · MUN 8 · NAL 3', '> 6.000 ₡'],
            ['Gaußgewehr', '12', 'RK 4 · PBW −8 · W', 'PRÄZ −1 · KRIT −3 · MUN 1 · NAL 3', '> 12.000 ₡'],
            ['Plasmawerfer', '4', 'RK 0 · PBW 0 · S (Choke)', 'PRÄZ −2 · KRIT 0 · MUN 6 · NAL 3', '> 2.000 ₡'],
            ['Kleine / Große Klinge', 'GES/2+1 bzw. +6', 'PBW 0 · ignoriert Schilde', 'PRÄZ 0 · KRIT 2 bzw. 4', '> 250 / 1.500 ₡'],
            ['Kleine / Große stumpfe Waffe', 'STR/2+2 bzw. +4', 'PBW 0/3 · Betäubend', 'PRÄZ 2 · KRIT 0', '> 100 / 1.500 ₡'],
          ],
        },
        bullets: [
          'Klingentypen: VIB (Vibro: halbiert Ziel-RW) · AQM (Aquamater: 5–6 auf W6 ignoriert RW komplett, −1 Härte, Sekundäreffekt). Nahkampf/Bögen/Wurfwaffen: GoW im Schadensattribut gibt GlkW-Bonusschadenspool.',
          'Munitionstypen: N Normal · R Radioaktiv · E Explosion (4 m) · B Brand · S Schock (Betäubend) · F Frost · P Panzerbrechend (PBW +3 laut GRW-Text).',
        ],
      },
      {
        id: 'cyberware',
        title: 'Cyberware, Bioware & Exoware',
        page: 'S. 183–188',
        tags: ['Cyberware', 'Bioware', 'Exoware', 'Slots', 'Neurobooster', 'Glashaut'],
        summary:
          '6 Slots: Kopf/Schädel, Nervensystem, Torso, Arme, Beine, Ganzkörper. Gesamtkosten aller Cyberware ≤ Max-LP! Preisformel: (2.000 + Komplexität × 2.000) × Cyberwarekosten. Bioware erlaubt 2 Bioware (oder 1 Cyber + 1 Bio) im selben Slot (+50 % Preis, +10 % Lebenshaltung). Exoware (max. 1×) erlaubt 3 zusätzliche Implantate am Körperteil ohne LP-Kosten.',
        bullets: [
          'Ganzkörper: Glashaut (+6 GoW Heimlichkeit, 42k), Porzellanhaut (+3 GoW Verführen, 42k), Dermale Panzerung (NRW 3, 32k), Verstärkte Knochen (+3 LP, 40k), Blutnaniten (28k), Relativistisches Nanogewebe (84k), Metachondrium (+1 GoW KON, Bioware, 54k), EMP Fasern (42k).',
          'Nervensystem: Co-Prozessor (+1W6 GoW Hacking, 16k), Neurobooster (+4 Bonusaktionen/Kampf, 16k), Berserker (1W6 Runden bei 0 LP, 18k), Matrixfeld (+1 GoW WAH, 16k), Riggerkontrolle (GW Drohnen gratis steuern, 30k), Präkognitiver Prozessor (+3 Auto-Erfolge Ausweichen, 42k), Ballistischer Coprozessor (+3 Auto-Erfolge Fernkampf, 42k).',
          'Schädel, Torso, Arme, Beine: Räumlicher Prozessor (+1 GoW GES), Cyberauge, Memetische Abschirmung (+1 GoW WIL), Sekundäre Lunge, Lungenfilter, Adrenobooster (+1W6 ADR), Carapax, Smart Bioschild, Kinetik-Elektrischer Reaktor, Cyberarm / Cyberschusswaffe / Cybersporn, Geckohände, SYNTH-Fasern (+1 GoW STR), Cyberbein, Hochgeschwindigkeitsgewebe (+4 m Bewegung), Relativistisches Netz.',
        ],
      },
    ],
  },
];
