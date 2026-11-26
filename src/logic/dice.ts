import type { AttrKey, Character, DiceMods, ProbeRef } from '../types';
import { ATTR_BY_KEY, STATUSES, WOUNDS } from '../data/rules';

export interface DicePoolInput {
  basePool: number;
  gow: number;
  glkw: number;
  pew: number;
}

export interface DicePool {
  now: number;
  gow: number;
  glkw: number;
  pew: number;
  gowOverflowAsGlkw: number;
  basePool: number;
}

/** 4-Farben-W6-System (GRW S. 5): GoW ersetzen NOW, Überschuss → GlkW */
export function calculateDicePool({ basePool, gow, glkw, pew }: DicePoolInput): DicePool {
  const base = Math.max(0, basePool);
  const effectiveGow = Math.min(Math.max(0, gow), base);
  const now = Math.max(0, base - effectiveGow);
  const gowOverflowAsGlkw = Math.max(0, gow - base);
  const totalGlkw = Math.max(0, glkw) + gowOverflowAsGlkw;
  const totalPew = Math.max(0, pew);
  return { now, gow: effectiveGow, glkw: totalGlkw, pew: totalPew, gowOverflowAsGlkw, basePool: base };
}

export function effectiveAttr(c: Character, key: AttrKey): number {
  const a = c.attributes[key];
  return Math.max(0, a.value - a.spentEffort);
}

export function derivedGow(c: Character, key: AttrKey): number {
  const o = c.derived[key].gowOverride;
  return o ?? c.attributes[key].gow * 2;
}

export function effectiveBel(c: Character): number {
  return Math.max(0, c.armor.bel - Math.floor(effectiveAttr(c, 'STR') / 2));
}

export function startedWapGrades(wap: number): number {
  return Math.min(6, Math.ceil(Math.max(0, wap) / 6));
}

export function woundPewFor(c: Character, attr: AttrKey): number {
  let total = 0;
  for (const w of WOUNDS) {
    if (w.attrs.includes(attr)) total += w.pewPer * (c.wounds[w.key]?.count ?? 0);
  }
  return total;
}

export function chestWoundLpMalus(c: Character): number {
  return c.wounds.Brust?.count ?? 0;
}

export function cyberwareCost(c: Character): number {
  return Object.values(c.cyberware)
    .flat()
    .reduce((sum, e) => sum + (Number(e.cost) || 0), 0);
}

export interface Modifier {
  label: string;
  glkw?: number;
  pew?: number;
  gow?: number;
}

export interface ResolvedProbe {
  label: string;
  formula: string;
  attr: AttrKey | null;
  basePool: number;
  base: DiceMods;
  /** automatisch ermittelte Situations-Modifikatoren (Wunden, Status, BEL, PRÄZ) */
  auto: Modifier[];
  hints: string[];
}

const add = (a: DiceMods, b: Partial<DiceMods>): DiceMods => ({
  gow: a.gow + (b.gow ?? 0),
  glkw: a.glkw + (b.glkw ?? 0),
  pew: a.pew + (b.pew ?? 0),
});

function attrAutoMods(c: Character, attr: AttrKey | null, physical: boolean, isKor: boolean): Modifier[] {
  const mods: Modifier[] = [];
  if (attr) {
    const w = woundPewFor(c, attr);
    if (w > 0) mods.push({ label: `Wunden (${attr})`, pew: w });
  }
  if (c.statuses.uebelkeit) mods.push({ label: 'Übelkeit', pew: 4 });
  if (c.statuses.frost && (attr === 'GES' || isKor)) mods.push({ label: 'Frost', pew: 3 });
  if (physical) {
    const bel = effectiveBel(c);
    if (bel > 0) mods.push({ label: 'Rüstungsbelastung', pew: bel });
  }
  return mods;
}

function statusHints(c: Character, attr: AttrKey | null, physical: boolean): string[] {
  const h: string[] = [];
  if (physical && c.statuses.schock) h.push('Schock: PEW auf körperliche Aktionen (Stärke laut SL)');
  if (c.statuses.verflucht && (attr === 'PSI' || attr === 'GLK')) h.push('Verflucht: PEW auf Psionik & Glück');
  if (c.statuses.furcht) h.push('Furcht: +6 PEW gegen die Quelle');
  if (c.statuses.betaeubt) h.push('Betäubt: keine Handlung möglich!');
  return h;
}

