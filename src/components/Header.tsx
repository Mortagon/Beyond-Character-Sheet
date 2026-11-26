import { useRef, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Cloud,
  CloudOff,
  Copy,
  Download,
  FileDown,
  FileUp,
  LogIn,
  LogOut,
  Moon,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sun,
  Trash2,
  Users,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import type { Character } from '../types';
import { useSheet } from '../context';
import { BeyondEmblem } from './BeyondLogo';
import type { ThemeMode } from './ThemeTransition';
import type { CloudSyncState } from '../logic/firebase';
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
  onOpenRulebook: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  user: User | null;
  cloudSync: CloudSyncState;
  onLogin: () => void;
  onLogout: () => void;
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
        <div className="flex items-center gap-1.5 pr-1">
          <BeyondEmblem className="size-7 shrink-0" />
          <span className="font-mono text-sm font-black tracking-[0.28em] text-amber-400">BEYOND</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Users className="size-4 text-slate-500" />
          <select
            value={p.activeId}
            onChange={(e) => p.onSelect(e.target.value)}
            className="field max-w-[10.5rem] text-sm font-semibold"
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
          className="field min-w-0 flex-1 basis-32 text-sm font-bold text-slate-100"
          placeholder="Charaktername"
          aria-label="Charaktername"
        />
        <input
          value={char.archetype}
          onChange={(e) => update((c) => void (c.archetype = e.target.value))}
          className="field w-28 text-xs text-amber-300"
          placeholder="Archetyp"
          aria-label="Archetyp"
        />
        <input
          value={char.species}
          onChange={(e) => update((c) => void (c.species = e.target.value))}
          className="field w-22 text-xs text-cyan-300"
          placeholder="Spezies"
          aria-label="Spezies"
        />

        {/* Kompakte Live-Übersichtspills */}
        <button
          type="button"
          onClick={p.onOpenVitals}
          title="Vital- & Kampfwerte öffnen"
          className="hidden items-center gap-1.5 rounded-md border border-slate-700/70 bg-[#0b0e14] px-2 py-1 font-mono text-xs transition-colors hover:border-amber-500/50 2xl:flex"
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
          {activeCount > 0 && (
            <>
              <span className="text-slate-700">·</span>
              <span className="inline-flex items-center gap-1 font-sans text-[11px] font-bold text-red-400">
                <AlertTriangle className="size-3" /> {activeCount}
              </span>
            </>
          )}
        </button>

        {/* Aktionen + Regelwerk + Theme + Google Auth */}
        <div className="ml-auto flex flex-wrap items-center gap-1">
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
              Sicher?
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

          <span className="mx-0.5 h-6 w-px bg-slate-700/70" />

          <IconBtn icon={<BookOpen className="size-4" />} title="Grundregelwerk öffnen" tone="amber" onClick={p.onOpenRulebook} />
          <IconBtn
            icon={p.theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            title={p.theme === 'dark' ? 'Zum Light Mode wechseln' : 'Zum Dark Mode wechseln'}
            onClick={p.onToggleTheme}
          />

          {/* Google Auth & Cloud Sync */}
          {p.user ? (
            <div className="flex items-center gap-1 rounded-md border border-cyan-500/45 bg-[#0b0e14] py-0.5 pr-1 pl-1.5">
              {p.user.photoURL ? (
                <img src={p.user.photoURL} alt="" className="size-6 rounded-full border border-slate-600 object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="flex size-6 items-center justify-center rounded-full bg-cyan-500/20 font-mono text-[10px] font-bold text-cyan-300">
                  {(p.user.displayName || p.user.email || 'U')[0].toUpperCase()}
                </span>
              )}
              <span className="hidden max-w-28 truncate text-xs font-semibold text-slate-200 xl:inline" title={p.user.email ?? undefined}>
                {p.user.displayName || p.user.email}
              </span>
              <span
                title={
                  p.cloudSync === 'synced'
                    ? 'Mit Firestore synchronisiert'
                    : p.cloudSync === 'syncing'
                      ? 'Synchronisiere mit Firestore…'
                      : 'Cloud-Synchronisationsfehler'
                }
                className={cx(
                  'inline-flex items-center gap-1 px-1 font-mono text-[10px]',
                  p.cloudSync === 'synced' ? 'text-emerald-400' : p.cloudSync === 'syncing' ? 'text-amber-400' : 'text-red-400',
                )}
              >
                {p.cloudSync === 'syncing' ? (
                  <RefreshCw className="size-3.5 animate-spin" />
                ) : p.cloudSync === 'error' ? (
                  <CloudOff className="size-3.5" />
                ) : (
                  <Cloud className="size-3.5" />
                )}
              </span>
              <button
                type="button"
                title="Abmelden"
                aria-label="Abmelden"
                onClick={p.onLogout}
                className="flex size-7 items-center justify-center rounded text-slate-400 hover:bg-slate-800 hover:text-red-300"
              >
                <LogOut className="size-3.5" />
              </button>
            </div>
          ) : (
            <Btn small tone="cyan" onClick={p.onLogin} title="Mit Google anmelden und Charaktere in Firestore sichern">
              <LogIn className="size-3.5" />
              <span className="hidden sm:inline">Google Login</span>
            </Btn>
          )}

          <span
            title={p.saved ? 'Lokal gespeichert' : 'Speichern fehlgeschlagen'}
            className={cx('ml-0.5 hidden items-center gap-1 font-mono text-[10px] 2xl:flex', p.saved ? 'text-emerald-500/80' : 'text-red-400')}
          >
            <ShieldCheck className="size-3.5" />
            {p.saved ? 'LOKAL' : 'FEHLER'}
          </span>
        </div>
      </div>
    </header>
  );
}
