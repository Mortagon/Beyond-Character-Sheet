import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bot, FileUp, Hexagon, LayoutGrid, ListChecks, NotebookPen, Package, Swords, X } from 'lucide-react';
import type { Character, ProbeRef } from './types';
import { SheetContext, type SheetContextValue } from './context';
import { exportAll, exportCharacter, loadState, parseImport, saveState, type StoredState } from './logic/storage';
import { duplicateCharacter } from './logic/character';
import { TEMPLATES } from './data/templates';
import { Header } from './components/Header';
import { DiceHud } from './components/DiceHud';
import { VitalsPanel } from './components/VitalsPanel';
import { AttributesPanel } from './components/AttributesPanel';
import { WeaponsPanel } from './components/WeaponsPanel';
import { SkillsPanel } from './components/SkillsPanel';
import { KnowledgePanel } from './components/KnowledgePanel';
import { TechniquesPanel } from './components/TechniquesPanel';
import { CompanionsTab } from './components/tabs/CompanionsTab';
import { InventoryTab } from './components/tabs/InventoryTab';
import { NotesTab } from './components/tabs/NotesTab';
import { Btn, cx } from './components/ui';

type RightTab = 'tech' | 'inventar' | 'notizen';

const RIGHT_TABS: { key: RightTab; label: string; icon: React.ReactNode }[] = [
  { key: 'tech', label: 'Cyber & Bot', icon: <Bot className="size-3.5 shrink-0" /> },
  { key: 'inventar', label: 'Inventar & ₡', icon: <Package className="size-3.5 shrink-0" /> },
  { key: 'notizen', label: 'Notiz & Ruf', icon: <NotebookPen className="size-3.5 shrink-0" /> },
];

const MOBILE_COLS = [
  { label: 'Attribute & Waffen', icon: <Swords className="size-4" /> },
  { label: 'Fertigkeiten', icon: <ListChecks className="size-4" /> },
  { label: 'Module', icon: <LayoutGrid className="size-4" /> },
];

