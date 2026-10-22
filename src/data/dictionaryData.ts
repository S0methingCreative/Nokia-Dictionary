import wordListsJson from './dict/wordLists.json';

export interface DictionaryEntry {
  word: string;
  letter: string;
  partOfSpeech: string;
  definition: string;
}

export interface LetterBucket {
  key: number; // 1-9
  label: string; // e.g., "A – C"
  spokenLabel: string; // e.g., "A, B, or C"
  letters: string[]; // e.g., ["A", "B", "C"]
}

export interface NineWayBucket {
  key: number; // 1-9
  firstWord: string;
  lastWord: string;
  words: string[];
  isSingleWord: boolean;
}

export const LETTER_BUCKETS: LetterBucket[] = [
  { key: 1, label: 'A – C', spokenLabel: 'A, B, or C', letters: ['A', 'B', 'C'] },
  { key: 2, label: 'D – F', spokenLabel: 'D, E, or F', letters: ['D', 'E', 'F'] },
  { key: 3, label: 'G – I', spokenLabel: 'G, H, or I', letters: ['G', 'H', 'I'] },
  { key: 4, label: 'J – L', spokenLabel: 'J, K, or L', letters: ['J', 'K', 'L'] },
  { key: 5, label: 'M – O', spokenLabel: 'M, N, or O', letters: ['M', 'N', 'O'] },
  { key: 6, label: 'P – R', spokenLabel: 'P, Q, or R', letters: ['P', 'Q', 'R'] },
  { key: 7, label: 'S – U', spokenLabel: 'S, T, or U', letters: ['S', 'T', 'U'] },
  { key: 8, label: 'V – X', spokenLabel: 'V, W, or X', letters: ['V', 'W', 'X'] },
  { key: 9, label: 'Y – Z', spokenLabel: 'Y or Z', letters: ['Y', 'Z'] },
];

const WORD_LISTS_BY_LETTER = wordListsJson as Record<string, string[]>;

export const TOTAL_DICTIONARY_WORDS = Object.values(WORD_LISTS_BY_LETTER).reduce(
  (sum, arr) => sum + arr.length,
  0
);

export function getWordsForLetter(letter: string): string[] {
  return WORD_LISTS_BY_LETTER[letter.toUpperCase()] || [];
}

/**
 * Recursively partitions any array of words into at most 9 buckets (keys 1-9).
 * - If `words.length <= 9`, each key 1..N represents a single selectable word.
 * - If `words.length > 9`, divides the list into 9 contiguous alphabetical ranges.
 */
export function partitionWordsIntoNine(words: string[]): NineWayBucket[] {
  if (words.length === 0) return [];

  if (words.length <= 9) {
    return words.map((w, idx) => ({
      key: idx + 1,
      firstWord: w,
      lastWord: w,
      words: [w],
      isSingleWord: true,
    }));
  }

  const buckets: NineWayBucket[] = [];
  const total = words.length;

  for (let i = 0; i < 9; i++) {
    const start = Math.floor((i * total) / 9);
    const end = Math.floor(((i + 1) * total) / 9);
    const slice = words.slice(start, end);
    if (slice.length > 0) {
      buckets.push({
        key: buckets.length + 1,
        firstWord: slice[0],
        lastWord: slice[slice.length - 1],
        words: slice,
        isSingleWord: slice.length === 1,
      });
    }
  }

  return buckets;
}

type LetterDictMap = Record<string, [partOfSpeech: string, definition: string]>;

// Vite static glob import of our bundled offline A-Z dictionary chunks
const LETTER_DICT_LOADERS = import.meta.glob<{ default: LetterDictMap }>(
  './dict/[A-Z].json'
);

const loadedLetterCache: Record<string, LetterDictMap> = {};

/**
 * Looks up a word from the 100% bundled offline dictionary (zero external API calls).
 */
export async function fetchWordDefinition(word: string): Promise<DictionaryEntry> {
  const cleanWord = word.trim().toLowerCase();
  const letter = cleanWord[0].toUpperCase();

  if (!loadedLetterCache[letter]) {
    const loader = LETTER_DICT_LOADERS[`./dict/${letter}.json`];
    if (loader) {
      const mod = await loader();
      loadedLetterCache[letter] = mod.default;
    }
  }

  const letterMap = loadedLetterCache[letter];
  const record = letterMap?.[cleanWord];

  if (record) {
    return {
      word: cleanWord,
      letter,
      partOfSpeech: record[0],
      definition: record[1],
    };
  }

  return {
    word: cleanWord,
    letter,
    partOfSpeech: 'noun',
    definition: 'Definition unavailable.',
  };
}
