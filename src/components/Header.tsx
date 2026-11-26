import { useRef, useState } from 'react';
import {
  AlertTriangle,
  Copy,
  Download,
  FileDown,
  FileUp,
  Hexagon,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';
import type { Character } from '../types';
import { useSheet } from '../context';
import { Btn, IconBtn, cx } from './ui';
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
  onOpenVitals: () => void;
  saved: boolean;
}

export function Header(p: HeaderProps) {
  const { char, update } = useSheet();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const v = char.vitals;
  const maxLp = Math.max(0, v.lp.max - chestWoundLpMalus(char));
  const dying = v.lp.cur <= 0;
  const activeCount = activeStatusCount(char);

  return (
    <header className="shrink-0 border-b border-slate-700/70 bg-[#0f141d]/95 px-3 py-2 backdrop-blur">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 pr-1">
          <Hexagon className="size-6 text-amber-400" strokeWidth={2.2} />
          <span className="font-mono text-sm font-black tracking-[0.3em] text-amber-400">BEYOND</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Users className="size-4 text-slate-500" />
          <select
            value={p.activeId}
            onChange={(e) => p.onSelect(e.target.value)}
            className="field max-w-[11rem] text-sm font-semibold"
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
          className="field min-w-0 flex-1 basis-36 text-sm font-bold text-slate-100"
          placeholder="Charaktername"
          aria-label="Charaktername"
        />
        <input
          value={char.archetype}
          onChange={(e) => update((c) => void (c.archetype = e.target.value))}
          className="field w-32 text-xs text-amber-300"
          placeholder="Archetyp"
          aria-label="Archetyp"
        />
        <input
          value={char.species}
          onChange={(e) => update((c) => void (c.species = e.target.value))}
          className="field w-24 text-xs text-cyan-300"
          placeholder="Spezies"
          aria-label="Spezies"
        />

        {/* Kompakte Live-Übersichtspills (Klick öffnet Vitalwerte) */}
        <button
          type="button"
          onClick={p.onOpenVitals}
          title="Vital- & Kampfwerte öffnen"
          className="hidden items-center gap-1.5 rounded-md border border-slate-700/70 bg-[#0b0e14] px-2 py-1 font-mono text-xs transition-colors hover:border-amber-500/50 xl:flex"
        >
          <span className={cx('font-bold', dying ? 'animate-pulse text-red-400' : 'text-emerald-300')}>
            LP {v.lp.cur}/{maxLp}
          </span>
          <span className="text-slate-700">·</span>
          <span className="text-cyan-300">
            SW {v.shields.cur}/{v.shields.max}
          </span>
          <span className="text-slate-700">·</span>
          <span className="text-slate-300">VW {v.vw}</span>
          <span className="text-slate-700">·</span>
          <span className="text-cyan-300">
            Glk {v.luckPool.cur}/{v.luckPool.max}
          </span>
          {activeCount > 0 && (
            <>
              <span className="text-slate-700">·</span>
              <span className="inline-flex items-center gap-1 font-sans text-[11px] font-bold text-red-400">
                <AlertTriangle className="size-3" /> {activeCount}
              </span>
            </>
          )}
        </button>

        {/* Profil-Aktionen */}
        <div className="ml-auto flex items-center gap-1">
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
            className={cx('ml-1 hidden items-center gap-1 font-mono text-[10px] sm:flex', p.saved ? 'text-emerald-500/80' : 'text-red-400')}
          >
            <ShieldCheck className="size-3.5" />
            {p.saved ? 'GESPEICHERT' : 'FEHLER'}
          </span>
        </div>
      </div>
    </header>
  );
}
