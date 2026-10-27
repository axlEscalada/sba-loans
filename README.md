# SBA Lending Academy

A learning platform for SBA 7(a) and 504 lending, built from **SBA SOP 50 10 8.1** (effective October 1, 2026).
Source document: [SOP 50 10 - Lender and Development Company Loan Programs](https://legacy.sba.gov/document/sop-50-10-lender-development-company-loan-programs) (the 8.1 Technical Policy Updates .docx).
Each chapter is a set of plain-English lessons followed by a multiple-choice quiz; passing (80%+) marks the chapter complete.

## Run it

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # static build in dist/ (hash routing, deployable anywhere)
```

## Checks

```sh
npm run validate:content   # schema + consistency checks for every chapter JSON
npm test                   # unit tests (quiz shuffling/scoring, content integrity)
npm run lint
```

## How it is organized

- `src/content/chapters/*.json` - one file per chapter: lessons (markdown), key points, key terms, and quiz questions with explanations and SOP references. The shape is defined in `src/content/schema.ts`; `order` sets the position in the course and `part` the section (A core, B 7(a), C 504, APPX 7(a) deep dives).
- `src/lib/quiz.ts` - quizzes reshuffle question and answer order on every attempt.
- `src/lib/progress.ts` - lesson and quiz progress, stored in the browser's localStorage.

Content was drafted from the SOP text and paraphrases it for learning. The official SOP governs lending decisions.
