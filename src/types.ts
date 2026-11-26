export type AttrKey = 'STR' | 'GES' | 'KON' | 'WAH' | 'INT' | 'WIL' | 'GLK' | 'CHA' | 'PSI';

export interface DiceMods {
  gow: number;
  glkw: number;
  pew: number;
}

export interface Attribute extends DiceMods {
  value: number;
  spentEffort: number;
}

export interface DerivedMods {
  /** null = automatisch (Attribut-GoW × 2) */
  gowOverride: number | null;
  glkw: number;
  pew: number;
}

export type SkillCategory =
  | 'Kampf'
  | 'Körperlich'
  | 'Mobilität'
  | 'Medizin'
  | 'Technik'
  | 'Sozial'
  | 'Psionik'
  | 'Eigene';

export interface Skill extends DiceMods {
  id: string;
  name: string;
  category: SkillCategory;
  attr: AttrKey;
  level: number;
  spec: string;
  custom: boolean;
  /** Fernkampf → keine Rüstungsbelastung */
  ranged: boolean;
}

export type KnowledgeCategory = 'Akademisch' | 'Beruf' | 'Hobby' | 'Straße' | 'Sprache';

export interface KnowledgeSkill extends DiceMods {
  id: string;
  name: string;
  category: KnowledgeCategory;
  level: number;
  /** true → Pool = INT + Stufe, false → freier Pool (nur Stufe) */
  linkInt: boolean;
  notes: string;
}

export interface Weapon extends DiceMods {
  id: string;
  name: string;
  /** ID der verknüpften Fertigkeit ('' = nur Attribut) */
  skillId: string;
  /** Fallback-Attribut, falls keine Fertigkeit verknüpft */
  attr: AttrKey;
  melee: boolean;
  range: string;
  fm: string;
  damage: string;
  rk: number;
  pbw: number;
  praez: number;
  krit: number;
  nal: number;
  zuv: number;
  haer: number;
  mods: string;
  ammoType: string;
  properties: string;
  ammoMax: number;
  ammoCurrent: number;
  notes: string;
}

export interface Technique {
  id: string;
  name: string;
  source: string;
  cost: string;
  prerequisite: string;
  usesCurrent: number;
  usesMax: number;
  text: string;
}

export interface Tracker {
  cur: number;
  max: number;
}

export type CompanionType = 'Begleiter' | 'Drohne' | 'Fahrzeug' | 'Raumschiff';

export interface Companion {
  id: string;
  name: string;
  type: CompanionType;
  hull: Tracker;
  armor: Tracker;
  hardness: number;
  shields: Tracker;
  energy: Tracker;
  fuel: Tracker;
  cortex: string;
  modules: string;
  weapons: string;
  notes: string;
}

export type CyberSlot = 'Kopf' | 'Nerven' | 'Torso' | 'Arme' | 'Beine' | 'Ganzkörper';

export interface CyberEntry {
  id: string;
  name: string;
  kind: 'Cyberware' | 'Bioware' | 'Exoware';
  cost: number;
  capacity: string;
  effect: string;
}

export interface Cyberdeck {
  name: string;
  VS: number;
  FW: number;
  SI: number;
  HW: number;
  CPU: number;
  RAM: number;
  notes: string;
}

export interface Resource {
  id: string;
  name: string;
  cur: number;
  max: number;
}

export type ItemLocation = 'bereit' | 'rucksack' | 'lager';

export interface Item {
  id: string;
  name: string;
  location: ItemLocation;
  qty: number;
  weight: number;
  slots: number;
  consumable: boolean;
  notes: string;
}

export interface Armor {
  name: string;
  nrw: number;
  rwIst: number;
  rwSoll: number;
  haerte: number;
  bel: number;
  kap: number;
  mods: string;
  lifeSupportCur: number;
  lifeSupportMax: number;
  shieldName: string;
  shieldRecharge: number;
}

export interface Trait {
  id: string;
  name: string;
  kind: 'Vorteil' | 'Nachteil';
  text: string;
  usesCur: number;
  usesMax: number;
}

export type WoundZone = 'Kopf' | 'Brust' | 'Arm' | 'Bein' | 'Nerven' | 'Intern';

export interface WoundState {
  count: number;
  crippled: boolean;
}

export interface Faction {
  id: string;
  name: string;
  type: 'Haus' | 'Syndikat' | 'Sonstige';
  value: number;
}

export interface Vitals {
  lp: Tracker;
  tempLp: number;
  deathSuccess: number;
  deathFail: number;
  shields: Tracker;
  wap: number;
  ini: number;
  vw: number;
  reactions: Tracker;
  pw: number;
  gw: number;
  luckPool: Tracker;
  adr: number;
  erp: number;
  epTotal: number;
  epSpent: number;
}

export interface Character {
  id: string;
  schema: 1;
  name: string;
  player: string;
  species: string;
  archetype: string;
  concept: string;
  psiEnabled: boolean;
  attributes: Record<AttrKey, Attribute>;
  derived: Record<AttrKey, DerivedMods>;
  vitals: Vitals;
  statuses: Record<string, boolean>;
  skills: Skill[];
  knowledge: KnowledgeSkill[];
  weapons: Weapon[];
  techniques: Technique[];
  companions: Companion[];
  cyberware: Record<CyberSlot, CyberEntry[]>;
  cyberdeck: Cyberdeck;
  resources: Resource[];
  credits: number;
  lifestyle: string;
  monthlyCost: number;
  armor: Armor;
  items: Item[];
  traits: Trait[];
  wounds: Record<WoundZone, WoundState>;
  fame: number;
  factions: Faction[];
  notes: {
    campaign: string;
    contacts: string;
    goals: string;
    questions: string[];
  };
  createdAt: number;
  updatedAt: number;
}

export type ProbeRef =
  | { type: 'attr'; key: AttrKey }
  | { type: 'derived'; key: AttrKey }
  | { type: 'skill'; id: string }
  | { type: 'knowledge'; id: string }
  | { type: 'weapon'; id: string };
