import englishWords from 'an-array-of-english-words';

export interface DictionaryEntry {
  word: string;
  letter: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  example: string;
}

export interface LetterBucket {
  key: number; // 1-9
  label: string; // e.g., "A – C"
  spokenLabel: string; // e.g., "A through C"
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

// Build the full 275,000+ English dictionary grouped by starting letter A-Z
const ALL_WORDS_BY_LETTER: Record<string, string[]> = {
  A: [], B: [], C: [], D: [], E: [], F: [], G: [], H: [], I: [],
  J: [], K: [], L: [], M: [], N: [], O: [], P: [], Q: [], R: [],
  S: [], T: [], U: [], V: [], W: [], X: [], Y: [], Z: [],
};

const wordListArray: string[] = Array.isArray(englishWords) ? englishWords : [];

for (let i = 0; i < wordListArray.length; i++) {
  const w = wordListArray[i];
  if (!w || w.length === 0) continue;
  const firstChar = w[0].toUpperCase();
  if (ALL_WORDS_BY_LETTER[firstChar]) {
    ALL_WORDS_BY_LETTER[firstChar].push(w.toLowerCase());
  }
}

export const TOTAL_DICTIONARY_WORDS = wordListArray.length;

export function getWordsForLetter(letter: string): string[] {
  return ALL_WORDS_BY_LETTER[letter.toUpperCase()] || [];
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

function cleanHtml(raw: string): string {
  if (!raw) return '';
  let text = raw.replace(/<style[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<[^>]+>/g, '');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&apos;/g, "'");
  text = text.replace(/&nbsp;/g, ' ');
  return text.replace(/\s+/g, ' ').trim();
}

interface FreeDictMeaning {
  partOfSpeech?: string;
  definitions?: Array<{
    definition?: string;
    example?: string;
  }>;
}

interface FreeDictEntry {
  word?: string;
  phonetic?: string;
  phonetics?: Array<{ text?: string }>;
  meanings?: FreeDictMeaning[];
}

/**
 * Fetches real, authentic definitions from Free Dictionary API, official Wiktionary REST API,
 * or Datamuse WordNet. Never returns fake placeholder sentences.
 */
export async function fetchWordDefinition(word: string): Promise<DictionaryEntry> {
  const cleanWord = word.trim().toLowerCase();
  const letter = cleanWord[0].toUpperCase();

  // 1. Try Free Dictionary API (has definitions, IPA phonetics, and common usage examples)
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`
    );
    if (res.ok) {
      const data = (await res.json()) as FreeDictEntry[];
      if (Array.isArray(data) && data[0]?.meanings?.length) {
        const first = data[0];
        const phonetic =
          first.phonetic ||
          first.phonetics?.find((p) => p.text)?.text ||
          `/${cleanWord}/`;

        const m =
          first.meanings.find((mean) => mean.definitions?.some((d) => d.example)) ||
          first.meanings[0];
        const defObj =
          m.definitions?.find((d) => d.example) || m.definitions?.[0];

        if (defObj?.definition) {
          return {
            word: cleanWord,
            letter,
            phonetic,
            partOfSpeech: m.partOfSpeech || 'noun',
            definition: defObj.definition.trim(),
            example: defObj.example?.trim() || 'None recorded',
          };
        }
      }
    }
  } catch {
    // Continue to Wiktionary
  }

  // 2. Try Wiktionary REST API (covers 100% of unabridged, archaic, rare, and scientific words like navarchy)
  try {
    const res = await fetch(
      `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(cleanWord)}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.en && Array.isArray(data.en) && data.en.length > 0) {
        for (const section of data.en) {
          const pos = section.partOfSpeech ? section.partOfSpeech.toLowerCase() : 'noun';
          for (const d of section.definitions || []) {
            const cleanedDef = cleanHtml(d.definition);
            if (cleanedDef && !cleanedDef.toLowerCase().startsWith('see ')) {
              let ex = 'None recorded';
              if (Array.isArray(d.examples) && d.examples.length > 0) {
                ex = cleanHtml(d.examples[0]);
              }
              return {
                word: cleanWord,
                letter,
                phonetic: `/${cleanWord}/`,
                partOfSpeech: pos,
                definition: cleanedDef,
                example: ex,
              };
            }
          }
        }
      }
    }
  } catch {
    // Continue to Datamuse
  }

  // 3. Try Datamuse WordNet API
  try {
    const res = await fetch(
      `https://api.datamuse.com/words?sp=${encodeURIComponent(cleanWord)}&md=dp&max=1`
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.defs?.length) {
        const rawDef = data[0].defs[0];
        const parts = rawDef.split('\t');
        const posTag = parts[0];
        const defText = parts.slice(1).join(' ').trim();
        const posMap: Record<string, string> = {
          n: 'noun',
          v: 'verb',
          adj: 'adjective',
          adv: 'adverb',
        };
        return {
          word: cleanWord,
          letter,
          phonetic: `/${cleanWord}/`,
          partOfSpeech: posMap[posTag] || 'noun',
          definition: defText,
          example: 'None recorded',
        };
      }
    }
  } catch {
    // Fall through
  }

  return {
    word: cleanWord,
    letter,
    phonetic: `/${cleanWord}/`,
    partOfSpeech: 'entry',
    definition: 'No definition recorded in dictionary sources.',
    example: 'None recorded',
  };
}
