import type { AttrKey, CyberSlot, KnowledgeCategory, SkillCategory, WoundZone } from '../types';

export interface AttrMeta {
  key: AttrKey;
  name: string;
  derivedKey: string;
  derivedName: string;
  physical: boolean;
}

export const ATTRS: AttrMeta[] = [
  { key: 'STR', name: 'Stärke', derivedKey: 'KRA', derivedName: 'Kraftakt', physical: true },
  { key: 'GES', name: 'Geschicklichkeit', derivedKey: 'KÖR', derivedName: 'Körperbeherrschung', physical: true },
  { key: 'KON', name: 'Konstitution', derivedKey: 'AUS', derivedName: 'Ausdauer', physical: true },
  { key: 'WAH', name: 'Wahrnehmung', derivedKey: 'AUF', derivedName: 'Aufmerksamkeit', physical: false },
  { key: 'INT', name: 'Intelligenz', derivedKey: 'LOG', derivedName: 'Logik', physical: false },
  { key: 'WIL', name: 'Willenskraft', derivedKey: 'BEH', derivedName: 'Beherrschung', physical: false },
  { key: 'GLK', name: 'Glück', derivedKey: 'VOR', derivedName: 'Vorteil', physical: false },
  { key: 'CHA', name: 'Charisma', derivedKey: 'EMP', derivedName: 'Empathie', physical: false },
  { key: 'PSI', name: 'Psionik', derivedKey: 'MAC', derivedName: 'Macht', physical: false },
];

export const ATTR_BY_KEY: Record<AttrKey, AttrMeta> = Object.fromEntries(
  ATTRS.map((a) => [a.key, a]),
) as Record<AttrKey, AttrMeta>;

export const ATTR_KEYS: AttrKey[] = ATTRS.map((a) => a.key);

export interface SkillDef {
  name: string;
  category: SkillCategory;
  attr: AttrKey;
  ranged?: boolean;
  spec?: string;
}

/** Aktionsfertigkeiten laut GRW S. 94–98 */
export const DEFAULT_SKILLS: SkillDef[] = [
  // Kampf
  { name: 'Handfeuerwaffen', category: 'Kampf', attr: 'WAH', ranged: true },
  { name: 'Schnellfeuerwaffen', category: 'Kampf', attr: 'WAH', ranged: true },
  { name: 'Langfeuerwaffen', category: 'Kampf', attr: 'WAH', ranged: true },
  { name: 'Kurzfeuerwaffen', category: 'Kampf', attr: 'WAH', ranged: true },
  { name: 'Schwere Waffen', category: 'Kampf', attr: 'WAH', ranged: true },
  { name: 'Projektilwaffen', category: 'Kampf', attr: 'WAH', ranged: true },
  { name: 'Wurfwaffen', category: 'Kampf', attr: 'GES', ranged: true },
  { name: 'Nahkampfwaffen', category: 'Kampf', attr: 'GES' },
  { name: 'Handgemenge', category: 'Kampf', attr: 'GES' },
  // Körperlich
  { name: 'Athletik', category: 'Körperlich', attr: 'GES' },
  { name: 'Fingerfertigkeit', category: 'Körperlich', attr: 'GES' },
  { name: 'Heimlichkeit', category: 'Körperlich', attr: 'GES' },
  { name: 'Navigation', category: 'Körperlich', attr: 'WAH' },
  { name: 'Reiten', category: 'Körperlich', attr: 'GES' },
  { name: 'Schwimmen', category: 'Körperlich', attr: 'STR' },
  { name: 'Überleben', category: 'Körperlich', attr: 'KON' },
  { name: 'Verkleiden', category: 'Körperlich', attr: 'WAH' },
  // Mobilität
  { name: 'Bodenfahrzeuge', category: 'Mobilität', attr: 'WAH' },
  { name: 'Flugzeuge', category: 'Mobilität', attr: 'WAH' },
  { name: 'Raumfahrzeuge', category: 'Mobilität', attr: 'WAH' },
  { name: 'Schifffahrt', category: 'Mobilität', attr: 'WAH' },
  // Medizin
  { name: 'Psychotherapie', category: 'Medizin', attr: 'CHA' },
  { name: 'Kybernetik', category: 'Medizin', attr: 'GES' },
  { name: 'Medizin', category: 'Medizin', attr: 'GES' },
  // Technik
  { name: 'Computer', category: 'Technik', attr: 'INT' },
  { name: 'Elektronische Kriegsführung', category: 'Technik', attr: 'INT' },
  { name: 'Elektronik', category: 'Technik', attr: 'GES' },
  { name: 'Mechanik', category: 'Technik', attr: 'GES' },
  { name: 'Sprengstoffe', category: 'Technik', attr: 'GES' },
  { name: 'Kunst', category: 'Technik', attr: 'WAH' },
  { name: 'Kochen', category: 'Technik', attr: 'WAH' },
  { name: 'Waffenbau', category: 'Technik', attr: 'GES' },
  // Sozial
  { name: 'Einschüchtern', category: 'Sozial', attr: 'WIL' },
  { name: 'Gebräuche', category: 'Sozial', attr: 'CHA' },
  { name: 'Schauspielern', category: 'Sozial', attr: 'CHA' },
  { name: 'Überzeugen', category: 'Sozial', attr: 'CHA' },
  { name: 'Darbietung', category: 'Sozial', attr: 'CHA' },
  { name: 'Tierpflege', category: 'Sozial', attr: 'CHA' },
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  'Kampf',
  'Körperlich',
  'Mobilität',
  'Medizin',
  'Technik',
  'Sozial',
  'Psionik',
  'Eigene',
];

