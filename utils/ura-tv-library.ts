/** Filters for Learn → URA TV library list. */

export function isUraTvExcludedTitle(title: string): boolean {
  const t = title.trim().toLowerCase().replace(/\s+/g, ' ');
  return t.includes('ura tv weekly') && t.includes('trailer');
}

/** `past` is newest-first; drops excluded titles and the three oldest entries. */
export function filterUraTvPastLibrary<T extends { title: string }>(
  programs: T[],
  dropOldestCount = 3
): T[] {
  const filtered = programs.filter((p) => !isUraTvExcludedTitle(p.title));
  if (filtered.length <= dropOldestCount) return filtered;
  return filtered.slice(0, filtered.length - dropOldestCount);
}

export function filterUraTvUpcoming<T extends { title: string }>(programs: T[]): T[] {
  return programs.filter((p) => !isUraTvExcludedTitle(p.title));
}
