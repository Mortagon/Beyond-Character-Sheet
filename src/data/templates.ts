import type { AttrKey, Character } from '../types';
import {
  applyAttributeDefaults,
  createBlankCharacter,
  newCompanion,
  newItem,
  newKnowledge,
  techniqueFromPreset,
  traitFromPreset,
  uid,
  weaponFromPreset,
} from '../logic/character';
import { TECHNIQUE_PRESETS, TRAIT_PRESETS, WEAPON_PRESETS } from './presets';

export interface TemplateDef {
  key: string;
  name: string;
  description: string;
  build: () => Character;
}

function setAttrs(c: Character, values: Partial<Record<AttrKey, number>>, gow: Partial<Record<AttrKey, number>> = {}) {
  for (const [k, v] of Object.entries(values)) c.attributes[k as AttrKey].value = v!;
  for (const [k, v] of Object.entries(gow)) c.attributes[k as AttrKey].gow = v!;
}

function setSkills(c: Character, levels: Record<string, number | [number, number]>) {
  for (const [name, val] of Object.entries(levels)) {
    const s = c.skills.find((x) => x.name === name);
    if (!s) continue;
    if (Array.isArray(val)) {
      s.level = val[0];
      s.gow = val[1];
    } else s.level = val;
  }
}

const weapon = (c: Character, name: string) => {
  const p = WEAPON_PRESETS.find((w) => w.name === name)!;
  return weaponFromPreset(c, p);
};
const technique = (name: string) => techniqueFromPreset(TECHNIQUE_PRESETS.find((t) => t.name === name)!);
const trait = (name: string) => traitFromPreset(TRAIT_PRESETS.find((t) => t.name === name)!);

function soldier(): Character {
  const c = createBlankCharacter('Söldnerin Vex');
  c.archetype = 'Soldat';
  c.species = 'Mensch';
  c.concept = 'Ehemalige Konzernsicherheit, jetzt Söldnerin auf eigene Rechnung';
  setAttrs(c, { STR: 4, GES: 3, KON: 4, WAH: 4, INT: 2, WIL: 3, GLK: 2, CHA: 2 }, { KON: 1, WAH: 1 });
  setSkills(c, {
    Schnellfeuerwaffen: [3, 1],
    Kurzfeuerwaffen: 3,
    Handfeuerwaffen: 2,
    'Schwere Waffen': 1,
    Nahkampfwaffen: 2,
    Handgemenge: 2,
    Athletik: 2,
    Überleben: 1,
    Einschüchtern: 2,
    Medizin: 1,
    Sprengstoffe: 1,
  });
  applyAttributeDefaults(c);
  c.vitals.shields = { cur: 4, max: 4 };
  c.vitals.ini = 4;
  c.vitals.vw = 4;
  c.vitals.reactions = { cur: 2, max: 2 };
  c.vitals.pw = 4;
  c.vitals.gw = 2;
  c.vitals.tempLp = 2;
  c.weapons = [weapon(c, 'Maschinengewehr'), weapon(c, 'Schrotflinte'), weapon(c, 'Kleine Klingenwaffe')];
  c.armor = {
    ...c.armor,
    name: 'Schwere Gefechtsrüstung',
    rwIst: 6,
    rwSoll: 6,
    haerte: 3,
    bel: 3,
    kap: 2,
    mods: 'Magazintaschen',
    shieldName: 'Leichter Schild',
    shieldRecharge: 2,
  };
  c.traits = [trait('Zähigkeit'), trait('Mutig'), trait('Vertrautes Terrain'), trait('Blutgier')];
  c.techniques = [technique('Sperrfeuer')];
  c.items = [
    newItem({ name: 'Ersatzmagazin Sturmgewehr', qty: 3, weight: 0.5, consumable: true }),
    newItem({ name: 'Schrotpatronen (Box)', qty: 2, weight: 0.5, consumable: true }),
    newItem({ name: 'Medpack', qty: 2, weight: 0.3, consumable: true }),
    newItem({ name: 'Splittergranate', qty: 2, weight: 0.4, consumable: true }),
    newItem({ name: 'Raumanzug (gefaltet)', location: 'rucksack', weight: 3 }),
    newItem({ name: 'Rationen', location: 'rucksack', qty: 5, weight: 0.5, consumable: true }),
  ];
  c.credits = 1200;
  c.lifestyle = 'Einfach';
  c.monthlyCost = 500;
  c.knowledge = [newKnowledge({ name: 'Militärtaktik', category: 'Beruf', level: 2 })];
  c.factions.find((f) => f.name === 'Der Blutstrom')!.value = -2;
  c.factions.find((f) => f.name === 'Vanars Haie')!.value = 2;
  return c;
}

