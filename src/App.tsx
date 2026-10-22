/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { NokiaHandset, CallStage, LcdMenuOption } from './components/NokiaHandset';
import {
  LETTER_BUCKETS,
  getWordsForLetter,
  partitionWordsIntoNine,
  fetchWordDefinition,
  DictionaryEntry,
  LetterBucket,
  NineWayBucket,
} from './data/dictionaryData';
import { soundEngine } from './utils/soundEffects';

export default function App() {
  const [callStage, setCallStage] = useState<CallStage>('IDLE');
  const [callSeconds, setCallSeconds] = useState<number>(0);

  // Active 1-9 Drill-Down State
  const [selectedBucket, setSelectedBucket] = useState<LetterBucket | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [currentWordPool, setCurrentWordPool] = useState<string[]>([]);
  const [drillDepth, setDrillDepth] = useState<number>(0);
  const [selectedWordEntry, setSelectedWordEntry] = useState<DictionaryEntry | null>(null);

  // Hardware & Audio State
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [keypadNotice, setKeypadNotice] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const dialTimeoutRef = useRef<number | null>(null);
  const lookupReqIdRef = useRef<number>(0);

  // Call Duration Timer
  useEffect(() => {
    if (callStage === 'IDLE' || callStage === 'DIALING') {
      return;
    }
    const interval = window.setInterval(() => {
      setCallSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [callStage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (dialTimeoutRef.current) {
        window.clearTimeout(dialTimeoutRef.current);
      }
      soundEngine.stopSpeech();
    };
  }, []);

  const flashKey = (keyLabel: string) => {
    setActiveKey(keyLabel);
    window.setTimeout(() => {
      setActiveKey((prev) => (prev === keyLabel ? null : prev));
    }, 150);
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  // Speak helper for any nine-way partition of words
  const speakNineWayBuckets = useCallback(
    (prefixSpeech: string, buckets: NineWayBucket[]) => {
      const optionsSpeech = buckets
        .map((b) =>
          b.isSingleWord
            ? `Press ${b.key} for ${b.firstWord}.`
            : `Press ${b.key} for ${b.firstWord} through ${b.lastWord}.`
        )
        .join(' ');
      soundEngine.speakOperatorText(`${prefixSpeech} ${optionsSpeech}`, 160);
    },
    []
  );

  // Start call when TALK is pressed
  const handlePressTalk = useCallback(() => {
    flashKey('TALK');
    setKeypadNotice(null);

    if (callStage !== 'IDLE') {
      return;
    }

    soundEngine.stopSpeech();
    soundEngine.playRingbackTone();
    setCallStage('DIALING');
    setCallSeconds(0);
    setSelectedBucket(null);
    setSelectedLetter(null);
    setCurrentWordPool([]);
    setDrillDepth(0);
    setSelectedWordEntry(null);

    if (dialTimeoutRef.current) {
      window.clearTimeout(dialTimeoutRef.current);
    }

    dialTimeoutRef.current = window.setTimeout(() => {
      soundEngine.playConnectChime();
      setCallStage('BUCKET_SELECT');

      const greetingSpeech =
        'Hello, and welcome to the Phone Dictionary. ' +
        'Normally you would press 1 for A, press 2 for B, and so on for every letter. ' +
        'Using only keys 1 through 9: ' +
        LETTER_BUCKETS.map(
          (b) => `Press ${b.key} for ${b.spokenLabel}.`
        ).join(' ');

      soundEngine.speakOperatorText(greetingSpeech, 180);
    }, 700);
  }, [callStage]);

  // (C) Key Strictly Ends Call
  const handlePressClear = useCallback(() => {
    flashKey('C');
    setKeypadNotice(null);
    lookupReqIdRef.current += 1;

    if (dialTimeoutRef.current) {
      window.clearTimeout(dialTimeoutRef.current);
    }

    soundEngine.stopSpeech();

    if (callStage !== 'IDLE') {
      soundEngine.playHangupTone();
      setCallStage('IDLE');
      setSelectedBucket(null);
      setSelectedLetter(null);
      setCurrentWordPool([]);
      setDrillDepth(0);
      setSelectedWordEntry(null);
    } else {
      soundEngine.playNavBeep(880, 50);
    }
  }, [callStage]);

  // Trigger bundled offline dictionary lookup & TTS readout (Definition & Part of Speech only)
  const triggerWordLookup = useCallback(async (word: string) => {
    const reqId = ++lookupReqIdRef.current;
    setCallStage('LOADING_WORD');

    const entry = await fetchWordDefinition(word);
    if (lookupReqIdRef.current !== reqId) return;

    setSelectedWordEntry(entry);
    setCallStage('WORD_DEFINITION');

    const spokenEntry =
      `${entry.word}. ` +
      `Part of speech: ${entry.partOfSpeech}. ` +
      `Definition: ${entry.definition}`;

    soundEngine.speakOperatorText(spokenEntry, 140);
  }, []);

  // Handle keypad presses ('1'-'9', '*', '0', '#')
  const handlePressDigit = useCallback(
    (digit: string) => {
      flashKey(digit);
      soundEngine.stopSpeech();
      soundEngine.playDTMF(digit);

      if (callStage === 'IDLE') {
        setKeypadNotice('Press TALK to call dictionary.');
        return;
      }

      if (callStage === 'DIALING' || callStage === 'LOADING_WORD') {
        return;
      }

      // Enforce strict 1-9 entry rule
      if (digit === '*' || digit === '0' || digit === '#') {
        const msg = `Only keys 1–9 are allowed.`;
        setKeypadNotice(msg);
        soundEngine.speakOperatorText(
          'Only keys 1 through 9 are active entry options.',
          150
        );
        return;
      }

      const num = parseInt(digit, 10);
      if (isNaN(num) || num < 1 || num > 9) return;

      setKeypadNotice(null);

      // 1. BUCKET_SELECT: Choose 1-9 letter bucket (A-C ... Y-Z)
      if (callStage === 'BUCKET_SELECT') {
        const bucket = LETTER_BUCKETS.find((b) => b.key === num);
        if (!bucket) return;

        setSelectedBucket(bucket);
        setCallStage('LETTER_SELECT');

        const letterSpeech = bucket.letters
          .map((ltr, idx) => `Press ${idx + 1} for ${ltr}.`)
          .join(' ');
        soundEngine.speakOperatorText(letterSpeech, 160);
        return;
      }

      // 2. LETTER_SELECT: Choose exact letter (Press 1 for first letter, 2 for second, 3 for third)
      if (callStage === 'LETTER_SELECT' && selectedBucket) {
        const chosenLetter = selectedBucket.letters[num - 1];
        if (!chosenLetter) {
          const maxKey = selectedBucket.letters.length;
          const err = `Press 1–${maxKey} for ${selectedBucket.letters.join('/')}.`;
          setKeypadNotice(err);
          soundEngine.speakOperatorText(
            `Invalid entry. Please press 1 through ${maxKey}.`,
            150
          );
          return;
        }

        const wordsInLetter = getWordsForLetter(chosenLetter);
        setSelectedLetter(chosenLetter);
        setCurrentWordPool(wordsInLetter);
        setDrillDepth(1);
        setCallStage('WORD_DRILL');

        const initialBuckets = partitionWordsIntoNine(wordsInLetter);
        speakNineWayBuckets(
          `Letter ${chosenLetter}. ${wordsInLetter.length.toLocaleString()} words.`,
          initialBuckets
        );
        return;
      }

      // 3. WORD_DRILL: Recursively divide currentWordPool into 9 buckets until a single word is selected
      if (callStage === 'WORD_DRILL' && selectedLetter) {
        const buckets = partitionWordsIntoNine(currentWordPool);
        const chosenBucket = buckets.find((b) => b.key === num);

        if (!chosenBucket) {
          const err = `Please press 1–${buckets.length}.`;
          setKeypadNotice(err);
          soundEngine.speakOperatorText(
            `Please press a number from 1 to ${buckets.length}.`,
            150
          );
          return;
        }

        if (chosenBucket.isSingleWord) {
          triggerWordLookup(chosenBucket.firstWord);
        } else {
          const nextPool = chosenBucket.words;
          const nextDepth = drillDepth + 1;
          setCurrentWordPool(nextPool);
          setDrillDepth(nextDepth);

          const nextBuckets = partitionWordsIntoNine(nextPool);
          speakNineWayBuckets(
            `${nextPool.length.toLocaleString()} words remaining.`,
            nextBuckets
          );
        }
        return;
      }

      // 4. WORD_DEFINITION: If already viewing a definition, pressing 1 repeats it
      if (callStage === 'WORD_DEFINITION' && selectedWordEntry) {
        if (num === 1) {
          const spokenEntry =
            `${selectedWordEntry.word}. ` +
            `Part of speech: ${selectedWordEntry.partOfSpeech}. ` +
            `Definition: ${selectedWordEntry.definition}`;
          soundEngine.speakOperatorText(spokenEntry, 140);
        } else {
          setKeypadNotice('Press 1 to repeat, or C to end call.');
          soundEngine.speakOperatorText(
            'Press 1 to repeat this definition, or press C to hang up.',
            140
          );
        }
      }
    },
    [
      callStage,
      selectedBucket,
      selectedLetter,
      currentWordPool,
      drillDepth,
      selectedWordEntry,
      speakNineWayBuckets,
      triggerWordLookup,
    ]
  );

  // Physical Keyboard Support (Keys 1-9, *, 0, #, Enter for Talk, Backspace/Escape for C)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (/^[0-9*#]$/.test(e.key)) {
        e.preventDefault();
        handlePressDigit(e.key);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handlePressTalk();
      } else if (e.key === 'Backspace' || e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handlePressClear();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlePressDigit, handlePressTalk, handlePressClear]);

  // Build LCD display content for current state
  const getLcdDisplayData = (): {
    menuPathCode: string;
    operatorHeadline: string;
    operatorSubtext: string;
    menuOptions: LcdMenuOption[];
  } => {
    if (callStage === 'BUCKET_SELECT') {
      return {
        menuPathCode: 'A–Z',
        operatorHeadline: 'WELCOME CALLER',
        operatorSubtext: 'Press 1 for A, 2 for B... (grouped 1–9):',
        menuOptions: LETTER_BUCKETS.map((b) => ({
          key: b.key,
          label: `Letters ${b.label}`,
          sublabel: b.letters.join('·'),
        })),
      };
    }

    if (callStage === 'LETTER_SELECT' && selectedBucket) {
      return {
        menuPathCode: `GRP ${selectedBucket.key}`,
        operatorHeadline: `LETTERS ${selectedBucket.label}`,
        operatorSubtext: selectedBucket.letters
          .map((ltr, idx) => `Press ${idx + 1} for ${ltr}`)
          .join(', '),
        menuOptions: selectedBucket.letters.map((ltr, idx) => ({
          key: idx + 1,
          label: `Press ${idx + 1} for ${ltr}`,
          sublabel: `${getWordsForLetter(ltr).length.toLocaleString()}w`,
        })),
      };
    }

    if (callStage === 'WORD_DRILL' && selectedLetter) {
      const buckets = partitionWordsIntoNine(currentWordPool);
      const isFinalList = buckets.every((b) => b.isSingleWord);

      return {
        menuPathCode: `${selectedLetter}·L${drillDepth}`,
        operatorHeadline: isFinalList
          ? `SELECT WORD (1–${buckets.length})`
          : `LETTER ${selectedLetter} (${currentWordPool.length.toLocaleString()}W)`,
        operatorSubtext: isFinalList
          ? 'Press 1–9 to hear definition:'
          : 'Press 1–9 to narrow alphabetical range:',
        menuOptions: buckets.map((b) => ({
          key: b.key,
          label: b.isSingleWord
            ? b.firstWord
            : `${b.firstWord} – ${b.lastWord}`,
          sublabel: b.isSingleWord ? '' : `${b.words.length.toLocaleString()}`,
        })),
      };
    }

    if (callStage === 'WORD_DEFINITION' && selectedWordEntry) {
      return {
        menuPathCode: `DEF`,
        operatorHeadline: `ENTRY · ${selectedWordEntry.word.toUpperCase()}`,
        operatorSubtext: '',
        menuOptions: [{ key: 1, label: 'Repeat definition' }],
      };
    }

    return {
      menuPathCode: '',
      operatorHeadline: '',
      operatorSubtext: '',
      menuOptions: [],
    };
  };

  const lcdData = getLcdDisplayData();

  return (
    <main className="min-h-screen w-full bg-[#090d16] bg-[radial-gradient(circle_at_center,#162038_0%,#090d16_70%)] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Corner Mute/Unmute Toggle */}
      <button
        type="button"
        onClick={toggleMute}
        className="fixed top-4 right-4 z-20 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
        title={isMuted ? 'Unmute Speech & Keypad Tones' : 'Mute Speech & Keypad Tones'}
      >
        {isMuted ? (
          <>
            <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            <span>Muted</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5 text-lime-400" />
            <span>Voice &amp; Tones On</span>
          </>
        )}
      </button>

      {/* Standalone Nokia 3310 Handset Art Piece */}
      <NokiaHandset
        callStage={callStage}
        callSeconds={callSeconds}
        activeKey={activeKey}
        menuPathCode={lcdData.menuPathCode}
        operatorHeadline={lcdData.operatorHeadline}
        operatorSubtext={lcdData.operatorSubtext}
        menuOptions={lcdData.menuOptions}
        selectedWordEntry={selectedWordEntry}
        keypadNotice={keypadNotice}
        onPressTalk={handlePressTalk}
        onPressClear={handlePressClear}
        onPressDigit={handlePressDigit}
      />
    </main>
  );
}
