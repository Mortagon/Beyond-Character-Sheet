import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { BookOpen, Bot, FileUp, Gauge, ListChecks, Package, Shield, Sparkles, X } from 'lucide-react';
import type { User } from 'firebase/auth';
import type { Character, ProbeRef } from './types';
import { SheetContext, type SheetContextValue } from './context';
import { exportAll, exportCharacter, loadState, mergeCharacterStates, parseImport, saveState, type StoredState } from './logic/storage';
import { duplicateCharacter } from './logic/character';
import type { CloudSyncState } from './logic/firebase';
import { diffCloud, isEmptyDiff, snapshotOf, type CloudSnapshot } from './logic/cloudSync';
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
import { BeyondEmblem } from './components/BeyondLogo';
import { ThemeTransition, type ThemeMode } from './components/ThemeTransition';
import { Btn, cx } from './components/ui';

// Regelwerk (inkl. großem GRW-Kodex) und Firebase SDK werden erst bei Bedarf nachgeladen.
const RulebookView = lazy(() => import('./components/RulebookView').then((m) => ({ default: m.RulebookView })));
const loadFirebase = () => import('./logic/firebase');

type MainMenu = 'charakter' | 'fertigkeiten' | 'kampf' | 'techniken' | 'drohnen' | 'inventar' | 'regelwerk';

const MENUS: { key: MainMenu; label: string; icon: ReactNode }[] = [
  { key: 'charakter', label: 'Charakter & Stats', icon: <Gauge className="size-4 shrink-0" /> },
  { key: 'fertigkeiten', label: 'Fertigkeiten & Wissen', icon: <ListChecks className="size-4 shrink-0" /> },
  { key: 'kampf', label: 'Kampf & Rüstung', icon: <Shield className="size-4 shrink-0" /> },
  { key: 'techniken', label: 'Techniken & Geist', icon: <Sparkles className="size-4 shrink-0" /> },
  { key: 'drohnen', label: 'Drohnen & Cyber', icon: <Bot className="size-4 shrink-0" /> },
  { key: 'inventar', label: 'Inventar & Notizen', icon: <Package className="size-4 shrink-0" /> },
  { key: 'regelwerk', label: 'Regelwerk', icon: <BookOpen className="size-4 shrink-0" /> },
];

const THEME_KEY = 'beyond_ttrpg_theme';
/** Zeitpunkt, an dem das Theme hinter dem deckenden Übergangsbildschirm umgeschaltet wird */
const THEME_SWAP_MS = 430;
/** Gesamtdauer des Übergangs (muss zur `beyondFade`-Animation in ThemeTransition passen) */
const THEME_TRANSITION_MS = 960;
const LOCAL_SAVE_DEBOUNCE_MS = 250;
const CLOUD_SAVE_DEBOUNCE_MS = 1000;

