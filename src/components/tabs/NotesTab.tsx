import { useState } from 'react';
import { Award, Bandage, HelpCircle, NotebookPen, Plus, Star } from 'lucide-react';
import { useSheet } from '../../context';
import type { Faction, Trait } from '../../types';
import { TRAIT_PRESETS } from '../../data/presets';
import { WOUNDS } from '../../data/rules';
import { newTrait, traitFromPreset, uid } from '../../logic/character';
import { Btn, ConfirmDelete, EmptyHint, Field, NumInput, Panel, Pips, Select, Stepper, TextArea, TextInput, cx } from '../ui';
import { CHARACTER_QUESTIONS } from '../../data/rules';

function TraitRow({ t }: { t: Trait }) {
  const { update } = useSheet();
  const [edit, setEdit] = useState(false);
  const set = (recipe: (x: Trait) => void) =>
    update((c) => {
      const x = c.traits.find((y) => y.id === t.id);
      if (x) recipe(x);
    });
  const isPro = t.kind === 'Vorteil';
  return (
    <div className={cx('rounded-md border bg-[#0f141d] p-1.5', isPro ? 'border-cyan-500/30' : 'border-red-500/30')}>
      <div className="flex items-start gap-2">
        <button type="button" onClick={() => setEdit((e) => !e)} className="min-h-9 min-w-0 flex-1 text-left">
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
              <Select value={t.kind} options={['Vorteil', 'Nachteil'] as const} onChange={(v) => set((x) => void (x.kind = v))} />
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
  const set = (recipe: (x: Faction) => void) =>
    update((c) => {
      const x = c.factions.find((y) => y.id === f.id);
      if (x) recipe(x);
    });
  const tone = f.value > 0 ? 'cyan' : f.value < 0 ? 'red' : 'slate';
  return (
    <div className="flex items-center gap-1.5">
      <span className={cx('w-6 text-center text-[9px] font-bold', f.type === 'Haus' ? 'text-amber-400' : f.type === 'Syndikat' ? 'text-red-400' : 'text-slate-500')}>
        {f.type === 'Haus' ? 'H' : f.type === 'Syndikat' ? 'S' : '·'}
      </span>
      <TextInput value={f.name} onChange={(v) => set((x) => void (x.name = v))} className="min-h-9 min-w-0 flex-1" />
      <div className="relative hidden h-2 w-16 rounded bg-slate-800 sm:block">
        <div className="absolute top-0 left-1/2 h-full w-px bg-slate-500" />
        <div
          className={cx('absolute top-0 h-full rounded', f.value >= 0 ? 'left-1/2 bg-cyan-500' : 'right-1/2 bg-red-500')}
          style={{ width: `${(Math.abs(f.value) / 6) * 50}%` }}
        />
      </div>
      <Stepper size="sm" tone={tone} value={f.value} min={-6} max={6} onChange={(n) => set((x) => void (x.value = n))} />
      <ConfirmDelete label="×" onConfirm={() => update((c) => void (c.factions = c.factions.filter((x) => x.id !== f.id)))} />
    </div>
  );
}

export function NotesTab() {
  const { char, update } = useSheet();
  const [preset, setPreset] = useState('');
  const pros = char.traits.filter((t) => t.kind === 'Vorteil');
  const cons = char.traits.filter((t) => t.kind === 'Nachteil');

  return (
    <div className="space-y-3">
      <Panel
        title="Vorteile & Nachteile"
        icon={<Star className="size-4" />}
        collapsible
        actions={
          <Btn small tone="amber" onClick={() => update((c) => void c.traits.push(newTrait()))}>
            <Plus className="size-3.5" /> Eigener
          </Btn>
        }
        bodyClassName="p-2 space-y-1.5"
      >
        <div className="flex gap-1.5">
          <select value={preset} onChange={(e) => setPreset(e.target.value)} className="field min-w-0 flex-1 text-sm">
            <option value="">GRW-Vorteil/Nachteil wählen (S. 90–93)…</option>
            <optgroup label="Vorteile">
              {TRAIT_PRESETS.filter((p) => p.kind === 'Vorteil').map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Nachteile">
              {TRAIT_PRESETS.filter((p) => p.kind === 'Nachteil').map((p) => (
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

      <Panel title="Wundzonen & Verkrüppelungen" icon={<Bandage className="size-4" />} collapsible bodyClassName="p-2 space-y-1.5">
        {WOUNDS.map((w) => {
          const st = char.wounds[w.key];
          const active = st.count > 0 || st.crippled;
          return (
            <div key={w.key} className={cx('rounded-md border p-1.5', active ? 'border-red-500/60 bg-red-950/30' : 'border-slate-700/60 bg-[#0f141d]')}>
              <div className="flex items-center gap-2">
                <span className={cx('min-w-0 flex-1 text-sm font-semibold', active ? 'text-red-200' : 'text-slate-300')}>{w.name}</span>
                {st.count > 0 && w.pewPer > 0 && (
                  <span className="font-mono text-xs font-bold text-red-400">
                    +{st.count * w.pewPer} PEW {w.attrs.join('/')}
                  </span>
                )}
                {st.count > 0 && w.key === 'Brust' && <span className="font-mono text-xs text-red-400">LP −{st.count}</span>}
                {st.count > 0 && w.key === 'Intern' && <span className="font-mono text-xs text-red-400">+{st.count} Schaden</span>}
                <Stepper size="sm" tone={st.count > 0 ? 'red' : 'slate'} value={st.count} min={0} max={9} onChange={(n) => update((c) => void (c.wounds[w.key].count = n))} />
              </div>
              <div className="mt-1 flex items-center gap-2">
                <p className="min-w-0 flex-1 text-[11px] leading-snug text-slate-500">{w.rule}</p>
                <button
                  type="button"
                  onClick={() => update((c) => void (c.wounds[w.key].crippled = !st.crippled))}
                  className={cx(
                    'min-h-8 shrink-0 rounded border px-2 text-[10px] font-bold uppercase',
                    st.crippled ? 'border-red-400 bg-red-500/25 text-red-200' : 'border-slate-700 text-slate-500',
                  )}
                  title="Verkrüppelung: unheilbar, Zone für Cyberware gesperrt"
                >
                  Verkrüppelt
                </button>
              </div>
            </div>
          );
        })}
      </Panel>

      <Panel
        title="Ruf & Ansehen"
        icon={<Award className="size-4" />}
        collapsible
        actions={
          <Btn small tone="amber" onClick={() => update((c) => void c.factions.push({ id: uid('fa'), name: 'Neue Fraktion', type: 'Sonstige', value: 0 }))}>
            <Plus className="size-3.5" />
          </Btn>
        }
        bodyClassName="p-2 space-y-1.5"
      >
        <div className="flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/5 p-1.5">
          <span className="flex-1 text-sm font-semibold text-amber-300">Bekanntheit</span>
          <span className="text-[10px] text-slate-500">(Würfelpool, 12 Stufen à 12 Punkte)</span>
          <Stepper size="sm" tone="amber" value={char.fame} min={0} max={144} onChange={(n) => update((c) => void (c.fame = n))} />
        </div>
        {char.factions.length === 0 && <EmptyHint>Keine Fraktionen.</EmptyHint>}
        {char.factions.map((f) => (
          <FactionRow key={f.id} f={f} />
        ))}
        <p className="px-1 text-[10px] text-slate-500">Ansehen −6 … +6 · wirkt bei Syndikats-/Hauswürfen als GoW / PEW.</p>
      </Panel>

      <Panel title="Kampagne, Kontakte & Ziele" icon={<NotebookPen className="size-4" />} collapsible bodyClassName="p-2 space-y-2">
        <Field label="Konzept">
          <TextInput value={char.concept} onChange={(v) => update((c) => void (c.concept = v))} />
        </Field>
        <Field label="Spieler">
          <TextInput value={char.player} onChange={(v) => update((c) => void (c.player = v))} />
        </Field>
        <Field label="Kampagnen-Notizen">
          <TextArea rows={5} value={char.notes.campaign} onChange={(v) => update((c) => void (c.notes.campaign = v))} />
        </Field>
        <Field label="Kontakte">
          <TextArea rows={3} value={char.notes.contacts} onChange={(v) => update((c) => void (c.notes.contacts = v))} />
        </Field>
        <Field label="Ziele">
          <TextArea rows={3} value={char.notes.goals} onChange={(v) => update((c) => void (c.notes.goals = v))} />
        </Field>
      </Panel>

      <Panel title="Die 6 Charakterfragen" icon={<HelpCircle className="size-4" />} collapsible defaultOpen={false} bodyClassName="p-2 space-y-2">
        {CHARACTER_QUESTIONS.map((q, i) => (
          <Field key={i} label={`${i + 1}. ${q}`}>
            <TextArea rows={2} value={char.notes.questions[i] ?? ''} onChange={(v) => update((c) => void (c.notes.questions[i] = v))} />
          </Field>
        ))}
      </Panel>
    </div>
  );
}
