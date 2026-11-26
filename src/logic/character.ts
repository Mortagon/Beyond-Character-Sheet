import type {
  AttrKey,
  Attribute,
  Character,
  Companion,
  CyberSlot,
  DerivedMods,
  Item,
  KnowledgeSkill,
  Skill,
  Technique,
  Trait,
  Weapon,
  WoundZone,
} from '../types';
import { ATTR_KEYS, CHARACTER_QUESTIONS, DEFAULT_FACTIONS, DEFAULT_SKILLS, STATUSES } from '../data/rules';
import type { TechniquePreset, TraitPreset, WeaponPreset } from '../data/presets';

let counter = 0;
/** Deterministische, eindeutige IDs (bewusst ohne Zufallsgenerator) */
export function uid(prefix = 'id'): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`;
}

export const clampInt = (v: number, min = -Infinity, max = Infinity): number => {
  const n = Number.isFinite(v) ? Math.trunc(v) : 0;
  return Math.min(max, Math.max(min, n));
};

const newAttr = (value = 1): Attribute => ({ value, spentEffort: 0, gow: 0, glkw: 0, pew: 0 });
const newDerived = (): DerivedMods => ({ gowOverride: null, glkw: 0, pew: 0 });

export function defaultSkills(): Skill[] {
  return DEFAULT_SKILLS.map((d) => ({
    id: uid('sk'),
    name: d.name,
    category: d.category,
    attr: d.attr,
    level: 0,
    spec: d.spec ?? '',
    custom: false,
    ranged: !!d.ranged,
    gow: 0,
    glkw: 0,
    pew: 0,
  }));
}

export function newKnowledge(partial: Partial<KnowledgeSkill> = {}): KnowledgeSkill {
  return {
    id: uid('kn'),
    name: 'Neues Wissen',
    category: 'Akademisch',
    level: 1,
    linkInt: true,
    notes: '',
    gow: 0,
    glkw: 0,
    pew: 0,
    ...partial,
  };
}

export function newWeapon(partial: Partial<Weapon> = {}): Weapon {
  return {
    id: uid('wp'),
    name: 'Neue Waffe',
    skillId: '',
    attr: 'WAH',
    melee: false,
    range: '',
    fm: 'Einzelschuss',
    damage: '',
    rk: 0,
    pbw: 0,
    praez: 0,
    krit: 0,
    nal: 1,
    zuv: 4,
    haer: 0,
    mods: '',
    ammoType: 'N',
    properties: '',
    ammoMax: 0,
    ammoCurrent: 0,
    notes: '',
    gow: 0,
    glkw: 0,
    pew: 0,
    ...partial,
  };
}

export function weaponFromPreset(c: Character, p: WeaponPreset): Weapon {
  const { skillName, ...rest } = p;
  const skill = c.skills.find((s) => s.name === skillName);
  return newWeapon({ ...rest, skillId: skill?.id ?? '', ammoCurrent: p.ammoMax });
}

export function newTechnique(partial: Partial<Technique> = {}): Technique {
  return {
    id: uid('tq'),
    name: 'Neue Technik',
    source: '',
    cost: '',
    prerequisite: '',
    usesCurrent: 0,
    usesMax: 0,
    text: '',
    ...partial,
  };
}

export const techniqueFromPreset = (p: TechniquePreset): Technique => newTechnique({ ...p, usesCurrent: p.usesMax });

export function newTrait(partial: Partial<Trait> = {}): Trait {
  return { id: uid('tr'), name: 'Neuer Eintrag', kind: 'Vorteil', text: '', usesCur: 0, usesMax: 0, ...partial };
}

export const traitFromPreset = (p: TraitPreset): Trait => newTrait({ ...p, usesCur: p.usesMax });

export function newCompanion(partial: Partial<Companion> = {}): Companion {
  return {
    id: uid('cp'),
    name: 'Neuer Begleiter',
    type: 'Drohne',
    hull: { cur: 10, max: 10 },
    armor: { cur: 0, max: 0 },
    hardness: 0,
    shields: { cur: 0, max: 0 },
    energy: { cur: 0, max: 0 },
    fuel: { cur: 0, max: 0 },
    cortex: '',
    modules: '',
    weapons: '',
    notes: '',
    ...partial,
  };
}

export function newItem(partial: Partial<Item> = {}): Item {
  return {
    id: uid('it'),
    name: 'Neuer Gegenstand',
    location: 'bereit',
    qty: 1,
    weight: 0,
    slots: 1,
    consumable: false,
    notes: '',
    ...partial,
  };
}

const CYBER_SLOT_KEYS: CyberSlot[] = ['Kopf', 'Nerven', 'Torso', 'Arme', 'Beine', 'Ganzkörper'];
const WOUND_KEYS: WoundZone[] = ['Kopf', 'Brust', 'Arm', 'Bein', 'Nerven', 'Intern'];

export function createBlankCharacter(name = 'Neuer Charakter'): Character {
  const now = Date.now();
  const attributes = Object.fromEntries(ATTR_KEYS.map((k) => [k, newAttr(k === 'PSI' ? 0 : 1)])) as Record<
    AttrKey,
    Attribute
  >;
  const derived = Object.fromEntries(ATTR_KEYS.map((k) => [k, newDerived()])) as Record<AttrKey, DerivedMods>;
  return {
    id: uid('ch'),
    schema: 1,
    name,
    player: '',
    species: 'Mensch',
    archetype: '',
    concept: '',
    psiEnabled: false,
    attributes,
    derived,
    vitals: {
      lp: { cur: 2, max: 2 },
      tempLp: 0,
      deathSuccess: 0,
      deathFail: 0,
      shields: { cur: 0, max: 0 },
      wap: 0,
      ini: 1,
      vw: 1,
      reactions: { cur: 1, max: 1 },
      pw: 1,
      gw: 1,
      luckPool: { cur: 1, max: 1 },
      adr: 0,
      erp: 0,
      epTotal: 0,
      epSpent: 0,
    },
    statuses: Object.fromEntries(STATUSES.map((s) => [s.key, false])),
    skills: defaultSkills(),
    knowledge: [],
    weapons: [],
    techniques: [],
    companions: [],
    cyberware: Object.fromEntries(CYBER_SLOT_KEYS.map((k) => [k, []])) as unknown as Character['cyberware'],
    cyberdeck: { name: '', VS: 0, FW: 0, SI: 0, HW: 0, CPU: 0, RAM: 0, notes: '' },
    resources: [],
    credits: 0,
    lifestyle: 'Einfach',
    monthlyCost: 0,
    armor: {
      name: '',
      nrw: 0,
      rwIst: 0,
      rwSoll: 0,
      haerte: 0,
      bel: 0,
      kap: 0,
      mods: '',
      lifeSupportCur: 0,
      lifeSupportMax: 0,
      shieldName: '',
      shieldRecharge: 0,
    },
    items: [],
    traits: [],
    wounds: Object.fromEntries(WOUND_KEYS.map((k) => [k, { count: 0, crippled: false }])) as unknown as Character['wounds'],
    fame: 0,
    factions: DEFAULT_FACTIONS.map((f) => ({ id: uid('fa'), name: f.name, type: f.type, value: 0 })),
    notes: { campaign: '', contacts: '', goals: '', questions: CHARACTER_QUESTIONS.map(() => '') },
    createdAt: now,
    updatedAt: now,
  };
}

/** Setzt LP / VW / Glückspool etc. sinnvoll aus den Attributen */
export function applyAttributeDefaults(c: Character): void {
  const kon = c.attributes.KON.value;
  c.vitals.lp = { cur: kon * 2, max: kon * 2 };
  c.vitals.luckPool = { cur: c.attributes.GLK.value, max: c.attributes.GLK.value };
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Tiefes Zusammenführen: fehlende Felder aus `base`, Typen werden grob geprüft */
function mergeDeep<T>(base: T, incoming: unknown): T {
  if (Array.isArray(base)) {
    return (Array.isArray(incoming) ? incoming : base) as T;
  }
  if (isObj(base)) {
    if (!isObj(incoming)) return base;
    const out: Obj = { ...base };
    for (const key of Object.keys(incoming)) {
      const bv = (base as Obj)[key];
      const iv = incoming[key];
      if (bv === undefined) out[key] = iv;
      else if (bv === null) out[key] = iv;
      else out[key] = mergeDeep(bv, iv);
    }
    return out as T;
  }
  if (typeof base === 'number') return (typeof incoming === 'number' && Number.isFinite(incoming) ? incoming : base) as T;
  if (typeof base === 'string') return (typeof incoming === 'string' ? incoming : base) as T;
  if (typeof base === 'boolean') return (typeof incoming === 'boolean' ? incoming : base) as T;
  return (incoming ?? base) as T;
}

function normalizeList<T extends { id: string }>(list: unknown, make: () => T, prefix: string): T[] {
  if (!Array.isArray(list)) return [];
  return list.filter(isObj).map((raw) => {
    const item = mergeDeep(make(), raw);
    if (!item.id || typeof item.id !== 'string') item.id = uid(prefix);
    return item;
  });
}

/** Robuste Normalisierung für geladene / importierte Daten */
export function normalizeCharacter(raw: unknown): Character {
  const base = createBlankCharacter();
  if (!isObj(raw)) return base;
  const c = mergeDeep(base, { ...raw, skills: undefined, knowledge: undefined, weapons: undefined });
  c.schema = 1;
  if (!c.id) c.id = uid('ch');
  for (const k of ATTR_KEYS) {
    const o = c.derived[k].gowOverride as unknown;
    c.derived[k].gowOverride = typeof o === 'number' && Number.isFinite(o) ? o : null;
  }

  // Fertigkeiten: Standardliste garantieren, importierte Werte übernehmen
  const rawSkills = Array.isArray(raw.skills) ? raw.skills.filter(isObj) : [];
  if (rawSkills.length > 0) {
    c.skills = normalizeList(rawSkills, () => defaultSkills()[0], 'sk');
    for (const d of DEFAULT_SKILLS) {
      if (!c.skills.some((s) => s.name === d.name)) {
        const fresh = defaultSkills().find((s) => s.name === d.name)!;
        c.skills.push(fresh);
      }
    }
  } else {
    c.skills = base.skills;
  }
  c.knowledge = normalizeList(raw.knowledge, () => newKnowledge(), 'kn');
  c.weapons = normalizeList(raw.weapons, () => newWeapon(), 'wp');
  c.techniques = normalizeList(raw.techniques, () => newTechnique(), 'tq');
  c.companions = normalizeList(raw.companions, () => newCompanion(), 'cp');
  c.items = normalizeList(raw.items, () => newItem(), 'it');
  c.traits = normalizeList(raw.traits, () => newTrait(), 'tr');
  c.resources = normalizeList(raw.resources, () => ({ id: uid('rs'), name: '', cur: 0, max: 0 }), 'rs');
  c.factions = Array.isArray(raw.factions)
    ? normalizeList(raw.factions, () => ({ id: uid('fa'), name: '', type: 'Sonstige' as const, value: 0 }), 'fa')
    : base.factions;
  for (const slot of CYBER_SLOT_KEYS) {
    const list = isObj(raw.cyberware) ? raw.cyberware[slot] : undefined;
    c.cyberware[slot] = normalizeList(
      list,
      () => ({ id: uid('cy'), name: '', kind: 'Cyberware' as const, cost: 0, capacity: '', effect: '' }),
      'cy',
    );
  }
  const q = c.notes.questions;
  c.notes.questions = CHARACTER_QUESTIONS.map((_, i) => (typeof q[i] === 'string' ? q[i] : ''));
  return c;
}

export function duplicateCharacter(c: Character): Character {
  const copy = normalizeCharacter(JSON.parse(JSON.stringify(c)));
  copy.id = uid('ch');
  copy.name = `${c.name} (Kopie)`;
  // Unter-IDs neu vergeben, Waffen-Fertigkeits-Verknüpfungen erhalten
  const skillMap = new Map<string, string>();
  copy.skills.forEach((s) => {
    const n = uid('sk');
    skillMap.set(s.id, n);
    s.id = n;
  });
  copy.weapons.forEach((w) => {
    w.id = uid('wp');
    w.skillId = skillMap.get(w.skillId) ?? '';
  });
  copy.knowledge.forEach((k) => (k.id = uid('kn')));
  copy.techniques.forEach((t) => (t.id = uid('tq')));
  copy.companions.forEach((t) => (t.id = uid('cp')));
  copy.items.forEach((t) => (t.id = uid('it')));
  copy.traits.forEach((t) => (t.id = uid('tr')));
  copy.createdAt = Date.now();
  copy.updatedAt = Date.now();
  return copy;
}
