import { useState } from 'react';
import { ChevronDown, ChevronRight, Pencil, PencilOff, Plus, Zap } from 'lucide-react';
import { useSheet } from '../context';
import type { Technique } from '../types';
import { TECHNIQUE_PRESETS } from '../data/presets';
import { newTechnique, patchById, techniqueFromPreset } from '../logic/character';
import { Btn, ConfirmDelete, EmptyHint, Field, NumInput, Panel, Pips, TextArea, TextInput, cx } from './ui';

function TechniqueCard({ t }: { t: Technique }) {
  const { update } = useSheet();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(false);
  const set = (recipe: (x: Technique) => void) => update((c) => patchById(c.techniques, t.id, recipe));
  return (
    <div className="rounded-md border border-slate-700/60 bg-[#0f141d]">
      <div className="flex items-start gap-1.5 p-1.5">
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex min-h-10 min-w-0 flex-1 items-start gap-1.5 text-left">
          {open ? <ChevronDown className="mt-0.5 size-4 shrink-0 text-slate-500" /> : <ChevronRight className="mt-0.5 size-4 shrink-0 text-slate-500" />}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-slate-100">{t.name}</span>
            <span className="flex flex-wrap gap-x-2 text-[10px] text-slate-500">
              {t.source && <span className="text-cyan-400/80">{t.source}</span>}
              {t.prerequisite && <span>Vor.: {t.prerequisite}</span>}
            </span>
          </span>
          {t.cost && <span className="shrink-0 rounded border border-amber-500/50 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[11px] font-bold text-amber-300">{t.cost}</span>}
        </button>
        <button
          type="button"
          aria-label="Technik bearbeiten"
          onClick={() => {
            setEdit((e) => !e);
            setOpen(true);
          }}
          className={cx('flex size-9 shrink-0 items-center justify-center rounded-md', edit ? 'text-amber-300' : 'text-slate-600 hover:text-slate-300')}
        >
          {edit ? <PencilOff className="size-4" /> : <Pencil className="size-4" />}
        </button>
      </div>
      {t.usesMax > 0 && (
        <div className="flex items-center gap-2 px-2 pb-1.5">
          <span className="font-mono text-xs text-slate-400">
            {t.usesCurrent}/{t.usesMax}
          </span>
          <Pips total={t.usesMax} filled={t.usesCurrent} tone="cyan" size="sm" onChange={(n) => set((x) => void (x.usesCurrent = n))} />
          <Btn small onClick={() => set((x) => void (x.usesCurrent = Math.max(0, x.usesCurrent - 1)))} disabled={t.usesCurrent <= 0}>
            Einsetzen
          </Btn>
        </div>
      )}
      {open && !edit && t.text && <p className="border-t border-slate-800 px-3 py-2 text-xs leading-relaxed text-slate-300">{t.text}</p>}
      {edit && (
        <div className="space-y-2 border-t border-slate-800 bg-slate-950/40 p-2">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Name">
              <TextInput value={t.name} onChange={(v) => set((x) => void (x.name = v))} />
            </Field>
            <Field label="Archetyp / Quelle">
              <TextInput value={t.source} onChange={(v) => set((x) => void (x.source = v))} />
            </Field>
            <Field label="Kosten">
              <TextInput value={t.cost} onChange={(v) => set((x) => void (x.cost = v))} placeholder="2 ADR, 1 Aktion, 2 Teer…" />
            </Field>
            <Field label="Voraussetzung">
              <TextInput value={t.prerequisite} onChange={(v) => set((x) => void (x.prerequisite = v))} />
            </Field>
            <Field label="Nutzungen max (0 = keine)">
              <NumInput value={t.usesMax} min={0} max={20} onChange={(v) => set((x) => void ((x.usesMax = v), (x.usesCurrent = Math.min(x.usesCurrent, v))))} className="w-full" />
            </Field>
          </div>
          <Field label="Regeltext">
            <TextArea value={t.text} onChange={(v) => set((x) => void (x.text = v))} rows={4} />
          </Field>
          <div className="flex justify-end">
            <ConfirmDelete onConfirm={() => update((c) => void (c.techniques = c.techniques.filter((x) => x.id !== t.id)))} />
          </div>
        </div>
      )}
    </div>
  );
}

export function TechniquesPanel() {
  const { char, update } = useSheet();
  const [preset, setPreset] = useState('');
  return (
    <Panel
      title="Techniken & Talente"
      icon={<Zap className="size-4" />}
      collapsible
      actions={
        <Btn small tone="amber" onClick={() => update((c) => void c.techniques.push(newTechnique()))}>
          <Plus className="size-3.5" /> Technik
        </Btn>
      }
      bodyClassName="p-2"
    >
      <div className="mb-2 flex gap-1.5">
        <select value={preset} onChange={(e) => setPreset(e.target.value)} className="field min-w-0 flex-1 text-sm">
          <option value="">GRW-Technik wählen…</option>
          {TECHNIQUE_PRESETS.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name} ({p.source}, {p.cost})
            </option>
          ))}
        </select>
        <Btn
          tone="amber"
          disabled={!preset}
          onClick={() => {
            const p = TECHNIQUE_PRESETS.find((x) => x.name === preset);
            if (p) update((c) => void c.techniques.push(techniqueFromPreset(p)));
            setPreset('');
          }}
        >
          <Plus className="size-4" />
        </Btn>
      </div>
      <div className="space-y-1.5">
        {char.techniques.length === 0 && <EmptyHint>Noch keine Techniken. Techniken kosten 8 EP.</EmptyHint>}
        {char.techniques.map((t) => (
          <TechniqueCard key={t.id} t={t} />
        ))}
      </div>
    </Panel>
  );
}