function TemplatePicker({ onPick, onClose, onImport, firstRun }: { onPick: (key: string) => void; onClose?: () => void; onImport: (f: File) => void; firstRun: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="panel w-full max-w-3xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start gap-3">
          <Hexagon className="mt-0.5 size-8 shrink-0 text-amber-400" />
          <div className="flex-1">
            <h2 className="font-mono text-lg font-black tracking-[0.25em] text-amber-400">{firstRun ? 'WILLKOMMEN BEI BEYOND' : 'NEUER CHARAKTER'}</h2>
            <p className="text-sm text-slate-400">Wähle eine Vorlage. Alle Werte lassen sich danach frei bearbeiten.</p>
          </div>
          {onClose && (
            <button type="button" aria-label="Schließen" onClick={onClose} className="flex size-10 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800">
              <X className="size-5" />
            </button>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {TEMPLATES.map((t, i) => (
            <button
              type="button"
              key={t.key}
              onClick={() => onPick(t.key)}
              className={cx(
                'min-h-24 touch-manipulation rounded-lg border p-4 text-left transition-all hover:-translate-y-0.5',
                i === 0 ? 'border-amber-500/70 bg-amber-500/10 hover:bg-amber-500/15' : 'border-slate-700 bg-[#0f141d] hover:border-cyan-500/60',
              )}
            >
              <div className={cx('text-base font-bold', i === 0 ? 'text-amber-300' : 'text-slate-100')}>{t.name}</div>
              <div className="mt-1 text-xs leading-relaxed text-slate-400">{t.description}</div>
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-700/60 pt-4">
          <span className="text-xs text-slate-500">Bereits einen Charakter als JSON gesichert?</span>
          <Btn tone="cyan" onClick={() => fileRef.current?.click()}>
            <FileUp className="size-4" /> JSON importieren
          </Btn>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImport(f);
              e.target.value = '';
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [state, setState] = useState<StoredState>(() => loadState());
  const [saved, setSaved] = useState(true);
  const [probe, setProbe] = useState<ProbeRef | null>(null);
  const [rightTab, setRightTab] = useState<RightTab>('tech');
  const [mobileCol, setMobileCol] = useState(0);
  const [picker, setPicker] = useState(false);
  const [toast, setToast] = useState<{ msg: string; error?: boolean } | null>(null);

  // Persistenz (leicht entprellt)
  useEffect(() => {
    const t = setTimeout(() => setSaved(saveState(state)), 250);
    return () => clearTimeout(t);
  }, [state]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const active = state.characters.find((c) => c.id === state.activeId) ?? state.characters[0] ?? null;

  const update = useCallback((recipe: (draft: Character) => void) => {
    setState((prev) => {
      const id = prev.activeId ?? prev.characters[0]?.id;
      return {
        ...prev,
        characters: prev.characters.map((c) => {
          if (c.id !== id) return c;
          const draft = structuredClone(c);
          recipe(draft);
          draft.updatedAt = Date.now();
          return draft;
        }),
      };
    });
  }, []);

  const addCharacters = (chars: Character[]) => {
    setState((prev) => ({ ...prev, characters: [...prev.characters, ...chars], activeId: chars[0]?.id ?? prev.activeId }));
    setProbe(null);
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const imported = parseImport(text, new Set(state.characters.map((c) => c.id)));
      addCharacters(imported);
      setPicker(false);
      setToast({ msg: `${imported.length} Charakter${imported.length > 1 ? 'e' : ''} importiert.` });
    } catch (err) {
      setToast({ msg: `Import fehlgeschlagen: ${err instanceof Error ? err.message : 'Ungültige Datei'}`, error: true });
    }
  };

  const ctx = useMemo<SheetContextValue | null>(() => (active ? { char: active, update, probe, setProbe } : null), [active, update, probe]);

  if (!active || !ctx) {
    return (
      <>
        <TemplatePicker firstRun onPick={(k) => addCharacters([TEMPLATES.find((t) => t.key === k)!.build()])} onImport={handleImport} />
        {toast && <Toast {...toast} />}
      </>
    );
  }

  const col1 = (
    <>
      <AttributesPanel />
      <VitalsPanel />
      <WeaponsPanel />
    </>
  );
  const col2 = (
    <>
      <SkillsPanel />
      <KnowledgePanel />
      <TechniquesPanel />
    </>
  );
  const col3 = (
    <>
      <div className="sticky top-0 z-10 -mx-1 flex gap-1 bg-[#0b0e14]/95 px-1 pb-2 backdrop-blur">
        {RIGHT_TABS.map((t) => (
          <button
            type="button"
            key={t.key}
            onClick={() => setRightTab(t.key)}
            title={t.label}
            className={cx(
              'flex min-h-11 min-w-0 flex-1 touch-manipulation items-center justify-center gap-1 rounded-md border px-1.5 text-[10px] font-bold uppercase tracking-tight xl:gap-1.5 xl:px-2 xl:text-[11px] xl:tracking-wide',
              rightTab === t.key ? 'border-amber-500/70 bg-amber-500/15 text-amber-300' : 'border-slate-700 bg-[#151b26] text-slate-400 hover:text-slate-200',
            )}
          >
            {t.icon}
            <span className="truncate">{t.label}</span>
          </button>
        ))}
      </div>
      {rightTab === 'tech' && <CompanionsTab />}
      {rightTab === 'inventar' && <InventoryTab />}
      {rightTab === 'notizen' && <NotesTab />}
    </>
  );
  const cols = [col1, col2, col3];

  return (
    <SheetContext.Provider value={ctx}>
      <div className="flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
        <Header
          characters={state.characters}
          activeId={active.id}
          saved={saved}
          onSelect={(id) => {
            setState((p) => ({ ...p, activeId: id }));
            setProbe(null);
          }}
          onNew={() => setPicker(true)}
          onDuplicate={() => {
            addCharacters([duplicateCharacter(active)]);
            setToast({ msg: `„${active.name}“ dupliziert.` });
          }}
          onDelete={() => {
            setState((p) => {
              const rest = p.characters.filter((c) => c.id !== active.id);
              return { ...p, characters: rest, activeId: rest[0]?.id ?? null };
            });
            setProbe(null);
            setToast({ msg: `„${active.name}“ gelöscht.` });
          }}
          onExport={() => exportCharacter(active)}
          onExportAll={() => exportAll(state.characters)}
          onImport={handleImport}
        />

        {/* Würfelpool-HUD: Tablet oben fixiert, Mobil als Bottom-Bar */}
        <div className="fixed inset-x-0 bottom-0 z-30 max-h-[45vh] overflow-y-auto border-t border-amber-500/40 bg-[#0f141d]/97 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] backdrop-blur lg:static lg:z-auto lg:max-h-none lg:shrink-0 lg:border-t-0 lg:border-b lg:shadow-none">
          <DiceHud />
        </div>

        {/* Mobile-Spaltenwahl */}
        <nav className="sticky top-0 z-20 flex gap-1 border-b border-slate-800 bg-[#0b0e14]/95 p-1.5 backdrop-blur lg:hidden">
          {MOBILE_COLS.map((m, i) => (
            <button
              type="button"
              key={m.label}
              onClick={() => setMobileCol(i)}
              className={cx(
                'flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-md text-xs font-bold',
                mobileCol === i ? 'bg-amber-500/15 text-amber-300' : 'text-slate-500',
              )}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </nav>

        <main className="grid flex-1 grid-cols-1 gap-3 p-3 pb-48 lg:min-h-0 lg:grid-cols-12 lg:pb-3">
          {cols.map((content, i) => (
            <div key={i} className={cx('scroll-col space-y-3 lg:col-span-4 lg:min-h-0 lg:overflow-x-hidden lg:overflow-y-auto lg:pr-1', mobileCol === i ? 'block' : 'hidden lg:block')}>
              {content}
            </div>
          ))}
        </main>
      </div>
      {picker && (
        <TemplatePicker
          firstRun={false}
          onClose={() => setPicker(false)}
          onImport={handleImport}
          onPick={(k) => {
            addCharacters([TEMPLATES.find((t) => t.key === k)!.build()]);
            setPicker(false);
          }}
        />
      )}
      {toast && <Toast {...toast} />}
    </SheetContext.Provider>
  );
}

function Toast({ msg, error }: { msg: string; error?: boolean }) {
  return (
    <div
      role="status"
      className={cx(
        'fixed top-3 left-1/2 z-[60] -translate-x-1/2 rounded-md border px-4 py-2 text-sm font-semibold shadow-xl',
        error ? 'border-red-500/70 bg-red-950/95 text-red-200' : 'border-emerald-500/60 bg-emerald-950/95 text-emerald-200',
      )}
    >
      {msg}
    </div>
  );
}
