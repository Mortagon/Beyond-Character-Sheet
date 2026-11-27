import { useState } from 'react';
import { AlertTriangle, Bot, ChevronDown, ChevronRight, Cpu, Gem, Plus, Terminal } from 'lucide-react';
import { useSheet } from '../../context';
import type { Companion, CompanionType, CyberEntry, CyberSlot, Resource, Tracker } from '../../types';
import { CYBER_SLOTS, RESOURCE_PRESETS } from '../../data/rules';
import { newCompanion, patchById, uid } from '../../logic/character';
import { cyberwareCost, effectiveMaxLp } from '../../logic/dice';
import { Btn, ConfirmDelete, EmptyHint, Field, NumInput, Panel, Select, Stepper, TextArea, TextInput, cx, type Tone } from '../ui';

const TYPES: CompanionType[] = ['Begleiter', 'Drohne', 'Fahrzeug', 'Raumschiff'];
const CYBER_KINDS = ['Cyberware', 'Bioware', 'Exoware'] as const;
const DECK_STATS = ['VS', 'FW', 'SI', 'HW', 'CPU', 'RAM'] as const;

function Bar({ t, tone }: { t: Tracker; tone: string }) {
  const pct = t.max > 0 ? Math.max(0, Math.min(100, (t.cur / t.max) * 100)) : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded bg-slate-800">
      <div className={cx('h-full transition-all', tone)} style={{ width: `${pct}%` }} />
    </div>
  );
}

function CompTracker({
  label,
  t,
  tone,
  bar,
  onChange,
}: {
  label: string;
  t: Tracker;
  tone: Tone;
  bar: string;
  onChange: (t: Tracker) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-1">
        <span className="label">{label}</span>
        <div className="flex items-center gap-1">
          <Stepper size="sm" tone={tone} value={t.cur} min={0} max={Math.max(t.max, 0)} onChange={(cur) => onChange({ ...t, cur })} />
          <span className="font-mono text-xs text-slate-500">/</span>
          <NumInput value={t.max} min={0} onChange={(max) => onChange({ cur: Math.min(t.cur, max), max })} className="h-8 min-h-8 w-11 text-xs" />
        </div>
      </div>
      <Bar t={t} tone={bar} />
    </div>
  );
}

function CompanionCard({ cp }: { cp: Companion }) {
  const { update } = useSheet();
  const [open, setOpen] = useState(true);
  const set = (recipe: (x: Companion) => void) => update((c) => patchById(c.companions, cp.id, recipe));
  return (
    <div className="rounded-md border border-slate-700/60 bg-[#0f141d]">
      <div className="flex items-center gap-2 p-2">
        <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex min-h-9 min-w-0 flex-1 items-center gap-2 text-left">
          {open ? <ChevronDown className="size-4 text-slate-500" /> : <ChevronRight className="size-4 text-slate-500" />}
          <Bot className="size-4 text-cyan-400" />
          <span className="truncate text-sm font-bold text-slate-100">{cp.name}</span>
          <span className="text-[10px] uppercase text-cyan-400/80">{cp.type}</span>
          <span className={cx('ml-auto font-mono text-xs', cp.hull.cur <= 0 ? 'text-red-400' : 'text-slate-400')}>
            RP {cp.hull.cur}/{cp.hull.max}
          </span>
        </button>
      </div>
      {open && (
        <div className="space-y-2.5 border-t border-slate-800 p-2.5">
          <div className="grid grid-cols-[1fr_auto_auto] gap-2">
            <Field label="Name">
              <TextInput value={cp.name} onChange={(v) => set((x) => void (x.name = v))} />
            </Field>
            <Field label="Typ">
              <Select value={cp.type} options={TYPES} onChange={(v) => set((x) => void (x.type = v))} />
            </Field>
            <Field label="Härte">
              <NumInput value={cp.hardness} min={0} onChange={(v) => set((x) => void (x.hardness = v))} />
            </Field>
          </div>
          <CompTracker label="Rumpfpunkte" t={cp.hull} tone="green" bar="bg-emerald-500" onChange={(t) => set((x) => void (x.hull = t))} />
          <CompTracker label="Panzerung" t={cp.armor} tone="slate" bar="bg-slate-300" onChange={(t) => set((x) => void (x.armor = t))} />
          <CompTracker label="Schilde" t={cp.shields} tone="cyan" bar="bg-cyan-500" onChange={(t) => set((x) => void (x.shields = t))} />
          <CompTracker label="Reaktor / Energie" t={cp.energy} tone="amber" bar="bg-amber-500" onChange={(t) => set((x) => void (x.energy = t))} />
          <CompTracker label="Treibstoff / Ausdauer" t={cp.fuel} tone="amber" bar="bg-orange-500" onChange={(t) => set((x) => void (x.fuel = t))} />
          <Field label="Kortex / Systemwerte">
            <TextInput value={cp.cortex} onChange={(v) => set((x) => void (x.cortex = v))} placeholder="Pilot 2 · Sensoren 3 …" />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Module">
              <TextArea rows={2} value={cp.modules} onChange={(v) => set((x) => void (x.modules = v))} />
            </Field>
            <Field label="Waffen">
              <TextArea rows={2} value={cp.weapons} onChange={(v) => set((x) => void (x.weapons = v))} />
            </Field>
          </div>
          <Field label="Notizen">
            <TextArea rows={2} value={cp.notes} onChange={(v) => set((x) => void (x.notes = v))} />
          </Field>
          <div className="flex justify-between">
            <Btn
              small
              tone="green"
              onClick={() =>
                set((x) => {
                  x.hull.cur = x.hull.max;
                  x.armor.cur = x.armor.max;
                  x.shields.cur = x.shields.max;
                  x.energy.cur = x.energy.max;
                  x.fuel.cur = x.fuel.max;
                })
              }
            >
              Voll instandsetzen
            </Btn>
            <ConfirmDelete onConfirm={() => update((c) => void (c.companions = c.companions.filter((x) => x.id !== cp.id)))} />
          </div>
        </div>
      )}
    </div>
  );
}

