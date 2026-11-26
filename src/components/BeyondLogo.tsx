import { useId } from 'react';

/**
 * Originalgetreues Beyond-Emblem (GRW S. 1 & S. 190):
 * Konzentrische goldene Orbitalringe mit Planetenknoten und verschlungenem Doppelring im Zentrum.
 */
export function BeyondEmblem({ className = 'size-24', spin = false }: { className?: string; spin?: boolean }) {
  const gradId = useId();
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="35%" stopColor="#eab308" />
          <stop offset="70%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#facc15" />
        </linearGradient>
      </defs>

      <g className={spin ? 'origin-center animate-[spin_18s_linear_infinite]' : undefined}>
        {/* 5 konzentrische Orbitalringe */}
        <circle cx="100" cy="100" r="90" stroke={`url(#${gradId})`} strokeWidth="2.8" />
        <circle cx="100" cy="100" r="72" stroke={`url(#${gradId})`} strokeWidth="2.4" />
        <circle cx="100" cy="100" r="54" stroke={`url(#${gradId})`} strokeWidth="2.2" />
        <circle cx="100" cy="100" r="36" stroke={`url(#${gradId})`} strokeWidth="2.2" />

        {/* Orbital-Knoten */}
        <circle cx="59" cy="64" r="5.5" fill="#0b0e14" stroke={`url(#${gradId})`} strokeWidth="2.5" className="beyond-logo-fill" />
        <circle cx="131" cy="52" r="4.5" fill="#0b0e14" stroke={`url(#${gradId})`} strokeWidth="2.4" className="beyond-logo-fill" />
        <circle cx="169" cy="120" r="5.5" fill="#0b0e14" stroke={`url(#${gradId})`} strokeWidth="2.5" className="beyond-logo-fill" />
        <circle cx="146" cy="177" r="4.8" fill="#0b0e14" stroke={`url(#${gradId})`} strokeWidth="2.4" className="beyond-logo-fill" />

        {/* Doppel-Mond-Knoten unten links */}
        <g transform="translate(49, 136)">
          <circle cx="0" cy="0" r="10.5" fill="#0b0e14" stroke={`url(#${gradId})`} strokeWidth="2.5" className="beyond-logo-fill" />
          <circle cx="0" cy="0" r="5" fill="#0b0e14" stroke={`url(#${gradId})`} strokeWidth="2.2" className="beyond-logo-fill" />
          <circle cx="10.5" cy="8.5" r="3.2" fill="#0b0e14" stroke={`url(#${gradId})`} strokeWidth="2" className="beyond-logo-fill" />
        </g>
      </g>

      {/* Verschlungenes Doppelring-Zentrum */}
      <g stroke={`url(#${gradId})`} strokeWidth="2.8">
        <circle cx="92" cy="100" r="12" />
        <circle cx="108" cy="100" r="12" />
      </g>
    </svg>
  );
}

/**
 * Originalgetreuer BEYØND-Schriftzug mit durchgehendem Pfeil und Blitz-Schnitt im O (GRW S. 1).
 */
export function BeyondWordmark({ className = 'w-64', tone = 'auto' }: { className?: string; tone?: 'light' | 'dark' | 'auto' }) {
  const colorClass = tone === 'light' ? 'text-slate-950' : tone === 'dark' ? 'text-slate-100' : 'text-slate-100 light-ink';
  return (
    <svg viewBox="0 0 420 96" fill="none" className={`${className} ${colorClass}`} role="img" aria-label="BEYOND">
      {/* B */}
      <path
        d="M18 22 H52 C65 22 72 29 72 39 C72 45 68 49 62 51 C69 53 74 58 74 66 C74 76 66 83 52 83 H18 V68 H48 C54 68 57 65 57 61 C57 57 54 54 48 54 H18 V44 H46 C52 44 55 41 55 37 C55 33 52 31 46 31 H18 Z"
        fill="currentColor"
      />
      {/* E (Stencil 3 Balken) */}
      <rect x="88" y="22" width="46" height="12" rx="6" fill="currentColor" />
      <rect x="88" y="45" width="38" height="11" rx="5.5" fill="currentColor" />
      <rect x="88" y="71" width="46" height="12" rx="6" fill="currentColor" />
      {/* Y */}
      <path d="M146 22 H163 L177 45 L191 22 H208 L184 58 V83 H170 V58 Z" fill="currentColor" />
      {/* Ø mit Blitz-Schnitt */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M242 21 C261 21 274 34 274 52.5 C274 71 261 84 242 84 C223 84 210 71 210 52.5 C210 34 223 21 242 21 Z M242 33 C231 33 224 41 224 52.5 C224 64 231 72 242 72 C253 72 260 64 260 52.5 C260 41 253 33 242 33 Z"
        fill="currentColor"
      />
      <path d="M274 8 L234 55 L247 51 L212 92 L245 48 L232 52 Z" fill="currentColor" />
      {/* N */}
      <path d="M289 83 V22 H303 L331 61 V22 H345 V83 H331 L303 44 V83 Z" fill="currentColor" />
      {/* D */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M362 22 H385 C404 22 415 34 415 52.5 C415 71 404 83 385 83 H362 V69 H384 C395 69 401 62 401 52.5 C401 43 395 36 384 36 H362 Z"
        fill="currentColor"
      />

      {/* Durchbohrender Speer / Pfeil durch das gesamte Wort */}
      <g>
        <line x1="8" y1="50" x2="386" y2="50" stroke="#f59e0b" strokeWidth="2.5" />
        <line x1="12" y1="53.5" x2="380" y2="53.5" stroke="currentColor" strokeWidth="1.2" opacity="0.65" />
        {/* Pfeilspitze rechts */}
        <path d="M380 43 L401 51.5 L380 60 L385 51.5 Z" fill="#f59e0b" />
        {/* Befiederung links */}
        <path d="M12 45 L26 50 L12 55 Z" fill="#f59e0b" />
      </g>
    </svg>
  );
}
