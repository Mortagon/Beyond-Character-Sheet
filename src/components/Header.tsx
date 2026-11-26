import { useRef, useState } from 'react';
import {
  Copy,
  Download,
  FileDown,
  FileUp,
  Hexagon,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Character } from '../types';
import { useSheet } from '../context';
import { STATUSES } from '../data/rules';
import { Btn, IconBtn, NumInput, Stepper, cx } from './ui';
import { activeStatusCount, chestWoundLpMalus } from '../logic/dice';

interface HeaderProps {
  characters: Character[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onExport: () => void;
  onExportAll: () => void;
  onImport: (file: File) => void;
  saved: boolean;
}

function Chip({ label, children, tone = 'slate', className }: { label: string; children: React.ReactNode; tone?: string; className?: string }) {
  const border: Record<string, string> = {
    slate: 'border-slate-700/70',
    red: 'border-red-500/50',
    cyan: 'border-cyan-500/50',
    amber: 'border-amber-500/50',
  };
  return (
    <div className={cx('flex items-center gap-1.5 rounded-md border bg-[#0f141d] px-2 py-1', border[tone], className)}>
      <span className="label leading-tight">{label}</span>
      {children}
    </div>
  );
}

export function Header(p: HeaderProps) {
  const { char, update } = useSheet();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showStatus, setShowStatus] = useState(true);
  const v = char.vitals;
  const maxLp = Math.max(0, v.lp.max - chestWoundLpMalus(char));
  const dying = v.lp.cur <= 0;
  const activeCount = activeStatusCount(char);

