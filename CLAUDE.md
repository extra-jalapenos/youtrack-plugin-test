# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A prototype for a YouTrack app/plugin that visualizes time-tracking data (work items) with D3 inside a React + TypeScript + Vite app, styled with JetBrains Ring UI (`@jetbrains/ring-ui-built`). It currently runs entirely on local/fake data; `settings.json` at the root is the (still empty) YouTrack app settings JSON schema, and `.env.example` names `YOUTRACK_HOST` / `YOUTRACK_API_TOKEN`, which nothing in `src/` reads yet.

## Language

This is meant to be a TypeScript project. Write all new code as `.ts` / `.tsx`. The remaining `.js` files are leftovers, not a pattern to follow. Keep them as they are and don't convert them unless asked: `src/helper.js`, `src/youtrackColorSchemes.js`, `src/youtrackColorMap.js`, `src/data/*.js`, `vite.config.js`, and the root `chart.js` / `chartWeekly.js` prototypes. ESLint only checks `.ts` / `.tsx`, and `tsc` doesn't check `.js` files (no `allowJs` / `checkJs`), so nothing type-checks or lints the JS code.

## Commands

- `npm run dev`: Vite dev server with HMR
- `npm run build`: `tsc -b` type-check (project references: `tsconfig.app.json` for `src/`, `tsconfig.node.json` for config files), then `vite build` to `dist/`
- `npm run lint`: ESLint (flat config, only lints `**/*.{ts,tsx}`)
- `npm run preview`: serve the built `dist/`

There is no test framework set up.

## Architecture

- `src/main.tsx` mounts `App` inside Ring UI's `ControlsHeightContext` (small controls) and loads Ring UI's global CSS plus `youtrackcolors.css`.
- `src/App.tsx` picks which chart to render (currently `InteractiveChart`). Swap components here to work on a different chart.
- Charts live in `src/components/`. They share one pattern: React owns the `<svg>` skeleton (margins applied via `<g transform>`, `viewBox` sized from state), and D3 does the drawing imperatively inside `useEffect` through `useRef` / `d3.select(...)`, including axes and transitions.
  - `Chart/MyChart.tsx`: GitHub-style contribution heatmap (ISO weeks × weekdays). It sizes the visible week range to the window width and filters by person.
  - `Chart/LinePlot.tsx`: chart with selectable time granularity (day/weekday/week/month/year), each with its own d3 time-format strings.
  - `Chart/ColorScheme.tsx`: renders all YouTrack color scales for comparison.
  - `InteractiveChart/InteractiveChart.tsx`: work-in-progress experiment with animated axis domain changes.
- Data sources:
  - `src/data/fakingData.ts` and `src/components/Chart/types.ts` define random `DataPoint` classes shaped like YouTrack work items (`duration.minutes`, `author.login`, `date`, optional custom fields such as location). Charts generate their data with `new DataPoint(...)` at mount.
  - `src/data/workItemData.js` is a real-shaped YouTrack REST work-item export. The `*.csv` files are YouTrack worklog and issue exports with German content; worklog `Issue ID` joins to issues `Issue Id`.
- Colors: `src/youtrackColorSchemes.js` holds the YouTrack palette (7 hues × 5 lightness steps), regrouped into per-saturation-row schemes used with `d3.interpolateRgbBasis`. `youtrackColorMap.js` maps YouTrack color IDs to foreground and background colors.
- `src/helper.js` has locale-aware date helpers (weekday/month names, ISO week calc) and `compareContributionToRest`.
- Root-level `chart.js` / `chartWeekly.js` are standalone Observable-style D3 prototypes (they import D3 from a CDN and load the CSVs). They are not part of the Vite build or of type-checking.

## Gotchas

- `tsconfig.app.json` sets `verbatimModuleSyntax` and `allowImportingTsExtensions`. Use `import type` for type-only imports. Imports with `.tsx` / `.js` extensions are fine.
- `.gitignore` does not cover `.env`, so be careful not to commit it.
