import { useState } from 'react';
import { Award, HelpCircle, NotebookPen, Plus, Star } from 'lucide-react';
import { useSheet } from '../../context';
import type { Faction, Trait } from '../../types';
import { TRAIT_PRESETS } from '../../data/presets';
import { CHARACTER_QUESTIONS } from '../../data/rules';
import { newTrait, patchById, traitFromPreset, uid } from '../../logic/character';
import { Btn, ConfirmDelete, EmptyHint, Field, NumInput, Panel, Pips, Select, Stepper, TextArea, TextInput, cx } from '../ui';

const TRAIT_KINDS = ['Vorteil', 'Nachteil'] as const;
const PRO_PRESETS = TRAIT_PRESETS.filter((p) => p.kind === 'Vorteil');
const CON_PRESETS = TRAIT_PRESETS.filter((p) => p.kind === 'Nachteil');

function TraitRow({ t }: { t: Trait }) {
  const { update } = useSheet();
  const [edit, setEdit] = useState(false);
  const set = (recipe: (x: Trait) => void) => update((c) => patchById(c.traits, t.id, recipe));
  const isPro = t.kind === 'Vorteil';
  return (
    <div className={cx('rounded-md border bg-[#0f141d] p-2', isPro ? 'border-cyan-500/30' : 'border-red-500/30')}>
      <div className="flex items-start gap-2">
        <button type="button" aria-expanded={edit} onClick={() => setEdit((e) => !e)} className="min-h-8 min-w-0 flex-1 text-left">
          <span className={cx('mr-1.5 text-[9px] font-bold uppercase', isPro ? 'text-cyan-400' : 'text-red-400')}>{t.kind}</span>
          <span className="text-sm font-semibold text-slate-100">{t.name}</span>
          {t.text && !edit && <span className="block text-[11px] leading-snug text-slate-400">{t.text}</span>}
        </button>
        {t.usesMax > 0 && (
          <div className="flex flex-col items-end gap-1">
            <Pips total={t.usesMax} filled={t.usesCur} tone={isPro ? 'cyan' : 'red'} size="sm" onChange={(n) => set((x) => void (x.usesCur = n))} />
            <span className="font-mono text-[10px] text-slate-500">
              {t.usesCur}/{t.usesMax} pro Sitzung
            </span>
          </div>
        )}
      </div>
      {edit && (
        <div className="mt-1.5 space-y-2 border-t border-slate-800 pt-2">
          <div className="grid grid-cols-[1fr_auto_auto] gap-2">
            <Field label="Name">
              <TextInput value={t.name} onChange={(v) => set((x) => void (x.name = v))} />
            </Field>
            <Field label="Art">
              <Select value={t.kind} options={TRAIT_KINDS} onChange={(v) => set((x) => void (x.kind = v))} />
            </Field>
            <Field label="Nutzungen">
              <NumInput value={t.usesMax} min={0} max={20} onChange={(v) => set((x) => void ((x.usesMax = v), (x.usesCur = Math.min(x.usesCur, v))))} />
            </Field>
          </div>
          <TextArea rows={2} value={t.text} onChange={(v) => set((x) => void (x.text = v))} />
          <div className="flex justify-end">
            <ConfirmDelete onConfirm={() => update((c) => void (c.traits = c.traits.filter((x) => x.id !== t.id)))} />
          </div>
        </div>
      )}
    </div>
  );
}

function FactionRow({ f }: { f: Faction }) {
  const { update } = useSheet();
  const set = (recipe: (x: Faction) => void) => update((c) => patchById(c.factions, f.id, recipe));
  const tone = f.value > 0 ? 'cyan' : f.value < 0 ? 'red' : 'slate';
  return (
    <div className="flex items-center gap-1.5">
      <span className={cx('w-6 text-center text-[9px] font-bold', f.type === 'Haus' ? 'text-amber-400' : f.type === 'Syndikat' ? 'text-red-400' : 'text-slate-500')}>
        {f.type === 'Haus' ? 'H' : f.type === 'Syndikat' ? 'S' : '·'}
      </span>
      <TextInput value={f.name} onChange={(v) => set((x) => void (x.name = v))} className="min-h-8 min-w-0 flex-1" />
      <div className="relative hidden h-2 w-16 rounded bg-slate-800 sm:block">
        <div className="absolute top-0 left-1/2 h-full w-px bg-slate-500" />
        <div
          className={cx('absolute top-0 h-full rounded', f.value >= 0 ? 'left-1/2 bg-cyan-500' : 'right-1/2 bg-red-500')}
          style={{ width: `${(Math.min(6, Math.abs(f.value)) / 6) * 50}%` }}
        />
      </div>
      <Stepper size="sm" tone={tone} value={f.value} min={-6} max={6} onChange={(n) => set((x) => void (x.value = n))} />
      <ConfirmDelete label="×" onConfirm={() => update((c) => void (c.factions = c.factions.filter((x) => x.id !== f.id)))} />
    </div>
  );
}