export const KNOWLEDGE_CATEGORIES: KnowledgeCategory[] = ['Akademisch', 'Beruf', 'Hobby', 'Straße', 'Sprache'];

export const KNOWLEDGE_PRESETS: { name: string; category: KnowledgeCategory }[] = [
  { name: 'Biotechnologie', category: 'Akademisch' },
  { name: 'Chemie', category: 'Akademisch' },
  { name: 'Materialwissenschaften', category: 'Akademisch' },
  { name: 'Physik', category: 'Akademisch' },
  { name: 'Geschichte', category: 'Akademisch' },
  { name: 'Astraltheorie', category: 'Akademisch' },
  { name: 'Straßenwissen', category: 'Straße' },
  { name: 'Syndikate', category: 'Straße' },
  { name: 'Schwarzmarkt', category: 'Straße' },
  { name: 'Raumhafenlogistik', category: 'Beruf' },
  { name: 'Konzernrecht', category: 'Beruf' },
  { name: 'Glücksspiel', category: 'Hobby' },
  { name: 'Musik', category: 'Hobby' },
];

export interface StatusDef {
  key: string;
  name: string;
  rule: string;
  tone: 'red' | 'amber' | 'cyan';
}

export const STATUSES: StatusDef[] = [
  { key: 'angeschlagen', name: 'Angeschlagen', rule: 'Angriffe gegen Ziel +3 GlkW', tone: 'amber' },
  { key: 'betaeubt', name: 'Betäubt', rule: 'Keine Handlung, VW = 1', tone: 'red' },
  { key: 'brennend', name: 'Brennend', rule: '3 Schaden / Runde', tone: 'red' },
  { key: 'blutend', name: 'Blutend', rule: '−1 verfügbarer Todeswurf', tone: 'red' },
  { key: 'frost', name: 'Frost', rule: 'Bewegung /2, +3 PEW KÖR & GES', tone: 'cyan' },
  { key: 'uebelkeit', name: 'Übelkeit', rule: '+4 PEW auf alle Aktionen', tone: 'amber' },
  { key: 'geschwaecht', name: 'Geschwächt', rule: '+2 eingehender Schaden', tone: 'amber' },
  { key: 'verlangsamt', name: 'Verlangsamt', rule: '+1 Aktionskosten, Bewegung /2', tone: 'cyan' },
  { key: 'verflucht', name: 'Verflucht', rule: 'PEW auf Psionik & Glück', tone: 'red' },
  { key: 'veraetzt', name: 'Verätzt', rule: 'Härte −1, 1W6 Schaden / Runde', tone: 'red' },
  { key: 'niedergeschlagen', name: 'Schwebend / Niedergeschl.', rule: 'VW /2, keine Reaktion', tone: 'amber' },
  { key: 'schock', name: 'Schock', rule: 'PEW auf körperliche Aktionen', tone: 'amber' },
  { key: 'furcht', name: 'Furcht', rule: '+6 PEW gegen Quelle, 2× WAP', tone: 'red' },
  { key: 'verkrueppelt', name: 'Verkrüppelt', rule: 'Unheilbare Wunde', tone: 'red' },
];

