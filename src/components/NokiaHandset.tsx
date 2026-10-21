import React, { useRef, useEffect } from 'react';
import { Phone, PhoneOff, ChevronUp, ChevronDown } from 'lucide-react';
import { DictionaryEntry } from '../data/dictionaryData';

export type CallStage =
  | 'IDLE'
  | 'DIALING'
  | 'BUCKET_SELECT'
  | 'LETTER_SELECT'
  | 'WORD_DRILL'
  | 'LOADING_WORD'
  | 'WORD_DEFINITION';

export interface LcdMenuOption {
  key: number; // 1-9
  label: string;
  sublabel?: string;
}

interface NokiaHandsetProps {
  callStage: CallStage;
  callSeconds: number;
  activeKey: string | null;
  menuPathCode: string;
  operatorHeadline: string;
  operatorSubtext: string;
  menuOptions: LcdMenuOption[];
  selectedWordEntry: DictionaryEntry | null;
  keypadNotice: string | null;
  totalWordsRemaining?: number;
  onPressTalk: () => void;
  onPressClear: () => void;
  onPressDigit: (digit: string) => void;
}

const KEYPAD_BUTTONS: Array<{
  digit: string;
  letters: string;
  restricted?: boolean;
}> = [
  { digit: '1', letters: 'oo' },
  { digit: '2', letters: 'abc' },
  { digit: '3', letters: 'def' },
  { digit: '4', letters: 'ghi' },
  { digit: '5', letters: 'jkl' },
  { digit: '6', letters: 'mno' },
  { digit: '7', letters: 'pqrs' },
  { digit: '8', letters: 'tuv' },
  { digit: '9', letters: 'wxyz' },
  { digit: '*', letters: '+', restricted: true },
  { digit: '0', letters: '␣', restricted: true },
  { digit: '#', letters: '⇧', restricted: true },
];