export function TraitsPanel() {
  const { char, update } = useSheet();
  const [preset, setPreset] = useState('');
  const pros = char.traits.filter((t) => t.kind === 'Vorteil');
  const cons = char.traits.filter((t) => t.kind === 'Nachteil');

  return (
    <Panel
      title="Vorteile & Nachteile"
      icon={<Star className="size-4" />}
      actions={
        <Btn small tone="amber" onClick={() => update((c) => void c.traits.push(newTrait()))}>
          <Plus className="size-3.5" /> Eigener
        </Btn>
      }
      bodyClassName="p-2.5 space-y-2"
    >
      <div className="flex gap-1.5">
        <select value={preset} onChange={(e) => setPreset(e.target.value)} aria-label="GRW-Vorteil/Nachteil wählen" className="field min-w-0 flex-1 text-sm">
          <option value="">GRW-Vorteil/Nachteil wählen (S. 90–93)…</option>
          <optgroup label="Vorteile">
            {PRO_PRESETS.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Nachteile">
            {CON_PRESETS.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </optgroup>
        </select>
        <Btn
          tone="amber"
          disabled={!preset}
          onClick={() => {
            const p = TRAIT_PRESETS.find((x) => x.name === preset);
            if (p) update((c) => void c.traits.push(traitFromPreset(p)));
            setPreset('');
          }}
        >
          <Plus className="size-4" />
        </Btn>
      </div>
      {char.traits.length === 0 && <EmptyHint>Menschen wählen 3 Vorteile, sonst 2 (Aberranten 1). Jeder weitere Vorteil erfordert einen Nachteil.</EmptyHint>}
      {[...pros, ...cons].map((t) => (
        <TraitRow key={t.id} t={t} />
      ))}
    </Panel>
  );
}

export function FactionsPanel() {
  const { char, update } = useSheet();
  return (
    <Panel
      title="Ruf & Ansehen"
      icon={<Award className="size-4" />}
      actions={
        <Btn small tone="amber" onClick={() => update((c) => void c.factions.push({ id: uid('fa'), name: 'Neue Fraktion', type: 'Sonstige', value: 0 }))}>
          <Plus className="size-3.5" />
        </Btn>
      }
      bodyClassName="p-2.5 space-y-2"
    >
      <div className="flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/5 p-2">
        <span className="flex-1 text-sm font-semibold text-amber-300">Bekanntheit</span>
        <span className="text-[10px] text-slate-500">(12 Stufen à 12 Punkte)</span>
        <Stepper size="sm" tone="amber" value={char.fame} min={0} max={144} onChange={(n) => update((c) => void (c.fame = n))} />
      </div>
      {char.factions.length === 0 && <EmptyHint>Keine Fraktionen.</EmptyHint>}
      {char.factions.map((f) => (
        <FactionRow key={f.id} f={f} />
      ))}
      <p className="px-1 text-[10px] text-slate-500">Ansehen −6 … +6 · wirkt bei Syndikats-/Hauswürfen als GoW / PEW.</p>
    </Panel>
  );
}

export function CampaignNotesPanel() {
  const { char, update } = useSheet();
  return (
    <div className="space-y-3">
      <Panel title="Kampagne, Kontakte & Ziele" icon={<NotebookPen className="size-4" />} bodyClassName="p-2.5 space-y-2">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Field label="Konzept">
            <TextInput value={char.concept} onChange={(v) => update((c) => void (c.concept = v))} />
          </Field>
          <Field label="Spieler">
            <TextInput value={char.player} onChange={(v) => update((c) => void (c.player = v))} />
          </Field>
        </div>
        <Field label="Kampagnen-Notizen">
          <TextArea rows={5} value={char.notes.campaign} onChange={(v) => update((c) => void (c.notes.campaign = v))} />
        </Field>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Field label="Kontakte">
            <TextArea rows={3} value={char.notes.contacts} onChange={(v) => update((c) => void (c.notes.contacts = v))} />
          </Field>
          <Field label="Ziele">
            <TextArea rows={3} value={char.notes.goals} onChange={(v) => update((c) => void (c.notes.goals = v))} />
          </Field>
        </div>
      </Panel>

      <Panel title="Die 6 Charakterfragen" icon={<HelpCircle className="size-4" />} collapsible defaultOpen={false} bodyClassName="p-2.5 space-y-2">
        {CHARACTER_QUESTIONS.map((q, i) => (
          <Field key={i} label={`${i + 1}. ${q}`}>
            <TextArea rows={2} value={char.notes.questions[i] ?? ''} onChange={(v) => update((c) => void (c.notes.questions[i] = v))} />
          </Field>
        ))}
      </Panel>
    </div>
  );
}
