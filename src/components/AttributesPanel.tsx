import { useState } from 'react';
import { Gauge, Pencil, PencilOff } from 'lucide-react';
import { isSameProbe, useSheet } from '../context';
import { ATTRS } from '../data/rules';
import { derivedGow, effectiveAttr, quickPool, woundPewFor } from '../logic/dice';
import { Btn, DiceBadges, ModInputs, Panel, Stepper, cx } from './ui';

export function AttributesPanel() {
  const { char, update, probe, setProbe } = useSheet();
  const [edit, setEdit] = useState(false);
  const list = ATTRS.filter((a) => a.key !== 'PSI' || char.psiEnabled);
  const effStr = effectiveAttr(char, 'STR');
  const effKon = effectiveAttr(char, 'KON');

  return (
    <Panel
      title="Attribute & Abgeleitete Werte"
      icon={<Gauge className="size-4" />}
      actions={
        <>
          <Btn small tone={char.psiEnabled ? 'cyan' : 'slate'} onClick={() => update((c) => void (c.psiEnabled = !c.psiEnabled))} title="9. Attribut Psionik ein-/ausblenden">
            PSI {char.psiEnabled ? 'an' : 'aus'}
          </Btn>
          <Btn small tone={edit ? 'amber' : 'slate'} onClick={() => setEdit((e) => !e)} title="Würfelmodifikatoren bearbeiten">
            {edit ? <PencilOff className="size-3.5" /> : <Pencil className="size-3.5" />}
            {edit ? 'Fertig' : 'Mods'}
          </Btn>
        </>
      }
      bodyClassName="p-2.5"
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {list.map((meta) => {
          const a = char.attributes[meta.key];
          const d = char.derived[meta.key];
          const eff = effectiveAttr(char, meta.key);
          const derPool = quickPool(char, { type: 'derived', key: meta.key })!;
          const attrActive = isSameProbe(probe, { type: 'attr', key: meta.key });
          const derActive = isSameProbe(probe, { type: 'derived', key: meta.key });
          const wound = woundPewFor(char, meta.key);
          const hasMods = a.gow > 0 || a.glkw !== 0 || a.pew !== 0;

          return (
            <div key={meta.key} className="flex flex-col rounded-md border border-slate-700/70 bg-[#0f141d]">
              {/* Hauptzeile: Basisattribut – keine doppelte Zahl mehr */}
              <div className="flex items-center gap-2 p-2">
                <button
                  type="button"
                  onClick={() => setProbe({ type: 'attr', key: meta.key })}
                  title={`${meta.name}-Probe im Würfelpool-HUD anzeigen`}
                  className={cx(
                    'flex min-h-9 min-w-0 flex-1 touch-manipulation flex-col justify-center rounded px-1.5 py-0.5 text-left transition-colors hover:bg-slate-800/70',
                    attrActive && 'focus-ring bg-amber-500/10',
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-black text-amber-400">{meta.key}</span>
                    <span className="truncate text-sm font-semibold text-slate-100">{meta.name}</span>
                  </div>
                  {(hasMods || a.spentEffort > 0 || wound > 0) && (
                    <div className="mt-0.5 flex flex-wrap gap-1.5 font-mono text-[10px]">
                      {a.gow > 0 && <span className="text-amber-300">+{a.gow}G</span>}
                      {a.glkw !== 0 && <span className="text-cyan-300">{a.glkw > 0 ? `+${a.glkw}` : a.glkw}Glk</span>}
                      {a.pew !== 0 && <span className="text-red-300">+{a.pew}P</span>}
                      {a.spentEffort > 0 && <span className="text-red-400">eff.{eff}</span>}
                      {wound > 0 && <span className="text-red-400">W+{wound}P</span>}
                    </div>
                  )}
                </button>
                <Stepper
                  size="sm"
                  value={a.value}
                  min={0}
                  max={20}
                  tone="amber"
                  onChange={(n) =>
                    update((c) => {
                      const attr = c.attributes[meta.key];
                      attr.value = n;
                      // Anstrengung kann nie höher sein als der Basiswert
                      attr.spentEffort = Math.min(attr.spentEffort, n);
                    })
                  }
                />
              </div>

              {/* Abgeleitetes Attribut + Anstrengung */}
              <div className="flex items-center justify-between gap-2 border-t border-slate-800/90 bg-slate-950/35 px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => setProbe({ type: 'derived', key: meta.key })}
                  title={`${meta.derivedName}-Probe im Würfelpool-HUD anzeigen`}
                  className={cx(
                    'flex min-h-8 min-w-0 flex-1 touch-manipulation items-center gap-1.5 rounded px-1.5 text-left transition-colors hover:bg-slate-800/70',
                    derActive && 'focus-ring bg-amber-500/10',
                  )}
                >
                  <span className="font-mono text-[11px] font-bold text-slate-400">{meta.derivedKey}</span>
                  <span className="min-w-0 flex-1 truncate text-xs text-slate-400">{meta.derivedName}</span>
                  <DiceBadges pool={derPool} size="xs" />
                </button>
                <div className="flex shrink-0 items-center gap-1.5" title="Anstrengung (reduziert das Attribut bis zur Langen Rast)">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Anstr.</span>
                  <Stepper
                    size="sm"
                    value={a.spentEffort}
                    min={0}
                    max={a.value}
                    tone={a.spentEffort > 0 ? 'red' : 'slate'}
                    onChange={(n) => update((c) => void (c.attributes[meta.key].spentEffort = n))}
                  />
                </div>
              </div>

              {edit && (
                <div className="space-y-1.5 border-t border-slate-800 bg-slate-950/60 p-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400">{meta.key}-Mods</span>
                    <ModInputs gow={a.gow} glkw={a.glkw} pew={a.pew} onChange={(k, v) => update((c) => void (c.attributes[meta.key][k] = v))} />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400">{meta.derivedKey}-Mods</span>
                    <ModInputs
                      gow={derivedGow(char, meta.key)}
                      glkw={d.glkw}
                      pew={d.pew}
                      onChange={(k, v) =>
                        update((c) => {
                          if (k === 'gow') c.derived[meta.key].gowOverride = v;
                          else c.derived[meta.key][k] = v;
                        })
                      }
                    />
                    {d.gowOverride === null ? (
                      <span className="text-[10px] text-slate-500">GoW auto = {meta.key}-GoW × 2</span>
                    ) : (
                      <Btn small onClick={() => update((c) => void (c.derived[meta.key].gowOverride = null))}>
                        GoW auto
                      </Btn>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-2 text-[11px] text-slate-500">
        <span>Tippe auf ein Attribut oder Abgeleitetes Attribut, um den Würfelpool ins HUD zu laden.</span>
        <span>
          Tragkraft: <b className="font-mono text-slate-300">{effStr * 10} kg</b> · Dauerlauf:{' '}
          <b className="font-mono text-slate-300">{effKon * 10} min</b>
        </span>
      </div>
    </Panel>
  );
}