function loadInitialTheme(): ThemeMode {
  try {
    return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

function buildTemplate(key: string): Character {
  return (TEMPLATES.find((t) => t.key === key) ?? TEMPLATES[0]).build();
}

function TemplatePicker({ onPick, onClose, onImport, firstRun }: { onPick: (key: string) => void; onClose?: () => void; onImport: (f: File) => void; firstRun: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-picker-title"
        className="panel w-full max-w-3xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start gap-3">
          <BeyondEmblem className="mt-0.5 size-10 shrink-0" />
          <div className="flex-1">
            <h2 id="template-picker-title" className="font-mono text-lg font-black tracking-[0.25em] text-amber-400">
              {firstRun ? 'WILLKOMMEN BEI BEYOND' : 'NEUER CHARAKTER'}
            </h2>
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

/** Einheitliches 12-Spalten-Layout für die Hauptmenüs */
function TwoColumns({ left, right, split = 7 }: { left: ReactNode; right: ReactNode; split?: 6 | 7 }) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
      <div className={cx('space-y-3', split === 7 ? 'lg:col-span-7' : 'lg:col-span-6')}>{left}</div>
      <div className={cx('space-y-3', split === 7 ? 'lg:col-span-5' : 'lg:col-span-6')}>{right}</div>
    </div>
  );
}

function MenuContent({ menu }: { menu: MainMenu }) {
  switch (menu) {
    case 'charakter':
      return <TwoColumns left={<AttributesPanel />} right={<CombatVitalsPanel />} />;
    case 'fertigkeiten':
      return <TwoColumns left={<SkillsPanel />} right={<KnowledgePanel />} />;
    case 'kampf':
      return (
        <TwoColumns
          left={<WeaponsPanel />}
          right={
            <>
              <ArmorPanel />
              <DeathWoundsPanel />
            </>
          }
        />
      );
    case 'techniken':
      return (
        <TwoColumns
          split={6}
          left={
            <>
              <TechniquesPanel />
              <SpecialResourcesPanel />
            </>
          }
          right={
            <>
              <TraitsPanel />
              <WapPanel />
            </>
          }
        />
      );
    case 'drohnen':
      return <TwoColumns split={6} left={<CompanionsPanel />} right={<CyberwareDeckPanel />} />;
    case 'inventar':
      return (
        <TwoColumns
          split={6}
          left={<CreditsInventoryPanel />}
          right={
            <>
              <FactionsPanel />
              <CampaignNotesPanel />
            </>
          }
        />
      );
    case 'regelwerk':
      return (
        <Suspense fallback={<p className="p-6 text-center font-mono text-xs text-slate-500">Regelwerk wird geladen…</p>}>
          <RulebookView />
        </Suspense>
      );
  }
}

export default function App() {
  const [state, setState] = useState<StoredState>(() => loadState());
  const stateRef = useRef(state);
  stateRef.current = state;

  const [saved, setSaved] = useState(true);
  const [probe, setProbe] = useState<ProbeRef | null>(null);
  const [menu, setMenu] = useState<MainMenu>('charakter');
  const [picker, setPicker] = useState(false);
  const [toast, setToast] = useState<{ msg: string; error?: boolean; info?: boolean } | null>(null);

  // ---------- Light / Dark Mode + Transition Screen ----------
  const [theme, setTheme] = useState<ThemeMode>(loadInitialTheme);
  const [transition, setTransition] = useState<{ active: boolean; targetTheme: ThemeMode }>({ active: false, targetTheme: 'dark' });
  const themeTimers = useRef<number[]>([]);

  useEffect(() => {
    document.documentElement.classList.toggle('theme-light', theme === 'light');
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => () => themeTimers.current.forEach((t) => window.clearTimeout(t)), []);

  const handleToggleTheme = () => {
    if (transition.active) return;
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    if (prefersReducedMotion()) {
      setTheme(next);
      return;
    }
    setTransition({ active: true, targetTheme: next });
    themeTimers.current = [
      window.setTimeout(() => setTheme(next), THEME_SWAP_MS),
      window.setTimeout(() => setTransition((t) => ({ ...t, active: false })), THEME_TRANSITION_MS),
    ];
  };

  // ---------- Google Auth & Firestore Sync ----------
  const [user, setUser] = useState<User | null>(null);
  const [cloudSync, setCloudSync] = useState<CloudSyncState>('offline');
  /** UID, für die der Merge Cloud ↔ lokal abgeschlossen ist. Erst danach darf in die Cloud geschrieben werden. */
  const [cloudReadyUid, setCloudReadyUid] = useState<string | null>(null);
  /** Spiegel von cloudReadyUid für asynchronen Code (veraltete Saves nach Logout/Kontowechsel verwerfen). */
  const cloudUidRef = useRef<string | null>(null);
  /** Zuletzt mit Firestore abgeglichener Stand (Fingerprint je Charakter) – nur Änderungen werden geschrieben. */
  const lastCloudSnapshot = useRef<CloudSnapshot | null>(null);
  /** Serialisiert Cloud-Saves, damit sich Batches nicht überholen. */
  const cloudQueue = useRef<Promise<void>>(Promise.resolve());
  /** Sofort-Ausführung des anstehenden (debounced) Cloud-Saves, z. B. wenn der Tab versteckt wird. */
  const pendingCloudSave = useRef<(() => void) | null>(null);
  const cloudErrorShown = useRef(false);

  const showCloudError = useCallback(async (err: unknown) => {
    setCloudSync('error');
    if (cloudErrorShown.current) return; // Fehler-Toast nicht bei jedem Debounce-Zyklus wiederholen
    cloudErrorShown.current = true;
    const fb = await loadFirebase();
    setToast({ msg: fb.formatFirebaseError(err), error: true });
  }, []);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    let authSeq = 0;

    loadFirebase()
      .then((fb) => {
        if (cancelled) return;
        unsubscribe = fb.subscribeAuth(async (nextUser) => {
          const seq = ++authSeq;
          setUser(nextUser);
          setCloudReadyUid(null);
          cloudUidRef.current = null;
          lastCloudSnapshot.current = null;
          cloudErrorShown.current = false;
          if (!nextUser) {
            setCloudSync('offline');
            return;
          }
          setCloudSync('syncing');
          try {
            const cloud = await fb.loadCloudCharacters(nextUser.uid); // inkl. Migration aus dem Legacy-Format
            if (cancelled || seq !== authSeq) return; // inzwischen ab-/umgemeldet
            lastCloudSnapshot.current = cloud.snapshot;
            cloudUidRef.current = nextUser.uid;
            setState((prev) => mergeCharacterStates(prev, cloud.state));
            setCloudReadyUid(nextUser.uid); // Save-Effekt lädt den gemergten Stand hoch, falls er abweicht
            setToast({ msg: `Cloud-Sync aktiv (${nextUser.displayName || nextUser.email}).` });
          } catch (err) {
            if (!cancelled && seq === authSeq) void showCloudError(err);
          }
        });
      })
      .catch(() => {
        if (!cancelled) setToast({ msg: 'Cloud-Funktionen konnten nicht geladen werden (offline?).', error: true });
      });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [showCloudError]);

  // LocalStorage-Persistenz (debounced) + sofortiges Sichern beim Verlassen/Verstecken der Seite
  useEffect(() => {
    const t = setTimeout(() => setSaved(saveState(state)), LOCAL_SAVE_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [state]);

  useEffect(() => {
    const flush = () => {
      saveState(stateRef.current);
      pendingCloudSave.current?.(); // Cloud-Write nicht erst nach dem Debounce (Tablet: App-Wechsel)
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  /** Schreibt den aktuellen Stand (nur Differenzen) für `uid` in die Cloud. Läuft seriell. */
  const queueCloudSave = useCallback(
    (uid: string) => {
      cloudQueue.current = cloudQueue.current.then(async () => {
        const prev = lastCloudSnapshot.current;
        if (cloudUidRef.current !== uid || !prev) return; // inzwischen ab-/umgemeldet
        const current = stateRef.current;
        const diff = diffCloud(current, prev);
        if (isEmptyDiff(diff)) {
          setCloudSync('synced');
          return;
        }
        try {
          const fb = await loadFirebase();
          await fb.saveCloudChanges(uid, diff);
          if (cloudUidRef.current !== uid) return;
          lastCloudSnapshot.current = snapshotOf(current);
          cloudErrorShown.current = false;
          // Während des Writes weiter bearbeitet? Dann bleibt der Status bis zum nächsten Save auf „syncing“.
          if (isEmptyDiff(diffCloud(stateRef.current, lastCloudSnapshot.current))) setCloudSync('synced');
        } catch (err) {
          if (cloudUidRef.current === uid) void showCloudError(err);
        }
      });
    },
    [showCloudError],
  );

  // Firestore-Persistenz (debounced, nur nach abgeschlossenem Merge und nur geänderte Charaktere)
  useEffect(() => {
    const prev = lastCloudSnapshot.current;
    if (!user || cloudReadyUid !== user.uid || !prev) return;
    if (isEmptyDiff(diffCloud(state, prev))) {
      setCloudSync('synced');
      return;
    }
    setCloudSync('syncing');
    const uid = user.uid;
    const run = () => {
      window.clearTimeout(timer);
      if (pendingCloudSave.current === run) pendingCloudSave.current = null;
      queueCloudSave(uid);
    };
    const timer = window.setTimeout(run, CLOUD_SAVE_DEBOUNCE_MS);
    pendingCloudSave.current = run;
    return () => {
      window.clearTimeout(timer);
      if (pendingCloudSave.current === run) pendingCloudSave.current = null;
    };
  }, [state, user, cloudReadyUid, queueCloudSave]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.info ? 2500 : 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const handleLogin = async () => {
    try {
      const fb = await loadFirebase();
      await fb.loginWithGoogle();
    } catch (err) {
      const fb = await loadFirebase().catch(() => null);
      if (fb?.isLoginCancelled(err)) {
        // Popup vom User geschlossen/abgebrochen: dezenter Hinweis statt Fehler-Alarm
        setToast({ msg: fb.formatFirebaseError(err), info: true });
        return;
      }
      setToast({ msg: fb ? fb.formatFirebaseError(err) : 'Login nicht möglich (offline?).', error: true });
    }
  };

  const handleLogout = async () => {
    try {
      const fb = await loadFirebase();
      await fb.logoutGoogle();
      setToast({ msg: 'Abgemeldet. Lokale Daten bleiben gespeichert.' });
    } catch (err) {
      const fb = await loadFirebase().catch(() => null);
      setToast({ msg: fb ? fb.formatFirebaseError(err) : 'Abmelden fehlgeschlagen.', error: true });
    }
  };

  // ---------- Charakterverwaltung ----------
  const active = state.characters.find((c) => c.id === state.activeId) ?? state.characters[0] ?? null;

  const update = useCallback((recipe: (draft: Character) => void) => {
    setState((prev) => {
      // Gleiche Auflösung wie `active`: ungültige activeId fällt auf den ersten Charakter zurück
      const id = prev.characters.some((c) => c.id === prev.activeId) ? prev.activeId : prev.characters[0]?.id;
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
      const imported = parseImport(text, new Set(stateRef.current.characters.map((c) => c.id)));
      addCharacters(imported);
      setPicker(false);
      setToast({ msg: `${imported.length} Charakter${imported.length > 1 ? 'e' : ''} importiert.` });
    } catch (err) {
      const reason = err instanceof SyntaxError ? 'Keine gültige JSON-Datei.' : err instanceof Error ? err.message : 'Ungültige Datei';
      setToast({ msg: `Import fehlgeschlagen: ${reason}`, error: true });
    }
  };

  const ctx = useMemo<SheetContextValue | null>(() => (active ? { char: active, update, probe, setProbe } : null), [active, update, probe]);

  const overlays = (
    <>
      <ThemeTransition active={transition.active} targetTheme={transition.targetTheme} />
      {toast && <Toast {...toast} />}
    </>
  );

  if (!active || !ctx) {
    return (
      <>
        <TemplatePicker firstRun onPick={(k) => addCharacters([buildTemplate(k)])} onImport={handleImport} />
        {overlays}
      </>
    );
  }

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
                aria-current={menu === m.key ? 'page' : undefined}
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

        {/* Würfelpool-HUD (im Regelwerk ausgeblendet für maximale Lesefläche).
            key = Charakter-ID: Situationsmodifikatoren gehören zum jeweiligen Charakter und werden beim Wechsel zurückgesetzt. */}
        {menu !== 'regelwerk' && (
          <div className="fixed inset-x-0 bottom-0 z-30 max-h-[45vh] overflow-y-auto border-t border-amber-500/40 bg-[#0f141d]/97 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] backdrop-blur lg:static lg:z-auto lg:max-h-none lg:shrink-0 lg:border-t-0 lg:border-b lg:border-slate-800 lg:shadow-none">
            <DiceHud key={active.id} />
          </div>
        )}

        {/* Inhalt des aktiven Menüs */}
        <main className="mx-auto w-full max-w-[1600px] flex-1 p-3 pb-48 lg:pb-6">
          <MenuContent menu={menu} />
        </main>
      </div>

      {picker && (
        <TemplatePicker
          firstRun={false}
          onClose={() => setPicker(false)}
          onImport={handleImport}
          onPick={(k) => {
            addCharacters([buildTemplate(k)]);
            setPicker(false);
          }}
        />
      )}
      {overlays}
    </SheetContext.Provider>
  );
}

function Toast({ msg, error, info }: { msg: string; error?: boolean; info?: boolean }) {
  return (
    <div
      role={error ? 'alert' : 'status'}
      className={cx(
        'fixed top-3 left-1/2 z-[60] -translate-x-1/2 rounded-md border px-4 py-2 text-sm font-semibold shadow-xl',
        error
          ? 'border-red-500/70 bg-red-950/95 text-red-200'
          : info
            ? 'border-slate-600 bg-[#151b26] text-slate-300'
            : 'border-emerald-500/60 bg-emerald-950/95 text-emerald-200',
      )}
    >
      {msg}
    </div>
  );
}
