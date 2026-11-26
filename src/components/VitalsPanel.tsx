import { Activity, AlertTriangle, Bandage, BedDouble, Brain, HeartPulse, RefreshCcw, Shield, Sparkles } from 'lucide-react';
import { useSheet } from '../context';
import { STATUSES, WAP_GRADES, WOUNDS } from '../data/rules';
import { activeStatusCount, chestWoundLpMalus, effectiveBel, startedWapGrades } from '../logic/dice';
import { Btn, NumInput, Panel, StatTile, Stepper, cx } from './ui';

function DeathPips({ count, filled, onChange, tone }: { count: number; filled: number; onChange: (n: number) => void; tone: 'green' | 'red' }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: count }, (_, i) => (
        <button
          type="button"
          key={i}
          aria-label={`${i + 1}`}
          onClick={() => onChange(filled === i + 1 ? i : i + 1)}
          className={cx(
            'size-8 touch-manipulation rounded-full border-2 transition-all',
            i < filled
              ? tone === 'green'
                ? 'border-emerald-300 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                : 'border-red-300 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]'
              : 'border-slate-600 bg-slate-900',
          )}
        />
      ))}
    </div>
  );
}

/** Menü 1 (Rechts): Einheitliche Vital-, Kampf-, Rast-, EP- & Status-Übersicht */
export function CombatVitalsPanel() {
  const { char, update } = useSheet();
  const v = char.vitals;
  const maxLp = Math.max(0, v.lp.max - chestWoundLpMalus(char));
  const dying = v.lp.cur <= 0;
  const activeCount = activeStatusCount(char);
  const bel = effectiveBel(char);

  return (
    <div className="space-y-3">
      <Panel
        title="Vital- & Kampfwerte"
        icon={<HeartPulse className="size-4" />}
        actions={
          <div className="flex items-center gap-1">
            <Btn small onClick={() => update((c) => void (c.vitals.reactions.cur = c.vitals.reactions.max))}>
              <RefreshCcw className="size-3.5" /> Neue Runde
            </Btn>
            <Btn
              small
              tone="amber"
              title="Anstrengung zurücksetzen, Reaktionen & Techniken-Zähler auffüllen, Schilde voll"
              onClick={() =>
                update((c) => {
                  Object.values(c.attributes).forEach((a) => (a.spentEffort = 0));
                  c.vitals.reactions.cur = c.vitals.reactions.max;
                  c.vitals.shields.cur = c.vitals.shields.max;
                  c.techniques.forEach((t) => (t.usesCurrent = t.usesMax));
                })
              }
            >
              <BedDouble className="size-3.5" /> Lange Rast
            </Btn>
            <Btn
              small
              tone="cyan"
              title="Glückspool und Vorteil-/Nachteil-Nutzungen auffüllen"
              onClick={() =>
                update((c) => {
                  c.vitals.luckPool.cur = c.vitals.luckPool.max;
                  c.traits.forEach((t) => (t.usesCur = t.usesMax));
                })
              }
            >
              <Activity className="size-3.5" /> Sitzung
            </Btn>
          </div>
        }
        bodyClassName="p-2.5 space-y-3"
      >
        <div className="grid grid-cols-2 gap-2">
          <StatTile label="Lebenspunkte (LP)" sub={`Max ${maxLp}${chestWoundLpMalus(char) > 0 ? ` (−${chestWoundLpMalus(char)})` : ''}`} tone={dying ? 'red' : 'green'}>
            <Stepper
              size="sm"
              tone={dying ? 'red' : v.lp.cur < maxLp / 2 ? 'amber' : 'green'}
              value={v.lp.cur}
              min={-99}
              max={maxLp}
              onChange={(n) => update((c) => void (c.vitals.lp.cur = n))}
            />
            <NumInput value={v.lp.max} min={1} onChange={(n) => update((c) => void (c.vitals.lp.max = n))} title="Max LP" className="ml-auto h-8 min-h-8 w-12 text-xs text-slate-400" />
          </StatTile>

          <StatTile label="Temporäre LP" sub="Zähigkeit / Bonus">
            <Stepper size="sm" value={v.tempLp} min={0} onChange={(n) => update((c) => void (c.vitals.tempLp = n))} />
          </StatTile>

          <StatTile label="Schilde (SW)" sub={`Max ${v.shields.max}`} tone="cyan">
            <Stepper size="sm" tone="cyan" value={v.shields.cur} min={0} max={v.shields.max} onChange={(n) => update((c) => void (c.vitals.shields.cur = n))} />
            <Btn
              small
              tone="cyan"
              className="ml-auto"
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
          </StatTile>

          <StatTile label="Glückspool / Vorteil" sub="Sitzungs-GlkW" tone="cyan">
            <Stepper size="sm" tone="cyan" value={v.luckPool.cur} min={0} max={v.luckPool.max} onChange={(n) => update((c) => void (c.vitals.luckPool.cur = n))} />
            <span className="font-mono text-xs text-slate-500">/</span>
            <NumInput value={v.luckPool.max} min={0} onChange={(n) => update((c) => void (c.vitals.luckPool.max = n))} className="h-8 min-h-8 w-11 text-xs" />
          </StatTile>

          <StatTile label="Verteidigung (VW)" sub={`Passiv /2 = ${Math.floor(v.vw / 2)}`}>
            <Stepper size="sm" value={v.vw} min={0} onChange={(n) => update((c) => void (c.vitals.vw = n))} />
          </StatTile>

          <StatTile label="Reaktionen (REA)" sub={`Max ${v.reactions.max}`}>
            <Stepper size="sm" value={v.reactions.cur} min={0} max={v.reactions.max} onChange={(n) => update((c) => void (c.vitals.reactions.cur = n))} />
            <NumInput value={v.reactions.max} min={0} onChange={(n) => update((c) => void (c.vitals.reactions.max = n))} title="Max REA" className="ml-auto h-8 min-h-8 w-11 text-xs text-slate-400" />
          </StatTile>

          <StatTile label="Adrenalin (ADR)" tone="amber">
            <Stepper size="sm" tone="amber" value={v.adr} min={0} max={99} onChange={(n) => update((c) => void (c.vitals.adr = n))} />
          </StatTile>

          <StatTile label="Erschöpfung (ERP)" tone={v.erp > 0 ? 'red' : 'slate'}>
            <Stepper size="sm" tone={v.erp > 0 ? 'red' : 'slate'} value={v.erp} min={0} max={99} onChange={(n) => update((c) => void (c.vitals.erp = n))} />
          </StatTile>
        </div>

        {/* Kompakte 3er-Leiste für INI / PW / GW */}
        <div className="grid grid-cols-3 gap-2">
          <StatTile label="Initiative (INI)">
            <NumInput value={v.ini} onChange={(n) => update((c) => void (c.vitals.ini = n))} className="h-8 min-h-8 w-full text-sm font-bold" />
          </StatTile>
          <StatTile label="Phys. Wid. (PW)">
            <NumInput value={v.pw} onChange={(n) => update((c) => void (c.vitals.pw = n))} className="h-8 min-h-8 w-full text-sm font-bold" />
          </StatTile>
          <StatTile label="Geist. Wid. (GW)">
            <NumInput value={v.gw} onChange={(n) => update((c) => void (c.vitals.gw = n))} className="h-8 min-h-8 w-full text-sm font-bold" />
          </StatTile>
        </div>

        {/* Rüstung & EP Kurzzeile */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="flex flex-wrap items-center gap-2.5 rounded-md border border-slate-700/60 bg-[#0f141d] px-2.5 py-2 font-mono text-xs">
            <Shield className="size-4 shrink-0 text-cyan-400" />
            <span>NRW <b>{char.armor.nrw}</b></span>
            <span>RW <b>{char.armor.rwIst}</b>/{char.armor.rwSoll}</span>
            <span>HÄR <b>{char.armor.haerte}</b></span>
            <span title="effBEL = max(0, BEL − ⌊STR/2⌋)">
              eff.BEL <b className={bel > 0 ? 'text-red-400' : 'text-slate-100'}>{bel}</b>
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-md border border-slate-700/60 bg-[#0f141d] px-2.5 py-1.5">
            <span className="label flex items-center gap-1">
              <Sparkles className="size-3 text-amber-400" /> EP
            </span>
            <div className="flex items-center gap-1.5 text-xs">
              <NumInput value={v.epTotal} min={0} onChange={(n) => update((c) => void (c.vitals.epTotal = n))} title="EP Gesamt" className="h-8 min-h-8 w-14 text-amber-300" />
              <span className="text-slate-600">−</span>
              <NumInput value={v.epSpent} min={0} onChange={(n) => update((c) => void (c.vitals.epSpent = n))} title="EP Ausgegeben" className="h-8 min-h-8 w-14" />
              <span className="font-mono text-sm font-bold text-amber-400">= {v.epTotal - v.epSpent}</span>
            </div>
          </div>
        </div>
      </Panel>

      {/* Status-Effekte */}
      <Panel
        title={`Zustände & Status${activeCount > 0 ? ` (${activeCount} aktiv)` : ''}`}
        icon={<AlertTriangle className={cx('size-4', activeCount > 0 && 'text-red-400')} />}
        bodyClassName="p-2.5"
      >
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => {
            const on = !!char.statuses[s.key];
            return (
              <button
                type="button"
                key={s.key}
                title={s.rule}
                onClick={() => update((c) => void (c.statuses[s.key] = !on))}
                className={cx(
                  'min-h-8 touch-manipulation rounded-md border px-2.5 py-1 text-left text-xs font-semibold transition-all',
                  on
                    ? s.tone === 'red'
                      ? 'border-red-400 bg-red-500/20 text-red-200 shadow-[0_0_10px_-2px_rgba(239,68,68,0.6)]'
                      : s.tone === 'cyan'
                        ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_10px_-2px_rgba(6,182,212,0.6)]'
                        : 'border-amber-400 bg-amber-500/20 text-amber-200 shadow-[0_0_10px_-2px_rgba(245,158,11,0.6)]'
                    : 'border-slate-700/80 bg-[#0f141d] text-slate-400 hover:border-slate-600 hover:text-slate-200',
                )}
              >
                {s.name}
                {on && <span className="ml-1.5 font-normal opacity-85">· {s.rule}</span>}
              </button>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

/** Menü 3 (Rechts): Todeswürfe & Wundzonen */
export function DeathWoundsPanel() {
  const { char, update } = useSheet();
  const v = char.vitals;
  const dying = v.lp.cur <= 0;
  const bleeding = !!char.statuses.blutend;

  return (
    <Panel title="Todeswürfe & Wundzonen" icon={<Bandage className="size-4" />} bodyClassName="p-2.5 space-y-3">
      <div
        className={cx(
          'rounded-md border p-2.5 transition-colors',
          dying ? 'border-red-500/70 bg-red-950/40 shadow-[0_0_20px_-6px_rgba(239,68,68,0.8)]' : 'border-slate-700/60 bg-[#0f141d]',
        )}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className={cx('label', dying && 'text-red-400')}>Todeswürfe {dying && '– LP ≤ 0! (gerade = Erfolg)'}</span>
          <Btn small onClick={() => update((c) => void ((c.vitals.deathSuccess = 0), (c.vitals.deathFail = 0)))}>
            Zurücksetzen
          </Btn>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-400">Erfolge</span>
            <DeathPips count={3} filled={v.deathSuccess} tone="green" onChange={(n) => update((c) => void (c.vitals.deathSuccess = n))} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-red-400">Fehlschläge</span>
            <DeathPips count={3} filled={v.deathFail} tone="red" onChange={(n) => update((c) => void (c.vitals.deathFail = n))} />
          </div>
        </div>
        {v.deathSuccess >= 3 && <p className="mt-1 text-xs text-emerald-400">Stabilisiert.</p>}
        {v.deathFail >= 3 && <p className="mt-1 text-xs font-bold text-red-400">Tot – oder Verkrüppelung wählen, um zu überleben.</p>}
        {bleeding && <p className="mt-1 text-xs text-red-300">Blutend: −1 verfügbarer Todeswurf.</p>}
        <p className="mt-1 text-[11px] text-slate-500">Jeder gescheiterte Todeswurf erzeugt eine Wunde an W4-Trefferzone.</p>
      </div>

      <div className="space-y-1.5">
        {WOUNDS.map((w) => {
          const st = char.wounds[w.key];
          const active = st.count > 0 || st.crippled;
          return (
            <div key={w.key} className={cx('rounded-md border p-2', active ? 'border-red-500/60 bg-red-950/30' : 'border-slate-700/60 bg-[#0f141d]')}>
              <div className="flex items-center gap-2">
                <span className={cx('min-w-0 flex-1 text-sm font-semibold', active ? 'text-red-200' : 'text-slate-300')}>{w.name}</span>
                {st.count > 0 && w.pewPer > 0 && (
                  <span className="font-mono text-xs font-bold text-red-400">
                    +{st.count * w.pewPer} PEW {w.attrs.join('/')}
                  </span>
                )}
                {st.count > 0 && w.key === 'Brust' && <span className="font-mono text-xs text-red-400">LP −{st.count}</span>}
                {st.count > 0 && w.key === 'Intern' && <span className="font-mono text-xs text-red-400">+{st.count} Schaden</span>}
                <Stepper size="sm" tone={st.count > 0 ? 'red' : 'slate'} value={st.count} min={0} max={9} onChange={(n) => update((c) => void (c.wounds[w.key].count = n))} />
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <p className="min-w-0 flex-1 text-[11px] leading-snug text-slate-500">{w.rule}</p>
                <button
                  type="button"
                  onClick={() => update((c) => void (c.wounds[w.key].crippled = !st.crippled))}
                  className={cx(
                    'min-h-8 shrink-0 rounded border px-2 text-[10px] font-bold uppercase',
                    st.crippled ? 'border-red-400 bg-red-500/25 text-red-200' : 'border-slate-700 text-slate-500',
                  )}
                  title="Verkrüppelung: unheilbar, Zone für Cyberware gesperrt"
                >
                  Verkrüppelt
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/** Menü 4 (Rechts): Wahnsinnspunkte (WAP) */
export function WapPanel() {
  const { char, update } = useSheet();
  const v = char.vitals;
  const grades = startedWapGrades(v.wap);
  const currentGrade = WAP_GRADES.find((g) => v.wap >= g.from && v.wap <= g.to);

  return (
    <Panel
      title="Wahnsinnspunkte (WAP)"
      icon={<Brain className="size-4 text-red-400" />}
      actions={<Stepper size="sm" tone="red" value={v.wap} min={0} max={36} onChange={(n) => update((c) => void (c.vitals.wap = n))} />}
      bodyClassName="p-2.5 space-y-2"
    >
      <div className="grid grid-cols-6 gap-1.5">
        {WAP_GRADES.map((g) => (
          <div key={g.grade} className={cx('rounded border p-1.5', v.wap >= g.from ? 'border-red-500/60 bg-red-950/30' : 'border-slate-700/60 bg-[#0f141d]')}>
            <div className="mb-1 flex items-center justify-between font-mono text-[10px] text-slate-400">
              <span>G{g.grade}</span>
              <span className={g.mod < 0 ? 'text-red-400' : 'text-cyan-400'}>{g.mod > 0 ? `+${g.mod}` : g.mod}</span>
            </div>
            <div className="grid grid-cols-3 gap-0.5">
              {Array.from({ length: 6 }, (_, i) => {
                const n = g.from + i;
                return (
                  <button
                    type="button"
                    key={n}
                    aria-label={`WAP ${n}`}
                    onClick={() => update((c) => void (c.vitals.wap = c.vitals.wap === n ? n - 1 : n))}
                    className={cx('aspect-square min-h-5 touch-manipulation rounded-[2px] border', n <= v.wap ? 'border-red-300 bg-red-500' : 'border-slate-700 bg-slate-900')}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 font-mono text-[11px] text-slate-400">
        <span>
          Grad: <span className="text-slate-100">{currentGrade?.grade ?? 0}</span>
        </span>
        <span>
          Mentaler Widerstand:{' '}
          <span className={cx((currentGrade?.mod ?? 0) < 0 ? 'text-red-400' : 'text-cyan-400')}>
            {currentGrade ? (currentGrade.mod > 0 ? `+${currentGrade.mod}` : currentGrade.mod) : '±0'}
          </span>
        </span>
        <span>
          Angefangene Grade: <span className="text-red-400">{grades}</span> → +{grades} PEW auf BEH gg. Verrücktheiten
        </span>
      </div>
    </Panel>
  );
}