export function resolveProbe(c: Character, ref: ProbeRef): ResolvedProbe | null {
  switch (ref.type) {
    case 'attr': {
      const meta = ATTR_BY_KEY[ref.key];
      const a = c.attributes[ref.key];
      const eff = effectiveAttr(c, ref.key);
      const hints: string[] = [];
      if (a.spentEffort > 0) hints.push(`Anstrengung: −${a.spentEffort} (Basis ${a.value})`);
      if (ref.key === 'KON' && a.gow > 0) hints.push(`KON-Schadenswiderstand: ${a.gow} NOW gegen eingehenden Schaden`);
      hints.push(...statusHints(c, ref.key, meta.physical));
      return {
        label: meta.name,
        formula: `${ref.key} ${eff}`,
        attr: ref.key,
        basePool: eff,
        base: { gow: a.gow, glkw: a.glkw, pew: a.pew },
        auto: attrAutoMods(c, ref.key, meta.physical, false),
        hints,
      };
    }
    case 'derived': {
      const meta = ATTR_BY_KEY[ref.key];
      const d = c.derived[ref.key];
      const eff = effectiveAttr(c, ref.key);
      const hints: string[] = [];
      if (ref.key === 'WIL') {
        const g = startedWapGrades(c.vitals.wap);
        if (g > 0) hints.push(`Gegen Verrücktheiten: +${g} PEW (angefangene WAP-Grade)`);
      }
      hints.push(...statusHints(c, ref.key, meta.physical));
      return {
        label: `${meta.derivedName} (${meta.derivedKey})`,
        formula: `${ref.key} ${eff} × 2`,
        attr: ref.key,
        basePool: eff * 2,
        base: { gow: derivedGow(c, ref.key), glkw: d.glkw, pew: d.pew },
        auto: attrAutoMods(c, ref.key, meta.physical, ref.key === 'GES'),
        hints,
      };
    }
    case 'skill': {
      const s = c.skills.find((x) => x.id === ref.id);
      if (!s) return null;
      const a = c.attributes[s.attr];
      const eff = effectiveAttr(c, s.attr);
      const physical = (s.category === 'Kampf' || s.category === 'Körperlich') && !s.ranged;
      return {
        label: s.name + (s.spec ? ` [${s.spec}]` : ''),
        formula: `${s.attr} ${eff} + ${s.name} ${s.level}`,
        attr: s.attr,
        basePool: eff + s.level,
        base: add({ gow: a.gow, glkw: a.glkw, pew: a.pew }, s),
        auto: attrAutoMods(c, s.attr, physical, false),
        hints: statusHints(c, s.attr, physical),
      };
    }
    case 'knowledge': {
      const k = c.knowledge.find((x) => x.id === ref.id);
      if (!k) return null;
      const eff = k.linkInt ? effectiveAttr(c, 'INT') : 0;
      const a = c.attributes.INT;
      const base = k.linkInt ? add({ gow: a.gow, glkw: a.glkw, pew: a.pew }, k) : { gow: k.gow, glkw: k.glkw, pew: k.pew };
      return {
        label: `${k.name} (${k.category})`,
        formula: k.linkInt ? `INT ${eff} + ${k.name} ${k.level}` : `Freier Pool ${k.level}`,
        attr: k.linkInt ? 'INT' : null,
        basePool: eff + k.level,
        base,
        auto: attrAutoMods(c, k.linkInt ? 'INT' : null, false, false),
        hints: statusHints(c, k.linkInt ? 'INT' : null, false),
      };
    }
    case 'weapon': {
      const w = c.weapons.find((x) => x.id === ref.id);
      if (!w) return null;
      const s = c.skills.find((x) => x.id === w.skillId);
      const attr = s ? s.attr : w.attr;
      const a = c.attributes[attr];
      const eff = effectiveAttr(c, attr);
      const lvl = s ? s.level : 0;
      let base: DiceMods = add({ gow: a.gow, glkw: a.glkw, pew: a.pew }, w);
      if (s) base = add(base, s);
      const physical = w.melee;
      const auto = attrAutoMods(c, attr, physical, false);
      if (w.praez > 0) auto.push({ label: `PRÄZ +${w.praez}`, glkw: w.praez });
      if (w.praez < 0) auto.push({ label: `PRÄZ ${w.praez}`, pew: -w.praez });
      const hints: string[] = [];
      hints.push(`Schaden ${w.damage || '—'} · PBW ${w.pbw} · KRIT ${w.krit >= 0 ? '+' : ''}${w.krit}`);
      if (!w.melee && w.rk > 0) hints.push(`RK ${w.rk}: PEW auf jeden Angriff nach dem ersten`);
      if (!w.melee && w.ammoMax > 0) hints.push(`Munition ${w.ammoCurrent}/${w.ammoMax}${w.ammoCurrent <= 0 ? ' – NACHLADEN!' : ''}`);
      hints.push(...statusHints(c, attr, physical));
      return {
        label: w.name,
        formula: s ? `${attr} ${eff} + ${s.name} ${lvl}` : `${attr} ${eff} (keine Fertigkeit)`,
        attr,
        basePool: eff + lvl,
        base,
        auto,
        hints,
      };
    }
  }
}

export function sumMods(base: DiceMods, mods: Modifier[]): DiceMods {
  return mods.reduce<DiceMods>((acc, m) => add(acc, m), { ...base });
}

/** Kurzer Pool für Listen (ohne Situationsmodifikatoren, aber mit Auto-Mali) */
export function quickPool(c: Character, ref: ProbeRef, withAuto = true): DicePool | null {
  const r = resolveProbe(c, ref);
  if (!r) return null;
  const m = withAuto ? sumMods(r.base, r.auto) : r.base;
  return calculateDicePool({ basePool: r.basePool, ...m });
}

export function activeStatusCount(c: Character): number {
  return STATUSES.filter((s) => c.statuses[s.key]).length;
}
