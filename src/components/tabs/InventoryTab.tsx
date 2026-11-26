import { Backpack, Coins, Package, Plus, Shield, Warehouse } from 'lucide-react';
import { useSheet } from '../../context';
import type { Item, ItemLocation } from '../../types';
import { newItem } from '../../logic/character';
import { effectiveAttr, effectiveBel } from '../../logic/dice';
import { Btn, ConfirmDelete, EmptyHint, Field, NumInput, Panel, Select, Stepper, TextInput, cx } from '../ui';

const LOCATIONS: { key: ItemLocation; name: string; hint: string; icon: React.ReactNode }[] = [
  { key: 'bereit', name: 'Bereit / Gürteltasche', hint: 'sofort griffbereit', icon: <Package className="size-4" /> },
  { key: 'rucksack', name: 'Rucksack', hint: 'Zugriff kostet 2 Aktionen', icon: <Backpack className="size-4" /> },
  { key: 'lager', name: 'Lager', hint: 'Schiff, Unterkunft, Depot', icon: <Warehouse className="size-4" /> },
];

function ItemRow({ it }: { it: Item }) {
  const { update } = useSheet();
  const set = (recipe: (x: Item) => void) =>
    update((c) => {
      const x = c.items.find((y) => y.id === it.id);
      if (x) recipe(x);
    });
  return (
    <div className={cx('space-y-1.5 rounded-md border bg-[#0f141d] p-2', it.consumable && it.qty <= 0 ? 'border-red-500/50' : 'border-slate-700/60')}>
      <div className="flex items-center gap-1.5">
        <TextInput value={it.name} onChange={(v) => set((x) => void (x.name = v))} className="min-w-0 flex-1 font-semibold" />
        <Stepper size="sm" value={it.qty} min={0} max={9999} tone={it.qty <= 0 ? 'red' : 'slate'} onChange={(n) => set((x) => void (x.qty = n))} />
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <label className="flex items-center gap-1 text-[10px] text-slate-500">
          kg
          <NumInput value={it.weight} float min={0} onChange={(v) => set((x) => void (x.weight = v))} className="h-8 min-h-8 w-14 text-xs" />
        </label>
        <label className="flex items-center gap-1 text-[10px] text-slate-500">
          Slots
          <NumInput value={it.slots} min={0} onChange={(v) => set((x) => void (x.slots = v))} className="h-8 min-h-8 w-10 text-xs" />
        </label>
        <button
          type="button"
          onClick={() => set((x) => void (x.consumable = !x.consumable))}
          className={cx(
            'min-h-8 rounded border px-2 text-[10px] font-bold uppercase',
            it.consumable ? 'border-amber-500/60 bg-amber-500/10 text-amber-300' : 'border-slate-700 text-slate-500',
          )}
        >
          Verbrauchsgut
        </button>
        <Select
          value={it.location}
          options={LOCATIONS.map((l) => ({ value: l.key, label: l.name }))}
          onChange={(v) => set((x) => void (x.location = v))}
          className="h-8 min-h-8 py-0 text-xs"
        />
        <div className="ml-auto">
          <ConfirmDelete label="×" onConfirm={() => update((c) => void (c.items = c.items.filter((x) => x.id !== it.id)))} />
        </div>
      </div>
      <TextInput value={it.notes} onChange={(v) => set((x) => void (x.notes = v))} placeholder="Notizen" className="min-h-8 text-xs" />
    </div>
  );
}

