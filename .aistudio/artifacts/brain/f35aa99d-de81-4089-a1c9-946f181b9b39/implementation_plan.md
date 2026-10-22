# Nokia 3310 Tele-Dictionary — 100% Bundled Offline Dictionary Plan

This revised plan locks in **Approach B (100% Bundled Offline Dictionary)** with **usage examples removed** (providing only definitions and parts of speech), alongside the fix for your GitHub Actions deployment workflow.

---

## User Review & Confirmed Decisions

> [!IMPORTANT]
> - **Confirmed Decision 1 — 100% Bundled Offline Dictionary (~25,000–35,000 Modern Base Words)**:
>   - Every word in the `1–9` phone tree is loaded directly from a self-contained, bundled English dictionary corpus stored inside your project.
>   - Because the word list is generated directly from the dictionary's own keys, **100% of selectable words are guaranteed to have a real definition**—with zero external API calls and zero network failures.
>   - Filtered to clean, modern English base words of all lengths (excluding archaic 19th-century filler and redundant `-s`/`-ed`/`-ing` inflections).
> - **Confirmed Decision 2 — Definitions Only (Remove Usage Examples)**:
>   - Removed usage examples from the data model, the monochrome Nokia LCD readout, and the Text-to-Speech voice output.
>   - Removing examples also cuts the bundled dictionary size by nearly **45%** (`~3.2 MB` raw / `~950 KB` gzipped across `A–Z`), and we will store the dictionary by letter (`A` through `Z`) inside the app so startup is instantaneous.
> - **Confirmed Decision 3 — GitHub Actions Lockfile & Node 22 Fix**:
>   - Updates `.github/workflows/deploy.yml` to use `npm install` (without requiring a `package-lock.json` file) and Node 22 so your push to `S0methingCreative/Nokia-Dictionary` builds and deploys cleanly.

---

## 1. How the Bundled Offline Dictionary Works

```
┌───────────────────────────────────────────────────────────────────┐
│             Bundled Offline Dictionary (A–Z Corpus)               │
│  • ~30,000 Defined Modern English Base Words (All Lengths)        │
│  • Stored Locally in Repo (Zero External API Calls)               │
└─────────────────────────────────┬─────────────────────────────────┘
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────────────┐
│              Recursive 1–9 Phone Tree (Base-9 Search)             │
│  1. Press TALK → Greeting: "Press 1 for A–C, 2 for D–F..."        │
│  2. Press 1–9  → Pick exact letter: "Press 1 for A, 2 for B..."   │
│  3. Press 1–9  → Recursively splits the letter's defined words    │
│                  into 9 alphabetical ranges until <= 9 words left │
│  4. Press 1–9  → Immediately displays & speaks the bundled        │
│                  Word, Part of Speech, and Definition             │
└───────────────────────────────────────────────────────────────────┘
```

1. **Guaranteed Definitions**: Every word shown in the `1–9` menus is an entry key from the bundled dictionary itself. A caller can never land on an undefined word.
2. **LCD & Voice Output**:
   - **Nokia LCD Screen**: Displays the selected word, its part of speech (e.g., `[noun]`, `[verb]`, `[adjective]`), and `Def: <definition>`.
   - **Browser Text-to-Speech**: Reads aloud `"<Word>. Part of speech: <Part of Speech>. Definition: <Definition>."` without any usage example.

---

## 2. Planned Changes

1. **Build & Bundle the Offline Dictionary Corpus (`/public/dictionary/A.json` … `Z.json` + `/src/data/dictionaryData.ts`)**:
   - Compile a clean, modern ~30,000-word English dictionary where each entry stores `[partOfSpeech, definition]` keyed by word across letters `A` through `Z`.
   - Remove all external `fetch()` calls to `api.dictionaryapi.dev`, Wiktionary, and Datamuse.
2. **Remove Examples from UI & Speech (`/src/components/NokiaHandset.tsx` & `/src/App.tsx`)**:
   - Remove the `Ex:` row from the Nokia LCD screen.
   - Remove `Usage example:` from the `window.speechSynthesis` operator readout.
   - Update the LCD status bar word count to reflect the exact bundled dictionary word count.
3. **Fix GitHub Actions Workflow (`/.github/workflows/deploy.yml`)**:
   - Replace `npm ci` and `cache: 'npm'` with `npm install` and update `node-version: 22` so GitHub Actions builds without requiring `package-lock.json`.
