import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Bot, FileUp, Gauge, ListChecks, Package, Shield, Sparkles, X } from 'lucide-react';
import type { User } from 'firebase/auth';
import type { Character, ProbeRef } from './types';
import { SheetContext, type SheetContextValue } from './context';
import { exportAll, exportCharacter, loadState, parseImport, saveState, type StoredState } from './logic/storage';
import { duplicateCharacter } from './logic/character';
import {
  formatFirebaseError,
  loadCloudCharacters,
  loginWithGoogle,
  logoutGoogle,
  mergeCharacterStates,
  saveCloudCharacters,
  subscribeAuth,
  type CloudSyncState,
} from './logic/firebase';
import { TEMPLATES } from './data/templates';
import { Header } from './components/Header';
import { DiceHud } from './components/DiceHud';
import { CombatVitalsPanel, DeathWoundsPanel, WapPanel } from './components/VitalsPanel';
import { AttributesPanel } from './components/AttributesPanel';
import { WeaponsPanel } from './components/WeaponsPanel';
import { SkillsPanel } from './components/SkillsPanel';
import { KnowledgePanel } from './components/KnowledgePanel';
import { TechniquesPanel } from './components/TechniquesPanel';
import { CompanionsPanel, CyberwareDeckPanel, SpecialResourcesPanel } from './components/tabs/CompanionsTab';
import { ArmorPanel, CreditsInventoryPanel } from './components/tabs/InventoryTab';
import { CampaignNotesPanel, FactionsPanel, TraitsPanel } from './components/tabs/NotesTab';
import { RulebookView } from './components/RulebookView';
import { BeyondEmblem } from './components/BeyondLogo';
import { ThemeTransition, type ThemeMode } from './components/ThemeTransition';
import { Btn, cx } from './components/ui';

type MainMenu = 'charakter' | 'fertigkeiten' | 'kampf' | 'techniken' | 'drohnen' | 'inventar' | 'regelwerk';

const MENUS: { key: MainMenu; label: string; icon: React.ReactNode }[] = [
  { key: 'charakter', label: 'Charakter & Stats', icon: <Gauge className="size-4 shrink-0" /> },
  { key: 'fertigkeiten', label: 'Fertigkeiten & Wissen', icon: <ListChecks className="size-4 shrink-0" /> },
  { key: 'kampf', label: 'Kampf & Rüstung', icon: <Shield className="size-4 shrink-0" /> },
  { key: 'techniken', label: 'Techniken & Geist', icon: <Sparkles className="size-4 shrink-0" /> },
  { key: 'drohnen', label: 'Drohnen & Cyber', icon: <Bot className="size-4 shrink-0" /> },
  { key: 'inventar', label: 'Inventar & Notizen', icon: <Package className="size-4 shrink-0" /> },
  { key: 'regelwerk', label: 'Regelwerk', icon: <BookOpen className="size-4 shrink-0" /> },
];

const THEME_KEY = 'beyond_ttrpg_theme';

