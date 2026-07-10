export const EXTRACTION_LOADER_VERBS = [
  'Contemplating',
  'Percolating',
  'Zesting',
  'Communing',
  'Ruminating',
  'Synthesizing',
  'Distilling',
  'Unfurling',
  'Calibrating',
  'Marinating',
  'Pondering',
  'Crystallizing',
  'Harmonizing',
  'Decocting',
  'Infusing',
  'Coalescing',
  'Transmuting',
  'Reverberating',
  'Orchestrating',
  'Brewing',
] as const

export const EXTRACTION_LOADER_OBJECTS = [
  'deadline subtext',
  'ownership signals',
  'action-item essence',
  'meeting undertones',
  'priority whispers',
  'commitment fragments',
  'transcript nuance',
  'task molecules',
  'calendar vibes',
  'responsibility threads',
  'linguistic breadcrumbs',
  'conversational residue',
  'semantic layers',
  'follow-up potential',
  'accountability traces',
] as const

export const EXTRACTION_LOADER_STAGES = [
  'Scanning transcript topology',
  'Isolating actionable commitments',
  'Mapping owners and due dates',
  'Weighing priority language',
  'Resolving conflicts and ambiguities',
  'Packaging your action items',
] as const

export function pickRandomPhrase<T>(items: readonly T[], exclude?: T): T {
  const fallback = items[0]
  if (fallback === undefined) {
    throw new Error('pickRandomPhrase requires at least one item')
  }

  const pool = exclude ? items.filter((item) => item !== exclude) : [...items]
  return pool[Math.floor(Math.random() * pool.length)] ?? fallback
}

export function buildLoaderCaption(verb: string, object: string): string {
  return `${verb} ${object}…`
}