function techie(): Character {
  const c = createBlankCharacter('Rigger „Spule“');
  c.archetype = 'Techniker';
  c.species = 'Mensch';
  c.concept = 'Drohnen-Rigger und Schrauber mit Neuro-Interface';
  setAttrs(c, { STR: 2, GES: 4, KON: 3, WAH: 3, INT: 5, WIL: 3, GLK: 2, CHA: 2 }, { INT: 1 });
  setSkills(c, {
    Computer: [3, 1],
    Elektronik: 3,
    Mechanik: 3,
    'Elektronische Kriegsführung': 2,
    Kybernetik: 2,
    Bodenfahrzeuge: 2,
    Flugzeuge: 2,
    Handfeuerwaffen: 2,
    Waffenbau: 1,
    Heimlichkeit: 1,
  });
  applyAttributeDefaults(c);
  c.vitals.shields = { cur: 3, max: 3 };
  c.vitals.ini = 3;
  c.vitals.vw = 3;
  c.vitals.pw = 3;
  c.vitals.gw = 3;
  c.weapons = [weapon(c, 'Schwere Pistole')];
  c.armor = {
    ...c.armor,
    name: 'Leichte Rüstung mit Umweltversiegelung',
    rwIst: 3,
    rwSoll: 3,
    haerte: 1,
    bel: 1,
    kap: 2,
    lifeSupportCur: 8,
    lifeSupportMax: 8,
    shieldName: 'Mittlerer Schild',
    shieldRecharge: 2,
  };
  c.companions = [
    newCompanion({
      name: 'Späher „Elster“',
      type: 'Drohne',
      hull: { cur: 6, max: 6 },
      armor: { cur: 1, max: 1 },
      hardness: 1,
      energy: { cur: 8, max: 8 },
      fuel: { cur: 6, max: 6 },
      cortex: 'Pilot 2 · Sensoren 3 · Ausweichen 2',
      modules: 'Thermalkamera, Funkrelais, Lautlos-Rotoren',
      weapons: '—',
      notes: 'Aufklärungsdrohne, 1 km Reichweite',
    }),
    newCompanion({
      name: 'Kampfdrohne „Hornisse“',
      type: 'Drohne',
      hull: { cur: 10, max: 10 },
      armor: { cur: 3, max: 3 },
      hardness: 2,
      shields: { cur: 2, max: 2 },
      energy: { cur: 6, max: 6 },
      fuel: { cur: 4, max: 4 },
      cortex: 'Pilot 2 · Zielerfassung 3 · Ausweichen 1',
      modules: 'Smartlink, Panzerplatten',
      weapons: 'Leichtes MG (Schaden 6, Salve, 40 Schuss)',
    }),
  ];
  c.cyberware.Kopf = [
    { id: uid('cy'), name: 'Datenbuchse', kind: 'Cyberware', cost: 1, capacity: '—', effect: 'Direktverbindung zu Drohnen & Decks' },
  ];
  c.cyberware.Nerven = [
    { id: uid('cy'), name: 'Rigger-Interface', kind: 'Cyberware', cost: 2, capacity: '2 Drohnen', effect: 'Steuerung per Gedanken, +1 GlkW auf Drohnenproben' },
  ];
  c.cyberware.Arme = [
    { id: uid('cy'), name: 'Werkzeughand', kind: 'Cyberware', cost: 1, capacity: '—', effect: 'Integriertes Mechanikerset' },
  ];
  c.cyberdeck = { name: 'Fuchi Streetdeck', VS: 2, FW: 3, SI: 2, HW: 2, CPU: 3, RAM: 4, notes: '' };
  c.traits = [trait('Technisches Improvisationstalent'), trait('Analytischer Geist'), trait('Neugierig')];
  c.knowledge = [
    newKnowledge({ name: 'Drohnenbau', category: 'Beruf', level: 2 }),
    newKnowledge({ name: 'Materialwissenschaften', category: 'Akademisch', level: 1 }),
  ];
  c.items = [
    newItem({ name: 'Mechanikerset', weight: 4 }),
    newItem({ name: 'Hackingwerkzeug', weight: 1 }),
    newItem({ name: 'Ersatzteile Drohne', location: 'rucksack', qty: 4, weight: 0.5, consumable: true }),
    newItem({ name: 'Ersatzmagazin Pistole', qty: 2, weight: 0.2, consumable: true }),
  ];
  c.credits = 900;
  c.monthlyCost = 400;
  return c;
}

