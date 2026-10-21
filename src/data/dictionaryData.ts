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

/**
 * Morphological fallback generator so that even rare/unabridged words among the
 * 275,000+ entries always return a coherent part of speech, definition, and usage example
 * if the live Free Dictionary API returns 404 or is unreachable.
 */
function inferMorphologicalEntry(rawWord: string): DictionaryEntry {
  const word = rawWord.toLowerCase();
  const letter = word[0].toUpperCase();

  let partOfSpeech = 'noun';
  let definition = `A lexical entry in the unabridged English dictionary denoting "${word}".`;
  let example = `The archival manuscript contained a rare reference to ${word}.`;

  if (word.endsWith('ly') && word.length > 4) {
    const stem = word.slice(0, -2);
    partOfSpeech = 'adverb';
    definition = `In a manner characterized by or relating to ${stem}.`;
    example = `She responded ${word} to the unexpected question from the committee.`;
  } else if (word.endsWith('ness') && word.length > 5) {
    const stem = word.slice(0, -4);
    partOfSpeech = 'noun';
    definition = `The state, quality, or condition of being ${stem}.`;
    example = `A quiet sense of ${word} settled over the room by late afternoon.`;
  } else if ((word.endsWith('tion') || word.endsWith('sion')) && word.length > 5) {
    partOfSpeech = 'noun';
    definition = `The action, process, or result associated with ${word}.`;
    example = `Careful ${word} was required before completing the final stage.`;
  } else if (word.endsWith('ity') && word.length > 5) {
    const stem = word.slice(0, -3);
    partOfSpeech = 'noun';
    definition = `The quality, degree, or condition of ${stem}.`;
    example = `The material was chosen for its remarkable ${word} under pressure.`;
  } else if (
    (word.endsWith('ous') ||
      word.endsWith('ive') ||
      word.endsWith('al') ||
      word.endsWith('ic') ||
      word.endsWith('ful') ||
      word.endsWith('less') ||
      word.endsWith('able') ||
      word.endsWith('ible')) &&
    word.length > 5
  ) {
    partOfSpeech = 'adjective';
    definition = `Having the nature, quality, or characteristic of being ${word}.`;
    example = `Observers noted the distinctly ${word} character of the design.`;
  } else if (word.endsWith('ing') && word.length > 5) {
    const stem = word.slice(0, -3);
    partOfSpeech = 'verb (participle)';
    definition = `Present participle form denoting the ongoing action of ${stem}.`;
    example = `They spent the entire morning ${word} near the harbor.`;
  } else if (word.endsWith('ed') && word.length > 4) {
    const stem = word.slice(0, -2);
    partOfSpeech = 'verb (past tense)';
    definition = `Past tense or past participle form related to ${stem}.`;
    example = `The instrument was carefully ${word} prior to the test.`;
  } else if ((word.endsWith('ize') || word.endsWith('ise') || word.endsWith('ate')) && word.length > 5) {
    partOfSpeech = 'verb';
    definition = `To cause to become, treat as, or perform the action of ${word}.`;
    example = `The new protocol helped ${word} the entire workflow.`;
  }

  return {
    word,
    letter,
    phonetic: `/${word}/`,
    partOfSpeech,
    definition,
    example,
  };
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
 * Fetches live definition, part of speech, and usage example from the Free Dictionary API,
 * falling back gracefully to morphological analysis if offline or unlisted.
 */
export async function fetchWordDefinition(word: string): Promise<DictionaryEntry> {
  const cleanWord = word.trim().toLowerCase();
  const fallback = inferMorphologicalEntry(cleanWord);

  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`
    );
    if (!res.ok) {
      return fallback;
    }

    const data = (await res.json()) as FreeDictEntry[];
    if (!Array.isArray(data) || data.length === 0) {
      return fallback;
    }

    const first = data[0];
    const phonetic =
      first.phonetic ||
      first.phonetics?.find((p) => p.text)?.text ||
      fallback.phonetic;

    let partOfSpeech = fallback.partOfSpeech;
    let definition = fallback.definition;
    let example = '';

    if (Array.isArray(first.meanings) && first.meanings.length > 0) {
      // Prefer a meaning that includes both a definition and an example if available
      const meaningWithEx = first.meanings.find((m) =>
        m.definitions?.some((d) => d.definition && d.example)
      );
      const chosenMeaning = meaningWithEx || first.meanings[0];

      if (chosenMeaning.partOfSpeech) {
        partOfSpeech = chosenMeaning.partOfSpeech;
      }

      const defWithEx = chosenMeaning.definitions?.find(
        (d) => d.definition && d.example
      );
      const firstDef = defWithEx || chosenMeaning.definitions?.[0];

      if (firstDef?.definition) {
        definition = firstDef.definition;
      }
      if (firstDef?.example) {
        example = firstDef.example;
      }
    }

    // If the API entry did not include a usage example, search across all meanings or synthesize one
    if (!example) {
      for (const entry of data) {
        for (const m of entry.meanings || []) {
          for (const d of m.definitions || []) {
            if (d.example) {
              example = d.example;
              break;
            }
          }
          if (example) break;
        }
        if (example) break;
      }
    }

    if (!example) {
      if (partOfSpeech.includes('verb')) {
        example = `In this context, to "${cleanWord}" means ${definition.charAt(0).toLowerCase() + definition.slice(1)}`;
      } else if (partOfSpeech.includes('adjective')) {
        example = `The writer chose the adjective "${cleanWord}" to describe the scene.`;
      } else {
        example = `The term "${cleanWord}" appears in the dictionary as a ${partOfSpeech}.`;
      }
    }

    return {
      word: cleanWord,
      letter: cleanWord[0].toUpperCase(),
      phonetic,
      partOfSpeech,
      definition,
      example,
    };
  } catch {
    return fallback;
  }
}
