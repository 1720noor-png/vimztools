# Vimz.ai — System Architecture & Engineering Standards

## 1. Architectural Overview

Vimz.ai is designed around a decoupled, highly testable architecture separating the presentation layer from the deterministic computational core.

```
                      ┌──────────────────────────────────────────────┐
                      │              User Interfaces                │
                      │  (Web Browser / AI Chat Bar / Mobile UI)    │
                      └──────────────────────┬───────────────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
          ┌──────────────────────────┐               ┌───────────────────────────┐
          │  React Tool Pages (UI)   │               │   AI Orchestrator (NLP)   │
          │  Form controls & state   │               │ Intent & param extraction │
          └────────────┬─────────────┘               └─────────────┬─────────────┘
                       │                                           │
                       └─────────────────────┬─────────────────────┘
                                             ▼
                               ┌───────────────────────────┐
                               │     src/tool-core/        │
                               │  Pure JavaScript engines  │
                               │  100% deterministic       │
                               │  Zero DOM dependencies    │
                               └─────────────┬─────────────┘
                                             ▼
                               ┌───────────────────────────┐
                               │   Golden Test Suite       │
                               │   Vitest oracle tests     │
                               └───────────────────────────┘
```

---

## 2. The Golden Rule of Vimz.ai AI System

> **The AI (LLM) NEVER computes numbers, formulas, or algorithmic outputs directly.**

1. **AI's Role**:
   - Parse natural language queries in English, Urdu, and Roman Urdu.
   - Detect user intent and match to the correct tool.
   - Extract required parameters with type normalization.
   - Dispatch execution to the deterministic `tool-core` pure function.
   - Format the returned exact calculation result for the user.

2. **Tool-Core's Role**:
   - Accept strongly validated input objects.
   - Execute exact mathematical/algorithmic calculations.
   - Return structured results with human-readable summaries.
   - Maintain 100% determinism (same input = same output).

---

## 3. Tool Maturity Hierarchy (L0 – L3)

| Level | Capability | Architecture Requirements |
|-------|------------|---------------------------|
| **L0** | Find & Navigate | Tool registered in `registry.js` + indexed in `toolIndex.json` |
| **L1** | Auto-Fill Form via URL | L0 + URL search param parsing in React component (`?rate=7.2`) |
| **L2** | Headless Background Execution | Pure function in `src/tool-core/` + Golden test in Vitest |
| **L3** | External Data Integration | L2 + External API client (FX rates, crypto prices, tax slabs) |

---

## 4. Directory Structure

```
vimztools/
├── .github/workflows/ci.yml       # GitHub Actions CI (lint, test, build)
├── src/
│   ├── tool-core/                 # Pure computational functions (L2 ready)
│   │   ├── finance/
│   │   │   ├── ruleOf72.js
│   │   │   └── ruleOf72.test.js
│   │   ├── student/
│   │   ├── math/
│   │   ├── health/
│   │   ├── developer/
│   │   └── index.js               # Barrel exports
│   ├── tools/                     # React UI components (form rendering)
│   ├── components/                # Shared UI widgets (Layout, ErrorBoundary, ui)
│   ├── data/                      # Tool registry, search index, monetization catalog
│   ├── services/                  # API clients, search engines, orchestration
│   └── utils/                     # Formatting, math helpers, deliverable exporters
├── api/                           # Laravel 13 Sanctum backend
├── docs/                          # Architecture & developer guides
├── vitest.config.js               # Unit & golden testing configuration
└── vite.config.js                 # Frontend build & path alias config
```

---

## 5. Coding Standards for Tool-Core Extraction

When converting or implementing any tool:

1. **Pure Function Contract**:
   ```javascript
   export function calculateExampleTool({ param1, param2 }) {
     // 1. Validate inputs thoroughly
     // 2. Perform exact computation
     // 3. Return structured object: { ...metrics, summary, copyText }
   }
   ```

2. **Zero DOM Dependencies**: Never import `React`, `useState`, `window`, `document`, or UI components inside `src/tool-core/`.

3. **Golden Test Requirement**: Every function in `src/tool-core/` must have a corresponding `.test.js` file with:
   - Default/standard input test
   - Edge case tests (boundary values, extreme inputs)
   - Input type coercion test (string vs number)
   - Input validation error tests (negative, zero, NaN, invalid types)

4. **100% Branch Coverage**: Target 100% branch and statement coverage for all calculation logic.