  return (
    <header className="shrink-0 border-b border-slate-700/70 bg-[#0f141d]/95 backdrop-blur">
      {/* Zeile 1: Profil */}
      <div className="flex flex-wrap items-center gap-2 px-3 pt-2">
        <div className="flex items-center gap-2 pr-2">
          <Hexagon className="size-6 text-amber-400" strokeWidth={2.2} />
          <span className="font-mono text-sm font-black tracking-[0.35em] text-amber-400">BEYOND</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="size-4 text-slate-500" />
          <select
            value={p.activeId}
            onChange={(e) => p.onSelect(e.target.value)}
            className="field max-w-[12rem] text-sm font-semibold"
            title="Charakter wechseln"
          >
            {p.characters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || 'Unbenannt'}
              </option>
            ))}
          </select>
        </div>
        <input
          value={char.name}
          onChange={(e) => update((c) => void (c.name = e.target.value))}
          className="field min-w-0 flex-1 basis-40 text-base font-bold text-slate-100"
          placeholder="Charaktername"
          aria-label="Charaktername"
        />
        <input
          value={char.archetype}
          onChange={(e) => update((c) => void (c.archetype = e.target.value))}
          className="field w-36 text-sm text-amber-300"
          placeholder="Archetyp"
          aria-label="Archetyp"
        />
        <input
          value={char.species}
          onChange={(e) => update((c) => void (c.species = e.target.value))}
          className="field w-28 text-sm text-cyan-300"
          placeholder="Spezies"
          aria-label="Spezies"
        />
        <div className="flex items-center gap-1">
          <IconBtn icon={<Plus className="size-4" />} title="Neuer Charakter" tone="amber" onClick={p.onNew} />
          <IconBtn icon={<Copy className="size-4" />} title="Duplizieren" onClick={p.onDuplicate} />
          <IconBtn icon={<FileDown className="size-4" />} title="Charakter als JSON exportieren" tone="cyan" onClick={p.onExport} />
          <IconBtn icon={<Download className="size-4" />} title="Alle Charaktere exportieren" onClick={p.onExportAll} />
          <IconBtn icon={<FileUp className="size-4" />} title="JSON importieren" onClick={() => fileRef.current?.click()} />
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) p.onImport(f);
              e.target.value = '';
            }}
          />
          {confirmDelete ? (
            <Btn
              tone="red"
              onClick={() => {
                setConfirmDelete(false);
                p.onDelete();
              }}
            >
              Wirklich löschen?
            </Btn>
          ) : (
            <IconBtn
              icon={<Trash2 className="size-4" />}
              title="Charakter löschen"
              tone="red"
              onClick={() => {
                setConfirmDelete(true);
                setTimeout(() => setConfirmDelete(false), 3500);
              }}
            />
          )}
          <span
            title={p.saved ? 'Lokal gespeichert' : 'Speichern fehlgeschlagen'}
            className={cx('ml-1 flex items-center gap-1 font-mono text-[10px]', p.saved ? 'text-emerald-500/80' : 'text-red-400')}
          >
            <ShieldCheck className="size-3.5" />
            {p.saved ? 'GESPEICHERT' : 'FEHLER'}
          </span>
        </div>
      </div>

      {/* Zeile 2: Vitalwerte & Kampfwerte */}
      <div className="flex flex-wrap items-center gap-1.5 px-3 py-2">
        <Chip label="LP" tone={dying ? 'red' : 'slate'} className={cx(dying && 'animate-pulse')}>
          <Stepper
            size="sm"
            tone={dying ? 'red' : v.lp.cur < maxLp / 2 ? 'amber' : 'green'}
            value={v.lp.cur}
            min={-99}
            max={maxLp}
            onChange={(n) => update((c) => void (c.vitals.lp.cur = n))}
          />
          <span className="font-mono text-sm text-slate-500">/{maxLp}</span>
          {chestWoundLpMalus(char) > 0 && <span className="font-mono text-[10px] text-red-400">(−{chestWoundLpMalus(char)})</span>}
        </Chip>
        <Chip label="Temp">
          <Stepper size="sm" value={v.tempLp} min={0} onChange={(n) => update((c) => void (c.vitals.tempLp = n))} />
        </Chip>
        <Chip label="SW" tone="cyan">
          <Stepper
            size="sm"
            tone="cyan"
            value={v.shields.cur}
            min={0}
            max={v.shields.max}
            onChange={(n) => update((c) => void (c.vitals.shields.cur = n))}
          />
          <span className="font-mono text-sm text-slate-500">/{v.shields.max}</span>
          <Btn
            small
            tone="cyan"
            title={`Schild aufladen (+${char.armor.shieldRecharge || 'voll'})`}
            onClick={() =>
              update((c) => {
                const r = c.armor.shieldRecharge > 0 ? c.armor.shieldRecharge : c.vitals.shields.max;
                c.vitals.shields.cur = Math.min(c.vitals.shields.max, c.vitals.shields.cur + r);
              })
            }
          >
            ⟳
          </Btn>
        </Chip>
        <Chip label="VW">
          <NumInput value={v.vw} onChange={(n) => update((c) => void (c.vitals.vw = n))} min={0} className="h-9 w-11 text-sm font-bold" />
          <span className="font-mono text-[11px] text-slate-400" title="Passive Verteidigung">
            /2={Math.floor(v.vw / 2)}
          </span>
        </Chip>
        <Chip label="REA">
          <Stepper
            size="sm"
            value={v.reactions.cur}
            min={0}
            max={v.reactions.max}
            onChange={(n) => update((c) => void (c.vitals.reactions.cur = n))}
          />
          <span className="font-mono text-sm text-slate-500">/</span>
          <NumInput
            value={v.reactions.max}
            min={0}
            onChange={(n) => update((c) => void (c.vitals.reactions.max = n))}
            className="h-9 w-9 text-sm"
          />
        </Chip>
        <Chip label="INI">
          <NumInput value={v.ini} onChange={(n) => update((c) => void (c.vitals.ini = n))} className="h-9 w-11 text-sm font-bold" />
        </Chip>
        <Chip label="PW">
          <NumInput value={v.pw} onChange={(n) => update((c) => void (c.vitals.pw = n))} className="h-9 w-11 text-sm font-bold" />
        </Chip>
        <Chip label="GW">
          <NumInput value={v.gw} onChange={(n) => update((c) => void (c.vitals.gw = n))} className="h-9 w-11 text-sm font-bold" />
        </Chip>
        <Chip label="Glück" tone="cyan">
          <Stepper
            size="sm"
            tone="cyan"
            value={v.luckPool.cur}
            min={0}
            max={v.luckPool.max}
            onChange={(n) => update((c) => void (c.vitals.luckPool.cur = n))}
          />
          <span className="font-mono text-sm text-slate-500">/</span>
          <NumInput
            value={v.luckPool.max}
            min={0}
            onChange={(n) => update((c) => void (c.vitals.luckPool.max = n))}
            className="h-9 w-9 text-sm"
          />
        </Chip>
        <Chip label="ADR" tone="amber">
          <Stepper size="sm" tone="amber" value={v.adr} min={0} max={99} onChange={(n) => update((c) => void (c.vitals.adr = n))} />
        </Chip>
        <Chip label="ERP" tone={v.erp > 0 ? 'red' : 'slate'}>
          <Stepper size="sm" tone={v.erp > 0 ? 'red' : 'slate'} value={v.erp} min={0} max={99} onChange={(n) => update((c) => void (c.vitals.erp = n))} />
        </Chip>
      </div>

      {/* Zeile 3: Status */}
      <div className="flex items-start gap-2 border-t border-slate-800 px-3 py-1.5">
        <button
          type="button"
          onClick={() => setShowStatus((s) => !s)}
          className={cx(
            'flex min-h-8 shrink-0 items-center gap-1 rounded px-1 text-[10px] font-bold uppercase tracking-widest',
            activeCount > 0 ? 'text-red-400' : 'text-slate-500',
          )}
        >
          {activeCount > 0 && <AlertTriangle className="size-3.5" />}
          Status{activeCount > 0 ? ` (${activeCount})` : ''}
          {showStatus ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </button>
        <div className="flex flex-wrap gap-1">
          {STATUSES.filter((s) => showStatus || char.statuses[s.key]).map((s) => {
            const on = !!char.statuses[s.key];
            return (
              <button
                type="button"
                key={s.key}
                title={s.rule}
                onClick={() => update((c) => void (c.statuses[s.key] = !on))}
                className={cx(
                  'min-h-8 touch-manipulation rounded border px-2 text-[11px] font-semibold transition-all',
                  on
                    ? s.tone === 'red'
                      ? 'border-red-400 bg-red-500/20 text-red-200 shadow-[0_0_10px_-2px_rgba(239,68,68,0.7)]'
                      : s.tone === 'cyan'
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_10px_-2px_rgba(6,182,212,0.7)]'
                        : 'border-amber-400 bg-amber-500/20 text-amber-200 shadow-[0_0_10px_-2px_rgba(245,158,11,0.7)]'
                    : 'border-slate-700 bg-slate-900/60 text-slate-500 hover:text-slate-300',
                )}
              >
                {s.name}
                {on && <span className="ml-1.5 font-normal opacity-80">· {s.rule}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
