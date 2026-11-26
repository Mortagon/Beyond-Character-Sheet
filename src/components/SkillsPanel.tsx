import { useMemo, useState } from 'react';
import { ListChecks, Pencil, PencilOff, Plus, Search } from 'lucide-react';
import { isSameProbe, useSheet } from '../context';
import type { AttrKey, Skill, SkillCategory } from '../types';
import { ATTR_KEYS, SKILL_CATEGORIES } from '../data/rules';
import { quickPool } from '../logic/dice';
import { uid } from '../logic/character';
import { Btn, ConfirmDelete, DiceBadges, EmptyHint, Field, ModInputs, Panel, Select, Stepper, TextInput, cx } from './ui';

function SkillRow({ s }: { s: Skill }) {
  const { char, update, probe, setProbe } = useSheet();
  const [edit, setEdit] = useState(false);
  const pool = quickPool(char, { type: 'skill', id: s.id })!;
  const active = isSameProbe(probe, { type: 'skill', id: s.id });
  const set = (recipe: (x: Skill) => void) =>
    update((c) => {
      const x = c.skills.find((y) => y.id === s.id);
      if (x) recipe(x);
    });
  const hasMods = s.gow !== 0 || s.glkw !== 0 || s.pew !== 0;

  return (
    <div className={cx('rounded-md border transition-colors', active ? 'focus-ring border-amber-500/60 bg-amber-500/5' : s.level > 0 ? 'border-slate-700/70 bg-[#0f141d]' : 'border-slate-800/80 bg-[#0f141d]/50')}>
      <div className="flex items-center gap-2 p-1.5">
        <button type="button" onClick={() => setProbe({ type: 'skill', id: s.id })} className="flex min-h-9 min-w-0 flex-1 touch-manipulation items-center gap-2 rounded px-1.5 text-left hover:bg-slate-800/60">
          <span className={cx('w-8 shrink-0 font-mono text-[11px] font-bold', s.level > 0 ? 'text-amber-500' : 'text-slate-600')}>{s.attr}</span>
          <span className="min-w-0 flex-1">
            <span className={cx('block truncate text-sm', s.level > 0 ? 'font-semibold text-slate-100' : 'text-slate-400')}>
              {s.name}
              {hasMods && <span className="ml-1 text-[10px] text-amber-400">◆</span>}
            </span>
            {s.spec && <span className="block truncate text-[10px] text-cyan-400/80">{s.spec}</span>}
          </span>
          <DiceBadges pool={pool} size="xs" />
        </button>
        <Stepper size="sm" value={s.level} min={0} max={6} tone={s.level > 0 ? 'amber' : 'slate'} onChange={(n) => set((x) => void (x.level = n))} />
        <button
          type="button"
          aria-label="Fertigkeit bearbeiten"
          onClick={() => setEdit((e) => !e)}
          className={cx('flex size-8 shrink-0 items-center justify-center rounded-md', edit ? 'text-amber-300' : 'text-slate-600 hover:text-slate-300')}
        >
          {edit ? <PencilOff className="size-4" /> : <Pencil className="size-4" />}
        </button>
      </div>
      {edit && (
        <div className="space-y-2 border-t border-slate-800 bg-slate-950/40 p-2">
          {s.custom && (
            <div className="grid grid-cols-3 gap-2">
              <Field label="Name" className="col-span-3">
                <TextInput value={s.name} onChange={(v) => set((x) => void (x.name = v))} />
              </Field>
              <Field label="Attribut">
                <Select value={s.attr} options={ATTR_KEYS} onChange={(v) => set((x) => void (x.attr = v as AttrKey))} />
              </Field>
              <Field label="Kategorie">
                <Select value={s.category} options={SKILL_CATEGORIES} onChange={(v) => set((x) => void (x.category = v))} />
              </Field>
              <label className="flex items-end gap-2 pb-2 text-xs text-slate-300">
                <input type="checkbox" className="size-5 accent-amber-500" checked={s.ranged} onChange={(e) => set((x) => void (x.ranged = e.target.checked))} />
                Fernkampf
              </label>
            </div>
          )}
          <Field label="Spezialisierung">
            <TextInput value={s.spec} onChange={(v) => set((x) => void (x.spec = v))} placeholder="z. B. Parkour, Hacking …" />
          </Field>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <ModInputs gow={s.gow} glkw={s.glkw} pew={s.pew} onChange={(k, v) => set((x) => void (x[k] = v))} />
            {s.custom && <ConfirmDelete onConfirm={() => update((c) => void (c.skills = c.skills.filter((x) => x.id !== s.id)))} />}
          </div>
        </div>
      )}
    </div>
  );
}

export function SkillsPanel() {
  const { char, update } = useSheet();
  const [q, setQ] = useState('');
  const [learnedOnly, setLearnedOnly] = useState(false);
  const [cat, setCat] = useState<SkillCategory | 'Alle'>('Alle');

  const usedCats = useMemo(() => SKILL_CATEGORIES.filter((c) => char.skills.some((s) => s.category === c)), [char.skills]);

  const filtered = char.skills.filter(
    (s) =>
      (!learnedOnly || s.level > 0) &&
      (cat === 'Alle' || s.category === cat) &&
      (q.trim() === '' || `${s.name} ${s.spec} ${s.attr}`.toLowerCase().includes(q.trim().toLowerCase())),
  );
  const groups = usedCats.map((c) => ({ cat: c, items: filtered.filter((s) => s.category === c) })).filter((g) => g.items.length > 0);
  const learned = char.skills.filter((s) => s.level > 0).length;

  return (
    <Panel
      title={`Aktionsfertigkeiten (${learned}/${char.skills.length})`}
      icon={<ListChecks className="size-4" />}
      actions={
        <Btn
          small
          tone="amber"
          onClick={() =>
            update((c) =>
              void c.skills.push({
                id: uid('sk'),
                name: 'Eigene Fertigkeit',
                category: 'Eigene',
                attr: 'GES',
                level: 1,
                spec: '',
                custom: true,
                ranged: false,
                gow: 0,
                glkw: 0,
                pew: 0,
              }),
            )
          }
        >
          <Plus className="size-3.5" /> Eigene
        </Btn>
      }
      bodyClassName="p-2.5"
    >
      <div className="mb-2.5 space-y-2">
        <div className="flex gap-1.5">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Fertigkeit suchen…"
              className="field w-full pl-8 text-sm placeholder:text-slate-600"
            />
          </div>
          <Btn tone={learnedOnly ? 'cyan' : 'slate'} active={learnedOnly} onClick={() => setLearnedOnly((v) => !v)}>
            Nur Gelernte
          </Btn>
        </div>
        <div className="flex flex-wrap gap-1">
          {(['Alle', ...usedCats] as const).map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setCat(c)}
              className={cx(
                'min-h-8 touch-manipulation rounded border px-2 text-[11px] font-semibold',
                cat === c ? 'border-amber-500/70 bg-amber-500/15 text-amber-300' : 'border-slate-700/70 text-slate-400 hover:text-slate-200',
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <EmptyHint>Keine passenden Fertigkeiten.</EmptyHint>
      ) : (
        <div className="space-y-3">
          {groups.map((g) => (
            <div key={g.cat}>
              <div className="label mb-1 px-1 text-amber-500/80">{g.cat}</div>
              <div className="space-y-1">
                {g.items.map((s) => (
                  <SkillRow key={s.id} s={s} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
