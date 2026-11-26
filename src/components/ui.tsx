import { useEffect, useState, type ReactNode } from 'react';
import { ChevronDown, ChevronRight, Minus, Plus } from 'lucide-react';
import type { DicePool } from '../logic/dice';

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

/* ---------- Panel ---------- */

export function Panel({
  title,
  icon,
  actions,
  children,
  collapsible = false,
  defaultOpen = true,
  className,
  bodyClassName,
}: {
  title: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
  bodyClassName?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={cx('panel', className)}>
      <header className="flex items-center gap-2 border-b border-slate-700/60 px-3 py-2">
        <button
          type="button"
          className={cx('flex min-h-8 flex-1 items-center gap-2 text-left', !collapsible && 'cursor-default')}
          onClick={() => collapsible && setOpen((o) => !o)}
        >
          {collapsible && (open ? <ChevronDown className="size-4 text-slate-500" /> : <ChevronRight className="size-4 text-slate-500" />)}
          {icon && <span className="text-amber-400">{icon}</span>}
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-200">{title}</h2>
        </button>
        {actions && <div className="flex items-center gap-1.5">{actions}</div>}
      </header>
      {open && <div className={cx('p-3', bodyClassName)}>{children}</div>}
    </section>
  );
}

/* ---------- Buttons ---------- */

type Tone = 'slate' | 'amber' | 'cyan' | 'red' | 'green';

const toneBtn: Record<Tone, string> = {
  slate: 'border-slate-600/80 bg-slate-800/60 text-slate-200 hover:bg-slate-700/70 active:bg-slate-600',
  amber: 'border-amber-500/60 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 active:bg-amber-500/30',
  cyan: 'border-cyan-500/60 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 active:bg-cyan-500/30',
  red: 'border-red-500/60 bg-red-500/10 text-red-300 hover:bg-red-500/20 active:bg-red-500/30',
  green: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 active:bg-emerald-500/30',
};

export function Btn({
  children,
  onClick,
  tone = 'slate',
  className,
  title,
  disabled,
  small,
  active,
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: Tone;
  className?: string;
  title?: string;
  disabled?: boolean;
  small?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        'inline-flex touch-manipulation select-none items-center justify-center gap-1.5 rounded-md border font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        small ? 'min-h-8 px-2 text-[11px]' : 'min-h-9 px-3 text-xs',
        toneBtn[tone],
        active && 'ring-2 ring-amber-400/70',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function IconBtn({
  icon,
  onClick,
  title,
  tone = 'slate',
  className,
}: {
  icon: ReactNode;
  onClick: () => void;
  title: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cx(
        'inline-flex size-9 shrink-0 touch-manipulation items-center justify-center rounded-md border transition-colors',
        toneBtn[tone],
        className,
      )}
    >
      {icon}
    </button>
  );
}

/* ---------- Inputs ---------- */

export function NumInput({
  value,
  onChange,
  min = -999999,
  max = 999999,
  className,
  title,
  step = 1,
  float = false,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  className?: string;
  title?: string;
  step?: number;
  float?: boolean;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => {
    const n = float ? parseFloat(draft.replace(',', '.')) : parseInt(draft, 10);
    if (Number.isFinite(n)) {
      const clamped = Math.min(max, Math.max(min, n));
      onChange(clamped);
      setDraft(String(clamped));
    } else setDraft(String(value));
  };
  return (
    <input
      type="text"
      inputMode={float ? 'decimal' : 'numeric'}
      title={title}
      step={step}
      value={draft}
      onClick={(e) => e.stopPropagation()}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
      }}
      className={cx('field w-14 text-center font-mono tabular-nums', className)}
    />
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value)}
      className={cx('field w-full text-sm placeholder:text-slate-600', className)}
    />
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  rows = 3,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cx('field w-full resize-y py-2 text-sm leading-relaxed placeholder:text-slate-600', className)}
    />
  );
}