function CyberRow({ e, slot }: { e: CyberEntry; slot: CyberSlot }) {
  const { update } = useSheet();
  const set = (recipe: (x: CyberEntry) => void) => update((c) => patchById(c.cyberware[slot], e.id, recipe));
  return (
    <div className="space-y-1.5 rounded border border-slate-800 bg-slate-950/40 p-2">
      <div className="grid grid-cols-[1fr_auto_auto] gap-1.5">
        <TextInput value={e.name} onChange={(v) => set((x) => void (x.name = v))} placeholder="Name" />
        <Select value={e.kind} options={CYBER_KINDS} onChange={(v) => set((x) => void (x.kind = v))} />
        <label className="flex items-center gap-1" title="Cyberwarekosten">
          <span className="text-[10px] font-bold text-red-400">K</span>
          <NumInput value={e.cost} min={0} onChange={(v) => set((x) => void (x.cost = v))} className="w-11" />
        </label>
      </div>
      <div className="grid grid-cols-[6.5rem_1fr_auto] gap-1.5">
        <TextInput value={e.capacity} onChange={(v) => set((x) => void (x.capacity = v))} placeholder="Kapazität" />
        <TextInput value={e.effect} onChange={(v) => set((x) => void (x.effect = v))} placeholder="Effekt" />
        <ConfirmDelete label="×" onConfirm={() => update((c) => void (c.cyberware[slot] = c.cyberware[slot].filter((x) => x.id !== e.id)))} />
      </div>
    </div>
  );
}

export function CompanionsPanel() {
  const { char, update } = useSheet();
  return (
    <Panel
      title="Begleiter · Drohnen · Fahrzeuge"
      icon={<Bot className="size-4" />}
      actions={
        <Btn small tone="amber" onClick={() => update((c) => void c.companions.push(newCompanion()))}>
          <Plus className="size-3.5" /> Hinzufügen
        </Btn>
      }
      bodyClassName="p-2.5 space-y-2"
    >
      {char.companions.length === 0 && <EmptyHint>Keine Begleiter, Drohnen, Fahrzeuge oder Raumschiffe.</EmptyHint>}
      {char.companions.map((cp) => (
        <CompanionCard key={cp.id} cp={cp} />
      ))}
    </Panel>
  );
}