export const NokiaHandset: React.FC<NokiaHandsetProps> = ({
  callStage,
  callSeconds,
  activeKey,
  menuPathCode,
  operatorHeadline,
  operatorSubtext,
  menuOptions,
  selectedWordEntry,
  keypadNotice,
  onPressTalk,
  onPressClear,
  onPressDigit,
}) => {
  const lcdContainerRef = useRef<HTMLDivElement>(null);
  const isInCall = callStage !== 'IDLE';

  // Reset LCD position to top when stage changes
  useEffect(() => {
    if (lcdContainerRef.current) {
      lcdContainerRef.current.scrollTop = 0;
    }
  }, [callStage, menuPathCode, selectedWordEntry]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const rem = (secs % 60).toString().padStart(2, '0');
    return `${mins}:${rem}`;
  };

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Classic Nokia 3310 Outer Polycarbonate Shell */}
      <div
        className="w-[344px] sm:w-[368px] rounded-[60px] bg-gradient-to-b from-[#233354] via-[#19253f] to-[#111a2e] p-4 sm:p-5 shadow-[0_32px_70px_-12px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.22),inset_0_-6px_12px_rgba(0,0,0,0.6)] border-[3px] border-[#2d3f66]"
        aria-label="Nokia 3310 Cellphone Face"
      >
        {/* Inner Silver-Grey Faceplate Bezel framing Speaker, Screen, and Navi Cluster */}
        <div className="rounded-t-[46px] rounded-b-[38px] bg-gradient-to-b from-[#d5dde8] via-[#bcc8d8] to-[#9aa8bc] p-3.5 pb-5 shadow-[inset_0_2px_3px_rgba(255,255,255,0.8),0_4px_10px_rgba(0,0,0,0.45)] border border-[#64748b]">
          {/* Earpiece Speaker Slots */}
          <div className="flex flex-col items-center pt-1.5 pb-2.5">
            <div className="flex items-center gap-1.5 mb-2" aria-hidden="true">
              <span className="w-1.5 h-3 rounded-full bg-[#1e293b] shadow-inner" />
              <span className="w-1.5 h-4 rounded-full bg-[#1e293b] shadow-inner" />
              <span className="w-1.5 h-4 rounded-full bg-[#1e293b] shadow-inner" />
              <span className="w-1.5 h-4 rounded-full bg-[#1e293b] shadow-inner" />
              <span className="w-1.5 h-4 rounded-full bg-[#1e293b] shadow-inner" />
              <span className="w-1.5 h-3 rounded-full bg-[#1e293b] shadow-inner" />
            </div>

            {/* Classic Metallic NOKIA Badge */}
            <div className="px-3 py-0.5 rounded bg-[#1e293b] shadow-sm">
              <span className="font-display text-[13px] font-bold tracking-[0.26em] text-[#e2e8f0] pl-1">
                NOKIA
              </span>
            </div>
          </div>

          {/* Recessed Dark Screen Surround */}
          <div className="rounded-[18px] bg-[#2a3441] p-2 shadow-[inset_0_3px_6px_rgba(0,0,0,0.75)] border border-[#475569]">
            {/* Monochrome Olive-Green Backlit LCD Screen */}
            <div className="nokia-lcd-surface relative h-[248px] w-full rounded-[12px] p-2.5 flex flex-col justify-between font-mono overflow-hidden border border-[#566b44]">
              {/* Top LCD Status Bar: Signal Bars | Carrier/Timer | Menu Index & Battery */}
              <div className="flex items-center justify-between border-b border-[#142311]/25 pb-1 text-[11px] font-bold leading-none shrink-0">
                <div className="flex items-end gap-0.5" title="Full Cellular Signal">
                  <span className="w-1 h-1.5 bg-[#142311]" />
                  <span className="w-1 h-2 bg-[#142311]" />
                  <span className="w-1 h-2.5 bg-[#142311]" />
                  <span className="w-1 h-3.5 bg-[#142311]" />
                </div>

                <div className="flex items-center gap-1.5 tracking-tight">
                  {isInCall ? (
                    <span>555-DICT · {formatTimer(callSeconds)}</span>
                  ) : (
                    <span>PHONE DICTIONARY</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {menuPathCode && (
                    <span className="text-[10px] font-bold opacity-85">
                      {menuPathCode}
                    </span>
                  )}
                  <div className="flex items-end gap-0.5" title="Full Battery">
                    <span className="w-1 h-3.5 bg-[#142311]" />
                    <span className="w-1 h-2.5 bg-[#142311]" />
                    <span className="w-1 h-2 bg-[#142311]" />
                    <span className="w-1 h-1.5 bg-[#142311]" />
                  </div>
                </div>
              </div>

              {/* Middle LCD Content Area */}
              <div
                ref={lcdContainerRef}
                className="lcd-scroll flex-1 overflow-y-auto my-1 pr-0.5 flex flex-col justify-start text-[#142311]"
              >
                {callStage === 'IDLE' && (
                  <div className="h-full flex flex-col items-center justify-center text-center py-2">
                    <div className="border-2 border-[#142311] px-2.5 py-0.5 text-[11px] font-bold tracking-wider mb-2">
                      1-800-555-DICT
                    </div>
                    <p className="text-[13px] font-bold leading-tight mb-1">
                      UNABRIDGED LEXICON
                    </p>
                    <p className="text-[10px] leading-snug opacity-90 max-w-[235px]">
                      Press TALK to call the automated 275,000-word dictionary.
                    </p>
                  </div>
                )}

                {callStage === 'DIALING' && (
                  <div className="h-full flex flex-col items-center justify-center text-center py-3">
                    <Phone className="w-6 h-6 stroke-[2.5] mb-1.5 animate-bounce" />
                    <p className="text-[13px] font-bold tracking-tight">
                      Calling Dictionary...
                    </p>
                    <p className="text-[10px] leading-tight mt-1 opacity-85">
                      Connecting to automated voice tree...
                    </p>
                  </div>
                )}

                {callStage === 'LOADING_WORD' && (
                  <div className="h-full flex flex-col items-center justify-center text-center py-3">
                    <p className="text-[12px] font-bold tracking-tight">
                      Retrieving entry...
                    </p>
                    <p className="text-[10px] leading-tight mt-1 opacity-85">
                      Please hold the line.
                    </p>
                  </div>
                )}

                {isInCall &&
                  callStage !== 'DIALING' &&
                  callStage !== 'LOADING_WORD' && (
                    <div className="space-y-1 text-left">
                      {/* Operator Prompt Header */}
                      <div className="bg-[#142311] text-[#93b078] px-1.5 py-0.5 text-[10px] font-bold leading-tight flex items-center justify-between">
                        <span className="truncate">{operatorHeadline}</span>
                      </div>

                      {/* Operator Spoken Text */}
                      <p className="text-[10px] leading-tight font-semibold">
                        {operatorSubtext}
                      </p>

                      {/* Notice if caller pressed *, 0, #, or invalid key */}
                      {keypadNotice && (
                        <div className="border border-[#142311] bg-[#142311]/10 px-1.5 py-0.5 text-[10px] font-bold">
                          ! {keypadNotice}
                        </div>
                      )}

                      {/* Selected Word Full Readout */}
                      {callStage === 'WORD_DEFINITION' && selectedWordEntry && (
                        <div className="border-t border-[#142311]/40 pt-1 mt-1 space-y-1">
                          <div className="flex items-baseline justify-between gap-1">
                            <span className="text-[12px] font-bold uppercase tracking-tight">
                              {selectedWordEntry.word}
                            </span>
                            <span className="text-[10px] italic font-bold">
                              [{selectedWordEntry.partOfSpeech}]
                            </span>
                          </div>
                          <p className="text-[10px] leading-snug font-bold">
                            Def: {selectedWordEntry.definition}
                          </p>
                          {selectedWordEntry.example &&
                            selectedWordEntry.example !== 'None recorded' && (
                              <p className="text-[10px] leading-snug italic">
                                Ex: &ldquo;{selectedWordEntry.example}&rdquo;
                              </p>
                            )}
                        </div>
                      )}

                      {/* 1-9 Menu Breakdown List */}
                      {menuOptions.length > 0 && (
                        <div className="grid grid-cols-1 gap-0 pt-0.5">
                          {menuOptions.map((opt) => (
                            <div
                              key={opt.key}
                              className="w-full text-left flex items-baseline justify-between px-0.5 py-[1px] text-[10px] font-bold leading-tight"
                            >
                              <span className="truncate">
                                {opt.key}: {opt.label}
                              </span>
                              {opt.sublabel && (
                                <span className="text-[9px] opacity-75 ml-1 shrink-0">
                                  {opt.sublabel}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
              </div>

              {/* Bottom LCD Softkey Action Bar */}
              <div className="flex items-center justify-between border-t border-[#142311]/25 pt-1 text-[10px] font-bold leading-none shrink-0">
                <span className="opacity-85">
                  {isInCall ? 'C: End Call' : 'On Hook'}
                </span>
                <span className="uppercase tracking-wider underline decoration-2">
                  {callStage === 'IDLE' ? 'TALK' : 'KEYS 1–9'}
                </span>
                <span className="opacity-85">275K WORDS</span>
              </div>
            </div>
          </div>

          {/* Nokia 3310 Control Cluster: C (End Call ONLY), Navy Navi-Key TALK, Static Rocker */}
          <div className="mt-4 flex items-center justify-between px-2 gap-2">
            {/* Left 'C' Button: Strictly Ends Call */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={onPressClear}
                title="End Call (C)"
                className={`min-w-[56px] min-h-[44px] rounded-[18px] bg-gradient-to-b from-[#f8fafc] to-[#cbd5e1] border-2 border-[#475569] shadow-[0_4px_0_#334155,0_6px_10px_rgba(0,0,0,0.35)] active:translate-y-0.5 active:shadow-[0_2px_0_#334155] transition-transform flex flex-col items-center justify-center -rotate-12 cursor-pointer ${
                  activeKey === 'C'
                    ? 'translate-y-0.5 shadow-[0_2px_0_#334155] ring-2 ring-rose-400'
                    : ''
                }`}
              >
                <span className="font-display text-sm font-bold text-[#0f172a] leading-none">
                  C
                </span>
                <span className="text-[9px] font-semibold text-rose-700 flex items-center gap-0.5 mt-0.5">
                  <PhoneOff className="w-2.5 h-2.5" /> End
                </span>
              </button>
            </div>

            {/* Center Iconic Navy Blue Navi-Key (TALK Button) */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={onPressTalk}
                title="Press Talk to Call Phone Dictionary"
                className={`min-w-[126px] min-h-[48px] px-4 py-2 rounded-[22px] bg-gradient-to-b from-[#1e3a8a] via-[#172554] to-[#0f172a] border-2 border-[#93c5fd]/50 shadow-[0_5px_0_#090d16,0_8px_14px_rgba(0,0,0,0.5)] active:translate-y-0.5 active:shadow-[0_2px_0_#090d16] transition-transform flex flex-col items-center justify-center cursor-pointer ${
                  activeKey === 'TALK'
                    ? 'translate-y-0.5 ring-2 ring-emerald-400'
                    : ''
                }`}
              >
                <div className="w-12 h-1 rounded-full bg-[#38bdf8]/60 mb-1" />
                <div className="flex items-center gap-1.5 text-white">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                  <span className="font-display text-xs font-bold tracking-wider uppercase whitespace-nowrap">
                    TALK
                  </span>
                </div>
              </button>
            </div>

            {/* Right Hardware Rocker (Non-scrolling physical casing mold) */}
            <div
              className="flex flex-col items-center rotate-12 bg-[#475569] p-0.5 rounded-[18px] shadow-[0_4px_0_#334155,0_6px_10px_rgba(0,0,0,0.35)] opacity-90"
              aria-hidden="true"
            >
              <div className="min-w-[48px] min-h-[24px] rounded-t-[15px] bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0] flex items-center justify-center text-[#64748b] border-b border-[#94a3b8]">
                <ChevronUp className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="min-w-[48px] min-h-[24px] rounded-b-[15px] bg-gradient-to-b from-[#e2e8f0] to-[#cbd5e1] flex items-center justify-center text-[#64748b]">
                <ChevronDown className="w-4 h-4 stroke-[2]" />
              </div>
            </div>
          </div>
        </div>

        {/* Sculpted 3x4 Alphanumeric Keypad (1-9 Active Entry Options, *, 0, # Restricted) */}
        <div className="mt-5 px-2 pb-3">
          <div className="grid grid-cols-3 gap-x-3.5 gap-y-3">
            {KEYPAD_BUTTONS.map((btn) => {
              const isPressed = activeKey === btn.digit;
              const isRestricted = Boolean(btn.restricted);

              return (
                <button
                  key={btn.digit}
                  type="button"
                  onClick={() => onPressDigit(btn.digit)}
                  className={`group relative min-h-[46px] rounded-[22px] px-2.5 py-1.5 flex items-baseline justify-center gap-1.5 border transition-transform cursor-pointer select-none ${
                    isRestricted
                      ? 'bg-gradient-to-b from-[#cbd5e1] to-[#94a3b8] border-[#64748b] text-[#334155] opacity-80'
                      : 'bg-gradient-to-b from-[#f1f5f9] via-[#e2e8f0] to-[#cbd5e1] border-[#94a3b8] text-[#0f172a] hover:from-white hover:to-[#e2e8f0]'
                  } shadow-[0_4px_0_#0f172a,0_6px_10px_rgba(0,0,0,0.45)] active:translate-y-0.5 active:shadow-[0_1px_0_#0f172a] ${
                    isPressed
                      ? 'translate-y-0.5 shadow-[0_1px_0_#0f172a] ring-2 ring-lime-400'
                      : ''
                  }`}
                >
                  <span className="font-mono text-base font-bold leading-none">
                    {btn.digit}
                  </span>
                  <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#475569] group-hover:text-[#1e293b]">
                    {btn.letters}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Microphone Hole */}
          <div className="mt-4 flex justify-center" aria-hidden="true">
            <div className="w-2.5 h-1.5 rounded-full bg-[#090d16] shadow-inner border border-[#334155]/50" />
          </div>
        </div>
      </div>
    </div>
  );
};