/** Menü 3 (Rechts): Rüstung & Schild */
export function ArmorPanel() {
  const { char, update } = useSheet();
  const a = char.armor;
  const bel = effectiveBel(char);

  return (
    <Panel title="Rüstung & Schild" icon={<Shield className="size-4" />} bodyClassName="p-2.5 space-y-2.5">
      <Field label="Rüstung">
        <TextInput value={a.name} onChange={(v) => update((c) => void (c.armor.name = v))} placeholder="z. B. Leichte Gefechtsrüstung" />
      </Field>
      <div className="grid grid-cols-3 gap-2">
        {(
          [
            ['NRW', 'nrw'],
            ['RW-Ist', 'rwIst'],
            ['RW-Soll', 'rwSoll'],
            ['Härte (HAR)', 'haerte'],
            ['Belastung (BEL)', 'bel'],
            ['Kapazität (KAP)', 'kap'],
          ] as const
        ).map(([label, key]) => (
          <Field key={key} label={label}>
            <NumInput value={a[key]} min={0} onChange={(v) => update((c) => void (c.armor[key] = v))} className="w-full" />
          </Field>
        ))}
      </div>
      {a.rwIst < a.rwSoll && <p className="text-[11px] text-red-400">Rüstung beschädigt: RW {a.rwIst} von {a.rwSoll}.</p>}
      <div className={cx('rounded-md border px-2.5 py-1.5 font-mono text-xs', bel > 0 ? 'border-red-500/50 text-red-300' : 'border-slate-700/60 text-slate-400')}>
        eff. BEL = max(0, {a.bel} − ⌊STR {effectiveAttr(char, 'STR')} / 2⌋) = <b>{bel}</b> → PEW auf körperliche Aktionen (außer Fernkampf)
      </div>
      <Field label="Modifikationen">
        <TextInput value={a.mods} onChange={(v) => update((c) => void (c.armor.mods = v))} />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Lebenserhaltung (Std.)">
          <div className="flex items-center gap-1">
            <Stepper size="sm" tone="cyan" value={a.lifeSupportCur} min={0} max={Math.max(a.lifeSupportMax, 0)} onChange={(v) => update((c) => void (c.armor.lifeSupportCur = v))} />
            <span className="font-mono text-xs text-slate-500">/</span>
            <NumInput value={a.lifeSupportMax} min={0} onChange={(v) => update((c) => void (c.armor.lifeSupportMax = v))} className="h-8 min-h-8 w-11 text-xs" />
          </div>
        </Field>
        <Field label="Schild (Modell)">
          <TextInput value={a.shieldName} onChange={(v) => update((c) => void (c.armor.shieldName = v))} />
        </Field>
        <Field label="Schild SW max">
          <NumInput
            value={char.vitals.shields.max}
            min={0}
            onChange={(v) => update((c) => void ((c.vitals.shields.max = v), (c.vitals.shields.cur = Math.min(c.vitals.shields.cur, v))))}
            className="w-full text-cyan-300"
          />
        </Field>
        <Field label="Aufladung / Runde">
          <NumInput value={a.shieldRecharge} min={0} onChange={(v) => update((c) => void (c.armor.shieldRecharge = v))} className="w-full text-cyan-300" />
        </Field>
      </div>
    </Panel>
  );
}

/** Menü 6 (Links): Credits, Lebensstil & Inventar */
export function CreditsInventoryPanel() {
  const { char, update } = useSheet();
  const carry = effectiveAttr(char, 'STR') * 10;
  const weight = char.items.filter((i) => i.location !== 'lager').reduce((s, i) => s + i.weight * i.qty, 0);

  return (
    <div className="space-y-3">
      <Panel title="Credits & Lebensstil" icon={<Coins className="size-4" />} bodyClassName="p-2.5">
        <div className="flex items-center gap-2">
          <NumInput value={char.credits} min={-9999999} max={999999999} onChange={(v) => update((c) => void (c.credits = v))} className="h-12 w-full flex-1 text-2xl font-black text-amber-400" />
          <span className="font-mono text-lg font-bold text-amber-500">₡</span>
        </div>
        <div className="mt-2 grid grid-cols-5 gap-1">
          {[100, 500, 1000, -100, -500].map((d) => (
            <Btn key={d} tone={d > 0 ? 'green' : 'red'} onClick={() => update((c) => void (c.credits += d))}>
              {d > 0 ? `+${d}` : d}
            </Btn>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Field label="Lebensstil">
            <TextInput value={char.lifestyle} onChange={(v) => update((c) => void (c.lifestyle = v))} />
          </Field>
          <Field label="Monatliche Kosten (₡)">
            <NumInput value={char.monthlyCost} min={0} max={99999999} onChange={(v) => update((c) => void (c.monthlyCost = v))} className="w-full" />
          </Field>
        </div>
        <Btn className="mt-2 w-full" tone="red" small onClick={() => update((c) => void (c.credits -= c.monthlyCost))}>
          Monatskosten abbuchen (−{char.monthlyCost} ₡)
        </Btn>
      </Panel>

      <Panel
        title="Ausrüstung"
        icon={<Package className="size-4" />}
        actions={
          <span className={cx('font-mono text-[11px]', weight > carry ? 'text-red-400' : 'text-slate-400')}>
            {weight.toFixed(1)} / {carry} kg
          </span>
        }
        bodyClassName="p-2.5 space-y-3"
      >
        {LOCATIONS.map((loc) => {
          const items = char.items.filter((i) => i.location === loc.key);
          return (
            <div key={loc.key}>
              <div className="mb-1 flex items-center gap-2 px-1">
                <span className="text-amber-400">{loc.icon}</span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">{loc.name}</span>
                <span className="text-[10px] text-slate-500">{loc.hint}</span>
                <Btn small tone="amber" className="ml-auto" onClick={() => update((c) => void c.items.push(newItem({ location: loc.key })))}>
                  <Plus className="size-3.5" />
                </Btn>
              </div>
              <div className="space-y-1.5">
                {items.length === 0 && <EmptyHint>Leer</EmptyHint>}
                {items.map((it) => (
                  <ItemRow key={it.id} it={it} />
                ))}
              </div>
            </div>
          );
        })}
      </Panel>
    </div>
  );
}
