# Audio-Only Nokia 3310 Phone Dictionary Plan

Transform the automated Phone Dictionary into an authentic retro telephone hotline experience. All on-screen operator text, menu option lists, and definition readouts are completely removed from the Nokia 3310 LCD during calls. Callers must navigate the 37,000-word tree purely by ear, seeing only an authentic cellular in-call screen with live call duration and dialed DTMF digits.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> - **Screen Visibility Policy**:
>   - The Nokia LCD screen will **never display menu options, range lists, or definition text** during an active call.
>   - No visual spoilers or on-screen cheat sheets are provided.
> - **Authentic Nokia Call Screen**:
>   - During active calls, the LCD renders a period-accurate Nokia 3310 connected call display:
>     - Classic phone receiver icon (`📞`)
>     - Hotline header: `555-DICT`
>     - Sub-status: `Active Call`
>     - Live timer: `00:14`
>     - Real-time dialed digits sequence (e.g. `1  4  2  9`)
>     - Bottom softkeys: `Options` and `End`
> - **Wrong Key / Mistake Handling**:
>   - When callers choose an invalid branch or make a wrong entry, the operator voice announces the error and instructs them to press `C` (End) to hang up and call back.
> - **Bundled Offline Dictionary**:
>   - 37,019 modern English base words from WordNet 3.1 with definitions and parts of speech only (examples excluded).

---

## 1. Overview & Core Concept

- **What It Does**: Simulates calling a 1990s/2000s automated telephone directory hotline on a Nokia 3310. Callers dial `555-DICT`, listen to automated voice prompts spoken through their speakers, press keypad digits `1-9` to drill through letter groupings and word partitions, and hear spoken definitions.
- **Target Audience & Experience**: Nostalgia enthusiasts, retro tech fans, and interactive puzzle solvers who appreciate the challenge and tactile nature of audio-guided phone trees.
- **Key Value**: Delivers the true feeling of using an early mobile phone on a toll-free IVR (Interactive Voice Response) system without modern screen readouts.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **On-Hook / Standby**:
   - The phone screen sits idle with cellular signal bars, battery bars, `NOKIA` carrier badge, hotline banner `1-800-555-DICT`, and `Press TALK to dial`.
   - Softkeys show `Menu` and `Names`.
2. **Placing Call**:
   - Pressing the navy **TALK** button triggers dial tone and ringback audio while the screen displays an animated phone icon with `Calling 555-DICT...`.
3. **Active Call & Audio Navigation**:
   - The call connects. The LCD flips to the authentic in-call screen with running timer `00:00` and an empty dialed digits field.
   - The automated voice announces the greeting: *"Hello, and welcome to the Phone Dictionary. Using keys 1 through 9: Press 1 for A through C. Press 2 for D through F..."*
   - Each time the caller presses a digit `1-9`, a DTMF touch-tone sounds, the digit is appended to the on-screen dialed digits line (e.g., `1  3`), and the operator speaks the next audio menu branch.
4. **Listening to Definitions**:
   - Once a single word is isolated, the operator reads: *"[Word]. Part of speech: [part]. Definition: [definition]. Press 1 to repeat, or press End to hang up."*
5. **Wrong Branch / Hanging Up**:
   - If an invalid key is pressed or the caller realizes they took a wrong branch, the voice informs them: *"Invalid selection. Please press End to hang up and call back."*
   - Pressing `C` hangs up the call, plays the hang-up audio, and returns the phone to standby.

### Visual Identity & Theme

- **Aesthetic Direction**: Skeuomorphic retro industrial design celebrating the Nokia 3310.
- **Color Palette**:
  - Polycarbonate outer case: Deep Navy Slate (`#233354`, `#19253f`, `#111a2e`).
  - Bezel: Frosted silver-grey gradient (`#d5dde8` to `#9aa8bc`).
  - LCD screen: Classic olive-green monochrome (`#93b078` surface with `#142311` dark pixel elements).
- **LCD Typography**: Vintage pixel monospace typography, uppercase status labels, and bold DTMF digit tracking.
- **Tactile Micro-Interactions**: Mechanical button press depressions, active key highlights, and smooth timer updates.

---

## 3. Key Product Decisions & Trade-Offs

- **Audio-Authoritative Experience vs. Screen Fallback**:
  - *Chosen Approach*: Hide all menu text and definitions completely from the LCD during calls.
  - *Rationale*: Exactly matches the user's explicit directive to function like a genuine phone call on an old mobile phone where the caller must listen and memorize.
- **Displaying Dialed DTMF Digits**:
  - *Chosen Approach*: Show the sequence of pressed numbers (e.g., `1  4  2`) on the in-call screen.
  - *Rationale*: Real cellphones display the DTMF digits sent down the line during a call, reinforcing feedback that a key registered without revealing the words behind them.
- **Strict Hang Up on Mistake**:
  - *Chosen Approach*: No in-call "back" or "undo" buttons. If a caller mistypes or selects the wrong letter group, they must press `C` to disconnect and redial.
  - *Rationale*: Authentic to early phone trees that lacked back navigation, raising the stakes and satisfaction of successfully finding a word.

---

## 4. Technical Architecture & Data Strategy

### System & Audio Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       Nokia 3310 UI                         │
│  ┌───────────────────────┐       ┌───────────────────────┐  │
│  │     Control Keys      │       │     3x4 Keypad        │  │
│  │   [TALK]   [C / End]  │       │   [1] ... [9]         │  │
│  └───────────┬───────────┘       └───────────┬───────────┘  │
└──────────────┼───────────────────────────────┼──────────────┘
               │                               │
               ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Call Controller (State)                  │
│  - Call Stage: IDLE | DIALING | IN_CALL                     │
│  - Call Timer: Seconds elapsed (e.g. 00:23)                 │
│  - Dialed Digits History: "1  4  2"                         │
│  - Current Word Range / Single Word Entry                   │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌───────────────────────────────┐ ┌───────────────────────────┐
│     Authentic LCD Screen      │ │    Web Speech & Audio     │
│  - Signal & Battery meters    │ │  - DTMF Keypad Tones      │
│  - Connected Line: 555-DICT   │ │  - Ringback & Chimes      │
│  - Live Call Timer            │ │  - Voice Prompts & Menus  │
│  - Centered Dialed Digits     │ │  - Word Definitions       │
│  - Softkeys: Options & End    │ │                           │
└───────────────────────────────┘ └───────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│             Bundled WordNet Dictionary (37K Words)          │
│  - Partitioned A-Z JSON indices                             │
│  - 9-way recursive bucketing algorithm                      │
│  - Clean definitions & parts of speech                      │
└─────────────────────────────────────────────────────────────┘
```

### State Model & Screen Mapping

- **Call States**:
  - `IDLE`: Displays classic Nokia standby screen (carrier name, hotline banner, softkeys `Menu` and `Names`).
  - `DIALING`: Displays telephone icon, `Calling 555-DICT...`, and softkey `End`.
  - `ACTIVE_CALL` (stages `BUCKET_SELECT`, `LETTER_SELECT`, `WORD_DRILL`, `WORD_DEFINITION`): Displays authentic Nokia in-call screen with running timer, `555-DICT`, `Active Call`, formatted dialed digits string, and softkeys `Options` and `End`.
- **Dialed Digits Accumulator**:
  - A string tracking digits pressed since call inception (e.g., `"1  4  2"`), formatted with generous letter spacing to replicate old LCD dial buffers.
- **Audio Synthesis Engine**:
  - Operates using the Web Speech API with DTMF tones and call state sound effects.
  - Prompts clearly state which number corresponds to which letter or word partition.
