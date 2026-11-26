import { Activity, BedDouble, Brain, HeartPulse, RefreshCcw, Shield, Sparkles } from 'lucide-react';
import { useSheet } from '../context';
import { WAP_GRADES } from '../data/rules';
import { effectiveBel, startedWapGrades } from '../logic/dice';
import { Btn, NumInput, Panel, Stepper, cx } from './ui';

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
            'size-9 touch-manipulation rounded-full border-2 transition-all',
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

export function VitalsPanel() {
  const { char, update } = useSheet();
  const v = char.vitals;
  const dying = v.lp.cur <= 0;
  const grades = startedWapGrades(v.wap);
  const currentGrade = WAP_GRADES.find((g) => v.wap >= g.from && v.wap <= g.to);
  const bel = effectiveBel(char);
  const bleeding = !!char.statuses.blutend;

  return (
    <Panel title="Vitalwerte & Geist" icon={<HeartPulse className="size-4" />} collapsible>
      <div className="space-y-4">
        {/* Todeswürfe */}
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
          <p className="mt-1 text-[11px] text-slate-500">Jeder gescheiterte Todeswurf: Wunde an W4-Trefferzone (siehe Wundzonen).</p>
        </div>

        {/* WAP */}
        <div>
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <span className="label flex items-center gap-1.5">
              <Brain className="size-3.5 text-red-400" /> Wahnsinnspunkte (WAP)
            </span>
            <Stepper size="sm" tone="red" value={v.wap} min={0} max={36} onChange={(n) => update((c) => void (c.vitals.wap = n))} />
          </div>
          <div className="grid grid-cols-6 gap-1">
            {WAP_GRADES.map((g) => (
              <div key={g.grade} className={cx('rounded border p-1', v.wap >= g.from ? 'border-red-500/60 bg-red-950/30' : 'border-slate-700/60')}>
                <div className="mb-1 flex items-center justify-between font-mono text-[9px] text-slate-400">
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
          <div className="mt-1.5 flex flex-wrap gap-x-4 font-mono text-[11px] text-slate-400">
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
        </div>

        {/* Rüstung Kurzinfo */}
        <div className="flex flex-wrap items-center gap-3 rounded-md border border-slate-700/60 bg-[#0f141d] p-2 font-mono text-xs">
          <Shield className="size-4 text-cyan-400" />
          <span>
            NRW <b className="text-slate-100">{char.armor.nrw}</b>
          </span>
          <span>
            RW <b className="text-slate-100">{char.armor.rwIst}</b>/{char.armor.rwSoll}
          </span>
          <span>
            HÄR <b className="text-slate-100">{char.armor.haerte}</b>
          </span>
          <span title="effBEL = max(0, BEL − ⌊STR/2⌋)">
            eff. BEL <b className={bel > 0 ? 'text-red-400' : 'text-slate-100'}>{bel}</b>
            <span className="text-slate-500"> (PEW körperl., nicht Fernkampf)</span>
          </span>
        </div>

        {/* EP */}
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="label flex items-center gap-1">
              <Sparkles className="size-3 text-amber-400" /> EP gesamt
            </span>
            <NumInput value={v.epTotal} min={0} onChange={(n) => update((c) => void (c.vitals.epTotal = n))} className="w-20 text-amber-300" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="label">EP ausgegeben</span>
            <NumInput value={v.epSpent} min={0} onChange={(n) => update((c) => void (c.vitals.epSpent = n))} className="w-20" />
          </label>
          <div className="flex flex-col gap-1">
            <span className="label">Verfügbar</span>
            <span className="flex h-9 items-center font-mono text-lg font-bold text-amber-400">{v.epTotal - v.epSpent}</span>
          </div>
        </div>

        {/* Rasten */}
        <div className="flex flex-wrap gap-1.5 border-t border-slate-700/50 pt-3">
          <Btn small onClick={() => update((c) => void (c.vitals.reactions.cur = c.vitals.reactions.max))}>
            <RefreshCcw className="size-3.5" /> Neue Runde (REA)
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
            <Activity className="size-3.5" /> Neue Sitzung
          </Btn>
        </div>
      </div>
    </Panel>
  );
}