export function Select<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T;
  options: readonly (T | { value: T; label: string })[];
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <select
      value={value}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value as T)}
      className={cx('field text-sm', className)}
    >
      {options.map((o) => {
        const v = typeof o === 'string' ? o : o.value;
        const l = typeof o === 'string' ? o : o.label;
        return (
          <option key={v} value={v}>
            {l}
          </option>
        );
      })}
    </select>
  );
}

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cx('flex flex-col gap-1', className)}>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

/* ---------- Stepper ---------- */

export function Stepper({
  value,
  onChange,
  min = -999,
  max = 999,
  size = 'md',
  tone = 'slate',
  className,
  editable = true,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  tone?: Tone;
  className?: string;
  editable?: boolean;
}) {
  const btn = size === 'sm' ? 'size-9' : 'size-11';
  const set = (v: number) => onChange(Math.min(max, Math.max(min, v)));
  const valueColor: Record<Tone, string> = {
    slate: 'text-slate-100',
    amber: 'text-amber-300',
    cyan: 'text-cyan-300',
    red: 'text-red-300',
    green: 'text-emerald-300',
  };
  return (
    <div className={cx('inline-flex items-center gap-1', className)} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        aria-label="verringern"
        onClick={() => set(value - 1)}
        disabled={value <= min}
        className={cx(
          btn,
          'inline-flex touch-manipulation items-center justify-center rounded-md border border-slate-600/80 bg-slate-800/70 text-slate-300 active:bg-slate-600 disabled:opacity-30',
        )}
      >
        <Minus className="size-4" />
      </button>
      {editable ? (
        <NumInput
          value={value}
          onChange={set}
          min={min}
          max={max}
          className={cx(size === 'sm' ? 'h-9 w-11 text-sm' : 'h-11 w-12 text-base', 'font-bold', valueColor[tone])}
        />
      ) : (
        <span className={cx('w-10 text-center font-mono text-base font-bold tabular-nums', valueColor[tone])}>{value}</span>
      )}
      <button
        type="button"
        aria-label="erhöhen"
        onClick={() => set(value + 1)}
        disabled={value >= max}
        className={cx(
          btn,
          'inline-flex touch-manipulation items-center justify-center rounded-md border border-slate-600/80 bg-slate-800/70 text-slate-300 active:bg-slate-600 disabled:opacity-30',
        )}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}

/** Aktuell / Max Tracker mit Steppern */
export function TrackerControl({
  label,
  cur,
  max,
  onCur,
  onMax,
  tone = 'slate',
  allowOver = false,
  min = 0,
}: {
  label: string;
  cur: number;
  max: number;
  onCur: (v: number) => void;
  onMax: (v: number) => void;
  tone?: Tone;
  allowOver?: boolean;
  min?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="label">{label}</span>
      <div className="flex items-center gap-1.5">
        <Stepper value={cur} onChange={onCur} min={min} max={allowOver ? 9999 : Math.max(max, 0)} size="sm" tone={tone} />
        <span className="font-mono text-slate-500">/</span>
        <NumInput value={max} onChange={onMax} min={0} className="h-9 w-12 text-sm" />
      </div>
    </div>
  );
}

/* ---------- Pips ---------- */

export function Pips({
  total,
  filled,
  onChange,
  tone = 'amber',
  size = 'md',
  max = 40,
}: {
  total: number;
  filled: number;
  onChange: (v: number) => void;
  tone?: 'amber' | 'cyan' | 'red' | 'green' | 'slate';
  size?: 'sm' | 'md';
  max?: number;
}) {
  const on: Record<string, string> = {
    amber: 'bg-amber-400 border-amber-300 shadow-[0_0_6px_rgba(245,158,11,0.6)]',
    cyan: 'bg-cyan-400 border-cyan-300 shadow-[0_0_6px_rgba(6,182,212,0.6)]',
    red: 'bg-red-500 border-red-400 shadow-[0_0_6px_rgba(239,68,68,0.6)]',
    green: 'bg-emerald-400 border-emerald-300',
    slate: 'bg-slate-200 border-white',
  };
  const n = Math.min(total, max);
  const dim = size === 'sm' ? 'size-6' : 'size-8';
  return (
    <div className="flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
      {Array.from({ length: n }, (_, i) => (
        <button
          type="button"
          key={i}
          aria-label={`${i + 1}`}
          onClick={() => onChange(filled === i + 1 ? i : i + 1)}
          className={cx(
            dim,
            'touch-manipulation rounded-sm border transition-all',
            i < filled ? on[tone] : 'border-slate-600 bg-slate-900/80',
          )}
        />
      ))}
      {total > max && <span className="self-center font-mono text-xs text-slate-500">+{total - max}</span>}
    </div>
  );
}

/* ---------- Würfel-Badges ---------- */

export const DIE_STYLES = {
  now: { label: 'NOW', name: 'WEISS', cls: 'bg-slate-200 text-slate-900 border-white' },
  gow: { label: 'GoW', name: 'GOLD', cls: 'bg-amber-400 text-amber-950 border-amber-200' },
  glkw: { label: 'GlkW', name: 'CYAN', cls: 'bg-cyan-400 text-cyan-950 border-cyan-200' },
  pew: { label: 'PEW', name: 'ROT', cls: 'bg-red-500 text-white border-red-300' },
} as const;

export function DiceBadges({ pool, size = 'sm', hideZero = true }: { pool: DicePool; size?: 'xs' | 'sm' | 'lg'; hideZero?: boolean }) {
  const entries = (['now', 'gow', 'glkw', 'pew'] as const).filter((k) => !hideZero || pool[k] > 0);
  if (entries.length === 0) return <span className="font-mono text-xs text-slate-600">0</span>;
  return (
    <div className="flex items-center gap-1">
      {entries.map((k) => (
        <span
          key={k}
          title={`${pool[k]} ${DIE_STYLES[k].label}`}
          className={cx(
            'inline-flex items-center justify-center rounded border font-mono font-black tabular-nums',
            DIE_STYLES[k].cls,
            size === 'xs' && 'h-5 min-w-5 px-1 text-[11px]',
            size === 'sm' && 'h-6 min-w-6 px-1 text-xs',
            size === 'lg' && 'h-12 min-w-14 gap-1.5 px-2.5 text-2xl',
          )}
        >
          {pool[k]}
          {size === 'lg' && <span className="text-[10px] font-bold tracking-wider opacity-80">{DIE_STYLES[k].label}</span>}
        </span>
      ))}
    </div>
  );
}

/** Kleine GoW/GlkW/PEW-Eingabe */
export function ModInputs({
  gow,
  glkw,
  pew,
  onChange,
}: {
  gow: number;
  glkw: number;
  pew: number;
  onChange: (key: 'gow' | 'glkw' | 'pew', v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <label className="flex items-center gap-1">
        <span className="text-[10px] font-bold text-amber-400">GoW</span>
        <NumInput value={gow} onChange={(v) => onChange('gow', v)} min={0} max={30} className="h-8 w-10 border-amber-500/40 text-sm text-amber-300" />
      </label>
      <label className="flex items-center gap-1">
        <span className="text-[10px] font-bold text-cyan-400">GlkW</span>
        <NumInput value={glkw} onChange={(v) => onChange('glkw', v)} min={-30} max={30} className="h-8 w-10 border-cyan-500/40 text-sm text-cyan-300" />
      </label>
      <label className="flex items-center gap-1">
        <span className="text-[10px] font-bold text-red-400">PEW</span>
        <NumInput value={pew} onChange={(v) => onChange('pew', v)} min={-30} max={30} className="h-8 w-10 border-red-500/40 text-sm text-red-300" />
      </label>
    </div>
  );
}

export function EmptyHint({ children }: { children: ReactNode }) {
  return <p className="rounded-md border border-dashed border-slate-700 px-3 py-4 text-center text-xs text-slate-500">{children}</p>;
}

/** Inline-Bestätigung für Löschen (kein Modal) */
export function ConfirmDelete({ onConfirm, label = 'Löschen' }: { onConfirm: () => void; label?: string }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <Btn
      tone="red"
      small
      onClick={() => {
        if (armed) onConfirm();
        else setArmed(true);
      }}
    >
      {armed ? 'Sicher?' : label}
    </Btn>
  );
}