function loadInitialTheme(): ThemeMode {
  try {
    return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

function TemplatePicker({ onPick, onClose, onImport, firstRun }: { onPick: (key: string) => void; onClose?: () => void; onImport: (f: File) => void; firstRun: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="panel w-full max-w-3xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start gap-3">
          <BeyondEmblem className="mt-0.5 size-10 shrink-0" />
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
  const stateRef = useRef(state);
  stateRef.current = state;

  const [saved, setSaved] = useState(true);
  const [probe, setProbe] = useState<ProbeRef | null>(null);
  const [menu, setMenu] = useState<MainMenu>('charakter');
  const [picker, setPicker] = useState(false);
  const [toast, setToast] = useState<{ msg: string; error?: boolean } | null>(null);

  // Light / Dark Mode + Transition Screen
  const [theme, setTheme] = useState<ThemeMode>(loadInitialTheme);
  const [transition, setTransition] = useState<{ active: boolean; targetTheme: ThemeMode }>({
    active: false,
    targetTheme: 'dark',
  });

  useEffect(() => {
    document.documentElement.classList.toggle('theme-light', theme === 'light');
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const handleToggleTheme = () => {
    if (transition.active) return;
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTransition({ active: true, targetTheme: next });
    window.setTimeout(() => setTheme(next), 430);
    window.setTimeout(() => setTransition((t) => ({ ...t, active: false })), 960);
  };

  // Google Auth & Firestore Sync
  const [user, setUser] = useState<User | null>(null);
  const [cloudSync, setCloudSync] = useState<CloudSyncState>('offline');
  const skipNextCloudSave = useRef(false);

  useEffect(() => {
    return subscribeAuth(async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setCloudSync('offline');
        return;
      }
      setCloudSync('syncing');
      try {
        const cloud = await loadCloudCharacters(nextUser.uid);
        const merged = mergeCharacterStates(stateRef.current, cloud);
        skipNextCloudSave.current = true;
        setState(merged);
        await saveCloudCharacters(nextUser.uid, merged);
        setCloudSync('synced');
        setToast({ msg: `Cloud-Sync aktiv (${nextUser.displayName || nextUser.email}).` });
      } catch (err) {
        setCloudSync('error');
        setToast({ msg: formatFirebaseError(err), error: true });
      }
    });
  }, []);

  // LocalStorage Persistenz (250 ms)
  useEffect(() => {
    const t = setTimeout(() => setSaved(saveState(state)), 250);
    return () => clearTimeout(t);
  }, [state]);

  // Firestore Persistenz (700 ms, wenn eingeloggt)
  useEffect(() => {
    if (!user) return;
    if (skipNextCloudSave.current) {
      skipNextCloudSave.current = false;
      return;
    }
    setCloudSync('syncing');
    const t = setTimeout(async () => {
      try {
        await saveCloudCharacters(user.uid, state);
        setCloudSync('synced');
      } catch (err) {
        setCloudSync('error');
        setToast({ msg: formatFirebaseError(err), error: true });
      }
    }, 700);
    return () => clearTimeout(t);
  }, [state, user]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      setToast({ msg: formatFirebaseError(err), error: true });
    }
  };

  const handleLogout = async () => {
    try {
      await logoutGoogle();
      setToast({ msg: 'Abgemeldet. Lokale Daten bleiben gespeichert.' });
    } catch (err) {
      setToast({ msg: formatFirebaseError(err), error: true });
    }
  };

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
        <ThemeTransition active={transition.active} targetTheme={transition.targetTheme} />
        {toast && <Toast {...toast} />}
      </>
    );
  }

  const renderMenu = () => {
    switch (menu) {
      case 'charakter':
        return (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <div className="space-y-3 lg:col-span-7">
              <AttributesPanel />
            </div>
            <div className="space-y-3 lg:col-span-5">
              <CombatVitalsPanel />
            </div>
          </div>
        );
      case 'fertigkeiten':
        return (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <div className="space-y-3 lg:col-span-7">
              <SkillsPanel />
            </div>
            <div className="space-y-3 lg:col-span-5">
              <KnowledgePanel />
            </div>
          </div>
        );
      case 'kampf':
        return (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <div className="space-y-3 lg:col-span-7">
              <WeaponsPanel />
            </div>
            <div className="space-y-3 lg:col-span-5">
              <ArmorPanel />
              <DeathWoundsPanel />
            </div>
          </div>
        );
      case 'techniken':
        return (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <div className="space-y-3 lg:col-span-6">
              <TechniquesPanel />
              <SpecialResourcesPanel />
            </div>
            <div className="space-y-3 lg:col-span-6">
              <TraitsPanel />
              <WapPanel />
            </div>
          </div>
        );
      case 'drohnen':
        return (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <div className="space-y-3 lg:col-span-6">
              <CompanionsPanel />
            </div>
            <div className="space-y-3 lg:col-span-6">
              <CyberwareDeckPanel />
            </div>
          </div>
        );
      case 'inventar':
        return (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            <div className="space-y-3 lg:col-span-6">
              <CreditsInventoryPanel />
            </div>
            <div className="space-y-3 lg:col-span-6">
              <FactionsPanel />
              <CampaignNotesPanel />
            </div>
          </div>
        );
      case 'regelwerk':
        return <RulebookView />;
    }
  };

  return (
    <SheetContext.Provider value={ctx}>
      <div className="flex min-h-dvh flex-col">
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
          onOpenVitals={() => setMenu('charakter')}
          onOpenRulebook={() => setMenu('regelwerk')}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          user={user}
          cloudSync={cloudSync}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />

        {/* 7 Haupt-Menüs */}
        <nav aria-label="Hauptmenü" className="sticky top-0 z-20 border-b border-slate-700/70 bg-[#0b0e14]/95 px-3 py-1.5 backdrop-blur">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-7">
            {MENUS.map((m) => (
              <button
                type="button"
                key={m.key}
                onClick={() => setMenu(m.key)}
                className={cx(
                  'flex min-h-10 min-w-0 touch-manipulation items-center justify-center gap-1.5 rounded-md border px-2 text-xs font-bold tracking-wide transition-colors',
                  menu === m.key
                    ? 'border-amber-500/80 bg-amber-500/15 text-amber-300 shadow-[0_0_12px_-4px_rgba(245,158,11,0.5)]'
                    : 'border-slate-700/70 bg-[#151b26] text-slate-400 hover:border-slate-600 hover:text-slate-200',
                )}
              >
                {m.icon}
                <span className="truncate">{m.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Würfelpool-HUD (im Regelwerk ausgeblendet für maximale Lesefläche) */}
        {menu !== 'regelwerk' && (
          <div className="fixed inset-x-0 bottom-0 z-30 max-h-[45vh] overflow-y-auto border-t border-amber-500/40 bg-[#0f141d]/97 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] backdrop-blur lg:static lg:z-auto lg:max-h-none lg:shrink-0 lg:border-t-0 lg:border-b lg:border-slate-800 lg:shadow-none">
            <DiceHud />
          </div>
        )}

        {/* Inhalt des aktiven Menüs */}
        <main className="mx-auto w-full max-w-[1600px] flex-1 p-3 pb-48 lg:pb-6">{renderMenu()}</main>
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
      <ThemeTransition active={transition.active} targetTheme={transition.targetTheme} />
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
