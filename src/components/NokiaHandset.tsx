import React from 'react';
import { Phone, PhoneOff, ChevronUp, ChevronDown } from 'lucide-react';

export type CallStage =
  | 'IDLE'
  | 'DIALING'
  | 'BUCKET_SELECT'
  | 'LETTER_SELECT'
  | 'WORD_DRILL'
  | 'LOADING_WORD'
  | 'WORD_DEFINITION';

interface NokiaHandsetProps {
  callStage: CallStage;
  callSeconds: number;
  activeKey: string | null;
  dialedDigits: string;
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
  dialedDigits,
  onPressTalk,
  onPressClear,
  onPressDigit,
}) => {
  const isInCall = callStage !== 'IDLE';

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
              {/* Top LCD Status Bar: Signal Bars | Timer or Carrier | Battery Meter */}
              <div className="flex items-center justify-between border-b border-[#142311]/25 pb-1 text-[11px] font-bold leading-none shrink-0">
                {/* Cellular Signal Bars (Left) */}
                <div className="flex items-end gap-0.5" title="Full Cellular Signal">
                  <span className="w-1 h-1.5 bg-[#142311]" />
                  <span className="w-1 h-2 bg-[#142311]" />
                  <span className="w-1 h-2.5 bg-[#142311]" />
                  <span className="w-1 h-3.5 bg-[#142311]" />
                </div>

                {/* Center Header: Call Timer during call, NOKIA in Standby */}
                <div className="flex items-center gap-1 tracking-wider text-[11px]">
                  {isInCall && callStage !== 'DIALING' ? (
                    <span className="font-bold">{formatTimer(callSeconds)}</span>
                  ) : (
                    <span className="font-bold tracking-widest">NOKIA</span>
                  )}
                </div>

                {/* Battery Meter (Right) */}
                <div className="flex items-end gap-0.5" title="Full Battery">
                  <span className="w-1 h-3.5 bg-[#142311]" />
                  <span className="w-1 h-2.5 bg-[#142311]" />
                  <span className="w-1 h-2 bg-[#142311]" />
                  <span className="w-1 h-1.5 bg-[#142311]" />
                </div>
              </div>

              {/* Middle LCD Content Area: Audio-Only Call Experience */}
              <div className="flex-1 my-1 flex flex-col items-center justify-center text-center text-[#142311]">
                {/* 1. Standby / On-Hook Screen */}
                {callStage === 'IDLE' && (
                  <div className="h-full flex flex-col items-center justify-center py-2 animate-fadeIn">
                    <div className="border-2 border-[#142311] px-3 py-1 text-[13px] font-bold tracking-wider mb-2">
                      1-800-555-DICT
                    </div>
                    <p className="text-[12px] font-bold leading-tight mb-1 tracking-tight">
                      PHONE DICTIONARY
                    </p>
                    <p className="text-[10px] leading-snug opacity-80 max-w-[200px]">
                      Press TALK to dial hotline
                    </p>
                  </div>
                )}

                {/* 2. Dialing Screen */}
                {callStage === 'DIALING' && (
                  <div className="h-full flex flex-col items-center justify-center py-2">
                    <Phone className="w-7 h-7 stroke-[2.5] mb-2 animate-bounce text-[#142311]" />
                    <p className="text-[14px] font-bold tracking-wide">
                      Calling...
                    </p>
                    <p className="text-[12px] font-bold tracking-wider mt-1 opacity-90">
                      555-DICT
                    </p>
                  </div>
                )}

                {/* 3. Authentic In-Call Screen (No menu or definition cheat text!) */}
                {isInCall && callStage !== 'DIALING' && (
                  <div className="h-full w-full flex flex-col items-center justify-center py-2">
                    <div className="flex items-center justify-center mb-1">
                      <Phone className="w-6 h-6 stroke-[2.5] fill-[#142311]/15 text-[#142311]" />
                    </div>

                    <div className="text-[15px] font-bold tracking-wider leading-tight">
                      555-DICT
                    </div>
                    <div className="text-[10px] uppercase font-bold tracking-widest opacity-75 mt-0.5">
                      Active Call
                    </div>

                    {/* Dialed DTMF Digits display */}
                    <div className="mt-3 w-full px-2 py-1.5 min-h-[34px] flex items-center justify-center border-t border-b border-[#142311]/25 bg-[#142311]/5">
                      {dialedDigits ? (
                        <span className="text-[15px] font-bold tracking-[0.3em] text-[#142311]">
                          {dialedDigits}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                          [ Listening ]
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom LCD Softkey Action Bar */}
              <div className="flex items-center justify-between border-t border-[#142311]/25 pt-1 text-[11px] font-bold leading-none shrink-0 px-1">
                {callStage === 'IDLE' ? (
                  <>
                    <span>Menu</span>
                    <span>Names</span>
                  </>
                ) : callStage === 'DIALING' ? (
                  <>
                    <span className="opacity-0">.</span>
                    <span>End</span>
                  </>
                ) : (
                  <>
                    <span>Options</span>
                    <span>End</span>
                  </>
                )}
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
