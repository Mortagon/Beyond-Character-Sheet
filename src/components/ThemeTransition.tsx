import { BeyondEmblem, BeyondWordmark } from './BeyondLogo';
import { cx } from './ui';

export type ThemeMode = 'dark' | 'light';

export function ThemeTransition({
  active,
  targetTheme,
}: {
  active: boolean;
  targetTheme: ThemeMode;
}) {
  if (!active) return null;
  const toLight = targetTheme === 'light';

  return (
    <div
      role="status"
      aria-live="polite"
      className={cx(
        'fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden',
        toLight ? 'bg-slate-100 text-slate-900' : 'bg-[#0b0e14] text-slate-100',
        'animate-[beyondFade_950ms_ease-in-out_forwards]',
      )}
    >
      {/* Subtile topografische Hintergrundlinien wie im GRW */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: toLight
            ? 'radial-gradient(circle at center, rgba(217,119,6,0.22), transparent 65%)'
            : 'radial-gradient(circle at center, rgba(245,158,11,0.18), transparent 65%)',
        }}
      />

      <div className="relative flex flex-col items-center gap-5 px-6 text-center">
        <BeyondEmblem className="size-36 drop-shadow-[0_0_24px_rgba(245,158,11,0.35)] sm:size-44" spin />
        <BeyondWordmark className="w-64 sm:w-80" tone={toLight ? 'light' : 'dark'} />
        <div className="flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1 font-mono text-xs font-bold uppercase tracking-[0.25em] text-amber-500">
          <span className="size-2 animate-ping rounded-full bg-amber-400" />
          {toLight ? 'Tag-Modus aktiviert' : 'Nacht-Modus aktiviert'}
        </div>
      </div>
    </div>
  );
}