export function CyberwareDeckPanel() {
  const { char, update } = useSheet();
  const cost = cyberwareCost(char);
  const maxLp = effectiveMaxLp(char);
  const over = cost > maxLp;
  const deck = char.cyberdeck;

  return (
    <div className="space-y-3">
      <Panel title="Cyberware · Bioware · Exoware" icon={<Cpu className="size-4" />} bodyClassName="p-2.5 space-y-2">
        <div
          className={cx(
            'flex items-center gap-2 rounded-md border px-2.5 py-2 font-mono text-xs',
            over ? 'border-red-500/70 bg-red-950/40 text-red-300' : 'border-slate-700/60 bg-[#0f141d] text-slate-300',
          )}
        >
          {over && <AlertTriangle className="size-4" />}
          Cyberwarekosten <b className="text-sm">{cost}</b> / Max LP <b className="text-sm">{maxLp}</b>
          {over && <span className="ml-auto font-sans font-semibold">Überschreitet Max LP!</span>}
        </div>
        {CYBER_SLOTS.map((slot) => (
          <div key={slot.key} className="rounded-md border border-slate-700/60 bg-[#0f141d] p-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="label text-cyan-400/80">{slot.name}</span>
              <Btn
                small
                onClick={() =>
                  update((c) => void c.cyberware[slot.key].push({ id: uid('cy'), name: '', kind: 'Cyberware', cost: 1, capacity: '', effect: '' }))
                }
              >
                <Plus className="size-3.5" />
              </Btn>
            </div>
            <div className="space-y-1.5">
              {char.cyberware[slot.key].length === 0 && <p className="px-1 text-[11px] text-slate-600">— leer —</p>}
              {char.cyberware[slot.key].map((e) => (
                <CyberRow key={e.id} e={e} slot={slot.key} />
              ))}
            </div>
          </div>
        ))}
      </Panel>

      <Panel title="Cyberdeck" icon={<Terminal className="size-4" />} collapsible defaultOpen={!!deck.name} bodyClassName="p-2.5 space-y-2">
        <Field label="Modell">
          <TextInput value={deck.name} onChange={(v) => update((c) => void (c.cyberdeck.name = v))} placeholder="Cyberdeck-Modell" />
        </Field>
        <div className="grid grid-cols-6 gap-1.5">
          {DECK_STATS.map((k) => (
            <Field key={k} label={k}>
              <NumInput value={deck[k]} min={0} onChange={(v) => update((c) => void (c.cyberdeck[k] = v))} className="w-full text-cyan-300" />
            </Field>
          ))}
        </div>
        <TextArea rows={2} value={deck.notes} onChange={(v) => update((c) => void (c.cyberdeck.notes = v))} placeholder="Programme, Notizen…" />
      </Panel>
    </div>
  );
}

function ResourceRow({ r }: { r: Resource }) {
  const { update } = useSheet();
  const set = (recipe: (x: Resource) => void) => update((c) => patchById(c.resources, r.id, recipe));
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-slate-700/60 bg-[#0f141d] p-1.5">
      <TextInput value={r.name} onChange={(v) => set((x) => void (x.name = v))} className="min-w-0 flex-1" />
      {/* max = 0 bedeutet „ohne Obergrenze“ */}
      <Stepper size="sm" tone="amber" value={r.cur} min={0} max={r.max > 0 ? r.max : 999} onChange={(n) => set((x) => void (x.cur = n))} />
      <span className="font-mono text-xs text-slate-500">/</span>
      <NumInput
        value={r.max}
        min={0}
        onChange={(n) =>
          set((x) => {
            x.max = n;
            if (n > 0) x.cur = Math.min(x.cur, n);
          })
        }
        className="h-8 min-h-8 w-11 text-xs"
      />
      <ConfirmDelete label="×" onConfirm={() => update((c) => void (c.resources = c.resources.filter((x) => x.id !== r.id)))} />
    </div>
  );
}

export function SpecialResourcesPanel() {
  const { char, update } = useSheet();
  return (
    <Panel title="Spezial-Ressourcen" icon={<Gem className="size-4" />} bodyClassName="p-2.5 space-y-2">
      <div className="flex flex-wrap gap-1">
        {RESOURCE_PRESETS.map((name) => (
          <Btn key={name} small onClick={() => update((c) => void c.resources.push({ id: uid('rs'), name, cur: 0, max: 6 }))}>
            <Plus className="size-3" /> {name}
          </Btn>
        ))}
      </div>
      {char.resources.length === 0 && <EmptyHint>Teer, Blutpunkte, SBS/SHS, Mutagene, KABA-Kristalle, Forschungspunkte …</EmptyHint>}
      {char.resources.map((r) => (
        <ResourceRow key={r.id} r={r} />
      ))}
    </Panel>
  );
}
