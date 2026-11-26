import { useMemo, useState } from 'react';
import { BookOpen, ChevronRight, Search, X } from 'lucide-react';
import { GRW_CHAPTERS, type CodexChapter, type CodexSection } from '../data/grwCodex';
import { Panel, cx } from './ui';

function matchesQuery(s: CodexSection, q: string): boolean {
  if (!q) return true;
  const hay = [
    s.title,
    s.page,
    s.summary,
    ...s.tags,
    ...(s.bullets ?? []),
    ...(s.table ? [...s.table.headers, ...s.table.rows.flat()] : []),
  ]
    .join(' ')
    .toLowerCase();
  return hay.includes(q);
}

export function RulebookView() {
  const [chapterId, setChapterId] = useState<string>(GRW_CHAPTERS[0].id);
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const filteredChapters = useMemo(() => {
    if (!q) {
      const active = GRW_CHAPTERS.find((c) => c.id === chapterId) ?? GRW_CHAPTERS[0];
      return [{ chapter: active, sections: active.sections }];
    }
    return GRW_CHAPTERS.map((chapter) => ({
      chapter,
      sections: chapter.sections.filter((s) => matchesQuery(s, q)),
    })).filter((entry) => entry.sections.length > 0);
  }, [chapterId, q]);

  const totalHits = useMemo(() => filteredChapters.reduce((n, c) => n + c.sections.length, 0), [filteredChapters]);

  const scrollToSection = (id: string) => {
    document.getElementById(`grw-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
      {/* Linke Kapitel- & Schnellnavigation */}
      <aside className="space-y-3 lg:col-span-4">
        <Panel title="Grundregelwerk · Kodex" icon={<BookOpen className="size-4" />} bodyClassName="p-2.5 space-y-2.5">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Regel, Effekt, Waffe, Archetyp suchen…"
              className="field w-full pr-8 pl-8 text-sm placeholder:text-slate-600"
            />
            {query && (
              <button
                type="button"
                aria-label="Suche leeren"
                onClick={() => setQuery('')}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-slate-500 hover:text-slate-200"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {q ? (
            <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-300">
              {totalHits} {totalHits === 1 ? 'Abschnitt' : 'Abschnitte'} über alle Kapitel für „{query.trim()}“
            </div>
          ) : (
            <div className="space-y-1">
              {GRW_CHAPTERS.map((c: CodexChapter) => {
                const active = c.id === chapterId;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setChapterId(c.id)}
                    className={cx(
                      'flex w-full touch-manipulation items-center gap-2 rounded-md border px-2.5 py-2 text-left transition-colors',
                      active
                        ? 'border-amber-500/70 bg-amber-500/15 text-amber-300'
                        : 'border-slate-700/60 bg-[#0f141d] text-slate-300 hover:border-slate-600',
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-bold">{c.title}</span>
                        <span className="shrink-0 font-mono text-[10px] text-slate-500">{c.pages}</span>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-slate-500">{c.subtitle}</p>
                    </div>
                    <ChevronRight className={cx('size-4 shrink-0', active ? 'text-amber-400' : 'text-slate-600')} />
                  </button>
                );
              })}
            </div>
          )}

          {/* Abschnittssprünge für schnelles Nachschlagen am Tisch */}
          {!q && (
            <div className="border-t border-slate-800 pt-2">
              <div className="label mb-1.5 px-1">Abschnitte in diesem Kapitel</div>
              <div className="flex flex-wrap gap-1">
                {(GRW_CHAPTERS.find((c) => c.id === chapterId) ?? GRW_CHAPTERS[0]).sections.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => scrollToSection(s.id)}
                    className="min-h-8 touch-manipulation rounded border border-slate-700/70 bg-[#0f141d] px-2 py-1 text-left text-[11px] font-semibold text-slate-300 hover:border-amber-500/50 hover:text-amber-300"
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Panel>
      </aside>

      {/* Rechte Inhalts-Ansicht */}
      <div className="space-y-3 lg:col-span-8">
        {filteredChapters.length === 0 ? (
          <Panel title="Keine Treffer" icon={<Search className="size-4" />}>
            <p className="text-sm text-slate-400">Keine Regeln passend zu „{query}“ gefunden. Versuche Begriffe wie „GoW“, „Todeswurf“, „Quickhack“, „Vibro“ oder „Cyberware“.</p>
          </Panel>
        ) : (
          filteredChapters.map(({ chapter, sections }) => (
            <Panel
              key={chapter.id}
              title={
                <span className="flex items-center gap-2">
                  <span>{chapter.title}</span>
                  <span className="font-mono text-[10px] font-normal text-slate-400">({chapter.pages})</span>
                </span>
              }
              icon={<BookOpen className="size-4" />}
              bodyClassName="p-3 space-y-3"
            >
              <p className="text-xs text-slate-400">{chapter.subtitle}</p>
              {sections.map((s) => (
                <article key={s.id} id={`grw-${s.id}`} className="scroll-mt-20 space-y-2.5 rounded-md border border-slate-700/70 bg-[#0f141d] p-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-800 pb-1.5">
                    <h3 className="text-base font-bold text-amber-300">{s.title}</h3>
                    <span className="rounded border border-slate-700 bg-slate-900/70 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-400">
                      GRW {s.page}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-200">{s.summary}</p>
                  {s.bullets && s.bullets.length > 0 && (
                    <ul className="space-y-1.5 text-xs leading-relaxed text-slate-300">
                      {s.bullets.map((b, i) => {
                        const colon = b.indexOf(':');
                        return (
                          <li key={i} className="flex gap-2">
                            <span className="mt-1 size-1.5 shrink-0 rounded-full bg-amber-400/80" />
                            <span>
                              {colon > 0 && colon < 42 ? (
                                <>
                                  <strong className="font-semibold text-slate-100">{b.slice(0, colon + 1)}</strong>
                                  {b.slice(colon + 1)}
                                </>
                              ) : (
                                b
                              )}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {s.table && (
                    <div className="overflow-x-auto rounded border border-slate-800">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-700 bg-slate-900/80 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                            {s.table.headers.map((h) => (
                              <th key={h} className="px-2.5 py-1.5">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {s.table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="border-b border-slate-800/70 last:border-b-0">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className={cx('px-2.5 py-1.5 align-top', cIdx === 0 ? 'font-semibold text-slate-100' : 'text-slate-300')}>
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {s.tags.map((tag) => (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => setQuery(tag)}
                        className="rounded border border-slate-700/70 px-1.5 py-0.5 font-mono text-[10px] text-cyan-300 hover:border-cyan-500/60"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </Panel>
          ))
        )}
      </div>
    </div>
  );
}
