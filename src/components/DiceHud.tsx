import { useState } from 'react';
import { Clover, Crosshair, Dices, Minus, Plus, RotateCcw, X, Zap } from 'lucide-react';
import { useSheet } from '../context';
import { calculateDicePool, resolveProbe, sumMods, type Modifier } from '../logic/dice';
import { MULTI_ACTIONS } from '../data/rules';
import { Btn, DIE_STYLES, cx } from './ui';

function MiniStep({ label, value, onChange, tone }: { label: string; value: number; onChange: (v: number) => void; tone: 'cyan' | 'red' }) {
  const color = tone === 'cyan' ? 'text-cyan-300 border-cyan-500/50' : 'text-red-300 border-red-500/50';
  return (
    <div className={cx('flex items-center gap-1 rounded-md border bg-[#0b0e14] p-0.5', color)}>
      <button type="button" aria-label={`${label} verringern`} onClick={() => onChange(value - 1)} className="flex size-9 touch-manipulation items-center justify-center rounded active:bg-slate-700">
        <Minus className="size-4" />
      </button>
      <span className="min-w-14 text-center font-mono text-xs font-bold tabular-nums">
        {value > 0 ? '+' : ''}
        {value} {label}
      </span>
      <button type="button" aria-label={`${label} erhöhen`} onClick={() => onChange(value + 1)} className="flex size-9 touch-manipulation items-center justify-center rounded active:bg-slate-700">
        <Plus className="size-4" />
      </button>
    </div>
  );
}

export function DiceHud() {
  const { char, update, probe, setProbe } = useSheet();
  const [tempGlkw, setTempGlkw] = useState(0);
  const [tempPew, setTempPew] = useState(0);
  const [multi, setMulti] = useState(0);
  const [autoOn, setAutoOn] = useState(true);

  const resolved = probe ? resolveProbe(char, probe) : null;

  const resetSituation = () => {
    setTempGlkw(0);
    setTempPew(0);
    setMulti(0);
  };

  if (!resolved) {
    return (
      <div className="flex min-h-14 items-center gap-3 px-3 py-2 text-sm text-slate-500">
        <Dices className="size-5 text-amber-500/70" />
        <span>
          <span className="font-semibold text-slate-400">Würfelpool-HUD:</span> Tippe auf ein Attribut, eine Fertigkeit, ein Wissen oder eine
          Waffe, um den Pool hier anzuzeigen. Würfel werden physisch am Tisch geworfen.
        </span>
      </div>
    );
  }

  const situational: Modifier[] = [];
  if (tempGlkw !== 0) situational.push({ label: 'Situation GlkW', glkw: tempGlkw });
  if (tempPew !== 0) situational.push({ label: 'Situation PEW', pew: tempPew });
  if (multi > 0) situational.push({ label: 'Mehrfachaktion', pew: multi });
  const all = [...(autoOn ? resolved.auto : []), ...situational];
  const mods = sumMods(resolved.base, all);
  const pool = calculateDicePool({ basePool: resolved.basePool, ...mods });
  const total = pool.now + pool.gow + pool.glkw;

  return (
    <div className="px-3 py-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {/* Probe */}
        <div className="min-w-0 max-w-[18rem]">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">
            <Crosshair className="size-3.5" /> Probe
          </div>
          <div className="truncate text-base font-bold leading-tight text-slate-100" title={resolved.label}>
            {resolved.label}
          </div>
          <div className="truncate font-mono text-[11px] text-slate-400">
            {resolved.formula} = {resolved.basePool}
          </div>
        </div>

        {/* Würfel */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['now', 'gow', 'glkw', 'pew'] as const).map((k) => (
            <div
              key={k}
              className={cx(
                'flex h-14 min-w-[4.5rem] flex-col items-center justify-center rounded-md border-2 px-2 transition-opacity',
                DIE_STYLES[k].cls,
                pool[k] === 0 && 'opacity-25',
              )}
            >
              <span className="font-mono text-2xl font-black leading-none tabular-nums">{pool[k]}</span>
              <span className="text-[9px] font-bold tracking-wider">
                {DIE_STYLES[k].name} · {DIE_STYLES[k].label}
              </span>
            </div>
          ))}
          <div className="ml-1 flex flex-col text-[10px] leading-tight text-slate-500">
            <span className="font-mono">Σ {total} W6</span>
            {pool.gowOverflowAsGlkw > 0 && <span className="text-cyan-400">GoW-Überschuss {pool.gowOverflowAsGlkw} → GlkW</span>}
          </div>
        </div>

        {/* Situations-Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <MiniStep label="GlkW" value={tempGlkw} onChange={setTempGlkw} tone="cyan" />
          <Btn
            tone="cyan"
            title="1 Glückswürfel aus dem Sitzungs-Glückspool einsetzen"
            disabled={char.vitals.luckPool.cur <= 0}
            onClick={() => {
              update((c) => void (c.vitals.luckPool.cur = Math.max(0, c.vitals.luckPool.cur - 1)));
              setTempGlkw((g) => g + 1);
            }}
          >
            <Clover className="size-4" /> 1 GlkW aus Pool ({char.vitals.luckPool.cur})
          </Btn>
          <MiniStep label="PEW" value={tempPew} onChange={setTempPew} tone="red" />
          <div className="flex items-center gap-1">
            {MULTI_ACTIONS.map((m) => (
              <Btn key={m.label} small tone={multi === m.pew && m.pew > 0 ? 'red' : 'slate'} active={multi === m.pew} onClick={() => setMulti(m.pew)}>
                {m.label}
                <span className="font-mono opacity-70">({m.pew} PEW)</span>
              </Btn>
            ))}
          </div>
          <Btn small onClick={resetSituation} title="Situationsmodifikatoren zurücksetzen">
            <RotateCcw className="size-3.5" /> Reset
          </Btn>
          <Btn small tone={autoOn ? 'amber' : 'slate'} onClick={() => setAutoOn((a) => !a)} title="Wunden-, Status-, BEL- und PRÄZ-Modifikatoren automatisch einrechnen">
            <Zap className="size-3.5" /> Auto-Mods {autoOn ? 'an' : 'aus'}
          </Btn>
          <button
            type="button"
            onClick={() => setProbe(null)}
            aria-label="Probe schließen"
            className="flex size-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* Aufschlüsselung */}
      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-400">
        <span className="font-mono">
          Basis: <span className="text-amber-300">{resolved.base.gow} GoW</span> · <span className="text-cyan-300">{resolved.base.glkw} GlkW</span> ·{' '}
          <span className="text-red-300">{resolved.base.pew} PEW</span>
        </span>
        {all.map((m, i) => (
          <span key={i} className={cx('font-mono', (m.pew ?? 0) > 0 ? 'text-red-300' : 'text-cyan-300')}>
            {m.label}: {m.glkw ? `${m.glkw > 0 ? '+' : ''}${m.glkw} GlkW ` : ''}
            {m.pew ? `${m.pew > 0 ? '+' : ''}${m.pew} PEW` : ''}
          </span>
        ))}
        {resolved.hints.map((h, i) => (
          <span key={`h${i}`} className="text-amber-200/80">
            ▸ {h}
          </span>
        ))}
      </div>
    </div>
  );
}