export interface WoundDef {
  key: WoundZone;
  name: string;
  /** PEW pro Wunde, kumulativ */
  pewPer: number;
  attrs: AttrKey[];
  rule: string;
}

/** GRW S. 16 – Wundzonen */
export const WOUNDS: WoundDef[] = [
  {
    key: 'Kopf',
    name: 'Kopfwunde',
    pewPer: 4,
    attrs: ['WIL', 'INT', 'WAH', 'PSI'],
    rule: 'Kumulativ 4 PEW auf WIL-, INT-, WAH- & PSI-Würfe; Anstrengung dieser Attribute +1',
  },
  {
    key: 'Brust',
    name: 'Brustwunde',
    pewPer: 2,
    attrs: ['KON'],
    rule: 'Max LP −1 & 2 PEW auf KON-Würfe (kumulativ); Anstrengung KON +1',
  },
  {
    key: 'Arm',
    name: 'Armwunde',
    pewPer: 2,
    attrs: ['GES'],
    rule: 'Kumulativ 2 PEW auf GES-Würfe; Anstrengung GES +1',
  },
  {
    key: 'Bein',
    name: 'Beinwunde',
    pewPer: 2,
    attrs: ['STR'],
    rule: 'Kumulativ 2 PEW auf STR-Würfe; Anstrengung STR +1',
  },
  {
    key: 'Nerven',
    name: 'Nervenschäden',
    pewPer: 2,
    attrs: ['CHA'],
    rule: 'Kumulativ 2 PEW auf CHA-Würfe; Anstrengung CHA +1',
  },
  {
    key: 'Intern',
    name: 'Interne Schäden',
    pewPer: 0,
    attrs: [],
    rule: 'Eingehender Schaden +1 (kumulativ); alle Anstrengungen +1',
  },
];

export const CYBER_SLOTS: { key: CyberSlot; name: string }[] = [
  { key: 'Kopf', name: 'Kopf / Schädel' },
  { key: 'Nerven', name: 'Nervensystem' },
  { key: 'Torso', name: 'Torso' },
  { key: 'Arme', name: 'Arme' },
  { key: 'Beine', name: 'Beine' },
  { key: 'Ganzkörper', name: 'Ganzkörper' },
];

export const WAP_GRADES = [
  { grade: 1, from: 1, to: 6, mod: -3 },
  { grade: 2, from: 7, to: 12, mod: -2 },
  { grade: 3, from: 13, to: 18, mod: -1 },
  { grade: 4, from: 19, to: 24, mod: 1 },
  { grade: 5, from: 25, to: 30, mod: 2 },
  { grade: 6, from: 31, to: 36, mod: 3 },
];

export const DEFAULT_FACTIONS: { name: string; type: 'Haus' | 'Syndikat' }[] = [
  { name: 'Haus des Winters', type: 'Haus' },
  { name: 'Haus der Drei Sonnen', type: 'Haus' },
  { name: 'Haus der Wölfe', type: 'Haus' },
  { name: 'Haus des Regens', type: 'Haus' },
  { name: 'Haus der Stürme', type: 'Haus' },
  { name: 'Teufel der Leere', type: 'Syndikat' },
  { name: 'Der Blutstrom', type: 'Syndikat' },
  { name: 'Die Handelsliga', type: 'Syndikat' },
  { name: 'Die Familie', type: 'Syndikat' },
  { name: 'Vanars Haie', type: 'Syndikat' },
  { name: 'Schattenjäger', type: 'Syndikat' },
];

/** GRW S. 70–71 – Die 6 Fragen */
export const CHARACTER_QUESTIONS = [
  'Wie wurde der Charakter zum Abenteurer?',
  'Was treibt den Charakter an?',
  'Wovor hat der Charakter Angst? Was sind seine Geheimnisse?',
  'Wie verhält sich der Charakter normalerweise?',
  'Warum ist der Charakter in der Gruppe?',
  'Was denkt der Charakter über die Welt?',
];

export const RESOURCE_PRESETS = ['Teer', 'Blutpunkte', 'SBS', 'SHS', 'Mutagene', 'KABA-Kristalle', 'Forschungspunkte (FP)'];

export const MULTI_ACTIONS = [
  { label: 'Normal', pew: 0 },
  { label: '+1 Aktion', pew: 2 },
  { label: '+2 Aktionen', pew: 4 },
  { label: '+3 Aktionen', pew: 8 },
];