function rogue(): Character {
  const c = createBlankCharacter('Illdari „Nachtfalter“');
  c.archetype = 'Gauner / Psioniker';
  c.species = 'Illdari';
  c.concept = 'Charmante Diebin mit psionischem Gespür';
  c.psiEnabled = true;
  setAttrs(c, { STR: 2, GES: 4, KON: 2, WAH: 3, INT: 3, WIL: 3, GLK: 4, CHA: 4, PSI: 3 }, { GES: 1, PSI: 1 });
  setSkills(c, {
    Heimlichkeit: [3, 1],
    Fingerfertigkeit: 3,
    Überzeugen: 3,
    Schauspielern: 2,
    Gebräuche: 2,
    Athletik: 2,
    Handfeuerwaffen: 2,
    Nahkampfwaffen: 1,
    Wurfwaffen: 2,
    Computer: 1,
  });
  applyAttributeDefaults(c);
  c.vitals.luckPool = { cur: 6, max: 6 };
  c.vitals.shields = { cur: 2, max: 2 };
  c.vitals.ini = 4;
  c.vitals.vw = 4;
  c.vitals.reactions = { cur: 2, max: 2 };
  c.vitals.gw = 4;
  c.derived.GLK.glkw = 1;
  c.weapons = [weapon(c, 'Schwere Pistole'), weapon(c, 'Wurfmesser / Kunai'), weapon(c, 'Vibroklinge')];
  c.armor = { ...c.armor, name: 'Leichte Rüstung', rwIst: 2, rwSoll: 2, haerte: 1, bel: 0, kap: 1, shieldName: 'Leichter Schild', shieldRecharge: 1 };
  c.techniques = [
    technique('Freund'),
    technique('Telepathie'),
    technique('Barriere'),
  ];
  c.traits = [trait('Glück'), trait('Katzenhaft'), trait('Psionisches Leuchtfeuer')];
  c.resources = [{ id: uid('rs'), name: 'Teer', cur: 2, max: 4 }];
  c.knowledge = [
    newKnowledge({ name: 'Straßenwissen', category: 'Straße', level: 2 }),
    newKnowledge({ name: 'Illdari', category: 'Sprache', level: 1 }),
    newKnowledge({ name: 'Glücksspiel', category: 'Hobby', level: 1 }),
  ];
  c.items = [
    newItem({ name: 'Einbruchswerkzeug', weight: 0.5 }),
    newItem({ name: 'Psionischer Fokus', weight: 0.2 }),
    newItem({ name: 'Falsche ID-Chips', qty: 2, weight: 0 }),
    newItem({ name: 'Edle Garderobe', location: 'lager', weight: 2 }),
  ];
  c.credits = 1500;
  c.lifestyle = 'Gehoben';
  c.monthlyCost = 800;
  c.factions.find((f) => f.name === 'Schattenjäger')!.value = 2;
  c.factions.find((f) => f.name === 'Haus der Drei Sonnen')!.value = -1;
  return c;
}

export const TEMPLATES: TemplateDef[] = [
  {
    key: 'blank',
    name: 'Leerer Charakterbogen',
    description: 'Alle Werte sauber initialisiert, alle Standardfertigkeiten auf Stufe 0.',
    build: () => {
      const c = createBlankCharacter();
      applyAttributeDefaults(c);
      return c;
    },
  },
  {
    key: 'soldier',
    name: 'Soldat / Söldner',
    description: 'Mensch, robuste Kampfwerte, Sturmgewehr, Schrotflinte & schwere Rüstung.',
    build: soldier,
  },
  {
    key: 'techie',
    name: 'Techniker / Rigger',
    description: 'Aufklärungs- und Kampfdrohne, Cyberware, Cyberdeck & Mechanik-Fokus.',
    build: techie,
  },
  {
    key: 'rogue',
    name: 'Gauner / Illdari-Psioniker',
    description: 'Psionik-Attribut aktiv, Techniken, großer Glückspool & Heimlichkeit.',
    build: rogue,
  },
];
