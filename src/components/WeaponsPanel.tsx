import { useState } from 'react';
import { Crosshair, Pencil, PencilOff, Plus, RotateCw, Swords } from 'lucide-react';
import { isSameProbe, useSheet } from '../context';
import type { AttrKey, Weapon } from '../types';
import { WEAPON_PRESETS } from '../data/presets';
import { ATTR_KEYS } from '../data/rules';
import { newWeapon, weaponFromPreset } from '../logic/character';
import { quickPool } from '../logic/dice';
import { Btn, ConfirmDelete, DiceBadges, EmptyHint, Field, ModInputs, NumInput, Panel, Pips, Select, TextInput, cx } from './ui';

function Stat({ k, v, warn }: { k: string; v: string | number; warn?: boolean }) {
  return (
    <span className="inline-flex items-baseline gap-1 rounded border border-slate-700/60 bg-slate-900/60 px-1.5 py-0.5">
      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{k}</span>
      <span className={cx('font-mono text-xs font-semibold tabular-nums', warn ? 'text-red-300' : 'text-slate-200')}>{v}</span>
    </span>
  );
}

const sign = (n: number) => (n > 0 ? `+${n}` : `${n}`);

function WeaponCard({ w }: { w: Weapon }) {
  const { char, update, probe, setProbe } = useSheet();
  const [edit, setEdit] = useState(false);
  const pool = quickPool(char, { type: 'weapon', id: w.id });
  const active = isSameProbe(probe, { type: 'weapon', id: w.id });
  const skill = char.skills.find((s) => s.id === w.skillId);
  const set = (recipe: (x: Weapon) => void) =>
    update((c) => {
      const x = c.weapons.find((y) => y.id === w.id);
      if (x) recipe(x);
    });

  return (
    <div className={cx('rounded-md border bg-[#0f141d]/80 transition-shadow', active ? 'focus-ring border-amber-500/60' : 'border-slate-700/60')}>
      <div className="flex items-start gap-2 p-2">
        <button type="button" onClick={() => setProbe({ type: 'weapon', id: w.id })} className="min-w-0 flex-1 touch-manipulation text-left">
          <div className="flex items-center gap-2">
            <Crosshair className="size-4 shrink-0 text-amber-400" />
            <span className="truncate text-sm font-bold text-slate-100">{w.name}</span>
          </div>
          <div className="mt-0.5 truncate text-[11px] text-slate-500">
            {skill ? `${skill.attr} + ${skill.name} (${skill.level})` : `${w.attr} (ohne Fertigkeit)`} · {w.range || '—'} · {w.fm || '—'}
          </div>
        </button>
        {pool && <DiceBadges pool={pool} size="sm" />}
        <button
          type="button"
          aria-label="Waffe bearbeiten"
          onClick={() => setEdit((e) => !e)}
          className={cx('flex size-9 shrink-0 items-center justify-center rounded-md border', edit ? 'border-amber-500/60 text-amber-300' : 'border-slate-700 text-slate-400')}
        >
          {edit ? <PencilOff className="size-4" /> : <Pencil className="size-4" />}
        </button>
      </div>
      <div className="flex flex-wrap gap-1 px-2 pb-2">
        <Stat k="SCH" v={w.damage || '—'} />
        {!w.melee && <Stat k="RK" v={w.rk} />}
        <Stat k="PBW" v={sign(w.pbw)} />
        <Stat k="PRÄZ" v={sign(w.praez)} warn={w.praez < 0} />
        <Stat k="KRIT" v={sign(w.krit)} />
        {!w.melee && <Stat k="NAL" v={w.nal} />}
        <Stat k="ZUV" v={w.zuv} />
        <Stat k="HÄR" v={w.haer} />
        <Stat k="MOD" v={w.mods || '—'} />
        <Stat k={w.melee ? 'KLT' : 'MUT'} v={w.ammoType || '—'} />
      </div>
      {w.properties && <p className="px-2 pb-2 text-[11px] text-slate-400">{w.properties}</p>}
      {!w.melee && w.ammoMax > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-800 px-2 py-1.5">
          <span className={cx('font-mono text-xs font-bold', w.ammoCurrent === 0 ? 'text-red-400' : 'text-slate-300')}>
            MUN {w.ammoCurrent}/{w.ammoMax}
          </span>
          <div className="min-w-0 flex-1">
            <Pips total={w.ammoMax} filled={w.ammoCurrent} tone="amber" size="sm" max={30} onChange={(n) => set((x) => void (x.ammoCurrent = n))} />
          </div>
          <Btn small tone="red" disabled={w.ammoCurrent <= 0} onClick={() => set((x) => void (x.ammoCurrent = Math.max(0, x.ammoCurrent - 1)))}>
            Schuss
          </Btn>
          <Btn small tone="amber" onClick={() => set((x) => void (x.ammoCurrent = x.ammoMax))} title={`Nachladen (${w.nal} Aktion/en)`}>
            <RotateCw className="size-3.5" /> Nachladen
          </Btn>
        </div>
      )}
      {edit && (
        <div className="space-y-2 border-t border-slate-800 bg-slate-950/40 p-2">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Name" className="col-span-2">
              <TextInput value={w.name} onChange={(v) => set((x) => void (x.name = v))} />
            </Field>
            <Field label="Fertigkeit">
              <Select
                value={w.skillId}
                options={[{ value: '', label: '— keine —' }, ...char.skills.map((s) => ({ value: s.id, label: `${s.name} (${s.attr})` }))]}
                onChange={(v) => set((x) => void (x.skillId = v))}
              />
            </Field>
            <Field label="Attribut (ohne Fertigk.)">
              <Select value={w.attr} options={ATTR_KEYS} onChange={(v) => set((x) => void (x.attr = v as AttrKey))} />
            </Field>
            <Field label="Reichweite">
              <TextInput value={w.range} onChange={(v) => set((x) => void (x.range = v))} />
            </Field>
            <Field label="Feuermodus (FM)">
              <TextInput value={w.fm} onChange={(v) => set((x) => void (x.fm = v))} />
            </Field>
            <Field label="Schaden">
              <TextInput value={w.damage} onChange={(v) => set((x) => void (x.damage = v))} />
            </Field>
            <Field label="Mun.-Typ / Klingentyp">
              <TextInput value={w.ammoType} onChange={(v) => set((x) => void (x.ammoType = v))} />
            </Field>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {(
              [
                ['RK', 'rk'],
                ['PBW', 'pbw'],
                ['PRÄZ', 'praez'],
                ['KRIT', 'krit'],
                ['NAL', 'nal'],
                ['ZUV', 'zuv'],
                ['HÄR', 'haer'],
                ['MUN max', 'ammoMax'],
              ] as const
            ).map(([label, key]) => (
              <Field key={key} label={label}>
                <NumInput
                  value={w[key]}
                  onChange={(v) =>
                    set((x) => {
                      x[key] = v;
                      if (key === 'ammoMax') x.ammoCurrent = Math.min(x.ammoCurrent, v);
                    })
                  }
                  className="w-full"
                />
              </Field>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="MODS">
              <TextInput value={w.mods} onChange={(v) => set((x) => void (x.mods = v))} />
            </Field>
            <Field label="Eigenschaften">
              <TextInput value={w.properties} onChange={(v) => set((x) => void (x.properties = v))} />
            </Field>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="flex min-h-9 items-center gap-2 text-xs text-slate-300">
              <input type="checkbox" className="size-5 accent-amber-500" checked={w.melee} onChange={(e) => set((x) => void (x.melee = e.target.checked))} />
              Nahkampfwaffe (BEL gilt, keine Munition)
            </label>
            <ModInputs gow={w.gow} glkw={w.glkw} pew={w.pew} onChange={(k, v) => set((x) => void (x[k] = v))} />
          </div>
          <div className="flex justify-end">
            <ConfirmDelete onConfirm={() => update((c) => void (c.weapons = c.weapons.filter((x) => x.id !== w.id)))} label="Waffe löschen" />
          </div>
        </div>
      )}
    </div>
  );
}

export function WeaponsPanel() {
  const { char, update } = useSheet();
  const [preset, setPreset] = useState('');
  return (
    <Panel
      title="Waffen & Angriffe"
      icon={<Swords className="size-4" />}
      actions={
        <Btn small tone="amber" onClick={() => update((c) => void c.weapons.push(newWeapon({ skillId: c.skills.find((s) => s.name === 'Handfeuerwaffen')?.id ?? '' })))}>
          <Plus className="size-3.5" /> Waffe
        </Btn>
      }
      bodyClassName="p-2"
    >
      <div className="mb-2 flex gap-1.5">
        <select value={preset} onChange={(e) => setPreset(e.target.value)} className="field min-w-0 flex-1 text-sm">
          <option value="">Schnellauswahl (GRW-Preset)…</option>
          {WEAPON_PRESETS.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name} – {p.skillName}
            </option>
          ))}
        </select>
        <Btn
          tone="amber"
          disabled={!preset}
          onClick={() => {
            const p = WEAPON_PRESETS.find((x) => x.name === preset);
            if (p) update((c) => void c.weapons.push(weaponFromPreset(c, p)));
            setPreset('');
          }}
        >
          <Plus className="size-4" /> Hinzufügen
        </Btn>
      </div>
      <div className="space-y-2">
        {char.weapons.length === 0 && <EmptyHint>Noch keine Waffen. Füge eine Waffe hinzu oder wähle ein Preset.</EmptyHint>}
        {char.weapons.map((w) => (
          <WeaponCard key={w.id} w={w} />
        ))}
      </div>
    </Panel>
  );
}
