import { useState } from 'react';
import { BookOpen, Pencil, PencilOff, Plus } from 'lucide-react';
import { isSameProbe, useSheet } from '../context';
import type { KnowledgeSkill } from '../types';
import { KNOWLEDGE_CATEGORIES, KNOWLEDGE_PRESETS } from '../data/rules';
import { newKnowledge, patchById } from '../logic/character';
import { quickPool } from '../logic/dice';
import { Btn, ConfirmDelete, DiceBadges, EmptyHint, Field, ModInputs, Panel, Select, Stepper, TextInput, cx } from './ui';

const catColor: Record<string, string> = {
  Akademisch: 'text-cyan-400',
  Beruf: 'text-amber-400',
  Hobby: 'text-emerald-400',
  Straße: 'text-red-400',
  Sprache: 'text-violet-400',
};

function KnowledgeRow({ k }: { k: KnowledgeSkill }) {
  const { char, update, probe, setProbe } = useSheet();
  const [edit, setEdit] = useState(false);
  const pool = quickPool(char, { type: 'knowledge', id: k.id })!;
  const active = isSameProbe(probe, { type: 'knowledge', id: k.id });
  const set = (recipe: (x: KnowledgeSkill) => void) => update((c) => patchById(c.knowledge, k.id, recipe));
  return (
    <div className={cx('rounded-md border bg-[#0f141d]', active ? 'focus-ring border-amber-500/60' : 'border-slate-700/60')}>
      <div className="flex items-center gap-1.5 p-1">
        <button type="button" onClick={() => setProbe({ type: 'knowledge', id: k.id })} className="flex min-h-10 min-w-0 flex-1 touch-manipulation items-center gap-2 rounded px-1.5 text-left hover:bg-slate-800/60">
          <span className={cx('w-14 shrink-0 text-[9px] font-bold uppercase', catColor[k.category])}>{k.category}</span>
          <span className="min-w-0 flex-1 truncate text-sm text-slate-100">{k.name}</span>
          <span className="font-mono text-[9px] text-slate-500">{k.linkInt ? 'INT+' : 'frei'}</span>
          <DiceBadges pool={pool} size="xs" />
        </button>
        <Stepper size="sm" value={k.level} min={0} max={6} tone="amber" onChange={(n) => set((x) => void (x.level = n))} />
        <button
          type="button"
          aria-label="Wissen bearbeiten"
          onClick={() => setEdit((e) => !e)}
          className={cx('flex size-9 shrink-0 items-center justify-center rounded-md', edit ? 'text-amber-300' : 'text-slate-600 hover:text-slate-300')}
        >
          {edit ? <PencilOff className="size-4" /> : <Pencil className="size-4" />}
        </button>
      </div>
      {edit && (
        <div className="space-y-2 border-t border-slate-800 bg-slate-950/40 p-2">
          <div className="grid grid-cols-2 gap-2">
            <Field label="Name">
              <TextInput value={k.name} onChange={(v) => set((x) => void (x.name = v))} />
            </Field>
            <Field label="Kategorie">
              <Select value={k.category} options={KNOWLEDGE_CATEGORIES} onChange={(v) => set((x) => void (x.category = v))} />
            </Field>
          </div>
          <Field label="Notiz">
            <TextInput value={k.notes} onChange={(v) => set((x) => void (x.notes = v))} />
          </Field>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="flex min-h-9 items-center gap-2 text-xs text-slate-300">
              <input type="checkbox" className="size-5 accent-amber-500" checked={k.linkInt} onChange={(e) => set((x) => void (x.linkInt = e.target.checked))} />
              Mit INT verknüpfen
            </label>
            <ModInputs gow={k.gow} glkw={k.glkw} pew={k.pew} onChange={(key, v) => set((x) => void (x[key] = v))} />
          </div>
          <div className="flex justify-end">
            <ConfirmDelete onConfirm={() => update((c) => void (c.knowledge = c.knowledge.filter((x) => x.id !== k.id)))} />
          </div>
        </div>
      )}
    </div>
  );
}

export function KnowledgePanel() {
  const { char, update } = useSheet();
  const [preset, setPreset] = useState('');
  return (
    <Panel
      title="Wissen & Sprachen"
      icon={<BookOpen className="size-4" />}
      collapsible
      actions={
        <Btn small tone="amber" onClick={() => update((c) => void c.knowledge.push(newKnowledge()))}>
          <Plus className="size-3.5" /> Wissen
        </Btn>
      }
      bodyClassName="p-2"
    >
      <div className="mb-2 flex gap-1.5">
        <select value={preset} onChange={(e) => setPreset(e.target.value)} className="field min-w-0 flex-1 text-sm">
          <option value="">Vorschlag wählen…</option>
          {KNOWLEDGE_PRESETS.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name} ({p.category})
            </option>
          ))}
          <option value="__lang">Sprache (Stufe 1, 8 EP)</option>
        </select>
        <Btn
          tone="amber"
          disabled={!preset}
          onClick={() => {
            if (preset === '__lang') update((c) => void c.knowledge.push(newKnowledge({ name: 'Neue Sprache', category: 'Sprache', level: 1 })));
            else {
              const p = KNOWLEDGE_PRESETS.find((x) => x.name === preset);
              if (p) update((c) => void c.knowledge.push(newKnowledge({ name: p.name, category: p.category })));
            }
            setPreset('');
          }}
        >
          <Plus className="size-4" />
        </Btn>
      </div>
      <div className="space-y-1">
        {char.knowledge.length === 0 && <EmptyHint>Wissensfertigkeiten sind immer mit INT verknüpft (GRW S. 99).</EmptyHint>}
        {char.knowledge.map((k) => (
          <KnowledgeRow key={k.id} k={k} />
        ))}
      </div>
    </Panel>
  );
}
