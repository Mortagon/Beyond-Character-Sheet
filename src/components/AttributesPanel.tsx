import { useState } from 'react';
import { Gauge, Pencil, PencilOff } from 'lucide-react';
import { isSameProbe, useSheet } from '../context';
import { ATTRS } from '../data/rules';
import { derivedGow, effectiveAttr, quickPool, woundPewFor } from '../logic/dice';
import { Btn, DiceBadges, ModInputs, NumInput, Panel, Stepper, cx } from './ui';

export function AttributesPanel() {
  const { char, update, probe, setProbe } = useSheet();
  const [edit, setEdit] = useState(false);
  const list = ATTRS.filter((a) => a.key !== 'PSI' || char.psiEnabled);

  return (
    <Panel
      title="Attribute"
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
      bodyClassName="p-2"
    >
      <div className="space-y-1.5">
        {list.map((meta) => {
          const a = char.attributes[meta.key];
          const d = char.derived[meta.key];
          const eff = effectiveAttr(char, meta.key);
          const attrPool = quickPool(char, { type: 'attr', key: meta.key })!;
          const derPool = quickPool(char, { type: 'derived', key: meta.key })!;
          const attrActive = isSameProbe(probe, { type: 'attr', key: meta.key });
          const derActive = isSameProbe(probe, { type: 'derived', key: meta.key });
          const wound = woundPewFor(char, meta.key);
          return (
            <div key={meta.key} className="rounded-md border border-slate-700/60 bg-[#0f141d]/80">
              <div className="flex items-center gap-2 p-1.5">
                <button
                  type="button"
                  onClick={() => setProbe({ type: 'attr', key: meta.key })}
                  className={cx(
                    'flex min-h-11 min-w-0 flex-1 touch-manipulation items-center gap-2 rounded px-1.5 text-left transition-colors hover:bg-slate-800/60',
                    attrActive && 'focus-ring bg-amber-500/10',
                  )}
                >
                  <span className="w-9 font-mono text-sm font-black text-amber-400">{meta.key}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-200">{meta.name}</span>
                  {a.spentEffort > 0 && <span className="font-mono text-xs text-red-400">eff {eff}</span>}
                  {wound > 0 && <span className="font-mono text-[10px] text-red-400">W+{wound}</span>}
                  <DiceBadges pool={attrPool} size="xs" />
                </button>
                <Stepper size="sm" value={a.value} min={0} max={20} tone="amber" onChange={(n) => update((c) => void (c.attributes[meta.key].value = n))} />
              </div>
              <div className="flex items-center gap-2 border-t border-slate-800 px-1.5 py-1">
                <button
                  type="button"
                  onClick={() => setProbe({ type: 'derived', key: meta.key })}
                  className={cx(
                    'flex min-h-9 min-w-0 flex-1 touch-manipulation items-center gap-2 rounded px-1.5 text-left hover:bg-slate-800/60',
                    derActive && 'focus-ring bg-amber-500/10',
                  )}
                >
                  <span className="w-9 font-mono text-xs font-bold text-slate-400">{meta.derivedKey}</span>
                  <span className="min-w-0 flex-1 truncate text-xs text-slate-400">
                    {meta.derivedName} <span className="font-mono text-slate-300">{eff * 2}</span>
                  </span>
                  <DiceBadges pool={derPool} size="xs" />
                </button>
                <div className="flex items-center gap-1" title="Anstrengung (bis zur Langen Rast)">
                  <span className="text-[9px] font-bold uppercase text-slate-500">Anstr.</span>
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
                <div className="space-y-1.5 border-t border-slate-800 bg-slate-950/40 p-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-16 text-[10px] font-bold uppercase text-slate-500">{meta.key}</span>
                    <ModInputs gow={a.gow} glkw={a.glkw} pew={a.pew} onChange={(k, v) => update((c) => void (c.attributes[meta.key][k] = v))} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-16 text-[10px] font-bold uppercase text-slate-500">{meta.derivedKey}</span>
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
      <div className="mt-2 flex flex-wrap items-center gap-3 px-1 text-[11px] text-slate-500">
        <span>
          Tragkraft: <span className="font-mono text-slate-300">{effectiveAttr(char, 'STR') * 10} kg</span>
        </span>
        <span>
          Standard-LP (KON×2): <span className="font-mono text-slate-300">{char.attributes.KON.value * 2}</span>
        </span>
        <Btn small onClick={() => update((c) => void (c.vitals.lp.max = c.attributes.KON.value * 2))}>
          LP-Max = KON×2
        </Btn>
        <span className="flex items-center gap-1">
          GLK-Pool max
          <NumInput value={char.vitals.luckPool.max} min={0} onChange={(n) => update((c) => void (c.vitals.luckPool.max = n))} className="h-8 w-12 text-xs" />
        </span>
      </div>
    </Panel>
  );
}
